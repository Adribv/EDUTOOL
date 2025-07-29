import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Button,
  Tabs,
  Tab,
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Computer,
  Build,
  Send,
  History,
  Visibility,
  CheckCircle,
  Warning,
  Error,
  Schedule,
  Person,
  SupportAgent,
  Assignment,
  Event,
  People,
  AccountBalance,
  Payment,
  Receipt,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { api } from '../../services/api';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`accountant-tabpanel-${index}`}
      aria-labelledby={`accountant-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AccountantDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    processedTransactions: 0,
    outstandingFees: 0,
  });

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
      designationRole: 'Accountant',
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

  // General Service Form State
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

  const [recentTransactions, setRecentTransactions] = useState([
    {
      id: 1,
      studentName: 'John Doe',
      amount: 5000,
      type: 'Fee Payment',
      date: '2024-03-20',
      status: 'Completed',
    },
    {
      id: 2,
      studentName: 'Jane Smith',
      amount: 3000,
      type: 'Fee Payment',
      date: '2024-03-19',
      status: 'Pending',
    },
  ]);

  useEffect(() => {
    // TODO: Fetch actual stats from API
    setStats({
      totalRevenue: 250000,
      pendingPayments: 15,
      processedTransactions: 150,
      outstandingFees: 45000,
    });
    fetchServiceRequests();
  }, []);

  const fetchServiceRequests = async () => {
    try {
      setLoadingRequests(true);
      const response = await api.get('/accountant/service-requests');
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
      if (!itSupportForm.requesterInfo.name) newErrors.name = 'Name is required';
      if (!itSupportForm.requesterInfo.emailAddress) newErrors.email = 'Email is required';
      if (!itSupportForm.deviceEquipmentInfo.typeOfDevice) newErrors.deviceType = 'Device type is required';
      if (!itSupportForm.issueDescription) newErrors.issueDescription = 'Issue description is required';
      if (!itSupportForm.priorityLevel) newErrors.priorityLevel = 'Priority level is required';
      if (!itSupportForm.requestedAction) newErrors.requestedAction = 'Requested action is required';
      if (!itSupportForm.acknowledgment) newErrors.acknowledgment = 'Please acknowledge the terms';
    } else {
      if (!generalServiceForm.requesterName) newErrors.requesterName = 'Requester name is required';
      if (!generalServiceForm.email) newErrors.email = 'Email is required';
      if (!generalServiceForm.serviceCategory) newErrors.serviceCategory = 'Service category is required';
      if (!generalServiceForm.description) newErrors.description = 'Description is required';
      if (!generalServiceForm.urgencyLevel) newErrors.urgencyLevel = 'Urgency level is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitRequest = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const submissionData = requestType === 'ITSupportRequest'
        ? {
            requestType: 'ITSupportRequest',
            ...itSupportForm,
            requesterId: user?.id,
            requesterType: 'Accountant'
          }
        : {
            requestType: 'GeneralServiceRequest',
            ...generalServiceForm,
            requesterId: user?.id,
            requesterType: 'Accountant'
          };

      await api.post('/accountant/service-requests', submissionData);
      toast.success('Service request submitted successfully');
      setCreateRequestDialog(false);
      fetchServiceRequests();
      
      // Reset forms
      setItSupportForm({
        requesterInfo: {
          name: user?.name || '',
          designationRole: 'Accountant',
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
        urgencyLevel: '',
        specialRequirements: ''
      });
      
      setErrors({});
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit service request');
    }
  };

  const getRequestTypeIcon = (type) => {
    switch (type) {
      case 'ITSupportRequest': return <Computer />;
      case 'GeneralServiceRequest': return <Build />;
      default: return <Assignment />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      case 'In Progress': return 'info';
      case 'Completed': return 'success';
      default: return 'default';
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleServiceRequestsTabChange = (event, newValue) => {
    setServiceRequestsTab(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.name || 'Accountant'}
      </Typography>
      
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Overview" icon={<Event />} />
        <Tab label="Service Requests" icon={<SupportAgent />} />
      </Tabs>

      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Revenue
                </Typography>
                <Typography variant="h5">
                  ₹{stats.totalRevenue.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending Payments
                </Typography>
                <Typography variant="h5">
                  {stats.pendingPayments}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Processed Transactions
                </Typography>
                <Typography variant="h5">
                  {stats.processedTransactions}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Outstanding Fees
                </Typography>
                <Typography variant="h5">
                  ₹{stats.outstandingFees.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Transactions
              </Typography>
              <List>
                {recentTransactions.map((transaction) => (
                  <ListItem key={transaction.id}>
                    <ListItemText
                      primary={transaction.studentName}
                      secondary={`${transaction.type} - ₹${transaction.amount} on ${transaction.date}`}
                    />
                    <Chip 
                      label={transaction.status} 
                      color={transaction.status === 'Completed' ? 'success' : 'warning'} 
                      size="small" 
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button variant="contained" color="primary" fullWidth>
                    Process Payments
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button variant="contained" color="secondary" fullWidth>
                    Generate Reports
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Box sx={{ mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Service Requests</Typography>
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
            onChange={handleServiceRequestsTabChange}
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
        </Box>
      </TabPanel>

      {/* Create Service Request Dialog */}
      <Dialog 
        open={createRequestDialog} 
        onClose={() => setCreateRequestDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Create Service Request
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
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
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
                Requester Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Name *"
                    fullWidth
                    margin="normal"
                    value={itSupportForm.requesterInfo.name}
                    onChange={(e) => handleInputChange('itSupport', 'requesterInfo.name', e.target.value)}
                    error={!!errors.name}
                    helperText={errors.name}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Email *"
                    fullWidth
                    margin="normal"
                    type="email"
                    value={itSupportForm.requesterInfo.emailAddress}
                    onChange={(e) => handleInputChange('itSupport', 'requesterInfo.emailAddress', e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Contact Number"
                    fullWidth
                    margin="normal"
                    value={itSupportForm.requesterInfo.contactNumber}
                    onChange={(e) => handleInputChange('itSupport', 'requesterInfo.contactNumber', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Department/Class"
                    fullWidth
                    margin="normal"
                    value={itSupportForm.requesterInfo.departmentClass}
                    onChange={(e) => handleInputChange('itSupport', 'requesterInfo.departmentClass', e.target.value)}
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
                Device/Equipment Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Type of Device *</InputLabel>
                    <Select
                      value={itSupportForm.deviceEquipmentInfo.typeOfDevice}
                      onChange={(e) => handleInputChange('itSupport', 'deviceEquipmentInfo.typeOfDevice', e.target.value)}
                      label="Type of Device *"
                      error={!!errors.deviceType}
                    >
                      <MenuItem value="Desktop">Desktop</MenuItem>
                      <MenuItem value="Laptop">Laptop</MenuItem>
                      <MenuItem value="Projector">Projector</MenuItem>
                      <MenuItem value="Printer">Printer</MenuItem>
                      <MenuItem value="Smart Board">Smart Board</MenuItem>
                      <MenuItem value="Network Issue">Network Issue</MenuItem>
                      <MenuItem value="Software/Application">Software/Application</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Device Asset ID"
                    fullWidth
                    margin="normal"
                    value={itSupportForm.deviceEquipmentInfo.deviceAssetId}
                    onChange={(e) => handleInputChange('itSupport', 'deviceEquipmentInfo.deviceAssetId', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Operating System"
                    fullWidth
                    margin="normal"
                    value={itSupportForm.deviceEquipmentInfo.operatingSystem}
                    onChange={(e) => handleInputChange('itSupport', 'deviceEquipmentInfo.operatingSystem', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Other Device Type"
                    fullWidth
                    margin="normal"
                    value={itSupportForm.deviceEquipmentInfo.otherDeviceType}
                    onChange={(e) => handleInputChange('itSupport', 'deviceEquipmentInfo.otherDeviceType', e.target.value)}
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
                Issue Details
              </Typography>
              <TextField
                label="Issue Description *"
                fullWidth
                margin="normal"
                multiline
                rows={4}
                value={itSupportForm.issueDescription}
                onChange={(e) => handleInputChange('itSupport', 'issueDescription', e.target.value)}
                error={!!errors.issueDescription}
                helperText={errors.issueDescription}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Priority Level *</InputLabel>
                    <Select
                      value={itSupportForm.priorityLevel}
                      onChange={(e) => handleInputChange('itSupport', 'priorityLevel', e.target.value)}
                      label="Priority Level *"
                      error={!!errors.priorityLevel}
                    >
                      {priorityLevels.map((level) => (
                        <MenuItem key={level} value={level}>{level}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Requested Action *</InputLabel>
                    <Select
                      value={itSupportForm.requestedAction}
                      onChange={(e) => handleInputChange('itSupport', 'requestedAction', e.target.value)}
                      label="Requested Action *"
                      error={!!errors.requestedAction}
                    >
                      {requestedActions.map((action) => (
                        <MenuItem key={action} value={action}>{action}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <TextField
                label="Preferred Contact Time"
                fullWidth
                margin="normal"
                value={itSupportForm.preferredContactTime}
                onChange={(e) => handleInputChange('itSupport', 'preferredContactTime', e.target.value)}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={itSupportForm.acknowledgment}
                    onChange={(e) => handleInputChange('itSupport', 'acknowledgment', e.target.checked)}
                  />
                }
                label="I acknowledge that this request will be processed according to IT support procedures"
                sx={{ mt: 2 }}
              />
              {errors.acknowledgment && (
                <Typography color="error" variant="caption" sx={{ ml: 2 }}>
                  {errors.acknowledgment}
                </Typography>
              )}
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
                Requester Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Requester Name *"
                    fullWidth
                    margin="normal"
                    value={generalServiceForm.requesterName}
                    onChange={(e) => handleInputChange('general', 'requesterName', e.target.value)}
                    error={!!errors.requesterName}
                    helperText={errors.requesterName}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Email *"
                    fullWidth
                    margin="normal"
                    type="email"
                    value={generalServiceForm.email}
                    onChange={(e) => handleInputChange('general', 'email', e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Contact Number"
                    fullWidth
                    margin="normal"
                    value={generalServiceForm.contactNumber}
                    onChange={(e) => handleInputChange('general', 'contactNumber', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Department"
                    fullWidth
                    margin="normal"
                    value={generalServiceForm.department}
                    onChange={(e) => handleInputChange('general', 'department', e.target.value)}
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
                Service Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Service Category *</InputLabel>
                    <Select
                      value={generalServiceForm.serviceCategory}
                      onChange={(e) => handleInputChange('general', 'serviceCategory', e.target.value)}
                      label="Service Category *"
                      error={!!errors.serviceCategory}
                    >
                      {serviceCategories.map((category) => (
                        <MenuItem key={category} value={category}>{category}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Service Location"
                    fullWidth
                    margin="normal"
                    value={generalServiceForm.serviceLocation}
                    onChange={(e) => handleInputChange('general', 'serviceLocation', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Preferred Date"
                    type="date"
                    fullWidth
                    margin="normal"
                    value={generalServiceForm.preferredDate}
                    onChange={(e) => handleInputChange('general', 'preferredDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Preferred Time"
                    fullWidth
                    margin="normal"
                    value={generalServiceForm.preferredTime}
                    onChange={(e) => handleInputChange('general', 'preferredTime', e.target.value)}
                  />
                </Grid>
              </Grid>

              <TextField
                label="Description *"
                fullWidth
                margin="normal"
                multiline
                rows={4}
                value={generalServiceForm.description}
                onChange={(e) => handleInputChange('general', 'description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Urgency Level *</InputLabel>
                    <Select
                      value={generalServiceForm.urgencyLevel}
                      onChange={(e) => handleInputChange('general', 'urgencyLevel', e.target.value)}
                      label="Urgency Level *"
                      error={!!errors.urgencyLevel}
                    >
                      <MenuItem value="Low">Low</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="High">High</MenuItem>
                      <MenuItem value="Critical">Critical</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Special Requirements"
                    fullWidth
                    margin="normal"
                    value={generalServiceForm.specialRequirements}
                    onChange={(e) => handleInputChange('general', 'specialRequirements', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateRequestDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitRequest} variant="contained">
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountantDashboard; 