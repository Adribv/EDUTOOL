import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Save as SaveIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    school: {
      name: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      logo: '',
      motto: '',
    },
    academic: {
      academicYear: '',
      termStartDate: '',
      termEndDate: '',
      gradingSystem: 'percentage', // percentage or letter
      passingGrade: '',
      maxStudentsPerClass: '',
      attendanceThreshold: '',
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      attendanceAlerts: true,
      examResultsAlerts: true,
      feeDueAlerts: true,
      eventReminders: true,
    },
    system: {
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      theme: 'light',
      maintenanceMode: false,
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminAPI.updateSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      fetchSettings();
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">System Settings</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
            sx={{ mr: 2 }}
          >
            Reset to Default
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* School Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              avatar={<SchoolIcon color="primary" />}
              title="School Information"
              action={
                <Tooltip title="Edit School Details">
                  <IconButton>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="School Name"
                    value={settings.school.name}
                    onChange={(e) =>
                      handleInputChange('school', 'name', e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={settings.school.address}
                    onChange={(e) =>
                      handleInputChange('school', 'address', e.target.value)
                    }
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={settings.school.phone}
                    onChange={(e) =>
                      handleInputChange('school', 'phone', e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={settings.school.email}
                    onChange={(e) =>
                      handleInputChange('school', 'email', e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Website"
                    value={settings.school.website}
                    onChange={(e) =>
                      handleInputChange('school', 'website', e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="School Motto"
                    value={settings.school.motto}
                    onChange={(e) =>
                      handleInputChange('school', 'motto', e.target.value)
                    }
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Academic Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              avatar={<CalendarIcon color="primary" />}
              title="Academic Settings"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Academic Year"
                    value={settings.academic.academicYear}
                    onChange={(e) =>
                      handleInputChange('academic', 'academicYear', e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Term Start Date"
                    type="date"
                    value={settings.academic.termStartDate}
                    onChange={(e) =>
                      handleInputChange('academic', 'termStartDate', e.target.value)
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Term End Date"
                    type="date"
                    value={settings.academic.termEndDate}
                    onChange={(e) =>
                      handleInputChange('academic', 'termEndDate', e.target.value)
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Grading System"
                    value={settings.academic.gradingSystem}
                    onChange={(e) =>
                      handleInputChange('academic', 'gradingSystem', e.target.value)
                    }
                  >
                    <MenuItem value="percentage">Percentage</MenuItem>
                    <MenuItem value="letter">Letter Grade</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Passing Grade"
                    type="number"
                    value={settings.academic.passingGrade}
                    onChange={(e) =>
                      handleInputChange('academic', 'passingGrade', e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Max Students Per Class"
                    type="number"
                    value={settings.academic.maxStudentsPerClass}
                    onChange={(e) =>
                      handleInputChange(
                        'academic',
                        'maxStudentsPerClass',
                        e.target.value
                      )
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Attendance Threshold (%)"
                    type="number"
                    value={settings.academic.attendanceThreshold}
                    onChange={(e) =>
                      handleInputChange(
                        'academic',
                        'attendanceThreshold',
                        e.target.value
                      )
                    }
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              avatar={<NotificationsIcon color="primary" />}
              title="Notification Settings"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.emailNotifications}
                        onChange={(e) =>
                          handleInputChange(
                            'notifications',
                            'emailNotifications',
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Email Notifications"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.smsNotifications}
                        onChange={(e) =>
                          handleInputChange(
                            'notifications',
                            'smsNotifications',
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="SMS Notifications"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.attendanceAlerts}
                        onChange={(e) =>
                          handleInputChange(
                            'notifications',
                            'attendanceAlerts',
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Attendance Alerts"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.examResultsAlerts}
                        onChange={(e) =>
                          handleInputChange(
                            'notifications',
                            'examResultsAlerts',
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Exam Results Alerts"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.feeDueAlerts}
                        onChange={(e) =>
                          handleInputChange(
                            'notifications',
                            'feeDueAlerts',
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Fee Due Alerts"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.eventReminders}
                        onChange={(e) =>
                          handleInputChange(
                            'notifications',
                            'eventReminders',
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Event Reminders"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* System Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              avatar={<SettingsIcon color="primary" />}
              title="System Settings"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Language"
                    value={settings.system.language}
                    onChange={(e) =>
                      handleInputChange('system', 'language', e.target.value)
                    }
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Timezone"
                    value={settings.system.timezone}
                    onChange={(e) =>
                      handleInputChange('system', 'timezone', e.target.value)
                    }
                  >
                    <MenuItem value="UTC">UTC</MenuItem>
                    <MenuItem value="EST">EST</MenuItem>
                    <MenuItem value="PST">PST</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Date Format"
                    value={settings.system.dateFormat}
                    onChange={(e) =>
                      handleInputChange('system', 'dateFormat', e.target.value)
                    }
                  >
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Time Format"
                    value={settings.system.timeFormat}
                    onChange={(e) =>
                      handleInputChange('system', 'timeFormat', e.target.value)
                    }
                  >
                    <MenuItem value="12h">12-hour</MenuItem>
                    <MenuItem value="24h">24-hour</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Theme"
                    value={settings.system.theme}
                    onChange={(e) =>
                      handleInputChange('system', 'theme', e.target.value)
                    }
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="system">System</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.system.maintenanceMode}
                        onChange={(e) =>
                          handleInputChange(
                            'system',
                            'maintenanceMode',
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Maintenance Mode"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={saving}
        message="Saving settings..."
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
};

export default Settings; 