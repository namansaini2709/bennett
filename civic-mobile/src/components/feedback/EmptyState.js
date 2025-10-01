// Empty State Components for CIVIC SETU
// Beautiful empty states to improve user experience

import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { TitleMedium, BodyMedium, Caption } from '../ui/Typography';
import CustomButton from '../ui/Button';
import { spacing, layout } from '../../theme';

const EmptyState = ({
  icon,
  image,
  title,
  description,
  actionText,
  onAction,
  actionIcon,
  secondaryActionText,
  onSecondaryAction,
  style,
  ...props
}) => {
  const theme = useTheme();
  const colors = theme.custom?.colors || {};

  const renderIllustration = () => {
    if (image) {
      return (
        <Image
          source={typeof image === 'string' ? { uri: image } : image}
          style={styles.image}
          resizeMode="contain"
        />
      );
    }

    if (icon) {
      return (
        <View style={[styles.iconContainer, { backgroundColor: colors.primary?.light + '20' }]}>
          <MaterialCommunityIcons
            name={icon}
            size={48}
            color={colors.primary?.main || '#2196F3'}
          />
        </View>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, style]} {...props}>
      {renderIllustration()}

      {title && (
        <TitleMedium style={[styles.title, { color: colors.text?.primary }]}>
          {title}
        </TitleMedium>
      )}

      {description && (
        <BodyMedium style={[styles.description, { color: colors.text?.secondary }]}>
          {description}
        </BodyMedium>
      )}

      {actionText && onAction && (
        <CustomButton
          onPress={onAction}
          icon={actionIcon}
          style={styles.actionButton}
        >
          {actionText}
        </CustomButton>
      )}

      {secondaryActionText && onSecondaryAction && (
        <CustomButton
          onPress={onSecondaryAction}
          variant="text"
          style={styles.secondaryActionButton}
        >
          {secondaryActionText}
        </CustomButton>
      )}
    </View>
  );
};

// No Reports Empty State
export const NoReportsEmpty = ({ onCreateReport, style, ...props }) => {
  return (
    <EmptyState
      icon="file-document-plus-outline"
      title="No Reports Yet"
      description="You haven't created any reports yet. Start reporting civic issues in your area to make a difference."
      actionText="Create First Report"
      actionIcon="plus"
      onAction={onCreateReport}
      style={style}
      {...props}
    />
  );
};

// No Search Results Empty State
export const NoSearchResultsEmpty = ({ searchQuery, onClearSearch, style, ...props }) => {
  return (
    <EmptyState
      icon="magnify-remove-outline"
      title="No Results Found"
      description={`We couldn't find any reports matching "${searchQuery}". Try adjusting your search terms.`}
      actionText="Clear Search"
      actionIcon="close"
      onAction={onClearSearch}
      style={style}
      {...props}
    />
  );
};

// Network Error Empty State
export const NetworkErrorEmpty = ({ onRetry, style, ...props }) => {
  return (
    <EmptyState
      icon="wifi-off"
      title="Connection Problem"
      description="Unable to connect to the server. Please check your internet connection and try again."
      actionText="Try Again"
      actionIcon="refresh"
      onAction={onRetry}
      style={style}
      {...props}
    />
  );
};

// Server Error Empty State
export const ServerErrorEmpty = ({ onRetry, style, ...props }) => {
  return (
    <EmptyState
      icon="server-network-off"
      title="Something Went Wrong"
      description="We're experiencing technical difficulties. Our team has been notified and is working to fix this."
      actionText="Retry"
      actionIcon="refresh"
      onAction={onRetry}
      style={style}
      {...props}
    />
  );
};

// Maintenance Mode Empty State
export const MaintenanceEmpty = ({ style, ...props }) => {
  return (
    <EmptyState
      icon="wrench"
      title="Under Maintenance"
      description="We're currently performing scheduled maintenance to improve your experience. Please check back soon."
      style={style}
      {...props}
    />
  );
};

// Permission Denied Empty State
export const PermissionDeniedEmpty = ({ onRequestPermission, permissionType = 'location', style, ...props }) => {
  const getContent = () => {
    switch (permissionType) {
      case 'camera':
        return {
          icon: 'camera-off',
          title: 'Camera Access Needed',
          description: 'To take photos for your reports, please grant camera permission in your device settings.',
        };
      case 'storage':
        return {
          icon: 'folder-lock',
          title: 'Storage Access Needed',
          description: 'To save and upload photos, please grant storage permission in your device settings.',
        };
      case 'location':
      default:
        return {
          icon: 'map-marker-off',
          title: 'Location Access Needed',
          description: 'To automatically detect your location for reports, please enable location services.',
        };
    }
  };

  const content = getContent();

  return (
    <EmptyState
      icon={content.icon}
      title={content.title}
      description={content.description}
      actionText="Grant Permission"
      actionIcon="check"
      onAction={onRequestPermission}
      style={style}
      {...props}
    />
  );
};

// Coming Soon Empty State
export const ComingSoonEmpty = ({ featureName, style, ...props }) => {
  return (
    <EmptyState
      icon="clock-outline"
      title="Coming Soon"
      description={`${featureName || 'This feature'} is currently under development. Stay tuned for updates!`}
      style={style}
      {...props}
    />
  );
};

// No Notifications Empty State
export const NoNotificationsEmpty = ({ style, ...props }) => {
  return (
    <EmptyState
      icon="bell-sleep-outline"
      title="No Notifications"
      description="You're all caught up! You'll receive notifications when there are updates on your reports."
      style={style}
      {...props}
    />
  );
};

// Offline Mode Empty State
export const OfflineEmpty = ({ onGoOnline, style, ...props }) => {
  return (
    <EmptyState
      icon="cloud-off-outline"
      title="You're Offline"
      description="Some features are limited while offline. Your reports will be synced when you reconnect."
      actionText="Go Online"
      actionIcon="wifi"
      onAction={onGoOnline}
      style={style}
      {...props}
    />
  );
};

// Loading Failed Empty State
export const LoadingFailedEmpty = ({ onRetry, style, ...props }) => {
  return (
    <EmptyState
      icon="alert-circle-outline"
      title="Failed to Load"
      description="Something went wrong while loading this content. Please try again."
      actionText="Retry"
      actionIcon="refresh"
      onAction={onRetry}
      style={style}
      {...props}
    />
  );
};

// Profile Empty State
export const ProfileEmptyState = ({ onCompleteProfile, style, ...props }) => {
  return (
    <EmptyState
      icon="account-circle-outline"
      title="Complete Your Profile"
      description="Add your information to help us serve you better and track your civic contributions."
      actionText="Complete Profile"
      actionIcon="account-edit"
      onAction={onCompleteProfile}
      style={style}
      {...props}
    />
  );
};

// Inbox Empty State
export const InboxEmptyState = ({ style, ...props }) => {
  return (
    <EmptyState
      icon="email-outline"
      title="Inbox Empty"
      description="No new messages. We'll notify you when you receive updates about your reports."
      style={style}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  image: {
    width: 200,
    height: 150,
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  description: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  actionButton: {
    marginBottom: spacing.md,
    minWidth: 160,
  },
  secondaryActionButton: {
    minWidth: 120,
  },
});

export default EmptyState;