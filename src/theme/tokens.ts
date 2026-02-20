/**
 * Design tokens matching Flutter app
 * From Flutter: lib/common/styles/app_design_tokens.dart
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
  '5xl': 64,
  '6xl': 80,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  circular: 40,
  full: 9999,
} as const;

export const dimensions = {
  buttonHeight: 48,
  inputFieldHeight: 56,
  bottomNavHeight: 80,
  iconContainerSize: 48,
  avatarSizeSmall: 32,
  avatarSizeMedium: 40,
  avatarSizeLarge: 56,
  categoryIconSize: 56,
  courseCardHeight: 120,
  headerHeight: 60,
} as const;

export const borderWidth = {
  thin: 1,
  medium: 2,
  thick: 4,
  extraThick: 8,
} as const;

export const opacity = {
  disabled: 0.5,
  subtle: 0.7,
  medium: 0.8,
  overlay: 0.5,
  overlayLight: 0.3,
  overlayDark: 0.8,
} as const;

export const animation = {
  fast: 150,
  standard: 250,
  slow: 350,
  verySlow: 500,
} as const;

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

export const shadows = {
  subtle: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  strong: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  colored: (color: string) => ({
    shadowColor: color,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  }),
} as const;
