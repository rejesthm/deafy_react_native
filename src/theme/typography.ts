/**
 * Typography system matching Flutter app
 */

export const fontFamily = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 22,
  '4xl': 24,
  '5xl': 28,
  '6xl': 32,
} as const;

export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
} as const;

// Typography presets matching Flutter
export const typography = {
  // Headings
  headingXl: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['5xl'], // 28
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['5xl'] * lineHeight.tight,
  },
  headingLg: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize['4xl'], // 24
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize['4xl'] * lineHeight.tight,
  },
  headingMd: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['3xl'], // 22
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['3xl'] * lineHeight.tight,
  },
  headingSm: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl, // 18
    fontWeight: fontWeight.bold,
    lineHeight: fontSize.xl * lineHeight.normal,
  },

  // Body text
  bodyLg: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg, // 16
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.lg * lineHeight.normal,
  },
  bodyMd: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md, // 14
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.md * lineHeight.normal,
  },
  bodySm: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm, // 12
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.sm * lineHeight.normal,
  },
  bodyXs: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs, // 10
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.xs * lineHeight.normal,
  },

  // Body with emphasis
  bodySemibold: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.md, // 14
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.md * lineHeight.normal,
  },

  // Captions and labels
  caption: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm, // 12
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.sm * lineHeight.normal,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm, // 12
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.sm * lineHeight.tight,
  },

  // Button text
  button: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.md, // 14
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.md * lineHeight.tight,
  },
  buttonLarge: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.lg, // 16
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.lg * lineHeight.tight,
  },
} as const;
