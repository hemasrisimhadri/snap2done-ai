# Technical Decisions & Architectural Rationales

### Snap2Done AI — Engineering Log

---

## 1. Local & Open-Source AI vs. Cloud LLMs
### Decision:
Implement an on-device hybrid NLP parsing and entity extraction engine combined with local model caching (`localAIModel.ts` + `localNLP.ts`), rather than relying exclusively on cloud LLM APIs (e.g. OpenAI or Gemini).

### Rationale:
1. **Zero-Cloud Latency & Offline Availability:** Students and professionals frequently capture notes in lecture halls, basements, or commutes with poor connectivity. Cloud-only architectures render the app useless offline.
2. **Absolute Data Privacy:** Whiteboards, syllabi, and voice memos frequently contain sensitive student records, proprietary code, or personal commitments. Processing on-device guarantees zero cloud leakage.
3. **Deterministic Reliability:** Heuristic temporal parsers guarantee 100% predictable task outputs, deadline calculations, and duration bounds without prompt injection risks or non-deterministic token hallucinations.
4. **Transparent User States:** The application explicitly signals `"Preparing on-device AI..."` and displays the verified `"AI processed locally"` badge.

---

## 2. Tesseract.js WebAssembly for OCR
### Decision:
Adopt `tesseract.js` compiled to WebAssembly running within a dedicated Web Worker thread.

### Rationale:
1. **Browser Sandboxing:** Runs universally across modern mobile browsers (iOS Safari, Android Chrome) and desktop environments without requiring native native binaries or platform-dependent C++ bindings.
2. **Progressive Worker Telemetry:** WebAssembly execution exposes granular stage milestones:
   - Reading image & canvas preprocessing
   - Extracting text via neural LSTM matrices
   - Parsing semantic task tokens
   - Generating action plan
3. **Local Weight Caching:** The English model weights (`eng.traineddata`) are cached in browser `CacheStorage` and `IndexedDB`, enabling true offline OCR after initial load.

---

## 3. IndexedDB for Persistent Offline Storage
### Decision:
Utilize browser IndexedDB via the lightweight `idb` promise wrapper as the primary source of truth, rather than relying on `localStorage` or remote cloud databases.

### Rationale:
1. **Asynchronous Non-Blocking IO:** Unlike `localStorage`, IndexedDB does not block the UI main thread during large reads or writes.
2. **Structured Object Stores:** Organizes `tasks`, `captures`, `plans`, `focusSessions`, and `settings` with structured indexing (`by-status`, `by-priority`, `by-date`).
3. **High Capacity:** Accommodates high-resolution capture previews and historical capture records far exceeding the 5MB quota of `localStorage`.

---

## 4. Desk Bridge: WebSocket Pairing Protocol
### Decision:
Deploy an Express + `ws` WebSocket synchronization server backed by ephemeral 6-character room codes and high-density QR codes (`qrcode.react`), paired with HTTP REST polling fallback.

### Rationale:
1. **Frictionless Zero-Auth Pairing:** Hackathon judges and multi-device users need instant pairing without tedious password creation or email verification steps.
2. **Sub-50ms Bidirectional Sync:** Enables live demonstration of dual-device workflows:
   - Capture on mobile phone $\rightarrow$ task appears in real-time on laptop desk workspace.
   - Complete on laptop $\rightarrow$ phone marks done with haptic feedback.
3. **Resilience:** If the network temporarily disconnects, clients degrade gracefully to local IndexedDB and reconcile state upon reconnection.

---

## 5. Office Kit Strategy & Abstraction Layer
### Decision:
Construct `OfficeKitService` as an abstraction layer representing hardware docking profiles, smart desk pads, or dual-screen pucks.

### Rationale:
1. **Honesty & Architectural Integrity:** As mandated by the judging criteria, if an official physical SDK is not yet standardized in browser sandboxes, we never fake hardware connections.
2. **Clean Extensibility:** When physical Office Kit accessories (e.g. NFC desk docks or Bluetooth smart pads) become available, only the internal driver in `OfficeKitService.ts` needs hardware binding; all business logic, task bridges, and focus locks remain untouched.
