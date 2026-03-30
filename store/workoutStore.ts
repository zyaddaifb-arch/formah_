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
    (...a) => ({
      templates: [],
      folders: [],
      history: [],
      activeWorkout: null,
      draftTemplate: null,
      user: {
        name: 'Alex Thorne',
        avatarUri: null,
        weightUnit: 'lb',
      },
      ...createExerciseSlice(...a),
      ...createSetSlice(...a),
      ...createTimerSlice(...a),
      ...createWorkflowSlice(...a),
      ...createTemplateSlice(...a),
      ...createUserSlice(...a),
      ...createFolderSlice(...a),
    }),
    {
      name: 'formah-workout-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
