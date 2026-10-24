import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Image,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { getAdminEvents, getAdminDashboardSummary } from '../../api/adminEvents';
import { Event } from '../../api/events';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing } from '../../theme';
import { 
  PlusIcon, 
  EventsTabIcon, 
  QrScanIcon, 
  ClockIcon, 
  LocationPinIcon,
  ShieldIcon,
  ArrowRightIcon,
  PulseIcon,
  AttendanceTabIcon,
  UserIcon
} from '../../components/FormIcons';

type NavigationProp = NativeStackNavigationProp<AdminStackParamList>;

const AdminDashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [summary, setSummary] = useState({
    totalEvents: 0,
    publishedEvents: 0,
    draftEvents: 0,
    cancelledEvents: 0,
    totalStudents: 0,
    totalUsers: 0,
    totalRegistrations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [res, sumRes] = await Promise.all([
        getAdminEvents({ limit: 100 }),
        getAdminDashboardSummary().catch(() => null),
      ]);
      if (res.success) {
        setEvents(res.data);
      }
      if (sumRes && sumRes.success && sumRes.data) {
        setSummary(sumRes.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard events', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const onRefresh = () => {
    fetchStats(true);
  };

  const totalCount = summary.totalEvents || events.length;
  const publishedCount = summary.publishedEvents || events.filter(e => e.status === 'PUBLISHED').length;
  const draftCount = summary.draftEvents || events.filter(e => e.status === 'DRAFT').length;
  const studentsCount = summary.totalStudents || 0;
  const cancelledCount = summary.cancelledEvents || events.filter(e => e.status === 'CANCELLED').length;

  const recentEvents = events.slice(0, 3);
  const adminName = user?.name ? user.name.split(' ')[0] : 'Admin';

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar style="dark" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Connecting to GIET Admin Hub...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[colors.primary]} 
            tintColor={colors.primary}
          />
        }
      >
        {/* 1. Official College Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity 
            style={styles.brandGroup} 
            activeOpacity={0.8}
            onPress={() => fetchStats(true)}
          >
            <View style={styles.logoRing}>
              <Image
                source={require('../../../assets/giet-logo-transparent.png')}
                style={styles.collegeLogo}
                resizeMode="contain"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.collegeTitle} numberOfLines={1}>GIET (AUTONOMOUS)</Text>
              <Text style={styles.collegeSub} numberOfLines={1}>CAMPUS OPERATIONS HUB</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.liveStatusPill}
            onPress={() => fetchStats(true)}
            activeOpacity={0.7}
          >
            <View style={styles.liveDot} />
            <Text style={styles.liveStatusText}>LIVE OPS</Text>
          </TouchableOpacity>
        </View>

        {/* 2. Executive Command Banner */}
        <View style={styles.heroCard}>
          {/* Subtle Accent Glow */}
          <View style={styles.heroAccentTop} />
          
          <View style={styles.heroHeaderRow}>
            <View style={styles.heroBadge}>
              <ShieldIcon size={12} color="#38BDF8" />
              <Text style={styles.heroBadgeText}>ADMINISTRATOR CONTROL</Text>
            </View>
            <Text style={styles.heroSessionTag}>Odd Sem 2026</Text>
          </View>

          <Text style={styles.heroTitle} numberOfLines={1}>Welcome back, {adminName} 👋</Text>
          <Text style={styles.heroSubtitle}>
            Manage campus event schedules, view registered student roster, and declare event winners.
          </Text>

          {/* Quick Executive CTAs */}
          <View style={styles.heroCtaRow}>
            <TouchableOpacity 
              style={styles.heroPrimaryBtn}
              onPress={() => navigation.navigate('CreateEvent')}
              activeOpacity={0.85}
            >
              <PlusIcon size={16} color="#FFFFFF" />
              <Text style={styles.heroPrimaryBtnText}>Create Event</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.heroSecondaryBtn}
              onPress={() => (navigation as any).navigate('AdminUsers')}
              activeOpacity={0.85}
            >
              <UserIcon size={16} color="#38BDF8" />
              <Text style={styles.heroSecondaryBtnText} numberOfLines={1}>
                App Users ({studentsCount})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Institutional Wave Stripes */}
          <View style={styles.waveStripes}>
            <View style={[styles.stripe, { backgroundColor: '#DC2626' }]} />
            <View style={[styles.stripe, { backgroundColor: '#38BDF8' }]} />
          </View>
        </View>

        {/* 3. Compact Horizon KPI Deck (All 4 Columns Fully Clickable) */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricsHeader}>
            <View style={styles.metricsHeaderLeft}>
              <PulseIcon size={14} color="#0E526B" />
              <Text style={styles.metricsSectionTitle}>EVENT PIPELINE METRICS</Text>
            </View>
            <TouchableOpacity onPress={() => (navigation as any).navigate('Events')}>
              <Text style={styles.viewRosterLink}>View All Events →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.kpiPanel}>
            {/* Total Events */}
            <TouchableOpacity 
              style={styles.kpiCol}
              onPress={() => (navigation as any).navigate('Events')}
              activeOpacity={0.7}
            >
              <Text style={[styles.kpiNumber, { color: '#0E526B' }]}>{totalCount}</Text>
              <View style={styles.kpiLabelRow}>
                <View style={[styles.kpiDot, { backgroundColor: '#0E526B' }]} />
                <Text style={styles.kpiLabel} numberOfLines={1}>Events</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.kpiDivider} />

            {/* Published / Active */}
            <TouchableOpacity 
              style={styles.kpiCol}
              onPress={() => (navigation as any).navigate('Events')}
              activeOpacity={0.7}
            >
              <Text style={[styles.kpiNumber, { color: '#16A34A' }]}>{publishedCount}</Text>
              <View style={styles.kpiLabelRow}>
                <View style={[styles.kpiDot, { backgroundColor: '#16A34A' }]} />
                <Text style={styles.kpiLabel} numberOfLines={1}>Published</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.kpiDivider} />

            {/* App Users / Registered Students */}
            <TouchableOpacity 
              style={styles.kpiCol}
              onPress={() => (navigation as any).navigate('AdminUsers')}
              activeOpacity={0.7}
            >
              <Text style={[styles.kpiNumber, { color: '#2563EB' }]}>{studentsCount}</Text>
              <View style={styles.kpiLabelRow}>
                <View style={[styles.kpiDot, { backgroundColor: '#2563EB' }]} />
                <Text style={styles.kpiLabel} numberOfLines={1}>Users</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.kpiDivider} />

            {/* Drafts */}
            <TouchableOpacity 
              style={styles.kpiCol}
              onPress={() => (navigation as any).navigate('Events')}
              activeOpacity={0.7}
            >
              <Text style={[styles.kpiNumber, { color: '#D97706' }]}>{draftCount}</Text>
              <View style={styles.kpiLabelRow}>
                <View style={[styles.kpiDot, { backgroundColor: '#D97706' }]} />
                <Text style={styles.kpiLabel} numberOfLines={1}>Drafts</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Quick Operations Hub (2x2 Control Grid - Every tile is clickable) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Quick Operations Hub</Text>
          <Text style={styles.sectionSubBadge}>4 TOOLS</Text>
        </View>

        <View style={styles.commandGrid}>
          {/* Row 1 */}
          <View style={styles.commandRow}>
            {/* Create Event */}
            <TouchableOpacity 
              style={styles.commandCard}
              onPress={() => navigation.navigate('CreateEvent')}
              activeOpacity={0.8}
            >
              <View style={styles.commandCardTop}>
                <View style={[styles.commandIconBox, { backgroundColor: '#0E526B' }]}>
                  <PlusIcon size={18} color="#FFFFFF" />
                </View>
                <View style={[styles.miniBadge, { backgroundColor: '#E0F2FE' }]}>
                  <Text style={[styles.miniBadgeText, { color: '#0369A1' }]}>POSTER QR</Text>
                </View>
              </View>
              <Text style={styles.commandTitle} numberOfLines={1}>Create Event</Text>
              <Text style={styles.commandDesc} numberOfLines={2}>Generate notice QR & poster</Text>
            </TouchableOpacity>

            {/* App Users & Students */}
            <TouchableOpacity 
              style={styles.commandCard}
              onPress={() => (navigation as any).navigate('AdminUsers')}
              activeOpacity={0.8}
            >
              <View style={styles.commandCardTop}>
                <View style={[styles.commandIconBox, { backgroundColor: '#2563EB' }]}>
                  <UserIcon size={18} color="#FFFFFF" />
                </View>
                <View style={[styles.miniBadge, { backgroundColor: '#DBEAFE' }]}>
                  <Text style={[styles.miniBadgeText, { color: '#1D4ED8' }]}>{studentsCount} USERS</Text>
                </View>
              </View>
              <Text style={styles.commandTitle} numberOfLines={1}>App Users</Text>
              <Text style={styles.commandDesc} numberOfLines={2}>View all students & accounts</Text>
            </TouchableOpacity>
          </View>

          {/* Row 2 */}
          <View style={styles.commandRow}>
            {/* Manage Events & Winners */}
            <TouchableOpacity 
              style={styles.commandCard}
              onPress={() => (navigation as any).navigate('Events')}
              activeOpacity={0.8}
            >
              <View style={styles.commandCardTop}>
                <View style={[styles.commandIconBox, { backgroundColor: '#D97706' }]}>
                  <EventsTabIcon size={18} color="#FFFFFF" />
                </View>
                <View style={[styles.miniBadge, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[styles.miniBadgeText, { color: '#B45309' }]}>WINNERS</Text>
                </View>
              </View>
              <Text style={styles.commandTitle} numberOfLines={1}>Events & Winners</Text>
              <Text style={styles.commandDesc} numberOfLines={2}>1st, 2nd, 3rd place podium</Text>
            </TouchableOpacity>

            {/* Gate Attendance Scanner */}
            <TouchableOpacity 
              style={styles.commandCard}
              onPress={() => (navigation as any).navigate('Attendance')}
              activeOpacity={0.8}
            >
              <View style={styles.commandCardTop}>
                <View style={[styles.commandIconBox, { backgroundColor: '#059669' }]}>
                  <QrScanIcon size={18} color="#FFFFFF" />
                </View>
                <View style={[styles.miniBadge, { backgroundColor: '#DCFCE7' }]}>
                  <Text style={[styles.miniBadgeText, { color: '#15803D' }]}>GATE</Text>
                </View>
              </View>
              <Text style={styles.commandTitle} numberOfLines={1}>Gate Attendance</Text>
              <Text style={styles.commandDesc} numberOfLines={2}>Scan entry hall passes</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. Recent Campus Events */}
        <View style={styles.recentSectionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionHeading} numberOfLines={1}>Recent Campus Events</Text>
            <Text style={styles.sectionSubHeading} numberOfLines={1}>Click any event to manage participants & winners</Text>
          </View>
          <TouchableOpacity 
            style={styles.viewAllBtn}
            onPress={() => (navigation as any).navigate('Events')}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>View All ({events.length})</Text>
            <ArrowRightIcon size={13} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {recentEvents.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <EventsTabIcon size={24} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No Events Registered</Text>
            <Text style={styles.emptySub}>Tap 'Create Event' above to draft your first GIET campus event.</Text>
          </View>
        ) : (
          recentEvents.map((item) => {
            const isCancelled = item.status === 'CANCELLED';
            const isPublished = item.status === 'PUBLISHED';
            const hasWinners = item.winners && item.winners.length > 0;
            const d = new Date(item.date);
            const monthStr = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
            const dayNum = d.getDate();
            const weekday = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

            return (
              <TouchableOpacity
                key={item._id}
                style={styles.eventItemCard}
                onPress={() => navigation.navigate('AdminEventDetails', { eventId: item._id })}
                activeOpacity={0.85}
              >
                <View style={styles.eventItemMain}>
                  {/* Institutional Date Badge */}
                  <View style={styles.dateTile}>
                    <View style={styles.dateTileMonthBox}>
                      <Text style={styles.dateTileMonth}>{monthStr}</Text>
                    </View>
                    <Text style={styles.dateTileDay}>{dayNum}</Text>
                    <Text style={styles.dateTileWeekday}>{weekday}</Text>
                  </View>

                  {/* Event Info Column */}
                  <View style={styles.eventInfoCol}>
                    <View style={styles.statusRow}>
                      <Text 
                        style={[
                          styles.statusBadge,
                          isPublished ? styles.publishedBadge : isCancelled ? styles.cancelledBadge : styles.draftBadge
                        ]}
                      >
                        {item.status}
                      </Text>
                      {item.category && (
                        <Text style={styles.categoryBadge} numberOfLines={1}>{item.category.toUpperCase()}</Text>
                      )}
                      {hasWinners && (
                        <View style={styles.winnersTagBadge}>
                          <Text style={styles.winnersTagText}>🏆 WINNERS OUT</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.eventItemTitle} numberOfLines={1}>{item.title}</Text>

                    <View style={styles.metaRow}>
                      <ClockIcon size={12} color="#64748B" />
                      <Text style={styles.metaText} numberOfLines={1}>{item.startTime} {item.endTime ? `- ${item.endTime}` : ''}</Text>
                    </View>

                    <View style={styles.metaRow}>
                      <LocationPinIcon size={12} color="#64748B" />
                      <Text style={styles.metaText} numberOfLines={1}>{item.venue}</Text>
                    </View>
                  </View>
                </View>

                {/* Event Card Bottom Bar */}
                <View style={styles.eventCardFooter}>
                  <TouchableOpacity
                    style={styles.participantsBadgeBtn}
                    onPress={() => (navigation as any).navigate('AdminEventParticipants', { eventId: item._id, eventTitle: item.title })}
                  >
                    <Text style={styles.participantsBadgeText}>
                      👥 {item.registrationCount || 0} Registered
                    </Text>
                  </TouchableOpacity>
                  
                  <View style={styles.manageLinkGroup}>
                    <Text style={styles.manageLinkText}>Manage & Winners</Text>
                    <ArrowRightIcon size={12} color={colors.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* 6. Campus Security Notice Card (Clickable to Gate Attendance) */}
        <TouchableOpacity 
          style={styles.securityNoticeCard}
          onPress={() => (navigation as any).navigate('Attendance')}
          activeOpacity={0.8}
        >
          <View style={styles.noticeIconBox}>
            <ShieldIcon size={20} color="#0E526B" />
          </View>
          <View style={styles.noticeTextBox}>
            <Text style={styles.noticeTitle}>Autonomous Gate Verification Station</Text>
            <Text style={styles.noticeDesc}>
              Tap here to launch the hall pass barcode scanner for check-in on event day.
            </Text>
          </View>
          <ArrowRightIcon size={14} color="#0E526B" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
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
    fontWeight: '600',
  },

  /* 1. Header */
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 12,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  collegeLogo: {
    width: 32,
    height: 32,
  },
  collegeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0E526B',
    letterSpacing: 0.5,
  },
  collegeSub: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  liveStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 16,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  liveStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.5,
  },

  /* 2. Hero Executive Card */
  heroCard: {
    backgroundColor: '#0A2540',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  heroAccentTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#187393',
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  heroBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.6,
  },
  heroSessionTag: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 12.5,
    color: '#CBD5E1',
    lineHeight: 18,
    marginBottom: 14,
  },
  heroCtaRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  heroPrimaryBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#187393',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
    shadowColor: '#187393',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  heroPrimaryBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroSecondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  heroSecondaryBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  waveStripes: {
    flexDirection: 'row',
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  stripe: {
    flex: 1,
    height: '100%',
  },

  /* 3. Horizon Metrics Card */
  metricsContainer: {
    marginBottom: 20,
  },
  metricsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricsSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.8,
  },
  viewRosterLink: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.primary,
  },
  kpiPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  kpiCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiNumber: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 3,
  },
  kpiLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  kpiDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  kpiDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#F1F5F9',
  },

  /* 4. Quick Operations Hub (2x2 Grid) */
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  sectionSubHeading: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  sectionSubBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    letterSpacing: 0.5,
  },
  commandGrid: {
    gap: 10,
    marginBottom: 22,
  },
  commandRow: {
    flexDirection: 'row',
    gap: 10,
  },
  commandCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  commandCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commandIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  miniBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  commandTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  commandDesc: {
    fontSize: 10.5,
    color: '#64748B',
    lineHeight: 14,
  },

  /* 5. Recent Events */
  recentSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewAllText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  eventItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  eventItemMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dateTile: {
    width: 48,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  dateTileMonthBox: {
    width: '100%',
    backgroundColor: '#DC2626',
    paddingVertical: 2.5,
    alignItems: 'center',
  },
  dateTileMonth: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  dateTileDay: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0E526B',
    marginTop: 2,
  },
  dateTileWeekday: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 3,
  },
  eventInfoCol: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statusBadge: {
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  publishedBadge: {
    color: '#16A34A',
    backgroundColor: '#DCFCE7',
  },
  draftBadge: {
    color: '#D97706',
    backgroundColor: '#FEF3C7',
  },
  cancelledBadge: {
    color: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  categoryBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0284C7',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  eventItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  metaText: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
  },
  eventCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 10,
    paddingTop: 8,
  },
  capacityLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  capacityValue: {
    fontWeight: '700',
    color: '#334155',
  },
  manageLinkGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  manageLinkText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.primary,
  },

  /* Empty State */
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F6',
    marginBottom: 16,
  },
  emptyIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 240,
  },

  /* 6. Campus Security Notice */
  securityNoticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F9FB',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D2EDF6',
    marginTop: 10,
    gap: 10,
  },
  noticeIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noticeTextBox: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0E526B',
    marginBottom: 2,
  },
  noticeDesc: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 15,
  },
  winnersTagBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  winnersTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#B45309',
  },
  participantsBadgeBtn: {
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  participantsBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
});

export default AdminDashboardScreen;
