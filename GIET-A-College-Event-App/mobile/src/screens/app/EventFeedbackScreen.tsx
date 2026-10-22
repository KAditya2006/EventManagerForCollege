import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../navigation/StudentNavigator';
import { submitFeedback } from '../../api/feedback';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<StudentStackParamList, 'EventFeedback'>;

const RATING_DESCRIPTIONS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

const EventFeedbackScreen: React.FC<Props> = ({ route, navigation }) => {
  const { eventId, eventTitle } = route.params;
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      Alert.alert('Rating Required', 'Please select a rating between 1 and 5 stars.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await submitFeedback(eventId, rating, comment.trim());
      if (response.success) {
        navigation.replace('FeedbackSubmitted', { eventTitle });
      } else {
        Alert.alert('Submission Notice', response.error?.message || 'Failed to submit feedback.');
      }
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || 'An error occurred while submitting feedback.';
      Alert.alert('Notice', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        contentContainerStyle={styles.content} 
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.headerCard}>
          <Text style={styles.headerLabel}>EVENT ATTENDED</Text>
          <Text style={styles.eventTitle}>{eventTitle}</Text>
          <Text style={styles.subtitle}>
            Your feedback helps GIET(A) improve future campus events and student experiences.
          </Text>
        </Card>

        <Card style={styles.ratingCard}>
          <Text style={styles.sectionTitle}>How would you rate this event? *</Text>
          
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                style={[styles.starButton, rating >= star && styles.starButtonActive]}
                onPress={() => setRating(star)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${star} of 5 stars, ${RATING_DESCRIPTIONS[star]}`}
              >
                <Text style={[styles.starIcon, rating >= star && styles.starIconActive]}>
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.ratingFeedback}>
            {rating > 0 ? RATING_DESCRIPTIONS[rating] : 'Tap a star to rate (1 - 5)'}
          </Text>
        </Card>

        <Card style={styles.commentCard}>
          <Input
            label="Additional Comments (Optional)"
            value={comment}
            onChangeText={setComment}
            placeholder="Share what you enjoyed or suggestions for improvements..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            maxLength={500}
            editable={!submitting}
            helperText={`${comment.length}/500 characters`}
          />
        </Card>

        <Button 
          title="Submit Feedback"
          onPress={handleSubmit}
          disabled={rating === 0 || submitting}
          loading={submitting}
          size="lg"
          style={styles.submitButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  headerCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  headerLabel: {
    ...typography.caption,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  eventTitle: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  ratingCard: {
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  starButton: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  starButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  starIcon: {
    fontSize: 26,
    color: colors.textMuted,
  },
  starIconActive: {
    color: colors.starGold,
  },
  ratingFeedback: {
    ...typography.bodyMedium,
    color: colors.primaryDark,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  commentCard: {
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  submitButton: {
    width: '100%',
  },
});

export default EventFeedbackScreen;
