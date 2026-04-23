import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography } from '../../constants/Colors';
import { ThemedText } from '../../components/ThemedText';

const { width } = Dimensions.get('window');

function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.tabBarContainer}>
      {/* Background Layer */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['rgba(9, 14, 28, 0.95)', 'rgba(36, 43, 66, 0.98)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      </View>

      {/* Interactive Layer */}
      <View style={styles.tabBarMain}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Custom center button for "START"
          if (route.name === 'home') {
            return (
              <View key={route.key} style={styles.startBtnWrapper}>
                <TouchableOpacity onPress={onPress} style={styles.startBtn}>
                  <MaterialCommunityIcons name="plus" size={32} color={Colors.surface} />
                </TouchableOpacity>
                <ThemedText type="headline" size={10} color={Colors.primary} style={styles.startText}>START</ThemedText>
              </View>
            );
          }

          const iconName = route.name === 'history' ? 'history' : 'format-list-bulleted-type';
          const label = route.name === 'history' ? 'HISTORY' : 'EXERCISES';

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
            >
              <MaterialCommunityIcons 
                name={iconName as any} 
                size={24} 
                color={isFocused ? Colors.primary : 'rgba(225, 228, 249, 0.4)'} 
              />
              <ThemedText 
                type="headline" 
                size={10} 
                color={isFocused ? Colors.primary : 'rgba(225, 228, 249, 0.4)'}
                style={styles.tabLabel}
              >
                {label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="history" />
      <Tabs.Screen name="home" />
      <Tabs.Screen name="exercises" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 90,
    backgroundColor: 'transparent',
  },
  tabBarMain: {
    flexDirection: 'row',
    height: 90,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    paddingHorizontal: 32,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  tabItem: {
    alignItems: 'center',
    gap: 4,
    minWidth: 64,
  },
  tabLabel: {
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  startBtnWrapper: {
    alignItems: 'center',
    marginBottom: 4,
    // Move the entire wrapper up so it sits "on top" of the bar
    transform: [{ translateY: -8 }],
    zIndex: 10,
  },
  startBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  startText: {
    marginTop: 8,
    letterSpacing: 3,
    fontWeight: '900',
  },
});
