import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button,
  IconButton,
  Tooltip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  People,
  School,
  Payment,
  Assignment,
  Event,
  Message,
  Refresh,
  Download,
  Inventory,
  Settings,
  Assessment,
  Group as GroupIcon,
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon,
  Warning,
  AccountBalance,
  Computer,
  Build,
  Send,
  History,
  Visibility,
  CheckCircle,
  Error,
  Schedule,
  Person,
  SupportAgent,
  Home,
  ArrowBack,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { roleConfig } from './roleConfig';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalStaff: 0,
    totalClasses: 0,
    upcomingEvents: [],
    recentAnnouncements: [],
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
      designationRole: 'Admin',
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
    fetchDashboardData();
    fetchServiceRequests();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceRequests = async () => {
    try {
      setLoadingRequests(true);
      const response = await adminAPI.getServiceRequests();
      setServiceRequests(response || []);
    } catch (error) {
      console.error('Error fetching service requests:', error);
      toast.error('Failed to fetch service requests');
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
    fetchServiceRequests();
    toast.success('Dashboard refreshed');
  };

  const handleDownloadReport = (type) => {
    // Implement report download logic
    toast.info(`Downloading ${type} report...`);
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
            requesterType: 'Admin'
          }
        : {
            ...generalServiceForm,
            requesterType: 'Admin',
            requestType: 'GeneralServiceRequest'
          };

      await adminAPI.createServiceRequest(submissionData);
      
      toast.success('Service request submitted successfully');
      setCreateRequestDialog(false);
      fetchServiceRequests();
      
      // Reset forms
      setItSupportForm({
        requesterInfo: {
          name: user?.name || '',
          designationRole: 'Admin',
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // If user is AdminStaff and has a designation in roleConfig, show only their dashboard widgets
  if (user?.role === 'AdminStaff' && roleConfig[user?.designation]) {
    return (
      <Box p={3}>
        <Typography variant="h4" gutterBottom>
          {roleConfig[user.designation].title} Dashboard
        </Typography>
        <Grid container spacing={3}>
          {roleConfig[user.designation].widgets.map((widget, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{widget.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {widget.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Back Button - Minimal Design */}
      <Box sx={{ 
        position: 'fixed', 
        top: 15, 
        left: 15, 
        zIndex: 1201,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 48,
        height: 48,
        bgcolor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        borderRadius: '50%',
        backdropFilter: 'blur(10px)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: isDark 
          ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
          : '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}>
        <IconButton
          onClick={() => window.history.back()}
          sx={{
            color: isDark ? '#f1f5f9' : '#1e293b',
            width: 40,
            height: 40,
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)',
              transform: 'scale(1.05)',
            }
          }}
        >
          <ArrowBack />
        </IconButton>
      </Box>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Welcome back, {user?.name}
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => handleDownloadReport('comprehensive')}
          >
            Download Report
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid 
        container 
        spacing={{ xs: 2, sm: 3, md: 3 }} 
        sx={{ 
          mb: 4,
          '& .MuiGrid-item': {
            minHeight: { xs: '120px', sm: '140px', md: '160px' }
          }
        }}
      >
        <Grid item xs={6} sm={4} md={3} lg={2}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Total Students
                  </Typography>
                  <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                    {stats.totalStudents}
                  </Typography>
                </Box>
                <People color="primary" sx={{ fontSize: { xs: 28, sm: 32, md: 40 } }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={4} md={3} lg={2}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Total Staff
                  </Typography>
                  <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                    {stats.totalStaff}
                  </Typography>
                </Box>
                <GroupIcon color="secondary" sx={{ fontSize: { xs: 28, sm: 32, md: 40 } }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={4} md={3} lg={2}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Total Classes
                  </Typography>
                  <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                    {stats.totalClasses}
                  </Typography>
                </Box>
                <School color="success" sx={{ fontSize: { xs: 28, sm: 32, md: 40 } }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={4} md={3} lg={2}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Upcoming Events
                  </Typography>
                  <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                    {stats.upcomingEvents?.length || 0}
                  </Typography>
                </Box>
                <Event color="warning" sx={{ fontSize: { xs: 28, sm: 32, md: 40 } }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={4} md={3} lg={2}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Budget Requests
                  </Typography>
                  <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                    0
                  </Typography>
                </Box>
                <AccountBalance color="info" sx={{ fontSize: { xs: 28, sm: 32, md: 40 } }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={4} md={3} lg={2}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Meeting Minutes
                  </Typography>
                  <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                    0
                  </Typography>
                </Box>
                <Assignment color="success" sx={{ fontSize: { xs: 28, sm: 32, md: 40 } }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Service Requests Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
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

      {/* Budget Approval and Meeting Minutes Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 2,
            boxShadow: 3,
            border: '1px solid #e0e0e0',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 6,
              border: '2px solid #1976d2'
            }
          }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 800,
                    color: '#1976d2',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                >
                  Budget Approval
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AccountBalance />}
                  onClick={() => navigate('/admin/budget-approval')}
                  sx={{
                    backgroundColor: '#1976d2',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    '&:hover': {
                      backgroundColor: '#1565c0',
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  Create Budget
                </Button>
              </Box>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                Manage and approve budget requests for various departments and projects. Create new budget proposals and track approval status.
              </Typography>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Chip label="Pending: 0" color="warning" size="medium" sx={{ fontWeight: 600 }} />
                <Chip label="Approved: 0" color="success" size="medium" sx={{ fontWeight: 600 }} />
                <Chip label="Rejected: 0" color="error" size="medium" sx={{ fontWeight: 600 }} />
              </Box>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/admin/budget-approval')}
                  sx={{ fontSize: '0.8rem' }}
                >
                  View All
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/admin/budget-approval')}
                  sx={{ fontSize: '0.8rem' }}
                >
                  Quick Create
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 2,
            boxShadow: 3,
            border: '1px solid #e0e0e0',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 6,
              border: '2px solid #1976d2'
            }
          }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 800,
                    color: '#1976d2',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                >
                  Meeting Minutes
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Assignment />}
                  onClick={() => navigate('/admin/meeting-minutes')}
                  sx={{
                    backgroundColor: '#1976d2',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    '&:hover': {
                      backgroundColor: '#1565c0',
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  Create Minutes
                </Button>
              </Box>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                Create and manage school meeting minutes with agenda items and action points. Track meeting outcomes and follow-ups.
              </Typography>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Chip label="Draft: 0" color="default" size="medium" sx={{ fontWeight: 600 }} />
                <Chip label="Submitted: 0" color="info" size="medium" sx={{ fontWeight: 600 }} />
                <Chip label="Approved: 0" color="success" size="medium" sx={{ fontWeight: 600 }} />
              </Box>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/admin/meeting-minutes')}
                  sx={{ fontSize: '0.8rem' }}
                >
                  View All
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/admin/meeting-minutes')}
                  sx={{ fontSize: '0.8rem' }}
                >
                  Quick Create
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activities */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Announcements
              </Typography>
              <List>
                {stats.recentAnnouncements?.map((announcement, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={announcement.title}
                      secondary={announcement.date}
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
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<People />}
                    onClick={() => navigate('/admin/staff')}
                  >
                    Manage Staff
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<School />}
                    onClick={() => navigate('/admin/students')}
                  >
                    Manage Students
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Event />}
                    onClick={() => navigate('/admin/events')}
                  >
                    Manage Events
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Settings />}
                    onClick={() => navigate('/admin/settings')}
                  >
                    System Settings
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
                
                {/* Budget and Urgency */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Budget Estimate"
                    value={generalServiceForm.budgetEstimate}
                    onChange={(e) => handleInputChange('general', 'budgetEstimate', e.target.value)}
                    fullWidth
                    placeholder="e.g., $500"
                  />
                </Grid>
                
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
}

export default AdminDashboard; 