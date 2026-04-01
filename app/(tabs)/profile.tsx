import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Dimensions,
  TextInput,
  Alert,
  Platform,
  Linking
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as WebBrowser from 'expo-web-browser';
import { Colors } from '../../constants/Colors';
import { ThemedText } from '../../components/ThemedText';
import { GridBackground } from '../../components/VisualAccents';
import { LinearGradient } from 'expo-linear-gradient';
import { useWorkoutStore } from '../../store/workoutStore';
import { calculateStreakData } from '../../utils/streak';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/utils/supabase';


const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, history, updateUser, setWeightUnit } = useWorkoutStore();
  const { signOut } = useAuthStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user.name);

  const streakData = React.useMemo(() => calculateStreakData(history), [history]);
  const totalWorkouts = history.length;
  const streakDays = streakData.currentStreak;

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need access to your photos to change your profile picture.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Platform.OS === 'ios' ? Linking.openURL('app-settings:') : Linking.openSettings() }
          ]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        updateUser({ avatarUri: result.assets[0].uri });
      }
    } catch (e) {
      console.error('Photo Picker Error:', e);
      Alert.alert('Error', 'An unexpected error occurred while opening the photo library.');
    }
  };

  const handleSaveName = async () => {
    if (nameInput.trim()) {
      const newName = nameInput.trim();
      updateUser({ name: newName });
      
      // Sync to Supabase if logged in
      const { user } = useAuthStore.getState();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ full_name: newName })
          .eq('id', user.id);
        
        if (error) console.error('Error syncing name to Supabase:', error);
      }
    } else {
      setNameInput(user.name);
    }
    setIsEditingName(false);
  };


  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: () => signOut() }
      ]
    );
  };

  const handeOpenURL = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      Alert.alert("Error", "Could not open the link.");
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure? This will permanently delete all your workout history and profile data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete Permanently", 
          style: "destructive", 
          onPress: async () => {
             const { user } = useAuthStore.getState();
             if (user) {
                // Delete data from profiles table
                const { error } = await supabase.from('profiles').delete().eq('id', user.id);
                if (error) {
                  Alert.alert("Error", "Could not delete data. Please try again later.");
                  return;
                }
                // Sign out and clear local storage
                await signOut();
                Alert.alert("Account Deleted", "Your data has been scheduled for deletion.");
             }
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <GridBackground />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileSection, { marginTop: 40 }]}>
          <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8}>
            <View style={styles.avatarWrapper}>
              <LinearGradient
                colors={[Colors.primary, Colors.tertiary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarGradient}
              >
                <View style={styles.avatarInner}>
                  {user.avatarUri ? (
                    <Image source={{ uri: user.avatarUri }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <MaterialCommunityIcons name="account" size={60} color={Colors.outline} />
                    </View>
                  )}
                </View>
              </LinearGradient>
              <View style={styles.editBadge}>
                <MaterialCommunityIcons name="camera" size={14} color={Colors.onPrimaryFixed} />
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.nameContainer}>
            {isEditingName ? (
              <TextInput
                style={styles.nameInput}
                value={nameInput}
                onChangeText={setNameInput}
                onBlur={handleSaveName}
                onSubmitEditing={handleSaveName}
                autoFocus
                maxLength={20}
                placeholderTextColor={Colors.onSurfaceVariant}
              />
            ) : (
              <TouchableOpacity onPress={() => setIsEditingName(true)} style={styles.nameTouch}>
                <ThemedText type="headline" size={32} style={styles.userName}>{user.name}</ThemedText>
                <MaterialCommunityIcons name="pencil" size={16} color={Colors.primary} style={{ marginLeft: 8, opacity: 0.5 }} />
              </TouchableOpacity>
            )}
          </View>
          <ThemedText type="body" size={12} color={Colors.onSurfaceVariant} style={styles.userTier}>PREMIUM ATHLETE</ThemedText>
        </View>

        <View style={styles.statsRow}>
          <StatBox label="TOTAL WORKOUTS" value={totalWorkouts.toString()} color={Colors.primary} />
          <StatBox label="WEEKLY STREAK" value={streakDays.toString()} color={Colors.tertiary} />
        </View>

        <View style={styles.settingsSection}>
          <SettingGroup title="ACCOUNT DETAILS">
            <SettingItem icon="account-outline" label="Personal Information" />
            <SettingItem icon="email-outline" label="Email & Security" />
          </SettingGroup>

          <SettingGroup title="PREFERENCES">
            <View style={styles.settingItemRow}>
              <View style={styles.settingItemLeft}>
                <MaterialCommunityIcons name="weight-lifter" size={24} color={Colors.primary} style={{ opacity: 0.6 }} />
                <ThemedText type="body">Weight Units</ThemedText>
              </View>
              <View style={styles.unitsToggle}>
                <TouchableOpacity 
                  style={[styles.unitBtn, user.weightUnit === 'kg' && styles.unitBtnActive]}
                  onPress={() => setWeightUnit('kg')}
                >
                  <ThemedText type="headline" size={10} color={user.weightUnit === 'kg' ? Colors.onPrimaryFixed : Colors.onSurfaceVariant}>KG</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.unitBtn, user.weightUnit === 'lb' && styles.unitBtnActive]}
                  onPress={() => setWeightUnit('lb')}
                >
                  <ThemedText type="headline" size={10} color={user.weightUnit === 'lb' ? Colors.onPrimaryFixed : Colors.onSurfaceVariant}>LB</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
            <SettingItem icon="bell-outline" label="Notifications" />
          </SettingGroup>

          <SettingGroup title="SUPPORT & LEGAL">
            <SettingItem 
              icon="help-circle-outline" 
              label="Contact Support" 
              onPress={() => handeOpenURL('mailto:support@formah.com')} 
            />
            <SettingItem 
              icon="shield-check-outline" 
              label="Privacy Policy" 
              onPress={() => handeOpenURL('https://formah.com/privacy')} 
            />
            <SettingItem 
              icon="file-document-outline" 
              label="Terms of Service" 
              onPress={() => handeOpenURL('https://formah.com/terms')} 
            />
          </SettingGroup>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <MaterialCommunityIcons name="logout" size={20} color={Colors.onSurface} />
              <ThemedText type="headline" size={14} color={Colors.onSurface} style={styles.trackingWidest}>LOG OUT</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
              <MaterialCommunityIcons name="delete-forever-outline" size={20} color={Colors.error} />
              <ThemedText type="headline" size={14} color={Colors.error} style={styles.trackingWidest}>DELETE ACCOUNT</ThemedText>
            </TouchableOpacity>
          </View>

          <ThemedText type="body" size={10} color={Colors.onSurfaceVariant} style={styles.versionText}>FORMAH OS v2.4.0</ThemedText>
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}


const StatBox = ({ label, value, color }: { label: string, value: string, color: string }) => (
  <View style={styles.statBox}>
    <ThemedText type="label" size={10} color={Colors.onSurfaceVariant} style={styles.trackingWidest}>{label}</ThemedText>
    <ThemedText type="headline" size={24} color={color}>{value}</ThemedText>
  </View>
);

const SettingGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <View style={styles.settingGroup}>
    <ThemedText type="headline" size={12} color="rgba(166, 170, 190, 0.4)" style={styles.groupTitle}>{title}</ThemedText>
    <View style={styles.groupContent}>
      {children}
    </View>
  </View>
);

const SettingItem = ({ icon, label, onPress }: { icon: string, label: string, onPress?: () => void }) => (
  <TouchableOpacity style={styles.settingItemRow} onPress={onPress}>
    <View style={styles.settingItemLeft}>
      <MaterialCommunityIcons name={icon as any} size={24} color={Colors.primary} style={{ opacity: 0.6 }} />
      <ThemedText type="body">{label}</ThemedText>
    </View>
    <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.onSurfaceVariant} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 24, paddingVertical: 16 },
  profileSection: { alignItems: 'center', marginBottom: 40 },
  avatarWrapper: { marginBottom: 24, alignItems: 'center', justifyContent: 'center' },
  avatarGradient: { width: 132, height: 132, borderRadius: 66, padding: 4, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 30 },
  avatarInner: { width: '100%', height: '100%', borderRadius: 62, overflow: 'hidden', borderWidth: 4, borderColor: Colors.background },
  avatar: { width: '100%', height: '100%' },
  avatarPlaceholder: { flex: 1, backgroundColor: Colors.surfaceContainerHighest, alignItems: 'center', justifyContent: 'center' },
  editBadge: { position: 'absolute', bottom: 4, right: 4, backgroundColor: Colors.primary, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: Colors.background },
  nameContainer: { minHeight: 48, justifyContent: 'center', alignItems: 'center' },
  nameTouch: { flexDirection: 'row', alignItems: 'center' },
  userName: { fontWeight: 'bold', color: Colors.onSurface },
  nameInput: { fontSize: 32, fontWeight: 'bold', color: Colors.primary, textAlign: 'center', borderBottomWidth: 1, borderBottomColor: Colors.primary, paddingBottom: 4, minWidth: 200 },
  userTier: { marginTop: 4, letterSpacing: 1 },
  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 40 },
  statBox: { flex: 1, backgroundColor: Colors.surfaceContainerHigh, borderRadius: 16, padding: 24, alignItems: 'center', gap: 8 },
  trackingWidest: { letterSpacing: 2, textTransform: 'uppercase' },
  settingsSection: { gap: 32 },
  settingGroup: {},
  groupTitle: { letterSpacing: 2, marginBottom: 16, marginLeft: 8 },
  groupContent: { backgroundColor: Colors.surfaceContainerLow, borderRadius: 16, overflow: 'hidden' },
  settingItemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  settingItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  unitsToggle: { flexDirection: 'row', backgroundColor: Colors.surfaceContainerHighest, padding: 4, borderRadius: 20 },
  unitBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16 },
  unitBtnActive: { backgroundColor: Colors.primary },
  toggleSwitch: { width: 44, height: 26, backgroundColor: Colors.primary, borderRadius: 13, justifyContent: 'center', paddingHorizontal: 4 },
  toggleKnob: { width: 18, height: 18, backgroundColor: Colors.onPrimaryFixed, borderRadius: 9, marginLeft: 'auto' },
  actionButtons: { gap: 12 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: Colors.surfaceContainerHigh, height: 60, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: 'rgba(255, 113, 108, 0.05)', height: 60, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 113, 108, 0.1)' },
  versionText: { textAlign: 'center', marginTop: 16, opacity: 0.3, letterSpacing: 3 },
});

