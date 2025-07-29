import React from 'react';
import { useQuery } from '@tanstack/react-query';
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
  CircularProgress,
  Alert,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  ArrowBack,
  Download,
  Edit,
  LocalShipping,
  Person,
  School,
  Schedule,
  LocationOn,
  AccessTime,
  CalendarToday,
  Description,
  CheckCircle,
  Cancel,
  Pending,
  Warning,
  ExpandMore,
  Phone,
  Email,
  Business
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { parentAPI } from '../../services/api';

const ParentTransportFormView = () => {
  const { formId } = useParams();
  const navigate = useNavigate();

  // Fetch transport form details
  const { data: formResponse, isLoading, error } = useQuery({
    queryKey: ['transportForm', formId],
    queryFn: () => parentAPI.getTransportFormById(formId),
    onError: (error) => {
      console.error('Failed to fetch transport form:', error);
    }
  });

  const form = formResponse?.data;

  const handleDownloadPDF = async () => {
    try {
      toast.info('Downloading PDF...');
      
      const pdfBlob = await parentAPI.downloadTransportFormPDF(formId);
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Transport_Form_${form?.studentFullName}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF downloaded successfully');
      
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

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

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load transport form: {error.response?.data?.message || error.message}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/parent/transport-forms')}
        >
          Back to List
        </Button>
      </Box>
    );
  }

  if (!form) {
    return (
      <Box p={3}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Transport form not found
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/parent/transport-forms')}
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
        <Box>
          <Typography variant="h5" gutterBottom>
            Transport Form Details
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Form ID: {form._id}
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleDownloadPDF}
          >
            Download PDF
          </Button>
          {form.status === 'pending' && (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => navigate(`/parent/transport-forms/${formId}/edit`)}
            >
              Edit Form
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/parent/transport-forms')}
          >
            Back to List
          </Button>
        </Box>
      </Box>

      {/* Status Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" gutterBottom>
                {form.studentFullName}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {form.gradeClassSection} • {form.rollNumber}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Created on {new Date(form.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
            <Chip
              icon={getStatusIcon(form.status)}
              label={form.status.charAt(0).toUpperCase() + form.status.slice(1)}
              color={getStatusColor(form.status)}
              size="large"
              sx={{ fontSize: '1rem', px: 2, py: 1 }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Form Details */}
      <Grid container spacing={3}>
        {/* Student Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                Student Information
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText
                    primary="Student Name"
                    secondary={form.studentFullName}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <School />
                  </ListItemIcon>
                  <ListItemText
                    primary="Grade/Class & Section"
                    secondary={form.gradeClassSection}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Business />
                  </ListItemIcon>
                  <ListItemText
                    primary="Roll Number"
                    secondary={form.rollNumber}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <School />
                  </ListItemIcon>
                  <ListItemText
                    primary="School Name"
                    secondary={form.schoolName}
                  />
                </ListItem>
                {form.departmentClass && (
                  <ListItem>
                    <ListItemIcon>
                      <School />
                    </ListItemIcon>
                    <ListItemText
                      primary="Department/Class"
                      secondary={form.departmentClass}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Request Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Description sx={{ mr: 1, verticalAlign: 'middle' }} />
                Request Information
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CalendarToday />
                  </ListItemIcon>
                  <ListItemText
                    primary="Date of Request"
                    secondary={new Date(form.dateOfRequest).toLocaleDateString()}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocalShipping />
                  </ListItemIcon>
                  <ListItemText
                    primary="Request Type"
                    secondary={getRequestTypeLabel(form.requestType)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Schedule />
                  </ListItemIcon>
                  <ListItemText
                    primary="Trip Type"
                    secondary={form.tripType === 'one-way' ? 'One-way' : 'Round-trip'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText
                    primary="Number of Students"
                    secondary={form.numberOfStudents}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Transport Details */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <LocalShipping sx={{ mr: 1, verticalAlign: 'middle' }} />
                Transport Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <LocationOn />
                      </ListItemIcon>
                      <ListItemText
                        primary="Pickup Location"
                        secondary={form.pickupLocation}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <LocationOn />
                      </ListItemIcon>
                      <ListItemText
                        primary="Drop Location"
                        secondary={form.dropLocation}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarToday />
                      </ListItemIcon>
                      <ListItemText
                        primary="Date Required From"
                        secondary={new Date(form.dateRequiredFrom).toLocaleDateString()}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarToday />
                      </ListItemIcon>
                      <ListItemText
                        primary="Date Required To"
                        secondary={new Date(form.dateRequiredTo).toLocaleDateString()}
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <AccessTime />
                      </ListItemIcon>
                      <ListItemText
                        primary="Pickup Time"
                        secondary={form.pickupTime}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <AccessTime />
                      </ListItemIcon>
                      <ListItemText
                        primary="Drop Time"
                        secondary={form.dropTime}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Description />
                      </ListItemIcon>
                      <ListItemText
                        primary="Purpose of Transportation"
                        secondary={form.purposeOfTransportation}
                      />
                    </ListItem>
                    {form.specialInstructions && (
                      <ListItem>
                        <ListItemIcon>
                          <Description />
                        </ListItemIcon>
                        <ListItemText
                          primary="Special Instructions"
                          secondary={form.specialInstructions}
                        />
                      </ListItem>
                    )}
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Admin Response (if available) */}
        {(form.status === 'approved' || form.status === 'rejected' || form.status === 'completed') && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Admin Response
                </Typography>
                <Grid container spacing={3}>
                  {form.coordinatorName && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2">
                        <strong>Coordinator:</strong> {form.coordinatorName}
                      </Typography>
                    </Grid>
                  )}
                  {form.coordinatorSignatureDate && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2">
                        <strong>Response Date:</strong> {new Date(form.coordinatorSignatureDate).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  )}
                  {form.coordinatorComments && (
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Comments:</strong> {form.coordinatorComments}
                      </Typography>
                    </Grid>
                  )}
                  {form.assignedVehicle && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2">
                        <strong>Assigned Vehicle:</strong> {form.assignedVehicle}
                      </Typography>
                    </Grid>
                  )}
                  {form.assignedDriver && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2">
                        <strong>Assigned Driver:</strong> {form.assignedDriver}
                      </Typography>
                    </Grid>
                  )}
                  {form.driverContact && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2">
                        <strong>Driver Contact:</strong> {form.driverContact}
                      </Typography>
                    </Grid>
                  )}
                  {form.estimatedCost && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2">
                        <strong>Estimated Cost:</strong> ${form.estimatedCost}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Form History */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                Form History
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Schedule />
                  </ListItemIcon>
                  <ListItemText
                    primary="Created"
                    secondary={`${new Date(form.createdAt).toLocaleDateString()} at ${new Date(form.createdAt).toLocaleTimeString()}`}
                  />
                </ListItem>
                {form.submittedAt && (
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle />
                    </ListItemIcon>
                    <ListItemText
                      primary="Submitted"
                      secondary={`${new Date(form.submittedAt).toLocaleDateString()} at ${new Date(form.submittedAt).toLocaleTimeString()}`}
                    />
                  </ListItem>
                )}
                {form.approvedAt && (
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle />
                    </ListItemIcon>
                    <ListItemText
                      primary="Approved"
                      secondary={`${new Date(form.approvedAt).toLocaleDateString()} at ${new Date(form.approvedAt).toLocaleTimeString()}`}
                    />
                  </ListItem>
                )}
                {form.completedAt && (
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle />
                    </ListItemIcon>
                    <ListItemText
                      primary="Completed"
                      secondary={`${new Date(form.completedAt).toLocaleDateString()} at ${new Date(form.completedAt).toLocaleTimeString()}`}
                    />
                  </ListItem>
                )}
                {form.updatedAt && form.updatedAt !== form.createdAt && (
                  <ListItem>
                    <ListItemIcon>
                      <Schedule />
                    </ListItemIcon>
                    <ListItemText
                      primary="Last Updated"
                      secondary={`${new Date(form.updatedAt).toLocaleDateString()} at ${new Date(form.updatedAt).toLocaleTimeString()}`}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ParentTransportFormView; 