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
    }
  )
);

