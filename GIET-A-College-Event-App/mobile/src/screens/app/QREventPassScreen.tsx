import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import QRCode from 'react-native-qrcode-svg';
import { StudentStackParamList } from '../../navigation/StudentNavigator';
import { getRegistrationPass } from '../../api/registrations';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { ErrorState } from '../../components/ErrorState';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<StudentStackParamList, 'QREventPass'>;

interface PassData {
  registration: {
    id: string;
    event: {
      title: string;
      date: string;
      startTime: string;
      endTime: string;
      venue: string;
      status: string;
    };
    student?: {
      name?: string;
      rollNumber?: string;
      course?: string;
      branch?: string;
      year?: string;
      semester?: string;
    };
    status: string;
  };
  pass: {
    token: string;
  };
}

const QREventPassScreen: React.FC<Props> = ({ route, navigation }) => {
  const { registrationId } = route.params;
  const [passData, setPassData] = useState<PassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPass();
  }, [registrationId]);

  const fetchPass = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getRegistrationPass(registrationId);
      if (response.success) {
        setPassData(response.data);
      } else {
        setError(response.error?.message || 'Failed to generate pass');
      }
    } catch (err: any) {
      console.error('Failed to fetch pass:', err);
      const message = err.response?.data?.error?.message || 'Unable to access your event pass. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Generating Secure QR Pass...</Text>
      </View>
    );
  }

  if (error || !passData) {
    return (
      <View style={styles.center}>
        <ErrorState 
          title="Pass Unavailable"
          message={error || 'Could not load your digital pass.'}
          onRetry={fetchPass}
        />
      </View>
    );
  }

  const { event, student } = passData.registration;
  const eventDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.passCard}>
          {/* Institutional Top Bar */}
          <View style={styles.passHeader}>
            <Text style={styles.institutionName}>GIET (AUTONOMOUS)</Text>
            <Text style={styles.passSubtitle}>OFFICIAL EVENT PASS</Text>
          </View>

          {/* Event Details Section */}
          <View style={styles.eventInfo}>
            <Badge label="VERIFIED PASS" variant="success" size="sm" style={styles.verifiedBadge} />
            <Text style={styles.eventTitle}>{event.title}</Text>
            
            <View style={styles.metaRow}>
              <Text style={styles.metaIcon}>📅</Text>
              <Text style={styles.eventDetails}>{eventDate} • {event.startTime} - {event.endTime}</Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaIcon}>📍</Text>
              <Text style={styles.eventVenue}>{event.venue}</Text>
            </View>
          </View>

          {/* Student Info Section */}
          {student && (
            <View style={styles.studentBadgeSection}>
              <View style={styles.studentRow}>
                <Text style={styles.studentLabel}>STUDENT ATTENDEE</Text>
                <Text style={styles.studentRoll}>{student.rollNumber || 'REGD'}</Text>
              </View>
              <Text style={styles.studentName}>{student.name || 'Student'}</Text>
              <Text style={styles.studentMeta}>
                {[student.course, student.branch, student.year].filter(Boolean).join(' • ')}
              </Text>
            </View>
          )}

          {/* QR Code Container */}
          <View style={styles.qrContainer}>
            <View style={styles.qrFrame}>
              <QRCode
                value={passData.pass.token}
                size={190}
                color="#000000"
                backgroundColor="#ffffff"
                quietZone={10}
              />
            </View>
            <Text style={styles.instructionText}>
              Present this code to the event coordinator for scanning
            </Text>
          </View>

          {/* Pass Footer */}
          <View style={styles.passFooter}>
            <Text style={styles.regIdLabel}>Registration ID</Text>
            <Text style={styles.regIdValue}>{passData.registration.id}</Text>
          </View>
        </View>

        <Button 
          title="Done"
          onPress={() => navigation.goBack()}
          variant="secondary"
          size="md"
          style={styles.doneButton}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Deep slate for contrast
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
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  passCard: {
    backgroundColor: colors.surface,
    width: '100%',
    maxWidth: 380,
    borderRadius: radii.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  passHeader: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  institutionName: {
    ...typography.titleSmall,
    color: colors.textInverse,
    letterSpacing: 1.5,
  },
  passSubtitle: {
    ...typography.caption,
    color: colors.primaryLight,
    letterSpacing: 1,
    marginTop: 2,
  },
  eventInfo: {
    padding: spacing.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
    borderStyle: 'dashed',
  },
  verifiedBadge: {
    marginBottom: spacing.sm,
  },
  eventTitle: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  metaIcon: {
    fontSize: 13,
    marginRight: spacing.xs,
  },
  eventDetails: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  eventVenue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  studentBadgeSection: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: '#F1F8FA',
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  studentLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0E526B',
    letterSpacing: 0.8,
  },
  studentRoll: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    backgroundColor: '#D2EDF6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  studentMeta: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  qrContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  qrFrame: {
    padding: spacing.sm,
    backgroundColor: '#ffffff',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.md,
  },
  instructionText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 18,
  },
  passFooter: {
    padding: spacing.md,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  regIdLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  regIdValue: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: colors.textSecondary,
    marginTop: 2,
  },
  doneButton: {
    marginTop: spacing.xl,
    width: '100%',
    maxWidth: 380,
  },
});

export default QREventPassScreen;
