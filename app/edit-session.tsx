import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { GridBackground, BlurGlow } from '@/components/VisualAccents';
import { useWorkoutStore } from '@/store/workoutStore';
import { WorkoutSession, Exercise, SetData } from '@/store/types';
import { WorkoutEditor } from '@/components/workout/WorkoutEditor';
import { RenameWorkoutModal } from '@/components/workout/Modals';

export default function EditSessionScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const history = useWorkoutStore(state => state.history);
  const updateSession = useWorkoutStore(state => state.updateSession);

  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameInput, setRenameInput] = useState('');

  // Initialize local state from history
  useEffect(() => {
    const original = history.find(s => s.id === sessionId);
    if (original) {
      // Deep clone to avoid direct mutation
      setSession(JSON.parse(JSON.stringify(original)));
    }
  }, [sessionId, history]);

  if (!session) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ThemedText type="headline" size={20}>Session not found.</ThemedText>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ThemedText type="headline" size={16} color={Colors.onPrimary}>Go Back</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSave = () => {
    if (!session) return;
    
    // Calculate new total volume
    let totalVolume = 0;
    session.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (s.done && !s.isWarmUp) {
          totalVolume += (s.weight * s.reps);
        }
      });
    });

    updateSession(session.id, {
      ...session,
      totalVolume,
    });
    
    router.back();
    Alert.alert('Success', 'Workout session updated.');
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard your edits?',
      [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() }
      ]
    );
  };

  // Local Action Handlers
  const actions = {
    addExercise: (libId: string, name: string) => {
      const newEx: Exercise = {
        id: Date.now().toString() + Math.random(),
        exerciseId: libId,
        name,
        sets: [{ id: Date.now().toString(), weight: 0, reps: 0, done: true }],
      };
      setSession(prev => prev ? { ...prev, exercises: [...prev.exercises, newEx] } : null);
    },
    removeExercise: (id: string) => {
      setSession(prev => prev ? { ...prev, exercises: prev.exercises.filter(e => e.id !== id) } : null);
    },
    replaceExercise: (oldId: string, newId: string, newName: string) => {
      setSession(prev => prev ? {
        ...prev,
        exercises: prev.exercises.map(e => e.id === oldId ? { ...e, exerciseId: newId, name: newName } : e)
      } : null);
    },
    reorderExercises: (exercises: Exercise[]) => {
      setSession(prev => prev ? { ...prev, exercises } : null);
    },
    addSet: (exId: string, isWarmUp?: boolean) => {
      setSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          exercises: prev.exercises.map(ex => {
            if (ex.id !== exId) return ex;
            const newSet: SetData = { 
                id: Date.now().toString(), 
                weight: 0, 
                reps: 0, 
                done: true, 
                isWarmUp 
            };
            return { ...ex, sets: [...ex.sets, newSet] };
          })
        };
      });
    },
    removeSet: (exId: string, setId: string) => {
      setSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          exercises: prev.exercises.map(ex => {
            if (ex.id !== exId) return ex;
            return { ...ex, sets: ex.sets.filter(s => s.id !== setId) };
          })
        };
      });
    },
    updateSet: (exId: string, setId: string, data: Partial<SetData>) => {
      setSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          exercises: prev.exercises.map(ex => {
            if (ex.id !== exId) return ex;
            return {
              ...ex,
              sets: ex.sets.map(s => s.id === setId ? { ...s, ...data } : s)
            };
          })
        };
      });
    },
    toggleSetDone: (exId: string, setId: string) => {
        // In edit mode, we just toggle the 'done' state locally
        setSession(prev => {
            if (!prev) return null;
            return {
              ...prev,
              exercises: prev.exercises.map(ex => {
                if (ex.id !== exId) return ex;
                return {
                  ...ex,
                  sets: ex.sets.map(s => s.id === setId ? { ...s, done: !s.done } : s)
                };
              })
            };
        });
    },
    addNote: (exId: string, isSticky: boolean) => {
      // Notes logic could be added if needed, sticking to core for now
    },
    updateNote: (exId: string, noteId: string, text: string) => {
      setSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          exercises: prev.exercises.map(ex => {
            if (ex.id !== exId) return ex;
            return {
              ...ex,
              notes: ex.notes?.map(n => n.id === noteId ? { ...n, text } : n)
            };
          })
        };
      });
    },
    deleteNote: (exId: string, noteId: string) => {
      setSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          exercises: prev.exercises.map(ex => {
            if (ex.id !== exId) return ex;
            return { ...ex, notes: ex.notes?.filter(n => n.id !== noteId) };
          })
        };
      });
    },
    updateTitle: (title: string) => {
        setRenameInput(title);
        setRenameModalVisible(true);
    },
    toggleWarmUpSets: (exId: string) => {
      setSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          exercises: prev.exercises.map(ex => {
            if (ex.id !== exId) return ex;
            return { ...ex, warmUpSetsEnabled: !ex.warmUpSetsEnabled };
          })
        };
      });
    },
    updateWeightUnit: (exId: string, unit: 'kg' | 'lb') => {
      setSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          exercises: prev.exercises.map(ex => {
            if (ex.id !== exId) return ex;
            return { ...ex, weightUnit: unit };
          })
        };
      });
    },
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <GridBackground />
      <BlurGlow position="topRight" color={Colors.primary} />
      <BlurGlow position="bottomLeft" color={Colors.tertiary} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
            <TouchableOpacity onPress={handleCancel}>
                <ThemedText type="headline" size={16} color={Colors.onSurfaceVariant}>Cancel</ThemedText>
            </TouchableOpacity>
            <ThemedText type="headline" size={18}>Edit Workout</ThemedText>
            <TouchableOpacity onPress={handleSave}>
                <ThemedText type="headline" size={16} color={Colors.primary}>Save</ThemedText>
            </TouchableOpacity>
        </View>

        <WorkoutEditor
          mode="active" // Use active to show weights/reps inputs
          title={session.title}
          exercises={session.exercises}
          actions={actions}
          renderFooter={() => (
            <TouchableOpacity style={styles.discardBtn} onPress={handleCancel}>
              <MaterialCommunityIcons name="trash-can-outline" size={20} color={Colors.error} />
              <ThemedText type="headline" size={16} color={Colors.error}>Discard Changes</ThemedText>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>

      <RenameWorkoutModal
        isVisible={renameModalVisible}
        value={renameInput}
        onChangeText={setRenameInput}
        onClose={() => setRenameModalVisible(false)}
        onConfirm={() => {
          setSession(prev => prev ? { ...prev, title: renameInput } : null);
          setRenameModalVisible(false);
        }}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: { marginTop: 20, backgroundColor: Colors.primary, padding: 12, borderRadius: 8 },
  discardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderRadius: 16,
    gap: 12,
    backgroundColor: 'rgba(255, 113, 108, 0.1)',
    marginTop: 20,
  },
});
