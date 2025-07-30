import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Button,
  Avatar,
  Paper,
  Container,
  Alert,
  IconButton,
  Badge,
  Snackbar,
  Slide,
  MobileStepper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
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
} from '@mui/material';
import {
  School,
  Assignment,
  Event,
  Notifications,
  TrendingUp,
  Schedule,
  Book,
  Person,
  DirectionsBus,
  Quiz,
  Grade,
  Settings,
  Dashboard as DashboardIcon,
  CalendarToday,
  LibraryBooks,
  Forum,
  Payment,
  DocumentScanner,
  VideoLibrary,
  Message,
  Receipt,
  Assessment,
  Timeline,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  PlayArrow,
  Pause,
  AccessTime,
  LocationOn,
  PersonOutline,
  Subject,
  Close,
  Warning,
  Info,
  CheckCircle,
  Computer,
  Build,
  Send,
  History,
  Visibility,
  Error,
} from '@mui/icons-material';
import studentService from '../../services/studentService';
import axios from 'axios';
import { Alert as MuiAlert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [messages, setMessages] = useState([]);
  const [homework, setHomework] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [feeStatus, setFeeStatus] = useState(null);
  const [showFeePopup, setShowFeePopup] = useState(false);
  const [learningResources, setLearningResources] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  
  // New state variables for enhanced features
  const [ongoingLessons, setOngoingLessons] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [notifications, setNotifications] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [taskNotifications, setTaskNotifications] = useState([]);
  const [remarksSchema, setRemarksSchema] = useState([]);
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [schemaError, setSchemaError] = useState('');

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
      designationRole: 'Student',
      departmentClass: user?.grade || '',
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
    studentId: user?.studentId || '',
    grade: user?.grade || '',
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

  useEffect(() => {
    fetchDashboardData();
    fetchRemarksSchema();
    fetchFeeStatus();
  }, []);

  const fetchRemarksSchema = async () => {
    setSchemaLoading(true);
    setSchemaError('');
    try {
      const res = await axios.get('/api/teacher-remarks/schema');
      setRemarksSchema(res.data.schema || []);
    } catch (err) {
      setSchemaError('Failed to load teacher remarks schema');
    } finally {
      setSchemaLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all dashboard data in parallel
      const [
        profileRes,
        subjectsRes,
        assignmentsRes,
        announcementsRes,
        performanceRes,
        attendanceRes,
        examsRes,
        messagesRes,
        homeworkRes,
        feeRes,
        resourcesRes,
        leaveRes,
        lessonsRes,
        notificationsRes,
      ] = await Promise.allSettled([
        studentService.getProfile(),
        studentService.getSubjectsAndTeachers(),
        studentService.getAssignments(),
        studentService.getAnnouncements(),
        studentService.getPerformanceAnalytics(),
        studentService.getAttendanceRecords(),
        studentService.getUpcomingExams(),
        studentService.getMessages(),
        studentService.getHomework(),
        studentService.getPaymentStatus(),
        studentService.getLearningResources(),
        studentService.getLeaveRequests(),
        studentService.getOngoingLessons ? studentService.getOngoingLessons() : Promise.resolve({ data: [] }),
        studentService.getNotifications ? studentService.getNotifications() : Promise.resolve({ data: [] }),
      ]);

      // Extract data from resolved promises
      const profile = profileRes.status === 'fulfilled' ? profileRes.value.data : null;
      const subjects = subjectsRes.status === 'fulfilled' ? (subjectsRes.value.data?.subjects || []) : [];
      const assignments = assignmentsRes.status === 'fulfilled' ? (assignmentsRes.value.data || []) : [];
      const announcements = announcementsRes.status === 'fulfilled' ? (announcementsRes.value.data || []) : [];
      const performance = performanceRes.status === 'fulfilled' ? performanceRes.value.data : null;
      const attendance = attendanceRes.status === 'fulfilled' ? (attendanceRes.value.data || []) : [];
      const upcomingExams = examsRes.status === 'fulfilled' ? (examsRes.value.data || []) : [];
      const messages = messagesRes.status === 'fulfilled' ? (messagesRes.value.data || []) : [];
      const homework = homeworkRes.status === 'fulfilled' ? (homeworkRes.value.data || []) : [];
      const _feeStatus = feeRes.status === 'fulfilled' ? feeRes.value.data : null;
      const learningResources = resourcesRes.status === 'fulfilled' ? (resourcesRes.value.data || []) : [];
      const leaveRequests = leaveRes.status === 'fulfilled' ? (leaveRes.value.data || []) : [];
      const ongoingLessons = lessonsRes.status === 'fulfilled' ? (Array.isArray(lessonsRes.value.data) ? lessonsRes.value.data : []) : [];
      const _notifications = notificationsRes.status === 'fulfilled' ? (notificationsRes.value.data || []) : [];

      setProfile(profile);
      setSubjects(subjects);
      setAssignments(assignments);
      setAnnouncements(announcements);
      setPerformance(performance);
      setAttendance(attendance);
      setUpcomingExams(upcomingExams);
      setMessages(messages);
      setHomework(homework);
      setFeeStatus(_feeStatus);
      setLearningResources(learningResources);
      setLeaveRequests(leaveRequests);
      setOngoingLessons(ongoingLessons);
      setNotifications(_notifications);

      // Generate task notifications from assignments and homework
      const allTasks = [
        ...(Array.isArray(assignments) ? assignments.filter(a => a.status === 'pending') : []),
        ...(Array.isArray(homework) ? homework.filter(h => h.status === 'pending') : []),
      ];
      
      const taskNotifs = allTasks.map(task => ({
        id: task.id,
        type: task.type || 'assignment',
        title: task.title || task.name,
        dueDate: task.dueDate || task.deadline,
        priority: task.priority || 'medium',
        message: `New ${task.type || 'assignment'} assigned: ${task.title || task.name}`,
      }));
      
      setTaskNotifications(taskNotifs);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch fee status and show popup if due
  const fetchFeeStatus = async () => {
    try {
      console.log('🔍 Fetching fee status...');
      // Only show once per session
      if (localStorage.getItem('feePopupShown')) {
        console.log('⏭️ Fee popup already shown this session');
        return;
      }
      
      console.log('📞 Calling studentService.getPaymentStatus()...');
      const feeData = await studentService.getPaymentStatus();
      console.log('📋 Fee status response:', feeData);
      
      if (feeData && feeData.data && feeData.data.paymentStatus === 'Overdue') {
        console.log('⚠️ Payment overdue detected');
        setFeeStatus(feeData.data);
        setShowFeePopup(true);
        localStorage.setItem('feePopupShown', 'true');
      } else {
        console.log('✅ Payment status is current');
      }
    } catch (error) {
      console.error('❌ Error fetching fee status:', error);
    }
  };

  // Service Request Functions
  const fetchServiceRequests = async () => {
    try {
      setLoadingRequests(true);
      const response = await studentService.getServiceRequests();
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
            requesterType: 'Student'
          }
        : {
            ...generalServiceForm,
            requesterType: 'Student',
            requestType: 'GeneralServiceRequest'
          };

      await studentService.createServiceRequest(submissionData);
      
      toast.success('Service request submitted successfully');
      setCreateRequestDialog(false);
      fetchServiceRequests();
      
      // Reset forms
      setItSupportForm({
        requesterInfo: {
          name: user?.name || '',
          designationRole: 'Student',
          departmentClass: user?.grade || '',
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
        studentId: user?.studentId || '',
        grade: user?.grade || '',
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
  const clearFeePopupFlag = () => {
    localStorage.removeItem('feePopupShown');
    console.log('🗑️ Cleared fee popup flag');
    window.location.reload();
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'success';
    if (grade >= 80) return 'primary';
    if (grade >= 70) return 'info';
    if (grade >= 60) return 'warning';
    return 'error';
  };

  const getAttendanceRate = () => {
    if (!attendance.length) return 0;
    const present = attendance.filter(record => record.status === 'present').length;
    return Math.round((present / attendance.length) * 100);
  };

  // Carousel navigation functions
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Notification handling
  const handleNotificationClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowNotifications(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'assignment':
        return <Assignment color="primary" />;
      case 'homework':
        return <Book color="primary" />;
      case 'exam':
        return <School color="primary" />;
      case 'announcement':
        return <Notifications color="primary" />;
      default:
        return <Info color="primary" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'primary';
    }
  };

  // Navigation cards for different student features
  const navigationCards = [
    {
      title: 'Assignments',
      description: 'View and submit homework assignments',
      icon: <Assignment color="primary" sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      path: '/student/assignments',
      count: Array.isArray(assignments) ? assignments.filter(a => a.status === 'pending').length : 0,
    },
    {
      title: 'Homework',
      description: 'Access and submit homework tasks',
      icon: <Book color="primary" sx={{ fontSize: 40 }} />,
      color: '#388e3c',
      path: '/student/homework',
      count: Array.isArray(homework) ? homework.filter(h => h.status === 'pending').length : 0,
    },
    {
      title: 'Exam Results',
      description: 'View your examination results and grades',
      icon: <Grade color="primary" sx={{ fontSize: 40 }} />,
      color: '#f57c00',
      path: '/student/examinations',
      count: Array.isArray(upcomingExams) ? upcomingExams.length : 0,
    },
    {
      title: 'School Timetable',
      description: 'View your weekly class schedule',
      icon: <Schedule color="primary" sx={{ fontSize: 40 }} />,
      color: '#7b1fa2',
      path: '/student/timetable',
    },
    {
      title: 'Attendance',
      description: 'Track your attendance records',
      icon: <Event color="primary" sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      path: '/student/attendance',
      count: getAttendanceRate(),
    },
    {
      title: 'Study Materials',
      description: 'Access learning resources and documents',
      icon: <LibraryBooks color="primary" sx={{ fontSize: 40 }} />,
      color: '#388e3c',
      path: '/student/study-materials',
      count: Array.isArray(learningResources) ? learningResources.length : 0,
    },
    {
      title: 'Communication',
      description: 'Connect with teachers and classmates',
      icon: <Forum color="primary" sx={{ fontSize: 40 }} />,
      color: '#f57c00',
      path: '/student/communication',
      count: Array.isArray(messages) ? messages.filter(m => !m.read).length : 0,
    },
    {
      title: 'Fee Management',
      description: 'View and manage your fee payments',
      icon: <Payment color="primary" sx={{ fontSize: 40 }} />,
      color: '#7b1fa2',
      path: '/student/fees',
    },
    {
      title: 'Documents',
      description: 'Access important school documents',
      icon: <DocumentScanner color="primary" sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
      path: '/student/documents',
    },
    {
      title: 'Calendar',
      description: 'View school events and important dates',
      icon: <CalendarToday color="primary" sx={{ fontSize: 40 }} />,
      color: '#5d4037',
      path: '/student/calendar',
    },
    {
      title: 'Leave Requests',
      description: 'Submit and track leave applications',
      icon: <Event color="primary" sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      path: '/student/leave-requests',
      count: Array.isArray(leaveRequests) ? leaveRequests.filter(l => l.status === 'pending').length : 0,
    },
    {
      title: 'Profile Settings',
      description: 'Manage your personal information',
      icon: <Settings color="primary" sx={{ fontSize: 40 }} />,
      color: '#5d4037',
      path: '/student/profile',
    },
  ];

  // Task notification component
  const TaskNotifications = ({ notifications }) => {
    const safeNotifications = Array.isArray(notifications) ? notifications : [];
    if (safeNotifications.length === 0) return null;

    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Recent Task Notifications
        </Typography>
        <Grid container spacing={2}>
          {safeNotifications.slice(0, 3).map((notification) => (
            <Grid item xs={12} key={notification.id}>
              <Card sx={{ 
                border: `1px solid ${getPriorityColor(notification.priority)}.main`,
                bgcolor: `${getPriorityColor(notification.priority)}.50`,
                '&:hover': { boxShadow: 2 }
              }}>
                <CardContent sx={{ py: 2 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center">
                      {getNotificationIcon(notification.type)}
                      <Box sx={{ ml: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {notification.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Due: {new Date(notification.dueDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Chip
                        label={notification.priority}
                        color={getPriorityColor(notification.priority)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => window.location.href = `/student/${notification.type}s`}
                      >
                        View
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        {safeNotifications.length > 3 && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              variant="text"
              size="small"
              onClick={() => setShowNotifications(true)}
            >
              View All Notifications ({safeNotifications.length})
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ py: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={fetchDashboardData}>
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => (
    <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          {icon}
          <Typography variant="h6" component="div" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" color={color}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const ListCard = ({ title, items, icon, emptyMessage = "No items to display", emptyAction }) => {
    const safeItems = Array.isArray(items) ? items : [];
    
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            {icon}
            <Typography variant="h6" component="div" sx={{ ml: 1 }}>
              {title}
            </Typography>
          </Box>
          {safeItems.length > 0 ? (
          <List>
            {safeItems.map((item, index) => (
              <div key={index}>
                <ListItem>
                  <ListItemText
                    primary={item.title || item.subject || item.name}
                    secondary={item.date || item.status || item.description}
                  />
                  {item.grade && (
                    <Chip
                      label={`${item.grade}%`}
                      color={getGradeColor(item.grade)}
                      size="small"
                    />
                  )}
                </ListItem>
                {index < safeItems.length - 1 && <Divider />}
              </div>
            ))}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Box sx={{ mb: 2 }}>
              {icon}
            </Box>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {emptyMessage}
            </Typography>
            {title === "Recent Assignments" && (
              <>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Great job! You're all caught up with your assignments.
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Check back regularly for new assignments from your teachers.
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="small"
                  onClick={() => window.location.href = '/student/assignments'}
                  startIcon={<Assignment />}
                >
                  View All Assignments
                </Button>
              </>
            )}
            {title === "Recent Announcements" && (
              <>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  No announcements at the moment.
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Important updates from your school will appear here.
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="small"
                  onClick={() => window.location.href = '/student/announcements'}
                  startIcon={<Notifications />}
                >
                  View All Announcements
                </Button>
              </>
            )}
            {title === "Upcoming Exams" && (
              <>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  No upcoming exams scheduled.
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  This is a great time to review your study materials and prepare ahead.
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="small"
                  onClick={() => window.location.href = '/student/study-materials'}
                  startIcon={<LibraryBooks />}
                >
                  Study Materials
                </Button>
              </>
            )}
            {title === "Recent Messages" && (
              <>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  No new messages.
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Stay connected with your teachers and classmates.
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="small"
                  onClick={() => window.location.href = '/student/communication'}
                  startIcon={<Message />}
                >
                  Send Message
                </Button>
              </>
            )}
            {!["Recent Assignments", "Recent Announcements", "Upcoming Exams", "Recent Messages"].includes(title) && (
              <>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {emptyMessage}
                </Typography>
                {emptyAction && (
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    size="small"
                    onClick={emptyAction.onClick}
                    startIcon={emptyAction.icon}
                  >
                    {emptyAction.text}
                  </Button>
                )}
              </>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
    );
  };

  const NavigationCard = ({ title, description, icon, color, path, count }) => (
    <Card 
      sx={{ 
        height: '100%', 
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        '&:hover': { 
          transform: 'translateY(-8px)',
          boxShadow: 4,
          backgroundColor: `${color}08`
        }
      }}
      onClick={() => window.location.href = path}
    >
      <CardContent sx={{ textAlign: 'center', p: 3 }}>
        <Box display="flex" justifyContent="center" mb={2} position="relative">
          {icon}
          {count > 0 && (
            <Chip
              label={count}
              size="small"
              color="error"
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                minWidth: 20,
                height: 20,
                fontSize: '0.75rem',
              }}
            />
          )}
        </Box>
        <Typography variant="h6" component="div" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  // Carousel component for ongoing lessons and student details
  const LessonCarousel = ({ lessons }) => {
    // Ensure lessons is always an array
    const safeLessons = Array.isArray(lessons) ? lessons : [];
    const maxSteps = safeLessons.length;
    
    if (maxSteps === 0) {
      return (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Schedule color="primary" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Ongoing Lessons
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Check your timetable for upcoming classes
            </Typography>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card sx={{ mb: 3, position: 'relative' }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, pb: 1 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Schedule color="primary" />
              <Typography variant="h6" sx={{ ml: 1 }}>
                Ongoing Lessons & Schedule
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ position: 'relative', height: 200 }}>
            {safeLessons.map((lesson, index) => (
              <Box
                key={lesson.id}
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  display: index === activeStep ? 'block' : 'none',
                }}
              >
                <Box sx={{ p: 3, pt: 0 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="h5" gutterBottom>
                        {lesson.subject}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {lesson.topic}
                      </Typography>
                    </Box>
                    <Chip
                      label={lesson.status}
                      color={lesson.status === 'ongoing' ? 'success' : lesson.status === 'upcoming' ? 'warning' : 'default'}
                      size="small"
                    />
                  </Box>
                  
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center">
                        <PersonOutline sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {lesson.teacher}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center">
                        <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {lesson.room}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center">
                        <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {lesson.startTime} - {lesson.endTime}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center">
                        <Subject sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {lesson.subject}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  {lesson.status === 'ongoing' && lesson.progress > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="textSecondary">
                          Progress
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {lesson.progress}%
                        </Typography>
                      </Box>
                      <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
                        <Box
                          sx={{
                            width: `${lesson.progress}%`,
                            bgcolor: 'primary.main',
                            height: 8,
                            borderRadius: 1,
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
          
          <MobileStepper
            steps={maxSteps}
            position="static"
            activeStep={activeStep}
            sx={{ bgcolor: 'transparent', px: 2, py: 1 }}
            nextButton={
              <IconButton
                size="small"
                onClick={handleNext}
                disabled={activeStep === maxSteps - 1}
              >
                <KeyboardArrowRight />
              </IconButton>
            }
            backButton={
              <IconButton
                size="small"
                onClick={handleBack}
                disabled={activeStep === 0}
              >
                <KeyboardArrowLeft />
              </IconButton>
            }
          />
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* Welcome Section with Enhanced Student Details */}
        <Box sx={{ mb: 4 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar
              sx={{ width: 80, height: 80, mr: 3 }}
              src={profile?.profilePicture}
            >
              {profile?.name?.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" gutterBottom>
                Welcome back, {profile?.name || 'Student'}!
              </Typography>
              {/* Temporary test button - remove in production */}
              <Button 
                onClick={clearFeePopupFlag}
                size="small"
                variant="outlined"
                sx={{ mb: 2 }}
              >
                Clear Fee Popup Flag (Test)
              </Button>
              <Typography variant="body1" color="textSecondary" gutterBottom>
                Student ID: {profile?.studentId} | Class: {profile?.class} {profile?.section}
              </Typography>
              {performance?.averageGrade && (
                <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                  Current Average: {performance.averageGrade}%
                </Typography>
              )}
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <IconButton
                color="primary"
                onClick={() => setShowNotifications(true)}
                sx={{ position: 'relative' }}
              >
                <Badge badgeContent={taskNotifications.length} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Task Notifications */}
        <TaskNotifications notifications={taskNotifications} />

        {/* Ongoing Lessons Carousel */}
        <LessonCarousel lessons={ongoingLessons} />

        {/* Statistics Cards */}
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Quick Overview
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending Assignments"
              value={Array.isArray(assignments) ? assignments.filter(a => a.status === 'pending').length : 0}
              icon={<Assignment color="primary" />}
              subtitle="Due soon"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Upcoming Exams"
              value={Array.isArray(upcomingExams) ? upcomingExams.length : 0}
              icon={<School color="primary" />}
              subtitle="Next 30 days"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Attendance Rate"
              value={`${getAttendanceRate()}%`}
              icon={<Event color="primary" />}
              subtitle="This month"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Unread Messages"
              value={Array.isArray(messages) ? messages.filter(m => !m.read).length : 0}
              icon={<Message color="primary" />}
              subtitle="New notifications"
            />
          </Grid>
        </Grid>

        {/* Navigation Grid */}
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Quick Access
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {navigationCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <NavigationCard {...card} />
            </Grid>
          ))}
        </Grid>

        {/* Recent Activity */}
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Recent Activity
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ListCard
              title="Recent Assignments"
              items={Array.isArray(assignments) ? assignments.slice(0, 5) : []}
              icon={<Assignment color="primary" />}
              emptyMessage="No recent assignments"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ListCard
              title="Recent Announcements"
              items={Array.isArray(announcements) ? announcements.slice(0, 5) : []}
              icon={<Notifications color="primary" />}
              emptyMessage="No recent announcements"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ListCard
              title="Upcoming Exams"
              items={Array.isArray(upcomingExams) ? upcomingExams.slice(0, 5) : []}
              icon={<School color="primary" />}
              emptyMessage="No upcoming exams"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ListCard
              title="Recent Messages"
              items={Array.isArray(messages) ? messages.slice(0, 5) : []}
              icon={<Message color="primary" />}
              emptyMessage="No recent messages"
            />
          </Grid>
        </Grid>

        {/* Performance Overview */}
        {performance && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Performance Overview
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <TrendingUp color="primary" />
                      <Typography variant="h6" sx={{ ml: 1 }}>
                        Academic Performance
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Average Grade
                        </Typography>
                        <Typography variant="h4" color="primary">
                          {performance.averageGrade || 0}%
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Total Subjects
                        </Typography>
                        <Typography variant="h4" color="primary">
                          {Array.isArray(subjects) ? subjects.length : 0}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Assessment color="primary" />
                      <Typography variant="h6" sx={{ ml: 1 }}>
                        Attendance Summary
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Present Days
                        </Typography>
                        <Typography variant="h4" color="success.main">
                          {Array.isArray(attendance) ? attendance.filter(a => a.status === 'present').length : 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Absent Days
                        </Typography>
                        <Typography variant="h4" color="error.main">
                          {Array.isArray(attendance) ? attendance.filter(a => a.status === 'absent').length : 0}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>

      {/* Notification Modal */}
      <Snackbar
        open={showNotifications}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleNotificationClose}
          severity="info"
          sx={{ width: '100%' }}
        >
          <Typography variant="h6" gutterBottom>
            All Notifications ({Array.isArray(taskNotifications) ? taskNotifications.length : 0})
          </Typography>
          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            {Array.isArray(taskNotifications) ? taskNotifications.map((notification) => (
              <Box key={notification.id} sx={{ mb: 2, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center">
                    {getNotificationIcon(notification.type)}
                    <Box sx={{ ml: 1 }}>
                      <Typography variant="subtitle2">
                        {notification.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Due: {new Date(notification.dueDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={notification.priority}
                    color={getPriorityColor(notification.priority)}
                    size="small"
                  />
                </Box>
              </Box>
            )) : []}
          </Box>
        </Alert>
      </Snackbar>

      {/* Auto-show notification for new tasks */}
      {Array.isArray(taskNotifications) && taskNotifications.length > 0 && (
        <Snackbar
          open={true}
          autoHideDuration={4000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            severity="info"
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={() => setShowNotifications(true)}
              >
                <Close fontSize="inherit" />
              </IconButton>
            }
          >
            {taskNotifications.length} new task{taskNotifications.length > 1 ? 's' : ''} assigned!
          </Alert>
        </Snackbar>
      )}

      {/* Fee Due Modal Popup */}
      <Dialog open={showFeePopup} onClose={() => setShowFeePopup(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Payment color="error" sx={{ mr: 1 }} />
            Fee Payment Due
          </Box>
        </DialogTitle>
        <DialogContent>
          {feeStatus ? (
            <Box>
              <MuiAlert severity="warning" sx={{ mb: 2 }}>
                You have a pending fee payment. Please pay as soon as possible to avoid penalties.
              </MuiAlert>
              <Typography variant="h6" color="error.main" gutterBottom>
                Amount Due: ₹{feeStatus.dueAmount}
              </Typography>
              {feeStatus.totalFee && (
                <Typography variant="body2" gutterBottom>
                  Total Fee: ₹{feeStatus.totalFee}
                </Typography>
              )}
              {feeStatus.term && (
                <Typography variant="body2" gutterBottom>
                  Term: {feeStatus.term}
                </Typography>
              )}
              <Typography variant="body2" gutterBottom>
                Due Date: {feeStatus.dueDate}
              </Typography>
              {feeStatus.paymentStatus && (
                <Chip
                  label={feeStatus.paymentStatus}
                  color={feeStatus.paymentStatus === 'Overdue' ? 'error' : 'warning'}
                  sx={{ mb: 2 }}
                />
              )}
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Payment History
              </Typography>
              {Array.isArray(feeStatus.paymentHistory) && feeStatus.paymentHistory.length > 0 ? (
                <List dense>
                  {feeStatus.paymentHistory.map((ph, idx) => (
                    <ListItem key={ph.id || idx}>
                      <ListItemText
                        primary={`${ph.description} - ₹${ph.amount}`}
                        secondary={`Date: ${ph.date} | Method: ${ph.method}`}
                      />
                      <Chip
                        label={ph.status}
                        color={ph.status === 'Completed' ? 'success' : 'warning'}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No payments made yet.
                </Typography>
              )}
            </Box>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFeePopup(false)} color="primary" variant="contained">
            Close
          </Button>
          <Button
            onClick={() => {
              setShowFeePopup(false);
              window.location.href = '/student/fees';
            }}
            color="error"
            variant="outlined"
            startIcon={<Payment />}
          >
            Pay Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* Service Requests Section */}
      <Box sx={{ my: 4 }}>
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

      {/* Teacher Remarks Form Structure */}
      <Box sx={{ my: 4 }}>
        <Typography variant="h5" gutterBottom>
          Teacher Remarks Form Structure
        </Typography>
        {schemaLoading ? (
          <CircularProgress />
        ) : schemaError ? (
          <Alert severity="error">{schemaError}</Alert>
        ) : (
          <Paper sx={{ p: 2, overflow: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Field Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Required</TableCell>
                  <TableCell>Options</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {remarksSchema.map((field) => (
                  <TableRow key={field.name}>
                    <TableCell>{field.name}</TableCell>
                    <TableCell>{field.type}</TableCell>
                    <TableCell>{field.required ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      {Array.isArray(field.enum)
                        ? field.enum.join(', ')
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Box>

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
    </Container>
  );
};

export default Dashboard; 