// Custom Card Component for CIVIC SETU
// Enhanced card with multiple variants and interaction states

import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useTheme } from 'react-native-paper';
import { borderRadius, padding, shadows, spacing } from '../../theme';
import { ScalePress } from '../animations';

const Card = ({
  children,
  onPress,
  variant = 'elevated', // flat, elevated, outlined
  elevation = 2,
  style,
  contentStyle,
  disabled = false,
  ...props
}) => {
  const theme = useTheme();
  const colors = theme.custom?.colors || {};

  const getVariantStyles = () => {
    switch (variant) {
      case 'flat':
        return {
          elevation: 0,
          backgroundColor: colors.background?.paper || '#FFFFFF',
          borderWidth: 0,
        };
      case 'outlined':
        return {
          elevation: 0,
          backgroundColor: colors.background?.paper || '#FFFFFF',
          borderWidth: 1,
          borderColor: colors.border?.default || '#E0E0E0',
        };
      case 'elevated':
      default:
        return {
          elevation: elevation,
          backgroundColor: colors.background?.paper || '#FFFFFF',
          borderWidth: 0,
        };
    }
  };

  const variantStyles = getVariantStyles();

  if (onPress) {
    return (
      <ScalePress
        onPress={onPress}
        disabled={disabled}
        scaleValue={0.98}
        duration={150}
        style={[
          styles.card,
          variantStyles,
          disabled && styles.disabled,
          style,
        ]}
        {...props}
      >
        <View style={[styles.content, contentStyle]}>
          {children}
        </View>
      </ScalePress>
    );
  }

  return (
    <View
      style={[
        styles.card,
        variantStyles,
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    </View>
  );
};

// Card Header Component
export const CardHeader = ({
  title,
  subtitle,
  avatar,
  action,
  style,
  titleStyle,
  subtitleStyle,
  ...props
}) => {
  const theme = useTheme();
  const colors = theme.custom?.colors || {};

  return (
    <View style={[styles.header, style]} {...props}>
      {avatar && (
        <View style={styles.avatar}>
          {typeof avatar === 'string' ? (
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          ) : (
            avatar
          )}
        </View>
      )}
      <View style={styles.headerContent}>
        {title && (
          <Text style={[styles.headerTitle, { color: colors.text?.primary || '#212121' }, titleStyle]}>
            {title}
          </Text>
        )}
        {subtitle && (
          <Text style={[styles.headerSubtitle, { color: colors.text?.secondary || '#757575' }, subtitleStyle]}>
            {subtitle}
          </Text>
        )}
      </View>
      {action && (
        <View style={styles.headerAction}>
          {action}
        </View>
      )}
    </View>
  );
};

// Card Media Component
export const CardMedia = ({
  source,
  height = 200,
  resizeMode = 'cover',
  overlay,
  style,
  ...props
}) => {
  return (
    <View style={[styles.mediaContainer, { height }, style]} {...props}>
      <Image
        source={source}
        style={[styles.media, { height }]}
        resizeMode={resizeMode}
      />
      {overlay && (
        <View style={styles.mediaOverlay}>
          {overlay}
        </View>
      )}
    </View>
  );
};

// Card Content Component
export const CardContent = ({ children, style, ...props }) => {
  return (
    <View style={[styles.cardContent, style]} {...props}>
      {children}
    </View>
  );
};

// Card Actions Component
export const CardActions = ({
  children,
  position = 'left', // left, right, space-between
  style,
  ...props
}) => {
  const getPositionStyles = () => {
    switch (position) {
      case 'right':
        return { justifyContent: 'flex-end' };
      case 'space-between':
        return { justifyContent: 'space-between' };
      case 'left':
      default:
        return { justifyContent: 'flex-start' };
    }
  };

  return (
    <View
      style={[styles.actions, getPositionStyles(), style]}
      {...props}
    >
      {children}
    </View>
  );
};

// Compact Card Component (for lists)
export const CompactCard = ({
  title,
  subtitle,
  leftIcon,
  rightContent,
  onPress,
  style,
  ...props
}) => {
  const theme = useTheme();
  const colors = theme.custom?.colors || {};

  if (onPress) {
    return (
      <ScalePress
        onPress={onPress}
        scaleValue={0.97}
        duration={120}
        style={[styles.compactCard, style]}
        {...props}
      >
        {leftIcon && (
          <View style={styles.compactLeft}>
            {leftIcon}
          </View>
        )}
        <View style={styles.compactContent}>
          {title && (
            <Text style={[styles.compactTitle, { color: colors.text?.primary || '#212121' }]}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={[styles.compactSubtitle, { color: colors.text?.secondary || '#757575' }]}>
              {subtitle}
            </Text>
          )}
        </View>
        {rightContent && (
          <View style={styles.compactRight}>
            {rightContent}
          </View>
        )}
      </ScalePress>
    );
  }

  return (
    <View
      style={[styles.compactCard, style]}
      {...props}
    >
      {leftIcon && (
        <View style={styles.compactLeft}>
          {leftIcon}
        </View>
      )}
      <View style={styles.compactContent}>
        {title && (
          <Text style={[styles.compactTitle, { color: colors.text?.primary || '#212121' }]}>
            {title}
          </Text>
        )}
        {subtitle && (
          <Text style={[styles.compactSubtitle, { color: colors.text?.secondary || '#757575' }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightContent && (
        <View style={styles.compactRight}>
          {rightContent}
        </View>
      )}
    </View>
  );
};

// Status Card Component (for reports)
export const StatusCard = ({
  title,
  description,
  status,
  statusColor,
  category,
  categoryIcon,
  date,
  location,
  image,
  onPress,
  style,
  ...props
}) => {
  const theme = useTheme();
  const colors = theme.custom?.colors || {};

  return (
    <ScalePress
      onPress={onPress}
      scaleValue={0.98}
      duration={150}
      style={[styles.statusCard, style]}
      {...props}
    >
      {image && (
        <Image source={{ uri: image }} style={styles.statusCardImage} />
      )}
      <View style={styles.statusCardContent}>
        <View style={styles.statusCardHeader}>
          {categoryIcon && (
            <View style={styles.categoryIcon}>
              {categoryIcon}
            </View>
          )}
          <View style={styles.statusCardHeaderText}>
            <Text style={[styles.statusCardTitle, { color: colors.text?.primary || '#212121' }]}>
              {title}
            </Text>
            {category && (
              <Text style={[styles.statusCardCategory, { color: colors.text?.secondary || '#757575' }]}>
                {category}
              </Text>
            )}
          </View>
          {status && (
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColor || colors.primary?.main || '#2196F3' }
              ]}
            >
              <Text style={styles.statusBadgeText}>{status}</Text>
            </View>
          )}
        </View>
        {description && (
          <Text
            style={[styles.statusCardDescription, { color: colors.text?.secondary || '#757575' }]}
            numberOfLines={2}
          >
            {description}
          </Text>
        )}
        <View style={styles.statusCardFooter}>
          {date && (
            <Text style={[styles.statusCardMeta, { color: colors.text?.hint || '#9E9E9E' }]}>
              {date}
            </Text>
          )}
          {location && (
            <Text style={[styles.statusCardMeta, { color: colors.text?.hint || '#9E9E9E' }]}>
              {location}
            </Text>
          )}
        </View>
      </View>
    </ScalePress>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.card,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  content: {
    padding: padding.card.all,
  },
  disabled: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: padding.card.horizontal,
    paddingVertical: padding.card.vertical,
  },
  avatar: {
    marginRight: spacing.md,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  headerAction: {
    marginLeft: spacing.md,
  },
  mediaContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  media: {
    width: '100%',
  },
  mediaOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: padding.card.all,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: padding.card.horizontal,
    paddingVertical: spacing.sm,
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: padding.card.all,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.xs,
  },
  compactLeft: {
    marginRight: spacing.md,
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  compactSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  compactRight: {
    marginLeft: spacing.md,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.card,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  statusCardImage: {
    width: '100%',
    height: 150,
  },
  statusCardContent: {
    padding: padding.card.all,
  },
  statusCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryIcon: {
    marginRight: spacing.sm,
  },
  statusCardHeaderText: {
    flex: 1,
  },
  statusCardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusCardCategory: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusCardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  statusCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusCardMeta: {
    fontSize: 12,
  },
});

// Import Text component (add this at the top of the file)
import { Text } from 'react-native';

export default Card;