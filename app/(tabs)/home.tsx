import React from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  FlatList,
  Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { ThemedText } from '../../components/ThemedText';
import { GridBackground, BlurGlow } from '../../components/VisualAccents';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

import { useWorkoutStore } from '../../store/workoutStore';

export default function HomeScreen() {
  const router = useRouter();
  const templates = useWorkoutStore(state => state.templates);
  const startWorkout = useWorkoutStore(state => state.startWorkout);
  const history = useWorkoutStore(state => state.history);

  const calculateStreak = () => {
    // Basic streak calculation, assuming sorted by start Time descending
    if (history.length === 0) return 0;
    return history.length; // Placeholder for real streak logic later
  };

  const streakDays = calculateStreak();

  const handleStartWorkout = () => {
    startWorkout();
    router.push('/active');
  };

  const renderTemplate = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.templateCard} onPress={() => { startWorkout(item.id); router.push('/active'); }}>
      <View style={[styles.templateIconOverlay, { opacity: 0.05 }]}>
        <MaterialCommunityIcons name={item.icon as any} size={120} color={item.color} />
      </View>
      <View>
        <ThemedText type="headline" size={10} color={item.color} style={[styles.trackingWidest, { opacity: 0.6 }]}>{item.type.toUpperCase()}</ThemedText>
        <ThemedText type="headline" size={24} style={styles.templateTitle}>{item.title}</ThemedText>
      </View>
      <View style={styles.templateFooter}>
        <View style={styles.templateMeta}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="clock-outline" size={12} color={Colors.onSurfaceVariant} />
            <ThemedText type="body" size={12} color={Colors.onSurfaceVariant}>{item.timeEstimate || '45m'}</ThemedText>
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

  return (
    <View style={styles.container}>
      <GridBackground />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.greetingSection}>
          <ThemedText type="label" size={12} color={Colors.primary} style={styles.trackingWidest}>WELCOME BACK</ThemedText>
          <ThemedText type="headline" size={36} color={Colors.onSurface} style={styles.greetingTitle}>Alex Protocol</ThemedText>
        </View>

        <TouchableOpacity 
          style={styles.startWorkoutBtn} 
          onPress={handleStartWorkout}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="play" size={24} color={Colors.onPrimaryFixed} />
          <ThemedText type="headline" size={20} color={Colors.onPrimaryFixed}>Start Workout</ThemedText>
        </TouchableOpacity>

        <View style={styles.streakCard}>
          <View style={styles.streakGlowContainer}>
            <MaterialCommunityIcons name="fire" size={96} color={Colors.primary} style={{ opacity: 0.1 }} />
          </View>
          <View>
            <ThemedText type="label" size={10} color={Colors.onSurfaceVariant} style={styles.trackingWidest}>CURRENT MOMENTUM</ThemedText>
            <View style={styles.streakMain}>
              <ThemedText type="headline" size={60} color={streakDays > 0 ? Colors.primary : Colors.onSurfaceVariant}>{streakDays}</ThemedText>
              <ThemedText type="headline" size={20} style={styles.streakLabel}>DAY STREAK</ThemedText>
            </View>
          </View>
          <View style={styles.streakFooter}>
            <View style={styles.weekDots}>
              {['M', 'T', 'W', 'T', 'F'].map((day, i) => (
                <View key={i} style={[styles.dayDot, i < 3 ? styles.dayDotActive : styles.dayDotInactive]}>
                  <ThemedText type="headline" size={10} color={i < 3 ? Colors.onPrimary : Colors.onSurfaceVariant}>{day}</ThemedText>
                </View>
              ))}
            </View>
            <ThemedText type="body" size={11} color={Colors.onSurfaceVariant}>Keep it up, Alex.</ThemedText>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="headline" size={24} color={Colors.primary}>Templates</ThemedText>
          <View style={styles.sectionActions}>
            <TouchableOpacity style={styles.addTemplateBtn}>
              <MaterialCommunityIcons name="plus" size={14} color={Colors.onPrimaryFixed} />
              <ThemedText type="headline" size={10} color={Colors.onPrimaryFixed}>TEMPLATE</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <MaterialCommunityIcons name="folder-outline" size={20} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.templatesSection}>
          <View style={styles.subHeader}>
            <ThemedText type="headline" size={20}>My Templates ({templates.length})</ThemedText>
            {templates.length > 0 && (
              <TouchableOpacity><ThemedText type="label" size={10} color={Colors.primary} style={styles.trackingTighter}>VIEW ALL</ThemedText></TouchableOpacity>
            )}
          </View>
          
          {templates.length > 0 ? (
            <FlatList
              data={templates}
              renderItem={renderTemplate}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.templateList}
              keyExtractor={item => item.id}
            />
          ) : (
            <View style={{ paddingHorizontal: 24, paddingVertical: 16, alignItems: 'center' }}>
              <ThemedText type="body" size={14} color={Colors.onSurfaceVariant} style={{ textAlign: 'center' }}>
                No templates yet.{"\n"}Start an empty workout to build one!
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.exampleSection}>
           <ThemedText type="headline" size={20} style={{ marginBottom: 12 }}>Example Workouts</ThemedText>
           {templates.filter(t => t.id.startsWith('template_')).map(session => (
             <ExampleRow 
               key={session.id} 
               title={session.title} 
               meta={`${session.exercises.length} Exercises • ${session.timeEstimate}`} 
               onPress={() => {
                 startWorkout(session.id);
                 router.push('/active');
               }}
             />
           ))}
        </View>
      </ScrollView>
    </View>
  );
}



const ExampleRow = ({ title, meta, onPress }: { title: string, meta: string, onPress?: () => void }) => (
  <TouchableOpacity style={styles.exampleRow} onPress={onPress}>
    <View style={styles.exampleLeft}>
      <View style={styles.exampleIcon}>
        <MaterialCommunityIcons name="dumbbell" size={24} color={Colors.primary} />
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
  scrollContent: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 120 },
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
  dayDotActive: { backgroundColor: Colors.primary },
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
});
