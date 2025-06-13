import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { hodAPI } from '../../services/api';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    qualification: '',
    experience: '',
    bio: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await hodAPI.getProfile();
      setProfile(response.data);
      setFormData({
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        email: response.data.email,
        phone: response.data.phone,
        department: response.data.department,
        designation: response.data.designation,
        qualification: response.data.qualification,
        experience: response.data.experience,
        bio: response.data.bio,
      });
      setError(null);
    } catch (err) {
      setError('Failed to load profile data');
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      department: profile.department,
      designation: profile.designation,
      qualification: profile.qualification,
      experience: profile.experience,
      bio: profile.bio,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await hodAPI.updateProfile(formData);
      await fetchProfile();
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile');
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setLoading(true);
      await hodAPI.uploadProfileImage(formData);
      await fetchProfile();
      toast.success('Profile image updated successfully');
    } catch (err) {
      setError('Failed to update profile image');
      toast.error('Failed to update profile image');
    } finally {
      setLoading(false);
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
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box position="relative">
              <Avatar
                src={profile?.profileImage}
                alt={`${profile?.firstName} ${profile?.lastName}`}
                sx={{ width: 120, height: 120 }}
              />
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-image-upload"
                type="file"
                onChange={handleImageUpload}
              />
              <label htmlFor="profile-image-upload">
                <IconButton
                  component="span"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                >
                  <PhotoCameraIcon />
                </IconButton>
              </label>
            </Box>
            <Box flex={1}>
              <Typography variant="h4" gutterBottom>
                {profile?.firstName} {profile?.lastName}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {profile?.designation}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {profile?.department}
              </Typography>
            </Box>
            {!isEditing && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEdit}
              >
                Edit Profile
              </Button>
            )}
          </Paper>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Qualification"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Experience (years)"
                    name="experience"
                    type="number"
                    value={formData.experience}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    multiline
                    rows={4}
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </Grid>
              </Grid>

              {isEditing && (
                <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                  >
                    Save Changes
                  </Button>
                </Box>
              )}
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile; 