import { StateCreator } from 'zustand';
import { WorkoutStore, WorkoutTemplate, Exercise, SetData } from '../types';
import { SupabaseSyncService } from '@/services/SupabaseSyncService';

export interface TemplateSlice {
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
  archiveTemplate: (id: string) => void;
  unarchiveTemplate: (id: string) => void;
  deleteTemplate: (id: string) => void;
  duplicateTemplate: (id: string) => void;
  renameTemplate: (id: string, newName: string) => void;
  moveTemplate: (id: string, folderId?: string) => void;
}

export const createTemplateSlice: StateCreator<WorkoutStore, [], [], TemplateSlice> = (set, get) => ({
  addTemplate: (template) => {
    set((state) => ({
      templates: [...state.templates, template],
    }));
  },

  startTemplateCreation: (templateId, folderId) => {
    const { templates } = get();
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        set({ draftTemplate: JSON.parse(JSON.stringify(template)) });
        return;
      }
    }
    
    set({
      draftTemplate: {
        id: 'temp_' + Date.now(),
        title: 'New Template',
        type: 'Custom',
        timeEstimate: '45m',
        exercises: [],
        color: '#81ECFF',
        icon: 'clipboard-text-outline',
        folderId: folderId,
      }
    });
  },

  addExerciseToDraft: (exerciseId, name) => {
    const { draftTemplate } = get();
    if (!draftTemplate) return;

    const uniqueId = Math.random().toString(36).substring(7) + '_' + Date.now().toString();
    const newExercise: Exercise = {
      id: uniqueId,
      exerciseId,
      name,
      sets: [{ id: uniqueId + '_1', weight: 0, reps: 0, done: false }],
      notes: [],
      warmUpSetsEnabled: false,
    };

    set({
      draftTemplate: {
        ...draftTemplate,
        exercises: [...draftTemplate.exercises, newExercise],
      }
    });
  },

  removeExerciseFromDraft: (exerciseId) => {
    const { draftTemplate } = get();
    if (!draftTemplate) return;
    set({
      draftTemplate: {
        ...draftTemplate,
        exercises: draftTemplate.exercises.filter(ex => ex.id !== exerciseId)
      }
    });
  },

  addSetToDraftExercise: (exerciseId, isWarmUp) => {
    const { draftTemplate } = get();
    if (!draftTemplate) return;

    const updatedExercises = draftTemplate.exercises.map((ex) => {
      if (ex.id === exerciseId) {
        const isWarmUpFlag = isWarmUp || false;
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSet = {
          id: Date.now().toString() + '_' + (ex.sets.length + 1),
          weight: lastSet ? lastSet.weight : 0,
          reps: lastSet ? lastSet.reps : 0,
          done: false,
          isWarmUp: isWarmUpFlag,
        };
        
        const newSets = [...ex.sets];
        if (isWarmUpFlag) {
          const firstNormalIdx = newSets.findIndex(s => !s.isWarmUp);
          if (firstNormalIdx === -1) newSets.push(newSet);
          else newSets.splice(firstNormalIdx, 0, newSet);
        } else {
          newSets.push(newSet);
        }
        return { ...ex, sets: newSets };
      }
      return ex;
    });

    set({ draftTemplate: { ...draftTemplate, exercises: updatedExercises } });
  },

  removeSetFromDraftExercise: (exerciseId, setId) => {
    const { draftTemplate } = get();
    if (!draftTemplate) return;

    const updatedExercises = draftTemplate.exercises.map((ex) => {
      if (ex.id === exerciseId) {
        return { ...ex, sets: ex.sets.filter((s) => s.id !== setId) };
      }
      return ex;
    }).filter(ex => ex.sets.length > 0);

    set({ draftTemplate: { ...draftTemplate, exercises: updatedExercises } });
  },

  updateSetInDraft: (exerciseId, setId, data) => {
    const { draftTemplate } = get();
    if (!draftTemplate) return;

    const updatedExercises = draftTemplate.exercises.map((ex) => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...data } : s)),
        };
      }
      return ex;
    });

    set({ draftTemplate: { ...draftTemplate, exercises: updatedExercises } });
  },

  updateDraftTemplateName: (name) => {
    const { draftTemplate } = get();
    if (!draftTemplate) return;
    set({ draftTemplate: { ...draftTemplate, title: name } });
  },

  setExercisesOrderInDraft: (newExercises) => {
    const { draftTemplate } = get();
    if (!draftTemplate) return;
    set({ draftTemplate: { ...draftTemplate, exercises: newExercises } });
  },

  saveDraftTemplate: () => {
    const { draftTemplate, templates } = get();
    if (!draftTemplate) return;

    const existingIndex = templates.findIndex(t => t.id === draftTemplate.id);
    const newTemplates = [...templates];
    if (existingIndex >= 0) {
      newTemplates[existingIndex] = draftTemplate;
      set({ templates: newTemplates, draftTemplate: null });
      SupabaseSyncService.queueMutation('workout_templates', 'UPDATE', draftTemplate);
    } else {
      set({ templates: [...templates, draftTemplate], draftTemplate: null });
      SupabaseSyncService.queueMutation('workout_templates', 'INSERT', draftTemplate);
    }
  },

  cancelTemplateCreation: () => {
    set({ draftTemplate: null });
  },
  
  addDraftExerciseNote: (exerciseId, isSticky) => {
    const { draftTemplate } = get();
    if (!draftTemplate) return;
    const updatedExercises = draftTemplate.exercises.map(ex => {
      if (ex.id === exerciseId) {
        const newNote = {
          id: Date.now().toString(),
          exerciseId,
          text: '',
          createdAt: Date.now(),
          isSticky,
        };
        return { ...ex, notes: [...(ex.notes || []), newNote] };
      }
      return ex;
    });
    set({ draftTemplate: { ...draftTemplate, exercises: updatedExercises } });
  },

  updateDraftExerciseNote: (exerciseId, noteId, text) => {
    const { draftTemplate } = get();
    if (!draftTemplate) return;
    const updatedExercises = draftTemplate.exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          notes: (ex.notes || []).map(n => n.id === noteId ? { ...n, text } : n)
        };
      }
      return ex;
    });
    set({ draftTemplate: { ...draftTemplate, exercises: updatedExercises } });
  },

  deleteDraftExerciseNote: (exerciseId, noteId) => {
    const { draftTemplate } = get();
    if (!draftTemplate) return;
    const updatedExercises = draftTemplate.exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          notes: (ex.notes || []).filter(n => n.id !== noteId)
        };
      }
      return ex;
    });
    set({ draftTemplate: { ...draftTemplate, exercises: updatedExercises } });
  },

  replaceDraftExercise: (oldExerciseId, newExerciseId, newName) => {
    const { draftTemplate } = get();
    if (!draftTemplate) return;

    const uniqueId = Math.random().toString(36).substring(7) + '_' + Date.now().toString();
    const newExercise: Exercise = {
        id: uniqueId,
        exerciseId: newExerciseId,
        name: newName,
        sets: [{ id: uniqueId + '_1', weight: 0, reps: 0, done: false }],
        notes: [],
        warmUpSetsEnabled: false,
    };

    const updatedExercises = draftTemplate.exercises.map(ex => 
        ex.id === oldExerciseId ? newExercise : ex
    );

    set({ draftTemplate: { ...draftTemplate, exercises: updatedExercises } });
  },

  updateDraftTemplate: (data) => {
    const { draftTemplate } = get();
    if (!draftTemplate) return;
    set({ draftTemplate: { ...draftTemplate, ...data } });
  },

  archiveTemplate: (id: string) => {
    set((state) => {
      const templates = state.templates.map(t => t.id === id ? { ...t, isArchived: true } : t);
      const template = templates.find(t => t.id === id);
      if (template) SupabaseSyncService.queueMutation('workout_templates', 'UPDATE', template);
      return { templates };
    });
  },

  unarchiveTemplate: (id: string) => {
    set((state) => {
      const templates = state.templates.map(t => t.id === id ? { ...t, isArchived: false } : t);
      const template = templates.find(t => t.id === id);
      if (template) SupabaseSyncService.queueMutation('workout_templates', 'UPDATE', template);
      return { templates };
    });
  },

  deleteTemplate: (id: string) => {
    set((state) => ({
      templates: state.templates.filter(t => t.id !== id)
    }));
    SupabaseSyncService.queueMutation('workout_templates', 'DELETE', { id });
  },

  duplicateTemplate: (id: string) => {
    const { templates } = get();
    const sourceTemplate = templates.find(t => t.id === id);
    if (!sourceTemplate) return;

    const duplicated: WorkoutTemplate = {
      ...JSON.parse(JSON.stringify(sourceTemplate)),
      id: 'template_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      title: `${sourceTemplate.title} (Copy)`,
      isPreset: false, // Ensure a duplicated preset becomes a custom user template
    };

    set((state) => ({
      templates: [...state.templates, duplicated]
    }));
    SupabaseSyncService.queueMutation('workout_templates', 'INSERT', duplicated);
  },

  renameTemplate: (id: string, newName: string) => {
    set((state) => {
      const templates = state.templates.map(t => t.id === id ? { ...t, title: newName } : t);
      const template = templates.find(t => t.id === id);
      if (template) SupabaseSyncService.queueMutation('workout_templates', 'UPDATE', template);
      return { templates };
    });
  },
  
  moveTemplate: (id: string, folderId?: string) => {
    set((state) => {
      const templates = state.templates.map(t => t.id === id ? { ...t, folderId } : t);
      const template = templates.find(t => t.id === id);
      if (template) SupabaseSyncService.queueMutation('workout_templates', 'UPDATE', template);
      return { templates };
    });
  },
});
