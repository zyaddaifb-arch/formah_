import { useState, useEffect } from 'react';

export type LineTimer = {
  remaining: number;
  target: number;
  done?: boolean;
};

/**
 * Manages the automatic per-set rest timers shown after set completion.
 */
export const useLineTimers = () => {
  const [lineTimers, setLineTimers] = useState<Record<string, LineTimer>>({});

  useEffect(() => {
    const anyActive = Object.values(lineTimers).some(t => t.remaining > 0 && !t.done);
    if (!anyActive) return;

    const interval = setInterval(() => {
      setLineTimers(prev => {
        const updated = { ...prev };
        let hasChanges = false;
        Object.keys(updated).forEach(id => {
          if (updated[id].remaining > 0 && !updated[id].done) {
            const newRemaining = updated[id].remaining - 1;
            updated[id] = { 
              ...updated[id], 
              remaining: newRemaining,
              done: newRemaining === 0 
            };
            hasChanges = true;
          }
        });
        return hasChanges ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lineTimers]);

  const startLineTimer = (setId: string, duration: number = 60) => {
    setLineTimers(prev => {
      const updated: Record<string, LineTimer> = {};
      // Filter out other running timers (logic from original active.tsx)
      Object.keys(prev).forEach(id => {
        if (prev[id].done || prev[id].remaining === 0) {
          updated[id] = prev[id];
        }
      });
      updated[setId] = { remaining: duration, target: duration, done: false };
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
          remaining: Math.max(0, prev[setId].remaining + offset)
        }
      };
    });
  };

  const skipLineTimer = (setId: string) => {
    setLineTimers(prev => {
      if (!prev[setId]) return prev;
      return {
        ...prev,
        [setId]: { ...prev[setId], remaining: 0, done: true }
      };
    });
  };

  return {
    lineTimers,
    startLineTimer,
    cancelLineTimer,
    adjustLineTimer,
    skipLineTimer
  };
};
