// Main Theme Configuration for CIVIC SETU
// Combines all theme elements into a unified theme object

import { DefaultTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import { colors, darkColors } from './colors';
import { typography, fontFamilies } from './typography';
import spacingConfig from './spacing';

const { spacing, padding, margin, borderRadius, elevation, layout, zIndex, shadows } = spacingConfig;

// Light Theme Configuration
export const lightTheme = {
  ...DefaultTheme,

  // React Native Paper theme properties
  dark: false,
  roundness: borderRadius.md,

  colors: {
    ...DefaultTheme.colors,
    // Primary colors
    primary: colors.primary.main,
    onPrimary: colors.primary.contrast,
    primaryContainer: colors.primary.light,
    onPrimaryContainer: colors.primary.dark,

    // Secondary colors
    secondary: colors.secondary.main,
    onSecondary: colors.secondary.contrast,
    secondaryContainer: colors.secondary.light,
    onSecondaryContainer: colors.secondary.dark,

    // Tertiary colors (using accent)
    tertiary: colors.accent.main,
    onTertiary: colors.accent.contrast,
    tertiaryContainer: colors.accent.light,
    onTertiaryContainer: colors.accent.dark,

    // Error colors
    error: colors.error.main,
    onError: colors.error.contrast,
    errorContainer: colors.error.light,
    onErrorContainer: colors.error.dark,

    // Background colors
    background: colors.background.default,
    onBackground: colors.text.primary,

    // Surface colors
    surface: colors.background.paper,
    onSurface: colors.text.primary,
    surfaceVariant: colors.neutral.gray[100],
    onSurfaceVariant: colors.text.secondary,
    surfaceDisabled: colors.neutral.gray[200],
    onSurfaceDisabled: colors.text.disabled,

    // Outline colors
    outline: colors.border.default,
    outlineVariant: colors.border.light,

    // Other colors
    inverseSurface: colors.neutral.gray[900],
    inverseOnSurface: colors.text.inverse,
    inversePrimary: colors.primary.light,

    // Additional custom colors
    success: colors.success.main,
    warning: colors.warning.main,
    info: colors.info.main,
  },

  // Custom theme properties
  custom: {
    colors,
    typography,
    spacing,
    padding,
    margin,
    borderRadius,
    elevation,
    layout,
    zIndex,
    shadows,

    // Status colors
    statusColors: colors.status,

    // Category colors
    categoryColors: colors.category,

    // Gradients
    gradients: colors.gradients,
  },

  // Configure fonts for React Native Paper
  fonts: configureFonts({
    config: {
      fontFamily: fontFamilies.regular,
    },
  }),
};

// Dark Theme Configuration
export const darkTheme = {
  ...MD3DarkTheme,

  // React Native Paper theme properties
  dark: true,
  roundness: borderRadius.md,

  colors: {
    ...MD3DarkTheme.colors,
    // Primary colors
    primary: darkColors.primary.main,
    onPrimary: darkColors.primary.contrast,
    primaryContainer: darkColors.primary.dark,
    onPrimaryContainer: darkColors.primary.light,

    // Secondary colors
    secondary: colors.secondary.light,
    onSecondary: colors.secondary.contrast,
    secondaryContainer: colors.secondary.dark,
    onSecondaryContainer: colors.secondary.light,

    // Tertiary colors (using accent)
    tertiary: colors.accent.light,
    onTertiary: colors.accent.contrast,
    tertiaryContainer: colors.accent.dark,
    onTertiaryContainer: colors.accent.light,

    // Error colors
    error: colors.error.light,
    onError: colors.error.contrast,
    errorContainer: colors.error.dark,
    onErrorContainer: colors.error.light,

    // Background colors
    background: darkColors.background.default,
    onBackground: darkColors.text.primary,

    // Surface colors
    surface: darkColors.background.paper,
    onSurface: darkColors.text.primary,
    surfaceVariant: darkColors.background.elevated,
    onSurfaceVariant: darkColors.text.secondary,
    surfaceDisabled: darkColors.neutral.gray[800],
    onSurfaceDisabled: darkColors.text.disabled,

    // Outline colors
    outline: darkColors.border.default,
    outlineVariant: darkColors.border.light,

    // Other colors
    inverseSurface: colors.neutral.gray[100],
    inverseOnSurface: darkColors.text.inverse,
    inversePrimary: colors.primary.dark,

    // Additional custom colors
    success: colors.success.light,
    warning: colors.warning.light,
    info: colors.info.light,
  },

  // Custom theme properties
  custom: {
    colors: darkColors,
    typography,
    spacing,
    padding,
    margin,
    borderRadius,
    elevation,
    layout,
    zIndex,
    shadows,

    // Status colors
    statusColors: colors.status,

    // Category colors
    categoryColors: colors.category,

    // Gradients
    gradients: colors.gradients,
  },

  // Configure fonts for React Native Paper
  fonts: configureFonts({
    config: {
      fontFamily: fontFamilies.regular,
    },
  }),
};

// Helper function to get theme based on dark mode
export const getTheme = (isDarkMode) => {
  return isDarkMode ? darkTheme : lightTheme;
};

// Export individual theme elements for direct use
export { colors, darkColors, typography, spacing, padding, margin, borderRadius, elevation, layout, zIndex, shadows };

// Export default theme
export default lightTheme;