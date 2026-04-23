import { WorkoutSession, UserData, WorkoutTemplate, WorkoutFolder } from '../store/types';
import { 
  startOfDay, 
  isSameDay, 
  subDays, 
  differenceInCalendarDays,
  startOfWeek,
  addDays,
  format
} from 'date-fns';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  progressDots: { label: string; completed: boolean; id?: string }[];
  momentumScore: number; // 0-100
  streakTitle: string;
  streakSubtitle: string;
  type: 'daily' | 'folder';
  folderId?: string;
}

/**
 * Calculates streak data based on "My Schedule" (uncategorized templates).
 * Week starts on Saturday.
 */
export const calculateStreakData = (
  history: WorkoutSession[],
  user: UserData,
  templates: WorkoutTemplate[],
  folders: WorkoutFolder[]
): StreakData => {
  // Epoch to zero out old data before this feature implementation
  const STREAK_EPOCH = 1713830000000; 

  const now = new Date();
  const startOfThisWeek = startOfWeek(now, { weekStartsOn: 6 });

  // 1. Get Target Templates ("My Schedule" / Uncategorized)
  const targetTemplates = templates.filter(t => !t.folderId && !t.isArchived);
  
  // If there are no target templates, streak is 0
  if (targetTemplates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      progressDots: [{ label: '-', completed: false }],
      momentumScore: 0,
      streakTitle: 'WEEKLY STREAK',
      streakSubtitle: 'ADD A TEMPLATE TO SCHEDULE',
      type: 'folder'
    };
  }

  // 2. Filter History
  // Only keep history after the epoch AND where the template matches one of our target templates
  const targetTemplateIds = new Set(targetTemplates.map(t => t.id));
  const relevantHistory = history.filter(s => 
    s.startTime >= STREAK_EPOCH && 
    s.templateId && 
    targetTemplateIds.has(s.templateId)
  );

  // 3. Calculate Streak
  let currentStreak = 0;
  let longestStreak = 0;

  if (relevantHistory.length > 0) {
    // Group history by week
    const weeks = new Map<number, Set<string>>(); // weekStart -> set of templateIds completed
    for (const session of relevantHistory) {
      const wStart = startOfWeek(new Date(session.startTime), { weekStartsOn: 6 }).getTime();
      if (!weeks.has(wStart)) weeks.set(wStart, new Set());
      weeks.get(wStart)!.add(session.templateId!);
    }

    const weekStarts = Array.from(weeks.keys()).sort();
    let currentRun = 0;

    for (let i = 0; i < weekStarts.length; i++) {
      const wStart = weekStarts[i];
      const completedTemplates = weeks.get(wStart)!;
      
      // Did they complete the ENTIRE schedule this week?
      const isWeekSuccessful = targetTemplates.every(t => completedTemplates.has(t.id));

      if (i > 0) {
        const prevStart = weekStarts[i - 1];
        const diffWeeks = Math.round((wStart - prevStart) / (7 * 24 * 60 * 60 * 1000));
        if (diffWeeks > 1) {
          // Gap of >1 week => broken streak
          currentRun = 0;
        }
      }

      if (isWeekSuccessful) {
        currentRun += 1;
        if (currentRun > longestStreak) longestStreak = currentRun;
      } else {
        // If it's a PAST week and it wasn't successful, it breaks the streak.
        // If it's the CURRENT week, it hasn't broken yet (they still have time).
        if (wStart < startOfThisWeek.getTime()) {
           currentRun = 0;
        }
      }
    }

    // Check if the streak was broken by missing the PREVIOUS week entirely
    const lastWorkoutWeek = weekStarts[weekStarts.length - 1];
    const diffToNow = Math.round((startOfThisWeek.getTime() - lastWorkoutWeek) / (7 * 24 * 60 * 60 * 1000));
    
    if (diffToNow > 1) {
      // Missing last week completely breaks the streak
      currentStreak = 0;
    } else {
      currentStreak = currentRun;
    }
  }

  // 4. Progress Dots for CURRENT week
  const workoutsThisWeek = relevantHistory.filter(s => s.startTime >= startOfThisWeek.getTime());
  
  const progressDots = targetTemplates.map(t => {
    const completed = workoutsThisWeek.some(w => w.templateId === t.id);
    const words = t.title.trim().split(/\s+/);
    let label = words.slice(0, 2).map(w => w[0]?.toUpperCase()).join('').substring(0, 2);
    if (!label) label = 'T';
    return {
      label,
      completed,
      id: t.id
    };
  });

  // 5. Momentum Score (percentage of target templates completed in last 30 days vs expected)
  const thirtyDaysAgo = subDays(startOfDay(now), 30).getTime();
  const activeDaysInLast30 = new Set(
    relevantHistory
      .filter(s => s.startTime >= thirtyDaysAgo)
      .map(s => startOfDay(new Date(s.startTime)).getTime())
  ).size;
  // Rough estimate: 12 workouts a month is 100% momentum
  const momentumScore = Math.min(100, Math.round((activeDaysInLast30 / 12) * 100));

  return {
    currentStreak,
    longestStreak,
    progressDots,
    momentumScore,
    streakTitle: 'WEEKLY STREAK',
    streakSubtitle: 'SCHEDULE COMPLETION',
    type: 'folder'
  };
};
