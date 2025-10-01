// Custom Animation Hooks for CIVIC SETU
// Reusable animation logic for common patterns

import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

// Hook for fade animations
export const useFadeAnimation = (duration = 300, delay = 0) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration,
      useNativeDriver: true,
    }).start();
  };

  return {
    opacity: fadeAnim,
    fadeIn,
    fadeOut,
  };
};

// Hook for scale animations
export const useScaleAnimation = (duration = 200) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const scaleIn = (toValue = 0.95) => {
    Animated.timing(scaleAnim, {
      toValue,
      duration,
      useNativeDriver: true,
    }).start();
  };

  const scaleOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 150,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  return {
    transform: [{ scale: scaleAnim }],
    scaleIn,
    scaleOut,
  };
};

// Hook for slide animations
export const useSlideAnimation = (initialValue = 50, duration = 300) => {
  const slideAnim = useRef(new Animated.Value(initialValue)).current;

  const slideIn = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const slideOut = (toValue = initialValue) => {
    Animated.timing(slideAnim, {
      toValue,
      duration,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  return {
    transform: [{ translateY: slideAnim }],
    slideIn,
    slideOut,
  };
};

// Hook for rotation animations
export const useRotateAnimation = (duration = 2000) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const startRotation = () => {
    const rotate = () => {
      rotateAnim.setValue(0);
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) rotate();
      });
    };
    rotate();
  };

  const stopRotation = () => {
    rotateAnim.stopAnimation();
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return {
    transform: [{ rotate: rotation }],
    startRotation,
    stopRotation,
  };
};

// Hook for entrance animations
export const useEntranceAnimation = (delay = 0) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: delay + 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: delay + 200,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay]);

  return {
    opacity: fadeAnim,
    transform: [
      { translateY: slideAnim },
      { scale: scaleAnim },
    ],
  };
};

// Hook for button press animation
export const useButtonPress = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onPressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 150,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return {
    animatedStyle: {
      transform: [{ scale: scaleAnim }],
      opacity: opacityAnim,
    },
    onPressIn,
    onPressOut,
  };
};

// Hook for loading animations
export const useLoadingAnimation = () => {
  const pulseAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Rotation animation
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    pulse.start();
    rotate.start();

    return () => {
      pulse.stop();
      rotate.stop();
    };
  }, []);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return {
    pulseStyle: {
      opacity: pulseAnim,
    },
    rotateStyle: {
      transform: [{ rotate: rotation }],
    },
  };
};