import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  IconButton,
  Snackbar
} from '@mui/material';
import {
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  Reply as ReplyIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { disciplinaryAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DisciplinaryMisconduct = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [expandedActions, setExpandedActions] = useState({});
  const [responseDialog, setResponseDialog] = useState({ open: false, actionId: null });
  const [responseText, setResponseText] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch disciplinary records
  const { data: misconductData, isLoading, error } = useQuery({
    queryKey: ['studentMisconductRecords'],
    queryFn: disciplinaryAPI.getStudentMisconductRecords,
    refetchOnWindowFocus: false
  });

  // Submit response mutation
  const respondMutation = useMutation({
    mutationFn: ({ actionId, response }) => disciplinaryAPI.respondToMisconduct(actionId, response),
    onSuccess: () => {
      queryClient.invalidateQueries(['studentMisconductRecords']);
      setResponseDialog({ open: false, actionId: null });
      setResponseText('');
      setSnackbar({ open: true, message: 'Response submitted successfully', severity: 'success' });
    },
    onError: (error) => {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to submit response', 
        severity: 'error' 
      });
    }
  });

  const handleExpandAction = (actionId) => {
    setExpandedActions(prev => ({
      ...prev,
      [actionId]: !prev[actionId]
    }));
  };

  const handleOpenResponseDialog = (actionId) => {
    setResponseDialog({ open: true, actionId });
  };

  const handleSubmitResponse = () => {
    if (!responseText.trim()) {
      setSnackbar({ open: true, message: 'Please enter a response', severity: 'error' });
      return;
    }
    
    respondMutation.mutate({
      actionId: responseDialog.actionId,
      response: responseText
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'acknowledged': return 'info';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load disciplinary records: {error.response?.data?.message || error.message}
      </Alert>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" display="flex" alignItems="center">
          <WarningIcon sx={{ mr: 2, color: 'warning.main' }} />
          Disciplinary Misconduct Records
        </Typography>
      </Box>

      {/* Student Information */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          avatar={<PersonIcon />}
          title="Student Information"
          sx={{ bgcolor: 'primary.main', color: 'white' }}
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">Student Name</Typography>
              <Typography variant="h6">{misconductData?.studentName}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" color="textSecondary">Roll Number</Typography>
              <Typography variant="h6">{misconductData?.rollNumber}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" color="textSecondary">Class & Section</Typography>
              <Typography variant="h6">{misconductData?.class} - {misconductData?.section}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Disciplinary Actions */}
      {misconductData?.disciplinaryActions?.length > 0 ? (
        <Grid container spacing={3}>
          {misconductData.disciplinaryActions.map((action, index) => (
            <Grid item xs={12} key={action._id}>
              <Card>
                <CardHeader
                  avatar={<AssignmentIcon />}
                  title={`Disciplinary Action #${index + 1}`}
                  subheader={formatDate(action.date)}
                  action={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip 
                        label={action.status} 
                        color={getStatusColor(action.status)} 
                        size="small" 
                      />
                      <IconButton 
                        onClick={() => handleExpandAction(action._id)}
                        aria-label="expand"
                      >
                        {expandedActions[action._id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>
                  }
                />
                <Collapse in={expandedActions[action._id]}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Incident Description
                        </Typography>
                        <Typography variant="body1" paragraph>
                          {action.incident}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Action Taken
                        </Typography>
                        <Typography variant="body1" paragraph>
                          {action.actionTaken}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Reported By
                        </Typography>
                        <Typography variant="body1">
                          {action.createdByName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Date
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(action.date)}
                        </Typography>
                      </Grid>
                      
                      {action.studentResponse && (
                        <Grid item xs={12}>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Your Response
                          </Typography>
                          <Alert severity="info">
                            {action.studentResponse}
                          </Alert>
                        </Grid>
                      )}
                      
                      {action.parentResponse && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Parent Response
                          </Typography>
                          <Alert severity="success">
                            {action.parentResponse}
                          </Alert>
                        </Grid>
                      )}
                      
                      <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        {action.status === 'pending' ? (
                          <Button
                            variant="contained"
                            startIcon={<ReplyIcon />}
                            onClick={() => handleOpenResponseDialog(action._id)}
                            color="primary"
                          >
                            Respond to Action
                          </Button>
                        ) : (
                          <Box display="flex" alignItems="center">
                            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                            <Typography color="success.main">Response Submitted</Typography>
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Collapse>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No Disciplinary Actions
            </Typography>
            <Typography variant="body1" color="textSecondary">
              You have a clean disciplinary record. Keep up the good work!
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Response Dialog */}
      <Dialog 
        open={responseDialog.open} 
        onClose={() => setResponseDialog({ open: false, actionId: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Respond to Disciplinary Action</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" paragraph>
            Please provide your response or explanation regarding this disciplinary action. 
            Your response will be reviewed by your teachers and parents.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Response"
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Enter your response, explanation, or any relevant information..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResponseDialog({ open: false, actionId: null })}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitResponse}
            variant="contained"
            disabled={respondMutation.isLoading}
          >
            {respondMutation.isLoading ? 'Submitting...' : 'Submit Response'}
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

export default DisciplinaryMisconduct; 