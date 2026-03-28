import React from 'react';
import { View, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';

interface ExerciseMenuProps {
  isVisible: boolean;
  onClose: () => void;
  hasStickyNote: boolean;
  onAddNote: (isSticky: boolean) => void;
  onAddWarmUp: () => void;
  onReplace: () => void;
  onPreferences: () => void;
  onRemove: () => void;
}

export const ExerciseMenu: React.FC<ExerciseMenuProps> = ({
  isVisible,
  onClose,
  hasStickyNote,
  onAddNote,
  onAddWarmUp,
  onReplace,
  onPreferences,
  onRemove,
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
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => { onAddNote(false); onClose(); }}
          >
            <View style={styles.menuIconContainer}><MaterialCommunityIcons name="file-document-outline" size={20} color={Colors.primary} /></View>
            <ThemedText type="headline" size={16} color={Colors.onSurface} style={{ flex: 1 }}>Add Note</ThemedText>
          </TouchableOpacity>

          {!hasStickyNote && (
            <TouchableOpacity style={styles.menuItem} onPress={() => { onAddNote(true); onClose(); }}>
              <View style={styles.menuIconContainer}><MaterialCommunityIcons name="pin-outline" size={20} color={Colors.primary} /></View>
              <ThemedText type="headline" size={16} color={Colors.onSurface} style={{ flex: 1 }}>Add Sticky Note</ThemedText>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.menuItem} onPress={() => { onAddWarmUp(); onClose(); }}>
            <View style={styles.menuIconContainer}><MaterialCommunityIcons name="plus-minus" size={20} color={Colors.primary} /></View>
            <ThemedText type="headline" size={16} color={Colors.onSurface} style={{ flex: 1 }}>Add Warm-up Sets</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => { onReplace(); onClose(); }}>
            <View style={styles.menuIconContainer}><MaterialCommunityIcons name="swap-horizontal" size={20} color={Colors.primary} /></View>
            <ThemedText type="headline" size={16} color={Colors.onSurface} style={{ flex: 1 }}>Replace Exercise</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => { onPreferences(); onClose(); }}>
            <View style={styles.menuIconContainer}><MaterialCommunityIcons name="tune-vertical" size={20} color={Colors.primary} /></View>
            <ThemedText type="headline" size={16} color={Colors.onSurface} style={{ flex: 1 }}>Preferences</ThemedText>
            <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => { onRemove(); onClose(); }}>
            <View style={styles.menuIconContainer}><MaterialCommunityIcons name="close" size={20} color="#FF453A" /></View>
            <ThemedText type="headline" size={16} color="#FF453A" style={{ flex: 1 }}>Remove Exercise</ThemedText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 14, 28, 0.4)',
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(225, 228, 249, 0.05)',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(129, 236, 245, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
