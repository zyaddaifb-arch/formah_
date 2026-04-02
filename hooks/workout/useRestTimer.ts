import { useState, useEffect } from 'react';
import { useWorkoutStore } from '@/store/workoutStore';

/**
 * PERF: Returns restTimer remaining seconds computed from `restTimerEndTimestamp`.
 * The store is NOT ticked every second — only the local component state updates.
 * This hook is the ONLY place that runs a 1s interval for the rest timer.
 */
export const useRestTimer = () => {
  const isRestTimerActive = useWorkoutStore(state => state.activeWorkout?.isRestTimerActive ?? false);
  const restTimerEndTimestamp = useWorkoutStore(state => state.activeWorkout?.restTimerEndTimestamp);
  const restTimerTarget = useWorkoutStore(state => state.activeWorkout?.restTimerTarget ?? 60);
  const stopRestTimer = useWorkoutStore(state => state.stopRestTimer);

  const computeRemaining = () => {
    if (!isRestTimerActive || !restTimerEndTimestamp) return 0;
    return Math.max(0, Math.round((restTimerEndTimestamp - Date.now()) / 1000));
  };

  const [remaining, setRemaining] = useState(computeRemaining);

  useEffect(() => {
    if (!isRestTimerActive || !restTimerEndTimestamp) {
      setRemaining(0);
      return;
    }

    // Sync immediately
    setRemaining(computeRemaining());

    const interval = setInterval(() => {
      const r = computeRemaining();
      setRemaining(r);
      if (r <= 0) {
        clearInterval(interval);
        stopRestTimer();
      }
    }, 1000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRestTimerActive, restTimerEndTimestamp]);

  return { remaining, target: restTimerTarget, isActive: isRestTimerActive };
};
