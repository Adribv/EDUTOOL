import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Alert,
  Grid,
  useTheme,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import {
  Lock as LockIcon,
  Email as EmailIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password should be of minimum 6 characters length')
    .required('Password is required'),
});

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5, staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (e) => e.preventDefault();
  const { login } = useAuth();

  const loginMutation = useMutation({
    mutationFn: async (values) => {
      const user = await login(values);
      return user;
    },
    onSuccess: (user) => {
      // Navigate based on role
      switch (user.role) {
        case 'AdminStaff':
          navigate('/admin');
          break;
        case 'Teacher':
          navigate('/teacher');
          break;
        case 'HOD':
          navigate('/hod');
          break;
        case 'Principal':
          navigate('/principal');
          break;
        case 'Counsellor':
          navigate('/counselor');
          break;
        default:
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
              EDULIVES
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
              EXPLORE KNOWLEDGE
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
              Where Your Educational Journey Becomes Reality
            </Typography>
          </motion.div>
        </Box>

        {/* Right side form */}
        <Box
          sx={{
            flex: '1 1 auto',
            maxWidth: { xs: '100%', sm: '450px', md: '400px' },
            width: '100%',
            backgroundColor: 'white',
            borderRadius: 3,
            p: { xs: 3, sm: 4 },
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.75rem', sm: '2rem' },
                fontWeight: 700,
                color: '#1a237e',
                mb: 1,
              }}
            >
              Sign In
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                mb: 4,
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              Welcome back! Please enter your details
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={formik.handleSubmit}>
              <motion.div variants={itemVariants}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                      backgroundColor: '#f8fafc',
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                      backgroundColor: '#f8fafc',
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
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
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loginMutation.isPending}
                  sx={{
                    py: 1.8,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 1.5,
                    backgroundColor: '#1a237e',
                    '&:hover': {
                      backgroundColor: '#0d47a1',
                    },
                    mb: 2,
                  }}
                >
                  {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
                </Button>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/student-login')}
                  sx={{
                    py: 1.8,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 1.5,
                    borderColor: '#1a237e',
                    color: '#1a237e',
                    '&:hover': {
                      borderColor: '#0d47a1',
                      backgroundColor: 'rgba(13, 71, 161, 0.04)',
                    },
                    mb: 2,
                  }}
                >
                  Student Login
                </Button>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/parent-login')}
                  sx={{
                    py: 1.8,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 1.5,
                    borderColor: '#2e7d32',
                    color: '#2e7d32',
                    '&:hover': {
                      borderColor: '#1b5e20',
                      backgroundColor: 'rgba(27, 94, 32, 0.04)',
                    },
                    mb: 3,
                  }}
                >
                  Parent Login
                </Button>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    }}
                  >
                    Don't have an account?{' '}
                    <Link
                      component={RouterLink}
                      to="/register"
                      sx={{
                        color: '#1a237e',
                        fontWeight: 600,
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Create an Account
                    </Link>
                  </Typography>
                </Box>
              </motion.div>
            </Box>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
}

export default Login; 