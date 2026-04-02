import React, { useState, useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Constants & UI Primitives
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { GridBackground, BlurGlow } from '@/components/VisualAccents';

// Main Store & Hooks
import { useWorkoutStore } from '@/store/workoutStore';
import { useActiveTimer } from '@/hooks/workout/useActiveTimer';
import { useLineTimers } from '@/hooks/workout/useLineTimers';
import { useWorkoutActions } from '@/hooks/workout/useWorkoutActions';
import { useRestTimer } from '@/hooks/workout/useRestTimer';

import { WorkoutEditor } from '../components/workout/WorkoutEditor';
import { ActiveWorkoutHeader } from '../components/workout/ActiveWorkoutHeader';
import { WorkoutProgress } from '../components/workout/WorkoutProgress';
import { RestTimerModal } from '@/components/RestTimerModal';
import { RenameWorkoutModal } from '../components/workout/Modals';

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  
  // PERF: Use granular selectors — each selector only triggers a re-render
  // when its specific slice of data changes, not the whole activeWorkout object.
  const activeWorkoutId = useWorkoutStore(state => state.activeWorkout?.id);
  const activeWorkoutTitle = useWorkoutStore(state => state.activeWorkout?.workoutTitle);
  const exercises = useWorkoutStore(state => state.activeWorkout?.exercises ?? []);
  const startTime = useWorkoutStore(state => state.activeWorkout?.startTime);
  const history = useWorkoutStore(state => state.history);

  // Actions (stable references, never change)
  const addExerciseToActive = useWorkoutStore(state => state.addExerciseToActive);
  const addSetToExercise = useWorkoutStore(state => state.addSetToExercise);
  const updateSet = useWorkoutStore(state => state.updateSet);
  const toggleSetDone = useWorkoutStore(state => state.toggleSetDone);
  const removeExerciseFromActive = useWorkoutStore(state => state.removeExerciseFromActive);
  const replaceExerciseInActive = useWorkoutStore(state => state.replaceExerciseInActive);
  const addExerciseNote = useWorkoutStore(state => state.addExerciseNote);
  const updateExerciseNote = useWorkoutStore(state => state.updateExerciseNote);
  const deleteExerciseNote = useWorkoutStore(state => state.deleteExerciseNote);
  const toggleWarmUpSets = useWorkoutStore(state => state.toggleWarmUpSets);
  const updateExerciseWeightUnit = useWorkoutStore(state => state.updateExerciseWeightUnit);
  const renameWorkout = useWorkoutStore(state => state.renameWorkout);
  const setExercisesOrderInActive = useWorkoutStore(state => state.setExercisesOrderInActive);
  const removeSetFromExercise = useWorkoutStore(state => state.removeSetFromExercise);
  const startRestTimer = useWorkoutStore(state => state.startRestTimer);
  const updateExerciseFocusMetric = useWorkoutStore(state => state.updateExerciseFocusMetric);
  
  // Custom Hooks
  const elapsedTime = useActiveTimer(startTime);
  const { lineTimers, startLineTimer, cancelLineTimer, adjustLineTimer, skipLineTimer } = useLineTimers();
  const { handleFinish, handleCancel } = useWorkoutActions();
  // PERF: useRestTimer handles the 1s interval locally — does NOT write to the store every second.
  const { remaining: restTimerRemaining, target: restTimerTarget, isActive: isRestTimerActive } = useRestTimer();

  // Local UI State
  const [restTimerVisible, setRestTimerVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameInput, setRenameInput] = useState('');

  // History Caching Logic
  const previousExerciseCache = useMemo(() => {
    const cache: Record<string, { sets: any[], unit: string }> = {};
    
    exercises.forEach((ex) => {
      if (!ex.exerciseId || cache[ex.exerciseId]) return;
      for (let i = 0; i < history.length; i++) {
        const prevEx = history[i].exercises.find(e => e.exerciseId === ex.exerciseId);
        if (prevEx && prevEx.sets.length > 0) {
           cache[ex.exerciseId] = { sets: prevEx.sets, unit: prevEx.weightUnit || 'kg' };
           break;
        }
      }
    });
    return cache;
  }, [exercises, history]);

  if (!activeWorkoutId) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ThemedText type="headline" size={20}>No active workout.</ThemedText>
        <TouchableOpacity 
          style={{marginTop: 20, backgroundColor: Colors.primary, padding: 12, borderRadius: 8}} 
          onPress={() => router.back()}
        >
          <ThemedText type="headline" size={16} color={Colors.onPrimary}>Go Back</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  // Progress Calculation (computed inline — no extra store reads)
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.filter(s => !s.isWarmUp).length, 0);
  const completedSets = exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.done && !s.isWarmUp).length, 0);
  const progressPct = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  return (
    <GestureHandlerRootView style={styles.container}>
      <GridBackground />
      <BlurGlow position="topRight" color={Colors.primary} />
      <BlurGlow position="bottomLeft" color={Colors.tertiary} />

      <SafeAreaView style={styles.safeArea}>
        <WorkoutEditor
          mode="active"
          title={activeWorkoutTitle ?? ''}
          exercises={exercises}
          previousExerciseCache={previousExerciseCache}
          lineTimers={lineTimers}
          onLineTimerStart={startLineTimer}
          onLineTimerCancel={cancelLineTimer}
          onLineTimerAdjust={adjustLineTimer}
          onLineTimerSkip={skipLineTimer}
          actions={{
            addExercise: addExerciseToActive,
            removeExercise: removeExerciseFromActive,
            replaceExercise: replaceExerciseInActive,
            reorderExercises: setExercisesOrderInActive,
            addSet: addSetToExercise,
            removeSet: removeSetFromExercise,
            updateSet: updateSet,
            toggleSetDone: toggleSetDone,
            addNote: addExerciseNote,
            updateNote: updateExerciseNote,
            deleteNote: deleteExerciseNote,
            updateTitle: () => setRenameModalVisible(true),
            toggleWarmUpSets: toggleWarmUpSets,
            updateWeightUnit: updateExerciseWeightUnit,
            updateFocusMetric: updateExerciseFocusMetric,
          }}
          renderHeader={() => (
            <>
              <ActiveWorkoutHeader
                elapsedTime={elapsedTime}
                isRestTimerActive={isRestTimerActive}
                restTimerRemaining={restTimerRemaining}
                restTimerTarget={restTimerTarget}
                onRestTimerPress={() => setRestTimerVisible(true)}
                onFinishPress={handleFinish}
              />
              {exercises.length > 0 && (
                <WorkoutProgress progressPct={progressPct} />
              )}
            </>
          )}
          renderFooter={() => (
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <MaterialCommunityIcons name="cancel" size={20} color={Colors.error} />
              <ThemedText type="headline" size={16} color={Colors.error}>Cancel Workout</ThemedText>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>

      <RestTimerModal
        visible={restTimerVisible}
        onClose={() => setRestTimerVisible(false)}
      />

      <RenameWorkoutModal
        isVisible={renameModalVisible}
        value={renameInput}
        onChangeText={setRenameInput}
        onClose={() => setRenameModalVisible(false)}
        onConfirm={() => {
          renameWorkout(renameInput);
          setRenameModalVisible(false);
        }}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  workoutTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 20,
  },
  workoutTitleLarge: {
    flex: 1,
    letterSpacing: -0.5,
  },
  titleMenuBtn: {
    padding: 8,
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  addExerciseBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderRadius: 16,
    gap: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderRadius: 16,
    gap: 12,
    backgroundColor: 'rgba(255, 113, 108, 0.1)',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 14, 28, 0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  popupMenu: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(225, 228, 249, 0.1)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(225, 228, 249, 0.05)',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(129, 236, 245, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
