import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { createEvent } from '../../api/adminEvents';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { colors, spacing, typography, radii } from '../../theme';

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
    capacity: '',
    poster: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePickPoster = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'Camera roll access is required to upload an event poster.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.base64) {
          const mimeType = asset.mimeType || 'image/jpeg';
          handleChange('poster', `data:${mimeType};base64,${asset.base64}`);
        } else if (asset.uri) {
          handleChange('poster', asset.uri);
        }
      }
    } catch (err: any) {
      Alert.alert('Image Picker Error', err.message || 'Failed to select image.');
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
        poster: formData.poster.trim() || undefined,
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

        {/* Poster & Visual Media Card */}
        <Card style={styles.formCard}>
          <Text style={styles.cardHeader}>EVENT POSTER & BANNER (OPTIONAL)</Text>
          <Text style={styles.posterCardSub}>
            Add a promotional poster image for major campus events, festivals, or hackathons.
          </Text>

          {formData.poster ? (
            <View style={styles.posterPreviewContainer}>
              <Image source={{ uri: formData.poster }} style={styles.posterPreviewImage} resizeMode="cover" />
              <TouchableOpacity
                style={styles.removePosterBtn}
                onPress={() => handleChange('poster', '')}
                activeOpacity={0.8}
              >
                <Text style={styles.removePosterText}>✕ Remove Poster</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.pickPosterBtn}
              onPress={handlePickPoster}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 26, marginBottom: 4 }}>🖼️</Text>
              <Text style={styles.pickPosterBtnText}>Select Poster from Device Gallery</Text>
              <Text style={styles.pickPosterBtnSub}>JPG, PNG • High Quality Banner</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.orDividerText}>— OR ENTER IMAGE URL —</Text>

          <Input
            label="Direct Poster Image URL"
            value={formData.poster.startsWith('data:') ? '' : formData.poster}
            onChangeText={(v) => handleChange('poster', v)}
            placeholder="https://example.com/fest-poster.jpg"
            editable={!loading}
            helperText="Cloudinary, Imgur, or direct web image link"
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
  /* Poster Media Styles */
  posterCardSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: spacing.md,
    lineHeight: 16,
  },
  pickPosterBtn: {
    backgroundColor: '#F0F9FB',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#0E526B',
    borderRadius: radii.md,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickPosterBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0E526B',
  },
  pickPosterBtnSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  posterPreviewContainer: {
    borderRadius: radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
    marginBottom: spacing.xs,
  },
  posterPreviewImage: {
    width: '100%',
    height: 180,
  },
  removePosterBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  removePosterText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  orDividerText: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginVertical: spacing.md,
  },
});

export default CreateEventScreen;
