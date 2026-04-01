import { StateCreator } from 'zustand';
import { WorkoutStore, WorkoutSession, Exercise } from '../types';
import { PRESET_TEMPLATES } from '../presets';
import { SupabaseSyncService } from '@/services/SupabaseSyncService';

export interface WorkflowSlice {
  startWorkout: (templateId?: string) => void;
  finishWorkout: () => string | null;
  cancelWorkout: () => void;
  renameWorkout: (title: string) => void;
  deleteSession: (sessionId: string) => void;
  updateSession: (sessionId: string, data: Partial<WorkoutSession>) => void;
}

export const createWorkflowSlice: StateCreator<WorkoutStore, [], [], WorkflowSlice> = (set, get) => ({
  startWorkout: (templateId) => {
    const { templates } = get();
    let initialExercises: Exercise[] = [];
    let workoutTitle = '';

    if (templateId) {
      const allTemplates = [...templates, ...PRESET_TEMPLATES];
      const template = allTemplates.find((t) => t.id === templateId);
      if (template) {
        initialExercises = JSON.parse(JSON.stringify(template.exercises));
        workoutTitle = template.title;
      }
    }

    if (!workoutTitle) {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) workoutTitle = 'Morning Workout';
      else if (hour >= 12 && hour < 17) workoutTitle = 'Midday Workout';
      else if (hour >= 17 && hour < 21) workoutTitle = 'Evening Workout';
      else workoutTitle = 'Night Workout';
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
    const { activeWorkout, history } = get();
    if (!activeWorkout) return null;

    let totalVolume = 0;
    activeWorkout.exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        if (set.done && !set.isWarmUp) {
          totalVolume += (set.weight * set.reps);
        }
      });
    });

    const title = activeWorkout.workoutTitle || 'Freestyle Workout';

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

    SupabaseSyncService.queueMutation('workout_sessions', 'INSERT', newSession);

    return newSession.id;
  },

  cancelWorkout: () => {
    set({ activeWorkout: null });
  },

  renameWorkout: (title) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    set({ activeWorkout: { ...activeWorkout, workoutTitle: title } });
  },

  deleteSession: (sessionId) => {
    set((state) => ({
      history: state.history.filter(s => s.id !== sessionId),
    }));
    SupabaseSyncService.queueMutation('workout_sessions', 'DELETE', { id: sessionId });
  },

  updateSession: (sessionId, data) => {
    set((state) => {
      const updatedHistory = state.history.map(s => s.id === sessionId ? { ...s, ...data } : s);
      const session = updatedHistory.find(s => s.id === sessionId);
      if (session) SupabaseSyncService.queueMutation('workout_sessions', 'UPDATE', session);
      return { history: updatedHistory };
    });
  },
});
