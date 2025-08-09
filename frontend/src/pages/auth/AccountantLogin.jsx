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
  AccountBalanceWallet as WalletIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

import logo from '../../assets/logo.png';

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

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const AccountantLogin = () => {
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
      const user = await login(values, 'staff');
      return user;
    },
    onSuccess: (user) => {
      if (!user) {
        setError('User data missing');
        return;
      }
      if (user.role) {
        localStorage.setItem('userRole', user.role);
      }
      // Redirect to accountant dashboard regardless of role returned
      navigate('/accountant/dashboard');
    },
    onError: (error) => {
      console.error('Login failed:', error);
      setError(error.response?.data?.message || 'Login failed');
    },
  });

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema,
    onSubmit: (values) => loginMutation.mutate(values),
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        backgroundColor: '#f0f8ff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background */}
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
            <Box sx={{ mb: 3, mt: -2, display: 'flex', justifyContent: 'center' }}>
              <img 
                src={logo} 
                alt="EDULIVES Logo" 
                style={{ 
                  height: isMobile ? 200 : 280, 
                  width: 'auto',
                  marginBottom: 12,
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
                color: '#ffffff',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.7)',
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
                color: '#ffffff',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.7)',
              }}
            >
              ACCOUNTANT PORTAL
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem', lg: '1.5rem' },
                fontWeight: 400,
                opacity: 0.9,
                lineHeight: 1.6,
                color: '#ffffff',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.7)',
              }}
            >
              Manage the school's finances and monitor economic health
            </Typography>
          </motion.div>
        </Box>

        {/* Right side form */}
        <Box
          sx={{
            flex: '1 1 auto',
            maxWidth: { xs: '100%', sm: '450px', md: '400px' },
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 3,
            p: { xs: 3, sm: 4 },
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <WalletIcon sx={{ 
                fontSize: { xs: 32, sm: 40 }, 
                color: '#1976d2', 
                mr: 2 
              }} />
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2rem' },
                  fontWeight: 700,
                  color: '#000000',
                }}
              >
                Accountant Login
              </Typography>
            </Box>

            <Typography
              variant="body1"
              sx={{
                color: '#000000',
                mb: 4,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                fontWeight: 500,
              }}
            >
              Access financial management tools
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
                  label="Email"
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
                      background: 'transparent !important',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: 2,
                      '& fieldset': {
                        border: 'none !important',
                      },
                      '&:hover fieldset': {
                        border: 'none !important',
                      },
                      '&.Mui-focused fieldset': {
                        border: 'none !important',
                      },
                      '&.Mui-focused': {
                        background: 'transparent !important',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        border: 'none !important',
                      },
                      '& .MuiOutlinedInput-input': {
                        background: 'transparent !important',
                      },
                      '& .MuiInputBase-input': {
                        background: 'transparent !important',
                        color: '#000000 !important',
                      },
                      '& .MuiInputBase-input:focus': {
                        background: 'transparent !important',
                        color: '#000000 !important',
                      },
                      '& .MuiInputBase-input:not(:focus)': {
                        background: 'transparent !important',
                        color: '#000000 !important',
                      },
                      '& input': {
                        background: 'transparent !important',
                        color: '#000000 !important',
                      },
                      '& input:focus': {
                        background: 'transparent !important',
                        color: '#000000 !important',
                      },
                      '& input:not(:focus)': {
                        background: 'transparent !important',
                        color: '#000000 !important',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#000000',
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: 'rgba(0, 0, 0, 0.7)',
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
                  id="password"
                  autoComplete="current-password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          sx={{
                            color: '#000000',
                          }}
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      background: 'transparent !important',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: 2,
                      '& fieldset': {
                        border: 'none !important',
                      },
                      '&:hover fieldset': {
                        border: 'none !important',
                      },
                      '&.Mui-focused fieldset': {
                        border: 'none !important',
                      },
                      '&.Mui-focused': {
                        background: 'transparent !important',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        border: 'none !important',
                      },
                      '& .MuiOutlinedInput-input': {
                        background: 'transparent !important',
                      },
                      '& .MuiInputBase-input': {
                        background: 'transparent !important',
                        color: '#000000 !important',
                      },
                      '& .MuiInputBase-input:focus': {
                        background: 'transparent !important',
                        color: '#000000 !important',
                      },
                      '& .MuiInputBase-input:not(:focus)': {
                        background: 'transparent !important',
                        color: '#000000 !important',
                      },
                      '& input': {
                        background: 'transparent !important',
                        color: '#000000 !important',
                      },
                      '& input:focus': {
                        background: 'transparent !important',
                        color: '#000000 !important',
                      },
                      '& input:not(:focus)': {
                        background: 'transparent !important',
                        color: '#000000 !important',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#000000',
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: 'rgba(0, 0, 0, 0.7)',
                    },
                  }}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
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
                    background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)',
                    },
                    '&:disabled': {
                      background: 'rgba(0, 0, 0, 0.1)',
                    },
                    mb: 3,
                  }} 
                >
                  {loginMutation.isLoading ? <CircularProgress size={24} /> : 'SIGN IN TO ACCOUNTANT PORTAL'}
                </Button>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Box sx={{ textAlign: 'center' }}>
                <Button 
                  variant="text" 
                  onClick={() => navigate('/')} 
                  sx={{ 
                      color: '#000000',
                      textTransform: 'none',
                      fontSize: '0.9rem',
                    '&:hover': {
                        color: '#1976d2',
                        textDecoration: 'underline',
                    },
                  }}
                >
                  ← Back to Portal Selection
                </Button>
              </Box>
              </motion.div>
            </Box>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
};

export default AccountantLogin; 