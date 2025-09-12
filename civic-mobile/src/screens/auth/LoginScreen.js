import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { TextInput, Button, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();

  const handleLogin = async () => {
    setError(''); // Clear previous errors
    
    if (!emailOrPhone || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await login(emailOrPhone, password);
    setLoading(false);

    if (!result.success) {
      setError(result.message || 'Login failed. Please try again.');
    }
  };

  const clearError = () => {
    if (error) setError('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <Text style={styles.title}>Welcome to Civic Setu</Text>
              <Text style={styles.subtitle}>Report civic issues in Jharkhand</Text>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons name="alert-circle" size={22} color="#FF5252" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TextInput
              label="Email or Phone"
              value={emailOrPhone}
              onChangeText={(text) => {
                setEmailOrPhone(text);
                clearError();
              }}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearError();
              }}
              mode="outlined"
              style={styles.input}
              secureTextEntry={!showPassword}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Sign In
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate('Register')}
              style={styles.linkButton}
            >
              Don't have an account? Register
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    minHeight: '100vh',
  },
  scrollContainer: {
    flexGrow: 1,
    minHeight: '100vh',
    justifyContent: 'center',
    padding: 20,
    paddingVertical: 40,
  },
  card: {
    elevation: 8,
    borderRadius: 16,
    backgroundColor: '#1E1E1E',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#B0B0B0',
    fontWeight: '400',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1B1B',
    borderColor: '#FF5252',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  errorText: {
    color: '#FF8A80',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  input: {
    marginBottom: 18,
    backgroundColor: '#2A2A2A',
  },
  button: {
    marginTop: 24,
    marginBottom: 20,
    paddingVertical: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    elevation: 3,
  },
  linkButton: {
    marginTop: 12,
  },
});

export default LoginScreen;