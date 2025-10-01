// Spacing System for CIVIC SETU
// Based on 8px grid system for consistency

// Base unit for spacing (8px grid)
const BASE_UNIT = 8;

// Spacing scale
export const spacing = {
  // Named sizes
  none: 0,
  xxs: BASE_UNIT * 0.5,  // 4px
  xs: BASE_UNIT,          // 8px
  sm: BASE_UNIT * 1.5,    // 12px
  md: BASE_UNIT * 2,      // 16px
  lg: BASE_UNIT * 3,      // 24px
  xl: BASE_UNIT * 4,      // 32px
  xxl: BASE_UNIT * 5,     // 40px
  xxxl: BASE_UNIT * 6,    // 48px

  // Numeric scale (for flexibility)
  0: 0,
  1: BASE_UNIT * 0.5,     // 4px
  2: BASE_UNIT,           // 8px
  3: BASE_UNIT * 1.5,     // 12px
  4: BASE_UNIT * 2,       // 16px
  5: BASE_UNIT * 2.5,     // 20px
  6: BASE_UNIT * 3,       // 24px
  7: BASE_UNIT * 3.5,     // 28px
  8: BASE_UNIT * 4,       // 32px
  9: BASE_UNIT * 4.5,     // 36px
  10: BASE_UNIT * 5,      // 40px
  12: BASE_UNIT * 6,      // 48px
  14: BASE_UNIT * 7,      // 56px
  16: BASE_UNIT * 8,      // 64px
  20: BASE_UNIT * 10,     // 80px
  24: BASE_UNIT * 12,     // 96px
  32: BASE_UNIT * 16,     // 128px
};

// Padding presets
export const padding = {
  // Component padding
  button: {
    horizontal: spacing.md,
    vertical: spacing.sm,
  },
  card: {
    all: spacing.md,
    horizontal: spacing.md,
    vertical: spacing.lg,
  },
  input: {
    horizontal: spacing.sm,
    vertical: spacing.xs,
  },
  container: {
    horizontal: spacing.md,
    vertical: spacing.lg,
  },
  screen: {
    horizontal: spacing.md,
    vertical: spacing.lg,
    top: spacing.xl,
    bottom: spacing.lg,
  },
  section: {
    horizontal: spacing.md,
    vertical: spacing.xl,
  },
  listItem: {
    horizontal: spacing.md,
    vertical: spacing.sm,
  },
};

// Margin presets
export const margin = {
  // Component margins
  element: {
    bottom: spacing.md,
    top: spacing.md,
  },
  section: {
    bottom: spacing.xl,
    top: spacing.xl,
  },
  paragraph: {
    bottom: spacing.md,
  },
  heading: {
    top: spacing.lg,
    bottom: spacing.md,
  },
  list: {
    vertical: spacing.sm,
  },
  form: {
    field: spacing.md,
    group: spacing.lg,
  },
};

// Border radius
export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,

  // Component specific
  button: 8,
  card: 12,
  input: 8,
  avatar: 9999,
  chip: 16,
  modal: 16,
  bottomSheet: 24,
};

// Elevation (shadow depth)
export const elevation = {
  none: 0,
  xs: 1,
  sm: 2,
  md: 4,
  lg: 8,
  xl: 12,
  xxl: 16,

  // Component specific
  card: 2,
  cardHover: 8,
  modal: 16,
  dropdown: 8,
  fab: 6,
  bottomSheet: 16,
  appBar: 4,
};

// Layout dimensions
export const layout = {
  // Screen dimensions helpers
  screenPadding: spacing.md,

  // Component heights
  headerHeight: 56,
  tabBarHeight: 56,
  buttonHeight: {
    small: 32,
    medium: 40,
    large: 48,
  },
  inputHeight: {
    small: 36,
    medium: 44,
    large: 52,
  },

  // Component widths
  maxContentWidth: 600,
  sidebarWidth: 280,

  // Icon sizes
  iconSize: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
  },

  // Avatar sizes
  avatarSize: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 72,
  },
};

// Z-index layers
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  modal: 1030,
  popover: 1040,
  tooltip: 1050,
  toast: 1060,
  fab: 1070,
};

// Helper function to create consistent spacing
export const createSpacing = (...values) => {
  return values.map(v => spacing[v] || v).join(' ');
};

// Helper function to create box shadow
export const createShadow = (elevation) => ({
  boxShadow: `0px ${elevation / 2}px ${elevation}px rgba(0, 0, 0, ${0.1 + (elevation * 0.01)})`,
  elevation: elevation,
});

// Shadows presets
export const shadows = {
  none: createShadow(0),
  xs: createShadow(1),
  sm: createShadow(2),
  md: createShadow(4),
  lg: createShadow(8),
  xl: createShadow(12),
  xxl: createShadow(16),
};

export default {
  spacing,
  padding,
  margin,
  borderRadius,
  elevation,
  layout,
  zIndex,
  shadows,
};