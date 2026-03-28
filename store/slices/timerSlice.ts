import { StateCreator } from 'zustand';
import { WorkoutStore } from '../types';

export interface TimerSlice {
  startRestTimer: (exerciseId?: string, forceSeconds?: number) => void;
  stopRestTimer: () => void;
  tickRestTimer: () => void;
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

    set({
      activeWorkout: {
        ...activeWorkout,
        restTimerTarget: duration,
        restTimerRemaining: duration,
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
        restTimerRemaining: 0,
      }
    });
  },

  tickRestTimer: () => {
    const { activeWorkout } = get();
    if (!activeWorkout || !activeWorkout.isRestTimerActive) return;

    if (activeWorkout.restTimerRemaining <= 0) return;

    set({
      activeWorkout: {
        ...activeWorkout,
        restTimerRemaining: activeWorkout.restTimerRemaining - 1,
      }
    });
  },

  adjustRestTimer: (offset) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    const newRemaining = Math.max(0, activeWorkout.restTimerRemaining + offset);
    
    set({
      activeWorkout: {
        ...activeWorkout,
        restTimerRemaining: newRemaining,
        isRestTimerActive: true, 
      }
    });
  },
});
