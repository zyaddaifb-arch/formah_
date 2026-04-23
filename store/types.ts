export type ExerciseType = 'weight_reps' | 'reps_only' | 'duration' | 'weight_only';

export type SetData = {
  id: string;
  weight?: number;
  reps?: number;
  time?: number; // In seconds
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

export type FocusMetricType = 'total_volume' | 'volume_increase' | 'total_reps' | 'weight_rep' | 'estimated_1rm';

export type Exercise = {
  id: string;
  exerciseId?: string;
  name: string;
  sets: SetData[];
  weightUnit?: 'kg' | 'lb';
  notes?: ExerciseNote[];
  warmUpSetsEnabled?: boolean;
  defaultRestTimer?: number; // In seconds
  focusMetric?: FocusMetricType;
  exerciseType?: ExerciseType;
};

export type WorkoutTemplate = {
  id: string;
  title: string;
  type: string;
  timeEstimate: string;
  exercises: Exercise[];
  color: string;
  icon: string;
  isPreset?: boolean;
  folderId?: string;
  isArchived?: boolean;
};

export type WorkoutFolder = {
  id: string;
  name: string;
  templateIds: string[];
  createdAt: number;
};

export type ActiveWorkout = {
  id: string;
  startTime: number;
  templateId?: string;
  workoutTitle: string;
  exercises: Exercise[];
  
  // Rest Timer State
  // NOTE: restTimerEndTimestamp is the source of truth.
  // restTimerRemaining is computed locally in UI hooks — NOT stored/ticked in the store.
  restTimerEndTimestamp?: number; // Unix ms timestamp when timer should end
  restTimerTarget: number;       // Duration in seconds
  isRestTimerActive: boolean;
  restTimerRemaining: number;    // Kept for serialization compatibility but NOT ticked via store
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
  hasSeenOnboarding: boolean;
  isRestTimerEnabled: boolean;
  defaultRestTimer: number; // in seconds
  customExercises?: LibraryExercise[];
  streakGoalType?: 'daily' | 'folder';
  streakGoalFolderId?: string; // "uncategorized" or folder id
}

export interface WorkoutState {
  _hasHydrated: boolean;
  templates: WorkoutTemplate[];
  folders: WorkoutFolder[];
  history: WorkoutSession[];
  activeWorkout: ActiveWorkout | null;
  draftTemplate: WorkoutTemplate | null;
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
  updateExerciseFocusMetric: (exerciseId: string, metric: FocusMetricType) => void;
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
  deleteSession: (sessionId: string) => void;
  updateSession: (sessionId: string, data: Partial<WorkoutSession>) => void;
}

export interface TemplateActions {
  addTemplate: (template: WorkoutTemplate) => void;
  startTemplateCreation: (templateId?: string, folderId?: string) => void;
  addExerciseToDraft: (exerciseId: string, name: string) => void;
  removeExerciseFromDraft: (exerciseId: string) => void;
  addSetToDraftExercise: (exerciseId: string, isWarmUp?: boolean) => void;
  removeSetFromDraftExercise: (exerciseId: string, setId: string) => void;
  updateSetInDraft: (exerciseId: string, setId: string, data: Partial<SetData>) => void;
  updateDraftTemplateName: (name: string) => void;
  setExercisesOrderInDraft: (newExercises: Exercise[]) => void;
  saveDraftTemplate: () => void;
  cancelTemplateCreation: () => void;
  updateDraftExerciseNote: (exerciseId: string, noteId: string, text: string) => void;
  deleteDraftExerciseNote: (exerciseId: string, noteId: string) => void;
  addDraftExerciseNote: (exerciseId: string, isSticky: boolean) => void;
  replaceDraftExercise: (oldExerciseId: string, newExerciseId: string, newName: string) => void;
  updateDraftTemplate: (data: Partial<WorkoutTemplate>) => void;
  
  // New actions for Template Card Options
  archiveTemplate: (id: string) => void;
  unarchiveTemplate: (id: string) => void;
  deleteTemplate: (id: string) => void;
  duplicateTemplate: (id: string) => void;
  renameTemplate: (id: string, newName: string) => void;
  moveTemplate: (id: string, folderId?: string) => void;
  updateDraftExerciseFocusMetric: (exerciseId: string, metric: FocusMetricType) => void;
}

export interface UserActions {
  updateUser: (data: Partial<UserData>, shouldSync?: boolean) => void;
  setWeightUnit: (unit: 'kg' | 'lb') => void;
  completeOnboarding: () => void;
  addCustomExercise: (exercise: LibraryExercise) => void;
}

export interface FolderActions {
  createFolder: (name: string) => void;
  deleteFolder: (folderId: string, deleteTemplates?: boolean) => void;
  renameFolder: (folderId: string, newName: string) => void;
  addTemplateToFolder: (folderId: string, templateId: string) => void;
  removeTemplateFromFolder: (folderId: string, templateId: string) => void;
  moveFolderTemplates: (sourceFolderId: string, targetFolderId?: string) => void;
}

export type WorkoutStore = WorkoutState & 
  ExerciseActions & 
  SetActions & 
  TimerActions & 
  WorkflowActions & 
  TemplateActions &
  UserActions &
  FolderActions & {
    setHasHydrated: (state: boolean) => void;
    reset: (fullWipe?: boolean) => void;
  };

// ─── Exercise Library ─────────────────────────────────────────────────────────
export type LibraryExercise = {
  id: string;
  name: string;
  category: string;
  exerciseType: ExerciseType;
  bodyPart: string;
  image?: string;
  frequency?: number;
  lastPerformed?: string;
};

