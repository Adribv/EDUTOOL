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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
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
  ExpandMore,
  Work,
  Language,
  LinkedIn,
  Twitter,
  Language as LanguageIcon,
  Psychology,
  Add,
  Delete,
  Business,
  CalendarToday,
  AccessTime,
  Description,
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
  const [professionalDevDialog, setProfessionalDevDialog] = useState(false);
  const [professionalDevData, setProfessionalDevData] = useState({
    title: '',
    institution: '',
    date: '',
    duration: '',
    certificate: '',
    description: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getProfile();
      setProfile(response);
      setEditedProfile(response);
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
      await teacherAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
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
        formData.append('profileImage', file);
        await teacherAPI.uploadProfileImage(formData);
        toast.success('Profile image updated successfully');
        fetchProfile();
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image');
      }
    }
  };

  const handleAddProfessionalDev = async () => {
    try {
      await teacherAPI.addProfessionalDevelopment(professionalDevData);
      toast.success('Professional development record added successfully');
      setProfessionalDevDialog(false);
      setProfessionalDevData({
        title: '',
        institution: '',
        date: '',
        duration: '',
        certificate: '',
        description: ''
      });
      fetchProfile();
    } catch (error) {
      console.error('Error adding professional development:', error);
      toast.error('Failed to add professional development record');
    }
  };

  const handleDeleteProfessionalDev = async (index) => {
    try {
      await teacherAPI.deleteProfessionalDevelopment(index);
      toast.success('Professional development record deleted successfully');
      fetchProfile();
    } catch (error) {
      console.error('Error deleting professional development:', error);
      toast.error('Failed to delete professional development record');
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
        {/* Profile Image and Basic Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar
                  src={profile?.profileImage}
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
                {profile?.designation || profile?.role}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
                Employee ID: {profile?.employeeId}
              </Typography>
              
              {/* Skills and Languages */}
              {profile?.skills && profile.skills.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Skills:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {profile.skills.map((skill, index) => (
                      <Chip key={index} label={skill} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}

              {profile?.languages && profile.languages.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Languages:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {profile.languages.map((language, index) => (
                      <Chip key={index} label={language} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Main Profile Information */}
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
                    disabled
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
                  <TextField
                    label="Designation"
                    fullWidth
                    value={editMode ? editedProfile.designation : profile.designation}
                    onChange={(e) => setEditedProfile({ ...editedProfile, designation: e.target.value })}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Qualification"
                    fullWidth
                    value={editMode ? editedProfile.qualification : profile.qualification}
                    onChange={(e) => setEditedProfile({ ...editedProfile, qualification: e.target.value })}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Experience"
                    fullWidth
                    value={editMode ? editedProfile.experience : profile.experience}
                    onChange={(e) => setEditedProfile({ ...editedProfile, experience: e.target.value })}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Joining Date"
                    fullWidth
                    value={profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : ''}
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Bio"
                    fullWidth
                    multiline
                    rows={3}
                    value={editMode ? editedProfile.bio : profile.bio}
                    onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                    disabled={!editMode}
                    helperText="Tell us about yourself (max 500 characters)"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Emergency Contact */}
              <Typography variant="h6" gutterBottom>
                Emergency Contact
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Emergency Contact Name"
                    fullWidth
                    value={editMode ? editedProfile.emergencyContact?.name : profile.emergencyContact?.name}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      emergencyContact: { ...editedProfile.emergencyContact, name: e.target.value }
                    })}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Relationship"
                    fullWidth
                    value={editMode ? editedProfile.emergencyContact?.relationship : profile.emergencyContact?.relationship}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      emergencyContact: { ...editedProfile.emergencyContact, relationship: e.target.value }
                    })}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Emergency Contact Phone"
                    fullWidth
                    value={editMode ? editedProfile.emergencyContact?.phone : profile.emergencyContact?.phone}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      emergencyContact: { ...editedProfile.emergencyContact, phone: e.target.value }
                    })}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Emergency Contact Email"
                    fullWidth
                    value={editMode ? editedProfile.emergencyContact?.email : profile.emergencyContact?.email}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      emergencyContact: { ...editedProfile.emergencyContact, email: e.target.value }
                    })}
                    disabled={!editMode}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Social Media */}
              <Typography variant="h6" gutterBottom>
                Social Media
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="LinkedIn"
                    fullWidth
                    value={editMode ? editedProfile.socialMedia?.linkedin : profile.socialMedia?.linkedin}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      socialMedia: { ...editedProfile.socialMedia, linkedin: e.target.value }
                    })}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Twitter"
                    fullWidth
                    value={editMode ? editedProfile.socialMedia?.twitter : profile.socialMedia?.twitter}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      socialMedia: { ...editedProfile.socialMedia, twitter: e.target.value }
                    })}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Website"
                    fullWidth
                    value={editMode ? editedProfile.socialMedia?.website : profile.socialMedia?.website}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      socialMedia: { ...editedProfile.socialMedia, website: e.target.value }
                    })}
                    disabled={!editMode}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Professional Development */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Professional Development
                </Typography>
                {editMode && (
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => setProfessionalDevDialog(true)}
                  >
                    Add Record
                  </Button>
                )}
              </Box>

              {profile.professionalDevelopment && profile.professionalDevelopment.length > 0 ? (
                <List>
                  {profile.professionalDevelopment.map((dev, index) => (
                    <ListItem key={index} divider>
                      <ListItemIcon>
                        <Work />
                      </ListItemIcon>
                      <ListItemText
                        primary={dev.title}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {dev.institution} • {dev.duration}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(dev.date).toLocaleDateString()}
                            </Typography>
                            {dev.description && (
                              <Typography variant="body2" color="text.secondary">
                                {dev.description}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      {editMode && (
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteProfessionalDev(index)}
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No professional development records found.
                </Typography>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Privacy Settings */}
              <Typography variant="h6" gutterBottom>
                Privacy Settings
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel>Profile Visibility</InputLabel>
                    <Select
                      value={editMode ? editedProfile.preferences?.privacy?.profileVisibility : profile.preferences?.privacy?.profileVisibility}
                      label="Profile Visibility"
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        preferences: {
                          ...editedProfile.preferences,
                          privacy: { ...editedProfile.preferences?.privacy, profileVisibility: e.target.value }
                        }
                      })}
                    >
                      <MenuItem value="public">Public</MenuItem>
                      <MenuItem value="staff-only">Staff Only</MenuItem>
                      <MenuItem value="private">Private</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editMode ? editedProfile.preferences?.privacy?.showContactInfo : profile.preferences?.privacy?.showContactInfo}
                        onChange={(e) => setEditedProfile({
                          ...editedProfile,
                          preferences: {
                            ...editedProfile.preferences,
                            privacy: { ...editedProfile.preferences?.privacy, showContactInfo: e.target.checked }
                          }
                        })}
                        disabled={!editMode}
                      />
                    }
                    label="Show Contact Information"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Security */}
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
                    label="Last Updated"
                    fullWidth
                    value={profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'Never'}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Account Status"
                    fullWidth
                    value={profile.status || 'Active'}
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

      {/* Professional Development Dialog */}
      <Dialog
        open={professionalDevDialog}
        onClose={() => {
          setProfessionalDevDialog(false);
          setProfessionalDevData({
            title: '',
            institution: '',
            date: '',
            duration: '',
            certificate: '',
            description: ''
          });
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Professional Development Record</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Title"
                fullWidth
                value={professionalDevData.title}
                onChange={(e) => setProfessionalDevData({ ...professionalDevData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Institution"
                fullWidth
                value={professionalDevData.institution}
                onChange={(e) => setProfessionalDevData({ ...professionalDevData, institution: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                value={professionalDevData.date}
                onChange={(e) => setProfessionalDevData({ ...professionalDevData, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Duration"
                fullWidth
                value={professionalDevData.duration}
                onChange={(e) => setProfessionalDevData({ ...professionalDevData, duration: e.target.value })}
                placeholder="e.g., 2 weeks, 3 days"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Certificate (optional)"
                fullWidth
                value={professionalDevData.certificate}
                onChange={(e) => setProfessionalDevData({ ...professionalDevData, certificate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={professionalDevData.description}
                onChange={(e) => setProfessionalDevData({ ...professionalDevData, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setProfessionalDevDialog(false);
              setProfessionalDevData({
                title: '',
                institution: '',
                date: '',
                duration: '',
                certificate: '',
                description: ''
              });
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddProfessionalDev}
          >
            Add Record
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile; 