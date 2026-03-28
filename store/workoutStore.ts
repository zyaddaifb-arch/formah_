import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SetData = {
  id: string;
  weight: number;
  reps: number;
  done: boolean;
  isWarmUp?: boolean;
  note?: string;
};

export type ExerciseNote = {
  id: string;
  exerciseId: string;
  text: string;
  createdAt: number;
  isSticky: boolean;
};

export type Exercise = {
  id: string;
  exerciseId?: string;
  name: string;
  sets: SetData[];
  weightUnit?: 'kg' | 'lb';
  notes?: ExerciseNote[];
  warmUpSetsEnabled?: boolean;
  defaultRestTimer?: number; // In seconds
};

export type WorkoutTemplate = {
  id: string;
  title: string;
  type: string;
  timeEstimate: string;
  exercises: Exercise[];
  color: string;
  icon: string;
};

export type ActiveWorkout = {
  id: string;
  startTime: number;
  templateId?: string;
  workoutTitle: string;
  exercises: Exercise[];
  
  // Rest Timer State
  restTimerRemaining: number;
  restTimerTarget: number;
  isRestTimerActive: boolean;
};

export type WorkoutSession = {
  id: string;
  templateId?: string;
  title: string;
  startTime: number;
  endTime: number;
  totalVolume: number;
  exercises: Exercise[];
};

export interface WorkoutStore {
  templates: WorkoutTemplate[];
  history: WorkoutSession[];
  activeWorkout: ActiveWorkout | null;
  
  // Actions
  startWorkout: (templateId?: string) => void;
  finishWorkout: () => string | null;
  cancelWorkout: () => void;
  addExerciseToActive: (exerciseId: string, exerciseName: string) => void;
  removeExerciseFromActive: (exerciseId: string) => void;
  replaceExerciseInActive: (exerciseId: string, newExerciseId: string, newExerciseName: string) => void;
  addSetToExercise: (exerciseId: string, isWarmUp?: boolean) => void;
  removeSetFromExercise: (exerciseId: string, setId: string) => void;
  duplicateSet: (exerciseId: string, setId: string) => void;
  updateSet: (exerciseId: string, setId: string, data: Partial<SetData>) => void;
  toggleSetDone: (exerciseId: string, setId: string) => void;
  markAllValidSetsDone: () => void;
  setExercisesOrderInActive: (newExercises: Exercise[]) => void;
  
  // Exercise Feature Actions
  addExerciseNote: (exerciseId: string, isSticky: boolean) => void;
  updateExerciseNote: (exerciseId: string, noteId: string, text: string) => void;
  deleteExerciseNote: (exerciseId: string, noteId: string) => void;
  toggleWarmUpSets: (exerciseId: string) => void;
  updateExerciseWeightUnit: (exerciseId: string, unit: 'kg' | 'lb') => void;
  updateExerciseRestTimer: (exerciseId: string, seconds: number) => void;

  // Workout Title
  renameWorkout: (title: string) => void;

  // Rest Timer Actions
  startRestTimer: (exerciseId?: string, forceSeconds?: number) => void;
  stopRestTimer: () => void;
  tickRestTimer: () => void;
  adjustRestTimer: (offset: number) => void;
  
  // Templates & other data
  addTemplate: (template: WorkoutTemplate) => void;
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      templates: [
        {
          id: 'template_push_1',
          title: 'Push Day',
          type: 'Hypertrophy',
          timeEstimate: '45m',
          color: '#81ECFF', // Colors.primary
          icon: 'arm-flex',
          exercises: [
            { id: 'ex_1', name: 'Barbell Bench Press', sets: [{ id: 's_1', weight: 0, reps: 0, done: false }, { id: 's_2', weight: 0, reps: 0, done: false }, { id: 's_3', weight: 0, reps: 0, done: false }] },
            { id: 'ex_2', name: 'Overhead Press', sets: [{ id: 's_4', weight: 0, reps: 0, done: false }, { id: 's_5', weight: 0, reps: 0, done: false }, { id: 's_6', weight: 0, reps: 0, done: false }] }
          ]
        },
        {
          id: 'template_pull_1',
          title: 'Pull Day',
          type: 'Strength',
          timeEstimate: '50m',
          color: '#FF716C', // Colors.tertiary
          icon: 'reproduction',
          exercises: [
            { id: 'ex_3', name: 'Pull-up', sets: [{ id: 's_7', weight: 0, reps: 0, done: false }, { id: 's_8', weight: 0, reps: 0, done: false }, { id: 's_9', weight: 0, reps: 0, done: false }] },
            { id: 'ex_4', name: 'Dumbbell Row', sets: [{ id: 's_10', weight: 0, reps: 0, done: false }, { id: 's_11', weight: 0, reps: 0, done: false }, { id: 's_12', weight: 0, reps: 0, done: false }] }
          ]
        },
        {
          id: 'template_legs_1',
          title: 'Leg Day',
          type: 'Power',
          timeEstimate: '60m',
          color: '#E0E3FF', // Colors.secondary
          icon: 'run',
          exercises: [
            { id: 'ex_5', name: 'Squat', sets: [{ id: 's_13', weight: 0, reps: 0, done: false }, { id: 's_14', weight: 0, reps: 0, done: false }, { id: 's_15', weight: 0, reps: 0, done: false }] },
            { id: 'ex_6', name: 'Deadlift', sets: [{ id: 's_16', weight: 0, reps: 0, done: false }, { id: 's_17', weight: 0, reps: 0, done: false }] }
          ]
        }
      ],
      history: [],
      activeWorkout: null,

      startWorkout: (templateId?: string) => {
        const { templates } = get();
        let initialExercises: Exercise[] = [];
        let workoutTitle = '';

        if (templateId) {
          const template = templates.find((t) => t.id === templateId);
          if (template) {
            // Deep copy to prevent mutating template
            initialExercises = JSON.parse(JSON.stringify(template.exercises));
            workoutTitle = template.title;
          }
        }

        // Auto-generate time-based title for quick/empty startups
        if (!workoutTitle) {
          const hour = new Date().getHours();
          if (hour >= 5 && hour < 12) {
            workoutTitle = 'Morning Workout';
          } else if (hour >= 12 && hour < 17) {
            workoutTitle = 'Midday Workout';
          } else if (hour >= 17 && hour < 21) {
            workoutTitle = 'Evening Workout';
          } else {
            workoutTitle = 'Night Workout';
          }
        }

        set({
          activeWorkout: {
            id: Date.now().toString(),
            startTime: Date.now(),
            templateId,
            workoutTitle,
            exercises: initialExercises,
            restTimerRemaining: 0,
            restTimerTarget: 60,
            isRestTimerActive: false,
          },
        });
      },

      finishWorkout: () => {
        const { activeWorkout, templates, history } = get();
        if (!activeWorkout) return null;

        // Calculate totalVolume (skipping warmUp sets)
        let totalVolume = 0;
        activeWorkout.exercises.forEach((ex) => {
          ex.sets.forEach((set) => {
            if (set.done && !set.isWarmUp) {
              totalVolume += (set.weight * set.reps);
            }
          });
        });

        // Determine title (use stored workoutTitle, fallback to template or default)
        let title = activeWorkout.workoutTitle || 'Freestyle Workout';

        const newSession: WorkoutSession = {
          id: activeWorkout.id,
          templateId: activeWorkout.templateId,
          title,
          startTime: activeWorkout.startTime,
          endTime: Date.now(),
          totalVolume,
          exercises: activeWorkout.exercises,
        };

        set({
          history: [newSession, ...history],
          activeWorkout: null,
        });

        return newSession.id;
      },

      cancelWorkout: () => {
        set({ activeWorkout: null });
      },

      renameWorkout: (title: string) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        set({ activeWorkout: { ...activeWorkout, workoutTitle: title } });
      },

      addExerciseToActive: (exerciseId: string, exerciseName: string) => {
        const { activeWorkout, history } = get();
        if (!activeWorkout) return;

        const uniqueId = Math.random().toString(36).substring(7) + '_' + Date.now().toString();
        
        // Find previous sets from history using exerciseId (backwards search for latest)
        let initialSets: SetData[] = [];
        for (let i = 0; i < history.length; i++) {
          const workout = history[i];
          const previousExercise = workout.exercises.find(ex => ex.exerciseId === exerciseId);
          if (previousExercise && previousExercise.sets.length > 0) {
            // Found the most recent session with this exercise. Clone its layout.
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

        // Fallback to single set if no history exists
        if (initialSets.length === 0) {
          initialSets = [
            { id: uniqueId + '_1', weight: 0, reps: 0, done: false }
          ];
        }

        const newExercise: Exercise = {
          id: uniqueId,
          exerciseId,
          name: exerciseName,
          sets: initialSets,
          weightUnit: 'kg',
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

      addSetToExercise: (exerciseId: string, isWarmUp?: boolean) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;

        const updatedExercises = activeWorkout.exercises.map((ex) => {
          if (ex.id === exerciseId) {
            const isWarmUpFlag = isWarmUp || false;
            let referenceSet = null;
            if (isWarmUpFlag) {
              // Get last warm-up set to copy its values
              referenceSet = ex.sets.filter(s => s.isWarmUp).pop();
            } else {
              // Get last normal set to copy its values
              referenceSet = ex.sets.filter(s => !s.isWarmUp).pop();
            }
            if (!referenceSet) referenceSet = ex.sets[ex.sets.length - 1];

            const newSet = {
              id: Date.now().toString() + '_' + (ex.sets.length + 1),
              weight: referenceSet ? referenceSet.weight : 0,
              reps: referenceSet ? referenceSet.reps : 0,
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

            return {
              ...ex,
              sets: newSets,
            };
          }
          return ex;
        });

        set({
          activeWorkout: { ...activeWorkout, exercises: updatedExercises },
        });
      },

      removeSetFromExercise: (exerciseId: string, setId: string) => {
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

      duplicateSet: (exerciseId: string, setId: string) => {
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
              done: false, // Duplicated sets should start unchecked
            };

            const newSets = [...ex.sets];
            newSets.splice(setIndex + 1, 0, duplicatedSet);

            return {
              ...ex,
              sets: newSets,
            };
          }
          return ex;
        });

        set({
          activeWorkout: { ...activeWorkout, exercises: updatedExercises },
        });
      },

      updateSet: (exerciseId: string, setId: string, data: Partial<SetData>) => {
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

      toggleSetDone: (exerciseId: string, setId: string) => {
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
              if (!s.done && s.weight > 0 && s.reps > 0) {
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

      removeExerciseFromActive: (exerciseId: string) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        set({
          activeWorkout: {
            ...activeWorkout,
            exercises: activeWorkout.exercises.filter(ex => ex.id !== exerciseId)
          }
        });
      },

      replaceExerciseInActive: (exerciseId: string, newExerciseId: string, newExerciseName: string) => {
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
          initialSets = [
            { id: uniqueId + '_1', weight: 0, reps: 0, done: false }
          ];
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
                  weightUnit: 'kg',
                  notes: [],
                  warmUpSetsEnabled: initialSets.some(s => s.isWarmUp),
                } as Exercise;
              }
              return ex;
            })
          }
        });
      },

      setExercisesOrderInActive: (newExercises: Exercise[]) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        set({
          activeWorkout: {
            ...activeWorkout,
            exercises: newExercises
          }
        });
      },

      addExerciseNote: (exerciseId: string, isSticky: boolean) => {
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

      updateExerciseNote: (exerciseId: string, noteId: string, text: string) => {
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

      deleteExerciseNote: (exerciseId: string, noteId: string) => {
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

      toggleWarmUpSets: (exerciseId: string) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        set({
          activeWorkout: {
            ...activeWorkout,
            exercises: activeWorkout.exercises.map(ex => {
              if (ex.id === exerciseId) {
                const toggled = !(ex.warmUpSetsEnabled || false);
                // If toggled on, auto-add a warm-up set if there are none? Let's leave it to user
                return { ...ex, warmUpSetsEnabled: toggled };
              }
              return ex;
            })
          }
        });
      },

      updateExerciseWeightUnit: (exerciseId: string, unit: 'kg' | 'lb') => {
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

      updateExerciseRestTimer: (exerciseId: string, seconds: number) => {
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

      startRestTimer: (exerciseId?: string, forceSeconds?: number) => {
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

        if (activeWorkout.restTimerRemaining <= 0) {
          // Keep active so UI can pulse, but don't decrement
          return;
        }

        set({
          activeWorkout: {
            ...activeWorkout,
            restTimerRemaining: activeWorkout.restTimerRemaining - 1,
          }
        });
      },

      adjustRestTimer: (offset: number) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;

        const newRemaining = Math.max(0, activeWorkout.restTimerRemaining + offset);
        
        set({
          activeWorkout: {
            ...activeWorkout,
            restTimerRemaining: newRemaining,
            // If it was finished, and we add time, make sure it stays active logically
            isRestTimerActive: true, 
          }
        });
      },

      addTemplate: (template: WorkoutTemplate) => {
        set((state) => ({
          templates: [...state.templates, template],
        }));
      },
    }),
    {
      name: 'formah-workout-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
