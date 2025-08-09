import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useTheme as useAppTheme } from '../../context/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle';
import { toast } from 'react-toastify';
import logo from '../../assets/logo.png';
import { roleConfig } from '../admin/roleConfig';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const StaffLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();
  const { isDark } = useAppTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (e) => e.preventDefault();

  const loginMutation = useMutation({
    mutationFn: async (values) => {
      // Remove role from values since it will be detected from user data
      const { role, ...loginValues } = values;
      const user = await login(loginValues, 'staff');
      return user;
    },
    onSuccess: (user) => {
      // Navigate based on automatically detected role
      console.log('Login successful, user data:', user);
      if (!user) {
        console.error('User data is undefined after login');
        setError('Login successful but user data is missing');
        return;
      }
      
      // Store the role in localStorage for consistency
      if (user.role) {
        localStorage.setItem('userRole', user.role);
      }
      
      // Auto-detect role from user data (role or designation field)
      const userRole = user.role || user.designation || '';
      console.log('Auto-detected role:', userRole);
      
      // Route to dashboard based on roleConfig
      if (roleConfig[userRole]) {
        navigate('/admin');
        return;
      }
      
      // Fallback for other roles
      // Check if role exists in roleConfig
      if (roleConfig[userRole]) {
        navigate('/admin/dashboard');
      } else {
        // For other roles, use base path from Layout.jsx
        switch ((userRole || '').toLowerCase()) {
          case 'teacher':
            navigate('/teacher/dashboard');
            break;
          case 'hod':
            navigate('/hod/dashboard');
            break;
          case 'viceprincipal':
            navigate('/viceprincipal/dashboard');
            break;
          case 'principal':
            navigate('/principal/dashboard');
            break;
          case 'counsellor':
          case 'counselor':
            navigate('/counselor/dashboard');
            break;
          case 'itadmin':
            navigate('/admin');
            break;
          case 'accountant':
            navigate('/accountant/dashboard');
            break;
          default:
            console.warn('Unknown role:', userRole, 'Navigating to home');
            navigate('/');
        }
      }
    },
    onError: (error) => {
      console.error('Login failed:', error);
      setError(error.response?.data?.message || 'Login failed');
    },
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      loginMutation.mutate(values);
    },
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        minWidth: '100vw',
        padding: '0',
        gap: '50',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        backgroundColor: isDark ? '#1e293b' : '#f0f8ff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Back to Home Button */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 10,
        }}
      >
        <IconButton
          onClick={() => navigate('/')}
          sx={{
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            color: isDark ? '#60a5fa' : '#1976d2',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(30, 41, 59, 1)' : 'rgba(255, 255, 255, 1)',
            },
            transition: 'all 0.3s ease'
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>

      {/* Theme Toggle Button */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 10,
        }}
      >
        <IconButton
          sx={{
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            color: isDark ? '#60a5fa' : '#1976d2',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(30, 41, 59, 1)' : 'rgba(255, 255, 255, 1)',
            },
            transition: 'all 0.3s ease'
          }}
        >
          <ThemeToggle />
        </IconButton>
      </Box>
      {/* Background image for all screen sizes */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: isDark 
            ? 'linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url("https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1470&auto=format&fit=crop")'
            : 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1470&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
          transition: 'background-image 0.3s ease',
        }}
      />

      {/* Content Container */}
      <Container
        maxWidth="lg"
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          zIndex: 1,
          px: { xs: 2, sm: 4, md: 6 },
          py: { xs: 4, sm: 6, md: 8 },
        }}
      >
        {/* Left side branding */}
        <Box
          sx={{
            flex: '1 1 auto',
            maxWidth: { md: '50%' },
            textAlign: { xs: 'center', md: 'left' },
            mb: { xs: 6, md: 0 },
            pr: { md: 6 },
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Box sx={{ mb: 4 }}>
              <img 
                src={logo} 
                alt="EDULIVES Logo" 
                style={{ 
                  height: isMobile ? 200 : 300, 
                  width: 'auto',
                  marginBottom: 16,
                  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))'
                }} 
              />
            </Box>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem', lg: '4rem' },
                fontWeight: 700,
                mb: 3,
                letterSpacing: '-0.02em',
                color: isDark ? '#ffffff' : '#ffffff',
                textShadow: isDark ? '0 2px 4px rgba(0, 0, 0, 0.5)' : '0 2px 4px rgba(0, 0, 0, 0.7)',
              }}
            >
              EDULIVES
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem', lg: '2.5rem' },
                fontWeight: 600,
                mb: 4,
                letterSpacing: '-0.01em',
                color: isDark ? '#ffffff' : '#ffffff',
                textShadow: isDark ? '0 2px 4px rgba(0, 0, 0, 0.5)' : '0 2px 4px rgba(0, 0, 0, 0.7)',
              }}
            >
              MANAGEMENT PORTAL
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem', lg: '1.5rem' },
                fontWeight: 400,
                opacity: 0.9,
                lineHeight: 1.6,
                color: isDark ? '#ffffff' : '#ffffff',
                textShadow: isDark ? '0 2px 4px rgba(0, 0, 0, 0.5)' : '0 2px 4px rgba(0, 0, 0, 0.7)',
              }}
            >
              Administrative Access for School Management
            </Typography>
          </motion.div>
        </Box>

        {/* Right side form */}
        <Box
          sx={{
            flex: '1 1 auto',
            maxWidth: { xs: '100%', sm: '450px', md: '400px' },
            width: '100%',
            backgroundColor: isDark ? 'rgba(51, 65, 85, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 3,
            p: { xs: 3, sm: 4 },
            boxShadow: isDark 
              ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <BusinessIcon sx={{ 
                fontSize: { xs: 32, sm: 40 }, 
                color: isDark ? '#ffffff' : '#1976d2', 
                mr: 2 
              }} />
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2rem' },
                  fontWeight: 700,
                  color: isDark ? '#ffffff' : '#000000',
                }}
              >
                Staff Login
              </Typography>
            </Box>

            <Typography
              variant="body1"
              sx={{
                color: isDark ? '#ffffff' : '#000000',
                mb: 4,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                fontWeight: 500,
              }}
            >
              Login for all teaching and non-teaching staff. Your role and department will be automatically detected.
            </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={formik.handleSubmit}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email Address"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  margin="normal"
                  autoFocus
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                      backgroundColor: isDark ? '#94a3b8' : '#e2e8f0',
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: isDark ? '#e2e8f0' : 'text.primary',
                    },
                    '& .MuiOutlinedInput-input': {
                      color: isDark ? '#ffffff' : 'text.primary',
                    },
                  }}
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: isDark ? '#e2e8f0' : 'text.secondary' }} />,
                  }}
                />
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  margin="normal"
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                      backgroundColor: isDark ? '#94a3b8' : '#e2e8f0',
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: isDark ? '#e2e8f0' : 'text.primary',
                    },
                    '& .MuiOutlinedInput-input': {
                      color: isDark ? '#ffffff' : 'text.primary',
                    },
                  }}
                  InputProps={{
                    startAdornment: <LockIcon sx={{ mr: 1, color: isDark ? '#e2e8f0' : 'text.secondary' }} />,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loginMutation.isLoading}
                  sx={{
                    py: 1.8,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 1.5,
                    backgroundColor: '#1976d2',
                    '&:hover': {
                      backgroundColor: '#1565c0',
                    },
                    mb: 3,
                  }}
                >
                  {loginMutation.isLoading ? <CircularProgress size={24} /> : 'SIGN IN TO STAFF PORTAL'}
                </Button>
              </Box>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button
                  variant="text"
                  onClick={() => navigate('/')}
                  sx={{
                    color: isDark ? '#ffffff' : '#000000',
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    '&:hover': {
                      color: isDark ? '#60a5fa' : '#1976d2',
                    },
                  }}
                >
                  ← Back to Portal Selection
                </Button>
              </Box>
            </motion.div>
          </Box>
        </Container>
      </Box>
    );
  };

  export default StaffLogin; 