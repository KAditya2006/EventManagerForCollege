import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform, Image, Modal, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { StudentStackParamList } from '../../navigation/StudentNavigator';
import { getEventDetails, Event } from '../../api/events';
import { registerForEvent } from '../../api/registrations';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { ErrorState } from '../../components/ErrorState';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<StudentStackParamList, 'EventDetails'>;

const EventDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { eventId } = route.params;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const fetchEventDetails = async () => {
    try {
      setError(false);
      const response = await getEventDetails(eventId);
      if (response.success) {
        setEvent(response.data);
      }
    } catch (err: any) {
      console.error('Failed to load event details', err);
      setError(true);
      if (err.response?.status === 403 || err.response?.status === 404) {
        Alert.alert('Event Unavailable', 'This event is no longer available.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEventDetails();
    }, [eventId])
  );

  const handleRegister = async () => {
    if (!event || event.isRegistered || registering) return;

    setRegistering(true);
    try {
      const response = await registerForEvent(event._id);
      if (response.success) {
        navigation.navigate('RegistrationConfirmation', {
          eventId: event._id,
          registrationId: response.data._id
        });
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      const message = err.response?.data?.error?.message || 'Failed to register for this event. Please try again.';
      Alert.alert('Registration Notice', message);
      fetchEventDetails();
    } finally {
      setRegistering(false);
    }
  };

  if (loading && !event) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading event details...</Text>
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.center}>
        <ErrorState 
          title="Event Not Found"
          message="We could not load this event's details. It may have been unlisted or removed."
          onRetry={fetchEventDetails}
        />
      </View>
    );
  }

  const eventDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const isCancelled = event.status === 'CANCELLED';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Institutional banner */}
        <View style={styles.institutionHeader}>
          <Text style={styles.institutionTag}>GIET (AUTONOMOUS) • CAMPUS EVENT</Text>
        </View>

        {/* Event Poster Hero Banner (if uploaded by Admin) */}
        {event.poster ? (
          <View style={styles.posterHeroBox}>
            <Image 
              source={{ uri: event.poster }} 
              style={styles.posterHeroImage} 
              resizeMode="cover"
            />
          </View>
        ) : null}

        <View style={styles.detailsContainer}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{event.title}</Text>
            <View style={styles.badgesRow}>
              {isCancelled ? (
                <Badge label="CANCELLED" variant="danger" />
              ) : event.status === 'COMPLETED' ? (
                <Badge label="🏁 CONCLUDED" variant="success" />
              ) : (
                <Badge label="PUBLISHED" variant="success" />
              )}
              {event.category && (
                <Badge label={event.category} variant="primary" style={{ marginLeft: spacing.xs }} />
              )}
              {event.isRegistered && (
                <Badge label="REGISTERED" variant="info" style={{ marginLeft: spacing.xs }} />
              )}
            </View>
          </View>

          {/* Quick Info Grid */}
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Text style={styles.infoIcon}>📅</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>{eventDate}</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Text style={styles.infoIcon}>⏰</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoValue}>{event.startTime} - {event.endTime}</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Text style={styles.infoIcon}>📍</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Venue</Text>
                <Text style={styles.infoValue}>{event.venue}</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Text style={styles.infoIcon}>🏛️</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Organizer</Text>
                <Text style={styles.infoValue}>{event.organizer}</Text>
              </View>
            </View>

            {event.capacity !== undefined && event.capacity > 0 && (
              <>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <View style={styles.infoIconBox}>
                    <Text style={styles.infoIcon}>👥</Text>
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Capacity</Text>
                    <Text style={styles.infoValue}>{event.capacity} seats</Text>
                  </View>
                </View>
              </>
            )}
          </Card>

          {/* Concluded Event Notification */}
          {event.status === 'COMPLETED' && (
            <View style={styles.concludedBanner}>
              <Text style={styles.concludedBannerTitle}>🏁 Event Concluded</Text>
              <Text style={styles.concludedBannerSub}>
                This campus event has successfully concluded. Prize distribution is complete. Check out the official winners below!
              </Text>
            </View>
          )}

          {/* Winners Podium Card (if announced) */}
          {event.winners && event.winners.length > 0 && (
            <Card style={styles.winnersCard}>
              <View style={styles.winnersHeaderRow}>
                <Text style={styles.winnersTrophyIcon}>🏆</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.winnersHeaderTitle}>Official Event Winners</Text>
                  <Text style={styles.winnersHeaderSub}>Declared by GIET Event Coordinators</Text>
                </View>
              </View>

              <View style={styles.winnersList}>
                {event.winners.map((w) => {
                  const medal = w.position === 1 ? '🥇' : w.position === 2 ? '🥈' : '🥉';
                  const posName = w.position === 1 ? '1st Place' : w.position === 2 ? '2nd Place' : '3rd Place';
                  const posColor = w.position === 1 ? '#D97706' : w.position === 2 ? '#64748B' : '#B45309';

                  return (
                    <View key={w.position} style={styles.winnerItemRow}>
                      <View style={styles.winnerMedalBox}>
                        <Text style={styles.winnerMedalText}>{medal}</Text>
                      </View>
                      <View style={styles.winnerInfoCol}>
                        <View style={styles.winnerPosRow}>
                          <Text style={[styles.winnerPosText, { color: posColor }]}>{posName}</Text>
                          {w.prize ? (
                            <Text style={styles.winnerPrizeBadge} numberOfLines={1}>{w.prize}</Text>
                          ) : null}
                        </View>
                        <Text style={styles.winnerNameText} numberOfLines={1}>{w.name}</Text>
                        {(w.rollNumber || w.branch) && (
                          <Text style={styles.winnerMetaText} numberOfLines={1}>
                            {[w.rollNumber, w.branch].filter(Boolean).join(' • ')}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </Card>
          )}

          {/* Event Evidence & Prize Distribution Photos Gallery */}
          {event.evidenceImages && event.evidenceImages.length > 0 && (
            <Card style={styles.evidenceCard}>
              <View style={styles.evidenceHeaderRow}>
                <Text style={{ fontSize: 20, marginRight: 8 }}>📸</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.evidenceHeaderTitle}>Event Highlights & Evidence</Text>
                  <Text style={styles.evidenceHeaderSub}>
                    {event.evidenceImages.length} Official Event Photo{event.evidenceImages.length > 1 ? 's' : ''}
                  </Text>
                </View>
              </View>

              <View style={styles.evidenceGrid}>
                {event.evidenceImages.map((imgUri: string, idx: number) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.evidenceThumbBox}
                    activeOpacity={0.85}
                    onPress={() => setSelectedPhoto(imgUri)}
                  >
                    <Image source={{ uri: imgUri }} style={styles.evidenceThumbImg} resizeMode="cover" />
                    <View style={styles.evidenceBadge}>
                      <Text style={styles.evidenceBadgeText}>#{idx + 1}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          )}

          {/* About Event Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About the Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Sticky Footer */}
      <View style={styles.footer}>
        {isCancelled ? (
          <Button 
            title="Event Cancelled" 
            onPress={() => {}} 
            disabled={true} 
            variant="danger" 
            size="lg"
          />
        ) : event.status === 'COMPLETED' ? (
          <Button 
            title="🏁 Event Completed (Registrations Closed)" 
            onPress={() => {}} 
            disabled={true} 
            variant="secondary" 
            size="lg"
            style={{ backgroundColor: '#064E3B', borderColor: '#064E3B' }}
          />
        ) : event.isRegistered ? (
          <Button 
            title="✓ You Are Registered" 
            onPress={() => {}} 
            disabled={true} 
            variant="success" 
            size="lg"
          />
        ) : (
          <Button 
            title="Register for Event" 
            onPress={handleRegister} 
            loading={registering}
            size="lg"
          />
        )}
      </View>

      {/* Fullscreen Photo Lightbox Modal */}
      <Modal
        visible={!!selectedPhoto}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={() => setSelectedPhoto(null)}
            activeOpacity={0.8}
          >
            <Text style={styles.modalCloseText}>✕ Close</Text>
          </TouchableOpacity>
          {selectedPhoto && (
            <Image source={{ uri: selectedPhoto }} style={styles.modalFullImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
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
    paddingBottom: spacing.xxxl * 2,
  },
  institutionHeader: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  institutionTag: {
    ...typography.caption,
    color: colors.primaryLight,
    letterSpacing: 1,
  },
  detailsContainer: {
    padding: spacing.lg,
  },
  titleSection: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.titleLarge,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  infoCard: {
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  infoIcon: {
    fontSize: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  infoValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    flexShrink: 1,
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: spacing.xs,
  },
  /* Winners Podium Card */
  winnersCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1.5,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  winnersHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: 10,
  },
  winnersTrophyIcon: {
    fontSize: 26,
  },
  winnersHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#92400E',
  },
  winnersHeaderSub: {
    fontSize: 11,
    color: '#B45309',
    fontWeight: '600',
  },
  winnersList: {
    gap: 8,
  },
  winnerItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radii.sm,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    gap: 10,
  },
  winnerMedalBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  winnerMedalText: {
    fontSize: 20,
  },
  winnerInfoCol: {
    flex: 1,
  },
  winnerPosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  winnerPosText: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  winnerPrizeBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 6,
    overflow: 'hidden',
  },
  winnerNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  winnerMetaText: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  /* Concluded Banner */
  concludedBanner: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  concludedBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 2,
  },
  concludedBannerSub: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 17,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxxl : spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
  },
  /* Poster Hero Styles */
  posterHeroBox: {
    width: '100%',
    height: 220,
    backgroundColor: '#0A2540',
    overflow: 'hidden',
  },
  posterHeroImage: {
    width: '100%',
    height: '100%',
  },
  /* Evidence Gallery Styles */
  evidenceCard: {
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  evidenceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  evidenceHeaderTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
  },
  evidenceHeaderSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  evidenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  evidenceThumbBox: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: radii.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  evidenceThumbImg: {
    width: '100%',
    height: '100%',
  },
  evidenceBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  evidenceBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  /* Lightbox Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  modalFullImage: {
    width: '100%',
    height: '80%',
  },
});

export default EventDetailsScreen;
