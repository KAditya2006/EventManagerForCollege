import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { colors, radii, spacing, typography } from '../theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  containerStyle,
  labelStyle,
  inputStyle,
  style,
  ...rest
}) => {
  const isEditable = rest.editable !== false;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error ? styles.inputError : null,
          !isEditable ? styles.inputDisabled : null,
          inputStyle,
          style
        ]}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={label || rest.placeholder}
        accessibilityState={{ disabled: !isEditable }}
        {...rest}
      />
      {error ? (
        <Text style={styles.errorText} accessibilityRole="alert">{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs + 2,
    marginLeft: 2,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.surfaceBorderDark,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerLight,
  },
  inputDisabled: {
    backgroundColor: colors.surfaceSubtle,
    color: colors.textSecondary,
    borderColor: colors.surfaceBorder,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.danger,
    marginTop: spacing.xs,
    marginLeft: 2,
    fontWeight: '500',
  },
  helperText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginLeft: 2,
  },
});
