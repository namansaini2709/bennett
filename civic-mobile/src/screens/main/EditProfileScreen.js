import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedCard, AnimatedInput, AnimatedButton } from '../../components/ui/AnimatedComponents';
import * as Animatable from 'react-native-animatable';

const EditProfileScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const { user, updateUserProfile } = useAuth();
  const insets = useSafeAreaInsets();

  // Form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(
    typeof user?.address === 'string'
      ? user.address
      : user?.address?.city || ''
  );
  const [loading, setLoading] = useState(false);

  // Form validation
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[+]?[0-9]{10,15}$/.test(phone.replace(/\s+/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const updatedProfile = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim()
      };

      // Here you would typically call an API to update the profile
      // For now, we'll just simulate the update
      if (updateUserProfile) {
        await updateUserProfile(updatedProfile);
      }

      Alert.alert(
        'Success',
        'Your profile has been updated successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Simply go back without saving changes
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />

      <LinearGradient
        colors={theme.colors.gradient.primary}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={handleCancel}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={theme.colors.text.contrast}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={styles.saveButton}
            disabled={loading}
          >
            <MaterialCommunityIcons
              name="check"
              size={24}
              color={theme.colors.text.contrast}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animatable.View
            animation="fadeInUp"
            duration={600}
            style={styles.formContainer}
          >
            <AnimatedCard style={styles.card}>
              <View style={styles.avatarContainer}>
                <View style={[
                  styles.avatarCircle,
                  { backgroundColor: theme.colors.primary.main + '20' }
                ]}>
                  <MaterialCommunityIcons
                    name="account-circle"
                    size={80}
                    color={theme.colors.primary.main}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.changePhotoButton, { backgroundColor: theme.colors.primary.main }]}
                  onPress={() => Alert.alert('Coming Soon', 'Photo upload will be available soon!')}
                >
                  <MaterialCommunityIcons
                    name="camera"
                    size={16}
                    color={theme.colors.text.contrast}
                  />
                </TouchableOpacity>
              </View>

              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                Personal Information
              </Text>

              <AnimatedInput
                label="Full Name"
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                error={errors.name}
                style={styles.input}
                icon="account"
              />

              <AnimatedInput
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email address"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                style={styles.input}
                icon="email"
              />

              <AnimatedInput
                label="Phone Number"
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                error={errors.phone}
                style={styles.input}
                icon="phone"
              />

              <AnimatedInput
                label="Address"
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your address"
                multiline
                numberOfLines={3}
                error={errors.address}
                style={[styles.input, styles.textArea]}
                icon="map-marker"
              />

              <View style={styles.buttonContainer}>
                <AnimatedButton
                  onPress={handleCancel}
                  variant="outline"
                  style={[styles.button, styles.cancelButton]}
                >
                  <Text style={[styles.buttonText, { color: theme.colors.text.secondary }]}>
                    Cancel
                  </Text>
                </AnimatedButton>

                <AnimatedButton
                  onPress={handleSave}
                  variant="primary"
                  style={[styles.button, styles.saveButtonFull]}
                  disabled={loading}
                >
                  <Text style={[styles.buttonText, { color: theme.colors.text.contrast }]}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Text>
                </AnimatedButton>
              </View>
            </AnimatedCard>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backButton: {
    padding: 4,
  },
  saveButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  formContainer: {
    flex: 1,
  },
  card: {
    padding: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  textArea: {
    minHeight: 80,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 32,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
  },
  cancelButton: {
    flex: 0.4,
  },
  saveButtonFull: {
    flex: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default EditProfileScreen;