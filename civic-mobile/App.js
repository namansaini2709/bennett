import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

// Import components with try-catch handling
let AuthNavigator, MainNavigator, AuthProvider;

try {
  AuthNavigator = require('./src/navigation/AuthNavigator').default;
  MainNavigator = require('./src/navigation/MainNavigator').default;
  const AuthModule = require('./src/context/AuthContext');
  AuthProvider = AuthModule.AuthProvider;
} catch (error) {
  console.error('Error importing components:', error);
}

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      setUserToken(token);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setError('Failed to check authentication status');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading CIVIC SETU...</Text>
      </View>
    );
  }

  if (error || !AuthNavigator || !MainNavigator || !AuthProvider) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <StatusBar style="auto" />
        <Text style={{ fontSize: 18, marginBottom: 10 }}>CIVIC SETU</Text>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>
          {error || 'Error loading application components. Please restart the app.'}
        </Text>
        {!AuthNavigator && <Text style={{ color: 'red', marginBottom: 5 }}>• AuthNavigator failed to load</Text>}
        {!MainNavigator && <Text style={{ color: 'red', marginBottom: 5 }}>• MainNavigator failed to load</Text>}
        {!AuthProvider && <Text style={{ color: 'red', marginBottom: 5 }}>• AuthProvider failed to load</Text>}
      </View>
    );
  }

  try {
    return (
      <PaperProvider>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {userToken ? (
                <Stack.Screen name="Main" component={MainNavigator} />
              ) : (
                <Stack.Screen name="Auth" component={AuthNavigator} />
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </AuthProvider>
      </PaperProvider>
    );
  } catch (renderError) {
    console.error('Render error:', renderError);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <StatusBar style="auto" />
        <Text style={{ fontSize: 18, marginBottom: 10 }}>CIVIC SETU</Text>
        <Text style={{ textAlign: 'center' }}>
          Application error: {renderError.message || 'Unknown error occurred'}
        </Text>
      </View>
    );
  }
}
