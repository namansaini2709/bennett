// Skeleton Loading Components for CIVIC SETU
// Beautiful loading placeholders for better perceived performance

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { borderRadius, spacing } from '../../theme';

const Skeleton = ({
  width = '100%',
  height = 20,
  borderRadius: radius = 4,
  style,
  animated = true,
  ...props
}) => {
  const theme = useTheme();
  const colors = theme.custom?.colors || {};
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [animated]);

  const backgroundColor = animated
    ? animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.neutral?.gray[200] || '#E0E0E0', colors.neutral?.gray[300] || '#BDBDBD'],
      })
    : colors.neutral?.gray[200] || '#E0E0E0';

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor,
        },
        style,
      ]}
      {...props}
    />
  );
};

// Skeleton Card Component
export const SkeletonCard = ({ style, ...props }) => {
  return (
    <View style={[styles.skeletonCard, style]} {...props}>
      <View style={styles.skeletonCardHeader}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={styles.skeletonCardHeaderText}>
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={12} style={styles.skeletonMarginTop} />
        </View>
        <Skeleton width={60} height={24} borderRadius={12} />
      </View>
      <Skeleton width="100%" height={12} style={styles.skeletonMarginTop} />
      <Skeleton width="80%" height={12} style={styles.skeletonMarginTop} />
      <View style={styles.skeletonCardFooter}>
        <Skeleton width="30%" height={10} />
        <Skeleton width="25%" height={10} />
      </View>
    </View>
  );
};

// Skeleton List Item Component
export const SkeletonListItem = ({ withAvatar = true, style, ...props }) => {
  return (
    <View style={[styles.skeletonListItem, style]} {...props}>
      {withAvatar && <Skeleton width={48} height={48} borderRadius={24} />}
      <View style={[styles.skeletonListItemContent, !withAvatar && styles.skeletonListItemNoAvatar]}>
        <Skeleton width="70%" height={16} />
        <Skeleton width="50%" height={12} style={styles.skeletonMarginTop} />
        <Skeleton width="30%" height={10} style={styles.skeletonMarginTop} />
      </View>
      <Skeleton width={24} height={16} />
    </View>
  );
};

// Skeleton Report Card Component
export const SkeletonReportCard = ({ withImage = true, style, ...props }) => {
  return (
    <View style={[styles.skeletonReportCard, style]} {...props}>
      {withImage && <Skeleton width="100%" height={150} borderRadius={0} />}
      <View style={styles.skeletonReportCardContent}>
        <View style={styles.skeletonReportCardHeader}>
          <Skeleton width={24} height={24} borderRadius={12} />
          <View style={styles.skeletonReportCardHeaderText}>
            <Skeleton width="60%" height={16} />
            <Skeleton width="30%" height={10} style={styles.skeletonMarginTop} />
          </View>
          <Skeleton width={50} height={20} borderRadius={10} />
        </View>
        <Skeleton width="100%" height={12} style={styles.skeletonMarginTop} />
        <Skeleton width="85%" height={12} style={styles.skeletonMarginTop} />
        <View style={styles.skeletonReportCardFooter}>
          <Skeleton width="25%" height={10} />
          <Skeleton width="35%" height={10} />
        </View>
      </View>
    </View>
  );
};

// Skeleton Profile Component
export const SkeletonProfile = ({ style, ...props }) => {
  return (
    <View style={[styles.skeletonProfile, style]} {...props}>
      <View style={styles.skeletonProfileHeader}>
        <Skeleton width={80} height={80} borderRadius={40} />
        <View style={styles.skeletonProfileInfo}>
          <Skeleton width="60%" height={20} />
          <Skeleton width="40%" height={14} style={styles.skeletonMarginTop} />
          <Skeleton width="30%" height={12} style={styles.skeletonMarginTop} />
        </View>
      </View>
      <View style={styles.skeletonProfileStats}>
        <View style={styles.skeletonProfileStat}>
          <Skeleton width={40} height={24} />
          <Skeleton width="80%" height={12} style={styles.skeletonMarginTop} />
        </View>
        <View style={styles.skeletonProfileStat}>
          <Skeleton width={40} height={24} />
          <Skeleton width="80%" height={12} style={styles.skeletonMarginTop} />
        </View>
        <View style={styles.skeletonProfileStat}>
          <Skeleton width={40} height={24} />
          <Skeleton width="80%" height={12} style={styles.skeletonMarginTop} />
        </View>
      </View>
    </View>
  );
};

// Skeleton Button Component
export const SkeletonButton = ({ size = 'medium', style, ...props }) => {
  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return { width: 80, height: 32 };
      case 'large':
        return { width: 120, height: 48 };
      case 'medium':
      default:
        return { width: 100, height: 40 };
    }
  };

  const buttonSize = getButtonSize();

  return (
    <Skeleton
      width={buttonSize.width}
      height={buttonSize.height}
      borderRadius={borderRadius.button}
      style={style}
      {...props}
    />
  );
};

// Skeleton Text Lines Component
export const SkeletonTextLines = ({
  lines = 3,
  lineHeight = 12,
  lineSpacing = 8,
  lastLineWidth = '70%',
  style,
  ...props
}) => {
  return (
    <View style={[styles.skeletonTextLines, style]} {...props}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          height={lineHeight}
          style={index > 0 ? { marginTop: lineSpacing } : undefined}
        />
      ))}
    </View>
  );
};

// Skeleton Screen Component (for full screen loading)
export const SkeletonScreen = ({ type = 'list', style, ...props }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'profile':
        return (
          <>
            <SkeletonProfile />
            <SkeletonTextLines lines={4} style={styles.skeletonMarginTop} />
          </>
        );
      case 'detail':
        return (
          <>
            <Skeleton width="100%" height={200} style={styles.skeletonMarginBottom} />
            <SkeletonTextLines lines={6} />
            <View style={styles.skeletonButtonGroup}>
              <SkeletonButton size="large" />
              <SkeletonButton size="large" />
            </View>
          </>
        );
      case 'list':
      default:
        return (
          <>
            {Array.from({ length: 5 }, (_, index) => (
              <SkeletonListItem key={index} style={styles.skeletonMarginBottom} />
            ))}
          </>
        );
    }
  };

  return (
    <View style={[styles.skeletonScreen, style]} {...props}>
      {renderSkeleton()}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.card,
    padding: spacing.md,
    marginBottom: spacing.md,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  skeletonCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  skeletonCardHeaderText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  skeletonCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  skeletonListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  skeletonListItemContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  skeletonListItemNoAvatar: {
    marginLeft: 0,
  },
  skeletonReportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.card,
    marginBottom: spacing.md,
    overflow: 'hidden',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  skeletonReportCardContent: {
    padding: spacing.md,
  },
  skeletonReportCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  skeletonReportCardHeaderText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  skeletonReportCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  skeletonProfile: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  skeletonProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  skeletonProfileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  skeletonProfileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  skeletonProfileStat: {
    alignItems: 'center',
  },
  skeletonTextLines: {
    // No specific styles needed
  },
  skeletonScreen: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: '#FAFAFA',
  },
  skeletonButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.xl,
  },
  skeletonMarginTop: {
    marginTop: spacing.xs,
  },
  skeletonMarginBottom: {
    marginBottom: spacing.sm,
  },
});

export default Skeleton;