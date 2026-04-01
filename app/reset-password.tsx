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
  ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { GridBackground, BlurGlow } from '@/components/VisualAccents';
import { useRouter } from 'expo-router';
import { supabase } from '@/utils/supabase';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdatePassword = async () => {
    if (!password) {
      setError('New password is required');
      return;
    }
    if (password.length < 6) {
      setError('Must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      Alert.alert(
        'Success', 
        'Your password has been updated. You can now log in with your new password.',
        [{ text: 'OK', onPress: () => router.replace('/auth') }]
      );
    } catch (err: any) {
      Alert.alert('Update Failed', err.message);
    } finally {
      setLoading(false);
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
          <View style={styles.logoSection}>
            <View style={styles.iconCircle}>
               <MaterialCommunityIcons name="lock-reset" size={40} color={Colors.primary} />
            </View>
            <ThemedText type="headline" size={24} style={styles.title}>New Password</ThemedText>
            <ThemedText type="body" color={Colors.onSurfaceVariant} style={styles.description}>
              Please enter a new password for your account.
            </ThemedText>
          </View>

          <View style={styles.authCard}>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <View style={[styles.inputWrapper, !!error && error.includes('password') && styles.inputError]}>
                  <MaterialCommunityIcons name="lock-outline" size={20} color={error && error.includes('password') ? Colors.error : Colors.outline} />
                  <TextInput 
                    placeholder="New Password"
                    placeholderTextColor={Colors.outlineVariant}
                    style={styles.input}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(t) => { setPassword(t); setError(null); }}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <MaterialCommunityIcons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={showPassword ? Colors.primary : Colors.outline} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={[styles.inputWrapper, !!error && error.includes('match') && styles.inputError]}>
                  <MaterialCommunityIcons name="lock-check-outline" size={20} color={error && error.includes('match') ? Colors.error : Colors.outline} />
                  <TextInput 
                    placeholder="Confirm Password"
                    placeholderTextColor={Colors.outlineVariant}
                    style={styles.input}
                    secureTextEntry={!showPassword}
                    value={confirmPassword}
                    onChangeText={(t) => { setConfirmPassword(t); setError(null); }}
                  />
                </View>
                {!!error && <ThemedText type="label" size={10} color={Colors.error} style={styles.errorText}>{error}</ThemedText>}
              </View>

              <TouchableOpacity 
                style={[styles.primaryBtn, loading && { opacity: 0.7 }]} 
                onPress={handleUpdatePassword}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.onPrimary} />
                ) : (
                  <ThemedText type="headline" size={14} color={Colors.onPrimary} style={styles.trackingWide}>
                    UPDATE PASSWORD
                  </ThemedText>
                )}
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
    paddingTop: 80,
    paddingBottom: 60,
    paddingHorizontal: 24,
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
    gap: 6,
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
  inputError: {
    borderColor: Colors.error,
    backgroundColor: 'rgba(255, 82, 82, 0.05)',
  },
  input: {
    flex: 1,
    color: Colors.onSurface,
    fontFamily: Typography.body,
    fontSize: 14,
    marginLeft: 12,
  },
  errorText: {
    paddingLeft: 4,
    marginTop: 2,
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
});
