import { Task, DailyPlan, PlanBlock } from '../../types';

/**
 * AI Daily Planner Engine:
 * Transforms prioritized tasks into a human-friendly, realistic time-blocked schedule.
 * Automatically inserts breaks and accommodates task durations and deadlines.
 */
export function generateDailyPlan(tasks: Task[], customDate?: string): DailyPlan {
  const planDate = customDate || new Date().toISOString().split('T')[0];

  // Filter pending or in-progress tasks
  const pendingTasks = tasks.filter(t => t.status !== 'completed');

  // Sort by priority (high > medium > low), then duration
  const sorted = [...pendingTasks].sort((a, b) => {
    const pWeight = { high: 3, medium: 2, low: 1 };
    const diffP = pWeight[b.priority] - pWeight[a.priority];
    if (diffP !== 0) return diffP;
    return b.estimatedDuration - a.estimatedDuration;
  });

  const blocks: PlanBlock[] = [];
  let currentHour = 9;
  let currentMinute = 0;

  // Function to format time string e.g. "09:00", "14:30"
  const formatTime = (h: number, m: number): string => {
    const hh = h < 10 ? `0${h}` : `${h}`;
    const mm = m < 10 ? `0${m}` : `${m}`;
    return `${hh}:${mm}`;
  };

  // Function to advance time
  const advanceTime = (durationMin: number) => {
    const totalMin = currentHour * 60 + currentMinute + durationMin;
    currentHour = Math.floor(totalMin / 60);
    currentMinute = totalMin % 60;
  };

  if (sorted.length === 0) {
    // If no tasks, create a relaxed day plan
    blocks.push({
      id: `block_${Date.now()}_0`,
      time: '09:00',
      durationMinutes: 60,
      title: 'Review Inbox & Brainstorming',
      category: 'Work',
      type: 'task',
      completed: false
    });
    blocks.push({
      id: `block_${Date.now()}_1`,
      time: '10:00',
      durationMinutes: 15,
      title: 'Morning Break & Coffee',
      category: 'Break',
      type: 'break',
      completed: false
    });
    blocks.push({
      id: `block_${Date.now()}_2`,
      time: '10:15',
      durationMinutes: 90,
      title: 'Skill Development & Research',
      category: 'Study',
      type: 'task',
      completed: false
    });
  } else {
    // Schedule up to 5 major tasks for a realistic day
    sorted.slice(0, 5).forEach((task, idx) => {
      // Add lunch break around 12:30 or 13:00
      if (currentHour >= 12 && currentHour < 14 && !blocks.some(b => b.title.includes('Lunch'))) {
        blocks.push({
          id: `block_lunch_${Date.now()}`,
          time: formatTime(currentHour, currentMinute),
          durationMinutes: 45,
          title: 'Lunch & Recharge',
          category: 'Break',
          type: 'break',
          completed: false
        });
        advanceTime(45);
      }

      // Add task block
      const startStr = formatTime(currentHour, currentMinute);
      const duration = Math.min(task.estimatedDuration || 60, 120);

      blocks.push({
        id: `block_${task.id}_${idx}`,
        time: startStr,
        durationMinutes: duration,
        taskId: task.id,
        title: task.title,
        category: task.category,
        type: 'task',
        completed: false
      });

      advanceTime(duration);

      // Add short break after heavy tasks
      if (duration >= 60 && idx < sorted.length - 1) {
        blocks.push({
          id: `block_break_${Date.now()}_${idx}`,
          time: formatTime(currentHour, currentMinute),
          durationMinutes: 15,
          title: 'Stretch & Hydration Break',
          category: 'Break',
          type: 'break',
          completed: false
        });
        advanceTime(15);
      }
    });

    // End-of-day review
    if (currentHour < 18) {
      blocks.push({
        id: `block_review_${Date.now()}`,
        time: formatTime(Math.max(currentHour, 17), 0),
        durationMinutes: 20,
        title: 'Review Tasks & Plan Tomorrow',
        category: 'Review',
        type: 'review',
        completed: false
      });
    }
  }

  return {
    id: `plan_${planDate}`,
    date: planDate,
    blocks,
    generatedAt: new Date().toISOString(),
    status: 'draft'
  };
}
