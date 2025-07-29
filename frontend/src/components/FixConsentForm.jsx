import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { Save, Warning } from '@mui/icons-material';
import { consentAPI } from '../services/api';

const FixConsentForm = ({ eventId, onFixed, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    schoolName: '',
    address: '',
    phone: '',
    purpose: '',
    venue: '',
    teacherIncharge: ''
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.schoolName) {
      setSnackbar({
        open: true,
        message: 'Title and School Name are required fields',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      await consentAPI.fixIncompleteForm(eventId, formData);
      setSnackbar({
        open: true,
        message: 'Consent form fixed successfully',
        severity: 'success'
      });
      setTimeout(() => {
        if (onFixed) onFixed();
      }, 2000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to fix consent form',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Warning color="warning" sx={{ mr: 1 }} />
          <Typography variant="h6" color="warning.main">
            Fix Incomplete Consent Form
          </Typography>
        </Box>
        
        <Alert severity="warning" sx={{ mb: 3 }}>
          This consent form is missing required information. Please fill in the missing fields to make it available for parents.
        </Alert>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Event Title *"
              name="title"
              value={formData.title}
              onChange={handleChange}
              variant="outlined"
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="School Name *"
              name="schoolName"
              value={formData.schoolName}
              onChange={handleChange}
              variant="outlined"
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="School Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Venue/Location"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Purpose/Description"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Teacher In-charge"
              name="teacherIncharge"
              value={formData.teacherIncharge}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            onClick={handleSubmit}
            disabled={loading || !formData.title || !formData.schoolName}
          >
            {loading ? 'Fixing...' : 'Fix Consent Form'}
          </Button>
        </Box>
      </Paper>

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

export default FixConsentForm; 