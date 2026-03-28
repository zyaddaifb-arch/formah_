import React from 'react';
import { View, Modal, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';

interface RenameWorkoutModalProps {
  isVisible: boolean;
  value: string;
  onChangeText: (text: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const RenameWorkoutModal: React.FC<RenameWorkoutModalProps> = ({
  isVisible,
  value,
  onChangeText,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.container} onStartShouldSetResponder={() => true}>
          <ThemedText type="headline" size={20} style={{ marginBottom: 16 }}>Rename Workout ✏️</ThemedText>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder="Workout Title"
            placeholderTextColor="rgba(225, 228, 249, 0.3)"
            autoFocus
          />
          <View style={{ gap: 12 }}>
            <TouchableOpacity 
              style={styles.primaryBtn} 
              onPress={onConfirm}
            >
              <ThemedText type="headline" size={16} color={Colors.onPrimary}>Save</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={onClose}>
              <ThemedText type="headline" size={16} color={Colors.onSurface}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
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
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: 'rgba(225, 228, 249, 0.1)',
  },
  input: {
    backgroundColor: 'rgba(225, 228, 249, 0.05)',
    borderRadius: 12,
    padding: 16,
    color: Colors.onSurface,
    fontFamily: 'Manrope_700Bold',
    fontSize: 18,
    marginBottom: 24,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtn: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(225, 228, 249, 0.05)',
  },
});
