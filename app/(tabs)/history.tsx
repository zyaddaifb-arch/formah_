import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  LayoutAnimation
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { ThemedText } from '../../components/ThemedText';
import { GridBackground } from '../../components/VisualAccents';

const { width } = Dimensions.get('window');

import { useWorkoutStore, WorkoutSession } from '../../store/workoutStore';
import { WorkoutSessionDetailModal } from '../../components/WorkoutSessionDetailModal';

// Helper to get days in month
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
// Helper to get first day of month (0 = Sunday, 1 = Monday...)
const getFirstDayOfMonth = (year: number, month: number) => {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Adjust to Monday = 0
};

const isSameDay = (d1: Date, d2: Date) => {
  return d1.getDate() === d2.getDate() && 
         d1.getMonth() === d2.getMonth() && 
         d1.getFullYear() === d2.getFullYear();
};

export default function HistoryScreen() {
  const history = useWorkoutStore(state => state.history);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const listRef = useRef<View>(null);

  const viewYear = currentMonth.getFullYear();
  const viewMonth = currentMonth.getMonth();

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonthDays = getDaysInMonth(viewYear, viewMonth - 1);

  const changeMonth = (offset: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCurrentMonth(new Date(viewYear, viewMonth + offset, 1));
  };

  const handleDayPress = (day: number) => {
    const newDate = new Date(viewYear, viewMonth, day);
    if (selectedDate && isSameDay(selectedDate, newDate)) {
      setSelectedDate(null);
    } else {
      setSelectedDate(newDate);
      // Auto-scroll to list
      setTimeout(() => {
        listRef.current?.measureLayout(
          // @ts-ignore
          scrollViewRef.current,
          (x, y) => {
            scrollViewRef.current?.scrollTo({ y: y - 20, animated: true });
          },
          () => {}
        );
      }, 100);
    }
  };

  const isWorkoutDay = (date: Date) => {
    return history.some(session => {
       const sessionDate = new Date(session.startTime);
       return isSameDay(sessionDate, date);
    });
  };

  const filteredHistory = useMemo(() => {
    if (!selectedDate) return history;
    return history.filter(session => isSameDay(new Date(session.startTime), selectedDate));
  }, [history, selectedDate]);

  const today = new Date();

  return (
    <View style={styles.container}>
      <GridBackground />
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="headline" size={40} color={Colors.onSurface} style={styles.pageTitle}>HISTORY</ThemedText>

        <View style={styles.calendarModule}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity 
              style={styles.navBtnLarge} 
              onPress={() => changeMonth(-1)}
            >
              <MaterialCommunityIcons name="chevron-left" size={24} color={Colors.onSurface} />
            </TouchableOpacity>

            <ThemedText type="headline" size={24} style={{ flex: 1, textAlign: 'center' }}>
              {currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
            </ThemedText>

            <TouchableOpacity 
              style={styles.navBtnLarge} 
              onPress={() => changeMonth(1)}
            >
              <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.onSurface} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.calendarLegend}>
            <LegendItem color={Colors.primary} label="Workout" />
            <LegendItem color={Colors.primary + '30'} label="Today" />
          </View>

          <View style={styles.calendarGrid}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <ThemedText key={day} type="label" size={10} color={Colors.onSurfaceVariant} style={styles.dayLabel}>{day.toUpperCase()}</ThemedText>
            ))}
            
            {/* Previous Month Padding (Empty slots) */}
            {Array.from({ length: firstDay }).map((_, i) => {
              return (
                <View key={`prev-${i}`} style={styles.dayCell}>
                  {/* Empty */}
                </View>
              );
            })}

            {/* Current Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const date = new Date(viewYear, viewMonth, dayNum);
              const hasWorkout = isWorkoutDay(date);
              const isToday = isSameDay(date, today);
              const isSelected = selectedDate && isSameDay(date, selectedDate);

              return (
                <TouchableOpacity 
                  key={`curr-${dayNum}`} 
                  style={styles.dayCell}
                  onPress={() => handleDayPress(dayNum)}
                >
                  <View style={[
                    styles.dayNumber, 
                    hasWorkout && styles.workoutDay,
                    isToday && styles.todayContainer,
                    isSelected && styles.selectedContainer
                  ]}>
                    <ThemedText 
                      type="headline" 
                      size={14} 
                      color={isSelected ? Colors.onPrimary : isToday ? Colors.background : hasWorkout ? Colors.primary : Colors.onSurface}
                    >
                      {dayNum < 10 ? `0${dayNum}` : dayNum}
                    </ThemedText>
                  </View>
                  {isSelected && <View style={styles.selectionDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View ref={listRef} style={styles.activitySection}>
          <View style={styles.activityHeader}>
            <View>
                <ThemedText type="headline" size={24}>
                    {selectedDate ? `Workouts on ${selectedDate.toLocaleDateString('default', { day: 'numeric', month: 'short' })}` : 'Past Workouts'}
                </ThemedText>
                {selectedDate && (
                    <TouchableOpacity onPress={() => setSelectedDate(null)}>
                        <ThemedText type="label" size={12} color={Colors.primary}>Show all history</ThemedText>
                    </TouchableOpacity>
                )}
            </View>
            {/* EXPORT button removed as requested */}
          </View>
          
          <View style={styles.workoutList}>
            {filteredHistory.length > 0 ? (
              filteredHistory.map(item => {
                const sessionDate = new Date(item.startTime);
                const durationMs = item.endTime - item.startTime;
                const minutes = Math.floor(durationMs / 60000);
                
                return (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.workoutCard}
                    onPress={() => setSelectedSession(item)}
                  >
                    <View style={[styles.workoutIcon, { backgroundColor: Colors.primary + '10' }]}>
                      <MaterialCommunityIcons name="dumbbell" size={28} color={Colors.primary} />
                    </View>
                    <View style={styles.workoutInfo}>
                      <View style={styles.workoutInfoLeft}>
                        <ThemedText type="headline" size={18}>{item.title}</ThemedText>
                        <ThemedText type="body" size={14} color={Colors.onSurfaceVariant}>{sessionDate.toLocaleDateString()} • {minutes}mn</ThemedText>
                      </View>
                      <View style={styles.workoutMetric}>
                        <ThemedText type="headline" size={20} color={Colors.primary}>{item.totalVolume || 0}</ThemedText>
                        <ThemedText type="label" size={8} color={Colors.onSurfaceVariant} style={styles.trackingTighter}>VOLUME (KG)</ThemedText>
                      </View>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.onSurfaceVariant} />
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 40, backgroundColor: Colors.surfaceContainerHigh, borderRadius: 24, padding: 24 }}>
                <MaterialCommunityIcons name="calendar-blank-outline" size={48} color={Colors.surfaceVariant} style={{ marginBottom: 16 }} />
                <ThemedText type="headline" size={18} color={Colors.onSurface}>
                    {selectedDate ? 'No workouts this day' : 'No workouts yet'}
                </ThemedText>
                <ThemedText type="body" size={14} color={Colors.onSurfaceVariant} style={{ textAlign: 'center', marginTop: 8 }}>
                  {selectedDate 
                    ? `You didn't log any sessions on ${selectedDate.toLocaleDateString('default', { month: 'long', day: 'numeric' })}.`
                    : 'Your complete workout history will appear here once you finish a session.'}
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <WorkoutSessionDetailModal 
        visible={selectedSession !== null}
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
      />
    </View>
  );
}

const LegendItem = ({ color, label }: { color: string, label: string }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendDot, { backgroundColor: color }]} />
    <ThemedText type="label" size={10} color={Colors.onSurfaceVariant}>{label.toUpperCase()}</ThemedText>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 24, paddingVertical: 40, paddingBottom: 120 },
  pageTitle: { fontWeight: '900', letterSpacing: -1, marginBottom: 24, marginTop: 24 },
  calendarModule: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 24,
    padding: 24,
    marginBottom: 40,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  navBtnLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarLegend: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayLabel: {
    width: (width - 96) / 7,
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 1.5,
    fontWeight: 'bold',
  },
  dayCell: {
    width: (width - 48 - 48) / 7, // Tighter spacing
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  dayNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutDay: {
    borderWidth: 1,
    borderColor: 'rgba(129, 236, 255, 0.4)',
    backgroundColor: 'rgba(129, 236, 255, 0.1)',
  },
  todayCell: {
    // backgroundColor: 'rgba(30, 37, 58, 0.3)',
    // borderRadius: 18,
  },
  todayContainer: {
    backgroundColor: Colors.primary + '30', // Semi-transparent primary
  },
  selectedContainer: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  selectionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    position: 'absolute',
    bottom: -4,
  },
  activitySection: { gap: 24 },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  trackingWidest: { letterSpacing: 2, textTransform: 'uppercase' },
  workoutList: { gap: 16 },
  workoutCard: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  workoutIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutInfo: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  workoutInfoLeft: { gap: 2 },
  workoutMetric: { alignItems: 'flex-end', gap: 2 },
  trackingTighter: { letterSpacing: -0.5 },
});
