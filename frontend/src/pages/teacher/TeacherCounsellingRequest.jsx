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
  Psychology,
  Send,
  Visibility,
  CheckCircle,
  Warning,
  Error,
  Schedule,
  Person
} from '@mui/icons-material';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { teacherAPI } from '../../services/api';

const TeacherCounsellingRequest = () => {
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
    name: user?.name || '',
    employeeId: user?.employeeId || '',
    department: user?.department || '',
    designation: user?.role || '',
    contactNumber: user?.phone || '',
    email: user?.email || '',
    preferredDate: '',
    preferredTime: '',
    reasonForCounselling: '',
    specificConcerns: '',
    previousCounselling: 'No',
    emergencyContact: '',
    additionalNotes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (activeTab === 1) {
      fetchRequests();
      fetchStats();
    }
  }, [activeTab]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.preferredDate) newErrors.preferredDate = 'Preferred date is required';
    if (!formData.preferredTime) newErrors.preferredTime = 'Preferred time is required';
    if (!formData.reasonForCounselling.trim()) newErrors.reasonForCounselling = 'Reason for counselling is required';
    if (!formData.specificConcerns.trim()) newErrors.specificConcerns = 'Specific concerns are required';

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
        requesterType: 'Teacher',
        requesterId: user?._id || user?.id,
        date: new Date(formData.dateOfRequest),
        dateOfRequest: new Date(formData.dateOfRequest)
      };

      const response = await teacherAPI.createCounsellingRequest(payload);
      
      toast.success('Counselling request submitted successfully!');
      setFormData({
        dateOfRequest: new Date().toISOString().split('T')[0],
        name: user?.name || '',
        employeeId: user?.employeeId || '',
        department: user?.department || '',
        designation: user?.role || '',
        contactNumber: user?.phone || '',
        email: user?.email || '',
        preferredDate: '',
        preferredTime: '',
        reasonForCounselling: '',
        specificConcerns: '',
        previousCounselling: 'No',
        emergencyContact: '',
        additionalNotes: ''
      });
      setActiveTab(1); // Switch to history tab
    } catch (error) {
      console.error('Error submitting counselling request:', error);
      toast.error('Failed to submit counselling request');
    } finally {
      setSaving(false);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await teacherAPI.getCounsellingRequests({ 
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
      const response = await teacherAPI.getCounsellingRequestStats({ 
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
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        <Psychology sx={{ mr: 1, verticalAlign: 'middle' }} />
        Teacher Counselling Request
      </Typography>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="New Request" icon={<Send />} />
        <Tab label="Request History" icon={<Schedule />} />
      </Tabs>

      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Submit Counselling Request
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date of Request"
                    type="date"
                    value={formData.dateOfRequest}
                    onChange={(e) => handleInputChange('dateOfRequest', e.target.value)}
                    error={!!errors.dateOfRequest}
                    helperText={errors.dateOfRequest}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    error={!!errors.name}
                    helperText={errors.name}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Employee ID"
                    value={formData.employeeId}
                    onChange={(e) => handleInputChange('employeeId', e.target.value)}
                    error={!!errors.employeeId}
                    helperText={errors.employeeId}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    error={!!errors.department}
                    helperText={errors.department}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Designation"
                    value={formData.designation}
                    onChange={(e) => handleInputChange('designation', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Contact Number"
                    value={formData.contactNumber}
                    onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                    error={!!errors.contactNumber}
                    helperText={errors.contactNumber}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Emergency Contact"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Preferred Date"
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                    error={!!errors.preferredDate}
                    helperText={errors.preferredDate}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Preferred Time"
                    type="time"
                    value={formData.preferredTime}
                    onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                    error={!!errors.preferredTime}
                    helperText={errors.preferredTime}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Previous Counselling</InputLabel>
                    <Select
                      value={formData.previousCounselling}
                      label="Previous Counselling"
                      onChange={(e) => handleInputChange('previousCounselling', e.target.value)}
                    >
                      <MenuItem value="No">No</MenuItem>
                      <MenuItem value="Yes">Yes</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reason for Counselling"
                    multiline
                    rows={3}
                    value={formData.reasonForCounselling}
                    onChange={(e) => handleInputChange('reasonForCounselling', e.target.value)}
                    error={!!errors.reasonForCounselling}
                    helperText={errors.reasonForCounselling}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Specific Concerns"
                    multiline
                    rows={3}
                    value={formData.specificConcerns}
                    onChange={(e) => handleInputChange('specificConcerns', e.target.value)}
                    error={!!errors.specificConcerns}
                    helperText={errors.specificConcerns}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Additional Notes"
                    multiline
                    rows={2}
                    value={formData.additionalNotes}
                    onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
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
                    {saving ? 'Submitting...' : 'Submit Counselling Request'}
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
                  <Typography variant="h4" color="warning.main">
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
                  <Typography variant="h4" color="success.main">
                    {stats.approvedRequests || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approved Requests
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="error.main">
                    {stats.rejectedRequests || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rejected Requests
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
                        <TableCell>Date</TableCell>
                        <TableCell>Preferred Date</TableCell>
                        <TableCell>Reason</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {requests.map((request) => (
                        <TableRow key={request._id}>
                          <TableCell>
                            {new Date(request.dateOfRequest).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(request.preferredDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {request.reasonForCounselling}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={request.status || 'Pending'}
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
                  No counselling requests found. Submit your first request using the form above.
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
              Counselling Request Details
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
                    label="Date of Request"
                    value={new Date(selectedRequest.dateOfRequest).toLocaleDateString()}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Status"
                    value={selectedRequest.status || 'Pending'}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={selectedRequest.name}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Employee ID"
                    value={selectedRequest.employeeId}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    value={selectedRequest.department}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Number"
                    value={selectedRequest.contactNumber}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Preferred Date"
                    value={new Date(selectedRequest.preferredDate).toLocaleDateString()}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Preferred Time"
                    value={selectedRequest.preferredTime}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reason for Counselling"
                    value={selectedRequest.reasonForCounselling}
                    multiline
                    rows={3}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Specific Concerns"
                    value={selectedRequest.specificConcerns}
                    multiline
                    rows={3}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                {selectedRequest.additionalNotes && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Additional Notes"
                      value={selectedRequest.additionalNotes}
                      multiline
                      rows={2}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                )}
                {selectedRequest.counsellorNotes && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Counsellor Notes"
                      value={selectedRequest.counsellorNotes}
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

export default TeacherCounsellingRequest; 