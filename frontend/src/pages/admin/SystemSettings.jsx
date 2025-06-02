import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';

function SystemSettings() {
  const [schoolInfo, setSchoolInfo] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    principalName: '',
    establishedYear: '',
  });

  const [systemSettings, setSystemSettings] = useState({
    enableNotifications: true,
    enableAttendanceTracking: true,
    enableFeeReminders: true,
    enableGradeReports: true,
    enableParentPortal: true,
    enableStaffPortal: true,
    enableStudentPortal: true,
  });

  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: () => adminAPI.getSystemSettings(),
  });

  const updateSchoolInfoMutation = useMutation({
    mutationFn: adminAPI.updateSchoolInfo,
    onSuccess: () => {
      queryClient.invalidateQueries(['systemSettings']);
      toast.success('School information updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update school information');
    },
  });

  const updateSystemSettingsMutation = useMutation({
    mutationFn: adminAPI.updateSystemSettings,
    onSuccess: () => {
      queryClient.invalidateQueries(['systemSettings']);
      toast.success('System settings updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update system settings');
    },
  });

  const handleSchoolInfoChange = (e) => {
    const { name, value } = e.target;
    setSchoolInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSystemSettingsChange = (e) => {
    const { name, checked } = e.target;
    setSystemSettings((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSchoolInfoSubmit = (e) => {
    e.preventDefault();
    updateSchoolInfoMutation.mutate(schoolInfo);
  };

  const handleSystemSettingsSubmit = (e) => {
    e.preventDefault();
    updateSystemSettingsMutation.mutate(systemSettings);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        System Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                School Information
              </Typography>
              <form onSubmit={handleSchoolInfoSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="School Name"
                      name="name"
                      value={schoolInfo.name}
                      onChange={handleSchoolInfoChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      name="address"
                      value={schoolInfo.address}
                      onChange={handleSchoolInfoChange}
                      multiline
                      rows={2}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={schoolInfo.phone}
                      onChange={handleSchoolInfoChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={schoolInfo.email}
                      onChange={handleSchoolInfoChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Website"
                      name="website"
                      value={schoolInfo.website}
                      onChange={handleSchoolInfoChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Principal Name"
                      name="principalName"
                      value={schoolInfo.principalName}
                      onChange={handleSchoolInfoChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Established Year"
                      name="establishedYear"
                      type="number"
                      value={schoolInfo.establishedYear}
                      onChange={handleSchoolInfoChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={updateSchoolInfoMutation.isPending}
                    >
                      Update School Information
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                System Configuration
              </Typography>
              <form onSubmit={handleSystemSettingsSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={systemSettings.enableNotifications}
                          onChange={handleSystemSettingsChange}
                          name="enableNotifications"
                        />
                      }
                      label="Enable Notifications"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={systemSettings.enableAttendanceTracking}
                          onChange={handleSystemSettingsChange}
                          name="enableAttendanceTracking"
                        />
                      }
                      label="Enable Attendance Tracking"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={systemSettings.enableFeeReminders}
                          onChange={handleSystemSettingsChange}
                          name="enableFeeReminders"
                        />
                      }
                      label="Enable Fee Reminders"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={systemSettings.enableGradeReports}
                          onChange={handleSystemSettingsChange}
                          name="enableGradeReports"
                        />
                      }
                      label="Enable Grade Reports"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                      Portal Access
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={systemSettings.enableParentPortal}
                          onChange={handleSystemSettingsChange}
                          name="enableParentPortal"
                        />
                      }
                      label="Enable Parent Portal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={systemSettings.enableStaffPortal}
                          onChange={handleSystemSettingsChange}
                          name="enableStaffPortal"
                        />
                      }
                      label="Enable Staff Portal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={systemSettings.enableStudentPortal}
                          onChange={handleSystemSettingsChange}
                          name="enableStudentPortal"
                        />
                      }
                      label="Enable Student Portal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={updateSystemSettingsMutation.isPending}
                    >
                      Update System Settings
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SystemSettings; 