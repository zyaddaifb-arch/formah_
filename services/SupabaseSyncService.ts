import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import { supabase } from '@/utils/supabase';

const SYNC_QUEUE_KEY = 'formah_sync_queue';

// PERF: Debounce delay for sync attempts (ms).
// Prevents slamming the network during rapid edits (e.g., typing weight values).
const SYNC_DEBOUNCE_MS = 1500;

export type SyncAction = {
  id: string;
  table: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: any;
  timestamp: number;
};

class SyncService {
  private isSyncing = false;
  private syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  async queueMutation(table: string, action: 'INSERT' | 'UPDATE' | 'DELETE', payload: any) {
    const queue = await this.getQueue();
    queue.push({
      id: Math.random().toString(36).substring(7),
      table,
      action,
      payload,
      timestamp: Date.now(),
    });
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));

    // PERF FIX: Debounce sync attempts instead of firing immediately.
    // If the user adds 5 sets quickly, we only sync ONCE after 1.5s of inactivity.
    this.debouncedSync();
  }

  private debouncedSync() {
    if (this.syncDebounceTimer) {
      clearTimeout(this.syncDebounceTimer);
    }
    this.syncDebounceTimer = setTimeout(() => {
      this.syncDebounceTimer = null;
      this.attemptSync();
    }, SYNC_DEBOUNCE_MS);
  }

  private async getQueue(): Promise<SyncAction[]> {
    const data = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private async setQueue(queue: SyncAction[]) {
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  }

  async attemptSync() {
    if (this.isSyncing) return;

    const networkState = await Network.getNetworkStateAsync();
    if (!networkState.isConnected || !networkState.isInternetReachable) {
      return;
    }

    const { useAuthStore } = require('@/store/authStore');
    const { user } = useAuthStore.getState();
    if (!user) return;

    const { useWorkoutStore } = await import('@/store/workoutStore');

    try {
      this.isSyncing = true;
      let queue = await this.getQueue();

      while (queue.length > 0) {
        const item = queue[0];
        let success = true;

        switch (item.table) {
          case 'profiles': {
            const { error: pErr } = await supabase.from('profiles').upsert([{ ...item.payload, id: user.id }]);
            if (pErr) { console.warn('Sync profile err:', pErr); success = false; }
            break;
          }
          case 'folders': {
            const { error: fErr } = item.action === 'DELETE'
              ? await supabase.from('folders').delete().eq('id', item.payload.id)
              : await supabase.from('folders').upsert([{ ...item.payload, user_id: user.id }]);
            if (fErr) { console.warn('Sync folder err:', fErr); success = false; }
            break;
          }
          case 'workout_templates': {
            const { error: tErr } = item.action === 'DELETE'
              ? await supabase.from('workout_templates').delete().eq('id', item.payload.id)
              : await supabase.from('workout_templates').upsert([{
                  id: item.payload.id,
                  title: item.payload.title,
                  type: item.payload.type,
                  time_estimate: item.payload.timeEstimate,
                  color: item.payload.color,
                  icon: item.payload.icon,
                  is_preset: item.payload.isPreset,
                  folder_id: item.payload.folderId,
                  is_archived: item.payload.isArchived,
                  exercises: item.payload.exercises || [],
                  user_id: user.id,
                  updated_at: new Date().toISOString(),
                }]);
            if (tErr) { console.warn('Sync template err:', tErr); success = false; }
            break;
          }
          case 'workout_sessions': {
            const { error: sErr } = item.action === 'DELETE'
              ? await supabase.from('workout_sessions').delete().eq('id', item.payload.id)
              : await supabase.from('workout_sessions').upsert([{
                  id: item.payload.id,
                  template_id: item.payload.templateId,
                  title: item.payload.title,
                  start_time: item.payload.startTime,
                  end_time: item.payload.endTime,
                  total_volume: item.payload.totalVolume,
                  exercises: item.payload.exercises || [],
                  user_id: user.id,
                }]);
            if (sErr) { console.warn('Sync session err:', sErr); success = false; }
            break;
          }
        }

        if (success) {
          queue.shift();
          await this.setQueue(queue);
        } else {
          console.warn('Sync stopped due to failure');
          break;
        }
      }
    } finally {
      this.isSyncing = false;
    }
  }

  async pullSync() {
    const networkState = await Network.getNetworkStateAsync();
    if (!networkState.isConnected || !networkState.isInternetReachable) {
      return;
    }

    const { useAuthStore } = require('@/store/authStore');
    const { user } = useAuthStore.getState();
    if (!user) return;

    const { useWorkoutStore } = await import('@/store/workoutStore');

    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profile) {
        useWorkoutStore.getState().updateUser({
          name: profile.full_name,
          weightUnit: profile.weight_unit || 'lb',
          hasSeenOnboarding: profile.has_seen_onboarding || false,
          avatarUri: profile.avatar_url,
        }, false);
      }

      const { data: folders } = await supabase.from('folders').select('*').eq('user_id', user.id);
      const { data: templates } = await supabase.from('workout_templates').select('*').eq('user_id', user.id);
      const { data: history } = await supabase.from('workout_sessions').select('*').eq('user_id', user.id);

      // PERF FIX: Merge incoming data with local state instead of wholesale replacement.
      // This prevents a "Nuclear Re-render" of all screens when pulling sync on startup.
      const currentState = useWorkoutStore.getState();

      if (folders) {
        const mappedFolders = folders.map(f => ({
          id: f.id,
          name: f.name,
          templateIds: templates?.filter(t => t.folder_id === f.id).map(t => t.id) || [],
          createdAt: new Date(f.created_at).getTime(),
        }));
        // Only update if data actually changed
        if (JSON.stringify(mappedFolders) !== JSON.stringify(currentState.folders)) {
          useWorkoutStore.setState({ folders: mappedFolders });
        }
      }

      if (templates) {
        const mappedTemplates = templates.map(t => ({
          id: t.id,
          title: t.title,
          type: t.type,
          timeEstimate: t.time_estimate,
          exercises: t.exercises || [],
          color: t.color,
          icon: t.icon,
          isPreset: t.is_preset,
          folderId: t.folder_id,
          isArchived: t.is_archived,
        }));
        if (JSON.stringify(mappedTemplates) !== JSON.stringify(currentState.templates)) {
          useWorkoutStore.setState({ templates: mappedTemplates });
        }
      }

      if (history) {
        const mappedHistory = history.map(h => ({
          id: h.id,
          templateId: h.template_id,
          title: h.title,
          startTime: Number(h.start_time),
          endTime: h.end_time ? Number(h.end_time) : Number(h.start_time),
          totalVolume: h.total_volume,
          exercises: h.exercises || [],
        }));
        if (JSON.stringify(mappedHistory) !== JSON.stringify(currentState.history)) {
          useWorkoutStore.setState({ history: mappedHistory });
        }
      }
    } catch (e) {
      console.error('Pull Sync Error', e);
    }
  }
}

export const SupabaseSyncService = new SyncService();
