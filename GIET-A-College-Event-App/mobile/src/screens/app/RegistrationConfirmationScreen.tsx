import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../navigation/StudentNavigator';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<StudentStackParamList, 'RegistrationConfirmation'>;

const RegistrationConfirmationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { registrationId } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successIconBox}>
          <Text style={styles.successIconText}>✓</Text>
        </View>

        <Badge label="CONFIRMED" variant="success" style={styles.badge} />
        
        <Text style={styles.title}>Registration Successful!</Text>
        <Text style={styles.subtitle}>
          Your seat has been reserved. You can view your digital QR pass anytime under My Registrations.
        </Text>

        <Card style={styles.refCard}>
          <Text style={styles.refLabel}>Registration Reference ID</Text>
          <Text style={styles.refValue}>{registrationId}</Text>
        </Card>
      </View>

      <View style={styles.footer}>
        <Button 
          title="View Registration Details"
          onPress={() => navigation.navigate('RegistrationDetails', { registrationId })}
          variant="primary"
          size="lg"
          style={{ marginBottom: spacing.md }}
        />
        
        <Button 
          title="Back to Home"
          onPress={() => {
            navigation.popToTop();
            navigation.navigate('StudentTabs');
          }}
          variant="secondary"
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
  successIconBox: {
    width: 76,
    height: 76,
    borderRadius: radii.pill,
    backgroundColor: colors.successLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  successIconText: {
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
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xxl,
    maxWidth: 320,
  },
  refCard: {
    width: '100%',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  refLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  refValue: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    paddingBottom: spacing.xl,
  },
});

export default RegistrationConfirmationScreen;
