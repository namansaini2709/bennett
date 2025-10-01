import * as Location from 'expo-location';

class LocationService {
  constructor() {
    this.watchId = null;
  }

  // Request location permissions
  async requestPermissions() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }
      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      throw error;
    }
  }

  // Get current location with high accuracy
  async getCurrentLocation() {
    try {
      await this.requestPermissions();

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000,
        maximumAge: 30000,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      throw error;
    }
  }

  // Convert coordinates to human-readable address
  // Note: reverseGeocodeAsync is deprecated in SDK 49+
  // For production, use Google Places API or another geocoding service
  async reverseGeocode(latitude, longitude) {
    try {
      // Fallback - returns coordinates as address
      // TODO: Integrate Google Places API for production
      return {
        formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        streetNumber: '',
        street: '',
        district: '',
        city: 'Jharkhand',
        region: 'Jharkhand',
        postalCode: '',
        country: 'India',
        coordinates: { latitude, longitude },
      };
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return {
        formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        coordinates: { latitude, longitude },
      };
    }
  }

  // Convert address to coordinates
  async geocodeAddress(address) {
    try {
      const results = await Location.geocodeAsync(address);

      if (results.length > 0) {
        const result = results[0];
        return {
          latitude: result.latitude,
          longitude: result.longitude,
          accuracy: result.accuracy || null,
        };
      }

      throw new Error('Address not found');
    } catch (error) {
      console.error('Error geocoding address:', error);
      throw error;
    }
  }

  // Search for addresses with suggestions
  async searchAddresses(query, region = 'IN') {
    try {
      if (!query || query.length < 3) {
        return [];
      }

      // Use basic geocoding for now
      // In production, you might want to use Google Places API or similar
      const results = await Location.geocodeAsync(query);

      return results.map((result, index) => ({
        id: `search_${index}`,
        title: query,
        subtitle: `${result.latitude.toFixed(6)}, ${result.longitude.toFixed(6)}`,
        coordinates: {
          latitude: result.latitude,
          longitude: result.longitude,
        },
      }));
    } catch (error) {
      console.error('Error searching addresses:', error);
      return [];
    }
  }

  // Start watching location changes
  async startLocationWatch(callback, options = {}) {
    try {
      await this.requestPermissions();

      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: options.timeInterval || 10000,
          distanceInterval: options.distanceInterval || 100,
        },
        (location) => {
          const locationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            timestamp: location.timestamp,
          };
          callback(locationData);
        }
      );

      return this.watchId;
    } catch (error) {
      console.error('Error starting location watch:', error);
      throw error;
    }
  }

  // Stop watching location changes
  stopLocationWatch() {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }
  }

  // Get current location with address
  async getCurrentLocationWithAddress() {
    try {
      const coordinates = await this.getCurrentLocation();
      const address = await this.reverseGeocode(
        coordinates.latitude,
        coordinates.longitude
      );

      return {
        ...coordinates,
        address: address.formattedAddress,
        addressDetails: address,
      };
    } catch (error) {
      console.error('Error getting current location with address:', error);
      throw error;
    }
  }

  // Validate coordinates
  isValidCoordinate(latitude, longitude) {
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  }

  // Calculate distance between two points
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }
}

export default new LocationService();