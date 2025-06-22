import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import parentService from '../../services/parentService';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
  address: Yup.string().required('Address is required'),
  emergencyContact: Yup.string()
    .matches(/^[0-9]{10}$/, 'Emergency contact must be 10 digits')
    .required('Emergency contact is required'),
  occupation: Yup.string().required('Occupation is required'),
  workAddress: Yup.string().required('Work address is required'),
  workPhone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Work phone must be 10 digits')
    .required('Work phone is required'),
});

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await parentService.getProfile();
      formik.setValues(response.data);
    } catch {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      emergencyContact: '',
      occupation: '',
      workAddress: '',
      workPhone: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await parentService.updateProfile(values);
        toast.success('Profile updated successfully');
        fetchProfile();
      } catch {
        toast.error('Failed to update profile');
      }
    },
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Parent Profile
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
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

            <Grid item xs={12} md={6}>
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

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Emergency Contact"
                name="emergencyContact"
                value={formik.values.emergencyContact}
                onChange={formik.handleChange}
                error={
                  formik.touched.emergencyContact &&
                  Boolean(formik.errors.emergencyContact)
                }
                helperText={
                  formik.touched.emergencyContact && formik.errors.emergencyContact
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={3}
                value={formik.values.address}
                onChange={formik.handleChange}
                error={formik.touched.address && Boolean(formik.errors.address)}
                helperText={formik.touched.address && formik.errors.address}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Professional Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Occupation"
                name="occupation"
                value={formik.values.occupation}
                onChange={formik.handleChange}
                error={
                  formik.touched.occupation && Boolean(formik.errors.occupation)
                }
                helperText={formik.touched.occupation && formik.errors.occupation}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Work Phone"
                name="workPhone"
                value={formik.values.workPhone}
                onChange={formik.handleChange}
                error={
                  formik.touched.workPhone && Boolean(formik.errors.workPhone)
                }
                helperText={formik.touched.workPhone && formik.errors.workPhone}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Work Address"
                name="workAddress"
                multiline
                rows={3}
                value={formik.values.workAddress}
                onChange={formik.handleChange}
                error={
                  formik.touched.workAddress && Boolean(formik.errors.workAddress)
                }
                helperText={
                  formik.touched.workAddress && formik.errors.workAddress
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={formik.isSubmitting}
                >
                  Update Profile
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default Profile; 