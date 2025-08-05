import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Create the theme context
const ThemeContext = createContext();

// Theme configurations
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
      light: '#3b82f6',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7c3aed',
      light: '#8b5cf6',
      dark: '#6d28d9',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.05)',
    '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
    '0px 4px 6px rgba(0, 0, 0, 0.07), 0px 2px 4px rgba(0, 0, 0, 0.06)',
    '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)',
    '0px 20px 25px rgba(0, 0, 0, 0.1), 0px 10px 10px rgba(0, 0, 0, 0.04)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
  ],
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8b5cf6',
      light: '#a78bfa',
      dark: '#7c3aed',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#cbd5e1',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
    divider: '#334155',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.3)',
    '0px 1px 3px rgba(0, 0, 0, 0.4), 0px 1px 2px rgba(0, 0, 0, 0.3)',
    '0px 4px 6px rgba(0, 0, 0, 0.4), 0px 2px 4px rgba(0, 0, 0, 0.3)',
    '0px 10px 15px rgba(0, 0, 0, 0.4), 0px 4px 6px rgba(0, 0, 0, 0.3)',
    '0px 20px 25px rgba(0, 0, 0, 0.4), 0px 10px 10px rgba(0, 0, 0, 0.3)',
    '0px 25px 50px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px rgba(0, 0, 0, 0.5)',
    '0px 25px 50px rgba(0, 0, 0, 0.5)',
  ],
});

// Default theme (system preference)
const getDefaultTheme = () => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme-mode');
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      return savedTheme;
    }
    return 'light';
  });

  const [systemTheme, setSystemTheme] = useState(getDefaultTheme());

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Get the actual theme to use
  const getCurrentTheme = () => {
    return themeMode === 'dark' ? darkTheme : lightTheme;
  };

  // Update document attributes for CSS custom properties
  useEffect(() => {
    const currentTheme = getCurrentTheme();
    const isDark = currentTheme.palette.mode === 'dark';
    
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  }, [themeMode, systemTheme]);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('theme-mode', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => {
      if (prev === 'light') return 'dark';
      return 'light';
    });
  };

  const setTheme = (mode) => {
    setThemeMode(mode);
  };

  const value = {
    themeMode,
    systemTheme,
    currentTheme: getCurrentTheme(),
    toggleTheme,
    setTheme,
    isDark: getCurrentTheme().palette.mode === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={getCurrentTheme()}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext; 