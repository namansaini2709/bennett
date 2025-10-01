import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

const ThemeContext = createContext();

export const lightTheme = {
  isDark: false,
  colors: {
    primary: {
      main: '#667eea',
      light: '#764ba2',
      dark: '#5a6fd8',
      contrast: '#ffffff',
    },
    secondary: {
      main: '#764ba2',
      light: '#9c7bb8',
      dark: '#5d3b7a',
      contrast: '#ffffff',
    },
    background: {
      primary: '#f8fafc',
      secondary: '#ffffff',
      card: 'rgba(255, 255, 255, 0.98)',
      overlay: 'rgba(0, 0, 0, 0.1)',
    },
    surface: {
      primary: '#ffffff',
      secondary: '#f1f5f9',
      elevated: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      tertiary: '#94a3b8',
      contrast: '#ffffff',
      accent: '#667eea',
    },
    border: {
      primary: '#e2e8f0',
      secondary: '#cbd5e1',
      focus: '#667eea',
    },
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    gradient: {
      primary: ['#667eea', '#764ba2'],
      secondary: ['#f093fb', '#f5576c'],
      success: ['#4facfe', '#00f2fe'],
      card: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
    },
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 1000,
  },
  animation: {
    scale: {
      press: 0.95,
      hover: 1.02,
    },
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
  },
};

export const darkTheme = {
  ...lightTheme,
  isDark: true,
  colors: {
    ...lightTheme.colors,
    background: {
      primary: '#0f172a',
      secondary: '#1e293b',
      card: 'rgba(30, 41, 59, 0.98)',
      overlay: 'rgba(0, 0, 0, 0.4)',
    },
    surface: {
      primary: '#1e293b',
      secondary: '#334155',
      elevated: '#475569',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      tertiary: '#94a3b8',
      contrast: '#0f172a',
      accent: '#667eea',
    },
    border: {
      primary: '#334155',
      secondary: '#475569',
      focus: '#667eea',
    },
    gradient: {
      primary: ['#667eea', '#764ba2'],
      secondary: ['#f093fb', '#f5576c'],
      success: ['#4facfe', '#00f2fe'],
      card: ['rgba(30, 41, 59, 0.3)', 'rgba(30, 41, 59, 0.1)'],
    },
  },
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme_preference');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('theme_preference', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  const value = {
    theme,
    isDarkMode,
    toggleTheme,
    isLoading,
  };

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;