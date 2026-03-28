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

export interface UserData {
  name: string;
  avatarUri: string | null;
  weightUnit: 'kg' | 'lb';
}

export interface WorkoutState {
  templates: WorkoutTemplate[];
  history: WorkoutSession[];
  activeWorkout: ActiveWorkout | null;
  user: UserData;
}

export interface ExerciseActions {
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

export interface SetActions {
  addSetToExercise: (exerciseId: string, isWarmUp?: boolean) => void;
  removeSetFromExercise: (exerciseId: string, setId: string) => void;
  duplicateSet: (exerciseId: string, setId: string) => void;
  updateSet: (exerciseId: string, setId: string, data: Partial<SetData>) => void;
  toggleSetDone: (exerciseId: string, setId: string) => void;
  markAllValidSetsDone: () => void;
}

export interface TimerActions {
  startRestTimer: (exerciseId?: string, forceSeconds?: number) => void;
  stopRestTimer: () => void;
  tickRestTimer: () => void;
  adjustRestTimer: (offset: number) => void;
}

export interface WorkflowActions {
  startWorkout: (templateId?: string) => void;
  finishWorkout: () => string | null;
  cancelWorkout: () => void;
  renameWorkout: (title: string) => void;
}

export interface TemplateActions {
  addTemplate: (template: WorkoutTemplate) => void;
}

export interface UserActions {
  updateUser: (data: Partial<UserData>) => void;
  setWeightUnit: (unit: 'kg' | 'lb') => void;
}

export type WorkoutStore = WorkoutState & 
  ExerciseActions & 
  SetActions & 
  TimerActions & 
  WorkflowActions & 
  TemplateActions &
  UserActions;
