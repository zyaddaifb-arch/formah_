import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  SafeAreaView, 
  Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography } from '@/constants/Colors';
import { ThemedText } from './ThemedText';
import { GridBackground, BlurGlow } from './VisualAccents';
import { EXERCISE_INSTRUCTIONS, EXERCISE_LIBRARY } from '@/store/exerciseLibrary';
import { useWorkoutStore } from '@/store/workoutStore';
import { Image } from 'expo-image';
import exerciseMapping from '@/constants/exerciseMapping.json';


const { width, height } = Dimensions.get('window');

// Detailed records/history still stored here for preset exercises
export const EXERCISE_DETAILS_DATA: Record<string, {
  instructions?: string[];
  records: { label: string; value: string }[];
  history: { date: string; summary: string }[];
}> = {
  'Ab Wheel': {
    records: [
      { label: 'Max Sets', value: '5' },
      { label: 'Max Reps', value: '15' },
      { label: 'Personal Best', value: '20 Reps' }
    ],
    history: [
      { date: '27 Mar 2026', summary: '3 sets x 12 reps' },
      { date: '20 Mar 2026', summary: '3 sets x 10 reps' },
      { date: '15 Mar 2026', summary: '2 sets x 8 reps' }
    ]
  },
  'Barbell Bench Press': {
    records: [
      { label: '1RM', value: '100 kg' },
      { label: 'Est. 1RM', value: '105 kg' },
      { label: 'Max Volume', value: '3,500 kg' }
    ],
    history: [
      { date: '25 Mar 2026', summary: '3 sets x 100 kg @ 5 reps' },
      { date: '18 Mar 2026', summary: '3 sets x 95 kg @ 6 reps' }
    ]
  }
};

const DEFAULT_DETAILS = {
  instructions: ['Perform the exercise with controlled movements.', 'Maintain proper form throughout the set.'],
  records: [{ label: 'Personal Best', value: '-' }],
  history: [{ date: 'No history', summary: 'Start tracking to see data' }]
};

interface ExerciseDetailsModalProps {
  visible: boolean;
  exerciseName: string | null;
  onClose: () => void;
}



export function ExerciseDetailsModal({ visible, exerciseName, onClose }: ExerciseDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'Instructions' | 'History' | 'Bests'>('Instructions');
  const globalUnit = useWorkoutStore(state => state.user.weightUnit);
  const allHistory = useWorkoutStore(state => state.history);
  
  if (!exerciseName) return null;

  // Build real history for this exercise from the workout store
  const exerciseHistory = allHistory
    .map(session => {
      const ex = session.exercises.find(e => e.name === exerciseName);
      if (!ex) return null;
      const doneSets = ex.sets.filter(s => s.done && !s.isWarmUp);
      if (doneSets.length === 0) return null;
      const date = new Date(session.startTime).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' });
      const summary = doneSets.map((s, i) => `Set ${i + 1}: ${s.weight > 0 ? `${s.weight}${globalUnit}` : 'BW'} × ${s.reps}`).join('  •  ');
      return { date, summary };
    })
    .filter(Boolean) as { date: string; summary: string }[];

  const rawDetailsData = EXERCISE_DETAILS_DATA[exerciseName];
  const instructions = rawDetailsData?.instructions ?? EXERCISE_INSTRUCTIONS[exerciseName] ?? DEFAULT_DETAILS.instructions;
  const rawData = {
    instructions,
    records: rawDetailsData?.records ?? DEFAULT_DETAILS.records,
    history: exerciseHistory.length > 0 ? exerciseHistory : rawDetailsData?.history ?? DEFAULT_DETAILS.history,
  };

  // Get media data from mapping
  const exerciseObj = EXERCISE_LIBRARY.find(e => e.name === exerciseName);
  const mediaData = exerciseObj ? (exerciseMapping as any)[exerciseObj.id] : null;


  const data = {
    ...rawData,
    records: rawData.records.map(r => ({
      ...r,
      value: r.value.replace(/\bkg\b/gi, globalUnit.toUpperCase())
    })),
    history: rawData.history.map(h => ({
      ...h,
      summary: h.summary.replace(/\bkg\b/gi, globalUnit.toUpperCase())
    })),
    instructions: mediaData?.instructions && mediaData.instructions.length > 0 
      ? mediaData.instructions 
      : rawData.instructions
  };


  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <GridBackground />
        <BlurGlow position="topRight" color={Colors.primary} />
        <BlurGlow position="bottomLeft" color={Colors.tertiary} />
        
        <SafeAreaView style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={24} color={Colors.onSurface} />
            </TouchableOpacity>
            
            <ThemedText type="headline" size={20} color={Colors.onSurface} style={styles.titleText}>
              {exerciseName}
            </ThemedText>
            
            <TouchableOpacity style={styles.editBtn}>
              <ThemedText type="headline" size={16} color={Colors.primary}>Edit</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Custom Tab Bar */}
          <View style={styles.tabBar}>
            {(['Instructions', 'History', 'Bests'] as const).map((tab) => (
              <TouchableOpacity 
                key={tab} 
                style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
                onPress={() => setActiveTab(tab)}
              >
                <ThemedText 
                  type="headline" 
                  size={14} 
                  color={activeTab === tab ? Colors.onSurface : Colors.onSurfaceVariant}
                >
                  {tab}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            {activeTab === 'Instructions' && (
              <View style={styles.tabContent}>
                {/* Illustration / Media Container */}
                <View style={styles.illustrationContainer}>
                  {mediaData?.thumbnail ? (
                    <Image 
                      source={{ uri: mediaData.thumbnail }}
                      style={styles.illustrationImage}
                      contentFit="cover"
                      transition={300}
                    />
                  ) : (
                    <View style={styles.placeholderImg}>
                      <MaterialCommunityIcons name="image-outline" size={64} color={Colors.outlineVariant} />
                    </View>
                  )}
                </View>



                <ThemedText type="headline" size={20} style={styles.sectionTitle}>Instructions</ThemedText>
                
                <View style={styles.instructionsContainer}>
                  {data.instructions.map((step, idx) => (
                    <View key={idx} style={styles.instructionStep}>
                      <View style={styles.stepNumberCol}>
                        <ThemedText type="headline" size={16} color={Colors.primary}>{idx + 1}.</ThemedText>
                      </View>
                      <ThemedText type="body" size={16} color={Colors.onSurface} style={styles.stepText}>
                        {step}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {activeTab === 'History' && (
              <View style={styles.tabContent}>
                 <ThemedText type="headline" size={18} style={styles.sectionTitle}>History</ThemedText>
                 <View style={styles.historyList}>
                   {data.history.map((record, idx) => (
                     <View key={idx} style={styles.historyItem}>
                       <ThemedText type="label" size={12} color={Colors.primary}>{record.date}</ThemedText>
                       <ThemedText type="headline" size={16} color={Colors.onSurface}>{record.summary}</ThemedText>
                     </View>
                   ))}
                 </View>
              </View>
            )}

            {activeTab === 'Bests' && (
              <View style={styles.tabContent}>
                 <ThemedText type="headline" size={18} style={styles.sectionTitle}>Bests & Records</ThemedText>
                 <View style={styles.recordsGrid}>
                   {data.records.map((rec, idx) => (
                     <View key={idx} style={styles.recordCard}>
                       <ThemedText type="label" size={12} color={Colors.onSurfaceVariant}>{rec.label}</ThemedText>
                       <ThemedText type="headline" size={20} color={Colors.primary}>{rec.value}</ThemedText>
                     </View>
                   ))}
                 </View>
              </View>
            )}
            
            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 64,
  },
  closeBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: Colors.surfaceContainerHigh, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  editBtn: { padding: 8 },
  titleText: { flex: 1, textAlign: 'center', fontWeight: 'bold' },
  
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLow,
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 4,
    marginTop: 12,
  },
  tabItem: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tabItemActive: {
    backgroundColor: Colors.surfaceContainerHigh,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  
  contentScroll: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 24,
  },
  tabContent: { flex: 1 },
  illustrationContainer: {
    width: '100%',
    aspectRatio: 1.6,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(225,228,249,0.05)'
  },
  illustrationImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  sectionTitle: { marginBottom: 16 },


  instructionsContainer: { gap: 20 },
  instructionStep: { flexDirection: 'row' },
  stepNumberCol: { width: 28 },
  stepText: { flex: 1, lineHeight: 24 },
  
  historyList: { gap: 12 },
  historyItem: { 
    backgroundColor: Colors.surfaceContainerHigh, 
    padding: 16, 
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(225,228,249,0.05)'
  },
  
  recordsGrid: { gap: 16 },
  recordCard: {
    backgroundColor: Colors.surfaceContainerHigh,
    padding: 20,
    borderRadius: 24,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(225,228,249,0.05)'
  }
});
