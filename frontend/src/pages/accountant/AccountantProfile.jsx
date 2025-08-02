import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Grid,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { staffAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  contactNumber: Yup.string().required('Contact number is required'),
});

const AccountantProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [initialLoading, setInitialLoading] = useState(true);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      contactNumber: '',
      address: '',
    },
    validationSchema,
    onSubmit: (values) => {
      updateMutation.mutate(values);
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await staffAPI.getProfile();
        formik.setValues({
          name: profile.name || '',
          email: profile.email || '',
          contactNumber: profile.contactNumber || '',
          address: profile.address || '',
        });
      } catch (err) {
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    };
    loadProfile();
    // eslint-disable-next-line
  }, []);

  const updateMutation = useMutation({
    mutationFn: staffAPI.updateProfile,
    onSuccess: (data) => {
      updateUser(data);
      toast.success('Profile updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Update failed');
    },
  });

  const handleLogout = async () => {
    await logout();
    navigate('/accountant-login');
  };

  if (initialLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, display: 'flex', justifyContent: 'center' }}>


      <Paper elevation={6} sx={{ p: 4, maxWidth: 600, width: '100%' }}>
        <Typography variant="h4" sx={{ mb: 3 }}>My Profile</Typography>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contact Number"
                name="contactNumber"
                value={formik.values.contactNumber}
                onChange={formik.handleChange}
                error={formik.touched.contactNumber && Boolean(formik.errors.contactNumber)}
                helperText={formik.touched.contactNumber && formik.errors.contactNumber}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formik.values.address}
                onChange={formik.handleChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button variant="contained" type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button color="error" onClick={handleLogout}>Logout</Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default AccountantProfile; 