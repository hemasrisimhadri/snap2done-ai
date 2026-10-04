# Snap2Done AI
> **"Capture anything. AI turns it into action."**
>
> **Track 04 — Productivity Champion** | Phone-First Local AI Productivity Application

---

## 🚀 Live Demo & Deployment
- **Live Production URL:** [https://legal-donkeys-dig.loca.lt](https://legal-donkeys-dig.loca.lt) *(Tunnel Bypass Password if prompted: `157.50.102.179`)*
- **Local Development Server:** `http://localhost:3001`
- **Real-Time Desk Bridge WebSocket:** `ws://localhost:3001/ws`

---

## 💡 The Problem
In modern work and university environments, crucial information exists everywhere *outside* of todo apps:
- Handwritten whiteboard notes from lectures and meetings.
- Printed assignment syllabi and deadlines pinned to desks.
- Quick spoken thoughts during commutes.
- Post-it sticky notes and physical schedules.

Generic todo apps demand tedious manual typing, manual date selection, manual priority estimation, and constant context switching between phones and laptop workspaces. Users end up with fragmented notes that never get executed.

## 🎯 The Solution: Snap2Done AI
Snap2Done AI transforms raw real-world inputs directly into structured, prioritized action plans:
```
REAL WORLD INFORMATION (Board / Voice / Note)
                     ↓
        PHONE CAMERA / VOICE / TEXT
                     ↓
       OCR + LOCAL/OPEN-SOURCE AI
                     ↓
               TASK EXTRACTION
                     ↓
           PRIORITY + DEADLINE
                     ↓
                AI DAILY PLAN
                     ↓
                 FOCUS MODE
                     ↓
         PHONE ↔ LAPTOP DESK BRIDGE
                     ↓
                PRODUCTIVITY
```

The phone serves as the **Capture & Control instrument**, while the laptop provides the **Deep Work Workspace**.

---

## ⚡ Core Features

### 1. 📷 Real Camera OCR (Tesseract.js WebAssembly)
- Real-time viewfinder stream with environment camera detection.
- WebAssembly-powered local OCR extracting text with zero cloud latency and 100% data privacy.
- Includes 1-click preset sample boards (Lecture Whiteboard, Sticky Notes, Syllabus) for instant evaluation.
- Live progress feedback: Reading image → Extracting text → Understanding tasks → Building action plan.

### 2. 🎤 Voice Capture (Web Speech API)
- Real-time browser speech recognition with voice waveform visualizer.
- Natural speech understanding (e.g. *"I need to finish my DBMS assignment tomorrow at 10 AM"*).
- Instant conversion to structured task with priority, deadline, category, and estimated duration.

### 3. 🧠 Smart Priority & Reasoning Engine
- Analyzes deadline proximity, overdue status, estimated duration, and category context.
- Generates dynamic, non-hardcoded rationales:
  > *"High priority because the deadline is tomorrow (24h left) with 90m estimated effort."*
- Dynamic visual priority badges: 🔥 HIGH, 🟡 MEDIUM, 🟢 LOW.

### 4. 📅 AI Daily Plan
- Generates realistic, human-friendly daily schedules.
- Organizes tasks into structured time blocks (e.g., 09:00 DBMS Assignment, 10:30 Break, 11:00 Presentation, 17:00 Review).
- Supports 1-click **Accept**, **Edit Block**, and **Regenerate**.

### 5. ⚡ Distraction-Free Focus Mode
- 25:00 Pomodoro countdown timer.
- Integrates Screen Wake-Lock API to keep device display awake.
- Tactile haptic vibration pulses and celebratory confetti upon task completion.

### 6. 💻 Phone ↔ Laptop Desk Bridge
- Real-time synchronization over WebSockets and HTTP fallback.
- Laptop generates a 6-digit room code (`SD-XXXX`) and QR code.
- Mobile phones join instantly without complex account setups.
- Real-time bidirectional updates:
  - Phone creates or scans a task → Laptop workspace updates instantly.
  - Laptop completes a task → Phone updates with zero latency.

### 7. 🛡️ 100% Offline-First (IndexedDB)
- Fully functional without an active internet connection.
- Persistent local database stores tasks, captures, daily plans, and focus history.
- Network status detection with offline banners and seamless peer reconnection.

### 8. 🏢 Office Kit Strategy & Abstraction Layer
- `OfficeKitService` abstraction layer provides architectural hooks for physical desk pads, docking stations, and dual-screen pucks.
- Clear documentation and virtual bridge execution in browser sandbox environments.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Lucide React |
| **Backend & Sync** | Node.js, Express, WebSocket (`ws`), TypeScript |
| **Local OCR** | Tesseract.js (WebAssembly) |
| **Local AI & NLP** | On-device semantic parser, temporal tokenizers, deterministic priority engine, CacheStorage model caching |
| **Storage** | IndexedDB via `idb` promise wrapper |
| **Device APIs** | MediaDevices (Camera), Web Speech API, WakeLock API, Vibration API, Web Notifications, Clipboard API |

---

## 📦 Installation & Running Locally

### Prerequisites
- Node.js v18+ (tested on Node v24)
- npm v9+

### 1. Clone & Setup
```bash
git clone https://github.com/your-username/snap2done-ai.git
cd snap2done-ai
```

### 2. Install Dependencies
```bash
# Client
cd client && npm install

# Server
cd ../server && npm install

# Root
cd ..
```

### 3. Build & Run
```bash
# Production Build
npm run build

# Start Fullstack Server (serves UI + WebSocket on :3001)
npm run start
```
Open **`http://localhost:3001`** in your browser.

---

## 🧪 Hackathon Demo Flow (15 Steps)

1. Open **`http://localhost:3001`** (or phone live URL).
2. Click **`Demo`** in the top header to launch the guided walkthrough.
3. Advance through the 15-step interactive tour:
   - Dashboard inspection
   - Live Camera scan
   - Whiteboard sample capture
   - Tesseract WebAssembly OCR
   - Local AI task extraction
   - Smart priority rationales
   - AI Daily Plan schedule
   - 25:00 Focus Mode with confetti
   - Desk Bridge pairing code & QR generation
   - Bidirectional laptop-phone sync
4. Use **`Reset Demo Data`** anytime to restore the clean initial benchmark.
