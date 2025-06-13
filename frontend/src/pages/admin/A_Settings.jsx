import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  School as SchoolIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  SystemUpdate as SystemUpdateIcon,
} from '@mui/icons-material';
import adminService from '../../services/adminService';

const A_Settings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    school: {
      name: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      logo: '',
    },
    academic: {
      academicYear: '',
      termStartDate: '',
      termEndDate: '',
      gradingSystem: '',
      attendanceThreshold: '',
    },
    security: {
      passwordPolicy: {
        minLength: '',
        requireUppercase: false,
        requireNumbers: false,
        requireSpecialChars: false,
        expiryDays: '',
      },
      sessionTimeout: '',
      twoFactorAuth: false,
    },
    notifications: {
      emailNotifications: false,
      smsNotifications: false,
      notificationTypes: {
        attendance: false,
        grades: false,
        events: false,
        announcements: false,
      },
    },
    system: {
      maintenanceMode: false,
      backupFrequency: '',
      dataRetentionPeriod: '',
      theme: '',
      language: '',
    },
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSection, setEditingSection] = useState('');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await adminService.getSettings();
      setSettings(response.data);
    } catch {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (section) => {
    setEditingSection(section);
    setFormData(settings[section]);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSection('');
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    if (typeof checked === 'boolean') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async () => {
    try {
      await adminService.updateSettings(editingSection, formData);
      setSettings({ ...settings, [editingSection]: formData });
      handleCloseDialog();
    } catch {
      setError('Failed to update settings');
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Settings</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={fetchSettings}
        >
          Refresh
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* School Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center">
                  <SchoolIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">School Information</Typography>
                </Box>
                <IconButton onClick={() => handleOpenDialog('school')} color="primary">
                  <EditIcon />
                </IconButton>
              </Box>
              <Typography variant="body1" gutterBottom>
                <strong>Name:</strong> {settings.school.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Address:</strong> {settings.school.address}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Phone:</strong> {settings.school.phone}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Email:</strong> {settings.school.email}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Website:</strong> {settings.school.website}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Academic Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center">
                  <SchoolIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Academic Settings</Typography>
                </Box>
                <IconButton onClick={() => handleOpenDialog('academic')} color="primary">
                  <EditIcon />
                </IconButton>
              </Box>
              <Typography variant="body1" gutterBottom>
                <strong>Academic Year:</strong> {settings.academic.academicYear}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Term Start:</strong>{' '}
                {new Date(settings.academic.termStartDate).toLocaleDateString()}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Term End:</strong>{' '}
                {new Date(settings.academic.termEndDate).toLocaleDateString()}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Grading System:</strong> {settings.academic.gradingSystem}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Attendance Threshold:</strong>{' '}
                {settings.academic.attendanceThreshold}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center">
                  <SecurityIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Security Settings</Typography>
                </Box>
                <IconButton onClick={() => handleOpenDialog('security')} color="primary">
                  <EditIcon />
                </IconButton>
              </Box>
              <Typography variant="body1" gutterBottom>
                <strong>Password Policy:</strong>
              </Typography>
              <Typography variant="body2" gutterBottom>
                • Minimum Length: {settings.security.passwordPolicy.minLength}
              </Typography>
              <Typography variant="body2" gutterBottom>
                • Require Uppercase: {settings.security.passwordPolicy.requireUppercase ? 'Yes' : 'No'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                • Require Numbers: {settings.security.passwordPolicy.requireNumbers ? 'Yes' : 'No'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                • Require Special Characters:{' '}
                {settings.security.passwordPolicy.requireSpecialChars ? 'Yes' : 'No'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                • Password Expiry: {settings.security.passwordPolicy.expiryDays} days
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Session Timeout:</strong> {settings.security.sessionTimeout} minutes
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Two-Factor Authentication:</strong>{' '}
                {settings.security.twoFactorAuth ? 'Enabled' : 'Disabled'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center">
                  <NotificationsIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Notification Settings</Typography>
                </Box>
                <IconButton onClick={() => handleOpenDialog('notifications')} color="primary">
                  <EditIcon />
                </IconButton>
              </Box>
              <Typography variant="body1" gutterBottom>
                <strong>Email Notifications:</strong>{' '}
                {settings.notifications.emailNotifications ? 'Enabled' : 'Disabled'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>SMS Notifications:</strong>{' '}
                {settings.notifications.smsNotifications ? 'Enabled' : 'Disabled'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Notification Types:</strong>
              </Typography>
              <Typography variant="body2" gutterBottom>
                • Attendance: {settings.notifications.notificationTypes.attendance ? 'Yes' : 'No'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                • Grades: {settings.notifications.notificationTypes.grades ? 'Yes' : 'No'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                • Events: {settings.notifications.notificationTypes.events ? 'Yes' : 'No'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                • Announcements:{' '}
                {settings.notifications.notificationTypes.announcements ? 'Yes' : 'No'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* System Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center">
                  <SystemUpdateIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">System Settings</Typography>
                </Box>
                <IconButton onClick={() => handleOpenDialog('system')} color="primary">
                  <EditIcon />
                </IconButton>
              </Box>
              <Typography variant="body1" gutterBottom>
                <strong>Maintenance Mode:</strong>{' '}
                {settings.system.maintenanceMode ? 'Enabled' : 'Disabled'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Backup Frequency:</strong> {settings.system.backupFrequency}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Data Retention Period:</strong> {settings.system.dataRetentionPeriod}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Theme:</strong> {settings.system.theme}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Language:</strong> {settings.system.language}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Edit {editingSection.charAt(0).toUpperCase() + editingSection.slice(1)} Settings
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {editingSection === 'school' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    name="name"
                    label="School Name"
                    value={formData.name}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="address"
                    label="Address"
                    value={formData.address}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="phone"
                    label="Phone"
                    value={formData.phone}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="email"
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="website"
                    label="Website"
                    value={formData.website}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
              </>
            )}

            {editingSection === 'academic' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="academicYear"
                    label="Academic Year"
                    value={formData.academicYear}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="termStartDate"
                    label="Term Start Date"
                    type="date"
                    value={formData.termStartDate}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="termEndDate"
                    label="Term End Date"
                    type="date"
                    value={formData.termEndDate}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Grading System</InputLabel>
                    <Select
                      name="gradingSystem"
                      value={formData.gradingSystem}
                      onChange={handleChange}
                      required
                    >
                      <MenuItem value="percentage">Percentage</MenuItem>
                      <MenuItem value="letter">Letter Grades</MenuItem>
                      <MenuItem value="gpa">GPA</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="attendanceThreshold"
                    label="Attendance Threshold (%)"
                    type="number"
                    value={formData.attendanceThreshold}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
              </>
            )}

            {editingSection === 'security' && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Password Policy
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="passwordPolicy.minLength"
                    label="Minimum Length"
                    type="number"
                    value={formData.passwordPolicy.minLength}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="passwordPolicy.expiryDays"
                    label="Password Expiry (days)"
                    type="number"
                    value={formData.passwordPolicy.expiryDays}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="passwordPolicy.requireUppercase"
                        checked={formData.passwordPolicy.requireUppercase}
                        onChange={handleChange}
                      />
                    }
                    label="Require Uppercase"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="passwordPolicy.requireNumbers"
                        checked={formData.passwordPolicy.requireNumbers}
                        onChange={handleChange}
                      />
                    }
                    label="Require Numbers"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="passwordPolicy.requireSpecialChars"
                        checked={formData.passwordPolicy.requireSpecialChars}
                        onChange={handleChange}
                      />
                    }
                    label="Require Special Characters"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="sessionTimeout"
                    label="Session Timeout (minutes)"
                    type="number"
                    value={formData.sessionTimeout}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="twoFactorAuth"
                        checked={formData.twoFactorAuth}
                        onChange={handleChange}
                      />
                    }
                    label="Enable Two-Factor Authentication"
                  />
                </Grid>
              </>
            )}

            {editingSection === 'notifications' && (
              <>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="emailNotifications"
                        checked={formData.emailNotifications}
                        onChange={handleChange}
                      />
                    }
                    label="Enable Email Notifications"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="smsNotifications"
                        checked={formData.smsNotifications}
                        onChange={handleChange}
                      />
                    }
                    label="Enable SMS Notifications"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Notification Types
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="notificationTypes.attendance"
                        checked={formData.notificationTypes.attendance}
                        onChange={handleChange}
                      />
                    }
                    label="Attendance Notifications"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="notificationTypes.grades"
                        checked={formData.notificationTypes.grades}
                        onChange={handleChange}
                      />
                    }
                    label="Grade Notifications"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="notificationTypes.events"
                        checked={formData.notificationTypes.events}
                        onChange={handleChange}
                      />
                    }
                    label="Event Notifications"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="notificationTypes.announcements"
                        checked={formData.notificationTypes.announcements}
                        onChange={handleChange}
                      />
                    }
                    label="Announcement Notifications"
                  />
                </Grid>
              </>
            )}

            {editingSection === 'system' && (
              <>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="maintenanceMode"
                        checked={formData.maintenanceMode}
                        onChange={handleChange}
                      />
                    }
                    label="Maintenance Mode"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Backup Frequency</InputLabel>
                    <Select
                      name="backupFrequency"
                      value={formData.backupFrequency}
                      onChange={handleChange}
                      required
                    >
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Data Retention Period</InputLabel>
                    <Select
                      name="dataRetentionPeriod"
                      value={formData.dataRetentionPeriod}
                      onChange={handleChange}
                      required
                    >
                      <MenuItem value="1year">1 Year</MenuItem>
                      <MenuItem value="3years">3 Years</MenuItem>
                      <MenuItem value="5years">5 Years</MenuItem>
                      <MenuItem value="10years">10 Years</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Theme</InputLabel>
                    <Select
                      name="theme"
                      value={formData.theme}
                      onChange={handleChange}
                      required
                    >
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
                      <MenuItem value="system">System Default</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <Select
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      required
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="es">Spanish</MenuItem>
                      <MenuItem value="fr">French</MenuItem>
                      <MenuItem value="de">German</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
          </Grid>
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

export default A_Settings; 