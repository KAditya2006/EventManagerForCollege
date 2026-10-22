import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AdminStackParamList, 'CheckInResult'>;

const CheckInResultScreen: React.FC<Props> = ({ route, navigation }) => {
  const { eventId, result } = route.params;

  const isSuccess = result.success;
  const isAlreadyCheckedIn = result.alreadyCheckedIn;

  let title = 'Scan Verification Failed';
  let message = result.error?.message || 'The scanned QR pass could not be verified.';
  let icon = '✕';
  let badgeLabel = 'INVALID PASS';
  let badgeVariant: 'danger' | 'warning' | 'success' = 'danger';
  let iconBg = colors.dangerLight;
  let iconColor = colors.dangerDark;

  if (isSuccess) {
    title = 'Check-in Verified!';
    message = 'Student has been marked as CHECKED IN for this event.';
    icon = '✓';
    badgeLabel = 'CHECK-IN CONFIRMED';
    badgeVariant = 'success';
    iconBg = colors.successLight;
    iconColor = colors.successDark;
  } else if (isAlreadyCheckedIn) {
    title = 'Already Checked In';
    message = 'This student was previously checked into this event.';
    icon = '⚠️';
    badgeLabel = 'DUPLICATE SCAN';
    badgeVariant = 'warning';
    iconBg = colors.warningLight;
    iconColor = colors.warningDark;
  }

  const studentData = result.data?.student;
  const checkInTime = result.data?.checkedInAt 
    ? new Date(result.data.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Card style={styles.resultCard}>
        <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
          <Text style={[styles.iconText, { color: iconColor }]}>{icon}</Text>
        </View>

        <Badge label={badgeLabel} variant={badgeVariant} style={styles.badge} />

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        
        {studentData && (
          <View style={styles.studentDetailsBox}>
            <Text style={styles.detailsHeader}>STUDENT PARTICIPANT RECORD</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Full Name</Text>
              <Text style={styles.detailValue}>{studentData.name}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{studentData.email}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Branch</Text>
              <Text style={styles.detailValue}>{studentData.branch || 'N/A'}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Year / Sem</Text>
              <Text style={styles.detailValue}>{studentData.year || 'N/A'}</Text>
            </View>

            {checkInTime && (
              <>
                <View style={styles.divider} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Scan Time</Text>
                  <Text style={[styles.detailValue, { color: colors.primary }]}>{checkInTime}</Text>
                </View>
              </>
            )}
          </View>
        )}
      </Card>

      <View style={styles.actions}>
        <Button 
          title="📷 Scan Next Student"
          onPress={() => navigation.goBack()}
          variant="primary"
          size="lg"
        />

        <Button 
          title="Back to Event Details"
          onPress={() => navigation.navigate('AdminEventDetails', { eventId })}
          variant="secondary"
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
    paddingVertical: spacing.xl,
  },
  resultCard: {
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: radii.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconText: {
    fontSize: 34,
    fontWeight: 'bold',
  },
  badge: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  message: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
    maxWidth: 300,
  },
  studentDetailsBox: {
    width: '100%',
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  detailsHeader: {
    ...typography.caption,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  detailLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  detailValue: {
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
    gap: spacing.md,
  },
});

export default CheckInResultScreen;
