import { StateCreator } from 'zustand';
import { WorkoutStore, UserData } from '../types';

export interface UserSlice {
  updateUser: (data: Partial<UserData>) => void;
  setWeightUnit: (unit: 'kg' | 'lb') => void;
  completeOnboarding: () => void;
}

export const createUserSlice: StateCreator<WorkoutStore, [], [], UserSlice> = (set) => ({
  updateUser: (data) => {
    set((state) => ({
      user: { ...state.user, ...data }
    }));
  },
  setWeightUnit: (unit) => {
    set((state) => {
      const oldUnit = state.user.weightUnit;
      if (oldUnit === unit) return state;

      const convert = (w: number) => {
        if (w <= 0) return w;
        const factor = unit === 'lb' ? 2.20462 : (1 / 2.20462);
        return parseFloat((w * factor).toFixed(1));
      };

      const convertExercises = (exercises: any[]) => 
        exercises.map(ex => ({
          ...ex,
          sets: ex.sets.map((s: any) => ({ ...s, weight: convert(s.weight) }))
        }));

      // 1. Convert Active Workout
      let nextActiveWorkout = state.activeWorkout;
      if (nextActiveWorkout) {
        nextActiveWorkout = {
          ...nextActiveWorkout,
          exercises: convertExercises(nextActiveWorkout.exercises)
        };
      }

      // 2. Convert History
      const nextHistory = state.history.map(session => ({
        ...session,
        totalVolume: convert(session.totalVolume),
        exercises: convertExercises(session.exercises)
      }));

      // 3. Convert Templates
      const nextTemplates = state.templates.map(template => ({
        ...template,
        exercises: convertExercises(template.exercises)
      }));

      return {
        ...state,
        user: { ...state.user, weightUnit: unit },
        activeWorkout: nextActiveWorkout,
        history: nextHistory,
        templates: nextTemplates,
      };
    });
  },
  completeOnboarding: () => {
    set((state) => ({
      user: { ...state.user, hasSeenOnboarding: true }
    }));
  },
});
