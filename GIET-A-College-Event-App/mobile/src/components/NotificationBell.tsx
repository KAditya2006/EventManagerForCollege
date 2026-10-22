import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../navigation/StudentNavigator';
import { getUnreadCount } from '../api/notifications';
import { colors, radii, spacing } from '../theme';

import { BellIcon } from './FormIcons';

export const NotificationBell: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentStackParamList>>();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchUnread = async () => {
      try {
        const res = await getUnreadCount();
        if (res.success && isMounted) {
          setUnreadCount(res.data.count);
        }
      } catch (error) {
        // Silently fail if offline or unauthorized
      }
    };

    fetchUnread();
    
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUnread();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [navigation]);

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => navigation.navigate('Notifications')}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Notifications, ${unreadCount} unread`}
    >
      <BellIcon size={22} color={colors.primary} />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: spacing.md,
    position: 'relative',
    padding: spacing.xs,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.danger,
    borderRadius: radii.pill,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  badgeText: {
    color: colors.textInverse,
    fontSize: 10,
    fontWeight: '700',
  }
});
