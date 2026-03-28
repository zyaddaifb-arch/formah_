/**
 * Standard formatting for time in MM:SS or HH:MM:SS
 */
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const mStr = minutes.toString().padStart(2, '0');
  const sStr = remainingSeconds.toString().padStart(2, '0');

  if (hours > 0) {
    const hStr = hours.toString().padStart(2, '0');
    return `${hStr}:${mStr}:${sStr}`;
  }
  return `${minutes}:${sStr}`;
};

/**
 * MM:SS format for rest timers
 */
export const formatRestTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

/**
 * Weight conversion logic
 */
export const convertWeight = (weight: number, from: 'kg' | 'lb', to: 'kg' | 'lb'): number => {
  if (from === to) return weight;
  const factor = from === 'kg' ? 2.20462 : 0.453592;
  return parseFloat((weight * factor).toFixed(1));
};
