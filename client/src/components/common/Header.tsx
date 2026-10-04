import React, { useEffect, useState } from 'react';
import { Sparkles, Monitor, Smartphone, Wifi, WifiOff, PlayCircle, ShieldCheck } from 'lucide-react';
import { localAI, AIModelState } from '../../services/ai/localAIModel';
import { deskBridgeService } from '../../services/bridge/deskBridgeService';
import { DeskBridgeState } from '../../types';

interface HeaderProps {
  onOpenDemo: () => void;
  onOpenBridge: () => void;
  isDesktopWorkspace: boolean;
  onToggleDesktopWorkspace: () => void;
  onStartFocus: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDemo,
  onOpenBridge,
  isDesktopWorkspace,
  onToggleDesktopWorkspace,
}) => {
  const [aiStatus, setAIStatus] = useState<{ state: AIModelState; message: string }>({
    state: 'idle',
    message: 'Preparing on-device AI...'
  });
  const [bridgeState, setBridgeState] = useState<DeskBridgeState>(deskBridgeService.getState());
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const unsubAI = localAI.subscribe((status) => {
      setAIStatus({ state: status.state, message: status.message });
    });

    const unsubBridge = deskBridgeService.subscribe(() => {
      setBridgeState(deskBridgeService.getState());
    });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial trigger to prepare on-device AI
    localAI.prepareOnDeviceAI();

    return () => {
      unsubAI();
      unsubBridge();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-surface-border/60 bg-[#0c0f17]/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 p-[1.5px] flex items-center justify-center shadow-lg shadow-brand-500/20">
            <div className="w-full h-full bg-[#0c0f17] rounded-[10px] flex items-center justify-center">
              <span className="font-extrabold text-brand-400 text-lg tracking-tight">S2D</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white tracking-tight text-base">Snap2Done</span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-brand-500/15 text-brand-400 border border-brand-500/30">AI</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Capture anything. AI turns it into action.</p>
          </div>
        </div>

        {/* Center / Local AI Status & Privacy */}
        <div className="flex items-center gap-2">
          {/* AI Status Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700/60 text-xs">
            {aiStatus.state === 'preparing' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-amber-300 font-medium text-[11px]">Preparing on-device AI...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                <span className="text-slate-200 font-medium text-[11px] flex items-center gap-1">
                  <span className="text-brand-400 font-semibold">AI processed locally</span>
                  <span className="text-slate-400 text-[9px] hidden md:inline">• 100% offline</span>
                </span>
              </>
            )}
          </div>

          {/* Online / Offline status */}
          <div className="hidden sm:flex items-center">
            {isOnline ? (
              <span className="flex items-center gap-1 text-[11px] text-slate-400 px-2 py-0.5" title="Connected to network">
                <Wifi className="w-3 h-3 text-slate-400" />
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30" title="Offline Mode - Data safely stored in IndexedDB">
                <WifiOff className="w-3 h-3" />
                <span>Offline</span>
              </span>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Desk Bridge Indicator Button */}
          <button
            onClick={onOpenBridge}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              bridgeState.status === 'connected'
                ? 'bg-brand-500/15 text-brand-300 border border-brand-500/40 hover:bg-brand-500/25'
                : 'bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-700/80'
            }`}
            title="Phone ↔ Laptop Desk Bridge"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                bridgeState.status === 'connected'
                  ? 'bg-brand-400 shadow-sm shadow-brand-400 animate-pulse'
                  : 'bg-slate-500'
              }`}
            />
            <span className="hidden md:inline">Desk Bridge</span>
            {bridgeState.status === 'connected' ? (
              <span className="text-[10px] text-brand-400">🟢</span>
            ) : null}
          </button>

          {/* Desktop / Phone Layout Toggle (for previewing phone-first vs laptop workspace) */}
          <button
            onClick={onToggleDesktopWorkspace}
            className={`p-1.5 rounded-lg border text-xs transition-colors hidden sm:flex items-center gap-1 ${
              isDesktopWorkspace
                ? 'bg-brand-500/20 border-brand-500/40 text-brand-400'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={isDesktopWorkspace ? "Switch to Phone Frame View" : "Switch to Laptop Workspace View"}
          >
            {isDesktopWorkspace ? (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-[11px]">Phone View</span>
              </>
            ) : (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span className="text-[11px]">Desk View</span>
              </>
            )}
          </button>

          {/* Interactive Demo Mode Button */}
          <button
            onClick={onOpenDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold shadow-sm transition-all"
          >
            <PlayCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
