import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput,
  Dimensions,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { BlurView } from 'expo-blur';
import { useWorkoutStore } from '@/store/workoutStore';

const { width } = Dimensions.get('window');

interface FolderActionModalProps {
  visible: boolean;
  onClose: () => void;
  folderId: string | null;
}

export const FolderActionModal: React.FC<FolderActionModalProps> = ({
  visible,
  onClose,
  folderId
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [deleteFlow, setDeleteFlow] = useState<'initial' | 'options' | 'move'>('initial');
  
  const folders = useWorkoutStore(state => state.folders);
  const templates = useWorkoutStore(state => state.templates);
  const renameFolder = useWorkoutStore(state => state.renameFolder);
  const deleteFolder = useWorkoutStore(state => state.deleteFolder);
  const moveFolderTemplates = useWorkoutStore(state => state.moveFolderTemplates);

  const folder = folders?.find(f => f.id === folderId);
  const templatesInFolder = templates.filter(t => t.folderId === folderId);

  useEffect(() => {
    if (visible && folder) {
      setNewName(folder.name);
      setIsRenaming(false);
      setDeleteFlow('initial');
    }
  }, [visible, folder]);

  if (!visible || !folder) return null;

  const handleInitialDelete = () => {
    if (templatesInFolder.length > 0) {
      setDeleteFlow('options');
    } else {
      deleteFolder(folder.id);
      onClose();
    }
  };

  const handleDeleteWithTemplates = () => {
    deleteFolder(folder.id, true);
    onClose();
  };

  const handleRenameSubmit = () => {
    if (newName.trim()) {
      renameFolder(folder.id, newName.trim());
      setIsRenaming(false);
      onClose();
    }
  };

  const handleMoveTemplatesAndClose = (targetFolderId?: string) => {
    moveFolderTemplates(folder.id, targetFolderId);
    deleteFolder(folder.id);
    onClose();
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
              <View style={[styles.container, deleteFlow === 'move' && { maxHeight: '80%' }]}>
                <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
                
                {isRenaming ? (
                  <View style={styles.content}>
                    <View style={styles.header}>
                      <ThemedText type="headline" size={20}>Rename Folder</ThemedText>
                      <TouchableOpacity onPress={() => setIsRenaming(false)} style={styles.closeBtn}>
                        <MaterialCommunityIcons name="close" size={24} color={Colors.onSurface} />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.input}
                        placeholder="Folder Name"
                        placeholderTextColor="rgba(225,228,249,0.3)"
                        value={newName}
                        onChangeText={setNewName}
                        autoFocus
                      />
                      <TouchableOpacity 
                        style={[styles.saveBtn, !newName.trim() && { opacity: 0.5 }]} 
                        onPress={handleRenameSubmit}
                        disabled={!newName.trim()}
                      >
                        <MaterialCommunityIcons name="check" size={24} color={Colors.onPrimary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : deleteFlow === 'options' ? (
                  <View style={styles.content}>
                    <View style={styles.header}>
                      <ThemedText type="headline" size={20}>Delete Options</ThemedText>
                      <TouchableOpacity onPress={() => setDeleteFlow('initial')} style={styles.closeBtn}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.onSurface} />
                      </TouchableOpacity>
                    </View>
                    
                    <ThemedText type="body" size={14} color={Colors.onSurfaceVariant} style={{ marginBottom: 16 }}>
                      This folder contains {templatesInFolder.length} template(s). What would you like to do?
                    </ThemedText>

                    <View style={styles.optionsList}>
                      <ActionRow icon="folder-move-outline" label="Move Templates" onPress={() => setDeleteFlow('move')} />
                      <ActionRow icon="trash-can-outline" label="Delete Folder & Templates" onPress={handleDeleteWithTemplates} color={Colors.error} />
                    </View>
                  </View>
                ) : deleteFlow === 'move' ? (
                  <View style={styles.content}>
                    <View style={styles.header}>
                      <ThemedText type="headline" size={20}>Move Templates To...</ThemedText>
                      <TouchableOpacity onPress={() => setDeleteFlow('options')} style={styles.closeBtn}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.onSurface} />
                      </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.folderList} showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                      <ActionRow 
                        icon="folder-outline" 
                        label="Root (No Folder)" 
                        onPress={() => handleMoveTemplatesAndClose(undefined)} 
                      />
                      {folders.filter(f => f.id !== folder.id).map(f => (
                        <ActionRow 
                          key={f.id}
                          icon="folder" 
                          label={f.name} 
                          onPress={() => handleMoveTemplatesAndClose(f.id)} 
                        />
                      ))}
                    </ScrollView>
                  </View>
                ) : (
                  <View style={styles.content}>
                    <View style={styles.header}>
                      <ThemedText type="headline" size={20} numberOfLines={1} style={{ flex: 1, marginRight: 16 }}>{folder.name}</ThemedText>
                      <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <MaterialCommunityIcons name="close" size={24} color={Colors.onSurface} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.optionsList}>
                      <ActionRow icon="form-textbox" label="Rename Folder" onPress={() => setIsRenaming(true)} />
                      <ActionRow icon="trash-can-outline" label="Delete Folder" onPress={handleInitialDelete} color={Colors.error} />
                    </View>
                  </View>
                )}
                
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const ActionRow = ({ icon, label, onPress, color = Colors.onSurface }: any) => (
  <TouchableOpacity style={styles.actionRow} onPress={onPress}>
    <MaterialCommunityIcons name={icon} size={24} color={color} />
    <ThemedText type="body" size={16} color={color} style={{ flex: 1 }}>{label}</ThemedText>
    <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(225,228,249,0.2)" />
  </TouchableOpacity>
);

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
    marginRight: -4,
  },
  optionsList: {
    gap: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(225,228,249,0.05)',
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
  saveBtn: {
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
  folderList: {
    maxHeight: 300,
  },
});
