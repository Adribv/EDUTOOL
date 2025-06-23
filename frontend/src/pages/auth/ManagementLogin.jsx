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
  MenuItem,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Lock as LockIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import logo from '../../assets/logo.jpg';

const managementRoles = [
  { value: 'AdminStaff', label: 'Admin Staff' },
  { value: 'Teacher', label: 'Teacher' },
  { value: 'HOD', label: 'Head of Department' },
  { value: 'Principal', label: 'Principal' },
  { value: 'Counsellor', label: 'Counselor' },
];

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  role: Yup.string().required('Role is required'),
});

const ManagementLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [error, setError] = useState('');

  const loginMutation = useMutation({
    mutationFn: async (values) => {
      const user = await login(values, 'staff');
      return user;
    },
    onSuccess: (user) => {
      // Navigate based on role
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
      
      // Normalize role to lowercase for comparison
      const userRole = (user.role || '').toLowerCase();
      console.log('User role:', userRole);
      
      switch (userRole) {
        case "adminstaff":
        case "admin_staff":
        case "admin staff":
          navigate('/admin/dashboard');
          break;
        case 'teacher':
          navigate('/teacher/dashboard');
          break;
        case 'hod':
        case 'head of department':
          navigate('/hod/dashboard');
          break;
        case 'principal':
          navigate('/principal/dashboard');
          break;
        case 'counsellor':
        case 'counselor':
          navigate('/counselor/dashboard');
          break;
        default:
          console.warn('Unknown role:', userRole, 'Navigating to home');
          navigate('/');
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
      role: '',
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
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1470&auto=format&fit=crop")',
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
              alt="EDURAYS Logo" 
              style={{ 
                height: isMobile ? 80 : 120, 
                width: 'auto',
                marginBottom: 16
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
              color: 'white',
            }}
          >
            EDURAYS
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem', lg: '2.5rem' },
              fontWeight: 600,
              mb: 4,
              letterSpacing: '-0.01em',
              color: 'white',
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
              color: 'white',
            }}
          >
            Administrative Access for School Management
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
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <BusinessIcon sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    mb: 1,
                  }}
                >
                  Management Login
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '1rem',
                  }}
                >
                  Access administrative tools and management systems
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
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  margin="normal"
                  InputProps={{
                    startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                <TextField
                  fullWidth
                  id="role"
                  name="role"
                  select
                  label="Management Role"
                  value={formik.values.role}
                  onChange={formik.handleChange}
                  error={formik.touched.role && Boolean(formik.errors.role)}
                  helperText={formik.touched.role && formik.errors.role}
                  margin="normal"
                  InputProps={{
                    startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                >
                  {managementRoles.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{
                    mt: 4,
                    mb: 2,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                    },
                  }}
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Sign In to Management Portal'
                  )}
                </Button>
              </Box>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button
                  variant="text"
                  onClick={() => navigate('/')}
                  sx={{
                    color: 'text.secondary',
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  ← Back to Portal Selection
                </Button>
              </Box>
            </Paper>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default ManagementLogin; 