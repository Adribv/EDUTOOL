import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Alert,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';

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
  password: yup
    .string()
    .min(6, 'Password should be of minimum 6 characters length')
    .required('Password is required'),
});

function StudentRegister() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const registerMutation = useMutation({
    mutationFn: async (values) => {
      const response = await axios.post('http://localhost:5000/api/students/register', values);
      console.log(response.data);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('studentToken', data.token);
      toast.success('Registration successful!');
      navigate('/Student');
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
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      registerMutation.mutate(values);
    },
  });

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5">
            Student Registration
          </Typography>
          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {error}
            </Alert>
          )}
          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{ mt: 1, width: '100%' }}
          >
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
            />
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
            />
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
            />
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
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? 'Registering...' : 'Register'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/student-login" variant="body2">
                {"Already have an account? Sign In"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default StudentRegister;
