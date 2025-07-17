import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
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
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Clear,
  Warning,
  CheckCircle,
  Person,
  Description,
  Gavel,
  Assignment
} from '@mui/icons-material';
import { disciplinaryAPI } from '../../services/api';

const DisciplinaryFormAcknowledge = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [comments, setComments] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Fetch form details
  const { data: form, isLoading, error } = useQuery({
    queryKey: ['disciplinaryForm', formId],
    queryFn: () => disciplinaryAPI.getFormById(formId)
  });

  // Submit acknowledgment mutation
  const acknowledgeMutation = useMutation({
    mutationFn: (data) => disciplinaryAPI.studentAcknowledge(formId, data),
    onSuccess: () => {
      setSnackbar({ open: true, message: 'Form acknowledged successfully', severity: 'success' });
      setTimeout(() => navigate('/student/disciplinary-forms'), 2000);
    },
    onError: (error) => {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to acknowledge form', 
        severity: 'error' 
      });
    }
  });

  // Canvas drawing functions
  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSubmit = () => {
    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL();
    
    // Check if signature is empty
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const isEmpty = imageData.data.every(pixel => pixel === 0);
    
    if (isEmpty) {
      setSnackbar({ 
        open: true, 
        message: 'Please provide your signature before submitting', 
        severity: 'error' 
      });
      return;
    }

    setConfirmDialogOpen(true);
  };

  const confirmSubmit = () => {
    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL();
    
    acknowledgeMutation.mutate({
      signature: signatureData,
      comments: comments
    });
    
    setConfirmDialogOpen(false);
  };

  const getMisconductTypeLabel = (key) => {
    const labels = {
      disruptiveBehaviorInClass: 'Disruptive behavior in class',
      disrespectTowardStaff: 'Disrespect toward staff or students',
      physicalAggression: 'Physical aggression/fighting',
      inappropriateLanguage: 'Use of inappropriate language',
      bullyingHarassment: 'Bullying/harassment',
      vandalism: 'Vandalism/property damage',
      cheatingAcademicDishonesty: 'Cheating/academic dishonesty',
      skippingClassesWithoutPermission: 'Skipping classes without permission',
      other: 'Other'
    };
    return labels[key] || key;
  };

  const getActionTakenLabel = (key) => {
    const labels = {
      verbalWarning: 'Verbal warning',
      writtenWarning: 'Written warning',
      parentNotification: 'Parent/guardian notified',
      counselingReferral: 'Counseling referral',
      detention: 'Detention',
      other: 'Other'
    };
    return labels[key] || key;
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !form) {
    return (
      <Box p={3}>
        <Alert severity="error">
          {error?.response?.data?.message || 'Disciplinary form not found'}
        </Alert>
      </Box>
    );
  }

  if (form.studentAcknowledgment?.acknowledged) {
    return (
      <Box p={3}>
        <Alert severity="info" icon={<CheckCircle />}>
          You have already acknowledged this disciplinary form on {new Date(form.studentAcknowledgment.date).toLocaleDateString()}.
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/student/disciplinary-forms')}
          sx={{ mt: 2 }}
        >
          Back to Forms
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
          onClick={() => navigate('/student/disciplinary-forms')}
          sx={{ mr: 2 }}
        >
          Back to Forms
        </Button>
        <Typography variant="h4" display="flex" alignItems="center">
          <Warning sx={{ mr: 2, color: 'warning.main' }} />
          Disciplinary Form Acknowledgment
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Form Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" align="center" gutterBottom>
              Student Disciplinary Action Form
            </Typography>
            
            {/* School Information */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                  <Assignment sx={{ mr: 1 }} />
                  School Information
                </Typography>
                <Typography variant="body2">School Name: {form.schoolName}</Typography>
                <Typography variant="body2">Date: {new Date(form.date).toLocaleDateString()}</Typography>
                <Typography variant="body2">Warning Number: {form.warningNumber}</Typography>
              </CardContent>
            </Card>

            {/* Student Information */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                  <Person sx={{ mr: 1 }} />
                  Student Information
                </Typography>
                <Typography variant="body2">Full Name: {form.studentName}</Typography>
                <Typography variant="body2">Grade/Class: {form.grade}</Typography>
                <Typography variant="body2">Section: {form.section}</Typography>
                <Typography variant="body2">Roll Number: {form.rollNumber}</Typography>
                <Typography variant="body2">Parent/Guardian Name: {form.parentGuardianName}</Typography>
                <Typography variant="body2">Contact Number: {form.contactNumber}</Typography>
              </CardContent>
            </Card>

            {/* Incident Details */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                  <Description sx={{ mr: 1 }} />
                  Incident Details
                </Typography>
                <Typography variant="body2">Date of Incident: {new Date(form.dateOfIncident).toLocaleDateString()}</Typography>
                <Typography variant="body2">Time of Incident: {form.timeOfIncident}</Typography>
                <Typography variant="body2">Location: {form.location}</Typography>
                <Typography variant="body2">Reporting Staff Name: {form.reportingStaffName}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Description:</strong> {form.descriptionOfIncident}
                </Typography>
              </CardContent>
            </Card>

            {/* Type of Misconduct */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                  <Warning sx={{ mr: 1 }} />
                  Type of Misconduct
                </Typography>
                {Object.entries(form.typeOfMisconduct).map(([key, value]) => {
                  if (key === 'otherDescription') return null;
                  if (!value) return null;
                  return (
                    <Typography key={key} variant="body2">
                      ✓ {getMisconductTypeLabel(key)}
                      {key === 'other' && form.typeOfMisconduct.otherDescription && 
                        ` (${form.typeOfMisconduct.otherDescription})`}
                    </Typography>
                  );
                })}
              </CardContent>
            </Card>

            {/* Action Taken */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                  <Gavel sx={{ mr: 1 }} />
                  Action Taken
                </Typography>
                {Object.entries(form.actionTaken).map(([key, value]) => {
                  if (key === 'otherDescription' || key === 'suspension') return null;
                  if (!value) return null;
                  return (
                    <Typography key={key} variant="body2">
                      ✓ {getActionTakenLabel(key)}
                      {key === 'other' && form.actionTaken.otherDescription && 
                        ` (${form.actionTaken.otherDescription})`}
                    </Typography>
                  );
                })}
                {form.actionTaken.suspension?.selected && (
                  <Typography variant="body2">
                    ✓ Suspension ({form.actionTaken.suspension.numberOfDays} days)
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Teacher Information */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Reported By
                </Typography>
                <Typography variant="body2">Name: {form.createdByName}</Typography>
                <Typography variant="body2">Role: {form.createdByRole}</Typography>
                <Typography variant="body2">Date Created: {new Date(form.createdAt).toLocaleDateString()}</Typography>
              </CardContent>
            </Card>
          </Paper>
        </Grid>

        {/* Acknowledgment Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Student Acknowledgment
            </Typography>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              By signing below, you acknowledge that you have read and understood the disciplinary action form and the consequences outlined above.
            </Alert>

            {/* Comments */}
            <TextField
              fullWidth
              label="Comments (Optional)"
              multiline
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
              placeholder="You may provide any comments or explanations here..."
            />

            {/* Digital Signature */}
            <Typography variant="subtitle1" gutterBottom>
              Digital Signature *
            </Typography>
            <Box 
              sx={{ 
                border: '2px solid #ddd', 
                borderRadius: 1, 
                mb: 2,
                backgroundColor: '#fafafa'
              }}
            >
              <canvas
                ref={canvasRef}
                width={300}
                height={150}
                style={{ 
                  display: 'block',
                  cursor: 'crosshair',
                  touchAction: 'none'
                }}
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
                  canvasRef.current.dispatchEvent(mouseEvent);
                }}
                onTouchMove={(e) => {
                  e.preventDefault();
                  const touch = e.touches[0];
                  const mouseEvent = new MouseEvent('mousemove', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                  });
                  canvasRef.current.dispatchEvent(mouseEvent);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  const mouseEvent = new MouseEvent('mouseup', {});
                  canvasRef.current.dispatchEvent(mouseEvent);
                }}
              />
            </Box>

            <Box display="flex" gap={1} mb={2}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Clear />}
                onClick={clearSignature}
              >
                Clear Signature
              </Button>
            </Box>

            <Button
              variant="contained"
              fullWidth
              startIcon={<Save />}
              onClick={handleSubmit}
              disabled={acknowledgeMutation.isLoading}
            >
              {acknowledgeMutation.isLoading ? 'Submitting...' : 'Submit Acknowledgment'}
            </Button>

            <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
              This acknowledgment will be sent to your parents/guardians and school administration.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Acknowledgment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to submit your acknowledgment? This action cannot be undone.
          </Typography>
          {comments && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Your comments:</Typography>
              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                "{comments}"
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={confirmSubmit} 
            variant="contained" 
            disabled={acknowledgeMutation.isLoading}
          >
            {acknowledgeMutation.isLoading ? 'Submitting...' : 'Confirm & Submit'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default DisciplinaryFormAcknowledge; 