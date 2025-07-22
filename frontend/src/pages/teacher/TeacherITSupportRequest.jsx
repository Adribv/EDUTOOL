import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
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
  Tooltip
} from '@mui/material';
import {
  Computer,
  Send,
  Visibility,
  CheckCircle,
  Warning,
  Error,
  Schedule,
  Person,
  SupportAgent
} from '@mui/icons-material';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { teacherAPI } from '../../services/api';

const TeacherITSupportRequest = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
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

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (activeTab === 1) {
      fetchRequests();
      fetchStats();
    }
  }, [activeTab]);

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
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.requesterInfo.name.trim()) newErrors['requesterInfo.name'] = 'Name is required';
    if (!formData.requesterInfo.employeeId.trim()) newErrors['requesterInfo.employeeId'] = 'Employee ID is required';
    if (!formData.requesterInfo.department.trim()) newErrors['requesterInfo.department'] = 'Department is required';
    if (!formData.requesterInfo.contactNumber.trim()) newErrors['requesterInfo.contactNumber'] = 'Contact number is required';
    if (!formData.requesterInfo.email.trim()) newErrors['requesterInfo.email'] = 'Email is required';
    if (!formData.deviceEquipmentInfo.deviceType.trim()) newErrors['deviceEquipmentInfo.deviceType'] = 'Device type is required';
    if (!formData.issueDescription.trim()) newErrors.issueDescription = 'Issue description is required';
    if (!formData.requestedAction.trim()) newErrors.requestedAction = 'Requested action is required';

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
        ...formData,
        requesterId: user?._id || user?.id,
        requesterType: 'Teacher',
        status: 'Submitted'
      };

      const response = await teacherAPI.createITSupportRequest(payload);
      
      toast.success(`IT Support request submitted successfully! Request Number: ${response.data?.requestNumber}`);
      setFormData({
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
      setActiveTab(1); // Switch to history tab
    } catch (error) {
      console.error('Error submitting IT support request:', error);
      toast.error('Failed to submit IT support request');
    } finally {
      setSaving(false);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await teacherAPI.getITSupportRequests({ 
        requesterId: user?._id || user?.id, 
        requesterType: 'Teacher' 
      });
      setRequests(response.data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch request history');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await teacherAPI.getITSupportRequestStats({ 
        requesterId: user?._id || user?.id, 
        requesterType: 'Teacher' 
      });
      setStats(response.data || {});
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return 'success';
      case 'in progress':
        return 'warning';
      case 'pending':
        return 'info';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        <Computer sx={{ mr: 1, verticalAlign: 'middle' }} />
        Teacher IT Support Request
      </Typography>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="New Request" icon={<Send />} />
        <Tab label="Request History" icon={<Schedule />} />
      </Tabs>

      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Submit IT Support Request
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Request Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
                    Request Information
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date of Request"
                    type="date"
                    value={formData.dateOfRequest}
                    onChange={(e) => handleInputChange('dateOfRequest', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Priority Level</InputLabel>
                    <Select
                      value={formData.priorityLevel}
                      label="Priority Level"
                      onChange={(e) => handleInputChange('priorityLevel', e.target.value)}
                    >
                      <MenuItem value="Low">Low</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="High">High</MenuItem>
                      <MenuItem value="Critical">Critical</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Requester Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
                    Requester Information
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.requesterInfo.name}
                    onChange={(e) => handleInputChange('requesterInfo.name', e.target.value)}
                    error={!!errors['requesterInfo.name']}
                    helperText={errors['requesterInfo.name']}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Employee ID"
                    value={formData.requesterInfo.employeeId}
                    onChange={(e) => handleInputChange('requesterInfo.employeeId', e.target.value)}
                    error={!!errors['requesterInfo.employeeId']}
                    helperText={errors['requesterInfo.employeeId']}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    value={formData.requesterInfo.department}
                    onChange={(e) => handleInputChange('requesterInfo.department', e.target.value)}
                    error={!!errors['requesterInfo.department']}
                    helperText={errors['requesterInfo.department']}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Designation"
                    value={formData.requesterInfo.designation}
                    onChange={(e) => handleInputChange('requesterInfo.designation', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Contact Number"
                    value={formData.requesterInfo.contactNumber}
                    onChange={(e) => handleInputChange('requesterInfo.contactNumber', e.target.value)}
                    error={!!errors['requesterInfo.contactNumber']}
                    helperText={errors['requesterInfo.contactNumber']}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.requesterInfo.email}
                    onChange={(e) => handleInputChange('requesterInfo.email', e.target.value)}
                    error={!!errors['requesterInfo.email']}
                    helperText={errors['requesterInfo.email']}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={formData.requesterInfo.location}
                    onChange={(e) => handleInputChange('requesterInfo.location', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Preferred Contact Time"
                    value={formData.preferredContactTime}
                    onChange={(e) => handleInputChange('preferredContactTime', e.target.value)}
                    placeholder="e.g., 9:00 AM - 5:00 PM"
                  />
                </Grid>

                {/* Device/Equipment Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
                    Device/Equipment Information
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Device Type"
                    value={formData.deviceEquipmentInfo.deviceType}
                    onChange={(e) => handleInputChange('deviceEquipmentInfo.deviceType', e.target.value)}
                    error={!!errors['deviceEquipmentInfo.deviceType']}
                    helperText={errors['deviceEquipmentInfo.deviceType']}
                    placeholder="e.g., Laptop, Desktop, Printer, Network Device"
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Model"
                    value={formData.deviceEquipmentInfo.model}
                    onChange={(e) => handleInputChange('deviceEquipmentInfo.model', e.target.value)}
                    placeholder="e.g., Dell Latitude 5520"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Serial Number"
                    value={formData.deviceEquipmentInfo.serialNumber}
                    onChange={(e) => handleInputChange('deviceEquipmentInfo.serialNumber', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Device Location"
                    value={formData.deviceEquipmentInfo.location}
                    onChange={(e) => handleInputChange('deviceEquipmentInfo.location', e.target.value)}
                    placeholder="e.g., Room 101, Computer Lab"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Operating System"
                    value={formData.deviceEquipmentInfo.operatingSystem}
                    onChange={(e) => handleInputChange('deviceEquipmentInfo.operatingSystem', e.target.value)}
                    placeholder="e.g., Windows 10, macOS, Linux"
                  />
                </Grid>

                {/* Issue Details */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
                    Issue Details
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Issue Description"
                    multiline
                    rows={4}
                    value={formData.issueDescription}
                    onChange={(e) => handleInputChange('issueDescription', e.target.value)}
                    error={!!errors.issueDescription}
                    helperText={errors.issueDescription}
                    placeholder="Please describe the issue in detail..."
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Requested Action"
                    multiline
                    rows={3}
                    value={formData.requestedAction}
                    onChange={(e) => handleInputChange('requestedAction', e.target.value)}
                    error={!!errors.requestedAction}
                    helperText={errors.requestedAction}
                    placeholder="What action do you expect from IT support?"
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={saving ? <CircularProgress size={20} /> : <Send />}
                    disabled={saving}
                    sx={{ mt: 2 }}
                  >
                    {saving ? 'Submitting...' : 'Submit IT Support Request'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <Box>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="primary">
                    {stats.totalRequests || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Requests
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="info.main">
                    {stats.pendingRequests || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Requests
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="warning.main">
                    {stats.inProgressRequests || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    In Progress
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="success.main">
                    {stats.resolvedRequests || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Resolved Requests
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Requests Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Request History
              </Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : requests.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Request #</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Device Type</TableCell>
                        <TableCell>Issue</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {requests.map((request) => (
                        <TableRow key={request._id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {request.requestNumber}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {new Date(request.dateOfRequest).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {request.deviceEquipmentInfo?.deviceType || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {request.issueDescription}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={request.priorityLevel}
                              color={getPriorityColor(request.priorityLevel)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={request.status || 'Submitted'}
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
                <Alert severity="info">
                  No IT support requests found. Submit your first request using the form above.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* View Request Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedRequest && (
          <>
            <DialogTitle>
              IT Support Request Details
              <IconButton
                onClick={() => setViewDialogOpen(false)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <Error />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Request Number"
                    value={selectedRequest.requestNumber}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Request"
                    value={new Date(selectedRequest.dateOfRequest).toLocaleDateString()}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Status"
                    value={selectedRequest.status || 'Submitted'}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Priority Level"
                    value={selectedRequest.priorityLevel}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={selectedRequest.requesterInfo?.name}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Employee ID"
                    value={selectedRequest.requesterInfo?.employeeId}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    value={selectedRequest.requesterInfo?.department}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Number"
                    value={selectedRequest.requesterInfo?.contactNumber}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Device Type"
                    value={selectedRequest.deviceEquipmentInfo?.deviceType}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Model"
                    value={selectedRequest.deviceEquipmentInfo?.model}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Issue Description"
                    value={selectedRequest.issueDescription}
                    multiline
                    rows={3}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Requested Action"
                    value={selectedRequest.requestedAction}
                    multiline
                    rows={2}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                {selectedRequest.itDepartmentUse?.assignedTo && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Assigned To"
                      value={selectedRequest.itDepartmentUse.assignedTo}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                )}
                {selectedRequest.itDepartmentUse?.resolutionNotes && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Resolution Notes"
                      value={selectedRequest.itDepartmentUse.resolutionNotes}
                      multiline
                      rows={3}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default TeacherITSupportRequest; 