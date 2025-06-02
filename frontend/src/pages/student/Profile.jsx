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

const Profile = () => {
  const [loading, setLoading] = useState(true);
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
      setLoading(true);
      const response = await studentAPI.getProfile();
      setProfile(response.data);
      setEditedProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Information */}
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
                  sx={{ width: 120, height: 120, mb: 2 }}
                  src={profile?.avatar}
                />
                <Typography variant="h5" gutterBottom>
                  {profile?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Roll Number: {profile?.rollNumber}
                </Typography>
              </Box>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <School />
                  </ListItemIcon>
                  <ListItemText
                    primary="Class"
                    secondary={`${profile?.class} ${profile?.section}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Email />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={profile?.email}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Phone />
                  </ListItemIcon>
                  <ListItemText
                    primary="Phone"
                    secondary={profile?.phone}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocationOn />
                  </ListItemIcon>
                  <ListItemText
                    primary="Address"
                    secondary={profile?.address}
                  />
                </ListItem>
              </List>

              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={handleEdit}
                  sx={{ mr: 1 }}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Security />}
                  onClick={() => setPasswordDialog(true)}
                >
                  Change Password
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Edit Profile Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {editMode ? 'Edit Profile' : 'Personal Information'}
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={editedProfile?.name || ''}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, name: e.target.value })
                    }
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={editedProfile?.email || ''}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        email: e.target.value,
                      })
                    }
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={editedProfile?.phone || ''}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        phone: e.target.value,
                      })
                    }
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    value={editedProfile?.dateOfBirth || ''}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        dateOfBirth: e.target.value,
                      })
                    }
                    disabled={!editMode}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    multiline
                    rows={3}
                    value={editedProfile?.address || ''}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        address: e.target.value,
                      })
                    }
                    disabled={!editMode}
                  />
                </Grid>
              </Grid>

              {editMode && (
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
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
        </Grid>
      </Grid>

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