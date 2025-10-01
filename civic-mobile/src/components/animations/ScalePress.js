// ScalePress Animation Component for CIVIC SETU
// Provides tactile feedback with scale animation on press

import React, { useRef } from 'react';
import { Animated, Pressable } from 'react-native';

const ScalePress = ({
  children,
  onPress,
  onPressIn,
  onPressOut,
  scaleValue = 0.95,
  duration = 100,
  style,
  disabled = false,
  activeOpacity = 1,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: scaleValue,
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: activeOpacity,
        duration,
        useNativeDriver: true,
      }),
    ]).start();

    onPressIn && onPressIn();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 150,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }),
    ]).start();

    onPressOut && onPressOut();
  };

  if (disabled) {
    return (
      <Animated.View style={[{ opacity: 0.6 }, style]} {...props}>
        {children}
      </Animated.View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      {...props}
    >
      <Animated.View
        style={[
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
          style,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default ScalePress;