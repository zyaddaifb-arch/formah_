import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

export const GridBackground = () => (
  <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
    <View style={styles.gridContainer}>
      {Array.from({ length: 20 }).map((_, i) => (
        <View key={`v-${i}`} style={[styles.verticalLine, { left: i * 40 }]} />
      ))}
      {Array.from({ length: 40 }).map((_, i) => (
        <View key={`h-${i}`} style={[styles.horizontalLine, { top: i * 40 }]} />
      ))}
    </View>
    <LinearGradient
      colors={['transparent', Colors.background]}
      style={StyleSheet.absoluteFillObject}
    />
  </View>
);

export const BlurGlow = ({ 
  position = 'topRight', 
  color = Colors.primary,
  size = 400,
  blur = 0 // Keeping it optional for now
}: { 
  position?: 'topRight' | 'bottomLeft' | 'center', 
  color?: string,
  size?: number,
  blur?: number
}) => {
  const positioning = position === 'topRight' 
    ? { top: -size/4, right: -size/4 } 
    : position === 'bottomLeft' 
    ? { bottom: -size/4, left: -size/4 }
    : { top: height / 2 - size / 2, left: width / 2 - size / 2 };

  return (
    <View 
      style={[
        styles.glow, 
        positioning, 
        { 
          backgroundColor: color, 
          opacity: 0.15,
          width: size,
          height: size,
          borderRadius: size / 2
        }
      ]} 
      pointerEvents="none"
    />
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.05,
  },
  verticalLine: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: Colors.primary,
  },
  horizontalLine: {
    position: 'absolute',
    height: 1,
    width: '100%',
    backgroundColor: Colors.primary,
  },
  glow: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    transform: [{ scale: 1.5 }],
  },
});
