import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, Grid,
  FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress,
  Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Tooltip, Divider, FormControlLabel, Checkbox
} from '@mui/material';
import {
  Computer, Build, Send, History, Visibility, CheckCircle,
  Warning, Error, Schedule, Person, SupportAgent
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { principalAPI } from '../../services/api';

const ServiceRequests = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [requestType, setRequestType] = useState('ITSupportRequest');

  // IT Support Form State
  const [itSupportForm, setItSupportForm] = useState({
    dateOfRequest: new Date().toISOString().split('T')[0],
    requesterInfo: {
      name: user?.name || '',
      employeeId: user?.employeeId || '',
      department: user?.department || '',
      designation: user?.role || '',
      contactNumber: user?.phone || '',
      email: user?.email || '',
      location: ''
    },
    deviceEquipmentInfo: {
      deviceType: '',
      model: '',
      serialNumber: '',
      location: '',
      operatingSystem: ''
    },
    issueDescription: '',
    priorityLevel: 'Medium',
    requestedAction: '',
    preferredContactTime: '',
    acknowledgment: false
  });

  // General Service Form State
  const [generalServiceForm, setGeneralServiceForm] = useState({
    dateOfRequest: new Date().toISOString().split('T')[0],
    requesterInfo: {
      name: user?.name || '',
      employeeId: user?.employeeId || '',
      department: user?.department || '',
      designation: user?.role || '',
      contactNumber: user?.phone || '',
      email: user?.email || ''
    },
    serviceDetails: {
      serviceCategory: '',
      serviceType: '',
      description: '',
      priorityLevel: 'Medium',
      expectedCompletionDate: '',
      location: '',
      budget: '',
      specialRequirements: ''
    },
    acknowledgment: false
  });

  const [errors, setErrors] = useState({});

  const requestedActions = [
    'Hardware Repair', 'Software Installation', 'Network Issue Resolution',
    'Password Reset', 'Account Access', 'Training/Support', 'Equipment Replacement', 'Other'
  ];
  const serviceCategories = [
    'Facilities Management', 'Administrative Support', 'Event Planning',
    'Documentation', 'Training', 'Equipment', 'Maintenance', 'Other'
  ];

  useEffect(() => {
    if (activeTab === 1) {
      fetchRequests();
    }
  }, [activeTab]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await principalAPI.getServiceRequests();
      setRequests(response.data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    if (section === 'itSupport') {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        setItSupportForm(prev => ({
          ...prev,
          [parent]: { ...prev[parent], [child]: value }
        }));
      } else {
        setItSupportForm(prev => ({ ...prev, [field]: value }));
      }
    } else if (section === 'generalService') {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        setGeneralServiceForm(prev => ({
          ...prev,
          [parent]: { ...prev[parent], [child]: value }
        }));
      } else {
        setGeneralServiceForm(prev => ({ ...prev, [field]: value }));
      }
    }

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (requestType === 'ITSupportRequest') {
      if (!itSupportForm.requesterInfo.name.trim()) newErrors['requesterInfo.name'] = 'Name is required';
      if (!itSupportForm.requesterInfo.employeeId.trim()) newErrors['requesterInfo.employeeId'] = 'Employee ID is required';
      if (!itSupportForm.requesterInfo.department.trim()) newErrors['requesterInfo.department'] = 'Department is required';
      if (!itSupportForm.requesterInfo.contactNumber.trim()) newErrors['requesterInfo.contactNumber'] = 'Contact number is required';
      if (!itSupportForm.requesterInfo.email.trim()) newErrors['requesterInfo.email'] = 'Email is required';
      if (!itSupportForm.deviceEquipmentInfo.deviceType.trim()) newErrors['deviceEquipmentInfo.deviceType'] = 'Device type is required';
      if (!itSupportForm.issueDescription.trim()) newErrors.issueDescription = 'Issue description is required';
      if (!itSupportForm.requestedAction.trim()) newErrors.requestedAction = 'Requested action is required';
    } else {
      if (!generalServiceForm.requesterInfo.name.trim()) newErrors['requesterInfo.name'] = 'Name is required';
      if (!generalServiceForm.requesterInfo.employeeId.trim()) newErrors['requesterInfo.employeeId'] = 'Employee ID is required';
      if (!generalServiceForm.requesterInfo.department.trim()) newErrors['requesterInfo.department'] = 'Department is required';
      if (!generalServiceForm.requesterInfo.contactNumber.trim()) newErrors['requesterInfo.contactNumber'] = 'Contact number is required';
      if (!generalServiceForm.requesterInfo.email.trim()) newErrors['requesterInfo.email'] = 'Email is required';
      if (!generalServiceForm.serviceDetails.serviceCategory.trim()) newErrors['serviceDetails.serviceCategory'] = 'Service category is required';
      if (!generalServiceForm.serviceDetails.description.trim()) newErrors['serviceDetails.description'] = 'Description is required';
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

    setSaving(true);
    try {
      const payload = {
        requestType,
        requesterId: user?._id || user?.id,
        requesterType: 'Principal',
        status: 'Submitted',
        ...(requestType === 'ITSupportRequest' ? itSupportForm : generalServiceForm)
      };

      await principalAPI.createServiceRequest(payload);
      toast.success('Service request submitted successfully');
      
      // Reset form
      if (requestType === 'ITSupportRequest') {
        setItSupportForm({
          dateOfRequest: new Date().toISOString().split('T')[0],
          requesterInfo: {
            name: user?.name || '',
            employeeId: user?.employeeId || '',
            department: user?.department || '',
            designation: user?.role || '',
            contactNumber: user?.phone || '',
            email: user?.email || '',
            location: ''
          },
          deviceEquipmentInfo: {
            deviceType: '',
            model: '',
            serialNumber: '',
            location: '',
            operatingSystem: ''
          },
          issueDescription: '',
          priorityLevel: 'Medium',
          requestedAction: '',
          preferredContactTime: '',
          acknowledgment: false
        });
      } else {
        setGeneralServiceForm({
          dateOfRequest: new Date().toISOString().split('T')[0],
          requesterInfo: {
            name: user?.name || '',
            employeeId: user?.employeeId || '',
            department: user?.department || '',
            designation: user?.role || '',
            contactNumber: user?.phone || '',
            email: user?.email || ''
          },
          serviceDetails: {
            serviceCategory: '',
            serviceType: '',
            description: '',
            priorityLevel: 'Medium',
            expectedCompletionDate: '',
            location: '',
            budget: '',
            specialRequirements: ''
          },
          acknowledgment: false
        });
      }
      
      setErrors({});
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setSaving(false);
    }
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Pending': return 'warning';
      case 'Rejected': return 'error';
      case 'In Progress': return 'info';
      default: return 'default';
    }
  };

  const getRequestTypeIcon = (type) => {
    switch (type) {
      case 'ITSupportRequest': return <Computer />;
      case 'GeneralServiceRequest': return <Build />;
      default: return <SupportAgent />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
        Service Requests
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Submit IT support requests and general service requests for the school.
      </Typography>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="New Request" icon={<Send />} />
        <Tab label="Request History" icon={<History />} />
      </Tabs>

      {activeTab === 0 && (
        <Box>
          <FormControl sx={{ mb: 3, minWidth: 200 }}>
            <InputLabel>Request Type</InputLabel>
            <Select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
              label="Request Type"
            >
              <MenuItem value="ITSupportRequest">IT Support Request</MenuItem>
              <MenuItem value="GeneralServiceRequest">General Service Request</MenuItem>
            </Select>
          </FormControl>

          {requestType === 'ITSupportRequest' ? (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Computer color="primary" />
                  IT Support Request Form
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        Requester Information
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Name"
                        value={itSupportForm.requesterInfo.name}
                        onChange={(e) => handleInputChange('itSupport', 'requesterInfo.name', e.target.value)}
                        fullWidth
                        required
                        error={!!errors['requesterInfo.name']}
                        helperText={errors['requesterInfo.name']}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Employee ID"
                        value={itSupportForm.requesterInfo.employeeId}
                        onChange={(e) => handleInputChange('itSupport', 'requesterInfo.employeeId', e.target.value)}
                        fullWidth
                        required
                        error={!!errors['requesterInfo.employeeId']}
                        helperText={errors['requesterInfo.employeeId']}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Department"
                        value={itSupportForm.requesterInfo.department}
                        onChange={(e) => handleInputChange('itSupport', 'requesterInfo.department', e.target.value)}
                        fullWidth
                        required
                        error={!!errors['requesterInfo.department']}
                        helperText={errors['requesterInfo.department']}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Contact Number"
                        value={itSupportForm.requesterInfo.contactNumber}
                        onChange={(e) => handleInputChange('itSupport', 'requesterInfo.contactNumber', e.target.value)}
                        fullWidth
                        required
                        error={!!errors['requesterInfo.contactNumber']}
                        helperText={errors['requesterInfo.contactNumber']}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Email"
                        type="email"
                        value={itSupportForm.requesterInfo.email}
                        onChange={(e) => handleInputChange('itSupport', 'requesterInfo.email', e.target.value)}
                        fullWidth
                        required
                        error={!!errors['requesterInfo.email']}
                        helperText={errors['requesterInfo.email']}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Device Type"
                        value={itSupportForm.deviceEquipmentInfo.deviceType}
                        onChange={(e) => handleInputChange('itSupport', 'deviceEquipmentInfo.deviceType', e.target.value)}
                        fullWidth
                        required
                        error={!!errors['deviceEquipmentInfo.deviceType']}
                        helperText={errors['deviceEquipmentInfo.deviceType']}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Issue Description"
                        value={itSupportForm.issueDescription}
                        onChange={(e) => handleInputChange('itSupport', 'issueDescription', e.target.value)}
                        fullWidth
                        multiline
                        rows={4}
                        required
                        error={!!errors.issueDescription}
                        helperText={errors.issueDescription}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Requested Action</InputLabel>
                        <Select
                          value={itSupportForm.requestedAction}
                          onChange={(e) => handleInputChange('itSupport', 'requestedAction', e.target.value)}
                          label="Requested Action"
                          error={!!errors.requestedAction}
                        >
                          {requestedActions.map((action) => (
                            <MenuItem key={action} value={action}>{action}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={itSupportForm.acknowledgment}
                            onChange={(e) => handleInputChange('itSupport', 'acknowledgment', e.target.checked)}
                          />
                        }
                        label="I acknowledge that this request will be processed according to IT support policies and procedures."
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={saving || !itSupportForm.acknowledgment}
                        sx={{ px: 4, py: 1.5 }}
                      >
                        {saving ? <CircularProgress size={20} /> : 'Submit IT Support Request'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Build color="primary" />
                  General Service Request Form
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        Requester Information
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Name"
                        value={generalServiceForm.requesterInfo.name}
                        onChange={(e) => handleInputChange('generalService', 'requesterInfo.name', e.target.value)}
                        fullWidth
                        required
                        error={!!errors['requesterInfo.name']}
                        helperText={errors['requesterInfo.name']}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Employee ID"
                        value={generalServiceForm.requesterInfo.employeeId}
                        onChange={(e) => handleInputChange('generalService', 'requesterInfo.employeeId', e.target.value)}
                        fullWidth
                        required
                        error={!!errors['requesterInfo.employeeId']}
                        helperText={errors['requesterInfo.employeeId']}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Department"
                        value={generalServiceForm.requesterInfo.department}
                        onChange={(e) => handleInputChange('generalService', 'requesterInfo.department', e.target.value)}
                        fullWidth
                        required
                        error={!!errors['requesterInfo.department']}
                        helperText={errors['requesterInfo.department']}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Contact Number"
                        value={generalServiceForm.requesterInfo.contactNumber}
                        onChange={(e) => handleInputChange('generalService', 'requesterInfo.contactNumber', e.target.value)}
                        fullWidth
                        required
                        error={!!errors['requesterInfo.contactNumber']}
                        helperText={errors['requesterInfo.contactNumber']}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Service Category</InputLabel>
                        <Select
                          value={generalServiceForm.serviceDetails.serviceCategory}
                          onChange={(e) => handleInputChange('generalService', 'serviceDetails.serviceCategory', e.target.value)}
                          label="Service Category"
                          error={!!errors['serviceDetails.serviceCategory']}
                        >
                          {serviceCategories.map((category) => (
                            <MenuItem key={category} value={category}>{category}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Description"
                        value={generalServiceForm.serviceDetails.description}
                        onChange={(e) => handleInputChange('generalService', 'serviceDetails.description', e.target.value)}
                        fullWidth
                        multiline
                        rows={4}
                        required
                        error={!!errors['serviceDetails.description']}
                        helperText={errors['serviceDetails.description']}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={generalServiceForm.acknowledgment}
                            onChange={(e) => handleInputChange('generalService', 'acknowledgment', e.target.checked)}
                          />
                        }
                        label="I acknowledge that this request will be processed according to service request policies and procedures."
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={saving || !generalServiceForm.acknowledgment}
                        sx={{ px: 4, py: 1.5 }}
                      >
                        {saving ? <CircularProgress size={20} /> : 'Submit General Service Request'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <History color="primary" />
              Request History
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : requests.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request._id}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            {getRequestTypeIcon(request.requestType)}
                            {request.requestType === 'ITSupportRequest' ? 'IT Support' : 'General Service'}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {new Date(request.dateOfRequest).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {request.requestType === 'ITSupportRequest' 
                            ? request.issueDescription 
                            : request.serviceDetails?.description}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={request.priorityLevel}
                            color={request.priorityLevel === 'High' || request.priorityLevel === 'Critical' ? 'error' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={request.status}
                            color={getStatusColor(request.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewRequest(request)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box textAlign="center" p={3}>
                <Typography variant="body2" color="textSecondary">
                  No service requests found.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* View Request Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            {selectedRequest && getRequestTypeIcon(selectedRequest.requestType)}
            Request Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedRequest.requestType === 'ITSupportRequest' ? 'IT Support Request' : 'General Service Request'}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Submitted on: {new Date(selectedRequest.dateOfRequest).toLocaleDateString()}
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              {selectedRequest.requestType === 'ITSupportRequest' ? (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Requester Information:</Typography>
                  <Typography variant="body2" gutterBottom>
                    Name: {selectedRequest.requesterInfo?.name}<br />
                    Employee ID: {selectedRequest.requesterInfo?.employeeId}<br />
                    Department: {selectedRequest.requesterInfo?.department}<br />
                    Contact: {selectedRequest.requesterInfo?.contactNumber}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Device Information:</Typography>
                  <Typography variant="body2" gutterBottom>
                    Device Type: {selectedRequest.deviceEquipmentInfo?.deviceType}<br />
                    Model: {selectedRequest.deviceEquipmentInfo?.model}<br />
                    Operating System: {selectedRequest.deviceEquipmentInfo?.operatingSystem}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Issue Description:</Typography>
                  <Typography variant="body2" gutterBottom>
                    {selectedRequest.issueDescription}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Requested Action:</Typography>
                  <Typography variant="body2" gutterBottom>
                    {selectedRequest.requestedAction}
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Requester Information:</Typography>
                  <Typography variant="body2" gutterBottom>
                    Name: {selectedRequest.requesterInfo?.name}<br />
                    Employee ID: {selectedRequest.requesterInfo?.employeeId}<br />
                    Department: {selectedRequest.requesterInfo?.department}<br />
                    Contact: {selectedRequest.requesterInfo?.contactNumber}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Service Details:</Typography>
                  <Typography variant="body2" gutterBottom>
                    Category: {selectedRequest.serviceDetails?.serviceCategory}<br />
                    Type: {selectedRequest.serviceDetails?.serviceType}<br />
                    Location: {selectedRequest.serviceDetails?.location}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Description:</Typography>
                  <Typography variant="body2" gutterBottom>
                    {selectedRequest.serviceDetails?.description}
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={`Priority: ${selectedRequest.priorityLevel}`}
                  color={selectedRequest.priorityLevel === 'High' || selectedRequest.priorityLevel === 'Critical' ? 'error' : 'default'}
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={`Status: ${selectedRequest.status}`}
                  color={getStatusColor(selectedRequest.status)}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServiceRequests; 