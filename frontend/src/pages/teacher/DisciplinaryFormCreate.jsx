import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
  Alert,
  CircularProgress,
  Snackbar,
  Autocomplete,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Save,
  Send,
  Preview,
  ArrowBack,
  Warning,
  Person,
  Description,
  Gavel,
  Assignment
} from '@mui/icons-material';
import { disciplinaryAPI, adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DisciplinaryFormCreate = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Determine if we're in admin context
  const isAdminContext = location.pathname.startsWith('/admin');
  
  // Form state
  const [formData, setFormData] = useState({
    // School details
    schoolName: '',
    date: new Date().toISOString().split('T')[0],
    warningNumber: '',
    
    // Student Information
    rollNumber: '',
    studentName: '',
    grade: '',
    section: '',
    parentGuardianName: '',
    contactNumber: '',
    
    // Incident Details
    dateOfIncident: '',
    timeOfIncident: '',
    location: '',
    reportingStaffName: '',
    descriptionOfIncident: '',
    
    // Type of Misconduct
    typeOfMisconduct: {
      disruptiveBehaviorInClass: false,
      disrespectTowardStaff: false,
      physicalAggression: false,
      inappropriateLanguage: false,
      bullyingHarassment: false,
      vandalism: false,
      cheatingAcademicDishonesty: false,
      skippingClassesWithoutPermission: false,
      other: false,
      otherDescription: ''
    },
    
    // Action Taken
    actionTaken: {
      verbalWarning: false,
      writtenWarning: false,
      parentNotification: false,
      counselingReferral: false,
      detention: false,
      suspension: {
        selected: false,
        numberOfDays: 0
      },
      other: false,
      otherDescription: ''
    },
    
    // Additional fields
    followUpRequired: false,
    followUpDate: '',
    followUpNotes: ''
  });

  // Fetch students for autocomplete
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => adminAPI.getAllStudents(),
    onError: (error) => {
      console.error('Failed to fetch students:', error);
      if (error.response?.status === 401) {
        setSnackbar({ 
          open: true, 
          message: 'Session expired. Please login again.', 
          severity: 'error' 
        });
      }
    }
  });

  // Fetch template settings
  const { data: template } = useQuery({
    queryKey: ['disciplinaryTemplate'],
    queryFn: disciplinaryAPI.getTemplate,
    onError: (error) => {
      console.error('Failed to fetch template:', error);
    }
  });

  // Fetch existing form if editing
  const { data: existingForm, isLoading: formLoading } = useQuery({
    queryKey: ['disciplinaryForm', formId],
    queryFn: () => disciplinaryAPI.getFormById(formId),
    enabled: !!formId,
    onError: (error) => {
      console.error('Failed to fetch form:', error);
      if (error.response?.status === 401) {
        setSnackbar({ 
          open: true, 
          message: 'Session expired. Please login again.', 
          severity: 'error' 
        });
      }
    }
  });

  // Create/Update form mutation with enhanced error handling
  const saveFormMutation = useMutation({
    mutationFn: (data) => {
      console.log('Saving form data:', data);
      console.log('User context:', user);
      console.log('Is admin context:', isAdminContext);
      
      if (formId) {
        return disciplinaryAPI.updateForm(formId, data);
      } else {
        return disciplinaryAPI.createForm(data);
      }
    },
    onSuccess: (response) => {
      setSnackbar({ open: true, message: 'Form saved successfully', severity: 'success' });
      queryClient.invalidateQueries(['disciplinaryTeacherForms']);
      queryClient.invalidateQueries(['disciplinaryForms']);
      
      if (!formId) {
        const newFormId = response.form._id;
        if (isAdminContext) {
          navigate(`/admin/disciplinary-forms/${newFormId}`);
        } else {
          navigate(`/teacher/disciplinary-forms/${newFormId}`);
        }
      }
    },
    onError: (error) => {
      console.error('Save form error:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.status === 401) {
        setSnackbar({ 
          open: true, 
          message: 'Authentication failed. Redirecting to login...', 
          severity: 'error' 
        });
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setSnackbar({ 
          open: true, 
          message: error.response?.data?.message || 'Failed to save form', 
          severity: 'error' 
        });
      }
    }
  });

  // Submit form mutation with enhanced error handling
  const submitFormMutation = useMutation({
    mutationFn: (id) => {
      console.log('Submitting form ID:', id);
      console.log('User context:', user);
      return disciplinaryAPI.submitForm(id);
    },
    onSuccess: () => {
      setSnackbar({ open: true, message: 'Form submitted successfully. Student and parent have been notified.', severity: 'success' });
      queryClient.invalidateQueries(['disciplinaryTeacherForms']);
      queryClient.invalidateQueries(['disciplinaryForms']);
      
      if (isAdminContext) {
        navigate('/admin/disciplinary-forms');
      } else {
        navigate('/teacher/disciplinary-forms');
      }
    },
    onError: (error) => {
      console.error('Submit form error:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.status === 401) {
        setSnackbar({ 
          open: true, 
          message: 'Authentication failed. Redirecting to login...', 
          severity: 'error' 
        });
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setSnackbar({ 
          open: true, 
          message: error.response?.data?.message || 'Failed to submit form', 
          severity: 'error' 
        });
      }
    }
  });

  // Load template settings
  useEffect(() => {
    if (template) {
      setFormData(prev => ({
        ...prev,
        schoolName: template.schoolName || ''
      }));
    }
  }, [template]);

  // Load existing form data
  useEffect(() => {
    if (existingForm) {
      setFormData(existingForm);
      setIsEditing(true);
    }
  }, [existingForm]);

  // Handle student selection
  const handleStudentSelect = (student) => {
    if (student) {
      setFormData(prev => ({
        ...prev,
        rollNumber: student.rollNumber,
        studentName: student.name,
        grade: student.class,
        section: student.section,
        parentGuardianName: student.parentInfo?.name || '',
        contactNumber: student.parentInfo?.contactNumber || student.contactNumber || ''
      }));
    }
  };

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle nested field changes
  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Handle suspension change
  const handleSuspensionChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      actionTaken: {
        ...prev.actionTaken,
        suspension: {
          ...prev.actionTaken.suspension,
          [field]: value
        }
      }
    }));
  };

  const handleSave = () => {
    // Validate required fields
    if (!formData.rollNumber || !formData.dateOfIncident || !formData.descriptionOfIncident) {
      setSnackbar({ 
        open: true, 
        message: 'Please fill in all required fields: Student, Incident Date, and Description', 
        severity: 'error' 
      });
      return;
    }

    console.log('Attempting to save form...');
    console.log('Current user:', user);
    console.log('Auth token exists:', !!localStorage.getItem('token'));
    
    saveFormMutation.mutate(formData);
  };

  const handleSubmit = () => {
    if (!formId) {
      setSnackbar({ 
        open: true, 
        message: 'Please save the form first before submitting', 
        severity: 'error' 
      });
      return;
    }

    console.log('Attempting to submit form...');
    console.log('Current user:', user);
    console.log('Auth token exists:', !!localStorage.getItem('token'));
    
    submitFormMutation.mutate(formId);
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const handleBack = () => {
    if (isAdminContext) {
      navigate('/admin/disciplinary-forms');
    } else {
      navigate('/teacher/disciplinary-forms');
    }
  };

  // Test authentication function
  const testAuthentication = async () => {
    try {
      console.log('Testing authentication...');
      console.log('Token:', localStorage.getItem('token'));
      console.log('User Role:', localStorage.getItem('userRole'));
      
      // Test a simple API call
      const response = await disciplinaryAPI.getTemplate();
      console.log('Auth test successful:', response);
      setSnackbar({ 
        open: true, 
        message: 'Authentication test successful!', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Auth test failed:', error);
      setSnackbar({ 
        open: true, 
        message: `Auth test failed: ${error.response?.data?.message || error.message}`, 
        severity: 'error' 
      });
    }
  };

  if (formLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Debug Information (only show in development) */}
      {process.env.NODE_ENV === 'development' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Debug Info - User: {user?.name || 'Unknown'} | Role: {user?.role || 'Unknown'} | 
            Context: {isAdminContext ? 'Admin' : 'Teacher'} | 
            Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}
          </Typography>
          <Button size="small" onClick={testAuthentication} sx={{ mt: 1 }}>
            Test Authentication
          </Button>
        </Alert>
      )}

      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center">
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            Back to Forms
          </Button>
          <Typography variant="h4" display="flex" alignItems="center">
            <Warning sx={{ mr: 2, color: 'warning.main' }} />
            {isEditing ? 'Edit Disciplinary Form' : 'Create Disciplinary Form'}
            {isAdminContext && <Typography variant="subtitle1" sx={{ ml: 2, color: 'primary.main' }}>(Admin)</Typography>}
          </Typography>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box display="flex" gap={2} mb={3}>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
          disabled={saveFormMutation.isLoading}
        >
          {saveFormMutation.isLoading ? 'Saving...' : 'Save Form'}
        </Button>
        {formId && (
          <Button
            variant="contained"
            color="success"
            startIcon={<Send />}
            onClick={handleSubmit}
            disabled={submitFormMutation.isLoading}
          >
            {submitFormMutation.isLoading ? 'Submitting...' : 'Submit Form'}
          </Button>
        )}
        <Button
          variant="outlined"
          startIcon={<Preview />}
          onClick={handlePreview}
        >
          Preview
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* School Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
              <Assignment sx={{ mr: 1 }} />
              School Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="School Name"
                  value={formData.schoolName}
                  onChange={(e) => handleChange('schoolName', e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Warning Number"
                  value={formData.warningNumber}
                  onChange={(e) => handleChange('warningNumber', e.target.value)}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Student Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
              <Person sx={{ mr: 1 }} />
              Student Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={students}
                  getOptionLabel={(option) => `${option.name} (${option.rollNumber})`}
                  value={students.find(s => s.rollNumber === formData.rollNumber) || null}
                  onChange={(event, newValue) => handleStudentSelect(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Student *"
                      variant="outlined"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Student Name"
                  value={formData.studentName}
                  variant="outlined"
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Grade/Class"
                  value={formData.grade}
                  variant="outlined"
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Section"
                  value={formData.section}
                  variant="outlined"
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Roll Number"
                  value={formData.rollNumber}
                  variant="outlined"
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Parent/Guardian Name"
                  value={formData.parentGuardianName}
                  onChange={(e) => handleChange('parentGuardianName', e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Number"
                  value={formData.contactNumber}
                  onChange={(e) => handleChange('contactNumber', e.target.value)}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Incident Details */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
              <Description sx={{ mr: 1 }} />
              Incident Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date of Incident *"
                  type="date"
                  value={formData.dateOfIncident}
                  onChange={(e) => handleChange('dateOfIncident', e.target.value)}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Time of Incident"
                  type="time"
                  value={formData.timeOfIncident}
                  onChange={(e) => handleChange('timeOfIncident', e.target.value)}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Reporting Staff Name"
                  value={formData.reportingStaffName}
                  onChange={(e) => handleChange('reportingStaffName', e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description of Incident *"
                  value={formData.descriptionOfIncident}
                  onChange={(e) => handleChange('descriptionOfIncident', e.target.value)}
                  variant="outlined"
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Type of Misconduct */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
              <Warning sx={{ mr: 1 }} />
              Type of Misconduct (Check all that apply)
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.typeOfMisconduct.disruptiveBehaviorInClass}
                    onChange={(e) => handleNestedChange('typeOfMisconduct', 'disruptiveBehaviorInClass', e.target.checked)}
                  />
                }
                label="Disruptive behavior in class"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.typeOfMisconduct.disrespectTowardStaff}
                    onChange={(e) => handleNestedChange('typeOfMisconduct', 'disrespectTowardStaff', e.target.checked)}
                  />
                }
                label="Disrespect toward staff or students"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.typeOfMisconduct.physicalAggression}
                    onChange={(e) => handleNestedChange('typeOfMisconduct', 'physicalAggression', e.target.checked)}
                  />
                }
                label="Physical aggression/fighting"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.typeOfMisconduct.inappropriateLanguage}
                    onChange={(e) => handleNestedChange('typeOfMisconduct', 'inappropriateLanguage', e.target.checked)}
                  />
                }
                label="Use of inappropriate language"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.typeOfMisconduct.bullyingHarassment}
                    onChange={(e) => handleNestedChange('typeOfMisconduct', 'bullyingHarassment', e.target.checked)}
                  />
                }
                label="Bullying/harassment"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.typeOfMisconduct.vandalism}
                    onChange={(e) => handleNestedChange('typeOfMisconduct', 'vandalism', e.target.checked)}
                  />
                }
                label="Vandalism/property damage"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.typeOfMisconduct.cheatingAcademicDishonesty}
                    onChange={(e) => handleNestedChange('typeOfMisconduct', 'cheatingAcademicDishonesty', e.target.checked)}
                  />
                }
                label="Cheating/academic dishonesty"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.typeOfMisconduct.skippingClassesWithoutPermission}
                    onChange={(e) => handleNestedChange('typeOfMisconduct', 'skippingClassesWithoutPermission', e.target.checked)}
                  />
                }
                label="Skipping classes without permission"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.typeOfMisconduct.other}
                    onChange={(e) => handleNestedChange('typeOfMisconduct', 'other', e.target.checked)}
                  />
                }
                label="Other"
              />
              {formData.typeOfMisconduct.other && (
                <TextField
                  fullWidth
                  label="Please specify"
                  value={formData.typeOfMisconduct.otherDescription}
                  onChange={(e) => handleNestedChange('typeOfMisconduct', 'otherDescription', e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ mt: 1 }}
                />
              )}
            </FormGroup>
          </Paper>
        </Grid>

        {/* Action Taken */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
              <Gavel sx={{ mr: 1 }} />
              Action Taken (Check all that apply)
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.actionTaken.verbalWarning}
                    onChange={(e) => handleNestedChange('actionTaken', 'verbalWarning', e.target.checked)}
                  />
                }
                label="Verbal warning"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.actionTaken.writtenWarning}
                    onChange={(e) => handleNestedChange('actionTaken', 'writtenWarning', e.target.checked)}
                  />
                }
                label="Written warning"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.actionTaken.parentNotification}
                    onChange={(e) => handleNestedChange('actionTaken', 'parentNotification', e.target.checked)}
                  />
                }
                label="Parent/guardian notified"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.actionTaken.counselingReferral}
                    onChange={(e) => handleNestedChange('actionTaken', 'counselingReferral', e.target.checked)}
                  />
                }
                label="Counseling referral"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.actionTaken.detention}
                    onChange={(e) => handleNestedChange('actionTaken', 'detention', e.target.checked)}
                  />
                }
                label="Detention"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.actionTaken.suspension.selected}
                    onChange={(e) => handleSuspensionChange('selected', e.target.checked)}
                  />
                }
                label="Suspension"
              />
              {formData.actionTaken.suspension.selected && (
                <TextField
                  fullWidth
                  label="Number of days"
                  type="number"
                  value={formData.actionTaken.suspension.numberOfDays}
                  onChange={(e) => handleSuspensionChange('numberOfDays', parseInt(e.target.value))}
                  variant="outlined"
                  size="small"
                  sx={{ mt: 1 }}
                  inputProps={{ min: 1, max: 30 }}
                />
              )}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.actionTaken.other}
                    onChange={(e) => handleNestedChange('actionTaken', 'other', e.target.checked)}
                  />
                }
                label="Other"
              />
              {formData.actionTaken.other && (
                <TextField
                  fullWidth
                  label="Please specify"
                  value={formData.actionTaken.otherDescription}
                  onChange={(e) => handleNestedChange('actionTaken', 'otherDescription', e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ mt: 1 }}
                />
              )}
            </FormGroup>
          </Paper>
        </Grid>

        {/* Follow-up */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Follow-up (Optional)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.followUpRequired}
                      onChange={(e) => handleChange('followUpRequired', e.target.checked)}
                    />
                  }
                  label="Follow-up required"
                />
              </Grid>
              {formData.followUpRequired && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Follow-up Date"
                      type="date"
                      value={formData.followUpDate}
                      onChange={(e) => handleChange('followUpDate', e.target.value)}
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Follow-up Notes"
                      value={formData.followUpNotes}
                      onChange={(e) => handleChange('followUpNotes', e.target.value)}
                      variant="outlined"
                      multiline
                      rows={3}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Form Preview</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" align="center" gutterBottom>
              Student Disciplinary Action Form
            </Typography>
            
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>School Information</Typography>
            <Typography variant="body2">School Name: {formData.schoolName}</Typography>
            <Typography variant="body2">Date: {formData.date}</Typography>
            <Typography variant="body2">Warning Number: {formData.warningNumber}</Typography>
            
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Student Information</Typography>
            <Typography variant="body2">Full Name: {formData.studentName}</Typography>
            <Typography variant="body2">Grade/Class: {formData.grade}</Typography>
            <Typography variant="body2">Section: {formData.section}</Typography>
            <Typography variant="body2">Roll Number: {formData.rollNumber}</Typography>
            <Typography variant="body2">Parent/Guardian Name: {formData.parentGuardianName}</Typography>
            <Typography variant="body2">Contact Number: {formData.contactNumber}</Typography>
            
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Incident Details</Typography>
            <Typography variant="body2">Date of Incident: {formData.dateOfIncident}</Typography>
            <Typography variant="body2">Time of Incident: {formData.timeOfIncident}</Typography>
            <Typography variant="body2">Location: {formData.location}</Typography>
            <Typography variant="body2">Reporting Staff Name: {formData.reportingStaffName}</Typography>
            <Typography variant="body2">Description: {formData.descriptionOfIncident}</Typography>
            
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Type of Misconduct</Typography>
            {Object.entries(formData.typeOfMisconduct).map(([key, value]) => {
              if (key === 'otherDescription') return null;
              const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              return value && (
                <Typography key={key} variant="body2">
                  ✓ {label} {key === 'other' && formData.typeOfMisconduct.otherDescription && `(${formData.typeOfMisconduct.otherDescription})`}
                </Typography>
              );
            })}
            
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Action Taken</Typography>
            {Object.entries(formData.actionTaken).map(([key, value]) => {
              if (key === 'otherDescription' || key === 'suspension') return null;
              const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              return value && (
                <Typography key={key} variant="body2">
                  ✓ {label} {key === 'other' && formData.actionTaken.otherDescription && `(${formData.actionTaken.otherDescription})`}
                </Typography>
              );
            })}
            {formData.actionTaken.suspension.selected && (
              <Typography variant="body2">
                ✓ Suspension ({formData.actionTaken.suspension.numberOfDays} days)
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
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

export default DisciplinaryFormCreate; 