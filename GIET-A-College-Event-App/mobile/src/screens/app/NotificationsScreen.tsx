import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../navigation/StudentNavigator';
import { getNotifications, Notification } from '../../api/notifications';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<StudentStackParamList, 'Notifications'>;

const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = async (pageNum = 1, isRefresh = false) => {
    try {
      const response = await getNotifications(pageNum, 15);
      if (response.success) {
        if (isRefresh) {
          setNotifications(response.data);
        } else {
          setNotifications(prev => [...prev, ...response.data]);
        }
        
        if (pageNum >= response.pagination.pages) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchNotifications(1, true);
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchNotifications(1, true);
  }, []);

  const handleLoadMore = () => {
    if (!loading && !refreshing && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage);
    }
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const isUnread = !item.read;
    const timeFormatted = new Date(item.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    
    return (
      <Card 
        style={[styles.notificationCard, isUnread && styles.unreadCard]}
        onPress={() => navigation.navigate('NotificationDetails', { notificationId: item._id, notification: item })}
        accessibilityLabel={`Notification: ${item.title}`}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            {isUnread && <View style={styles.unreadDot} />}
            <Text style={[styles.title, isUnread && styles.unreadTitle]} numberOfLines={1}>
              {item.title}
            </Text>
          </View>
          <Text style={styles.timeText}>{timeFormatted}</Text>
        </View>
        <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
      </Card>
    );
  };

  if (loading && page === 1) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
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
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        ListFooterComponent={
          hasMore && !refreshing ? (
            <ActivityIndicator style={{ margin: spacing.lg }} color={colors.primary} />
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon="🔔"
            title="All Caught Up"
            message="You have no notifications right now. Alerts regarding your event registrations and updates will appear here."
            actionTitle="Refresh"
            onAction={onRefresh}
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
  notificationCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  unreadCard: {
    backgroundColor: '#f0f9ff',
    borderColor: '#bae6fd',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '700',
    color: colors.primaryDark,
  },
  timeText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontSize: 11,
  },
  message: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default NotificationsScreen;
