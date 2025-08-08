import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  TableContainer,
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
  Home,
  ArrowBack,
} from '@mui/icons-material';
import studentService from '../../services/studentService';
import axios from 'axios';
import { Alert as MuiAlert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '@mui/material/styles';
import { toast } from 'react-toastify';
import GlassCard from '../../components/GlassCard';
import StatCard from '../../components/StatCard';
import AnimatedButton from '../../components/AnimatedButton';
import LoadingSpinner from '../../components/LoadingSpinner';



const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
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
  const [feeStatus, setFeeStatus] = useState(null);
  const [learningResources, setLearningResources] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    attendance: [],
    assignments: [],
    exams: [],
    events: [],
    notifications: [],
    feeStatus: {},
    serviceRequests: [],
    remarks: [],
    lessons: [],
    transportDetails: {},
    libraryBooks: [],
    academicCalendar: [],
    communication: [],
    documents: [],
    resources: [],
    progress: {},
    activities: [],
    coScholastic: [],
    teacherRemarks: [],
    comprehensiveProgress: {},
  });
  
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
    {
      title: 'Progress Report',
      description: 'View comprehensive academic progress report',
      icon: <Assessment color="primary" sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      path: '/student/comprehensive-progress',
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  // Enhanced StatCard component with modern design
  const ModernStatCard = ({ title, value, icon: Icon, color = 'primary', subtitle, trend, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      whileHover={{ 
        y: -12,
        scale: 1.05,
        transition: { duration: 0.4, ease: "easeOut" }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
    >
      <GlassCard
        delay={delay}
        sx={{
          height: { xs: '140px', sm: '160px', md: '180px' },
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)`,
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${color === 'primary' ? '#6366f1' : color === 'secondary' ? '#f59e0b' : color === 'success' ? '#10b981' : '#3b82f6'}20 0%, ${color === 'primary' ? '#6366f1' : color === 'secondary' ? '#f59e0b' : color === 'success' ? '#10b981' : '#3b82f6'}10 100%)`,
            zIndex: -1,
          },
        }}
      >
      <Box
        sx={{
          display: 'flex',
            flexDirection: 'column',
            height: '100%',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box
              sx={{
                display: 'flex',
          alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${color === 'primary' ? '#6366f1' : color === 'secondary' ? '#f59e0b' : color === 'success' ? '#10b981' : '#3b82f6'} 0%, ${color === 'primary' ? '#818cf8' : color === 'secondary' ? '#fbbf24' : color === 'success' ? '#34d399' : '#60a5fa'} 100%)`,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}
            >
              <Icon sx={{ color: '#ffffff', fontSize: 24 }} />
      </Box>
            
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: trend === 'up' ? 'success.main' : 'error.main',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  {trend === 'up' ? '↗' : '↘'} {trend}
          </Typography>
        </Box>
            )}
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: theme.palette.mode === 'dark' ? '#f1f5f9' : 'text.primary',
              mb: 0.5,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            }}
          >
          {value}
        </Typography>

          <Typography
            variant="body2"
            sx={{
              color: theme.palette.mode === 'dark' ? '#cbd5e1' : 'text.secondary',
              fontWeight: 500,
              mb: 1,
            }}
          >
            {title}
                </Typography>

        {subtitle && (
            <Typography
              variant="caption"
              sx={{
                color: 'text.disabled',
                fontWeight: 500,
              }}
            >
            {subtitle}
          </Typography>
        )}
          </Box>
      </GlassCard>
    </motion.div>
  );

  // Enhanced NavigationCard component
  const ModernNavigationCard = ({ title, description, icon: Icon, color, path, count, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, x: -50, rotateY: -15 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      whileHover={{ 
        y: -15,
        scale: 1.08,
        rotateY: 5,
        transition: { duration: 0.4, ease: "easeOut" }
      }}
      whileTap={{ 
        scale: 0.95,
        transition: { duration: 0.1 }
      }}
    >
      <GlassCard
        onClick={() => navigate(path)}
        delay={delay}
      sx={{ 
          height: { xs: '120px', sm: '140px', md: '160px' },
        cursor: 'pointer',
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)`,
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
            zIndex: -1,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}
            >
              <Icon sx={{ color: '#ffffff', fontSize: 24 }} />
          </Box>
            
            {count !== undefined && (
                    <Chip
              label={count}
                      size="small"
              sx={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: theme.palette.mode === 'dark' ? '#f1f5f9' : 'text.primary',
                  fontWeight: 600,
              }}
            />
          )}
            </Box>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: theme.palette.mode === 'dark' ? '#f1f5f9' : 'text.primary',
              mb: 1,
              fontSize: { xs: '1rem', sm: '1.125rem' },
            }}
          >
          {title}
            </Typography>

          <Typography
            variant="body2"
            sx={{
              color: theme.palette.mode === 'dark' ? '#cbd5e1' : 'text.secondary',
              lineHeight: 1.4,
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
          >
          {description}
                </Typography>
        </Box>
      </GlassCard>
    </motion.div>
  );

  // Enhanced ListCard component
  const ModernListCard = ({ title, items, icon: Icon, emptyMessage = "No items to display", emptyAction, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      whileHover={{ 
        y: -10,
        scale: 1.03,
        transition: { duration: 0.4, ease: "easeOut" }
      }}
      whileTap={{ 
        scale: 0.97,
        transition: { duration: 0.1 }
      }}
    >
      <GlassCard
        delay={delay}
        sx={{
          height: { xs: '300px', sm: '320px', md: '340px' },
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)`,
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 2,
            pb: 1,
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Icon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            {title}
                </Typography>
          </Box>
          
        {items && items.length > 0 ? (
          <Box sx={{ maxHeight: 'calc(100% - 60px)', overflow: 'auto' }}>
            <List sx={{ p: 0 }}>
              {items.map((item, index) => (
                <ListItem
                  key={index}
                sx={{
                    px: 0,
                    py: 1,
                    borderBottom: index < items.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 1,
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          color: 'text.primary',
                          mb: 0.5,
                        }}
                      >
                        {item.title || item.name}
                </Typography>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          lineHeight: 1.4,
                        }}
                      >
                        {item.description || item.details}
                </Typography>
                    }
                  />
                  {item.status && (
                    <Chip
                      label={item.status}
                  size="small"
                          sx={{
                        background: item.status === 'Completed' ? 'success.main' : 
                                   item.status === 'Pending' ? 'warning.main' : 
                                   item.status === 'Overdue' ? 'error.main' : 'info.main',
                        color: '#ffffff',
                        fontWeight: 600,
                      }}
                    />
                  )}
                </ListItem>
              ))}
            </List>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 'calc(100% - 60px)',
              color: 'text.secondary',
            }}
          >
            <Icon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="body2" sx={{ textAlign: 'center', mb: 2 }}>
                  {emptyMessage}
                </Typography>
                {emptyAction && (
              <AnimatedButton
                    variant="outlined" 
                    size="small"
                    onClick={emptyAction.onClick}
                    startIcon={emptyAction.icon}
                  >
                    {emptyAction.text}
              </AnimatedButton>
            )}
          </Box>
        )}
      </GlassCard>
    </motion.div>
  );

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." fullScreen />;
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

    return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Box
                sx={{
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
                  position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 50%, rgba(51, 65, 85, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(226, 232, 240, 0.95) 50%, rgba(203, 213, 225, 0.95) 100%)',
            zIndex: 1,
          },
        }}
      >


      {/* Floating Particles Animation */}
                        <Box
                          sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: '4px',
              height: '4px',
              background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, -200],
              x: [0, Math.random() * 50 - 25],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
          />
            ))}
          </Box>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2, py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Box sx={{ mb: 4 }}>
              <motion.div
                animate={{ 
                  scale: [1, 1.02, 1],
                  textShadow: [
                    "0 0 0px rgba(99, 102, 241, 0)",
                    "0 0 20px rgba(99, 102, 241, 0.3)",
                    "0 0 0px rgba(99, 102, 241, 0)"
                  ]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Typography
                  variant="h3"
          sx={{
                    fontWeight: 800,
                    color: theme.palette.mode === 'dark' ? '#f1f5f9' : 'text.primary',
                    mb: 1,
                    fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                    background: 'linear-gradient(135deg, #6366f1 0%, #f59e0b 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Welcome back, {user?.name || 'Student'}! 👋
              </Typography>
              </motion.div>
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.mode === 'dark' ? '#cbd5e1' : 'text.secondary',
                  fontWeight: 500,
                }}
              >
                Here's what's happening with your academics today
              </Typography>
            </Box>
          </motion.div>

          {/* Quick Stats Section */}
          <motion.div variants={itemVariants}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: theme.palette.mode === 'dark' ? '#f1f5f9' : 'text.primary',
                mb: 3,
              }}
            >
          Quick Overview
        </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
                gap: 3,
                mb: 4,
                '& > *': {
                  height: { xs: '140px', sm: '160px', md: '180px' },
                }
              }}
            >
              <ModernStatCard
              title="Attendance Rate"
              value={`${getAttendanceRate()}%`}
                icon={Person}
                color="primary"
              subtitle="This month"
                delay={0}
              />
              <ModernStatCard
                title="Assignments"
                value={dashboardData.assignments?.length || 0}
                icon={Assignment}
                color="secondary"
                subtitle="Pending tasks"
                delay={1}
              />
              <ModernStatCard
                title="Average Grade"
                value={dashboardData.progress?.averageGrade || 'A'}
                icon={Grade}
                color="success"
                subtitle="Current semester"
                delay={2}
              />
              <ModernStatCard
                title="Events"
                value={dashboardData.events?.length || 0}
                icon={Event}
                color="info"
                subtitle="Upcoming"
                delay={3}
              />
            </Box>
          </motion.div>

          {/* Quick Access Section */}
          <motion.div variants={itemVariants}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: theme.palette.mode === 'dark' ? '#f1f5f9' : 'text.primary',
                mb: 3,
              }}
            >
          Quick Access
        </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
                gap: 3,
                mb: 4,
                '& > *': {
                  height: { xs: '120px', sm: '140px', md: '160px' },
                }
              }}
            >
              <ModernNavigationCard
                title="Assignments"
                description="View and submit your assignments"
                icon={Assignment}
                color="#6366f1"
                path="/student/assignments"
                count={dashboardData.assignments?.length || 0}
                delay={0}
              />
              <ModernNavigationCard
                title="Attendance"
                description="Check your attendance records"
                icon={Person}
                color="#10b981"
                path="/student/attendance"
                delay={1}
              />
              <ModernNavigationCard
                title="Exams"
                description="View exam schedules and results"
                icon={Quiz}
                color="#f59e0b"
                path="/student/exams"
                count={dashboardData.exams?.length || 0}
                delay={2}
              />
              <ModernNavigationCard
                title="Documents"
                description="Access your academic documents"
                icon={DocumentScanner}
                color="#3b82f6"
                path="/student/documents"
                delay={3}
              />
                    </Box>
          </motion.div>

          {/* Recent Activity Section */}
          <motion.div variants={itemVariants}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                mb: 3,
              }}
            >
              Recent Activity
          </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 3,
                mb: 4,
                '& > *': {
                  height: { xs: '300px', sm: '320px', md: '340px' },
                }
              }}
            >
              <ModernListCard
                title="Recent Assignments"
                items={dashboardData.assignments?.slice(0, 5) || []}
                icon={Assignment}
                emptyMessage="No recent assignments"
                delay={0}
              />
              <ModernListCard
                title="Upcoming Events"
                items={dashboardData.events?.slice(0, 5) || []}
                icon={Event}
                emptyMessage="No upcoming events"
                delay={1}
              />
            </Box>
          </motion.div>

          {/* Performance Overview Section */}
          <motion.div variants={itemVariants}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                mb: 3,
              }}
            >
              Performance Overview
        </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 3,
                '& > *': {
                  height: { xs: '200px', sm: '220px', md: '240px' },
                }
              }}
            >
              <GlassCard
                delay={0}
                sx={{
                  background: `linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      }}
                    >
                      <TrendingUp sx={{ color: '#ffffff', fontSize: 24 }} />
              </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                      }}
                    >
                      Academic Progress
        </Typography>
      </Box>

                  <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography
                        variant="h2"
                        sx={{
                          fontWeight: 800,
                          color: 'primary.main',
                          mb: 1,
                        }}
                      >
                        {dashboardData.progress?.overallScore || 85}%
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 500,
                        }}
                      >
                        Overall Performance
                      </Typography>
                  </Box>
                  </Box>
          </Box>
              </GlassCard>

              <GlassCard
                delay={1}
                sx={{
                  background: `linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      }}
                    >
                      <Schedule sx={{ color: '#ffffff', fontSize: 24 }} />
                  </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                      }}
                    >
                      Attendance
                      </Typography>
                  </Box>

                  <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography
                        variant="h2"
                        sx={{
                          fontWeight: 800,
                          color: 'secondary.main',
                          mb: 1,
                        }}
                      >
                        {getAttendanceRate()}%
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 500,
                        }}
                      >
                        This Month
                      </Typography>
                  </Box>
                  </Box>
                </Box>
              </GlassCard>
            </Box>
          </motion.div>
        </motion.div>
    </Container>
    </Box>
      </motion.div>
  );
};

export default Dashboard; 