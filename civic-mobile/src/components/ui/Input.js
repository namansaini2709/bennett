// Custom Input Component for CIVIC SETU
// Enhanced text input with validation and theming

import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Animated, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { Text, Caption, ErrorText } from './Typography';
import { spacing, borderRadius, colors as themeColors } from '../../theme';

const CustomInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helperText,
  secureTextEntry,
  leftIcon,
  rightIcon,
  onRightIconPress,
  variant = 'outlined', // outlined, filled, standard
  size = 'medium', // small, medium, large
  multiline = false,
  numberOfLines = 1,
  maxLength,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  disabled = false,
  required = false,
  style,
  inputStyle,
  containerStyle,
  onFocus,
  onBlur,
  ...props
}) => {
  const theme = useTheme();
  const colors = theme.custom?.colors || themeColors;
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  const animatedLabelPosition = useRef(new Animated.Value(value ? 1 : 0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedLabelPosition, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onFocus && onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value) {
      Animated.timing(animatedLabelPosition, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
    onBlur && onBlur();
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.sm,
          fontSize: 12,
          minHeight: 36,
        };
      case 'large':
        return {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.md,
          fontSize: 16,
          minHeight: 52,
        };
      case 'medium':
      default:
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          fontSize: 14,
          minHeight: 44,
        };
    }
  };

  const getVariantStyles = () => {
    const borderColor = error
      ? colors.error?.main || '#F44336'
      : isFocused
      ? colors.primary?.main || '#2196F3'
      : colors.border?.default || '#E0E0E0';

    switch (variant) {
      case 'filled':
        return {
          backgroundColor: disabled
            ? colors.neutral?.gray?.[100] || '#F5F5F5'
            : colors.neutral?.gray?.[50] || '#FAFAFA',
          borderBottomWidth: 2,
          borderBottomColor: borderColor,
          borderTopLeftRadius: borderRadius.sm,
          borderTopRightRadius: borderRadius.sm,
        };
      case 'standard':
        return {
          backgroundColor: 'transparent',
          borderBottomWidth: 1,
          borderBottomColor: borderColor,
        };
      case 'outlined':
      default:
        return {
          backgroundColor: disabled ? colors.neutral?.gray?.[50] || '#FAFAFA' : colors.background?.paper || '#FFFFFF',
          borderWidth: isFocused ? 2 : 1,
          borderColor: borderColor,
          borderRadius: borderRadius.input,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  const labelStyle = {
    position: 'absolute',
    left: leftIcon ? 40 : sizeStyles.paddingHorizontal,
    top: animatedLabelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [sizeStyles.paddingVertical + 2, -12],
    }),
    fontSize: animatedLabelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [sizeStyles.fontSize, 12],
    }),
    color: error
      ? colors.error?.main || '#F44336'
      : isFocused
      ? colors.primary?.main || '#2196F3'
      : colors.text?.secondary || '#757575',
    backgroundColor: variant === 'outlined' ? colors.background?.paper || '#FFFFFF' : 'transparent',
    paddingHorizontal: variant === 'outlined' ? 4 : 0,
    zIndex: 10,
  };

  const showPasswordIcon = secureTextEntry && value;

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.inputContainer, style]}>
        {label && (
          <Animated.Text style={labelStyle}>
            {label}{required ? ' *' : ''}
          </Animated.Text>
        )}

        <View style={styles.inputWrapper}>
          {leftIcon ? (
            <MaterialCommunityIcons
              name={leftIcon}
              size={20}
              color={colors.text?.secondary || '#757575'}
              style={styles.leftIcon}
            />
          ) : null}

          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={!label || isFocused ? placeholder : ''}
            placeholderTextColor={'#9CA3AF'}
            secureTextEntry={secureTextEntry && !isPasswordVisible}
            multiline={multiline}
            numberOfLines={numberOfLines}
            maxLength={maxLength}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            editable={!disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={[
              styles.input,
              sizeStyles,
              variantStyles,
              leftIcon && styles.inputWithLeftIcon,
              (rightIcon || showPasswordIcon) && styles.inputWithRightIcon,
              multiline && styles.multilineInput,
              disabled && styles.disabledInput,
              inputStyle,
            ]}
            {...props}
          />

          {showPasswordIcon ? (
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              style={styles.rightIconButton}
            >
              <MaterialCommunityIcons
                name={isPasswordVisible ? 'eye-off' : 'eye'}
                size={20}
                color={colors.text?.secondary || '#757575'}
              />
            </TouchableOpacity>
          ) : null}

          {rightIcon && !showPasswordIcon ? (
            <TouchableOpacity
              onPress={onRightIconPress}
              disabled={!onRightIconPress}
              style={styles.rightIconButton}
            >
              <MaterialCommunityIcons
                name={rightIcon}
                size={20}
                color={colors.text?.secondary || '#757575'}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        {maxLength ? (
          <Caption style={styles.charCounter}>
            {value?.length || 0} / {maxLength}
          </Caption>
        ) : null}
      </View>

      {error ? (
        <ErrorText style={styles.errorText}>
          {error}
        </ErrorText>
      ) : null}

      {helperText && !error ? (
        <Caption style={styles.helperText}>
          {helperText}
        </Caption>
      ) : null}
    </View>
  );
};

// Search Input Component
export const SearchInput = ({
  value,
  onChangeText,
  onSearch,
  onClear,
  placeholder = 'Search...',
  style,
  ...props
}) => {
  const theme = useTheme();
  const colors = theme.custom?.colors || themeColors;

  return (
    <View style={[styles.searchContainer, style]}>
      <MaterialCommunityIcons
        name="magnify"
        size={20}
        color={colors.text?.secondary || '#757575'}
        style={styles.searchIcon}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text?.hint || '#9E9E9E'}
        style={[styles.searchInput, { color: colors.text?.primary || '#212121' }]}
        onSubmitEditing={onSearch}
        returnKeyType="search"
        {...props}
      />
      {value ? (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <MaterialCommunityIcons
            name="close-circle"
            size={18}
            color={colors.text?.secondary || '#757575'}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

// OTP Input Component
export const OTPInput = ({
  value = '',
  onChangeText,
  length = 6,
  error,
  style,
  ...props
}) => {
  const theme = useTheme();
  const colors = theme.custom?.colors || themeColors;
  const inputRefs = useRef([]);

  const handleChange = (text, index) => {
    const newValue = value.split('');
    newValue[index] = text;
    const updatedValue = newValue.join('');
    onChangeText(updatedValue);

    // Move to next input
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={[styles.otpContainer, style]}>
      {Array.from({ length }, (_, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          value={value[index] || ''}
          onChangeText={(text) => handleChange(text.slice(-1), index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          style={[
            styles.otpInput,
            {
              borderColor: error ? colors.error?.main || '#F44336' : colors.border?.default || '#E0E0E0',
              color: colors.text?.primary || '#212121',
            },
          ]}
          keyboardType="numeric"
          maxLength={1}
          selectTextOnFocus
          {...props}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  inputContainer: {
    position: 'relative',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    letterSpacing: 0.1,
  },
  inputWithLeftIcon: {
    paddingLeft: 65,
  },
  inputWithRightIcon: {
    paddingRight: 50,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  disabledInput: {
    opacity: 0.6,
  },
  leftIcon: {
    position: 'absolute',
    left: 16,
    top: '50%',
    marginTop: -10,
    zIndex: 1,
  },
  rightIconButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
    zIndex: 1,
  },
  errorText: {
    marginTop: spacing.xs,
  },
  helperText: {
    marginTop: spacing.xs,
  },
  charCounter: {
    position: 'absolute',
    right: 12,
    bottom: -20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    height: 40,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  clearButton: {
    marginLeft: spacing.sm,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  otpInput: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CustomInput;