import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { ArrowBack, Save, Preview } from '@mui/icons-material';
import { adminAPI, consentAPI } from '../../services/api';

const EventConsentForm = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showPreview, setShowPreview] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    schoolName: '',
    address: '',
    phone: '',
    title: '',
    purpose: '',
    dateFrom: '',
    dateTo: '',
    departureTime: '',
    returnTime: '',
    venue: '',
    transportMode: '',
    teacherIncharge: '',
    teacherContact: ''
  });

  // Fetch event details
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      try {
        // First try to get from calendar (approved events)
        const response = await adminAPI.getEvent(eventId);
        return response.data || response;
      } catch (error) {
        if (error.response?.status === 404) {
          // If not found in calendar, try to get from approval requests
          try {
            const approvals = await adminAPI.getApprovalRequests({ requestType: 'Event' });
            const approval = approvals.find(a => a._id === eventId);
            if (approval) {
              // Map approval data to event format
              return {
                _id: approval._id,
                title: approval.title,
                description: approval.description,
                date: approval.requestData?.startDate ? new Date(approval.requestData.startDate).toISOString().split('T')[0] : '',
                venue: approval.requestData?.venue || approval.requestData?.location || '',
                organizer: approval.requestData?.organizer || '',
                status: approval.status
              };
            }
          } catch (approvalError) {
            console.error('Error fetching from approvals:', approvalError);
          }
        }
        throw error;
      }
    }
  });

  // Fetch existing consent form
  const { data: existingForm, isLoading: formLoading } = useQuery({
    queryKey: ['consentForm', eventId],
    queryFn: async () => {
      try {
        return await consentAPI.getForm(eventId);
      } catch (error) {
        if (error.response?.status === 404) {
          return null; // No form exists yet
        }
        throw error;
      }
    }
  });

  // Save consent form template
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (existingForm) {
        return await consentAPI.updateTemplate(eventId, data);
      } else {
        return await consentAPI.createTemplate(eventId, data);
      }
    },
    onSuccess: () => {
      setSnackbar({ open: true, message: 'Consent form template saved successfully', severity: 'success' });
      queryClient.invalidateQueries(['consentForm', eventId]);
    },
    onError: (error) => {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to save consent form', 
        severity: 'error' 
      });
    }
  });

  // Pre-fill form with event data and existing form data
  useEffect(() => {
    if (event) {
      setFormData(prev => ({
        ...prev,
        title: event.title || '',
        purpose: event.description || '',
        dateFrom: event.date || '',
        dateTo: event.endDate || event.date || '',
        venue: event.venue || event.location || '',
        teacherIncharge: event.organizer || ''
      }));
    }
  }, [event]);

  useEffect(() => {
    if (existingForm) {
      setFormData(prev => ({
        ...prev,
        ...existingForm
      }));
    }
  }, [existingForm]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const handlePreview = () => {
    setShowPreview(!showPreview);
  };

  if (eventLoading || formLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!event) {
    return (
      <Box p={3}>
        <Alert severity="error">Event not found</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/events')}
          sx={{ mr: 2 }}
        >
          Back to Events
        </Button>
        <Typography variant="h4">
          Consent Form Template - {event.title}
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Box display="flex" gap={2} mb={3}>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
          disabled={saveMutation.isLoading}
        >
          {saveMutation.isLoading ? 'Saving...' : 'Save Template'}
        </Button>
        <Button
          variant="outlined"
          startIcon={<Preview />}
          onClick={handlePreview}
        >
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Form Editor */}
        <Grid item xs={12} md={showPreview ? 6 : 12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              School Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="School Name"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  variant="outlined"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Event/Trip Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title of Event/Trip"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Purpose/Objective"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  variant="outlined"
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="From Date"
                  name="dateFrom"
                  type="date"
                  value={formData.dateFrom}
                  onChange={handleChange}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="To Date"
                  name="dateTo"
                  type="date"
                  value={formData.dateTo}
                  onChange={handleChange}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Departure Time"
                  name="departureTime"
                  type="time"
                  value={formData.departureTime}
                  onChange={handleChange}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Return Time"
                  name="returnTime"
                  type="time"
                  value={formData.returnTime}
                  onChange={handleChange}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
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
                  label="Mode of Transport"
                  name="transportMode"
                  value={formData.transportMode}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teacher In-charge"
                  name="teacherIncharge"
                  value={formData.teacherIncharge}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teacher Contact"
                  name="teacherContact"
                  value={formData.teacherContact}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Preview */}
        {showPreview && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Preview
              </Typography>
              <Box sx={{ border: '1px solid #ddd', p: 2, backgroundColor: '#f9f9f9' }}>
                <Typography variant="h6" align="center" gutterBottom>
                  Parent/Guardian Consent Form for School Trip/Event
                </Typography>
                
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>School Details</Typography>
                <Typography variant="body2">School Name: {formData.schoolName}</Typography>
                <Typography variant="body2">Address: {formData.address}</Typography>
                <Typography variant="body2">Phone Number: {formData.phone}</Typography>
                
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Event/Trip Details</Typography>
                <Typography variant="body2">Title of Event/Trip: {formData.title}</Typography>
                <Typography variant="body2">Purpose/Objective: {formData.purpose}</Typography>
                <Typography variant="body2">Date(s): {formData.dateFrom} to {formData.dateTo}</Typography>
                <Typography variant="body2">Departure Time: {formData.departureTime}</Typography>
                <Typography variant="body2">Return Time: {formData.returnTime}</Typography>
                <Typography variant="body2">Venue/Location: {formData.venue}</Typography>
                <Typography variant="body2">Mode of Transport: {formData.transportMode}</Typography>
                <Typography variant="body2">Teacher In-charge: {formData.teacherIncharge}</Typography>
                <Typography variant="body2">Contact: {formData.teacherContact}</Typography>
                
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Student Details</Typography>
                <Typography variant="body2">Full Name: _______________</Typography>
                <Typography variant="body2">Grade/Class & Section: _______________</Typography>
                <Typography variant="body2">Roll Number: _______________</Typography>
                
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Parent/Guardian Information</Typography>
                <Typography variant="body2">Name: _______________</Typography>
                <Typography variant="body2">Relationship to Student: _______________</Typography>
                <Typography variant="body2">Mobile Number: _______________</Typography>
                <Typography variant="body2">Emergency Contact: _______________</Typography>
                
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Health & Safety Information</Typography>
                <Typography variant="body2">Known Allergies/Medical Conditions: _______________</Typography>
                <Typography variant="body2">Medications to be administered: _______________</Typography>
                
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Consent Declaration</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                  I, the undersigned, parent/guardian of the above-named student, hereby grant
                  permission for my child to attend and participate in the aforementioned school
                  trip/event. I acknowledge that I have been informed about the purpose, schedule,
                  transportation, and supervision provided.
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', mt: 1 }}>
                  I agree that my child will follow all school rules and authorize the school staff to
                  take necessary action in case of medical emergency.
                </Typography>
                
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Signatures</Typography>
                <Typography variant="body2">Parent/Guardian Name: _______________</Typography>
                <Typography variant="body2">Signature: _______________</Typography>
                <Typography variant="body2">Date: _______________</Typography>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Snackbar */}
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

export default EventConsentForm; 