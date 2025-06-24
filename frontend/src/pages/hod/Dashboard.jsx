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

// API service for HOD
const hodAPI = {
  // Department Overview
  getDepartmentOverview: () => fetch('/api/hod/department/overview').then(res => res.json()),
  getDepartmentStaff: () => fetch('/api/hod/department/staff').then(res => res.json()),
  getDepartmentStatistics: () => fetch('/api/hod/department/statistics').then(res => res.json()),
  
  // Teacher Management
  getAllTeachers: () => fetch('/api/hod/teacher-management/teachers').then(res => res.json()),
  getTeacherDetails: (teacherId) => fetch(`/api/hod/teacher-management/teachers/${teacherId}`).then(res => res.json()),
  assignSubject: (teacherId, subjectData) => fetch(`/api/hod/teacher-management/teachers/${teacherId}/subjects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subjectData)
  }).then(res => res.json()),
  assignClass: (teacherId, classData) => fetch(`/api/hod/teacher-management/teachers/${teacherId}/classes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(classData)
  }).then(res => res.json()),
  
  // Teacher Evaluation
  getAllEvaluations: () => fetch('/api/hod/teacher-evaluations').then(res => res.json()),
  createEvaluation: (evaluationData) => fetch('/api/hod/teacher-evaluations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(evaluationData)
  }).then(res => res.json()),
  
  // Teacher Supervision
  getTeacherProfiles: () => fetch('/api/hod/teacher-supervision/profiles').then(res => res.json()),
  getLeaveRequests: () => fetch('/api/hod/teacher-supervision/leave-requests').then(res => res.json()),
  updateLeaveRequest: (requestId, status) => fetch(`/api/hod/teacher-supervision/leave-requests/${requestId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  }).then(res => res.json()),
  
  // Academic Planning
  getLessonPlans: () => fetch('/api/hod/academic-planning/lesson-plans').then(res => res.json()),
  reviewLessonPlan: (planId, reviewData) => fetch(`/api/hod/academic-planning/lesson-plans/${planId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewData)
  }).then(res => res.json()),
  getSyllabusProgress: () => fetch('/api/hod/academic-planning/syllabus-progress').then(res => res.json()),
  
  // Content Quality
  getResourcesForReview: () => fetch('/api/hod/content-quality/resources').then(res => res.json()),
  reviewResource: (resourceId, reviewData) => fetch(`/api/hod/content-quality/resources/${resourceId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewData)
  }).then(res => res.json()),
  
  // Subject Allocation
  getSubjectAllocations: () => fetch('/api/hod/subject-allocation').then(res => res.json()),
  allocateSubject: (allocationData) => fetch('/api/hod/subject-allocation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(allocationData)
  }).then(res => res.json()),
  
  // Department Metrics
  getMetrics: () => fetch('/api/hod/metrics').then(res => res.json()),
  getDepartmentPerformance: () => fetch('/api/hod/metrics/performance').then(res => res.json()),
  getDepartmentAttendance: () => fetch('/api/hod/metrics/attendance').then(res => res.json()),
  
  // Approval Workflow
  getPendingRequests: () => fetch('/api/hod/approval-workflow/pending').then(res => res.json()),
  approveRequest: (requestId) => fetch(`/api/hod/approval-workflow/approve/${requestId}`, {
    method: 'PUT'
  }).then(res => res.json()),
  rejectRequest: (requestId) => fetch(`/api/hod/approval-workflow/reject/${requestId}`, {
    method: 'PUT'
  }).then(res => res.json()),
  
  // Reports and Analytics
  generateDepartmentReport: () => fetch('/api/hod/reports/department').then(res => res.json()),
  analyzeLearningTrends: () => fetch('/api/hod/reports/learning-trends').then(res => res.json()),
  getPerformanceMetrics: () => fetch('/api/hod/reports/performance-metrics').then(res => res.json()),
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
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const queryClient = useQueryClient();
  
  const [tabValue, setTabValue] = useState(0);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [evaluationDialog, setEvaluationDialog] = useState(false);
  const [allocationDialog, setAllocationDialog] = useState(false);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [newEvaluation, setNewEvaluation] = useState({});
  const [newAllocation, setNewAllocation] = useState({});

  // Get user's role and department
  const userRole = user?.role || user?.designation || 'HOD';
  const userDepartment = user?.department || 'General';

  // Queries
  const { data: departmentStats, isLoading: statsLoading } = useQuery({
    queryKey: ['hodDepartmentStats'],
    queryFn: hodAPI.getDepartmentStatistics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: teachers, isLoading: teachersLoading } = useQuery({
    queryKey: ['hodTeachers'],
    queryFn: hodAPI.getAllTeachers,
    staleTime: 5 * 60 * 1000,
  });

  const { data: evaluations, isLoading: evaluationsLoading } = useQuery({
    queryKey: ['hodEvaluations'],
    queryFn: hodAPI.getAllEvaluations,
    staleTime: 5 * 60 * 1000,
  });

  const { data: leaveRequests, isLoading: leaveLoading } = useQuery({
    queryKey: ['hodLeaveRequests'],
    queryFn: hodAPI.getLeaveRequests,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const { data: lessonPlans, isLoading: plansLoading } = useQuery({
    queryKey: ['hodLessonPlans'],
    queryFn: hodAPI.getLessonPlans,
    staleTime: 5 * 60 * 1000,
  });

  const { data: pendingRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['hodPendingRequests'],
    queryFn: hodAPI.getPendingRequests,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const { data: subjectAllocations, isLoading: allocationsLoading } = useQuery({
    queryKey: ['hodSubjectAllocations'],
    queryFn: hodAPI.getSubjectAllocations,
    staleTime: 5 * 60 * 1000,
  });

  const { data: performanceMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['hodPerformanceMetrics'],
    queryFn: hodAPI.getDepartmentPerformance,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Mutations
  const approveRequestMutation = useMutation({
    mutationFn: hodAPI.approveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries(['hodPendingRequests']);
      toast.success('Request approved successfully');
    },
    onError: () => toast.error('Failed to approve request'),
  });

  const rejectRequestMutation = useMutation({
    mutationFn: hodAPI.rejectRequest,
    onSuccess: () => {
      queryClient.invalidateQueries(['hodPendingRequests']);
      toast.success('Request rejected');
    },
    onError: () => toast.error('Failed to reject request'),
  });

  const createEvaluationMutation = useMutation({
    mutationFn: hodAPI.createEvaluation,
    onSuccess: () => {
      queryClient.invalidateQueries(['hodEvaluations']);
      setEvaluationDialog(false);
      setNewEvaluation({});
      toast.success('Evaluation created successfully');
    },
    onError: () => toast.error('Failed to create evaluation'),
  });

  const allocateSubjectMutation = useMutation({
    mutationFn: hodAPI.allocateSubject,
    onSuccess: () => {
      queryClient.invalidateQueries(['hodSubjectAllocations']);
      setAllocationDialog(false);
      setNewAllocation({});
      toast.success('Subject allocated successfully');
    },
    onError: () => toast.error('Failed to allocate subject'),
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleApproveRequest = (requestId) => {
    approveRequestMutation.mutate(requestId);
  };

  const handleRejectRequest = (requestId) => {
    rejectRequestMutation.mutate(requestId);
  };

  const handleCreateEvaluation = () => {
    createEvaluationMutation.mutate(newEvaluation);
  };

  const handleAllocateSubject = () => {
    allocateSubjectMutation.mutate(newAllocation);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  if (statsLoading || teachersLoading) {
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
                {departmentStats?.totalTeachers || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Teachers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <School color="secondary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="secondary">
                {departmentStats?.totalStudents || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Students
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
                {pendingRequests?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Approvals
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
          <Tab label="Teachers" icon={<People />} />
          <Tab label="Evaluations" icon={<Assessment />} />
          <Tab label="Approvals" icon={<Approval />} />
          <Tab label="Lesson Plans" icon={<Book />} />
          <Tab label="Subject Allocation" icon={<Subject />} />
          <Tab label="Reports" icon={<Analytics />} />
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
                    {leaveRequests?.slice(0, 3).map((request, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={`Leave request from ${request.teacherName}`}
                          secondary={request.reason}
                        />
                        <Chip 
                          label={request.status} 
                          color={getStatusColor(request.status)} 
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

        {/* Teachers Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Teacher Management</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAllocationDialog(true)}
            >
              Allocate Subject
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Teacher</TableCell>
                  <TableCell>Subjects</TableCell>
                  <TableCell>Classes</TableCell>
                  <TableCell>Performance</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teachers?.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {teacher.name?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {teacher.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {teacher.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {teacher.subjects?.map((subject, index) => (
                        <Chip key={index} label={subject} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                    </TableCell>
                    <TableCell>
                      {teacher.classes?.map((cls, index) => (
                        <Chip key={index} label={cls} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                    </TableCell>
                    <TableCell>
                      <Rating value={teacher.rating || 0} readOnly size="small" />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => setSelectedTeacher(teacher)}>
                        <Visibility />
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

        {/* Evaluations Tab */}
        <TabPanel value={tabValue} index={2}>
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

        {/* Approvals Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Pending Approvals
          </Typography>
          <Grid container spacing={2}>
            {pendingRequests?.map((request) => (
              <Grid item xs={12} md={6} key={request.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">{request.type}</Typography>
                      <Chip 
                        label={request.priority} 
                        color={getPriorityColor(request.priority)} 
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {request.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Requested by: {request.requestedBy} on {request.requestDate}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<CheckCircle />} 
                      color="success"
                      onClick={() => handleApproveRequest(request.id)}
                      disabled={approveRequestMutation.isLoading}
                    >
                      Approve
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<Cancel />} 
                      color="error"
                      onClick={() => handleRejectRequest(request.id)}
                      disabled={rejectRequestMutation.isLoading}
                    >
                      Reject
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Lesson Plans Tab */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>
            Lesson Plans for Review
          </Typography>
          <Grid container spacing={2}>
            {lessonPlans?.map((plan) => (
              <Grid item xs={12} md={6} key={plan.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {plan.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {plan.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip label={plan.subject} size="small" />
                      <Chip label={plan.grade} size="small" variant="outlined" />
                      <Chip label={plan.duration} size="small" variant="outlined" />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Submitted by: {plan.submittedBy} on {plan.submittedDate}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" startIcon={<Visibility />}>Review</Button>
                    <Button size="small" startIcon={<CheckCircle />} color="success">Approve</Button>
                    <Button size="small" startIcon={<Cancel />} color="error">Reject</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Subject Allocation Tab */}
        <TabPanel value={tabValue} index={5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Subject Allocations</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAllocationDialog(true)}
            >
              New Allocation
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Teacher</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Academic Year</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjectAllocations?.map((allocation) => (
                  <TableRow key={allocation.id}>
                    <TableCell>{allocation.teacherName}</TableCell>
                    <TableCell>{allocation.subject}</TableCell>
                    <TableCell>{allocation.class}</TableCell>
                    <TableCell>{allocation.academicYear}</TableCell>
                    <TableCell>
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

        {/* Reports Tab */}
        <TabPanel value={tabValue} index={6}>
          <Typography variant="h6" gutterBottom>
            Reports & Analytics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Department Report
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Generate comprehensive department performance report
                  </Typography>
                  <Button variant="outlined" startIcon={<Download />}>
                    Download Report
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Learning Trends
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Analyze learning patterns and trends
                  </Typography>
                  <Button variant="outlined" startIcon={<Analytics />}>
                    View Analysis
                  </Button>
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
            value={newEvaluation.teacherId || ''}
            onChange={(e) => setNewEvaluation({...newEvaluation, teacherId: e.target.value})}
          >
            {teachers?.map((teacher) => (
              <MenuItem key={teacher.id} value={teacher.id}>{teacher.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Subject"
            margin="normal"
            value={newEvaluation.subject || ''}
            onChange={(e) => setNewEvaluation({...newEvaluation, subject: e.target.value})}
          />
          <TextField
            fullWidth
            label="Rating"
            type="number"
            margin="normal"
            inputProps={{ min: 1, max: 5 }}
            value={newEvaluation.rating || ''}
            onChange={(e) => setNewEvaluation({...newEvaluation, rating: parseInt(e.target.value)})}
          />
          <TextField
            fullWidth
            label="Comments"
            multiline
            rows={4}
            margin="normal"
            value={newEvaluation.comments || ''}
            onChange={(e) => setNewEvaluation({...newEvaluation, comments: e.target.value})}
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
        <DialogTitle>Allocate Subject</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Teacher"
            select
            margin="normal"
            value={newAllocation.teacherId || ''}
            onChange={(e) => setNewAllocation({...newAllocation, teacherId: e.target.value})}
          >
            {teachers?.map((teacher) => (
              <MenuItem key={teacher.id} value={teacher.id}>{teacher.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Subject"
            margin="normal"
            value={newAllocation.subject || ''}
            onChange={(e) => setNewAllocation({...newAllocation, subject: e.target.value})}
          />
          <TextField
            fullWidth
            label="Class"
            margin="normal"
            value={newAllocation.class || ''}
            onChange={(e) => setNewAllocation({...newAllocation, class: e.target.value})}
          />
          <TextField
            fullWidth
            label="Academic Year"
            margin="normal"
            value={newAllocation.academicYear || ''}
            onChange={(e) => setNewAllocation({...newAllocation, academicYear: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAllocationDialog(false)}>Cancel</Button>
          <Button onClick={handleAllocateSubject} variant="contained">
            Allocate Subject
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
              case 1: setAllocationDialog(true); break;
              case 2: setEvaluationDialog(true); break;
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