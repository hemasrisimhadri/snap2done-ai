import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, CheckCircle2, ChevronRight, ChevronLeft, RotateCcw, X, Sparkles, Smartphone, Monitor, ShieldCheck, Zap } from 'lucide-react';
import { deviceService } from '../../services/device/deviceService';

interface DemoTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetDemoData: () => void;
  onExecuteDemoStep: (stepIndex: number) => void;
}

export const DEMO_STEPS = [
  {
    step: 1,
    title: 'Open Phone Dashboard',
    desc: 'Notice mobile-first responsive design, quick stats, and primary "Capture with AI" CTA.',
    actionName: 'Go to Dashboard',
    tab: 'dashboard'
  },
  {
    step: 2,
    title: 'Tap Scan',
    desc: 'Opens on-device camera with viewfinder and sample presets.',
    actionName: 'Open Camera Scan',
    actionType: 'open_scan'
  },
  {
    step: 3,
    title: 'Capture Whiteboard Note',
    desc: 'Simulate or take a photo of blackboard/whiteboard notes (e.g. CS401 Deliverables).',
    actionName: 'Load Whiteboard Sample',
    actionType: 'load_sample_whiteboard'
  },
  {
    step: 4,
    title: 'OCR Extracts Text',
    desc: 'Tesseract.js WebAssembly runs 100% locally on-device. Zero cloud transmission.',
    actionName: 'Observe OCR Extraction',
    actionType: 'run_ocr'
  },
  {
    step: 5,
    title: 'Local AI Processes It',
    desc: 'NLP tokenizes text, identifies temporal expressions (e.g. "due Monday", "Wednesday 2 PM").',
    actionName: 'View Local AI Badge',
    actionType: 'ai_badge'
  },
  {
    step: 6,
    title: 'Tasks Appear',
    desc: 'Structured tasks are extracted: DBMS Assignment, Hackathon Presentation, Lab Record.',
    actionName: 'Inspect Tasks',
    tab: 'tasks'
  },
  {
    step: 7,
    title: 'Priorities Calculated',
    desc: 'Smart priority engine determines 🔥 HIGH / 🟡 MEDIUM / 🟢 LOW dynamically.',
    actionName: 'Check Priority Engine',
    tab: 'tasks'
  },
  {
    step: 8,
    title: 'Deadlines Formatted',
    desc: 'Calculates countdowns and explanations: "High priority because deadline is tomorrow".',
    actionName: 'Review Deadlines',
    tab: 'tasks'
  },
  {
    step: 9,
    title: 'AI Creates Daily Plan',
    desc: 'Planner generates time blocks (09:00, 10:30, 11:00...) balanced with breaks.',
    actionName: 'View AI Daily Plan',
    tab: 'plan'
  },
  {
    step: 10,
    title: 'Start Focus Mode',
    desc: 'Enter 25:00 Pomodoro deep work mode with screen wake-lock & distraction lock.',
    actionName: 'Launch Focus Mode',
    actionType: 'launch_focus'
  },
  {
    step: 11,
    title: 'Complete Task & Celebration',
    desc: 'Check off task with haptics & confetti animation. Stored offline in IndexedDB.',
    actionName: 'Complete & Confetti',
    actionType: 'complete_focus'
  },
  {
    step: 12,
    title: 'Open Laptop Workspace',
    desc: 'Switch to Desk Bridge tab or toggle Laptop Workspace view.',
    actionName: 'Switch to Desk View',
    tab: 'bridge'
  },
  {
    step: 13,
    title: 'Desk Bridge Connected',
    desc: 'Laptop generates pairing code / QR code. Phone links in real-time.',
    actionName: 'Verify Bridge State',
    tab: 'bridge'
  },
  {
    step: 14,
    title: 'Update Task on Laptop',
    desc: 'Toggle a task complete or create a new task on the desk interface.',
    actionName: 'Test Sync Broadcast',
    actionType: 'trigger_sync'
  },
  {
    step: 15,
    title: 'Show Phone Updating Instantly',
    desc: 'Zero-latency bidirectional sync complete! Ready for hackathon podium.',
    actionName: 'Finish Demo Flow',
    tab: 'dashboard'
  }
];

export const DemoTourModal: React.FC<DemoTourModalProps> = ({
  isOpen,
  onClose,
  onResetDemoData,
  onExecuteDemoStep
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  if (!isOpen) return null;

  const currentStep = DEMO_STEPS[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      onExecuteDemoStep(nextIdx);
      deviceService.vibrate(30);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      onExecuteDemoStep(prevIdx);
      deviceService.vibrate(20);
    }
  };

  const handleAction = () => {
    onExecuteDemoStep(currentStepIndex);
    deviceService.vibrate(40);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#0f1422] border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-surface-border bg-gradient-to-r from-amber-500/15 to-orange-500/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
              <PlayCircle className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Judge & Demo Mode</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Step {currentStep.step} of 15
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                15-Step Grand Finale Hackathon Walkthrough
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Content */}
        <div className="p-5 space-y-4">
          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-400 h-full transition-all duration-300"
              style={{ width: `${(currentStep.step / 15) * 100}%` }}
            />
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-mono font-bold flex items-center justify-center border border-amber-500/30">
                  {currentStep.step}
                </span>
                <span>{currentStep.title}</span>
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentStep.desc}
            </p>
          </div>

          {/* Quick Action Trigger Button for this step */}
          <button
            onClick={handleAction}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Execute: {currentStep.actionName}</span>
          </button>
        </div>

        {/* Footer Navigation & Reset Data */}
        <div className="p-4 border-t border-surface-border bg-slate-950/80 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              if (confirm('Reset database back to initial clean demo state?')) {
                onResetDemoData();
                setCurrentStepIndex(0);
                deviceService.vibrate(50);
              }
            }}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-medium"
            title="Reset data to initial state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Demo Data</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="p-2 rounded-xl bg-slate-800 disabled:opacity-40 text-slate-300 text-xs font-semibold hover:bg-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1"
            >
              <span>{currentStepIndex === DEMO_STEPS.length - 1 ? 'Close Demo' : 'Next Step'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
