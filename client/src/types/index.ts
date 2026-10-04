export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'overdue';
export type TaskCategory = 'Work' | 'Study' | 'Personal' | 'Urgent' | 'Health' | 'Admin';
export type TaskSource = 'camera' | 'voice' | 'text' | 'manual';

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string | null; // ISO string
  deadlineDisplay?: string; // Human friendly e.g. "Tomorrow 10:00 AM"
  priority: TaskPriority;
  priorityReason: string;
  category: TaskCategory;
  estimatedDuration: number; // in minutes
  source: TaskSource;
  createdAt: string;
  completedAt?: string | null;
  status: TaskStatus;
  sourceDetails?: {
    rawTextSnippet?: string;
    mediaUrl?: string;
    confidence?: number;
  };
  synced?: boolean;
}

export interface CaptureRecord {
  id: string;
  type: 'camera' | 'voice' | 'text';
  extractedText: string;
  mediaPreview?: string;
  taskIds: string[];
  createdAt: string;
  tasksCount: number;
}

export interface PlanBlock {
  id: string;
  time: string; // e.g. "09:00"
  durationMinutes: number;
  taskId?: string;
  title: string;
  category: TaskCategory | 'Break' | 'Review';
  type: 'task' | 'break' | 'review';
  completed: boolean;
}

export interface DailyPlan {
  id: string;
  date: string; // YYYY-MM-DD
  blocks: PlanBlock[];
  generatedAt: string;
  status: 'draft' | 'accepted';
}

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle: string;
  durationMinutes: number;
  startedAt: string;
  completedAt: string;
  completed: boolean;
}

export interface AIInsights {
  deadlinesThisWeek: number;
  busiestDay: string;
  completedThisWeek: number;
  atRiskCount: number;
  totalPlannedMinutes: number;
  productivityScore: number;
  insightBullets: string[];
}

export interface DeskBridgeState {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  role: 'phone' | 'laptop';
  roomCode: string | null;
  roomId: string | null;
  peerDeviceName: string | null;
  lastSyncedAt: string | null;
}
