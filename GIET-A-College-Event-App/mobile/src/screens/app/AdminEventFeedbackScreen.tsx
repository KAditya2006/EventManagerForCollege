import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { getEventFeedback, Feedback } from '../../api/feedback';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminEventFeedback'>;

const AdminEventFeedbackScreen: React.FC<Props> = ({ route }) => {
  const { eventId, eventTitle } = route.params;
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [stats, setStats] = useState({ averageRating: 0, totalFeedback: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchFeedback = async (pageNum = 1, isRefresh = false) => {
    try {
      const response = await getEventFeedback(eventId, pageNum, 15);
      if (response.success) {
        if (isRefresh) {
          setFeedbacks(response.data.feedbacks);
        } else {
          setFeedbacks(prev => [...prev, ...response.data.feedbacks]);
        }
        setStats(response.data.stats);
        
        if (pageNum >= response.pagination.totalPages) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeedback(1, true);
  }, [eventId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchFeedback(1, true);
  }, [eventId]);

  const handleLoadMore = () => {
    if (!loading && !refreshing && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFeedback(nextPage);
    }
  };

  const renderStars = (rating: number) => {
    let stars = '';
    for (let i = 0; i < 5; i++) {
      stars += i < rating ? '★' : '☆';
    }
    return <Text style={styles.stars}>{stars}</Text>;
  };

  const renderItem = ({ item }: { item: Feedback }) => {
    const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <Card style={styles.feedbackCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.studentName}>{item.student?.name || 'Verified Participant'}</Text>
          <View style={styles.ratingBadge}>
            {renderStars(item.rating)}
            <Text style={styles.numericRating}>({item.rating}/5)</Text>
          </View>
        </View>

        {!!item.comment && (
          <Text style={styles.comment}>{item.comment}</Text>
        )}

        <View style={styles.cardFooter}>
          <Text style={styles.timeText}>{formattedDate}</Text>
          <Badge label="VERIFIED ATTENDEE" variant="success" size="sm" />
        </View>
      </Card>
    );
  };

  const renderHeader = () => {
    return (
      <Card style={styles.statsCard}>
        <Text style={styles.statsSubtitle}>FEEDBACK SUMMARY</Text>
        <Text style={styles.statsTitle}>{eventTitle}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
            </Text>
            <View style={styles.starRowSmall}>
              {renderStars(Math.round(stats.averageRating || 0))}
            </View>
            <Text style={styles.statLabel}>Average Rating</Text>
          </View>

          <View style={styles.statsDivider} />

          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.totalFeedback}</Text>
            <Text style={styles.statLabel}>Responses</Text>
          </View>
        </View>
      </Card>
    );
  };

  if (loading && page === 1) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading feedback responses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={feedbacks}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[colors.primary]} 
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        ListFooterComponent={
          hasMore && !refreshing ? (
            <ActivityIndicator style={{ margin: spacing.lg }} color={colors.primary} />
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="⭐"
              title="No Feedback Yet"
              message="No student participants have submitted ratings for this event yet."
            />
          ) : null
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
  statsCard: {
    padding: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  statsSubtitle: {
    ...typography.caption,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statsTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingVertical: spacing.sm,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  starRowSmall: {
    marginVertical: 2,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statsDivider: {
    width: 1,
    height: 48,
    backgroundColor: colors.surfaceBorder,
  },
  feedbackCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  studentName: {
    ...typography.titleSmall,
    fontSize: 15,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    fontSize: 16,
    color: colors.starGold,
  },
  numericRating: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: 4,
    fontWeight: '600',
  },
  comment: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSubtle,
    paddingTop: spacing.xs + 2,
  },
  timeText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
});

export default AdminEventFeedbackScreen;
