import React, { useState, useMemo } from 'react';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

// Constants & UI Primitives
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { GridBackground, BlurGlow } from '@/components/VisualAccents';

// Main Store & Hooks
import { useWorkoutStore } from '@/store/workoutStore';
import { Exercise } from '@/store/types';
import { useActiveTimer } from '@/hooks/workout/useActiveTimer';
import { useLineTimers } from '@/hooks/workout/useLineTimers';
import { useWorkoutActions } from '@/hooks/workout/useWorkoutActions';

// Feature Components
import { ActiveWorkoutHeader } from '../components/workout/ActiveWorkoutHeader';
import { WorkoutProgress } from '../components/workout/WorkoutProgress';
import { ExerciseCard } from '../components/workout/ExerciseCard';
import { 
  WarmUpConfigModal,
  PreferencesModal,
  RenameWorkoutModal, 
  LineTimerModal,
  ExerciseMenu
} from '../components/workout/Modals';

// Legacy/Common Components (already in components/)
import { ExerciseSelectionModal } from '@/components/ExerciseSelectionModal';
import { ExerciseDetailsModal } from '@/components/ExerciseDetailsModal';
import { RestTimerModal } from '@/components/RestTimerModal';

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  
  // Store State & Actions
  const activeWorkout = useWorkoutStore(state => state.activeWorkout);
  const history = useWorkoutStore(state => state.history);
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
  const tickRestTimer = useWorkoutStore(state => state.tickRestTimer);
  
  // Custom Hooks
  const elapsedTime = useActiveTimer(activeWorkout?.startTime);
  const { lineTimers, startLineTimer, cancelLineTimer, adjustLineTimer, skipLineTimer } = useLineTimers();
  const { handleFinish, handleCancel } = useWorkoutActions();

  // Local UI State
  const [modalVisible, setModalVisible] = useState(false);
  const [menuActiveExerciseId, setMenuActiveExerciseId] = useState<string | null>(null);
  const [replaceExerciseId, setReplaceExerciseId] = useState<string | null>(null);
  const [preferencesExerciseId, setPreferencesExerciseId] = useState<string | null>(null);
  const [warmUpConfigExerciseId, setWarmUpConfigExerciseId] = useState<string | null>(null);
  const [exerciseDetailName, setExerciseDetailName] = useState<string | null>(null);
  const [restTimerVisible, setRestTimerVisible] = useState(false);
  const [tempWarmUpCount, setTempWarmUpCount] = useState(2);
  const [invalidSets, setInvalidSets] = useState<Record<string, { weight?: boolean; reps?: boolean }>>({});
  const [lineTimerPopupId, setLineTimerPopupId] = useState<string | null>(null);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameInput, setRenameInput] = useState('');
  const [isReordering, setIsReordering] = useState(false);
  const [openSwipeRowId, setOpenSwipeRowId] = useState<string | null>(null);

  // History Caching Logic
  const previousExerciseCache = useMemo(() => {
    const cache: Record<string, { sets: any[], unit: string }> = {};
    if (!activeWorkout) return cache;
    
    activeWorkout.exercises.forEach(ex => {
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
  }, [activeWorkout?.exercises, history]);

  if (!activeWorkout) {
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

  // Progress Calculation
  const totalSets = activeWorkout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => !s.isWarmUp).length, 0);
  const completedSets = activeWorkout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.done && !s.isWarmUp).length, 0);
  const progressPct = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  // Handlers
  const handleToggleSetInternal = (exerciseId: string, setId: string, weight: number, reps: number, isDone: boolean) => {
    if (isDone) {
      toggleSetDone(exerciseId, setId);
      cancelLineTimer(setId);
      return;
    }

    if (weight <= 0 || reps <= 0) {
      setInvalidSets(prev => ({ ...prev, [setId]: { weight: weight <= 0, reps: reps <= 0 } }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setInvalidSets(prev => {
      const next = { ...prev };
      delete next[setId];
      return next;
    });

    toggleSetDone(exerciseId, setId);
    startLineTimer(setId, 60);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const renderExercise = ({ item: exercise, drag, isActive }: RenderItemParams<Exercise>) => (
    <ScaleDecorator>
       <TouchableOpacity 
         activeOpacity={1} 
         onLongPress={drag}
         disabled={!isReordering}
       >
         <ExerciseCard
           exercise={exercise}
           condensed={isReordering}
           previousData={exercise.exerciseId ? previousExerciseCache[exercise.exerciseId] : undefined}
           invalidSets={invalidSets}
           lineTimers={lineTimers}
           openSwipeRowId={openSwipeRowId}
           onOpenSwipeRow={setOpenSwipeRowId}
           onCloseSwipeRow={() => setOpenSwipeRowId(null)}
           onExerciseDetailPress={() => setExerciseDetailName(exercise.name)}
           onExerciseMenuPress={setMenuActiveExerciseId}
           onUpdateNote={(noteId, text) => updateExerciseNote(exercise.id, noteId, text)}
           onDeleteNote={(noteId) => deleteExerciseNote(exercise.id, noteId)}
           onToggleSet={(setId, w, r, done) => handleToggleSetInternal(exercise.id, setId, w, r, done)}
           onUpdateSet={(setId, data) => updateSet(exercise.id, setId, data)}
           onRemoveSet={(setId) => removeSetFromExercise(exercise.id, setId)}
           onAddSet={(isWarmUp) => addSetToExercise(exercise.id, isWarmUp)}
           onLineTimerPress={setLineTimerPopupId}
         />
       </TouchableOpacity>
    </ScaleDecorator>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <GridBackground />
      <BlurGlow position="topRight" color={Colors.primary} />
      <BlurGlow position="bottomLeft" color={Colors.tertiary} />

      <SafeAreaView style={styles.safeArea}>
        <ActiveWorkoutHeader
          elapsedTime={elapsedTime}
          isRestTimerActive={activeWorkout.isRestTimerActive}
          restTimerRemaining={activeWorkout.restTimerRemaining}
          restTimerTarget={activeWorkout.restTimerTarget}
          onRestTimerPress={() => setRestTimerVisible(true)}
          onFinishPress={handleFinish}
        />

        <DraggableFlatList
          data={activeWorkout.exercises}
          keyExtractor={(item) => item.id}
          renderItem={renderExercise}
          onDragEnd={({ data }) => {
            setExercisesOrderInActive(data);
            setIsReordering(false);
          }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              <View style={styles.workoutTitleSection}>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}
                  onPress={() => {
                    setRenameInput(activeWorkout.workoutTitle);
                    setRenameModalVisible(true);
                  }}
                >
                  <ThemedText type="headline" size={30} color={Colors.onSurface} style={styles.workoutTitleLarge} numberOfLines={1}>
                    {activeWorkout.workoutTitle}
                  </ThemedText>
                  <MaterialCommunityIcons name="pencil" size={16} color={Colors.primary} style={{ opacity: 0.6 }} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.titleMenuBtn} onPress={() => setIsReordering(!isReordering)}>
                   <MaterialCommunityIcons 
                     name={isReordering ? "check" : "format-list-bulleted"} 
                     size={22} 
                     color={isReordering ? Colors.primary : Colors.onSurfaceVariant} 
                   />
                </TouchableOpacity>
              </View>

              {activeWorkout.exercises.length > 0 && (
                <WorkoutProgress progressPct={progressPct} />
              )}
              
              {activeWorkout.exercises.length === 0 && (
                <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                  <MaterialCommunityIcons name="arm-flex" size={64} color={Colors.surfaceVariant} style={{ marginBottom: 16 }} />
                  <ThemedText type="headline" size={24} color={Colors.onSurface}>Let's get to work!</ThemedText>
                  <ThemedText type="body" size={16} color={Colors.onSurfaceVariant} style={{ textAlign: 'center', marginTop: 8 }}>
                    Add your first exercise to begin.
                  </ThemedText>
                </View>
              )}
            </>
          }
          ListFooterComponent={
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.addExerciseBtn} onPress={() => setModalVisible(true)}>
                <MaterialCommunityIcons name="plus-circle" size={24} color={Colors.onPrimary} />
                <ThemedText type="headline" size={18} color={Colors.onPrimary}>Add Exercises</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                <MaterialCommunityIcons name="cancel" size={20} color={Colors.error} />
                <ThemedText type="headline" size={16} color={Colors.error}>Cancel Workout</ThemedText>
              </TouchableOpacity>
            </View>
          }
        />
      </SafeAreaView>

      {/* Feature Modals */}
      <ExerciseSelectionModal 
        visible={modalVisible} 
        onClose={() => {
          setModalVisible(false);
          setReplaceExerciseId(null);
        }} 
        existingExerciseNames={activeWorkout.exercises.map(e => e.name)}
        onAddExercises={(exercises: { id: string, name: string }[]) => {
           if (replaceExerciseId) {
             if (exercises.length > 0) {
               replaceExerciseInActive(replaceExerciseId, exercises[0].id, exercises[0].name);
             }
             setReplaceExerciseId(null);
           } else {
             exercises.forEach(ex => addExerciseToActive(ex.id, ex.name));
           }
           setModalVisible(false);
        }} 
      />

      <ExerciseDetailsModal
        visible={!!exerciseDetailName}
        onClose={() => setExerciseDetailName(null)}
        exerciseName={exerciseDetailName || ''}
      />

      <RestTimerModal
        visible={restTimerVisible}
        onClose={() => setRestTimerVisible(false)}
      />

      <WarmUpConfigModal
        isVisible={!!warmUpConfigExerciseId}
        tempCount={tempWarmUpCount}
        onIncrement={() => setTempWarmUpCount(prev => Math.min(10, prev + 1))}
        onDecrement={() => setTempWarmUpCount(prev => Math.max(1, prev - 1))}
        onClose={() => setWarmUpConfigExerciseId(null)}
        onConfirm={(count: number) => {
          for(let i=0; i<count; i++) addSetToExercise(warmUpConfigExerciseId!, true);
          if (!(activeWorkout.exercises.find(e => e.id === warmUpConfigExerciseId)?.warmUpSetsEnabled)) {
            toggleWarmUpSets(warmUpConfigExerciseId!);
          }
          setWarmUpConfigExerciseId(null);
        }}
      />

      <PreferencesModal
        isVisible={!!preferencesExerciseId}
        currentUnit={(activeWorkout.exercises.find(e => e.id === preferencesExerciseId)?.weightUnit as 'kg' | 'lb') || 'kg'}
        onUnitChange={(unit: 'kg' | 'lb') => updateExerciseWeightUnit(preferencesExerciseId!, unit)}
        onClose={() => setPreferencesExerciseId(null)}
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

      <LineTimerModal
        isVisible={!!lineTimerPopupId}
        remaining={lineTimers[lineTimerPopupId || '']?.remaining || 0}
        onAdjust={(offset: number) => adjustLineTimer(lineTimerPopupId!, offset)}
        onSkip={() => {
           skipLineTimer(lineTimerPopupId!);
           setLineTimerPopupId(null);
        }}
        onClose={() => setLineTimerPopupId(null)}
      />

      <ExerciseMenu
        isVisible={!!menuActiveExerciseId}
        onClose={() => setMenuActiveExerciseId(null)}
        hasStickyNote={activeWorkout.exercises.find(e => e.id === menuActiveExerciseId)?.notes?.some(n => n.isSticky) || false}
        onAddNote={(isSticky) => addExerciseNote(menuActiveExerciseId!, isSticky)}
        onAddWarmUp={() => {
          setWarmUpConfigExerciseId(menuActiveExerciseId);
          setTempWarmUpCount(2); 
        }}
        onReplace={() => {
          setReplaceExerciseId(menuActiveExerciseId);
          setModalVisible(true);
        }}
        onPreferences={() => setPreferencesExerciseId(menuActiveExerciseId)}
        onRemove={() => removeExerciseFromActive(menuActiveExerciseId!)}
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
