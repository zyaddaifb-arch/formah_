import React, { useEffect, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  SafeAreaView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { GridBackground, BlurGlow } from '@/components/VisualAccents';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useWorkoutStore } from '@/store/workoutStore';
import { calculateStreakData } from '@/utils/streak';

const { width } = Dimensions.get('window');

export default function SummaryScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const history = useWorkoutStore(state => state.history);
  
  const session = useMemo(() => {
    return history.find(s => s.id === sessionId);
  }, [history, sessionId]);

  const streakData = useMemo(() => calculateStreakData(history), [history]);

  if (!session) {
    return (
      <View style={styles.container}>
        <GridBackground />
        <SafeAreaView style={styles.safeArea}>
           <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
             <ThemedText type="headline" size={20}>Session not found.</ThemedText>
             <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace('/home')}>
               <ThemedText type="headline" size={16} color={Colors.onPrimary}>Back to Home</ThemedText>
             </TouchableOpacity>
           </View>
        </SafeAreaView>
      </View>
    );
  }

  const durationMs = session.endTime - session.startTime;
  const hours = Math.floor(durationMs / 3600000);
  const minutes = Math.floor((durationMs % 3600000) / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  
  const durationStr = hours > 0 
    ? `${hours}h ${minutes}m` 
    : `${minutes}m ${seconds}s`;

  const totalSets = session.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.done).length, 0);

  return (
    <View style={styles.container}>
      <GridBackground />
      <BlurGlow position="topRight" color={Colors.primary} />
      <BlurGlow position="bottomLeft" color={Colors.tertiary} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.successHeader}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="check-decagram" size={48} color={Colors.primary} />
            </View>
            <ThemedText type="headline" size={40} style={styles.successTitle}>FINISHED!</ThemedText>
            <ThemedText type="headline" size={18} color={Colors.onSurfaceVariant} style={styles.workoutName}>
              {session.title}
            </ThemedText>
          </View>

          <View style={styles.statsGrid}>
            <StatCard 
              icon="timer-outline" 
              label="DURATION" 
              value={durationStr} 
              color={Colors.primary} 
            />
            <StatCard 
              icon="weight-lifter" 
              label="VOLUME" 
              value={`${session.totalVolume} ${useWorkoutStore.getState().user.weightUnit}`} 
              color={Colors.secondary} 
            />
            <StatCard 
              icon="format-list-bulleted" 
              label="TOTAL SETS" 
              value={totalSets.toString()} 
              color={Colors.tertiary} 
            />
            <StatCard 
              icon="arm-flex-outline" 
              label="EXERCISES" 
              value={session.exercises.length.toString()} 
              color="#FFD166" 
            />
          </View>

          <View style={styles.streakModule}>
             <View style={styles.streakInfo}>
               <ThemedText type="headline" size={24}>WEEKLY STREAK</ThemedText>
               <ThemedText type="body" size={14} color={Colors.onSurfaceVariant}>
                 {streakData.currentStreak > 1 
                   ? `You're on a ${streakData.currentStreak}-day tear! Consistency is your secret weapon.`
                   : "Great start! Keep this momentum going to build your streak."}
               </ThemedText>
             </View>
             <View style={styles.streakCount}>
                <ThemedText type="headline" size={32} color={Colors.primary}>🔥 {streakData.currentStreak}</ThemedText>
             </View>
          </View>

          <View style={styles.exercisesSection}>
             <ThemedText type="headline" size={22} style={{ marginBottom: 16 }}>Workout Details</ThemedText>
             {session.exercises.map((ex) => {
               const doneSets = ex.sets.filter(s => s.done);
               const warmUpSets = doneSets.filter(s => s.isWarmUp);
               const workingSets = doneSets.filter(s => !s.isWarmUp);

               return (
                 <View key={ex.id} style={styles.exerciseRow}>
                   <View style={styles.exHeader}>
                     <ThemedText type="headline" size={17}>{ex.name}</ThemedText>
                     <ThemedText type="headline" size={10} color={Colors.primary} style={{ letterSpacing: 1.5 }}>
                       LOG SETS: {doneSets.length}
                     </ThemedText>
                   </View>
                   <View style={styles.setsLog}>
                     {warmUpSets.length > 0 && (
                       <ThemedText type="label" size={10} color={Colors.onSurfaceVariant} style={{ marginBottom: 4, letterSpacing: 1 }}>WARM-UP</ThemedText>
                     )}
                     {warmUpSets.map((s, i) => (
                       <View key={s.id} style={styles.setLogRow}>
                         <ThemedText type="body" size={13} color={Colors.onSurfaceVariant} style={{ width: 24 }}>W{i + 1}</ThemedText>
                         <ThemedText type="headline" size={13} color={Colors.onSurfaceVariant}>
                           {s.weight > 0 ? `${s.weight} ${ex.weightUnit ?? 'kg'}` : 'BW'} × {s.reps}
                         </ThemedText>
                       </View>
                     ))}
                     {workingSets.length > 0 && warmUpSets.length > 0 && (
                       <ThemedText type="label" size={10} color={Colors.onSurfaceVariant} style={{ marginTop: 6, marginBottom: 4, letterSpacing: 1 }}>WORKING</ThemedText>
                     )}
                     {workingSets.map((s, i) => (
                       <View key={s.id} style={styles.setLogRow}>
                         <ThemedText type="body" size={13} color={Colors.onSurfaceVariant} style={{ width: 24 }}>{i + 1}</ThemedText>
                         <ThemedText type="headline" size={13} color={Colors.onSurface}>
                           {s.weight > 0 ? `${s.weight} ${ex.weightUnit ?? 'kg'}` : 'BW'} × {s.reps}
                         </ThemedText>
                       </View>
                     ))}
                     {doneSets.length === 0 && (
                       <ThemedText type="body" size={13} color={Colors.onSurfaceVariant}>No sets completed</ThemedText>
                     )}
                   </View>
                 </View>
               );
             })}
          </View>

          <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace('/home')}>
             <ThemedText type="headline" size={18} color={Colors.onPrimary}>Back to Dashboard</ThemedText>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const StatCard = ({ icon, label, value, color }: { icon: any, label: string, value: string, color: string }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
      <MaterialCommunityIcons name={icon} size={20} color={color} />
    </View>
    <ThemedText type="label" size={10} color={Colors.onSurfaceVariant} style={styles.statLabel}>{label}</ThemedText>
    <ThemedText type="headline" size={18} color={Colors.onSurface}>{value}</ThemedText>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 60 },
  successHeader: { alignItems: 'center', marginBottom: 48 },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  successTitle: {
    letterSpacing: 10,
    fontStyle: 'italic',
    textShadowColor: 'rgba(129, 236, 255, 0.4)',
    textShadowRadius: 15,
  },
  workoutName: { marginTop: 4, letterSpacing: 1 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 60) / 2,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: { letterSpacing: 1, marginBottom: 4 },
  streakModule: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30,37,58,0.6)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  streakInfo: { flex: 1, gap: 4 },
  streakCount: { marginLeft: 16 },
  exercisesSection: { marginBottom: 40 },
  exerciseRow: {
    backgroundColor: Colors.surfaceContainerLow,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
  },
  exHeader: { gap: 2 },
  setsLog: { gap: 4 },
  setLogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 2,
  },
  doneBtn: {
    height: 64,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowRadius: 15,
    shadowOpacity: 0.3,
    marginTop: 20,
  }
});
