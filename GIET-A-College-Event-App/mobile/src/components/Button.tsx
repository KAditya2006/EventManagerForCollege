import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  StyleProp, 
  ViewStyle, 
  TextStyle 
} from 'react-native';
import { colors, radii, spacing } from '../theme';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'md',
  disabled = false, 
  loading = false,
  style,
  textStyle,
  icon,
  accessibilityLabel,
}) => {
  const getBackgroundColor = () => {
    if (disabled || loading) {
      if (variant === 'primary') return colors.primaryMuted;
      if (variant === 'secondary') return colors.surfaceSubtle;
      if (variant === 'danger') return '#fca5a5';
      if (variant === 'success') return '#86efac';
      if (variant === 'outline' || variant === 'ghost') return 'transparent';
      return colors.surfaceSubtle;
    }
    switch (variant) {
      case 'primary': return colors.primary;
      case 'secondary': return colors.surfaceSubtle;
      case 'danger': return colors.danger;
      case 'success': return colors.success;
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      default: return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) {
      if (variant === 'outline' || variant === 'ghost') return colors.textMuted;
      if (variant === 'secondary') return colors.textMuted;
      return colors.textInverse;
    }
    switch (variant) {
      case 'primary': return colors.textInverse;
      case 'secondary': return colors.textPrimary;
      case 'danger': return colors.textInverse;
      case 'success': return colors.textInverse;
      case 'outline': return colors.primary;
      case 'ghost': return colors.primary;
      default: return colors.textInverse;
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') {
      return disabled ? colors.surfaceBorderDark : colors.primary;
    }
    if (variant === 'secondary') {
      return colors.surfaceBorder;
    }
    return 'transparent';
  };

  const getHeight = () => {
    switch (size) {
      case 'sm': return 38;
      case 'lg': return 54;
      case 'md':
      default: return 48;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm': return 14;
      case 'lg': return 16;
      case 'md':
      default: return 15;
    }
  };

  const isOutlineOrSecondary = variant === 'outline' || variant === 'secondary';

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        { 
          height: getHeight(),
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: isOutlineOrSecondary ? 1 : 0,
        },
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <>
          {icon}
          <Text style={[
            styles.text, 
            { 
              color: getTextColor(),
              fontSize: getFontSize(),
            },
            icon ? { marginLeft: spacing.sm } : {},
            textStyle
          ]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: radii.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
