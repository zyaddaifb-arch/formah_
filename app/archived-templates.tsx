import React, { useState, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  TextInput,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { ThemedText } from '../components/ThemedText';
import { GridBackground, BlurGlow } from '../components/VisualAccents';
import { useWorkoutStore } from '../store/workoutStore';
import { TemplateSummaryModal } from '../components/TemplateSummaryModal';
import { TemplateActionModal } from '../components/TemplateActionModal';

const { width } = Dimensions.get('window');

export default function ArchivedTemplatesScreen() {
  const router = useRouter();
  const userTemplates = useWorkoutStore(state => state.templates);
  const startWorkout = useWorkoutStore(state => state.startWorkout);
  const history = useWorkoutStore(state => state.history);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = React.useState(false);
  const [actionTemplateId, setActionTemplateId] = React.useState<string | null>(null);

  const archivedTemplates = useMemo(() => {
    return userTemplates.filter(t => t.isArchived);
  }, [userTemplates]);

  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return archivedTemplates;
    return archivedTemplates.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [archivedTemplates, searchQuery]);

  const handleTemplatePress = (template: any) => {
    setSelectedTemplate(template);
    setSummaryVisible(true);
  };

  const handleActionMenuPress = (templateId: string) => {
    setActionTemplateId(templateId);
    setActionModalVisible(true);
  };

  const formatTemplateTitle = (title: string) => {
    if (!title) return '';
    const words = title.trim().split(/\s+/);
    if (words.length > 2) {
      return words.slice(0, 2).join(' ') + '...';
    }
    return title;
  };

  const getExercisePreview = (exercises: any[]) => {
    if (!exercises || exercises.length === 0) return 'No exercises';
    const names = exercises.map(ex => ex.name);
    if (names.length <= 3) return names.join(', ');
    return names.slice(0, 3).join(', ') + '...';
  };

  const getLastPerformedText = (templateId: string) => {
    if (!history || history.length === 0) return 'Never';
    const pastWorkouts = history.filter(w => w.templateId === templateId).sort((a,b) => b.startTime - a.startTime);
    if (pastWorkouts.length === 0) return 'Never';
    
    const latest = pastWorkouts[0];
    const daysAgo = Math.floor((Date.now() - latest.startTime) / (1000 * 60 * 60 * 24));
    if (daysAgo === 0) return 'Today';
    return `${daysAgo}d ago`;
  };

  const handleModalStart = () => {
    if (selectedTemplate) {
      startWorkout(selectedTemplate.id);
      setSummaryVisible(false);
      router.push('/active');
    }
  };

  const handleModalEdit = () => {
    if (selectedTemplate) {
      setSummaryVisible(false);
      router.push({
        pathname: '/create-template',
        params: { templateId: selectedTemplate.id }
      });
    }
  };

  const renderTemplateItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.templateCard} 
      onPress={() => handleTemplatePress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.cardAccent, { backgroundColor: item.color || Colors.primary }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${item.color || Colors.primary}15` }]}>
            <MaterialCommunityIcons name={item.icon as any} size={24} color={item.color || Colors.primary} />
          </View>
          <View style={styles.headerInfo}>
            <ThemedText type="headline" size={18} numberOfLines={1}>{formatTemplateTitle(item.title)}</ThemedText>
            <ThemedText type="label" size={10} color={Colors.error} style={[styles.trackingWidest, { marginBottom: 2 }]}>
              ARCHIVED
            </ThemedText>
            <ThemedText type="body" size={12} color={Colors.onSurfaceVariant} numberOfLines={1}>
              {getExercisePreview(item.exercises)}
            </ThemedText>
          </View>
          <TouchableOpacity 
             style={styles.cardActionBtn} 
             onPress={() => handleActionMenuPress(item.id)}
          >
            <MaterialCommunityIcons name="dots-vertical" size={24} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.metaInfo}>
            <MaterialCommunityIcons name="clock-outline" size={14} color={Colors.onSurfaceVariant} />
            <ThemedText type="body" size={12} color={Colors.onSurfaceVariant}>{getLastPerformedText(item.id)}</ThemedText>
            <View style={styles.metaDivider} />
            <MaterialCommunityIcons name="format-list-bulleted" size={14} color={Colors.onSurfaceVariant} />
            <ThemedText type="body" size={12} color={Colors.onSurfaceVariant}>
              {item.exercises?.length || 0} Ex.
            </ThemedText>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.onSurfaceVariant} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <GridBackground />
      <BlurGlow position="topRight" color={Colors.primary} />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={Colors.onSurface} />
          </TouchableOpacity>
          <ThemedText type="headline" size={24}>Archive</ThemedText>
          <View style={{ width: 36 }} /> {/* Spacer to center title */}
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MaterialCommunityIcons name="magnify" size={20} color={Colors.onSurfaceVariant} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search archive..."
              placeholderTextColor="rgba(225,228,249,0.3)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialCommunityIcons name="close-circle" size={18} color={Colors.onSurfaceVariant} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* List */}
        <FlatList
          data={filteredTemplates}
          renderItem={renderTemplateItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="archive-outline" size={64} color={Colors.surfaceVariant} />
              <ThemedText type="headline" size={20} color={Colors.onSurfaceVariant} style={{ marginTop: 16 }}>
                Archive is empty
              </ThemedText>
            </View>
          }
        />
      </SafeAreaView>

      <TemplateSummaryModal
        visible={summaryVisible}
        onClose={() => setSummaryVisible(false)}
        template={selectedTemplate}
        history={history}
        onStartWorkout={handleModalStart}
        onEditTemplate={handleModalEdit}
      />

      <TemplateActionModal 
        visible={actionModalVisible} 
        onClose={() => setActionModalVisible(false)} 
        templateId={actionTemplateId} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1 },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backBtn: { padding: 4 },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  searchBar: {
    height: 52,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(225,228,249,0.05)',
  },
  searchInput: {
    flex: 1,
    color: Colors.onSurface,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  templateCard: {
    minHeight: 120,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 20,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(225,228,249,0.05)',
  },
  cardAccent: {
    width: 6,
    height: '100%',
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: { flex: 1, gap: 4, marginTop: 4 },
  trackingWidest: { letterSpacing: 1.5 },
  cardActionBtn: {
    padding: 8,
    marginRight: -8,
    marginTop: -8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(225,228,249,0.2)',
    marginHorizontal: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  }
});
