import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Task, CaptureRecord, DailyPlan, FocusSession } from '../types';

interface Snap2DoneDB extends DBSchema {
  tasks: {
    key: string;
    value: Task;
    indexes: { 'by-status': string; 'by-priority': string; 'by-created': string };
  };
  captures: {
    key: string;
    value: CaptureRecord;
    indexes: { 'by-date': string };
  };
  plans: {
    key: string;
    value: DailyPlan;
  };
  focusSessions: {
    key: string;
    value: FocusSession;
    indexes: { 'by-date': string };
  };
  settings: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'snap2done_ai_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<Snap2DoneDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<Snap2DoneDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Tasks store
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
          taskStore.createIndex('by-status', 'status');
          taskStore.createIndex('by-priority', 'priority');
          taskStore.createIndex('by-created', 'createdAt');
        }
        // Captures store
        if (!db.objectStoreNames.contains('captures')) {
          const captureStore = db.createObjectStore('captures', { keyPath: 'id' });
          captureStore.createIndex('by-date', 'createdAt');
        }
        // Plans store
        if (!db.objectStoreNames.contains('plans')) {
          db.createObjectStore('plans', { keyPath: 'id' });
        }
        // Focus sessions store
        if (!db.objectStoreNames.contains('focusSessions')) {
          const focusStore = db.createObjectStore('focusSessions', { keyPath: 'id' });
          focusStore.createIndex('by-date', 'completedAt');
        }
        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      },
    });
  }
  return dbPromise;
}

// ----------------- SAMPLE DEMO DATA -----------------
export const INITIAL_DEMO_TASKS: Task[] = [
  {
    id: 'demo_task_1',
    title: 'DBMS Assignment',
    description: 'Submit ER diagrams, schema normalization (3NF/BCNF) and query execution plans',
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    deadlineDisplay: 'Tomorrow 10:00 AM',
    priority: 'high',
    priorityReason: 'High priority because the deadline is tomorrow (24h left) and effort is 90 mins.',
    category: 'Study',
    estimatedDuration: 90,
    source: 'camera',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'pending',
    sourceDetails: {
      rawTextSnippet: 'DBMS assignment due Monday. ER diagram & normalization.',
      confidence: 0.94
    },
    synced: true
  },
  {
    id: 'demo_task_2',
    title: 'Hackathon Presentation',
    description: 'Prepare 3-minute pitch deck, demo walk-through, and live phone-to-desk bridge demo',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Wednesday
    deadlineDisplay: 'Wednesday 2:00 PM',
    priority: 'medium',
    priorityReason: 'Medium priority because presentation is in 3 days; requires rehearsal.',
    category: 'Work',
    estimatedDuration: 60,
    source: 'voice',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    status: 'pending',
    sourceDetails: {
      rawTextSnippet: 'Prepare presentation for Wednesday 2 PM with live demo.',
      confidence: 0.98
    },
    synced: true
  },
  {
    id: 'demo_task_3',
    title: 'Lab Record Submission',
    description: 'Compile SQL experiment outputs, verify table constraints, and get digital signoff',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // Friday
    deadlineDisplay: 'Friday 4:00 PM',
    priority: 'medium',
    priorityReason: 'Medium priority because deadline is Friday; can be scheduled mid-week.',
    category: 'Study',
    estimatedDuration: 45,
    source: 'camera',
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    status: 'pending',
    sourceDetails: {
      rawTextSnippet: 'Lab record Friday with verified outputs.',
      confidence: 0.91
    },
    synced: true
  },
  {
    id: 'demo_task_4',
    title: 'Resume & Portfolio Update',
    description: 'Add Snap2Done AI project highlights, technical stack, and architecture metrics',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
    deadlineDisplay: 'Next Monday 5:00 PM',
    priority: 'low',
    priorityReason: 'Low priority because due next week with no blocking dependencies.',
    category: 'Personal',
    estimatedDuration: 30,
    source: 'text',
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    status: 'pending',
    sourceDetails: {
      rawTextSnippet: 'Update resume with Snap2Done project highlights next week.',
      confidence: 0.99
    },
    synced: true
  }
];

export const INITIAL_DEMO_CAPTURES: CaptureRecord[] = [
  {
    id: 'demo_cap_1',
    type: 'camera',
    extractedText: 'DBMS assignment due Monday.\nPresentation Wednesday.\nLab record Friday.',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    taskIds: ['demo_task_1', 'demo_task_3'],
    tasksCount: 2
  },
  {
    id: 'demo_cap_2',
    type: 'voice',
    extractedText: 'I need to finish my DBMS assignment tomorrow at 10 AM and prepare hackathon presentation for Wednesday.',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    taskIds: ['demo_task_2'],
    tasksCount: 1
  }
];

// Initialize DB with seed if empty
export async function initializeDatabase(): Promise<void> {
  const db = await getDB();
  const count = await db.count('tasks');
  if (count === 0) {
    const tx = db.transaction(['tasks', 'captures'], 'readwrite');
    for (const task of INITIAL_DEMO_TASKS) {
      await tx.objectStore('tasks').put(task);
    }
    for (const cap of INITIAL_DEMO_CAPTURES) {
      await tx.objectStore('captures').put(cap);
    }
    await tx.done;
  }
}

// ----------------- TASK OPERATIONS -----------------
export async function getAllTasks(): Promise<Task[]> {
  const db = await getDB();
  return await db.getAll('tasks');
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  const db = await getDB();
  return await db.get('tasks', id);
}

export async function saveTask(task: Task): Promise<void> {
  const db = await getDB();
  await db.put('tasks', task);
}

export async function saveMultipleTasks(tasks: Task[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('tasks', 'readwrite');
  for (const task of tasks) {
    await tx.store.put(task);
  }
  await tx.done;
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('tasks', id);
}

export async function toggleTaskComplete(id: string): Promise<Task | null> {
  const db = await getDB();
  const task = await db.get('tasks', id);
  if (!task) return null;

  const isCompleted = task.status === 'completed';
  const updatedTask: Task = {
    ...task,
    status: isCompleted ? 'pending' : 'completed',
    completedAt: isCompleted ? null : new Date().toISOString()
  };

  await db.put('tasks', updatedTask);
  return updatedTask;
}

// ----------------- CAPTURE OPERATIONS -----------------
export async function getAllCaptures(): Promise<CaptureRecord[]> {
  const db = await getDB();
  const captures = await db.getAll('captures');
  return captures.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function saveCapture(capture: CaptureRecord): Promise<void> {
  const db = await getDB();
  await db.put('captures', capture);
}

// ----------------- PLAN OPERATIONS -----------------
export async function getDailyPlan(dateStr: string): Promise<DailyPlan | undefined> {
  const db = await getDB();
  return await db.get('plans', dateStr);
}

export async function saveDailyPlan(plan: DailyPlan): Promise<void> {
  const db = await getDB();
  await db.put('plans', plan);
}

// ----------------- FOCUS SESSIONS -----------------
export async function getFocusSessions(): Promise<FocusSession[]> {
  const db = await getDB();
  return await db.getAll('focusSessions');
}

export async function saveFocusSession(session: FocusSession): Promise<void> {
  const db = await getDB();
  await db.put('focusSessions', session);
}

// Reset Demo Data
export async function resetDemoData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['tasks', 'captures', 'plans', 'focusSessions'], 'readwrite');
  await tx.objectStore('tasks').clear();
  await tx.objectStore('captures').clear();
  await tx.objectStore('plans').clear();
  await tx.objectStore('focusSessions').clear();

  for (const task of INITIAL_DEMO_TASKS) {
    await tx.objectStore('tasks').put(task);
  }
  for (const cap of INITIAL_DEMO_CAPTURES) {
    await tx.objectStore('captures').put(cap);
  }
  await tx.done;
}
