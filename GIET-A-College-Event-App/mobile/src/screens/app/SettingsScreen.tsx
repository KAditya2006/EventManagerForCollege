import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { colors, spacing, typography } from '../../theme';

const SettingsScreen: React.FC = () => {
  const { signOut, user } = useAuth();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to end your session?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const showInfo = (title: string, message: string) => {
    Alert.alert(title, message);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Account Section */}
      <Text style={styles.sectionTitle}>Account & Notifications</Text>
      <Card style={styles.cardContainer}>
        <View style={styles.row}>
          <View>
            <Text style={styles.rowText}>Signed-in Account</Text>
            <Text style={styles.subText}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <TouchableOpacity 
          style={styles.touchRow}
          onPress={() => showInfo('In-App Notifications', 'In-app notification alerts are currently enabled for your registrations, updates, and check-in confirmations.')}
          activeOpacity={0.7}
        >
          <Text style={styles.rowText}>Notification Preferences</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Card>

      {/* Institution Section */}
      <Text style={styles.sectionTitle}>About Institution</Text>
      <Card style={styles.cardContainer}>
        <TouchableOpacity 
          style={styles.touchRow}
          onPress={() => showInfo('GIET (Autonomous)', 'Gandhi Institute for Education and Technology (GIET), Bhubaneswar is a premier Autonomous institution approved by AICTE.')}
          activeOpacity={0.7}
        >
          <Text style={styles.rowText}>About GIET(A)</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity 
          style={styles.touchRow}
          onPress={() => showInfo('Privacy & Security', 'All campus registrations and attendance records are securely stored on GIET(A) servers. Access tokens are encrypted on-device.')}
          activeOpacity={0.7}
        >
          <Text style={styles.rowText}>Privacy & Security</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity 
          style={styles.touchRow}
          onPress={() => showInfo('Terms of Service', 'This application is restricted to authorized students, faculty, and event organizers of GIET(A).')}
          activeOpacity={0.7}
        >
          <Text style={styles.rowText}>Terms of Service</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Card>

      {/* App Version Info */}
      <Text style={styles.sectionTitle}>Application</Text>
      <Card style={styles.cardContainer}>
        <View style={styles.row}>
          <Text style={styles.rowText}>Version</Text>
          <Text style={styles.versionText}>1.0.0 (Production Ready)</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.rowText}>Campus Platform</Text>
          <Text style={styles.versionText}>GIET(A) Mobile App</Text>
        </View>
      </Card>

      {/* Session Action */}
      <View style={styles.sessionSection}>
        <Button 
          title="Log Out of Account"
          onPress={handleLogout}
          variant="danger"
          size="md"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs + 2,
    marginTop: spacing.md,
    paddingLeft: spacing.xs,
  },
  cardContainer: {
    padding: 0,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  touchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginLeft: spacing.lg,
  },
  rowText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  subText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  versionText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  chevron: {
    fontSize: 20,
    color: colors.textMuted,
    lineHeight: 20,
  },
  sessionSection: {
    marginTop: spacing.lg,
  },
});

export default SettingsScreen;
