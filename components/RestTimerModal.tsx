import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { ThemedText } from './ThemedText';
import { useWorkoutStore } from '../store/workoutStore';
import { useRestTimer } from '@/hooks/workout/useRestTimer';

const { width } = Dimensions.get('window');

interface RestTimerModalProps {
  visible: boolean;
  onClose: () => void;
}

export function RestTimerModal({ visible, onClose }: RestTimerModalProps) {
  // PERF: Uses useRestTimer hook (local interval) instead of subscribing to store's
  // restTimerRemaining (which no longer ticks in the store).
  const { remaining: restTimerRemaining, target: restTimerTarget, isActive: isRestTimerActive } = useRestTimer();
  const stopRestTimer = useWorkoutStore(state => state.stopRestTimer);
  const startRestTimer = useWorkoutStore(state => state.startRestTimer);
  const adjustRestTimer = useWorkoutStore(state => state.adjustRestTimer);

  const [selectedDuration, setSelectedDuration] = React.useState(60);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSkip = () => {
    stopRestTimer();
    onClose();
  };

  const handleStartManual = () => {
    startRestTimer(undefined, selectedDuration);
  };

  const presets = [60, 90, 120, 180];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={80} tint="dark" style={styles.blurBg}>
          <TouchableOpacity style={styles.closeArea} activeOpacity={1} onPress={onClose} />

          <View style={styles.sheet}>
            <ThemedText type="headline" size={24} style={styles.title}>
              {isRestTimerActive && restTimerRemaining === 0 ? 'FINISHED!' : 'Rest Timer'}
            </ThemedText>

            {isRestTimerActive ? (
              <View style={styles.activeDisplay}>
                <View style={[styles.timerCircle, restTimerRemaining === 0 && styles.timerCircleFinished]}>
                  <ThemedText type="headline" size={64} color={restTimerRemaining === 0 ? Colors.error : Colors.primary} style={styles.timerLarge}>
                    {restTimerRemaining === 0 ? '0:00' : formatTime(restTimerRemaining || 0)}
                  </ThemedText>
                </View>

                {restTimerRemaining === 0 ? (
                  <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
                    <ThemedText type="headline" size={18} color={Colors.onPrimary}>Close Timer</ThemedText>
                  </TouchableOpacity>
                ) : (
                  <>
                    <View style={styles.adjustRow}>
                      <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustRestTimer(-15)}>
                        <ThemedText type="headline" size={16} color={Colors.onSurface}>-15s</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustRestTimer(15)}>
                        <ThemedText type="headline" size={16} color={Colors.onSurface}>+15s</ThemedText>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
                      <ThemedText type="headline" size={18} color={Colors.onPrimary}>Skip Rest</ThemedText>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.setupContainer}>
                  <TouchableOpacity
                    style={styles.adjustCircleBtn}
                    onPress={() => setSelectedDuration(prev => Math.max(15, prev - 15))}
                  >
                    <MaterialCommunityIcons name="minus" size={24} color={Colors.primary} />
                  </TouchableOpacity>

                  <View style={styles.durationDisplay}>
                    <ThemedText type="headline" size={48} color={Colors.primary}>
                      {formatTime(selectedDuration)}
                    </ThemedText>
                  </View>

                  <TouchableOpacity
                    style={styles.adjustCircleBtn}
                    onPress={() => setSelectedDuration(prev => prev + 15)}
                  >
                    <MaterialCommunityIcons name="plus" size={24} color={Colors.primary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.presetsRow}>
                  {presets.map(p => (
                    <TouchableOpacity
                      key={p}
                      style={[styles.presetBtn, selectedDuration === p && styles.presetBtnActive]}
                      onPress={() => setSelectedDuration(p)}
                    >
                      <ThemedText type="label" size={12} color={selectedDuration === p ? Colors.onPrimary : Colors.onSurfaceVariant}>
                        {formatTime(p)}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={styles.startBtn} onPress={handleStartManual}>
                  <ThemedText type="headline" size={18} color={Colors.onPrimary}>Start Timer</ThemedText>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <ThemedText type="headline" size={16} color={Colors.onSurfaceVariant}>Close</ThemedText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeArea} activeOpacity={1} onPress={onClose} />
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  blurBg: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  closeArea: { flex: 1, width: '100%' },
  sheet: {
    backgroundColor: '#161923',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(129, 236, 255, 0.1)',
  },
  title: { marginBottom: 32 },
  activeDisplay: { width: '100%', alignItems: 'center' },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: 'rgba(129, 236, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: Colors.primary,
    shadowRadius: 20,
    shadowOpacity: 0.2,
  },
  timerCircleFinished: {
    borderColor: Colors.error,
    shadowColor: Colors.error,
  },
  timerLarge: { letterSpacing: -2 },
  adjustRow: { flexDirection: 'row', gap: 16, marginBottom: 40 },
  adjustBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  skipBtn: {
    backgroundColor: Colors.error,
    width: '100%',
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.error,
    shadowRadius: 15,
    shadowOpacity: 0.3,
  },
  emptyState: { alignItems: 'center', width: '100%' },
  setupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  adjustCircleBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(129, 236, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(129, 236, 255, 0.2)',
  },
  durationDisplay: { alignItems: 'center' },
  presetsRow: { flexDirection: 'row', gap: 8, marginBottom: 40 },
  presetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  presetBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  startBtn: {
    backgroundColor: Colors.primary,
    width: '100%',
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowRadius: 15,
    shadowOpacity: 0.3,
  },
  closeBtn: { marginTop: 24, padding: 12 },
});
