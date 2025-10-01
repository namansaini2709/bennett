// Typography Components for CIVIC SETU
// Consistent text components with theme integration

import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

// Base Text component with theme integration
const BaseText = ({ style, children, variant = 'bodyMedium', color, ...props }) => {
  const theme = useTheme();
  const typography = theme.custom?.typography || {};
  const colors = theme.custom?.colors || {};

  const variantStyle = typography[variant] || typography.bodyMedium || {};

  // Safely get text color with proper fallback
  let textColor;
  if (color) {
    // If color is provided, try to get it from colors.text, otherwise use the color directly
    textColor = colors.text?.[color] || color;
  } else {
    // Default to primary text color with fallback
    textColor = colors.text?.primary || '#212121';
  }

  return (
    <RNText
      style={[
        variantStyle,
        { color: textColor },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

// Display Components
export const DisplayLarge = ({ children, ...props }) => (
  <BaseText variant="displayLarge" {...props}>{children}</BaseText>
);

export const DisplayMedium = ({ children, ...props }) => (
  <BaseText variant="displayMedium" {...props}>{children}</BaseText>
);

export const DisplaySmall = ({ children, ...props }) => (
  <BaseText variant="displaySmall" {...props}>{children}</BaseText>
);

// Headline Components
export const HeadlineLarge = ({ children, ...props }) => (
  <BaseText variant="headlineLarge" {...props}>{children}</BaseText>
);

export const HeadlineMedium = ({ children, ...props }) => (
  <BaseText variant="headlineMedium" {...props}>{children}</BaseText>
);

export const HeadlineSmall = ({ children, ...props }) => (
  <BaseText variant="headlineSmall" {...props}>{children}</BaseText>
);

// Title Components
export const TitleLarge = ({ children, ...props }) => (
  <BaseText variant="titleLarge" {...props}>{children}</BaseText>
);

export const TitleMedium = ({ children, ...props }) => (
  <BaseText variant="titleMedium" {...props}>{children}</BaseText>
);

export const TitleSmall = ({ children, ...props }) => (
  <BaseText variant="titleSmall" {...props}>{children}</BaseText>
);

// Body Components
export const BodyLarge = ({ children, ...props }) => (
  <BaseText variant="bodyLarge" {...props}>{children}</BaseText>
);

export const BodyMedium = ({ children, ...props }) => (
  <BaseText variant="bodyMedium" {...props}>{children}</BaseText>
);

export const BodySmall = ({ children, ...props }) => (
  <BaseText variant="bodySmall" {...props}>{children}</BaseText>
);

// Label Components
export const LabelLarge = ({ children, ...props }) => (
  <BaseText variant="labelLarge" {...props}>{children}</BaseText>
);

export const LabelMedium = ({ children, ...props }) => (
  <BaseText variant="labelMedium" {...props}>{children}</BaseText>
);

export const LabelSmall = ({ children, ...props }) => (
  <BaseText variant="labelSmall" {...props}>{children}</BaseText>
);

// Special Components
export const Caption = ({ children, ...props }) => (
  <BaseText variant="caption" color="secondary" {...props}>{children}</BaseText>
);

export const Overline = ({ children, ...props }) => (
  <BaseText variant="overline" {...props}>{children}</BaseText>
);

export const ButtonText = ({ children, ...props }) => (
  <BaseText variant="button" {...props}>{children}</BaseText>
);

// Semantic Text Components
export const ErrorText = ({ children, style, ...props }) => (
  <BaseText
    variant="bodySmall"
    style={[styles.errorText, style]}
    {...props}
  >
    {children}
  </BaseText>
);

export const SuccessText = ({ children, style, ...props }) => (
  <BaseText
    variant="bodySmall"
    style={[styles.successText, style]}
    {...props}
  >
    {children}
  </BaseText>
);

export const WarningText = ({ children, style, ...props }) => (
  <BaseText
    variant="bodySmall"
    style={[styles.warningText, style]}
    {...props}
  >
    {children}
  </BaseText>
);

export const InfoText = ({ children, style, ...props }) => (
  <BaseText
    variant="bodySmall"
    style={[styles.infoText, style]}
    {...props}
  >
    {children}
  </BaseText>
);

// Generic Text component with all options
export const Text = BaseText;

// Heading components with semantic HTML-like names
export const H1 = DisplayLarge;
export const H2 = DisplayMedium;
export const H3 = DisplaySmall;
export const H4 = HeadlineLarge;
export const H5 = HeadlineMedium;
export const H6 = HeadlineSmall;

// Paragraph component
export const Paragraph = ({ children, style, ...props }) => (
  <BodyMedium style={[styles.paragraph, style]} {...props}>
    {children}
  </BodyMedium>
);

const styles = StyleSheet.create({
  paragraph: {
    marginBottom: 16,
    lineHeight: 24,
  },
  errorText: {
    color: '#F44336',
  },
  successText: {
    color: '#4CAF50',
  },
  warningText: {
    color: '#FF9800',
  },
  infoText: {
    color: '#03A9F4',
  },
});

export default {
  DisplayLarge,
  DisplayMedium,
  DisplaySmall,
  HeadlineLarge,
  HeadlineMedium,
  HeadlineSmall,
  TitleLarge,
  TitleMedium,
  TitleSmall,
  BodyLarge,
  BodyMedium,
  BodySmall,
  LabelLarge,
  LabelMedium,
  LabelSmall,
  Caption,
  Overline,
  ButtonText,
  ErrorText,
  SuccessText,
  WarningText,
  InfoText,
  Text,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Paragraph,
};