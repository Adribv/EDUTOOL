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
  Tooltip,
  Divider
} from '@mui/material';
import {
  Build,
  Send,
  History,
  Add,
  Visibility,
  CheckCircle,
  Warning,
  Error,
  Schedule,
  Person,
  SupportAgent
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { teacherAPI } from '../../services/api';

const GeneralServiceRequest = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
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
    specialRequirements: '',
    acknowledgment: false
  });

  const [errors, setErrors] = useState({});

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
      const response = await teacherAPI.getGeneralServiceRequests();
      setRequests(response.data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

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

    if (!formData.description.trim()) {
      newErrors.description = 'Service description is required';
    }
    if (!formData.serviceCategory) {
      newErrors.serviceCategory = 'Service category is required';
    }
    if (!formData.serviceLocation.trim()) {
      newErrors.serviceLocation = 'Service location is required';
    }
    if (!formData.acknowledgment) {
      newErrors.acknowledgment = 'You must confirm the acknowledgment';
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
      await teacherAPI.createGeneralServiceRequest(formData);
      toast.success('General service request submitted successfully');
      
      // Reset form
      setFormData({
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
        specialRequirements: '',
        acknowledgment: false
      });
      setErrors({});
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request');
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
        General Service Requests
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Submit general service requests for administrative, facility, or other services.
      </Typography>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="New Request" icon={<Send />} />
        <Tab label="Request History" icon={<History />} />
      </Tabs>

      {activeTab === 0 && (
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
                    value={formData.requesterName}
                    onChange={(e) => handleInputChange('requesterName', e.target.value)}
                    fullWidth
                    required
                    error={!!errors.requesterName}
                    helperText={errors.requesterName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Employee ID"
                    value={formData.employeeId}
                    onChange={(e) => handleInputChange('employeeId', e.target.value)}
                    fullWidth
                    required
                    error={!!errors.employeeId}
                    helperText={errors.employeeId}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    fullWidth
                    required
                    error={!!errors.department}
                    helperText={errors.department}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Designation"
                    value={formData.designation}
                    onChange={(e) => handleInputChange('designation', e.target.value)}
                    fullWidth
                    required
                    error={!!errors.designation}
                    helperText={errors.designation}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Contact Number"
                    value={formData.contactNumber}
                    onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                    fullWidth
                    required
                    error={!!errors.contactNumber}
                    helperText={errors.contactNumber}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    fullWidth
                    required
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Service Details
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.serviceCategory}>
                    <InputLabel>Service Category *</InputLabel>
                    <Select
                      value={formData.serviceCategory}
                      onChange={(e) => handleInputChange('serviceCategory', e.target.value)}
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
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Service Location *"
                    value={formData.serviceLocation}
                    onChange={(e) => handleInputChange('serviceLocation', e.target.value)}
                    fullWidth
                    required
                    error={!!errors.serviceLocation}
                    helperText={errors.serviceLocation}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Preferred Date"
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Preferred Time"
                    value={formData.preferredTime}
                    onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                    fullWidth
                    placeholder="e.g., 9:00 AM - 5:00 PM"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Service Description *"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    required
                    error={!!errors.description}
                    helperText={errors.description}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Budget Estimate"
                    value={formData.budgetEstimate}
                    onChange={(e) => handleInputChange('budgetEstimate', e.target.value)}
                    fullWidth
                    placeholder="e.g., $500"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Urgency Level"
                    value={formData.urgencyLevel}
                    onChange={(e) => handleInputChange('urgencyLevel', e.target.value)}
                    fullWidth
                    placeholder="e.g., Low, Medium, High"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Special Requirements"
                    value={formData.specialRequirements}
                    onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Any special requirements or additional information"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={saving}
                      startIcon={saving ? <CircularProgress size={20} /> : <Send />}
                      sx={{ minWidth: 200 }}
                    >
                      {saving ? 'Submitting...' : 'Submit General Service Request'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <Box>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Request Number</TableCell>
                    <TableCell>Service Category</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell>{request.requestNumber || 'Pending'}</TableCell>
                      <TableCell>{request.serviceCategory}</TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {request.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={request.status}
                          color={getStatusColor(request.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(request.dateOfRequest).toLocaleDateString()}
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
          )}
        </Box>
      )}

      {/* View Request Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Build />
            General Service Request Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Request Number</Typography>
                <Typography variant="body1">{selectedRequest.requestNumber || 'Pending'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                <Chip
                  label={selectedRequest.status}
                  color={getStatusColor(selectedRequest.status)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Service Category</Typography>
                <Typography variant="body1">{selectedRequest.serviceCategory}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Service Location</Typography>
                <Typography variant="body1">{selectedRequest.serviceLocation}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                <Typography variant="body1">{selectedRequest.description}</Typography>
              </Grid>
              {selectedRequest.budgetEstimate && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Budget Estimate</Typography>
                  <Typography variant="body1">{selectedRequest.budgetEstimate}</Typography>
                </Grid>
              )}
              {selectedRequest.urgencyLevel && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Urgency Level</Typography>
                  <Typography variant="body1">{selectedRequest.urgencyLevel}</Typography>
                </Grid>
              )}
              {selectedRequest.specialRequirements && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Special Requirements</Typography>
                  <Typography variant="body1">{selectedRequest.specialRequirements}</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GeneralServiceRequest; 