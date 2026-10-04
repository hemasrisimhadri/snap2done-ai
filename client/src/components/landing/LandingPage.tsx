import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Mic, Cpu, Monitor, Zap, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Layers } from 'lucide-react';

interface LandingPageProps {
  onStartCapturing: () => void;
  onViewPlan: () => void;
  onExploreDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartCapturing,
  onViewPlan,
  onExploreDemo,
}) => {
  const featureCards = [
    {
      icon: Camera,
      title: 'Camera AI',
      badge: 'Real OCR',
      desc: 'Point at any whiteboard, syllabus, sticky note, or screen. Tesseract.js WebAssembly OCR extracts clean text on-device.',
      color: 'from-emerald-500/20 to-teal-500/10',
      border: 'border-emerald-500/30',
      iconColor: 'text-emerald-400'
    },
    {
      icon: Mic,
      title: 'Voice AI',
      badge: 'Web Speech',
      desc: 'Dictate natural language instructions. Automatically extracts tasks, dates, deadlines, and urgency in real-time.',
      color: 'from-blue-500/20 to-cyan-500/10',
      border: 'border-blue-500/30',
      iconColor: 'text-blue-400'
    },
    {
      icon: Cpu,
      title: 'Local AI',
      badge: '100% Offline',
      desc: 'Zero server dependencies for core extraction. Your captures and notes never leak into the cloud. Stored in IndexedDB.',
      color: 'from-purple-500/20 to-pink-500/10',
      border: 'border-purple-500/30',
      iconColor: 'text-purple-400'
    },
    {
      icon: Monitor,
      title: 'Desk Bridge',
      badge: 'WebSocket Sync',
      desc: 'Phone = Capture & Control. Laptop = Workspace. Real-time pairing via 6-digit code or QR code with bidirectional task sync.',
      color: 'from-amber-500/20 to-yellow-500/10',
      border: 'border-amber-500/30',
      iconColor: 'text-amber-400'
    },
    {
      icon: Zap,
      title: 'Focus Mode',
      badge: 'Pomodoro + Lock',
      desc: '25-minute distraction-free deep work timer with screen wake-lock, haptic pulses, and auto-sync to your laptop workspace.',
      color: 'from-rose-500/20 to-orange-500/10',
      border: 'border-rose-500/30',
      iconColor: 'text-rose-400'
    }
  ];

  return (
    <div className="min-h-full py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-4 sm:pt-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hackathon Track 04 — Productivity Champion</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight"
        >
          Snap2Done AI
          <span className="block mt-2 bg-gradient-to-r from-brand-400 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
            Capture anything. AI turns it into action.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Turn the world around you into an intelligent action plan.
          Scan handwritten boards, speak quick reminders, and sync instantly to your desk.
        </motion.p>

        {/* Hero CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3.5 pt-2"
        >
          <button
            onClick={onStartCapturing}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-emerald-400 text-black font-bold text-base shadow-xl shadow-brand-500/30 hover:opacity-95 active:scale-95 transition-all"
          >
            <Camera className="w-5 h-5 stroke-[2.4]" />
            <span>Start Capturing</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={onViewPlan}
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-white font-semibold text-base border border-slate-700 active:scale-95 transition-all"
          >
            <span>View Today's Plan</span>
          </button>

          <button
            onClick={onExploreDemo}
            className="flex items-center gap-2 px-4 py-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold text-sm border border-amber-500/30 transition-all"
          >
            <span>Interactive Demo</span>
          </button>
        </motion.div>

        {/* Real World Pipeline Graphic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-2xl bg-surface-card/80 border border-surface-border text-left shadow-2xl max-w-3xl mx-auto mt-8"
        >
          <div className="flex items-center justify-between pb-3 border-b border-surface-border text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Live AI Action Pipeline</span>
            <span className="flex items-center gap-1 text-brand-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Local On-Device AI
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <p className="text-slate-400 font-medium">1. Real World</p>
              <p className="font-semibold text-white mt-1">Board / Voice / Note</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <p className="text-slate-400 font-medium">2. Local OCR / NLP</p>
              <p className="font-semibold text-brand-400 mt-1">Tesseract.js + Rules</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <p className="text-slate-400 font-medium">3. Priority Engine</p>
              <p className="font-semibold text-amber-400 mt-1">Smart Deadlines</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <p className="text-slate-400 font-medium">4. Desk Bridge</p>
              <p className="font-semibold text-cyan-400 mt-1">Phone ↔ Laptop Sync</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Cards Grid */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-white">Engineered for the Modern Workflow</h2>
          <p className="text-slate-400 text-sm">Not another generic todo list. Built from the ground up for phone-first real world capture.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureCards.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                className={`p-5 rounded-2xl bg-gradient-to-br ${feat.color} border ${feat.border} space-y-3 relative overflow-hidden`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl bg-slate-950/80 border border-white/10 ${feat.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-950/70 text-slate-300 border border-white/10">
                    {feat.badge}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{feat.title}</h3>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Bottom Trust & Privacy Bar */}
      <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
        <h3 className="text-sm font-semibold text-white">Guaranteed Offline & Zero-Cloud Leak</h3>
        <p className="text-xs text-slate-400 max-w-xl mx-auto">
          Your captures stay on your device whenever local processing is available. Powered by WebAssembly OCR, browser speech recognition, and IndexedDB local persistence.
        </p>
      </section>
    </div>
  );
};
