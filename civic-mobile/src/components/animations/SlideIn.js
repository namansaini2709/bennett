// SlideIn Animation Component for CIVIC SETU
// Smooth slide-in animation from different directions

import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

const SlideIn = ({
  children,
  direction = 'up', // up, down, left, right
  duration = 600,
  delay = 0,
  distance = 50,
  style,
  onAnimationComplete,
  ...props
}) => {
  const slideAnim = useRef(new Animated.Value(distance)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: duration * 0.8,
        delay: delay + duration * 0.2,
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished && onAnimationComplete) {
        onAnimationComplete();
      }
    });

    return () => animation.stop();
  }, [duration, delay, distance]);

  const getTransform = () => {
    switch (direction) {
      case 'up':
        return [{ translateY: slideAnim }];
      case 'down':
        return [{ translateY: slideAnim.interpolate({
          inputRange: [0, distance],
          outputRange: [0, -distance],
        }) }];
      case 'left':
        return [{ translateX: slideAnim.interpolate({
          inputRange: [0, distance],
          outputRange: [0, -distance],
        }) }];
      case 'right':
        return [{ translateX: slideAnim }];
      default:
        return [{ translateY: slideAnim }];
    }
  };

  return (
    <Animated.View
      style={[
        {
          opacity: opacityAnim,
          transform: getTransform(),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

export default SlideIn;