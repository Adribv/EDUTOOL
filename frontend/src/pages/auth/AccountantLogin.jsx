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
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.jpg';

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
    <Box sx={{
      minHeight: '100vh',
      minWidth: '100vw',
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      backgroundColor: '#f8fafc',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background image */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("https://images.unsplash.com/photo-1605901714464-82664062e980?q=80&w=1470&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 0,
      }} />

      {/* Branding */}
      <Box sx={{
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
      }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Box sx={{ mb: 4 }}>
            <img src={logo} alt="EDURAYS Logo" style={{ height: isMobile ? 80 : 120, width: 'auto', marginBottom: 16 }} />
          </Box>
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 2, color: 'white', fontSize: { xs: '2rem', md: '3rem' } }}>
            Accountant Portal
          </Typography>
          <Typography variant="h6" sx={{ color: 'white', opacity: 0.9 }}>
            Manage the school's finances and monitor economic health
          </Typography>
        </motion.div>
      </Box>

      {/* Login Form */}
      <Box sx={{ flex: { xs: '1', md: '1' }, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, p: { xs: 2, sm: 4 } }}>
        <Container maxWidth="sm">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <Paper elevation={24} sx={{ p: { xs: 3, sm: 4, md: 5 }, borderRadius: 3, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <WalletIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>Accountant Login</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>Access financial management tools</Typography>
              </Box>

              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

              <Box component="form" onSubmit={formik.handleSubmit}>
                <TextField fullWidth id="email" name="email" label="Email" value={formik.values.email} onChange={formik.handleChange} error={formik.touched.email && Boolean(formik.errors.email)} helperText={formik.touched.email && formik.errors.email} margin="normal" InputProps={{ startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} /> }} />
                <TextField fullWidth id="password" name="password" label="Password" type={showPassword ? 'text' : 'password'} value={formik.values.password} onChange={formik.handleChange} error={formik.touched.password && Boolean(formik.errors.password)} helperText={formik.touched.password && formik.errors.password} margin="normal" InputProps={{ startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />, endAdornment: (<InputAdornment position="end"><IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton></InputAdornment>) }} />
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loginMutation.isLoading}>
                  {loginMutation.isLoading ? <CircularProgress size={24} /> : 'Sign In'}
                </Button>
              </Box>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button variant="text" onClick={() => navigate('/')} sx={{ textTransform: 'none' }}>
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

export default AccountantLogin; 