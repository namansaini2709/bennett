// Toast Notification Components for CIVIC SETU
// Non-intrusive feedback messages

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { borderRadius, spacing, shadows } from '../../theme';

const Toast = ({
  visible = false,
  message,
  type = 'info', // success, error, warning, info
  duration = 4000,
  onDismiss,
  action,
  actionText,
  onAction,
  position = 'bottom', // top, bottom
  style,
  ...props
}) => {
  const theme = useTheme();
  const colors = theme.custom?.colors || {};
  const animatedValue = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (visible) {
      // Show toast
      Animated.spring(animatedValue, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Auto dismiss
      if (duration > 0) {
        timeoutRef.current = setTimeout(() => {
          hideToast();
        }, duration);
      }
    } else {
      hideToast();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible, duration]);

  const hideToast = () => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDismiss && onDismiss();
    });
  };

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: colors.success?.main || '#4CAF50',
          icon: 'check-circle',
          iconColor: '#FFFFFF',
          textColor: '#FFFFFF',
        };
      case 'error':
        return {
          backgroundColor: colors.error?.main || '#F44336',
          icon: 'alert-circle',
          iconColor: '#FFFFFF',
          textColor: '#FFFFFF',
        };
      case 'warning':
        return {
          backgroundColor: colors.warning?.main || '#FF9800',
          icon: 'alert',
          iconColor: '#FFFFFF',
          textColor: '#FFFFFF',
        };
      case 'info':
      default:
        return {
          backgroundColor: colors.info?.main || '#03A9F4',
          icon: 'information',
          iconColor: '#FFFFFF',
          textColor: '#FFFFFF',
        };
    }
  };

  const config = getToastConfig();

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [position === 'top' ? -100 : 100, 0],
  });

  if (!visible && animatedValue._value === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'top' ? styles.containerTop : styles.containerBottom,
        {
          backgroundColor: config.backgroundColor,
          transform: [{ translateY }],
          opacity: animatedValue,
        },
        style,
      ]}
      {...props}
    >
      <View style={styles.content}>
        <MaterialCommunityIcons
          name={config.icon}
          size={24}
          color={config.iconColor}
          style={styles.icon}
        />
        <Text style={[styles.message, { color: config.textColor }]}>
          {message}
        </Text>
        {actionText && onAction && (
          <TouchableOpacity onPress={onAction} style={styles.actionButton}>
            <Text style={[styles.actionText, { color: config.textColor }]}>
              {actionText}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
          <MaterialCommunityIcons
            name="close"
            size={20}
            color={config.iconColor}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// Toast Manager Hook
export const useToast = () => {
  const [toasts, setToasts] = React.useState([]);

  const showToast = React.useCallback((options) => {
    const id = Date.now().toString();
    const toast = {
      id,
      ...options,
      visible: true,
    };

    setToasts(prevToasts => [...prevToasts, toast]);

    // Auto remove after duration
    if (options.duration !== 0) {
      setTimeout(() => {
        hideToast(id);
      }, options.duration || 4000);
    }

    return id;
  }, []);

  const hideToast = React.useCallback((id) => {
    setToasts(prevToasts =>
      prevToasts.map(toast =>
        toast.id === id ? { ...toast, visible: false } : toast
      )
    );

    // Remove from array after animation
    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, 300);
  }, []);

  const hideAllToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    hideToast,
    hideAllToasts,
    success: (message, options = {}) => showToast({ ...options, message, type: 'success' }),
    error: (message, options = {}) => showToast({ ...options, message, type: 'error' }),
    warning: (message, options = {}) => showToast({ ...options, message, type: 'warning' }),
    info: (message, options = {}) => showToast({ ...options, message, type: 'info' }),
  };
};

// Toast Container Component
export const ToastContainer = ({ toasts }) => {
  return (
    <View style={[styles.toastContainer, { pointerEvents: 'box-none' }]}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
        />
      ))}
    </View>
  );
};

// Quick Toast Functions
export const showSuccessToast = (message, options = {}) => {
  // Implementation would depend on your global state management
  console.log('Success:', message);
};

export const showErrorToast = (message, options = {}) => {
  console.log('Error:', message);
};

export const showWarningToast = (message, options = {}) => {
  console.log('Warning:', message);
};

export const showInfoToast = (message, options = {}) => {
  console.log('Info:', message);
};

// Snackbar Component (Alternative to Toast)
export const Snackbar = ({
  visible = false,
  message,
  action,
  actionText,
  onAction,
  onDismiss,
  duration = 4000,
  style,
  ...props
}) => {
  const theme = useTheme();
  const colors = theme.custom?.colors || {};
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      if (duration > 0) {
        setTimeout(() => {
          onDismiss && onDismiss();
        }, duration);
      }
    } else {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, duration]);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0],
  });

  if (!visible && animatedValue._value === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.snackbar,
        {
          backgroundColor: colors.neutral?.gray[800] || '#424242',
          transform: [{ translateY }],
          opacity: animatedValue,
        },
        style,
      ]}
      {...props}
    >
      <Text style={[styles.snackbarMessage, { color: '#FFFFFF' }]}>
        {message}
      </Text>
      {actionText && onAction && (
        <TouchableOpacity onPress={onAction} style={styles.snackbarAction}>
          <Text style={[styles.snackbarActionText, { color: colors.primary?.light || '#64B5F6' }]}>
            {actionText}
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.lg,
    zIndex: 1000,
  },
  containerTop: {
    top: 50,
  },
  containerBottom: {
    bottom: 100,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  icon: {
    marginRight: spacing.sm,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  actionButton: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  closeButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  snackbar: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.md,
    right: spacing.md,
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
    ...shadows.lg,
    zIndex: 1000,
  },
  snackbarMessage: {
    flex: 1,
    fontSize: 14,
  },
  snackbarAction: {
    marginLeft: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  snackbarActionText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

export default Toast;