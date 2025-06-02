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
  IconButton,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  School,
  Email,
  Phone,
  LocationOn,
  Person,
  Lock,
} from '@mui/icons-material';
import { teacherAPI } from '../../services/api';
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
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getProfile();
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

  const handleSave = async () => {
    try {
      await teacherAPI.updateProfile(editedProfile);
      toast.success('Profile updated successfully');
      setEditMode(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditedProfile(profile);
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      await teacherAPI.changePassword(passwordData);
      toast.success('Password changed successfully');
      setPasswordDialog(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setError('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('image', file);
        await teacherAPI.uploadProfileImage(formData);
        toast.success('Profile image updated successfully');
        fetchProfile();
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image');
      }
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
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar
                  src={profile?.image}
                  sx={{ width: 120, height: 120, mb: 2 }}
                />
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="profile-image-upload"
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="profile-image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCamera />}
                  >
                    Change Photo
                  </Button>
                </label>
              </Box>
              <Typography variant="h6" align="center" gutterBottom>
                {profile?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
                {profile?.designation}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                <Chip
                  icon={<School />}
                  label={profile?.subject}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  icon={<Email />}
                  label={profile?.email}
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Personal Information
                </Typography>
                {!editMode ? (
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={handleEdit}
                  >
                    Edit
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSave}
                    >
                      Save
                    </Button>
                  </Box>
                )}
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Full Name"
                    fullWidth
                    value={editMode ? editedProfile.name : profile.name}
                    onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email"
                    fullWidth
                    value={editMode ? editedProfile.email : profile.email}
                    onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone"
                    fullWidth
                    value={editMode ? editedProfile.phone : profile.phone}
                    onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Address"
                    fullWidth
                    value={editMode ? editedProfile.address : profile.address}
                    onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel>Subject</InputLabel>
                    <Select
                      value={editMode ? editedProfile.subject : profile.subject}
                      label="Subject"
                      onChange={(e) => setEditedProfile({ ...editedProfile, subject: e.target.value })}
                    >
                      <MenuItem value="Mathematics">Mathematics</MenuItem>
                      <MenuItem value="Science">Science</MenuItem>
                      <MenuItem value="English">English</MenuItem>
                      <MenuItem value="History">History</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel>Designation</InputLabel>
                    <Select
                      value={editMode ? editedProfile.designation : profile.designation}
                      label="Designation"
                      onChange={(e) => setEditedProfile({ ...editedProfile, designation: e.target.value })}
                    >
                      <MenuItem value="Senior Teacher">Senior Teacher</MenuItem>
                      <MenuItem value="Teacher">Teacher</MenuItem>
                      <MenuItem value="Assistant Teacher">Assistant Teacher</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Security
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Lock />}
                  onClick={() => setPasswordDialog(true)}
                >
                  Change Password
                </Button>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Last Password Change"
                    fullWidth
                    value={new Date(profile.lastPasswordChange).toLocaleDateString()}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Two-Factor Authentication"
                    fullWidth
                    value={profile.twoFactorEnabled ? 'Enabled' : 'Disabled'}
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
        onClose={() => {
          setPasswordDialog(false);
          setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
          setError('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Current Password"
                type="password"
                fullWidth
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="New Password"
                type="password"
                fullWidth
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Confirm New Password"
                type="password"
                fullWidth
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setPasswordDialog(false);
              setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
              });
              setError('');
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handlePasswordChange}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile; 