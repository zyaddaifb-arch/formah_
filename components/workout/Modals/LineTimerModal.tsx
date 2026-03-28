import React from 'react';
import { View, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { formatRestTime } from '@/utils/workout';

interface LineTimerModalProps {
  isVisible: boolean;
  remaining: number;
  onAdjust: (offset: number) => void;
  onSkip: () => void;
  onClose: () => void;
}

export const LineTimerModal: React.FC<LineTimerModalProps> = ({
  isVisible,
  remaining,
  onAdjust,
  onSkip,
  onClose,
}) => {
  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.container} onStartShouldSetResponder={() => true}>
          <ThemedText type="headline" size={18} style={{ marginBottom: 16 }}>Line Timer</ThemedText>
          <ThemedText type="headline" size={40} color={Colors.primary} style={{ marginBottom: 24, letterSpacing: -1 }}>
            {formatRestTime(remaining)}
          </ThemedText>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
            <TouchableOpacity
              style={styles.adjBtn}
              onPress={() => onAdjust(-15)}
            >
              <ThemedText type="headline" size={15} color={Colors.onSurface}>-15s</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.adjBtn}
              onPress={() => onAdjust(15)}
            >
              <ThemedText type="headline" size={15} color={Colors.onSurface}>+15s</ThemedText>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={onSkip}
          >
            <ThemedText type="headline" size={16} color={Colors.onPrimary}>Skip</ThemedText>
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
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(225, 228, 249, 0.1)',
  },
  adjBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(225, 228, 249, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  skipBtn: {
    backgroundColor: Colors.primary,
    height: 48,
    width: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
