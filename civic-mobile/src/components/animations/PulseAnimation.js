// Pulse Animation Component for CIVIC SETU
// Continuous pulse animation for attention-grabbing elements

import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

const PulseAnimation = ({
  children,
  minScale = 0.95,
  maxScale = 1.05,
  duration = 1500,
  repeat = true,
  style,
  ...props
}) => {
  const pulseAnim = useRef(new Animated.Value(minScale)).current;

  useEffect(() => {
    const createPulse = () => {
      return Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: maxScale,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: minScale,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ]);
    };

    let animation;
    if (repeat) {
      animation = Animated.loop(createPulse());
    } else {
      animation = createPulse();
    }

    animation.start();

    return () => animation.stop();
  }, [duration, minScale, maxScale, repeat]);

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: pulseAnim }],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

export default PulseAnimation;