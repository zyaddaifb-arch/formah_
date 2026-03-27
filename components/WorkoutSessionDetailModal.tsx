import React from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  Dimensions,
  TouchableWithoutFeedback
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { ThemedText } from './ThemedText';
import { BlurGlow } from './VisualAccents';
import { WorkoutSession } from '../store/workoutStore';

const { width, height } = Dimensions.get('window');

interface WorkoutSessionDetailModalProps {
  visible: boolean;
  session: WorkoutSession | null;
  onClose: () => void;
}

export function WorkoutSessionDetailModal({ visible, session, onClose }: WorkoutSessionDetailModalProps) {
  if (!session) return null;

  const sessionDate = new Date(session.startTime);
  const durationMs = session.endTime - session.startTime;
  const minutes = Math.floor(durationMs / 60000);

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                    <BlurGlow position="topRight" color={Colors.primary} />
                    
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <View style={styles.headerTitleRow}>
                            <ThemedText type="headline" size={24} color={Colors.onSurface}>{session.title}</ThemedText>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <MaterialCommunityIcons name="close" size={20} color={Colors.onSurface} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.headerMetaRow}>
                            <View style={styles.metaItem}>
                                <MaterialCommunityIcons name="calendar" size={14} color={Colors.primary} />
                                <ThemedText type="label" size={12} color={Colors.onSurfaceVariant}>{sessionDate.toLocaleDateString()}</ThemedText>
                            </View>
                            <View style={styles.metaItem}>
                                <MaterialCommunityIcons name="clock-outline" size={14} color={Colors.primary} />
                                <ThemedText type="label" size={12} color={Colors.onSurfaceVariant}>{minutes} mins</ThemedText>
                            </View>
                            <View style={styles.metaItem}>
                                <MaterialCommunityIcons name="weight-lifter" size={14} color={Colors.primary} />
                                <ThemedText type="label" size={12} color={Colors.onSurfaceVariant}>{session.totalVolume} kg</ThemedText>
                            </View>
                        </View>
                    </View>

                    {/* Exercise List */}
                    <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
                        {session.exercises.map((exercise, exIdx) => (
                            <View key={exercise.id} style={styles.exerciseCard}>
                                <ThemedText type="headline" size={18} color={Colors.primary} style={styles.exerciseName}>
                                    {exercise.name}
                                </ThemedText>
                                
                                <View style={styles.setsHeader}>
                                    <ThemedText type="label" size={10} color={Colors.onSurfaceVariant} style={styles.setCol}>SET</ThemedText>
                                    <ThemedText type="label" size={10} color={Colors.onSurfaceVariant} style={styles.weightCol}>WEIGHT (KG)</ThemedText>
                                    <ThemedText type="label" size={10} color={Colors.onSurfaceVariant} style={styles.repsCol}>REPS</ThemedText>
                                </View>

                                {exercise.sets.map((set, setIdx) => (
                                    <View key={set.id} style={[styles.setRow, set.isWarmUp && styles.warmUpRow]}>
                                        <View style={styles.setCol}>
                                            <ThemedText type="bodyBold" size={12} color={set.isWarmUp ? Colors.onSurfaceVariant : Colors.onSurface}>
                                                {set.isWarmUp ? 'W' : (setIdx + 1)}
                                            </ThemedText>
                                        </View>
                                        <View style={styles.weightCol}>
                                            <ThemedText type="headline" size={14} color={Colors.onSurface}>
                                                {set.weight}
                                            </ThemedText>
                                        </View>
                                        <View style={styles.repsCol}>
                                            <ThemedText type="headline" size={14} color={Colors.onSurface}>
                                                {set.reps}
                                            </ThemedText>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ))}
                        <View style={{ height: 24 }} />
                    </ScrollView>

                    <TouchableOpacity onPress={onClose} style={styles.doneBtn}>
                        <ThemedText type="headline" size={16} color={Colors.background}>DONE</ThemedText>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxHeight: height * 0.8,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(129, 236, 255, 0.2)',
    overflow: 'hidden',
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    marginBottom: 24,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMetaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scrollArea: {
    marginBottom: 24,
  },
  exerciseCard: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(225,228,249,0.05)',
  },
  exerciseName: {
    marginBottom: 16,
  },
  setsHeader: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(225,228,249,0.03)',
  },
  warmUpRow: {
    opacity: 0.7,
  },
  setCol: { width: 40 },
  weightCol: { flex: 1, alignItems: 'center' },
  repsCol: { width: 60, alignItems: 'flex-end' },
  doneBtn: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
});
