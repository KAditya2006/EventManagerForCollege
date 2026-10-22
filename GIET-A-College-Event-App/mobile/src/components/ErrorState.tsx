import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { Button } from './Button';

export interface ErrorStateProps {
  icon?: string;
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryTitle?: string;
  style?: StyleProp<ViewStyle>;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  icon = '⚠️',
  title = 'Something Went Wrong',
  message = 'We could not complete your request. Please check your connection and try again.',
  onRetry,
  retryTitle = 'Try Again',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button
          title={retryTitle}
          onPress={onRetry}
          variant="primary"
          size="sm"
          style={styles.retryButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 44,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  message: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 290,
  },
  retryButton: {
    marginTop: spacing.lg,
    minWidth: 130,
  },
});
