import { create } from 'zustand';
import { supabase } from '@/utils/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useWorkoutStore } from './workoutStore';
import { SupabaseSyncService } from '@/services/SupabaseSyncService';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: any | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setProfile: (profile: any | null) => void;
  signOut: () => Promise<void>;
  fetchProfile: (uid: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,

  setSession: (session) => set({ session, loading: session ? get().loading : false }),
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile, loading: false }),

  signOut: async () => {
    await supabase.auth.signOut();
    useWorkoutStore.getState().reset();
    set({ session: null, user: null, profile: null, loading: false });
  },

  fetchProfile: async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      set({ profile: data || null, loading: false });

      // After verifying profile exists (or creating it initially), pull the rest of the workout data
      await SupabaseSyncService.pullSync();

    } catch (error) {
      console.error('Fetch profile error:', error);
      set({ loading: false });
    }
  },
}));

