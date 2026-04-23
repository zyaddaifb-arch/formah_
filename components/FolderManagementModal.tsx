import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput,
  Dimensions,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { BlurView } from 'expo-blur';
import { useWorkoutStore } from '@/store/workoutStore';

const { width, height } = Dimensions.get('window');

interface FolderManagementModalProps {
  visible: boolean;
  onClose: () => void;
}

export const FolderManagementModal: React.FC<FolderManagementModalProps> = ({
  visible,
  onClose,
}) => {
  const [folderName, setFolderName] = useState('');
  const createFolder = useWorkoutStore(state => state.createFolder);

  const handleCreate = () => {
    if (folderName.trim()) {
      createFolder(folderName.trim());
      setFolderName('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.container}>
                <View style={styles.content}>
                  
                  {/* Header */}
                  <View style={styles.header}>
                    <ThemedText type="headline" size={20}>Templates Folders</ThemedText>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                      <MaterialCommunityIcons name="close" size={24} color={Colors.onSurface} />
                    </TouchableOpacity>
                  </View>

                  {/* New Folder Section */}
                  <View style={styles.section}>
                    <ThemedText type="label" size={12} color={Colors.primary} style={styles.sectionLabel}>NEW FOLDER</ThemedText>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.input}
                        placeholder="Folder Name (e.g. Leg Day)"
                        placeholderTextColor="rgba(225,228,249,0.3)"
                        value={folderName}
                        onChangeText={setFolderName}
                        autoFocus
                      />
                      <TouchableOpacity 
                        style={[styles.addBtn, !folderName.trim() && { opacity: 0.5 }]} 
                        onPress={handleCreate}
                        disabled={!folderName.trim()}
                      >
                        <MaterialCommunityIcons name="plus" size={24} color={Colors.onPrimary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.85,
    borderRadius: 24,
    backgroundColor: Colors.surfaceContainerHigh,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(225, 228, 249, 0.1)',
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  closeBtn: {
    padding: 4,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    letterSpacing: 2,
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    height: 52,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: Colors.onSurface,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(225,228,249,0.1)',
  },
  addBtn: {
    width: 52,
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  folderListContainer: {
    flex: 1,
  },
  folderList: {
    gap: 8,
    marginTop: 8,
  },
  folderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(225,228,249,0.05)',
  },
  folderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
    opacity: 0.5,
  }
});
