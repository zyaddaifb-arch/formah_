import React from 'react';
import { View, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';

interface PreferencesModalProps {
  isVisible: boolean;
  currentUnit: 'kg' | 'lb';
  onUnitChange: (unit: 'kg' | 'lb') => void;
  onClose: () => void;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  isVisible,
  currentUnit,
  onUnitChange,
  onClose,
}) => {
  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.container} onStartShouldSetResponder={() => true}>
          <ThemedText type="headline" size={20} style={{ marginBottom: 16 }}>Preferences ⚙️</ThemedText>
          
          <ThemedText type="label" size={14} color={Colors.onSurfaceVariant} style={{ marginBottom: 8 }}>Weight Unit</ThemedText>
          <View style={styles.unitSelector}>
            <TouchableOpacity 
              style={[styles.unitBtn, currentUnit === 'kg' && styles.unitBtnActive]}
              onPress={() => onUnitChange('kg')}
            >
              <ThemedText type="headline" size={16}>kg</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.unitBtn, currentUnit === 'lb' && styles.unitBtnActive]}
              onPress={() => onUnitChange('lb')}
            >
              <ThemedText type="headline" size={16}>lb</ThemedText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
            <ThemedText type="headline" size={16} color={Colors.onPrimary}>Done</ThemedText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  unitSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  unitBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(225, 228, 249, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(225, 228, 249, 0.05)',
  },
  unitBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  doneBtn: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
