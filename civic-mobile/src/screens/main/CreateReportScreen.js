import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { CATEGORIES } from '../../constants/config';
import reportService from '../../services/reportService';
import { showSuccessAlert, showErrorAlert } from '../../utils/errorHandler';

const CreateReportScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission required", "You need to grant camera roll permissions to upload images");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to get your current location.');
        setLocationLoading(false);
        return;
      }

      // Get current position
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setLocation(coords);

      // Get address from coordinates
      const addressResults = await Location.reverseGeocodeAsync(coords);
      if (addressResults.length > 0) {
        const result = addressResults[0];
        const fullAddress = [
          result.name,
          result.street,
          result.district,
          result.city,
          result.region,
          result.postalCode
        ].filter(Boolean).join(', ');
        
        console.log('📍 Address resolved:', fullAddress);
        setAddress(fullAddress);
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get location. Please try again or enter manually.');
    }
    setLocationLoading(false);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !category) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (!location && !address.trim()) {
      Alert.alert('Error', 'Please provide either GPS location or manual address');
      return;
    }

    setLoading(true);
    try {
      const reportData = {
        title: title.trim(),
        description: description.trim(),
        category,
        location: {
          latitude: location?.latitude || null,
          longitude: location?.longitude || null,
          address: address.trim()
        },
        image
      };

      console.log('Submitting report data:', reportData);
      
      const result = await reportService.createReport(reportData);
      
      if (result.success) {
        showSuccessAlert(
          result.message || 'Report submitted successfully!',
          'Success',
          () => navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          })
        );
        
        // Clear form
        setTitle('');
        setDescription('');
        setCategory('');
        setImage(null);
        setLocation(null);
        setAddress('');
      } else {
        showErrorAlert(new Error(result.message));
      }
    } catch (error) {
      console.error('Submit error:', error);
      showErrorAlert(error, 'Submission Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter report title"
          multiline
        />

        <Text style={styles.label}>Category *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={setCategory}
            style={styles.picker}
          >
            <Picker.Item label="Select Category" value="" />
            {CATEGORIES.map((cat) => (
              <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the issue in detail"
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Location (GPS or Address required) *</Text>
        <View style={styles.locationContainer}>
          <TouchableOpacity
            style={[styles.locationButton, locationLoading && styles.disabledButton]}
            onPress={getCurrentLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <ActivityIndicator size="small" color="#2196F3" />
            ) : (
              <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#2196F3" />
            )}
            <Text style={styles.locationButtonText}>
              {locationLoading ? 'Getting Location...' : 'Use Current Location'}
            </Text>
          </TouchableOpacity>
          
          {location && (
            <View style={styles.locationInfo}>
              <MaterialCommunityIcons name="map-marker" size={16} color="#4CAF50" />
              <Text style={styles.coordinatesText}>
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.label}>Address (Alternative to GPS)</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="Enter address or use GPS location"
          multiline
        />

        <Text style={styles.label}>Photo</Text>
        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.imageButtonText}>
            {image ? 'Change Photo' : 'Add Photo'}
          </Text>
        </TouchableOpacity>

        {image && (
          <Image source={{ uri: image }} style={styles.imagePreview} />
        )}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  imageButton: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  imageButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
    marginBottom: 8,
  },
  locationButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    padding: 8,
    borderRadius: 6,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
    fontFamily: 'monospace',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateReportScreen;