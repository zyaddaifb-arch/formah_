import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Keyboard, Platform, Animated, KeyboardEvent } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';

export function KeyboardToolbar() {
  const [visible, setVisible] = useState(false);
  const [keyboardHeight] = useState(new Animated.Value(0));

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e: KeyboardEvent) => {
      setVisible(true);
      Animated.timing(keyboardHeight, {
        toValue: e.endCoordinates.height,
        duration: e.duration || 250,
        useNativeDriver: false,
      }).start();
    });
    
    const hideSub = Keyboard.addListener(hideEvent, () => {
      // Hide instantly instead of animating down
      setVisible(false);
      keyboardHeight.setValue(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toolbar, { bottom: keyboardHeight }]} pointerEvents="box-none">
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => {
          setVisible(false);
          Keyboard.dismiss();
        }}
      >
        <MaterialCommunityIcons name="keyboard-close" size={26} color="#000000" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 48,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 8,
    zIndex: 9999,
  },
  button: {
    width: 44,
    height: 40,
    backgroundColor: '#D1D5DB', // iOS classic key gray
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 2,
  }
});
