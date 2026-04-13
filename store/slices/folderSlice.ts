import { StateCreator } from 'zustand';
import { WorkoutStore, WorkoutFolder } from '../types';
import { SupabaseSyncService } from '@/services/SupabaseSyncService';
import { generateUUID } from '@/utils/uuid';

export interface FolderSlice {
  createFolder: (name: string) => void;
  deleteFolder: (folderId: string, deleteTemplates?: boolean) => void;
  renameFolder: (folderId: string, newName: string) => void;
  addTemplateToFolder: (folderId: string, templateId: string) => void;
  removeTemplateFromFolder: (folderId: string, templateId: string) => void;
  moveFolderTemplates: (sourceFolderId: string, targetFolderId?: string) => void;
}

export const createFolderSlice: StateCreator<WorkoutStore, [], [], FolderSlice> = (set, get) => ({
  createFolder: (name) => {
    const newFolder: WorkoutFolder = {
      id: generateUUID(),
      name,
      templateIds: [],
      createdAt: Date.now(),
    };
    set((state) => ({
      folders: [...state.folders, newFolder],
    }));
    SupabaseSyncService.queueMutation('folders', 'INSERT', newFolder);
  },

  deleteFolder: (folderId, deleteTemplates = false) => {
    set((state) => ({
      folders: state.folders.filter((f) => f.id !== folderId),
      templates: deleteTemplates 
        ? state.templates.filter((t) => t.folderId !== folderId)
        : state.templates.map((t) => 
            t.folderId === folderId ? { ...t, folderId: undefined } : t
          ),
    }));
    SupabaseSyncService.queueMutation('folders', 'DELETE', { id: folderId });
  },

  renameFolder: (folderId, newName) => {
    set((state) => {
      const folders = state.folders.map((f) => f.id === folderId ? { ...f, name: newName } : f);
      const folder = folders.find(f => f.id === folderId);
      if (folder) SupabaseSyncService.queueMutation('folders', 'UPDATE', folder);
      return { folders };
    });
  },

  addTemplateToFolder: (folderId, templateId) => {
    set((state) => ({
      folders: state.folders.map((f) =>
        f.id === folderId 
          ? { ...f, templateIds: Array.from(new Set([...f.templateIds, templateId])) } 
          : f
      ),
      templates: state.templates.map((t) =>
        t.id === templateId ? { ...t, folderId } : t
      ),
    }));
  },

  removeTemplateFromFolder: (folderId, templateId) => {
    set((state) => ({
      folders: state.folders.map((f) =>
        f.id === folderId 
          ? { ...f, templateIds: f.templateIds.filter((id) => id !== templateId) } 
          : f
      ),
      templates: state.templates.map((t) =>
        t.id === templateId && t.folderId === folderId ? { ...t, folderId: undefined } : t
      ),
    }));
  },

  moveFolderTemplates: (sourceFolderId, targetFolderId) => {
    set((state) => {
      const sourceTemplateIds = state.templates.filter(t => t.folderId === sourceFolderId).map(t => t.id);
      
      return {
        templates: state.templates.map((t) => 
          t.folderId === sourceFolderId ? { ...t, folderId: targetFolderId } : t
        ),
        folders: state.folders.map(f => {
          if (f.id === targetFolderId) {
            return { ...f, templateIds: Array.from(new Set([...f.templateIds, ...sourceTemplateIds])) };
          }
          if (f.id === sourceFolderId) {
            return { ...f, templateIds: [] };
          }
          return f;
        })
      };
    });
  },
});
