// Typography System for CIVIC SETU
// Based on Material Design 3 type scale

import { Platform } from 'react-native';

// Font Families
export const fontFamilies = {
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'System',
  }),
  light: Platform.select({
    ios: 'System',
    android: 'Roboto-Light',
    default: 'System',
  }),
};

// Font Weights
export const fontWeights = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  heavy: '800',
};

// Font Sizes
export const fontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  display1: 32,
  display2: 40,
  display3: 48,
};

// Line Heights
export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.8,
  loose: 2,
};

// Letter Spacing
export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
  widest: 2,
};

// Typography Presets
export const typography = {
  // Display Styles
  displayLarge: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.display3,
    lineHeight: fontSizes.display3 * lineHeights.tight,
    letterSpacing: letterSpacing.tight,
    fontWeight: fontWeights.bold,
  },

  displayMedium: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.display2,
    lineHeight: fontSizes.display2 * lineHeights.tight,
    letterSpacing: letterSpacing.tight,
    fontWeight: fontWeights.bold,
  },

  displaySmall: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.display1,
    lineHeight: fontSizes.display1 * lineHeights.tight,
    letterSpacing: letterSpacing.tight,
    fontWeight: fontWeights.bold,
  },

  // Headline Styles
  headlineLarge: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xxxl,
    lineHeight: fontSizes.xxxl * lineHeights.tight,
    letterSpacing: letterSpacing.normal,
    fontWeight: fontWeights.bold,
  },

  headlineMedium: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.xxl,
    lineHeight: fontSizes.xxl * lineHeights.tight,
    letterSpacing: letterSpacing.normal,
    fontWeight: fontWeights.semibold,
  },

  headlineSmall: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.xl,
    lineHeight: fontSizes.xl * lineHeights.normal,
    letterSpacing: letterSpacing.normal,
    fontWeight: fontWeights.semibold,
  },

  // Title Styles
  titleLarge: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.xl,
    lineHeight: fontSizes.xl * lineHeights.normal,
    letterSpacing: letterSpacing.normal,
    fontWeight: fontWeights.medium,
  },

  titleMedium: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.lg,
    lineHeight: fontSizes.lg * lineHeights.normal,
    letterSpacing: letterSpacing.wide,
    fontWeight: fontWeights.medium,
  },

  titleSmall: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.md,
    lineHeight: fontSizes.md * lineHeights.normal,
    letterSpacing: letterSpacing.wide,
    fontWeight: fontWeights.medium,
  },

  // Body Styles
  bodyLarge: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.lg,
    lineHeight: fontSizes.lg * lineHeights.relaxed,
    letterSpacing: letterSpacing.normal,
    fontWeight: fontWeights.regular,
  },

  bodyMedium: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.md,
    lineHeight: fontSizes.md * lineHeights.relaxed,
    letterSpacing: letterSpacing.normal,
    fontWeight: fontWeights.regular,
  },

  bodySmall: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.sm * lineHeights.relaxed,
    letterSpacing: letterSpacing.normal,
    fontWeight: fontWeights.regular,
  },

  // Label Styles
  labelLarge: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.md,
    lineHeight: fontSizes.md * lineHeights.normal,
    letterSpacing: letterSpacing.wide,
    fontWeight: fontWeights.medium,
  },

  labelMedium: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.sm * lineHeights.normal,
    letterSpacing: letterSpacing.wider,
    fontWeight: fontWeights.medium,
  },

  labelSmall: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.xs,
    lineHeight: fontSizes.xs * lineHeights.normal,
    letterSpacing: letterSpacing.wider,
    fontWeight: fontWeights.medium,
  },

  // Button Style
  button: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.md,
    lineHeight: fontSizes.md * lineHeights.tight,
    letterSpacing: letterSpacing.wider,
    fontWeight: fontWeights.semibold,
    textTransform: 'uppercase',
  },

  // Caption Style
  caption: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.xs,
    lineHeight: fontSizes.xs * lineHeights.normal,
    letterSpacing: letterSpacing.wide,
    fontWeight: fontWeights.regular,
  },

  // Overline Style
  overline: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.xs,
    lineHeight: fontSizes.xs * lineHeights.normal,
    letterSpacing: letterSpacing.widest,
    fontWeight: fontWeights.medium,
    textTransform: 'uppercase',
  },
};

// Helper function to create responsive font size
export const responsiveFontSize = (size) => {
  // You can add more complex logic here for different screen sizes
  return size;
};

// Helper function for text shadows
export const textShadows = {
  small: {
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  medium: {
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  large: {
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 6,
  },
};

export default typography;