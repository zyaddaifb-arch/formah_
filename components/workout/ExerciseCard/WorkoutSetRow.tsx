import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { styles } from './styles';

interface WorkoutSetRowProps {
  index: number;
  totalSets: number;
  set: {
    id: string;
    weight: number;
    reps: number;
    done: boolean;
    isWarmUp?: boolean;
  };
  previousText: string;
  previousWeight: number;
  previousReps: number;
  isInvalid: { weight?: boolean; reps?: boolean };
  showLineTimer: boolean;
  onUpdateSet: (data: { weight?: number; reps?: number }) => void;
  onToggleDone: () => void;
  onPreviousPress: () => void;
}

export const WorkoutSetRow: React.FC<WorkoutSetRowProps> = ({
  index,
  totalSets,
  set,
  previousText = '—',
  previousWeight = 0,
  previousReps = 0,
  isInvalid = {},
  showLineTimer,
  onUpdateSet,
  onToggleDone,
  onPreviousPress,
}) => {
  const isWarmUp = set.isWarmUp;
  const isFirst = index === 0;
  const isLast = index === totalSets - 1;

  return (
    <View style={[
      styles.setRow, 
      set.done && styles.setRowDone, 
      isWarmUp && styles.setRowWarmUp,
      showLineTimer && styles.setRowWithTimer,
      isFirst && { borderTopLeftRadius: 16, borderTopRightRadius: 16 },
      isLast && !showLineTimer && { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }
    ]}>
      <View style={{ flex: 1 }}>
        <ThemedText 
          type="headline" 
          size={16} 
          color={set.done ? (isWarmUp ? '#FFD166' : Colors.primary) : 'rgba(225,228,249,0.4)'}
        >
          {isWarmUp ? 'W' : (index + 1)}
        </ThemedText>
      </View>

      <View style={{ flex: 2, alignItems: 'center' }}>
        <TouchableOpacity 
          onPress={onPreviousPress}
          disabled={set.done || previousWeight === 0}
        >
          <ThemedText 
            type="body" 
            size={12} 
            color={set.done ? Colors.onSurface : (previousWeight > 0 ? Colors.primary : 'rgba(225,228,249,0.4)')} 
            style={{ fontStyle: 'italic' }}
          >
            {previousText}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.inputCell}>
        <TextInput 
          style={[
            styles.miniInput, 
            set.done && { color: Colors.primary },
            isInvalid.weight && styles.inputInvalid
          ]} 
          keyboardType="numeric"
          defaultValue={set.weight ? set.weight.toString() : ''}
          placeholder={previousWeight > 0 ? previousWeight.toString() : "0"}
          placeholderTextColor={Colors.outlineVariant}
          onChangeText={(val) => onUpdateSet({ weight: Number(val) || 0 })}
          editable={!set.done}
        />
      </View>

      <View style={styles.inputCell}>
        <TextInput 
          style={[
            styles.miniInput, 
            set.done && { color: Colors.primary },
            isInvalid.reps && styles.inputInvalid
          ]} 
          keyboardType="numeric"
          defaultValue={set.reps ? set.reps.toString() : ''}
          placeholder={previousReps > 0 ? previousReps.toString() : "0"}
          placeholderTextColor={Colors.outlineVariant}
          onChangeText={(val) => onUpdateSet({ reps: Number(val) || 0 })}
          editable={!set.done}
        />
      </View>

      <View style={{ flex: 1, alignItems: 'flex-end' }}>
        <TouchableOpacity 
          style={[
            styles.checkBtn, 
            set.done && (isWarmUp ? styles.checkBtnWarmUpActive : styles.checkBtnActive)
          ]}
          onPress={onToggleDone}
        >
          <MaterialCommunityIcons 
            name="check" 
            size={18} 
            color={set.done ? (isWarmUp ? '#4A3400' : Colors.onPrimary) : Colors.outlineVariant} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
