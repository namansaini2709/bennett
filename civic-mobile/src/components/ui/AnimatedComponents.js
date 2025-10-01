import React from 'react';
import { TouchableOpacity, Animated, Platform, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../context/ThemeContext';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

// Animated Card Component
export const AnimatedCard = React.forwardRef(({
  children,
  style,
  delay = 0,
  duration = 600,
  animation = 'fadeInUp',
  onPress,
  ...props
}, ref) => {
  const { theme } = useTheme();

  const Component = onPress ? TouchableOpacity : Animatable.View;

  return (
    <Component
      ref={ref}
      animation={animation}
      delay={delay}
      duration={duration}
      onPress={onPress}
      style={[
        {
          backgroundColor: theme.colors.surface.primary,
          borderRadius: theme.borderRadius.md,
          padding: theme.spacing.md,
          ...Platform.select({
            ios: theme.shadows.medium,
            android: { elevation: 4 },
            web: { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' },
          }),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Component>
  );
});

// Animated Button Component
export const AnimatedButton = ({
  children,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  ...props
}) => {
  const { theme } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: theme.animation.scale.press,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    const sizeStyles = {
      small: {
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        minHeight: 36,
      },
      medium: {
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        minHeight: 48,
      },
      large: {
        paddingVertical: theme.spacing.lg,
        paddingHorizontal: theme.spacing.xl,
        minHeight: 56,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      opacity: disabled ? 0.6 : 1,
    };
  };

  const getGradientColors = () => {
    switch (variant) {
      case 'secondary':
        return theme.colors.gradient.secondary;
      case 'success':
        return theme.colors.gradient.success;
      case 'outline':
        return ['transparent', 'transparent'];
      default:
        return theme.colors.gradient.primary;
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={getButtonStyle()}
        activeOpacity={0.8}
        {...props}
      >
        <LinearGradient
          colors={getGradientColors()}
          style={[
            getButtonStyle(),
            variant === 'outline' && {
              borderWidth: 2,
              borderColor: theme.colors.primary.main,
            },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {icon && (
            <Animatable.View
              animation="pulse"
              iterationCount="infinite"
              duration={2000}
              style={{ marginRight: children ? theme.spacing.sm : 0 }}
            >
              {icon}
            </Animatable.View>
          )}
          {children}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Animated Input Component
export const AnimatedInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = React.useState(false);
  const labelAnimation = React.useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderAnimation = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(labelAnimation, {
      toValue: isFocused || value ? 1 : 0,
      duration: theme.animation.duration.fast,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  React.useEffect(() => {
    Animated.timing(borderAnimation, {
      toValue: isFocused ? 1 : 0,
      duration: theme.animation.duration.fast,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const borderColor = borderAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? theme.colors.status.error : theme.colors.border.primary,
      error ? theme.colors.status.error : theme.colors.border.focus,
    ],
  });

  return (
    <Animatable.View
      animation="fadeInUp"
      style={[{ marginBottom: theme.spacing.md }, style]}
    >
      {label && (
        <Animated.Text
          style={{
            position: 'absolute',
            left: theme.spacing.md,
            top: labelAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [20, -8],
            }),
            fontSize: labelAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [16, 12],
            }),
            color: error
              ? theme.colors.status.error
              : isFocused
                ? theme.colors.primary.main
                : theme.colors.text.secondary,
            backgroundColor: theme.colors.background.secondary,
            paddingHorizontal: 4,
            zIndex: 10,
          }}
        >
          {label}
        </Animated.Text>
      )}
      <AnimatedTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={!label || isFocused ? placeholder : ''}
        placeholderTextColor={theme.colors.text.tertiary}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{
          borderWidth: 2,
          borderColor: borderColor,
          borderRadius: theme.borderRadius.sm,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
          backgroundColor: theme.colors.surface.primary,
          color: theme.colors.text.primary,
          fontSize: 16,
          minHeight: 48,
        }}
        {...props}
      />
      {error && (
        <Animatable.Text
          animation="shake"
          style={{
            color: theme.colors.status.error,
            fontSize: 12,
            marginTop: theme.spacing.xs,
            marginLeft: theme.spacing.xs,
          }}
        >
          {error}
        </Animatable.Text>
      )}
    </Animatable.View>
  );
};

// Floating Action Button
export const FloatingActionButton = ({
  onPress,
  icon,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: Platform.OS !== 'web',
      })
    );
    rotateAnimation.start();
    return () => rotateAnimation.stop();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: theme.spacing.xl,
          right: theme.spacing.xl,
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        {...props}
      >
        <LinearGradient
          colors={theme.colors.gradient.primary}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
            ...Platform.select({
              ios: theme.shadows.large,
              android: { elevation: 8 },
              web: { boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)' },
            }),
          }}
        >
          <Animated.View style={{ transform: [{ rotate }] }}>
            {icon}
          </Animated.View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Loading Overlay
export const LoadingOverlay = ({ visible, text = 'Loading...' }) => {
  const { theme } = useTheme();

  if (!visible) return null;

  return (
    <Animatable.View
      animation="fadeIn"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.background.overlay,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <AnimatedCard
        style={{
          alignItems: 'center',
          paddingVertical: theme.spacing.xl,
          paddingHorizontal: theme.spacing.lg,
        }}
      >
        <Animatable.View
          animation="rotate"
          iterationCount="infinite"
          duration={1000}
          style={{
            width: 40,
            height: 40,
            borderWidth: 4,
            borderColor: theme.colors.primary.main,
            borderTopColor: 'transparent',
            borderRadius: 20,
            marginBottom: theme.spacing.md,
          }}
        />
        <Animatable.Text
          animation="pulse"
          iterationCount="infinite"
          style={{
            color: theme.colors.text.primary,
            fontSize: 16,
            fontWeight: '500',
          }}
        >
          {text}
        </Animatable.Text>
      </AnimatedCard>
    </Animatable.View>
  );
};