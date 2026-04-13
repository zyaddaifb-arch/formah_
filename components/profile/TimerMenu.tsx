import React from 'react';
import { View, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';

interface TimerMenuProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (seconds: number) => void;
  currentValue: number;
}

const DURATIONS = [
  { label: '30 seconds', value: 30 },
  { label: '45 seconds', value: 45 },
  { label: '1 minute', value: 60 },
  { label: '1 min 30 sec', value: 90 },
  { label: '2 minutes', value: 120 },
  { label: '2 min 30 sec', value: 150 },
  { label: '3 minutes', value: 180 },
  { label: '5 minutes', value: 300 },
];

export const TimerMenu: React.FC<TimerMenuProps> = ({
  isVisible,
  onClose,
  onSelect,
  currentValue,
}) => {
  if (!isVisible) return null;

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity 
        style={styles.menuOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.popupMenu}>
            <View style={styles.header}>
              <ThemedText type="headline" size={16} color={Colors.onSurfaceVariant} style={{ letterSpacing: 1.5 }}>DEFAULT REST TIMER</ThemedText>
            </View>
            
            {DURATIONS.map((item, index) => (
              <TouchableOpacity 
                key={item.value}
                style={[
                  styles.menuItem, 
                  index === DURATIONS.length - 1 && { borderBottomWidth: 0 },
                  item.value === currentValue && { backgroundColor: 'rgba(129, 236, 245, 0.05)' }
                ]} 
                onPress={() => { onSelect(item.value); onClose(); }}
              >
                <ThemedText 
                  type="headline" 
                  size={16} 
                  color={item.value === currentValue ? Colors.primary : Colors.onSurface} 
                  style={{ flex: 1 }}
                >
                  {item.label}
                </ThemedText>
                {item.value === currentValue && (
                  <MaterialCommunityIcons name="check" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 14, 28, 0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  popupMenu: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(225, 228, 249, 0.1)',
  },
  header: {
    padding: 16,
    paddingTop: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(225, 228, 249, 0.05)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(225, 228, 249, 0.05)',
  },
});
