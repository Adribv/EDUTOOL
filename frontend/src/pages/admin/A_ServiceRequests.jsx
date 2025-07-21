import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  Box, 
  Typography, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Grid, 
  Alert, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Snackbar,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  LocalShipping as TransportIcon,
  Warning as WarningIcon,
  RateReview as RateReviewIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';

// Lazy load the components for better performance
const TransportFormsManagement = lazy(() => import('./TransportFormsManagement'));
const DisciplinaryFormsManagement = lazy(() => import('./DisciplinaryFormsManagement'));
const TeacherRemarks = lazy(() => import('./TeacherRemarks'));

const initialForm = {
  date: '',
  day: '',
  staffName: '',
  dutyType: '',
  activitiesDetails: '',
  fromDateTime: '',
  toDateTime: '',
  timeSlot: '',
  location: '',
  autoReminder: '',
  backupAssigned: '',
  remarks: ''
};

// Staff Duty Allocation Component (original functionality)
const StaffDutyAllocation = () => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [requests, setRequests] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/admin-staff/approvals?requestType=ServiceRequest');
      setRequests(res.data || []);
    } catch {
      setRequests([]);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/admin-staff/service-requests', form);
      setSuccess('Service request submitted for VP approval.');
      setSnackbar({ open: true, message: 'Service request submitted for VP approval.', severity: 'success' });
      setForm(initialForm);
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to submit request', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Staff Duty Allocation / Roster Form
      </Typography>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Date" 
                  name="date" 
                  type="date" 
                  value={form.date} 
                  onChange={handleChange} 
                  fullWidth 
                  InputLabelProps={{ shrink: true }} 
                  required 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Day" 
                  name="day" 
                  value={form.day} 
                  onChange={handleChange} 
                  fullWidth 
                  required 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Staff Name" 
                  name="staffName" 
                  value={form.staffName} 
                  onChange={handleChange} 
                  fullWidth 
                  required 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Duty Type" 
                  name="dutyType" 
                  value={form.dutyType} 
                  onChange={handleChange} 
                  fullWidth 
                  required 
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  label="Activities Details" 
                  name="activitiesDetails" 
                  value={form.activitiesDetails} 
                  onChange={handleChange} 
                  fullWidth 
                  multiline 
                  rows={2} 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="From Date & Time" 
                  name="fromDateTime" 
                  type="datetime-local" 
                  value={form.fromDateTime} 
                  onChange={handleChange} 
                  fullWidth 
                  InputLabelProps={{ shrink: true }} 
                  required 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="To Date & Time" 
                  name="toDateTime" 
                  type="datetime-local" 
                  value={form.toDateTime} 
                  onChange={handleChange} 
                  fullWidth 
                  InputLabelProps={{ shrink: true }} 
                  required 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Time Slot / Period" 
                  name="timeSlot" 
                  value={form.timeSlot} 
                  onChange={handleChange} 
                  fullWidth 
                  required 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Location / Area" 
                  name="location" 
                  value={form.location} 
                  onChange={handleChange} 
                  fullWidth 
                  required 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Auto Reminder" 
                  name="autoReminder" 
                  value={form.autoReminder} 
                  onChange={handleChange} 
                  fullWidth 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Backup Assigned" 
                  name="backupAssigned" 
                  value={form.backupAssigned} 
                  onChange={handleChange} 
                  fullWidth 
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  label="Remarks" 
                  name="remarks" 
                  value={form.remarks} 
                  onChange={handleChange} 
                  fullWidth 
                  multiline 
                  rows={2} 
                />
              </Grid>
              <Grid item xs={12}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={loading} 
                  sx={{ px: 4, py: 1.5 }}
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Requests Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Recent Service Requests</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Staff Name</TableCell>
                  <TableCell>Duty Type</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request, index) => (
                  <TableRow key={index}>
                    <TableCell>{request.date}</TableCell>
                    <TableCell>{request.staffName}</TableCell>
                    <TableCell>{request.dutyType}</TableCell>
                    <TableCell>{request.location}</TableCell>
                    <TableCell>{request.status || 'Pending'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Loading component
const LoadingSpinner = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="400px"
  >
    <CircularProgress />
  </Box>
);

// Main Service Requests Component with Tabs
const A_ServiceRequests = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <StaffDutyAllocation />;
      case 1:
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <TransportFormsManagement />
          </Suspense>
        );
      case 2:
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <DisciplinaryFormsManagement />
          </Suspense>
        );
      case 3:
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <TeacherRemarks />
          </Suspense>
        );
      default:
        return <StaffDutyAllocation />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            fontWeight: 700, 
            mb: 1,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Service Requests Management
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ mb: 4 }}
        >
          Manage all service requests including staff duties, transport forms, disciplinary forms, and syllabus completion
        </Typography>
      </motion.div>

      {/* Tabs Navigation */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab 
            label="Staff Duty Allocation" 
            icon={<AssignmentIcon />} 
            iconPosition="start"
            sx={{ minHeight: 64 }}
          />
          <Tab 
            label="Transport Forms" 
            icon={<TransportIcon />} 
            iconPosition="start"
            sx={{ minHeight: 64 }}
          />
          <Tab 
            label="Disciplinary Forms" 
            icon={<WarningIcon />} 
            iconPosition="start"
            sx={{ minHeight: 64 }}
          />
          <Tab 
            label="Syllabus Completion" 
            icon={<RateReviewIcon />} 
            iconPosition="start"
            sx={{ minHeight: 64 }}
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default A_ServiceRequests; 