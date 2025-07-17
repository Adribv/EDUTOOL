import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  FormControlLabel,
  Checkbox,
  FormGroup,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Chip,
  FormHelperText
} from '@mui/material';
import {
  Save,
  Cancel,
  ArrowBack,
  LocalShipping,
  Person,
  School,
  Schedule,
  LocationOn,
  Description,
  CheckCircle
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { parentAPI } from '../../services/api';

const steps = ['Student Selection', 'Transport Details', 'Review & Submit'];

const ParentTransportFormCreate = () => {
  const navigate = useNavigate();
  const { formId } = useParams();
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Student Information
    rollNumber: '',
    studentFullName: '',
    gradeClassSection: '',

    // School Details
    schoolName: '',
    departmentClass: '',
    dateOfRequest: new Date().toISOString().split('T')[0],
    requestType: {
      regularSchoolCommute: false,
      educationalTrip: false,
      sportsEvent: false,
      culturalFieldVisit: false,
      emergencyTransport: false,
      other: false,
      otherDescription: ''
    },

    // Transport Details
    pickupLocation: '',
    dropLocation: '',
    dateRequiredFrom: '',
    dateRequiredTo: '',
    pickupTime: '',
    dropTime: '',
    tripType: 'round-trip',
    numberOfStudents: 1,
    purposeOfTransportation: '',
    specialInstructions: ''
  });

  // Fetch parent's children
  const { data: childrenResponse, isLoading: childrenLoading, error: childrenError } = useQuery({
    queryKey: ['parentChildren'],
    queryFn: () => parentAPI.getChildren(),
    onError: (error) => {
      console.error('Failed to fetch children:', error);
    }
  });

  // Debug logging
  console.log('🔍 Children response:', childrenResponse);
  console.log('🔍 Children loading:', childrenLoading);
  console.log('🔍 Children error:', childrenError);

  // Extract children array from response - handle different response structures
  const children = (() => {
    if (!childrenResponse) return [];
    
    // If response is already an array
    if (Array.isArray(childrenResponse)) {
      return childrenResponse;
    }
    
    // If response has a data property that's an array
    if (childrenResponse.data && Array.isArray(childrenResponse.data)) {
      return childrenResponse.data;
    }
    
    // If response has a data property that's not an array, try to extract
    if (childrenResponse.data && !Array.isArray(childrenResponse.data)) {
      console.warn('⚠️ Children response.data is not an array:', childrenResponse.data);
      return [];
    }
    
    // Fallback
    console.warn('⚠️ Unexpected children response structure:', childrenResponse);
    return [];
  })();

  console.log('🔍 Final children array:', children);

  // Fetch existing form if editing
  const { data: existingForm } = useQuery({
    queryKey: ['transportForm', formId],
    queryFn: () => parentAPI.getTransportFormById(formId),
    enabled: !!formId,
    onSuccess: (data) => {
      if (data?.data) {
        setFormData(data.data);
      }
    }
  });

  // Create/Update form mutation
  const formMutation = useMutation({
    mutationFn: (data) => {
      if (formId) {
        return parentAPI.updateTransportForm(formId, data);
      } else {
        return parentAPI.createTransportForm(data);
      }
    },
    onSuccess: (response) => {
      toast.success(formId ? 'Transport form updated successfully' : 'Transport form created successfully');
      queryClient.invalidateQueries(['parentTransportForms']);
      navigate('/parent/transport-forms');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || `Failed to ${formId ? 'update' : 'create'} transport form`);
    }
  });

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleRequestTypeChange = (type, checked) => {
    setFormData(prev => ({
      ...prev,
      requestType: {
        ...prev.requestType,
        [type]: checked
      }
    }));
  };

  const handleStudentChange = (rollNumber) => {
    const selectedChild = children.find(child => child.rollNumber === rollNumber);
    if (selectedChild) {
      setFormData(prev => ({
        ...prev,
        rollNumber: selectedChild.rollNumber,
        studentFullName: selectedChild.name,
        gradeClassSection: `${selectedChild.class} ${selectedChild.section}`,
        schoolName: selectedChild.schoolName || 'School Name'
      }));
    }
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = () => {
    // Validate required fields
    const requiredFields = {
      rollNumber: 'Student',
      studentFullName: 'Student Full Name',
      gradeClassSection: 'Grade/Class & Section',
      schoolName: 'School Name',
      pickupLocation: 'Pickup Location',
      dropLocation: 'Drop Location',
      dateRequiredFrom: 'Date Required From',
      dateRequiredTo: 'Date Required To',
      pickupTime: 'Pickup Time',
      dropTime: 'Drop Time',
      purposeOfTransportation: 'Purpose of Transportation'
    };

    const missingFields = [];
    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        missingFields.push(label);
      }
    });

    // Check if at least one request type is selected
    const hasRequestType = Object.entries(formData.requestType).some(([key, value]) => 
      key !== 'otherDescription' && value
    );
    if (!hasRequestType) {
      missingFields.push('Request Type');
    }

    if (missingFields.length > 0) {
      toast.error(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }

    formMutation.mutate(formData);
  };

  const getRequestTypeLabel = (type) => {
    const labels = {
      regularSchoolCommute: 'Regular School Commute',
      educationalTrip: 'Educational Trip',
      sportsEvent: 'Sports Event',
      culturalFieldVisit: 'Cultural/Field Visit',
      emergencyTransport: 'Emergency Transport',
      other: 'Other'
    };
    return labels[type] || type;
  };

  const renderStudentSelection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
          Select Student
        </Typography>
      </Grid>
      
      {/* Loading state */}
      {childrenLoading && (
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress size={20} />
            <Typography>Loading your children...</Typography>
          </Box>
        </Grid>
      )}
      
      {/* Error state */}
      {childrenError && (
        <Grid item xs={12}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load children: {childrenError.message}
          </Alert>
        </Grid>
      )}
      
      {/* No children state */}
      {!childrenLoading && !childrenError && children.length === 0 && (
        <Grid item xs={12}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            No children found. Please make sure your children are properly linked to your account.
          </Alert>
        </Grid>
      )}
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth disabled={childrenLoading || children.length === 0}>
          <InputLabel>Select Student *</InputLabel>
          <Select
            value={formData.rollNumber}
            label="Select Student *"
            onChange={(e) => handleStudentChange(e.target.value)}
          >
            {children.map((child) => (
              <MenuItem key={child.rollNumber} value={child.rollNumber}>
                {child.name} - {child.rollNumber} ({child.class} {child.section})
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            {childrenLoading 
              ? 'Loading children...' 
              : children.length === 0 
                ? 'No children available' 
                : 'Choose the student for whom you\'re requesting transport'
            }
          </FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Student Full Name"
          value={formData.studentFullName}
          InputProps={{ readOnly: true }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Grade/Class & Section"
          value={formData.gradeClassSection}
          InputProps={{ readOnly: true }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="School Name"
          value={formData.schoolName}
          onChange={(e) => handleInputChange('schoolName', e.target.value)}
          required
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Department/Class (if applicable)"
          value={formData.departmentClass}
          onChange={(e) => handleInputChange('departmentClass', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Date of Request *"
          type="date"
          value={formData.dateOfRequest}
          onChange={(e) => handleInputChange('dateOfRequest', e.target.value)}
          InputLabelProps={{ shrink: true }}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          Request Type (Tick as applicable) *
        </Typography>
        <FormGroup row>
          {Object.entries(formData.requestType).map(([key, value]) => {
            if (key === 'otherDescription') return null;
            return (
              <FormControlLabel
                key={key}
                control={
                  <Checkbox
                    checked={value}
                    onChange={(e) => handleRequestTypeChange(key, e.target.checked)}
                  />
                }
                label={getRequestTypeLabel(key)}
              />
            );
          })}
        </FormGroup>
        {formData.requestType.other && (
          <TextField
            fullWidth
            label="Other Description"
            value={formData.requestType.otherDescription}
            onChange={(e) => handleInputChange('requestType.otherDescription', e.target.value)}
            sx={{ mt: 2 }}
          />
        )}
      </Grid>
    </Grid>
  );

  const renderTransportDetails = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          <LocalShipping sx={{ mr: 1, verticalAlign: 'middle' }} />
          Transport Details
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Pickup Location *"
          value={formData.pickupLocation}
          onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
          required
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Drop Location *"
          value={formData.dropLocation}
          onChange={(e) => handleInputChange('dropLocation', e.target.value)}
          required
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Date Required From *"
          type="date"
          value={formData.dateRequiredFrom}
          onChange={(e) => handleInputChange('dateRequiredFrom', e.target.value)}
          InputLabelProps={{ shrink: true }}
          required
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Date Required To *"
          type="date"
          value={formData.dateRequiredTo}
          onChange={(e) => handleInputChange('dateRequiredTo', e.target.value)}
          InputLabelProps={{ shrink: true }}
          required
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Pickup Time *"
          type="time"
          value={formData.pickupTime}
          onChange={(e) => handleInputChange('pickupTime', e.target.value)}
          InputLabelProps={{ shrink: true }}
          required
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Drop Time *"
          type="time"
          value={formData.dropTime}
          onChange={(e) => handleInputChange('dropTime', e.target.value)}
          InputLabelProps={{ shrink: true }}
          required
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Trip Type *</InputLabel>
          <Select
            value={formData.tripType}
            label="Trip Type *"
            onChange={(e) => handleInputChange('tripType', e.target.value)}
          >
            <MenuItem value="one-way">One-way</MenuItem>
            <MenuItem value="round-trip">Round-trip</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Number of Students (if group request)"
          type="number"
          value={formData.numberOfStudents}
          onChange={(e) => handleInputChange('numberOfStudents', parseInt(e.target.value) || 1)}
          inputProps={{ min: 1 }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Purpose of Transportation *"
          multiline
          rows={3}
          value={formData.purposeOfTransportation}
          onChange={(e) => handleInputChange('purposeOfTransportation', e.target.value)}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Special Instructions / Medical Conditions (if any)"
          multiline
          rows={3}
          value={formData.specialInstructions}
          onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
        />
      </Grid>
    </Grid>
  );

  const renderReview = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Review Form Details
        </Typography>
      </Grid>
      
      {/* Student Information Review */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Student Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2"><strong>Student:</strong> {formData.studentFullName}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2"><strong>Roll Number:</strong> {formData.rollNumber}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2"><strong>Grade/Class:</strong> {formData.gradeClassSection}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2"><strong>School:</strong> {formData.schoolName}</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Request Type Review */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Request Type
          </Typography>
          <Box sx={{ mt: 1 }}>
            {Object.entries(formData.requestType).map(([key, value]) => {
              if (key === 'otherDescription' || !value) return null;
              return (
                <Chip
                  key={key}
                  label={getRequestTypeLabel(key)}
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                />
              );
            })}
          </Box>
        </Paper>
      </Grid>

      {/* Transport Details Review */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Transport Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2"><strong>Pickup Location:</strong> {formData.pickupLocation}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2"><strong>Drop Location:</strong> {formData.dropLocation}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2"><strong>Dates:</strong> {formData.dateRequiredFrom} to {formData.dateRequiredTo}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2"><strong>Trip Type:</strong> {formData.tripType === 'one-way' ? 'One-way' : 'Round-trip'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2"><strong>Pickup Time:</strong> {formData.pickupTime}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2"><strong>Drop Time:</strong> {formData.dropTime}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2"><strong>Number of Students:</strong> {formData.numberOfStudents}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2"><strong>Purpose:</strong> {formData.purposeOfTransportation}</Typography>
            </Grid>
            {formData.specialInstructions && (
              <Grid item xs={12}>
                <Typography variant="body2"><strong>Special Instructions:</strong> {formData.specialInstructions}</Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderStudentSelection();
      case 1:
        return renderTransportDetails();
      case 2:
        return renderReview();
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          {formId ? 'Edit Transport Form' : 'Create Transport Form'}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/parent/transport-forms')}
        >
          Back to List
        </Button>
      </Box>

      {/* Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ py: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card>
        <CardContent>
          {getStepContent(activeStep)}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
        >
          Back
        </Button>
        <Box>
          <Button
            variant="outlined"
            onClick={() => navigate('/parent/transport-forms')}
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={formMutation.isLoading}
            startIcon={formMutation.isLoading ? <CircularProgress size={20} /> : <Save />}
          >
            {activeStep === steps.length - 1 ? 'Submit Form' : 'Next'}
          </Button>
        </Box>
      </Box>

      {/* Loading Overlay */}
      {formMutation.isLoading && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgcolor="rgba(0,0,0,0.5)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={9999}
        >
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>
              {formId ? 'Updating transport form...' : 'Creating transport form...'}
            </Typography>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default ParentTransportFormCreate; 