// Staggered List Animation Component for CIVIC SETU
// Creates beautiful staggered animations for list items

import React, { useRef, useEffect } from 'react';
import { Animated, View } from 'react-native';

const StaggeredList = ({
  children,
  staggerDelay = 100,
  initialDelay = 0,
  animationType = 'slideUp', // slideUp, slideDown, fadeIn, scaleIn
  duration = 600,
  style,
  ...props
}) => {
  const animations = useRef([]).current;

  useEffect(() => {
    // Clear previous animations
    animations.length = 0;

    // Create animations for each child
    React.Children.forEach(children, (_, index) => {
      animations[index] = new Animated.Value(getInitialValue());
    });

    // Start staggered animations
    const animationPromises = animations.map((anim, index) => {
      return new Promise((resolve) => {
        Animated.timing(anim, {
          toValue: getFinalValue(),
          duration,
          delay: initialDelay + (index * staggerDelay),
          useNativeDriver: true,
        }).start(resolve);
      });
    });

    return () => {
      animations.forEach(anim => anim.stopAnimation());
    };
  }, [children, staggerDelay, initialDelay, duration]);

  const getInitialValue = () => {
    switch (animationType) {
      case 'slideUp':
      case 'slideDown':
        return 50;
      case 'fadeIn':
        return 0;
      case 'scaleIn':
        return 0;
      default:
        return 0;
    }
  };

  const getFinalValue = () => {
    switch (animationType) {
      case 'slideUp':
      case 'slideDown':
        return 0;
      case 'fadeIn':
        return 1;
      case 'scaleIn':
        return 1;
      default:
        return 1;
    }
  };

  const getAnimatedStyle = (animation, index) => {
    switch (animationType) {
      case 'slideUp':
        return {
          opacity: animation.interpolate({
            inputRange: [0, 50],
            outputRange: [1, 0],
          }),
          transform: [{
            translateY: animation,
          }],
        };
      case 'slideDown':
        return {
          opacity: animation.interpolate({
            inputRange: [0, 50],
            outputRange: [1, 0],
          }),
          transform: [{
            translateY: animation.interpolate({
              inputRange: [0, 50],
              outputRange: [0, -50],
            }),
          }],
        };
      case 'fadeIn':
        return {
          opacity: animation,
        };
      case 'scaleIn':
        return {
          opacity: animation,
          transform: [{
            scale: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            }),
          }],
        };
      default:
        return {
          opacity: animation,
        };
    }
  };

  return (
    <View style={style} {...props}>
      {React.Children.map(children, (child, index) => {
        if (!animations[index]) return child;

        return (
          <Animated.View
            key={index}
            style={getAnimatedStyle(animations[index], index)}
          >
            {child}
          </Animated.View>
        );
      })}
    </View>
  );
};

export default StaggeredList;