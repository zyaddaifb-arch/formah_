import React, { useState, useEffect, useMemo } from 'react';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Dimensions,
  Modal,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { GridBackground, BlurGlow } from '@/components/VisualAccents';
import { useRouter } from 'expo-router';
import { useWorkoutStore } from '../store/workoutStore';
import { ExerciseSelectionModal } from '../components/ExerciseSelectionModal';
import { ExerciseDetailsModal } from '../components/ExerciseDetailsModal';
import { RestTimerModal } from '../components/RestTimerModal';
import { WorkoutSetSwipeRow } from '../components/WorkoutSetSwipeRow';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const activeWorkout = useWorkoutStore(state => state.activeWorkout);
  const finishWorkout = useWorkoutStore(state => state.finishWorkout);
  const cancelWorkout = useWorkoutStore(state => state.cancelWorkout);
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
  const duplicateSet = useWorkoutStore(state => state.duplicateSet);
  
  const startRestTimer = useWorkoutStore(state => state.startRestTimer);
  const stopRestTimer = useWorkoutStore(state => state.stopRestTimer);
  const tickRestTimer = useWorkoutStore(state => state.tickRestTimer);
  const isRestTimerActive = useWorkoutStore(state => state.activeWorkout?.isRestTimerActive);
  const restTimerRemaining = useWorkoutStore(state => state.activeWorkout?.restTimerRemaining);
  const restTimerTarget = useWorkoutStore(state => state.activeWorkout?.restTimerTarget || 60);

  const [modalVisible, setModalVisible] = useState(false);
  const [menuActiveExerciseId, setMenuActiveExerciseId] = useState<string | null>(null);
  const [replaceExerciseId, setReplaceExerciseId] = useState<string | null>(null);
  const [preferencesExerciseId, setPreferencesExerciseId] = useState<string | null>(null);
  const [warmUpConfigExerciseId, setWarmUpConfigExerciseId] = useState<string | null>(null);
  const [exerciseDetailName, setExerciseDetailName] = useState<string | null>(null);
  const [restTimerVisible, setRestTimerVisible] = useState(false);
  const [tempWarmUpCount, setTempWarmUpCount] = useState(2);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [invalidSets, setInvalidSets] = useState<Record<string, { weight?: boolean; reps?: boolean }>>({});
  // Line Timer: per-set automatic countdown bar (completely separate from Rest Timer)
  // { remaining, target, done } - 'done' means timer finished but bar stays visible
  const [lineTimers, setLineTimers] = useState<Record<string, { remaining: number; target: number; done?: boolean }>>({});
  const [lineTimerPopup, setLineTimerPopup] = useState<string | null>(null); // setId of open popup
  const [titleMenuVisible, setTitleMenuVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameInput, setRenameInput] = useState('');
  const [isReordering, setIsReordering] = useState(false);
  const [openSwipeRowId, setOpenSwipeRowId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeWorkout) return;
    const interval = setInterval(() => {
      const ms = Date.now() - activeWorkout.startTime;
      const hours = Math.floor(ms / 3600000);
      const minutes = Math.floor((ms % 3600000) / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      setElapsedTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [activeWorkout]);

  // Rest Timer Interval (manual, triggered by user)
  useEffect(() => {
    if (!isRestTimerActive) return;
    const interval = setInterval(() => {
      tickRestTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [isRestTimerActive]);

  // Line Timer Interval (automatic, triggered after each set completion)
  useEffect(() => {
    const anyActive = Object.values(lineTimers).some(t => t.remaining > 0 && !t.done);
    if (!anyActive) return;
    const interval = setInterval(() => {
      setLineTimers(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(id => {
          if (updated[id].remaining > 0 && !updated[id].done) {
            const newRemaining = updated[id].remaining - 1;
            updated[id] = { 
              ...updated[id], 
              remaining: newRemaining,
              done: newRemaining === 0 // Mark as done when reaches 0
            };
          }
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lineTimers]);

  const formatRestTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const history = useWorkoutStore(state => state.history);

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
        <TouchableOpacity style={[styles.finishBtn, {marginTop: 20, backgroundColor: Colors.primary, padding: 12, borderRadius: 8}]} onPress={() => router.back()}>
          <ThemedText type="headline" size={16} color={Colors.onPrimary}>Go Back</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  const handleFinish = () => {
    let hasCheckedSets = false;
    let hasValidUncheckedSets = false;

    activeWorkout.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (s.done) {
          hasCheckedSets = true;
        } else {
          // Strictly valid: MUST have both weight and reps
          if (s.weight > 0 && s.reps > 0) {
            hasValidUncheckedSets = true;
          }
        }
      });
    });

    const doFinish = () => {
      const sid = finishWorkout(); 
      if (sid) {
        router.replace({ pathname: '/summary', params: { sessionId: sid } });
      } else {
        router.back();
      }
    };

    // Path 1: Completely empty progress
    if (!hasCheckedSets && !hasValidUncheckedSets) {
      Alert.alert(
        "Cancel Workout?", 
        "Are you sure you want to cancel this workout? All progress will be lost.", 
        [
          { text: "Resume", style: "cancel" },
          { text: "Cancel Workout", style: "destructive", onPress: () => { cancelWorkout(); router.back(); } }
        ]
      );
      return;
    }

    // Path 2: Has valid unchecked sets
    if (hasValidUncheckedSets) {
      Alert.alert(
        "Unfinished Sets",
        "Some sets contain weight and reps but were not marked as completed.\nWhat would you like to do?",
        [
          { text: "Resume Workout", style: "cancel" },
          { text: "Finish Anyway", onPress: () => { doFinish(); } },
          { text: "Mark Sets as Done & Finish", onPress: () => {
              useWorkoutStore.getState().markAllValidSetsDone();
              doFinish();
          } }
        ]
      );
      return;
    }

    // Path 3: Perfect workout
    Alert.alert(
      "Finish Workout",
      "Are you sure you want to finish this workout?",
      [
        { text: "Resume", style: "cancel" },
        { text: "Finish", onPress: () => { doFinish(); } }
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert("Cancel Workout", "Are you sure you want to discard this session?", [
      { text: "No", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: () => { cancelWorkout(); router.back(); } }
    ]);
  };

  // Hooks moved up to avoid "Rendered fewer hooks than expected"

  const handleAddExercises = (exercises: { id: string, name: string }[]) => {
    if (replaceExerciseId) {
      if (exercises.length > 0) {
        replaceExerciseInActive(replaceExerciseId, exercises[0].id, exercises[0].name);
      }
      setReplaceExerciseId(null);
    } else {
      exercises.forEach(ex => addExerciseToActive(ex.id, ex.name));
    }
    setModalVisible(false);
  };
  
  const handleToggleSet = (exerciseId: string, setId: string, weight: number, reps: number, isDone: boolean) => {
    // If we're unchecking, cancel the line timer too
    if (isDone) {
      toggleSetDone(exerciseId, setId);
      setLineTimers(prev => {
        const next = { ...prev };
        delete next[setId];
        return next;
      });
      return false;
    }

    // Validation: both weight and reps must be > 0
    if (weight <= 0 || reps <= 0) {
      setInvalidSets(prev => ({
        ...prev,
        [setId]: { weight: weight <= 0, reps: reps <= 0 }
      }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setInvalidSets(prev => {
      const next = { ...prev };
      delete next[setId];
      return next;
    });

    toggleSetDone(exerciseId, setId);
    // Line Timer: only one active at a time - cancel any currently running timers
    setLineTimers(prev => {
      const updated: Record<string, { remaining: number; target: number; done?: boolean }> = {};
      Object.keys(prev).forEach(id => {
        // Keep done/finished ones visible, skip currently-running ones
        if (prev[id].done || prev[id].remaining === 0) {
          updated[id] = prev[id];
        }
        // Running timer gets cancelled (not carried over)
      });
      updated[setId] = { remaining: 60, target: 60, done: false };
      return updated;
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return true;
  };

  const totalSets = activeWorkout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => !s.isWarmUp).length, 0);
  const completedSets = activeWorkout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.done && !s.isWarmUp).length, 0);
  const progressPct = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  return (
    <GestureHandlerRootView style={styles.container}>
      <GridBackground />
      <BlurGlow position="topRight" color={Colors.primary} />
      <BlurGlow position="bottomLeft" color={Colors.tertiary} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Rest Timer — manual only, no connection to sets */}
            <TouchableOpacity 
              style={[styles.restTimer, { overflow: 'hidden' }]} 
              onPress={() => setRestTimerVisible(true)}
            >
              {isRestTimerActive && (
                <View 
                  style={[
                    styles.timerProgress, 
                    { width: `${((restTimerRemaining || 0) / restTimerTarget) * 100}%` }
                  ]} 
                />
              )}
              <MaterialCommunityIcons 
                name="timer-outline" 
                size={16} 
                color={isRestTimerActive ? '#005762' : Colors.primary} 
              />
              {isRestTimerActive && (
                <ThemedText type="headline" size={13} color="#005762" style={{ fontWeight: '700' }}>
                  {formatRestTime(restTimerRemaining || 0)}
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerCenter}>
            <ThemedText type="headline" size={24} color={Colors.primary} style={styles.timerText}>{elapsedTime}</ThemedText>
          </View>

          <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
            <ThemedText type="headline" size={12} color={Colors.onPrimary}>Finish</ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Workout Title — scrolls with content */}
          <View style={styles.workoutTitleSection}>
            <TouchableOpacity
              onPress={() => {
                setRenameInput(activeWorkout.workoutTitle);
                setRenameModalVisible(true);
              }}
            >
              <ThemedText type="headline" size={30} color={Colors.onSurface} style={styles.workoutTitleLarge} numberOfLines={1}>
                {activeWorkout.workoutTitle}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.titleMenuBtn}
              onPress={() => setTitleMenuVisible(true)}
            >
              <MaterialCommunityIcons name="dots-horizontal" size={20} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {activeWorkout.exercises.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <MaterialCommunityIcons name="arm-flex" size={64} color={Colors.surfaceVariant} style={{ marginBottom: 16 }} />
              <ThemedText type="headline" size={24} color={Colors.onSurface}>Let's get to work!</ThemedText>
              <ThemedText type="body" size={16} color={Colors.onSurfaceVariant} style={{ textAlign: 'center', marginTop: 8 }}>
                Add your first exercise to begin.
              </ThemedText>
            </View>
          ) : (
            <>
              <View style={styles.progressModule}>
                <View style={styles.progressHeader}>
                  <ThemedText type="headline" size={18}>Progress</ThemedText>
                  <ThemedText type="label" color={Colors.primary}>{Math.round(progressPct)}% Complete</ThemedText>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
                </View>
              </View>

              {activeWorkout.exercises.map((exercise, index) => (
                <View key={exercise.id} style={styles.exerciseCard}>
                  <View style={styles.exerciseHeader}>
                    <TouchableOpacity 
                      style={styles.exerciseTitleArea} 
                      onPress={() => setExerciseDetailName(exercise.name)}
                      onLongPress={() => {
                        setIsReordering(true);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <ThemedText type="headline" size={28}>{exercise.name}</ThemedText>
                        <MaterialCommunityIcons name="help-circle-outline" size={20} color={Colors.onSurfaceVariant} />
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setMenuActiveExerciseId(exercise.id)}>
                      <MaterialCommunityIcons name="dots-vertical" size={24} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>

                  {/* Notes Section */}
                  {exercise.notes && exercise.notes.length > 0 && (
                    <View style={styles.notesContainer}>
                      {exercise.notes.map(note => (
                        <WorkoutSetSwipeRow
                          key={note.id}
                          isOpen={openSwipeRowId === note.id}
                          onOpen={() => setOpenSwipeRowId(note.id)}
                          onClose={() => setOpenSwipeRowId(null)}
                          onDelete={() => deleteExerciseNote(exercise.id, note.id)}
                          rowBackgroundColor="transparent"
                        >
                          <View style={note.isSticky ? styles.stickyNoteWrapper : null}>
                            <TextInput 
                              style={[styles.noteInput, note.isSticky && styles.stickyNoteInput]}
                              multiline
                              placeholder={note.isSticky ? "Sticky note..." : "Add note..."}
                              placeholderTextColor={note.isSticky ? 'rgba(27,27,27,0.4)' : 'rgba(225,228,249,0.3)'}
                              value={note.text}
                              onChangeText={(text) => updateExerciseNote(exercise.id, note.id, text)}
                            />
                            <View style={[styles.noteDivider, note.isSticky && styles.stickyNoteDivider]} />
                          </View>
                        </WorkoutSetSwipeRow>
                      ))}
                    </View>
                  )}

                  <View style={styles.tableHeader}>
                    <View style={{ flex: 1 }}><ThemedText type="label" size={8} color={Colors.onSurfaceVariant}>SET</ThemedText></View>
                    <View style={{ flex: 2, alignItems: 'center' }}><ThemedText type="label" size={8} color={Colors.onSurfaceVariant}>PREVIOUS</ThemedText></View>
                    <View style={{ flex: 2, alignItems: 'center' }}><ThemedText type="label" size={8} color={Colors.onSurfaceVariant}>WEIGHT ({exercise.weightUnit === 'lb' ? 'LB' : 'KG'})</ThemedText></View>
                    <View style={{ flex: 1, alignItems: 'center' }}><ThemedText type="label" size={8} color={Colors.onSurfaceVariant}>REPS</ThemedText></View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}><MaterialCommunityIcons name="check" size={16} color={Colors.onSurfaceVariant}/></View>
                  </View>

                  <View style={styles.setsList}>
                    {exercise.sets.map((set, setIdx) => {
                      const isWarmUp = set.isWarmUp;
                      
                      let prevSetItem = null;
                      let prevSetUnit = 'kg';
                      if (exercise.exerciseId && previousExerciseCache[exercise.exerciseId]) {
                        const pastData = previousExerciseCache[exercise.exerciseId];
                        const pastSets = pastData.sets;
                        prevSetUnit = pastData.unit;
                        const sameTypePastSets = pastSets.filter((s: any) => !!s.isWarmUp === !!isWarmUp);
                        const myTypeIndex = exercise.sets.slice(0, setIdx).filter((s: any) => !!s.isWarmUp === !!isWarmUp).length;
                        prevSetItem = sameTypePastSets[myTypeIndex];
                      }

                      let convertedPrevWeight = 0;
                      if (prevSetItem && prevSetItem.weight > 0) {
                        const currentUnit = exercise.weightUnit || 'kg';
                        if (prevSetUnit === currentUnit) {
                          convertedPrevWeight = prevSetItem.weight;
                        } else if (prevSetUnit === 'kg' && currentUnit === 'lb') {
                          convertedPrevWeight = parseFloat((prevSetItem.weight * 2.20462).toFixed(1));
                        } else if (prevSetUnit === 'lb' && currentUnit === 'kg') {
                          convertedPrevWeight = parseFloat((prevSetItem.weight / 2.20462).toFixed(1));
                        }
                      }

                      const prevText = convertedPrevWeight > 0 && prevSetItem ? `${convertedPrevWeight} ${exercise.weightUnit || 'kg'} × ${prevSetItem.reps}` : '—';
                      
                      const lineTimer = lineTimers[set.id];
                      const lineTimerPct = lineTimer ? (lineTimer.remaining / lineTimer.target) * 100 : 0;
                      const isLineTimerDone = lineTimer?.done;
                      const isLineTimerActive = lineTimer && !isLineTimerDone && lineTimer.remaining > 0;
                      const showLineTimer = !!lineTimer; // show if exists (running or done)
                      return (
                      <View key={set.id} style={{ marginBottom: showLineTimer ? 0 : 0 }}>
                        <WorkoutSetSwipeRow
                          isOpen={openSwipeRowId === set.id}
                          onOpen={() => setOpenSwipeRowId(set.id)}
                          onClose={() => setOpenSwipeRowId(null)}
                          onDelete={() => removeSetFromExercise(exercise.id, set.id)}
                          rowBackgroundColor={set.done ? 'rgba(129, 236, 245, 0.05)' : (isWarmUp ? 'rgba(255, 209, 102, 0.05)' : Colors.surfaceContainerHighest)}
                        >
                          <View style={{ flexDirection: 'column' }}>
                            {/* Set Row - no bottom radius if line timer visible */}
                            <View style={[
                              styles.setRow, 
                              set.done && styles.setRowDone, 
                              isWarmUp && styles.setRowWarmUp,
                              showLineTimer && styles.setRowWithTimer,
                              index === 0 && { borderTopLeftRadius: 16, borderTopRightRadius: 16 },
                              index === exercise.sets.length - 1 && !showLineTimer && { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }
                            ]}>
                          <View style={{ flex: 1 }}>
                            <ThemedText type="headline" size={16} color={set.done ? (isWarmUp ? '#FFD166' : Colors.primary) : 'rgba(225,228,249,0.4)'}>{isWarmUp ? 'W' : (setIdx + 1 - exercise.sets.slice(0, setIdx).filter((s: any) => s.isWarmUp).length)}</ThemedText>
                          </View>
                          <View style={{ flex: 2, alignItems: 'center' }}>
                            <TouchableOpacity 
                              onPress={() => {
                                if (prevSetItem && !set.done && convertedPrevWeight > 0) {
                                  updateSet(exercise.id, set.id, { weight: convertedPrevWeight, reps: prevSetItem.reps });
                                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }
                              }}
                              disabled={set.done || !prevSetItem || convertedPrevWeight === 0}
                            >
                              <ThemedText type="body" size={12} color={set.done ? Colors.onSurface : (convertedPrevWeight > 0 ? Colors.primary : 'rgba(225,228,249,0.4)')} style={{ fontStyle: 'italic' }}>
                                {prevText}
                              </ThemedText>
                            </TouchableOpacity>
                          </View>
                          <View style={styles.inputCell}>
                            <TextInput 
                              style={[
                                styles.miniInput, 
                                set.done && { color: Colors.primary },
                                invalidSets[set.id]?.weight && styles.inputInvalid
                              ]} 
                              placeholder={convertedPrevWeight > 0 ? convertedPrevWeight.toString() : "0"} 
                              placeholderTextColor={Colors.outlineVariant}
                              keyboardType="numeric"
                              value={set.weight ? set.weight.toString() : ''}
                              onChangeText={(val) => {
                                const num = Number(val) || 0;
                                updateSet(exercise.id, set.id, { weight: num });
                                if (num > 0) {
                                  setInvalidSets(prev => {
                                    const next = { ...prev };
                                    if (next[set.id]) {
                                      delete next[set.id].weight;
                                      if (Object.keys(next[set.id]).length === 0) delete next[set.id];
                                    }
                                    return next;
                                  });
                                }
                              }}
                              editable={!set.done}
                            />
                          </View>
                          <View style={styles.inputCell}>
                            <TextInput 
                              style={[
                                styles.miniInput, 
                                set.done && { color: Colors.primary },
                                invalidSets[set.id]?.reps && styles.inputInvalid
                              ]} 
                              placeholder={prevSetItem && prevSetItem.reps > 0 ? prevSetItem.reps.toString() : "0"} 
                              placeholderTextColor={Colors.outlineVariant}
                              keyboardType="numeric"
                              value={set.reps ? set.reps.toString() : ''}
                              onChangeText={(val) => {
                                const num = Number(val) || 0;
                                updateSet(exercise.id, set.id, { reps: num });
                                if (num > 0) {
                                  setInvalidSets(prev => {
                                    const next = { ...prev };
                                    if (next[set.id]) {
                                      delete next[set.id].reps;
                                      if (Object.keys(next[set.id]).length === 0) delete next[set.id];
                                    }
                                    return next;
                                  });
                                }
                              }}
                              editable={!set.done}
                            />
                          </View>
                          <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <TouchableOpacity 
                              style={[styles.checkBtn, set.done && (isWarmUp ? styles.checkBtnWarmUpActive : styles.checkBtnActive)]}
                              onPress={() => handleToggleSet(exercise.id, set.id, set.weight, set.reps, set.done)}
                            >
                               <MaterialCommunityIcons name="check" size={18} color={set.done ? (isWarmUp ? '#4A3400' : Colors.onPrimary) : Colors.outlineVariant} />
                            </TouchableOpacity>
                          </View>
                        </View>
                        {/* Line Timer — blue bar that shrinks, stays after done */}
                        {showLineTimer && (
                          <TouchableOpacity 
                            activeOpacity={0.85}
                            style={[
                              styles.lineTimerContainer,
                              isLineTimerDone && styles.lineTimerDone,
                            ]}
                            onPress={() => isLineTimerActive && setLineTimerPopup(set.id)}
                          >
                            {/* Dark background that's revealed as bar shrinks from right */}
                            <View style={[styles.lineTimerBar, { width: `${lineTimerPct}%` }]} />
                            <ThemedText 
                              type="headline" 
                              size={13} 
                              color={isLineTimerDone ? Colors.primary : '#FFFFFF'} 
                              style={styles.lineTimerText}
                            >
                              {isLineTimerDone ? `✓  ${formatRestTime(lineTimer.target)}` : formatRestTime(lineTimer.remaining)}
                            </ThemedText>
                          </TouchableOpacity>
                        )}
                        {/* Line Timer Popup */}
                        {lineTimerPopup === set.id && isLineTimerActive && (
                          <Modal visible transparent animationType="fade" onRequestClose={() => setLineTimerPopup(null)}>
                            <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setLineTimerPopup(null)}>
                              <View style={styles.lineTimerPopup} onStartShouldSetResponder={() => true}>
                                <ThemedText type="headline" size={18} style={{ marginBottom: 16 }}>Line Timer</ThemedText>
                                <ThemedText type="headline" size={40} color={Colors.primary} style={{ marginBottom: 24, letterSpacing: -1 }}>
                                  {formatRestTime(lineTimer.remaining)}
                                </ThemedText>
                                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                                  <TouchableOpacity
                                    style={styles.lineTimerAdjBtn}
                                    onPress={() => setLineTimers(prev => ({
                                      ...prev,
                                      [set.id]: { ...prev[set.id], remaining: Math.max(0, prev[set.id].remaining - 15) }
                                    }))}
                                  >
                                    <ThemedText type="headline" size={15} color={Colors.onSurface}>-15s</ThemedText>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    style={styles.lineTimerAdjBtn}
                                    onPress={() => setLineTimers(prev => ({
                                      ...prev,
                                      [set.id]: { ...prev[set.id], remaining: prev[set.id].remaining + 15 }
                                    }))}
                                  >
                                    <ThemedText type="headline" size={15} color={Colors.onSurface}>+15s</ThemedText>
                                  </TouchableOpacity>
                                </View>
                                <TouchableOpacity
                                  style={[styles.primaryActionBtn, { width: '100%' }]}
                                  onPress={() => {
                                    setLineTimers(prev => ({ ...prev, [set.id]: { ...prev[set.id], remaining: 0, done: true } }));
                                    setLineTimerPopup(null);
                                  }}
                                >
                                  <ThemedText type="headline" size={16} color={Colors.onPrimary}>Skip</ThemedText>
                                </TouchableOpacity>
                              </View>
                            </TouchableOpacity>
                          </Modal>
                        )}
                        </View>
                        </WorkoutSetSwipeRow>
                      </View>
                    )})}
                  </View>

                  <View style={styles.addButtonsRow}>
                    <TouchableOpacity style={[styles.addSetBtn, { flex: 1 }]} onPress={() => addSetToExercise(exercise.id, false)}>
                      <MaterialCommunityIcons name="plus" size={18} color={Colors.primary} />
                      <ThemedText type="headline" size={14} color={Colors.primary}>Add Set</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          )}

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
        </ScrollView>
      </SafeAreaView>

      {/* 3-Dot Menu Modal */}
      {menuActiveExerciseId && (
        <Modal visible={true} transparent={true} animationType="fade" onRequestClose={() => setMenuActiveExerciseId(null)}>
          <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setMenuActiveExerciseId(null)}>
            <View style={styles.popupMenu}>
              
              <TouchableOpacity style={styles.menuItem} onPress={() => { addExerciseNote(menuActiveExerciseId, false); setMenuActiveExerciseId(null); }}>
                <View style={styles.menuIconContainer}><MaterialCommunityIcons name="file-document-outline" size={20} color={Colors.primary} /></View>
                <ThemedText type="headline" size={16} color={Colors.onSurface} style={{ flex: 1 }}>Add Note</ThemedText>
              </TouchableOpacity>

              {!(activeWorkout.exercises.find(e => e.id === menuActiveExerciseId)?.notes?.some(n => n.isSticky)) && (
                <TouchableOpacity style={styles.menuItem} onPress={() => { addExerciseNote(menuActiveExerciseId, true); setMenuActiveExerciseId(null); }}>
                  <View style={styles.menuIconContainer}><MaterialCommunityIcons name="pin-outline" size={20} color={Colors.primary} /></View>
                  <ThemedText type="headline" size={16} color={Colors.onSurface} style={{ flex: 1 }}>Add Sticky Note</ThemedText>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.menuItem} onPress={() => { 
                setWarmUpConfigExerciseId(menuActiveExerciseId);
                setMenuActiveExerciseId(null);
                setTempWarmUpCount(2); 
              }}>
                <View style={styles.menuIconContainer}><MaterialCommunityIcons name="plus-minus" size={20} color={Colors.primary} /></View>
                <ThemedText type="headline" size={16} color={Colors.onSurface} style={{ flex: 1 }}>Add Warm-up Sets</ThemedText>
              </TouchableOpacity>



              <TouchableOpacity style={styles.menuItem} onPress={() => { 
                setReplaceExerciseId(menuActiveExerciseId); 
                setMenuActiveExerciseId(null); 
                setModalVisible(true); 
              }}>
                <View style={styles.menuIconContainer}><MaterialCommunityIcons name="swap-horizontal" size={20} color={Colors.primary} /></View>
                <ThemedText type="headline" size={16} color={Colors.onSurface} style={{ flex: 1 }}>Replace Exercise</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => { setPreferencesExerciseId(menuActiveExerciseId); setMenuActiveExerciseId(null); }}>
                <View style={styles.menuIconContainer}><MaterialCommunityIcons name="tune-vertical" size={20} color={Colors.primary} /></View>
                <ThemedText type="headline" size={16} color={Colors.onSurface} style={{ flex: 1 }}>Preferences</ThemedText>
                <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuActiveExerciseId(null); setIsReordering(true);Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}>
                <View style={styles.menuIconContainer}><MaterialCommunityIcons name="format-list-bulleted" size={20} color={Colors.primary} /></View>
                <ThemedText type="headline" size={16} color={Colors.onSurface} style={{ flex: 1 }}>Reorder Exercises</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => { removeExerciseFromActive(menuActiveExerciseId); setMenuActiveExerciseId(null); }}>
                <View style={styles.menuIconContainer}><MaterialCommunityIcons name="close" size={20} color="#FF453A" /></View>
                <ThemedText type="headline" size={16} color="#FF453A" style={{ flex: 1 }}>Remove Exercise</ThemedText>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Warm-up Configuration Modal */}
      {warmUpConfigExerciseId && (
        <Modal visible={true} transparent animationType="fade" onRequestClose={() => setWarmUpConfigExerciseId(null)}>
          <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setWarmUpConfigExerciseId(null)}>
            <View style={styles.configContent} onStartShouldSetResponder={() => true}>
              <ThemedText type="headline" size={22} style={{ marginBottom: 16, textAlign: 'center' }}>Warm-up Sets 💪</ThemedText>
              <ThemedText type="body" size={14} color={Colors.onSurfaceVariant} style={{ marginBottom: 32, textAlign: 'center' }}>
                How many warm-up sets would you like to add?
              </ThemedText>

              <View style={styles.counterRow}>
                <TouchableOpacity 
                  style={styles.counterBtn} 
                  onPress={() => setTempWarmUpCount(prev => Math.max(1, prev - 1))}
                >
                  <MaterialCommunityIcons name="minus" size={24} color={Colors.primary} />
                </TouchableOpacity>
                
                <View style={styles.countDisplay}>
                  <ThemedText type="headline" size={32}>{tempWarmUpCount}</ThemedText>
                </View>

                <TouchableOpacity 
                  style={styles.counterBtn} 
                  onPress={() => setTempWarmUpCount(prev => Math.min(10, prev + 1))}
                >
                  <MaterialCommunityIcons name="plus" size={24} color={Colors.primary} />
                </TouchableOpacity>
              </View>

              <View style={{ gap: 12, marginTop: 40 }}>
                <TouchableOpacity 
                  style={styles.primaryActionBtn} 
                  onPress={() => {
                    for(let i=0; i<tempWarmUpCount; i++) {
                      addSetToExercise(warmUpConfigExerciseId, true);
                    }
                    if (!(activeWorkout.exercises.find(e => e.id === warmUpConfigExerciseId)?.warmUpSetsEnabled)) {
                      toggleWarmUpSets(warmUpConfigExerciseId);
                    }
                    setWarmUpConfigExerciseId(null);
                  }}
                >
                  <ThemedText type="headline" size={16} color={Colors.onPrimary}>Add {tempWarmUpCount} Sets</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryActionBtn} onPress={() => setWarmUpConfigExerciseId(null)}>
                  <ThemedText type="headline" size={16} color={Colors.onSurface}>Cancel</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Preferences Modal (Unit Selection) */}
      {preferencesExerciseId && (
        <Modal visible={true} transparent animationType="fade" onRequestClose={() => setPreferencesExerciseId(null)}>
          <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setPreferencesExerciseId(null)}>
            <View style={[styles.preferencesContent, { opacity: 1 }]} onStartShouldSetResponder={() => true}>
              <ThemedText type="headline" size={20} style={{ marginBottom: 16 }}>Preferences ⚙️</ThemedText>
              
              <ThemedText type="label" size={14} color={Colors.onSurfaceVariant} style={{ marginBottom: 8 }}>Weight Unit</ThemedText>
              <View style={styles.unitSelector}>
                <TouchableOpacity 
                  style={[styles.unitBtn, activeWorkout.exercises.find(e => e.id === preferencesExerciseId)?.weightUnit === 'kg' && styles.unitBtnActive]}
                  onPress={() => updateExerciseWeightUnit(preferencesExerciseId, 'kg')}
                >
                  <ThemedText type="headline" size={16}>kg</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.unitBtn, activeWorkout.exercises.find(e => e.id === preferencesExerciseId)?.weightUnit === 'lb' && styles.unitBtnActive]}
                  onPress={() => updateExerciseWeightUnit(preferencesExerciseId, 'lb')}
                >
                  <ThemedText type="headline" size={16}>lb</ThemedText>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={[styles.closeMenuBtn, { marginTop: 24 }]} onPress={() => setPreferencesExerciseId(null)}>
                <ThemedText type="headline" size={16} color={Colors.onSurface}>Done</ThemedText>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Reordering Modal */}
      {isReordering && (
        <Modal visible animationType="fade" onRequestClose={() => setIsReordering(false)}>
          <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.background }}>
            <SafeAreaView style={{ flex: 1 }}>
              <View style={styles.header}>
                <View style={[styles.headerLeft, { flex: 1 }]}>
                  <ThemedText type="headline" size={24} color={Colors.primary}>Reorder Exercises</ThemedText>
                </View>
                <TouchableOpacity style={[styles.finishBtn, { paddingHorizontal: 16 }]} onPress={() => setIsReordering(false)}>
                  <ThemedText type="headline" size={14} color={Colors.onPrimary}>Done</ThemedText>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 10 }}>
                 <ThemedText type="body" size={14} color={Colors.onSurfaceVariant} style={{ marginBottom: 20 }}>
                   Hold and drag the ☰ icon to reorder your workout.
                 </ThemedText>
                 <DraggableFlatList
                   data={activeWorkout.exercises}
                   keyExtractor={(item) => item.id}
                   onDragEnd={({ data }) => {
                     setExercisesOrderInActive(data);
                     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                   }}
                   renderItem={({ item, drag, isActive }: RenderItemParams<any>) => (
                     <ScaleDecorator>
                       <TouchableOpacity
                         activeOpacity={0.9}
                         onLongPress={drag}
                         disabled={isActive}
                         style={[
                           styles.reorderItem,
                           { backgroundColor: isActive ? Colors.surfaceContainerHigh : Colors.surfaceContainer }
                         ]}
                       >
                         <ThemedText type="headline" size={20} color={isActive ? Colors.primary : Colors.onSurface} style={{ flex: 1 }}>{item.name}</ThemedText>
                         <MaterialCommunityIcons name="menu" size={28} color={isActive ? Colors.primary : Colors.onSurfaceVariant} />
                       </TouchableOpacity>
                     </ScaleDecorator>
                   )}
                 />
              </View>
            </SafeAreaView>
          </GestureHandlerRootView>
        </Modal>
      )}

      <ExerciseSelectionModal 
        visible={modalVisible} 
        onClose={() => { setModalVisible(false); setReplaceExerciseId(null); }} 
        onAddExercises={handleAddExercises} 
        existingExerciseNames={activeWorkout.exercises.map(e => e.name)}
      />

      <ExerciseDetailsModal 
        visible={!!exerciseDetailName}
        exerciseName={exerciseDetailName}
        onClose={() => setExerciseDetailName(null)}
      />

      <RestTimerModal 
        visible={restTimerVisible} 
        onClose={() => setRestTimerVisible(false)} 
      />

      {/* Title Dots Menu */}
      {titleMenuVisible && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setTitleMenuVisible(false)}>
          <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setTitleMenuVisible(false)}>
            <View style={[styles.popupMenu, { width: '70%' }]} onStartShouldSetResponder={() => true}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setTitleMenuVisible(false);
                  setRenameInput(activeWorkout.workoutTitle);
                  setRenameModalVisible(true);
                }}
              >
                <View style={styles.menuIconContainer}>
                  <MaterialCommunityIcons name="pencil-outline" size={20} color={Colors.primary} />
                </View>
                <ThemedText type="headline" size={16} color={Colors.onSurface} style={{ flex: 1 }}>Rename</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuItem, { borderBottomWidth: 0 }]}
                onPress={() => { setTitleMenuVisible(false); handleCancel(); }}
              >
                <View style={styles.menuIconContainer}>
                  <MaterialCommunityIcons name="close-circle-outline" size={20} color="#FF453A" />
                </View>
                <ThemedText type="headline" size={16} color="#FF453A" style={{ flex: 1 }}>Cancel Workout</ThemedText>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Rename Workout Modal */}
      {renameModalVisible && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setRenameModalVisible(false)}>
          <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setRenameModalVisible(false)}>
            <View style={styles.renameModalContent} onStartShouldSetResponder={() => true}>
              <ThemedText type="headline" size={20} style={{ marginBottom: 20 }}>Rename Workout ✏️</ThemedText>
              <TextInput
                style={styles.renameInput}
                value={renameInput}
                onChangeText={setRenameInput}
                placeholder="Workout name..."
                placeholderTextColor={Colors.onSurfaceVariant}
                autoFocus
                maxLength={40}
                returnKeyType="done"
                onSubmitEditing={() => {
                  if (renameInput.trim()) renameWorkout(renameInput.trim());
                  setRenameModalVisible(false);
                }}
              />
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
                <TouchableOpacity
                  style={[styles.secondaryActionBtn, { flex: 1 }]}
                  onPress={() => setRenameModalVisible(false)}
                >
                  <ThemedText type="headline" size={15} color={Colors.onSurface}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryActionBtn, { flex: 2 }]}
                  onPress={() => {
                    if (renameInput.trim()) renameWorkout(renameInput.trim());
                    setRenameModalVisible(false);
                  }}
                >
                  <ThemedText type="headline" size={15} color={Colors.onPrimary}>Save</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 24, 
    height: 72,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surfaceContainerHigh },
  restTimer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    backgroundColor: 'rgba(129, 236, 255, 0.1)', 
    paddingHorizontal: 12, 
    paddingVertical: 7, 
    borderRadius: 12, 
    borderWidth: 1,
    borderColor: 'rgba(129, 236, 255, 0.25)',
  },
  timerProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.primary, // Light blue #81ecff
    zIndex: -1,
    opacity: 0.9,
  },
  // Line Timer styles
  lineTimerContainer: {
    height: 34,
    backgroundColor: Colors.surfaceContainerHighest, // dark base revealed as bar shrinks
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lineTimerDone: {
    backgroundColor: 'rgba(129, 236, 255, 0.08)',
  },
  lineTimerBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.primary, // Light milky blue #81ecff
  },
  lineTimerText: {
    fontWeight: '700',
    letterSpacing: 0.5,
    zIndex: 1,
  },
  lineTimerPopup: {
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: 24,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  lineTimerAdjBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  headerCenter: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: -1 },
  timerText: { fontWeight: 'bold', letterSpacing: -1, textShadowColor: 'rgba(129, 236, 255, 0.4)', textShadowRadius: 8 },
  workoutTitleSection: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  workoutTitleLarge: { fontWeight: 'bold', flex: 1 },
  titleMenuBtn: { padding: 4, opacity: 0.6 },
  finishBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 10 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  progressModule: { backgroundColor: Colors.surfaceContainerLow, padding: 20, borderRadius: 16, marginBottom: 24 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
  progressBar: { height: 8, backgroundColor: Colors.surfaceVariant, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primaryContainer, shadowColor: Colors.primary, shadowRadius: 10, shadowOpacity: 0.5 },
  exerciseCard: { backgroundColor: Colors.surfaceContainerHigh, borderRadius: 24, paddingVertical: 24, paddingHorizontal: 0, gap: 20, marginBottom: 24 },
  exerciseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 24 },
  exerciseTitleArea: { flex: 1, gap: 4 },
  tableHeader: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: -4 },
  setsList: { gap: 1 },
  setRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.surfaceContainerHighest, 
    paddingHorizontal: 24, 
    paddingVertical: 16,
  },
  setRowWithTimer: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  setRowDone: { 
    backgroundColor: 'rgba(129, 236, 255, 0.05)', 
    borderWidth: 1, 
    borderColor: 'rgba(129, 236, 255, 0.2)' 
  },
  setRowWarmUp: { 
    backgroundColor: 'rgba(255, 209, 102, 0.05)',
  },
  inputCell: { flex: 2, alignItems: 'center' },
  miniInput: { 
    width: '80%', 
    height: 36, 
    backgroundColor: Colors.surfaceContainerLow, 
    borderRadius: 8, 
    textAlign: 'center', 
    color: Colors.onSurface, 
    fontFamily: Typography.headlineBold 
  },
  inputInvalid: {
    borderWidth: 1.5,
    borderColor: '#FF453A', // iOS Red
    backgroundColor: 'rgba(255, 69, 58, 0.05)',
  },
  checkBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: Colors.outlineVariant, alignItems: 'center', justifyContent: 'center' },
  checkBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkBtnWarmUpActive: { backgroundColor: '#FFD166', borderColor: '#FFD166' },
  addButtonsRow: { flexDirection: 'row', gap: 10 },
  addWarmUpSetBtn: { flex: 1, borderColor: '#FFD166', backgroundColor: 'rgba(255, 209, 102, 0.05)', borderStyle: 'solid' },
  addSetBtn: { 
    backgroundColor: 'rgba(129, 236, 255, 0.05)', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    height: 48, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: 'rgba(129, 236, 255, 0.1)', 
    borderStyle: 'dashed' 
  },
  actionButtons: { marginTop: 8, gap: 16 },
  addExerciseBtn: {
    backgroundColor: Colors.primaryContainer,
    height: 64,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: Colors.primary,
    shadowRadius: 15,
    shadowOpacity: 0.3,
  },
  cancelBtn: {
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.errorContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  notesContainer: { gap: 4, paddingHorizontal: 24 },
  noteInput: { fontFamily: Typography.body, fontSize: 14, minHeight: 24, padding: 0, color: 'rgba(225,228,249,0.7)' },
  noteDivider: { height: 1, backgroundColor: 'rgba(225,228,249,0.08)', marginTop: 8 },
  stickyNoteWrapper: { backgroundColor: '#FFF8B0', borderRadius: 6, padding: 8, marginTop: 4 },
  stickyNoteInput: { color: '#1B1B1B' },
  stickyNoteDivider: { display: 'none' },

  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  popupMenu: { backgroundColor: 'rgba(35, 40, 50, 0.98)', borderRadius: 16, paddingVertical: 8, paddingHorizontal: 16, width: '80%', shadowColor: '#000', shadowOffset: {width: 0, height: 10}, shadowOpacity: 0.3, shadowRadius: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(225,228,249,0.05)' },
  menuIconContainer: { width: 32, alignItems: 'flex-start' },
  toggleIndicator: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.surfaceVariant },
  toggleIndicatorActive: { backgroundColor: Colors.primary },
  closeMenuBtn: { marginTop: 16, height: 48, borderRadius: 12, backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  
  preferencesContent: { backgroundColor: Colors.surfaceContainerHighest, borderRadius: 24, padding: 24, margin: 24, alignSelf: 'center', width: '80%' },
  configContent: { backgroundColor: Colors.surfaceContainerHighest, borderRadius: 32, padding: 32, margin: 20, width: width * 0.85, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 30 },
  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 },
  counterBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(129, 236, 255, 0.1)' },
  countDisplay: { width: 80, alignItems: 'center' },
  primaryActionBtn: { backgroundColor: Colors.primary, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 10 },
  secondaryActionBtn: { height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  unitSelector: { flexDirection: 'row', backgroundColor: Colors.surfaceContainerLow, borderRadius: 12, padding: 4 },
  unitBtn: { flex: 1, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  unitBtnActive: { backgroundColor: Colors.surfaceContainerHigh, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4 },
  inlineTimerContainer: {
    height: 36,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(129, 236, 255, 0.1)',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(129, 236, 255, 0.2)',
  },
  inlineTimerRing: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(129, 236, 255, 0.15)',
    zIndex: -1,
  },
  renameModalContent: {
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: 24,
    padding: 28,
    margin: 24,
    width: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 24,
  },
  renameInput: {
    height: 52,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 14,
    paddingHorizontal: 18,
    color: Colors.onSurface,
    fontFamily: Typography.headlineBold,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(129, 236, 255, 0.2)',
  },
  reorderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
  },
});
