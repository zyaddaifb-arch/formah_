import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { formatRestTime } from '@/utils/workout';
import { styles } from './styles';

interface LineTimerIndicatorProps {
  remaining: number;
  target: number;
  isDone: boolean;
  onPress: () => void;
}

export const LineTimerIndicator: React.FC<LineTimerIndicatorProps> = ({
  remaining,
  target,
  isDone,
  onPress,
}) => {
  const pct = (remaining / target) * 100;
  const isActive = remaining > 0 && !isDone;

  return (
    <TouchableOpacity 
      activeOpacity={0.85}
      style={[
        styles.lineTimerContainer,
        isDone && styles.lineTimerDone,
      ]}
      onPress={onPress}
      disabled={!isActive}
    >
      <View style={[styles.lineTimerBar, { width: `${pct}%` }]} />
      <ThemedText 
        type="headline" 
        size={11} 
        color={isDone ? Colors.primary : '#FFFFFF'} 
        style={styles.lineTimerText}
      >
        {isDone ? `✓  ${formatRestTime(target)}` : formatRestTime(remaining)}
      </ThemedText>
    </TouchableOpacity>
  );
};
