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
import axios from 'axios';
import { toast } from 'react-toastify';
import SchoolIcon from '@mui/icons-material/School';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import logo from '../../assets/logo.png';

const validationSchema = yup.object({
  rollNumber: yup
    .string()
    .required('Roll Number is required'),
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

function StudentLogin() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();


  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const loginMutation = useMutation({
    mutationFn: async (values) => {
      const response = await axios.post('https://api.edulives.com/api/students/login', values);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('studentToken', data.token);
      localStorage.setItem('userRole', 'Student');
      toast.success('Login successful!');
      navigate('/student');
    },
    onError: (error) => {
      console.error('Login failed:', error);
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });

  const formik = useFormik({
    initialValues: {
      rollNumber: '',
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
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
                        backgroundColor: '#f0f8ff',
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
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: '#1976d2',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>



      {/* Background video */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 1,
          }
        }}
      >
        <video
          autoPlay
          muted
          loop
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        >
          <source src="/assets/mp4/student.mp4" type="video/mp4" />
        </video>
      </Box>

      {/* Content Container */}
      <Container
        maxWidth="lg"
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          zIndex: 2,
          px: { xs: 2, sm: 4, md: 6 },
          py: { xs: 4, sm: 6, md: 8 },
        }}
      >
        {/* Left side branding */}
        <Box
          sx={{
            flex: '1 1 auto',
            maxWidth: { md: '50%' },
            textAlign: 'center',
            mb: { xs: 6, md: 0 },
            pr: { md: 6 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ width: '100%' }}
          >
            {/* Edulives Logo - Centered and bigger */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ 
                marginBottom: '3rem',
                display: 'flex',
                justifyContent: 'center',
                width: '100%'
              }}
            >
              <img 
                src={logo} 
                alt="EDULIVES Logo" 
                style={{ 
                  height: 200, 
                  width: 'auto',
                  objectFit: 'contain'
                }} 
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          >
            <Typography
              variant="h1"
              sx={{
                  fontSize: { xs: '3rem', sm: '3.5rem', md: '4rem', lg: '4.5rem' },
                  fontWeight: 900,
                  mb: 2,
                  letterSpacing: '-0.03em',
                  color: '#ffffff',
                  textShadow: '0 6px 12px rgba(0, 0, 0, 0.9)',
                  fontFamily: '"Orbitron", "Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
                  background: 'linear-gradient(135deg, #ffffff 0%, #e3f2fd 50%, #bbdefb 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center',
                  position: 'relative'
                }}
              >
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{
                    duration: 2,
                    delay: 0.6,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  style={{
                    display: 'inline-block',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    borderRight: '3px solid #ffffff',
                    animation: 'typing 3s steps(8) infinite, blink-caret 0.8s step-end infinite',
                    '@keyframes typing': {
                      '0%': { width: '0' },
                      '50%': { width: '100%' },
                      '100%': { width: '0' }
                    },
                    '@keyframes blink-caret': {
                      'from, to': { borderColor: 'transparent' },
                      '50%': { borderColor: '#ffffff' }
                    }
              }}
            >
              EDULIVES
                </motion.span>
            </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
            >
            <Typography
              variant="h2"
              sx={{
                  fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem', lg: '2.5rem' },
                  fontWeight: 700,
                  mb: 3,
                  letterSpacing: '0.1em',
                  color: '#ffffff',
                  textShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
                  fontFamily: '"Rajdhani", "Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
                  background: 'linear-gradient(135deg, #ffffff 0%, #e8f5e8 50%, #c8e6c9 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '60px',
                    height: '3px',
                    background: 'linear-gradient(90deg, transparent, #ffffff, transparent)',
                    borderRadius: '2px',
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 0.6 },
                      '50%': { opacity: 1 }
                    }
                  }
              }}
            >
              STUDENT PORTAL
            </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
            >
            <Typography
              variant="h5"
              sx={{
                  fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.4rem', lg: '1.6rem' },
                fontWeight: 400,
                opacity: 0.9,
                lineHeight: 1.6,
                  color: '#ffffff',
                  textShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
                  fontFamily: '"Quicksand", "Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f3e5f5 50%, #e1bee7 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center',
                  letterSpacing: '0.05em',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '40px',
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
                    borderRadius: '1px'
                  }
              }}
            >
              Your Gateway to Educational Excellence
            </Typography>
            </motion.div>
          </motion.div>
        </Box>

        {/* Right side form - Transparent like main dashboard */}
        <Box
          sx={{
            flex: '1 1 auto',
            maxWidth: { xs: '100%', sm: '450px', md: '400px' },
            width: '100%',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(129, 140, 248, 0.05) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 3,
            p: { xs: 3, sm: 4 },
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(0, 0, 0, 0.05)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(129, 140, 248, 0.04) 100%)',
              opacity: 0,
              transition: 'opacity 0.3s ease',
              pointerEvents: 'none'
            },
            '&:hover::before': {
              opacity: 1
            },
          }}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <AutoStoriesIcon sx={{ 
                fontSize: { xs: 32, sm: 40 }, 
                color: '#ffffff', 
                mr: 2 
              }} />
                          <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                  color: '#ffffff',
                mb: 1,
              }}
            >
              Student Login
            </Typography>
            </Box>

            <Typography
              variant="body1"
              sx={{
                color: '#ffffff',
                fontSize: '1rem',
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
                  id="rollNumber"
                  label="Roll Number"
                  name="rollNumber"
                  autoComplete="rollNumber"
                  autoFocus
                  value={formik.values.rollNumber}
                  onChange={formik.handleChange}
                  error={formik.touched.rollNumber && Boolean(formik.errors.rollNumber)}
                  helperText={formik.touched.rollNumber && formik.errors.rollNumber}
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
                        color: '#ffffff !important',
                      },
                      '& .MuiInputBase-input:focus': {
                        background: 'transparent !important',
                        color: '#ffffff !important',
                      },
                      '& .MuiInputBase-input:not(:focus)': {
                        background: 'transparent !important',
                        color: '#ffffff !important',
                      },
                      '& input': {
                        background: 'transparent !important',
                        color: '#ffffff !important',
                      },
                      '& input:focus': {
                        background: 'transparent !important',
                        color: '#ffffff !important',
                      },
                      '& input:not(:focus)': {
                        background: 'transparent !important',
                        color: '#ffffff !important',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#ffffff',
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: 'rgba(255, 255, 255, 0.7)',
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
                            color: '#ffffff',
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
                        color: '#ffffff !important',
                      },
                      '& .MuiInputBase-input:focus': {
                        background: 'transparent !important',
                        color: '#ffffff !important',
                      },
                      '& .MuiInputBase-input:not(:focus)': {
                        background: 'transparent !important',
                        color: '#ffffff !important',
                      },
                      '& input': {
                        background: 'transparent !important',
                        color: '#ffffff !important',
                      },
                      '& input:focus': {
                        background: 'transparent !important',
                        color: '#ffffff !important',
                      },
                      '& input:not(:focus)': {
                        background: 'transparent !important',
                        color: '#ffffff !important',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#ffffff',
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
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
                  {loginMutation.isPending ? 'Signing in...' : 'SIGN IN TO STUDENT PORTAL'}
                </Button>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#ffffff',
                      fontSize: '0.9rem',
                    }}
                  >
                    Don't have an account?{' '}
                    <Link
                      component={RouterLink}
                      to="/student-register"
                      sx={{
                        color: '#ffffff',
                        fontWeight: 600,
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Create Account
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

export default StudentLogin;
