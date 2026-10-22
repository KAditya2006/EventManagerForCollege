import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { colors, radii, spacing, typography } from '../theme';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
  style,
  textStyle,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'primary':
        return { bg: colors.primaryLight, text: colors.primary };
      case 'success':
        return { bg: colors.successLight, text: colors.successDark };
      case 'warning':
        return { bg: colors.warningLight, text: colors.warningDark };
      case 'danger':
        return { bg: colors.dangerLight, text: colors.dangerDark };
      case 'info':
        return { bg: colors.infoLight, text: colors.infoDark };
      case 'neutral':
      default:
        return { bg: colors.surfaceSubtle, text: colors.textSecondary };
    }
  };

  const { bg, text } = getColors();
  const isSmall = size === 'sm';

  return (
    <View 
      style={[
        styles.badge, 
        { 
          backgroundColor: bg, 
          paddingHorizontal: isSmall ? spacing.sm : spacing.md,
          paddingVertical: isSmall ? 2 : spacing.xs,
        }, 
        style
      ]}
    >
      <Text 
        style={[
          styles.text, 
          { 
            color: text,
            fontSize: isSmall ? 11 : 12,
          }, 
          textStyle
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
