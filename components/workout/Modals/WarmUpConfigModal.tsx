import React from 'react';
import { View, Modal, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { styles } from '../ExerciseCard/styles'; // Reusing some overlay styles if possible, else I'll define local ones

interface WarmUpConfigModalProps {
  isVisible: boolean;
  tempCount: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onClose: () => void;
  onConfirm: (count: number) => void;
}

export const WarmUpConfigModal: React.FC<WarmUpConfigModalProps> = ({
  isVisible,
  tempCount,
  onIncrement,
  onDecrement,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={modalStyles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={modalStyles.container} onStartShouldSetResponder={() => true}>
          <ThemedText type="headline" size={22} style={{ marginBottom: 16, textAlign: 'center' }}>Warm-up Sets 💪</ThemedText>
          <ThemedText type="body" size={14} color={Colors.onSurfaceVariant} style={{ marginBottom: 32, textAlign: 'center' }}>
            How many warm-up sets would you like to add?
          </ThemedText>

          <View style={modalStyles.counterRow}>
            <TouchableOpacity style={modalStyles.counterBtn} onPress={onDecrement}>
              <MaterialCommunityIcons name="minus" size={24} color={Colors.primary} />
            </TouchableOpacity>
            
            <View style={modalStyles.countDisplay}>
              <ThemedText type="headline" size={32}>{tempCount}</ThemedText>
            </View>

            <TouchableOpacity style={modalStyles.counterBtn} onPress={onIncrement}>
              <MaterialCommunityIcons name="plus" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={{ gap: 12, marginTop: 40 }}>
            <TouchableOpacity 
              style={modalStyles.primaryBtn} 
              onPress={() => onConfirm(tempCount)}
            >
              <ThemedText type="headline" size={16} color={Colors.onPrimary}>Add {tempCount} Sets</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={modalStyles.secondaryBtn} onPress={onClose}>
              <ThemedText type="headline" size={16} color={Colors.onSurface}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

import { StyleSheet } from 'react-native';
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 14, 28, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 32,
    padding: 32,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: 'rgba(225, 228, 249, 0.1)',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  counterBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(129, 236, 245, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countDisplay: {
    minWidth: 60,
    alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtn: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(225, 228, 249, 0.05)',
  },
});
