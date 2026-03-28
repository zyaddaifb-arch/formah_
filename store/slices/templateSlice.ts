import { StateCreator } from 'zustand';
import { WorkoutStore, WorkoutTemplate } from '../types';

export interface TemplateSlice {
  addTemplate: (template: WorkoutTemplate) => void;
}

export const createTemplateSlice: StateCreator<WorkoutStore, [], [], TemplateSlice> = (set) => ({
  addTemplate: (template) => {
    set((state) => ({
      templates: [...state.templates, template],
    }));
  },
});
