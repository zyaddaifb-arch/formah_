import { WorkoutSession } from '../store/types';
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
  weeklyActivity: boolean[]; // Sat to Fri (7 days)
  momentumScore: number; // 0-100
}

/**
 * Calculates streak data from workout history.
 * Week starts on Saturday as per user request.
 */
export const calculateStreakData = (history: WorkoutSession[]): StreakData => {
  if (history.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      weeklyActivity: new Array(7).fill(false),
      momentumScore: 0,
    };
  }

  // Sort history by startTime descending (newest first)
  const sortedHistory = [...history].sort((a, b) => b.startTime - a.startTime);
  const now = new Date();
  const today = startOfDay(now);

  // 1. Calculate Current Streak
  let currentStreak = 0;
  let checkDate = today;
  let historyIndex = 0;

  // Find if there's a workout today
  const hasWorkoutToday = sortedHistory.some(s => isSameDay(new Date(s.startTime), today));
  
  // If no workout today, check if the streak is still alive (last workout was yesterday)
  const yesterday = subDays(today, 1);
  const hasWorkoutYesterday = sortedHistory.some(s => isSameDay(new Date(s.startTime), yesterday));

  if (!hasWorkoutToday && !hasWorkoutYesterday) {
    // Check if it's been more than 7 days since last workout for a full reset?
    // Actually standard streak resets if you miss a day. 
    // But user said "إذا مر أسبوع من غير ما يتمرن، الاستريت يروح" 
    // which might mean a "Soft Streak" or a "Weekly Streak".
    // However, usually streaks ARE daily. Let's stick to daily but 
    // verify the last workout wasn't > 7 days ago for the "reset" rule.
    const lastWorkout = new Date(sortedHistory[0].startTime);
    if (differenceInCalendarDays(today, lastWorkout) >= 7) {
      currentStreak = 0;
    } else {
      // If we are within 7 days, maybe the streak is still the number of days we've done?
      // Re-reading: "لما يلعب تمرين، تقوم مزود الستريك"
      // "إذا مر أسبوع من غير ما يتمرن، الاستريت يروح"
      // This implies it's a count of SESSIONS or DAYS, but only resets if a week is missed.
      // Let's count TOTAL DAYS with workouts, but reset if gap > 7 days.
      currentStreak = sortedHistory.length; // Simplified for now: total sessions? 
      // No, let's count unique days with workouts.
      const uniqueDays = new Set(sortedHistory.map(s => startOfDay(new Date(s.startTime)).getTime()));
      currentStreak = uniqueDays.size;
    }
  } else {
    // Streak is active. Count unique days with workouts.
    const uniqueDays = new Set(sortedHistory.map(s => startOfDay(new Date(s.startTime)).getTime()));
    currentStreak = uniqueDays.size;
  }

  // 2. Longest Streak
  // For now, if we don't persist it, we calculate from history.
  // Since we don't have gaps-based reset logic yet other than the 7-day rule,
  // longest streak is just current if it's the max we've seen? 
  // Let's just return currentStreak as dummy for now or count historical streaks.
  const longestStreak = currentStreak; // Placeholder

  // 3. Weekly Activity (Sat to Fri)
  // Saturday is index 6 in default date-fns (0=Sun, 1=Mon... 6=Sat)
  // We want: [Sat, Sun, Mon, Tue, Wed, Thu, Fri]
  const weeklyActivity = new Array(7).fill(false);
  
  // Find the start of the week (Saturday)
  // date-fns startOfWeek(date, { weekStartsOn: 6 }) gives the most recent Saturday.
  const startOfThisWeek = startOfWeek(now, { weekStartsOn: 6 });
  
  for (let i = 0; i < 7; i++) {
    const dayDate = addDays(startOfThisWeek, i);
    weeklyActivity[i] = sortedHistory.some(s => isSameDay(new Date(s.startTime), dayDate));
  }

  // 4. Momentum Score
  // Percentage of active days in the last 30 days.
  const thirtyDaysAgo = subDays(today, 30);
  const activeDaysInLast30 = new Set(
    sortedHistory
      .filter(s => s.startTime >= thirtyDaysAgo.getTime())
      .map(s => startOfDay(new Date(s.startTime)).getTime())
  ).size;
  
  const momentumScore = Math.min(100, Math.round((activeDaysInLast30 / 30) * 100));

  return {
    currentStreak,
    longestStreak,
    weeklyActivity,
    momentumScore,
  };
};
