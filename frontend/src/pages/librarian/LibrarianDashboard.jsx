import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  useTheme,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  InputAdornment,
  Switch,
  FormControlLabel,
  Rating,
  Avatar,
  Badge
} from '@mui/material';
import {
  LibraryBooks as LibraryIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  AccountCircle,
  Logout as LogoutIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Book as BookIcon,
  Bookmark as BookmarkIcon,
  LocalLibrary as LocalLibraryIcon,
  School as StudentIcon,
  Inventory as InventoryIcon,
  RateReview as RemarksIcon,
  Feedback as FeedbackIcon,
  Event as EventIcon,
  Message as MessageIcon,
  Computer,
  Build,
  Send,
  SupportAgent
} from '@mui/icons-material';
import {
  XAxis,
  YAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStaffPermissions } from '../../context/StaffPermissionContext';
import { toast } from 'react-toastify';
import { api } from '../../services/api';
import { 
  PermissionGate,
  PermissionFeatureCard, 
  PermissionNavItem, 
  PermissionButton,
  PermissionStatus 
} from '../../components/permissions/PermissionGate';

// Animated Stat Card Component
const AnimatedStatCard = ({ icon: Icon, label, value, color, subtitle, trend, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ scale: 1.02, y: -5 }}
  >
    <Paper 
      elevation={6} 
      sx={{ 
        p: 3, 
        borderRadius: 3, 
        background: `linear-gradient(135deg, ${color}15, ${color}05)`,
        border: `1px solid ${color}20`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ position: 'absolute', top: 0, right: 0, p: 1 }}>
        <Icon sx={{ fontSize: 40, color: `${color}40` }} />
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>{label}</Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: color }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            {subtitle}
          </Typography>
        )}
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            {trend > 0 ? (
              <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main', mr: 0.5 }} />
            )}
            <Typography variant="body2" sx={{ color: trend > 0 ? 'success.main' : 'error.main' }}>
              {Math.abs(trend)}% from last month
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  </motion.div>
);

// Book Card Component
const BookCard = ({ book, onEdit, onDelete, onView }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <BookIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
            {book.title}
          </Typography>
          <Chip 
            label={book.status} 
            size="small" 
            color={book.status === 'Available' ? 'success' : book.status === 'Borrowed' ? 'warning' : 'error'} 
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Author: {book.author}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          ISBN: {book.isbn}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Category: {book.category}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
          <IconButton size="small" onClick={() => onView(book)}>
            <ViewIcon />
          </IconButton>
          <IconButton size="small" onClick={() => onEdit(book)}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete(book._id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

// Librarian Dashboard
const LibrarianDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { getUserFeaturePermissions } = useStaffPermissions();
  const queryClient = useQueryClient();

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [bookDialog, setBookDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    copies: '',
    status: 'Available'
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
      designationRole: 'Librarian',
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

  // Get user permissions
  const userPermissions = getUserFeaturePermissions();

  // Mock data - replace with actual API calls
  const libraryStats = {
    totalBooks: 1250,
    borrowedBooks: 342,
    availableBooks: 908,
    totalMembers: 450,
    overdueBooks: 15,
    totalCategories: 25
  };

  const books = [
    {
      _id: '1',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '978-0743273565',
      category: 'Fiction',
      status: 'Available',
      copies: 3
    },
    {
      _id: '2',
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      isbn: '978-0446310789',
      category: 'Fiction',
      status: 'Borrowed',
      copies: 2
    }
  ];

  // Helper functions
  const resetBookForm = () => {
    setBookForm({
      title: '',
      author: '',
      isbn: '',
      category: '',
      copies: '',
      status: 'Available'
    });
  };

  const handleBookSubmit = () => {
    if (!bookForm.title || !bookForm.author || !bookForm.isbn) {
      toast.error('Please fill in all required fields');
      return;
    }
    // Add book logic here
    setBookDialog(false);
    resetBookForm();
    toast.success('Book added successfully');
  };

  // Service Request Functions
  const fetchServiceRequests = async () => {
    try {
      setLoadingRequests(true);
      const response = await api.get('/librarian/service-requests');
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
            requesterType: 'Librarian'
          }
        : {
            requestType: 'GeneralServiceRequest',
            ...generalServiceForm,
            requesterId: user?.id,
            requesterType: 'Librarian'
          };

      await api.post('/librarian/service-requests', submissionData);
      toast.success('Service request submitted successfully');
      setCreateRequestDialog(false);
      fetchServiceRequests();
      
      // Reset forms
      setItSupportForm({
        requesterInfo: {
          name: user?.name || '',
          designationRole: 'Librarian',
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

  const handleServiceRequestsTabChange = (event, newValue) => {
    setServiceRequestsTab(newValue);
  };

  return (
    <Box sx={{ minHeight: '20vh', background: theme.palette.grey[50] }}>

      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStatCard
              icon={BookIcon}
              label="Total Books"
              value={libraryStats.totalBooks}
              color={theme.palette.primary.main}
              subtitle="In library"
              trend={12.5}
              delay={0.1}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStatCard
              icon={BookmarkIcon}
              label="Borrowed Books"
              value={libraryStats.borrowedBooks}
              color={theme.palette.warning.main}
              subtitle="Currently out"
              trend={8.7}
              delay={0.2}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStatCard
              icon={LocalLibraryIcon}
              label="Available Books"
              value={libraryStats.availableBooks}
              color={theme.palette.success.main}
              subtitle="Ready to borrow"
              trend={15.3}
              delay={0.3}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStatCard
              icon={StudentIcon}
              label="Total Members"
              value={libraryStats.totalMembers}
              color={theme.palette.info.main}
              subtitle="Registered users"
              trend={5.2}
              delay={0.4}
            />
          </Grid>
        </Grid>

        {/* Feature Cards with Permissions */}
        {/* <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <PermissionFeatureCard
              title="Inventory Management"
              description="Manage library inventory and book catalog"
              icon={InventoryIcon}
              permission="inventory.view_inventory"
              color="primary"
              onClick={() => setActiveTab(1)}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {libraryStats.totalBooks} books in catalog
                </Typography>
                <PermissionStatus permission="inventory.view_inventory" />
              </Box>
            </PermissionFeatureCard>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <PermissionFeatureCard
              title="Student Records"
              description="Access student information and records"
              icon={StudentIcon}
              permission="student_records.view_students"
              color="success"
              onClick={() => console.log('Navigate to student records')}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {libraryStats.totalMembers} registered students
                </Typography>
                <PermissionStatus permission="student_records.view_students" />
              </Box>
            </PermissionFeatureCard>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <PermissionFeatureCard
              title="Teacher Remarks"
              description="View and manage teacher remarks"
              icon={RemarksIcon}
              permission="teacher_remarks.view_remarks"
              color="warning"
              onClick={() => console.log('Navigate to teacher remarks')}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Access teacher feedback
                </Typography>
                <PermissionStatus permission="teacher_remarks.view_remarks" />
              </Box>
            </PermissionFeatureCard>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <PermissionFeatureCard
              title="Feedback System"
              description="Manage feedback and suggestions"
              icon={FeedbackIcon}
              permission="feedbacks.view_feedback"
              color="info"
              onClick={() => console.log('Navigate to feedback')}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Respond to user feedback
                </Typography>
                <PermissionStatus permission="feedbacks.view_feedback" />
              </Box>
            </PermissionFeatureCard>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <PermissionFeatureCard
              title="Event Management"
              description="Manage library events and activities"
              icon={EventIcon}
              permission="events.view_events"
              color="secondary"
              onClick={() => console.log('Navigate to events')}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Library events and activities
                </Typography>
                <PermissionStatus permission="events.view_events" />
              </Box>
            </PermissionFeatureCard>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <PermissionFeatureCard
              title="Communication"
              description="Send messages and announcements"
              icon={MessageIcon}
              permission="communication.send_messages"
              color="error"
              onClick={() => console.log('Navigate to communication')}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Send messages to users
                </Typography>
                <PermissionStatus permission="communication.send_messages" />
              </Box>
            </PermissionFeatureCard>
          </Grid>
        </Grid> */}

        {/* Main Content Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Overview" icon={<TimelineIcon />} />
            <Tab label="Books" icon={<BookIcon />} />
            <Tab label="Members" icon={<PersonIcon />} />
            <Tab label="Reports" icon={<AssessmentIcon />} />
            <Tab label="Service Requests" icon={<SupportAgent />} />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 0 && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 3, height: 400 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Book Borrowing Trends</Typography>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { month: 'Jan', borrowed: 45, returned: 42, overdue: 3 },
                        { month: 'Feb', borrowed: 52, returned: 48, overdue: 4 },
                        { month: 'Mar', borrowed: 38, returned: 35, overdue: 3 },
                        { month: 'Apr', borrowed: 61, returned: 58, overdue: 3 },
                        { month: 'May', borrowed: 55, returned: 52, overdue: 3 },
                        { month: 'Jun', borrowed: 67, returned: 65, overdue: 2 },
                      ]}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Area type="monotone" dataKey="borrowed" stackId="1" stroke={theme.palette.primary.main} fill={theme.palette.primary.main} fillOpacity={0.6} />
                        <Area type="monotone" dataKey="returned" stackId="1" stroke={theme.palette.success.main} fill={theme.palette.success.main} fillOpacity={0.6} />
                        <Area type="monotone" dataKey="overdue" stackId="1" stroke={theme.palette.error.main} fill={theme.palette.error.main} fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, height: 400 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Book Categories</Typography>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Fiction', value: 450, color: theme.palette.primary.main },
                            { name: 'Non-Fiction', value: 380, color: theme.palette.secondary.main },
                            { name: 'Science', value: 220, color: theme.palette.success.main },
                            { name: 'History', value: 200, color: theme.palette.warning.main }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                        >
                          {[
                            { name: 'Fiction', value: 450, color: theme.palette.primary.main },
                            { name: 'Non-Fiction', value: 380, color: theme.palette.secondary.main },
                            { name: 'Science', value: 220, color: theme.palette.success.main },
                            { name: 'History', value: 200, color: theme.palette.warning.main }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
            </motion.div>
          )}

          {activeTab === 1 && (
            <motion.div
              key="books"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PermissionGate permission="inventory.view_inventory">
                <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <PermissionButton
                    permission="inventory.manage_inventory"
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setBookDialog(true)}
                  >
                    Add Book
                  </PermissionButton>
                  <PermissionButton
                    permission="inventory.generate_reports"
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => console.log('Export books')}
                  >
                    Export Books
                  </PermissionButton>
                </Box>

                <Grid container spacing={3}>
                  {books.map((book) => (
                    <Grid item xs={12} sm={6} md={4} key={book._id}>
                      <BookCard
                        book={book}
                        onEdit={(book) => {
                          setSelectedBook(book);
                          setBookForm(book);
                          setBookDialog(true);
                        }}
                        onDelete={(id) => {
                          toast.success('Book deleted successfully');
                        }}
                        onView={(book) => {
                          console.log('View book:', book);
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </PermissionGate>
            </motion.div>
          )}

          {activeTab === 2 && (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PermissionGate permission="student_records.view_students">
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Library Members</Typography>
                  <Typography variant="body1" color="text.secondary">
                    Access to student records is available. You can view member information and manage library accounts.
                  </Typography>
                </Paper>
              </PermissionGate>
            </motion.div>
          )}

          {activeTab === 3 && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PermissionGate permission="inventory.generate_reports">
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: 400 }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>Monthly Borrowing Report</Typography>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { category: 'Fiction', borrowed: 45, returned: 42 },
                          { category: 'Non-Fiction', borrowed: 38, returned: 35 },
                          { category: 'Science', borrowed: 22, returned: 20 },
                          { category: 'History', borrowed: 20, returned: 18 }
                        ]}>
                          <XAxis dataKey="category" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Bar dataKey="borrowed" fill={theme.palette.primary.main} />
                          <Bar dataKey="returned" fill={theme.palette.success.main} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: 400 }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>Member Activity</Typography>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[
                          { month: 'Jan', active: 120, new: 15 },
                          { month: 'Feb', active: 135, new: 18 },
                          { month: 'Mar', active: 110, new: 12 },
                          { month: 'Apr', active: 145, new: 22 },
                          { month: 'May', active: 130, new: 16 },
                          { month: 'Jun', active: 155, new: 25 }
                        ]}>
                          <XAxis dataKey="month" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Line type="monotone" dataKey="active" stroke={theme.palette.primary.main} />
                          <Line type="monotone" dataKey="new" stroke={theme.palette.success.main} />
                        </LineChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                </Grid>
              </PermissionGate>
            </motion.div>
          )}

          {activeTab === 4 && (
            <motion.div
              key="service-requests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Book Dialog */}
        <Dialog open={bookDialog} onClose={() => setBookDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>{selectedBook ? 'Edit Book' : 'Add New Book'}</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Book Title"
                  fullWidth
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Author"
                  fullWidth
                  value={bookForm.author}
                  onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="ISBN"
                  fullWidth
                  value={bookForm.isbn}
                  onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={bookForm.category}
                    onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                  >
                    <MenuItem value="Fiction">Fiction</MenuItem>
                    <MenuItem value="Non-Fiction">Non-Fiction</MenuItem>
                    <MenuItem value="Science">Science</MenuItem>
                    <MenuItem value="History">History</MenuItem>
                    <MenuItem value="Biography">Biography</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Number of Copies"
                  type="number"
                  fullWidth
                  value={bookForm.copies}
                  onChange={(e) => setBookForm({ ...bookForm, copies: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={bookForm.status}
                    onChange={(e) => setBookForm({ ...bookForm, status: e.target.value })}
                  >
                    <MenuItem value="Available">Available</MenuItem>
                    <MenuItem value="Borrowed">Borrowed</MenuItem>
                    <MenuItem value="Maintenance">Maintenance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBookDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleBookSubmit}>
              {selectedBook ? 'Update Book' : 'Add Book'}
            </Button>
          </DialogActions>
        </Dialog>

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
    </Box>
  );
};

export default LibrarianDashboard; 