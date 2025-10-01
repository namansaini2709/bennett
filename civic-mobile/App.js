import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

let AuthNavigator, MainNavigator, AuthProvider, useAuth, ThemeProvider;

try {
  AuthNavigator = require('./src/navigation/AuthNavigator').default;
  MainNavigator = require('./src/navigation/MainNavigator').default;
  const AuthModule = require('./src/context/AuthContext');
  AuthProvider = AuthModule.AuthProvider;
  useAuth = AuthModule.useAuth;
  const ThemeModule = require('./src/context/ThemeContext');
  ThemeProvider = ThemeModule.ThemeProvider;
} catch (error) {
  console.error('Error importing components:', error);
}

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading CIVIC SETU...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  if (!AuthNavigator || !MainNavigator || !AuthProvider || !useAuth || !ThemeProvider) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <StatusBar style="auto" />
        <Text style={{ fontSize: 18, marginBottom: 10 }}>CIVIC SETU</Text>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>
          Error loading application components. Please restart the app.
        </Text>
        {!AuthNavigator ? <Text style={{ color: 'red', marginBottom: 5 }}>• AuthNavigator failed to load</Text> : null}
        {!MainNavigator ? <Text style={{ color: 'red', marginBottom: 5 }}>• MainNavigator failed to load</Text> : null}
        {!AuthProvider ? <Text style={{ color: 'red', marginBottom: 5 }}>• AuthProvider failed to load</Text> : null}
        {!ThemeProvider ? <Text style={{ color: 'red', marginBottom: 5 }}>• ThemeProvider failed to load</Text> : null}
      </View>
    );
  }

  try {
    return (
      <SafeAreaProvider>
        <ThemeProvider>
          <PaperProvider>
            <AuthProvider>
              <AppNavigator />
            </AuthProvider>
          </PaperProvider>
        </ThemeProvider>
      </SafeAreaProvider>
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
