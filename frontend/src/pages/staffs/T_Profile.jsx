import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
} from '@mui/material';
import staffService from '../../services/staffService';

const T_Profile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    qualification: '',
    experience: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await staffService.getProfile();
      setProfile(response.data);
      setEditData({
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone,
        address: response.data.address,
        qualification: response.data.qualification,
        experience: response.data.experience,
      });
    } catch {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await staffService.updateProfile(editData);
      handleCloseDialog();
      fetchProfile();
    } catch {
      setError('Failed to update profile');
    }
  };

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
        My Profile
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4} display="flex" flexDirection="column" alignItems="center">
            <Avatar
              sx={{ width: 150, height: 150, mb: 2 }}
              src={profile.avatar}
              alt={profile.name}
            />
            <Typography variant="h6">{profile.name}</Typography>
            <Typography color="textSecondary">{profile.role}</Typography>
          </Grid>
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" color="textSecondary">
                  Personal Information
                </Typography>
                <Divider sx={{ my: 1 }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Email
                </Typography>
                <Typography variant="body1">{profile.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Phone
                </Typography>
                <Typography variant="body1">{profile.phone}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">
                  Address
                </Typography>
                <Typography variant="body1">{profile.address}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 2 }}>
                  Professional Information
                </Typography>
                <Divider sx={{ my: 1 }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Qualification
                </Typography>
                <Typography variant="body1">{profile.qualification}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Experience
                </Typography>
                <Typography variant="body1">{profile.experience} years</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Box mt={3} display="flex" justifyContent="flex-end">
          <Button variant="contained" color="primary" onClick={handleOpenDialog}>
            Edit Profile
          </Button>
        </Box>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            name="name"
            label="Name"
            value={editData.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            name="email"
            label="Email"
            type="email"
            value={editData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            name="phone"
            label="Phone"
            value={editData.phone}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            name="address"
            label="Address"
            value={editData.address}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
            rows={3}
            required
          />
          <TextField
            name="qualification"
            label="Qualification"
            value={editData.qualification}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            name="experience"
            label="Experience (years)"
            type="number"
            value={editData.experience}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default T_Profile; 