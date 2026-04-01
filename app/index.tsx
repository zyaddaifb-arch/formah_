import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/Colors';
import { useWorkoutStore } from '../store/workoutStore';
import { useAuthStore } from '../store/authStore';

export default function Index() {
  const router = useRouter();
  const onboardingSeen = useWorkoutStore(state => state.user.hasSeenOnboarding);
  const { session, loading } = useAuthStore();

  useEffect(() => {
    // This is the landing component. RootLayout handles the logic.
  }, []);



  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

