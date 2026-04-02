import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutStore } from './types';
import { createExerciseSlice } from './slices/exerciseSlice';
import { createSetSlice } from './slices/setSlice';
import { createTimerSlice } from './slices/timerSlice';
import { createWorkflowSlice } from './slices/workflowSlice';
import { createTemplateSlice } from './slices/templateSlice';
import { createUserSlice } from './slices/userSlice';
import { createFolderSlice } from './slices/folderSlice';

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get, store) => ({
      _hasHydrated: false,
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
      templates: [],
      folders: [],
      history: [],
      activeWorkout: null,
      draftTemplate: null,
      user: {
        name: 'Alex Thorne',
        avatarUri: null,
        weightUnit: 'lb',
        hasSeenOnboarding: false,
      },
      ...createExerciseSlice(set, get, store),
      ...createSetSlice(set, get, store),
      ...createTimerSlice(set, get, store),
      ...createWorkflowSlice(set, get, store),
      ...createTemplateSlice(set, get, store),
      ...createUserSlice(set, get, store),
      ...createFolderSlice(set, get, store),
      reset: () => set({
        templates: [],
        folders: [],
        history: [],
        activeWorkout: null,
        draftTemplate: null,
        user: {
          name: 'Alex Thorne',
          avatarUri: null,
          weightUnit: 'lb',
          hasSeenOnboarding: false,
        },
      }),
    }),

    {
      name: 'formah-workout-storage',
      storage: createJSONStorage(() => AsyncStorage),

      // PERF FIX: Only persist what's needed. Excluded fields:
      // - `draftTemplate`: transient UI state, not critical to survive a restart
      // - `restTimerRemaining`: derived from restTimerEndTimestamp at runtime
      // - `_hasHydrated`: always reset on startup
      partialize: (state) => ({
        templates: state.templates,
        folders: state.folders,
        history: state.history,
        activeWorkout: state.activeWorkout
          ? {
              ...state.activeWorkout,
              // Don't persist restTimerRemaining — it's re-computed from the timestamp
              restTimerRemaining: 0,
              // Preserve timestamp and active flag so timer resumes after crash
              restTimerEndTimestamp: state.activeWorkout.restTimerEndTimestamp,
              isRestTimerActive: state.activeWorkout.isRestTimerActive,
            }
          : null,
        user: state.user,
      }),

      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
