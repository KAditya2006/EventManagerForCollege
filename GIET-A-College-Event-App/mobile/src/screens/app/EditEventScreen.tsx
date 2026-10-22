import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { getAdminEventDetails, updateEvent } from '../../api/adminEvents';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ErrorState } from '../../components/ErrorState';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AdminStackParamList, 'EditEvent'>;

const EditEventScreen: React.FC<Props> = ({ route, navigation }) => {
  const { eventId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  
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

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await getAdminEventDetails(eventId);
      if (res.success) {
        const ev = res.data;
        const dateStr = ev.date ? new Date(ev.date).toISOString().split('T')[0] : '';
        setFormData({
          title: ev.title || '',
          description: ev.description || '',
          date: dateStr,
          startTime: ev.startTime || '',
          endTime: ev.endTime || '',
          venue: ev.venue || '',
          organizer: ev.organizer || '',
          category: ev.category || '',
          capacity: ev.capacity ? ev.capacity.toString() : ''
        });
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Failed to load event', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

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
      setSaving(true);
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
      
      const res = await updateEvent(eventId, payload);
      if (res.success) {
        Alert.alert('Changes Saved', 'Event details have been updated successfully.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Notice', res.error?.message || 'Failed to update event');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'An error occurred while updating the event.';
      Alert.alert('Update Notice', msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading event details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <ErrorState 
          title="Could Not Load Event"
          message="Failed to retrieve event information for editing."
          onRetry={fetchEvent}
        />
      </View>
    );
  }

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
            placeholder="Event Title"
            editable={!saving}
            error={errors.title}
          />

          <Input
            label="Description *"
            value={formData.description}
            onChangeText={(v) => handleChange('description', v)}
            placeholder="Event Description"
            multiline
            numberOfLines={4}
            editable={!saving}
            error={errors.description}
          />

          <Input
            label="Category"
            value={formData.category}
            onChangeText={(v) => handleChange('category', v)}
            placeholder="e.g. Technical, Cultural, Workshop, Sports"
            editable={!saving}
          />
        </Card>

        <Card style={styles.formCard}>
          <Text style={styles.cardHeader}>SCHEDULE & LOCATION</Text>

          <Input
            label="Date (YYYY-MM-DD) *"
            value={formData.date}
            onChangeText={(v) => handleChange('date', v)}
            placeholder="2026-10-25"
            editable={!saving}
            error={errors.date}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <Input
                label="Start Time *"
                value={formData.startTime}
                onChangeText={(v) => handleChange('startTime', v)}
                placeholder="10:00 AM"
                editable={!saving}
                error={errors.startTime}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="End Time *"
                value={formData.endTime}
                onChangeText={(v) => handleChange('endTime', v)}
                placeholder="01:00 PM"
                editable={!saving}
                error={errors.endTime}
              />
            </View>
          </View>

          <Input
            label="Venue Location *"
            value={formData.venue}
            onChangeText={(v) => handleChange('venue', v)}
            placeholder="Auditorium"
            editable={!saving}
            error={errors.venue}
          />
        </Card>

        <Card style={styles.formCard}>
          <Text style={styles.cardHeader}>MANAGEMENT & CAPACITY</Text>

          <Input
            label="Organizer / Department *"
            value={formData.organizer}
            onChangeText={(v) => handleChange('organizer', v)}
            placeholder="Department / Society"
            editable={!saving}
            error={errors.organizer}
          />

          <Input
            label="Seat Capacity"
            value={formData.capacity}
            onChangeText={(v) => handleChange('capacity', v)}
            placeholder="Leave empty for unlimited seats"
            keyboardType="numeric"
            editable={!saving}
            helperText="Cannot be reduced below active registered students count"
          />
        </Card>

        <Button 
          title="Save Changes"
          onPress={handleSubmit}
          loading={saving}
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

export default EditEventScreen;
