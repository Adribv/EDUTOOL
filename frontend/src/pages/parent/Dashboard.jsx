import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { parentAPI } from '../../services/api';
import {
  Person,
  School,
  Assignment,
  Event,
  Notifications,
  Assessment,
  Add,
  TrendingUp,
  Schedule,
  Payment,
  Assignment as ConsentIcon,
  Computer,
  Build,
  Send,
  History,
  Visibility,
  Error,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [childrenFeeStatus, setChildrenFeeStatus] = useState([]);
  const [showFeePopup, setShowFeePopup] = useState(false);

  // Service Requests State
  const [serviceRequestsTab, setServiceRequestsTab] = useState(0);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [createRequestDialog, setCreateRequestDialog] = useState(false);
  const [requestType, setRequestType] = useState('ITSupportRequest');
  const [loadingRequests, setLoadingRequests] = useState(false);

  // IT Support Form State
  const [itSupportForm, setItSupportForm] = useState({
    requesterInfo: {
      name: user?.name || '',
      designationRole: 'Parent',
      departmentClass: '',
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

  // General Service Form State
  const [generalServiceForm, setGeneralServiceForm] = useState({
    requesterName: user?.name || '',
    parentId: user?.parentId || '',
    contactNumber: user?.phone || '',
    email: user?.email || '',
    serviceCategory: '',
    serviceLocation: '',
    preferredDate: '',
    preferredTime: '',
    description: '',
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

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['parent_dashboard'],
    queryFn: parentAPI.getDashboard,
  });

  // Fetch children fee status
  useEffect(() => {
    const fetchChildrenFeeStatus = async () => {
      try {
        console.log('🔍 Fetching children fee status...');
        // Only show once per session
        if (localStorage.getItem('parentFeePopupShown')) {
          console.log('⏭️ Parent fee popup already shown this session');
          return;
        }
        
        console.log('📞 Calling parentAPI.getChildrenFeeStatus()...');
        const feeData = await parentAPI.getChildrenFeeStatus();
        console.log('📋 Children fee status response:', feeData);
        
        if (feeData && feeData.length > 0) {
          console.log('⚠️ Found children with pending fees:', feeData.length);
          setChildrenFeeStatus(feeData);
          setShowFeePopup(true);
          localStorage.setItem('parentFeePopupShown', 'true');
        } else {
          console.log('✅ No children with pending fees');
        }
      } catch (err) {
        console.error('❌ Error fetching children fee status:', err);
      }
    };

    fetchChildrenFeeStatus();
    fetchServiceRequests();
  }, []);

  // Service Request Functions
  const fetchServiceRequests = async () => {
    try {
      setLoadingRequests(true);
      const response = await parentAPI.getServiceRequests();
      setServiceRequests(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching service requests:', error);
      toast.error('Failed to fetch service requests');
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleInputChange = (formType, field, value) => {
    if (formType === 'itSupport') {
      setItSupportForm(prev => ({
        ...prev,
        [field]: value
      }));
    } else if (formType === 'general') {
      setGeneralServiceForm(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      // Handle nested fields
      const [parent, child] = field.split('.');
      if (formType === 'itSupport') {
        setItSupportForm(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      } else if (formType === 'general') {
        setGeneralServiceForm(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      }
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

    setLoadingRequests(true);
    try {
      const submissionData = requestType === 'ITSupportRequest' 
        ? {
            ...itSupportForm,
            requesterType: 'Parent'
          }
        : {
            ...generalServiceForm,
            requesterType: 'Parent',
            requestType: 'GeneralServiceRequest'
          };

      await parentAPI.createServiceRequest(submissionData);
      
      toast.success('Service request submitted successfully');
      setCreateRequestDialog(false);
      fetchServiceRequests();
      
      // Reset forms
      setItSupportForm({
        requesterInfo: {
          name: user?.name || '',
          designationRole: 'Parent',
          departmentClass: '',
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
        parentId: user?.parentId || '',
        contactNumber: user?.phone || '',
        email: user?.email || '',
        serviceCategory: '',
        serviceLocation: '',
        preferredDate: '',
        preferredTime: '',
        description: '',
        urgencyLevel: '',
        specialRequirements: ''
      });
      
      setErrors({});
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit service request');
    } finally {
      setLoadingRequests(false);
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

  // Temporary function to clear localStorage for testing
  const clearParentFeePopupFlag = () => {
    localStorage.removeItem('parentFeePopupShown');
    console.log('🗑️ Cleared parent fee popup flag');
    window.location.reload();
  };

  // Fetch events that have consent forms
  const { data: eventsWithConsentForms } = useQuery({
    queryKey: ['eventsWithConsentForms'],
    queryFn: async () => {
      try {
        const events = await adminAPI.getEvents();
        return events.filter(event => event.status === 'Approved');
      } catch (error) {
        console.error('Error fetching events:', error);
        return [];
      }
    },
  });

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
        <Alert severity="error">Failed to load dashboard data</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Parent Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Welcome back, {user?.name}. Monitor your children's progress and manage school-related activities.
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Children
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData?.childrenCount || 0}
                  </Typography>
                </Box>
                <Person color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Pending Fees
                  </Typography>
                  <Typography variant="h4">
                    {childrenFeeStatus.length}
                  </Typography>
                </Box>
                <Payment color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Upcoming Events
                  </Typography>
                  <Typography variant="h4">
                    {eventsWithConsentForms?.length || 0}
                  </Typography>
                </Box>
                <Event color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Notifications
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData?.notificationsCount || 0}
                  </Typography>
                </Box>
                <Notifications color="secondary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
      </Grid>

      {/* Service Requests Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Service Requests
        </Typography>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Submit Service Requests</Typography>
              <Button
                variant="contained"
                startIcon={<Send />}
                onClick={() => setCreateRequestDialog(true)}
              >
                Create Request
              </Button>
            </Box>
            
            <Tabs 
              value={serviceRequestsTab} 
              onChange={(_, v) => setServiceRequestsTab(v)}
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
            >
              <Tab label="IT Support Requests" icon={<Computer />} />
              <Tab label="General Service Requests" icon={<Build />} />
            </Tabs>

            {loadingRequests ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Request Number</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {serviceRequests
                      .filter(request => 
                        serviceRequestsTab === 0 
                          ? request.requestType === 'ITSupportRequest'
                          : request.requestType === 'GeneralServiceRequest'
                      )
                      .map((request) => (
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
          </CardContent>
        </Card>
      </Box>

      {/* Children Information */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Children Information
              </Typography>
              <List>
                {dashboardData?.children?.map((child, index) => (
                  <ListItem key={index}>
                    <ListItemAvatar>
                      <Avatar>
                        <Person />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={child.name}
                      secondary={`Grade ${child.grade} • ${child.school}`}
                    />
                    <Chip
                      label={child.status}
                      color={child.status === 'Active' ? 'success' : 'warning'}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              <List>
                {dashboardData?.recentActivities?.map((activity, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={activity.title}
                      secondary={activity.date}
                    />
                    <Chip
                      label={activity.type}
                      color="primary"
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Fee Popup Dialog */}
      <Dialog open={showFeePopup} onClose={() => setShowFeePopup(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Payment color="warning" />
            <Typography variant="h6">Pending Fee Payments</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            The following children have pending fee payments:
          </Typography>
          <List>
            {childrenFeeStatus.map((child, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={child.name}
                  secondary={`Grade ${child.grade} • Amount: ₹${child.dueAmount}`}
                />
                <Chip
                  label="Pending"
                  color="warning"
                  size="small"
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFeePopup(false)}>Close</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setShowFeePopup(false);
              navigate('/parent/fees');
            }}
          >
            Pay Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Request Dialog */}
      <Dialog 
        open={createRequestDialog} 
        onClose={() => setCreateRequestDialog(false)}
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
          {requestType === 'ITSupportRequest' ? (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Device Information */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Device Information
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors['deviceEquipmentInfo.typeOfDevice']}>
                    <InputLabel>Type of Device *</InputLabel>
                    <Select
                      value={itSupportForm.deviceEquipmentInfo.typeOfDevice}
                      onChange={(e) => handleInputChange('itSupport', 'deviceEquipmentInfo.typeOfDevice', e.target.value)}
                      label="Type of Device *"
                    >
                      <MenuItem value="Desktop">Desktop</MenuItem>
                      <MenuItem value="Laptop">Laptop</MenuItem>
                      <MenuItem value="Printer">Printer</MenuItem>
                      <MenuItem value="Projector">Projector</MenuItem>
                      <MenuItem value="Network">Network</MenuItem>
                      <MenuItem value="Software">Software</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
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
                    label="Device Asset ID"
                    value={itSupportForm.deviceEquipmentInfo.deviceAssetId}
                    onChange={(e) => handleInputChange('itSupport', 'deviceEquipmentInfo.deviceAssetId', e.target.value)}
                    fullWidth
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Operating System"
                    value={itSupportForm.deviceEquipmentInfo.operatingSystem}
                    onChange={(e) => handleInputChange('itSupport', 'deviceEquipmentInfo.operatingSystem', e.target.value)}
                    fullWidth
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Other Device Type"
                    value={itSupportForm.deviceEquipmentInfo.otherDeviceType}
                    onChange={(e) => handleInputChange('itSupport', 'deviceEquipmentInfo.otherDeviceType', e.target.value)}
                    fullWidth
                    disabled={itSupportForm.deviceEquipmentInfo.typeOfDevice !== 'Other'}
                  />
                </Grid>

                {/* Issue Details */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Issue Details
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Issue Description *"
                    value={itSupportForm.issueDescription}
                    onChange={(e) => handleInputChange('itSupport', 'issueDescription', e.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    error={!!errors.issueDescription}
                    helperText={errors.issueDescription}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.priorityLevel}>
                    <InputLabel>Priority Level *</InputLabel>
                    <Select
                      value={itSupportForm.priorityLevel}
                      onChange={(e) => handleInputChange('itSupport', 'priorityLevel', e.target.value)}
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
                      value={itSupportForm.requestedAction}
                      onChange={(e) => handleInputChange('itSupport', 'requestedAction', e.target.value)}
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
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Preferred Contact Time"
                    value={itSupportForm.preferredContactTime}
                    onChange={(e) => handleInputChange('itSupport', 'preferredContactTime', e.target.value)}
                    fullWidth
                    placeholder="e.g., 9:00 AM - 5:00 PM"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Digital Signature *"
                    value={itSupportForm.requesterSignature}
                    onChange={(e) => handleInputChange('itSupport', 'requesterSignature', e.target.value)}
                    fullWidth
                    error={!!errors.requesterSignature}
                    helperText={errors.requesterSignature}
                    placeholder="Type your full name as digital signature"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={itSupportForm.acknowledgment}
                        onChange={(e) => handleInputChange('itSupport', 'acknowledgment', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="I acknowledge that this request will be processed according to IT support policies and procedures."
                  />
                  {errors.acknowledgment && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                      {errors.acknowledgment}
                    </Typography>
                  )}
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loadingRequests}
                      startIcon={loadingRequests ? <CircularProgress size={20} /> : <Send />}
                      sx={{ minWidth: 200 }}
                    >
                      {loadingRequests ? 'Submitting...' : 'Submit IT Support Request'}
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
                      onChange={(e) => handleInputChange('general', 'serviceCategory', e.target.value)}
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
                    label="Service Location *"
                    value={generalServiceForm.serviceLocation}
                    onChange={(e) => handleInputChange('general', 'serviceLocation', e.target.value)}
                    fullWidth
                    error={!!errors.serviceLocation}
                    helperText={errors.serviceLocation}
                  />
                </Grid>
                
                {/* Preferred Date and Time */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Preferred Date"
                    type="date"
                    value={generalServiceForm.preferredDate}
                    onChange={(e) => handleInputChange('general', 'preferredDate', e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Preferred Time"
                    value={generalServiceForm.preferredTime}
                    onChange={(e) => handleInputChange('general', 'preferredTime', e.target.value)}
                    fullWidth
                    placeholder="e.g., 9:00 AM - 5:00 PM"
                  />
                </Grid>
                
                {/* Description */}
                <Grid item xs={12}>
                  <TextField
                    label="Service Description *"
                    value={generalServiceForm.description}
                    onChange={(e) => handleInputChange('general', 'description', e.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    error={!!errors.description}
                    helperText={errors.description}
                  />
                </Grid>
                
                {/* Urgency */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Urgency Level"
                    value={generalServiceForm.urgencyLevel}
                    onChange={(e) => handleInputChange('general', 'urgencyLevel', e.target.value)}
                    fullWidth
                    placeholder="e.g., Low, Medium, High"
                  />
                </Grid>
                
                {/* Special Requirements */}
                <Grid item xs={12}>
                  <TextField
                    label="Special Requirements"
                    value={generalServiceForm.specialRequirements}
                    onChange={(e) => handleInputChange('general', 'specialRequirements', e.target.value)}
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
                      disabled={loadingRequests}
                      startIcon={loadingRequests ? <CircularProgress size={20} /> : <Send />}
                      sx={{ minWidth: 200 }}
                    >
                      {loadingRequests ? 'Submitting...' : 'Submit General Service Request'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateRequestDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard; 