import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { formatRestTime } from '@/utils/workout';
import { styles } from './styles';

interface ActiveWorkoutHeaderProps {
  elapsedTime: string;
  isRestTimerActive: boolean;
  restTimerRemaining: number;
  restTimerTarget: number;
  onRestTimerPress: () => void;
  onFinishPress: () => void;
  onMinimizePress: () => void;
}

export const ActiveWorkoutHeader: React.FC<ActiveWorkoutHeaderProps> = ({
  elapsedTime,
  isRestTimerActive,
  restTimerRemaining,
  restTimerTarget,
  onRestTimerPress,
  onFinishPress,
  onMinimizePress,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity style={styles.minimizeBtn} onPress={onMinimizePress}>
          <MaterialCommunityIcons name="chevron-down" size={28} color={Colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.restTimer, { overflow: 'hidden' }]} 
          onPress={onRestTimerPress}
        >
          {isRestTimerActive && (
            <View 
              style={[
                styles.timerProgress, 
                { width: `${(restTimerRemaining / restTimerTarget) * 100}%` }
              ]} 
            />
          )}
          <MaterialCommunityIcons 
            name="timer-outline" 
            size={16} 
            color={isRestTimerActive ? '#005762' : Colors.primary} 
          />
          {isRestTimerActive && (
            <ThemedText type="headline" size={13} color="#005762" style={{ fontWeight: '700' }}>
              {formatRestTime(restTimerRemaining)}
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.headerCenter}>
        <ThemedText type="headline" size={24} color={Colors.primary} style={styles.timerText}>
          {elapsedTime}
        </ThemedText>
      </View>

      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.finishBtn} onPress={onFinishPress}>
          <ThemedText type="headline" size={12} color={Colors.onPrimary}>Finish</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};
