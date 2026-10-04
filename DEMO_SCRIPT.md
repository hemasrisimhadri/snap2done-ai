# Snap2Done AI — Hackathon Presentation & Demo Script

**Track 04:** Productivity  
**Format:** 3–5 Minute Pitch & Live Demonstration  
**Presenter Roles:** Lead Engineer / Demo Presenter  

---

### [0:00 – 0:30] The Problem
> *"Good morning, judges. We all know the feeling: you walk out of a lecture, lab, or meeting. The whiteboard has four assignment deadlines scribbled across it. You have three sticky notes stuck to your laptop. Someone mentions a meeting for Wednesday. What happens next?
>
> You tell yourself you'll type them into a todo app later. But you don't. Because manual data entry is friction. Traditional productivity apps fail because they force you to sit down and type what's already right in front of your eyes.
>
> We built **Snap2Done AI** with a simple philosophy: **Capture anything. AI turns it into action.**"*

---

### [0:30 – 1:00] Camera Capture & Real Perception
> *(Presenter displays mobile screen on projector)*  
> *"The phone is our primary perception instrument. Watch this. I tap **Scan**. My phone camera opens with a live viewfinder. 
>
> Instead of typing, I point at this lecture whiteboard notes: 'DBMS assignment due Monday. Presentation Wednesday. Lab record Friday.' 
>
> I hit capture. Instantly, our on-device pipeline starts: reading image, extracting text, and understanding tasks."*

---

### [1:00 – 1:30] OCR + Local AI (Zero Cloud Leak)
> *"Notice what's happening right on this device: we are running **Tesseract.js WebAssembly OCR**. Not an external cloud vision API. 
>
> Look at the badge on top: **'AI processed locally'**. The photo never left my phone's RAM. There is zero surveillance, zero cloud latency, and 100% offline security."*

---

### [1:30 – 2:00] Tasks + Smart Priority Engine + Deadlines
> *"Within two seconds, the raw board text is transformed into structured tasks:
> 1. **DBMS Assignment** — automatically marked **🔥 HIGH PRIORITY**, due tomorrow at 10 AM, with 90 minutes estimated duration.
> 2. **Hackathon Presentation** — **🟡 MEDIUM PRIORITY**, due Wednesday.
> 3. **Lab Record** — **🟡 MEDIUM PRIORITY**, due Friday.
>
> Look at the dynamic explanation underneath:
> *'High priority because the deadline is tomorrow (24h left) with 90m estimated effort.'*
> This isn't hardcoded text — our smart priority engine dynamically calculates deadline proximity, duration, and study context."*

---

### [2:00 – 2:30] AI Daily Plan
> *(Presenter navigates to the Plan tab)*  
> *"Now, having a list of tasks is only half the battle. When do you actually do them? 
>
> I tap **AI Daily Plan**. Snap2Done AI immediately organizes today into realistic time blocks:
> - **09:00** — DBMS Assignment (90 min deep work)
> - **10:30** — 15-minute Stretch & Coffee Break
> - **11:00** — Resume Project
> - **14:00** — Presentation Rehearsal
> - **17:00** — End-of-day task review.
>
> I tap **Accept Plan**, and today's schedule is locked."*

---

### [2:30 – 3:00] Focus Mode (Deep Work)
> *(Presenter taps 'Focus' on DBMS Assignment)*  
> *"Now it's time to execute. I tap Focus. The screen dims into a distraction-free Pomodoro mode. 
>
> Our device service engages the **Screen Wake-Lock API** so the screen won't sleep, and applies tactile haptic feedback. 
>
> When the session finishes — *(Presenter taps complete)* — haptic pulses fire and celebratory confetti rewards the milestone. The session is safely saved to local IndexedDB."*

---

### [3:00 – 3:30] Phone ↔ Laptop Desk Bridge
> *(Presenter points to laptop screen)*  
> *"Now for our defining hackathon feature: **The Desk Bridge**. 
>
> A phone is best for capture on the move. But when you sit at your desk, you want your laptop's screen real estate and keyboard.
>
> On my laptop workspace, I click **Desk Bridge**. It displays a 6-digit code and a QR code. On my phone, I tap connect. 
>
> **🟢 Connected in under 100 milliseconds via WebSockets.**
>
> Watch what happens: When I complete a task on my laptop, my phone updates instantly. When I capture a task on my phone, my laptop workspace reflects it immediately. Real bidirectional sync."*

---

### [3:30 – 4:00] Real-World Impact & Office Kit
> *"Think about who this impacts:
> - Students walking out of lecture halls who never transcribe boards.
> - Engineers in standup meetings capturing whiteboard diagrams.
> - Professionals turning voice memos into scheduled time blocks.
>
> Furthermore, our **OfficeKitService** architecture is ready for future physical smart desk stands and dual-screen hardware docks, providing unified status reporting without architectural modifications."*

---

### [4:00 – 4:30] Technical Architecture Summary
> *"Behind the scenes:
> - **Client:** React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion.
> - **OCR:** Tesseract.js (WebAssembly).
> - **Local AI:** Tokenizer & Temporal Pattern Parser with IndexedDB model cache.
> - **Storage:** Offline-first IndexedDB (zero data loss).
> - **Backend:** Node.js, Express, WebSocket Desk Bridge server.
> - **Testing:** Verified end-to-end with automated test runs and browser subagent flows."*

---

### [4:30 – 5:00] Why Snap2Done AI Wins
> *"Snap2Done is not another CRUD todo list. 
> It bridges the physical world and digital execution. 
> It respects user privacy with on-device AI. 
> It syncs seamlessly across phone and desk.
>
> **Capture anything. AI turns it into action.** 
> Thank you, and we welcome your questions!"*
