import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Filter, Trash2, Edit2, CheckCircle2, Circle, Clock, Flame, Calendar, Tag, ShieldCheck, Zap } from 'lucide-react';
import { Task, TaskPriority, TaskCategory, TaskSource } from '../../types';
import { deviceService } from '../../services/device/deviceService';

interface TasksViewProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onSaveTask: (task: Task) => void;
  onStartFocus: (task: Task) => void;
  onOpenCapture: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onToggleComplete,
  onDeleteTask,
  onSaveTask,
  onStartFocus,
  onOpenCapture
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);

  // Filter options as per requirements: All, Today, High, Medium, Low, Completed, Overdue, Camera, Voice, Text
  const filterTabs = [
    'All',
    'Today',
    'High',
    'Medium',
    'Low',
    'Completed',
    'Overdue',
    'Camera',
    'Voice',
    'Text'
  ];

  const filteredTasks = useMemo(() => {
    const now = new Date();
    return tasks.filter(task => {
      // Search
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Filter tabs
      switch (activeFilter) {
        case 'Today': {
          if (!task.deadline) return false;
          const d = new Date(task.deadline);
          return d.toDateString() === now.toDateString();
        }
        case 'High':
          return task.priority === 'high';
        case 'Medium':
          return task.priority === 'medium';
        case 'Low':
          return task.priority === 'low';
        case 'Completed':
          return task.status === 'completed';
        case 'Overdue': {
          if (!task.deadline || task.status === 'completed') return false;
          return new Date(task.deadline).getTime() < now.getTime();
        }
        case 'Camera':
          return task.source === 'camera';
        case 'Voice':
          return task.source === 'voice';
        case 'Text':
          return task.source === 'text';
        default:
          return true;
      }
    });
  }, [tasks, searchQuery, activeFilter]);

  // Handle Edit Save
  const handleSaveEditedTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      onSaveTask(editingTask);
      deviceService.vibrate(30);
      setEditingTask(null);
    }
  };

  // Handle New Task Form
  const handleCreateManualTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      onSaveTask({
        ...editingTask,
        id: `task_manual_${Date.now()}`,
        createdAt: new Date().toISOString(),
        source: 'manual',
        status: 'pending',
        priorityReason: `${editingTask.priority.toUpperCase()} priority manually specified.`
      });
      deviceService.vibrate(40);
      setIsCreatingNew(false);
      setEditingTask(null);
    }
  };

  return (
    <div className="space-y-5 pb-24 md:pb-8">
      {/* Header & New Task Button */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Task Management</h1>
          <p className="text-xs text-slate-400">
            {tasks.length} total tasks • Organized with on-device NLP
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingTask({
                id: '',
                title: '',
                description: '',
                deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                deadlineDisplay: 'Tomorrow 5:00 PM',
                priority: 'medium',
                priorityReason: 'Medium priority task.',
                category: 'Work',
                estimatedDuration: 45,
                source: 'manual',
                createdAt: new Date().toISOString(),
                status: 'pending'
              });
              setIsCreatingNew(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Task</span>
          </button>

          <button
            onClick={onOpenCapture}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-emerald-400 text-black text-xs font-bold shadow-md shadow-brand-500/20 hover:opacity-95 transition-all"
          >
            <span>Scan / AI</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks, descriptions, or categories..."
          className="w-full bg-surface-card border border-surface-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter Tabs (Horizontal Scrollable on mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-xs">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
              activeFilter === tab
                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40 shadow-sm'
                : 'bg-surface-card/60 text-slate-400 hover:text-slate-200 border border-surface-border'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Task Cards List */}
      <div className="space-y-2.5">
        <AnimatePresence>
          {filteredTasks.length === 0 ? (
            <div className="p-8 rounded-2xl bg-surface-card border border-surface-border text-center space-y-2">
              <p className="text-sm font-semibold text-slate-300">No tasks found</p>
              <p className="text-xs text-slate-400">
                {searchQuery ? 'Try adjusting your search criteria.' : 'Capture tasks using camera, voice, or text.'}
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isDone = task.status === 'completed';
              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-4 rounded-2xl border transition-all ${
                    isDone
                      ? 'bg-slate-900/40 border-slate-800/80 opacity-70'
                      : 'bg-surface-card border-surface-border hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Checkbox & Details */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => onToggleComplete(task.id)}
                        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          isDone
                            ? 'bg-brand-500/20 border-brand-500 text-brand-400'
                            : 'border-slate-600 hover:border-brand-500'
                        }`}
                        title={isDone ? 'Mark Pending' : 'Mark Completed'}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4 text-brand-400" /> : null}
                      </button>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`text-sm font-bold ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                            {task.title}
                          </h3>

                          {/* Priority Badge */}
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              task.priority === 'high'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : task.priority === 'medium'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {task.priority === 'high' ? '🔥 HIGH' : task.priority === 'medium' ? '🟡 MEDIUM' : '🟢 LOW'}
                          </span>

                          {/* Category Tag */}
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {task.category}
                          </span>

                          {/* Source Indicator */}
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                            {task.source === 'camera' ? '📷 OCR' : task.source === 'voice' ? '🎤 Voice' : task.source === 'text' ? '⌨️ Text' : '✍️ Manual'}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-400 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Smart Priority Reasoning */}
                        <div className="pt-1">
                          <p className="text-[11px] text-amber-300/80 font-medium">
                            💡 {task.priorityReason}
                          </p>
                        </div>

                        {/* Metadata row: Deadline + Duration */}
                        <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                          {task.deadline && (
                            <span className="flex items-center gap-1 text-slate-300">
                              <Calendar className="w-3 h-3 text-brand-400" />
                              <span>{task.deadlineDisplay || new Date(task.deadline).toLocaleDateString()}</span>
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{task.estimatedDuration} mins</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: Focus, Edit, Delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      {!isDone && (
                        <button
                          onClick={() => onStartFocus(task)}
                          className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 border border-indigo-500/30 transition-colors"
                          title="Start Focus Mode on this task"
                        >
                          <Zap className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setEditingTask({ ...task });
                          setIsCreatingNew(false);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
                        title="Edit task"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete "${task.title}"?`)) {
                            onDeleteTask(task.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-500/20 border border-slate-700 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Edit / Create Task Modal */}
      {(editingTask !== null || isCreatingNew) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0f1422] border border-surface-border rounded-2xl shadow-2xl p-5 space-y-4">
            <h2 className="text-base font-bold text-white">
              {isCreatingNew ? 'Create New Task' : 'Edit Task Details'}
            </h2>

            <form onSubmit={isCreatingNew ? handleCreateManualTask : handleSaveEditedTask} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingTask?.title || ''}
                  onChange={(e) => setEditingTask(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingTask?.description || ''}
                  onChange={(e) => setEditingTask(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Priority</label>
                  <select
                    value={editingTask?.priority || 'medium'}
                    onChange={(e) => setEditingTask(prev => prev ? { ...prev, priority: e.target.value as TaskPriority } : null)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="high">🔥 HIGH</option>
                    <option value="medium">🟡 MEDIUM</option>
                    <option value="low">🟢 LOW</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={editingTask?.category || 'Work'}
                    onChange={(e) => setEditingTask(prev => prev ? { ...prev, category: e.target.value as TaskCategory } : null)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Study">Study</option>
                    <option value="Work">Work</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Personal">Personal</option>
                    <option value="Health">Health</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Est. Duration (mins)</label>
                  <input
                    type="number"
                    min={5}
                    max={480}
                    value={editingTask?.estimatedDuration || 30}
                    onChange={(e) => setEditingTask(prev => prev ? { ...prev, estimatedDuration: parseInt(e.target.value, 10) || 30 } : null)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Deadline Display</label>
                  <input
                    type="text"
                    value={editingTask?.deadlineDisplay || ''}
                    placeholder="e.g. Tomorrow 5 PM"
                    onChange={(e) => setEditingTask(prev => prev ? { ...prev, deadlineDisplay: e.target.value } : null)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setEditingTask(null); setIsCreatingNew(false); }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-500 text-black text-xs font-bold hover:bg-brand-400"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
