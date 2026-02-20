/**
 * Color palette matching Flutter app design
 * Based on CustomAppColors from clean_architecture_template
 */

export const colors = {
  // Primary Colors - Purple gradient theme
  primary: '#6366F1', // Indigo-500
  primaryVariant: '#8B5CF6', // Violet-500
  primaryDark: '#4F46E5', // Indigo-600
  primaryLight: '#A5B4FC', // Indigo-300

  // Secondary & Tertiary
  secondary: '#EC4899', // Pink-500
  tertiary: '#F59E0B', // Amber-500
  accent: '#10B981', // Green-500

  // Grayscale
  white: '#FFFFFF',
  black: '#000000',
  gray1: '#F9FAFB', // Gray-50
  gray2: '#F3F4F6', // Gray-100
  gray3: '#E5E7EB', // Gray-200
  gray4: '#D1D5DB', // Gray-300
  gray5: '#9CA3AF', // Gray-400
  gray6: '#6B7280', // Gray-500
  gray7: '#4B5563', // Gray-600
  gray8: '#374151', // Gray-700
  gray9: '#1F2937', // Gray-800
  gray10: '#111827', // Gray-900

  // Text Colors
  primaryText: '#111827', // Gray-900
  secondaryText: '#6B7280', // Gray-500
  tertiaryText: '#9CA3AF', // Gray-400
  invertedText: '#FFFFFF',

  // Background Colors
  primaryBackground: '#F9FAFB', // Gray-50
  secondaryBackground: '#FFFFFF',
  darkBackground: '#1F2937', // Gray-800

  // Status Colors
  success: '#10B981', // Green-500
  warning: '#F59E0B', // Amber-500
  error: '#EF4444', // Red-500
  info: '#3B82F6', // Blue-500

  // Detection UI Colors
  leftHand: '#3B82F6', // Blue-500 - matches Flutter
  rightHand: '#10B981', // Green-500 - matches Flutter
  landmark: '#FFFFFF',
  connection: 'rgba(255, 255, 255, 0.7)',

  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.8)',

  // Gradient Colors (for gradient containers)
  gradientStart: '#6366F1', // Indigo-500
  gradientEnd: '#8B5CF6', // Violet-500
  gradientStartDark: '#4F46E5', // Indigo-600
  gradientEndDark: '#7C3AED', // Violet-600

  // Border Colors
  border: '#E5E7EB', // Gray-200
  borderLight: '#F3F4F6', // Gray-100
  borderDark: '#D1D5DB', // Gray-300

  // Shadow Colors
  shadow: '#000000',
} as const;

export type ColorKey = keyof typeof colors;

// Helper function to get color with opacity
export const colorWithOpacity = (color: string, opacity: number): string => {
  // If hex color, convert to rgba
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};
