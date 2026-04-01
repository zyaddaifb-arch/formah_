import { StateCreator } from 'zustand';
import { WorkoutStore, UserData } from '../types';
import { SupabaseSyncService } from '@/services/SupabaseSyncService';

export interface UserSlice {
  updateUser: (data: Partial<UserData>) => void;
  setWeightUnit: (unit: 'kg' | 'lb') => void;
  completeOnboarding: () => void;
}

export const createUserSlice: StateCreator<WorkoutStore, [], [], UserSlice> = (set) => ({
  updateUser: (data) => {
    set((state) => {
      const user = { ...state.user, ...data };
      SupabaseSyncService.queueMutation('profiles', 'UPDATE', {
        full_name: user.name,
        avatar_url: user.avatarUri,
      });
      return { user };
    });
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

      SupabaseSyncService.queueMutation('profiles', 'UPDATE', {
        weight_unit: unit,
      });

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
    set((state) => {
      SupabaseSyncService.queueMutation('profiles', 'UPDATE', {
        has_seen_onboarding: true,
      });
      return { user: { ...state.user, hasSeenOnboarding: true } };
    });
  },
});
