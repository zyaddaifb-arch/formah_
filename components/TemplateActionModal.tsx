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
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { BlurView } from 'expo-blur';
import { useWorkoutStore } from '@/store/workoutStore';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface TemplateActionModalProps {
  visible: boolean;
  onClose: () => void;
  templateId: string | null;
}

export const TemplateActionModal: React.FC<TemplateActionModalProps> = ({
  visible,
  onClose,
  templateId
}) => {
  const router = useRouter();
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');

  const templates = useWorkoutStore(state => state.templates);
  const deleteTemplate = useWorkoutStore(state => state.deleteTemplate);
  const duplicateTemplate = useWorkoutStore(state => state.duplicateTemplate);
  const renameTemplate = useWorkoutStore(state => state.renameTemplate);
  const archiveTemplate = useWorkoutStore(state => state.archiveTemplate);
  const unarchiveTemplate = useWorkoutStore(state => state.unarchiveTemplate);

  const template = templates.find(t => t.id === templateId);

  useEffect(() => {
    if (visible && template) {
      setNewName(template.title);
      setIsRenaming(false);
    }
  }, [visible, template]);

  if (!visible || !template) return null;

  const handleEdit = () => {
    onClose();
    router.push({ pathname: '/create-template', params: { templateId: template.id } });
  };

  const handleDuplicate = () => {
    duplicateTemplate(template.id);
    onClose();
  };

  const handleArchive = () => {
    archiveTemplate(template.id);
    onClose();
  };

  const handleUnarchive = () => {
    unarchiveTemplate(template.id);
    onClose();
  };

  const handleDelete = () => {
    deleteTemplate(template.id);
    onClose();
  };

  const handleRenameSubmit = () => {
    if (newName.trim()) {
      renameTemplate(template.id, newName.trim());
      setIsRenaming(false);
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
                <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
                
                {isRenaming ? (
                  <View style={styles.content}>
                    <View style={styles.header}>
                      <ThemedText type="headline" size={20}>Rename Template</ThemedText>
                      <TouchableOpacity onPress={() => setIsRenaming(false)} style={styles.closeBtn}>
                        <MaterialCommunityIcons name="close" size={24} color={Colors.onSurface} />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.input}
                        placeholder="Template Name"
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
                ) : (
                  <View style={styles.content}>
                    <View style={styles.header}>
                      <ThemedText type="headline" size={20} numberOfLines={1} style={{ flex: 1, marginRight: 16 }}>{template.title}</ThemedText>
                      <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <MaterialCommunityIcons name="close" size={24} color={Colors.onSurface} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.optionsList}>
                      {template.isArchived ? (
                        <>
                          <ActionRow icon="archive-arrow-up-outline" label="Unarchive Template" onPress={handleUnarchive} />
                          <ActionRow icon="trash-can-outline" label="Delete Template" onPress={handleDelete} color={Colors.error} />
                        </>
                      ) : (
                        <>
                          {!template.isPreset && (
                            <>
                              <ActionRow icon="pencil-outline" label="Edit Template" onPress={handleEdit} />
                              <ActionRow icon="form-textbox" label="Rename" onPress={() => setIsRenaming(true)} />
                            </>
                          )}
                          
                          <ActionRow icon="content-copy" label="Duplicate" onPress={handleDuplicate} />
                          
                          {!template.isPreset && (
                            <>
                              <ActionRow icon="archive-outline" label="Archive Template" onPress={handleArchive} />
                              <ActionRow icon="trash-can-outline" label="Delete Template" onPress={handleDelete} color={Colors.error} />
                            </>
                          )}
                        </>
                      )}
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
});
