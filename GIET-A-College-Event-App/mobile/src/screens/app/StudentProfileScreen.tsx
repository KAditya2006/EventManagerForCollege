import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
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
          <Text style={styles.infoLabel}>Reg. / Roll No.</Text>
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
  logoutButton: {
    width: '100%',
  },
});

export default StudentProfileScreen;
