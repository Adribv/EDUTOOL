import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Computer,
  Build,
  Send,
  History,
  Visibility,
  Add as AddIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const ServiceRequestsTab = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [createDialog, setCreateDialog] = useState(false);
  const [requestType, setRequestType] = useState('ITSupportRequest');
  
  // Form state for IT Support Request
  const [itSupportForm, setItSupportForm] = useState({
    requesterInfo: {
      name: user?.name || '',
      designationRole: 'Principal',
      departmentClass: user?.department || '',
      contactNumber: user?.phone || '',
      emailAddress: user?.email || ''
    },
    deviceEquipmentInfo: {
      typeOfDevice: '',
      deviceAssetId: '',
      operatingSystem: '',
      otherDeviceType: ''
    },
    issueDescription: '',
    priorityLevel: '',
    requestedAction: '',
    preferredContactTime: '',
    requesterSignature: '',
    acknowledgment: false
  });

  // Form state for General Service Request
  const [generalServiceForm, setGeneralServiceForm] = useState({
    requesterName: user?.name || '',
    employeeId: user?.employeeId || '',
    department: user?.department || '',
    designation: user?.role || '',
    contactNumber: user?.phone || '',
    email: user?.email || '',
    serviceCategory: '',
    serviceLocation: '',
    preferredDate: '',
    preferredTime: '',
    description: '',
    budgetEstimate: '',
    urgencyLevel: '',
    specialRequirements: ''
  });

  const [errors, setErrors] = useState({});



  const priorityLevels = [
    'Low - Minor inconvenience',
    'Medium - Work impacted, workaround possible',
    'High - Work halted, needs urgent resolution'
  ];

  const requestedActions = [
    'Troubleshoot & Fix', 'Replace Device/Part', 'Software Installation/Update', 
    'Network Configuration', 'Other'
  ];

  const serviceCategories = [
    'Administrative', 'Facility', 'Security', 'Transportation', 'Catering',
    'Events', 'Maintenance', 'Cleaning', 'Medical', 'Library', 'Sports', 'Other'
  ];

  useEffect(() => {
    if (activeTab === 1) {
      fetchRequests();
    }
  }, [activeTab]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/principal/service-requests');
      setRequests(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch service requests');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    if (section) {
      if (requestType === 'ITSupportRequest') {
        setItSupportForm(prev => ({
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        }));
      } else {
        setGeneralServiceForm(prev => ({
          ...prev,
          [field]: value
        }));
      }
    } else {
      if (requestType === 'ITSupportRequest') {
        setItSupportForm(prev => ({
          ...prev,
          [field]: value
        }));
      } else {
        setGeneralServiceForm(prev => ({
          ...prev,
          [field]: value
        }));
      }
    }
    
    // Clear error when user starts typing
    if (errors[field] || (section && errors[`${section}.${field}`])) {
      const newErrors = { ...errors };
      delete newErrors[field];
      delete newErrors[`${section}.${field}`];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (requestType === 'ITSupportRequest') {
      if (!itSupportForm.issueDescription.trim()) {
        newErrors.issueDescription = 'Issue description is required';
      }
      if (!itSupportForm.priorityLevel) {
        newErrors.priorityLevel = 'Priority level is required';
      }
      if (!itSupportForm.requestedAction) {
        newErrors.requestedAction = 'Requested action is required';
      }
      if (!itSupportForm.requesterSignature.trim()) {
        newErrors.requesterSignature = 'Digital signature is required';
      }
      if (!itSupportForm.acknowledgment) {
        newErrors.acknowledgment = 'You must confirm the acknowledgment';
      }
      if (!itSupportForm.deviceEquipmentInfo.typeOfDevice) {
        newErrors['deviceEquipmentInfo.typeOfDevice'] = 'Device type is required';
      }
    } else {
      if (!generalServiceForm.description.trim()) {
        newErrors.description = 'Service description is required';
      }
      if (!generalServiceForm.serviceCategory) {
        newErrors.serviceCategory = 'Service category is required';
      }
      if (!generalServiceForm.serviceLocation.trim()) {
        newErrors.serviceLocation = 'Service location is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const submissionData = requestType === 'ITSupportRequest' 
        ? {
            ...itSupportForm,
            requesterType: 'Principal'
          }
        : {
            ...generalServiceForm,
            requesterType: 'Principal',
            requestType: 'GeneralServiceRequest'
          };

      const response = await api.post('/principal/service-requests', submissionData);
      toast.success(`Service Request submitted successfully! Request Number: ${response.data.requestNumber || 'Pending'}`);
      
      // Reset forms
      setItSupportForm({
        requesterInfo: {
          name: user?.name || '',
          designationRole: 'Principal',
          departmentClass: user?.department || '',
          contactNumber: user?.phone || '',
          emailAddress: user?.email || ''
        },
        deviceEquipmentInfo: {
          typeOfDevice: '',
          deviceAssetId: '',
          operatingSystem: '',
          otherDeviceType: ''
        },
        issueDescription: '',
        priorityLevel: '',
        requestedAction: '',
        preferredContactTime: '',
        requesterSignature: '',
        acknowledgment: false
      });

      setGeneralServiceForm({
        requesterName: user?.name || '',
        employeeId: user?.employeeId || '',
        department: user?.department || '',
        designation: user?.role || '',
        contactNumber: user?.phone || '',
        email: user?.email || '',
        serviceCategory: '',
        serviceLocation: '',
        preferredDate: '',
        preferredTime: '',
        description: '',
        budgetEstimate: '',
        urgencyLevel: '',
        specialRequirements: ''
      });

      setErrors({});
      setCreateDialog(false);
      
      // Switch to history tab
      setActiveTab(1);
    } catch (error) {
      console.error('Error submitting service request:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit service request';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      case 'Pending': return 'warning';
      case 'In Progress': return 'info';
      default: return 'default';
    }
  };

  const getRequestTypeIcon = (type) => {
    switch (type) {
      case 'ITSupportRequest': return <Computer />;
      case 'GeneralServiceRequest': return <Build />;
      default: return <Computer />;
    }
  };

  return (
    <Box>
      {/* Tabs */}
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, v) => setActiveTab(v)} 
          variant="fullWidth"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.9rem',
              minHeight: 64
            }
          }}
        >
          <Tab label="New Request" icon={<AddIcon />} />
          <Tab label="Request History" icon={<History />} />
        </Tabs>
      </Paper>

      {/* New Request Tab */}
      {activeTab === 0 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">Create New Service Request</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialog(true)}
            >
              Create Request
            </Button>
          </Box>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              You can create IT support requests for technical issues and general service requests for administrative, facility, or other services.
            </Typography>
          </Alert>
        </Box>
      )}

      {/* Request History Tab */}
      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>Service Request History</Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : requests.length === 0 ? (
            <Alert severity="info">
              No service requests found. Create your first request to get started.
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Request #</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell>{request.requestNumber || 'Pending'}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {getRequestTypeIcon(request.requestType)}
                          {request.requestType === 'ITSupportRequest' ? 'IT Support' : 'General Service'}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={request.status} 
                          color={getStatusColor(request.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {request.priorityLevel || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {new Date(request.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Create Request Dialog */}
      <Dialog 
        open={createDialog} 
        onClose={() => setCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Create Service Request</Typography>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Request Type</InputLabel>
              <Select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                label="Request Type"
              >
                <MenuItem value="ITSupportRequest">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Computer />
                    IT Support Request
                  </Box>
                </MenuItem>
                <MenuItem value="GeneralServiceRequest">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Build />
                    General Service Request
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {requestType === 'ITSupportRequest' ? (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  {/* Issue Description */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Issue Description *"
                      multiline
                      rows={4}
                      value={itSupportForm.issueDescription}
                      onChange={(e) => handleInputChange(null, 'issueDescription', e.target.value)}
                      error={!!errors.issueDescription}
                      helperText={errors.issueDescription || 'Please describe the issue in detail...'}
                      placeholder="Describe the problem you are experiencing..."
                    />
                  </Grid>
                  
                  {/* Priority Level */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.priorityLevel}>
                      <InputLabel>Priority Level *</InputLabel>
                      <Select
                        value={itSupportForm.priorityLevel}
                        onChange={(e) => handleInputChange(null, 'priorityLevel', e.target.value)}
                        label="Priority Level *"
                      >
                        {priorityLevels.map((level) => (
                          <MenuItem key={level} value={level}>{level}</MenuItem>
                        ))}
                      </Select>
                      {errors.priorityLevel && (
                        <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                          {errors.priorityLevel}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  
                  {/* Requested Action */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.requestedAction}>
                      <InputLabel>Requested Action *</InputLabel>
                      <Select
                        value={itSupportForm.requestedAction}
                        onChange={(e) => handleInputChange(null, 'requestedAction', e.target.value)}
                        label="Requested Action *"
                      >
                        {requestedActions.map((action) => (
                          <MenuItem key={action} value={action}>{action}</MenuItem>
                        ))}
                      </Select>
                      {errors.requestedAction && (
                        <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                          {errors.requestedAction}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  
                  {/* Digital Signature */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Digital Signature (Type your full name) *"
                      value={itSupportForm.requesterSignature}
                      onChange={(e) => handleInputChange(null, 'requesterSignature', e.target.value)}
                      error={!!errors.requesterSignature}
                      helperText={errors.requesterSignature || 'Type your full name as digital signature'}
                      placeholder="Type your full name here"
                    />
                  </Grid>
                  
                  {/* Submit Button */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                        sx={{ minWidth: 200 }}
                      >
                        {loading ? 'Submitting...' : 'Submit IT Support Request'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            ) : (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  {/* Service Category */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.serviceCategory}>
                      <InputLabel>Service Category *</InputLabel>
                      <Select
                        value={generalServiceForm.serviceCategory}
                        onChange={(e) => handleInputChange(null, 'serviceCategory', e.target.value)}
                        label="Service Category *"
                      >
                        {serviceCategories.map((category) => (
                          <MenuItem key={category} value={category}>{category}</MenuItem>
                        ))}
                      </Select>
                      {errors.serviceCategory && (
                        <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                          {errors.serviceCategory}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  
                  {/* Service Location */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Service Location *"
                      value={generalServiceForm.serviceLocation}
                      onChange={(e) => handleInputChange(null, 'serviceLocation', e.target.value)}
                      error={!!errors.serviceLocation}
                      helperText={errors.serviceLocation}
                      placeholder="e.g., Room 101, Main Hall, Parking Area"
                    />
                  </Grid>
                  
                  {/* Service Description */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Service Description *"
                      multiline
                      rows={4}
                      value={generalServiceForm.description}
                      onChange={(e) => handleInputChange(null, 'description', e.target.value)}
                      error={!!errors.description}
                      helperText={errors.description || 'Please provide detailed description of the service required...'}
                      placeholder="Please provide detailed description of the service required, including specific requirements, quantity, specifications, etc."
                    />
                  </Grid>
                  
                  {/* Submit Button */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                        sx={{ minWidth: 200 }}
                      >
                        {loading ? 'Submitting...' : 'Submit General Service Request'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServiceRequestsTab; 