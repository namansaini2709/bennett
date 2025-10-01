// Global Styles for CIVIC SETU
// Common style patterns and utilities

import { StyleSheet, Platform } from 'react-native';
import { spacing, padding, margin, borderRadius, shadows, layout } from '../theme';

// Global style utilities
export const globalStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },

  safeContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
  },

  screenContainer: {
    flex: 1,
    paddingHorizontal: padding.screen.horizontal,
    paddingVertical: padding.screen.vertical,
    backgroundColor: '#FAFAFA',
  },

  contentContainer: {
    paddingHorizontal: padding.container.horizontal,
    paddingVertical: padding.container.vertical,
  },

  // Layout utilities
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  column: {
    flexDirection: 'column',
  },

  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Flex utilities
  flex1: {
    flex: 1,
  },

  flex2: {
    flex: 2,
  },

  flex3: {
    flex: 3,
  },

  flexGrow: {
    flexGrow: 1,
  },

  flexShrink: {
    flexShrink: 1,
  },

  // Card styles
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.card,
    padding: padding.card.all,
    marginBottom: margin.element.bottom,
    ...shadows.sm,
  },

  cardElevated: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.card,
    padding: padding.card.all,
    marginBottom: margin.element.bottom,
    ...shadows.md,
  },

  // Section styles
  section: {
    marginBottom: margin.section.bottom,
  },

  sectionHeader: {
    marginBottom: margin.heading.bottom,
  },

  // List styles
  listContainer: {
    paddingVertical: padding.container.vertical,
  },

  listItem: {
    paddingHorizontal: padding.listItem.horizontal,
    paddingVertical: padding.listItem.vertical,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },

  listItemLast: {
    borderBottomWidth: 0,
  },

  // Form styles
  formGroup: {
    marginBottom: margin.form.group,
  },

  formField: {
    marginBottom: margin.form.field,
  },

  formLabel: {
    marginBottom: spacing.xs,
  },

  formError: {
    marginTop: spacing.xs,
    color: '#F44336',
  },

  // Button styles
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: margin.element.top,
  },

  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  // Input styles
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: borderRadius.input,
    paddingHorizontal: padding.input.horizontal,
    paddingVertical: padding.input.vertical,
    fontSize: 14,
    color: '#212121',
    backgroundColor: '#FFFFFF',
  },

  inputFocused: {
    borderColor: '#2196F3',
  },

  inputError: {
    borderColor: '#F44336',
  },

  // Text styles
  textCenter: {
    textAlign: 'center',
  },

  textLeft: {
    textAlign: 'left',
  },

  textRight: {
    textAlign: 'right',
  },

  textBold: {
    fontWeight: 'bold',
  },

  textMedium: {
    fontWeight: '500',
  },

  textLight: {
    fontWeight: '300',
  },

  textUppercase: {
    textTransform: 'uppercase',
  },

  textCapitalize: {
    textTransform: 'capitalize',
  },

  // Color utilities
  textPrimary: {
    color: '#212121',
  },

  textSecondary: {
    color: '#757575',
  },

  textError: {
    color: '#F44336',
  },

  textSuccess: {
    color: '#4CAF50',
  },

  textWarning: {
    color: '#FF9800',
  },

  textInfo: {
    color: '#03A9F4',
  },

  textWhite: {
    color: '#FFFFFF',
  },

  bgPrimary: {
    backgroundColor: '#2196F3',
  },

  bgSecondary: {
    backgroundColor: '#4CAF50',
  },

  bgError: {
    backgroundColor: '#F44336',
  },

  bgSuccess: {
    backgroundColor: '#4CAF50',
  },

  bgWarning: {
    backgroundColor: '#FF9800',
  },

  bgInfo: {
    backgroundColor: '#03A9F4',
  },

  bgWhite: {
    backgroundColor: '#FFFFFF',
  },

  bgGray: {
    backgroundColor: '#F5F5F5',
  },

  // Border utilities
  border: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },

  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },

  borderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0',
  },

  borderRight: {
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },

  // Shadow utilities
  shadowSm: shadows.sm,
  shadowMd: shadows.md,
  shadowLg: shadows.lg,
  shadowXl: shadows.xl,

  // Spacing utilities
  p0: { padding: spacing.none },
  p1: { padding: spacing.xs },
  p2: { padding: spacing.sm },
  p3: { padding: spacing.md },
  p4: { padding: spacing.lg },
  p5: { padding: spacing.xl },

  px0: { paddingHorizontal: spacing.none },
  px1: { paddingHorizontal: spacing.xs },
  px2: { paddingHorizontal: spacing.sm },
  px3: { paddingHorizontal: spacing.md },
  px4: { paddingHorizontal: spacing.lg },
  px5: { paddingHorizontal: spacing.xl },

  py0: { paddingVertical: spacing.none },
  py1: { paddingVertical: spacing.xs },
  py2: { paddingVertical: spacing.sm },
  py3: { paddingVertical: spacing.md },
  py4: { paddingVertical: spacing.lg },
  py5: { paddingVertical: spacing.xl },

  m0: { margin: spacing.none },
  m1: { margin: spacing.xs },
  m2: { margin: spacing.sm },
  m3: { margin: spacing.md },
  m4: { margin: spacing.lg },
  m5: { margin: spacing.xl },

  mx0: { marginHorizontal: spacing.none },
  mx1: { marginHorizontal: spacing.xs },
  mx2: { marginHorizontal: spacing.sm },
  mx3: { marginHorizontal: spacing.md },
  mx4: { marginHorizontal: spacing.lg },
  mx5: { marginHorizontal: spacing.xl },

  my0: { marginVertical: spacing.none },
  my1: { marginVertical: spacing.xs },
  my2: { marginVertical: spacing.sm },
  my3: { marginVertical: spacing.md },
  my4: { marginVertical: spacing.lg },
  my5: { marginVertical: spacing.xl },

  mt0: { marginTop: spacing.none },
  mt1: { marginTop: spacing.xs },
  mt2: { marginTop: spacing.sm },
  mt3: { marginTop: spacing.md },
  mt4: { marginTop: spacing.lg },
  mt5: { marginTop: spacing.xl },

  mb0: { marginBottom: spacing.none },
  mb1: { marginBottom: spacing.xs },
  mb2: { marginBottom: spacing.sm },
  mb3: { marginBottom: spacing.md },
  mb4: { marginBottom: spacing.lg },
  mb5: { marginBottom: spacing.xl },

  // Border radius utilities
  rounded: { borderRadius: borderRadius.md },
  roundedSm: { borderRadius: borderRadius.sm },
  roundedLg: { borderRadius: borderRadius.lg },
  roundedFull: { borderRadius: borderRadius.full },
  roundedTop: {
    borderTopLeftRadius: borderRadius.md,
    borderTopRightRadius: borderRadius.md,
  },
  roundedBottom: {
    borderBottomLeftRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.md,
  },

  // Visibility utilities
  hidden: {
    display: 'none',
  },

  visible: {
    display: 'flex',
  },

  // Position utilities
  absolute: {
    position: 'absolute',
  },

  relative: {
    position: 'relative',
  },

  absoluteFill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  // Dimension utilities
  w100: {
    width: '100%',
  },

  h100: {
    height: '100%',
  },

  // Avatar sizes
  avatarSm: {
    width: layout.avatarSize.sm,
    height: layout.avatarSize.sm,
    borderRadius: layout.avatarSize.sm / 2,
  },

  avatarMd: {
    width: layout.avatarSize.md,
    height: layout.avatarSize.md,
    borderRadius: layout.avatarSize.md / 2,
  },

  avatarLg: {
    width: layout.avatarSize.lg,
    height: layout.avatarSize.lg,
    borderRadius: layout.avatarSize.lg / 2,
  },

  // Icon sizes
  iconSm: {
    width: layout.iconSize.sm,
    height: layout.iconSize.sm,
  },

  iconMd: {
    width: layout.iconSize.md,
    height: layout.iconSize.md,
  },

  iconLg: {
    width: layout.iconSize.lg,
    height: layout.iconSize.lg,
  },

  // Loading & Empty states
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },

  // Modal & Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.modal,
    padding: padding.container.all,
    ...shadows.xl,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: margin.element.bottom,
  },

  dividerThick: {
    height: 2,
    backgroundColor: '#E0E0E0',
    marginVertical: margin.element.bottom,
  },
});

// Helper function to combine styles
export const combineStyles = (...styles) => {
  return StyleSheet.flatten(styles);
};

export default globalStyles;