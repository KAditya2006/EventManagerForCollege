import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../navigation/StudentNavigator';
import { markNotificationAsRead, Notification } from '../../api/notifications';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<StudentStackParamList, 'NotificationDetails'>;

const NotificationDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { notificationId, notification: initialNotification } = route.params;
  
  const [notification, setNotification] = useState<Notification | undefined>(initialNotification);
  const [markingRead, setMarkingRead] = useState(false);

  useEffect(() => {
    if (notification && !notification.read) {
      handleMarkAsRead();
    }
  }, [notification]);

  const handleMarkAsRead = async () => {
    setMarkingRead(true);
    try {
      const response = await markNotificationAsRead(notificationId);
      if (response.success) {
        setNotification(response.data);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    } finally {
      setMarkingRead(false);
    }
  };

  const handleNavigateToResource = () => {
    if (!notification) return;

    if (notification.type === 'REGISTRATION_CONFIRMED' || notification.type === 'ATTENDANCE_CONFIRMED') {
      if (notification.registration) {
        navigation.navigate('RegistrationDetails', { registrationId: notification.registration });
      }
    } else if (notification.type === 'EVENT_UPDATED' || notification.type === 'EVENT_CANCELLED') {
      if (notification.event) {
        navigation.navigate('EventDetails', { eventId: notification.event });
      }
    }
  };

  if (!notification) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading notification details...</Text>
      </View>
    );
  }

  const hasResource = !!notification.event || !!notification.registration;
  const timeFormatted = new Date(notification.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const getActionTitle = () => {
    if (notification.type === 'REGISTRATION_CONFIRMED' || notification.type === 'ATTENDANCE_CONFIRMED') {
      return 'View Registration & QR Pass';
    }
    return 'View Event Details';
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.detailCard}>
          <View style={styles.badgeRow}>
            <Badge label={notification.type.replace('_', ' ')} variant="primary" size="sm" />
            <Text style={styles.timeText}>{timeFormatted}</Text>
          </View>

          <Text style={styles.title}>{notification.title}</Text>

          <View style={styles.divider} />

          <Text style={styles.message}>{notification.message}</Text>
        </Card>

        {hasResource && (
          <Button 
            title={getActionTitle()}
            onPress={handleNavigateToResource}
            variant="primary"
            size="lg"
            style={styles.actionButton}
          />
        )}
      </ScrollView>
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
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  detailCard: {
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  timeText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  title: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginBottom: spacing.lg,
  },
  message: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  actionButton: {
    width: '100%',
  },
});

export default NotificationDetailsScreen;
