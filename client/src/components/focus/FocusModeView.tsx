import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, CheckCircle, ArrowLeft, Shield, Sparkles, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, FocusSession } from '../../types';
import { deviceService } from '../../services/device/deviceService';
import { officeKitService } from '../../services/officeKit/officeKitService';

interface FocusModeViewProps {
  currentTask: Task | null;
  onExitFocus: () => void;
  onTaskCompleted: (taskId: string) => void;
  onSaveSession: (session: FocusSession) => void;
}

export const FocusModeView: React.FC<FocusModeViewProps> = ({
  currentTask,
  onExitFocus,
  onTaskCompleted,
  onSaveSession
}) => {
  const TOTAL_SECONDS = 25 * 60; // 25:00 Pomodoro
  const [secondsRemaining, setSecondsRemaining] = useState<number>(TOTAL_SECONDS);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [sessionStartTime] = useState<string>(new Date().toISOString());
  const timerRef = useRef<any>(null);

  useEffect(() => {
    // Acquire screen wake lock to keep screen on during deep work
    deviceService.requestWakeLock();
    officeKitService.syncFocusMode(true, currentTask?.title);

    return () => {
      deviceService.releaseWakeLock();
      officeKitService.syncFocusMode(false);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentTask]);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            handleSessionCompleted();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const toggleTimer = () => {
    setIsActive(!isActive);
    deviceService.vibrate(40);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsRemaining(TOTAL_SECONDS);
    deviceService.vibrate(30);
  };

  const handleSessionCompleted = () => {
    setIsActive(false);
    deviceService.vibrate([100, 50, 100, 50, 200]);

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    if (currentTask) {
      onTaskCompleted(currentTask.id);
    }

    onSaveSession({
      id: `focus_${Date.now()}`,
      taskId: currentTask?.id,
      taskTitle: currentTask?.title || 'Deep Work Session',
      durationMinutes: Math.round((TOTAL_SECONDS - secondsRemaining) / 60) || 25,
      startedAt: sessionStartTime,
      completedAt: new Date().toISOString(),
      completed: true
    });
  };

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPct = ((TOTAL_SECONDS - secondsRemaining) / TOTAL_SECONDS) * 100;

  return (
    <div className="min-h-[82vh] flex flex-col justify-between py-6 px-4 max-w-lg mx-auto text-center">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onExitFocus}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Focus</span>
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          <Shield className="w-3.5 h-3.5 text-indigo-400" />
          <span>Distraction-Free Mode</span>
        </div>
      </div>

      {/* Center Pomodoro Dial & Task */}
      <div className="space-y-8 my-auto py-8">
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Current Focus Task</span>
          <h1 className="text-2xl font-black text-white px-4">
            {currentTask ? currentTask.title : 'Deep Productivity Session'}
          </h1>
          {currentTask?.priorityReason && (
            <p className="text-xs text-amber-300/80 max-w-sm mx-auto">
              💡 {currentTask.priorityReason}
            </p>
          )}
        </div>

        {/* Circular Countdown Presentation */}
        <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
          {/* Subtle Glow Ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-500/20 via-indigo-500/20 to-purple-500/20 blur-xl animate-pulse" />

          {/* SVG Progress Circle */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-slate-800 fill-none"
              strokeWidth="6"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-brand-400 fill-none transition-all duration-1000 ease-linear"
              strokeWidth="6"
              strokeDasharray="276.46"
              strokeDashoffset={276.46 - (276.46 * progressPct) / 100}
              strokeLinecap="round"
            />
          </svg>

          {/* Center Digital Display */}
          <div className="absolute flex flex-col items-center justify-center space-y-1">
            <span className="font-mono text-5xl font-black text-white tracking-tight">
              {formatTimer(secondsRemaining)}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {isActive ? 'Deep Work Active' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={resetTimer}
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Reset to 25:00"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTimer}
            className={`px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl flex items-center gap-2 transition-all active:scale-95 ${
              isActive
                ? 'bg-amber-500 text-black shadow-amber-500/30 hover:bg-amber-400'
                : 'bg-gradient-to-r from-brand-500 to-emerald-400 text-black shadow-brand-500/30 hover:opacity-95'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Start</span>
              </>
            )}
          </button>

          <button
            onClick={handleSessionCompleted}
            className="p-3.5 rounded-2xl bg-brand-500/15 border border-brand-500/30 text-brand-400 hover:bg-brand-500/25 transition-colors"
            title="Complete task now"
          >
            <CheckCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Screen & Hardware Integration Note */}
      <div className="text-[11px] text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-brand-400" />
        <span>Screen Wake-Lock engaged • Desk workspace in sync</span>
      </div>
    </div>
  );
};
