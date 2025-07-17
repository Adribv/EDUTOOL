import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Download,
  CheckCircle,
  Cancel,
  Pending,
  Warning,
  ExpandMore,
  LocalShipping,
  Person,
  School,
  Schedule,
  LocationOn,
  Description,
  Save
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { transportAPI } from '../../services/api';

const TransportFormView = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusData, setStatusData] = useState({
    status: '',
    coordinatorComments: '',
    assignedVehicle: '',
    assignedDriver: '',
    driverContact: '',
    estimatedCost: ''
  });

  // Fetch form data
  const { data: formResponse, isLoading, error } = useQuery({
    queryKey: ['transportForm', formId],
    queryFn: () => transportAPI.getFormById(formId),
    onError: (error) => {
      console.error('Failed to fetch transport form:', error);
    }
  });

  const form = formResponse?.data;

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (data) => transportAPI.updateFormStatus(formId, data),
    onSuccess: () => {
      toast.success('Transport form status updated successfully');
      queryClient.invalidateQueries(['transportForm', formId]);
      queryClient.invalidateQueries(['transportForms']);
      setStatusDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update transport form status');
    }
  });

  // Download PDF mutation
  const downloadMutation = useMutation({
    mutationFn: () => transportAPI.downloadFormPDF(formId),
    onSuccess: (pdfBlob) => {
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Transport_Form_${form?.studentFullName}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully');
    },
    onError: (error) => {
      toast.error('Failed to download PDF');
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Pending />;
      case 'approved': return <CheckCircle />;
      case 'rejected': return <Cancel />;
      case 'completed': return <CheckCircle />;
      default: return <Warning />;
    }
  };

  const getRequestTypeLabel = (requestType) => {
    if (!requestType) return 'N/A';
    
    const types = [];
    const labels = {
      regularSchoolCommute: 'Regular School Commute',
      educationalTrip: 'Educational Trip',
      sportsEvent: 'Sports Event',
      culturalFieldVisit: 'Cultural/Field Visit',
      emergencyTransport: 'Emergency Transport',
      other: 'Other'
    };
    
    Object.entries(requestType).forEach(([key, value]) => {
      if (key !== 'otherDescription' && value) {
        const label = labels[key] || key;
        if (key === 'other' && requestType.otherDescription) {
          types.push(`${label} (${requestType.otherDescription})`);
        } else {
          types.push(label);
        }
      }
    });
    
    return types.join(', ') || 'N/A';
  };

  const handleStatusUpdate = () => {
    updateStatusMutation.mutate(statusData);
  };

  const handleDownloadPDF = () => {
    downloadMutation.mutate();
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
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load transport form: {error?.response?.data?.message || error?.message || 'Form not found'}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/transport-forms')}
        >
          Back to List
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Transport Services Request Form</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/admin/transport-forms')}
            sx={{ mr: 1 }}
          >
            Back to List
          </Button>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => navigate(`/admin/transport-forms/${formId}/edit`)}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleDownloadPDF}
            disabled={downloadMutation.isLoading}
          >
            Download PDF
          </Button>
        </Box>
      </Box>

      {/* Status Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" gutterBottom>
                Transport Form Status
              </Typography>
              <Chip
                icon={getStatusIcon(form.status)}
                label={form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                color={getStatusColor(form.status)}
                size="large"
              />
            </Box>
            <Button
              variant="contained"
              onClick={() => setStatusDialogOpen(true)}
              startIcon={<Edit />}
            >
              Update Status
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Form Details */}
      <Grid container spacing={3}>
        {/* School Details */}
        <Grid item xs={12} md={6}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <School sx={{ mr: 1 }} />
              <Typography variant="h6">School Details</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2"><strong>School Name:</strong></Typography>
                  <Typography variant="body1">{form.schoolName}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2"><strong>Department/Class:</strong></Typography>
                  <Typography variant="body1">{form.departmentClass || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2"><strong>Date of Request:</strong></Typography>
                  <Typography variant="body1">{new Date(form.dateOfRequest).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2"><strong>Request Type:</strong></Typography>
                  <Typography variant="body1">{getRequestTypeLabel(form.requestType)}</Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Student Information */}
        <Grid item xs={12} md={6}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Person sx={{ mr: 1 }} />
              <Typography variant="h6">Student Information</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2"><strong>Full Name:</strong></Typography>
                  <Typography variant="body1">{form.studentFullName}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2"><strong>Grade/Class & Section:</strong></Typography>
                  <Typography variant="body1">{form.gradeClassSection}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2"><strong>Roll Number:</strong></Typography>
                  <Typography variant="body1">{form.rollNumber}</Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Parent Information */}
        <Grid item xs={12} md={6}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Person sx={{ mr: 1 }} />
              <Typography variant="h6">Parent/Guardian Information</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2"><strong>Name:</strong></Typography>
                  <Typography variant="body1">{form.parentGuardianName}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2"><strong>Contact Number:</strong></Typography>
                  <Typography variant="body1">{form.contactNumber}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2"><strong>Address (Pickup/Drop):</strong></Typography>
                  <Typography variant="body1">{form.pickupDropAddress}</Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Transport Details */}
        <Grid item xs={12} md={6}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <LocalShipping sx={{ mr: 1 }} />
              <Typography variant="h6">Transport Details</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2"><strong>Pickup Location:</strong></Typography>
                  <Typography variant="body1">{form.pickupLocation}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2"><strong>Drop Location:</strong></Typography>
                  <Typography variant="body1">{form.dropLocation}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2"><strong>Date Required:</strong></Typography>
                  <Typography variant="body1">
                    {new Date(form.dateRequiredFrom).toLocaleDateString()} to {new Date(form.dateRequiredTo).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2"><strong>Pickup Time:</strong></Typography>
                  <Typography variant="body1">{form.pickupTime}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2"><strong>Drop Time:</strong></Typography>
                  <Typography variant="body1">{form.dropTime}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2"><strong>Trip Type:</strong></Typography>
                  <Typography variant="body1">{form.tripType === 'one-way' ? 'One-way' : 'Round-trip'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2"><strong>Number of Students:</strong></Typography>
                  <Typography variant="body1">{form.numberOfStudents}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2"><strong>Purpose of Transportation:</strong></Typography>
                  <Typography variant="body1">{form.purposeOfTransportation}</Typography>
                </Grid>
                {form.specialInstructions && (
                  <Grid item xs={12}>
                    <Typography variant="body2"><strong>Special Instructions:</strong></Typography>
                    <Typography variant="body1">{form.specialInstructions}</Typography>
                  </Grid>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Assignment Details (if approved) */}
        {(form.assignedVehicle || form.assignedDriver) && (
          <Grid item xs={12}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <LocalShipping sx={{ mr: 1 }} />
                <Typography variant="h6">Transport Assignment</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2"><strong>Assigned Vehicle:</strong></Typography>
                    <Typography variant="body1">{form.assignedVehicle || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2"><strong>Assigned Driver:</strong></Typography>
                    <Typography variant="body1">{form.assignedDriver || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2"><strong>Driver Contact:</strong></Typography>
                    <Typography variant="body1">{form.driverContact || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2"><strong>Estimated Cost:</strong></Typography>
                    <Typography variant="body1">{form.estimatedCost ? `$${form.estimatedCost}` : 'N/A'}</Typography>
                  </Grid>
                  {form.coordinatorComments && (
                    <Grid item xs={12}>
                      <Typography variant="body2"><strong>Coordinator Comments:</strong></Typography>
                      <Typography variant="body1">{form.coordinatorComments}</Typography>
                    </Grid>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}

        {/* Form Metadata */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Description sx={{ mr: 1 }} />
              <Typography variant="h6">Form Metadata</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2"><strong>Created By:</strong></Typography>
                  <Typography variant="body1">{form.createdByName} ({form.createdByRole})</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2"><strong>Created Date:</strong></Typography>
                  <Typography variant="body1">{new Date(form.createdAt).toLocaleDateString()}</Typography>
                </Grid>
                {form.approvedAt && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2"><strong>Approved Date:</strong></Typography>
                    <Typography variant="body1">{new Date(form.approvedAt).toLocaleDateString()}</Typography>
                  </Grid>
                )}
                {form.coordinatorName && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2"><strong>Coordinator:</strong></Typography>
                    <Typography variant="body1">{form.coordinatorName}</Typography>
                  </Grid>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>

      {/* Status Update Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Update Transport Form Status</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusData.status}
                  label="Status"
                  onChange={(e) => setStatusData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Estimated Cost"
                type="number"
                value={statusData.estimatedCost}
                onChange={(e) => setStatusData(prev => ({ ...prev, estimatedCost: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Assigned Vehicle"
                value={statusData.assignedVehicle}
                onChange={(e) => setStatusData(prev => ({ ...prev, assignedVehicle: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Assigned Driver"
                value={statusData.assignedDriver}
                onChange={(e) => setStatusData(prev => ({ ...prev, assignedDriver: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Driver Contact"
                value={statusData.driverContact}
                onChange={(e) => setStatusData(prev => ({ ...prev, driverContact: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Coordinator Comments"
                multiline
                rows={3}
                value={statusData.coordinatorComments}
                onChange={(e) => setStatusData(prev => ({ ...prev, coordinatorComments: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            disabled={updateStatusMutation.isLoading}
            startIcon={updateStatusMutation.isLoading ? <CircularProgress size={20} /> : <Save />}
          >
            {updateStatusMutation.isLoading ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransportFormView; 