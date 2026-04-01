import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Reanimated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing 
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';

interface StreakGlowProps {
  active: boolean;
  color?: string;
}

export const StreakGlow: React.FC<StreakGlowProps> = ({ active, color = Colors.primary }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    if (active) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.2, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.9, { duration: 2000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    } else {
      opacity.value = withTiming(0);
      scale.value = withTiming(0.8);
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <Reanimated.View style={[
        styles.glow, 
        { backgroundColor: color },
        animatedStyle
      ]} />
      {active && (
         <Reanimated.View style={[
            styles.glowOuter, 
            { backgroundColor: color },
            { opacity: 0.1, transform: [{ scale: 1.5 }] }
         ]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
  },
  glow: {
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  glowOuter: {
     position: 'absolute',
     width: 100,
     height: 100,
     borderRadius: 50,
  }
});
