import React from 'react';
import { 
  View, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Dimensions,
  Animated,
  PanResponder
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { ThemedText } from './ThemedText';
import { BlurView } from 'expo-blur';
import { StreakData } from '../utils/streak';

const { height, width } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  data: StreakData;
}

export const StreakDetailsModal: React.FC<Props> = ({ visible, onClose, data }) => {
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [visible]);

  const days = ['S', 'S', 'M', 'T', 'W', 'T', 'F'];
  const dayNames = ['SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.dismissArea} 
          activeOpacity={1} 
          onPress={onClose} 
        />
        
        <Animated.View style={[
          styles.content,
          { 
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }] 
          }
        ]}>
          <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
          
          <View style={styles.header}>
            <View style={styles.fireIconContainer}>
               <MaterialCommunityIcons name="fire" size={64} color={Colors.primary} />
               <View style={styles.fireGlow} />
            </View>
            <ThemedText type="headline" size={48} color={Colors.primary}>{data.currentStreak}</ThemedText>
            <ThemedText type="headline" size={20} style={styles.title}>WEEKLY STREAK</ThemedText>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <ThemedText type="label" size={10} color={Colors.onSurfaceVariant}>LONGEST</ThemedText>
              <ThemedText type="headline" size={20}>{data.longestStreak}</ThemedText>
            </View>
            <View style={styles.divider} />
            <View style={styles.statBox}>
              <ThemedText type="label" size={10} color={Colors.onSurfaceVariant}>SCORE</ThemedText>
              <View style={styles.scoreRow}>
                <ThemedText type="headline" size={20}>{data.momentumScore}%</ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.calendarSection}>
             <View style={styles.weekGrid}>
                {days.map((day, i) => (
                  <View key={i} style={styles.dayColumn}>
                    <View style={[
                      styles.dayIndicator, 
                      data.weeklyActivity[i] ? styles.dayIndicatorActive : styles.dayIndicatorInactive
                    ]}>
                      {data.weeklyActivity[i] && (
                        <MaterialCommunityIcons name="fire" size={12} color={Colors.onPrimary} />
                      )}
                    </View>
                    <ThemedText type="label" size={8} color={data.weeklyActivity[i] ? Colors.primary : Colors.onSurfaceVariant}>
                        {dayNames[i]}
                    </ThemedText>
                  </View>
                ))}
             </View>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
             <ThemedText type="headline" size={16} color={Colors.onPrimary}>SWEET</ThemedText>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 32,
  },
  dismissArea: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: 'rgba(30, 34, 50, 0.85)',
    borderRadius: 32,
    padding: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  fireIconContainer: {
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    opacity: 0.2,
    zIndex: -1,
  },
  title: {
    marginTop: 8,
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  calendarSection: {
    marginBottom: 32,
    width: '100%',
  },
  weekGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
    gap: 8,
  },
  dayIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  dayIndicatorActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayIndicatorInactive: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  closeBtn: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  }
});
