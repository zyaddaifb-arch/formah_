import React, { useRef, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Platform,
  FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  interpolate, 
  Extrapolate,
  useAnimatedScrollHandler,
  SharedValue,
} from 'react-native-reanimated';

import { Colors, Typography } from '../constants/Colors';
import { ThemedText } from '../components/ThemedText';
import { useWorkoutStore } from '../store/workoutStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    id: 'track',
    title: 'TRACK YOUR\nPOWER',
    description: 'Log every set and rep with precision using our advanced template system.',
    image: require('../assets/images/onboarding_1.png'),
    color: Colors.primary,
  },
  {
    id: 'streak',
    title: 'DOMINATE\nTHE STREAK',
    description: 'Keep your weekly momentum alive and visualize your consistency.',
    image: require('../assets/images/onboarding_2.png'),
    color: Colors.secondary,
  },
  {
    id: 'unleash',
    title: 'UNLEASH\nTHE FORMAH',
    description: 'Join the elite. Your digital training partner is ready to forge greatness.',
    image: require('../assets/images/onboarding_3.png'),
    color: Colors.tertiary,
  }
];

const OnboardingSlide = ({ item, index, scrollX }: { item: any, index: number, scrollX: SharedValue<number> }) => {
  const imageStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
      [1.3, 1, 1.3],
      Extrapolate.CLAMP
    );
    const translateX = interpolate(
        scrollX.value,
        [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
        [SCREEN_WIDTH * 0.3, 0, -SCREEN_WIDTH * 0.3],
        Extrapolate.CLAMP
    );
    return {
      transform: [
        { scale },
        { translateX }
      ],
      opacity: interpolate(
        scrollX.value,
        [(index - 0.5) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 0.5) * SCREEN_WIDTH],
        [0, 1, 0],
        Extrapolate.CLAMP
      )
    };
  });

  const textStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: interpolate(
          scrollX.value,
          [(index - 0.5) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 0.5) * SCREEN_WIDTH],
          [20, 0, 20],
          Extrapolate.CLAMP
        )}
      ],
      opacity: interpolate(
        scrollX.value,
        [(index - 0.5) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 0.5) * SCREEN_WIDTH],
        [0, 1, 0],
        Extrapolate.CLAMP
      )
    };
  });

  return (
    <View style={styles.slide}>
      {/* Character as Background */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.bgImageWrapper, imageStyle]}>
        <Image 
          source={item.image} 
          style={styles.bgImage} 
          contentFit="cover"
        />
        {/* Dramatic Gradient Overlay for legibility and blending */}
        <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.5)', '#000000']}
            locations={[0, 0.4, 0.7]}
            style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      
      {/* Content Overlay */}
      <View style={styles.contentContainer}>
        <Animated.View style={[styles.textWrapper, textStyle]}>
            <ThemedText 
            type="headlineBold" 
            size={44} 
            color="#FFF" 
            style={styles.title}
            >
            {item.title}
            </ThemedText>
            <View style={[styles.divider, { backgroundColor: item.color }]} />
            <ThemedText 
            type="body" 
            size={18} 
            color="rgba(255,255,255,0.8)" 
            style={styles.description}
            >
            {item.description}
            </ThemedText>
        </Animated.View>
      </View>
    </View>
  );
};

const PaginationDot = ({ index, scrollX, color }: { index: number, scrollX: SharedValue<number>, color: string }) => {
  const dotStyle = useAnimatedStyle(() => {
    const widthSize = interpolate(
      scrollX.value,
      [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
      [8, 24, 8],
      Extrapolate.CLAMP
    );
    return {
      width: widthSize,
      opacity: interpolate(
        scrollX.value,
        [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
        [0.3, 1, 0.3],
        Extrapolate.CLAMP
      )
    };
  });
  
  return <Animated.View style={[styles.dot, dotStyle, { backgroundColor: color }]} />;
};

export default function OnboardingScreen() {
  const router = useRouter();
  const completeOnboarding = useWorkoutStore(state => state.completeOnboarding);
  const scrollX = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    }
  });

  const handleFinish = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    completeOnboarding();
    router.replace('/auth');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
      if (Platform.OS !== 'web') {
        Haptics.selectionAsync();
      }
    }
  }).current;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <Animated.FlatList
        data={ONBOARDING_DATA}
        renderItem={({ item, index }) => <OnboardingSlide item={item} index={index} scrollX={scrollX} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        keyExtractor={item => item.id}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {ONBOARDING_DATA.map((_, i) => (
            <PaginationDot key={i} index={i} scrollX={scrollX} color={ONBOARDING_DATA[i].color} />
          ))}
        </View>

        <View style={styles.buttonWrapper}>
          {activeIndex === ONBOARDING_DATA.length - 1 ? (
             <TouchableOpacity style={styles.mainButton} onPress={handleFinish} activeOpacity={0.8}>
                <LinearGradient
                    colors={[Colors.primary, Colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                />
                <View style={styles.mainButtonContent}>
                    <ThemedText type="headlineBold" size={18} color={Colors.onPrimaryFixed}>GET STARTED</ThemedText>
                    <MaterialCommunityIcons name="arrow-right" size={24} color={Colors.onPrimaryFixed} />
                </View>
             </TouchableOpacity>
          ) : (
             <TouchableOpacity style={styles.skipButton} onPress={handleFinish}>
                <ThemedText type="labelBold" size={16} color="rgba(255,255,255,0.6)">SKIP</ThemedText>
             </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000000' 
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  bgImageWrapper: {
    zIndex: -1,
  },
  bgImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 160,
  },
  textWrapper: {
    width: '100%',
    paddingHorizontal: 40,
  },
  title: {
    lineHeight: 52,
    letterSpacing: -1,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  divider: {
    width: 40,
    height: 6,
    marginVertical: 16,
    borderRadius: 3,
  },
  description: {
    lineHeight: 28,
    maxWidth: '90%',
  },
  footer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 60 : 40,
    width: '100%',
    paddingHorizontal: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  buttonWrapper: {
    minWidth: 100,
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 72,
  },
  mainButton: {
    width: SCREEN_WIDTH - 80,
    height: 72,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  mainButtonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 10,
  }
});
