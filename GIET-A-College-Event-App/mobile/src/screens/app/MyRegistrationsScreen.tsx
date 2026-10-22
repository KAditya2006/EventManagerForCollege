import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getMyRegistrations, Registration } from '../../api/registrations';
import { StudentStackParamList } from '../../navigation/StudentNavigator';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { colors, spacing, typography } from '../../theme';

const MyRegistrationsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentStackParamList>>();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRegistrations = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const response = await getMyRegistrations();
      if (response.success) {
        setRegistrations(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch registrations', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRegistrations();
    }, [])
  );

  const onRefresh = () => fetchRegistrations(true);

  const renderItem = ({ item }: { item: Registration }) => {
    const eventDate = new Date(item.event.date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const isEventCancelled = item.event.status === 'CANCELLED';
    const isCheckedIn = (item as any).checkedIn;

    return (
      <Card
        onPress={() => navigation.navigate('RegistrationDetails', { registrationId: item._id })}
        accessibilityLabel={`Registration for ${item.event.title}`}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.event.title}</Text>
          <Badge 
            label={item.status} 
            variant={item.status === 'REGISTERED' ? 'primary' : 'neutral'} 
            size="sm" 
          />
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaIcon}>📅</Text>
          <Text style={styles.metaText}>{eventDate} • {item.event.startTime}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaIcon}>📍</Text>
          <Text style={styles.metaText} numberOfLines={1}>{item.event.venue}</Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.attendanceBox}>
            <Text style={styles.attendanceLabel}>Attendance:</Text>
            <Badge 
              label={isCheckedIn ? 'CHECKED IN' : 'PENDING'} 
              variant={isCheckedIn ? 'success' : 'warning'}
              size="sm"
            />
          </View>
          <Text style={styles.viewPassLink}>View Pass →</Text>
        </View>

        {isEventCancelled && (
          <View style={styles.cancelledBanner}>
            <Text style={styles.cancelledNote}>⚠️ This event has been cancelled by organizers.</Text>
          </View>
        )}
      </Card>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your registrations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={registrations}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            icon="🎫"
            title="No Registrations Yet"
            message="You have not registered for any campus events yet. Explore published events and reserve your seat."
            actionTitle="Browse Events"
            onAction={() => navigation.navigate('StudentTabs')}
          />
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[colors.primary]} 
            tintColor={colors.primary}
          />
        }
      />
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
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  metaIcon: {
    fontSize: 13,
    marginRight: spacing.xs + 2,
  },
  metaText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    flex: 1,
  },
  footerRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendanceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  attendanceLabel: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  viewPassLink: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
  },
  cancelledBanner: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.dangerLight,
    borderRadius: 6,
  },
  cancelledNote: {
    ...typography.bodySmall,
    color: colors.dangerDark,
    fontWeight: '500',
  },
});

export default MyRegistrationsScreen;
