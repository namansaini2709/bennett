import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CATEGORIES } from '../../constants/config';
import reportService from '../../services/reportService';
import locationService from '../../services/locationService';
import {
  AnimatedCard,
  AnimatedButton,
  AnimatedInput,
  LoadingOverlay,
} from '../../components/ui/AnimatedComponents';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const { width: screenWidth } = Dimensions.get('window');

const CreateReportScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  // Form state
  const [currentStep, setCurrentStep] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Location state
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [useManualLocation, setUseManualLocation] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);

  // Form validation
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Animation refs
  const progressAnim = useRef(new Animated.Value(0)).current;
  const stepOpacity = useRef(new Animated.Value(1)).current;

  const steps = [
    { title: 'Basic Information', icon: 'information' },
    { title: 'Location Details', icon: 'map-marker' },
    { title: 'Add Photo', icon: 'camera' },
    { title: 'Review & Submit', icon: 'check-circle' },
  ];

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: currentStep / (steps.length - 1),
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0:
        if (!title.trim()) newErrors.title = 'Title is required';
        if (!description.trim()) newErrors.description = 'Description is required';
        if (!category) newErrors.category = 'Category is required';
        break;
      case 1:
        if (!address.trim()) {
          newErrors.address = 'Address is required';
        }
        break;
      case 2:
        // Photo is optional
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        Animated.timing(stepOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }).start(() => {
          setCurrentStep(currentStep + 1);
          Animated.timing(stepOpacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }).start();
        });
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      Animated.timing(stepOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(currentStep - 1);
        setErrors({});
        Animated.timing(stepOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const getCurrentLocation = async () => {
    setIsLocationLoading(true);
    try {
      const locationData = await locationService.getCurrentLocationWithAddress();
      setLocation({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      });
      setAddress(locationData.address);
      setUseManualLocation(false);
    } catch (error) {
      Alert.alert(
        'Location Error',
        'Unable to get your current location. You can enter the address manually.',
        [{ text: 'OK' }]
      );
      setUseManualLocation(true);
    } finally {
      setIsLocationLoading(false);
    }
  };

  const searchAddress = async (query) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    try {
      const suggestions = await locationService.searchAddresses(query);
      setAddressSuggestions(suggestions);
    } catch (error) {
      console.error('Error searching addresses:', error);
    }
  };

  const selectAddress = async (suggestion) => {
    setAddress(suggestion.title);
    setLocation(suggestion.coordinates);
    setAddressSuggestions([]);
  };

  const handleManualAddressChange = async (value) => {
    setAddress(value);
    if (value.length > 3) {
      try {
        const coordinates = await locationService.geocodeAddress(value);
        setLocation(coordinates);
      } catch (error) {
        // Address not found, keep the text but clear coordinates
        setLocation(null);
      }
    }
    searchAddress(value);
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant camera permissions to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const resetForm = () => {
    console.log('🔄 Resetting form - START');
    console.log('Current values before reset:', { title, description, category, address, image, currentStep });

    // Reset form state
    setTitle('');
    setDescription('');
    setCategory('');
    setLocation(null);
    setAddress('');
    setImage(null);
    setCurrentStep(0);
    setErrors({});
    setTouched({});
    setUseManualLocation(false);
    setAddressSuggestions([]);
    setIsLocationLoading(false);
    setLoading(false);

    // Reset animation values
    progressAnim.setValue(0);
    stepOpacity.setValue(1);

    console.log('✅ Form reset - COMPLETE');
    console.log('New values after reset should be empty');
  };

  const handleReset = () => {
    console.log('Reset button pressed');
    setShowResetDialog(true);
  };

  const confirmReset = () => {
    console.log('User confirmed reset');
    setShowResetDialog(false);
    resetForm();
  };

  const cancelReset = () => {
    console.log('Reset cancelled');
    setShowResetDialog(false);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    resetForm();
    // Navigate to Home tab
    navigation.navigate('Home');
  };

  const handleSubmit = async () => {
    if (!validateStep(0) || !validateStep(1)) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const reportData = {
        title: title.trim(),
        description: description.trim(),
        category,
        location: {
          address: address.trim(),
          latitude: location?.latitude,
          longitude: location?.longitude,
        },
        image,
      };

      const result = await reportService.createReport(reportData);

      if (result.success) {
        setShowSuccessModal(true);
      } else {
        Alert.alert('Error', result.message || 'Failed to submit report. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={[styles.progressTrack, { backgroundColor: theme.colors.border.primary }]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: theme.colors.primary.main,
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <Text style={[styles.progressText, { color: theme.colors.text.secondary }]}>
        Step {currentStep + 1} of {steps.length}
      </Text>
    </View>
  );

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {steps.map((step, index) => (
        <Animatable.View
          key={index}
          animation={currentStep >= index ? 'pulse' : undefined}
          style={[
            styles.stepItem,
            {
              backgroundColor:
                currentStep >= index ? theme.colors.primary.main : theme.colors.border.primary,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={step.icon}
            size={16}
            color={currentStep >= index ? theme.colors.text.contrast : theme.colors.text.tertiary}
          />
        </Animatable.View>
      ))}
    </View>
  );

  const renderBasicInformation = () => (
    <Animated.View style={[styles.stepContent, { opacity: stepOpacity }]}>
      <AnimatedCard style={styles.card}>
        <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
          Tell us about the issue
        </Text>

        <AnimatedInput
          label="Report Title"
          value={title}
          onChangeText={setTitle}
          placeholder="Brief title for your report"
          error={errors.title}
          style={styles.input}
        />

        <AnimatedInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the issue in detail..."
          multiline
          numberOfLines={4}
          error={errors.description}
          style={[styles.input, styles.textArea]}
        />

        <Text style={[styles.inputLabel, { color: theme.colors.text.primary }]}>
          Category
        </Text>
        <View style={styles.categoryContainer}>
          {Object.keys(CATEGORIES).map((key) => (
            <TouchableOpacity
              key={key}
              onPress={() => setCategory(key)}
              style={[
                styles.categoryItem,
                {
                  backgroundColor: category === key
                    ? theme.colors.primary.main
                    : theme.colors.surface.secondary,
                  borderColor: category === key
                    ? theme.colors.primary.main
                    : theme.colors.border.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  {
                    color: category === key
                      ? theme.colors.text.contrast
                      : theme.colors.text.primary,
                  },
                ]}
              >
                {CATEGORIES[key]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.category && (
          <Text style={[styles.errorText, { color: theme.colors.status.error }]}>
            {errors.category}
          </Text>
        )}
      </AnimatedCard>
    </Animated.View>
  );

  const renderLocationDetails = () => (
    <Animated.View style={[styles.stepContent, { opacity: stepOpacity }]}>
      <AnimatedCard style={styles.card}>
        <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
          Where is the issue located?
        </Text>

        <AnimatedInput
          label="Enter Location"
          value={address}
          onChangeText={handleManualAddressChange}
          placeholder="Type the address or location"
          multiline
          error={errors.address || errors.location}
          style={styles.input}
        />

        {addressSuggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {addressSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => selectAddress(suggestion)}
                style={[
                  styles.suggestionItem,
                  { backgroundColor: theme.colors.surface.secondary },
                ]}
              >
                <MaterialCommunityIcons
                  name="map-marker"
                  size={16}
                  color={theme.colors.primary.main}
                  style={{ marginRight: 8 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.suggestionTitle, { color: theme.colors.text.primary }]}>
                    {suggestion.title}
                  </Text>
                  <Text style={[styles.suggestionSubtitle, { color: theme.colors.text.secondary }]}>
                    {suggestion.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.orDivider}>
          <View style={[styles.dividerLine, { backgroundColor: theme.colors.border.primary }]} />
          <Text style={[styles.orText, { color: theme.colors.text.secondary }]}>OR</Text>
          <View style={[styles.dividerLine, { backgroundColor: theme.colors.border.primary }]} />
        </View>

        <AnimatedButton
          onPress={getCurrentLocation}
          disabled={isLocationLoading}
          variant="primary"
          style={styles.useLocationButton}
          icon={
            <MaterialCommunityIcons
              name="crosshairs-gps"
              size={20}
              color={theme.colors.text.contrast}
            />
          }
        >
          <Text style={[styles.buttonText, { color: theme.colors.text.contrast }]}>
            {isLocationLoading ? 'Getting Location...' : 'Use My Current Location'}
          </Text>
        </AnimatedButton>

        {location && address && (
          <AnimatedCard style={styles.locationCard}>
            <MaterialCommunityIcons
              name="map-marker-check"
              size={24}
              color={theme.colors.status.success}
              style={{ marginBottom: 8 }}
            />
            <Text style={[styles.locationText, { color: theme.colors.text.primary }]}>
              {address}
            </Text>
            <Text style={[styles.coordinatesText, { color: theme.colors.text.secondary }]}>
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </Text>
          </AnimatedCard>
        )}
      </AnimatedCard>
    </Animated.View>
  );

  const renderAddPhoto = () => (
    <Animated.View style={[styles.stepContent, { opacity: stepOpacity }]}>
      <AnimatedCard style={styles.card}>
        <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
          Add a photo (Optional)
        </Text>
        <Text style={[styles.stepSubtitle, { color: theme.colors.text.secondary }]}>
          A photo helps authorities understand the issue better
        </Text>

        {image ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image.uri }} style={styles.previewImage} />
            <TouchableOpacity
              onPress={() => setImage(null)}
              style={[styles.removeImageButton, { backgroundColor: theme.colors.status.error }]}
            >
              <MaterialCommunityIcons
                name="close"
                size={20}
                color={theme.colors.text.contrast}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoButtonsContainer}>
            <AnimatedButton
              onPress={takePhoto}
              variant="primary"
              style={styles.photoButton}
              icon={
                <MaterialCommunityIcons
                  name="camera"
                  size={24}
                  color={theme.colors.text.contrast}
                />
              }
            >
              <Text style={[styles.buttonText, { color: theme.colors.text.contrast }]}>
                Take Photo
              </Text>
            </AnimatedButton>

            <View style={styles.orDivider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.border.primary }]} />
              <Text style={[styles.orText, { color: theme.colors.text.secondary }]}>OR</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.border.primary }]} />
            </View>

            <AnimatedButton
              onPress={pickImage}
              variant="outline"
              style={styles.photoButton}
              icon={
                <MaterialCommunityIcons
                  name="image"
                  size={24}
                  color={theme.colors.primary.main}
                />
              }
            >
              <Text style={[styles.buttonText, { color: theme.colors.primary.main }]}>
                Choose from Gallery
              </Text>
            </AnimatedButton>
          </View>
        )}
      </AnimatedCard>
    </Animated.View>
  );

  const renderReviewSubmit = () => (
    <Animated.View style={[styles.stepContent, { opacity: stepOpacity }]}>
      <AnimatedCard style={styles.card}>
        <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
          Review Your Report
        </Text>

        <View style={styles.reviewSection}>
          <Text style={[styles.reviewLabel, { color: theme.colors.text.secondary }]}>Title</Text>
          <Text style={[styles.reviewValue, { color: theme.colors.text.primary }]}>{title}</Text>
        </View>

        <View style={styles.reviewSection}>
          <Text style={[styles.reviewLabel, { color: theme.colors.text.secondary }]}>Category</Text>
          <Text style={[styles.reviewValue, { color: theme.colors.text.primary }]}>
            {CATEGORIES[category]}
          </Text>
        </View>

        <View style={styles.reviewSection}>
          <Text style={[styles.reviewLabel, { color: theme.colors.text.secondary }]}>Description</Text>
          <Text style={[styles.reviewValue, { color: theme.colors.text.primary }]}>{description}</Text>
        </View>

        <View style={styles.reviewSection}>
          <Text style={[styles.reviewLabel, { color: theme.colors.text.secondary }]}>Location</Text>
          <Text style={[styles.reviewValue, { color: theme.colors.text.primary }]}>{address}</Text>
        </View>

        {image && (
          <View style={styles.reviewSection}>
            <Text style={[styles.reviewLabel, { color: theme.colors.text.secondary }]}>Photo</Text>
            <Image source={{ uri: image.uri }} style={styles.reviewImage} />
          </View>
        )}

        <AnimatedButton
          onPress={handleSubmit}
          disabled={loading}
          variant="primary"
          style={styles.submitButton}
          icon={
            <MaterialCommunityIcons
              name="send"
              size={20}
              color={theme.colors.text.contrast}
            />
          }
        >
          <Text style={[styles.buttonText, { color: theme.colors.text.contrast }]}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </Text>
        </AnimatedButton>
      </AnimatedCard>
    </Animated.View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInformation();
      case 1:
        return renderLocationDetails();
      case 2:
        return renderAddPhoto();
      case 3:
        return renderReviewSubmit();
      default:
        return renderBasicInformation();
    }
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
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={theme.colors.text.contrast}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Report</Text>
          <TouchableOpacity
            onPress={handleReset}
            style={styles.resetButton}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons
              name="refresh"
              size={24}
              color={theme.colors.text.contrast}
            />
          </TouchableOpacity>
        </View>
        {renderStepIndicator()}
        {renderProgressBar()}
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
          {renderCurrentStep()}
        </ScrollView>

        <View style={styles.navigationButtons}>
          {currentStep > 0 && (
            <AnimatedButton
              onPress={handlePrevious}
              variant="outline"
              style={[styles.navButton, { marginRight: 12 }]}
            >
              <Text style={[styles.buttonText, { color: theme.colors.primary.main }]}>
                Previous
              </Text>
            </AnimatedButton>
          )}

          {currentStep < steps.length - 1 && (
            <AnimatedButton
              onPress={handleNext}
              variant="primary"
              style={[styles.navButton, { flex: 1 }]}
            >
              <Text style={[styles.buttonText, { color: theme.colors.text.contrast }]}>
                Next
              </Text>
            </AnimatedButton>
          )}
        </View>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={loading} text="Submitting your report..." />

      <ConfirmDialog
        visible={showResetDialog}
        title="Reset Form"
        message="Are you sure you want to reset the entire form? All entered data will be lost."
        confirmText="Reset"
        cancelText="Cancel"
        onConfirm={confirmReset}
        onCancel={cancelReset}
        confirmStyle="destructive"
        icon="refresh"
      />

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Animatable.View
              animation="bounceIn"
              duration={600}
              style={styles.modalContent}
            >
              <MaterialCommunityIcons
                name="check-circle"
                size={60}
                color="#4CAF50"
                style={styles.successIcon}
              />
              <Text style={styles.modalTitle}>Report Submitted Successfully!</Text>
              <Text style={styles.modalMessage}>
                Thank you for reporting this civic issue. Your report has been submitted and will be reviewed by the authorities.
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleSuccessModalClose}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </Animatable.View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  resetButton: {
    padding: 8,
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  stepItem: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressTrack: {
    width: '80%',
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
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
    paddingBottom: 100,
  },
  stepContent: {
    minHeight: 400,
  },
  card: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  orText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
  },
  useLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    width: '100%',
  },
  manualLocationContainer: {
    marginTop: 8,
  },
  suggestionsContainer: {
    marginTop: 8,
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  suggestionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  currentLocationContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  locationCard: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 12,
  },
  noLocationContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noLocationText: {
    fontSize: 14,
    textAlign: 'center',
  },
  photoButtonsContainer: {
    marginTop: 20,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    width: '100%',
  },
  imageContainer: {
    position: 'relative',
    marginTop: 20,
    alignItems: 'center',
  },
  previewImage: {
    width: screenWidth - 80,
    height: (screenWidth - 80) * 0.75,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewSection: {
    marginBottom: 20,
  },
  reviewLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  reviewValue: {
    fontSize: 16,
    lineHeight: 22,
  },
  reviewImage: {
    width: 100,
    height: 75,
    borderRadius: 8,
    marginTop: 8,
  },
  submitButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  navigationButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 0,
    maxWidth: 350,
    width: '100%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalContent: {
    alignItems: 'center',
    padding: 30,
  },
  successIcon: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  modalButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateReportScreen;