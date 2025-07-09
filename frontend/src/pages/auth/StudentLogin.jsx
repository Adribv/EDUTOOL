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
      const response = await axios.post('https://api.edulives.com/students/login', values);
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
              STUDENT PORTAL
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
              Your Gateway to Educational Excellence
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
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <AutoStoriesIcon sx={{ 
                fontSize: { xs: 32, sm: 40 }, 
                color: '#1a237e', 
                mr: 2 
              }} />
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2rem' },
                  fontWeight: 700,
                  color: '#1a237e',
                }}
              >
                Student Login
              </Typography>
            </Box>

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
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
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
                    mb: 3,
                  }}
                >
                  {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
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
                      to="/student-register"
                      sx={{
                        color: '#1a237e',
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
