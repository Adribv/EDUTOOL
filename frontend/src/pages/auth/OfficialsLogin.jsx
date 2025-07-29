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
  Chip,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Lock as LockIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import logo from '../../assets/logo.png';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const OfficialsLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (e) => e.preventDefault();

  const loginMutation = useMutation({
    mutationFn: async (values) => {
      const { role, ...loginValues } = values;
      const user = await login(loginValues, 'staff');
      return user;
    },
    onSuccess: (user) => {
      if (!user) {
        setError('Login successful but user data is missing');
        return;
      }
      if (user.role) {
        localStorage.setItem('userRole', user.role);
      }
      const userRole = user.role || user.designation || '';
      console.log('Auto-detected role:', userRole);
      
      switch (userRole) {
        case 'Principal':
          navigate('/principal/dashboard');
          break;
        case 'Vice Principal':
          navigate('/viceprincipal/dashboard');
          break;
        case 'HOD':
          navigate('/hod/dashboard');
          break;
        case 'Counsellor':
        case 'Counselor':
          navigate('/counselor/dashboard');
          break;
        default:
          toast.warn('Unknown role, navigating to home');
          navigate('/');
      }
    },
    onError: (error) => {
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
        backgroundColor: '#f8fafc',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background image for all screen sizes */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1470&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
        }}
      />
      {/* Left side - Branding */}
      <Box
        sx={{
          flex: { xs: 'none', md: '1' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          position: 'relative',
          zIndex: 1,
          p: { xs: 4, md: 6 },
          textAlign: 'center',
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
                height: isMobile ? 80 : 120, 
                width: 'auto',
                marginBottom: 16
              }} 
            />
          </Box>
          <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
            <SecurityIcon sx={{ fontSize: 40, color: 'white', mr: 1 }} />
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                color: 'white',
                mb: 0,
                letterSpacing: '-0.01em',
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              }}
            >
              Officials Login
            </Typography>
            <Chip label="Secured" color="success" sx={{ ml: 2, fontWeight: 600 }} />
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem', lg: '1.5rem' },
              fontWeight: 400,
              opacity: 0.9,
              lineHeight: 1.6,
              color: 'white',
            }}
          >
            Secure access for Principal, Vice Principal, HOD, and Counselor. Your role will be automatically detected.
          </Typography>
        </motion.div>
      </Box>
      {/* Right side - Login Form */}
      <Box
        sx={{
          flex: { xs: '1', md: '1' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
          p: { xs: 2, sm: 4 },
        }}
      >
        <Container maxWidth="sm">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Paper
              elevation={24}
              sx={{
                p: { xs: 3, sm: 4, md: 5 },
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <LockIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    mb: 1,
                  }}
                >
                  Secure Officials Login
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '1rem',
                  }}
                >
                  Please enter your credentials to access your dashboard
                </Typography>
              </Box>
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
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
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
                  InputProps={{
                    startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />,
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
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loginMutation.isLoading}
                >
                  {loginMutation.isLoading ? <CircularProgress size={24} /> : 'Sign In to Officials Portal'}
                </Button>
              </Box>
            </Paper>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default OfficialsLogin; 