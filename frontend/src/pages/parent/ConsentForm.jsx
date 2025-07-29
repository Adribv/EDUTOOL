import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Snackbar,
  Card,
  CardContent
} from '@mui/material';
import { ArrowBack, Save, Clear, ContactSupport } from '@mui/icons-material';
import { consentAPI } from '../../services/api';
import FixConsentForm from '../../components/FixConsentForm';

const ConsentForm = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showFixForm, setShowFixForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    studentName: '',
    classSection: '',
    rollNumber: '',
    parentName: '',
    relationship: '',
    mobile: '',
    emergencyContact: '',
    allergies: '',
    medication: '',
    parentSignature: ''
  });

  // Fetch consent form template
  const { data: consentForm, isLoading, error, refetch } = useQuery({
    queryKey: ['consentForm', eventId],
    queryFn: () => consentAPI.getForm(eventId),
    retry: false
  });

  // Submit filled form
  const submitMutation = useMutation({
    mutationFn: (data) => consentAPI.parentFill(eventId, data),
    onSuccess: () => {
      setSnackbar({ open: true, message: 'Consent form submitted successfully', severity: 'success' });
      setTimeout(() => navigate('/parent/dashboard'), 2000);
    },
    onError: (error) => {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to submit consent form', 
        severity: 'error' 
      });
    }
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!formData.parentSignature) {
      setSnackbar({ open: true, message: 'Please provide your signature', severity: 'error' });
      return;
    }
    submitMutation.mutate(formData);
  };

  // Signature canvas handling
  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const signatureData = canvas.toDataURL();
      setFormData({ ...formData, parentSignature: signatureData });
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setFormData({ ...formData, parentSignature: '' });
  };

  // Initialize canvas
  useEffect(() => {
    const initializeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
    };

    // Add a small delay to ensure DOM is fully rendered
    const timer = setTimeout(initializeCanvas, 100);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  // Handle incomplete form error
  if (error?.response?.status === 400 && error?.response?.data?.message?.includes('incomplete')) {
    return (
      <Box p={3}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/parent/dashboard')}
            sx={{ mr: 2 }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h4">
            Consent Form Issue
          </Typography>
        </Box>

        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Consent form data is incomplete
          </Typography>
          <Typography variant="body2" paragraph>
            The consent form for this event is missing required information. This prevents parents from filling out the form.
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Missing fields:</strong> {error.response.data.missingFields?.title ? 'Event Title, ' : ''}{error.response.data.missingFields?.schoolName ? 'School Name' : ''}
          </Typography>
          <Typography variant="body2">
            Please contact the school administration to fix this issue, or if you have admin access, you can fix it below.
          </Typography>
        </Alert>

        <Box display="flex" gap={2} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<ContactSupport />}
            onClick={() => navigate('/parent/dashboard')}
          >
            Contact School Administration
          </Button>
          <Button
            variant="contained"
            onClick={() => setShowFixForm(true)}
          >
            Fix Form (Admin Only)
          </Button>
        </Box>

        {showFixForm && (
          <Box mt={3}>
            <FixConsentForm
              eventId={eventId}
              onFixed={() => {
                setShowFixForm(false);
                refetch();
              }}
              onCancel={() => setShowFixForm(false)}
            />
          </Box>
        )}
      </Box>
    );
  }

  if (error || !consentForm) {
    return (
      <Box p={3}>
        <Alert severity="error">
          {error?.response?.data?.message || 'Consent form not found or not available'}
        </Alert>
        <Button
          variant="outlined"
          onClick={() => navigate('/parent/dashboard')}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  // Check if consent form has required data (redundant check, but kept for safety)
  if (!consentForm.title || !consentForm.schoolName) {
    return (
      <Box p={3}>
        <Alert severity="warning">
          Consent form data is incomplete. Please contact the school administration.
        </Alert>
        <Button
          variant="outlined"
          onClick={() => navigate('/parent/dashboard')}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  if (consentForm.status === 'completed') {
    return (
      <Box p={3}>
        <Alert severity="info">
          You have already submitted the consent form for this event.
        </Alert>
        <Button
          variant="outlined"
          onClick={() => navigate('/parent/dashboard')}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/parent/dashboard')}
          sx={{ mr: 2 }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4">
          Consent Form - {consentForm.title}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Event Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Event Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2"><strong>School:</strong> {consentForm.schoolName}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2"><strong>Address:</strong> {consentForm.address}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2"><strong>Phone:</strong> {consentForm.phone}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2"><strong>Event Title:</strong> {consentForm.title}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2"><strong>Purpose:</strong> {consentForm.purpose}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2"><strong>From:</strong> {consentForm.dateFrom ? new Date(consentForm.dateFrom).toLocaleDateString() : 'Not specified'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2"><strong>To:</strong> {consentForm.dateTo ? new Date(consentForm.dateTo).toLocaleDateString() : 'Not specified'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2"><strong>Departure:</strong> {consentForm.departureTime}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2"><strong>Return:</strong> {consentForm.returnTime}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2"><strong>Venue:</strong> {consentForm.venue}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2"><strong>Transport:</strong> {consentForm.transportMode}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2"><strong>Teacher In-charge:</strong> {consentForm.teacherIncharge}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2"><strong>Contact:</strong> {consentForm.teacherContact}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Parent/Student Details Form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Student Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Student Full Name"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Class & Section"
                  name="classSection"
                  value={formData.classSection}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Roll Number"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom color="primary">
              Parent/Guardian Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Parent/Guardian Name"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Relationship to Student"
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mobile Number"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Emergency Contact"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom color="primary">
              Health & Safety Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Known Allergies/Medical Conditions"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  placeholder="Please list any allergies or medical conditions"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Medications to be administered"
                  name="medication"
                  value={formData.medication}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  placeholder="Please list any medications that need to be administered"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Consent Declaration and Signature */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Consent Declaration
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              I, the undersigned, parent/guardian of the above-named student, hereby grant
              permission for my child to attend and participate in the aforementioned school
              trip/event. I acknowledge that I have been informed about the purpose, schedule,
              transportation, and supervision provided.
              <br /><br />
              I agree that my child will follow all school rules and authorize the school staff to
              take necessary action in case of medical emergency.
            </Typography>

            <Typography variant="h6" gutterBottom color="primary">
              Signature
            </Typography>
            <Box sx={{ border: '1px solid #ccc', borderRadius: 1, p: 2, mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Please sign below:
              </Typography>
              <canvas
                ref={canvasRef}
                width={400}
                height={150}
                style={{ border: '1px solid #ddd', cursor: 'crosshair', width: '100%', maxWidth: '400px' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={(e) => {
                  e.preventDefault();
                  const touch = e.touches[0];
                  const mouseEvent = new MouseEvent('mousedown', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                  });
                  startDrawing(mouseEvent);
                }}
                onTouchMove={(e) => {
                  e.preventDefault();
                  const touch = e.touches[0];
                  const mouseEvent = new MouseEvent('mousemove', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                  });
                  draw(mouseEvent);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  stopDrawing();
                }}
              />
              <Box sx={{ mt: 1 }}>
                <Button
                  size="small"
                  startIcon={<Clear />}
                  onClick={clearSignature}
                  variant="outlined"
                >
                  Clear Signature
                </Button>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/parent/dashboard')}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSubmit}
                disabled={submitMutation.isLoading}
              >
                {submitMutation.isLoading ? 'Submitting...' : 'Submit Consent Form'}
              </Button>
            </Box>
          </Paper>
        </Grid>
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

export default ConsentForm; 