import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Avatar,
  IconButton,
  Divider,
  Switch,
  FormControlLabel,
  FormGroup,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { parentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const ParentProfile = () => {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    occupation: '',
    emergencyContact: '',
    profileImage: '',
    notificationPreferences: {
      email: true,
      sms: true,
      push: true,
      assignments: true,
      events: true,
      attendance: true,
      grades: true,
    },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await parentAPI.getProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationChange = (name) => (event) => {
    setProfile((prev) => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [name]: event.target.checked,
      },
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('profileImage', file);
        const response = await parentAPI.uploadProfileImage(formData);
        setProfile((prev) => ({
          ...prev,
          profileImage: response.data.imageUrl,
        }));
        toast.success('Profile image updated successfully');
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload profile image');
      }
    }
  };

  const handleSave = async () => {
    try {
      await parentAPI.updateProfile(profile);
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Image and Basic Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  src={profile.profileImage}
                  sx={{ width: 150, height: 150, mb: 2 }}
                />
                {editing && (
                  <IconButton
                    component="label"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: 'background.paper',
                    }}
                  >
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <PhotoCameraIcon />
                  </IconButton>
                )}
              </Box>
              <Typography variant="h6" gutterBottom>
                {`${profile.firstName} ${profile.lastName}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profile.occupation}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Personal Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Personal Information</Typography>
                <IconButton onClick={() => setEditing(!editing)}>
                  {editing ? <CancelIcon /> : <EditIcon />}
                </IconButton>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={profile.firstName}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={profile.lastName}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={profile.phone}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={profile.address}
                    onChange={handleInputChange}
                    multiline
                    rows={2}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Occupation"
                    name="occupation"
                    value={profile.occupation}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Emergency Contact"
                    name="emergencyContact"
                    value={profile.emergencyContact}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Preferences */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Preferences
              </Typography>
              <FormGroup>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={profile.notificationPreferences.email}
                          onChange={handleNotificationChange('email')}
                          disabled={!editing}
                        />
                      }
                      label="Email Notifications"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={profile.notificationPreferences.sms}
                          onChange={handleNotificationChange('sms')}
                          disabled={!editing}
                        />
                      }
                      label="SMS Notifications"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={profile.notificationPreferences.push}
                          onChange={handleNotificationChange('push')}
                          disabled={!editing}
                        />
                      }
                      label="Push Notifications"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={profile.notificationPreferences.assignments}
                          onChange={handleNotificationChange('assignments')}
                          disabled={!editing}
                        />
                      }
                      label="Assignment Updates"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={profile.notificationPreferences.events}
                          onChange={handleNotificationChange('events')}
                          disabled={!editing}
                        />
                      }
                      label="Event Reminders"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={profile.notificationPreferences.attendance}
                          onChange={handleNotificationChange('attendance')}
                          disabled={!editing}
                        />
                      }
                      label="Attendance Updates"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={profile.notificationPreferences.grades}
                          onChange={handleNotificationChange('grades')}
                          disabled={!editing}
                        />
                      }
                      label="Grade Updates"
                    />
                  </Grid>
                </Grid>
              </FormGroup>
            </CardContent>
          </Card>
        </Grid>

        {/* Save Button */}
        {editing && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ParentProfile; 