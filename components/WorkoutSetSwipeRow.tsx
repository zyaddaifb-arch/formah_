import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  SharedValue,
  Extrapolate
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = -60;
const MAX_SWIPE = -80; // Reveal point for the icon
const FULL_SWIPE_THRESHOLD = -200; // Trigger for automatic deletion
const SPRING_CONFIG = { damping: 20, stiffness: 180, mass: 0.8 };

type SwipeRowProps = {
  children: React.ReactNode;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onDelete: () => void;
  rowBackgroundColor?: string;
};

// Extracted to avoid rule-of-hooks violations (hooks inside loops)
const SwipeActionIcon = ({
  icon,
  color,
  onPress,
  translateX,
  isOpen
}: {
  icon: any;
  color: string;
  onPress: () => void;
  translateX: SharedValue<number>;
  isOpen: boolean;
}) => {
  const staggeredProgress = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      staggeredProgress.value = withSpring(1, { damping: 15, stiffness: 200 });
    } else {
      staggeredProgress.value = withSpring(0, { damping: 18, stiffness: 220 });
    }
  }, [isOpen]);

  const animatedStyle = useAnimatedStyle(() => {
    // Initial entry scaling
    const scale = interpolate(staggeredProgress.value, [0, 1], [0.8, 1], 'clamp');
    const opacity = interpolate(staggeredProgress.value, [0, 1], [0, 1], 'clamp');
    
    // Scale up extra when passing the full swipe threshold
    const fullSwipeScale = interpolate(translateX.value, [MAX_SWIPE, FULL_SWIPE_THRESHOLD], [1, 1.3], 'clamp');
    
    // Icon slides in from the right when the row is swiped
    const tx = interpolate(translateX.value, [0, MAX_SWIPE], [20, -40], 'clamp');

    return {
      opacity,
      transform: [
        { translateX: tx },
        { scale: scale * fullSwipeScale }
      ],
    };
  });

  return (
    <Animated.View style={[styles.iconWrapper, animatedStyle, { zIndex: 10 }]}>
      <TouchableOpacity 
        style={styles.iconButton} 
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export const WorkoutSetSwipeRow = ({
  children,
  isOpen,
  onOpen,
  onClose,
  onDelete,
  rowBackgroundColor = '#0A1121'
}: SwipeRowProps) => {
  const translateX = useSharedValue(0);
  const hasTriggeredHaptic = useSharedValue(false);

  useEffect(() => {
    if (isOpen) {
      translateX.value = withSpring(MAX_SWIPE, SPRING_CONFIG);
    } else {
      translateX.value = withSpring(0, SPRING_CONFIG);
    }
  }, [isOpen]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15]) // Be precise
    .onUpdate((event) => {
      const newX = isOpen ? MAX_SWIPE + event.translationX : event.translationX;
      
      // Allow swiping left freely
      translateX.value = Math.min(newX, 20);

      // Trigger selection haptic once when threshold is crossed
      if (translateX.value < FULL_SWIPE_THRESHOLD && !hasTriggeredHaptic.value) {
        hasTriggeredHaptic.value = true;
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
      } else if (translateX.value > FULL_SWIPE_THRESHOLD && hasTriggeredHaptic.value) {
        hasTriggeredHaptic.value = false;
      }
    })
    .onEnd((event) => {
      if (translateX.value < FULL_SWIPE_THRESHOLD || event.velocityX < -1500) {
        // Automatically delete when swiped far enough
        runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);
        runOnJS(onDelete)();
        translateX.value = withSpring(-width, { ...SPRING_CONFIG, velocity: event.velocityX });
      } else if (!isOpen && translateX.value < SWIPE_THRESHOLD) {
        // Just revealing the button
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        runOnJS(onOpen)();
      } else if (isOpen && event.translationX > 30) {
        // Close manually
        runOnJS(onClose)();
      } else {
        // Return to relevant position
        if (isOpen) {
          translateX.value = withSpring(MAX_SWIPE, SPRING_CONFIG);
        } else {
          translateX.value = withSpring(0, SPRING_CONFIG);
        }
      }
      hasTriggeredHaptic.value = false;
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backgroundStyle = useAnimatedStyle(() => {
    // The red background remains hidden (translated fully right) until we pass MAX_SWIPE.
    // Once translateX < MAX_SWIPE, it begins to slide in from the right to fill the area.
    const tx = interpolate(
      translateX.value,
      [MAX_SWIPE, FULL_SWIPE_THRESHOLD],
      [width, 0],
      Extrapolate.CLAMP
    );

    return {
      backgroundColor: '#FF453A',
      ...StyleSheet.absoluteFillObject,
      transform: [{ translateX: tx }],
      zIndex: 0,
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: rowBackgroundColor }]}>
      <Animated.View style={backgroundStyle} />
      <View style={styles.actionsContainer}>
        <SwipeActionIcon 
          icon="trash-can-outline" 
          color="#FF453A" 
          onPress={() => { onDelete(); onClose(); }} 
          translateX={translateX} 
          isOpen={isOpen} 
        />
      </View>
      
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.frontRow, rowStyle, { backgroundColor: rowBackgroundColor }]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  frontRow: {
    zIndex: 2,
  },
  actionsContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 1,
  },
  iconWrapper: {
    position: 'absolute',
    right: 0,
    paddingRight: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0A1121', // Dark premium contrast inside the red area
    justifyContent: 'center',
    alignItems: 'center',
  }
});
