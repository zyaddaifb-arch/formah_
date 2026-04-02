import { useState, useEffect, useRef } from 'react';

export type LineTimer = {
  endTimestamp: number; // Unix ms when timer expires
  target: number;       // duration in seconds (for progress bar)
};

// Derived type for consumers (same API as before)
export type DerivedLineTimer = {
  remaining: number;
  target: number;
  done: boolean;
};

/**
 * PERF: Timestamp-based per-set rest timers.
 * - Stores end timestamps (not remaining seconds) as source of truth.
 * - Uses a separate `tick` counter to drive 1s re-renders for display.
 * - State only written to when timers start/stop — not every second.
 * - With React.memo on ExerciseCard, only the card with an active
 *   timer re-renders each second. Unaffected cards stay frozen.
 */
export const useLineTimers = () => {
  const [lineTimers, setLineTimers] = useState<Record<string, LineTimer>>({});
  const [tick, setTick] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Compute derived values from timestamps on each render
  const derivedTimers: Record<string, DerivedLineTimer> = {};
  let anyActive = false;
  Object.keys(lineTimers).forEach(id => {
    const t = lineTimers[id];
    const remaining = Math.max(0, Math.round((t.endTimestamp - Date.now()) / 1000));
    const done = remaining === 0;
    derivedTimers[id] = { remaining, target: t.target, done };
    if (!done) anyActive = true;
  });

  // Run a 1s interval while any timer is active to drive display updates.
  // Only updates a tick counter — no store writes, no lineTimer state writes.
  useEffect(() => {
    if (!anyActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (intervalRef.current) return; // already running

    intervalRef.current = setInterval(() => {
      setTick(t => t + 1); // trigger re-render to recompute derived values
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [anyActive]);

  const startLineTimer = (setId: string, duration: number = 60) => {
    setLineTimers(prev => {
      const updated: Record<string, LineTimer> = {};
      // Keep done timers, discard other running timers
      Object.keys(prev).forEach(id => {
        const remaining = Math.max(0, Math.round((prev[id].endTimestamp - Date.now()) / 1000));
        if (remaining === 0) updated[id] = prev[id];
      });
      updated[setId] = {
        endTimestamp: Date.now() + duration * 1000,
        target: duration,
      };
      return updated;
    });
  };

  const cancelLineTimer = (setId: string) => {
    setLineTimers(prev => {
      const next = { ...prev };
      delete next[setId];
      return next;
    });
  };

  const adjustLineTimer = (setId: string, offset: number) => {
    setLineTimers(prev => {
      if (!prev[setId]) return prev;
      return {
        ...prev,
        [setId]: {
          ...prev[setId],
          endTimestamp: prev[setId].endTimestamp + offset * 1000,
        },
      };
    });
  };

  const skipLineTimer = (setId: string) => {
    setLineTimers(prev => {
      if (!prev[setId]) return prev;
      // Force end immediately
      return {
        ...prev,
        [setId]: { ...prev[setId], endTimestamp: Date.now() - 1 },
      };
    });
  };

  return {
    lineTimers: derivedTimers, // backward-compat shape for consumers
    startLineTimer,
    cancelLineTimer,
    adjustLineTimer,
    skipLineTimer,
  };
};
