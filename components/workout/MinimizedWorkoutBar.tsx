import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWorkoutStore } from '@/store/workoutStore';
import { useActiveTimer } from '@/hooks/workout/useActiveTimer';
import { useRestTimer } from '@/hooks/workout/useRestTimer';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { formatRestTime } from '@/utils/workout';

const { width } = Dimensions.get('window');

export function MinimizedWorkoutBar() {
  const router = useRouter();
  const segments = useSegments();
  
  const activeWorkoutId = useWorkoutStore(state => state.activeWorkout?.id);
  const activeWorkoutTitle = useWorkoutStore(state => state.activeWorkout?.workoutTitle);
  const startTime = useWorkoutStore(state => state.activeWorkout?.startTime);
  const exercisesRaw = useWorkoutStore(state => state.activeWorkout?.exercises);
  const exercises = exercisesRaw ?? [];
  
  const elapsedTime = useActiveTimer(startTime);
  const { remaining: restTimerRemaining, isActive: isRestTimerActive, target: restTimerTarget } = useRestTimer();

  // If there's no active workout, or we are currently on the 'active' screen, don't show the bar
  const isCurrentlyInActiveScreen = segments[0] === 'active';
  const isAuthScreen = ['auth', 'onboarding', 'forgot-password', 'reset-password'].includes(segments[0] as string);
  
  if (!activeWorkoutId || isCurrentlyInActiveScreen || isAuthScreen) {
    return null;
  }

  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.filter(s => !s.isWarmUp).length, 0);
  const completedSets = exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.done && !s.isWarmUp).length, 0);
  const progressPct = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.content}
        activeOpacity={0.9}
        onPress={() => router.navigate('/active')}
      >
        {/* Progress Bar Background */}
        <View style={styles.progressBackground}>
          <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
        </View>

        <View style={styles.inner}>
          {/* Left: Info */}
          <View style={styles.leftSection}>
            <ThemedText type="headline" size={14} color={Colors.onSurface} numberOfLines={1}>
              {activeWorkoutTitle || 'Active Workout'}
            </ThemedText>
            <ThemedText type="body" size={12} color="rgba(225, 228, 249, 0.6)">
              {elapsedTime}
            </ThemedText>
          </View>

          {/* Right: Rest Timer & Expand Icon */}
          <View style={styles.rightSection}>
            {isRestTimerActive && (
              <View style={styles.restTimerBadge}>
                {/* Micro progress for rest timer */}
                <View 
                  style={[
                    styles.restTimerProgress, 
                    { width: `${(restTimerRemaining / restTimerTarget) * 100}%` }
                  ]} 
                />
                <MaterialCommunityIcons name="timer-outline" size={14} color="#005762" />
                <ThemedText type="headline" size={12} color="#005762" style={{ fontWeight: '700' }}>
                  {formatRestTime(restTimerRemaining)}
                </ThemedText>
              </View>
            )}
            
            <View style={styles.expandIcon}>
              <MaterialCommunityIcons name="chevron-up" size={24} color={Colors.primary} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 140, // Move above the start + button completely
    alignSelf: 'center',
    width: width * 0.9,
    maxWidth: 340,
    zIndex: 1000,
  },
  content: {
    backgroundColor: 'rgba(24, 31, 50, 0.95)',
    borderRadius: 30, // Pill-like
    borderWidth: 1,
    borderColor: 'rgba(129, 236, 255, 0.2)',
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  progressBackground: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'transparent',
    opacity: 0.1,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  leftSection: {
    flex: 1,
    marginRight: 12,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  expandIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(129, 236, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restTimerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(129, 236, 255, 0.1)',
    overflow: 'hidden',
  },
  restTimerProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
    opacity: 0.8,
  },
});
