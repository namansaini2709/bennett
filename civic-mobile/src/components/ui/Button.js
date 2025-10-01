// Custom Button Component for CIVIC SETU
// Enhanced button with multiple variants and states

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ButtonText } from './Typography';
import { spacing, borderRadius, shadows } from '../../theme';
import { ScalePress } from '../animations';

const CustomButton = ({
  children,
  onPress,
  variant = 'contained', // contained, outlined, text, elevated
  size = 'medium', // small, medium, large
  color = 'primary', // primary, secondary, error, success, warning
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  ...props
}) => {
  const theme = useTheme();
  const colors = theme.custom?.colors || {};

  // Get button colors based on variant and color prop
  const getButtonColors = () => {
    const defaultColors = {
      primary: { main: '#2196F3', contrast: '#FFFFFF' },
      secondary: { main: '#757575', contrast: '#FFFFFF' },
      error: { main: '#F44336', contrast: '#FFFFFF' },
      success: { main: '#4CAF50', contrast: '#FFFFFF' },
      warning: { main: '#FF9800', contrast: '#FFFFFF' }
    };

    const colorSet = colors[color] || defaultColors[color] || defaultColors.primary;

    switch (variant) {
      case 'contained':
        return {
          backgroundColor: disabled ? '#E0E0E0' : colorSet.main,
          textColor: disabled ? '#BDBDBD' : colorSet.contrast || '#FFFFFF',
          borderColor: 'transparent',
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          textColor: disabled ? '#BDBDBD' : colorSet.main,
          borderColor: disabled ? '#E0E0E0' : colorSet.main,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          textColor: disabled ? '#BDBDBD' : colorSet.main,
          borderColor: 'transparent',
        };
      case 'elevated':
        return {
          backgroundColor: disabled ? '#F5F5F5' : '#FFFFFF',
          textColor: disabled ? '#BDBDBD' : colorSet.main,
          borderColor: 'transparent',
        };
      default:
        return {
          backgroundColor: colorSet.main,
          textColor: colorSet.contrast || '#FFFFFF',
          borderColor: 'transparent',
        };
    }
  };

  // Get button size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          minHeight: 32,
          fontSize: 12,
          iconSize: 16,
        };
      case 'large':
        return {
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          minHeight: 48,
          fontSize: 16,
          iconSize: 24,
        };
      case 'medium':
      default:
        return {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          minHeight: 40,
          fontSize: 14,
          iconSize: 20,
        };
    }
  };

  const buttonColors = getButtonColors();
  const sizeStyles = getSizeStyles();

  const buttonStyles = [
    styles.button,
    {
      backgroundColor: buttonColors.backgroundColor,
      borderColor: buttonColors.borderColor,
      paddingHorizontal: sizeStyles.paddingHorizontal,
      paddingVertical: sizeStyles.paddingVertical,
      minHeight: sizeStyles.minHeight,
    },
    variant === 'outlined' && styles.outlined,
    variant === 'elevated' && styles.elevated,
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    {
      color: buttonColors.textColor,
      fontSize: sizeStyles.fontSize,
    },
    textStyle,
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={buttonColors.textColor}
        />
      );
    }

    return (
      <View style={styles.content}>
        {icon && iconPosition === 'left' && (
          <MaterialCommunityIcons
            name={icon}
            size={sizeStyles.iconSize}
            color={buttonColors.textColor}
            style={styles.iconLeft}
          />
        )}
        <ButtonText style={textStyles}>
          {children}
        </ButtonText>
        {icon && iconPosition === 'right' && (
          <MaterialCommunityIcons
            name={icon}
            size={sizeStyles.iconSize}
            color={buttonColors.textColor}
            style={styles.iconRight}
          />
        )}
      </View>
    );
  };

  return (
    <ScalePress
      onPress={onPress}
      disabled={disabled || loading}
      scaleValue={0.96}
      duration={150}
      style={buttonStyles}
      {...props}
    >
      {renderContent()}
    </ScalePress>
  );
};

// Icon Button Component
export const IconButton = ({
  icon,
  onPress,
  size = 'medium',
  color = 'primary',
  disabled = false,
  style,
  ...props
}) => {
  const theme = useTheme();
  const colors = theme.custom?.colors || {};
  const defaultColors = {
    primary: { main: '#2196F3', contrast: '#FFFFFF' },
    secondary: { main: '#757575', contrast: '#FFFFFF' },
    error: { main: '#F44336', contrast: '#FFFFFF' },
    success: { main: '#4CAF50', contrast: '#FFFFFF' },
    warning: { main: '#FF9800', contrast: '#FFFFFF' }
  };
  const colorSet = colors[color] || defaultColors[color] || defaultColors.primary;

  const getSizeValue = () => {
    switch (size) {
      case 'small': return 32;
      case 'large': return 48;
      case 'medium':
      default: return 40;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'large': return 24;
      case 'medium':
      default: return 20;
    }
  };

  const buttonSize = getSizeValue();
  const iconSize = getIconSize();

  return (
    <ScalePress
      onPress={onPress}
      disabled={disabled}
      scaleValue={0.9}
      duration={120}
      style={[
        styles.iconButton,
        {
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
        },
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      <MaterialCommunityIcons
        name={icon}
        size={iconSize}
        color={disabled ? colors.text?.disabled || '#BDBDBD' : colorSet.main}
      />
    </ScalePress>
  );
};

// Floating Action Button Component
export const FAB = ({
  icon,
  onPress,
  color = 'primary',
  position = 'bottom-right', // bottom-right, bottom-left, bottom-center
  extended = false,
  label,
  disabled = false,
  style,
  ...props
}) => {
  const theme = useTheme();
  const colors = theme.custom?.colors || {};
  const defaultColors = {
    primary: { main: '#2196F3', contrast: '#FFFFFF' },
    secondary: { main: '#757575', contrast: '#FFFFFF' },
    error: { main: '#F44336', contrast: '#FFFFFF' },
    success: { main: '#4CAF50', contrast: '#FFFFFF' },
    warning: { main: '#FF9800', contrast: '#FFFFFF' }
  };
  const colorSet = colors[color] || defaultColors[color] || defaultColors.primary;

  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-left':
        return { bottom: 16, left: 16 };
      case 'bottom-center':
        return { bottom: 16, alignSelf: 'center' };
      case 'bottom-right':
      default:
        return { bottom: 16, right: 16 };
    }
  };

  return (
    <ScalePress
      onPress={onPress}
      disabled={disabled}
      scaleValue={0.92}
      duration={200}
      style={[
        styles.fab,
        extended && styles.fabExtended,
        {
          backgroundColor: disabled ? colors.neutral?.gray?.[300] || '#E0E0E0' : colorSet.main,
        },
        getPositionStyles(),
        style,
      ]}
      {...props}
    >
      <MaterialCommunityIcons
        name={icon}
        size={24}
        color={disabled ? colors.text?.disabled || '#BDBDBD' : colorSet.contrast || '#FFFFFF'}
      />
      {extended && label && (
        <ButtonText
          style={[
            styles.fabLabel,
            { color: colorSet.contrast || '#FFFFFF' }
          ]}
        >
          {label}
        </ButtonText>
      )}
    </ScalePress>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.button,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  outlined: {
    borderWidth: 1.5,
  },
  elevated: {
    ...shadows.md,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: spacing.xs,
  },
  iconRight: {
    marginLeft: spacing.xs,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  fabExtended: {
    width: 'auto',
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
  },
  fabLabel: {
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
});

export default CustomButton;