import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { getAdminEventDetails, getEventParticipants, updateEventWinners } from '../../api/adminEvents';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminEventWinners'>;

interface WinnerSlot {
  position: number;
  name: string;
  rollNumber: string;
  branch: string;
  prize: string;
  studentId?: string;
}

const AdminEventWinnersScreen: React.FC<Props> = ({ route, navigation }) => {
  const { eventId, eventTitle } = route.params;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);

  const [firstPlace, setFirstPlace] = useState<WinnerSlot>({
    position: 1,
    name: '',
    rollNumber: '',
    branch: '',
    prize: '1st Prize • Trophy + Certificate',
  });

  const [secondPlace, setSecondPlace] = useState<WinnerSlot>({
    position: 2,
    name: '',
    rollNumber: '',
    branch: '',
    prize: '2nd Prize • Silver Medal + Certificate',
  });

  const [thirdPlace, setThirdPlace] = useState<WinnerSlot>({
    position: 3,
    name: '',
    rollNumber: '',
    branch: '',
    prize: '3rd Prize • Bronze Medal + Certificate',
  });

  const [markAsCompleted, setMarkAsCompleted] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, [eventId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [eventRes, participantsRes] = await Promise.all([
        getAdminEventDetails(eventId),
        getEventParticipants(eventId),
      ]);

      if (eventRes.success && eventRes.data?.winners?.length > 0) {
        eventRes.data.winners.forEach((w: WinnerSlot) => {
          if (w.position === 1) setFirstPlace({ ...w, position: 1 });
          if (w.position === 2) setSecondPlace({ ...w, position: 2 });
          if (w.position === 3) setThirdPlace({ ...w, position: 3 });
        });
      }

      if (participantsRes.success && participantsRes.data?.participants) {
        setParticipants(participantsRes.data.participants);
      }
    } catch (err) {
      console.error('Failed to load event or participants for winners screen:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectParticipant = (participant: any, target: 1 | 2 | 3) => {
    const s = participant.student;
    const slotData = {
      name: s?.name || '',
      rollNumber: s?.rollNumber || '',
      branch: s?.branch || '',
      studentId: s?._id || '',
    };

    if (target === 1) setFirstPlace((prev) => ({ ...prev, ...slotData }));
    if (target === 2) setSecondPlace((prev) => ({ ...prev, ...slotData }));
    if (target === 3) setThirdPlace((prev) => ({ ...prev, ...slotData }));
  };

  const handleSubmitWinners = async () => {
    const winnersList: WinnerSlot[] = [];

    if (firstPlace.name.trim()) winnersList.push({ ...firstPlace, name: firstPlace.name.trim() });
    if (secondPlace.name.trim()) winnersList.push({ ...secondPlace, name: secondPlace.name.trim() });
    if (thirdPlace.name.trim()) winnersList.push({ ...thirdPlace, name: thirdPlace.name.trim() });

    if (winnersList.length === 0) {
      Alert.alert('No Winners Specified', 'Please provide at least 1st place winner before publishing.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await updateEventWinners(eventId, winnersList, markAsCompleted);
      if (res.success) {
        Alert.alert(
          markAsCompleted ? '🏆 Winners Announced & Event Completed!' : '🏆 Winners Published!',
          markAsCompleted
            ? 'Event winners have been officially announced, prize distribution is recorded, and this event is now marked as COMPLETED.'
            : 'Event winners have been officially announced and saved to the leaderboard. All registered students will receive a notification.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', res.error?.message || 'Failed to save winners');
      }
    } catch (error: any) {
      Alert.alert('Notice', error.response?.data?.error?.message || 'Failed to announce winners.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading winners manager...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#F8FAFC' }}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.headerBanner}>
          <Text style={styles.eventTitle}>{eventTitle}</Text>
          <Text style={styles.subtitle}>
            Select or enter the top 3 winners for this event. These will be highlighted on the student portal and institutional leaderboards.
          </Text>
        </View>

        {/* 1st Place Card */}
        <Card style={[styles.winnerCard, { borderColor: '#EAB308', borderWidth: 1.5 }]}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.trophyCircle, { backgroundColor: '#FEF08A' }]}>
              <Text style={{ fontSize: 20 }}>🥇</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.slotTitle, { color: '#A16207' }]}>1ST PLACE (GOLD WINNER)</Text>
              <Text style={styles.slotSubtitle}>Champion of the event</Text>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Winner Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Aditya Kumar"
              placeholderTextColor="#94A3B8"
              value={firstPlace.name}
              onChangeText={(t) => setFirstPlace((prev) => ({ ...prev, name: t }))}
            />
          </View>

          <View style={styles.rowTwoCols}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Text style={styles.label}>Roll No / Reg. ID</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 2401326385"
                placeholderTextColor="#94A3B8"
                value={firstPlace.rollNumber}
                onChangeText={(t) => setFirstPlace((prev) => ({ ...prev, rollNumber: t }))}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 6 }}>
              <Text style={styles.label}>Branch / Dept</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., CSE"
                placeholderTextColor="#94A3B8"
                value={firstPlace.branch}
                onChangeText={(t) => setFirstPlace((prev) => ({ ...prev, branch: t }))}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Prize / Award Details</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., ₹5,000 + Trophy"
              placeholderTextColor="#94A3B8"
              value={firstPlace.prize}
              onChangeText={(t) => setFirstPlace((prev) => ({ ...prev, prize: t }))}
            />
          </View>
        </Card>

        {/* 2nd Place Card */}
        <Card style={[styles.winnerCard, { borderColor: '#94A3B8', borderWidth: 1.2 }]}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.trophyCircle, { backgroundColor: '#E2E8F0' }]}>
              <Text style={{ fontSize: 20 }}>🥈</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.slotTitle, { color: '#475569' }]}>2ND PLACE (SILVER WINNER)</Text>
              <Text style={styles.slotSubtitle}>First runner-up</Text>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Winner Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Swikruti Panda"
              placeholderTextColor="#94A3B8"
              value={secondPlace.name}
              onChangeText={(t) => setSecondPlace((prev) => ({ ...prev, name: t }))}
            />
          </View>

          <View style={styles.rowTwoCols}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Text style={styles.label}>Roll No / Reg. ID</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 2401326386"
                placeholderTextColor="#94A3B8"
                value={secondPlace.rollNumber}
                onChangeText={(t) => setSecondPlace((prev) => ({ ...prev, rollNumber: t }))}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 6 }}>
              <Text style={styles.label}>Branch / Dept</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., ECE"
                placeholderTextColor="#94A3B8"
                value={secondPlace.branch}
                onChangeText={(t) => setSecondPlace((prev) => ({ ...prev, branch: t }))}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Prize / Award Details</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., ₹3,000 + Medal"
              placeholderTextColor="#94A3B8"
              value={secondPlace.prize}
              onChangeText={(t) => setSecondPlace((prev) => ({ ...prev, prize: t }))}
            />
          </View>
        </Card>

        {/* 3rd Place Card */}
        <Card style={[styles.winnerCard, { borderColor: '#D97706', borderWidth: 1.2 }]}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.trophyCircle, { backgroundColor: '#FED7AA' }]}>
              <Text style={{ fontSize: 20 }}>🥉</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.slotTitle, { color: '#B45309' }]}>3RD PLACE (BRONZE WINNER)</Text>
              <Text style={styles.slotSubtitle}>Second runner-up</Text>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Winner Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Student Name"
              placeholderTextColor="#94A3B8"
              value={thirdPlace.name}
              onChangeText={(t) => setThirdPlace((prev) => ({ ...prev, name: t }))}
            />
          </View>

          <View style={styles.rowTwoCols}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Text style={styles.label}>Roll No / Reg. ID</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 2401326387"
                placeholderTextColor="#94A3B8"
                value={thirdPlace.rollNumber}
                onChangeText={(t) => setThirdPlace((prev) => ({ ...prev, rollNumber: t }))}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 6 }}>
              <Text style={styles.label}>Branch / Dept</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., ME"
                placeholderTextColor="#94A3B8"
                value={thirdPlace.branch}
                onChangeText={(t) => setThirdPlace((prev) => ({ ...prev, branch: t }))}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Prize / Award Details</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., ₹2,000 + Certificate"
              placeholderTextColor="#94A3B8"
              value={thirdPlace.prize}
              onChangeText={(t) => setThirdPlace((prev) => ({ ...prev, prize: t }))}
            />
          </View>
        </Card>

        {/* Registered Participants Quick Picker */}
        {participants.length > 0 ? (
          <Card style={styles.quickPickCard}>
            <Text style={styles.quickPickTitle}>Quick Pick From Participants ({participants.length})</Text>
            <Text style={styles.quickPickSub}>Tap 1st, 2nd, or 3rd to auto-fill that student's details:</Text>
            {participants.slice(0, 10).map((p, i) => {
              const name = p.student?.name || 'Student';
              const roll = p.student?.rollNumber || '';
              return (
                <View key={p._id || i} style={styles.participantRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.participantName}>{name}</Text>
                    <Text style={styles.participantMeta}>
                      {roll ? `ID: ${roll}` : ''} {p.student?.branch ? `• ${p.student.branch}` : ''}
                    </Text>
                  </View>
                  <View style={styles.pickerBtnsGroup}>
                    <TouchableOpacity
                      style={[styles.miniPickBtn, { backgroundColor: '#FEF08A' }]}
                      onPress={() => handleSelectParticipant(p, 1)}
                    >
                      <Text style={styles.miniPickBtnText}>🥇 1st</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.miniPickBtn, { backgroundColor: '#E2E8F0' }]}
                      onPress={() => handleSelectParticipant(p, 2)}
                    >
                      <Text style={styles.miniPickBtnText}>🥈 2nd</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.miniPickBtn, { backgroundColor: '#FED7AA' }]}
                      onPress={() => handleSelectParticipant(p, 3)}
                    >
                      <Text style={styles.miniPickBtnText}>🥉 3rd</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </Card>
        ) : null}

        {/* Mark as Completed Toggle Card */}
        <TouchableOpacity
          style={styles.completedToggleCard}
          onPress={() => setMarkAsCompleted(!markAsCompleted)}
          activeOpacity={0.8}
        >
          <View style={[styles.toggleCheckbox, markAsCompleted && styles.toggleCheckboxActive]}>
            {markAsCompleted && <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>✓</Text>}
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.toggleTitle}>Mark Event as COMPLETED 🏁</Text>
            <Text style={styles.toggleSub}>
              Closes event registrations, logs prize distribution, and archives this event as successfully finished.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Action Button */}
        <Button
          title={markAsCompleted ? "🏆 Announce Winners & Complete Event" : "🏆 Announce & Publish Winners"}
          onPress={handleSubmitWinners}
          loading={submitting}
          size="lg"
          style={{ marginTop: spacing.md, marginBottom: spacing.xl }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  headerBanner: {
    backgroundColor: '#0E526B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#BAE6FD',
    lineHeight: 18,
  },
  winnerCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  trophyCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  slotSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  fieldGroup: {
    marginBottom: 10,
  },
  rowTwoCols: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 13,
    color: '#0F172A',
  },
  quickPickCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickPickTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  quickPickSub: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 12,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  participantName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  participantMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  pickerBtnsGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  miniPickBtn: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
  },
  miniPickBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  /* Completed Toggle Card */
  completedToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    marginBottom: 14,
  },
  toggleCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleCheckboxActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  toggleTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#065F46',
  },
  toggleSub: {
    fontSize: 11.5,
    color: '#047857',
    marginTop: 2,
    lineHeight: 16,
  },
});

export default AdminEventWinnersScreen;
