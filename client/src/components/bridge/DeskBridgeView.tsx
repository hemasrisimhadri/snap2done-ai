import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Monitor, Smartphone, Wifi, RefreshCw, CheckCircle2, Shield, ArrowRight, Unplug, Copy, Check } from 'lucide-react';
import { deskBridgeService } from '../../services/bridge/deskBridgeService';
import { officeKitService } from '../../services/officeKit/officeKitService';
import { deviceService } from '../../services/device/deviceService';
import { Task, DeskBridgeState } from '../../types';

interface DeskBridgeViewProps {
  tasks: Task[];
  onTasksSyncedFromPeer: (tasks: Task[]) => void;
}

export const DeskBridgeView: React.FC<DeskBridgeViewProps> = ({
  tasks,
  onTasksSyncedFromPeer
}) => {
  const [bridgeState, setBridgeState] = useState<DeskBridgeState>(deskBridgeService.getState());
  const [inputCode, setInputCode] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [activeRole, setActiveRole] = useState<'laptop' | 'phone'>(bridgeState.role);

  useEffect(() => {
    const unsub = deskBridgeService.subscribe((event) => {
      setBridgeState(deskBridgeService.getState());
      if (event.type === 'tasks_synced' && Array.isArray(event.data)) {
        onTasksSyncedFromPeer(event.data);
      }
    });

    return () => unsub();
  }, [onTasksSyncedFromPeer]);

  // Host session (Laptop)
  const handleCreateHostSession = async () => {
    setIsBusy(true);
    try {
      await deskBridgeService.createSession(tasks, 'Desk Workspace (Laptop)');
      setActiveRole('laptop');
      deviceService.vibrate(40);
    } finally {
      setIsBusy(false);
    }
  };

  // Join session (Phone)
  const handleJoinSession = async () => {
    if (!inputCode.trim()) return;
    setIsBusy(true);
    try {
      const res = await deskBridgeService.joinSession(inputCode.trim(), 'Mobile Phone');
      if (res.success) {
        setActiveRole('phone');
        deviceService.vibrate([40, 60, 40]);
      } else {
        alert('Pairing error: ' + res.error);
      }
    } finally {
      setIsBusy(false);
    }
  };

  const handleDisconnect = () => {
    deskBridgeService.disconnect();
    deviceService.vibrate(30);
  };

  const handleCopyCode = async () => {
    if (bridgeState.roomCode) {
      await deviceService.copyToClipboard(bridgeState.roomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Manual Trigger to broadcast current tasks
  const handleBroadcastSync = () => {
    deskBridgeService.syncAllTasks(tasks);
    deviceService.vibrate(40);
  };

  const officeKitStatus = officeKitService.getStatus();

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <Monitor className="w-3.5 h-3.5" />
          <span>Real-Time Desk Bridge</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Phone ↔ Laptop Synchronization
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Capture and control from your phone while your laptop runs the high-throughput workspace.
        </p>
      </div>

      {/* Connection State Card */}
      <div className="p-5 rounded-2xl bg-surface-card border border-surface-border shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-3 h-3 rounded-full ${
                bridgeState.status === 'connected'
                  ? 'bg-brand-400 animate-pulse shadow-sm shadow-brand-400'
                  : bridgeState.status === 'connecting'
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-slate-500'
              }`}
            />
            <span className="text-sm font-bold text-white capitalize">
              {bridgeState.status === 'connected'
                ? '🟢 Phone & Desk Connected'
                : bridgeState.status === 'connecting'
                ? 'Connecting to Peer...'
                : 'Offline / Disconnected'}
            </span>
          </div>

          {bridgeState.status === 'connected' ? (
            <button
              onClick={handleDisconnect}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium"
            >
              <Unplug className="w-3.5 h-3.5" /> Disconnect
            </button>
          ) : null}
        </div>

        {/* CONNECTED STATE DISPLAY */}
        {bridgeState.status === 'connected' ? (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 font-medium block">Room Code</span>
                <span className="text-base font-mono font-bold text-brand-400">{bridgeState.roomCode}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 font-medium block">Paired Device</span>
                <span className="text-base font-semibold text-white truncate block">
                  {bridgeState.peerDeviceName || 'Active Peer'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Last Synced: {bridgeState.lastSyncedAt ? new Date(bridgeState.lastSyncedAt).toLocaleTimeString() : 'Just now'}
              </span>
              <button
                onClick={handleBroadcastSync}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/15 hover:bg-brand-500/25 text-brand-300 text-xs font-semibold border border-brand-500/30 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Force Sync Now</span>
              </button>
            </div>
          </div>
        ) : (
          /* PAIRING SETUP CONTROLS */
          <div className="space-y-6 pt-2">
            {/* Host or Join Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-900 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setActiveRole('laptop')}
                className={`py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  activeRole === 'laptop' ? 'bg-brand-500 text-black shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>I'm on Laptop</span>
              </button>
              <button
                onClick={() => setActiveRole('phone')}
                className={`py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  activeRole === 'phone' ? 'bg-brand-500 text-black shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>I'm on Phone</span>
              </button>
            </div>

            {/* Laptop Flow: Generate Code + QR */}
            {activeRole === 'laptop' ? (
              <div className="text-center space-y-4 py-2">
                <p className="text-xs text-slate-300">
                  Click below to generate a pairing code for your mobile device:
                </p>

                {!bridgeState.roomCode ? (
                  <button
                    onClick={handleCreateHostSession}
                    disabled={isBusy}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-emerald-400 text-black font-bold text-xs shadow-lg shadow-brand-500/30 hover:opacity-95 transition-all"
                  >
                    {isBusy ? 'Generating Pairing Session...' : 'Generate Pairing Code'}
                  </button>
                ) : (
                  <div className="space-y-4">
                    {/* QR Code */}
                    <div className="p-3 bg-white rounded-2xl w-40 h-40 mx-auto flex items-center justify-center shadow-lg">
                      <QRCodeSVG
                        value={`https://snap2done.ai/pair?code=${bridgeState.roomCode}`}
                        size={135}
                        level="M"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400 block">6-Digit Pairing Code:</span>
                      <div className="inline-flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-xl border border-slate-700">
                        <span className="font-mono text-2xl font-black text-brand-400 tracking-wider">
                          {bridgeState.roomCode}
                        </span>
                        <button
                          onClick={handleCopyCode}
                          className="p-1 rounded text-slate-400 hover:text-white"
                          title="Copy Code"
                        >
                          {copiedCode ? <Check className="w-4 h-4 text-brand-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 animate-pulse">
                      Waiting for phone to connect...
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Phone Flow: Enter Code */
              <div className="space-y-4 py-2">
                <p className="text-xs text-slate-300">
                  Enter the 6-character code shown on your laptop screen:
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={10}
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="e.g. 749281 or SD-8492"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-center font-mono text-lg font-bold text-white tracking-widest focus:outline-none focus:border-brand-500 uppercase"
                  />
                  <button
                    onClick={handleJoinSession}
                    disabled={!inputCode.trim() || isBusy}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-emerald-400 text-black font-bold text-xs shadow-md shadow-brand-500/25 disabled:opacity-50 transition-all flex items-center gap-1.5"
                  >
                    <span>Connect</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                  Tip: On laptops or same device during testing, use "Generate Pairing Code" above first, then enter the code here to see real-time peer communication!
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Office Kit Integration & Architectural Strategy Card */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-brand-400" />
            <span>Office Kit Strategy & Abstraction</span>
          </span>
          <span className="text-[10px] text-brand-300 font-mono bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
            {officeKitStatus.firmwareVersion}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          OfficeKitService provides seamless hardware docking hooks for future physical smart desk pads or dual-screen phone stands. In browser environments, it executes pure real-time synchronization over WebSockets and IndexedDB.
        </p>
      </div>
    </div>
  );
};
