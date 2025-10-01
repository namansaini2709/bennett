// Rotate Animation Component for CIVIC SETU
// Smooth rotation animation for loading states and icons

import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

const RotateAnimation = ({
  children,
  duration = 2000,
  repeat = true,
  clockwise = true,
  style,
  ...props
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createRotation = () => {
      return Animated.timing(rotateAnim, {
        toValue: clockwise ? 1 : -1,
        duration,
        useNativeDriver: true,
      });
    };

    let animation;
    if (repeat) {
      animation = Animated.loop(createRotation());
    } else {
      animation = createRotation();
    }

    animation.start();

    return () => animation.stop();
  }, [duration, clockwise, repeat]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        {
          transform: [{ rotate: rotation }],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

export default RotateAnimation;