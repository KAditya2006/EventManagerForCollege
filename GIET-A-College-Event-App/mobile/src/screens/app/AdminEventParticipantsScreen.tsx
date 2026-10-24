import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { getEventParticipants } from '../../api/adminEvents';
import { EmptyState } from '../../components/EmptyState';
import { colors, spacing } from '../../theme';
import { SearchIcon, LocationPinIcon, ClockIcon } from '../../components/FormIcons';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminEventParticipants'>;

interface ParticipantItem {
  _id: string;
  student: {
    _id: string;
    name?: string;
    email: string;
    rollNumber?: string;
    phone?: string;
    course?: string;
    branch?: string;
    year?: string;
    semester?: string;
    section?: string;
  };
  checkedIn: boolean;
  checkedInAt?: string;
  status: string;
  createdAt: string;
}

const AdminEventParticipantsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { eventId, eventTitle } = route.params;

  const [participants, setParticipants] = useState<ParticipantItem[]>([]);
  const [eventData, setEventData] = useState<any>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [checkedInCount, setCheckedInCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchParticipants = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getEventParticipants(eventId);
      if (res.success && res.data) {
        setEventData(res.data.event);
        setParticipants(res.data.participants);
        setTotalCount(res.data.totalRegistrations);
        setCheckedInCount(res.data.checkedInCount);
      }
    } catch (error) {
      console.error('Failed to fetch event participants:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  const onRefresh = () => fetchParticipants(true);

  const filteredParticipants = participants.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const s = p.student;
    return (
      (s?.name && s.name.toLowerCase().includes(q)) ||
      (s?.rollNumber && s.rollNumber.toLowerCase().includes(q)) ||
      (s?.branch && s.branch.toLowerCase().includes(q)) ||
      (s?.email && s.email.toLowerCase().includes(q))
    );
  });

  const renderItem = ({ item, index }: { item: ParticipantItem; index: number }) => {
    const s = item.student;
    const name = s?.name || 'Student';
    const initial = name.charAt(0).toUpperCase();
    const academicInfo = [s?.rollNumber ? `ID: ${s.rollNumber}` : null, s?.course, s?.branch, s?.year]
      .filter(Boolean)
      .join(' • ');

    const registeredDate = new Date(item.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>

          <View style={styles.headerInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.studentName} numberOfLines={1}>{name}</Text>
              <View style={[styles.badge, item.checkedIn ? styles.badgeCheckedIn : styles.badgePending]}>
                <Text style={[styles.badgeText, item.checkedIn ? styles.badgeCheckedInText : styles.badgePendingText]}>
                  {item.checkedIn ? 'Checked-In ✓' : 'Registered'}
                </Text>
              </View>
            </View>

            <Text style={styles.studentEmail} numberOfLines={1}>{s?.email}</Text>
          </View>
        </View>

        {academicInfo ? (
          <View style={styles.academicPill}>
            <Text style={styles.academicText} numberOfLines={1}>{academicInfo}</Text>
          </View>
        ) : null}

        <View style={styles.cardFooter}>
          <View style={styles.footerCol}>
            <Text style={styles.footerLabel}>Registered On</Text>
            <Text style={styles.footerValue}>{registeredDate}</Text>
          </View>

          {s?.phone ? (
            <View style={styles.footerCol}>
              <Text style={styles.footerLabel}>Phone</Text>
              <Text style={styles.footerValue}>{s.phone}</Text>
            </View>
          ) : null}

          {item.checkedIn && item.checkedInAt ? (
            <View style={styles.footerCol}>
              <Text style={styles.footerLabel}>Checked In At</Text>
              <Text style={[styles.footerValue, { color: '#16A34A' }]}>
                {new Date(item.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Event Top Banner */}
      <View style={styles.eventBanner}>
        <Text style={styles.eventBannerTitle} numberOfLines={1}>{eventTitle || eventData?.title || 'Event'}</Text>
        <View style={styles.kpiRow}>
          <View style={styles.kpiCol}>
            <Text style={styles.kpiNumber}>{totalCount}</Text>
            <Text style={styles.kpiLabel}>Total Registered</Text>
          </View>
          <View style={styles.kpiDivider} />
          <View style={styles.kpiCol}>
            <Text style={[styles.kpiNumber, { color: '#16A34A' }]}>{checkedInCount}</Text>
            <Text style={styles.kpiLabel}>Checked In</Text>
          </View>
          <View style={styles.kpiDivider} />
          <View style={styles.kpiCol}>
            <Text style={[styles.kpiNumber, { color: '#D97706' }]}>{totalCount - checkedInCount}</Text>
            <Text style={styles.kpiLabel}>Pending</Text>
          </View>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <SearchIcon size={18} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Filter by Name, Roll No, Branch..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.trim().length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearBtn}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading participants roster...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredParticipants}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No Participants Found"
              message={
                searchQuery.trim()
                  ? `No students matching "${searchQuery}".`
                  : 'No students have registered for this event yet.'
              }
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingTop: 8,
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
  eventBanner: {
    backgroundColor: '#0E526B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#0E526B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  eventBannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  kpiRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  kpiCol: {
    flex: 1,
    alignItems: 'center',
  },
  kpiNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  kpiLabel: {
    fontSize: 10,
    color: '#BAE6FD',
    fontWeight: '600',
    marginTop: 2,
  },
  kpiDivider: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#0F172A',
    height: '100%',
  },
  clearBtn: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0E526B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  badgeCheckedIn: {
    backgroundColor: '#DCFCE7',
  },
  badgePending: {
    backgroundColor: '#E0F2FE',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  badgeCheckedInText: {
    color: '#16A34A',
  },
  badgePendingText: {
    color: '#0284C7',
  },
  studentEmail: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  academicPill: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  academicText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0E526B',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  footerCol: {
    alignItems: 'flex-start',
  },
  footerLabel: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  footerValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginTop: 1,
  },
});

export default AdminEventParticipantsScreen;
