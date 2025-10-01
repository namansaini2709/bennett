// Color System for CIVIC SETU
// Based on Material Design 3 color system with custom branding

export const colors = {
  // Primary Brand Colors
  primary: {
    main: '#2196F3',
    light: '#64B5F6',
    dark: '#1976D2',
    contrast: '#FFFFFF',
  },

  // Secondary Brand Colors
  secondary: {
    main: '#4CAF50',
    light: '#81C784',
    dark: '#388E3C',
    contrast: '#FFFFFF',
  },

  // Accent Colors
  accent: {
    main: '#FFC107',
    light: '#FFD54F',
    dark: '#FFA000',
    contrast: '#000000',
  },

  // Semantic Colors
  success: {
    main: '#4CAF50',
    light: '#81C784',
    dark: '#388E3C',
    contrast: '#FFFFFF',
  },

  error: {
    main: '#F44336',
    light: '#EF5350',
    dark: '#C62828',
    contrast: '#FFFFFF',
  },

  warning: {
    main: '#FF9800',
    light: '#FFB74D',
    dark: '#F57C00',
    contrast: '#000000',
  },

  info: {
    main: '#03A9F4',
    light: '#4FC3F7',
    dark: '#0288D1',
    contrast: '#FFFFFF',
  },

  // Status Colors for Reports
  status: {
    submitted: '#2196F3',
    acknowledged: '#03A9F4',
    assigned: '#00BCD4',
    in_progress: '#FFC107',
    resolved: '#4CAF50',
    rejected: '#F44336',
    closed: '#9E9E9E',
  },

  // Category Colors
  category: {
    road_issue: '#795548',
    water_supply: '#03A9F4',
    electricity: '#FFC107',
    garbage: '#8BC34A',
    drainage: '#607D8B',
    street_light: '#FF9800',
    traffic: '#F44336',
    pollution: '#9E9E9E',
    encroachment: '#E91E63',
    other: '#9C27B0',
  },

  // Neutral Colors
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },

  // Text Colors
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD',
    hint: '#9E9E9E',
    inverse: '#FFFFFF',
  },

  // Background Colors
  background: {
    default: '#FAFAFA',
    paper: '#FFFFFF',
    elevated: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Border Colors
  border: {
    default: '#E0E0E0',
    light: '#F5F5F5',
    dark: '#BDBDBD',
    focus: '#2196F3',
    error: '#F44336',
  },

  // Shadow Colors
  shadow: {
    default: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.15)',
    strong: 'rgba(0, 0, 0, 0.25)',
  },
};

// Dark Theme Colors
export const darkColors = {
  ...colors,

  primary: {
    main: '#64B5F6',
    light: '#90CAF9',
    dark: '#42A5F5',
    contrast: '#000000',
  },

  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    disabled: '#6D6D6D',
    hint: '#8A8A8A',
    inverse: '#212121',
  },

  background: {
    default: '#121212',
    paper: '#1E1E1E',
    elevated: '#242424',
    overlay: 'rgba(255, 255, 255, 0.1)',
  },

  border: {
    default: '#2C2C2C',
    light: '#1A1A1A',
    dark: '#3D3D3D',
    focus: '#64B5F6',
    error: '#EF5350',
  },
};

// Helper function to get color with opacity
export const withOpacity = (color, opacity) => {
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Gradient definitions
export const gradients = {
  primary: ['#2196F3', '#1976D2'],
  secondary: ['#4CAF50', '#388E3C'],
  accent: ['#FFC107', '#FFA000'],
  success: ['#4CAF50', '#2E7D32'],
  error: ['#F44336', '#C62828'],
  info: ['#03A9F4', '#0288D1'],
  sunset: ['#FF6B6B', '#FFE66D'],
  ocean: ['#667EEA', '#764BA2'],
  forest: ['#38A169', '#2F855A'],
  fire: ['#ED8936', '#C05621'],
};

export default colors;