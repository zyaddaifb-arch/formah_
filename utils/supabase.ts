import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = 'https://cqckuldmpmjpjqofmejt.supabase.co';
const supabaseAnonKey = 'sb_publishable_apyynHVzdSKZpaWRH-4o-g_HzLrJYel';

// Check if we are in a web environment during SSR (Node.js)
const isNodeServer = Platform.OS === 'web' && typeof window === 'undefined';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: isNodeServer ? undefined : AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
