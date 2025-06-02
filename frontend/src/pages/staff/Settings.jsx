import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Save as SaveIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { staffAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [settings, setSettings] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    notifications: {
      email: true,
      push: true,
      assignments: true,
      events: true,
      messages: true,
    },
    theme: 'light',
    language: 'en',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await staffAPI.getSettings();
      setSettings(response.data);
      if (response.data.profileImage) {
        setProfileImage(response.data.profileImage);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationChange = (name) => (e) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [name]: e.target.checked,
      },
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await staffAPI.uploadProfileImage(formData);
      setProfileImage(response.data.imageUrl);
      toast.success('Profile image updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload profile image');
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await staffAPI.updateSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account settings and preferences
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Avatar
                  src={profileImage}
                  sx={{ width: 120, height: 120, mb: 2 }}
                />
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="profile-image-upload"
                  type="file"
                  onChange={handleImageChange}
                />
                <label htmlFor="profile-image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCameraIcon />}
                  >
                    Change Photo
                  </Button>
                </label>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={settings.firstName}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={settings.lastName}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={settings.email}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={settings.phone}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    name="department"
                    value={settings.department}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Position"
                    name="position"
                    value={settings.position}
                    onChange={handleInputChange}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Notification Preferences
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.email}
                        onChange={handleNotificationChange('email')}
                      />
                    }
                    label="Email Notifications"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.push}
                        onChange={handleNotificationChange('push')}
                      />
                    }
                    label="Push Notifications"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.assignments}
                        onChange={handleNotificationChange('assignments')}
                      />
                    }
                    label="Assignment Notifications"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.events}
                        onChange={handleNotificationChange('events')}
                      />
                    }
                    label="Event Notifications"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.messages}
                        onChange={handleNotificationChange('messages')}
                      />
                    }
                    label="Message Notifications"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Appearance
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Theme"
                    name="theme"
                    value={settings.theme}
                    onChange={handleInputChange}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Language"
                    name="language"
                    value={settings.language}
                    onChange={handleInputChange}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </TextField>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveSettings}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings; 