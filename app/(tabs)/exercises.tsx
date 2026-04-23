import React, { useState, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  SectionList,
  ScrollView,
  Keyboard
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { ThemedText } from '../../components/ThemedText';
import { GridBackground } from '../../components/VisualAccents';
import { ExerciseDetailsModal } from '../../components/ExerciseDetailsModal';
import { EXERCISE_LIBRARY } from '../../store/exerciseLibrary';
import { LibraryExercise } from '../../store/types';
import { Image } from 'expo-image';
import exerciseMapping from '@/constants/exerciseMapping.json';

import { useWorkoutStore } from '../../store/workoutStore';

export default function ExercisesScreen() {
  const insets = useSafeAreaInsets();
  const { user, addCustomExercise } = useWorkoutStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  const library = useMemo(() => {
    return [...EXERCISE_LIBRARY, ...(user.customExercises || [])];
  }, [user.customExercises]);

  const [filterBodyPart, setFilterBodyPart] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Name');
  const [filterModalConfig, setFilterModalConfig] = useState<{ visible: boolean, type: 'bodyPart' | 'category' | 'sort' }>({ visible: false, type: 'bodyPart' });

  // Custom Exercise Modal State
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customBodyPart, setCustomBodyPart] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [customCategoryPickerVisible, setCustomCategoryPickerVisible] = useState(false);
  const [selectedDetailName, setSelectedDetailName] = useState<string | null>(null);

  const BODY_PARTS = ['All', 'Arms', 'Back', 'Cardio', 'Chest', 'Core', 'Full Body', 'Legs', 'Olympic', 'Shoulders'];
  const CATEGORIES = ['All', 'Barbell', 'Cardio', 'Duration', 'Dumbbell', 'Machine', 'Other', 'Reps Only', 'Weighted Bodyweight'];
  const SORTS = ['Name', 'Frequency', 'Last Performed'];

  const handleNewExercise = () => {
    Keyboard.dismiss();
    setCustomName(searchQuery);
    setTimeout(() => {
      setCreateModalVisible(true);
    }, 100);
  };

  const submitCustomExercise = () => {
    if (!customName.trim() || !customCategory || !customBodyPart) return;
    const custom: LibraryExercise = {
      id: 'custom_' + Date.now(),
      name: customName,
      category: customCategory,
      exerciseType: 'weight_reps', 
      bodyPart: customBodyPart,
      frequency: 0,
      lastPerformed: ''
    };
    addCustomExercise(custom);
    setCreateModalVisible(false);
    setCustomName('');
    setSelectedDetailName(custom.name);
  };

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
      <View style={styles.container}>
        <GridBackground />
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.headerRow, { paddingTop: Math.max(insets.top, 16) }]}>
            <ThemedText type="headline" size={24} color={Colors.primary}>Exercise Library</ThemedText>
            <TouchableOpacity onPress={handleNewExercise} style={{ alignItems: 'flex-end' }}>
              <ThemedText type="headline" size={16} color={Colors.primary}>New</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color={Colors.onSurfaceVariant} style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search exercise..."
              placeholderTextColor={Colors.onSurfaceVariant}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.filtersRow}>
            <TouchableOpacity style={[styles.filterPill, filterBodyPart !== 'All' && styles.filterPillActive]} onPress={() => setFilterModalConfig({ visible: true, type: 'bodyPart' })}>
              <ThemedText type="label" size={12} color={filterBodyPart !== 'All' ? Colors.primary : Colors.onSurface}>
                {filterBodyPart === 'All' ? 'Body Part' : filterBodyPart}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterPill, filterCategory !== 'All' && styles.filterPillActive]} onPress={() => setFilterModalConfig({ visible: true, type: 'category' })}>
              <ThemedText type="label" size={12} color={filterCategory !== 'All' ? Colors.primary : Colors.onSurface}>
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
            contentContainerStyle={{ paddingBottom: 100 }}
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.sectionHeader}>
                <ThemedText type="headline" size={16} color={Colors.primary} style={styles.sectionTitle}>{title}</ThemedText>
              </View>
            )}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity 
                  style={styles.itemRow}
                  onPress={() => setSelectedDetailName(item.name)}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemLeft}>
                    <View style={styles.thumbnailBox}>
                      {(exerciseMapping as any)[item.id]?.thumbnail ? (
                        <Image 
                          source={{ uri: (exerciseMapping as any)[item.id].thumbnail }}
                          style={styles.thumbnailImage}
                          contentFit="cover"
                          transition={200}
                        />
                      ) : (
                        <ThemedText type="headline" size={22} color={Colors.onSurface}>{item.name.charAt(0)}</ThemedText>
                      )}
                    </View>

                    
                    <View style={styles.itemInfo}>
                      <ThemedText type="headline" size={16} color={Colors.onSurface}>{item.name}</ThemedText>
                      <ThemedText type="body" size={12} color={Colors.onSurfaceVariant}>{item.bodyPart} • {item.category}</ThemedText>
                    </View>
                  </View>
                  
                  <View style={styles.trailingIconContainer}>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.onSurfaceVariant} />
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
                  Can't find what you're looking for? Add it to your custom library.
                </ThemedText>
                <TouchableOpacity 
                  style={styles.emptyStateBtn} 
                  onPress={handleNewExercise}
                >
                  <ThemedText type="headline" size={14} color={Colors.onPrimary}>New</ThemedText>
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
                  {filterModalConfig.type === 'bodyPart' ? 'Select Body Part' : filterModalConfig.type === 'category' ? 'Select Category' : 'Sort By'}
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
                <TouchableOpacity onPress={submitCustomExercise} disabled={!customName.trim() || !customCategory || !customBodyPart}>
                  <ThemedText type="headline" size={16} color={(customName.trim() && customCategory && customBodyPart) ? Colors.onSurface : Colors.onSurfaceVariant}>Save</ThemedText>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <ThemedText type="headline" size={16} style={{ marginBottom: 12 }}>Name</ThemedText>
                <TextInput
                  style={styles.createInput}
                  placeholder="Add Name..."
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

      <ExerciseDetailsModal 
        visible={!!selectedDetailName} 
        exerciseName={selectedDetailName || ''} 
        onClose={() => setSelectedDetailName(null)} 
      />
    </View>
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
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
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
  pickerOverlay: { backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20, zIndex: 20 },
  pickerContent: { backgroundColor: Colors.surfaceContainerHigh, width: '100%', borderRadius: 24, padding: 20 },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  pickerItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.surfaceVariant },
  
  createOverlay: { backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20, zIndex: 10 },
  createContent: { backgroundColor: Colors.surfaceContainerHigh, width: '100%', borderRadius: 24, padding: 24, maxHeight: '85%' },
  createHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  iconBtnFilled: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 8, borderRadius: 12 },
  createInput: { backgroundColor: Colors.surfaceContainerHighest, height: 56, borderRadius: 12, paddingHorizontal: 16, color: Colors.onSurface, fontSize: 16, fontFamily: 'sans-serif-medium' },
  chipGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  createChip: { backgroundColor: Colors.surfaceContainerHighest, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  createChipActive: { backgroundColor: 'rgba(129, 236, 255, 0.1)', borderColor: Colors.primary },
  createDropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surfaceContainerHighest, height: 56, borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  
  emptyStateContainer: { padding: 40, alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  emptyStateBtn: { backgroundColor: Colors.primaryContainer, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 10 }
});
