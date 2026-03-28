import React from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { WorkoutSetSwipeRow } from '@/components/WorkoutSetSwipeRow';
import { WorkoutSetRow } from './WorkoutSetRow';
import { LineTimerIndicator } from './LineTimerIndicator';
import { Exercise } from '@/store/types';
import { useWorkoutStore } from '@/store/workoutStore';
import { styles } from './styles';

interface ExerciseCardProps {
  exercise: Exercise;
  condensed?: boolean;
  previousData?: { sets: any[], unit: string };
  invalidSets: Record<string, { weight?: boolean; reps?: boolean }>;
  lineTimers: Record<string, any>;
  openSwipeRowId: string | null;
  onOpenSwipeRow: (id: string) => void;
  onCloseSwipeRow: () => void;
  onExerciseDetailPress: (name: string) => void;
  onExerciseMenuPress: (id: string) => void;
  onUpdateNote: (noteId: string, text: string) => void;
  onDeleteNote: (noteId: string) => void;
  onToggleSet: (setId: string, weight: number, reps: number, isDone: boolean) => void;
  onUpdateSet: (setId: string, data: { weight?: number; reps?: number }) => void;
  onRemoveSet: (setId: string) => void;
  onAddSet: (isWarmUp: boolean) => void;
  onLineTimerPress: (setId: string) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  condensed = false,
  previousData,
  invalidSets,
  lineTimers,
  openSwipeRowId,
  onOpenSwipeRow,
  onCloseSwipeRow,
  onExerciseDetailPress,
  onExerciseMenuPress,
  onUpdateNote,
  onDeleteNote,
  onToggleSet,
  onUpdateSet,
  onRemoveSet,
  onAddSet,
  onLineTimerPress,
}) => {
  const globalUnit = useWorkoutStore(state => state.user.weightUnit);
  const currentUnit = exercise.weightUnit || globalUnit;

  return (
    <View style={[styles.exerciseCard, condensed && styles.exerciseCardCondensed]}>
      <View style={[styles.exerciseHeader, condensed && { marginBottom: 0 }]}>
        <TouchableOpacity 
          style={styles.exerciseTitleArea} 
          onPress={() => onExerciseDetailPress(exercise.name)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ThemedText type="headline" size={condensed ? 20 : 28}>{exercise.name}</ThemedText>
            {!condensed && <MaterialCommunityIcons name="help-circle-outline" size={20} color={Colors.onSurfaceVariant} />}
          </View>
        </TouchableOpacity>
        
        {condensed ? (
          <MaterialCommunityIcons name="drag-vertical" size={24} color={Colors.onSurfaceVariant} />
        ) : (
          <TouchableOpacity onPress={() => onExerciseMenuPress(exercise.id)}>
            <MaterialCommunityIcons name="dots-vertical" size={24} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {!condensed && (
        <>
          {/* Notes Section */}
          {exercise.notes && exercise.notes.length > 0 && (
            <View style={styles.notesContainer}>
              {exercise.notes.map(note => (
                <WorkoutSetSwipeRow
                  key={note.id}
                  isOpen={openSwipeRowId === note.id}
                  onOpen={() => onOpenSwipeRow(note.id)}
                  onClose={onCloseSwipeRow}
                  onDelete={() => onDeleteNote(note.id)}
                  rowBackgroundColor="transparent"
                >
                  <View style={note.isSticky ? styles.stickyNoteWrapper : null}>
                    <TextInput 
                      style={[styles.noteInput, note.isSticky && styles.stickyNoteInput]}
                      multiline
                      placeholder={note.isSticky ? "Sticky note..." : "Add note..."}
                      placeholderTextColor={note.isSticky ? 'rgba(27,27,27,0.4)' : 'rgba(225,228,249,0.3)'}
                      value={note.text}
                      onChangeText={(text) => onUpdateNote(note.id, text)}
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
            <View style={{ flex: 2, alignItems: 'center' }}><ThemedText type="label" size={8} color={Colors.onSurfaceVariant}>WEIGHT ({currentUnit.toUpperCase()})</ThemedText></View>
            <View style={{ flex: 1, alignItems: 'center' }}><ThemedText type="label" size={8} color={Colors.onSurfaceVariant}>REPS</ThemedText></View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}><MaterialCommunityIcons name="check" size={16} color={Colors.onSurfaceVariant}/></View>
          </View>

          <View style={styles.setsList}>
            {exercise.sets.map((set, setIdx) => {
              const isWarmUp = set.isWarmUp;
              let prevSetItem = null;
              let prevSetUnit = 'kg';

              if (previousData) {
                const pastSets = previousData.sets;
                prevSetUnit = previousData.unit;
                const sameTypePastSets = pastSets.filter((s: any) => !!s.isWarmUp === !!isWarmUp);
                const myTypeIndex = exercise.sets.slice(0, setIdx).filter((s: any) => !!s.isWarmUp === !!isWarmUp).length;
                prevSetItem = sameTypePastSets[myTypeIndex];
              }

              let convertedPrevWeight = 0;
              if (prevSetItem && prevSetItem.weight > 0) {
                if (prevSetUnit === currentUnit) {
                  convertedPrevWeight = prevSetItem.weight;
                } else if (prevSetUnit === 'kg' && currentUnit === 'lb') {
                  convertedPrevWeight = parseFloat((prevSetItem.weight * 2.20462).toFixed(1));
                } else if (prevSetUnit === 'lb' && currentUnit === 'kg') {
                  convertedPrevWeight = parseFloat((prevSetItem.weight / 2.20462).toFixed(1));
                }
              }

              const prevText = convertedPrevWeight > 0 && prevSetItem ? `${convertedPrevWeight} ${currentUnit} × ${prevSetItem.reps}` : '—';
              
              const lineTimer = lineTimers[set.id];
              const showLineTimer = !!lineTimer;

              return (
                <View key={set.id}>
                  <WorkoutSetSwipeRow
                    isOpen={openSwipeRowId === set.id}
                    onOpen={() => onOpenSwipeRow(set.id)}
                    onClose={onCloseSwipeRow}
                    onDelete={() => onRemoveSet(set.id)}
                    rowBackgroundColor={set.done ? 'rgba(129, 236, 245, 0.05)' : (isWarmUp ? 'rgba(255, 209, 102, 0.05)' : Colors.surfaceContainerHighest)}
                  >
                    <View>
                      <WorkoutSetRow
                        index={setIdx}
                        totalSets={exercise.sets.length}
                        set={set}
                        previousText={prevText}
                        previousWeight={convertedPrevWeight}
                        previousReps={prevSetItem?.reps || 0}
                        isInvalid={invalidSets[set.id] || {}}
                        showLineTimer={showLineTimer}
                        onUpdateSet={(data) => onUpdateSet(set.id, data)}
                        onToggleDone={() => onToggleSet(set.id, set.weight, set.reps, set.done)}
                        onPreviousPress={() => {
                            if (prevSetItem && !set.done && convertedPrevWeight > 0) {
                                onUpdateSet(set.id, { weight: convertedPrevWeight, reps: prevSetItem.reps });
                            }
                        }}
                      />
                      {showLineTimer && (
                        <LineTimerIndicator
                          remaining={lineTimer.remaining}
                          target={lineTimer.target}
                          isDone={lineTimer.done}
                          onPress={() => onLineTimerPress(set.id)}
                        />
                      )}
                    </View>
                  </WorkoutSetSwipeRow>
                </View>
              );
            })}
          </View>

          <View style={styles.addButtonsRow}>
            <TouchableOpacity style={styles.addSetBtn} onPress={() => onAddSet(false)}>
              <MaterialCommunityIcons name="plus" size={18} color={Colors.primary} />
              <ThemedText type="headline" size={14} color={Colors.primary}>Add Set</ThemedText>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};
