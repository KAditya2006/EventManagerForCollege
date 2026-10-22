import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../navigation/StudentNavigator';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<StudentStackParamList, 'FeedbackSubmitted'>;

const FeedbackSubmittedScreen: React.FC<Props> = ({ route, navigation }) => {
  const { eventTitle } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>✓</Text>
        </View>

        <Badge label="FEEDBACK RECORDED" variant="success" style={styles.badge} />
        
        <Text style={styles.title}>Thank You!</Text>
        <Text style={styles.subtitle}>
          Your feedback has been successfully submitted for:
        </Text>

        <Card style={styles.eventCard}>
          <Text style={styles.eventTitle}>{eventTitle}</Text>
        </Card>

        <Text style={styles.thankYouNote}>
          We appreciate your contribution to maintaining quality events at GIET(A).
        </Text>
      </View>

      <View style={styles.footer}>
        <Button 
          title="Back to Registrations"
          onPress={() => navigation.popToTop()}
          variant="primary"
          size="lg"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    justifyContent: 'space-between',
    padding: spacing.xxl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBox: {
    width: 76,
    height: 76,
    borderRadius: radii.pill,
    backgroundColor: colors.successLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconText: {
    color: colors.successDark,
    fontSize: 38,
    fontWeight: 'bold',
  },
  badge: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.titleLarge,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    maxWidth: 280,
  },
  eventCard: {
    width: '100%',
    padding: spacing.lg,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  eventTitle: {
    ...typography.titleSmall,
    color: colors.primary,
    textAlign: 'center',
  },
  thankYouNote: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  footer: {
    paddingBottom: spacing.xl,
  },
});

export default FeedbackSubmittedScreen;
