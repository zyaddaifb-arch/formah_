import { useState, useEffect } from 'react';

/**
 * Hook to track elapsed time of an active workout session.
 * @param startTime timestamp when the workout started
 */
const formatElapsedTime = (startTime: number) => {
  const ms = Date.now() - startTime;
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${seconds}s`;
  }
};

export const useActiveTimer = (startTime?: number) => {
  const [elapsedTime, setElapsedTime] = useState(() => 
    startTime ? formatElapsedTime(startTime) : '0s'
  );

  useEffect(() => {
    if (!startTime) {
      setElapsedTime('0s');
      return;
    }

    // Sync immediately on startTime change
    setElapsedTime(formatElapsedTime(startTime));

    const interval = setInterval(() => {
      setElapsedTime(formatElapsedTime(startTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return elapsedTime;
};
