import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { styles } from './styles';

interface WorkoutProgressProps {
  progressPct: number;
}

export const WorkoutProgress: React.FC<WorkoutProgressProps> = ({ progressPct }) => {
  return (
    <View style={styles.progressModule}>
      <View style={styles.progressHeader}>
        <ThemedText type="headline" size={18}>Progress</ThemedText>
        <ThemedText type="label" color={Colors.primary}>
          {Math.round(progressPct)}% Complete
        </ThemedText>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
      </View>
    </View>
  );
};
