import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Mic, Type, Flame, Clock, CheckCircle2, Timer, ArrowRight, Sparkles, ChevronRight, Zap, AlertCircle } from 'lucide-react';
import { Task, CaptureRecord, DailyPlan, AIInsights } from '../../types';

interface DashboardViewProps {
  tasks: Task[];
  captures: CaptureRecord[];
  dailyPlan: DailyPlan | null;
  insights: AIInsights;
  onOpenScan: () => void;
  onOpenVoice: () => void;
  onOpenText: () => void;
  onSelectTab: (tab: any) => void;
  onToggleTaskComplete: (id: string) => void;
  onStartFocusOnTask: (task: Task) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  captures,
  dailyPlan,
  insights,
  onOpenScan,
  onOpenVoice,
  onOpenText,
  onSelectTab,
  onToggleTaskComplete,
  onStartFocusOnTask
}) => {
  // Stats calculations
  const highPriorityCount = tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length;
  const dueTodayCount = tasks.filter(t => {
    if (!t.deadline || t.status === 'completed') return false;
    const d = new Date(t.deadline);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  const plannedTimeHours = Math.round(insights.totalPlannedMinutes / 60 * 10) / 10;

  // Next up tasks (top 3 pending tasks sorted by priority)
  const nextTasks = tasks
    .filter(t => t.status !== 'completed')
    .sort((a, b) => {
      const p = { high: 3, medium: 2, low: 1 };
      return p[b.priority] - p[a.priority];
    })
    .slice(0, 3);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header Greeting */}
      <section className="space-y-1">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Good morning 👋
          </h1>
          <span className="text-xs px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-medium">
            Phone-First AI
          </span>
        </div>
        <p className="text-sm text-slate-400 font-medium">
          Here's what matters today.
        </p>
      </section>

      {/* Stats Cards Grid (4 tiles) */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* High Priority */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-950/40 to-slate-900 border border-rose-500/30 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400">High Priority</p>
            <p className="text-2xl font-black text-rose-400 mt-0.5">{highPriorityCount}</p>
          </div>
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
            <Flame className="w-5 h-5 fill-rose-500/20" />
          </div>
        </div>

        {/* Due Today */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-500/30 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Due Today</p>
            <p className="text-2xl font-black text-amber-400 mt-0.5">{dueTodayCount}</p>
          </div>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Completed */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-brand-950/40 to-slate-900 border border-brand-500/30 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Completed</p>
            <p className="text-2xl font-black text-brand-400 mt-0.5">{completedCount}</p>
          </div>
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Planned Time */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Planned Time</p>
            <p className="text-2xl font-black text-indigo-400 mt-0.5">{plannedTimeHours}h</p>
          </div>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Timer className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* Large Primary CTA: Capture with AI */}
      <section className="p-5 rounded-2xl bg-gradient-to-br from-brand-950/60 via-slate-900 to-slate-900 border border-brand-500/40 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              Capture with AI
            </h2>
            <p className="text-xs text-slate-400">Point, speak, or type — AI extracts tasks instantly.</p>
          </div>
          <span className="text-[10px] uppercase font-bold text-brand-400 bg-brand-500/15 border border-brand-500/30 px-2 py-0.5 rounded-full">
            On-Device OCR
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {/* Scan */}
          <button
            onClick={onOpenScan}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 hover:border-brand-500/40 active:scale-95 transition-all group"
          >
            <div className="p-2.5 rounded-full bg-brand-500/15 text-brand-400 group-hover:scale-110 transition-transform mb-1.5">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-white">Scan</span>
            <span className="text-[10px] text-slate-400">Camera OCR</span>
          </button>

          {/* Speak */}
          <button
            onClick={onOpenVoice}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 hover:border-blue-500/40 active:scale-95 transition-all group"
          >
            <div className="p-2.5 rounded-full bg-blue-500/15 text-blue-400 group-hover:scale-110 transition-transform mb-1.5">
              <Mic className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-white">Speak</span>
            <span className="text-[10px] text-slate-400">Voice AI</span>
          </button>

          {/* Type */}
          <button
            onClick={onOpenText}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 hover:border-purple-500/40 active:scale-95 transition-all group"
          >
            <div className="p-2.5 rounded-full bg-purple-500/15 text-purple-400 group-hover:scale-110 transition-transform mb-1.5">
              <Type className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-white">Type</span>
            <span className="text-[10px] text-slate-400">NLP Notes</span>
          </button>
        </div>
      </section>

      {/* Your AI Plan Preview */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">Your AI Plan for Today</h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/15 text-brand-400 font-semibold border border-brand-500/30">
              Optimal Schedule
            </span>
          </div>
          <button
            onClick={() => onSelectTab('plan')}
            className="text-xs text-brand-400 hover:underline flex items-center gap-1 font-medium"
          >
            Full Schedule <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {dailyPlan && dailyPlan.blocks.length > 0 ? (
          <div className="space-y-2">
            {dailyPlan.blocks.slice(0, 3).map((block) => (
              <div
                key={block.id}
                className="p-3 rounded-xl bg-surface-card border border-surface-border flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-brand-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    {block.time}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{block.title}</p>
                    <p className="text-[11px] text-slate-400">
                      {block.durationMinutes} mins • {block.category}
                    </p>
                  </div>
                </div>
                {block.type === 'task' && (
                  <button
                    onClick={() => {
                      const t = tasks.find(item => item.id === block.taskId);
                      if (t) onStartFocusOnTask(t);
                    }}
                    className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 border border-indigo-500/30 text-xs font-medium flex items-center gap-1"
                    title="Start Focus on this block"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Focus</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-surface-card border border-surface-border text-center text-xs text-slate-400">
            No schedule generated yet. Capture tasks to automatically build today's plan.
          </div>
        )}
      </section>

      {/* Immediate Focus / Next Up Tasks */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Next Up Tasks</h2>
          <button
            onClick={() => onSelectTab('tasks')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium"
          >
            All Tasks ({tasks.length}) <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {nextTasks.map((task) => (
            <div
              key={task.id}
              className="p-3.5 rounded-xl bg-surface-card border border-surface-border hover:border-slate-700 transition-all flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onToggleTaskComplete(task.id)}
                  className="mt-0.5 w-5 h-5 rounded-md border border-slate-600 hover:border-brand-500 flex items-center justify-center transition-colors"
                >
                  {task.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-brand-400" />}
                </button>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white">{task.title}</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        task.priority === 'high'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : task.priority === 'medium'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {task.priority === 'high' ? '🔥 HIGH' : task.priority === 'medium' ? '🟡 MEDIUM' : '🟢 LOW'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{task.description}</p>
                  <p className="text-[11px] text-amber-300/80 font-medium mt-1">
                    {task.priorityReason}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onStartFocusOnTask(task)}
                className="shrink-0 p-2 rounded-xl bg-slate-800 hover:bg-brand-500/20 hover:text-brand-300 text-slate-400 border border-slate-700 transition-colors"
                title="Start 25:00 Focus"
              >
                <Zap className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* AI Insights Card */}
      <section className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-300">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold tracking-tight">AI Real-Data Insights</h2>
          </div>
          <span className="text-xs font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
            Score: {insights.productivityScore}/100
          </span>
        </div>

        <ul className="space-y-1.5 text-xs text-slate-300">
          {insights.insightBullets.map((bullet, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Recent Captures Quick Row */}
      {captures.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Recent Captures</h2>
            <button
              onClick={() => onSelectTab('captures')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium"
            >
              View All ({captures.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {captures.slice(0, 2).map((cap) => (
              <div
                key={cap.id}
                className="p-3 rounded-xl bg-surface-card border border-surface-border text-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">
                    {cap.type === 'camera' ? '📷' : cap.type === 'voice' ? '🎤' : '⌨️'}
                  </span>
                  <div>
                    <p className="font-medium text-white truncate max-w-[220px]">
                      {cap.extractedText.replace(/\n/g, ' ')}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(cap.createdAt).toLocaleDateString()} • {cap.tasksCount} task(s) generated
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                  Processed
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
