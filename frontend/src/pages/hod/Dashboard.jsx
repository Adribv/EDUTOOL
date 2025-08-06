import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  useTheme as useMuiTheme,
  useMediaQuery,
  LinearProgress,
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  Rating,
  Badge,
  Fab
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People,
  School,
  Assignment,
  Assessment,
  Schedule,
  Class,
  Analytics,
  AccountBalance,
  Add,
  Edit,
  Delete,
  MoreVert,
  CheckCircle,
  Warning,
  Error,
  TrendingUp,
  TrendingDown,
  Star,
  StarBorder,
  Visibility,
  VisibilityOff,
  Security,
  Support,
  Approval,
  Home,
  ArrowBack
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useTheme as useAppTheme } from '../../context/ThemeContext';
import { 
  filterDashboardTabsByActivitiesControl, 
  useUserActivitiesControl,
  canPerformAction,
  getAccessLevelInfo
} from '../../utils/activitiesControl';
import { api } from '../../services/api';
import SalaryPayroll from '../teacher/SalaryPayroll';
import ServiceRequests from './ServiceRequests';
import TeacherApprovals from './TeacherApprovals';
import DelegationAuthorityNotice from '../../components/DelegationAuthorityNotice';

// API service for HOD using the configured api instance
const hodAPI = {
  // Department Overview
  getDepartmentOverview: () => api.get('/hod/department/overview').then(res => res.data),
  getDepartmentStaff: () => api.get('/hod/department/staff').then(res => res.data),
  getDepartmentStatistics: () => api.get('/hod/department/statistics').then(res => res.data),
  
  // Staff Management (all staff in department)
  getAllStaff: () => api.get('/hod/teacher-management/teachers').then(res => res.data),
  getStaffDetails: (staffId) => api.get(`/hod/teacher-management/teachers/${staffId}`).then(res => res.data),
  addStaff: (staffData) => api.post('/hod/teacher-management/teachers', staffData).then(res => res.data),
  updateStaff: (staffId, staffData) => api.put(`/hod/teacher-management/teachers/${staffId}`, staffData).then(res => res.data),
  deleteStaff: (staffId) => api.delete(`/hod/teacher-management/teachers/${staffId}`).then(res => res.data),
  
  // Teacher Attendance
  getTeacherAttendance: () => api.get('/hod/teacher-attendance').then(res => res.data),
  markAttendance: (attendanceData) => api.post('/hod/teacher-attendance', attendanceData).then(res => res.data),
  updateAttendance: (attendanceId, attendanceData) => api.put(`/hod/teacher-attendance/${attendanceId}`, attendanceData).then(res => res.data),
  
  // Teacher Evaluation
  getAllEvaluations: () => api.get('/hod/teacher-evaluations').then(res => res.data),
  createEvaluation: (evaluationData) => api.post('/hod/teacher-evaluations', evaluationData).then(res => res.data),
  updateEvaluation: (evaluationId, evaluationData) => api.put(`/hod/teacher-evaluations/${evaluationId}`, evaluationData).then(res => res.data),
  deleteEvaluation: (evaluationId) => api.delete(`/hod/teacher-evaluations/${evaluationId}`).then(res => res.data),
  
  // Class Allocation
  getClassAllocationRecommendations: () => api.get('/hod/class-allocation/recommendations').then(res => res.data),
  allocateClass: (allocationData) => api.post('/hod/class-allocation', allocationData).then(res => res.data),
  
  // Department Reports
  generateDepartmentReport: () => api.get('/hod/reports/department').then(res => res.data),
  getPerformanceMetrics: () => api.get('/hod/reports/performance-metrics').then(res => res.data),
};

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`hod-tabpanel-${index}`}
      aria-labelledby={`hod-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Tab configuration for HOD Dashboard
const allHODTabs = [
  { label: 'Overview', icon: <DashboardIcon />, key: 'overview' },
  { label: 'Staff Management', icon: <People />, key: 'staffManagement' },
  { label: 'Teacher Attendance', icon: <Schedule />, key: 'teacherAttendance' },
  { label: 'Teacher Evaluation', icon: <Assessment />, key: 'teacherEvaluation' },
  { label: 'Class Allocation', icon: <Class />, key: 'classAllocation' },
  { label: 'Department Reports', icon: <Assignment />, key: 'departmentReports' },
  { label: 'Service Requests', icon: <Support />, key: 'serviceRequests' },
  { label: 'Teacher Approvals', icon: <Approval />, key: 'teacherApprovals' },
  { label: 'Lesson Plan Approvals', icon: <Analytics />, key: 'lessonPlanApprovals' },
  { label: 'Salary Payroll', icon: <AccountBalance />, key: 'salaryPayroll' },
  { label: 'Delegation Authority', icon: <Security />, key: 'delegationAuthority' },
];

const Dashboard = () => {
  const { user } = useAuth();
  const { isDark } = useAppTheme();
  const navigate = useNavigate();
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const queryClient = useQueryClient();
  
  // Activities control hook
  const { hasAccess, canEdit, canApprove, getAccessLevel, getAccessLevelInfo } = useUserActivitiesControl();
  
  const [tabValue, setTabValue] = useState(0);
  const [evaluationDialog, setEvaluationDialog] = useState(false);
  const [allocationDialog, setAllocationDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  
  // Filter tabs based on activities control
  const hodTabs = useMemo(() => {
    return filterDashboardTabsByActivitiesControl(allHODTabs, 'HOD');
  }, [hasAccess]);

  // Teacher Management States
  const [teacherDialog, setTeacherDialog] = useState(false);
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    phone: '',
    qualification: '',
    experience: '',
    subjects: [],
    status: 'active'
  });
  
  // Teacher Attendance States
  const [attendanceDialog, setAttendanceDialog] = useState(false);
  const [attendanceForm, setAttendanceForm] = useState({
    teacherId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    timeIn: '',
    timeOut: '',
    remarks: ''
  });
  
  // Teacher Evaluation States
  const [evaluationForm, setEvaluationForm] = useState({
    teacherId: '',
    rating: 0,
    comments: '',
    evaluationDate: new Date().toISOString().split('T')[0],
    criteria: {
      teachingQuality: 0,
      studentEngagement: 0,
      lessonPreparation: 0,
      classroomManagement: 0,
      professionalDevelopment: 0
    }
  });

  // Get user's department
  const userDepartment = user?.department || 'General';

  // Queries
  const { data: departmentStats, isLoading: statsLoading } = useQuery({
    queryKey: ['hodDepartmentStats'],
    queryFn: async () => {
      const response = await hodAPI.getDepartmentStatistics();
      return response.data || response;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: teachers, isLoading: loadingTeachers } = useQuery({
    queryKey: ['hodTeachers'],
    queryFn: async () => {
      const response = await hodAPI.getAllStaff();
      return response.data || response;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: teacherAttendance, isLoading: attendanceLoading } = useQuery({
    queryKey: ['hodTeacherAttendance'],
    queryFn: async () => {
      const response = await hodAPI.getTeacherAttendance();
      return response.data || response;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: evaluations, isLoading: evaluationsLoading } = useQuery({
    queryKey: ['hodEvaluations'],
    queryFn: async () => {
      const response = await hodAPI.getAllEvaluations();
      return response.data || response;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: subjectAllocations, isLoading: allocationsLoading } = useQuery({
    queryKey: ['hodSubjectAllocations'],
    queryFn: async () => {
      const response = await hodAPI.getClassAllocationRecommendations();
      return response.data || response;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: performanceMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['hodPerformanceMetrics'],
    queryFn: async () => {
      const response = await hodAPI.getPerformanceMetrics();
      return response.data || response;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Lesson Plan History (latest submissions across statuses)
  const { data: lessonPlanHistory, isLoading: lessonPlansLoading } = useQuery({
    queryKey: ['hodLessonPlanHistory'],
    queryFn: async () => {
      const response = await api.get('/hod/academic-planning/lesson-plans');
      return response.data || response;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Helpers for lesson plan status chip
  const getPlanStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'HOD_Approved': return 'info';
      case 'Principal_Approved': return 'success';
      case 'Published': return 'success';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  const getPlanStatusLabel = (status) => {
    switch (status) {
      case 'Pending': return 'Pending HOD Approval';
      case 'HOD_Approved': return 'Pending Principal Approval';
      case 'Principal_Approved': return 'Approved by Principal';
      case 'Published': return 'Published';
      case 'Rejected': return 'Rejected';
      default: return status;
    }
  };

  // Show only lesson plans whose subject matches HOD's department (if department provided)
  const allPlans = (lessonPlanHistory || []).filter(plan => {
    if (!userDepartment || userDepartment.toLowerCase() === 'general') return true;
    return (plan.subject || '').toLowerCase() === userDepartment.toLowerCase();
  });

  // Helper function to flatten attendance data
  const getFlattenedAttendance = () => {
    if (!teacherAttendance) return [];
    const flattened = [];
    teacherAttendance.forEach(teacherData => {
      if (teacherData.attendance) {
        teacherData.attendance.forEach((attendance, index) => {
          flattened.push({
            ...attendance,
            teacherName: teacherData.teacherName,
            teacherId: teacherData.id,
            key: `${teacherData.id}-${index}`
          });
        });
      }
    });
    return flattened;
  };

  // Mutations
  const createEvaluationMutation = useMutation({
    mutationFn: hodAPI.createEvaluation,
    onSuccess: () => {
      queryClient.invalidateQueries(['hodEvaluations']);
      setEvaluationDialog(false);
      setEvaluationForm({
        teacherId: '',
        rating: 0,
        comments: '',
        evaluationDate: new Date().toISOString().split('T')[0],
        criteria: {
          teachingQuality: 0,
          studentEngagement: 0,
          lessonPreparation: 0,
          classroomManagement: 0,
          professionalDevelopment: 0
        }
      });
      toast.success('Evaluation created successfully');
    },
    onError: () => toast.error('Failed to create evaluation'),
  });

  const allocateSubjectMutation = useMutation({
    mutationFn: hodAPI.allocateClass,
    onSuccess: () => {
      queryClient.invalidateQueries(['hodSubjectAllocations']);
      setAllocationDialog(false);
      toast.success('Subject allocated successfully');
    },
    onError: () => toast.error('Failed to allocate subject'),
  });

  const addTeacherMutation = useMutation({
    mutationFn: hodAPI.addStaff,
    onSuccess: () => {
      queryClient.invalidateQueries(['hodTeachers']);
      setTeacherDialog(false);
      setTeacherForm({
        name: '',
        email: '',
        phone: '',
        qualification: '',
        experience: '',
        subjects: [],
        status: 'active'
      });
      toast.success('Teacher added successfully');
    },
    onError: () => toast.error('Failed to add teacher'),
  });

  const markAttendanceMutation = useMutation({
    mutationFn: hodAPI.markAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries(['hodTeacherAttendance']);
      setAttendanceDialog(false);
      setAttendanceForm({
        teacherId: '',
        date: new Date().toISOString().split('T')[0],
        status: 'present',
        timeIn: '',
        timeOut: '',
        remarks: ''
      });
      toast.success('Attendance marked successfully');
    },
    onError: () => toast.error('Failed to mark attendance'),
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCreateEvaluation = () => {
    createEvaluationMutation.mutate(evaluationForm);
  };

  const handleAllocateSubject = () => {
    allocateSubjectMutation.mutate({
      teacherId: teacherForm.teacherId,
      grade: teacherForm.grade,
      section: teacherForm.section,
      academicYear: teacherForm.academicYear
    });
  };

  const handleAddTeacher = () => {
    addTeacherMutation.mutate(teacherForm);
  };

  const handleMarkAttendance = () => {
    markAttendanceMutation.mutate(attendanceForm);
  };

  // Helper to get activity name from tab label
  const getActivityNameFromTabLabel = (label, role) => {
    const tab = hodTabs.find(t => t.label === label);
    if (!tab) return null;

    switch (tab.key) {
      case 'staffManagement': return 'HOD Staff Management';
      case 'teacherAttendance': return 'HOD Staff Management';
      case 'teacherEvaluation': return 'HOD Staff Management';
      case 'classAllocation': return 'Course Management';
      case 'departmentReports': return 'HOD Reports';
      case 'serviceRequests': return 'Service Requests';
      case 'teacherApprovals': return 'HOD Staff Management';
      case 'lessonPlanApprovals': return 'Lesson Plan Approvals';
      case 'salaryPayroll': return 'Salary Payroll';
      case 'delegationAuthority': return 'Delegation Authority Management';
      default: return null;
    }
  };

  // Render tab content with access control
  const renderTabContent = () => {
    const currentTab = hodTabs[tabValue];
    if (!currentTab) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography variant="h6" color="text.secondary">
            No access to this feature
          </Typography>
        </Box>
      );
    }

    // Check access level for the current activity
    const activityName = getActivityNameFromTabLabel(currentTab.label, 'HOD');
    const accessLevelInfo = getAccessLevelInfo(activityName);

    if (!hasAccess(activityName, 'View')) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Alert severity="warning" sx={{ maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              Access Restricted
            </Typography>
            <Typography>
              You don't have permission to access {currentTab.label}. 
              Please contact your Vice Principal for access.
            </Typography>
          </Alert>
        </Box>
      );
    }

    const renderContent = () => {
      switch (currentTab.key) {
        case 'overview':
          return (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Department Performance
                    </Typography>
                    {performanceMetrics ? (
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Academic Performance</Typography>
                          <Typography variant="body2">{performanceMetrics.academicScore || 85}%</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={performanceMetrics.academicScore || 85} 
                          sx={{ mb: 2 }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Attendance Rate</Typography>
                          <Typography variant="body2">{performanceMetrics.attendanceRate || 92}%</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={performanceMetrics.attendanceRate || 92} 
                          sx={{ mb: 2 }}
                        />
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No performance data available
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recent Activities
                    </Typography>
                    <List dense>
                      {getFlattenedAttendance().slice(0, 3).map((attendance, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={`${attendance.teacherName} - ${attendance.status}`}
                            secondary={new Date(attendance.date).toLocaleDateString()}
                          />
                          <Chip 
                            label={attendance.status} 
                            color={
                              attendance.status === 'present' ? 'success' : 
                              attendance.status === 'absent' ? 'error' : 
                              attendance.status === 'late' ? 'warning' : 'default'
                            } 
                            size="small"
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          );
        case 'staffManagement':
          return (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Staff Management</Typography>
                {canEdit(activityName) && (
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleAddTeacher}
                  >
                    Add Teacher
                  </Button>
                )}
              </Box>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {teachers?.map((teacher) => (
                      <TableRow key={teacher._id}>
                        <TableCell>{teacher.name}</TableCell>
                        <TableCell>{teacher.email}</TableCell>
                        <TableCell>{teacher.role}</TableCell>
                        <TableCell>
                          <Chip 
                            label={teacher.status} 
                            color={teacher.status === 'active' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {canEdit(activityName) && (
                            <IconButton size="small" color="primary">
                              <Edit />
                            </IconButton>
                          )}
                          {canApprove(activityName) && (
                            <IconButton size="small" color="error">
                              <Delete />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          );
        case 'teacherAttendance':
          return (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Teacher Attendance</Typography>
                {canEdit(activityName) && (
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleMarkAttendance}
                  >
                    Mark Attendance
                  </Button>
                )}
              </Box>
              {/* Attendance content */}
            </Box>
          );
        case 'teacherEvaluation':
          return (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Teacher Evaluation</Typography>
                {canEdit(activityName) && (
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleCreateEvaluation}
                  >
                    Create Evaluation
                  </Button>
                )}
              </Box>
              {/* Evaluation content */}
            </Box>
          );
        case 'classAllocation':
          return (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Class Allocation</Typography>
                {canEdit(activityName) && (
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleAllocateSubject}
                  >
                    Allocate Class
                  </Button>
                )}
              </Box>
              {/* Class allocation content */}
            </Box>
          );
        case 'departmentReports':
          return (
            <Box>
              <Typography variant="h6" gutterBottom>Department Reports</Typography>
              {/* Reports content */}
            </Box>
          );
        case 'serviceRequests':
          return <ServiceRequests />;
        case 'teacherApprovals':
          return <TeacherApprovals />;
        case 'lessonPlanApprovals':
          return (
            <Box>
              <Typography variant="h6" gutterBottom>Lesson Plan Approvals</Typography>
              {/* Lesson plan approvals content */}
            </Box>
          );
        case 'salaryPayroll':
          return (
            <Box>
              <Typography variant="h6" gutterBottom>Salary Payroll</Typography>
              {/* Salary payroll content */}
            </Box>
          );
        case 'delegationAuthority':
          return <DelegationAuthorityNotice />;
        default:
          return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
              <Typography variant="h6" color="text.secondary">
                Feature not implemented yet
              </Typography>
            </Box>
          );
      }
    };

    return (
      <Box>
        {/* Access Level Indicator */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">{currentTab.label}</Typography>
          <Chip 
            label={accessLevelInfo.label}
            color={accessLevelInfo.color}
            size="small"
            icon={currentTab.icon}
          />
        </Box>
        
        {/* Render the content */}
        {renderContent()}
      </Box>
    );
  };

  if (loadingTeachers || evaluationsLoading || attendanceLoading || metricsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, width: '100%', maxWidth: '1400px', mx: 'auto' }}>
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
        <Box display="flex" alignItems="center">
          <Security color="primary" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h4" fontWeight={700}>HOD Dashboard</Typography>
          <Chip label="Activities Controlled" color="success" sx={{ ml: 2 }} />
        </Box>
      </Box>

      {/* Activities Control Summary */}
      <Box mb={3}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Your dashboard access is controlled by the Vice Principal. 
            Only authorized features are visible based on your assigned activities.
          </Typography>
        </Alert>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <People color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary">
                {teachers?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Staff
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <School color="secondary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="secondary">
                {teachers?.filter(staff => staff.role === 'Teacher').length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Teachers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assignment color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {departmentStats?.activeCourses || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Courses
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assessment color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {evaluations?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Evaluations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content with Tabs */}
      <Paper sx={{ 
        width: '100%',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderRadius: 2,
        overflow: 'hidden'
      }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons={isMobile ? "auto" : false}
          sx={{ 
            borderBottom: 1, 
            borderColor: '#e0e0e0',
            backgroundColor: 'white',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.9rem',
              minHeight: 64,
              '&.Mui-selected': {
                color: '#1976d2',
                fontWeight: 600
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#1976d2',
              height: 3
            }
          }}
        >
          {hodTabs.map((tab, index) => (
            <Tab 
              key={tab.key}
              label={tab.label} 
              icon={tab.icon}
              sx={{
                '& .MuiTab-iconWrapper': {
                  marginRight: 1
                }
              }}
            />
          ))}
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {renderTabContent()}
        </Box>
      </Paper>

      {/* Dialogs */}
      
      {/* Evaluation Dialog */}
      <Dialog open={evaluationDialog} onClose={() => setEvaluationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Evaluation</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Teacher"
            select
            margin="normal"
            value={evaluationForm.teacherId || ''}
            onChange={(e) => setEvaluationForm({...evaluationForm, teacherId: e.target.value})}
          >
            {teachers?.map((teacher) => (
              <MenuItem key={teacher._id || teacher.id} value={teacher._id || teacher.id}>{teacher.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Rating"
            type="number"
            margin="normal"
            inputProps={{ min: 1, max: 5 }}
            value={evaluationForm.rating || ''}
            onChange={(e) => setEvaluationForm({...evaluationForm, rating: parseInt(e.target.value)})}
          />
          <TextField
            fullWidth
            label="Comments"
            multiline
            rows={4}
            margin="normal"
            value={evaluationForm.comments || ''}
            onChange={(e) => setEvaluationForm({...evaluationForm, comments: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEvaluationDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateEvaluation} variant="contained">
            Create Evaluation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Allocation Dialog */}
      <Dialog open={allocationDialog} onClose={() => setAllocationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Allocate Class</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Teacher"
            select
            margin="normal"
            value={teacherForm.teacherId || ''}
            onChange={(e) => setTeacherForm({...teacherForm, teacherId: e.target.value})}
          >
            {teachers?.filter(staff => staff.role === 'Teacher').map((teacher) => (
              <MenuItem key={teacher._id || teacher.id} value={teacher._id || teacher.id}>
                {teacher.name} ({teacher.experience || 0} years exp.)
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Grade"
            select
            margin="normal"
            value={teacherForm.grade || ''}
            onChange={(e) => setTeacherForm({...teacherForm, grade: e.target.value})}
          >
            <MenuItem value="Grade 1-3">Grade 1-3 (0-3 years exp.)</MenuItem>
            <MenuItem value="Grade 4-6">Grade 4-6 (2-5 years exp.)</MenuItem>
            <MenuItem value="Grade 7-9">Grade 7-9 (4-8 years exp.)</MenuItem>
            <MenuItem value="Grade 10-12">Grade 10-12 (6+ years exp.)</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Section"
            margin="normal"
            value={teacherForm.section || ''}
            onChange={(e) => setTeacherForm({...teacherForm, section: e.target.value})}
            placeholder="e.g., A, B, C"
          />
          <TextField
            fullWidth
            label="Academic Year"
            margin="normal"
            value={teacherForm.academicYear || ''}
            onChange={(e) => setTeacherForm({...teacherForm, academicYear: e.target.value})}
            placeholder="e.g., 2024-2025"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAllocationDialog(false)}>Cancel</Button>
          <Button onClick={handleAllocateSubject} variant="contained">
            Allocate Class
          </Button>
        </DialogActions>
      </Dialog>

      {/* Teacher Dialog */}
      <Dialog open={teacherDialog} onClose={() => setTeacherDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Teacher</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            margin="normal"
            value={teacherForm.name || ''}
            onChange={(e) => setTeacherForm({...teacherForm, name: e.target.value})}
          />
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            value={teacherForm.email || ''}
            onChange={(e) => setTeacherForm({...teacherForm, email: e.target.value})}
          />
          <TextField
            fullWidth
            label="Phone"
            margin="normal"
            value={teacherForm.phone || ''}
            onChange={(e) => setTeacherForm({...teacherForm, phone: e.target.value})}
          />
          <TextField
            fullWidth
            label="Qualification"
            margin="normal"
            value={teacherForm.qualification || ''}
            onChange={(e) => setTeacherForm({...teacherForm, qualification: e.target.value})}
          />
          <TextField
            fullWidth
            label="Experience"
            margin="normal"
            value={teacherForm.experience || ''}
            onChange={(e) => setTeacherForm({...teacherForm, experience: e.target.value})}
          />
          <TextField
            fullWidth
            label="Subjects"
            margin="normal"
            value={teacherForm.subjects?.join(', ') || ''}
            onChange={(e) => setTeacherForm({...teacherForm, subjects: e.target.value.split(',').map(s => s.trim())})}
          />
          <TextField
            fullWidth
            label="Status"
            margin="normal"
            select
            value={teacherForm.status || 'active'}
            onChange={(e) => setTeacherForm({...teacherForm, status: e.target.value})}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTeacherDialog(false)}>Cancel</Button>
          <Button onClick={handleAddTeacher} variant="contained">
            Add Teacher
          </Button>
        </DialogActions>
      </Dialog>

      {/* Attendance Dialog */}
      <Dialog open={attendanceDialog} onClose={() => setAttendanceDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Mark Teacher Attendance</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Teacher"
            margin="normal"
            value={attendanceForm.teacherId || ''}
            onChange={(e) => setAttendanceForm({...attendanceForm, teacherId: e.target.value})}
          >
            {teachers?.map((teacher) => (
              <MenuItem key={teacher._id || teacher.id} value={teacher._id || teacher.id}>{teacher.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Date"
            type="date"
            margin="normal"
            value={attendanceForm.date || ''}
            onChange={(e) => setAttendanceForm({...attendanceForm, date: e.target.value})}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            select
            label="Status"
            margin="normal"
            value={attendanceForm.status || 'present'}
            onChange={(e) => setAttendanceForm({...attendanceForm, status: e.target.value})}
          >
            <MenuItem value="present">Present</MenuItem>
            <MenuItem value="absent">Absent</MenuItem>
            <MenuItem value="late">Late</MenuItem>
            <MenuItem value="half-day">Half Day</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Time In"
            type="time"
            margin="normal"
            value={attendanceForm.timeIn || ''}
            onChange={(e) => setAttendanceForm({...attendanceForm, timeIn: e.target.value})}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Time Out"
            type="time"
            margin="normal"
            value={attendanceForm.timeOut || ''}
            onChange={(e) => setAttendanceForm({...attendanceForm, timeOut: e.target.value})}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Remarks"
            margin="normal"
            multiline
            rows={3}
            value={attendanceForm.remarks || ''}
            onChange={(e) => setAttendanceForm({...attendanceForm, remarks: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttendanceDialog(false)}>Cancel</Button>
          <Button onClick={handleMarkAttendance} variant="contained">
            Mark Attendance
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => {
            switch(tabValue) {
              case 1: setTeacherDialog(true); break;
              case 2: setAttendanceDialog(true); break;
              case 3: setEvaluationDialog(true); break;
              case 4: setAllocationDialog(true); break;
              default: break;
            }
          }}
        >
          <Add />
        </Fab>
      )}
    </Box>
  );
};

export default Dashboard; 