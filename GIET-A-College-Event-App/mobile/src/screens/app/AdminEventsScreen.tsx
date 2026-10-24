import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  TextInput 
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
  PlusIcon, 
  SearchIcon, 
  ClockIcon, 
  LocationPinIcon, 
  EventsTabIcon 
} from '../../components/FormIcons';

type NavigationProp = NativeStackNavigationProp<AdminStackParamList>;

const STATUS_FILTERS = ['ALL', 'PUBLISHED', 'COMPLETED', 'DRAFT', 'CANCELLED'];

const AdminEventsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEvents = async () => {
    try {
      const res = await getAdminEvents({ limit: 100 });
      if (res.success) {
        setEvents(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch admin events', error);
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

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
      const matchesSearch = !searchQuery.trim() || 
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.category && e.category.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [events, statusFilter, searchQuery]);

  const renderItem = ({ item }: { item: Event }) => {
    const d = new Date(item.date);
    const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const day = d.getDate();
    const isCancelled = item.status === 'CANCELLED';
    const isPublished = item.status === 'PUBLISHED';
    const isCompleted = item.status === 'COMPLETED';

    return (
      <TouchableOpacity 
        style={styles.eventCard}
        onPress={() => navigation.navigate('AdminEventDetails', { eventId: item._id })}
        activeOpacity={0.8}
      >
        <View style={styles.cardTopRow}>
          {/* Date Badge */}
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
                  isCompleted ? styles.completedTag : isPublished ? styles.publishedTag : isCancelled ? styles.cancelledTag : styles.draftTag
                ]}
              >
                {isCompleted ? '🏁 COMPLETED' : item.status}
              </Text>
              {item.category && (
                <Text style={styles.categoryTag}>{item.category.toUpperCase()}</Text>
              )}
            </View>

            <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>

            <View style={styles.metaRow}>
              <ClockIcon size={12} color="#64748B" />
              <Text style={styles.metaText}>{item.startTime} - {item.endTime}</Text>
            </View>

            <View style={styles.metaRow}>
              <LocationPinIcon size={12} color="#64748B" />
              <Text style={styles.metaText} numberOfLines={1}>{item.venue}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardFooter}>
          <Text style={styles.capacityText}>
            Seats: <Text style={styles.capacityHighlight}>{item.capacity ? `${item.capacity} capacity` : 'Unlimited'}</Text>
          </Text>
          <View style={styles.manageBtn}>
            <Text style={styles.manageText}>Manage Event</Text>
            <Text style={styles.manageArrow}>→</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading event management list...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Search Input Bar */}
      <View style={styles.searchBarWrapper}>
        <View style={styles.searchBox}>
          <SearchIcon size={17} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events by title, venue..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>

        <TouchableOpacity 
          style={styles.createIconButton}
          onPress={() => navigation.navigate('CreateEvent')}
          activeOpacity={0.8}
        >
          <PlusIcon size={18} color="#FFFFFF" />
          <Text style={styles.createBtnLabel}>New Event</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        {STATUS_FILTERS.map(status => {
          const isActive = statusFilter === status;
          const count = status === 'ALL' 
            ? events.length 
            : events.filter(e => e.status === status).length;

          return (
            <TouchableOpacity
              key={status}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setStatusFilter(status)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {status} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filteredEvents}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[colors.primary]} 
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <EmptyState 
              icon="📋"
              title="No Events Found"
              message={searchQuery ? 'No events matched your search.' : `No events currently marked as ${statusFilter}.`}
              actionTitle="+ Create Event"
              onAction={() => navigation.navigate('CreateEvent')}
            />
          </View>
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
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 8,
    fontSize: 13.5,
    color: '#0F172A',
  },
  createIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#187393',
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#187393',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  createBtnLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#0E526B',
    borderColor: '#0E526B',
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 48,
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
  cardTopRow: {
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
    marginBottom: 3,
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
  completedTag: {
    color: '#0D9488',
    backgroundColor: '#CCFBF1',
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
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  metaText: {
    fontSize: 11.5,
    color: '#64748B',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  capacityText: {
    fontSize: 12,
    color: '#64748B',
  },
  capacityHighlight: {
    fontWeight: '700',
    color: '#0F172A',
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  manageText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.primary,
  },
  manageArrow: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyWrap: {
    paddingVertical: 32,
  },
});

export default AdminEventsScreen;
