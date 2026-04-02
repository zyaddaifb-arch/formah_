import { StateCreator } from 'zustand';
import { WorkoutStore } from '../types';

export interface TimerSlice {
  startRestTimer: (exerciseId?: string, forceSeconds?: number) => void;
  stopRestTimer: () => void;
  tickRestTimer: () => void;  // kept for API compatibility but now a no-op
  adjustRestTimer: (offset: number) => void;
}

export const createTimerSlice: StateCreator<WorkoutStore, [], [], TimerSlice> = (set, get) => ({
  startRestTimer: (exerciseId, forceSeconds) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    let duration = forceSeconds || 60;
    if (exerciseId && !forceSeconds) {
      const exercise = activeWorkout.exercises.find(e => e.id === exerciseId);
      if (exercise?.defaultRestTimer) {
        duration = exercise.defaultRestTimer;
      }
    }

    // PERF FIX: Store the end timestamp instead of the remaining time.
    // The UI derives `remaining` locally using Date.now() in a useEffect loop —
    // this way, the store is updated ONCE (on start/stop) instead of every second.
    const endTimestamp = Date.now() + duration * 1000;

    set({
      activeWorkout: {
        ...activeWorkout,
        restTimerEndTimestamp: endTimestamp,
        restTimerTarget: duration,
        restTimerRemaining: duration, // initial snapshot for compatibility
        isRestTimerActive: true,
      }
    });
  },

  stopRestTimer: () => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    set({
      activeWorkout: {
        ...activeWorkout,
        isRestTimerActive: false,
        restTimerEndTimestamp: undefined,
        restTimerRemaining: 0,
      }
    });
  },

  // PERF FIX: tickRestTimer is now a no-op.
  // Remaining time is computed in the UI from `restTimerEndTimestamp`.
  // Kept for backward-compat so callers don't blow up.
  tickRestTimer: () => {
    // intentionally empty — do NOT call set() here
  },

  adjustRestTimer: (offset) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    if (!activeWorkout.isRestTimerActive || !activeWorkout.restTimerEndTimestamp) return;

    const newEndTimestamp = activeWorkout.restTimerEndTimestamp + offset * 1000;
    const newRemaining = Math.max(0, Math.round((newEndTimestamp - Date.now()) / 1000));

    set({
      activeWorkout: {
        ...activeWorkout,
        restTimerEndTimestamp: newEndTimestamp,
        restTimerRemaining: newRemaining,
        isRestTimerActive: true,
      }
    });
  },
});
