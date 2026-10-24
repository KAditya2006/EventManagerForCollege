import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { getAdminEventDetails, updateEventStatus } from '../../api/adminEvents';
import { Event } from '../../api/events';
import QRCode from 'react-native-qrcode-svg';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { ErrorState } from '../../components/ErrorState';
import { colors, radii, spacing, typography } from '../../theme';
import { 
  CalendarIcon, 
  ClockIcon, 
  LocationPinIcon, 
  QrScanIcon 
} from '../../components/FormIcons';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminEventDetails'>;

const AdminEventDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { eventId } = route.params;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await getAdminEventDetails(eventId);
      if (res.success) {
        setEvent(res.data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Failed to load event details', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDetails();
    }, [eventId])
  );

  const handleStatusChange = (newStatus: string, confirmMessage: string) => {
    Alert.alert(
      'Confirm Lifecycle Change',
      confirmMessage,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Proceed', 
          style: newStatus === 'CANCELLED' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              setActionLoading(true);
              const res = await updateEventStatus(eventId, newStatus);
              if (res.success) {
                setEvent(res.data);
                Alert.alert('Status Updated', `Event status is now ${newStatus}.`);
              } else {
                Alert.alert('Notice', res.error?.message || 'Status update failed.');
              }
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.error?.message || 'Failed to update status.');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  if (loading && !event) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading event management details...</Text>
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.center}>
        <ErrorState 
          title="Event Not Found"
          message="Could not load event management details."
          onRetry={fetchDetails}
        />
      </View>
    );
  }

  const eventDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'success';
      case 'COMPLETED': return 'info';
      case 'DRAFT': return 'warning';
      case 'CANCELLED': return 'danger';
      default: return 'neutral';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Event Header Card */}
      <Card style={styles.headerCard}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{event.title}</Text>
          <Badge 
            label={event.status === 'COMPLETED' ? '🏁 COMPLETED' : event.status} 
            variant={getStatusVariant(event.status) as any} 
          />
        </View>

        <View style={styles.metaRow}>
          <CalendarIcon size={14} color="#64748B" />
          <Text style={[styles.metaText, { marginLeft: 6 }]}>{eventDate}</Text>
        </View>

        <View style={styles.metaRow}>
          <ClockIcon size={14} color="#64748B" />
          <Text style={[styles.metaText, { marginLeft: 6 }]}>{event.startTime} - {event.endTime}</Text>
        </View>

        <View style={styles.metaRow}>
          <LocationPinIcon size={14} color="#64748B" />
          <Text style={[styles.metaText, { marginLeft: 6 }]}>{event.venue}</Text>
        </View>
      </Card>

      {/* Completed Banner if Event is finished */}
      {event.status === 'COMPLETED' && (
        <Card style={styles.completedBannerCard}>
          <View style={styles.completedBannerRow}>
            <Text style={{ fontSize: 26, marginRight: 10 }}>🏁</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.completedBannerTitle}>Event Successfully Concluded</Text>
              <Text style={styles.completedBannerSub}>
                Prize distribution & winner announcement completed. Registrations are officially closed.
              </Text>
              {event.completedAt && (
                <Text style={styles.completedBannerDate}>
                  Concluded on: {new Date(event.completedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
              )}
            </View>
          </View>
        </Card>
      )}

      {/* Details Card */}
      <Card style={styles.sectionCard}>
        <Text style={styles.cardHeader}>EVENT CONFIGURATION</Text>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Organizer</Text>
          <Text style={styles.fieldValue}>{event.organizer}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Category</Text>
          <Text style={styles.fieldValue}>{event.category || 'General'}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Capacity Limit</Text>
          <Text style={styles.fieldValue}>
            {event.capacity ? `${event.capacity} registered students max` : 'Unlimited capacity'}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.descriptionBox}>
          <Text style={styles.fieldLabel}>Description</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>
      </Card>

      {/* Universal Registration QR Code Card (For Posters & Displays) */}
      <Card style={styles.qrCard}>
        <View style={styles.qrHeaderRow}>
          <Text style={styles.cardHeader}>EVENT REGISTRATION QR CODE</Text>
          <Badge label="Smart Pass" variant="primary" />
        </View>
        <Text style={styles.qrSubtitle}>
          Display this QR Code on college screens or print on posters. Students can scan it using their GIET App to register instantly, or using any phone camera to install the app and set up their profile first.
        </Text>

        <View style={styles.qrWrapper}>
          <QRCode
            value={`https://giet-a-event-manager.onrender.com/e/${event._id}`}
            size={180}
            color="#0e526b"
            backgroundColor="#ffffff"
          />
        </View>

        <View style={styles.qrLinkBox}>
          <Text style={styles.qrLinkLabel}>Registration Link:</Text>
          <Text style={styles.qrLinkText} numberOfLines={1} ellipsizeMode="middle">
            https://giet-a-event-manager.onrender.com/e/{event._id}
          </Text>
        </View>

        <Button
          title="📋 Copy Registration Link"
          onPress={() => {
            Alert.alert(
              'Event Registration Link',
              `https://giet-a-event-manager.onrender.com/e/${event._id}`,
              [{ text: 'OK' }]
            );
          }}
          variant="secondary"
          size="sm"
          style={{ width: '100%', marginTop: spacing.sm }}
        />
      </Card>

      {/* Event Winners Podium Card */}
      {event.winners && event.winners.length > 0 && (
        <Card style={styles.winnersCard}>
          <View style={styles.winnersHeaderRow}>
            <Text style={styles.cardHeader}>🏆 EVENT WINNERS PODIUM</Text>
            <Badge label="Announced" variant="success" />
          </View>

          {event.winners.map((w: any) => (
            <View key={w.position} style={styles.winnerItemRow}>
              <Text style={{ fontSize: 24, marginRight: 10 }}>
                {w.position === 1 ? '🥇' : w.position === 2 ? '🥈' : '🥉'}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.winnerItemName}>
                  {w.position === 1 ? '1st Place: ' : w.position === 2 ? '2nd Place: ' : '3rd Place: '}
                  {w.name}
                </Text>
                <Text style={styles.winnerItemSub}>
                  {[w.rollNumber ? `ID: ${w.rollNumber}` : null, w.branch, w.prize].filter(Boolean).join(' • ')}
                </Text>
              </View>
            </View>
          ))}
        </Card>
      )}

      {/* Operational Actions */}
      <Card style={styles.actionsCard}>
        <Text style={styles.cardHeader}>OPERATIONAL ACTIONS</Text>

        {actionLoading && (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginBottom: spacing.md }} />
        )}

        {/* View Event Participants */}
        <Button 
          title="👥 View Event Participants Roster"
          onPress={() => navigation.navigate('AdminEventParticipants', { eventId: event._id, eventTitle: event.title })}
          disabled={actionLoading}
          variant="primary"
          size="md"
          style={styles.actionBtn}
        />

        {/* Manage / Declare Winners */}
        <Button 
          title={event.winners && event.winners.length > 0 ? "🏆 Update Event Winners" : "🏆 Declare Event Winners (1st, 2nd, 3rd)"}
          onPress={() => navigation.navigate('AdminEventWinners', { eventId: event._id, eventTitle: event.title })}
          disabled={actionLoading}
          variant="secondary"
          size="md"
          style={styles.actionBtn}
        />

        {/* Scan QR Pass (High visibility when PUBLISHED) */}
        {event.status === 'PUBLISHED' && (
          <Button 
            title="📷 Gate Attendance Scanner"
            onPress={() => navigation.navigate('ScanAttendance', { eventId: event._id })}
            disabled={actionLoading}
            variant="secondary"
            size="md"
            style={styles.actionBtn}
          />
        )}

        {/* Restore to Draft if Cancelled */}
        {event.status === 'CANCELLED' && (
          <Button 
            title="↩️ Restore Event to Draft"
            onPress={() => handleStatusChange('DRAFT', 'Restoring this event to draft will allow you to edit details and re-publish it to students. Proceed?')}
            disabled={actionLoading}
            variant="primary"
            size="lg"
            style={styles.primaryAction}
          />
        )}

        {/* View Feedback */}
        <Button 
          title="⭐ View Feedback & Ratings"
          onPress={() => navigation.navigate('AdminEventFeedback', { eventId: event._id, eventTitle: event.title })}
          disabled={actionLoading}
          variant="secondary"
          size="md"
          style={styles.actionBtn}
        />

        {/* Edit Event */}
        <Button 
          title="✏️ Edit Event Details"
          onPress={() => navigation.navigate('EditEvent', { eventId: event._id })}
          disabled={actionLoading}
          variant="secondary"
          size="md"
          style={styles.actionBtn}
        />

        {/* Publish Action */}
        {event.status === 'DRAFT' && (
          <Button 
            title="🚀 Publish Event"
            onPress={() => handleStatusChange('PUBLISHED', 'Publishing will immediately make this event discoverable by all students for registration. Proceed?')}
            disabled={actionLoading}
            variant="success"
            size="lg"
            style={styles.actionBtn}
          />
        )}

        {/* Mark as Completed Action */}
        {event.status === 'PUBLISHED' && (
          <Button 
            title="🏁 Mark Event as Completed"
            onPress={() => handleStatusChange('COMPLETED', 'Marking this event as COMPLETED will close registrations, record prize distribution, and announce official conclusion to all attendees. Proceed?')}
            disabled={actionLoading}
            variant="primary"
            size="lg"
            style={[styles.actionBtn, { backgroundColor: '#059669', borderColor: '#059669' }]}
          />
        )}

        {/* Re-open / Revert completed event */}
        {event.status === 'COMPLETED' && (
          <Button 
            title="↩️ Re-open Event (Set to Published)"
            onPress={() => handleStatusChange('PUBLISHED', 'Re-opening this event will allow registrations and check-ins again. Proceed?')}
            disabled={actionLoading}
            variant="secondary"
            size="md"
            style={styles.actionBtn}
          />
        )}

        {/* Unpublish Action */}
        {event.status === 'PUBLISHED' && (
          <Button 
            title="↩️ Revert to Draft (Unpublish)"
            onPress={() => handleStatusChange('DRAFT', 'This will remove the event from student discovery while retaining existing records. Proceed?')}
            disabled={actionLoading}
            variant="secondary"
            size="md"
            style={styles.actionBtn}
          />
        )}

        {/* Cancel Event */}
        {(event.status === 'DRAFT' || event.status === 'PUBLISHED') && (
          <Button 
            title="✕ Cancel Event"
            onPress={() => handleStatusChange('CANCELLED', 'Cancelling will notify registered students and prevent further registrations. This action cannot be easily undone. Proceed?')}
            disabled={actionLoading}
            variant="danger"
            size="md"
            style={styles.actionBtn}
          />
        )}
      </Card>
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
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  headerCard: {
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  titleRow: {
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  metaIcon: {
    fontSize: 14,
    marginRight: spacing.xs + 2,
  },
  metaText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  sectionCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardHeader: {
    ...typography.caption,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  fieldLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  fieldValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: spacing.xs,
  },
  descriptionBox: {
    marginTop: spacing.sm,
  },
  description: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  actionsCard: {
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  primaryAction: {
    marginBottom: spacing.md,
  },
  actionBtn: {
    marginBottom: spacing.md,
  },
  qrCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  qrHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.xs,
  },
  qrSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  qrWrapper: {
    padding: spacing.md,
    backgroundColor: '#ffffff',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  qrLinkBox: {
    width: '100%',
    backgroundColor: '#f8fafc',
    padding: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: spacing.xs,
  },
  qrLinkLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  qrLinkText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  winnersCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#FEF08A',
  },
  winnersHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  winnerItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  winnerItemName: {
    ...typography.titleMedium,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  winnerItemSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  /* Completed Banner */
  completedBannerCard: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1.5,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  completedBannerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  completedBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 2,
  },
  completedBannerSub: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 16,
  },
  completedBannerDate: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
    marginTop: 4,
  },
});

export default AdminEventDetailsScreen;
