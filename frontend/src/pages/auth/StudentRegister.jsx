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
} from '@mui/material';
import { useTheme as useAppTheme } from '../../context/ThemeContext';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';
import SchoolIcon from '@mui/icons-material/School';
import HowToRegIcon from '@mui/icons-material/HowToReg';

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

function StudentRegister() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const theme = useTheme();
  const { isDark } = useAppTheme();

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
        backgroundColor: isDark ? '#1e293b' : '#f0f8ff',
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
                color: isDark ? '#ffffff' : '#1e293b',
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
                color: isDark ? '#ffffff' : '#1e293b',
              }}
            >
              JOIN OUR COMMUNITY
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem', lg: '1.5rem' },
                fontWeight: 400,
                opacity: 0.9,
                lineHeight: 1.6,
                color: isDark ? '#ffffff' : '#1e293b',
              }}
            >
              Begin Your Educational Journey Today
            </Typography>
          </motion.div>
        </Box>

        {/* Right side form */}
        <Box
          sx={{
            flex: '1 1 auto',
            maxWidth: { xs: '100%', sm: '450px', md: '400px' },
            width: '100%',
            backgroundColor: isDark ? '#334155' : '#ffffff',
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
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <HowToRegIcon sx={{ 
                fontSize: { xs: 32, sm: 40 }, 
                color: isDark ? '#ffffff' : '#1a237e', 
                mr: 2 
              }} />
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2rem' },
                  fontWeight: 700,
                  color: isDark ? '#ffffff' : '#1a237e',
                }}
              >
                Student Registration
              </Typography>
            </Box>

            <Typography
              variant="body1"
              sx={{
                color: isDark ? '#e2e8f0' : 'text.secondary',
                mb: 4,
                fontSize: { xs: '0.875rem', sm: '1rem' },
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
                      borderRadius: 1.5,
                      backgroundColor: isDark ? '#475569' : '#f8fafc',
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
                      borderRadius: 1.5,
                      backgroundColor: isDark ? '#475569' : '#f8fafc',
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
                          borderRadius: 1.5,
                          backgroundColor: isDark ? '#475569' : '#f8fafc',
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
                          borderRadius: 1.5,
                          backgroundColor: isDark ? '#475569' : '#f8fafc',
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
                      borderRadius: 1.5,
                      backgroundColor: isDark ? '#475569' : '#f8fafc',
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
                      borderRadius: 1.5,
                      backgroundColor: isDark ? '#475569' : '#f8fafc',
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
                    backgroundColor: isDark ? '#3b82f6' : '#1a237e',
                    '&:hover': {
                      backgroundColor: isDark ? '#2563eb' : '#0d47a1',
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
                      color: isDark ? '#e2e8f0' : 'text.secondary',
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    }}
                  >
                    Already have an account?{' '}
                    <Link
                      component={RouterLink}
                      to="/student-login"
                      sx={{
                        color: isDark ? '#60a5fa' : '#1a237e',
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
