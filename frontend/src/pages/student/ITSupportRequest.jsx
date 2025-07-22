import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Paper,
  Divider,
} from '@mui/material';
import {
  Computer,
  Send,
  History,
  Add,
  Visibility,
  Edit,
  Delete,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { studentAPI, teacherAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ITSupportRequest = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'Teacher' || user?.role === 'Admin' || user?.role === 'Principal' || user?.role === 'Vice Principal' || user?.role === 'HOD';
  const api = isTeacher ? teacherAPI : studentAPI;
  
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    requesterInfo: {
      name: user?.name || '',
      designationRole: isTeacher ? 'Teacher' : 'Student',
      departmentClass: isTeacher ? (user?.department || '') : '',
      contactNumber: user?.phone || user?.contactNumber || '',
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

  const [errors, setErrors] = useState({});

  const deviceTypes = [
    'Desktop',
    'Laptop',
    'Projector',
    'Printer',
    'Smart Board',
    'Network Issue',
    'Software/Application',
    'Other'
  ];

  const priorityLevels = [
    'Low - Minor inconvenience',
    'Medium - Work impacted, workaround possible',
    'High - Work halted, needs urgent resolution'
  ];

  const requestedActions = [
    'Troubleshoot & Fix',
    'Replace Device/Part',
    'Software Installation/Update',
    'Network Configuration',
    'Other'
  ];

  useEffect(() => {
    if (activeTab === 1) {
      fetchRequests();
      fetchStats();
    }
  }, [activeTab]);

  const fetchRequests = async () => {
    try {
      const params = isTeacher ? { requesterType: 'Teacher' } : {};
      const response = await api.getITSupportRequests(params);
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch IT support requests');
    }
  };

  const fetchStats = async () => {
    try {
      const params = isTeacher ? { requesterType: 'Teacher' } : {};
      const response = await api.getITSupportStats(params);
      setStats(response.data.stats || {});
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
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

    // Required field validation
    if (!formData.issueDescription.trim()) {
      newErrors.issueDescription = 'Issue description is required';
    }
    if (!formData.priorityLevel) {
      newErrors.priorityLevel = 'Priority level is required';
    }
    if (!formData.requestedAction) {
      newErrors.requestedAction = 'Requested action is required';
    }
    if (!formData.requesterSignature.trim()) {
      newErrors.requesterSignature = 'Digital signature is required';
    }
    if (!formData.acknowledgment) {
      newErrors.acknowledgment = 'You must confirm the acknowledgment';
    }
    if (!formData.deviceEquipmentInfo.typeOfDevice) {
      newErrors['deviceEquipmentInfo.typeOfDevice'] = 'Device type is required';
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
      const submissionData = {
        ...formData,
        requesterType: isTeacher ? 'Teacher' : 'Student'
      };
      const response = await api.createITSupportRequest(submissionData);
      toast.success(`IT Support Request submitted successfully! Request Number: ${response.data.requestNumber}`);
      
      // Reset form
      setFormData({
        requesterInfo: {
          name: user?.name || '',
          designationRole: isTeacher ? 'Teacher' : 'Student',
          departmentClass: isTeacher ? (user?.department || '') : '',
          contactNumber: user?.phone || user?.contactNumber || '',
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
      setErrors({});
      
      // Switch to history tab
      setActiveTab(1);
    } catch (error) {
      console.error('Error submitting IT support request:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit IT support request';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setViewDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted': return 'warning';
      case 'Received': return 'info';
      case 'In Progress': return 'primary';
      case 'Resolved': return 'success';
      case 'Closed': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    if (priority?.includes('High')) return 'error';
    if (priority?.includes('Medium')) return 'warning';
    return 'info';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {isTeacher ? 'Teacher IT Support Request' : 'IT Support Request'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Submit technical support requests and track their progress
        </Typography>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab icon={<Add />} label="New Request" />
          <Tab icon={<History />} label="Request History" />
        </Tabs>

        {/* New Request Tab */}
        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Request Details Section */}
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        Request Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Date of Request"
                            value={new Date().toLocaleDateString()}
                            disabled
                            helperText="Auto-generated"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Request Number"
                            value="Auto-generated after submission"
                            disabled
                            helperText="Will be assigned upon submission"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Requester Information Section */}
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        Requester Information
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Name *"
                            value={formData.requesterInfo.name}
                            onChange={(e) => handleInputChange('requesterInfo', 'name', e.target.value)}
                            error={!!errors['requesterInfo.name']}
                            helperText={errors['requesterInfo.name']}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Designation/Role"
                            value={formData.requesterInfo.designationRole}
                            onChange={(e) => handleInputChange('requesterInfo', 'designationRole', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Department/Class"
                            value={formData.requesterInfo.departmentClass}
                            onChange={(e) => handleInputChange('requesterInfo', 'departmentClass', e.target.value)}
                            placeholder="e.g., Class 10-A"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Contact Number"
                            value={formData.requesterInfo.contactNumber}
                            onChange={(e) => handleInputChange('requesterInfo', 'contactNumber', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            value={formData.requesterInfo.emailAddress}
                            onChange={(e) => handleInputChange('requesterInfo', 'emailAddress', e.target.value)}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Device/Equipment Information Section */}
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        Device/Equipment Information
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth error={!!errors['deviceEquipmentInfo.typeOfDevice']}>
                            <InputLabel>Type of Device/Equipment *</InputLabel>
                            <Select
                              value={formData.deviceEquipmentInfo.typeOfDevice}
                              onChange={(e) => handleInputChange('deviceEquipmentInfo', 'typeOfDevice', e.target.value)}
                              label="Type of Device/Equipment *"
                            >
                              {deviceTypes.map((type) => (
                                <MenuItem key={type} value={type}>{type}</MenuItem>
                              ))}
                            </Select>
                            {errors['deviceEquipmentInfo.typeOfDevice'] && (
                              <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                                {errors['deviceEquipmentInfo.typeOfDevice']}
                              </Typography>
                            )}
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Device/Asset ID (if applicable)"
                            value={formData.deviceEquipmentInfo.deviceAssetId}
                            onChange={(e) => handleInputChange('deviceEquipmentInfo', 'deviceAssetId', e.target.value)}
                            placeholder="e.g., LAP001, PRJ002"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Operating System"
                            value={formData.deviceEquipmentInfo.operatingSystem}
                            onChange={(e) => handleInputChange('deviceEquipmentInfo', 'operatingSystem', e.target.value)}
                            placeholder="e.g., Windows 10, macOS, Android"
                          />
                        </Grid>
                        {formData.deviceEquipmentInfo.typeOfDevice === 'Other' && (
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Please specify device type"
                              value={formData.deviceEquipmentInfo.otherDeviceType}
                              onChange={(e) => handleInputChange('deviceEquipmentInfo', 'otherDeviceType', e.target.value)}
                            />
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Issue Description Section */}
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        Issue Description
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Describe the issue in detail *"
                        value={formData.issueDescription}
                        onChange={(e) => handleInputChange(null, 'issueDescription', e.target.value)}
                        error={!!errors.issueDescription}
                        helperText={errors.issueDescription || 'Please provide as much detail as possible to help us resolve your issue quickly'}
                        placeholder="Please describe the problem you're experiencing, any error messages, and what you were doing when the issue occurred..."
                      />
                    </CardContent>
                  </Card>
                </Grid>

                {/* Priority Level and Requested Action Section */}
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        Priority & Action Required
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth error={!!errors.priorityLevel}>
                            <InputLabel>Priority Level *</InputLabel>
                            <Select
                              value={formData.priorityLevel}
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
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth error={!!errors.requestedAction}>
                            <InputLabel>Requested Action *</InputLabel>
                            <Select
                              value={formData.requestedAction}
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
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Preferred Contact Time"
                            value={formData.preferredContactTime}
                            onChange={(e) => handleInputChange(null, 'preferredContactTime', e.target.value)}
                            placeholder="e.g., Between 9 AM - 11 AM, After 2 PM"
                            helperText="When would be the best time to contact you regarding this request?"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Acknowledgment Section */}
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        Acknowledgment
                      </Typography>
                      <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          I confirm that the above information is accurate to the best of my knowledge. I authorize IT personnel to access my device/location for resolving the issue.
                        </Typography>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.acknowledgment}
                              onChange={(e) => handleInputChange(null, 'acknowledgment', e.target.checked)}
                            />
                          }
                          label="I agree to the above acknowledgment *"
                        />
                        {errors.acknowledgment && (
                          <Typography variant="caption" color="error" display="block">
                            {errors.acknowledgment}
                          </Typography>
                        )}
                      </Box>
                      <TextField
                        fullWidth
                        label="Digital Signature (Type your full name) *"
                        value={formData.requesterSignature}
                        onChange={(e) => handleInputChange(null, 'requesterSignature', e.target.value)}
                        error={!!errors.requesterSignature}
                        helperText={errors.requesterSignature || 'Type your full name as digital signature'}
                        placeholder="Type your full name here"
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Date: {new Date().toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
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
                      {loading ? 'Submitting...' : 'Submit Request'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Box>
        )}

        {/* Request History Tab */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">{stats.total || 0}</Typography>
                    <Typography variant="body2">Total Requests</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">{stats.submitted || 0}</Typography>
                    <Typography variant="body2">Submitted</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main">{stats.inProgress || 0}</Typography>
                    <Typography variant="body2">In Progress</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">{stats.resolved || 0}</Typography>
                    <Typography variant="body2">Resolved</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Requests Table */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Your IT Support Requests
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Request #</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Device Type</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {requests.length > 0 ? (
                        requests.map((request) => (
                          <TableRow key={request._id}>
                            <TableCell>{request.requestNumber}</TableCell>
                            <TableCell>{new Date(request.dateOfRequest).toLocaleDateString()}</TableCell>
                            <TableCell>{request.deviceEquipmentInfo.typeOfDevice}</TableCell>
                            <TableCell>
                              <Chip 
                                label={request.priorityLevel?.split(' - ')[0]} 
                                color={getPriorityColor(request.priorityLevel)}
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
                              <Button
                                size="small"
                                startIcon={<Visibility />}
                                onClick={() => handleViewRequest(request)}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            <Box sx={{ py: 3 }}>
                              <Computer sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                              <Typography variant="body1" color="text.secondary">
                                No IT support requests found
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Submit your first request using the "New Request" tab
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        )}
      </Paper>

      {/* View Request Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          IT Support Request Details
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Request Number</Typography>
                  <Typography variant="body1">{selectedRequest.requestNumber}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Date Submitted</Typography>
                  <Typography variant="body1">{new Date(selectedRequest.dateOfRequest).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={selectedRequest.status} 
                    color={getStatusColor(selectedRequest.status)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
                  <Chip 
                    label={selectedRequest.priorityLevel} 
                    color={getPriorityColor(selectedRequest.priorityLevel)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="text.secondary">Device Information</Typography>
                  <Typography variant="body1">
                    {selectedRequest.deviceEquipmentInfo.typeOfDevice}
                    {selectedRequest.deviceEquipmentInfo.deviceAssetId && 
                      ` (Asset ID: ${selectedRequest.deviceEquipmentInfo.deviceAssetId})`}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Issue Description</Typography>
                  <Typography variant="body1">{selectedRequest.issueDescription}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Requested Action</Typography>
                  <Typography variant="body1">{selectedRequest.requestedAction}</Typography>
                </Grid>
                {selectedRequest.itDepartmentUse?.actionTaken && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" color="text.secondary">IT Department Action</Typography>
                    <Typography variant="body1">{selectedRequest.itDepartmentUse.actionTaken}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ITSupportRequest; 