import React, { useState, useEffect, useMemo } from 'react';
import { LibraryExercise } from '@/store/types';
import { EXERCISE_LIBRARY } from '@/store/exerciseLibrary';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  SectionList,
  Modal,
  SafeAreaView,
  Alert,
  ScrollView,
  Keyboard
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { soundService } from '@/services/SoundService';
import { ThemedText } from './ThemedText';
import { GridBackground } from './VisualAccents';
import { ExerciseDetailsModal } from './ExerciseDetailsModal';

// LibraryExercise type is defined in store/types.ts
export type { LibraryExercise } from '@/store/types';


export interface ExerciseSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onAddExercises: (exercises: { id: string, name: string }[]) => void;
  existingExerciseNames?: string[];
}

export function ExerciseSelectionModal({ visible, onClose, onAddExercises, existingExerciseNames = [] }: ExerciseSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [library, setLibrary] = useState<LibraryExercise[]>(EXERCISE_LIBRARY);

  const [filterBodyPart, setFilterBodyPart] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Name');
  const [filterModalConfig, setFilterModalConfig] = useState<{ visible: boolean, type: 'bodyPart' | 'category' | 'sort' }>({ visible: false, type: 'bodyPart' });

  // Custom Exercise Modal State
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customBodyPart, setCustomBodyPart] = useState('Core');
  const [customCategory, setCustomCategory] = useState('Barbell');
  const [customCategoryPickerVisible, setCustomCategoryPickerVisible] = useState(false);
  const [selectedDetailName, setSelectedDetailName] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setSearchQuery('');
      setSelectedIds(new Set());
    }
  }, [visible]);

  const BODY_PARTS = ['All', 'Arms', 'Back', 'Cardio', 'Chest', 'Core', 'Full Body', 'Legs', 'Olympic', 'Shoulders'];
  const CATEGORIES = ['All', 'Barbell', 'Cardio', 'Duration', 'Dumbbell', 'Machine', 'Other', 'Reps Only', 'Weighted Bodyweight'];

  const SORTS = ['Name', 'Frequency', 'Last Performed'];

  const handleToggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
      soundService.playSelectExercise();
    }
    setSelectedIds(newSet);
  };

  const handleAdd = () => {
    const selectedExercises = Array.from(selectedIds).map(id => {
      const ex = library.find(l => l.id === id);
      return ex ? { id: ex.id, name: ex.name } : null;
    }).filter((ex): ex is { id: string, name: string } => ex !== null);
    
    onAddExercises(selectedExercises);
    setSelectedIds(new Set());
  };

  const handleNewExercise = () => {
    Keyboard.dismiss();
    setCustomName(searchQuery);
    setTimeout(() => {
      setCreateModalVisible(true);
    }, 100);
  };

  const submitCustomExercise = () => {
    if (!customName.trim() || !customCategory) return;
    const custom: LibraryExercise = {
      id: 'custom_' + Date.now(),
      name: customName,
      category: customCategory,
      exerciseType: 'weight_reps', // Default for custom exercises
      bodyPart: customBodyPart,
      frequency: 0,
      lastPerformed: ''
    };
    setLibrary(prev => [...prev, custom]);
    setSelectedIds(prev => new Set(prev).add(custom.id));
    setCreateModalVisible(false);
    setCustomName('');
  };

  // Filter & Group operations
  const sections = useMemo(() => {
    let filtered = library;
    if (searchQuery.trim().length > 0) {
      filtered = filtered.filter(ex => ex.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (filterBodyPart !== 'All') {
      filtered = filtered.filter(ex => ex.bodyPart === filterBodyPart);
    }
    if (filterCategory !== 'All') {
      filtered = filtered.filter(ex => ex.category === filterCategory);
    }

    if (sortBy === 'Name') {
      const groups: { [letter: string]: LibraryExercise[] } = {};
      filtered.forEach(ex => {
        const char = ex.name.charAt(0).toUpperCase();
        if (!groups[char]) groups[char] = [];
        groups[char].push(ex);
      });

      const sortedKeys = Object.keys(groups).sort();
      return sortedKeys.map(key => ({
        title: key,
        data: groups[key].sort((a,b) => a.name.localeCompare(b.name))
      }));
    } else {
      let data = [...filtered];
      if (sortBy === 'Frequency') {
        data.sort((a, b) => (b.frequency || 0) - (a.frequency || 0));
      } else {
        data.sort((a, b) => {
          if (!a.lastPerformed) return 1;
          if (!b.lastPerformed) return -1;
          return new Date(b.lastPerformed).getTime() - new Date(a.lastPerformed).getTime();
        });
      }
      return [{ title: sortBy, data }];
    }
  }, [library, searchQuery, filterBodyPart, filterCategory, sortBy]);

  return (
    <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose}>
      <View style={styles.container}>
        <GridBackground />
        <SafeAreaView style={styles.safeArea}>
          
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
                <MaterialCommunityIcons name="close" size={24} color={Colors.onSurface} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleNewExercise}>
                <ThemedText type="headline" size={16} color={Colors.primary}>New</ThemedText>
              </TouchableOpacity>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={handleAdd} disabled={selectedIds.size === 0}>
                <ThemedText 
                  type="headline" 
                  size={16} 
                  color={selectedIds.size > 0 ? Colors.primary : Colors.onSurfaceVariant}
                >
                  Add {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color={Colors.onSurfaceVariant} style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor={Colors.onSurfaceVariant}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.filtersRow}>
            <TouchableOpacity style={[styles.filterPill, filterBodyPart !== 'All' && styles.filterPillActive]} onPress={() => setFilterModalConfig({ visible: true, type: 'bodyPart' })}>
              <ThemedText type="label" size={14} color={filterBodyPart !== 'All' ? Colors.primary : Colors.onSurface}>
                {filterBodyPart === 'All' ? 'Body Part' : filterBodyPart}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterPill, filterCategory !== 'All' && styles.filterPillActive]} onPress={() => setFilterModalConfig({ visible: true, type: 'category' })}>
              <ThemedText type="label" size={14} color={filterCategory !== 'All' ? Colors.primary : Colors.onSurface}>
                {filterCategory === 'All' ? 'Category' : filterCategory}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterIconBtn} onPress={() => setFilterModalConfig({ visible: true, type: 'sort'})}>
              <MaterialCommunityIcons name="swap-vertical" size={20} color={sortBy !== 'Name' ? Colors.primary : Colors.onSurface} />
            </TouchableOpacity>
          </View>

          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.sectionHeader}>
                <ThemedText type="headline" size={16} color={Colors.primary} style={styles.sectionTitle}>{title}</ThemedText>
              </View>
            )}
            renderItem={({ item }) => {
              const isSelected = selectedIds.has(item.id);
              const isAlreadyAdded = existingExerciseNames.includes(item.name);

              return (
                <TouchableOpacity 
                  style={[
                    styles.itemRow, 
                    isSelected && styles.itemRowSelected,
                    isAlreadyAdded && styles.itemRowAlreadyAdded
                  ]}
                  onPress={() => !isAlreadyAdded && handleToggleSelect(item.id)}
                  activeOpacity={isAlreadyAdded ? 1 : 0.7}
                  disabled={isAlreadyAdded}
                >
                  <View style={styles.itemLeft}>
                    <View style={styles.thumbnailBox}>
                      <ThemedText type="headline" size={22} color={Colors.onSurface}>{item.name.charAt(0)}</ThemedText>
                    </View>
                    
                    <View style={styles.itemInfo}>
                      <ThemedText type="headline" size={16} color={isAlreadyAdded ? Colors.onSurfaceVariant : Colors.onSurface}>{item.name}</ThemedText>
                      <ThemedText type="body" size={12} color={Colors.onSurfaceVariant}>{item.bodyPart} • {item.category}</ThemedText>
                    </View>
                  </View>
                  
                  <View style={styles.trailingIconContainer}>
                    {isAlreadyAdded ? (
                      <View style={styles.addedBadge}>
                        <MaterialCommunityIcons name="check-circle" size={22} color={Colors.primary} />
                      </View>
                    ) : isSelected ? (
                      <MaterialCommunityIcons name="check" size={24} color={Colors.primary} />
                    ) : (
                      <TouchableOpacity 
                        style={styles.questionIcon} 
                        onPress={(e) => {
                          e.stopPropagation();
                          setSelectedDetailName(item.name);
                        }}
                      >
                        <MaterialCommunityIcons name="help" size={16} color={Colors.onSurfaceVariant} />
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={() => (
              <View style={styles.emptyStateContainer}>
                <MaterialCommunityIcons name="magnify-close" size={48} color={Colors.surfaceVariant} style={{ marginBottom: 16 }} />
                <ThemedText type="headline" size={18} color={Colors.onSurface} style={{ textAlign: 'center' }}>
                  {searchQuery ? `"${searchQuery}" not found` : 'No exercises found'}
                </ThemedText>
                <ThemedText type="body" size={14} color={Colors.onSurfaceVariant} style={{ textAlign: 'center', marginTop: 8, marginBottom: 24 }}>
                  Can&apos;t find what you&apos;re looking for? Add it to your custom library.
                </ThemedText>
                <TouchableOpacity 
                  style={styles.emptyStateBtn} 
                  onPress={handleNewExercise}
                >
                  <ThemedText type="headline" size={14} color={Colors.onPrimary}>Create Custom Exercise</ThemedText>
                </TouchableOpacity>
              </View>
            )}
          />
          
        </SafeAreaView>

        {filterModalConfig.visible && (
          <View style={[StyleSheet.absoluteFill, styles.pickerOverlay]}>
            <View style={styles.pickerContent}>
              <View style={styles.pickerHeader}>
                <ThemedText type="headline" size={20}>
                  Select {filterModalConfig.type === 'bodyPart' ? 'Body Part' : filterModalConfig.type === 'category' ? 'Category' : 'Sort By'}
                </ThemedText>
                <TouchableOpacity onPress={() => setFilterModalConfig({ ...filterModalConfig, visible: false })}>
                  <MaterialCommunityIcons name="close" size={24} color={Colors.onSurface} />
                </TouchableOpacity>
              </View>
              {(filterModalConfig.type === 'sort' ? SORTS : filterModalConfig.type === 'bodyPart' ? BODY_PARTS : CATEGORIES).map(opt => (
                <TouchableOpacity 
                  key={opt} 
                  style={styles.pickerItem} 
                  onPress={() => {
                    if (filterModalConfig.type === 'bodyPart') setFilterBodyPart(opt);
                    else if (filterModalConfig.type === 'category') setFilterCategory(opt);
                    else setSortBy(opt);
                    setFilterModalConfig({ ...filterModalConfig, visible: false });
                  }}
                >
                  <ThemedText type="body" size={16} color={
                    (filterModalConfig.type === 'bodyPart' ? filterBodyPart : filterModalConfig.type === 'category' ? filterCategory : sortBy) === opt ? Colors.primary : Colors.onSurface
                  }>{opt}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {createModalVisible && (
          <View style={[StyleSheet.absoluteFill, styles.createOverlay]}>
            <View style={styles.createContent}>
              <View style={styles.createHeader}>
                <TouchableOpacity onPress={() => setCreateModalVisible(false)} style={styles.iconBtnFilled}>
                  <MaterialCommunityIcons name="close" size={20} color={Colors.onSurface} />
                </TouchableOpacity>
                <ThemedText type="headline" size={18}>Create New Exercise</ThemedText>
                <TouchableOpacity onPress={submitCustomExercise} disabled={!customName.trim() || !customCategory}>
                  <ThemedText type="headline" size={16} color={(customName.trim() && customCategory) ? Colors.onSurface : Colors.onSurfaceVariant}>Save</ThemedText>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <ThemedText type="headline" size={16} style={{ marginBottom: 12 }}>Name</ThemedText>
                <TextInput
                  style={styles.createInput}
                  placeholder="Add Name"
                  placeholderTextColor={Colors.onSurfaceVariant}
                  value={customName}
                  onChangeText={setCustomName}
                />

                <ThemedText type="headline" size={16} style={{ marginBottom: 12, marginTop: 24 }}>Body Part</ThemedText>
                <View style={styles.chipGroup}>
                  {BODY_PARTS.slice(1).map(b => (
                    <TouchableOpacity 
                      key={b} 
                      style={[styles.createChip, customBodyPart === b && styles.createChipActive]} 
                      onPress={() => setCustomBodyPart(b)}
                    >
                      <ThemedText type="headline" size={14} color={customBodyPart === b ? Colors.onSurface : Colors.onSurfaceVariant}>{b}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>

                <ThemedText type="headline" size={16} style={{ marginBottom: 12, marginTop: 24 }}>Category</ThemedText>
                <TouchableOpacity style={styles.createDropdown} onPress={() => setCustomCategoryPickerVisible(true)}>
                  <ThemedText type="headline" size={16} color={customCategory ? Colors.onSurface : Colors.onSurfaceVariant}>
                    {customCategory || 'Select an Option'}
                  </ThemedText>
                  <MaterialCommunityIcons name="unfold-more-horizontal" size={24} color={Colors.onSurfaceVariant} />
                </TouchableOpacity>
                
                <View style={{ height: 100 }} />
              </ScrollView>
            </View>
          </View>
        )}

        {customCategoryPickerVisible && (
          <View style={[StyleSheet.absoluteFill, styles.pickerOverlay]}>
            <View style={styles.pickerContent}>
              <View style={styles.pickerHeader}>
                <ThemedText type="headline" size={20}>Select Category</ThemedText>
                <TouchableOpacity onPress={() => setCustomCategoryPickerVisible(false)}>
                  <MaterialCommunityIcons name="close" size={24} color={Colors.onSurface} />
                </TouchableOpacity>
              </View>
              {CATEGORIES.slice(1).map(opt => (
                <TouchableOpacity 
                  key={opt} 
                  style={styles.pickerItem} 
                  onPress={() => {
                    setCustomCategory(opt);
                    setCustomCategoryPickerVisible(false);
                  }}
                >
                  <ThemedText type="body" size={16} color={customCategory === opt ? Colors.primary : Colors.onSurface}>{opt}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      <ExerciseDetailsModal 
        visible={!!selectedDetailName} 
        exerciseName={selectedDetailName} 
        onClose={() => setSelectedDetailName(null)} 
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, backgroundColor: Colors.background },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { padding: 4 },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.surfaceContainerHigh, 
    marginHorizontal: 20, 
    borderRadius: 12, 
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(225, 228, 249, 0.05)'
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: Colors.onSurface, fontSize: 16, height: '100%' },
  filtersRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    marginBottom: 16,
    gap: 8
  },
  filterPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(225, 228, 249, 0.05)'
  },
  filterPillActive: {
    backgroundColor: 'rgba(129, 236, 255, 0.1)',
    borderColor: Colors.primary
  },
  filterIconBtn: {
    backgroundColor: 'rgba(129, 236, 255, 0.1)',
    padding: 10,
    borderRadius: 20,
    marginLeft: 8
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'transparent'
  },
  sectionTitle: {
    fontWeight: '700'
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  itemRowSelected: {
    backgroundColor: 'rgba(33, 93, 133, 0.4)', 
  },
  itemRowAlreadyAdded: {
    backgroundColor: 'rgba(129, 236, 255, 0.05)',
    opacity: 0.6
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  thumbnailBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    justifyContent: 'center',
    gap: 2
  },
  trailingIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
    height: 32,
  },
  addedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  questionIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pickerOverlay: { backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  pickerContent: { backgroundColor: Colors.surfaceContainerHigh, width: '100%', borderRadius: 24, padding: 20 },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  pickerItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.surfaceVariant },
  
  createOverlay: { backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  createContent: { backgroundColor: Colors.surfaceContainerHigh, width: '100%', borderRadius: 24, padding: 24, maxHeight: '85%' },
  createHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  iconBtnFilled: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 8, borderRadius: 12 },
  createInput: { backgroundColor: Colors.surfaceContainerHighest, height: 56, borderRadius: 12, paddingHorizontal: 16, color: Colors.onSurface, fontSize: 16, fontFamily: 'sans-serif-medium' },
  chipGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  createChip: { backgroundColor: Colors.surfaceContainerHighest, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  createChipActive: { backgroundColor: 'rgba(129, 236, 255, 0.1)', borderColor: Colors.primary },
  createDropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surfaceContainerHighest, height: 56, borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  
  emptyStateContainer: { padding: 40, alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  emptyStateBtn: { backgroundColor: Colors.primaryContainer, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }
});
