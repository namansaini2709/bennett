import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const toast = useToast();
  const { register } = useAuth();

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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [roleMenuVisible, setRoleMenuVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const validateField = (field, value) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Full name is required';
        } else if (value.trim().length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        } else {
          delete newErrors.name;
        }
        break;
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          newErrors.email = 'Please enter a valid email';
        } else {
          delete newErrors.email;
        }
        break;
      case 'phone':
        if (!value.trim()) {
          newErrors.phone = 'Phone number is required';
        } else if (!/^[6-9]\d{9}$/.test(value)) {
          newErrors.phone = 'Please enter a valid 10-digit phone number';
        } else {
          delete newErrors.phone;
        }
        break;
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        } else {
          delete newErrors.password;
        }
        break;
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));

    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleRegister = async () => {
    const { name, email, phone, password, confirmPassword, role } = formData;

    const nameValid = validateField('name', name);
    const emailValid = validateField('email', email);
    const phoneValid = validateField('phone', phone);
    const passwordValid = validateField('password', password);
    const confirmPasswordValid = validateField('confirmPassword', confirmPassword);

    if (!nameValid || !emailValid || !phoneValid || !passwordValid || !confirmPasswordValid) {
      setTouched({
        name: true,
        email: true,
        phone: true,
        password: true,
        confirmPassword: true
      });
      toast.error('Please correct the errors and try again');
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role
      });

      if (result.success) {
        toast.success('Registration successful!');
        setTimeout(() => {
          navigation.navigate('Login');
        }, 1000);
      } else {
        toast.error(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ],
              },
            ]}
          >
            <Animated.View style={styles.card}>
              <View style={styles.headerSection}>
                <Text style={styles.brandName}>Create Account</Text>
                <Text style={styles.welcomeSubtext}>Join Civic Setu today</Text>
              </View>

              {Object.keys(errors).length > 0 && (
                <View style={styles.errorContainer}>
                  <MaterialCommunityIcons name="alert-circle" size={16} color="#EF4444" />
                  <Text style={styles.errorText}>
                    Please correct the highlighted fields
                  </Text>
                </View>
              )}

              <View style={styles.formSection}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <View style={[styles.inputWrapper, touched.name && errors.name && styles.inputError]}>
                    <TextInput
                      value={formData.name}
                      onChangeText={(value) => handleFieldChange('name', value)}
                      placeholder="Enter your full name"
                      placeholderTextColor="#9CA3AF"
                      style={styles.textInput}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </View>
                  {touched.name && errors.name && (
                    <Text style={styles.fieldError}>{errors.name}</Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <View style={[styles.inputWrapper, touched.email && errors.email && styles.inputError]}>
                    <TextInput
                      value={formData.email}
                      onChangeText={(value) => handleFieldChange('email', value)}
                      placeholder="Enter your email"
                      placeholderTextColor="#9CA3AF"
                      style={styles.textInput}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  {touched.email && errors.email && (
                    <Text style={styles.fieldError}>{errors.email}</Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <View style={[styles.inputWrapper, touched.phone && errors.phone && styles.inputError]}>
                    <TextInput
                      value={formData.phone}
                      onChangeText={(value) => handleFieldChange('phone', value)}
                      placeholder="Enter 10-digit phone number"
                      placeholderTextColor="#9CA3AF"
                      style={styles.textInput}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                  </View>
                  {touched.phone && errors.phone && (
                    <Text style={styles.fieldError}>{errors.phone}</Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={[styles.inputWrapper, touched.password && errors.password && styles.inputError]}>
                    <TextInput
                      value={formData.password}
                      onChangeText={(value) => handleFieldChange('password', value)}
                      placeholder="Enter your password"
                      placeholderTextColor="#9CA3AF"
                      style={[styles.textInput, { paddingRight: 50 }]}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <MaterialCommunityIcons
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#64748B"
                      />
                    </TouchableOpacity>
                  </View>
                  {touched.password && errors.password && (
                    <Text style={styles.fieldError}>{errors.password}</Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <View style={[styles.inputWrapper, touched.confirmPassword && errors.confirmPassword && styles.inputError]}>
                    <TextInput
                      value={formData.confirmPassword}
                      onChangeText={(value) => handleFieldChange('confirmPassword', value)}
                      placeholder="Confirm your password"
                      placeholderTextColor="#9CA3AF"
                      style={[styles.textInput, { paddingRight: 50 }]}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeIcon}
                    >
                      <MaterialCommunityIcons
                        name={showConfirmPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#64748B"
                      />
                    </TouchableOpacity>
                  </View>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <Text style={styles.fieldError}>{errors.confirmPassword}</Text>
                  )}
                </View>

                <TouchableOpacity
                  onPress={handleRegister}
                  disabled={loading}
                  style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={loading ? ['#9CA3AF', '#6B7280'] : ['#667eea', '#764ba2']}
                    style={styles.registerButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {loading ? (
                      <View style={styles.loadingContainer}>
                        <MaterialCommunityIcons
                          name="loading"
                          size={20}
                          color="#FFFFFF"
                          style={styles.loadingIcon}
                        />
                        <Text style={styles.registerButtonText}>Creating Account...</Text>
                      </View>
                    ) : (
                      <Text style={styles.registerButtonText}>Create Account</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.divider} />
                </View>

                <TouchableOpacity
                  onPress={navigateToLogin}
                  style={styles.loginButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.loginText}>
                    Already have an account? <Text style={styles.loginLink}>Sign In</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  content: {
    width: '100%',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 20,
    padding: 32,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 20,
        },
        shadowOpacity: 0.3,
        shadowRadius: 30,
      },
      android: {
        elevation: 20,
      },
      web: {
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      },
    }),
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    color: '#667eea',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  formSection: {
    gap: 20,
  },
  inputContainer: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    minHeight: 48,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 4,
  },
  fieldError: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  registerButton: {
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingIcon: {
    marginRight: 4,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  loginButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  loginText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '400',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  loginLink: {
    color: '#667eea',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
});

export default RegisterScreen;