import React from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { ThemedText } from '../../components/ThemedText';
import { GridBackground } from '../../components/VisualAccents';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

import { useWorkoutStore } from '../../store/workoutStore';

export default function ProfileScreen() {
  const history = useWorkoutStore(state => state.history);

  const calculateStreak = () => {
    if (history.length === 0) return 0;
    return history.length; // Basic placeholder for streak logic
  };

  const totalWorkouts = history.length;
  const streakDays = calculateStreak();
  return (
    <View style={styles.container}>
      <GridBackground />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileSection, { marginTop: 40 }]}>
          <View style={styles.avatarWrapper}>
            <LinearGradient
              colors={[Colors.primary, Colors.tertiary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
              <View style={styles.avatarInner}>
                <Image 
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA65x1B46BlaVa4ghsbmBBfGrUQMOUG7vKPRrY_5slYLqnK2QmE3oV_deeikbtCIoqEq5lJuTKkb3G_vCH-1y4_9RrUQbYs6kIcIn0aBZgyzH2HmOTQWZwE-uLmD03hkTFmg4_tb-uWW_AdWgLNBJoNBpB5ewJKot9IxcAs60S-Rcj3wYBapp7C871PcRylF1fxCWamM3xy5LJms24hqcyIavYmS96N8q3VPGSuq02y5thWkb1YSDx_KG7MRismNMizPMDjqIv4qiiq' }} 
                  style={styles.avatar} 
                />
              </View>
            </LinearGradient>
            <View style={styles.lvlBadge}>
              <ThemedText type="headline" size={10} color={Colors.onPrimaryFixed}>LVL 42</ThemedText>
            </View>
          </View>

          <ThemedText type="headline" size={32} style={styles.userName}>Alex Thorne</ThemedText>
          <ThemedText type="body" size={12} color={Colors.onSurfaceVariant} style={styles.userTier}>ELITE PERFORMANCE TIER</ThemedText>
        </View>

        <View style={styles.statsRow}>
          <StatBox label="TOTAL WORKOUTS" value={totalWorkouts.toString()} color={Colors.primary} />
          <StatBox label="STREAK DAYS" value={streakDays.toString()} color={Colors.tertiary} />
        </View>

        <View style={styles.settingsSection}>
          <SettingGroup title="ACCOUNT DETAILS">
            <SettingItem icon="account-outline" label="Personal Information" />
            <SettingItem icon="email-outline" label="Email & Security" />
          </SettingGroup>

          <SettingGroup title="PREFERENCES">
            <View style={styles.settingItemRow}>
              <View style={styles.settingItemLeft}>
                <MaterialCommunityIcons name="ruler" size={24} color={Colors.primary} style={{ opacity: 0.6 }} />
                <ThemedText type="body">Units</ThemedText>
              </View>
              <View style={styles.unitsToggle}>
                <TouchableOpacity style={[styles.unitBtn, styles.unitBtnActive]}>
                  <ThemedText type="headline" size={10} color={Colors.onPrimaryFixed}>METRIC</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.unitBtn}>
                  <ThemedText type="headline" size={10} color={Colors.onSurfaceVariant}>IMP</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
            <SettingItem icon="bell-outline" label="Notifications" />
            <View style={styles.settingItemRow}>
              <View style={styles.settingItemLeft}>
                <MaterialCommunityIcons name="weather-night" size={24} color={Colors.primary} style={{ opacity: 0.6 }} />
                <ThemedText type="body">Dark Mode</ThemedText>
              </View>
              <View style={styles.toggleSwitch}>
                <View style={styles.toggleKnob} />
              </View>
            </View>
          </SettingGroup>

          <TouchableOpacity style={styles.logoutBtn}>
            <MaterialCommunityIcons name="logout" size={20} color={Colors.error} />
            <ThemedText type="headline" size={14} color={Colors.error} style={styles.trackingWidest}>LOG OUT</ThemedText>
          </TouchableOpacity>

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

const SettingItem = ({ icon, label }: { icon: string, label: string }) => (
  <TouchableOpacity style={styles.settingItemRow}>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 64, marginBottom: 40 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  miniAvatarBorder: { width: 32, height: 32, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(129, 236, 255, 0.2)' },
  brandTitle: { fontStyle: 'italic', fontWeight: '900', letterSpacing: 1.5 },
  profileSection: { alignItems: 'center', marginBottom: 40 },
  avatarWrapper: { marginBottom: 24, alignItems: 'center', justifyContent: 'center' },
  avatarGradient: { width: 132, height: 132, borderRadius: 66, padding: 4, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 30 },
  avatarInner: { width: '100%', height: '100%', borderRadius: 62, overflow: 'hidden', borderWidth: 4, borderColor: Colors.background },
  avatar: { width: '100%', height: '100%' },
  lvlBadge: { position: 'absolute', bottom: 4, right: 4, backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  userName: { fontWeight: 'bold' },
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
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: 'rgba(255, 113, 108, 0.05)', height: 64, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 113, 108, 0.1)' },
  versionText: { textAlign: 'center', marginTop: 16, opacity: 0.3, letterSpacing: 3 },
});
