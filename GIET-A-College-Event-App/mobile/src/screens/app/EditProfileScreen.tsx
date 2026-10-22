import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../api/profile';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<any, 'EditProfile'>;

const EditProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { profileData } = route.params || {};
  const { user } = useAuth();

  const [name, setName] = useState(profileData?.name || '');
  const [branch, setBranch] = useState(profileData?.branch || '');
  const [year, setYear] = useState(profileData?.year || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isStudent = user?.role === 'STUDENT';

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!name.trim()) errs.name = 'Full name is required.';
    if (isStudent) {
      if (!branch.trim()) errs.branch = 'Branch / Department is required.';
      if (!year.trim()) errs.year = 'Year / Semester is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const updateData: any = { name: name.trim() };
      if (isStudent) {
        updateData.branch = branch.trim();
        updateData.year = year.trim();
      }

      const response = await updateProfile(updateData);
      if (response.success) {
        Alert.alert('Profile Updated', 'Your profile details have been saved successfully.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Notice', response.error?.message || 'Failed to update profile');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error?.message || 'An error occurred.');
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
          <Text style={styles.formTitle}>Edit Details</Text>

          <Input
            label="Full Name *"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
            }}
            placeholder="Enter your full name"
            autoCapitalize="words"
            editable={!loading}
            error={errors.name}
          />

          {isStudent && (
            <>
              <Input
                label="Course / Branch *"
                value={branch}
                onChangeText={(text) => {
                  setBranch(text);
                  if (errors.branch) setErrors(prev => ({ ...prev, branch: '' }));
                }}
                placeholder="e.g., Computer Science & Engineering"
                editable={!loading}
                error={errors.branch}
              />
              <Input
                label="Year / Semester *"
                value={year}
                onChangeText={(text) => {
                  setYear(text);
                  if (errors.year) setErrors(prev => ({ ...prev, year: '' }));
                }}
                placeholder="e.g., 3rd Year / 6th Sem"
                editable={!loading}
                error={errors.year}
              />
            </>
          )}
        </Card>

        {/* Read-Only Information */}
        <Card style={styles.readOnlyCard}>
          <Text style={styles.readOnlyHeader}>ACCOUNT IDENTIFIERS (READ-ONLY)</Text>

          <View style={styles.readOnlyRow}>
            <Text style={styles.readOnlyLabel}>College Email</Text>
            <Text style={styles.readOnlyValue}>{user?.email}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.readOnlyRow}>
            <Text style={styles.readOnlyLabel}>System Role</Text>
            <Badge label={user?.role || 'STUDENT'} variant="primary" size="sm" />
          </View>
        </Card>

        <Button 
          title="Save Changes"
          onPress={handleSave}
          loading={loading}
          size="lg"
          style={styles.saveButton}
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
  formTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  readOnlyCard: {
    padding: spacing.lg,
    backgroundColor: colors.surfaceSubtle,
    marginBottom: spacing.xl,
  },
  readOnlyHeader: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  readOnlyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  readOnlyLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  readOnlyValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: spacing.xs,
  },
  saveButton: {
    width: '100%',
  },
});

export default EditProfileScreen;
