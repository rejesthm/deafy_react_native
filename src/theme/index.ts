import {colors} from './colors';
import {spacing, radius, dimensions, shadows, animation, zIndex, opacity} from './tokens';
import {typography} from './typography';

export const theme = {
  colors,
  spacing,
  radius,
  dimensions,
  shadows,
  animation,
  zIndex,
  opacity,
  typography,
} as const;

export type Theme = typeof theme;
export {colors, typography};
export {spacing, radius, dimensions, shadows, animation, zIndex, opacity} from './tokens';
