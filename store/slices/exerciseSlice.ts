import { StateCreator } from 'zustand';
import { WorkoutStore, Exercise, ExerciseNote, SetData } from '../types';

export interface ExerciseSlice {
  addExerciseToActive: (exerciseId: string, exerciseName: string) => void;
  removeExerciseFromActive: (exerciseId: string) => void;
  replaceExerciseInActive: (exerciseId: string, newExerciseId: string, newExerciseName: string) => void;
  setExercisesOrderInActive: (newExercises: Exercise[]) => void;
  addExerciseNote: (exerciseId: string, isSticky: boolean) => void;
  updateExerciseNote: (exerciseId: string, noteId: string, text: string) => void;
  deleteExerciseNote: (exerciseId: string, noteId: string) => void;
  toggleWarmUpSets: (exerciseId: string) => void;
  updateExerciseWeightUnit: (exerciseId: string, unit: 'kg' | 'lb') => void;
  updateExerciseRestTimer: (exerciseId: string, seconds: number) => void;
}

export const createExerciseSlice: StateCreator<WorkoutStore, [], [], ExerciseSlice> = (set, get) => ({
  addExerciseToActive: (exerciseId, exerciseName) => {
    const { activeWorkout, history } = get();
    if (!activeWorkout) return;

    const uniqueId = Math.random().toString(36).substring(7) + '_' + Date.now().toString();
    
    // Find previous sets from history using exerciseId
    let initialSets: SetData[] = [];
    for (let i = 0; i < history.length; i++) {
      const workout = history[i];
      const previousExercise = workout.exercises.find(ex => ex.exerciseId === exerciseId);
      if (previousExercise && previousExercise.sets.length > 0) {
        initialSets = previousExercise.sets.map((set, index) => ({
          id: uniqueId + '_' + (index + 1),
          weight: 0,
          reps: 0,
          done: false,
          isWarmUp: set.isWarmUp,
        }));
        break;
      }
    }

    if (initialSets.length === 0) {
      initialSets = [{ id: uniqueId + '_1', weight: 0, reps: 0, done: false }];
    }

    const newExercise: Exercise = {
      id: uniqueId,
      exerciseId,
      name: exerciseName,
      sets: initialSets,
      weightUnit: get().user.weightUnit,
      notes: [],
      warmUpSetsEnabled: initialSets.some(s => s.isWarmUp),
    };

    set({
      activeWorkout: {
        ...activeWorkout,
        exercises: [...activeWorkout.exercises, newExercise],
      },
    });
  },

  removeExerciseFromActive: (exerciseId) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    set({
      activeWorkout: {
        ...activeWorkout,
        exercises: activeWorkout.exercises.filter(ex => ex.id !== exerciseId)
      }
    });
  },

  replaceExerciseInActive: (exerciseId, newExerciseId, newExerciseName) => {
    const { activeWorkout, history } = get();
    if (!activeWorkout) return;
    
    let initialSets: SetData[] = [];
    const uniqueId = Math.random().toString(36).substring(7) + '_' + Date.now().toString();
    
    for (let i = 0; i < history.length; i++) {
        const workout = history[i];
        const previousExercise = workout.exercises.find(ex => ex.exerciseId === newExerciseId);
        if (previousExercise && previousExercise.sets.length > 0) {
          initialSets = previousExercise.sets.map((set, index) => ({
            id: uniqueId + '_' + (index + 1),
            weight: 0,
            reps: 0,
            done: false,
            isWarmUp: set.isWarmUp,
          }));
          break;
        }
    }

    if (initialSets.length === 0) {
      initialSets = [{ id: uniqueId + '_1', weight: 0, reps: 0, done: false }];
    }

    set({
      activeWorkout: {
        ...activeWorkout,
        exercises: activeWorkout.exercises.map(ex => {
          if (ex.id === exerciseId) {
            return {
              id: ex.id,
              exerciseId: newExerciseId,
              name: newExerciseName,
              sets: initialSets,
              weightUnit: get().user.weightUnit,
              notes: [],
              warmUpSetsEnabled: initialSets.some(s => s.isWarmUp),
            } as Exercise;
          }
          return ex;
        })
      }
    });
  },

  setExercisesOrderInActive: (newExercises) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    set({
      activeWorkout: {
        ...activeWorkout,
        exercises: newExercises
      }
    });
  },

  addExerciseNote: (exerciseId, isSticky) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    
    const newNote: ExerciseNote = {
      id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 5),
      exerciseId,
      createdAt: Date.now(),
      text: '',
      isSticky
    };

    set({
      activeWorkout: {
        ...activeWorkout,
        exercises: activeWorkout.exercises.map(ex => {
          if (ex.id === exerciseId) {
            return { ...ex, notes: [...(ex.notes || []), newNote] };
          }
          return ex;
        })
      }
    });
  },

  updateExerciseNote: (exerciseId, noteId, text) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    set({
      activeWorkout: {
        ...activeWorkout,
        exercises: activeWorkout.exercises.map(ex => {
          if (ex.id === exerciseId && ex.notes) {
            return {
              ...ex,
              notes: ex.notes.map(n => n.id === noteId ? { ...n, text } : n)
            };
          }
          return ex;
        })
      }
    });
  },

  deleteExerciseNote: (exerciseId, noteId) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    set({
      activeWorkout: {
        ...activeWorkout,
        exercises: activeWorkout.exercises.map(ex => {
          if (ex.id === exerciseId && ex.notes) {
            return {
              ...ex,
              notes: ex.notes.filter(n => n.id !== noteId)
            };
          }
          return ex;
        })
      }
    });
  },

  toggleWarmUpSets: (exerciseId) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    set({
      activeWorkout: {
        ...activeWorkout,
        exercises: activeWorkout.exercises.map(ex => {
          if (ex.id === exerciseId) {
            const toggled = !(ex.warmUpSetsEnabled || false);
            return { ...ex, warmUpSetsEnabled: toggled };
          }
          return ex;
        })
      }
    });
  },

  updateExerciseWeightUnit: (exerciseId, unit) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    set({
      activeWorkout: {
        ...activeWorkout,
        exercises: activeWorkout.exercises.map(ex => {
          if (ex.id === exerciseId) {
            const oldUnit = ex.weightUnit || 'kg';
            if (oldUnit === unit) return ex;

            const isKgToLb = oldUnit === 'kg' && unit === 'lb';
            const conversionFactor = isKgToLb ? 2.20462 : 0.453592;

            const convertedSets = ex.sets.map(s => ({
              ...s,
              weight: s.weight > 0 ? parseFloat((s.weight * conversionFactor).toFixed(1)) : s.weight
            }));

            return { ...ex, weightUnit: unit, sets: convertedSets };
          }
          return ex;
        })
      }
    });
  },

  updateExerciseRestTimer: (exerciseId, seconds) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    set({
      activeWorkout: {
        ...activeWorkout,
        exercises: activeWorkout.exercises.map(ex => {
          if (ex.id === exerciseId) {
            return { ...ex, defaultRestTimer: seconds };
          }
          return ex;
        })
      }
    });
  },
});
