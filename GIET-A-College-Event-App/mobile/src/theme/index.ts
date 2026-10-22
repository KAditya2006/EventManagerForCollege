/**
 * GIET(A) College Event Management App Design System Tokens
 * Source of Truth: docs/designe.md & GIET(A) Institutional Identity
 * Direction: Minimal, lightweight, clean, professional, institutional
 */

export const colors = {
  // Brand / Institutional Colors (From GIET(A) Design Template)
  primary: '#187393',         // Signature GIET(A) Institutional Deep Teal
  primaryDark: '#0e526b',     // Darker shade for active/pressed states
  primaryLight: '#e6f4f8',    // Soft tint for selected chips / badges
  primaryMuted: '#94c6d7',    // Disabled/muted primary state

  // Neutrals / Surfaces
  background: '#f8fafc',      // Light clean canvas
  surface: '#ffffff',         // Card & modal background
  surfaceSubtle: '#f1f5f9',   // Input backgrounds, chip backgrounds
  surfaceBorder: '#e2e8f0',   // Subtle card & divider borders
  surfaceBorderDark: '#cbd5e1',

  // Typography
  textPrimary: '#1e293b',     // Deep slate for main headings & body
  textSecondary: '#64748b',   // Muted slate for subtitles & labels
  textMuted: '#94a3b8',       // Light slate for placeholders & timestamps
  textInverse: '#ffffff',     // Text on primary buttons

  // Status & Feedback Colors
  success: '#16a34a',         // Checked-in, registered, success
  successLight: '#dcfce7',    // Light green badge background
  successDark: '#15803d',     // Dark green text

  warning: '#d97706',         // Draft, pending, caution
  warningLight: '#fef3c7',    // Light amber badge background
  warningDark: '#b45309',     // Amber text

  danger: '#dc2626',          // Cancelled, error, logout
  dangerLight: '#fee2e2',     // Light red badge background
  dangerDark: '#b91c1c',      // Red text

  info: '#0284c7',            // General alerts
  infoLight: '#e0f2fe',
  infoDark: '#0369a1',

  // Interactive Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.05)',
  starGold: '#f59e0b',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const typography = {
  titleLarge: {
    fontSize: 26,
    fontWeight: '700' as const,
    lineHeight: 32,
    color: colors.textPrimary,
  },
  titleMedium: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 26,
    color: colors.textPrimary,
  },
  titleSmall: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    color: colors.textMuted,
  },
  caption: {
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 14,
    color: colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
};

export const radii = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 9999,
};

export const shadows = {
  none: {},
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  card: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  modal: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
};
