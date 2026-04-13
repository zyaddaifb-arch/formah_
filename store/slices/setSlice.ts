import { StateCreator } from 'zustand';
import { WorkoutStore, SetData } from '../types';

export interface SetSlice {
  addSetToExercise: (exerciseId: string, isWarmUp?: boolean) => void;
  removeSetFromExercise: (exerciseId: string, setId: string) => void;
  duplicateSet: (exerciseId: string, setId: string) => void;
  updateSet: (exerciseId: string, setId: string, data: Partial<SetData>) => void;
  toggleSetDone: (exerciseId: string, setId: string) => void;
  markAllValidSetsDone: () => void;
}

export const createSetSlice: StateCreator<WorkoutStore, [], [], SetSlice> = (set, get) => ({
  addSetToExercise: (exerciseId, isWarmUp) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    const updatedExercises = activeWorkout.exercises.map((ex) => {
      if (ex.id === exerciseId) {
        const isWarmUpFlag = isWarmUp || false;
        let referenceSet = null;
        if (isWarmUpFlag) {
          referenceSet = ex.sets.filter(s => s.isWarmUp).pop();
        } else {
          referenceSet = ex.sets.filter(s => !s.isWarmUp).pop();
        }
        if (!referenceSet) referenceSet = ex.sets[ex.sets.length - 1];

        const exerciseType = ex.exerciseType || 'weight_reps';
        const newSet: SetData = {
          id: Date.now().toString() + '_' + (ex.sets.length + 1),
          weight: exerciseType === 'weight_reps' ? (referenceSet?.weight ?? 0) : undefined,
          reps: exerciseType !== 'duration' ? (referenceSet?.reps ?? 0) : undefined,
          time: exerciseType === 'duration' ? (referenceSet?.time ?? 0) : undefined,
          done: false,
          isWarmUp: isWarmUpFlag,
        };

        const newSets = [...ex.sets];
        if (isWarmUpFlag) {
          const firstNormalIdx = newSets.findIndex(s => !s.isWarmUp);
          if (firstNormalIdx === -1) {
            newSets.push(newSet);
          } else {
            newSets.splice(firstNormalIdx, 0, newSet);
          }
        } else {
          newSets.push(newSet);
        }

        return { ...ex, sets: newSets };
      }
      return ex;
    });

    set({
      activeWorkout: { ...activeWorkout, exercises: updatedExercises },
    });
  },

  removeSetFromExercise: (exerciseId, setId) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    const updatedExercises = activeWorkout.exercises.map((ex) => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.filter((s) => s.id !== setId),
        };
      }
      return ex;
    }).filter(ex => ex.sets.length > 0);

    set({
      activeWorkout: { ...activeWorkout, exercises: updatedExercises },
    });
  },

  duplicateSet: (exerciseId, setId) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    const updatedExercises = activeWorkout.exercises.map((ex) => {
      if (ex.id === exerciseId) {
        const setIndex = ex.sets.findIndex(s => s.id === setId);
        if (setIndex === -1) return ex;
        const originalSet = ex.sets[setIndex];
        
        const duplicatedSet = {
          ...originalSet,
          id: Date.now().toString() + '_' + Math.random().toString(36).substring(2, 7),
          done: false,
        };

        const newSets = [...ex.sets];
        newSets.splice(setIndex + 1, 0, duplicatedSet);

        return { ...ex, sets: newSets };
      }
      return ex;
    });

    set({
      activeWorkout: { ...activeWorkout, exercises: updatedExercises },
    });
  },

  updateSet: (exerciseId, setId, data) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    const updatedExercises = activeWorkout.exercises.map((ex) => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...data } : s)),
        };
      }
      return ex;
    });

    set({
      activeWorkout: { ...activeWorkout, exercises: updatedExercises },
    });
  },

  toggleSetDone: (exerciseId, setId) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    const updatedExercises = activeWorkout.exercises.map((ex) => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map((s) => (s.id === setId ? { ...s, done: !s.done } : s)),
        };
      }
      return ex;
    });

    set({
      activeWorkout: { ...activeWorkout, exercises: updatedExercises },
    });
  },
  
  markAllValidSetsDone: () => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    
    const updatedExercises = activeWorkout.exercises.map((ex) => {
      return {
        ...ex,
        sets: ex.sets.map((s) => {
          const isWeightRepsValid = ex.exerciseType === 'weight_reps' && (s.weight ?? 0) > 0 && (s.reps ?? 0) > 0;
          const isWeightOnlyValid = ex.exerciseType === 'weight_only' && (s.weight ?? 0) > 0;
          const isRepsOnlyValid = ex.exerciseType === 'reps_only' && (s.reps ?? 0) > 0;
          const isDurationValid = ex.exerciseType === 'duration' && (s.time ?? 0) > 0;
          const isLegacyValid = !ex.exerciseType && (s.weight ?? 0) > 0 && (s.reps ?? 0) > 0;

          if (!s.done && (isWeightRepsValid || isWeightOnlyValid || isRepsOnlyValid || isDurationValid || isLegacyValid)) {
            return { ...s, done: true };
          }
          return s;
        })
      };
    });
    
    set({
      activeWorkout: { ...activeWorkout, exercises: updatedExercises }
    });
  },
});
