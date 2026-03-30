import React, { useState, useEffect } from 'react';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { GridBackground, BlurGlow } from '@/components/VisualAccents';
import { useWorkoutStore } from '@/store/workoutStore';
import { Exercise } from '@/store/types';

import { WorkoutEditor } from '../components/workout/WorkoutEditor';

export default function CreateTemplateScreen() {
  const router = useRouter();
  const { templateId, folderId } = useLocalSearchParams<{ templateId?: string; folderId?: string }>();
  
  const draftTemplate = useWorkoutStore(state => state.draftTemplate);
  const startTemplateCreation = useWorkoutStore(state => state.startTemplateCreation);
  const addExerciseToDraft = useWorkoutStore(state => state.addExerciseToDraft);
  const removeExerciseFromDraft = useWorkoutStore(state => state.removeExerciseFromDraft);
  const addSetToDraftExercise = useWorkoutStore(state => state.addSetToDraftExercise);
  const removeSetFromDraftExercise = useWorkoutStore(state => state.removeSetFromDraftExercise);
  const updateSetInDraft = useWorkoutStore(state => state.updateSetInDraft);
  const updateDraftTemplateName = useWorkoutStore(state => state.updateDraftTemplateName);
  const setExercisesOrderInDraft = useWorkoutStore(state => state.setExercisesOrderInDraft);
  const saveDraftTemplate = useWorkoutStore(state => state.saveDraftTemplate);
  const cancelTemplateCreation = useWorkoutStore(state => state.cancelTemplateCreation);
  const folders = useWorkoutStore(state => state.folders);
  const updateDraftTemplate = useWorkoutStore(state => state.updateDraftTemplate);


  useEffect(() => {
    startTemplateCreation(templateId, folderId);
  }, [templateId, folderId]);

  if (!draftTemplate) return null;

  const handleBack = () => {
    if (draftTemplate && (draftTemplate.exercises.length > 0)) {
      Alert.alert(
        "Discard Changes?",
        "You have unsaved changes. Are you sure you want to go back?",
        [
          { text: "Keep Editing", style: "cancel" },
          { 
            text: "Discard", 
            style: "destructive", 
            onPress: () => {
              cancelTemplateCreation();
              router.back();
            }
          }
        ]
      );
    } else {
      cancelTemplateCreation();
      router.back();
    }
  };

  const handleSave = () => {
    if (!draftTemplate?.title.trim()) {
      Alert.alert("Required", "Please enter a template name.");
      return;
    }
    if (draftTemplate.exercises.length === 0) {
      Alert.alert("Required", "Please add at least one exercise.");
      return;
    }
    saveDraftTemplate();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Success", "Template saved successfully!");
    router.back();
  };


  return (
    <GestureHandlerRootView style={styles.container}>
      <GridBackground />
      <BlurGlow position="topRight" color={Colors.primary} />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.headerBtn}>
                <MaterialCommunityIcons name="close" size={24} color={Colors.onSurface} />
            </TouchableOpacity>
            
            <View style={styles.headerCenter}>
                <ThemedText type="headline" size={18}>{templateId ? 'Edit Template' : 'New Template'}</ThemedText>
            </View>

            <TouchableOpacity onPress={handleSave} style={[styles.headerBtn, styles.saveBtn]}>
                <ThemedText type="headline" size={14} color={Colors.onPrimary}>Save</ThemedText>
            </TouchableOpacity>
        </View>

        <View style={styles.folderSelection}>
            <MaterialCommunityIcons name="folder-outline" size={16} color={Colors.onSurfaceVariant} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.folderChips}>
                <TouchableOpacity 
                    style={[styles.folderChip, !draftTemplate.folderId && styles.folderChipActive]}
                    onPress={() => updateDraftTemplate({ folderId: undefined })}
                >
                    <ThemedText type="label" size={10} color={!draftTemplate.folderId ? Colors.onPrimary : Colors.onSurfaceVariant}>NONE</ThemedText>
                </TouchableOpacity>
                {folders.map(folder => (
                    <TouchableOpacity 
                        key={folder.id}
                        style={[styles.folderChip, draftTemplate.folderId === folder.id && styles.folderChipActive]}
                        onPress={() => updateDraftTemplate({ folderId: folder.id })}
                    >
                        <ThemedText type="label" size={10} color={draftTemplate.folderId === folder.id ? Colors.onPrimary : Colors.onSurfaceVariant}>{folder.name.toUpperCase()}</ThemedText>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>

        <WorkoutEditor
            mode="template"
            title={draftTemplate.title}
            exercises={draftTemplate.exercises}
            actions={{
                addExercise: addExerciseToDraft,
                removeExercise: removeExerciseFromDraft,
                replaceExercise: (oldId: string, newId: string, newName: string) => useWorkoutStore.getState().replaceDraftExercise(oldId, newId, newName),
                reorderExercises: setExercisesOrderInDraft,
                addSet: addSetToDraftExercise,
                removeSet: removeSetFromDraftExercise,
                updateSet: updateSetInDraft,
                addNote: (exId: string, isSticky: boolean) => useWorkoutStore.getState().addDraftExerciseNote(exId, isSticky),
                updateNote: (exId: string, noteId: string, text: string) => useWorkoutStore.getState().updateDraftExerciseNote(exId, noteId, text),
                deleteNote: (exId: string, noteId: string) => useWorkoutStore.getState().deleteDraftExerciseNote(exId, noteId),
                updateTitle: updateDraftTemplateName,
            }}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1 },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(225,228,249,0.05)',
  },
  headerBtn: { padding: 8 },
  headerCenter: { flex: 1, alignItems: 'center' },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  scrollContent: { paddingBottom: 100 },
  titleSection: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleInput: {
    flex: 1,
    fontSize: 24,
    color: Colors.onSurface,
    fontWeight: 'bold',
    paddingVertical: 8,
  },
  reorderBtn: { padding: 8 },
  footer: { paddingHorizontal: 20, marginTop: 20 },
  addBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderRadius: 16,
    gap: 12,
  },
  folderSelection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(225,228,249,0.05)',
  },
  folderChips: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 40,
  },
  folderChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(225,228,249,0.1)',
  },
  folderChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  }
});
