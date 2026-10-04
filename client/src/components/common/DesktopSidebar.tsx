import React from 'react';
import { Home, CheckSquare, Calendar, Monitor, History, Zap, Shield, PlusCircle } from 'lucide-react';
import { NavTab } from './BottomNav';

interface DesktopSidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenCapture: () => void;
  onStartFocus: () => void;
  pendingTasksCount: number;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenCapture,
  onStartFocus,
  pendingTasksCount,
}) => {
  const navItems: Array<{ id: NavTab; label: string; icon: any; badge?: number }> = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'tasks', label: 'Task Manager', icon: CheckSquare, badge: pendingTasksCount },
    { id: 'plan', label: 'AI Daily Plan', icon: Calendar },
    { id: 'bridge', label: 'Desk Bridge Sync', icon: Monitor },
    { id: 'captures', label: 'Capture History', icon: History },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-surface-border/60 bg-[#0e131f]/90 flex flex-col justify-between p-4 shrink-0 hidden md:flex min-h-[calc(100vh-56px)]">
      <div className="space-y-6">
        {/* Quick Capture Primary CTA */}
        <div>
          <button
            onClick={onOpenCapture}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-500 to-emerald-400 text-black font-bold shadow-lg shadow-brand-500/25 hover:opacity-95 active:scale-[0.98] transition-all"
          >
            <PlusCircle className="w-5 h-5 stroke-[2.4]" />
            <span>Capture with AI</span>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Workspace</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-semibold border border-brand-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Focus Mode Card */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 space-y-2">
          <div className="flex items-center gap-2 text-indigo-300">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Deep Work</span>
          </div>
          <p className="text-xs text-slate-300">Enter distraction-free 25m Pomodoro with dual-screen lock.</p>
          <button
            onClick={onStartFocus}
            className="w-full py-1.5 px-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold transition-colors"
          >
            Start Focus Mode
          </button>
        </div>
      </div>

      {/* On-device Security & Privacy Badge */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5 text-brand-400 font-semibold">
          <Shield className="w-3.5 h-3.5" />
          <span>Local-First Privacy</span>
        </div>
        <p className="text-[10px] leading-relaxed text-slate-400">
          Captures and OCR stay on this device. No cloud surveillance.
        </p>
      </div>
    </aside>
  );
};
