import React, { useState } from 'react';
import { Calendar, RefreshCw, Check, Clock, Coffee, Sparkles, CheckCircle2, Zap, Edit3, X } from 'lucide-react';
import { DailyPlan, PlanBlock, Task } from '../../types';
import { deviceService } from '../../services/device/deviceService';

interface DailyPlanViewProps {
  plan: DailyPlan | null;
  tasks: Task[];
  onRegeneratePlan: () => void;
  onAcceptPlan: () => void;
  onUpdatePlanBlock: (blockId: string, updated: Partial<PlanBlock>) => void;
  onStartFocusOnTask: (task: Task) => void;
}

export const DailyPlanView: React.FC<DailyPlanViewProps> = ({
  plan,
  tasks,
  onRegeneratePlan,
  onAcceptPlan,
  onUpdatePlanBlock,
  onStartFocusOnTask
}) => {
  const [editingBlock, setEditingBlock] = useState<PlanBlock | null>(null);

  if (!plan) {
    return (
      <div className="p-8 text-center space-y-4">
        <Sparkles className="w-8 h-8 text-brand-400 mx-auto animate-pulse" />
        <h2 className="text-lg font-bold text-white">Generating AI Schedule...</h2>
      </div>
    );
  }

  const isAccepted = plan.status === 'accepted';

  const handleSaveBlockEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBlock) {
      onUpdatePlanBlock(editingBlock.id, {
        title: editingBlock.title,
        time: editingBlock.time,
        durationMinutes: editingBlock.durationMinutes
      });
      deviceService.vibrate(30);
      setEditingBlock(null);
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Your AI Plan for Today</h1>
            {isAccepted && (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                Accepted
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Intelligently scheduled around priorities, durations, and healthy break intervals.
          </p>
        </div>

        {/* Plan Actions: Accept / Regenerate */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onRegeneratePlan();
              deviceService.vibrate(40);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate</span>
          </button>

          {!isAccepted ? (
            <button
              onClick={() => {
                onAcceptPlan();
                deviceService.vibrate([40, 60, 40]);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-emerald-400 text-black text-xs font-bold shadow-md shadow-brand-500/25 hover:opacity-95 transition-all"
            >
              <Check className="w-4 h-4 stroke-[2.4]" />
              <span>Accept Plan</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 text-xs text-brand-400 font-semibold px-3 py-2 bg-brand-500/10 rounded-xl border border-brand-500/20">
              <CheckCircle2 className="w-4 h-4" />
              <span>Active Plan</span>
            </div>
          )}
        </div>
      </div>

      {/* Plan Schedule Timeline */}
      <div className="space-y-3 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-[2px] before:bg-slate-800">
        {plan.blocks.map((block, idx) => {
          const isBreak = block.type === 'break';
          const isReview = block.type === 'review';
          const linkedTask = block.taskId ? tasks.find(t => t.id === block.taskId) : null;

          return (
            <div
              key={block.id}
              className={`relative pl-10 transition-all ${
                block.completed ? 'opacity-60' : ''
              }`}
            >
              {/* Timeline Bullet Node */}
              <div
                className={`absolute left-2.5 top-3.5 w-4 h-4 rounded-full border-2 -translate-x-1/2 flex items-center justify-center ${
                  block.completed
                    ? 'bg-brand-500 border-brand-400'
                    : isBreak
                    ? 'bg-amber-500/20 border-amber-400'
                    : isReview
                    ? 'bg-purple-500/20 border-purple-400'
                    : 'bg-brand-500/20 border-brand-400'
                }`}
              >
                {block.completed && <span className="w-1.5 h-1.5 bg-black rounded-full" />}
              </div>

              {/* Block Card */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  isBreak
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : isReview
                    ? 'bg-purple-950/20 border-purple-500/30'
                    : 'bg-surface-card border-surface-border hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-slate-900 border border-slate-800 text-brand-300">
                      {block.time}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${isBreak ? 'text-amber-200' : 'text-white'}`}>
                          {block.title}
                        </span>
                        {isBreak && (
                          <span className="p-1 rounded-md bg-amber-500/20 text-amber-300 text-[10px]">
                            <Coffee className="w-3 h-3 inline mr-0.5" /> Break
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {block.durationMinutes} mins • {block.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Launch Focus Mode if task */}
                    {!isBreak && linkedTask && !block.completed && (
                      <button
                        onClick={() => onStartFocusOnTask(linkedTask)}
                        className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1"
                        title="Enter 25m Focus Mode"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Focus</span>
                      </button>
                    )}

                    {/* Check complete */}
                    <button
                      onClick={() => {
                        onUpdatePlanBlock(block.id, { completed: !block.completed });
                        deviceService.vibrate(30);
                      }}
                      className={`p-1.5 rounded-lg border text-xs ${
                        block.completed
                          ? 'bg-brand-500/20 border-brand-500 text-brand-400'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                      title={block.completed ? 'Mark pending' : 'Mark done'}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit Block */}
                    <button
                      onClick={() => setEditingBlock({ ...block })}
                      className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white"
                      title="Edit block time or title"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Block Modal */}
      {editingBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0f1422] border border-surface-border rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Edit Schedule Block</h3>
              <button onClick={() => setEditingBlock(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBlockEdit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingBlock.title}
                  onChange={(e) => setEditingBlock({ ...editingBlock, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={editingBlock.time}
                    onChange={(e) => setEditingBlock({ ...editingBlock, time: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    min={5}
                    max={240}
                    value={editingBlock.durationMinutes}
                    onChange={(e) => setEditingBlock({ ...editingBlock, durationMinutes: parseInt(e.target.value, 10) || 15 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingBlock(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-brand-500 text-black text-xs font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
