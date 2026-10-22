import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Alert, 
  TouchableOpacity,
  Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../context/AuthContext';
import { getProfile } from '../../api/profile';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ErrorState } from '../../components/ErrorState';
import { colors, spacing } from '../../theme';
import { ShieldIcon, UserIcon, CheckIcon } from '../../components/FormIcons';

const AdminProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const fetchProfile = async () => {
    try {
      setError(false);
      const response = await getProfile();
      if (response.success) {
        setProfileData(response.data);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        signOut();
      } else {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to end your administrator session?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar style="dark" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading Admin Profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !profileData) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar style="dark" />
        <View style={styles.center}>
          <ErrorState 
            title="Could Not Load Profile"
            message="Unable to fetch administrator details."
            onRetry={fetchProfile}
          />
        </View>
      </SafeAreaView>
    );
  }

  const displayName = profileData?.name || user?.name || 'Administrator';
  const initial = displayName.charAt(0).toUpperCase() || 'A';
  const email = profileData?.email || user?.email || 'admin@giet.edu';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Institutional Header */}
        <View style={styles.topHeader}>
          <Image
            source={require('../../../assets/giet-logo-transparent.png')}
            style={styles.collegeLogo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.collegeTitle}>GIET (AUTONOMOUS)</Text>
            <Text style={styles.collegeSub}>Executive Administrator Profile</Text>
          </View>
        </View>

        {/* Profile Card Header */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{initial}</Text>
            <View style={styles.shieldBadge}>
              <ShieldIcon size={12} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profileRoleTitle}>GIET(A) Event Operations Controller</Text>

          <View style={styles.adminRolePill}>
            <Text style={styles.adminRoleText}>OFFICIAL ADMINISTRATOR</Text>
          </View>
        </View>

        {/* Credentials Card */}
        <View style={styles.cardContainer}>
          <Text style={styles.cardHeaderTitle}>ADMINISTRATOR CREDENTIALS</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>{displayName}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email Address</Text>
            <Text style={styles.infoValue}>{email}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Access Role</Text>
            <View style={styles.accessBadge}>
              <Text style={styles.accessBadgeText}>FULL CRUD & ATTENDANCE SCAN</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Institution</Text>
            <Text style={styles.infoValue}>GIET (Autonomous), Bhubaneswar</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <View style={styles.statusRow}>
              <View style={styles.greenDot} />
              <Text style={styles.statusText}>Active Administrator</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={styles.actionBtnPrimary}
            onPress={() => navigation.navigate('EditProfile', { profileData })}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnPrimaryText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionBtnSecondary}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnSecondaryText}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Text style={styles.logoutBtnText}>Log Out of Admin Portal</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          GIET Autonomous • Secure Event Administration Console
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 48,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: spacing.md,
    fontWeight: '500',
  },

  /* Top Header */
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 16,
  },
  collegeLogo: {
    width: 38,
    height: 38,
    marginRight: 10,
  },
  collegeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0E526B',
    letterSpacing: 0.6,
  },
  collegeSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },

  /* Profile Card Header */
  profileHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#0E526B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
    shadowColor: '#0E526B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  shieldBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#187393',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  profileRoleTitle: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 10,
  },
  adminRolePill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  adminRoleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.6,
  },

  /* Credentials Card */
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#187393',
    letterSpacing: 1,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    maxWidth: '65%',
    textAlign: 'right',
  },
  accessBadge: {
    backgroundColor: '#F0F9FB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D2EDF6',
  },
  accessBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0E526B',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#16A34A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },

  /* Action Buttons */
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  actionBtnPrimary: {
    flex: 1,
    height: 48,
    backgroundColor: '#187393',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#187393',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  actionBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  actionBtnSecondary: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
  },
  actionBtnSecondaryText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
  },

  /* Logout */
  logoutBtn: {
    height: 48,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#FCA5A5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutBtnText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
  footerNote: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default AdminProfileScreen;
