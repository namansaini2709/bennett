import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const toast = useToast();
  const { login } = useAuth();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      case 'emailOrPhone':
        if (!value.trim()) {
          newErrors.emailOrPhone = 'Email or phone is required';
        } else if (value.includes('@') && !/\S+@\S+\.\S+/.test(value)) {
          newErrors.emailOrPhone = 'Please enter a valid email';
        } else if (!value.includes('@') && !/^[6-9]\d{9}$/.test(value)) {
          newErrors.emailOrPhone = 'Please enter a valid phone number';
        } else {
          delete newErrors.emailOrPhone;
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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field, value) => {
    if (field === 'emailOrPhone') {
      setEmailOrPhone(value);
    } else if (field === 'password') {
      setPassword(value);
    }

    setTouched(prev => ({ ...prev, [field]: true }));

    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleLogin = async () => {
    const emailValid = validateField('emailOrPhone', emailOrPhone);
    const passwordValid = validateField('password', password);

    if (!emailValid || !passwordValid) {
      setTouched({ emailOrPhone: true, password: true });
      toast.error('Please correct the errors and try again');
      return;
    }

    setLoading(true);
    try {
      const result = await login(emailOrPhone.trim(), password);

      if (result.success) {
        toast.success('Welcome back!');
      } else {
        toast.error(result.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
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
                <Text style={styles.brandName}>Civic Setu</Text>
                <Text style={styles.welcomeSubtext}>Sign in to continue</Text>
              </View>

              {Object.keys(errors).length > 0 && (
                <View style={styles.errorContainer}>
                  <MaterialCommunityIcons name="alert-circle" size={16} color="#EF4444" />
                  <Text style={styles.errorText}>
                    {errors.emailOrPhone || errors.password || 'Please check your credentials'}
                  </Text>
                </View>
              )}

              <View style={styles.formSection}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email or Phone</Text>
                  <View style={[styles.inputWrapper, touched.emailOrPhone && errors.emailOrPhone && styles.inputError]}>
                    <TextInput
                      value={emailOrPhone}
                      onChangeText={(value) => handleFieldChange('emailOrPhone', value)}
                      placeholder="Enter your email or phone"
                      placeholderTextColor="#9CA3AF"
                      style={styles.textInput}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  {touched.emailOrPhone && errors.emailOrPhone && (
                    <Text style={styles.fieldError}>{errors.emailOrPhone}</Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={[styles.inputWrapper, touched.password && errors.password && styles.inputError]}>
                    <TextInput
                      value={password}
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

                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={loading}
                  style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={loading ? ['#9CA3AF', '#6B7280'] : ['#667eea', '#764ba2']}
                    style={styles.loginButtonGradient}
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
                        <Text style={styles.loginButtonText}>Signing in...</Text>
                      </View>
                    ) : (
                      <Text style={styles.loginButtonText}>Sign In</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.divider} />
                </View>

                <TouchableOpacity
                  onPress={navigateToRegister}
                  style={styles.createAccountButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.createAccountText}>
                    Don't have an account? <Text style={styles.createAccountLink}>Create one</Text>
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
  loginButton: {
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonGradient: {
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
  loginButtonText: {
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
  createAccountButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  createAccountText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '400',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  createAccountLink: {
    color: '#667eea',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
});

export default LoginScreen;