import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Link,
} from '@mui/material';
import { Person, Email, Lock, ChildCare } from '@mui/icons-material';
import { authAPI } from '../../services/api';
import { toast } from 'react-toastify';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  childRollNumbers: Yup.string().required('At least one child roll number is required'),
});

const ParentRegister = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const registerMutation = useMutation({
    mutationFn: (values) => {
        const { name, email, password, childRollNumbers } = values;
        const rollNumbersArray = childRollNumbers.split(',').map(num => num.trim());
        return authAPI.parentRegister({ name, email, password, childRollNumbers: rollNumbersArray });
    },
    onSuccess: () => {
      toast.success('Registration successful! Please log in.');
      navigate('/parent-login');
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Registration failed.');
      toast.error(err.response?.data?.message || 'Registration failed.');
    },
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      childRollNumbers: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      registerMutation.mutate(values);
    },
  });

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Parent Registration
        </Typography>
        {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
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
            InputProps={{ startAdornment: <Person /> }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            InputProps={{ startAdornment: <Email /> }}
          />
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
            InputProps={{ startAdornment: <Lock /> }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
            InputProps={{ startAdornment: <Lock /> }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="childRollNumbers"
            label="Child Roll Numbers (comma-separated)"
            id="childRollNumbers"
            value={formik.values.childRollNumbers}
            onChange={formik.handleChange}
            error={formik.touched.childRollNumbers && Boolean(formik.errors.childRollNumbers)}
            helperText={formik.touched.childRollNumbers && formik.errors.childRollNumbers}
            InputProps={{ startAdornment: <ChildCare /> }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? <CircularProgress size={24} /> : 'Register'}
          </Button>
          <Link component={RouterLink} to="/parent-login" variant="body2">
            Already have an account? Sign in
          </Link>
        </Box>
      </Paper>
    </Container>
  );
};

export default ParentRegister; 
