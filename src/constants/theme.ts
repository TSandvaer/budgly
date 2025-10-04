// Dark theme colors inspired by modern mobile app design
export const colors = {
  // Backgrounds
  background: '#0f0f1e',
  backgroundSecondary: '#1a1a2e',
  backgroundTertiary: '#16213e',

  // Cards and surfaces
  card: '#1e1e2d',
  cardElevated: '#252536',

  // Primary/Accent colors (Teal/Cyan)
  primary: '#00d4aa',
  primaryDark: '#0f9b8e',
  primaryLight: '#00ffcc',

  // Text colors
  text: '#ffffff',
  textSecondary: '#a0a0bb',
  textTertiary: '#6b6b7f',
  textDisabled: '#4a4a5c',

  // Status colors
  success: '#00d4aa',
  successLight: '#00ffcc',
  error: '#ff6b6b',
  errorLight: '#ff8787',
  warning: '#ffd93d',
  info: '#6bcfff',

  // Income/Expense
  income: '#00d4aa',
  expense: '#ff6b6b',

  // Borders and dividers
  border: '#2a2a3e',
  divider: '#2a2a3e',

  // Overlay and shadows
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 0, 0, 0.4)',
};

export const gradients = {
  primary: ['#0f9b8e', '#00d4aa'],
  card: ['#1e1e2d', '#252536'],
  background: ['#0f0f1e', '#1a1a2e'],
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

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const fontSize = {
  xs: 11,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  display: 32,
};

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadows = {
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 6,
  },
};
