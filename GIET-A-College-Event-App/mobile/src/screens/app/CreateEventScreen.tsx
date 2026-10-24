import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createEvent } from '../../api/adminEvents';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { colors, spacing, typography } from '../../theme';

const CreateEventScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    venue: '',
    organizer: '',
    category: '',
    capacity: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.title.trim()) errs.title = 'Event title is required.';
    if (!formData.description.trim()) errs.description = 'Description is required.';
    if (!formData.date.trim()) errs.date = 'Date (YYYY-MM-DD) is required.';
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date.trim())) errs.date = 'Format must be YYYY-MM-DD (e.g. 2026-10-25).';
    if (!formData.startTime.trim()) errs.startTime = 'Start time is required.';
    if (!formData.endTime.trim()) errs.endTime = 'End time is required.';
    if (!formData.venue.trim()) errs.venue = 'Venue location is required.';
    if (!formData.organizer.trim()) errs.organizer = 'Organizer is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert('Incomplete Form', 'Please correct the highlighted fields before saving.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: formData.date.trim(),
        startTime: formData.startTime.trim(),
        endTime: formData.endTime.trim(),
        venue: formData.venue.trim(),
        organizer: formData.organizer.trim(),
        category: formData.category.trim() || undefined,
        capacity: formData.capacity.trim() ? parseInt(formData.capacity.trim(), 10) : undefined,
      };
      
      const res = await createEvent(payload);
      if (res.success) {
        Alert.alert(
          '🎉 Event Created Successfully!',
          'The Official Event Registration QR Code for campus notice boards and posters is ready.',
          [
            {
              text: 'View Poster QR & Publish',
              onPress: () => (navigation as any).replace('AdminEventDetails', { eventId: res.data._id }),
            },
          ]
        );
      } else {
        Alert.alert('Error', res.error?.message || 'Failed to create event');
      }
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || 'An error occurred while creating the event.';
      Alert.alert('Notice', msg);
    } finally {
      setLoading(false);
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
        <Card style={styles.formCard}>
          <Text style={styles.cardHeader}>BASIC EVENT DETAILS</Text>

          <Input
            label="Event Title *"
            value={formData.title}
            onChangeText={(v) => handleChange('title', v)}
            placeholder="e.g. Annual Tech Fest 2026"
            editable={!loading}
            error={errors.title}
          />

          <Input
            label="Description *"
            value={formData.description}
            onChangeText={(v) => handleChange('description', v)}
            placeholder="Provide a comprehensive event description..."
            multiline
            numberOfLines={4}
            editable={!loading}
            error={errors.description}
          />

          <Input
            label="Category"
            value={formData.category}
            onChangeText={(v) => handleChange('category', v)}
            placeholder="e.g. Technical, Cultural, Sports, Workshop"
            editable={!loading}
          />
        </Card>

        <Card style={styles.formCard}>
          <Text style={styles.cardHeader}>SCHEDULE & LOCATION</Text>

          <Input
            label="Event Date (YYYY-MM-DD) *"
            value={formData.date}
            onChangeText={(v) => handleChange('date', v)}
            placeholder="2026-10-25"
            editable={!loading}
            error={errors.date}
            helperText="Date format: YYYY-MM-DD"
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <Input
                label="Start Time *"
                value={formData.startTime}
                onChangeText={(v) => handleChange('startTime', v)}
                placeholder="10:00 AM"
                editable={!loading}
                error={errors.startTime}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="End Time *"
                value={formData.endTime}
                onChangeText={(v) => handleChange('endTime', v)}
                placeholder="01:00 PM"
                editable={!loading}
                error={errors.endTime}
              />
            </View>
          </View>

          <Input
            label="Venue Location *"
            value={formData.venue}
            onChangeText={(v) => handleChange('venue', v)}
            placeholder="e.g. Main Auditorium, Block B"
            editable={!loading}
            error={errors.venue}
          />
        </Card>

        <Card style={styles.formCard}>
          <Text style={styles.cardHeader}>MANAGEMENT & CAPACITY</Text>

          <Input
            label="Organizer / Department *"
            value={formData.organizer}
            onChangeText={(v) => handleChange('organizer', v)}
            placeholder="e.g. Department of CSE / Student Council"
            editable={!loading}
            error={errors.organizer}
          />

          <Input
            label="Seat Capacity (Optional)"
            value={formData.capacity}
            onChangeText={(v) => handleChange('capacity', v)}
            placeholder="Leave empty for unlimited seats"
            keyboardType="numeric"
            editable={!loading}
            helperText="Maximum allowed student registrations"
          />
        </Card>

        <Button 
          title="Save as Draft"
          onPress={handleSubmit}
          loading={loading}
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
  formCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardHeader: {
    ...typography.caption,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
  },
  submitButton: {
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
  },
});

export default CreateEventScreen;
