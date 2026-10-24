import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../context/SystemContext';
import { getProfile } from '../../api/profile';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { ErrorState } from '../../components/ErrorState';
import { colors, radii, spacing, typography } from '../../theme';

const StudentProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const { checkUpdates } = useSystem();
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
    Alert.alert('Log Out', 'Are you sure you want to log out of GIET(A) Events?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: signOut },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error && !profileData) {
    return (
      <View style={styles.center}>
        <ErrorState 
          title="Could Not Load Profile"
          message="Unable to fetch your profile details. Please try again."
          onRetry={fetchProfile}
        />
      </View>
    );
  }

  const displayName = profileData?.name || 'Student';
  const initial = displayName.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'S';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.branchYear}>
          {profileData?.branch || 'Course not specified'} • {profileData?.year || 'Year not specified'}
        </Text>
        <Badge label="STUDENT" variant="primary" style={styles.roleBadge} />
      </View>

      {/* Account Details */}
      <Card style={styles.infoCard}>
        <Text style={styles.sectionHeader}>Academic & Student Profile</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Full Name</Text>
          <Text style={styles.infoValue}>{displayName}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            {profileData?.idType === 'ROLL_NUMBER' || (profileData?.rollNumber && profileData.rollNumber.length === 6)
              ? 'Roll No. (6 Digits)'
              : 'Reg. No. (10 Digits)'}
          </Text>
          <Text style={[styles.infoValue, { fontWeight: '700', color: colors.primary }]}>
            {profileData?.rollNumber || '—'}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Degree / Course</Text>
          <Text style={styles.infoValue}>{profileData?.course || '—'}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Branch / Dept</Text>
          <Text style={styles.infoValue}>{profileData?.branch || '—'}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Year of Study</Text>
          <Text style={styles.infoValue}>{profileData?.year || '—'}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Semester</Text>
          <Text style={styles.infoValue}>{profileData?.semester || '—'}</Text>
        </View>

        {profileData?.section ? (
          <>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Section</Text>
              <Text style={styles.infoValue}>{profileData.section}</Text>
            </View>
          </>
        ) : null}

        {profileData?.phone ? (
          <>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mobile Number</Text>
              <Text style={styles.infoValue}>{profileData.phone}</Text>
            </View>
          </>
        ) : null}

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>College Email</Text>
          <Text style={styles.infoValue}>{user?.email}</Text>
        </View>
      </Card>

      {/* Quick Actions */}
      <View style={styles.actions}>
        <Button 
          title="Edit Profile"
          onPress={() => navigation.navigate('EditProfile', { profileData })}
          variant="primary"
          size="md"
          style={styles.actionBtn}
        />
        <Button 
          title="App Settings"
          onPress={() => navigation.navigate('Settings')}
          variant="secondary"
          size="md"
          style={styles.actionBtn}
        />
      </View>

      {/* Live Updates & Version Info */}
      <View style={styles.updateCard}>
        <View style={styles.updateInfoRow}>
          <Text style={styles.updateIcon}>⚡</Text>
          <View style={styles.updateTextCol}>
            <Text style={styles.updateTitle}>Live Updates Active</Text>
            <Text style={styles.updateSub}>EAS Over-The-Air Sync Enabled</Text>
          </View>
          <TouchableOpacity
            style={styles.updateCheckBtn}
            onPress={() => checkUpdates(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.updateCheckBtnText}>Check</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Institutional Sign Out */}
      <Button 
        title="Log Out"
        onPress={handleLogout}
        variant="danger"
        size="md"
        style={styles.logoutButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarText: {
    color: colors.textInverse,
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  branchYear: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  roleBadge: {
    marginTop: spacing.xs,
  },
  infoCard: {
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
  },
  infoLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    maxWidth: 200,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionBtn: {
    flex: 1,
  },
  updateCard: {
    backgroundColor: '#F0F9FB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BCE3EC',
    marginBottom: spacing.lg,
  },
  updateInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  updateIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  updateTextCol: {
    flex: 1,
  },
  updateTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0E526B',
  },
  updateSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  updateCheckBtn: {
    backgroundColor: '#0E526B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  updateCheckBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  logoutButton: {
    width: '100%',
  },
});

export default StudentProfileScreen;
