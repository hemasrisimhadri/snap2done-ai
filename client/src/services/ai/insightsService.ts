import { Task, AIInsights } from '../../types';

export function calculateAIInsights(tasks: Task[]): AIInsights {
  const now = new Date();
  const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  let deadlinesThisWeek = 0;
  let completedThisWeek = 0;
  let atRiskCount = 0;
  let totalPlannedMinutes = 0;

  // Track task load per day of week
  const dayCounts: Record<string, number> = {
    Sunday: 0,
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  tasks.forEach(task => {
    // Total planned time for incomplete tasks
    if (task.status !== 'completed') {
      totalPlannedMinutes += task.estimatedDuration || 30;
    }

    // Deadlines this week
    if (task.deadline) {
      const dDate = new Date(task.deadline);
      if (dDate >= now && dDate <= oneWeekLater) {
        deadlinesThisWeek++;
        const dName = dayNames[dDate.getDay()];
        dayCounts[dName] = (dayCounts[dName] || 0) + 1;

        // Check if at risk (due within 36 hours and still pending)
        const diffHours = (dDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (diffHours < 36 && task.status === 'pending') {
          atRiskCount++;
        }
      } else if (dDate < now && task.status !== 'completed') {
        // Already overdue
        atRiskCount++;
      }
    }

    // Completed this week
    if (task.status === 'completed' && task.completedAt) {
      const cDate = new Date(task.completedAt);
      if (cDate >= oneWeekAgo && cDate <= now) {
        completedThisWeek++;
      }
    }
  });

  // Calculate busiest day
  let busiestDay = 'Monday';
  let maxCount = -1;
  for (const [day, count] of Object.entries(dayCounts)) {
    if (count > maxCount) {
      maxCount = count;
      busiestDay = day;
    }
  }

  // Generate dynamic human-readable bullets
  const bullets: string[] = [];

  if (deadlinesThisWeek > 0) {
    bullets.push(`You have ${deadlinesThisWeek} upcoming deadline${deadlinesThisWeek > 1 ? 's' : ''} this week.`);
  } else {
    bullets.push('No pressing deadlines scheduled for this week.');
  }

  if (maxCount > 0) {
    bullets.push(`${busiestDay} is your busiest day with ${maxCount} task${maxCount > 1 ? 's' : ''}.`);
  }

  if (atRiskCount > 0) {
    bullets.push(`⚠️ ${atRiskCount} task${atRiskCount > 1 ? 's are' : ' is'} at risk of becoming overdue.`);
  } else {
    bullets.push('🟢 All upcoming tasks are on track.');
  }

  if (completedThisWeek > 0) {
    bullets.push(`You completed ${completedThisWeek} task${completedThisWeek > 1 ? 's' : ''} recently.`);
  }

  // Productivity score (0-100)
  const totalTasks = tasks.length || 1;
  const completedRatio = tasks.filter(t => t.status === 'completed').length / totalTasks;
  const score = Math.min(100, Math.round(50 + completedRatio * 40 - atRiskCount * 5));

  return {
    deadlinesThisWeek,
    busiestDay,
    completedThisWeek,
    atRiskCount,
    totalPlannedMinutes,
    productivityScore: Math.max(20, score),
    insightBullets: bullets
  };
}
