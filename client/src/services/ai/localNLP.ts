import { Task, TaskPriority, TaskCategory, TaskSource } from '../../types';

interface ParsedTaskDraft {
  title: string;
  description: string;
  deadline: string | null;
  deadlineDisplay?: string;
  priority: TaskPriority;
  priorityReason: string;
  category: TaskCategory;
  estimatedDuration: number;
}

// Days helper
const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * Parses raw text from OCR, voice speech, or text input into structured tasks.
 * Uses advanced rule-based deterministic NLP combined with semantic pattern matching.
 */
export function extractTasksFromText(rawText: string, source: TaskSource): Task[] {
  if (!rawText || !rawText.trim()) return [];

  // Normalize lines and split into candidate task segments
  const lines = rawText
    .split(/\r?\n|•|\*|;/)
    .map(l => l.trim())
    .filter(l => l.length > 2);

  // If text is a single paragraph with multiple sentences (e.g. voice transcript)
  const segments: string[] = [];
  for (const line of lines) {
    if (line.includes(' and ') && line.length > 40) {
      // Split on conjunctions like "and then", "and also", "and I need to"
      const sub = line.split(/\band then\b|\band also\b|\band I need to\b|\band prepare\b|\band submit\b/i);
      for (const s of sub) {
        if (s.trim().length > 3) segments.push(s.trim());
      }
    } else {
      segments.push(line);
    }
  }

  // Parse each segment
  const tasks: Task[] = [];
  const now = new Date();

  segments.forEach((segment, idx) => {
    const draft = parseSingleSegment(segment, now);
    if (!draft.title) return;

    tasks.push({
      id: `task_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      title: draft.title,
      description: draft.description,
      deadline: draft.deadline,
      deadlineDisplay: draft.deadlineDisplay,
      priority: draft.priority,
      priorityReason: draft.priorityReason,
      category: draft.category,
      estimatedDuration: draft.estimatedDuration,
      source,
      createdAt: new Date().toISOString(),
      status: 'pending',
      sourceDetails: {
        rawTextSnippet: segment,
        confidence: 0.95
      },
      synced: false
    });
  });

  return tasks;
}

function parseSingleSegment(text: string, refDate: Date): ParsedTaskDraft {
  const clean = text.replace(/^[-•*–\d.)\s]+/, '').trim();
  const lower = clean.toLowerCase();

  // 1. Extract Date / Time / Deadline
  const { deadlineDate, deadlineDisplay, timeWordsFound } = extractDeadline(lower, refDate);

  // 2. Extract Category
  const category = extractCategory(lower);

  // 3. Extract Estimated Duration
  const estimatedDuration = extractEstimatedDuration(lower, category);

  // 4. Calculate Priority and Reason dynamically
  const { priority, priorityReason } = calculateSmartPriority(lower, deadlineDate, estimatedDuration, category, refDate);

  // 5. Clean Title and Description
  let title = clean;
  // Remove trailing due dates from title for cleanliness
  title = title
    .replace(/\b(due|by|before|on|at)\s+(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next week|tonight).*/i, '')
    .replace(/\b(due on|deadline:?|at \d{1,2}(:\d{2})?\s*(am|pm)?).*/i, '')
    .trim();

  // Strip prefixes like "I need to", "Please", "Must", "Have to", "Remember to"
  title = title.replace(/^(i need to|i have to|remember to|please|must|we should|to do:?)\s+/i, '');

  if (title.length < 2) {
    title = clean;
  }

  // Capitalize title
  title = title.charAt(0).toUpperCase() + title.slice(1);

  const description = clean !== title ? `Captured: "${clean}"` : `Extracted via Snap2Done on-device AI.`;

  return {
    title,
    description,
    deadline: deadlineDate ? deadlineDate.toISOString() : null,
    deadlineDisplay,
    priority,
    priorityReason,
    category,
    estimatedDuration
  };
}

function extractDeadline(lower: string, refDate: Date): { deadlineDate: Date | null; deadlineDisplay?: string; timeWordsFound: string[] } {
  const timeWordsFound: string[] = [];
  const target = new Date(refDate);

  // Check for time of day (e.g. 10 AM, 14:00, 2:30 PM, 5pm)
  let hour = 17; // default 5 PM
  let minute = 0;
  const timeMatch = lower.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/);
  if (timeMatch && (timeMatch[3] || lower.includes('at ' + timeMatch[1]))) {
    let h = parseInt(timeMatch[1], 10);
    const m = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const ampm = timeMatch[3];
    if (ampm === 'pm' && h < 12) h += 12;
    if (ampm === 'am' && h === 12) h = 0;
    hour = h;
    minute = m;
    timeWordsFound.push(timeMatch[0]);
  }

  // Specific Day / Relative Date Match
  if (lower.includes('today') || lower.includes('tonight')) {
    timeWordsFound.push('today');
    target.setHours(hour, minute, 0, 0);
    return {
      deadlineDate: target,
      deadlineDisplay: `Today ${formatTimeOnly(target)}`,
      timeWordsFound
    };
  }

  if (lower.includes('tomorrow')) {
    timeWordsFound.push('tomorrow');
    target.setDate(target.getDate() + 1);
    target.setHours(hour, minute, 0, 0);
    return {
      deadlineDate: target,
      deadlineDisplay: `Tomorrow ${formatTimeOnly(target)}`,
      timeWordsFound
    };
  }

  if (lower.includes('next week')) {
    timeWordsFound.push('next week');
    target.setDate(target.getDate() + 7);
    target.setHours(hour, minute, 0, 0);
    return {
      deadlineDate: target,
      deadlineDisplay: `Next Week (${target.toLocaleDateString('en-US', { weekday: 'short' })})`,
      timeWordsFound
    };
  }

  // Check day of week
  for (let i = 0; i < DAYS.length; i++) {
    const day = DAYS[i];
    if (new RegExp(`\\b${day}\\b`).test(lower)) {
      timeWordsFound.push(day);
      const currentDay = target.getDay();
      let diff = i - currentDay;
      if (diff <= 0) diff += 7; // Next occurrence
      target.setDate(target.getDate() + diff);
      target.setHours(hour, minute, 0, 0);
      const dayName = day.charAt(0).toUpperCase() + day.slice(1);
      return {
        deadlineDate: target,
        deadlineDisplay: `${dayName} ${formatTimeOnly(target)}`,
        timeWordsFound
      };
    }
  }

  // Default: if mentions "due" or "deadline" without explicit date, set to 2 days ahead
  if (lower.includes('due') || lower.includes('deadline') || lower.includes('before') || lower.includes('by')) {
    target.setDate(target.getDate() + 2);
    target.setHours(17, 0, 0, 0);
    return {
      deadlineDate: target,
      deadlineDisplay: `In 2 days (5:00 PM)`,
      timeWordsFound
    };
  }

  return { deadlineDate: null, timeWordsFound };
}

function extractCategory(lower: string): TaskCategory {
  if (/\b(assignment|lab|record|syllabus|exam|test|lecture|study|quiz|semester|math|dbms|compiler|professor)\b/.test(lower)) {
    return 'Study';
  }
  if (/\b(urgent|asap|critical|emergency|immediately)\b/.test(lower)) {
    return 'Urgent';
  }
  if (/\b(gym|workout|doctor|medicine|health|dentist|water|sleep|walk)\b/.test(lower)) {
    return 'Health';
  }
  if (/\b(presentation|pitch|meeting|client|report|deploy|release|code|project|hackathon|resume|interview|office)\b/.test(lower)) {
    return 'Work';
  }
  if (/\b(bill|tax|recharge|license|bank|subscription|passport|rent)\b/.test(lower)) {
    return 'Admin';
  }
  return 'Personal';
}

function extractEstimatedDuration(lower: string, category: TaskCategory): number {
  // Explicit duration regex: e.g. "90 mins", "2 hours", "45 min"
  const hrMatch = lower.match(/(\d+)\s*(hour|hr|hrs)/);
  if (hrMatch) return parseInt(hrMatch[1], 10) * 60;

  const minMatch = lower.match(/(\d+)\s*(min|mins|minutes)/);
  if (minMatch) return parseInt(minMatch[1], 10);

  // Heuristics based on activity
  if (/\b(assignment|project|report|presentation|deck|code|study)\b/.test(lower)) return 90;
  if (/\b(lab record|experiment|review|draft|organize)\b/.test(lower)) return 45;
  if (/\b(email|call|text|check|pay|verify|sign)\b/.test(lower)) return 20;
  if (category === 'Study') return 60;
  if (category === 'Work') return 45;
  return 30;
}

function calculateSmartPriority(
  lower: string,
  deadline: Date | null,
  durationMinutes: number,
  category: TaskCategory,
  now: Date
): { priority: TaskPriority; priorityReason: string } {
  // Urgent keywords
  if (/\b(urgent|asap|critical|emergency|immediately|high priority)\b/.test(lower) || category === 'Urgent') {
    return {
      priority: 'high',
      priorityReason: 'High priority because explicit urgency markers ("ASAP/Urgent") were detected.'
    };
  }

  if (deadline) {
    const diffMs = deadline.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours <= 0) {
      return {
        priority: 'high',
        priorityReason: 'High priority because this task is already overdue or due right now.'
      };
    }
    if (diffHours <= 28) {
      return {
        priority: 'high',
        priorityReason: `High priority because the deadline is tomorrow (${Math.round(diffHours)}h left) with ${durationMinutes}m estimated effort.`
      };
    }
    if (diffHours <= 72) {
      if (durationMinutes >= 60 || category === 'Work' || category === 'Study') {
        return {
          priority: 'high',
          priorityReason: `High priority because due in <3 days and requires significant focus (${durationMinutes}m).`
        };
      }
      return {
        priority: 'medium',
        priorityReason: `Medium priority because deadline is within 3 days (${Math.round(diffHours / 24)} days left).`
      };
    }
    if (diffHours <= 144) {
      return {
        priority: 'medium',
        priorityReason: `Medium priority because deadline is later this week (${Math.round(diffHours / 24)} days away).`
      };
    }
    return {
      priority: 'low',
      priorityReason: `Low priority because deadline is over a week away (${Math.round(diffHours / 24)} days).`
    };
  }

  // Without deadline, prioritize based on duration and category
  if (durationMinutes > 60 || category === 'Study' || category === 'Work') {
    return {
      priority: 'medium',
      priorityReason: `Medium priority based on estimated effort (${durationMinutes}m) and ${category} context.`
    };
  }

  return {
    priority: 'low',
    priorityReason: 'Low priority: flexible task with no immediate blocking deadline.'
  };
}

function formatTimeOnly(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}
