import React, { useState } from 'react';
import { Camera, Mic, Type, Calendar, ChevronRight, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { CaptureRecord, Task } from '../../types';

interface CapturesHistoryViewProps {
  captures: CaptureRecord[];
  tasks: Task[];
  onOpenCapture: () => void;
}

export const CapturesHistoryView: React.FC<CapturesHistoryViewProps> = ({
  captures,
  tasks,
  onOpenCapture
}) => {
  const [selectedCapture, setSelectedCapture] = useState<CaptureRecord | null>(null);

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'camera':
        return <Camera className="w-4 h-4 text-emerald-400" />;
      case 'voice':
        return <Mic className="w-4 h-4 text-blue-400" />;
      default:
        return <Type className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-5 pb-24 md:pb-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Capture History</h1>
          <p className="text-xs text-slate-400">
            Timeline of all real-world photos, voice notes, and text processed on-device.
          </p>
        </div>

        <button
          onClick={onOpenCapture}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-emerald-400 text-black text-xs font-bold shadow-md shadow-brand-500/20 hover:opacity-95 transition-all"
        >
          <span>New Capture</span>
        </button>
      </div>

      {/* History List */}
      <div className="space-y-3">
        {captures.length === 0 ? (
          <div className="p-8 rounded-2xl bg-surface-card border border-surface-border text-center space-y-2">
            <p className="text-sm font-semibold text-slate-300">No captures yet</p>
            <p className="text-xs text-slate-400">
              Point your phone camera at a whiteboard or speak a voice memo to get started.
            </p>
          </div>
        ) : (
          captures.map((cap) => (
            <div
              key={cap.id}
              onClick={() => setSelectedCapture(cap)}
              className="p-4 rounded-2xl bg-surface-card border border-surface-border hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0 group-hover:scale-105 transition-transform">
                  {getSourceIcon(cap.type)}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      {cap.type === 'camera' ? '📷 Camera OCR' : cap.type === 'voice' ? '🎤 Voice Audio' : '⌨️ Text Note'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(cap.createdAt).toLocaleDateString()} at {new Date(cap.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 font-mono">
                    "{cap.extractedText.replace(/\n/g, ' ')}"
                  </p>

                  <div className="flex items-center gap-2 text-[10px] text-brand-400 font-semibold pt-0.5">
                    <span>{cap.tasksCount} task{cap.tasksCount > 1 ? 's' : ''} extracted</span>
                    <span>• 100% on-device</span>
                  </div>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors shrink-0" />
            </div>
          ))
        )}
      </div>

      {/* Capture Details Modal */}
      {selectedCapture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0f1422] border border-surface-border rounded-2xl shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-slate-800">
                  {getSourceIcon(selectedCapture.type)}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white capitalize">
                    {selectedCapture.type} Capture
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    {new Date(selectedCapture.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCapture(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Extracted Text */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-300 block">Raw Extracted Text:</span>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-wrap">
                {selectedCapture.extractedText}
              </div>
            </div>

            {/* Linked Tasks */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">
                Associated Tasks ({selectedCapture.tasksCount}):
              </span>
              <div className="space-y-1.5">
                {tasks
                  .filter(t => selectedCapture.taskIds.includes(t.id))
                  .map(t => (
                    <div
                      key={t.id}
                      className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-white">{t.title}</span>
                      <span className="text-[10px] font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                        {t.priority.toUpperCase()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedCapture(null)}
              className="w-full py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
