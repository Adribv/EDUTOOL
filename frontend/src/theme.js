import { createTheme } from '@mui/material/styles';

// Enhanced vibrant education-themed color palette
const colors = {
  primary: {
    main: '#3b82f6', // Modern blue
    light: '#60a5fa',
    dark: '#2563eb',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#f59e0b', // Warm amber
    light: '#fbbf24',
    dark: '#d97706',
    contrastText: '#ffffff',
  },
  success: {
    main: '#10b981', // Emerald green
    light: '#34d399',
    dark: '#059669',
  },
  warning: {
    main: '#f59e0b', // Amber
    light: '#fbbf24',
    dark: '#d97706',
  },
  error: {
    main: '#ef4444', // Red
    light: '#f87171',
    dark: '#dc2626',
  },
  info: {
    main: '#06b6d4', // Cyan
    light: '#22d3ee',
    dark: '#0891b2',
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
    default: '#f8fafc',
    paper: '#ffffff',
    glass: 'rgba(255, 255, 255, 0.95)',
    glassDark: 'rgba(15, 23, 42, 0.95)',
    gradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
    gradientDark: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    glassmorphism: 'rgba(255, 255, 255, 0.25)',
    glassmorphismDark: 'rgba(15, 23, 42, 0.25)',
  },
  text: {
    primary: '#1e293b',
    secondary: '#475569',
    disabled: '#94a3b8',
  },
  // New accent colors for different user types
  student: {
    main: '#3b82f6',
    light: '#60a5fa',
    dark: '#2563eb',
  },
  parent: {
    main: '#10b981',
    light: '#34d399',
    dark: '#059669',
  },
  staff: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
  },
  accountant: {
    main: '#8b5cf6',
    light: '#a78bfa',
    dark: '#7c3aed',
  },
};

// Enhanced typography with modern font stack
const typography = {
  fontFamily: '"Inter", "SF Pro Display", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: '3rem',
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: '-0.025em',
    color: '#1e293b',
  },
  h2: {
    fontSize: '2.25rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    color: '#1e293b',
  },
  h3: {
    fontSize: '1.875rem',
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: '-0.015em',
    color: '#1e293b',
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
    color: '#1e293b',
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.4,
    color: '#1e293b',
  },
  h6: {
    fontSize: '1.125rem',
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

// Enhanced shadows with glassmorphism effects
const shadows = [
  'none',
  '0px 1px 2px rgba(59, 130, 246, 0.1)',
  '0px 1px 3px rgba(59, 130, 246, 0.15), 0px 1px 2px rgba(59, 130, 246, 0.1)',
  '0px 4px 6px rgba(59, 130, 246, 0.15), 0px 2px 4px rgba(59, 130, 246, 0.1)',
  '0px 10px 15px rgba(59, 130, 246, 0.15), 0px 4px 6px rgba(59, 130, 246, 0.1)',
  '0px 20px 25px rgba(59, 130, 246, 0.15), 0px 10px 10px rgba(59, 130, 246, 0.1)',
  '0px 25px 50px rgba(59, 130, 246, 0.2)',
  '0px 0px 0px 1px rgba(59, 130, 246, 0.1)',
  '0px 0px 0px 1px rgba(59, 130, 246, 0.1), 0px 1px 2px rgba(59, 130, 246, 0.1)',
  '0px 0px 0px 1px rgba(59, 130, 246, 0.1), 0px 1px 3px rgba(59, 130, 246, 0.15), 0px 1px 2px rgba(59, 130, 246, 0.1)',
  '0px 0px 0px 1px rgba(59, 130, 246, 0.1), 0px 4px 6px rgba(59, 130, 246, 0.15), 0px 2px 4px rgba(59, 130, 246, 0.1)',
  '0px 0px 0px 1px rgba(59, 130, 246, 0.1), 0px 10px 15px rgba(59, 130, 246, 0.15), 0px 4px 6px rgba(59, 130, 246, 0.1)',
  '0px 0px 0px 1px rgba(59, 130, 246, 0.1), 0px 20px 25px rgba(59, 130, 246, 0.15), 0px 10px 10px rgba(59, 130, 246, 0.1)',
  '0px 0px 0px 1px rgba(59, 130, 246, 0.1), 0px 25px 50px rgba(59, 130, 246, 0.2)',
  '0px 0px 0px 1px rgba(59, 130, 246, 0.1), 0px 25px 50px rgba(59, 130, 246, 0.2)',
  '0px 0px 0px 1px rgba(59, 130, 246, 0.1), 0px 25px 50px rgba(59, 130, 246, 0.2)',
  '0px 0px 0px 1px rgba(59, 130, 246, 0.1), 0px 25px 50px rgba(59, 130, 246, 0.2)',
  '0px 0px 0px 1px rgba(59, 130, 246, 0.1), 0px 25px 50px rgba(59, 130, 246, 0.2)',
  '0px 0px 0px 1px rgba(59, 130, 246, 0.1), 0px 25px 50px rgba(59, 130, 246, 0.2)',
  '0px 0px 0px 1px rgba(59, 130, 246, 0.1), 0px 25px 50px rgba(59, 130, 246, 0.2)',
  '0px 0px 0px 1px rgba(59, 130, 246, 0.1), 0px 25px 50px rgba(59, 130, 246, 0.2)',
  '0px 0px 0px 1px rgba(59, 130, 246, 0.1), 0px 25px 50px rgba(59, 130, 246, 0.2)',
  '0px 0px 0px 1px rgba(59, 130, 246, 0.1), 0px 25px 50px rgba(59, 130, 246, 0.2)',
];

// Enhanced shape with modern border radius
const shape = {
  borderRadius: 16,
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
          borderRadius: 12,
          padding: '12px 28px',
          fontSize: '0.875rem',
          fontWeight: 600,
          textTransform: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
            transition: 'left 0.5s',
          },
          '&:hover::before': {
            left: '100%',
          },
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 20px 25px rgba(59, 130, 246, 0.25)',
          },
          '&:active': {
            transform: 'translateY(0px)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
          },
        },
        outlined: {
          borderWidth: '2px',
          borderColor: '#3b82f6',
          color: '#3b82f6',
          '&:hover': {
            borderWidth: '2px',
            borderColor: '#2563eb',
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            transform: 'translateY(-2px)',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 4px 6px rgba(59, 130, 246, 0.1), 0 2px 4px rgba(59, 130, 246, 0.06)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(59, 130, 246, 0.1)',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: '0 25px 50px rgba(59, 130, 246, 0.2), 0 10px 20px rgba(59, 130, 246, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(59, 130, 246, 0.1)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            borderColor: 'rgba(59, 130, 246, 0.2)',
            '&:hover': {
              transform: 'translateY(-2px)',
              borderColor: '#3b82f6',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
            },
            '&.Mui-focused': {
              transform: 'translateY(-2px)',
              borderColor: '#3b82f6',
              boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.2)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          border: '1px solid rgba(59, 130, 246, 0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)',
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
          '&:hover': {
            transform: 'translateY(-4px) scale(1.1)',
            boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          height: 10,
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
        },
        bar: {
          borderRadius: 6,
          background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
            stroke: '#3b82f6',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          '& .MuiTabs-indicator': {
            height: 4,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #3b82f6 0%, #f59e0b 100%)',
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
          minHeight: 56,
          color: '#475569',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&.Mui-selected': {
            color: '#3b82f6',
            fontWeight: 700,
            transform: 'translateY(-2px)',
          },
          '&:hover': {
            color: '#3b82f6',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: '0 25px 50px rgba(59, 130, 246, 0.3)',
          background: 'rgba(255, 255, 255, 0.98)',
          border: '1px solid rgba(59, 130, 246, 0.1)',
          backdropFilter: 'blur(20px)',
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiSnackbarContent-root': {
            borderRadius: 16,
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            backdropFilter: 'blur(10px)',
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.1)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
          },
        },
      },
    },
  },
});

export default theme; 