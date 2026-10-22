import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../navigation/StudentNavigator';
import { getRegistrationDetails, Registration } from '../../api/registrations';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { ErrorState } from '../../components/ErrorState';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<StudentStackParamList, 'RegistrationDetails'>;

const RegistrationDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { registrationId } = route.params;
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [registrationId]);

  const fetchDetails = async () => {
    try {
      setError(false);
      const response = await getRegistrationDetails(registrationId);
      if (response.success) {
        setRegistration(response.data);
      }
    } catch (err: any) {
      console.error('Failed to load registration details', err);
      setError(true);
      if (err.response?.status === 404) {
        Alert.alert('Not Found', 'Registration not found.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading registration...</Text>
      </View>
    );
  }

  if (error || !registration) {
    return (
      <View style={styles.center}>
        <ErrorState 
          title="Registration Not Found"
          message="We could not load this registration. Please verify your connection."
          onRetry={fetchDetails}
        />
      </View>
    );
  }

  const { event } = registration;
  const eventDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const isCheckedIn = (registration as any).checkedIn;
  const checkedInAt = (registration as any).checkedInAt;
  const hasFeedback = (registration as any).hasFeedback;
  const isCancelled = event.status === 'CANCELLED';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Event Overview Card */}
        <Card style={styles.mainCard}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{event.title}</Text>
            <Badge 
              label={registration.status} 
              variant={registration.status === 'REGISTERED' ? 'primary' : 'neutral'} 
            />
          </View>
          
          {isCancelled && (
            <View style={styles.cancelledAlert}>
              <Text style={styles.cancelledAlertText}>⚠️ Event has been cancelled by administrators.</Text>
            </View>
          )}

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{eventDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>{event.startTime} - {event.endTime}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Venue</Text>
              <Text style={styles.infoValue}>{event.venue}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Organizer</Text>
              <Text style={styles.infoValue}>{event.organizer}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Reg ID</Text>
              <Text style={[styles.infoValue, styles.monoText]}>{registration._id}</Text>
            </View>
          </View>
        </Card>

        {/* Attendance Status Card */}
        <Card style={styles.attendanceCard}>
          <Text style={styles.attendanceTitle}>Attendance Status</Text>
          <View style={styles.attendanceStatusRow}>
            <View style={[styles.statusIconBox, isCheckedIn ? styles.iconSuccess : styles.iconPending]}>
              <Text style={styles.statusIcon}>{isCheckedIn ? '✓' : '⏳'}</Text>
            </View>
            <View style={styles.attendanceInfo}>
              <Badge 
                label={isCheckedIn ? 'CHECKED IN' : 'NOT CHECKED IN'} 
                variant={isCheckedIn ? 'success' : 'warning'} 
              />
              <Text style={styles.attendanceDesc}>
                {isCheckedIn 
                  ? checkedInAt 
                    ? `Verified at ${new Date(checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : 'Check-in verified by event admin'
                  : 'Present your QR pass at the entrance to verify attendance.'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          {event.status === 'PUBLISHED' && registration.status === 'REGISTERED' ? (
            <Button 
              title="View Digital QR Pass"
              onPress={() => navigation.navigate('QREventPass', { registrationId: registration._id })}
              variant="primary"
              size="lg"
              style={styles.actionButton}
            />
          ) : (
            <View style={styles.unavailablePass}>
              <Text style={styles.unavailablePassText}>QR Pass Unavailable (Event Cancelled / Not Registered)</Text>
            </View>
          )}

          {isCheckedIn && !hasFeedback && (
            <Button 
              title="Give Event Feedback"
              onPress={() => navigation.navigate('EventFeedback', { eventId: event._id, eventTitle: event.title })}
              variant="secondary"
              size="lg"
              style={styles.actionButton}
            />
          )}

          {isCheckedIn && hasFeedback && (
            <View style={styles.feedbackSubmittedBox}>
              <Text style={styles.feedbackSubmittedText}>✓ Feedback Submitted for this Event</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
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
  mainCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.md,
  },
  cancelledAlert: {
    backgroundColor: colors.dangerLight,
    padding: spacing.sm,
    borderRadius: radii.sm,
    marginBottom: spacing.md,
  },
  cancelledAlertText: {
    ...typography.bodySmall,
    color: colors.dangerDark,
    fontWeight: '600',
  },
  infoSection: {
    marginTop: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSubtle,
  },
  infoLabel: {
    width: 90,
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    flex: 1,
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  monoText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  attendanceCard: {
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  attendanceTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  attendanceStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconBox: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconSuccess: {
    backgroundColor: colors.successLight,
  },
  iconPending: {
    backgroundColor: colors.warningLight,
  },
  statusIcon: {
    fontSize: 20,
  },
  attendanceInfo: {
    flex: 1,
  },
  attendanceDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  actionsSection: {
    gap: spacing.md,
  },
  actionButton: {
    width: '100%',
  },
  unavailablePass: {
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.lg,
    borderRadius: radii.md,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.surfaceBorderDark,
  },
  unavailablePassText: {
    ...typography.bodyMedium,
    color: colors.textMuted,
    textAlign: 'center',
  },
  feedbackSubmittedBox: {
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  feedbackSubmittedText: {
    ...typography.bodyMedium,
    color: colors.successDark,
    fontWeight: '600',
  },
});

export default RegistrationDetailsScreen;
