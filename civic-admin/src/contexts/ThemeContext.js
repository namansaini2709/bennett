import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { createTheme } from '@mui/material/styles';

const ThemeContext = createContext();

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeProvider');
  }
  return context;
};

export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'light';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#6366f1',
            light: '#818cf8',
            dark: '#4f46e5',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#ec4899',
            light: '#f472b6',
            dark: '#db2777',
            contrastText: '#ffffff',
          },
          success: {
            main: '#10b981',
            light: '#34d399',
            dark: '#059669',
          },
          warning: {
            main: '#f59e0b',
            light: '#fbbf24',
            dark: '#d97706',
          },
          error: {
            main: '#ef4444',
            light: '#f87171',
            dark: '#dc2626',
          },
          info: {
            main: '#3b82f6',
            light: '#60a5fa',
            dark: '#2563eb',
          },
          background: {
            default: mode === 'light' ? '#f8fafc' : '#0f172a',
            paper: mode === 'light' ? '#ffffff' : '#1e293b',
          },
          text: {
            primary: mode === 'light' ? '#1e293b' : '#f1f5f9',
            secondary: mode === 'light' ? '#64748b' : '#94a3b8',
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontWeight: 700,
            fontSize: '3rem',
            lineHeight: 1.2,
          },
          h2: {
            fontWeight: 700,
            fontSize: '2.5rem',
            lineHeight: 1.3,
          },
          h3: {
            fontWeight: 600,
            fontSize: '2rem',
            lineHeight: 1.4,
          },
          h4: {
            fontWeight: 600,
            fontSize: '1.75rem',
            lineHeight: 1.4,
          },
          h5: {
            fontWeight: 600,
            fontSize: '1.5rem',
            lineHeight: 1.5,
          },
          h6: {
            fontWeight: 600,
            fontSize: '1.25rem',
            lineHeight: 1.5,
          },
          button: {
            textTransform: 'none',
            fontWeight: 500,
          },
        },
        shape: {
          borderRadius: 12,
        },
        shadows: [
          'none',
          '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          ...Array(18).fill('0 25px 50px -12px rgba(0, 0, 0, 0.25)'),
        ],
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                padding: '8px 16px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                },
              },
              contained: {
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                boxShadow: mode === 'light'
                  ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                  : '0 1px 3px 0 rgba(0, 0, 0, 0.5)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  boxShadow: mode === 'light'
                    ? '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    : '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                  transform: 'translateY(-4px)',
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                backgroundImage: 'none',
              },
              elevation1: {
                boxShadow: mode === 'light'
                  ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                  : '0 1px 3px 0 rgba(0, 0, 0, 0.5)',
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                fontWeight: 500,
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              head: {
                fontWeight: 600,
                backgroundColor: mode === 'light' ? '#f8fafc' : '#0f172a',
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};