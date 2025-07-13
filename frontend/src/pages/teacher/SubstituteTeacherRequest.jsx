import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, Grid, Alert, Snackbar, Link
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { api } from '../../services/api';

const initialForm = {
  requestDate: '',
  absentTeacherName: '',
  department: '',
  reasonForAbsence: '',
  absenceFrom: '',
  absenceTo: '',
  periods: '',
  classes: '',
  suggestedSubstitute: '',
  remarks: '',
};

const SubstituteTeacherRequest = () => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/teacher/substitute-requests', form);
      setSuccess('Substitute teacher request submitted for VP approval.');
      setSnackbar({ open: true, message: 'Request submitted for VP approval.', severity: 'success' });
      setForm(initialForm);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to submit request', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>Substitute Teacher Request Form</Typography>
        <Button
          component={RouterLink}
          to="/teacher/substitute-requests"
          variant="outlined"
          color="primary"
        >
          View My Requests & Status
        </Button>
      </Box>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="Request Date" name="requestDate" type="date" value={form.requestDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Absent Teacher Name" name="absentTeacherName" value={form.absentTeacherName} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Department / Subject" name="department" value={form.department} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Reason for Absence" name="reasonForAbsence" value={form.reasonForAbsence} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Absence From" name="absenceFrom" type="date" value={form.absenceFrom} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Absence To" name="absenceTo" type="date" value={form.absenceTo} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Period(s) to be Covered" name="periods" value={form.periods} onChange={handleChange} fullWidth required helperText="e.g., 1st, 3rd, 5th" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Class(es) & Section(s)" name="classes" value={form.classes} onChange={handleChange} fullWidth required helperText="e.g., Class 6A, Class 7C" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Suggested Substitute Teacher(s)" name="suggestedSubstitute" value={form.suggestedSubstitute} onChange={handleChange} fullWidth helperText="Name(s) if known or preferred" />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Remarks" name="remarks" value={form.remarks} onChange={handleChange} fullWidth multiline rows={2} helperText="Any extra info (e.g., exam coverage, urgent)" />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary" disabled={loading} fullWidth>
                  {loading ? 'Submitting...' : 'Submit Substitute Request'}
                </Button>
              </Grid>
            </Grid>
          </form>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        </CardContent>
      </Card>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SubstituteTeacherRequest; 