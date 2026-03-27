import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { GridBackground, BlurGlow } from '@/components/VisualAccents';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);

  return (
    <View style={styles.container}>
      <GridBackground />
      <BlurGlow position="topRight" color={Colors.primary} />
      <BlurGlow position="bottomLeft" color={Colors.tertiary} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.logoSection}>
            <ThemedText type="headline" size={56} color={Colors.primary} style={styles.brandGlow}>FORMAH</ThemedText>
            <ThemedText type="headline" size={20} style={styles.subtitle}>Welcome Back</ThemedText>
            <ThemedText type="body" color={Colors.onSurfaceVariant} style={styles.description}>Log in to continue tracking your workouts and progress.</ThemedText>
          </View>

          <View style={styles.authCard}>
            <View style={styles.toggleContainer}>
              <TouchableOpacity 
                onPress={() => setIsLogin(true)}
                style={[styles.toggleBtn, isLogin && styles.toggleBtnActive]}
              >
                <ThemedText type="headline" size={12} color={isLogin ? Colors.primary : Colors.onSurfaceVariant} style={styles.trackingWidest}>LOG IN</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setIsLogin(false)}
                style={[styles.toggleBtn, !isLogin && styles.toggleBtnActive]}
              >
                <ThemedText type="headline" size={12} color={!isLogin ? Colors.primary : Colors.onSurfaceVariant} style={styles.trackingWidest}>SIGN UP</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <ThemedText type="label" size={10} color={Colors.onSurfaceVariant} style={styles.inputLabel}>EMAIL ADDRESS</ThemedText>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="email-outline" size={20} color={Colors.outline} />
                  <TextInput 
                    placeholder="john@athlete.com"
                    placeholderTextColor={Colors.outlineVariant}
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="label" size={10} color={Colors.onSurfaceVariant} style={styles.inputLabel}>SECURE PASSWORD</ThemedText>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="lock-outline" size={20} color={Colors.outline} />
                  <TextInput 
                    placeholder="••••••••••••"
                    placeholderTextColor={Colors.outlineVariant}
                    style={styles.input}
                    secureTextEntry
                  />
                  <MaterialCommunityIcons name="eye-outline" size={20} color={Colors.outline} />
                </View>
              </View>

              <TouchableOpacity style={styles.forgotPass}>
                <ThemedText type="headline" size={10} color={Colors.primary} style={[styles.trackingWidest, { opacity: 0.7 }]}>FORGOT PASSWORD?</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/home')}>
                <ThemedText type="headline" size={14} color={Colors.onPrimary} style={styles.trackingWide}>LOGIN</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.divider}>
              <View style={styles.line} />
              <ThemedText type="label" size={10} style={styles.dividerText}>OR CONTINUE WITH</ThemedText>
              <View style={styles.line} />
            </View>

            <View style={styles.socialGrid}>
              <TouchableOpacity style={styles.socialBtn}>
                <ThemedText type="headline" size={10} style={styles.socialBtnText}>GOOGLE</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <ThemedText type="headline" size={10} style={styles.socialBtnText}>APPLE</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
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
    paddingVertical: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandGlow: {
    fontStyle: 'italic',
    letterSpacing: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(129, 236, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  subtitle: {
    marginTop: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  description: {
    textAlign: 'center',
    maxWidth: 240,
    marginTop: 10,
    fontSize: 14,
  },
  authCard: {
    width: '100%',
    backgroundColor: 'rgba(24, 31, 50, 0.6)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(67, 71, 88, 0.1)',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLow,
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
    backgroundColor: Colors.surfaceContainerHigh,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  trackingWidest: {
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    marginLeft: 16,
    letterSpacing: 1.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  input: {
    flex: 1,
    color: Colors.onSurface,
    fontFamily: Typography.body,
    fontSize: 14,
    marginLeft: 12,
  },
  forgotPass: {
    alignSelf: 'flex-end',
    paddingRight: 8,
  },
  primaryBtn: {
    height: 64,
    backgroundColor: Colors.primaryContainer,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  trackingWide: {
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(67, 71, 88, 0.2)',
  },
  dividerText: {
    paddingHorizontal: 16,
    letterSpacing: 1.5,
    color: Colors.outline,
  },
  socialGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  socialBtn: {
    flex: 1,
    height: 56,
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialBtnText: {
    letterSpacing: 2,
  },
});
