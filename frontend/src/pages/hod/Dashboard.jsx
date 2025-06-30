import { useState } from 'react';
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
  Divider,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
  Tabs,
  Tab,
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
  MenuItem,
  Alert,
  Badge,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  LinearProgress,
  CardActions,
  Fab,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  People,
  School,
  Assignment,
  Assessment,
  Event,
  Message,
  Refresh,
  Download,
  Settings,
  SupervisorAccount,
  TrendingUp,
  Approval,
  Schedule,
  Book,
  Psychology,
  Security,
  Add,
  Edit,
  Delete,
  Visibility,
  CheckCircle,
  Cancel,
  ExpandMore,
  Person,
  CalendarToday,
  Grade,
  Subject,
  Class,
  Timeline,
  Analytics,
  FileUpload,
  Description,
  RateReview,
  Work,
  Notifications,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';

// API service for HOD using the configured api instance
const hodAPI = {
  // Department Overview
  getDepartmentOverview: () => api.get('/api/hod/department/overview').then(res => res.data),
  getDepartmentStaff: () => api.get('/api/hod/department/staff').then(res => res.data),
  getDepartmentStatistics: () => api.get('/api/hod/department/statistics').then(res => res.data),
  
  // Staff Management (all staff in department)
  getAllStaff: () => api.get('/api/hod/teacher-management/teachers').then(res => res.data),
  getStaffDetails: (staffId) => api.get(`/api/hod/teacher-management/teachers/${staffId}`).then(res => res.data),
  addStaff: (staffData) => api.post('/api/hod/teacher-management/teachers', staffData).then(res => res.data),
  updateStaff: (staffId, staffData) => api.put(`/api/hod/teacher-management/teachers/${staffId}`, staffData).then(res => res.data),
  deleteStaff: (staffId) => api.delete(`/api/hod/teacher-management/teachers/${staffId}`).then(res => res.data),
  
  // Teacher Attendance
  getTeacherAttendance: () => api.get('/api/hod/teacher-attendance').then(res => res.data),
  markAttendance: (attendanceData) => api.post('/api/hod/teacher-attendance', attendanceData).then(res => res.data),
  updateAttendance: (attendanceId, attendanceData) => api.put(`/api/hod/teacher-attendance/${attendanceId}`, attendanceData).then(res => res.data),
  
  // Teacher Evaluation
  getAllEvaluations: () => api.get('/api/hod/teacher-evaluations').then(res => res.data),
  createEvaluation: (evaluationData) => api.post('/api/hod/teacher-evaluations', evaluationData).then(res => res.data),
  updateEvaluation: (evaluationId, evaluationData) => api.put(`/api/hod/teacher-evaluations/${evaluationId}`, evaluationData).then(res => res.data),
  deleteEvaluation: (evaluationId) => api.delete(`/api/hod/teacher-evaluations/${evaluationId}`).then(res => res.data),
  
  // Class Allocation
  getClassAllocationRecommendations: () => api.get('/api/hod/class-allocation/recommendations').then(res => res.data),
  allocateClass: (allocationData) => api.post('/api/hod/class-allocation', allocationData).then(res => res.data),
  
  // Department Reports
  generateDepartmentReport: () => api.get('/api/hod/reports/department').then(res => res.data),
  getPerformanceMetrics: () => api.get('/api/hod/reports/performance-metrics').then(res => res.data),
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

const Dashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const queryClient = useQueryClient();
  
  const [tabValue, setTabValue] = useState(0);
  const [evaluationDialog, setEvaluationDialog] = useState(false);
  const [allocationDialog, setAllocationDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  
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

  // Get user's role and department
  const userRole = user?.role || user?.designation || 'HOD';
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

  const { data: teachers, isLoading: teachersLoading } = useQuery({
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

  if (statsLoading || teachersLoading || attendanceLoading || evaluationsLoading || allocationsLoading || metricsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
            Welcome, {user?.name || userRole}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label={userRole} 
              color="primary" 
              size="small" 
              icon={<SupervisorAccount />}
            />
            {userDepartment && (
              <Chip 
                label={userDepartment} 
                color="secondary" 
                size="small" 
                variant="outlined"
              />
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh Dashboard">
            <IconButton onClick={() => queryClient.invalidateQueries()}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => hodAPI.generateDepartmentReport().then(() => toast.success('Report downloaded'))}
            size={isMobile ? 'small' : 'medium'}
          >
            Download Report
          </Button>
        </Box>
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
      <Paper sx={{ width: '100%' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons={isMobile ? "auto" : false}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Overview" icon={<DashboardIcon />} />
          <Tab label="Staff Management" icon={<People />} />
          <Tab label="Teacher Attendance" icon={<Schedule />} />
          <Tab label="Teacher Evaluation" icon={<Assessment />} />
          <Tab label="Class Allocation" icon={<Class />} />
          <Tab label="Department Reports" icon={<Analytics />} />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
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
        </TabPanel>

        {/* Staff Management Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Staff Management</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setTeacherDialog(true)}
            >
              Add Staff
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Staff Member</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Qualification</TableCell>
                  <TableCell>Experience</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teachers?.map((staff) => (
                  <TableRow key={staff._id || staff.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {staff.name?.charAt(0) || 'S'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {staff.name || 'Unknown Staff'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{staff.email || 'N/A'}</TableCell>
                    <TableCell>{staff.phone || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={staff.role || 'Unknown'} 
                        color={
                          staff.role === 'Teacher' ? 'primary' : 
                          staff.role === 'HOD' ? 'secondary' : 
                          staff.role === 'Admin' ? 'error' : 'default'
                        } 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{staff.qualification || 'N/A'}</TableCell>
                    <TableCell>{staff.experience || '0'} years</TableCell>
                    <TableCell>
                      <Chip 
                        label={staff.status || 'active'} 
                        color={(staff.status || 'active') === 'active' ? 'success' : 'error'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => setSelectedTeacher(staff)}>
                        <Visibility />
                      </IconButton>
                      <IconButton size="small">
                        <Edit />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Teacher Attendance Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Teacher Attendance</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAttendanceDialog(true)}
            >
              Mark Attendance
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Teacher</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Time In</TableCell>
                  <TableCell>Time Out</TableCell>
                  <TableCell>Remarks</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFlattenedAttendance().map((attendance) => (
                  <TableRow key={attendance.key}>
                    <TableCell>{attendance.teacherName}</TableCell>
                    <TableCell>{new Date(attendance.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={attendance.status} 
                        color={
                          attendance.status === 'present' ? 'success' : 
                          attendance.status === 'absent' ? 'error' : 
                          attendance.status === 'late' ? 'warning' : 'default'
                        } 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{attendance.timeIn}</TableCell>
                    <TableCell>{attendance.timeOut}</TableCell>
                    <TableCell>{attendance.remarks}</TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Evaluations Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Teacher Evaluations</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setEvaluationDialog(true)}
            >
              New Evaluation
            </Button>
          </Box>
          <Grid container spacing={2}>
            {evaluations?.map((evaluation) => (
              <Grid item xs={12} md={6} key={evaluation.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">{evaluation.teacherName}</Typography>
                      <Rating value={evaluation.rating} readOnly />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {evaluation.comments}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip label={evaluation.subject} size="small" />
                      <Chip label={evaluation.date} size="small" variant="outlined" />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small" startIcon={<Edit />}>Edit</Button>
                    <Button size="small" startIcon={<Delete />} color="error">Delete</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Class Allocation Tab */}
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Class Allocation</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAllocationDialog(true)}
            >
              Allocate Class
            </Button>
          </Box>
          
          {/* Class Allocation Recommendations */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Class Allocation Recommendations (Based on Experience)
            </Typography>
            <Grid container spacing={2}>
              {subjectAllocations?.gradeLevels?.map((grade) => (
                <Grid item xs={12} sm={6} md={3} key={grade.grade}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" color="primary">
                        {grade.grade}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Experience: {grade.minExperience}-{grade.maxExperience} years
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Priority: {grade.priority}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Teacher Allocations Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Teacher</TableCell>
                  <TableCell>Experience</TableCell>
                  <TableCell>Current Grade</TableCell>
                  <TableCell>Recommended Grade</TableCell>
                  <TableCell>Suitability Score</TableCell>
                  <TableCell>Qualification</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjectAllocations?.allocations?.map((allocation) => (
                  <TableRow key={allocation.teacherId}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {allocation.teacherName?.charAt(0) || 'T'}
                        </Avatar>
                        <Typography variant="body2" fontWeight="bold">
                          {allocation.teacherName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{allocation.experience} years</TableCell>
                    <TableCell>
                      <Chip 
                        label={allocation.currentGrade} 
                        color={allocation.currentGrade === 'Not Assigned' ? 'default' : 'primary'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={allocation.recommendedGrade} 
                        color="success" 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={allocation.suitabilityScore} 
                          sx={{ width: 60, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="body2">
                          {allocation.suitabilityScore}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{allocation.qualification || 'N/A'}</TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => {
                          setTeacherForm({
                            ...teacherForm,
                            teacherId: allocation.teacherId,
                            grade: allocation.recommendedGrade
                          });
                          setAllocationDialog(true);
                        }}
                      >
                        <Add />
                      </IconButton>
                      <IconButton size="small">
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Department Reports Tab */}
        <TabPanel value={tabValue} index={5}>
          <Typography variant="h6" gutterBottom>
            Department Reports & Analytics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Teacher Performance Overview
                  </Typography>
                  {performanceMetrics ? (
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Average Teaching Rating</Typography>
                        <Typography variant="body2">{performanceMetrics.avgTeachingRating || 4.2}/5</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(performanceMetrics.avgTeachingRating || 4.2) * 20} 
                        sx={{ mb: 2 }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Attendance Rate</Typography>
                        <Typography variant="body2">{performanceMetrics.attendanceRate || 95}%</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={performanceMetrics.attendanceRate || 95} 
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
                    Department Statistics
                  </Typography>
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Total Teachers: {departmentStats?.totalTeachers || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Active Teachers: {departmentStats?.activeTeachers || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Total Students: {departmentStats?.totalStudents || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Active Courses: {departmentStats?.activeCourses || 0}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
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