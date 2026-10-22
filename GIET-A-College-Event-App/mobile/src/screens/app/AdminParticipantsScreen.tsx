import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl,
  TouchableOpacity,
  Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { getAdminEvents } from '../../api/adminEvents';
import { Event } from '../../api/events';
import { EmptyState } from '../../components/EmptyState';
import { colors, spacing } from '../../theme';
import { 
  QrScanIcon, 
  ClockIcon, 
  LocationPinIcon, 
  AttendanceTabIcon 
} from '../../components/FormIcons';

type NavigationProp = NativeStackNavigationProp<AdminStackParamList>;

const AdminParticipantsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await getAdminEvents({ limit: 100 });
      if (res.success) {
        setEvents(res.data);
      }
    } catch (error) {
      console.error('Failed to load events for participants screen', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const renderEventItem = ({ item }: { item: Event }) => {
    const isPublished = item.status === 'PUBLISHED';
    const isCancelled = item.status === 'CANCELLED';
    const d = new Date(item.date);
    const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const day = d.getDate();

    return (
      <View style={styles.eventCard}>
        <TouchableOpacity
          style={styles.cardMain}
          onPress={() => navigation.navigate('AdminEventDetails', { eventId: item._id })}
          activeOpacity={0.8}
        >
          {/* Date Tile */}
          <View style={styles.dateTile}>
            <Text style={styles.dateTileMonth}>{month}</Text>
            <Text style={styles.dateTileDay}>{day}</Text>
          </View>

          {/* Details */}
          <View style={styles.cardDetailsCol}>
            <View style={styles.statusRow}>
              <Text 
                style={[
                  styles.statusTag,
                  isPublished ? styles.publishedTag : isCancelled ? styles.cancelledTag : styles.draftTag
                ]}
              >
                {item.status}
              </Text>
              {item.category && (
                <Text style={styles.categoryTag}>{item.category.toUpperCase()}</Text>
              )}
            </View>

            <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>

            <View style={styles.metaRow}>
              <LocationPinIcon size={12} color="#64748B" />
              <Text style={styles.metaText} numberOfLines={1}>{item.venue}</Text>
              <Text style={styles.metaDot}>•</Text>
              <ClockIcon size={12} color="#64748B" />
              <Text style={styles.metaText}>{item.startTime}</Text>
            </View>

            <Text style={styles.capacityText}>
              Hall Capacity: <Text style={styles.capacityHighlight}>{item.capacity ? `${item.capacity} seats` : 'Unlimited'}</Text>
            </Text>
          </View>
        </TouchableOpacity>

        {/* Action Row */}
        <View style={styles.cardDivider} />
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={styles.rosterBtn}
            onPress={() => navigation.navigate('AdminEventDetails', { eventId: item._id })}
            activeOpacity={0.7}
          >
            <AttendanceTabIcon size={16} color="#0E526B" />
            <Text style={styles.rosterBtnText}>View Attendee Roster</Text>
          </TouchableOpacity>

          {isPublished && (
            <TouchableOpacity
              style={styles.scanBtn}
              onPress={() => navigation.navigate('ScanAttendance', { eventId: item._id })}
              activeOpacity={0.85}
            >
              <QrScanIcon size={16} color="#FFFFFF" />
              <Text style={styles.scanBtnText}>Scan QR</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading participant rosters...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={events}
        keyExtractor={(item) => item._id}
        renderItem={renderEventItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerBox}>
            <View style={styles.headerTopRow}>
              <View style={styles.headerIconCircle}>
                <AttendanceTabIcon size={20} color="#0E526B" />
              </View>
              <View style={styles.headerTextGroup}>
                <Text style={styles.headerTitle}>Attendance & Check-In Roster</Text>
                <Text style={styles.headerSubtitle}>
                  Scan student QR event passes at hall doors or inspect registered participants.
                </Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <EmptyState
              icon="👥"
              title="No Campus Events"
              message="Create a new event from the dashboard to start tracking registrations and attendance."
              actionTitle="+ Create Event"
              onAction={() => navigation.navigate('CreateEvent')}
            />
          </View>
        }
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[colors.primary]} 
            tintColor={colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: spacing.md,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 48,
  },
  headerBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextGroup: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardMain: {
    flexDirection: 'row',
  },
  dateTile: {
    width: 48,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#F0F9FB',
    borderWidth: 1,
    borderColor: '#D2EDF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dateTileMonth: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0E526B',
    letterSpacing: 0.5,
  },
  dateTileDay: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 1,
  },
  cardDetailsCol: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  statusTag: {
    fontSize: 9.5,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  publishedTag: {
    color: '#16A34A',
    backgroundColor: '#DCFCE7',
  },
  draftTag: {
    color: '#D97706',
    backgroundColor: '#FEF3C7',
  },
  cancelledTag: {
    color: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  categoryTag: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.primary,
  },
  eventTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 11.5,
    color: '#64748B',
    maxWidth: 140,
  },
  metaDot: {
    fontSize: 11,
    color: '#CBD5E1',
    marginHorizontal: 2,
  },
  capacityText: {
    fontSize: 11.5,
    color: '#64748B',
  },
  capacityHighlight: {
    fontWeight: '700',
    color: '#0F172A',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rosterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rosterBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0E526B',
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#187393',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    shadowColor: '#187393',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  scanBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emptyWrap: {
    paddingVertical: 32,
  },
});

export default AdminParticipantsScreen;
