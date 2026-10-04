import React from 'react';
import { Home, Camera, CheckSquare, Calendar, Monitor, History } from 'lucide-react';

export type NavTab = 'dashboard' | 'capture' | 'tasks' | 'plan' | 'captures' | 'bridge';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenCaptureModal: () => void;
  pendingTasksCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenCaptureModal,
  pendingTasksCount
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0f17]/95 backdrop-blur-xl border-t border-surface-border/70 pb-safe md:hidden">
      <div className="flex items-center justify-around px-2 py-1.5 max-w-md mx-auto relative">
        {/* Home */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-colors ${
            activeTab === 'dashboard' ? 'text-brand-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Home</span>
        </button>

        {/* Tasks */}
        <button
          onClick={() => onSelectTab('tasks')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-colors relative ${
            activeTab === 'tasks' ? 'text-brand-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Tasks</span>
          {pendingTasksCount > 0 && (
            <span className="absolute top-0.5 right-1 w-4 h-4 rounded-full bg-brand-500 text-black text-[9px] font-bold flex items-center justify-center">
              {pendingTasksCount}
            </span>
          )}
        </button>

        {/* Large Center Capture CTA */}
        <div className="relative -top-4">
          <button
            onClick={onOpenCaptureModal}
            className="w-13 h-13 p-3.5 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-emerald-400 text-black shadow-lg shadow-brand-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-2 border-[#0c0f17]"
            aria-label="Capture with AI"
          >
            <Camera className="w-6 h-6 stroke-[2.2]" />
          </button>
        </div>

        {/* Plan */}
        <button
          onClick={() => onSelectTab('plan')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-colors ${
            activeTab === 'plan' ? 'text-brand-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Plan</span>
        </button>

        {/* Desk Bridge */}
        <button
          onClick={() => onSelectTab('bridge')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-colors ${
            activeTab === 'bridge' ? 'text-brand-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Monitor className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Bridge</span>
        </button>
      </div>
    </nav>
  );
};
