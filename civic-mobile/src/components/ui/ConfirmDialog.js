import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../context/ThemeContext';

export const ConfirmDialog = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  confirmStyle = 'default',
  icon = 'alert-circle-outline',
}) => {
  const { theme } = useTheme();

  const getConfirmButtonColor = () => {
    switch (confirmStyle) {
      case 'destructive':
        return '#EF4444';
      case 'primary':
        return theme.colors.primary.main;
      default:
        return theme.colors.primary.main;
    }
  };

  const getIconColor = () => {
    switch (confirmStyle) {
      case 'destructive':
        return '#EF4444';
      case 'primary':
        return theme.colors.primary.main;
      default:
        return theme.colors.primary.main;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Animatable.View
          animation="zoomIn"
          duration={300}
          style={[
            styles.container,
            { backgroundColor: theme.colors.surface.primary }
          ]}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={icon}
              size={48}
              color={getIconColor()}
            />
          </View>

          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            {title}
          </Text>

          <Text style={[styles.message, { color: theme.colors.text.secondary }]}>
            {message}
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                { borderColor: theme.colors.border.primary }
              ]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.text.secondary }]}>
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: getConfirmButtonColor() }
              ]}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    borderRadius: 20,
    padding: 24,
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  confirmButton: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ConfirmDialog;