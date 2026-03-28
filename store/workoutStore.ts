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

const initialTemplates = [
  {
    id: 'template_push_1',
    title: 'Push Day',
    type: 'Hypertrophy',
    timeEstimate: '45m',
    color: '#81ECFF',
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
    color: '#FF716C',
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
    color: '#E0E3FF',
    icon: 'run',
    exercises: [
      { id: 'ex_5', name: 'Squat', sets: [{ id: 's_13', weight: 0, reps: 0, done: false }, { id: 's_14', weight: 0, reps: 0, done: false }, { id: 's_15', weight: 0, reps: 0, done: false }] },
      { id: 'ex_6', name: 'Deadlift', sets: [{ id: 's_16', weight: 0, reps: 0, done: false }, { id: 's_17', weight: 0, reps: 0, done: false }] }
    ]
  }
];

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (...a) => ({
      templates: initialTemplates,
      history: [],
      activeWorkout: null,
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
    }),
    {
      name: 'formah-workout-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
