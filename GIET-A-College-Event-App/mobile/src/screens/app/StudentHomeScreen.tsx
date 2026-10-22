import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl, 
  TextInput, 
  TouchableOpacity,
  Image,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getEvents, Event } from '../../api/events';
import { getProfile } from '../../api/profile';
import { StudentStackParamList } from '../../navigation/StudentNavigator';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from '../../components/NotificationBell';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { colors, spacing } from '../../theme';
import { 
  SearchIcon, 
  LocationPinIcon, 
  ClockIcon, 
  TicketTabIcon, 
  EventsTabIcon, 
  UserTabIcon 
} from '../../components/FormIcons';

const CATEGORIES = ['All', 'Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar'];

const StudentHomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentStackParamList>>();
  const { user, updateUser } = useAuth();
  
  const [profile, setProfile] = useState<any>(user || null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchUpcomingEvents = async () => {
    try {
      setError(false);
      const response = await getEvents({ limit: 20 });
      if (response.success) {
        setEvents(response.data);
      }
    } catch (err) {
      console.error('Failed to load upcoming events', err);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStudentProfile = async () => {
    try {
      const res = await getProfile();
      if (res.success && res.data) {
        setProfile(res.data);
        updateUser(res.data);
      }
    } catch (err) {
      // Keep existing context user
    }
  };

  useEffect(() => {
    fetchUpcomingEvents();
    fetchStudentProfile();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchStudentProfile();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchUpcomingEvents();
    fetchStudentProfile();
  };

  // Filter events based on search query and category
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchesSearch = 
        !searchQuery.trim() ||
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ev.category && ev.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (ev.organizer && ev.organizer.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = 
        selectedCategory === 'All' || 
        (ev.category && ev.category.toLowerCase() === selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [events, searchQuery, selectedCategory]);

  const featuredEvent = filteredEvents.length > 0 ? filteredEvents[0] : null;
  const remainingEvents = filteredEvents.length > 1 ? filteredEvents.slice(1) : [];

  // Calculate friendly greeting & student's FIRST NAME
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  // Display FIRST NAME only (e.g. "Aditya" from "Aditya Kumar Choudhary")
  const studentFirstName = useMemo(() => {
    const rawName = profile?.name || user?.name;
    if (rawName && typeof rawName === 'string' && rawName.trim()) {
      const parts = rawName.trim().split(/\s+/);
      if (parts.length > 0 && parts[0]) {
        return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      }
    }
    // Fallback
    return 'Student';
  }, [profile, user]);

  const studentInitial = useMemo(() => {
    if (profile?.name?.trim()) return profile.name.trim().charAt(0).toUpperCase();
    if (user?.name?.trim()) return user.name.trim().charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'S';
  }, [profile, user]);

  const studentRoll = profile?.rollNumber || user?.rollNumber;
  const studentCourse = profile?.course || user?.course || 'B.Tech';
  const studentBranch = profile?.branch || user?.branch || 'CSE';
  const studentYear = profile?.year || user?.year || '3rd Year';

  const renderEventCard = ({ item }: { item: Event }) => {
    const d = new Date(item.date);
    const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const day = d.getDate();
    const isCancelled = item.status === 'CANCELLED';

    return (
      <TouchableOpacity
        style={styles.eventItemCard}
        onPress={() => navigation.navigate('EventDetails', { eventId: item._id })}
        activeOpacity={0.8}
      >
        {/* Date Tile */}
        <View style={styles.dateTile}>
          <Text style={styles.dateTileMonth}>{month}</Text>
          <Text style={styles.dateTileDay}>{day}</Text>
        </View>

        {/* Info */}
        <View style={styles.eventInfoCol}>
          <View style={styles.categoryRow}>
            {item.category ? (
              <Text style={styles.categoryTag}>{item.category.toUpperCase()}</Text>
            ) : null}
            {isCancelled && <Text style={styles.cancelledTag}>CANCELLED</Text>}
          </View>
          
          <Text style={styles.eventCardTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.eventCardMeta}>
            <ClockIcon size={13} color="#64748B" />
            <Text style={styles.eventCardMetaText}>{item.startTime}</Text>
            <Text style={styles.metaDot}>•</Text>
            <LocationPinIcon size={13} color="#64748B" />
            <Text style={styles.eventCardMetaText} numberOfLines={1}>
              {item.venue}
            </Text>
          </View>
        </View>

        <Text style={styles.cardArrow}>›</Text>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <View style={styles.headerContainer}>
      {/* 1. Official College Header Bar */}
      <View style={styles.collegeHeader}>
        <View style={styles.collegeBrandCol}>
          <Image
            source={require('../../../assets/giet-logo-transparent.png')}
            style={styles.collegeLogo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.collegeName}>GIET (AUTONOMOUS)</Text>
            <Text style={styles.collegeSub}>Campus Events Portal • NAAC 'A+'</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <NotificationBell />
        </View>
      </View>

      {/* 2. Personalized Student Welcome & Academic Pill */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeGreeting}>
          {greeting}, <Text style={styles.welcomeName}>{studentFirstName}</Text> 👋
        </Text>
        <Text style={styles.welcomeSub}>
          Discover events, workshops, and fests across the campus.
        </Text>

        {/* Verified Student Badge */}
        <View style={styles.studentBadge}>
          <View style={styles.verifiedDot} />
          <Text style={styles.studentBadgeText} numberOfLines={1}>
            {[
              studentRoll ? `ID: ${studentRoll}` : null,
              studentCourse,
              studentBranch,
              studentYear
            ].filter(Boolean).join(' • ')}
          </Text>
        </View>
      </View>

      {/* 3. Quick Action Shortcuts (2 Cards) */}
      <View style={styles.shortcutsRow}>
        <TouchableOpacity
          style={styles.shortcutCard}
          onPress={() => (navigation as any).navigate('Registrations')}
          activeOpacity={0.8}
        >
          <View style={[styles.shortcutIconBox, { backgroundColor: '#E0F2FE' }]}>
            <TicketTabIcon size={20} color={colors.primary} />
          </View>
          <View style={styles.shortcutTextCol}>
            <Text style={styles.shortcutTitle}>My Passes</Text>
            <Text style={styles.shortcutSub}>Active QR</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shortcutCard}
          onPress={() => (navigation as any).navigate('Events')}
          activeOpacity={0.8}
        >
          <View style={[styles.shortcutIconBox, { backgroundColor: '#FEF3C7' }]}>
            <EventsTabIcon size={20} color="#D97706" />
          </View>
          <View style={styles.shortcutTextCol}>
            <Text style={styles.shortcutTitle}>All Events</Text>
            <Text style={styles.shortcutSub}>Full Schedule</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 4. Modern Search Bar */}
      <View style={styles.searchBar}>
        <SearchIcon size={18} color="#94A3B8" />
        <TextInput
          placeholder="Search events, workshops, venues..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearSearchText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 5. Horizontal Category Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.7}
            >
              <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 6. Featured Event Banner Card */}
      {featuredEvent && (
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Featured Highlight</Text>
            <View style={styles.highlightBadge}>
              <Text style={styles.highlightBadgeText}>MUST ATTEND</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.featuredCard}
            onPress={() => navigation.navigate('EventDetails', { eventId: featuredEvent._id })}
            activeOpacity={0.9}
          >
            {/* Top Tag Row */}
            <View style={styles.featuredTopRow}>
              <View style={styles.featuredPill}>
                <Text style={styles.featuredPillText}>GIET CAMPUS EVENT</Text>
              </View>
              {featuredEvent.category && (
                <View style={styles.featuredCategoryPill}>
                  <Text style={styles.featuredCategoryText}>
                    {featuredEvent.category.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            {/* Title */}
            <Text style={styles.featuredTitle} numberOfLines={2}>
              {featuredEvent.title}
            </Text>

            {/* Meta */}
            <View style={styles.featuredMetaRow}>
              <View style={styles.featuredMetaItem}>
                <ClockIcon size={14} color="#E0F2FE" />
                <Text style={styles.featuredMetaText}>
                  {new Date(featuredEvent.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })} • {featuredEvent.startTime}
                </Text>
              </View>
              <View style={styles.featuredMetaItem}>
                <LocationPinIcon size={14} color="#E0F2FE" />
                <Text style={styles.featuredMetaText} numberOfLines={1}>
                  {featuredEvent.venue}
                </Text>
              </View>
            </View>

            {/* Bottom Dual Wave Accent Stripes */}
            <View style={styles.waveStripes}>
              <View style={[styles.stripe, { backgroundColor: '#DC2626' }]} />
              <View style={[styles.stripe, { backgroundColor: '#38BDF8' }]} />
            </View>

            {/* Action Bar */}
            <View style={styles.featuredActionBar}>
              <Text style={styles.featuredActionText}>View Details & Register</Text>
              <Text style={styles.featuredActionArrow}>→</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* 7. Upcoming Events Header */}
      <View style={styles.upcomingHeaderRow}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === 'All' ? 'Upcoming Campus Events' : `${selectedCategory} Events`}
        </Text>
        <TouchableOpacity onPress={() => (navigation as any).navigate('Events')}>
          <Text style={styles.viewAllText}>View All ({events.length}) →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar style="dark" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading campus events...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && events.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar style="dark" />
        <View style={styles.center}>
          <ErrorState onRetry={fetchUpcomingEvents} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <FlatList
        data={remainingEvents.length > 0 ? remainingEvents : featuredEvent ? [] : []}
        keyExtractor={(item) => item._id}
        renderItem={renderEventCard}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          !featuredEvent ? (
            <View style={styles.emptyContainer}>
              <EmptyState
                icon="📅"
                title={searchQuery ? 'No Matching Events' : 'No Events Scheduled'}
                message={
                  searchQuery 
                    ? `No events found matching "${searchQuery}". Try a different keyword.` 
                    : 'Check back soon for upcoming seminars, sports meets, and cultural festivals.'
                }
                actionTitle="Refresh Schedule"
                onAction={fetchUpcomingEvents}
              />
            </View>
          ) : null
        }
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
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 48,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: spacing.md,
    fontWeight: '500',
  },
  headerContainer: {
    marginBottom: 8,
  },

  /* 1. Official College Header Bar */
  collegeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 12,
  },
  collegeBrandCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  collegeLogo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  collegeName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0E526B',
    letterSpacing: 0.6,
  },
  collegeSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  /* 2. Welcome Section */
  welcomeSection: {
    marginBottom: 16,
  },
  welcomeGreeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  welcomeName: {
    color: colors.primary,
  },
  welcomeSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 18,
  },
  studentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4F8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  verifiedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  studentBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0E526B',
  },

  /* 3. Shortcuts Row (2 Cards) */
  shortcutsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  shortcutCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  shortcutIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  shortcutTextCol: {
    flex: 1,
  },
  shortcutTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  shortcutSub: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 2,
  },

  /* 4. Search Bar */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  clearSearchText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },

  /* 5. Categories */
  categoryScroll: {
    paddingBottom: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* 6. Featured Card */
  featuredSection: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  highlightBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  highlightBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.6,
  },
  featuredCard: {
    backgroundColor: '#0E526B', // Deep institutional teal
    borderRadius: 18,
    padding: 18,
    shadowColor: '#0E526B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  featuredTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  featuredPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featuredPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  featuredCategoryPill: {
    backgroundColor: '#187393',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  featuredCategoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E0F2FE',
  },
  featuredTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 25,
    marginBottom: 12,
  },
  featuredMetaRow: {
    marginBottom: 14,
    gap: 6,
  },
  featuredMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featuredMetaText: {
    fontSize: 12.5,
    color: '#E0F2FE',
    fontWeight: '500',
  },
  waveStripes: {
    flexDirection: 'row',
    height: 3,
    marginBottom: 12,
    borderRadius: 2,
    overflow: 'hidden',
  },
  stripe: {
    flex: 1,
    height: '100%',
  },
  featuredActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  featuredActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  featuredActionArrow: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* 7. Upcoming Events */
  upcomingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 12.5,
    color: colors.primary,
    fontWeight: '700',
  },

  /* Event Item Card */
  eventItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
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
  eventInfoCol: {
    flex: 1,
    marginRight: 6,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  categoryTag: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  cancelledTag: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#DC2626',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 4,
    borderRadius: 3,
  },
  eventCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    lineHeight: 18,
  },
  eventCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventCardMetaText: {
    fontSize: 11,
    color: '#64748B',
    maxWidth: 130,
  },
  metaDot: {
    fontSize: 11,
    color: '#CBD5E1',
    marginHorizontal: 2,
  },
  cardArrow: {
    fontSize: 22,
    color: '#94A3B8',
    fontWeight: '400',
    marginLeft: 4,
  },

  emptyContainer: {
    paddingVertical: 20,
  },
});

export default StudentHomeScreen;
