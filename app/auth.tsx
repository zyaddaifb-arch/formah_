import React, { useState, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { GridBackground, BlurGlow } from '@/components/VisualAccents';
import { useRouter } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { useWorkoutStore } from '@/store/workoutStore';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  Layout, 
  useAnimatedStyle, 
  withSpring,
  interpolateColor,
  useDerivedValue,
  withTiming
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  // Animation values
  const transition = useDerivedValue(() => {
    return withSpring(isLogin ? 1 : 0, { damping: 15 });
  });

  const animatedToggleStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        transition.value,
        [0, 1],
        ['rgba(24, 31, 50, 0.4)', 'rgba(46, 52, 71, 0.6)']
      )
    };
  });

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const validate = () => {
    const newErrors: { name?: string; email?: string; password?: string } = {};
    
    if (!isLogin && !name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Must be at least 6 characters';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async () => {
    if (!validate()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      if (isLogin) {
        useWorkoutStore.getState().reset();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        useWorkoutStore.getState().reset();
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } }
        });

        if (signUpError) throw signUpError;
        if (user) {
          const { error: profileError } = await supabase.from('profiles').insert([{ id: user.id, full_name: name }]);
          if (profileError) console.error('Error creating profile:', profileError);
          
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert('Success!', 'Please verify your email to log in.', [{ 
            text: 'OK', 
            onPress: () => {
              setIsLogin(true);
              setErrors({});
            } 
          }]);
        }
      }
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Authentication Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = (login: boolean) => {
    if (login !== isLogin) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsLogin(login);
      setErrors({});
    }
  };

  return (
    <View style={styles.container}>
      <GridBackground />
      <BlurGlow position="topRight" color={Colors.primary} blur={100} size={width * 0.8} />
      <BlurGlow position="bottomLeft" color={Colors.tertiary} blur={100} size={width * 0.8} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.flex}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false} 
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View 
            entering={FadeInUp.duration(1000).springify()} 
            style={styles.logoSection}
          >
            <ThemedText type="headline" size={28} style={styles.subtitle}>
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </ThemedText>
            <ThemedText type="body" color={Colors.onSurfaceVariant} style={styles.description}>
              {isLogin 
                ? 'Sign in to sync your progress across all devices.' 
                : 'Join Formah today and start tracking your gains.'}
            </ThemedText>
          </Animated.View>

          <Animated.View 
            layout={Layout.springify()} 
            style={styles.authCard}
          >
            <View style={styles.toggleContainer}>
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => toggleAuthMode(false)} 
                style={[styles.toggleBtn, !isLogin && styles.toggleBtnActive]}
              >
                <ThemedText 
                  type="headline" 
                  size={12} 
                  color={!isLogin ? Colors.primary : Colors.onSurfaceVariant} 
                  style={styles.trackingWidest}
                >SIGN UP</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => toggleAuthMode(true)} 
                style={[styles.toggleBtn, isLogin && styles.toggleBtnActive]}
              >
                <ThemedText 
                  type="headline" 
                  size={12} 
                  color={isLogin ? Colors.primary : Colors.onSurfaceVariant} 
                  style={styles.trackingWidest}
                >LOG IN</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              {!isLogin && (
                <Animated.View 
                  entering={FadeInDown.duration(400)}
                  exiting={withTiming({ opacity: 0 })}
                  style={styles.inputGroup}
                >
                  <View style={[styles.inputWrapper, !!errors.name && styles.inputError]}>
                    <MaterialCommunityIcons name="account-outline" size={20} color={errors.name ? Colors.error : Colors.outline} />
                    <TextInput 
                      placeholder="Full Name" 
                      placeholderTextColor={Colors.outlineVariant} 
                      style={styles.input} 
                      value={name} 
                      onChangeText={(t) => { setName(t); if (errors.name) setErrors({ ...errors, name: undefined }); }} 
                    />
                  </View>
                  {!!errors.name && <ThemedText type="label" size={10} color={Colors.error} style={styles.errorText}>{errors.name}</ThemedText>}
                </Animated.View>
              )}

              <View style={styles.inputGroup}>
                <View style={[styles.inputWrapper, !!errors.email && styles.inputError]}>
                  <MaterialCommunityIcons name="email-outline" size={20} color={errors.email ? Colors.error : Colors.outline} />
                  <TextInput 
                    placeholder="Email Address" 
                    placeholderTextColor={Colors.outlineVariant} 
                    style={styles.input} 
                    keyboardType="email-address" 
                    autoCapitalize="none" 
                    value={email} 
                    onChangeText={(t) => { setEmail(t); if (errors.email) setErrors({ ...errors, email: undefined }); }} 
                  />
                </View>
                {!!errors.email && <ThemedText type="label" size={10} color={Colors.error} style={styles.errorText}>{errors.email}</ThemedText>}
              </View>

              <View style={styles.inputGroup}>
                <View style={[styles.inputWrapper, !!errors.password && styles.inputError]}>
                  <MaterialCommunityIcons name="lock-outline" size={20} color={errors.password ? Colors.error : Colors.outline} />
                  <TextInput 
                    placeholder="Password" 
                    placeholderTextColor={Colors.outlineVariant} 
                    style={styles.input} 
                    secureTextEntry={!showPassword} 
                    value={password} 
                    onChangeText={(t) => { setPassword(t); if (errors.password) setErrors({ ...errors, password: undefined }); }} 
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <MaterialCommunityIcons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={showPassword ? Colors.primary : Colors.outline} />
                  </TouchableOpacity>
                </View>
                {!!errors.password && <ThemedText type="label" size={10} color={Colors.error} style={styles.errorText}>{errors.password}</ThemedText>}
              </View>

              {isLogin && (
                <TouchableOpacity style={styles.forgotPass} onPress={() => router.push('/forgot-password')}>
                  <ThemedText type="headline" size={10} color={Colors.primary} style={[styles.trackingWidest, { opacity: 0.7 }]}>FORGOT PASSWORD?</ThemedText>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                activeOpacity={0.8}
                style={[styles.primaryBtn, loading && { opacity: 0.7 }]} 
                onPress={handleAuth} 
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.onPrimary} />
                ) : (
                  <View style={styles.btnContent}>
                    <ThemedText type="headline" size={14} color={Colors.onPrimary} style={styles.trackingWide}>
                      {isLogin ? 'LOG IN' : 'JOIN NOW'}
                    </ThemedText>
                    <MaterialCommunityIcons name="arrow-right" size={20} color={Colors.onPrimary} style={{ marginLeft: 8 }} />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.divider}>
              <View style={styles.line} />
              <ThemedText type="label" size={10} style={styles.dividerText}>OR SECURE LOG IN WITH</ThemedText>
              <View style={styles.line} />
            </View>

            <View style={styles.socialGrid}>
              <TouchableOpacity activeOpacity={0.7} style={styles.socialBtn}>
                <MaterialCommunityIcons name="google" size={18} color={Colors.onSurface} style={{ marginRight: 10 }} />
                <ThemedText type="headline" size={11} style={styles.socialBtnText}>GOOGLE</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7} style={styles.socialBtn}>
                <MaterialCommunityIcons name="apple" size={18} color={Colors.onSurface} style={{ marginRight: 10 }} />
                <ThemedText type="headline" size={11} style={styles.socialBtnText}>APPLE</ThemedText>
              </TouchableOpacity>
            </View>
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(600).duration(800)} style={styles.footer}>
             <ThemedText type="body" size={12} color={Colors.onSurfaceVariant} style={styles.footerText}>
               By continuing, you agree to our Terms of Service.
             </ThemedText>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: { flex: 1 },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  subtitle: {
    marginTop: 10,
    letterSpacing: 1,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    maxWidth: 280,
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
  },
  authCard: {
    width: '100%',
    backgroundColor: 'rgba(24, 31, 50, 0.4)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(10, 15, 30, 0.5)',
    borderRadius: 30,
    padding: 4,
    marginBottom: 32,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 26,
  },
  toggleBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  trackingWidest: {
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 15, 30, 0.3)',
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 60,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: 'rgba(255, 82, 82, 0.05)',
  },
  input: {
    flex: 1,
    color: Colors.onSurface,
    fontFamily: Typography.body,
    fontSize: 15,
    marginLeft: 12,
  },
  errorText: {
    paddingLeft: 8,
    marginTop: 2,
    fontFamily: Typography.body,
  },
  forgotPass: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingRight: 8,
  },
  primaryBtn: {
    height: 64,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackingWide: {
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  dividerText: {
    paddingHorizontal: 16,
    letterSpacing: 1,
    color: 'rgba(166, 170, 190, 0.4)',
  },
  socialGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  socialBtnText: {
    letterSpacing: 1,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    opacity: 0.4,
    textAlign: 'center',
  }
});
