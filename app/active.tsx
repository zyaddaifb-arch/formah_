import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Dimensions,
  SafeAreaView,
  Modal,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { GridBackground, BlurGlow } from '@/components/VisualAccents';
import { useRouter } from 'expo-router';
import { useWorkoutStore } from '../store/workoutStore';
import { ExerciseSelectionModal } from '../components/ExerciseSelectionModal';
import { ExerciseDetailsModal } from '../components/ExerciseDetailsModal';
import { RestTimerModal } from '../components/RestTimerModal';
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
  const [showFinished, setShowFinished] = useState(false);

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

  // Rest Timer Interval
  useEffect(() => {
    if (!isRestTimerActive) return;
    const interval = setInterval(() => {
      tickRestTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [isRestTimerActive]);

  // Finish Timer Sequence
  useEffect(() => {
    if (isRestTimerActive && restTimerRemaining === 0) {
      setShowFinished(true);
      const timer = setTimeout(() => {
        setShowFinished(false);
        stopRestTimer();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isRestTimerActive, restTimerRemaining]);

  const formatRestTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

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
    let hasData = false;
    activeWorkout.exercises.forEach(ex => ex.sets.forEach(s => {
      if (s.done) hasData = true;
    }));

    if (!hasData) {
      Alert.alert("Empty Workout", "You haven't completed any sets. Finish anyway?", [
        { text: "Cancel", style: "cancel" },
        { text: "Finish", onPress: () => { 
          const sid = finishWorkout(); 
          if (sid) {
            router.replace({ pathname: '/summary', params: { sessionId: sid } });
          } else {
            router.back();
          }
        } }
      ]);
    } else {
      const sessionId = finishWorkout();
      if (sessionId) {
        router.replace({ pathname: '/summary', params: { sessionId } });
      } else {
        router.back();
      }
    }
  };

  const handleCancel = () => {
    Alert.alert("Cancel Workout", "Are you sure you want to discard this session?", [
      { text: "No", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: () => { cancelWorkout(); router.back(); } }
    ]);
  };

  const handleAddExercises = (names: string[]) => {
    if (replaceExerciseId) {
      if (names.length > 0) {
        replaceExerciseInActive(replaceExerciseId, names[0]);
      }
      setReplaceExerciseId(null);
    } else {
      names.forEach(name => addExerciseToActive(name));
    }
    setModalVisible(false);
  };
  
  const handleToggleSet = (exerciseId: string, setId: string, weight: number, reps: number, isDone: boolean) => {
    // If we're unchecking, just allow it
    if (isDone) {
      toggleSetDone(exerciseId, setId);
      return false; // Did not just finish
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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return true; // Marked as done
  };

  const totalSets = activeWorkout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => !s.isWarmUp).length, 0);
  const completedSets = activeWorkout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.done && !s.isWarmUp).length, 0);
  const progressPct = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  return (
    <View style={styles.container}>
      <GridBackground />
      <BlurGlow position="topRight" color={Colors.primary} />
      <BlurGlow position="bottomLeft" color={Colors.tertiary} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={[
                styles.restTimer, 
                showFinished && styles.restTimerFinished,
                { overflow: 'hidden' }
              ]} 
              onPress={() => setRestTimerVisible(true)}
            >
              {isRestTimerActive && !showFinished && (
                <View 
                  style={[
                    styles.timerProgress, 
                    { width: `${((restTimerRemaining || 0) / restTimerTarget) * 100}%` }
                  ]} 
                />
              )}
              <MaterialCommunityIcons 
                name={showFinished ? "check-circle" : (isRestTimerActive ? "timer" : "timer-outline")} 
                size={18} 
                color={Colors.onPrimary} 
              />
              <ThemedText type="headline" size={14} color={Colors.onPrimary}>
                {showFinished ? "FINISHED!" : (isRestTimerActive ? formatRestTime(restTimerRemaining || 0) : "")}
              </ThemedText>
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
                        <View key={note.id} style={[styles.noteCard, note.isSticky ? styles.stickyNote : styles.normalNote]}>
                          <View style={styles.noteIconCol}>
                            <ThemedText type="body" size={16}>{note.isSticky ? '📝' : '📌'}</ThemedText>
                          </View>
                          <TextInput 
                            style={[styles.noteInput, { color: note.isSticky ? '#1B1B1B' : '#FFF' }]}
                            multiline
                            placeholder="Add note..."
                            placeholderTextColor={note.isSticky ? 'rgba(27,27,27,0.5)' : 'rgba(255,255,255,0.5)'}
                            value={note.text}
                            onChangeText={(text) => updateExerciseNote(exercise.id, note.id, text)}
                          />
                          <TouchableOpacity style={styles.deleteNoteBtn} onPress={() => deleteExerciseNote(exercise.id, note.id)}>
                            <MaterialCommunityIcons name="close" size={16} color={note.isSticky ? '#1B1B1B' : '#FFF'} />
                          </TouchableOpacity>
                        </View>
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
                      return (
                      <View key={set.id} style={[styles.setRow, set.done && styles.setRowDone, isWarmUp && styles.setRowWarmUp]}>
                        <View style={{ flex: 1 }}>
                          <ThemedText type="headline" size={16} color={set.done ? (isWarmUp ? '#FFD166' : Colors.primary) : 'rgba(225,228,249,0.4)'}>{isWarmUp ? 'W' : setIdx + 1}</ThemedText>
                        </View>
                        <View style={{ flex: 2, alignItems: 'center' }}>
                          <ThemedText type="body" size={12} color={set.done ? Colors.onSurface : 'rgba(225,228,249,0.4)'} style={{ fontStyle: 'italic' }}>-</ThemedText>
                        </View>
                        <View style={styles.inputCell}>
                          <TextInput 
                            style={[
                              styles.miniInput, 
                              set.done && { color: Colors.primary },
                              invalidSets[set.id]?.weight && styles.inputInvalid
                            ]} 
                            placeholder={"0"} 
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
                            placeholder={"0"} 
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
                            onPress={() => {
                              const didFinish = handleToggleSet(exercise.id, set.id, set.weight, set.reps, set.done);
                              if (didFinish) {
                                // Successfully marked as done
                                startRestTimer(exercise.id);
                                setRestTimerVisible(true);
                              }
                            }}
                          >
                             <MaterialCommunityIcons name="check" size={18} color={set.done ? (isWarmUp ? '#4A3400' : Colors.onPrimary) : Colors.outlineVariant} />
                          </TouchableOpacity>
                        </View>
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

              <TouchableOpacity style={styles.menuItem} onPress={() => { addExerciseNote(menuActiveExerciseId, true); setMenuActiveExerciseId(null); }}>
                <View style={styles.menuIconContainer}><MaterialCommunityIcons name="pin-outline" size={20} color={Colors.primary} /></View>
                <ThemedText type="headline" size={16} color={Colors.onSurface} style={{ flex: 1 }}>Add Sticky Note</ThemedText>
              </TouchableOpacity>

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

      <ExerciseSelectionModal 
        visible={modalVisible} 
        onClose={() => { setModalVisible(false); setReplaceExerciseId(null); }} 
        onAddExercises={handleAddExercises} 
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
    </View>
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
    gap: 8, 
    backgroundColor: Colors.surfaceContainerHighest, 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 14, 
    minWidth: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: Colors.secondary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  timerProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.secondary,
    zIndex: -1,
    opacity: 0.8,
  },
  restTimerFinished: {
    backgroundColor: '#34C759', // Success Green
    shadowColor: '#34C759',
    borderColor: '#34C759',
  },
  headerCenter: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: -1 },
  timerText: { fontWeight: 'bold', letterSpacing: -1, textShadowColor: 'rgba(129, 236, 255, 0.4)', textShadowRadius: 8 },
  finishBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 10 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  progressModule: { backgroundColor: Colors.surfaceContainerLow, padding: 20, borderRadius: 16, marginBottom: 24 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
  progressBar: { height: 8, backgroundColor: Colors.surfaceVariant, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primaryContainer, shadowColor: Colors.primary, shadowRadius: 10, shadowOpacity: 0.5 },
  exerciseCard: { backgroundColor: Colors.surfaceContainerHigh, borderRadius: 16, padding: 24, gap: 24, marginBottom: 24 },
  exerciseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  exerciseTitleArea: { flex: 1, gap: 4 },
  tableHeader: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: -8 },
  setsList: { gap: 12 },
  setRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.surfaceContainerHighest, 
    padding: 16, 
    borderRadius: 16 
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
  notesContainer: { gap: 8 },
  noteCard: { flexDirection: 'row', padding: 12, borderRadius: 12, alignItems: 'flex-start', minHeight: 48 },
  stickyNote: { backgroundColor: '#FFF8B0' },
  normalNote: { backgroundColor: Colors.surfaceContainerHighest, borderWidth: 1, borderColor: 'rgba(225,228,249,0.05)' },
  noteIconCol: { marginRight: 8, marginTop: 2 },
  noteInput: { flex: 1, fontFamily: Typography.body, fontSize: 14, minHeight: 24, padding: 0 },
  deleteNoteBtn: { padding: 4, marginLeft: 8 },

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
});
