import express, { Request, Response } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

// In-memory Desk Bridge rooms
interface Peer {
  ws: WebSocket;
  role: 'phone' | 'laptop';
  deviceId: string;
  deviceName: string;
}

interface Room {
  code: string;
  createdAt: number;
  peers: Peer[];
  tasks: any[];
}

const rooms = new Map<string, Room>();

// Helper to generate 6-character clean room codes
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Snap2Done AI Desk Bridge API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    activeRooms: rooms.size
  });
});

// Create a new pairing room (Laptop initiates)
app.post('/api/bridge/create', (req: Request, res: Response) => {
  const code = generateRoomCode();
  const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  rooms.set(roomId, {
    code,
    createdAt: Date.now(),
    peers: [],
    tasks: req.body.initialTasks || []
  });

  // Cleanup rooms older than 24 hours
  for (const [id, room] of rooms.entries()) {
    if (Date.now() - room.createdAt > 24 * 60 * 60 * 1000) {
      rooms.delete(id);
    }
  }

  res.json({ roomId, code });
});

// Join an existing room via code (Phone scans QR or enters code)
app.post('/api/bridge/join', (req: Request, res: Response) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Pairing code is required' });
  }

  const cleanCode = code.trim().toUpperCase();
  for (const [roomId, room] of rooms.entries()) {
    if (room.code === cleanCode) {
      return res.json({
        roomId,
        code: room.code,
        taskCount: room.tasks.length,
        peersCount: room.peers.length
      });
    }
  }

  return res.status(404).json({ error: 'Pairing code not found or expired' });
});

// HTTP fallback for sync
app.get('/api/bridge/:roomId/tasks', (req: Request, res: Response) => {
  const room = rooms.get(req.params.roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json({ tasks: room.tasks });
});

app.post('/api/bridge/:roomId/sync', (req: Request, res: Response) => {
  const room = rooms.get(req.params.roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  if (Array.isArray(req.body.tasks)) {
    room.tasks = req.body.tasks;
  }
  res.json({ success: true, count: room.tasks.length });
});

// Serve frontend if built
const clientDist = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Snap2Done AI API Server Running.');
    }
  });
});

const server = http.createServer(app);

// WebSocket Desk Bridge
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws: WebSocket) => {
  let currentRoomId: string | null = null;
  let peerInfo: Peer | null = null;

  ws.on('message', (data: string) => {
    try {
      const msg = JSON.parse(data.toString());

      switch (msg.type) {
        case 'JOIN_ROOM': {
          const { roomId, role, deviceId, deviceName } = msg;
          const room = rooms.get(roomId);

          if (!room) {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'Room not found' }));
            return;
          }

          currentRoomId = roomId;
          peerInfo = { ws, role: role || 'phone', deviceId: deviceId || 'unknown', deviceName: deviceName || role };

          // Remove any existing dead peer for this socket
          room.peers = room.peers.filter(p => p.ws !== ws && p.ws.readyState === WebSocket.OPEN);
          room.peers.push(peerInfo);

          // Notify this client
          ws.send(JSON.stringify({
            type: 'ROOM_JOINED',
            roomId,
            code: room.code,
            tasks: room.tasks,
            peerCount: room.peers.length,
            peers: room.peers.map(p => ({ role: p.role, deviceName: p.deviceName }))
          }));

          // Broadcast to other peers in room
          broadcastToRoom(roomId, ws, {
            type: 'PEER_CONNECTED',
            role: peerInfo.role,
            deviceName: peerInfo.deviceName,
            peerCount: room.peers.length
          });
          break;
        }

        case 'SYNC_TASKS': {
          if (!currentRoomId) return;
          const room = rooms.get(currentRoomId);
          if (!room) return;

          if (Array.isArray(msg.tasks)) {
            room.tasks = msg.tasks;
          }

          // Broadcast to all other peers in the room
          broadcastToRoom(currentRoomId, ws, {
            type: 'TASKS_SYNCED',
            tasks: room.tasks,
            senderRole: peerInfo?.role || 'unknown'
          });
          break;
        }

        case 'TASK_CREATED':
        case 'TASK_UPDATED':
        case 'TASK_DELETED': {
          if (!currentRoomId) return;
          const room = rooms.get(currentRoomId);
          if (!room) return;

          if (msg.task) {
            if (msg.type === 'TASK_CREATED') {
              const exists = room.tasks.some(t => t.id === msg.task.id);
              if (!exists) room.tasks.push(msg.task);
            } else if (msg.type === 'TASK_UPDATED') {
              const idx = room.tasks.findIndex(t => t.id === msg.task.id);
              if (idx !== -1) room.tasks[idx] = msg.task;
              else room.tasks.push(msg.task);
            } else if (msg.type === 'TASK_DELETED') {
              room.tasks = room.tasks.filter(t => t.id !== msg.task.id);
            }
          }

          broadcastToRoom(currentRoomId, ws, {
            type: msg.type,
            task: msg.task,
            taskId: msg.taskId || msg.task?.id,
            senderRole: peerInfo?.role || 'unknown'
          });
          break;
        }

        case 'PING': {
          ws.send(JSON.stringify({ type: 'PONG' }));
          break;
        }
      }
    } catch (err) {
      console.error('Desk Bridge WS error:', err);
    }
  });

  ws.on('close', () => {
    if (currentRoomId && peerInfo) {
      const room = rooms.get(currentRoomId);
      if (room) {
        room.peers = room.peers.filter(p => p.ws !== ws);
        broadcastToRoom(currentRoomId, ws, {
          type: 'PEER_DISCONNECTED',
          role: peerInfo.role,
          deviceName: peerInfo.deviceName,
          peerCount: room.peers.length
        });
      }
    }
  });
});

function broadcastToRoom(roomId: string, senderWs: WebSocket, message: any) {
  const room = rooms.get(roomId);
  if (!room) return;
  const payload = JSON.stringify(message);

  room.peers.forEach(peer => {
    if (peer.ws !== senderWs && peer.ws.readyState === WebSocket.OPEN) {
      peer.ws.send(payload);
    }
  });
}

server.listen(PORT, () => {
  console.log(`🚀 Snap2Done AI Server running on http://localhost:${PORT}`);
  console.log(`🔌 Desk Bridge WebSocket active on ws://localhost:${PORT}/ws`);
});
