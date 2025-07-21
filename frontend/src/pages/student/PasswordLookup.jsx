import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  Divider,
  Chip
} from '@mui/material';
import {
  Lock as LockIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import axios from 'axios';

const steps = ['Request Password Lookup', 'Verify Token', 'Reset Password'];

function PasswordLookup() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    rollNumber: '',
    email: ''
  });
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [studentInfo, setStudentInfo] = useState(null);

  // Request password lookup mutation
  const requestLookupMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post('http://localhost:5000/api/students/password-lookup/request', data);
      return response.data;
    },
    onSuccess: (data) => {
      setResetToken(data.resetToken);
      toast.success('Password lookup request sent successfully!');
      setActiveStep(1);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to request password lookup');
    }
  });

  // Verify token mutation
  const verifyTokenMutation = useMutation({
    mutationFn: async (token) => {
      const response = await axios.get(`http://localhost:5000/api/students/password-lookup/verify/${token}`);
      return response.data;
    },
    onSuccess: (data) => {
      setStudentInfo(data.student);
      toast.success('Token verified successfully!');
      setActiveStep(2);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Invalid or expired token');
    }
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post('http://localhost:5000/api/students/password-lookup/reset', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password reset successfully!');
      // Reset form
      setFormData({ rollNumber: '', email: '' });
      setResetToken('');
      setNewPassword('');
      setConfirmPassword('');
      setStudentInfo(null);
      setActiveStep(0);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }
  });

  const handleRequestLookup = (e) => {
    e.preventDefault();
    if (!formData.rollNumber || !formData.email) {
      toast.error('Please fill in all fields');
      return;
    }
    requestLookupMutation.mutate(formData);
  };

  const handleVerifyToken = () => {
    if (!resetToken) {
      toast.error('Please enter the reset token');
      return;
    }
    verifyTokenMutation.mutate(resetToken);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    resetPasswordMutation.mutate({ resetToken, newPassword });
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box component="form" onSubmit={handleRequestLookup}>
            <Typography variant="h6" gutterBottom>
              Request Password Lookup
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your roll number and parent's email to request a password reset.
            </Typography>
            
            <TextField
              fullWidth
              label="Roll Number"
              value={formData.rollNumber}
              onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Parent's Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
              required
            />
            
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}
              disabled={requestLookupMutation.isPending}
              startIcon={requestLookupMutation.isPending ? <CircularProgress size={20} /> : <EmailIcon />}
            >
              {requestLookupMutation.isPending ? 'Requesting...' : 'Request Password Lookup'}
            </Button>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Verify Reset Token
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter the reset token that was sent to your parent's email.
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Note:</strong> In a production environment, this token would be sent via email. 
                For demonstration purposes, the token is shown here: <strong>{resetToken}</strong>
              </Typography>
            </Alert>
            
            <TextField
              fullWidth
              label="Reset Token"
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              margin="normal"
              required
            />
            
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}
              onClick={handleVerifyToken}
              disabled={verifyTokenMutation.isPending}
              startIcon={verifyTokenMutation.isPending ? <CircularProgress size={20} /> : <SecurityIcon />}
            >
              {verifyTokenMutation.isPending ? 'Verifying...' : 'Verify Token'}
            </Button>
          </Box>
        );

      case 2:
        return (
          <Box component="form" onSubmit={handleResetPassword}>
            <Typography variant="h6" gutterBottom>
              Reset Password
            </Typography>
            
            {studentInfo && (
              <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Student Information:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Name:</strong> {studentInfo.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Roll Number:</strong> {studentInfo.rollNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Class:</strong> {studentInfo.class}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Section:</strong> {studentInfo.section}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            )}
            
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              required
            />
            
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}
              disabled={resetPasswordMutation.isPending}
              startIcon={resetPasswordMutation.isPending ? <CircularProgress size={20} /> : <CheckCircleIcon />}
            >
              {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <LockIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Box>
              <Typography variant="h4" component="h1">
                Password Lookup
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Reset your student account password
              </Typography>
            </Box>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Divider sx={{ mb: 3 }} />

          {renderStepContent(activeStep)}

          {activeStep > 0 && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                onClick={() => setActiveStep(activeStep - 1)}
                disabled={activeStep === 0}
              >
                Back
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setActiveStep(0);
                  setFormData({ rollNumber: '', email: '' });
                  setResetToken('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setStudentInfo(null);
                }}
              >
                Start Over
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default PasswordLookup; 