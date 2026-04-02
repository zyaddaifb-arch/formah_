import { Exercise, SetData, FocusMetricType } from '../store/types';

export const calculateTotalVolume = (sets: SetData[]): number => {
  return sets
    .filter(set => set.done && set.weight > 0 && set.reps > 0 && !set.isWarmUp)
    .reduce((total, set) => total + (set.weight * set.reps), 0);
};

export const calculateTotalReps = (sets: SetData[]): number => {
  return sets
    .filter(set => set.done && set.reps > 0 && !set.isWarmUp)
    .reduce((total, set) => total + set.reps, 0);
};

export const calculateFocusMetric = (
  metric: FocusMetricType,
  currentSets: SetData[],
  previousSets?: any[]
): number => {
  switch (metric) {
    case 'total_volume':
      return calculateTotalVolume(currentSets);

    case 'total_reps':
      return calculateTotalReps(currentSets);

    case 'weight_rep': {
      const volume = calculateTotalVolume(currentSets);
      const reps = calculateTotalReps(currentSets);
      if (reps === 0) return 0;
      return +(volume / reps).toFixed(1);
    }

    case 'volume_increase': {
      const currentVolume = calculateTotalVolume(currentSets);
      if (!previousSets || previousSets.length === 0) return 0;
      
      const prevVolume = previousSets
        .filter(set => set.done && set.weight > 0 && set.reps > 0 && !set.isWarmUp)
        .reduce((total, set) => total + (set.weight * set.reps), 0);
      
      if (prevVolume === 0) return 0;
      return +(((currentVolume - prevVolume) / prevVolume) * 100).toFixed(1);
    }

    case 'estimated_1rm': {
      let max1rm = 0;
      currentSets.forEach(set => {
        if (set.done && set.weight > 0 && set.reps > 0 && !set.isWarmUp) {
          const oneRM = set.weight * (1 + set.reps / 30);
          if (oneRM > max1rm) max1rm = oneRM;
        }
      });
      return +(max1rm).toFixed(1);
    }

    default:
      return 0;
  }
};

export const formatMetricValue = (metric: FocusMetricType, value: number, unit: string = 'kg'): string => {
  switch (metric) {
    case 'total_volume':
      return `${value} ${unit}`;
    case 'volume_increase':
      return `${value >= 0 ? '+' : ''}${value}%`;
    case 'total_reps':
      return `${value} reps`;
    case 'weight_rep':
      return `${value} ${unit}`;
    case 'estimated_1rm':
      return `${value} ${unit}`;
    default:
      return `${value}`;
  }
};
