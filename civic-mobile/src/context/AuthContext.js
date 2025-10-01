import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
    setupAxiosInterceptor();
  }, []);

  const setupAxiosInterceptor = () => {
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          console.log('401 Unauthorized - Token expired or invalid');
          await handleTokenExpired();
        }
        return Promise.reject(error);
      }
    );
  };

  const handleTokenExpired = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
      setToken(null);
      delete axios.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUser = await AsyncStorage.getItem('userData');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (emailOrPhone, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        emailOrPhone,
        password
      });

      const { user, token } = response.data.data;

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));

      setUser(user);
      setToken(token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);

      const { user, token } = response.data.data;

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));

      setUser(user);
      setToken(token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = async () => {
    try {
      console.log('AuthContext: Starting logout process...');
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      console.log('AuthContext: Cleared AsyncStorage');
      setUser(null);
      setToken(null);
      console.log('AuthContext: Cleared user and token state');
      delete axios.defaults.headers.common['Authorization'];
      console.log('AuthContext: Logout completed, user should be redirected to login');
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  const updateProfile = async (updates) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/auth/updateprofile`, updates);
      const updatedUser = response.data.data;
      
      setUser(updatedUser);
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      
      return { success: true, user: updatedUser };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Update failed'
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};