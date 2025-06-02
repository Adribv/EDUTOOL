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
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { staffAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    subjects: [],
    qualifications: [],
    experience: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedQualification, setSelectedQualification] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await staffAPI.getProfile();
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

  const handleSave = async () => {
    try {
      setSaving(true);
      await staffAPI.updateProfile(profile);
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddQualification = () => {
    setSelectedQualification(null);
    setOpenDialog(true);
  };

  const handleEditQualification = (qualification) => {
    setSelectedQualification(qualification);
    setOpenDialog(true);
  };

  const handleSaveQualification = () => {
    if (selectedQualification) {
      // Update existing qualification
      setProfile((prev) => ({
        ...prev,
        qualifications: prev.qualifications.map((q) =>
          q.id === selectedQualification.id ? selectedQualification : q
        ),
      }));
    } else {
      // Add new qualification
      setProfile((prev) => ({
        ...prev,
        qualifications: [...prev.qualifications, { id: Date.now(), ...selectedQualification }],
      }));
    }
    setOpenDialog(false);
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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Profile
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your personal information and qualifications
          </Typography>
        </Box>
        {!editMode ? (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setEditMode(true)}
          >
            Edit Profile
          </Button>
        ) : (
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            Save Changes
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                }}
              >
                <PersonIcon sx={{ fontSize: 60 }} />
              </Avatar>
              <Typography variant="h6" gutterBottom>
                {profile.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {profile.department}
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText primary={profile.email} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText primary={profile.phone} />
                </ListItem>
              </List>
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
                    label="Name"
                    name="name"
                    value={profile.name}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    name="department"
                    value={profile.department}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={profile.phone}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Experience"
                    name="experience"
                    value={profile.experience}
                    onChange={handleInputChange}
                    multiline
                    rows={4}
                    disabled={!editMode}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Qualifications</Typography>
                  {editMode && (
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={handleAddQualification}
                    >
                      Add Qualification
                    </Button>
                  )}
                </Box>
                <List>
                  {profile.qualifications.map((qualification) => (
                    <ListItem
                      key={qualification.id}
                      secondaryAction={
                        editMode && (
                          <IconButton
                            edge="end"
                            onClick={() => handleEditQualification(qualification)}
                          >
                            <EditIcon />
                          </IconButton>
                        )
                      }
                    >
                      <ListItemIcon>
                        <SchoolIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={qualification.degree}
                        secondary={`${qualification.institution} - ${qualification.year}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {selectedQualification ? 'Edit Qualification' : 'Add Qualification'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Degree"
            value={selectedQualification?.degree || ''}
            onChange={(e) =>
              setSelectedQualification((prev) => ({
                ...prev,
                degree: e.target.value,
              }))
            }
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Institution"
            value={selectedQualification?.institution || ''}
            onChange={(e) =>
              setSelectedQualification((prev) => ({
                ...prev,
                institution: e.target.value,
              }))
            }
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Year"
            value={selectedQualification?.year || ''}
            onChange={(e) =>
              setSelectedQualification((prev) => ({
                ...prev,
                year: e.target.value,
              }))
            }
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveQualification} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile; 