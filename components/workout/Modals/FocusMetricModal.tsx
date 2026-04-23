import React from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { FocusMetricType, SetData } from '@/store/types';
import { calculateFocusMetric, formatMetricValue } from '@/utils/focusMetricCalculator';

interface FocusMetricModalProps {
  isVisible: boolean;
  onClose: () => void;
  currentSets: SetData[];
  previousSets?: any[];
  unit: string;
}

const METRICS: { type: FocusMetricType; label: string }[] = [
  { type: 'total_volume', label: 'Total Volume' },
  { type: 'volume_increase', label: 'Volume Increase' },
  { type: 'total_reps', label: 'Total Reps' },
  { type: 'weight_rep', label: 'Best Set (Weight × Reps)' },
  { type: 'estimated_1rm', label: 'Estimated 1RM' },
];

export const FocusMetricModal: React.FC<FocusMetricModalProps> = ({
  isVisible,
  onClose,
  currentSets,
  previousSets,
  unit,
}) => {
  if (!isVisible) return null;

  const handleInfoPress = () => {
    Alert.alert(
      "Exercise Analytics",
      "Analysis metrics for this exercise based on today's session versus your personal record.",
      [{ text: "Thanks", style: "default" }]
    );
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
          <View style={styles.header}>
            <View style={{ width: 32 }} />
            <ThemedText type="headline" size={20} color={Colors.onSurface} style={styles.title}>
              Exercise Analytics
            </ThemedText>
            <TouchableOpacity onPress={handleInfoPress} style={styles.infoButton}>
              <MaterialCommunityIcons name="help" size={20} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <View style={styles.listContainer}>
            {METRICS.map((metric, index) => {
              const value = calculateFocusMetric(metric.type, currentSets, previousSets);
              const formattedValue = formatMetricValue(metric.type, value, unit);
              return (
                <View
                  key={metric.type}
                  style={[styles.row, index === METRICS.length - 1 && styles.lastRow]}
                >
                  <ThemedText type="headline" size={18} color={Colors.onSurface} style={styles.rowLabel}>
                    {metric.label}
                  </ThemedText>
                  
                  <ThemedText type="headline" size={18} color={Colors.primary} style={styles.rowValue}>
                    {formattedValue}
                  </ThemedText>
                </View>
              );
            })}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 14, 28, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: Colors.surfaceContainerHigh,
    width: '100%',
    borderRadius: 24,
    paddingTop: 24,
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(225, 228, 249, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  infoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(225, 228, 249, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(225, 228, 249, 0.05)',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    flex: 1,
    fontWeight: '700',
  },
  rowValue: {
    fontWeight: '800',
  },
});
