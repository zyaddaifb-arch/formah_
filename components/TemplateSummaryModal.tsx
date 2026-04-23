import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  Platform,
  TouchableWithoutFeedback
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { BlurView } from 'expo-blur';
import { WorkoutTemplate, WorkoutSession } from '@/store/types';
import { ExerciseDetailsModal } from '@/components/ExerciseDetailsModal';
import { Image } from 'expo-image';
import { EXERCISE_LIBRARY } from '@/store/exerciseLibrary';
import exerciseMapping from '@/constants/exerciseMapping.json';

const { width, height } = Dimensions.get('window');

interface TemplateSummaryModalProps {
  visible: boolean;
  onClose: () => void;
  template: WorkoutTemplate | null;
  history: WorkoutSession[];
  onStartWorkout: () => void;
  onEditTemplate: () => void;
}

export const TemplateSummaryModal: React.FC<TemplateSummaryModalProps> = ({
  visible,
  onClose,
  template,
  history,
  onStartWorkout,
  onEditTemplate
}) => {
  const [selectedExerciseName, setSelectedExerciseName] = useState<string | null>(null);

  if (!template) return null;

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  const lastPerformed = history
    .filter(session => session.templateId === template.id)
    .sort((a, b) => b.endTime - a.endTime)[0];

  const lastPerformedText = lastPerformed 
    ? `Last performed ${getTimeAgo(lastPerformed.endTime)}`
    : "Never performed";

  const getCategoryLabel = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('chest') || lower.includes('bench')) return "Chest";
    if (lower.includes('back') || lower.includes('row') || lower.includes('pull') || lower.includes('lat')) return "Back";
    if (lower.includes('leg') || lower.includes('squat')) return "Legs";
    if (lower.includes('shoulder') || lower.includes('press')) return "Shoulders";
    if (lower.includes('arm') || lower.includes('bicep') || lower.includes('tricep') || lower.includes('curl')) return "Arms";
    if (lower.includes('abs') || lower.includes('core') || lower.includes('stomach')) return "Core";
    return "Other";
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        
        <View style={styles.container}>
          <View style={styles.content}>
            
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={24} color={Colors.onSurface} />
              </TouchableOpacity>
              
              <ThemedText type="headline" size={20} style={styles.title}>
                {template.title}
              </ThemedText>
              
              {!template.isPreset && (
                <TouchableOpacity onPress={onEditTemplate} style={styles.editBtn}>
                  <ThemedText type="headline" size={16} color={Colors.primary}>Edit</ThemedText>
                </TouchableOpacity>
              )}
              {template.isPreset && <View style={{ width: 40 }} />}
            </View>

            {/* Info Section */}
            <View style={styles.infoSection}>
              <ThemedText type="body" size={14} color={Colors.onSurfaceVariant}>
                {lastPerformedText}
              </ThemedText>
            </View>

            {/* Exercises List */}
            <ScrollView 
              style={styles.scrollArea} 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {template.exercises.map((ex, idx) => {
                const exerciseObj = EXERCISE_LIBRARY.find(e => e.name === ex.name);
                const mediaData = exerciseObj ? (exerciseMapping as any)[exerciseObj.id] : null;

                return (
                <View key={ex.id || idx} style={styles.exerciseItem}>
                  <View style={styles.exerciseIconContainer}>
                    {mediaData?.thumbnail ? (
                      <Image 
                        source={{ uri: mediaData.thumbnail }}
                        style={{ width: '100%', height: '100%', borderRadius: 12 }}
                        contentFit="cover"
                        transition={300}
                      />
                    ) : (
                      <MaterialCommunityIcons name="dumbbell" size={24} color={template.color || Colors.primary} />
                    )}
                  </View>
                  
                  <View style={styles.exerciseInfo}>
                    <ThemedText type="headline" size={16} color={Colors.onSurface}>
                      {ex.sets.length} × {ex.name}
                    </ThemedText>
                    <ThemedText type="body" size={12} color={Colors.onSurfaceVariant}>
                      {getCategoryLabel(ex.name)}
                    </ThemedText>
                  </View>

                  <TouchableOpacity 
                    style={styles.exerciseRight}
                    onPress={() => setSelectedExerciseName(ex.name)}
                  >
                    <MaterialCommunityIcons name="help-circle-outline" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              )})}
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.startBtn} onPress={onStartWorkout}>
                <ThemedText type="headline" size={18} color={Colors.onPrimaryFixed}>
                  Start Workout
                </ThemedText>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </View>

      <ExerciseDetailsModal
        visible={!!selectedExerciseName}
        onClose={() => setSelectedExerciseName(null)}
        exerciseName={selectedExerciseName || ''}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    width: width * 0.9,
    height: height * 0.7,
    borderRadius: 24,
    backgroundColor: Colors.surfaceContainerHigh,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(225, 228, 249, 0.15)',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    letterSpacing: -0.5,
  },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 12,
  },
  exerciseIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  exerciseInfo: {
    flex: 1,
    gap: 2,
  },
  exerciseRight: {
    padding: 8,
  },
  footer: {
    padding: 24,
    backgroundColor: 'rgba(24, 31, 50, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(225, 228, 249, 0.05)',
  },
  startBtn: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});
