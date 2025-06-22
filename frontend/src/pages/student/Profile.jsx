import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Button,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Person,
  School,
  Email,
  Phone,
  LocationOn,
  Edit,
  Save,
  Cancel,
  Cake,
  Bloodtype,
  MedicalServices,
  Security,
} from '@mui/icons-material';
import { studentAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import studentService from '../../services/studentService';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().matches(/^[0-9]{10}$/, 'Invalid phone number'),
  address: Yup.string(),
  parentName: Yup.string(),
  parentPhone: Yup.string().matches(/^[0-9]{10}$/, 'Invalid phone number'),
  emergencyContact: Yup.string().matches(/^[0-9]{10}$/, 'Invalid phone number'),
});

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await studentService.getProfile();
      setProfile(response.data);
      setEditedProfile(response.data);
      formik.setValues(response.data);
    } catch (error) {
      setError('Failed to load profile');
      toast.error('Failed to load profile');
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
      parentName: '',
      parentPhone: '',
      emergencyContact: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        await studentService.updateProfile(values);
        toast.success('Profile updated successfully');
        fetchProfile();
      } catch (error) {
        toast.error('Failed to update profile');
      } finally {
        setLoading(false);
      }
    },
  });

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setEditMode(false);
  };

  const handleSave = async () => {
    try {
      await studentAPI.updateProfile(editedProfile);
      setProfile(editedProfile);
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      await studentAPI.changePassword(passwordData);
      setPasswordDialog(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    }
  };

  if (loading && !profile) {
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
        Student Profile
      </Typography>

      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={4}>
            <Avatar
              sx={{ width: 100, height: 100, mr: 3 }}
              src={profile?.profilePicture}
            >
              {profile?.name?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h5">{profile?.name}</Typography>
              <Typography color="textSecondary">
                Student ID: {profile?.studentId}
              </Typography>
              <Typography color="textSecondary">
                Class: {profile?.class} {profile?.section}
              </Typography>
            </Box>
          </Box>

          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="name"
                  label="Full Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="email"
                  label="Email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="phone"
                  label="Phone Number"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="address"
                  label="Address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  error={formik.touched.address && Boolean(formik.errors.address)}
                  helperText={formik.touched.address && formik.errors.address}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="parentName"
                  label="Parent/Guardian Name"
                  value={formik.values.parentName}
                  onChange={formik.handleChange}
                  error={formik.touched.parentName && Boolean(formik.errors.parentName)}
                  helperText={formik.touched.parentName && formik.errors.parentName}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="parentPhone"
                  label="Parent/Guardian Phone"
                  value={formik.values.parentPhone}
                  onChange={formik.handleChange}
                  error={formik.touched.parentPhone && Boolean(formik.errors.parentPhone)}
                  helperText={formik.touched.parentPhone && formik.errors.parentPhone}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="emergencyContact"
                  label="Emergency Contact"
                  value={formik.values.emergencyContact}
                  onChange={formik.handleChange}
                  error={formik.touched.emergencyContact && Boolean(formik.errors.emergencyContact)}
                  helperText={formik.touched.emergencyContact && formik.errors.emergencyContact}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Update Profile'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Medical Information */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Medical Information
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Blood Group"
                value={profile?.bloodGroup || ''}
                disabled
                InputProps={{
                  startAdornment: <Bloodtype sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Height"
                value={profile?.height || ''}
                disabled
                InputProps={{
                  startAdornment: <MedicalServices sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Weight"
                value={profile?.weight || ''}
                disabled
                InputProps={{
                  startAdornment: <MedicalServices sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Medical Conditions"
                multiline
                rows={2}
                value={profile?.medicalConditions || ''}
                disabled
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog
        open={passwordDialog}
        onClose={() => setPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              type="password"
              label="Current Password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="password"
              label="New Password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handlePasswordChange}
            disabled={
              !passwordData.currentPassword ||
              !passwordData.newPassword ||
              !passwordData.confirmPassword
            }
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile; 