import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity
} from 'react-native';
import { TextInput, Button, Card, Menu, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'citizen'
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [roleMenuVisible, setRoleMenuVisible] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();

  const handleRegister = async () => {
    setError(''); // Clear previous errors
    const { name, email, phone, password, confirmPassword, role } = formData;

    if (!name || !email || !phone || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Please enter a valid Indian phone number');
      return;
    }

    setLoading(true);
    const result = await register({
      name,
      email,
      phone,
      password,
      role
    });
    setLoading(false);

    if (result.success) {
      setError('');
      Alert.alert('Success', 'Registration successful!', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } else {
      setError(result.message || 'Registration failed. Please try again.');
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
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
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join Civic Setu today</Text>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons name="alert-circle" size={22} color="#FF5252" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

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

            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Role</Text>
              <Menu
                visible={roleMenuVisible}
                onDismiss={() => setRoleMenuVisible(false)}
                anchor={
                  <TouchableOpacity
                    style={styles.roleSelector}
                    onPress={() => setRoleMenuVisible(true)}
                  >
                    <View style={styles.roleContent}>
                      <Text style={styles.roleText}>
                        {formData.role === 'citizen' && 'Citizen'}
                        {formData.role === 'staff' && 'Staff'}
                        {formData.role === 'supervisor' && 'Supervisor'}
                        {formData.role === 'admin' && 'Admin'}
                      </Text>
                      <MaterialCommunityIcons name="chevron-down" size={22} color="#B0B0B0" />
                    </View>
                  </TouchableOpacity>
                }
              >
                <Menu.Item
                  onPress={() => {
                    updateFormData('role', 'citizen');
                    setRoleMenuVisible(false);
                  }}
                  title="Citizen"
                />
                <Divider />
                <Menu.Item
                  onPress={() => {
                    updateFormData('role', 'staff');
                    setRoleMenuVisible(false);
                  }}
                  title="Staff"
                />
                <Divider />
                <Menu.Item
                  onPress={() => {
                    updateFormData('role', 'supervisor');
                    setRoleMenuVisible(false);
                  }}
                  title="Supervisor"
                />
                <Divider />
                <Menu.Item
                  onPress={() => {
                    updateFormData('role', 'admin');
                    setRoleMenuVisible(false);
                  }}
                  title="Admin"
                />
              </Menu>
            </View>

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
  roleContainer: {
    marginBottom: 18,
  },
  roleLabel: {
    fontSize: 13,
    color: '#B0B0B0',
    marginBottom: 8,
    marginLeft: 12,
    fontWeight: '600',
  },
  roleSelector: {
    borderWidth: 1.5,
    borderColor: '#404040',
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
    minHeight: 60,
    justifyContent: 'center',
    elevation: 2,
  },
  roleContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  roleText: {
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '500',
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

export default RegisterScreen;