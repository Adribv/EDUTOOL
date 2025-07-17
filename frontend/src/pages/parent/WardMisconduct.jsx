import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
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
  Collapse,
  IconButton,
  Snackbar,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper
} from '@mui/material';
import {
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Reply as ReplyIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  FamilyRestroom as FamilyIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Description as DescriptionIcon,
  Gavel as GavelIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { disciplinaryAPI } from '../../services/api';

const WardMisconduct = () => {
  const queryClient = useQueryClient();
  const [expandedActions, setExpandedActions] = useState({});
  const [responseDialog, setResponseDialog] = useState({ 
    open: false, 
    studentId: null, 
    actionId: null,
    wardName: ''
  });
  const [responseText, setResponseText] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch ward disciplinary records
  const { data: wardData, isLoading, error } = useQuery({
    queryKey: ['wardMisconductRecords'],
    queryFn: disciplinaryAPI.getWardMisconductRecords,
    refetchOnWindowFocus: false
  });

  // Submit response mutation
  const respondMutation = useMutation({
    mutationFn: ({ studentId, actionId, response }) => 
      disciplinaryAPI.respondToWardMisconduct(studentId, actionId, response),
    onSuccess: () => {
      queryClient.invalidateQueries(['wardMisconductRecords']);
      setResponseDialog({ open: false, studentId: null, actionId: null, wardName: '' });
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

  const handleOpenResponseDialog = (studentId, actionId, wardName) => {
    setResponseDialog({ open: true, studentId, actionId, wardName });
  };

  const handleSubmitResponse = () => {
    if (!responseText.trim()) {
      setSnackbar({ open: true, message: 'Please enter a response', severity: 'error' });
      return;
    }
    
    respondMutation.mutate({
      studentId: responseDialog.studentId,
      actionId: responseDialog.actionId,
      response: responseText
    });
  };

  const handleDownloadPDF = async (formId, studentName) => {
    try {
      setSnackbar({ open: true, message: 'Downloading PDF...', severity: 'info' });
      
      // Download the stored PDF
      const pdfBlob = await disciplinaryAPI.downloadFormPDF(formId);
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Disciplinary_Form_${studentName}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSnackbar({ open: true, message: 'PDF downloaded successfully', severity: 'success' });
      
    } catch (error) {
      console.error('Failed to download PDF:', error);
      
      // If PDF doesn't exist, try to generate it
      if (error.response?.status === 404) {
        try {
          setSnackbar({ open: true, message: 'PDF not found. Generating new PDF...', severity: 'info' });
          
          // Generate PDF first
          await disciplinaryAPI.generateFormPDF(formId);
          
          // Then download it
          const pdfBlob = await disciplinaryAPI.downloadFormPDF(formId);
          
          const url = window.URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Disciplinary_Form_${studentName}_${new Date().toISOString().split('T')[0]}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          setSnackbar({ open: true, message: 'PDF generated and downloaded successfully', severity: 'success' });
          
        } catch (generateError) {
          console.error('Failed to generate PDF:', generateError);
          setSnackbar({ 
            open: true, 
            message: 'Failed to generate PDF. Please contact administrator.', 
            severity: 'error' 
          });
        }
      } else {
        setSnackbar({ 
          open: true, 
          message: 'Failed to download PDF. Please try again.', 
          severity: 'error' 
        });
      }
    }
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
        Failed to load ward disciplinary records: {error.response?.data?.message || error.message}
      </Alert>
    );
  }

  if (!wardData?.wardRecords || wardData.wardRecords.length === 0) {
    return (
      <Box p={3}>
        <Typography variant="h4" display="flex" alignItems="center" mb={3}>
          <WarningIcon sx={{ mr: 2, color: 'warning.main' }} />
          Ward Disciplinary Records
        </Typography>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <FamilyIcon sx={{ fontSize: 64, color: 'info.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No Children Found
            </Typography>
            <Typography variant="body1" color="textSecondary">
              No children are linked to your account or they have clean disciplinary records.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" display="flex" alignItems="center">
          <WarningIcon sx={{ mr: 2, color: 'warning.main' }} />
          Ward Disciplinary Records - All Children
        </Typography>
      </Box>

      {/* Parent Information */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          avatar={<FamilyIcon />}
          title="Parent Information"
          sx={{ bgcolor: 'primary.main', color: 'white' }}
        />
        <CardContent>
          <Typography variant="h6">{wardData?.parentName}</Typography>
          <Typography variant="body2" color="textSecondary">
            Viewing disciplinary records for {wardData?.wardRecords?.length} child(ren)
          </Typography>
        </CardContent>
      </Card>

      {/* All Children's Records */}
      {wardData.wardRecords.map((ward, wardIndex) => (
        <Box key={ward.studentId} sx={{ mb: 4 }}>
          {/* Ward Information */}
          <Card sx={{ mb: 3, border: 2, borderColor: 'primary.main' }}>
            <CardHeader 
              avatar={<PersonIcon />}
              title={`${ward.studentName}'s Disciplinary Record`}
              subheader={`Child ${wardIndex + 1} of ${wardData.wardRecords.length}`}
              sx={{ bgcolor: 'primary.main', color: 'white' }}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="textSecondary">Student Name</Typography>
                  <Typography variant="h6">{ward.studentName}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="textSecondary">Roll Number</Typography>
                  <Typography variant="h6">{ward.rollNumber}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="textSecondary">Class & Section</Typography>
                  <Typography variant="h6">{ward.class} - {ward.section}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="textSecondary">Total Actions</Typography>
                  <Typography variant="h6" color={ward.disciplinaryActions?.length > 0 ? 'warning.main' : 'success.main'}>
                    {ward.disciplinaryActions?.length || 0}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Disciplinary Actions */}
          {ward.disciplinaryActions && ward.disciplinaryActions.length > 0 ? (
            <Grid container spacing={3}>
              {ward.disciplinaryActions.map((action, index) => (
                <Grid item xs={12} key={action._id}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                        <Box display="flex" alignItems="center">
                          <AssignmentIcon sx={{ mr: 2 }} />
                          <Box>
                            <Typography variant="h6">
                              Disciplinary Action #{index + 1} - {ward.studentName}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {formatDate(action.date)} • {action.createdByName}
                            </Typography>
                          </Box>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip 
                            label={action.status} 
                            color={getStatusColor(action.status)} 
                            size="small"
                          />
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<PdfIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadPDF(action._id, ward.studentName);
                            }}
                            sx={{ ml: 1 }}
                          >
                            Download PDF
                          </Button>
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ width: '100%' }}>
                        {/* School Information */}
                        <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                          <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                            <SchoolIcon sx={{ mr: 1 }} />
                            School Information
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                              <Typography variant="subtitle2" color="textSecondary">School Name</Typography>
                              <Typography variant="body1">{action.schoolName || 'N/A'}</Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <Typography variant="subtitle2" color="textSecondary">Form Date</Typography>
                              <Typography variant="body1">{action.date ? formatDate(action.date) : 'N/A'}</Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <Typography variant="subtitle2" color="textSecondary">Warning Number</Typography>
                              <Typography variant="body1">{action.warningNumber || 'N/A'}</Typography>
                            </Grid>
                          </Grid>
                        </Paper>

                        {/* Student Information */}
                        <Paper sx={{ p: 2, mb: 3, bgcolor: 'blue.50' }}>
                          <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                            <PersonIcon sx={{ mr: 1 }} />
                            Student Information
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Typography variant="subtitle2" color="textSecondary">Full Name</Typography>
                              <Typography variant="body1" fontWeight="medium">{action.studentName || ward.studentName}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography variant="subtitle2" color="textSecondary">Roll Number</Typography>
                              <Typography variant="body1">{action.rollNumber || ward.rollNumber}</Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <Typography variant="subtitle2" color="textSecondary">Grade/Class</Typography>
                              <Typography variant="body1">{action.grade || ward.class}</Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <Typography variant="subtitle2" color="textSecondary">Section</Typography>
                              <Typography variant="body1">{action.section || ward.section}</Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <Typography variant="subtitle2" color="textSecondary">Parent/Guardian</Typography>
                              <Typography variant="body1">{action.parentGuardianName || 'N/A'}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography variant="subtitle2" color="textSecondary">Contact Number</Typography>
                              <Typography variant="body1">{action.contactNumber || 'N/A'}</Typography>
                            </Grid>
                          </Grid>
                        </Paper>

                        {/* Incident Details */}
                        <Paper sx={{ p: 2, mb: 3, bgcolor: 'orange.50' }}>
                          <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                            <DescriptionIcon sx={{ mr: 1 }} />
                            Incident Details
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                <CalendarIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                Date of Incident
                              </Typography>
                              <Typography variant="body1">
                                {action.dateOfIncident ? formatDate(action.dateOfIncident) : 'N/A'}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                <TimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                Time of Incident
                              </Typography>
                              <Typography variant="body1">{action.timeOfIncident || 'N/A'}</Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                <LocationIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                Location
                              </Typography>
                              <Typography variant="body1">{action.location || 'N/A'}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                Reporting Staff Name
                              </Typography>
                              <Typography variant="body1">{action.reportingStaffName || action.createdByName}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                Description of Incident
                              </Typography>
                              <Typography variant="body1" sx={{ 
                                p: 2, 
                                bgcolor: 'white', 
                                border: 1, 
                                borderColor: 'grey.300', 
                                borderRadius: 1 
                              }}>
                                {action.descriptionOfIncident || action.incident || 'No description provided'}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Paper>

                        {/* Type of Misconduct */}
                        <Paper sx={{ p: 2, mb: 3, bgcolor: 'red.50' }}>
                          <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                            <WarningIcon sx={{ mr: 1 }} />
                            Type of Misconduct
                          </Typography>
                          {action.typeOfMisconduct ? (
                            <List dense>
                              {Object.entries(action.typeOfMisconduct).map(([key, value]) => {
                                if (key === 'otherDescription' || !value) return null;
                                return (
                                  <ListItem key={key}>
                                    <ListItemIcon>
                                      <CheckCircleIcon color="error" fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText 
                                      primary={getMisconductTypeLabel(key)}
                                      secondary={
                                        key === 'other' && action.typeOfMisconduct.otherDescription 
                                          ? `Specified as: ${action.typeOfMisconduct.otherDescription}`
                                          : null
                                      }
                                    />
                                  </ListItem>
                                );
                              })}
                            </List>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              No specific misconduct types recorded
                            </Typography>
                          )}
                        </Paper>

                        {/* Action Taken */}
                        <Paper sx={{ p: 2, mb: 3, bgcolor: 'purple.50' }}>
                          <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                            <GavelIcon sx={{ mr: 1 }} />
                            Action Taken
                          </Typography>
                          {action.actionTaken ? (
                            <List dense>
                              {Object.entries(action.actionTaken).map(([key, value]) => {
                                if (key === 'otherDescription' || key === 'suspension' || !value) return null;
                                return (
                                  <ListItem key={key}>
                                    <ListItemIcon>
                                      <CheckCircleIcon color="primary" fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText 
                                      primary={getActionTakenLabel(key)}
                                      secondary={
                                        key === 'other' && action.actionTaken.otherDescription 
                                          ? `Specified as: ${action.actionTaken.otherDescription}`
                                          : null
                                      }
                                    />
                                  </ListItem>
                                );
                              })}
                              {action.actionTaken.suspension?.selected && (
                                <ListItem>
                                  <ListItemIcon>
                                    <CheckCircleIcon color="primary" fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary="Suspension"
                                    secondary={`Duration: ${action.actionTaken.suspension.numberOfDays} day(s)`}
                                  />
                                </ListItem>
                              )}
                            </List>
                          ) : (
                            <Typography variant="body1">
                              {action.actionTaken || 'No specific actions recorded'}
                            </Typography>
                          )}
                        </Paper>

                        {/* Follow-up Information */}
                        {action.followUpRequired && (
                          <Paper sx={{ p: 2, mb: 3, bgcolor: 'yellow.50' }}>
                            <Typography variant="h6" gutterBottom>
                              Follow-up Required
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary">Follow-up Date</Typography>
                                <Typography variant="body1">
                                  {action.followUpDate ? formatDate(action.followUpDate) : 'Not specified'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">Follow-up Notes</Typography>
                                <Typography variant="body1">
                                  {action.followUpNotes || 'No additional notes provided'}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Paper>
                        )}

                        {/* Student Response */}
                        {action.studentResponse && (
                          <Alert severity="info" sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Student's Response
                            </Typography>
                            <Typography variant="body2">
                              {action.studentResponse}
                            </Typography>
                          </Alert>
                        )}
                        
                        {/* Parent Response */}
                        {action.parentResponse && (
                          <Alert severity="success" sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Your Response
                            </Typography>
                            <Typography variant="body2">
                              {action.parentResponse}
                            </Typography>
                          </Alert>
                        )}
                        
                        {/* Response Action */}
                        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                          {!action.parentResponse ? (
                            <Button
                              variant="contained"
                              startIcon={<ReplyIcon />}
                              onClick={() => handleOpenResponseDialog(ward.studentId, action._id, ward.studentName)}
                              color="primary"
                            >
                              Respond as Parent
                            </Button>
                          ) : (
                            <Box display="flex" alignItems="center">
                              <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                              <Typography color="success.main">Parent Response Submitted</Typography>
                            </Box>
                          )}
                          
                          <Button
                            variant="outlined"
                            startIcon={<PdfIcon />}
                            onClick={() => handleDownloadPDF(action._id, ward.studentName)}
                            color="primary"
                          >
                            Download Complete Form PDF
                          </Button>
                        </Box>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom color="success.main">
                  Clean Record!
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {ward.studentName} has no disciplinary actions. Excellent behavior!
                </Typography>
              </CardContent>
            </Card>
          )}
          
          {/* Divider between children */}
          {wardIndex < wardData.wardRecords.length - 1 && (
            <Divider sx={{ my: 4, borderWidth: 2 }} />
          )}
        </Box>
      ))}

      {/* Response Dialog */}
      <Dialog 
        open={responseDialog.open} 
        onClose={() => setResponseDialog({ open: false, studentId: null, actionId: null, wardName: '' })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Respond to {responseDialog.wardName}'s Disciplinary Action</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" paragraph>
            Please provide your response as a parent/guardian regarding this disciplinary action. 
            Your response will be reviewed by the school administration and teachers.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Response as Parent"
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Enter your response, concerns, or any relevant information..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResponseDialog({ open: false, studentId: null, actionId: null, wardName: '' })}>
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

export default WardMisconduct; 