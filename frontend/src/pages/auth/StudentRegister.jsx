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
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import SchoolIcon from '@mui/icons-material/School';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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

const validationSchema = yup.object({
  name: yup
    .string()
    .required('Name is required'),
  rollNumber: yup
    .string()
    .required('Roll Number is required'),
  class: yup
    .string()
    .required('Class is required'),
  section: yup
    .string()
    .required('Section is required'),
  city: yup
    .string()
    .required('City is required'),
  password: yup
    .string()
    .min(6, 'Password should be of minimum 6 characters length')
    .required('Password is required'),
});

function StudentRegister() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const theme = useTheme();
  const { isDark } = useCustomTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));


  const registerMutation = useMutation({
    mutationFn: async (values) => {
      const response = await axios.post('https://api.edulives.com/api/students/register', values);
      console.log(response.data);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('studentToken', data.token);
      localStorage.setItem('userRole', 'Student');
      toast.success('Registration successful!');
      navigate('/student');
    },
    onError: (error) => {
      console.error('Registration failed:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      rollNumber: '',
      class: '',
      section: '',
      city: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      registerMutation.mutate(values);
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
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
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
              JOIN OUR COMMUNITY
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
              Begin Your Educational Journey Today
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
            background: isDark 
              ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(129, 140, 248, 0.08) 100%)'
              : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(129, 140, 248, 0.05) 100%)',
            backdropFilter: 'blur(20px)',
            border: isDark 
              ? '1px solid rgba(99, 102, 241, 0.2)'
              : '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 3,
            p: { xs: 3, sm: 4 },
            boxShadow: isDark 
              ? '0 8px 32px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)'
              : '0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(0, 0, 0, 0.05)',
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
              <HowToRegIcon sx={{ 
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
                Student Registration
              </Typography>
            </Box>

            <Typography
              variant="body1"
              sx={{
                color: '#ffffff',
                fontSize: '1rem',
              }}
            >
              Create your student account to get started
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
                  id="name"
                  label="Full Name"
                  name="name"
                  autoComplete="name"
                  autoFocus
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      background: 'transparent !important',
                      backdropFilter: 'blur(10px)',
                      border: isDark 
                        ? '1px solid rgba(255, 255, 255, 0.1)' 
                        : '1px solid rgba(0, 0, 0, 0.1)',
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
                    '& .MuiInputBase-input': {
                      color: '#ffffff',
                    },
                    '& .MuiInputBase-input:focus': {
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
                  id="rollNumber"
                  label="Roll Number"
                  name="rollNumber"
                  autoComplete="rollNumber"
                  value={formik.values.rollNumber}
                  onChange={formik.handleChange}
                  error={formik.touched.rollNumber && Boolean(formik.errors.rollNumber)}
                  helperText={formik.touched.rollNumber && formik.errors.rollNumber}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      background: 'transparent !important',
                      backdropFilter: 'blur(10px)',
                      border: isDark 
                        ? '1px solid rgba(255, 255, 255, 0.1)' 
                        : '1px solid rgba(0, 0, 0, 0.1)',
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
                    '& .MuiInputBase-input': {
                      color: '#ffffff',
                    },
                    '& .MuiInputBase-input:focus': {
                      color: '#ffffff',
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                  }}
                />
              </motion.div>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <motion.div variants={itemVariants}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="class"
                      label="Class"
                      name="class"
                      value={formik.values.class}
                      onChange={formik.handleChange}
                      error={formik.touched.class && Boolean(formik.errors.class)}
                      helperText={formik.touched.class && formik.errors.class}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          background: 'transparent !important',
                          backdropFilter: 'blur(10px)',
                          border: isDark 
                            ? '1px solid rgba(255, 255, 255, 0.1)' 
                            : '1px solid rgba(0, 0, 0, 0.1)',
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
                        '& .MuiInputBase-input': {
                          color: '#ffffff',
                        },
                        '& .MuiInputBase-input:focus': {
                          color: '#ffffff',
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                      }}
                    />
                  </motion.div>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <motion.div variants={itemVariants}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="section"
                      label="Section"
                      name="section"
                      value={formik.values.section}
                      onChange={formik.handleChange}
                      error={formik.touched.section && Boolean(formik.errors.section)}
                      helperText={formik.touched.section && formik.errors.section}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          background: 'transparent !important',
                          backdropFilter: 'blur(10px)',
                          border: isDark 
                            ? '1px solid rgba(255, 255, 255, 0.1)' 
                            : '1px solid rgba(0, 0, 0, 0.1)',
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
                        '& .MuiInputBase-input': {
                          color: '#ffffff',
                        },
                        '& .MuiInputBase-input:focus': {
                          color: '#ffffff',
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                      }}
                    />
                  </motion.div>
                </Grid>
              </Grid>

              <motion.div variants={itemVariants}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="city"
                  label="City"
                  name="city"
                  value={formik.values.city}
                  onChange={formik.handleChange}
                  error={formik.touched.city && Boolean(formik.errors.city)}
                  helperText={formik.touched.city && formik.errors.city}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      background: 'transparent !important',
                      backdropFilter: 'blur(10px)',
                      border: isDark 
                        ? '1px solid rgba(255, 255, 255, 0.1)' 
                        : '1px solid rgba(0, 0, 0, 0.1)',
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
                    '& .MuiInputBase-input': {
                      color: '#ffffff',
                    },
                    '& .MuiInputBase-input:focus': {
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
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      background: 'transparent !important',
                      backdropFilter: 'blur(10px)',
                      border: isDark 
                        ? '1px solid rgba(255, 255, 255, 0.1)' 
                        : '1px solid rgba(0, 0, 0, 0.1)',
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
                    '& .MuiInputBase-input': {
                      color: '#ffffff',
                    },
                    '& .MuiInputBase-input:focus': {
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
                  disabled={registerMutation.isPending}
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
                      background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    },
                    mb: 3,
                  }}
                >
                  {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
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
                    Already have an account?{' '}
                    <Link
                      component={RouterLink}
                      to="/student-login"
                      sx={{
                        color: '#ffffff',
                        fontWeight: 600,
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Sign In
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

export default StudentRegister;
