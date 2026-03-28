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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleReset = () => {
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <View style={styles.container}>
      <GridBackground />
      <BlurGlow position="topRight" color={Colors.primary} />
      <BlurGlow position="bottomLeft" color={Colors.tertiary} />

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
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.onSurface} />
            </TouchableOpacity>
          </View>

          <View style={styles.logoSection}>
            <View style={styles.iconCircle}>
               <MaterialCommunityIcons name="lock-reset" size={40} color={Colors.primary} />
            </View>
            <ThemedText type="headline" size={24} style={styles.title}>
              {submitted ? 'Email Sent' : 'Reset Password'}
            </ThemedText>
            <ThemedText type="body" color={Colors.onSurfaceVariant} style={styles.description}>
              {submitted 
                ? `We have sent a password reset link to ${email}. Please check your inbox.` 
                : 'Enter your email address and we\'ll send you instructions to reset your password.'}
            </ThemedText>
          </View>

          {!submitted ? (
            <View style={styles.authCard}>
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons name="email-outline" size={20} color={Colors.outline} />
                    <TextInput 
                      placeholder="Email Address"
                      placeholderTextColor={Colors.outlineVariant}
                      style={styles.input}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.primaryBtn} 
                  onPress={handleReset}
                  activeOpacity={0.8}
                >
                  <ThemedText type="headline" size={14} color={Colors.onPrimary} style={styles.trackingWide}>
                    SEND INSTRUCTIONS
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.primaryBtn} 
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <ThemedText type="headline" size={14} color={Colors.onPrimary} style={styles.trackingWide}>
                BACK TO LOGIN
              </ThemedText>
            </TouchableOpacity>
          )}
          
          {!submitted && (
            <TouchableOpacity 
              style={styles.footerLink}
              onPress={() => router.back()}
            >
              <ThemedText type="label" color={Colors.outline} size={12}>
                Remembered your password? <ThemedText type="label" color={Colors.primary} size={12}>Log In</ThemedText>
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
    marginBottom: 40,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(129, 236, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(129, 236, 255, 0.2)',
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
  },
  authCard: {
    width: '100%',
    backgroundColor: 'rgba(24, 31, 50, 0.6)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(67, 71, 88, 0.1)',
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
  primaryBtn: {
    width: '100%',
    height: 64,
    backgroundColor: Colors.primaryContainer,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  trackingWide: {
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  footerLink: {
    marginTop: 32,
  },
});
