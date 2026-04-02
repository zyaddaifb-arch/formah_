import 'react-native-gesture-handler';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts, SpaceGrotesk_700Bold, SpaceGrotesk_500Medium, SpaceGrotesk_400Regular } from '@expo-google-fonts/space-grotesk';
import { Manrope_400Regular, Manrope_700Bold, Manrope_500Medium } from '@expo-google-fonts/manrope';
import { View, ActivityIndicator, AppState, AppStateStatus } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { supabase } from '@/utils/supabase';
import { useAuthStore } from '@/store/authStore';
import { useWorkoutStore } from '@/store/workoutStore';
import { SupabaseSyncService } from '@/services/SupabaseSyncService';
import { soundService } from '@/services/SoundService';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { setSession, setUser, fetchProfile, session, loading } = useAuthStore();
  const [isAppReady, setIsAppReady] = useState(false);
  const _hasHydrated = useWorkoutStore(state => state._hasHydrated);
  
  const [loaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_700Bold,
  });

  // Initial Auth Check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setIsAppReady(true));
      } else {
        setIsAppReady(true);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);

      if (event === 'PASSWORD_RECOVERY') {
        router.push('/reset-password');
      }
    });

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Initialize Sound Service
  useEffect(() => {
    soundService.init();
    return () => {
      soundService.unloadAll();
    };
  }, []);

  // Sync on App Foregrounding
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && session) {
        SupabaseSyncService.attemptSync();
      }
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [session]);

  // Simplified Redirect Logic
  useEffect(() => {
    if (!loaded || !isAppReady || !_hasHydrated) return;

    const onboardingSeen = useWorkoutStore.getState().user.hasSeenOnboarding;
    const firstSegment = segments[0] as string;
    
    // Define screen groups
    const isAuthScreen = ['auth', 'forgot-password', 'reset-password', 'onboarding'].includes(firstSegment);
    const isProtectedScreen = ['(tabs)', 'active'].includes(firstSegment);
    const isRoot = !firstSegment;

    if (!session) {
      if (isProtectedScreen || isRoot) {
        router.replace(!onboardingSeen ? '/onboarding' : '/auth');
      }
    } else {
      if (isAuthScreen || isRoot) {
        router.replace('/(tabs)/home');
      }
    }
  }, [session, segments, loaded, isAppReady]);

  useEffect(() => {
    if (loaded && isAppReady && _hasHydrated) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isAppReady, _hasHydrated]);

  if (!loaded || !isAppReady || !_hasHydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: '#090E1C', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#81ECFF" />
      </View>
    );
  }

  return (
    <ThemeProvider value={DarkTheme}>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="active" />
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="reset-password" />
        </Stack>
        <StatusBar style="light" />
      </View>
    </ThemeProvider>
  );
}
