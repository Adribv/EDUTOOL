import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, Grid, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar
} from '@mui/material';
import { api } from '../../services/api';

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

const A_ServiceRequests = () => {
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Staff Duty Allocation / Roster Form</Typography>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="Date" name="date" type="date" value={form.date} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Day" name="day" value={form.day} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Staff Name" name="staffName" value={form.staffName} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Duty Type" name="dutyType" value={form.dutyType} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Activities Details" name="activitiesDetails" value={form.activitiesDetails} onChange={handleChange} fullWidth multiline rows={2} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="From Date & Time" name="fromDateTime" type="datetime-local" value={form.fromDateTime} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="To Date & Time" name="toDateTime" type="datetime-local" value={form.toDateTime} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Time Slot / Period" name="timeSlot" value={form.timeSlot} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Location / Area" name="location" value={form.location} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Auto Reminder" name="autoReminder" value={form.autoReminder} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Backup Assigned" name="backupAssigned" value={form.backupAssigned} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Remarks" name="remarks" value={form.remarks} onChange={handleChange} fullWidth multiline rows={2} />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary" disabled={loading} fullWidth>
                  {loading ? 'Submitting...' : 'Submit Service Request'}
                </Button>
              </Grid>
            </Grid>
          </form>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        </CardContent>
      </Card>
      <Typography variant="h5" gutterBottom>Recent Service Requests</Typography>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Staff Name</TableCell>
              <TableCell>Duty Type</TableCell>
              <TableCell>From</TableCell>
              <TableCell>To</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Current Approver</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(Array.isArray(requests) ? requests : []).map((req) => (
              <TableRow key={req._id}>
                <TableCell>{req.requestData?.date}</TableCell>
                <TableCell>{req.requestData?.staffName}</TableCell>
                <TableCell>{req.requestData?.dutyType}</TableCell>
                <TableCell>{req.requestData?.fromDateTime ? new Date(req.requestData.fromDateTime).toLocaleString() : '-'}</TableCell>
                <TableCell>{req.requestData?.toDateTime ? new Date(req.requestData.toDateTime).toLocaleString() : '-'}</TableCell>
                <TableCell>{req.requestData?.location}</TableCell>
                <TableCell>{req.status}</TableCell>
                <TableCell>{req.currentApprover}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default A_ServiceRequests; 