import { createTheme } from '@mui/material/styles';

// Vibrant education-themed color palette
const colors = {
  primary: {
    main: '#2563eb', // Rich blue for education
    light: '#3b82f6',
    dark: '#1d4ed8',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#dc2626', // Vibrant red for energy
    light: '#ef4444',
    dark: '#b91c1c',
    contrastText: '#ffffff',
  },
  success: {
    main: '#059669', // Deep green for success
    light: '#10b981',
    dark: '#047857',
  },
  warning: {
    main: '#d97706', // Warm orange for attention
    light: '#f59e0b',
    dark: '#b45309',
  },
  error: {
    main: '#dc2626', // Bright red for errors
    light: '#ef4444',
    dark: '#b91c1c',
  },
  info: {
    main: '#0891b2', // Cyan blue for information
    light: '#06b6d4',
    dark: '#0e7490',
  },
  grey: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  background: {
    default: '#f0f9ff', // Light blue background
    paper: '#ffffff',
    glass: 'rgba(255, 255, 255, 0.9)',
    glassDark: 'rgba(15, 23, 42, 0.9)',
    gradient: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)',
    gradientDark: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
  },
  text: {
    primary: '#1e293b',
    secondary: '#475569',
    disabled: '#94a3b8',
  },
};

// Enhanced typography with education focus
const typography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: '2.5rem',
    fontWeight: 800,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    color: '#1e293b',
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
    color: '#1e293b',
  },
  h3: {
    fontSize: '1.5rem',
    fontWeight: 700,
    lineHeight: 1.4,
    color: '#1e293b',
  },
  h4: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.4,
    color: '#1e293b',
  },
  h5: {
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1.4,
    color: '#1e293b',
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.4,
    color: '#1e293b',
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6,
    color: '#334155',
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.6,
    color: '#475569',
  },
  button: {
    textTransform: 'none',
    fontWeight: 600,
    letterSpacing: '0.025em',
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.4,
    color: '#64748b',
  },
  overline: {
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#64748b',
  },
};

// Enhanced shadows for depth and education feel
const shadows = [
  'none',
  '0px 1px 2px rgba(37, 99, 235, 0.1)',
  '0px 1px 3px rgba(37, 99, 235, 0.15), 0px 1px 2px rgba(37, 99, 235, 0.1)',
  '0px 4px 6px rgba(37, 99, 235, 0.15), 0px 2px 4px rgba(37, 99, 235, 0.1)',
  '0px 10px 15px rgba(37, 99, 235, 0.15), 0px 4px 6px rgba(37, 99, 235, 0.1)',
  '0px 20px 25px rgba(37, 99, 235, 0.15), 0px 10px 10px rgba(37, 99, 235, 0.1)',
  '0px 25px 50px rgba(37, 99, 235, 0.2)',
  '0px 0px 0px 1px rgba(37, 99, 235, 0.1)',
  '0px 0px 0px 1px rgba(37, 99, 235, 0.1), 0px 1px 2px rgba(37, 99, 235, 0.1)',
  '0px 0px 0px 1px rgba(37, 99, 235, 0.1), 0px 1px 3px rgba(37, 99, 235, 0.15), 0px 1px 2px rgba(37, 99, 235, 0.1)',
  '0px 0px 0px 1px rgba(37, 99, 235, 0.1), 0px 4px 6px rgba(37, 99, 235, 0.15), 0px 2px 4px rgba(37, 99, 235, 0.1)',
  '0px 0px 0px 1px rgba(37, 99, 235, 0.1), 0px 10px 15px rgba(37, 99, 235, 0.15), 0px 4px 6px rgba(37, 99, 235, 0.1)',
  '0px 0px 0px 1px rgba(37, 99, 235, 0.1), 0px 20px 25px rgba(37, 99, 235, 0.15), 0px 10px 10px rgba(37, 99, 235, 0.1)',
  '0px 0px 0px 1px rgba(37, 99, 235, 0.1), 0px 25px 50px rgba(37, 99, 235, 0.2)',
  '0px 0px 0px 1px rgba(37, 99, 235, 0.1), 0px 25px 50px rgba(37, 99, 235, 0.2)',
  '0px 0px 0px 1px rgba(37, 99, 235, 0.1), 0px 25px 50px rgba(37, 99, 235, 0.2)',
  '0px 0px 0px 1px rgba(37, 99, 235, 0.1), 0px 25px 50px rgba(37, 99, 235, 0.2)',
  '0px 0px 0px 1px rgba(37, 99, 235, 0.1), 0px 25px 50px rgba(37, 99, 235, 0.2)',
  '0px 0px 0px 1px rgba(37, 99, 235, 0.1), 0px 25px 50px rgba(37, 99, 235, 0.2)',
  '0px 0px 0px 1px rgba(37, 99, 235, 0.1), 0px 25px 50px rgba(37, 99, 235, 0.2)',
  '0px 0px 0px 1px rgba(37, 99, 235, 0.1), 0px 25px 50px rgba(37, 99, 235, 0.2)',
  '0px 0px 0px 1px rgba(37, 99, 235, 0.1), 0px 25px 50px rgba(37, 99, 235, 0.2)',
  '0px 0px 0px 1px rgba(37, 99, 235, 0.1), 0px 25px 50px rgba(37, 99, 235, 0.2)',
  '0px 0px 0px 1px rgba(37, 99, 235, 0.1), 0px 25px 50px rgba(37, 99, 235, 0.2)',
];

// Enhanced shape with modern border radius
const shape = {
  borderRadius: 12,
};

// Enhanced spacing
const spacing = 8;

const theme = createTheme({
  palette: colors,
  typography,
  shadows,
  shape,
  spacing,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '0.875rem',
          fontWeight: 600,
          textTransform: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
          },
        },
        outlined: {
          borderWidth: '2px',
          borderColor: '#2563eb',
          color: '#2563eb',
          '&:hover': {
            borderWidth: '2px',
            borderColor: '#1d4ed8',
            backgroundColor: 'rgba(37, 99, 235, 0.05)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 6px rgba(37, 99, 235, 0.1), 0 2px 4px rgba(37, 99, 235, 0.06)',
          transition: 'all 0.3s ease-in-out',
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(37, 99, 235, 0.1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 25px rgba(37, 99, 235, 0.15), 0 10px 10px rgba(37, 99, 235, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(37, 99, 235, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.2s ease-in-out',
            borderColor: 'rgba(37, 99, 235, 0.2)',
            '&:hover': {
              transform: 'translateY(-1px)',
              borderColor: '#2563eb',
            },
            '&.Mui-focused': {
              transform: 'translateY(-1px)',
              borderColor: '#2563eb',
              boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.2)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          border: '1px solid rgba(37, 99, 235, 0.2)',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 10px 25px rgba(37, 99, 235, 0.2)',
          transition: 'all 0.3s ease-in-out',
          background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
          '&:hover': {
            transform: 'translateY(-2px) scale(1.05)',
            boxShadow: '0 15px 35px rgba(37, 99, 235, 0.3)',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 8,
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
        },
        bar: {
          borderRadius: 4,
          background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
            stroke: '#2563eb',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #2563eb 0%, #dc2626 100%)',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          minHeight: 48,
          color: '#475569',
          '&.Mui-selected': {
            color: '#2563eb',
            fontWeight: 700,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 25px 50px rgba(37, 99, 235, 0.2)',
          background: 'rgba(255, 255, 255, 0.98)',
          border: '1px solid rgba(37, 99, 235, 0.1)',
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiSnackbarContent-root': {
            borderRadius: 12,
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(37, 99, 235, 0.1)',
          },
        },
      },
    },
  },
});

export default theme; 