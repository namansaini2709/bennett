// FadeIn Animation Component for CIVIC SETU
// Smooth fade-in animation with customizable duration and delay

import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

const FadeIn = ({
  children,
  duration = 800,
  delay = 0,
  style,
  onAnimationComplete,
  startValue = 0,
  endValue = 1,
  ...props
}) => {
  const fadeAnim = useRef(new Animated.Value(startValue)).current;

  useEffect(() => {
    const animation = Animated.timing(fadeAnim, {
      toValue: endValue,
      duration,
      delay,
      useNativeDriver: true,
    });

    animation.start(({ finished }) => {
      if (finished && onAnimationComplete) {
        onAnimationComplete();
      }
    });

    return () => animation.stop();
  }, [duration, delay, endValue]);

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

export default FadeIn;