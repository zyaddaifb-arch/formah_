import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useWorkoutStore } from '../../store/workoutStore';

/**
 * High-level workout actions with UI feedback (Haptics, Alerts, Navigation).
 */
export const useWorkoutActions = () => {
  const router = useRouter();
  const activeWorkout = useWorkoutStore(state => state.activeWorkout);
  const cancelWorkout = useWorkoutStore(state => state.cancelWorkout);
  const startWorkout = useWorkoutStore(state => state.startWorkout);
  const finishWorkout = useWorkoutStore(state => state.finishWorkout);
  const markAllValidSetsDone = useWorkoutStore(state => state.markAllValidSetsDone);

  const handleFinish = () => {
    if (!activeWorkout) return;

    let hasCheckedSets = false;
    let hasValidUncheckedSets = false;

    activeWorkout.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (s.done) {
          hasCheckedSets = true;
        } else {
          if ((s.weight || 0) > 0 && (s.reps || 0) > 0) {
            hasValidUncheckedSets = true;
          }
        }
      });
    });

    const doFinish = (markDone: boolean = false) => {
      if (markDone) markAllValidSetsDone();
      const sessionId = finishWorkout();
      if (sessionId) {
        router.replace({ pathname: '/summary', params: { sessionId } });
      } else {
        router.back();
      }
    };

    if (!hasCheckedSets && !hasValidUncheckedSets) {
      Alert.alert(
        'Cancel Workout?',
        'You haven\'t logged any sets. Do you want to discard this workout?',
        [
          { text: 'Resume', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => { cancelWorkout(); router.back(); } }
        ]
      );
      return;
    }

    if (hasValidUncheckedSets) {
      Alert.alert(
        'Empty Sets',
        'You have sets that aren\'t marked as done. What would you like to do?',
        [
          { text: 'Resume', style: 'cancel' },
          { text: 'Finish anyway', onPress: () => doFinish(false) },
          { text: 'Mark all done & Finish', onPress: () => doFinish(true) }
        ]
      );
      return;
    }

    Alert.alert(
      'Finish Workout',
      'Are you sure you want to finish this workout?',
      [
        { text: 'Resume', style: 'cancel' },
        { text: 'Finish', onPress: () => doFinish() }
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Workout',
      'Are you sure you want to discard this workout? All progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => { cancelWorkout(); router.back(); } }
      ]
    );
  };

  const startNewWorkout = (templateId?: string) => {
    if (activeWorkout) {
      Alert.alert(
        'Workout in Progress',
        'You already have an active workout. Would you like to resume it, discard it, or finish it first?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Resume Current', onPress: () => router.push('/active') },
          { 
            text: 'Discard & Start New', 
            style: 'destructive',
            onPress: () => {
              cancelWorkout();
              startWorkout(templateId);
              router.push('/active');
            } 
          },
          { 
            text: 'Finish & Start New', 
            onPress: () => {
              finishWorkout();
              startWorkout(templateId);
              router.push('/active');
            } 
          }
        ]
      );
    } else {
      startWorkout(templateId);
      router.push('/active');
    }
  };

  return {
    handleFinish,
    handleCancel,
    startNewWorkout
  };
};

