import React from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  FlatList,
  Dimensions,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { ThemedText } from '../../components/ThemedText';
import { GridBackground, BlurGlow } from '../../components/VisualAccents';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { TemplateSummaryModal } from '../../components/TemplateSummaryModal';
import { FolderManagementModal } from '../../components/FolderManagementModal';
import { TemplateActionModal } from '../../components/TemplateActionModal';
import { FolderActionModal } from '../../components/FolderActionModal';

const { width } = Dimensions.get('window');

import { useWorkoutStore } from '../../store/workoutStore';
import { useWorkoutActions } from '../../hooks/workout/useWorkoutActions';
import { PRESET_TEMPLATES } from '../../store/presets';
import { calculateStreakData } from '../../utils/streak';
import { StreakGlow } from '../../components/StreakGlow';
import { StreakDetailsModal } from '../../components/StreakDetailsModal';

export default function HomeScreen() {
  const router = useRouter();
  const { startNewWorkout } = useWorkoutActions();
  const templates = useWorkoutStore(state => state.templates);
  const history = useWorkoutStore(state => state.history);
  const user = useWorkoutStore(state => state.user);
  const folders = useWorkoutStore(state => state.folders);
  
  const [selectedTemplate, setSelectedTemplate] = React.useState<any>(null);
  const [summaryVisible, setSummaryVisible] = React.useState(false);
  const [folderModalVisible, setFolderModalVisible] = React.useState(false);
  const [actionModalVisible, setActionModalVisible] = React.useState(false);
  const [actionTemplateId, setActionTemplateId] = React.useState<string | null>(null);
  
  const [folderActionModalVisible, setFolderActionModalVisible] = React.useState(false);
  const [actionFolderId, setActionFolderId] = React.useState<string | null>(null);

  const [collapsedFolders, setCollapsedFolders] = React.useState<Record<string, boolean>>({});
  const deleteFolder = useWorkoutStore(state => state.deleteFolder);

  const toggleFolderCollapse = (folderId: string) => {
    setCollapsedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const handleFolderOptions = (folder: any) => {
    setActionFolderId(folder.id);
    setFolderActionModalVisible(true);
  };

  const [streakModalVisible, setStreakModalVisible] = React.useState(false);

  const streakData = React.useMemo(() => calculateStreakData(history), [history]);
  const streakDays = streakData.currentStreak;

  const handleStartWorkout = () => {
    startNewWorkout();
  };

  const handleTemplatePress = (template: any) => {
    setSelectedTemplate(template);
    setSummaryVisible(true);
  };

  const handleModalStart = () => {
    if (selectedTemplate) {
      setSummaryVisible(false);
      startNewWorkout(selectedTemplate.id);
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
    if (!exercises || exercises.length === 0) return 'No exercises yet';
    const names = exercises.map(ex => ex.name);
    if (names.length <= 4) return names.join(', ');
    return names.slice(0, 4).join(', ') + '...';
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

  const renderTemplate = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.templateCard} onPress={() => handleTemplatePress(item)}>
      <View style={[styles.templateIconOverlay, { opacity: 0.05 }]}>
        <MaterialCommunityIcons name={item.icon as any} size={120} color={item.color} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <ThemedText type="headline" size={10} color={item.color} style={[styles.trackingWidest, { opacity: 0.6 }]}>{item.type.toUpperCase()}</ThemedText>
          <ThemedText type="headline" size={24} style={styles.templateTitle} numberOfLines={1}>{formatTemplateTitle(item.title)}</ThemedText>
          <ThemedText type="body" size={12} color={Colors.onSurfaceVariant} numberOfLines={2} style={{ marginTop: 8, lineHeight: 18 }}>
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
      <View style={styles.templateFooter}>
        <View style={styles.templateMeta}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="clock-outline" size={12} color={Colors.onSurfaceVariant} />
            <ThemedText type="body" size={12} color={Colors.onSurfaceVariant}>{getLastPerformedText(item.id)}</ThemedText>
          </View>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="format-list-bulleted" size={12} color={Colors.onSurfaceVariant} />
            <ThemedText type="body" size={12} color={Colors.onSurfaceVariant}>{item.exercises?.length || 0} Ex.</ThemedText>
          </View>
        </View>
        <View style={styles.addExerciseBtn}>
          <MaterialCommunityIcons name="play" size={20} color={item.color} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTemplateList = (data: any[], title: string, showViewAll: boolean = false, folder?: any) => {
    const isCollapsed = folder ? collapsedFolders[folder.id] : false;

    return (
      <View key={folder?.id || title} style={styles.templatesSection}>
        <View style={styles.subHeader}>
          <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            activeOpacity={folder ? 0.7 : 1}
            onPress={() => folder && toggleFolderCollapse(folder.id)}
          >
              <ThemedText type="headline" size={20}>{title} ({data.length})</ThemedText>
              {folder && (
                <MaterialCommunityIcons 
                  name={isCollapsed ? "chevron-down" : "chevron-up"} 
                  size={20} 
                  color={Colors.onSurfaceVariant} 
                />
              )}
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              {folder && (
                  <>
                    <TouchableOpacity onPress={() => router.push({ pathname: '/create-template', params: { folderId: folder.id } })}>
                        <MaterialCommunityIcons name="plus-circle-outline" size={24} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleFolderOptions(folder)}>
                        <MaterialCommunityIcons name="dots-horizontal" size={24} color={Colors.onSurfaceVariant} />
                    </TouchableOpacity>
                  </>
              )}
              {showViewAll && (
                <TouchableOpacity onPress={() => router.push('/all-templates')}>
                  <ThemedText type="label" size={10} color={Colors.primary} style={styles.trackingTighter}>VIEW ALL</ThemedText>
                </TouchableOpacity>
              )}
          </View>
        </View>
        
        {!isCollapsed && (
          data.length > 0 ? (
            <FlatList
              data={data}
              renderItem={renderTemplate}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.templateList}
              keyExtractor={item => item.id}
            />
          ) : (
            <View style={{ paddingHorizontal: 24, paddingVertical: 16, alignItems: 'center' }}>
              <ThemedText type="body" size={14} color={Colors.onSurfaceVariant} style={{ textAlign: 'center' }}>
                No templates in this folder yet.
              </ThemedText>
            </View>
          )
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <GridBackground />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.greetingSection}>
          <ThemedText type="label" size={12} color={Colors.primary} style={styles.trackingWidest}>WELCOME BACK</ThemedText>
          <ThemedText type="headline" size={36} color={Colors.onSurface} style={styles.greetingTitle}>{user.name}</ThemedText>
        </View>

        <TouchableOpacity 
          style={styles.startWorkoutBtn} 
          onPress={handleStartWorkout}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="play" size={24} color={Colors.onPrimaryFixed} />
          <ThemedText type="headline" size={20} color={Colors.onPrimaryFixed}>Start Workout</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.streakCard} 
          onPress={() => setStreakModalVisible(true)}
          activeOpacity={0.9}
        >
          <View style={styles.streakGlowContainer}>
            <View style={{ position: 'absolute', top: 40, right: 40 }}>
              <StreakGlow active={streakDays > 0} color={Colors.primary} />
            </View>
            <MaterialCommunityIcons 
              name="fire" 
              size={120} 
              color={Colors.primary} 
              style={{ 
                opacity: streakDays > 0 ? 0.4 : 0.1,
                position: 'absolute',
                top: -10,
                right: -10,
              }} 
            />
          </View>
          <View>
            <ThemedText type="label" size={10} color={Colors.onSurfaceVariant} style={styles.trackingWidest}>CURRENT MOMENTUM</ThemedText>
            <View style={styles.streakMain}>
              <ThemedText type="headline" size={60} color={streakDays > 0 ? Colors.primary : Colors.onSurfaceVariant}>{streakDays}</ThemedText>
              <ThemedText type="headline" size={24} style={styles.streakLabel}>WEEKLY STREAK</ThemedText>
            </View>
          </View>
          <View style={styles.streakFooter}>
            <View style={styles.weekDots}>
              {['S', 'S', 'M', 'T', 'W', 'T', 'F'].map((day, i) => (
                <View key={i} style={[
                  styles.dayDot, 
                  streakData.weeklyActivity[i] ? styles.dayDotActive : styles.dayDotInactive
                ]}>
                  <ThemedText 
                    type="headline" 
                    size={10} 
                    color={streakData.weeklyActivity[i] ? Colors.onPrimary : Colors.onSurfaceVariant}
                  >
                    {day}
                  </ThemedText>
                </View>
              ))}
            </View>
            <ThemedText type="body" size={11} color={Colors.onSurfaceVariant}>Keep it up, {user.name.split(' ')[0]}.</ThemedText>
          </View>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <ThemedText type="headline" size={24} color={Colors.primary}>Templates</ThemedText>
          <View style={styles.sectionActions}>
            <TouchableOpacity 
              style={styles.addTemplateBtn}
              onPress={() => router.push('/create-template')}
            >
              <MaterialCommunityIcons name="plus" size={14} color={Colors.onPrimaryFixed} />
              <ThemedText type="headline" size={10} color={Colors.onPrimaryFixed}>TEMPLATE</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setFolderModalVisible(true)}>
              <MaterialCommunityIcons name="folder-outline" size={20} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/archived-templates')}>
              <MaterialCommunityIcons name="archive-outline" size={20} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Templates Section */}
        {templates.filter(t => !t.folderId && !t.isArchived).length === 0 && folders.length === 0 ? (
          <View style={styles.homeEmptyState}>
            <LinearGradient
              colors={['rgba(129, 236, 255, 0.08)', 'rgba(129, 236, 255, 0.03)']}
              style={styles.emptyHomeGradient}
            >
              <View style={styles.emptyHomeHeader}>
                <MaterialCommunityIcons name="lightning-bolt" size={32} color={Colors.primary} />
                <ThemedText type="headline" size={24}>COMMAND YOUR GAINS</ThemedText>
              </View>
              <ThemedText type="body" size={14} color={Colors.onSurfaceVariant} style={{ lineHeight: 22, marginBottom: 24 }}>
                Setup your custom training templates to track progress with clinical precision.
              </ThemedText>
              <TouchableOpacity 
                style={styles.homeCtaBtn}
                onPress={() => router.push('/create-template')}
              >
                <ThemedText type="headline" size={14} color={Colors.onPrimaryFixed}>CREATE TEMPLATE</ThemedText>
                <MaterialCommunityIcons name="plus" size={18} color={Colors.onPrimaryFixed} />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ) : (
          <>
            {/* Uncategorized Templates */}
            {renderTemplateList(
              templates.filter(t => !t.folderId && !t.isArchived),
              "My Templates",
              true
            )}

            {/* Folder Sections */}
            {folders.map(folder => 
                renderTemplateList(
                    templates.filter(t => t.folderId === folder.id && !t.isArchived),
                    folder.name,
                    false,
                    folder
                )
            )}
          </>
        )}

         <View style={styles.exampleSection}>
            <ThemedText type="headline" size={20} style={{ marginBottom: 12 }}>Example Workouts</ThemedText>
            {PRESET_TEMPLATES.map(session => (
              <ExampleRow 
                key={session.id} 
                title={session.title} 
                icon={session.icon as any}
                color={session.color}
                meta={`${session.exercises.length} Exercises • ${session.timeEstimate}`} 
                onPress={() => handleTemplatePress(session)}
              />
            ))}
         </View>
      </ScrollView>

      <TemplateSummaryModal
        visible={summaryVisible}
        onClose={() => setSummaryVisible(false)}
        template={selectedTemplate}
        history={history}
        onStartWorkout={handleModalStart}
        onEditTemplate={handleModalEdit}
      />

      <FolderManagementModal
        visible={folderModalVisible}
        onClose={() => setFolderModalVisible(false)}
      />

      <TemplateActionModal 
        visible={actionModalVisible} 
        onClose={() => setActionModalVisible(false)} 
        templateId={actionTemplateId} 
      />

      <FolderActionModal
        visible={folderActionModalVisible}
        onClose={() => setFolderActionModalVisible(false)}
        folderId={actionFolderId}
      />

      <StreakDetailsModal
        visible={streakModalVisible}
        onClose={() => setStreakModalVisible(false)}
        data={streakData}
      />
    </View>
  );
}



const ExampleRow = ({ 
  title, 
  meta, 
  icon = "dumbbell", 
  color = Colors.primary, 
  onPress 
}: { 
  title: string, 
  meta: string, 
  icon?: any, 
  color?: string, 
  onPress?: () => void 
}) => (
  <TouchableOpacity style={styles.exampleRow} onPress={onPress}>
    <View style={styles.exampleLeft}>
      <View style={[styles.exampleIcon, { backgroundColor: `${color}10` }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <View>
        <ThemedText type="headline" size={16}>{title}</ThemedText>
        <ThemedText type="body" size={11} color={Colors.onSurfaceVariant} style={styles.trackingWide}>{meta.toUpperCase()}</ThemedText>
      </View>
    </View>
    <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.onSurfaceVariant} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 120 },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarBorder: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(129, 236, 255, 0.2)', overflow: 'hidden' },
  avatar: { width: '100%', height: '100%' },
  brandTitle: { fontStyle: 'italic', fontWeight: '900', letterSpacing: 1.5 },
  headerRight: { flexDirection: 'row', gap: 16 },
  headerIcon: { opacity: 0.8 },
  greetingSection: { marginBottom: 32 },
  trackingWidest: { letterSpacing: 2, textTransform: 'uppercase' },
  greetingTitle: { fontWeight: 'bold', lineHeight: 44, marginTop: 4 },
  startWorkoutBtn: {
    backgroundColor: Colors.primaryContainer,
    height: 72,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 8,
    marginBottom: 32,
  },
  streakCard: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 24,
    padding: 24,
    minHeight: 160,
    justifyContent: 'space-between',
    overflow: 'hidden',
    marginBottom: 40,
  },
  streakGlowContainer: { position: 'absolute', top: 0, right: 0, padding: 16 },
  streakMain: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4 },
  streakLabel: { fontWeight: '500', letterSpacing: 1 },
  streakFooter: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 16 },
  weekDots: { flexDirection: 'row', gap: -8 },
  dayDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotActive: { 
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowRadius: 10,
    shadowOpacity: 0.5,
  },
  dayDotInactive: { backgroundColor: Colors.surfaceVariant, borderColor: Colors.outlineVariant },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  sectionActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  addTemplateBtn: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    width: 36,
    height: 36,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(67, 71, 88, 0.2)',
  },
  templatesSection: { marginHorizontal: -24, marginBottom: 32 },
  subHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 16 },
  trackingTighter: { letterSpacing: -0.5 },
  templateList: { paddingHorizontal: 24, gap: 16 },
  templateCard: {
    width: 280,
    height: 192,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 24,
    padding: 24,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(67, 71, 88, 0.1)',
    overflow: 'hidden',
  },
  cardActionBtn: {
    padding: 8,
    marginRight: -8,
    marginTop: -8,
  },
  templateIconOverlay: { position: 'absolute', top: -16, right: -16 },
  templateTitle: { fontWeight: 'bold' },
  templateFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  templateMeta: { flexDirection: 'row', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addExerciseBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceBright, alignItems: 'center', justifyContent: 'center' },
  exampleSection: { gap: 12 },
  exampleRow: {
    backgroundColor: Colors.surfaceContainerLow,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exampleLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  exampleIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.surfaceVariant, alignItems: 'center', justifyContent: 'center' },
  trackingWide: { letterSpacing: 1 },
  homeEmptyState: {
    marginBottom: 40,
  },
  emptyHomeGradient: {
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(129, 236, 255, 0.1)',
  },
  emptyHomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  homeCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
});
