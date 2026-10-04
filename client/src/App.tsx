import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  initializeDatabase,
  getAllTasks,
  getAllCaptures,
  saveTask,
  saveMultipleTasks,
  deleteTask,
  toggleTaskComplete,
  saveCapture,
  getDailyPlan,
  saveDailyPlan,
  saveFocusSession,
  resetDemoData
} from './services/db';
import { Task, CaptureRecord, DailyPlan, PlanBlock, FocusSession } from './types';
import { generateDailyPlan } from './services/ai/plannerEngine';
import { calculateAIInsights } from './services/ai/insightsService';
import { deskBridgeService } from './services/bridge/deskBridgeService';
import { officeKitService } from './services/officeKit/officeKitService';
import { Header } from './components/common/Header';
import { BottomNav, NavTab } from './components/common/BottomNav';
import { DesktopSidebar } from './components/common/DesktopSidebar';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardView } from './components/dashboard/DashboardView';
import { TasksView } from './components/tasks/TasksView';
import { DailyPlanView } from './components/plan/DailyPlanView';
import { FocusModeView } from './components/focus/FocusModeView';
import { DeskBridgeView } from './components/bridge/DeskBridgeView';
import { CapturesHistoryView } from './components/captures/CapturesHistoryView';
import { CaptureModal } from './components/capture/CaptureModal';
import { DemoTourModal, DEMO_STEPS } from './components/demo/DemoTourModal';

export const App: React.FC = () => {
  // App views & navigation
  const [showLanding, setShowLanding] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isDesktopWorkspace, setIsDesktopWorkspace] = useState<boolean>(false);

  // Core Data
  const [tasks, setTasks] = useState<Task[]>([]);
  const [captures, setCaptures] = useState<CaptureRecord[]>([]);
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);

  // Focus Mode
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [currentFocusTask, setCurrentFocusTask] = useState<Task | null>(null);

  // Modals
  const [isCaptureOpen, setIsCaptureOpen] = useState<boolean>(false);
  const [captureInitialMode, setCaptureInitialMode] = useState<'camera' | 'voice' | 'text'>('camera');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);

  // Initialize DB and Load Data
  useEffect(() => {
    async function loadData() {
      await initializeDatabase();
      const loadedTasks = await getAllTasks();
      const loadedCaptures = await getAllCaptures();
      setTasks(loadedTasks);
      setCaptures(loadedCaptures);

      const todayStr = new Date().toISOString().split('T')[0];
      let plan = await getDailyPlan(todayStr);
      if (!plan) {
        plan = generateDailyPlan(loadedTasks, todayStr);
        await saveDailyPlan(plan);
      }
      setDailyPlan(plan);
    }
    loadData();

    // Subscribe to Desk Bridge remote sync events
    const unsubBridge = deskBridgeService.subscribe((event) => {
      if (event.type === 'task_created' && event.data) {
        setTasks(prev => {
          if (prev.some(t => t.id === event.data.id)) return prev;
          const next = [event.data, ...prev];
          saveTask(event.data);
          return next;
        });
      } else if (event.type === 'task_updated' && event.data) {
        setTasks(prev => {
          const idx = prev.findIndex(t => t.id === event.data.id);
          const next = idx !== -1 ? prev.map(t => t.id === event.data.id ? event.data : t) : [event.data, ...prev];
          saveTask(event.data);
          return next;
        });
      } else if (event.type === 'task_deleted' && event.data) {
        setTasks(prev => prev.filter(t => t.id !== event.data));
        deleteTask(event.data);
      }
    });

    return () => unsubBridge();
  }, []);

  // Recalculate AI insights dynamically
  const insights = calculateAIInsights(tasks);

  // Task Handlers
  const handleToggleTaskComplete = async (taskId: string) => {
    const updated = await toggleTaskComplete(taskId);
    if (updated) {
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      officeKitService.broadcastTaskUpdate(updated);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    deskBridgeService.syncTaskDeleted(taskId);
  };

  const handleSaveTask = async (task: Task) => {
    await saveTask(task);
    setTasks(prev => {
      const idx = prev.findIndex(t => t.id === task.id);
      if (idx !== -1) {
        return prev.map(t => t.id === task.id ? task : t);
      }
      return [task, ...prev];
    });
    officeKitService.broadcastTaskUpdate(task);
  };

  const handleTasksSavedFromCapture = async (
    newTasks: Task[],
    rawText: string,
    type: 'camera' | 'voice' | 'text'
  ) => {
    await saveMultipleTasks(newTasks);
    setTasks(prev => [...newTasks, ...prev]);

    // Save Capture record
    const capRecord: CaptureRecord = {
      id: `cap_${Date.now()}`,
      type,
      extractedText: rawText,
      taskIds: newTasks.map(t => t.id),
      createdAt: new Date().toISOString(),
      tasksCount: newTasks.length
    };
    await saveCapture(capRecord);
    setCaptures(prev => [capRecord, ...prev]);

    // Automatically regenerate daily plan to accommodate new tasks
    const updatedPlan = generateDailyPlan([...newTasks, ...tasks]);
    setDailyPlan(updatedPlan);
    await saveDailyPlan(updatedPlan);

    // Broadcast each to Desk Bridge
    newTasks.forEach(t => officeKitService.broadcastNewTask(t));

    setActiveTab('tasks');
  };

  const handleTasksSyncedFromPeer = async (syncedTasks: Task[]) => {
    await saveMultipleTasks(syncedTasks);
    setTasks(syncedTasks);
  };

  // Plan Handlers
  const handleRegeneratePlan = async () => {
    const newPlan = generateDailyPlan(tasks);
    setDailyPlan(newPlan);
    await saveDailyPlan(newPlan);
  };

  const handleAcceptPlan = async () => {
    if (dailyPlan) {
      const accepted: DailyPlan = { ...dailyPlan, status: 'accepted' };
      setDailyPlan(accepted);
      await saveDailyPlan(accepted);
    }
  };

  const handleUpdatePlanBlock = async (blockId: string, updated: Partial<PlanBlock>) => {
    if (!dailyPlan) return;
    const newBlocks = dailyPlan.blocks.map(b => b.id === blockId ? { ...b, ...updated } : b);
    const updatedPlan: DailyPlan = { ...dailyPlan, blocks: newBlocks };
    setDailyPlan(updatedPlan);
    await saveDailyPlan(updatedPlan);
  };

  // Focus Mode Handlers
  const handleStartFocus = (task?: Task) => {
    setCurrentFocusTask(task || (tasks.find(t => t.status !== 'completed') || null));
    setIsFocusMode(true);
  };

  const handleExitFocus = () => {
    setIsFocusMode(false);
    setCurrentFocusTask(null);
  };

  const handleFocusTaskCompleted = async (taskId: string) => {
    await handleToggleTaskComplete(taskId);
  };

  const handleSaveFocusSession = async (session: FocusSession) => {
    await saveFocusSession(session);
  };

  // Demo Walkthrough Step Execution
  const handleExecuteDemoStep = async (stepIndex: number) => {
    const step = DEMO_STEPS[stepIndex];
    if (step.tab) {
      setActiveTab(step.tab as NavTab);
    }

    if (step.actionType === 'open_scan') {
      setCaptureInitialMode('camera');
      setIsCaptureOpen(true);
    } else if (step.actionType === 'launch_focus') {
      handleStartFocus(tasks[0]);
    } else if (step.actionType === 'complete_focus') {
      if (tasks[0]) handleToggleTaskComplete(tasks[0].id);
      setActiveTab('tasks');
    } else if (step.actionType === 'trigger_sync') {
      deskBridgeService.syncAllTasks(tasks);
      setActiveTab('bridge');
    }
  };

  const handleResetData = async () => {
    await resetDemoData();
    const freshTasks = await getAllTasks();
    const freshCaptures = await getAllCaptures();
    setTasks(freshTasks);
    setCaptures(freshCaptures);
    const freshPlan = generateDailyPlan(freshTasks);
    setDailyPlan(freshPlan);
  };

  const pendingCount = tasks.filter(t => t.status !== 'completed').length;

  return (
    <div className="min-h-screen bg-[#0c0f17] text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        onOpenDemo={() => setIsDemoModalOpen(true)}
        onOpenBridge={() => setActiveTab('bridge')}
        isDesktopWorkspace={isDesktopWorkspace}
        onToggleDesktopWorkspace={() => setIsDesktopWorkspace(!isDesktopWorkspace)}
        onStartFocus={() => handleStartFocus()}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex w-full">
        {/* Desktop Workspace Sidebar */}
        <DesktopSidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setShowLanding(false);
          }}
          onOpenCapture={() => {
            setCaptureInitialMode('camera');
            setIsCaptureOpen(true);
          }}
          onStartFocus={() => handleStartFocus()}
          pendingTasksCount={pendingCount}
        />

        {/* Content Container */}
        <main className={`flex-1 overflow-y-auto px-4 sm:px-6 py-6 transition-all ${
          !isDesktopWorkspace ? 'max-w-md mx-auto w-full' : 'max-w-5xl mx-auto w-full'
        }`}>
          {/* FOCUS MODE OVERLAY */}
          {isFocusMode ? (
            <FocusModeView
              currentTask={currentFocusTask}
              onExitFocus={handleExitFocus}
              onTaskCompleted={handleFocusTaskCompleted}
              onSaveSession={handleSaveFocusSession}
            />
          ) : showLanding ? (
            <LandingPage
              onStartCapturing={() => {
                setShowLanding(false);
                setCaptureInitialMode('camera');
                setIsCaptureOpen(true);
              }}
              onViewPlan={() => {
                setShowLanding(false);
                setActiveTab('plan');
              }}
              onExploreDemo={() => {
                setShowLanding(false);
                setIsDemoModalOpen(true);
              }}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  tasks={tasks}
                  captures={captures}
                  dailyPlan={dailyPlan}
                  insights={insights}
                  onOpenScan={() => { setCaptureInitialMode('camera'); setIsCaptureOpen(true); }}
                  onOpenVoice={() => { setCaptureInitialMode('voice'); setIsCaptureOpen(true); }}
                  onOpenText={() => { setCaptureInitialMode('text'); setIsCaptureOpen(true); }}
                  onSelectTab={(tab) => setActiveTab(tab)}
                  onToggleTaskComplete={handleToggleTaskComplete}
                  onStartFocusOnTask={(task) => handleStartFocus(task)}
                />
              )}

              {activeTab === 'tasks' && (
                <TasksView
                  tasks={tasks}
                  onToggleComplete={handleToggleTaskComplete}
                  onDeleteTask={handleDeleteTask}
                  onSaveTask={handleSaveTask}
                  onStartFocus={(task) => handleStartFocus(task)}
                  onOpenCapture={() => { setCaptureInitialMode('camera'); setIsCaptureOpen(true); }}
                />
              )}

              {activeTab === 'plan' && (
                <DailyPlanView
                  plan={dailyPlan}
                  tasks={tasks}
                  onRegeneratePlan={handleRegeneratePlan}
                  onAcceptPlan={handleAcceptPlan}
                  onUpdatePlanBlock={handleUpdatePlanBlock}
                  onStartFocusOnTask={(task) => handleStartFocus(task)}
                />
              )}

              {activeTab === 'bridge' && (
                <DeskBridgeView
                  tasks={tasks}
                  onTasksSyncedFromPeer={handleTasksSyncedFromPeer}
                />
              )}

              {activeTab === 'captures' && (
                <CapturesHistoryView
                  captures={captures}
                  tasks={tasks}
                  onOpenCapture={() => { setCaptureInitialMode('camera'); setIsCaptureOpen(true); }}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Phone-First Bottom Navigation Bar */}
      {!isFocusMode && !showLanding && (
        <BottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          onOpenCaptureModal={() => {
            setCaptureInitialMode('camera');
            setIsCaptureOpen(true);
          }}
          pendingTasksCount={pendingCount}
        />
      )}

      {/* Capture Modal (Camera / Voice / Text) */}
      <CaptureModal
        isOpen={isCaptureOpen}
        initialMode={captureInitialMode}
        onClose={() => setIsCaptureOpen(false)}
        onTasksSaved={handleTasksSavedFromCapture}
      />

      {/* 15-Step Grand Finale Demo Modal */}
      <DemoTourModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onResetDemoData={handleResetData}
        onExecuteDemoStep={handleExecuteDemoStep}
      />
    </div>
  );
};

export default App;
