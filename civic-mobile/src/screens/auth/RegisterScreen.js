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
import { useAuth } from '../../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { register } = useAuth();

  const handleRegister = async () => {
    const { name, email, phone, password, confirmPassword } = formData;

    if (!name || !email || !phone || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      Alert.alert('Error', 'Please enter a valid Indian phone number');
      return;
    }

    setLoading(true);
    const result = await register({
      name,
      email,
      phone,
      password
    });
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Registration successful!');
    } else {
      Alert.alert('Registration Failed', result.message);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join Civic Setu today</Text>
            </View>

            <TextInput
              label="Full Name"
              value={formData.name}
              onChangeText={(text) => updateFormData('name', text)}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Email"
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              label="Phone Number"
              value={formData.phone}
              onChangeText={(text) => updateFormData('phone', text)}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
              placeholder="10-digit mobile number"
            />

            <TextInput
              label="Password"
              value={formData.password}
              onChangeText={(text) => updateFormData('password', text)}
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

            <TextInput
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(text) => updateFormData('confirmPassword', text)}
              mode="outlined"
              style={styles.input}
              secureTextEntry={!showPassword}
            />

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Register
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              style={styles.linkButton}
            >
              Already have an account? Sign In
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
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    elevation: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    marginBottom: 10,
    paddingVertical: 5,
  },
  linkButton: {
    marginTop: 10,
  },
});

export default RegisterScreen;