import React, { useState } from 'react';
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
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleReset = async () => {
    if (!email) {
      setError('Email is required');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (!validateEmail(email)) {
      setError('Invalid email format');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'formah://reset-password',
      });
      if (resetError) throw resetError;
      setSubmitted(true);
      setError(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      Alert.alert('Reset Error', err.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <GridBackground />
      <BlurGlow position="topRight" color={Colors.primary} blur={80} size={width * 0.7} />
      <BlurGlow position="bottomLeft" color={Colors.tertiary} blur={80} size={width * 0.7} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity 
              activeOpacity={0.7}
              style={styles.backBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.onSurface} />
            </TouchableOpacity>
          </View>

          <Animated.View entering={FadeInUp.duration(800)} style={styles.logoSection}>
            <View style={styles.iconCircle}>
               <MaterialCommunityIcons name={submitted ? "check-circle-outline" : "lock-reset"} size={40} color={Colors.primary} />
            </View>
            <ThemedText type="headline" size={26} style={styles.title}>
              {submitted ? 'Check Inbox' : 'Reset Account'}
            </ThemedText>
            <ThemedText type="body" color={Colors.onSurfaceVariant} style={styles.description}>
              {submitted 
                ? `Safety first! We have sent a recovery secure link to ${email}. Check your inbox.` 
                : 'Enter your email address and we\'ll send you a secure link to reset your password.'}
            </ThemedText>
          </Animated.View>

          {!submitted ? (
            <Animated.View layout={Layout.springify()} style={styles.authCard}>
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <View style={[styles.inputWrapper, !!error && styles.inputError]}>
                    <MaterialCommunityIcons name="email-outline" size={20} color={error ? Colors.error : Colors.outline} />
                    <TextInput 
                      placeholder="Email Address"
                      placeholderTextColor={Colors.outlineVariant}
                      style={styles.input}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={(t) => { setEmail(t); setError(null); }}
                    />
                  </View>
                  {!!error && <ThemedText type="label" size={10} color={Colors.error} style={styles.errorText}>{error}</ThemedText>}
                </View>

                <TouchableOpacity 
                  style={[styles.primaryBtn, loading && { opacity: 0.7 }]} 
                  onPress={handleReset}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={Colors.onPrimary} />
                  ) : (
                    <View style={styles.btnContent}>
                      <ThemedText type="headline" size={14} color={Colors.onPrimary} style={styles.trackingWide}>
                        SEND SECURE LINK
                      </ThemedText>
                      <MaterialCommunityIcons name="send-outline" size={18} color={Colors.onPrimary} style={{ marginLeft: 8 }} />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInDown.duration(600)} style={{ width: '100%', gap: 16 }}>
              <TouchableOpacity 
                activeOpacity={0.8}
                style={styles.primaryBtn} 
                onPress={() => router.back()}
              >
                <ThemedText type="headline" size={14} color={Colors.onPrimary} style={styles.trackingWide}>
                  BACK TO LOGIN
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => setSubmitted(false)}
                style={styles.resendBtn}
              >
                 <ThemedText type="label" color={Colors.primary} size={12}>I didn't receive an email. Try again.</ThemedText>
              </TouchableOpacity>
            </Animated.View>
          )}
          
          {!submitted && (
            <TouchableOpacity 
              activeOpacity={0.7}
              style={styles.footerLink}
              onPress={() => router.back()}
            >
              <ThemedText type="label" color={Colors.outline} size={12}>
                Back to <ThemedText type="label" color={Colors.primary} size={12}>Log In</ThemedText>
              </ThemedText>
            </TouchableOpacity>
          )}
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 20,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(129, 236, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(129, 236, 255, 0.1)',
  },
  title: {
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    maxWidth: 280,
    marginTop: 16,
    lineHeight: 22,
    fontSize: 15,
    opacity: 0.7,
  },
  authCard: {
    width: '100%',
    backgroundColor: 'rgba(24, 31, 50, 0.4)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
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
    paddingLeft: 4,
    marginTop: 2,
  },
  primaryBtn: {
    width: '100%',
    height: 64,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackingWide: {
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  footerLink: {
    marginTop: 32,
  },
  resendBtn: {
    alignItems: 'center',
    padding: 8,
  }
});
