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
             {session.exercises.map((ex, idx) => {
               const bestSet = ex.sets
                 .filter(s => s.done)
                 .reduce((best, curr) => (curr.weight > (best?.weight || 0) ? curr : best), ex.sets[0]);
               
               return (
                 <View key={ex.id} style={styles.exerciseRow}>
                   <View style={styles.exInfo}>
                     <ThemedText type="headline" size={18}>{ex.name}</ThemedText>
                     <ThemedText type="body" size={14} color={Colors.onSurfaceVariant}>
                        {ex.sets.filter(s => s.done).length} sets completed
                     </ThemedText>
                   </View>
                   <View style={styles.exBest}>
                     {bestSet && (
                        <>
                          <ThemedText type="headline" size={16} color={Colors.primary}>
                            {bestSet.weight} x {bestSet.reps}
                          </ThemedText>
                          <ThemedText type="label" size={8} color={Colors.onSurfaceVariant}>BEST SET</ThemedText>
                        </>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  exInfo: { gap: 2 },
  exBest: { alignItems: 'flex-end' },
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
