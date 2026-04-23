import React, { useState, useCallback } from 'react';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { soundService } from '@/services/SoundService';

import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { Exercise, FocusMetricType } from '@/store/types';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';

// Feature Components
import { ExerciseCard } from './ExerciseCard';
import {
  WarmUpConfigModal,
  PreferencesModal,
  LineTimerModal,
  ExerciseMenu,
  FocusMetricModal
} from './Modals';
import { ExerciseSelectionModal } from '@/components/ExerciseSelectionModal';
import { ExerciseDetailsModal } from '@/components/ExerciseDetailsModal';

export interface WorkoutActions {
  addExercise: (exerciseId: string, name: string) => void;
  removeExercise: (exerciseId: string) => void;
  replaceExercise: (oldId: string, newId: string, newName: string) => void;
  reorderExercises: (exercises: Exercise[]) => void;
  addSet: (exerciseId: string, isWarmUp?: boolean) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  updateSet: (exerciseId: string, setId: string, data: any) => void;
  toggleSetDone?: (exerciseId: string, setId: string) => void;
  addNote: (exerciseId: string, isSticky: boolean) => void;
  updateNote: (exerciseId: string, noteId: string, text: string) => void;
  deleteNote: (exerciseId: string, noteId: string) => void;
  updateTitle: (title: string) => void;
  toggleWarmUpSets?: (exerciseId: string) => void;
  updateWeightUnit?: (exerciseId: string, unit: 'kg' | 'lb') => void;
  updateFocusMetric?: (exerciseId: string, metric: FocusMetricType) => void;
}

interface WorkoutEditorProps {
  mode: 'active' | 'template';
  title: string;
  exercises: Exercise[];
  actions: WorkoutActions;
  renderHeader?: () => React.ReactNode;
  renderFooter?: () => React.ReactNode;
  previousExerciseCache?: Record<string, any>;
  lineTimers?: Record<string, any>;
  onLineTimerStart?: (setId: string) => void;
  onLineTimerCancel?: (setId: string) => void;
  onLineTimerAdjust?: (setId: string, offset: number) => void;
  onLineTimerSkip?: (setId: string) => void;
}

export function WorkoutEditor({
  mode,
  title,
  exercises,
  actions,
  renderHeader,
  renderFooter,
  previousExerciseCache = {},
  lineTimers = {},
  onLineTimerStart,
  onLineTimerCancel,
  onLineTimerAdjust,
  onLineTimerSkip,
}: WorkoutEditorProps) {
  // Shared UI State
  const [isReordering, setIsReordering] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [menuActiveExerciseId, setMenuActiveExerciseId] = useState<string | null>(null);
  const [replaceExerciseId, setReplaceExerciseId] = useState<string | null>(null);
  const [preferencesExerciseId, setPreferencesExerciseId] = useState<string | null>(null);
  const [warmUpConfigExerciseId, setWarmUpConfigExerciseId] = useState<string | null>(null);
  const [exerciseDetailName, setExerciseDetailName] = useState<string | null>(null);
  const [lineTimerPopupId, setLineTimerPopupId] = useState<string | null>(null);
  const [focusMetricExerciseId, setFocusMetricExerciseId] = useState<string | null>(null);
  const [openSwipeRowId, setOpenSwipeRowId] = useState<string | null>(null);
  const [invalidSets, setInvalidSets] = useState<Record<string, { weight?: boolean; reps?: boolean }>>({});
  const [tempWarmUpCount, setTempWarmUpCount] = useState(2);

  const keyboardHeight = useKeyboardHeight();

  // PERF: useCallback gives this function a stable identity so it doesn't cause
  // renderExercise (and all ExerciseCards) to re-render when unrelated state changes.
  const handleToggleSetInternal = useCallback((exercise: Exercise, setId: string, weight?: number, reps?: number, time?: number, isDone?: boolean) => {
    if (mode === 'template') return;

    if (isDone) {
      actions.toggleSetDone?.(exercise.id, setId);
      onLineTimerCancel?.(setId);
      return;
    }

    let isValid = true;
    const currentInvalidState: { weight?: boolean; reps?: boolean } = {};

    const type = exercise.exerciseType || 'weight_reps';

    if (type === 'duration') {
      if ((time ?? 0) <= 0) isValid = false;
    } else if (type === 'reps_only') {
      if ((reps ?? 0) <= 0) isValid = false;
    } else if (type === 'weight_only') {
      if ((weight ?? 0) <= 0) {
        isValid = false;
        currentInvalidState.weight = true;
      }
    } else {
      if ((weight ?? 0) <= 0) {
          isValid = false;
          currentInvalidState.weight = true;
      }
      if ((reps ?? 0) <= 0) {
          isValid = false;
          currentInvalidState.reps = true;
      }
    }

    if (!isValid) {
      setInvalidSets(prev => ({ ...prev, [setId]: currentInvalidState }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setInvalidSets(prev => {
      const next = { ...prev };
      delete next[setId];
      return next;
    });

    actions.toggleSetDone?.(exercise.id, setId);
    onLineTimerStart?.(setId);
    soundService.playDoneSet();
  }, [mode, actions, onLineTimerCancel, onLineTimerStart]);


  // PERF: useCallback ensures renderExercise doesn't get a new reference on every render.
  // Without this, React.memo on ExerciseCard would be bypassed entirely because
  // the parent re-render would always create a new function reference for renderItem.
  const renderExercise = useCallback(({ item: exercise, drag, isActive }: RenderItemParams<Exercise>) => (
    <ScaleDecorator>
       <TouchableOpacity 
         activeOpacity={1} 
         onLongPress={drag}
         disabled={!isReordering}
       >
         <ExerciseCard
            exercise={exercise}
            condensed={isReordering}
            isTemplateMode={mode === 'template'}
            previousData={previousExerciseCache[exercise.exerciseId || '']}
            invalidSets={invalidSets}
            lineTimers={lineTimers}
            openSwipeRowId={openSwipeRowId}
            onOpenSwipeRow={setOpenSwipeRowId}
            onCloseSwipeRow={() => setOpenSwipeRowId(null)}
            onExerciseDetailPress={() => setExerciseDetailName(exercise.name)}
            onExerciseMenuPress={setMenuActiveExerciseId}
            onSetFocusMetric={setFocusMetricExerciseId}
            onUpdateNote={(noteId, text) => actions.updateNote(exercise.id, noteId, text)}
            onDeleteNote={(noteId) => actions.deleteNote(exercise.id, noteId)}
            onToggleSet={(setId, w, r, t, done) => handleToggleSetInternal(exercise, setId, w, r, t, done)}
            onUpdateSet={(setId, data) => actions.updateSet(exercise.id, setId, data)}
            onRemoveSet={(setId) => {
              actions.removeSet(exercise.id, setId);
              soundService.playRemoveSet();
            }}
            onAddSet={(isWarmUp) => {
              actions.addSet(exercise.id, isWarmUp);
              soundService.playAddSet();
            }}
            onLineTimerPress={setLineTimerPopupId}
         />
       </TouchableOpacity>
    </ScaleDecorator>
  ), [
    isReordering, mode, previousExerciseCache, invalidSets, lineTimers,
    openSwipeRowId, actions, handleToggleSetInternal,
  ]);


  return (
    <View style={{ flex: 1 }}>
      {renderHeader?.()}
      <DraggableFlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={renderExercise}
        onDragEnd={({ data }) => {
          actions.reorderExercises(data);
          setIsReordering(false);
        }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + (keyboardHeight ? 48 : 0) }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
        ListHeaderComponent={
          <>
            <View style={styles.titleSection}>
                {mode === 'template' ? (
                  <TextInput
                      style={styles.titleInput}
                      value={title}
                      onChangeText={actions.updateTitle}
                      placeholder="Template Title"
                      placeholderTextColor="rgba(225,228,249,0.3)"
                  />
                ) : (
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}
                    onPress={() => actions.updateTitle(title)}
                  >
                    <ThemedText type="headline" size={30} color={Colors.onSurface} style={styles.workoutTitleLarge} numberOfLines={1}>
                      {title}
                    </ThemedText>
                    <MaterialCommunityIcons name="pencil" size={16} color={Colors.primary} style={{ opacity: 0.6 }} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.reorderBtn} onPress={() => setIsReordering(!isReordering)}>
                   <MaterialCommunityIcons 
                     name={isReordering ? "check" : "format-list-bulleted"} 
                     size={22} 
                     color={isReordering ? Colors.primary : Colors.onSurfaceVariant} 
                   />
                </TouchableOpacity>
            </View>

            {exercises.length === 0 && (
                <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                  <MaterialCommunityIcons name="arm-flex" size={64} color={Colors.surfaceVariant} style={{ marginBottom: 16 }} />
                  <ThemedText type="headline" size={24} color={Colors.onSurface}>
                    {mode === 'active' ? "Let's get to work!" : "Build your template"}
                  </ThemedText>
                  <ThemedText type="body" size={16} color={Colors.onSurfaceVariant} style={{ textAlign: 'center', marginTop: 8, paddingHorizontal: 40 }}>
                    {mode === 'active' 
                        ? "Add your first exercise to begin." 
                        : "Select exercises to include in this workout plan."}
                  </ThemedText>
                </View>
            )}
          </>
        }
        ListFooterComponent={
          <View style={styles.footer}>
             <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
                  <MaterialCommunityIcons name="plus-circle" size={24} color={Colors.onPrimary} />
                  <ThemedText type="headline" size={18} color={Colors.onPrimary}>Add Exercises</ThemedText>
             </TouchableOpacity>
             {renderFooter?.()}
          </View>
        }
      />

      {/* Shared Modals */}
      <ExerciseSelectionModal 
        visible={modalVisible} 
        onClose={() => {
            setModalVisible(false);
            setReplaceExerciseId(null);
        }} 
        existingExerciseNames={exercises.map(e => e.name)}
        onAddExercises={(newExercises) => {
            if (replaceExerciseId && newExercises.length > 0) {
                actions.replaceExercise(replaceExerciseId, newExercises[0].id, newExercises[0].name);
            } else {
                newExercises.forEach(ex => actions.addExercise(ex.id, ex.name));
            }
            setModalVisible(false);
            setReplaceExerciseId(null);
        }} 
      />

      <ExerciseMenu
        isVisible={!!menuActiveExerciseId}
        onClose={() => setMenuActiveExerciseId(null)}
        hasStickyNote={exercises.find(e => e.id === menuActiveExerciseId)?.notes?.some(n => n.isSticky) || false}
        onAddNote={(isSticky) => {
            actions.addNote(menuActiveExerciseId!, isSticky);
            setMenuActiveExerciseId(null);
        }}
        onAddWarmUp={() => {
            if (mode === 'active') {
                setWarmUpConfigExerciseId(menuActiveExerciseId);
                setTempWarmUpCount(2); 
            } else {
                actions.addSet(menuActiveExerciseId!, true);
            }
            setMenuActiveExerciseId(null);
        }}
        onReplace={() => {
            setReplaceExerciseId(menuActiveExerciseId);
            setModalVisible(true);
            setMenuActiveExerciseId(null);
        }}
        onRemove={() => {
            actions.removeExercise(menuActiveExerciseId!);
            setMenuActiveExerciseId(null);
        }}
        onPreferences={() => {
            setPreferencesExerciseId(menuActiveExerciseId);
            setMenuActiveExerciseId(null);
        }}
      />

      <ExerciseDetailsModal
        visible={!!exerciseDetailName}
        onClose={() => setExerciseDetailName(null)}
        exerciseName={exerciseDetailName || ''}
      />

      <WarmUpConfigModal
        isVisible={!!warmUpConfigExerciseId}
        tempCount={tempWarmUpCount}
        onIncrement={() => setTempWarmUpCount(prev => Math.min(10, prev + 1))}
        onDecrement={() => setTempWarmUpCount(prev => Math.max(1, prev - 1))}
        onClose={() => setWarmUpConfigExerciseId(null)}
        onConfirm={(count: number) => {
          for(let i=0; i<count; i++) actions.addSet(warmUpConfigExerciseId!, true);
          if (actions.toggleWarmUpSets && !(exercises.find(e => e.id === warmUpConfigExerciseId)?.warmUpSetsEnabled)) {
            actions.toggleWarmUpSets!(warmUpConfigExerciseId!);
          }
          setWarmUpConfigExerciseId(null);
        }}
      />

      <PreferencesModal
        isVisible={!!preferencesExerciseId}
        currentUnit={(exercises.find(e => e.id === preferencesExerciseId)?.weightUnit as 'kg' | 'lb') || 'kg'}
        onUnitChange={(unit: 'kg' | 'lb') => actions.updateWeightUnit?.(preferencesExerciseId!, unit)}
        onClose={() => setPreferencesExerciseId(null)}
      />

      <LineTimerModal
        isVisible={!!lineTimerPopupId}
        remaining={lineTimers[lineTimerPopupId || '']?.remaining || 0}
        onAdjust={(offset: number) => onLineTimerAdjust?.(lineTimerPopupId!, offset)}
        onSkip={() => {
           onLineTimerSkip?.(lineTimerPopupId!);
           setLineTimerPopupId(null);
        }}
        onClose={() => setLineTimerPopupId(null)}
      />

      <FocusMetricModal
        isVisible={!!focusMetricExerciseId}
        onClose={() => setFocusMetricExerciseId(null)}
        currentSets={exercises.find(e => e.id === focusMetricExerciseId)?.sets || []}
        previousSets={previousExerciseCache[(exercises.find(e => e.id === focusMetricExerciseId)?.exerciseId || '')]?.sets}
        unit={(exercises.find(e => e.id === focusMetricExerciseId)?.weightUnit as 'kg' | 'lb') || 'kg'}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 100 },
  titleSection: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleInput: {
    flex: 1,
    fontSize: 24,
    color: Colors.onSurface,
    fontWeight: 'bold',
    paddingVertical: 8,
  },
  workoutTitleLarge: {
    flex: 1,
    letterSpacing: -0.5,
  },
  reorderBtn: { padding: 8 },
  footer: { paddingHorizontal: 20, marginTop: 20, gap: 12 },
  addBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderRadius: 16,
    gap: 12,
  }
});
