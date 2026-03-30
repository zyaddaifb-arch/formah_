import { WorkoutTemplate } from './types';

export const PRESET_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'preset_push',
    title: 'Push Day',
    type: 'Hypertrophy',
    timeEstimate: '45m',
    color: '#81ECFF',
    icon: 'arm-flex',
    isPreset: true,
    exercises: [
      { id: 'ex_p_1', name: 'Barbell Bench Press', sets: [{ id: 's_p_1_1', weight: 60, reps: 10, done: false }, { id: 's_p_1_2', weight: 60, reps: 10, done: false }, { id: 's_p_1_3', weight: 60, reps: 8, done: false }], notes: [], warmUpSetsEnabled: false },
      { id: 'ex_p_2', name: 'Overhead Press', sets: [{ id: 's_p_2_1', weight: 40, reps: 10, done: false }, { id: 's_p_2_2', weight: 40, reps: 10, done: false }], notes: [], warmUpSetsEnabled: false },
      { id: 'ex_p_3', name: 'Incline Dumbbell Press', sets: [{ id: 's_p_3_1', weight: 20, reps: 12, done: false }, { id: 's_p_3_2', weight: 20, reps: 12, done: false }], notes: [], warmUpSetsEnabled: false },
      { id: 'ex_p_4', name: 'Triceps Pushdown', sets: [{ id: 's_p_4_1', weight: 15, reps: 15, done: false }, { id: 's_p_4_2', weight: 15, reps: 15, done: false }], notes: [], warmUpSetsEnabled: false }
    ]
  },
  {
    id: 'preset_pull',
    title: 'Pull Day',
    type: 'Strength',
    timeEstimate: '50m',
    color: '#FF716C',
    icon: 'reproduction',
    isPreset: true,
    exercises: [
      { id: 'ex_l_1', name: 'Pull-up', sets: [{ id: 's_l_1_1', weight: 0, reps: 8, done: false }, { id: 's_l_1_2', weight: 0, reps: 8, done: false }, { id: 's_l_1_3', weight: 0, reps: 6, done: false }], notes: [], warmUpSetsEnabled: false },
      { id: 'ex_l_2', name: 'Dumbbell Row', sets: [{ id: 's_l_2_1', weight: 24, reps: 10, done: false }, { id: 's_l_2_2', weight: 24, reps: 10, done: false }], notes: [], warmUpSetsEnabled: false },
      { id: 'ex_l_3', name: 'Lat Pulldown', sets: [{ id: 's_l_3_1', weight: 50, reps: 12, done: false }, { id: 's_l_3_2', weight: 50, reps: 12, done: false }], notes: [], warmUpSetsEnabled: false },
      { id: 'ex_l_4', name: 'Bicep Curl', sets: [{ id: 's_l_4_1', weight: 12.5, reps: 12, done: false }, { id: 's_l_4_2', weight: 12.5, reps: 12, done: false }], notes: [], warmUpSetsEnabled: false }
    ]
  },
  {
    id: 'preset_legs',
    title: 'Leg Day',
    type: 'Power',
    timeEstimate: '60m',
    color: '#E0E3FF',
    icon: 'run',
    isPreset: true,
    exercises: [
      { id: 'ex_le_1', name: 'Squat', sets: [{ id: 's_le_1_1', weight: 80, reps: 5, done: false }, { id: 's_le_1_2', weight: 80, reps: 5, done: false }, { id: 's_le_1_3', weight: 80, reps: 5, done: false }], notes: [], warmUpSetsEnabled: false },
      { id: 'ex_le_2', name: 'Deadlift', sets: [{ id: 's_le_2_1', weight: 100, reps: 5, done: false }, { id: 's_le_2_2', weight: 100, reps: 5, done: false }], notes: [], warmUpSetsEnabled: false },
      { id: 'ex_le_3', name: 'Leg Press', sets: [{ id: 's_le_3_1', weight: 120, reps: 12, done: false }, { id: 's_le_3_2', weight: 120, reps: 12, done: false }], notes: [], warmUpSetsEnabled: false },
      { id: 'ex_le_4', name: 'Calf Raises', sets: [{ id: 's_le_4_1', weight: 60, reps: 15, done: false }, { id: 's_le_4_2', weight: 60, reps: 15, done: false }], notes: [], warmUpSetsEnabled: false }
    ]
  }
];
