import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../context/ThemeContext';

export const InfoDialog = ({
  visible,
  title,
  message,
  buttonText = 'OK',
  onClose,
  icon = 'information-outline',
  iconColor,
}) => {
  const { theme } = useTheme();

  const defaultIconColor = iconColor || theme.colors.primary.main;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
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
              color={defaultIconColor}
            />
          </View>

          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            {title}
          </Text>

          <Text style={[styles.message, { color: theme.colors.text.secondary }]}>
            {message}
          </Text>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: theme.colors.primary.main }
            ]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>
              {buttonText}
            </Text>
          </TouchableOpacity>
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
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default InfoDialog;