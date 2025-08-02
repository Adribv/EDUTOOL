import { useState } from 'react';
import { Box, Typography, Tabs, Tab, Card, CardContent, CardHeader, Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, CircularProgress, Select, MenuItem, FormControl, InputLabel, Grid, Paper, Divider, Alert, AlertTitle, Switch, FormControlLabel, Avatar, Menu, MenuItem as MenuItemMUI } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import EventIcon from '@mui/icons-material/Event';
import EditIcon from '@mui/icons-material/Edit';
import ApprovalIcon from '@mui/icons-material/HowToReg';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SchoolIcon from '@mui/icons-material/School';
import BookIcon from '@mui/icons-material/Book';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import Event from '@mui/icons-material/Event';
import CheckCircle from '@mui/icons-material/CheckCircle';
import CalendarToday from '@mui/icons-material/CalendarToday';
import Assessment from '@mui/icons-material/Assessment';
import Schedule from '@mui/icons-material/Schedule';
import Timer from '@mui/icons-material/Timer';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import CommentIcon from '@mui/icons-material/Comment';
import ActivitiesControl from './ActivitiesControl';
import DelegationAuthorityNotice from '../../components/DelegationAuthorityNotice';

// API service for Vice Principal using axios instance (token auto-attached)
const vpAPI = {
  // Department Management
  getOverview: () => api.get('/vp/department/overview').then(res => res.data),
  getStaff: () => api.get('/vp/department/staff').then(res => res.data),
  getStatistics: () => api.get('/vp/department/statistics').then(res => res.data),
  getDepartment: () => api.get('/vp/department').then(res => res.data),
  updateDepartment: (data) => api.put(`/vp/department/${data.id}`, data).then(res => res.data),
  createDepartment: (data) => api.post('/vp/department', data).then(res => res.data),
  
  // HOD Management
  getAllDepartments: () => api.get('/vp/departments').then(res => res.data),
  assignHOD: (data) => api.post('/vp/department/hod', data).then(res => res.data),
  getHODs: () => api.get('/vp/hods').then(res => res.data),
  
  // Teacher Management
  getTeachers: () => api.get('/vp/teachers').then(res => res.data),
  getTeachersByDepartment: (departmentId) => api.get(`/vp/department/${departmentId}/teachers`).then(res => res.data),
  
  // Exam Management
  getExams: () => api.get('/vp/exams').then(res => res.data),
  createExam: (data) => api.post('/vp/exams', data).then(res => res.data),
  updateExam: (data) => api.put(`/vp/exams/${data.id}`, data).then(res => res.data),
  deleteExam: (examId) => api.delete(`/vp/exams/${examId}`).then(res => res.data),
  
  // Exam Timetable Management
  getTimetables: () => api.get('/vp/timetables').then(res => res.data),
  createTimetable: (data) => api.post('/vp/timetables', data).then(res => res.data),
  updateTimetable: (data) => api.put(`/vp/timetables/${data.id}`, data).then(res => res.data),
  deleteTimetable: (timetableId) => api.delete(`/vp/timetables/${timetableId}`).then(res => res.data),
  getTimetablesByDateRange: (startDate, endDate) => api.get(`/vp/timetables/date-range?startDate=${startDate}&endDate=${endDate}`).then(res => res.data),
  
  // Curriculum Management
  getCurriculumPlans: () => api.get('/vp/curriculum').then(res => res.data),
  getApprovedCurriculumPlans: () => api.get('/vp/curriculum/approved').then(res => res.data),
  createCurriculum: (data) => api.post('/vp/curriculum', data).then(res => res.data),
  updateCurriculum: (data) => api.put(`/vp/curriculum/${data.id}`, data).then(res => res.data),
  deleteCurriculum: (curriculumId) => api.delete(`/vp/curriculum/${curriculumId}`).then(res => res.data),
  approveCurriculum: (curriculumId) => api.post(`/vp/curriculum/${curriculumId}/approve`).then(res => res.data),
  rejectCurriculum: (curriculumId, reason) => api.post(`/vp/curriculum/${curriculumId}/reject`, { reason }).then(res => res.data),
  getCurriculumByGrade: (grade) => api.get(`/vp/curriculum/grade/${grade}`).then(res => res.data),
  // Add new endpoint for teacher remarks
  getTeacherRemarksForCurriculum: (curriculumId) => api.get(`/vp/curriculum/${curriculumId}/teacher-remarks`).then(res => res.data),
  
  // HOD Approval Management
  getHODSubmissions: () => api.get('/vp/hod-submissions').then(res => res.data),
  approveHODSubmission: (submissionId) => api.post(`/vp/hod-submissions/${submissionId}/approve`).then(res => res.data),
  rejectHODSubmission: (submissionId) => api.post(`/vp/hod-submissions/${submissionId}/reject`).then(res => res.data),
  
  // Service Request Management
  getServiceRequests: () => api.get('/vp/service-requests').then(res => res.data),
  approveServiceRequest: (requestId, comments) => api.post(`/vp/service-requests/${requestId}/approve`, { comments }).then(res => res.data),
  rejectServiceRequest: (requestId, comments) => api.post(`/vp/service-requests/${requestId}/reject`, { comments }).then(res => res.data),
  createServiceRequest: (data) => api.post('/vp/service-requests', data).then(res => res.data),
  
  // HOD Template Management
  createHODTemplate: (data) => api.post('/vp/hod-templates', data).then(res => res.data),
  getHODTemplates: () => api.get('/vp/hod-templates').then(res => res.data),
  
  // Profile Management
  getProfile: () => api.get('/vp/profile').then(res => res.data),
  updateProfile: (data) => api.put('/vp/profile', data).then(res => res.data),
  changePassword: (data) => api.post('/vp/change-password', data).then(res => res.data),
};

export default function VicePrincipalDashboard() {
  const [mainTab, setMainTab] = useState(0);
  const [subTab, setSubTab] = useState(0);
  const [editDialog, setEditDialog] = useState(false);
  const [editDept, setEditDept] = useState({});
  const [addDeptDialog, setAddDeptDialog] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', description: '', subjects: '' });
  
  // New state for expanded features
  const [assignHODDialog, setAssignHODDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedHOD, setSelectedHOD] = useState('');
  const [examDialog, setExamDialog] = useState(false);
  const [timetableDialog, setTimetableDialog] = useState(false);
  const [curriculumDialog, setCurriculumDialog] = useState(false);
  const [newExam, setNewExam] = useState({ departmentId: '', name: '', grade: '', subject: '', date: '', duration: '', type: '' });
  const [newTimetable, setNewTimetable] = useState({ 
    departmentId: '', 
    examId: '', 
    examName: '', 
    subject: '', 
    grade: '', 
    examDate: '', 
    startTime: '', 
    endTime: '', 
    duration: '', 
    examType: '', 
    room: 'Main Hall', 
    invigilator: 'To be assigned' 
  });
  const [newCurriculum, setNewCurriculum] = useState({ 
    departmentId: '', 
    subject: '', 
    grade: '', 
    instructor: '', // Teacher/Instructor
    description: '', 
    objectives: '',
    academicYear: new Date().getFullYear().toString(),
    semester: 'First Term',
    assessmentMethods: '',
    learningResources: '',
    totalHours: '',
    contactHours: '',
    prerequisites: '',
    courseCode: '',
    topics: [],
    newTopic: { title: '', description: '', duration: '', learningOutcomes: [] },
    newLearningOutcome: ''
  });
  
  // Edit states for exams, timetables, and curriculum
  const [editExamDialog, setEditExamDialog] = useState(false);
  const [editTimetableDialog, setEditTimetableDialog] = useState(false);
  const [editCurriculumDialog, setEditCurriculumDialog] = useState(false);
  const [editingExam, setEditingExam] = useState({});
  const [editingTimetable, setEditingTimetable] = useState({});
  const [editingCurriculum, setEditingCurriculum] = useState({});
  
  // Profile management states
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [profileDialog, setProfileDialog] = useState(false);
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // New state for curriculum management
  const [selectedGrade, setSelectedGrade] = useState(1);
  const [curriculumViewMode, setCurriculumViewMode] = useState('grade'); // 'grade' or 'department'
  const [availableSubjects] = useState([
    'Mathematics', 'English', 'Science', 'Social Studies', 'History', 'Geography',
    'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Art', 'Music',
    'Physical Education', 'Economics', 'Business Studies', 'Literature',
    'Environmental Science', 'Psychology', 'Sociology', 'Political Science'
  ]);

  // Curriculum details dialog state
  const [curriculumDetailsDialog, setCurriculumDetailsDialog] = useState(false);
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);
  
  // Teacher remarks dialog state
  const [teacherRemarksDialog, setTeacherRemarksDialog] = useState(false);
  const [selectedCurriculumForRemarks, setSelectedCurriculumForRemarks] = useState(null);
  const [teacherRemarks, setTeacherRemarks] = useState([]);
  const [loadingTeacherRemarks, setLoadingTeacherRemarks] = useState(false);
  
  // Service Request Templates State
  const [serviceRequestDialog, setServiceRequestDialog] = useState(false);
  const [serviceRequestType, setServiceRequestType] = useState('LeaveRequest'); // Set default value
  const [serviceRequestData, setServiceRequestData] = useState({});
  
  // HOD Template State
  const [hodTemplateDialog, setHodTemplateDialog] = useState(false);
  const [hodTemplateData, setHodTemplateData] = useState({});

  // Tab configurations
  const tabConfig = [
    {
      name: "Overview",
      icon: <AssessmentIcon />,
      subTabs: []
    },
    {
      name: "School Management",
      icon: <SchoolIcon />,
      subTabs: [
        "HOD Management",
        "Departments",
        "Curriculum",
        "Add Class Time Table",
        "Exams Schedule"
      ]
    },
    {
      name: "Staff Approvals",
      icon: <ApprovalIcon />,
      subTabs: [
        "Leave Requests",
        "Substitute Approvals",
        "Lesson Plan Approvals"
      ]
    },
    {
      name: "Students Approvals",
      icon: <ApprovalIcon />,
      subTabs: [
        "Leave Requests"
      ]
    },
    {
      name: "Service Requests",
      icon: <ApprovalIcon />,
      subTabs: [
        "Leave Requests",
        "IT Support Request",
        "General Service Request"
      ]
    },
    {
      name: "Activities Control",
      icon: <SecurityIcon />,
      subTabs: []
    },
    {
      name: "Delegation Authority",
      icon: <SecurityIcon />,
      subTabs: []
    }
  ];

  const handleMainTabChange = (event, newValue) => {
    setMainTab(newValue);
    setSubTab(0); // Reset sub tab when main tab changes
  };

  const handleSubTabChange = (event, newValue) => {
    setSubTab(newValue);
  };

  // Reset service request form when dialog opens
  const handleOpenServiceRequestDialog = () => {
    setServiceRequestType('LeaveRequest'); // Set default
    setServiceRequestData({}); // Reset form data
    setServiceRequestDialog(true);
  };

  const queryClient = useQueryClient();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Update profileData when user is available
  React.useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  // Debug: Track serviceRequestType changes
  React.useEffect(() => {
    console.log('serviceRequestType changed to:', serviceRequestType);
  }, [serviceRequestType]);

  // Queries
  const { data: overview, isLoading: loadingOverview } = useQuery({ queryKey: ['vpOverview'], queryFn: vpAPI.getOverview });
  const { data: staff, isLoading: loadingStaff } = useQuery({ queryKey: ['vpStaff'], queryFn: vpAPI.getStaff });
  const { data: statistics, isLoading: loadingStats } = useQuery({ queryKey: ['vpStats'], queryFn: vpAPI.getStatistics });
  const { data: departments, isLoading: loadingDept } = useQuery({ queryKey: ['vpDepartment'], queryFn: vpAPI.getDepartment });
  
  // New queries for expanded features
  const { data: allDepartments, isLoading: loadingAllDepts } = useQuery({ queryKey: ['vpAllDepartments'], queryFn: vpAPI.getAllDepartments });
  const { data: hods, isLoading: loadingHODs } = useQuery({ queryKey: ['vpHODs'], queryFn: vpAPI.getHODs });
  const { data: exams, isLoading: loadingExams } = useQuery({ queryKey: ['vpExams'], queryFn: vpAPI.getExams });
  const { data: timetables, isLoading: loadingTimetables } = useQuery({ queryKey: ['vpTimetables'], queryFn: vpAPI.getTimetables });
  const { data: curriculumPlans, isLoading: loadingCurriculum } = useQuery({ queryKey: ['vpCurriculum'], queryFn: vpAPI.getCurriculumPlans });
  const { data: approvedCurriculumPlans, isLoading: loadingApprovedCurriculum } = useQuery({ queryKey: ['vpApprovedCurriculum'], queryFn: vpAPI.getApprovedCurriculumPlans });
  const { data: hodSubmissions, isLoading: loadingHODSubmissions } = useQuery({ queryKey: ['vpHODSubmissions'], queryFn: vpAPI.getHODSubmissions });
  const { data: serviceRequests, isLoading: loadingServiceRequests } = useQuery({ queryKey: ['vpServiceRequests'], queryFn: vpAPI.getServiceRequests });
  const { data: teachers, isLoading: loadingTeachers } = useQuery({ queryKey: ['vpTeachers'], queryFn: vpAPI.getTeachers });
  const { data: hodTemplates, isLoading: loadingHODTemplates } = useQuery({ queryKey: ['vpHODTemplates'], queryFn: vpAPI.getHODTemplates });

  // Mutations
  const updateDepartmentMutation = useMutation({
    mutationFn: vpAPI.updateDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries(['vpDepartment']);
      setEditDialog(false);
      toast.success('Department updated');
    },
    onError: () => toast.error('Failed to update department'),
  });

  const createDepartmentMutation = useMutation({
    mutationFn: vpAPI.createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries(['vpDepartment']);
      queryClient.invalidateQueries(['vpAllDepartments']);
      setAddDeptDialog(false);
      setNewDept({ name: '', description: '', subjects: '' });
      toast.success('Department created');
    },
    onError: () => toast.error('Failed to create department'),
  });

  // New mutations for expanded features
  const assignHODMutation = useMutation({
    mutationFn: vpAPI.assignHOD,
    onSuccess: () => {
      queryClient.invalidateQueries(['vpAllDepartments']);
      queryClient.invalidateQueries(['vpHODs']);
      setAssignHODDialog(false);
      toast.success('HOD assigned successfully');
    },
    onError: () => toast.error('Failed to assign HOD'),
  });

  const createExamMutation = useMutation({
    mutationFn: vpAPI.createExam,
    onSuccess: () => {
      queryClient.invalidateQueries(['vpExams']);
      setExamDialog(false);
      setNewExam({ departmentId: '', name: '', grade: '', subject: '', date: '', duration: '', type: '' });
      toast.success('Exam created successfully');
    },
    onError: () => toast.error('Failed to create exam'),
  });

  const updateExamMutation = useMutation({
    mutationFn: vpAPI.updateExam,
    onSuccess: () => {
      queryClient.invalidateQueries(['vpExams']);
      setEditExamDialog(false);
      setEditingExam({});
      toast.success('Exam updated successfully');
    },
    onError: () => toast.error('Failed to update exam'),
  });

  const deleteExamMutation = useMutation({
    mutationFn: vpAPI.deleteExam,
    onSuccess: () => {
      queryClient.invalidateQueries(['vpExams']);
      toast.success('Exam deleted successfully');
    },
    onError: () => toast.error('Failed to delete exam'),
  });

  const createTimetableMutation = useMutation({
    mutationFn: vpAPI.createTimetable,
    onSuccess: () => {
      queryClient.invalidateQueries(['vpTimetables']);
      setTimetableDialog(false);
      setNewTimetable({ departmentId: '', examId: '', examName: '', subject: '', grade: '', examDate: '', startTime: '', endTime: '', duration: '', examType: '', room: 'Main Hall', invigilator: 'To be assigned' });
      toast.success('Timetable created successfully');
    },
    onError: () => toast.error('Failed to create timetable'),
  });

  const updateTimetableMutation = useMutation({
    mutationFn: vpAPI.updateTimetable,
    onSuccess: () => {
      queryClient.invalidateQueries(['vpTimetables']);
      setEditTimetableDialog(false);
      setEditingTimetable({});
      toast.success('Timetable updated successfully');
    },
    onError: () => toast.error('Failed to update timetable'),
  });

  const deleteTimetableMutation = useMutation({
    mutationFn: vpAPI.deleteTimetable,
    onSuccess: () => {
      queryClient.invalidateQueries(['vpTimetables']);
      toast.success('Timetable deleted successfully');
    },
    onError: () => toast.error('Failed to delete timetable'),
  });

  const createCurriculumMutation = useMutation({
    mutationFn: vpAPI.createCurriculum,
    onSuccess: () => {
      queryClient.invalidateQueries(['vpCurriculum']);
      setCurriculumDialog(false);
      setNewCurriculum({ 
        departmentId: '', 
        subject: '', 
        grade: '', 
        instructor: '',
        courseCode: '',
        prerequisites: '',
        totalHours: '',
        contactHours: '',
        description: '', 
        objectives: '',
        academicYear: new Date().getFullYear().toString(),
        semester: 'First Term',
        assessmentMethods: '',
        learningResources: '',
        topics: [],
        newTopic: { title: '', description: '', duration: '', learningOutcomes: [] },
        newLearningOutcome: ''
      });
      toast.success('Curriculum plan created successfully');
    },
    onError: () => toast.error('Failed to create curriculum plan'),
  });

  const updateCurriculumMutation = useMutation({
    mutationFn: vpAPI.updateCurriculum,
    onSuccess: () => {
      queryClient.invalidateQueries(['vpCurriculum']);
      setEditCurriculumDialog(false);
      setEditingCurriculum({});
      toast.success('Curriculum plan updated successfully');
    },
    onError: () => toast.error('Failed to update curriculum plan'),
  });

  const deleteCurriculumMutation = useMutation({
    mutationFn: vpAPI.deleteCurriculum,
    onSuccess: () => {
      queryClient.invalidateQueries(['vpCurriculum']);
      toast.success('Curriculum plan deleted successfully');
    },
    onError: () => toast.error('Failed to delete curriculum plan'),
  });

  const approveCurriculumMutation = useMutation({
    mutationFn: vpAPI.approveCurriculum,
    onSuccess: () => {
      queryClient.invalidateQueries(['vpCurriculum']);
      toast.success('Curriculum plan approved successfully');
    },
    onError: () => toast.error('Failed to approve curriculum plan'),
  });

  const approveHODSubmissionMutation = useMutation({
    mutationFn: vpAPI.approveHODSubmission,
    onSuccess: () => {
      queryClient.invalidateQueries(['vpHODSubmissions']);
      toast.success('HOD submission approved');
    },
    onError: () => toast.error('Failed to approve submission'),
  });

  const approveServiceRequestMutation = useMutation({
    mutationFn: ({ requestId, comments }) => vpAPI.approveServiceRequest(requestId, comments),
    onSuccess: () => {
      queryClient.invalidateQueries(['vpServiceRequests']);
      toast.success('Service request approved');
    },
    onError: () => toast.error('Failed to approve service request'),
  });

  const rejectServiceRequestMutation = useMutation({
    mutationFn: ({ requestId, comments }) => vpAPI.rejectServiceRequest(requestId, comments),
    onSuccess: () => {
      queryClient.invalidateQueries(['vpServiceRequests']);
      toast.success('Service request rejected');
    },
    onError: () => toast.error('Failed to reject service request'),
  });

  const createServiceRequestMutation = useMutation({
    mutationFn: vpAPI.createServiceRequest,
    onSuccess: () => {
      queryClient.invalidateQueries(['vpServiceRequests']);
      toast.success('Service request created successfully');
      setServiceRequestDialog(false);
      setServiceRequestData({});
      setServiceRequestType('');
    },
    onError: (error) => {
      toast.error('Failed to create service request');
    }
  });

  const createHODTemplateMutation = useMutation({
    mutationFn: vpAPI.createHODTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries(['vpHODTemplates']);
      toast.success('HOD template created successfully');
      setHodTemplateDialog(false);
      setHodTemplateData({});
    },
    onError: (error) => {
      toast.error('Failed to create HOD template');
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: vpAPI.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries(['vpProfile']);
      setProfileDialog(false);
      toast.success('Profile updated successfully');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const changePasswordMutation = useMutation({
    mutationFn: vpAPI.changePassword,
    onSuccess: () => {
      setChangePasswordDialog(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    },
    onError: () => toast.error('Failed to change password'),
  });

  // Function to handle viewing teacher remarks
  const handleViewTeacherRemarks = async (curriculum) => {
    setSelectedCurriculumForRemarks(curriculum);
    setLoadingTeacherRemarks(true);
    setTeacherRemarksDialog(true);
    
    try {
      const response = await vpAPI.getTeacherRemarksForCurriculum(curriculum._id);
      setTeacherRemarks(response.data || []);
    } catch (error) {
      console.error('Error fetching teacher remarks:', error);
      toast.error('Failed to load teacher remarks');
      setTeacherRemarks([]);
    } finally {
      setLoadingTeacherRemarks(false);
    }
  };

  const handleCloseTeacherRemarksDialog = () => {
    setTeacherRemarksDialog(false);
    setSelectedCurriculumForRemarks(null);
    setTeacherRemarks([]);
  };

  // Helper functions for curriculum topics
  const addTopic = () => {
    if (newCurriculum.newTopic.title && newCurriculum.newTopic.description) {
      setNewCurriculum({
        ...newCurriculum,
        topics: [...newCurriculum.topics, { ...newCurriculum.newTopic }],
        newTopic: { title: '', description: '', duration: '', learningOutcomes: [] },
        newLearningOutcome: ''
      });
    }
  };

  const removeTopic = (index) => {
    const updatedTopics = newCurriculum.topics.filter((_, i) => i !== index);
    setNewCurriculum({ ...newCurriculum, topics: updatedTopics });
  };

  const addLearningOutcome = () => {
    if (newCurriculum.newLearningOutcome) {
      setNewCurriculum({
        ...newCurriculum,
        newTopic: {
          ...newCurriculum.newTopic,
          learningOutcomes: [...newCurriculum.newTopic.learningOutcomes, newCurriculum.newLearningOutcome]
        },
        newLearningOutcome: ''
      });
    }
  };

  const removeLearningOutcome = (index) => {
    const updatedOutcomes = newCurriculum.newTopic.learningOutcomes.filter((_, i) => i !== index);
    setNewCurriculum({
      ...newCurriculum,
      newTopic: { ...newCurriculum.newTopic, learningOutcomes: updatedOutcomes }
    });
  };

  if (user?.role !== 'VicePrincipal') {
    return <Box p={3}><Typography color="error">Access denied: Vice Principal only</Typography></Box>;
  }

  if (loadingOverview || loadingStaff || loadingStats || loadingDept || loadingAllDepts || loadingHODs || loadingExams || loadingTimetables || loadingCurriculum || loadingApprovedCurriculum || loadingHODSubmissions || loadingServiceRequests || loadingTeachers || loadingHODTemplates) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <SecurityIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h4" fontWeight={700}>Vice Principal Dashboard</Typography>
          <Chip label="Secured" color="success" sx={{ ml: 2 }} />
        </Box>
        
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body2" color="textSecondary">
            Welcome, {user?.name}
          </Typography>
          <IconButton
            onClick={(e) => setProfileMenuAnchor(e.currentTarget)}
            sx={{ ml: 1 }}
          >
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'V'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={profileMenuAnchor}
            open={Boolean(profileMenuAnchor)}
            onClose={() => setProfileMenuAnchor(null)}
            PaperProps={{
              sx: { minWidth: 200 }
            }}
          >
            <MenuItemMUI onClick={() => {
              setProfileMenuAnchor(null);
              setProfileDialog(true);
            }}>
              <AccountCircleIcon sx={{ mr: 1 }} />
              Profile Settings
            </MenuItemMUI>
            <MenuItemMUI onClick={() => {
              setProfileMenuAnchor(null);
              setChangePasswordDialog(true);
            }}>
              <SettingsIcon sx={{ mr: 1 }} />
              Change Password
            </MenuItemMUI>
            <Divider />
            <MenuItemMUI onClick={() => {
              setProfileMenuAnchor(null);
              setLogoutDialog(true);
            }}>
              <LogoutIcon sx={{ mr: 1 }} />
              Logout
            </MenuItemMUI>
          </Menu>
        </Box>
      </Box>
      
      <Tabs value={mainTab} onChange={handleMainTabChange} sx={{ mb: 3 }}>
        {tabConfig.map((tab, index) => (
          <Tab key={index} label={tab.name} icon={tab.icon} />
        ))}
      </Tabs>

      {/* Overview Tab */}
      {mainTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Department Overview</Typography>
                <Typography variant="h4" color="primary" gutterBottom>
                  {departments?.length || 0} Departments
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total departments under management
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>HOD Management</Typography>
                <Typography variant="h4" color="secondary" gutterBottom>
                  {hods?.length || 0} HODs
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Heads of Departments
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Curriculum Status</Typography>
                <Typography variant="h4" color="success" gutterBottom>
                  {curriculumPlans?.filter(plan => plan.status === 'Approved')?.length || 0} Approved
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {curriculumPlans?.filter(plan => plan.status === 'Draft')?.length || 0} Pending Approval
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Exam Management</Typography>
                <Typography variant="h4" color="info" gutterBottom>
                  {exams?.length || 0} Exams
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {timetables?.length || 0} Scheduled
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Service Requests</Typography>
                <Typography variant="h4" color="warning" gutterBottom>
                  {serviceRequests?.length || 0} Pending
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Awaiting VP approval
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Department Summary</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Department</TableCell>
                        <TableCell>HOD</TableCell>
                        <TableCell>Teachers</TableCell>
                        <TableCell>Subjects</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {departments?.slice(0, 5).map((dept) => (
                        <TableRow key={dept._id}>
                          <TableCell>{dept.name}</TableCell>
                          <TableCell>{dept.headOfDepartment?.name || 'Not Assigned'}</TableCell>
                          <TableCell>{dept.teachers?.length || 0}</TableCell>
                          <TableCell>{dept.subjects?.slice(0, 3).join(', ')}...</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {departments?.length > 5 && (
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Showing first 5 departments. View all in Departments tab.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Curriculum by Grade</Typography>
                <Grid container spacing={2}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => {
                    const gradeCurriculum = curriculumPlans?.filter(plan => plan.grade === grade.toString()) || [];
                    const approvedCount = gradeCurriculum.filter(plan => plan.status === 'Approved').length;
                    const totalCount = gradeCurriculum.length;
                    const completionPercentage = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;
                    
                    return (
                      <Grid item xs={6} sm={4} md={2} key={grade}>
                        <Box 
                          sx={{ 
                            p: 2, 
                            border: '1px solid', 
                            borderColor: 'divider', 
                            borderRadius: 1,
                            textAlign: 'center',
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' }
                          }}
                          onClick={() => {
                            setMainTab(2); // Switch to School Management tab
                            setSubTab(2); // Switch to Curriculum sub tab
                            setSelectedGrade(grade);
                          }}
                        >
                          <Typography variant="h6" color="primary">
                            Grade {grade}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {approvedCount}/{totalCount} Approved
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Typography 
                              variant="caption" 
                              color={completionPercentage >= 80 ? 'success.main' : completionPercentage >= 50 ? 'warning.main' : 'error.main'}
                            >
                              {completionPercentage}% Complete
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}



      {/* School Management Tab */}
      {mainTab === 1 && (
        <Box>
          <Tabs value={subTab} onChange={handleSubTabChange} sx={{ mb: 3 }}>
            {tabConfig[1].subTabs.map((subTab, index) => (
              <Tab key={index} label={subTab} />
            ))}
          </Tabs>

          {/* HOD Management Sub Tab */}
          {subTab === 0 && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">HOD Management</Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={() => setHodTemplateDialog(true)}
              >
                Create HOD Template
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Department</TableCell>
                    <TableCell>HOD Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {hods?.map((hod) => (
                    <TableRow key={hod._id}>
                      <TableCell>
                        {hod.department ? (
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {hod.department.name}
                            </Typography>
                            {hod.department.description && (
                              <Typography variant="caption" color="textSecondary">
                                {hod.department.description}
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Chip label="Not Assigned" color="warning" size="small" />
                        )}
                      </TableCell>
                      <TableCell>{hod.name}</TableCell>
                      <TableCell>{hod.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={hod.department ? 'Active' : 'Unassigned'} 
                          color={hod.department ? 'success' : 'warning'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary">
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

          {/* Departments Sub Tab */}
          {subTab === 1 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Department Management</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddDeptDialog(true)}>
                  Add Department
                </Button>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>All Departments</Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell>Description</TableCell>
                              <TableCell>HOD</TableCell>
                              <TableCell>Teachers</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {departments?.map((dept) => (
                              <TableRow 
                                key={dept._id}
                                sx={{ 
                                  cursor: 'pointer',
                                  backgroundColor: selectedDepartment?._id === dept._id ? 'action.hover' : 'inherit'
                                }}
                                onClick={() => setSelectedDepartment(dept)}
                              >
                                <TableCell>{dept.name}</TableCell>
                                <TableCell>{dept.description}</TableCell>
                                <TableCell>{dept.headOfDepartment?.name || 'Not Assigned'}</TableCell>
                                <TableCell>{dept.teachers?.length || 0}</TableCell>
                                <TableCell>
                                  <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditDept({ id: dept._id, name: dept.name, description: dept.description });
                                      setEditDialog(true);
                                    }}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                  <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedDepartment(dept);
                                      setAssignHODDialog(true);
                                    }}
                                  >
                                    <PeopleIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {selectedDepartment ? `${selectedDepartment.name} Details` : 'Select a Department'}
                      </Typography>
                      {selectedDepartment ? (
                        <>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            {selectedDepartment.description}
                          </Typography>
                          <Box mb={2}>
                            <Typography variant="body2">
                              <strong>HOD:</strong> {selectedDepartment.headOfDepartment?.name || 'Not Assigned'}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Teachers:</strong> {selectedDepartment.teachers?.length || 0}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Subjects:</strong> {selectedDepartment.subjects?.join(', ') || 'Not specified'}
                            </Typography>
                          </Box>
                        </>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          Click on a department to view its details
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Curriculum Sub Tab */}
          {subTab === 2 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Curriculum Management</Typography>
            <Box display="flex" gap={1}>
              <Button 
                variant={curriculumViewMode === 'grade' ? 'contained' : 'outlined'}
                onClick={() => setCurriculumViewMode('grade')}
              >
                Grade View
              </Button>
              <Button 
                variant={curriculumViewMode === 'department' ? 'contained' : 'outlined'}
                onClick={() => setCurriculumViewMode('department')}
              >
                Department View
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCurriculumDialog(true)}>
                Add Curriculum
              </Button>
            </Box>
          </Box>

          {curriculumViewMode === 'grade' ? (
            // Grade-wise Curriculum View
            <Box>
              <Box display="flex" gap={1} mb={3} sx={{ overflowX: 'auto', pb: 1 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                  <Button
                    key={grade}
                    variant={selectedGrade === grade ? 'contained' : 'outlined'}
                    onClick={() => setSelectedGrade(grade)}
                    sx={{ minWidth: 80 }}
                  >
                    Grade {grade}
                  </Button>
                ))}
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Grade {selectedGrade} Curriculum
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Subject</TableCell>
                              <TableCell>Department</TableCell>
                              <TableCell>Description</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {curriculumPlans?.filter(plan => plan.grade === selectedGrade.toString())?.map((plan) => (
                              <TableRow key={plan._id}>
                                <TableCell>
                                  <Typography variant="body2" fontWeight="medium">
                                    {plan.subject}
                                  </Typography>
                                </TableCell>
                                <TableCell>{plan.departmentId?.name}</TableCell>
                                <TableCell>
                                  <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                    {plan.description}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={plan.status || 'Draft'} 
                                    color={plan.status === 'Approved' ? 'success' : plan.status === 'Rejected' ? 'error' : 'warning'} 
                                    size="small" 
                                  />
                                </TableCell>
                                <TableCell>
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => {
                                      setEditingCurriculum({
                                        id: plan._id,
                                        departmentId: plan.departmentId?._id,
                                        subject: plan.subject,
                                        grade: plan.grade,
                                        description: plan.description,
                                        objectives: plan.objectives
                                      });
                                      setEditCurriculumDialog(true);
                                    }}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => {
                                      if (window.confirm('Are you sure you want to delete this curriculum plan?')) {
                                        deleteCurriculumMutation.mutate(plan._id);
                                      }
                                    }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                  <IconButton 
                                    size="small" 
                                    color="info"
                                    onClick={() => handleViewTeacherRemarks(plan)}
                                    title="View Teacher Remarks (Point 4)"
                                  >
                                    <CommentIcon />
                                  </IconButton>
                                  <IconButton 
                                    size="small" 
                                    color="secondary"
                                    onClick={() => {
                                      setSelectedCurriculum(plan);
                                      setCurriculumDetailsDialog(true);
                                    }}
                                    title="View Curriculum Template"
                                  >
                                    <BookIcon />
                                  </IconButton>
                                  {plan.status === 'Draft' && (
                                    <IconButton 
                                      size="small" 
                                      color="success"
                                      onClick={() => approveCurriculumMutation.mutate(plan._id)}
                                    >
                                      <CheckCircleIcon />
                                    </IconButton>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                            {curriculumPlans?.filter(plan => plan.grade === selectedGrade.toString())?.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={5} align="center">
                                  <Typography variant="body2" color="textSecondary">
                                    No curriculum plans found for Grade {selectedGrade}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Grade {selectedGrade} Summary
                      </Typography>
                      <Box mb={2}>
                        <Typography variant="body2" color="textSecondary">
                          Total Subjects: {curriculumPlans?.filter(plan => plan.grade === selectedGrade.toString())?.length || 0}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                                                      Approved: {curriculumPlans?.filter(plan => plan.grade === selectedGrade.toString() && plan.status === 'Approved')?.length || 0}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                                                      Pending: {curriculumPlans?.filter(plan => plan.grade === selectedGrade.toString() && plan.status === 'Draft')?.length || 0}
                        </Typography>
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="subtitle2" gutterBottom>
                        Available Subjects for Grade {selectedGrade}
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {availableSubjects.slice(0, 8).map((subject) => (
                          <Chip 
                            key={subject}
                            label={subject}
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setNewCurriculum({
                                departmentId: '',
                                subject: subject,
                                grade: selectedGrade,
                                description: '',
                                objectives: ''
                              });
                              setCurriculumDialog(true);
                            }}
                            sx={{ cursor: 'pointer' }}
                          />
                        ))}
                        {availableSubjects.length > 8 && (
                          <Chip 
                            label={`+${availableSubjects.length - 8} more`}
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setNewCurriculum({
                                departmentId: '',
                                subject: '',
                                grade: selectedGrade,
                                description: '',
                                objectives: ''
                              });
                              setCurriculumDialog(true);
                            }}
                            sx={{ cursor: 'pointer' }}
                          />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          ) : (
            // Department-wise Curriculum View (Original)
            <Grid container spacing={2}>
                                          {curriculumPlans?.filter(plan => plan.grade === selectedGrade.toString())?.map((plan) => (
                <Grid item xs={12} md={6} key={plan._id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">{plan.subject} - Grade {plan.grade}</Typography>
                        <Box>
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => {
                              setEditingCurriculum({
                                id: plan._id,
                                departmentId: plan.departmentId?._id,
                                subject: plan.subject,
                                grade: plan.grade,
                                description: plan.description,
                                objectives: plan.objectives
                              });
                              setEditCurriculumDialog(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this curriculum plan?')) {
                                deleteCurriculumMutation.mutate(plan._id);
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Department: {plan.departmentId?.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {plan.description}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Objectives:</strong> {plan.objectives}
                      </Typography>
                      <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                        <Chip 
                          label={plan.status || 'Draft'} 
                          color={plan.status === 'Approved' ? 'success' : plan.status === 'Rejected' ? 'error' : 'warning'} 
                          size="small" 
                        />
                        {plan.status === 'Draft' && (
                          <Button 
                            size="small" 
                            variant="outlined" 
                            color="success"
                            onClick={() => approveCurriculumMutation.mutate(plan._id)}
                          >
                            Approve
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

          {/* Add Class Time Table Sub Tab */}
          {subTab === 3 && (
            <Box>
              {/* Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                  Class Time Table Management
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />} 
                  onClick={() => setTimetableDialog(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                    }
                  }}
                >
                  Add Class Time Table
                </Button>
              </Box>

              {/* Statistics Cards */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h4" fontWeight="bold">
                            {timetables?.length || 0}
                          </Typography>
                          <Typography variant="body2">Total Class Schedules</Typography>
                        </Box>
                        <Schedule sx={{ fontSize: 40, opacity: 0.8 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white'
                  }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h4" fontWeight="bold">
                            {timetables?.filter(timetable => {
                              const classDate = new Date(timetable.classDate);
                              const today = new Date();
                              return classDate >= today;
                            }).length || 0}
                          </Typography>
                          <Typography variant="body2">Active Class Schedules</Typography>
                        </Box>
                        <Event sx={{ fontSize: 40, opacity: 0.8 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white'
                  }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h4" fontWeight="bold">
                            {timetables?.filter(timetable => {
                              const classDate = new Date(timetable.classDate);
                              const today = new Date();
                              const tomorrow = new Date(today);
                              tomorrow.setDate(tomorrow.getDate() + 1);
                              return classDate.toDateString() === today.toDateString();
                            }).length || 0}
                          </Typography>
                          <Typography variant="body2">Today's Classes</Typography>
                        </Box>
                        <CalendarToday sx={{ fontSize: 40, opacity: 0.8 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    color: 'white'
                  }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h4" fontWeight="bold">
                            {timetables?.filter(timetable => {
                              const examDate = new Date(timetable.examDate);
                              const today = new Date();
                              const weekFromNow = new Date(today);
                              weekFromNow.setDate(weekFromNow.getDate() + 7);
                              return examDate >= today && examDate <= weekFromNow;
                            }).length || 0}
                          </Typography>
                          <Typography variant="body2">This Week</Typography>
                        </Box>
                        <ScheduleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Class Time Table */}
              <Card sx={{ mb: 3 }}>
                <CardHeader 
                  title="Class Time Table Overview"
                  subheader="Manage and view all class schedules"
                />
                <CardContent>
                  <TableContainer component={Paper} sx={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>Class Name</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Grade</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Day</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Room</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Teacher</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {timetables?.map((timetable) => (
                          <TableRow 
                            key={timetable._id} 
                            hover
                            sx={{ 
                              '&:hover': { 
                                backgroundColor: '#f8f9fa',
                                transform: 'scale(1.01)',
                                transition: 'all 0.2s ease'
                              }
                            }}
                          >
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight="bold">
                                  {timetable.className || timetable.examName}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {timetable.classType || timetable.examType}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={timetable.departmentId?.name} 
                                size="small" 
                                color="primary"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {timetable.subject}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={timetable.grade} 
                                size="small" 
                                color="secondary"
                              />
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {timetable.dayOfWeek || new Date(timetable.examDate).toLocaleDateString('en-US', { weekday: 'long' })}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {timetable.classDate ? new Date(timetable.classDate).toLocaleDateString() : 'Weekly'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {timetable.startTime} - {timetable.endTime}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {timetable.duration} mins
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="primary" fontWeight="medium">
                                {timetable.duration} mins
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={timetable.room} 
                                size="small" 
                                color="default"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {timetable.teacherName || timetable.invigilator || 'TBD'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={timetable.status || 'Active'} 
                                color={
                                  timetable.status === 'Completed' ? 'success' : 
                                  timetable.status === 'In Progress' ? 'warning' : 
                                  timetable.status === 'Cancelled' ? 'error' : 
                                  timetable.status === 'Active' ? 'success' : 'primary'
                                } 
                                size="small" 
                                sx={{ fontWeight: 'medium' }}
                              />
                            </TableCell>
                            <TableCell>
                              <Box display="flex" gap={1}>
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  sx={{ 
                                    backgroundColor: '#e3f2fd',
                                    '&:hover': { backgroundColor: '#bbdefb' }
                                  }}
                                  onClick={() => {
                                    setEditingTimetable({
                                      id: timetable._id,
                                      departmentId: timetable.departmentId?._id,
                                      examId: timetable.examId?._id,
                                      className: timetable.className || timetable.examName,
                                      subject: timetable.subject,
                                      grade: timetable.grade,
                                      classDate: timetable.classDate || timetable.examDate,
                                      dayOfWeek: timetable.dayOfWeek,
                                      startTime: timetable.startTime,
                                      endTime: timetable.endTime,
                                      duration: timetable.duration,
                                      classType: timetable.classType || timetable.examType,
                                      room: timetable.room,
                                      teacherName: timetable.teacherName || timetable.invigilator
                                    });
                                    setEditTimetableDialog(true);
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  sx={{ 
                                    backgroundColor: '#ffebee',
                                    '&:hover': { backgroundColor: '#ffcdd2' }
                                  }}
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this class schedule?')) {
                                      deleteTimetableMutation.mutate(timetable._id);
                                    }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!timetables || timetables.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                              <Box>
                                <Event sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" color="textSecondary" gutterBottom>
                                  No Class Schedules Found
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Start by creating your first class schedule using the button above.
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Box>
          )}

                    {/* Exams Schedule Sub Tab */}
          {subTab === 4 && (
            <Box>
              {/* Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                  Exam Schedule
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />} 
                  onClick={() => setExamDialog(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                    }
                  }}
                >
                  Add Exam
                </Button>
              </Box>

              {/* Statistics Cards */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h4" fontWeight="bold">
                            {exams?.length || 0}
                          </Typography>
                          <Typography variant="body2">Total Exams</Typography>
                        </Box>
                        <Assessment sx={{ fontSize: 40, opacity: 0.8 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white'
                  }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h4" fontWeight="bold">
                            {exams?.filter(exam => {
                              const examDate = new Date(exam.examDate);
                              const today = new Date();
                              return examDate >= today;
                            }).length || 0}
                          </Typography>
                          <Typography variant="body2">Upcoming Exams</Typography>
                        </Box>
                        <Schedule sx={{ fontSize: 40, opacity: 0.8 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white'
                  }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h4" fontWeight="bold">
                            {exams?.filter(exam => {
                              const examDate = new Date(exam.examDate);
                              const today = new Date();
                              const tomorrow = new Date(today);
                              tomorrow.setDate(tomorrow.getDate() + 1);
                              return examDate.toDateString() === today.toDateString();
                            }).length || 0}
                          </Typography>
                          <Typography variant="body2">Today's Exams</Typography>
                        </Box>
                        <CalendarToday sx={{ fontSize: 40, opacity: 0.8 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    color: 'white'
                  }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h4" fontWeight="bold">
                            {exams?.filter(exam => {
                              const examDate = new Date(exam.examDate);
                              const today = new Date();
                              const weekFromNow = new Date(today);
                              weekFromNow.setDate(weekFromNow.getDate() + 7);
                              return examDate >= today && examDate <= weekFromNow;
                            }).length || 0}
                          </Typography>
                          <Typography variant="body2">This Week</Typography>
                        </Box>
                        <Timer sx={{ fontSize: 40, opacity: 0.8 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Exams Table */}
              <Card sx={{ mb: 3 }}>
                <CardHeader 
                  title="Exam Schedule Overview"
                  subheader="Manage and view all created exams"
                />
                <CardContent>
                  <TableContainer component={Paper} sx={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>Exam Name</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Grade</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {exams?.map((exam) => (
                          <TableRow 
                            key={exam._id} 
                            hover
                            sx={{ 
                              '&:hover': { 
                                backgroundColor: '#f8f9fa',
                                transform: 'scale(1.01)',
                                transition: 'all 0.2s ease'
                              }
                            }}
                          >
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight="bold">
                                  {exam.subject}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {exam.examType}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={exam.departmentId?.name} 
                                size="small" 
                                color="primary"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={exam.class} 
                                size="small" 
                                color="secondary"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {exam.subject}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {new Date(exam.examDate).toLocaleDateString()}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {new Date(exam.examDate).toLocaleDateString('en-US', { weekday: 'short' })}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="primary" fontWeight="medium">
                                {exam.duration} mins
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={exam.examType} 
                                size="small" 
                                color="default"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Box display="flex" gap={1}>
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  sx={{ 
                                    backgroundColor: '#e3f2fd',
                                    '&:hover': { backgroundColor: '#bbdefb' }
                                  }}
                                  onClick={() => {
                                    setEditingExam({
                                      id: exam._id,
                                      departmentId: exam.departmentId?._id,
                                      name: exam.subject,
                                      grade: exam.class,
                                      subject: exam.subject,
                                      date: new Date(exam.examDate).toISOString().split('T')[0],
                                      duration: exam.duration,
                                      type: exam.examType
                                    });
                                    setEditExamDialog(true);
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  sx={{ 
                                    backgroundColor: '#ffebee',
                                    '&:hover': { backgroundColor: '#ffcdd2' }
                                  }}
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this exam?')) {
                                      deleteExamMutation.mutate(exam._id);
                                    }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!exams || exams.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                              <Box>
                                <Assessment sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" color="textSecondary" gutterBottom>
                                  No Exams Found
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Start by creating your first exam using the button above.
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>
      )}

      {/* Staff Approvals Tab */}
      {mainTab === 2 && (
        <Box>
          <Tabs value={subTab} onChange={handleSubTabChange} sx={{ mb: 3 }}>
            {tabConfig[2].subTabs.map((subTab, index) => (
              <Tab key={index} label={subTab} />
            ))}
          </Tabs>

          {/* Leave Requests Sub Tab */}
          {subTab === 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Leave Requests</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                          <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Staff Name</TableCell>
                        <TableCell>Reason</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                          </TableRow>
                    </TableHead>
                    <TableBody>
                      {hodSubmissions?.map((submission) => (
                        <TableRow key={submission._id}>
                          <TableCell>{submission.requestData?.date}</TableCell>
                          <TableCell>{submission.requestData?.staffName}</TableCell>
                          <TableCell>{submission.requestData?.reason}</TableCell>
                          <TableCell>
                            <Chip 
                              label={submission.status} 
                              color={submission.status === 'Pending' ? 'warning' : submission.status === 'Approved' ? 'success' : 'error'} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            {submission.status === 'Pending' && (
                              <>
                                <IconButton 
                                  size="small" 
                                  color="success"
                                  onClick={() => approveHODSubmissionMutation.mutate(submission._id)}
                                >
                                  <CheckCircleIcon />
                                </IconButton>
                                <IconButton size="small" color="error">
                                  <WarningIcon />
                                </IconButton>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
          )}

          {/* Substitute Approvals Sub Tab */}
          {subTab === 1 && (
              <Card>
                <CardContent>
                <Typography variant="h6" gutterBottom>Substitute Teacher Requests</Typography>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Request Date</TableCell>
                        <TableCell>Absent Teacher</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell>Reason</TableCell>
                        <TableCell>Absence Dates</TableCell>
                        <TableCell>Periods</TableCell>
                        <TableCell>Classes</TableCell>
                        <TableCell>Suggested Substitute</TableCell>
                        <TableCell>Remarks</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(serviceRequests?.filter(req => req.requestType === 'SubstituteTeacherRequest' && req.currentApprover === 'VP' && req.status === 'Pending') || []).map((req) => (
                        <TableRow key={req._id}>
                          <TableCell>{req.requestData?.requestDate}</TableCell>
                          <TableCell>{req.requestData?.absentTeacherName}</TableCell>
                          <TableCell>{req.requestData?.department}</TableCell>
                          <TableCell>{req.requestData?.reasonForAbsence}</TableCell>
                          <TableCell>{req.requestData?.absenceFrom} - {req.requestData?.absenceTo}</TableCell>
                          <TableCell>{req.requestData?.periods}</TableCell>
                          <TableCell>{req.requestData?.classes}</TableCell>
                          <TableCell>{req.requestData?.suggestedSubstitute}</TableCell>
                          <TableCell>{req.requestData?.remarks}</TableCell>
                          <TableCell>
                            <Chip 
                              label={req.status} 
                              color={req.status === 'Pending' ? 'warning' : req.status === 'Approved' ? 'success' : 'error'} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            {req.status === 'Pending' && req.currentApprover === 'VP' && (
                              <>
                                <IconButton 
                                  size="small" 
                                  color="success"
                                  onClick={() => approveServiceRequestMutation.mutate({ 
                                    requestId: req._id, 
                                    comments: 'Approved by VP' 
                                  })}
                                >
                                  <CheckCircleIcon />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => rejectServiceRequestMutation.mutate({ 
                                    requestId: req._id, 
                                    comments: 'Rejected by VP' 
                                  })}
                                >
                                  <WarningIcon />
                                </IconButton>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {/* Lesson Plan Approvals Sub Tab */}
          {subTab === 2 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Lesson Plan Approvals</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Staff Name</TableCell>
                        <TableCell>Subject</TableCell>
                        <TableCell>Grade</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {serviceRequests?.filter(request => request.requestType === 'LessonPlanApprovalRequest' && request.currentApprover === 'VP' && request.status === 'Pending').map((request) => (
                        <TableRow key={request._id}>
                          <TableCell>{request.requestData?.date}</TableCell>
                          <TableCell>{request.requestData?.staffName}</TableCell>
                          <TableCell>{request.requestData?.subject}</TableCell>
                          <TableCell>{request.requestData?.grade}</TableCell>
                          <TableCell>
                            <Chip 
                              label={request.status} 
                              color={request.status === 'Pending' ? 'warning' : request.status === 'Approved' ? 'success' : 'error'} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            {request.status === 'Pending' && request.currentApprover === 'VP' && (
                              <>
                                <IconButton 
                                  size="small" 
                                  color="success"
                                  onClick={() => approveServiceRequestMutation.mutate({ 
                                    requestId: request._id, 
                                    comments: 'Approved by VP' 
                                  })}
                                >
                                  <CheckCircleIcon />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => rejectServiceRequestMutation.mutate({ 
                                    requestId: request._id, 
                                    comments: 'Rejected by VP' 
                                  })}
                                >
                                  <WarningIcon />
                                </IconButton>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                  ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                </CardContent>
              </Card>
          )}
        </Box>
      )}

      {/* Students Approvals Tab */}
      {mainTab === 3 && (
        <Box>
          <Tabs value={subTab} onChange={handleSubTabChange} sx={{ mb: 3 }}>
            {tabConfig[3].subTabs.map((subTab, index) => (
              <Tab key={index} label={subTab} />
            ))}
          </Tabs>

          {/* Leave Requests Sub Tab */}
          {subTab === 0 && (
        <Card>
          <CardContent>
                <Typography variant="h6" gutterBottom>Leave Requests</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Student Name</TableCell>
                        <TableCell>Reason</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                      {serviceRequests?.filter(request => request.requestType === 'LeaveRequest' && request.currentApprover === 'VP' && request.status === 'Pending').map((request) => (
                        <TableRow key={request._id}>
                          <TableCell>{request.requestData?.date}</TableCell>
                          <TableCell>{request.requestData?.studentName}</TableCell>
                          <TableCell>{request.requestData?.reason}</TableCell>
                      <TableCell>
                        <Chip 
                              label={request.status} 
                              color={request.status === 'Pending' ? 'warning' : request.status === 'Approved' ? 'success' : 'error'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                            {request.status === 'Pending' && request.currentApprover === 'VP' && (
                          <>
                            <IconButton 
                              size="small" 
                              color="success"
                                  onClick={() => approveServiceRequestMutation.mutate({ 
                                    requestId: request._id, 
                                    comments: 'Approved by VP' 
                                  })}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => rejectServiceRequestMutation.mutate({ 
                                    requestId: request._id, 
                                    comments: 'Rejected by VP' 
                                  })}
                                >
                              <WarningIcon />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
        </Box>
      )}

      {/* Service Requests Tab */}
      {mainTab === 4 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Service Requests Management</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={handleOpenServiceRequestDialog}
            >
              Create Service Request
            </Button>
          </Box>
          
          <Tabs value={subTab} onChange={handleSubTabChange} sx={{ mb: 3 }}>
            {tabConfig[4].subTabs.map((subTab, index) => (
              <Tab key={index} label={subTab} />
            ))}
          </Tabs>

          {/* Leave Requests Sub Tab */}
          {subTab === 0 && (
        <Card>
          <CardContent>
                <Typography variant="h6" gutterBottom>Leave Requests</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Staff Name</TableCell>
                      <TableCell>Duty Type</TableCell>
                      <TableCell>Time Slot</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Current Approver</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                      {serviceRequests?.filter(request => request.requestType === 'LeaveRequest' && request.currentApprover === 'VP' && request.status === 'Pending').map((request) => (
                        <TableRow key={request._id}>
                          <TableCell>{request.requestData?.date}</TableCell>
                          <TableCell>{request.requestData?.staffName}</TableCell>
                          <TableCell>{request.requestData?.dutyType}</TableCell>
                          <TableCell>{request.requestData?.timeSlot}</TableCell>
                          <TableCell>{request.requestData?.location}</TableCell>
                          <TableCell>
                            <Chip 
                              label={request.status} 
                              color={request.status === 'Pending' ? 'warning' : request.status === 'Approved' ? 'success' : 'error'} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>{request.currentApprover}</TableCell>
                          <TableCell>
                            {request.status === 'Pending' && request.currentApprover === 'VP' && (
                              <>
                                <IconButton 
                                  size="small" 
                                  color="success"
                                  onClick={() => approveServiceRequestMutation.mutate({ 
                                    requestId: request._id, 
                                    comments: 'Approved by VP' 
                                  })}
                                >
                                  <CheckCircleIcon />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => rejectServiceRequestMutation.mutate({ 
                                    requestId: request._id, 
                                    comments: 'Rejected by VP' 
                                  })}
                                >
                                  <WarningIcon />
                                </IconButton>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {/* IT Support Request Sub Tab */}
          {subTab === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>IT Support Request</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Staff Name</TableCell>
                        <TableCell>Issue</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {serviceRequests?.filter(request => request.requestType === 'ITSupportRequest' && request.currentApprover === 'VP' && request.status === 'Pending').map((request) => (
                        <TableRow key={request._id}>
                          <TableCell>{request.requestData?.date}</TableCell>
                          <TableCell>{request.requestData?.staffName}</TableCell>
                          <TableCell>{request.requestData?.issue}</TableCell>
                          <TableCell>
                            <Chip 
                              label={request.status} 
                              color={request.status === 'Pending' ? 'warning' : request.status === 'Approved' ? 'success' : 'error'} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            {request.status === 'Pending' && request.currentApprover === 'VP' && (
                              <>
                                <IconButton 
                                  size="small" 
                                  color="success"
                                  onClick={() => approveServiceRequestMutation.mutate({ 
                                    requestId: request._id, 
                                    comments: 'Approved by VP' 
                                  })}
                                >
                                  <CheckCircleIcon />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => rejectServiceRequestMutation.mutate({ 
                                    requestId: request._id, 
                                    comments: 'Rejected by VP' 
                                  })}
                                >
                                  <WarningIcon />
                                </IconButton>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
          </CardContent>
        </Card>
      )}

          {/* General Service Request Sub Tab */}
          {subTab === 2 && (
        <Card>
          <CardContent>
                <Typography variant="h6" gutterBottom>General Service Request</Typography>
                <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Staff Name</TableCell>
                        <TableCell>Service Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                      {serviceRequests?.filter(request => request.requestType === 'GeneralServiceRequest' && request.currentApprover === 'VP' && request.status === 'Pending').map((request) => (
                        <TableRow key={request._id}>
                          <TableCell>{request.requestData?.date}</TableCell>
                          <TableCell>{request.requestData?.staffName}</TableCell>
                          <TableCell>{request.requestData?.serviceType}</TableCell>
                      <TableCell>
                        <Chip 
                              label={request.status} 
                              color={request.status === 'Pending' ? 'warning' : request.status === 'Approved' ? 'success' : 'error'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                            {request.status === 'Pending' && request.currentApprover === 'VP' && (
                          <>
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => approveServiceRequestMutation.mutate({ 
                                    requestId: request._id, 
                                comments: 'Approved by VP' 
                              })}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => rejectServiceRequestMutation.mutate({ 
                                    requestId: request._id, 
                                comments: 'Rejected by VP' 
                              })}
                            >
                              <WarningIcon />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
          )}
        </Box>
      )}

      {/* Activities Control Tab */}
      {mainTab === 5 && (
        <ActivitiesControl />
      )}

      {/* Delegation Authority Tab */}
      {mainTab === 6 && (
        <DelegationAuthorityNotice />
      )}

      {/* Dialogs */}
      
      {/* Add Department Dialog */}
      <Dialog open={addDeptDialog} onClose={() => setAddDeptDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Department</DialogTitle>
        <DialogContent>
          <TextField 
            label="Department Name" 
            fullWidth 
            margin="normal" 
            value={newDept.name} 
            onChange={e => setNewDept({ ...newDept, name: e.target.value })} 
          />
          <TextField 
            label="Description" 
            fullWidth 
            margin="normal" 
            multiline 
            rows={3}
            value={newDept.description} 
            onChange={e => setNewDept({ ...newDept, description: e.target.value })} 
          />
          <TextField 
            label="Subjects (comma separated)" 
            fullWidth 
            margin="normal" 
            value={newDept.subjects} 
            onChange={e => setNewDept({ ...newDept, subjects: e.target.value })} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDeptDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => createDepartmentMutation.mutate({ 
              ...newDept, 
              subjects: newDept.subjects.split(',').map(s => s.trim()) 
            })}
          >
            Add Department
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign HOD Dialog */}
      <Dialog open={assignHODDialog} onClose={() => setAssignHODDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign HOD to Department</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Department: {selectedDepartment?.name}
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>Select HOD</InputLabel>
            <Select
              value={selectedHOD}
              onChange={(e) => setSelectedHOD(e.target.value)}
              label="Select HOD"
            >
              {hods?.map((hod) => (
                <MenuItem key={hod._id} value={hod._id}>
                  {hod.name} ({hod.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignHODDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => assignHODMutation.mutate({
              departmentId: selectedDepartment?._id,
              hodId: selectedHOD
            })}
          >
            Assign HOD
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Exam Dialog */}
      <Dialog open={examDialog} onClose={() => setExamDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Exam</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Department</InputLabel>
            <Select
              value={newExam.departmentId}
              onChange={(e) => setNewExam({ ...newExam, departmentId: e.target.value })}
              label="Department"
            >
              {departments?.map((dept) => (
                <MenuItem key={dept._id} value={dept._id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField 
            label="Exam Name" 
            fullWidth 
            margin="normal" 
            value={newExam.name} 
            onChange={e => setNewExam({ ...newExam, name: e.target.value })} 
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Grade</InputLabel>
            <Select
              value={newExam.grade}
              onChange={(e) => setNewExam({ ...newExam, grade: e.target.value })}
              label="Grade"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                <MenuItem key={grade} value={grade}>Grade {grade}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField 
            label="Subject" 
            fullWidth 
            margin="normal" 
            value={newExam.subject} 
            onChange={e => setNewExam({ ...newExam, subject: e.target.value })} 
          />
          <TextField 
            label="Date" 
            type="date" 
            fullWidth 
            margin="normal" 
            value={newExam.date} 
            onChange={e => setNewExam({ ...newExam, date: e.target.value })} 
            InputLabelProps={{ shrink: true }}
          />
          <TextField 
            label="Duration (minutes)" 
            type="number" 
            fullWidth 
            margin="normal" 
            value={newExam.duration} 
            onChange={e => setNewExam({ ...newExam, duration: e.target.value })} 
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Exam Type</InputLabel>
            <Select
              value={newExam.type}
              onChange={(e) => setNewExam({ ...newExam, type: e.target.value })}
              label="Exam Type"
            >
              <MenuItem value="UnitTest">Unit Test</MenuItem>
              <MenuItem value="MidTerm">Mid Term</MenuItem>
              <MenuItem value="Final">Final</MenuItem>
              <MenuItem value="Quiz">Quiz</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExamDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => createExamMutation.mutate(newExam)}
            disabled={!newExam.departmentId || !newExam.name || !newExam.grade || !newExam.subject}
          >
            Add Exam
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Timetable Dialog */}
      <Dialog open={timetableDialog} onClose={() => setTimetableDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Schedule Exam</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Department</InputLabel>
            <Select
              value={newTimetable.departmentId}
              onChange={(e) => setNewTimetable({ ...newTimetable, departmentId: e.target.value })}
              label="Department"
            >
              {departments?.map((dept) => (
                <MenuItem key={dept._id} value={dept._id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Exam</InputLabel>
            <Select
              value={newTimetable.examId}
              onChange={(e) => {
                const selectedExam = exams?.find(exam => exam._id === e.target.value);
                setNewTimetable({ 
                  ...newTimetable, 
                  examId: e.target.value,
                  examName: selectedExam?.subject || '',
                  subject: selectedExam?.subject || '',
                  grade: selectedExam?.class || '',
                  duration: selectedExam?.duration || '',
                  examType: selectedExam?.examType || ''
                });
              }}
              label="Select Exam"
            >
              {exams?.map((exam) => (
                <MenuItem key={exam._id} value={exam._id}>
                  {exam.subject} - Grade {exam.class} ({exam.examType})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField 
            label="Exam Name" 
            fullWidth 
            margin="normal" 
            value={newTimetable.examName} 
            onChange={e => setNewTimetable({ ...newTimetable, examName: e.target.value })} 
          />
          
          <TextField 
            label="Subject" 
            fullWidth 
            margin="normal" 
            value={newTimetable.subject} 
            onChange={e => setNewTimetable({ ...newTimetable, subject: e.target.value })} 
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Grade</InputLabel>
            <Select
              value={newTimetable.grade}
              onChange={(e) => setNewTimetable({ ...newTimetable, grade: e.target.value })}
              label="Grade"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                <MenuItem key={grade} value={grade}>Grade {grade}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField 
            label="Exam Date" 
            type="date" 
            fullWidth 
            margin="normal" 
            value={newTimetable.examDate} 
            onChange={e => setNewTimetable({ ...newTimetable, examDate: e.target.value })} 
            InputLabelProps={{ shrink: true }}
          />
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField 
                label="Start Time" 
                type="time" 
                fullWidth 
                margin="normal" 
                value={newTimetable.startTime} 
                onChange={e => setNewTimetable({ ...newTimetable, startTime: e.target.value })} 
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField 
                label="End Time" 
                type="time" 
                fullWidth 
                margin="normal" 
                value={newTimetable.endTime} 
                onChange={e => setNewTimetable({ ...newTimetable, endTime: e.target.value })} 
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          
          <TextField 
            label="Duration (minutes)" 
            type="number" 
            fullWidth 
            margin="normal" 
            value={newTimetable.duration} 
            onChange={e => setNewTimetable({ ...newTimetable, duration: e.target.value })} 
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Exam Type</InputLabel>
            <Select
              value={newTimetable.examType}
              onChange={(e) => setNewTimetable({ ...newTimetable, examType: e.target.value })}
              label="Exam Type"
            >
              <MenuItem value="UnitTest">Unit Test</MenuItem>
              <MenuItem value="MidTerm">Mid Term</MenuItem>
              <MenuItem value="Final">Final</MenuItem>
              <MenuItem value="Quiz">Quiz</MenuItem>
            </Select>
          </FormControl>
          
          <TextField 
            label="Room" 
            fullWidth 
            margin="normal" 
            value={newTimetable.room} 
            onChange={e => setNewTimetable({ ...newTimetable, room: e.target.value })} 
          />
          
          <TextField 
            label="Invigilator" 
            fullWidth 
            margin="normal" 
            value={newTimetable.invigilator} 
            onChange={e => setNewTimetable({ ...newTimetable, invigilator: e.target.value })} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTimetableDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => createTimetableMutation.mutate(newTimetable)}
            disabled={!newTimetable.departmentId || !newTimetable.examId || !newTimetable.examDate || !newTimetable.startTime || !newTimetable.endTime}
          >
            Schedule Exam
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Curriculum Dialog */}
      <Dialog open={curriculumDialog} onClose={() => setCurriculumDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <BookIcon color="primary" />
            Add Curriculum Plan
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>
            1. Basic Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Department</InputLabel>
                <Select
                  value={newCurriculum.departmentId}
                  onChange={(e) => setNewCurriculum({ ...newCurriculum, departmentId: e.target.value })}
                  label="Department"
                >
                  {departments?.map((dept) => (
                    <MenuItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Grade</InputLabel>
                <Select
                  value={newCurriculum.grade}
                  onChange={(e) => setNewCurriculum({ ...newCurriculum, grade: e.target.value })}
                  label="Grade"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                    <MenuItem key={grade} value={grade}>Grade {grade}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Subject</InputLabel>
                <Select
                  value={newCurriculum.subject}
                  onChange={(e) => setNewCurriculum({ ...newCurriculum, subject: e.target.value })}
                  label="Subject"
                >
                  {availableSubjects.map((subject) => (
                    <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Instructor/Teacher</InputLabel>
                <Select
                  value={newCurriculum.instructor}
                  onChange={(e) => setNewCurriculum({ ...newCurriculum, instructor: e.target.value })}
                  label="Instructor/Teacher"
                >
                  {teachers?.map((teacher) => (
                    <MenuItem key={teacher._id} value={teacher._id}>
                      {teacher.name} ({teacher.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Academic Year</InputLabel>
                <Select
                  value={newCurriculum.academicYear}
                  onChange={(e) => setNewCurriculum({ ...newCurriculum, academicYear: e.target.value })}
                  label="Academic Year"
                >
                  {[new Date().getFullYear(), new Date().getFullYear() + 1, new Date().getFullYear() + 2].map((year) => (
                    <MenuItem key={year} value={year.toString()}>{year}-{(year + 1).toString().slice(-2)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Semester/Term</InputLabel>
                <Select
                  value={newCurriculum.semester}
                  onChange={(e) => setNewCurriculum({ ...newCurriculum, semester: e.target.value })}
                  label="Semester/Term"
                >
                  <MenuItem value="First Term">First Term</MenuItem>
                  <MenuItem value="Second Term">Second Term</MenuItem>
                  <MenuItem value="Third Term">Third Term</MenuItem>
                  <MenuItem value="Annual">Annual</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField 
                label="Course Code" 
                fullWidth 
                margin="normal"
                placeholder="e.g., MATH101, ENG201"
                value={newCurriculum.courseCode} 
                onChange={e => setNewCurriculum({ ...newCurriculum, courseCode: e.target.value })} 
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField 
                label="Prerequisites" 
                fullWidth 
                margin="normal"
                placeholder="e.g., Grade 6 Mathematics, Basic Algebra"
                value={newCurriculum.prerequisites} 
                onChange={e => setNewCurriculum({ ...newCurriculum, prerequisites: e.target.value })} 
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField 
                label="Total Hours" 
                fullWidth 
                margin="normal"
                placeholder="e.g., 120 hours"
                value={newCurriculum.totalHours} 
                onChange={e => setNewCurriculum({ ...newCurriculum, totalHours: e.target.value })} 
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField 
                label="Contact Hours" 
                fullWidth 
                margin="normal"
                placeholder="e.g., 80 hours"
                value={newCurriculum.contactHours} 
                onChange={e => setNewCurriculum({ ...newCurriculum, contactHours: e.target.value })} 
              />
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            2. Description
          </Typography>
          <TextField 
            label="Description" 
            fullWidth 
            margin="normal" 
            multiline 
            rows={3}
            placeholder="Brief description of the curriculum plan..."
            value={newCurriculum.description} 
            onChange={e => setNewCurriculum({ ...newCurriculum, description: e.target.value })} 
          />
          
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            3. Learning Objectives
          </Typography>
          <TextField 
            label="Learning Objectives" 
            fullWidth 
            margin="normal" 
            multiline 
            rows={4}
            placeholder="List the key learning objectives for this subject and grade..."
            value={newCurriculum.objectives} 
            onChange={e => setNewCurriculum({ ...newCurriculum, objectives: e.target.value })} 
          />

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            4. Weekly/Unit-Wise Syllabus Plan
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            This section will be populated with teacher remarks and feedback during implementation.
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px dashed grey' }}>
            <Typography variant="body2" color="textSecondary" align="center">
              Teacher remarks will be added here as the curriculum is implemented
            </Typography>
          </Box>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            5. Assessment Methods
          </Typography>
          <TextField 
            label="Assessment Methods" 
            fullWidth 
            margin="normal" 
            multiline 
            rows={3}
            placeholder="Describe the assessment methods (quizzes, assignments, projects, examinations)..."
            value={newCurriculum.assessmentMethods} 
            onChange={e => setNewCurriculum({ ...newCurriculum, assessmentMethods: e.target.value })} 
          />

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            6. Learning Resources
          </Typography>
          <TextField 
            label="Learning Resources" 
            fullWidth 
            margin="normal" 
            multiline 
            rows={3}
            placeholder="List the learning resources (textbooks, digital resources, laboratory equipment)..."
            value={newCurriculum.learningResources} 
            onChange={e => setNewCurriculum({ ...newCurriculum, learningResources: e.target.value })} 
          />

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Topics & Learning Outcomes (Optional)
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Add specific topics and their learning outcomes:
          </Typography>
          
          <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField 
                  label="Topic Title" 
                  fullWidth 
                  size="small"
                  value={newCurriculum.newTopic.title} 
                  onChange={e => setNewCurriculum({ 
                    ...newCurriculum, 
                    newTopic: { ...newCurriculum.newTopic, title: e.target.value } 
                  })} 
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField 
                  label="Duration" 
                  fullWidth 
                  size="small"
                  placeholder="e.g., 2 weeks"
                  value={newCurriculum.newTopic.duration} 
                  onChange={e => setNewCurriculum({ 
                    ...newCurriculum, 
                    newTopic: { ...newCurriculum.newTopic, duration: e.target.value } 
                  })} 
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  label="Topic Description" 
                  fullWidth 
                  size="small"
                  multiline 
                  rows={2}
                  value={newCurriculum.newTopic.description} 
                  onChange={e => setNewCurriculum({ 
                    ...newCurriculum, 
                    newTopic: { ...newCurriculum.newTopic, description: e.target.value } 
                  })} 
                />
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" gap={1} alignItems="center">
                  <TextField 
                    label="Learning Outcome" 
                    fullWidth 
                    size="small"
                    value={newCurriculum.newLearningOutcome} 
                    onChange={e => setNewCurriculum({ ...newCurriculum, newLearningOutcome: e.target.value })} 
                  />
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={addLearningOutcome}
                    disabled={!newCurriculum.newLearningOutcome}
                  >
                    Add
                  </Button>
                </Box>
                {newCurriculum.newTopic.learningOutcomes.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    {newCurriculum.newTopic.learningOutcomes.map((outcome, index) => (
                      <Chip 
                        key={index}
                        label={outcome}
                        size="small"
                        onDelete={() => removeLearningOutcome(index)}
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                )}
              </Grid>
              <Grid item xs={12}>
                <Button 
                  variant="outlined" 
                  onClick={addTopic}
                  disabled={!newCurriculum.newTopic.title || !newCurriculum.newTopic.description}
                  startIcon={<AddIcon />}
                >
                  Add Topic
                </Button>
              </Grid>
            </Grid>
          </Box>

          {newCurriculum.topics.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Added Topics ({newCurriculum.topics.length}):
              </Typography>
              {newCurriculum.topics.map((topic, index) => (
                <Box key={index} sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" fontWeight="medium">
                      {topic.title} ({topic.duration})
                    </Typography>
                    <Button 
                      size="small" 
                      color="error" 
                      onClick={() => removeTopic(index)}
                    >
                      Remove
                    </Button>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {topic.description}
                  </Typography>
                  {topic.learningOutcomes.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {topic.learningOutcomes.map((outcome, idx) => (
                        <Chip 
                          key={idx}
                          label={outcome}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}

          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Quick Subject Selection for Grade {newCurriculum.grade || 'All'}
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {availableSubjects.slice(0, 10).map((subject) => (
                <Chip 
                  key={subject}
                  label={subject}
                  size="small"
                  variant={newCurriculum.subject === subject ? "filled" : "outlined"}
                  color={newCurriculum.subject === subject ? "primary" : "default"}
                  onClick={() => setNewCurriculum({ ...newCurriculum, subject: subject })}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCurriculumDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => createCurriculumMutation.mutate(newCurriculum)}
            disabled={!newCurriculum.departmentId || !newCurriculum.subject || !newCurriculum.grade}
          >
            Add Curriculum
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)}>
        <DialogTitle>Edit Department</DialogTitle>
        <DialogContent>
          <TextField label="Name" fullWidth margin="normal" value={editDept.name || ''} onChange={e => setEditDept({ ...editDept, name: e.target.value })} />
          <TextField label="Description" fullWidth margin="normal" value={editDept.description || ''} onChange={e => setEditDept({ ...editDept, description: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => updateDepartmentMutation.mutate(editDept)}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Exam Dialog */}
      <Dialog open={editExamDialog} onClose={() => setEditExamDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Exam</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Department</InputLabel>
            <Select
              value={editingExam.departmentId || ''}
              onChange={(e) => setEditingExam({ ...editingExam, departmentId: e.target.value })}
              label="Department"
            >
              {departments?.map((dept) => (
                <MenuItem key={dept._id} value={dept._id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField 
            label="Exam Name" 
            fullWidth 
            margin="normal" 
            value={editingExam.name || ''} 
            onChange={e => setEditingExam({ ...editingExam, name: e.target.value })} 
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Grade</InputLabel>
            <Select
              value={editingExam.grade || ''}
              onChange={(e) => setEditingExam({ ...editingExam, grade: e.target.value })}
              label="Grade"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                <MenuItem key={grade} value={grade}>Grade {grade}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField 
            label="Subject" 
            fullWidth 
            margin="normal" 
            value={editingExam.subject || ''} 
            onChange={e => setEditingExam({ ...editingExam, subject: e.target.value })} 
          />
          <TextField 
            label="Date" 
            type="date" 
            fullWidth 
            margin="normal" 
            value={editingExam.date || ''} 
            onChange={e => setEditingExam({ ...editingExam, date: e.target.value })} 
            InputLabelProps={{ shrink: true }}
          />
          <TextField 
            label="Duration (minutes)" 
            type="number" 
            fullWidth 
            margin="normal" 
            value={editingExam.duration || ''} 
            onChange={e => setEditingExam({ ...editingExam, duration: e.target.value })} 
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Exam Type</InputLabel>
            <Select
              value={editingExam.type || ''}
              onChange={(e) => setEditingExam({ ...editingExam, type: e.target.value })}
              label="Exam Type"
            >
              <MenuItem value="UnitTest">Unit Test</MenuItem>
              <MenuItem value="MidTerm">Mid Term</MenuItem>
              <MenuItem value="Final">Final</MenuItem>
              <MenuItem value="Quiz">Quiz</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditExamDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => updateExamMutation.mutate(editingExam)}
            disabled={!editingExam.departmentId || !editingExam.name || !editingExam.grade || !editingExam.subject}
          >
            Update Exam
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Timetable Dialog */}
      <Dialog open={editTimetableDialog} onClose={() => setEditTimetableDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Exam Schedule</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Department</InputLabel>
            <Select
              value={editingTimetable.departmentId || ''}
              onChange={(e) => setEditingTimetable({ ...editingTimetable, departmentId: e.target.value })}
              label="Department"
            >
              {departments?.map((dept) => (
                <MenuItem key={dept._id} value={dept._id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField 
            label="Exam Name" 
            fullWidth 
            margin="normal" 
            value={editingTimetable.examName || ''} 
            onChange={e => setEditingTimetable({ ...editingTimetable, examName: e.target.value })} 
          />
          
          <TextField 
            label="Subject" 
            fullWidth 
            margin="normal" 
            value={editingTimetable.subject || ''} 
            onChange={e => setEditingTimetable({ ...editingTimetable, subject: e.target.value })} 
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Grade</InputLabel>
            <Select
              value={editingTimetable.grade || ''}
              onChange={(e) => setEditingTimetable({ ...editingTimetable, grade: e.target.value })}
              label="Grade"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                <MenuItem key={grade} value={grade}>Grade {grade}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField 
            label="Exam Date" 
            type="date" 
            fullWidth 
            margin="normal" 
            value={editingTimetable.examDate || ''} 
            onChange={e => setEditingTimetable({ ...editingTimetable, examDate: e.target.value })} 
            InputLabelProps={{ shrink: true }}
          />
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField 
                label="Start Time" 
                type="time" 
                fullWidth 
                margin="normal" 
                value={editingTimetable.startTime || ''} 
                onChange={e => setEditingTimetable({ ...editingTimetable, startTime: e.target.value })} 
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField 
                label="End Time" 
                type="time" 
                fullWidth 
                margin="normal" 
                value={editingTimetable.endTime || ''} 
                onChange={e => setEditingTimetable({ ...editingTimetable, endTime: e.target.value })} 
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          
          <TextField 
            label="Duration (minutes)" 
            type="number" 
            fullWidth 
            margin="normal" 
            value={editingTimetable.duration || ''} 
            onChange={e => setEditingTimetable({ ...editingTimetable, duration: e.target.value })} 
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Exam Type</InputLabel>
            <Select
              value={editingTimetable.examType || ''}
              onChange={(e) => setEditingTimetable({ ...editingTimetable, examType: e.target.value })}
              label="Exam Type"
            >
              <MenuItem value="UnitTest">Unit Test</MenuItem>
              <MenuItem value="MidTerm">Mid Term</MenuItem>
              <MenuItem value="Final">Final</MenuItem>
              <MenuItem value="Quiz">Quiz</MenuItem>
            </Select>
          </FormControl>
          
          <TextField 
            label="Room" 
            fullWidth 
            margin="normal" 
            value={editingTimetable.room || ''} 
            onChange={e => setEditingTimetable({ ...editingTimetable, room: e.target.value })} 
          />
          
          <TextField 
            label="Invigilator" 
            fullWidth 
            margin="normal" 
            value={editingTimetable.invigilator || ''} 
            onChange={e => setEditingTimetable({ ...editingTimetable, invigilator: e.target.value })} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTimetableDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => updateTimetableMutation.mutate(editingTimetable)}
            disabled={!editingTimetable.departmentId || !editingTimetable.examDate || !editingTimetable.startTime || !editingTimetable.endTime}
          >
            Update Exam Schedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Curriculum Dialog */}
      <Dialog open={editCurriculumDialog} onClose={() => setEditCurriculumDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Curriculum Plan</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Department</InputLabel>
                <Select
                  value={editingCurriculum.departmentId || ''}
                  onChange={(e) => setEditingCurriculum({ ...editingCurriculum, departmentId: e.target.value })}
                  label="Department"
                >
                  {departments?.map((dept) => (
                    <MenuItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Grade</InputLabel>
                <Select
                  value={editingCurriculum.grade || ''}
                  onChange={(e) => setEditingCurriculum({ ...editingCurriculum, grade: e.target.value })}
                  label="Grade"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                    <MenuItem key={grade} value={grade}>Grade {grade}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <FormControl fullWidth margin="normal">
            <InputLabel>Subject</InputLabel>
            <Select
              value={editingCurriculum.subject || ''}
              onChange={(e) => setEditingCurriculum({ ...editingCurriculum, subject: e.target.value })}
              label="Subject"
            >
              {availableSubjects.map((subject) => (
                <MenuItem key={subject} value={subject}>{subject}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField 
            label="Description" 
            fullWidth 
            margin="normal" 
            multiline 
            rows={3}
            placeholder="Brief description of the curriculum plan..."
            value={editingCurriculum.description || ''} 
            onChange={e => setEditingCurriculum({ ...editingCurriculum, description: e.target.value })} 
          />
          
          <TextField 
            label="Learning Objectives" 
            fullWidth 
            margin="normal" 
            multiline 
            rows={4}
            placeholder="List the key learning objectives for this subject and grade..."
            value={editingCurriculum.objectives || ''} 
            onChange={e => setEditingCurriculum({ ...editingCurriculum, objectives: e.target.value })} 
          />

          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Quick Subject Selection for Grade {editingCurriculum.grade || 'All'}
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {availableSubjects.slice(0, 10).map((subject) => (
                <Chip 
                  key={subject}
                  label={subject}
                  size="small"
                  variant={editingCurriculum.subject === subject ? "filled" : "outlined"}
                  color={editingCurriculum.subject === subject ? "primary" : "default"}
                  onClick={() => setEditingCurriculum({ ...editingCurriculum, subject: subject })}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditCurriculumDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => updateCurriculumMutation.mutate(editingCurriculum)}
            disabled={!editingCurriculum.departmentId || !editingCurriculum.subject || !editingCurriculum.grade}
          >
            Update Curriculum
          </Button>
        </DialogActions>
      </Dialog>

      {/* Profile Settings Dialog */}
      <Dialog open={profileDialog} onClose={() => setProfileDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Profile Settings</DialogTitle>
        <DialogContent>
          <TextField 
            label="Full Name" 
            fullWidth 
            margin="normal" 
            value={profileData.name} 
            onChange={e => setProfileData({ ...profileData, name: e.target.value })} 
          />
          <TextField 
            label="Email" 
            type="email" 
            fullWidth 
            margin="normal" 
            value={profileData.email} 
            onChange={e => setProfileData({ ...profileData, email: e.target.value })} 
          />
          <TextField 
            label="Phone Number" 
            fullWidth 
            margin="normal" 
            value={profileData.phone} 
            onChange={e => setProfileData({ ...profileData, phone: e.target.value })} 
          />
          <TextField 
            label="Address" 
            fullWidth 
            margin="normal" 
            multiline 
            rows={3}
            value={profileData.address} 
            onChange={e => setProfileData({ ...profileData, address: e.target.value })} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => updateProfileMutation.mutate(profileData)}
            disabled={!profileData.name || !profileData.email}
          >
            Update Profile
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordDialog} onClose={() => setChangePasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField 
            label="Current Password" 
            type="password" 
            fullWidth 
            margin="normal" 
            value={passwordData.currentPassword} 
            onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })} 
          />
          <TextField 
            label="New Password" 
            type="password" 
            fullWidth 
            margin="normal" 
            value={passwordData.newPassword} 
            onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} 
          />
          <TextField 
            label="Confirm New Password" 
            type="password" 
            fullWidth 
            margin="normal" 
            value={passwordData.confirmPassword} 
            onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} 
          />
          {passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Passwords do not match
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePasswordDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => changePasswordMutation.mutate(passwordData)}
            disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || passwordData.newPassword !== passwordData.confirmPassword}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialog} onClose={() => setLogoutDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Logout Confirmation</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Are you sure you want to logout?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/management-login');
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Curriculum Details Dialog */}
      <Dialog open={curriculumDetailsDialog} onClose={() => setCurriculumDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <BookIcon color="primary" />
            Curriculum Plan Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedCurriculum && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    {selectedCurriculum.subject} - Grade {selectedCurriculum.grade}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Department: {selectedCurriculum.departmentId?.name}
                  </Typography>
                  <Chip 
                    label="Approved" 
                    color="success" 
                    size="small" 
                    sx={{ mb: 2 }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Approval Information
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Approved by: {selectedCurriculum.approvedBy?.name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Approved on: {selectedCurriculum.approvedAt ? new Date(selectedCurriculum.approvedAt).toLocaleDateString() : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Created by: {selectedCurriculum.createdBy?.name || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedCurriculum.description || 'No description provided'}
              </Typography>

              <Typography variant="h6" gutterBottom>
                Learning Objectives
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedCurriculum.objectives || 'No objectives provided'}
              </Typography>

              {selectedCurriculum.topics && selectedCurriculum.topics.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Topics Covered
                  </Typography>
                  <Box>
                    {selectedCurriculum.topics.map((topic, index) => (
                      <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {topic.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {topic.description}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Duration: {topic.duration}
                        </Typography>
                        {topic.learningOutcomes && topic.learningOutcomes.length > 0 && (
                          <Box mt={1}>
                            <Typography variant="caption" fontWeight="medium">
                              Learning Outcomes:
                            </Typography>
                            <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                              {topic.learningOutcomes.map((outcome, idx) => (
                                <li key={idx}>
                                  <Typography variant="caption" color="textSecondary">
                                    {outcome}
                                  </Typography>
                                </li>
                              ))}
                            </ul>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCurriculumDetailsDialog(false)}>Close</Button>
          {selectedCurriculum && (
            <Button 
              variant="contained" 
              onClick={() => {
                setEditingCurriculum({
                  id: selectedCurriculum._id,
                  departmentId: selectedCurriculum.departmentId?._id,
                  subject: selectedCurriculum.subject,
                  grade: selectedCurriculum.grade,
                  description: selectedCurriculum.description,
                  objectives: selectedCurriculum.objectives
                });
                setCurriculumDetailsDialog(false);
                setEditCurriculumDialog(true);
              }}
            >
              Edit Plan
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Teacher Remarks Dialog for Point 4 */}
      <Dialog open={teacherRemarksDialog} onClose={handleCloseTeacherRemarksDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <CommentIcon color="primary" />
            Teacher Remarks - Point 4: Weekly/Unit-Wise Syllabus Plan
            {selectedCurriculumForRemarks && (
              <Typography variant="subtitle2" color="textSecondary">
                ({selectedCurriculumForRemarks.subject} - Grade {selectedCurriculumForRemarks.grade})
              </Typography>
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {loadingTeacherRemarks ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : teacherRemarks.length > 0 ? (
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                This table shows teacher remarks and feedback for the curriculum implementation:
              </Typography>
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Week / Unit</strong></TableCell>
                      <TableCell><strong>Teacher Name</strong></TableCell>
                      <TableCell><strong>Remarks / Feedback</strong></TableCell>
                      <TableCell><strong>Action Taken</strong></TableCell>
                      <TableCell><strong>Date</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {teacherRemarks.map((remark, index) => (
                      <TableRow key={remark._id || index}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {remark.unitChapter || `Week ${index + 1}`}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {remark.teacherName || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {remark.teacherRemarks || remark.remarksTopicsLeft || 'No remarks provided'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {remark.status === 'Completed' ? 'Completed' : 
                             remark.status === 'In Progress' ? 'In Progress' : 
                             remark.status === 'Delayed' ? 'Needs Attention' : 'Not Started'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {remark.startDate ? new Date(remark.startDate).toLocaleDateString() : 'N/A'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <Box textAlign="center" p={3}>
              <Typography variant="body2" color="textSecondary">
                No teacher remarks found for this curriculum plan.
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Teachers can add remarks through their dashboard.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTeacherRemarksDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Service Request Template Dialog */}
      <Dialog open={serviceRequestDialog} onClose={() => setServiceRequestDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <AssignmentIcon color="primary" />
            Create Service Request Template
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>Service Request Information</AlertTitle>
            Create comprehensive service request templates for different departments and staff members.
          </Alert>
          
          {/* Debug Info - Remove this later */}
          <Alert severity="warning" sx={{ mb: 2 }}>
            <AlertTitle>Debug Info</AlertTitle>
            Current Request Type: <strong>{serviceRequestType || 'None selected'}</strong>
            <br />
            Leave Request Active: <strong>{serviceRequestType === 'LeaveRequest' ? 'YES' : 'NO'}</strong>
            <br />
            IT Support Active: <strong>{serviceRequestType === 'ITSupportRequest' ? 'YES' : 'NO'}</strong>
            <br />
            Counselling Active: <strong>{serviceRequestType === 'CounsellingRequest' ? 'YES' : 'NO'}</strong>
            <br />
            Substitute Teacher Active: <strong>{serviceRequestType === 'SubstituteTeacherRequest' ? 'YES' : 'NO'}</strong>
            <br />
            General Service Active: <strong>{serviceRequestType === 'GeneralServiceRequest' ? 'YES' : 'NO'}</strong>
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Select Request Type *
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {[
                  { value: 'LeaveRequest', label: 'Leave Request', icon: '📋' },
                  { value: 'ITSupportRequest', label: 'IT Support Request', icon: '💻' },
                  { value: 'CounsellingRequest', label: 'Counselling Request', icon: '🧠' },
                  { value: 'SubstituteTeacherRequest', label: 'Substitute Teacher Request', icon: '👨‍🏫' },
                  { value: 'GeneralServiceRequest', label: 'General Service Request', icon: '🛠️' }
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={serviceRequestType === option.value ? 'contained' : 'outlined'}
                    onClick={() => {
                      console.log('Button clicked for:', option.value);
                      setServiceRequestType(option.value);
                    }}
                    sx={{ 
                      minWidth: 200,
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      mb: 1
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </Box>
                  </Button>
                ))}
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Priority Level *</InputLabel>
                <Select
                  value={serviceRequestData.priority || 'Medium'}
                  onChange={(e) => setServiceRequestData({ ...serviceRequestData, priority: e.target.value })}
                  label="Priority Level *"
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                  <MenuItem value="Emergency">Emergency</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField 
                label="Request Date *" 
                type="date" 
                fullWidth 
                margin="normal" 
                value={serviceRequestData.date || ''} 
                onChange={e => setServiceRequestData({ ...serviceRequestData, date: e.target.value })} 
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                label="Expected Completion Date" 
                type="date" 
                fullWidth 
                margin="normal" 
                value={serviceRequestData.expectedCompletionDate || ''} 
                onChange={e => setServiceRequestData({ ...serviceRequestData, expectedCompletionDate: e.target.value })} 
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          {serviceRequestType === 'LeaveRequest' && (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1, color: 'primary.main', fontWeight: 'bold' }}>
                📋 Leave Request Details
              </Typography>
              
              {/* Requester Information */}
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                Requester Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Employee Name *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.employeeName || user?.name || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, employeeName: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Employee ID *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.employeeId || user?.employeeId || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, employeeId: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Department *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.department || user?.department || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, department: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Designation *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.designation || user?.role || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, designation: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Contact Number *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.contactNumber || user?.phone || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, contactNumber: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Email Address *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.email || user?.email || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, email: e.target.value })} 
                  />
                </Grid>
              </Grid>

              {/* Leave Details */}
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                Leave Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Leave Type *</InputLabel>
                    <Select
                      value={serviceRequestData.leaveType || ''}
                      onChange={(e) => setServiceRequestData({ ...serviceRequestData, leaveType: e.target.value })}
                      label="Leave Type *"
                    >
                      <MenuItem value="Sick Leave">Sick Leave</MenuItem>
                      <MenuItem value="Casual Leave">Casual Leave</MenuItem>
                      <MenuItem value="Annual Leave">Annual Leave</MenuItem>
                      <MenuItem value="Maternity Leave">Maternity Leave</MenuItem>
                      <MenuItem value="Paternity Leave">Paternity Leave</MenuItem>
                      <MenuItem value="Study Leave">Study Leave</MenuItem>
                      <MenuItem value="Compensatory Leave">Compensatory Leave</MenuItem>
                      <MenuItem value="Half Day Leave">Half Day Leave</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Number of Days *" 
                    type="number" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.numberOfDays || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, numberOfDays: e.target.value })} 
                    inputProps={{ min: 0.5, step: 0.5 }}
                    helperText="Use 0.5 for half day"
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="From Date *" 
                    type="date" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.fromDate || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, fromDate: e.target.value })} 
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="To Date *" 
                    type="date" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.toDate || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, toDate: e.target.value })} 
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="From Time" 
                    type="time" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.fromTime || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, fromTime: e.target.value })} 
                    InputLabelProps={{ shrink: true }}
                    helperText="For half day or specific time leave"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="To Time" 
                    type="time" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.toTime || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, toTime: e.target.value })} 
                    InputLabelProps={{ shrink: true }}
                    helperText="For half day or specific time leave"
                  />
                </Grid>
              </Grid>
              <TextField 
                label="Reason for Leave *" 
                fullWidth 
                margin="normal" 
                multiline 
                rows={3}
                value={serviceRequestData.reason || ''} 
                onChange={e => setServiceRequestData({ ...serviceRequestData, reason: e.target.value })} 
                placeholder="Please provide detailed reason for leave request..."
              />
              
              {/* Additional Information */}
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                Additional Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Contact Number During Leave" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.emergencyContact || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, emergencyContact: e.target.value })} 
                    helperText="Emergency contact number during leave period"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Address During Leave" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.addressDuringLeave || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, addressDuringLeave: e.target.value })} 
                    placeholder="If different from permanent address"
                  />
                </Grid>
              </Grid>
              <TextField 
                label="Handover Details" 
                fullWidth 
                margin="normal" 
                multiline 
                rows={2}
                value={serviceRequestData.handoverDetails || ''} 
                onChange={e => setServiceRequestData({ ...serviceRequestData, handoverDetails: e.target.value })} 
                placeholder="Details of work handover, pending tasks, etc."
              />
            </>
          )}

          {serviceRequestType === 'ITSupportRequest' && (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1, color: 'primary.main', fontWeight: 'bold' }}>
                💻 IT Support Request Details
              </Typography>
              
              {/* Requester Information */}
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                Requester Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Requester Name *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.requesterName || user?.name || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, requesterName: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Employee ID *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.employeeId || user?.employeeId || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, employeeId: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Department *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.department || user?.department || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, department: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Designation *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.designation || user?.role || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, designation: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Contact Number *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.contactNumber || user?.phone || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, contactNumber: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Email Address *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.email || user?.email || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, email: e.target.value })} 
                  />
                </Grid>
              </Grid>

              {/* Device/Equipment Information */}
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                Device/Equipment Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Device Type *</InputLabel>
                    <Select
                      value={serviceRequestData.deviceType || ''}
                      onChange={(e) => setServiceRequestData({ ...serviceRequestData, deviceType: e.target.value })}
                      label="Device Type *"
                    >
                      <MenuItem value="Desktop">Desktop Computer</MenuItem>
                      <MenuItem value="Laptop">Laptop</MenuItem>
                      <MenuItem value="Projector">Projector</MenuItem>
                      <MenuItem value="Printer">Printer</MenuItem>
                      <MenuItem value="Smart Board">Smart Board</MenuItem>
                      <MenuItem value="Scanner">Scanner</MenuItem>
                      <MenuItem value="Tablet">Tablet</MenuItem>
                      <MenuItem value="Mobile Device">Mobile Device</MenuItem>
                      <MenuItem value="Network Equipment">Network Equipment</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Device Model" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.deviceModel || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, deviceModel: e.target.value })} 
                    placeholder="e.g., Dell OptiPlex 7090, HP LaserJet Pro"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Device/Equipment ID *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.deviceId || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, deviceId: e.target.value })} 
                    placeholder="e.g., PC-001, Laptop-002, Asset Tag"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Operating System" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.operatingSystem || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, operatingSystem: e.target.value })} 
                    placeholder="e.g., Windows 11, macOS, Linux"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Location/Room *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.location || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, location: e.target.value })} 
                    placeholder="e.g., Room 101, Computer Lab 2"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Serial Number" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.serialNumber || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, serialNumber: e.target.value })} 
                    placeholder="Device serial number if available"
                  />
                </Grid>
              </Grid>

              {/* Issue Details */}
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                Issue Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Issue Category *</InputLabel>
                    <Select
                      value={serviceRequestData.issueCategory || ''}
                      onChange={(e) => setServiceRequestData({ ...serviceRequestData, issueCategory: e.target.value })}
                      label="Issue Category *"
                    >
                      <MenuItem value="Hardware">Hardware Issue</MenuItem>
                      <MenuItem value="Software">Software Issue</MenuItem>
                      <MenuItem value="Network">Network Issue</MenuItem>
                      <MenuItem value="Email">Email Issue</MenuItem>
                      <MenuItem value="Printer">Printer Issue</MenuItem>
                      <MenuItem value="Access">Access/Permission Issue</MenuItem>
                      <MenuItem value="Internet">Internet Connectivity</MenuItem>
                      <MenuItem value="Virus">Virus/Malware</MenuItem>
                      <MenuItem value="Performance">Performance Issue</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Priority Level *</InputLabel>
                    <Select
                      value={serviceRequestData.priority || 'Medium'}
                      onChange={(e) => setServiceRequestData({ ...serviceRequestData, priority: e.target.value })}
                      label="Priority Level *"
                    >
                      <MenuItem value="Low">Low - Minor inconvenience</MenuItem>
                      <MenuItem value="Medium">Medium - Work impacted, workaround possible</MenuItem>
                      <MenuItem value="High">High - Work halted, needs urgent resolution</MenuItem>
                      <MenuItem value="Critical">Critical - System down, immediate attention required</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <TextField 
                label="Issue Description *" 
                fullWidth 
                margin="normal" 
                multiline 
                rows={4}
                value={serviceRequestData.issueDescription || ''} 
                onChange={e => setServiceRequestData({ ...serviceRequestData, issueDescription: e.target.value })} 
                placeholder="Please describe the issue in detail, including any error messages, steps to reproduce, when it started, etc."
              />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Requested Action *</InputLabel>
                    <Select
                      value={serviceRequestData.requestedAction || ''}
                      onChange={(e) => setServiceRequestData({ ...serviceRequestData, requestedAction: e.target.value })}
                      label="Requested Action *"
                    >
                      <MenuItem value="Troubleshoot & Fix">Troubleshoot & Fix</MenuItem>
                      <MenuItem value="Replace Device/Part">Replace Device/Part</MenuItem>
                      <MenuItem value="Software Installation/Update">Software Installation/Update</MenuItem>
                      <MenuItem value="Network Configuration">Network Configuration</MenuItem>
                      <MenuItem value="Data Recovery">Data Recovery</MenuItem>
                      <MenuItem value="Training/Support">Training/Support</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Preferred Contact Time" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.preferredContactTime || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, preferredContactTime: e.target.value })} 
                    placeholder="e.g., 9:00 AM - 5:00 PM, During break time"
                  />
                </Grid>
              </Grid>
            </>
          )}

          {serviceRequestType === 'CounsellingRequest' && (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1, color: 'primary.main', fontWeight: 'bold' }}>
                🧠 Counselling Request Details
              </Typography>
              
              {/* Requester Information */}
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                Requester Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Requester Name *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.requesterName || user?.name || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, requesterName: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Employee ID *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.employeeId || user?.employeeId || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, employeeId: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Department *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.department || user?.department || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, department: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Designation *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.designation || user?.role || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, designation: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Contact Number *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.contactNumber || user?.phone || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, contactNumber: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Email Address *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.email || user?.email || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, email: e.target.value })} 
                  />
                </Grid>
              </Grid>

              {/* Counselling Details */}
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                Counselling Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Preferred Date *" 
                    type="date" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.preferredDate || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, preferredDate: e.target.value })} 
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Preferred Time *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.preferredTime || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, preferredTime: e.target.value })} 
                    placeholder="e.g., 9:00 AM, 2:00 PM, During break time"
                  />
                </Grid>
              </Grid>
              <TextField 
                label="Reason for Counselling *" 
                fullWidth 
                margin="normal" 
                multiline 
                rows={3}
                value={serviceRequestData.reasonForCounselling || ''} 
                onChange={e => setServiceRequestData({ ...serviceRequestData, reasonForCounselling: e.target.value })} 
                placeholder="Please describe the reason for seeking counselling..."
              />
              <TextField 
                label="Specific Concerns *" 
                fullWidth 
                margin="normal" 
                multiline 
                rows={3}
                value={serviceRequestData.specificConcerns || ''} 
                onChange={e => setServiceRequestData({ ...serviceRequestData, specificConcerns: e.target.value })} 
                placeholder="Please describe specific concerns, issues, or areas you would like to discuss..."
              />
              
              {/* Additional Information */}
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                Additional Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Previous Counselling</InputLabel>
                    <Select
                      value={serviceRequestData.previousCounselling || 'No'}
                      onChange={(e) => setServiceRequestData({ ...serviceRequestData, previousCounselling: e.target.value })}
                      label="Previous Counselling"
                    >
                      <MenuItem value="No">No</MenuItem>
                      <MenuItem value="Yes">Yes</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Emergency Contact" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.emergencyContact || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, emergencyContact: e.target.value })} 
                    placeholder="Emergency contact number if needed"
                  />
                </Grid>
              </Grid>
              <TextField 
                label="Additional Notes" 
                fullWidth 
                margin="normal" 
                multiline 
                rows={2}
                value={serviceRequestData.additionalNotes || ''} 
                onChange={e => setServiceRequestData({ ...serviceRequestData, additionalNotes: e.target.value })} 
                placeholder="Any additional information, preferences, or special requirements..."
              />
            </>
          )}

          {serviceRequestType === 'SubstituteTeacherRequest' && (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1, color: 'primary.main', fontWeight: 'bold' }}>
                👨‍🏫 Substitute Teacher Request Details
              </Typography>
              
              {/* Requester Information */}
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                Requester Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Requester Name *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.requesterName || user?.name || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, requesterName: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Employee ID *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.employeeId || user?.employeeId || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, employeeId: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Department *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.department || user?.department || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, department: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Designation *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.designation || user?.role || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, designation: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Contact Number *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.contactNumber || user?.phone || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, contactNumber: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Email Address *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.email || user?.email || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, email: e.target.value })} 
                  />
                </Grid>
              </Grid>

              {/* Absence Details */}
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                Absence Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Absent Teacher Name *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.absentTeacherName || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, absentTeacherName: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Department / Subject *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.subject || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, subject: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Reason for Absence *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.reasonForAbsence || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, reasonForAbsence: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Request Date *" 
                    type="date" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.requestDate || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, requestDate: e.target.value })} 
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Absence From *" 
                    type="date" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.absenceFrom || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, absenceFrom: e.target.value })} 
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Absence To *" 
                    type="date" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.absenceTo || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, absenceTo: e.target.value })} 
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>

              {/* Class Coverage Details */}
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                Class Coverage Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Period(s) to be Covered *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.periods || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, periods: e.target.value })} 
                    placeholder="e.g., 1st, 3rd, 5th"
                    helperText="Specify which periods need coverage"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Class(es) & Section(s) *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.classes || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, classes: e.target.value })} 
                    placeholder="e.g., Class 6A, Class 7C"
                    helperText="Specify which classes need coverage"
                  />
                </Grid>
              </Grid>
              <TextField 
                label="Suggested Substitute Teacher(s)" 
                fullWidth 
                margin="normal" 
                value={serviceRequestData.suggestedSubstitute || ''} 
                onChange={e => setServiceRequestData({ ...serviceRequestData, suggestedSubstitute: e.target.value })} 
                placeholder="Name(s) if known or preferred"
                helperText="Optional: Suggest specific teachers if you have preferences"
              />
              <TextField 
                label="Remarks" 
                fullWidth 
                margin="normal" 
                multiline 
                rows={2}
                value={serviceRequestData.remarks || ''} 
                onChange={e => setServiceRequestData({ ...serviceRequestData, remarks: e.target.value })} 
                placeholder="Any extra info (e.g., exam coverage, urgent, special instructions)"
              />
            </>
          )}

          {serviceRequestType === 'GeneralServiceRequest' && (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1, color: 'primary.main', fontWeight: 'bold' }}>
                🛠️ General Service Request Details
              </Typography>
              
              {/* Requester Information */}
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                Requester Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Requester Name *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.requesterName || user?.name || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, requesterName: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Employee ID *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.employeeId || user?.employeeId || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, employeeId: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Department *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.department || user?.department || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, department: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Designation *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.designation || user?.role || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, designation: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Contact Number *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.contactNumber || user?.phone || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, contactNumber: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Email Address *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.email || user?.email || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, email: e.target.value })} 
                  />
                </Grid>
              </Grid>

              {/* Service Details */}
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                Service Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Service Category *</InputLabel>
                    <Select
                      value={serviceRequestData.serviceCategory || ''}
                      onChange={(e) => setServiceRequestData({ ...serviceRequestData, serviceCategory: e.target.value })}
                      label="Service Category *"
                    >
                      <MenuItem value="Administrative">Administrative</MenuItem>
                      <MenuItem value="Facility">Facility Management</MenuItem>
                      <MenuItem value="Security">Security</MenuItem>
                      <MenuItem value="Transportation">Transportation</MenuItem>
                      <MenuItem value="Catering">Catering</MenuItem>
                      <MenuItem value="Events">Events Management</MenuItem>
                      <MenuItem value="Maintenance">Maintenance</MenuItem>
                      <MenuItem value="Cleaning">Cleaning Services</MenuItem>
                      <MenuItem value="Medical">Medical Services</MenuItem>
                      <MenuItem value="Library">Library Services</MenuItem>
                      <MenuItem value="Sports">Sports & Recreation</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Service Location *" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.serviceLocation || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, serviceLocation: e.target.value })} 
                    placeholder="e.g., Room 101, Main Hall, Parking Area"
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Preferred Date" 
                    type="date" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.preferredDate || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, preferredDate: e.target.value })} 
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Preferred Time" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.preferredTime || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, preferredTime: e.target.value })} 
                    placeholder="e.g., 9:00 AM - 5:00 PM, During break time"
                  />
                </Grid>
              </Grid>
              <TextField 
                label="Service Description *" 
                fullWidth 
                margin="normal" 
                multiline 
                rows={4}
                value={serviceRequestData.description || ''} 
                onChange={e => setServiceRequestData({ ...serviceRequestData, description: e.target.value })} 
                placeholder="Please provide detailed description of the service required, including specific requirements, quantity, specifications, etc."
              />
              
              {/* Additional Requirements */}
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                Additional Requirements
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Budget Estimate" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.budgetEstimate || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, budgetEstimate: e.target.value })} 
                    placeholder="Estimated cost if known"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Urgency Level" 
                    fullWidth 
                    margin="normal" 
                    value={serviceRequestData.urgencyLevel || ''} 
                    onChange={e => setServiceRequestData({ ...serviceRequestData, urgencyLevel: e.target.value })} 
                    placeholder="e.g., Normal, Urgent, Emergency"
                  />
                </Grid>
              </Grid>
              <TextField 
                label="Special Requirements" 
                fullWidth 
                margin="normal" 
                multiline 
                rows={2}
                value={serviceRequestData.specialRequirements || ''} 
                onChange={e => setServiceRequestData({ ...serviceRequestData, specialRequirements: e.target.value })} 
                placeholder="Any special requirements, accessibility needs, safety considerations, etc."
              />
            </>
          )}

          <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
            Additional Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField 
                label="Requested By" 
                fullWidth 
                margin="normal" 
                value={serviceRequestData.requestedBy || user?.name || ''} 
                onChange={e => setServiceRequestData({ ...serviceRequestData, requestedBy: e.target.value })} 
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                label="Contact Number" 
                fullWidth 
                margin="normal" 
                value={serviceRequestData.contactNumber || user?.phone || ''} 
                onChange={e => setServiceRequestData({ ...serviceRequestData, contactNumber: e.target.value })} 
              />
            </Grid>
          </Grid>
          <TextField 
            label="Additional Comments/Notes" 
            fullWidth 
            margin="normal" 
            multiline 
            rows={3}
            value={serviceRequestData.comments || ''} 
            onChange={e => setServiceRequestData({ ...serviceRequestData, comments: e.target.value })} 
            placeholder="Any additional information, special requirements, or notes..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setServiceRequestDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => createServiceRequestMutation.mutate({
              requestType: serviceRequestType,
              requestData: serviceRequestData,
              requestedBy: user?.id,
              status: 'Pending',
              currentApprover: 'VP',
              createdAt: new Date().toISOString()
            })}
            disabled={!serviceRequestType || !serviceRequestData.date}
          >
            Create Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* HOD Template Dialog */}
      <Dialog open={hodTemplateDialog} onClose={() => setHodTemplateDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <BookIcon color="primary" />
            Create HOD Template
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>HOD Template Information</AlertTitle>
            Create comprehensive templates for HODs to use in their department management and reporting.
          </Alert>

          <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
            Basic Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField 
                label="Template Title *" 
                fullWidth 
                margin="normal" 
                value={hodTemplateData.title || ''} 
                onChange={e => setHodTemplateData({ ...hodTemplateData, title: e.target.value })} 
                placeholder="e.g., Monthly Department Report Template"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Department *</InputLabel>
                <Select
                  value={hodTemplateData.departmentId || ''}
                  onChange={(e) => setHodTemplateData({ ...hodTemplateData, departmentId: e.target.value })}
                  label="Department *"
                >
                  {departments?.map((dept) => (
                    <MenuItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Template Type *</InputLabel>
                <Select
                  value={hodTemplateData.templateType || ''}
                  onChange={(e) => setHodTemplateData({ ...hodTemplateData, templateType: e.target.value })}
                  label="Template Type *"
                >
                  <MenuItem value="AcademicPlan">Academic Plan</MenuItem>
                  <MenuItem value="DepartmentReport">Department Report</MenuItem>
                  <MenuItem value="StaffEvaluation">Staff Evaluation</MenuItem>
                  <MenuItem value="BudgetProposal">Budget Proposal</MenuItem>
                  <MenuItem value="CurriculumReview">Curriculum Review</MenuItem>
                  <MenuItem value="PerformanceReview">Performance Review</MenuItem>
                  <MenuItem value="StrategicPlan">Strategic Plan</MenuItem>
                  <MenuItem value="ResourceAllocation">Resource Allocation</MenuItem>
                  <MenuItem value="QualityAssurance">Quality Assurance</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Template Category</InputLabel>
                <Select
                  value={hodTemplateData.category || ''}
                  onChange={(e) => setHodTemplateData({ ...hodTemplateData, category: e.target.value })}
                  label="Template Category"
                >
                  <MenuItem value="Academic">Academic</MenuItem>
                  <MenuItem value="Administrative">Administrative</MenuItem>
                  <MenuItem value="Financial">Financial</MenuItem>
                  <MenuItem value="Operational">Operational</MenuItem>
                  <MenuItem value="Strategic">Strategic</MenuItem>
                  <MenuItem value="Quality">Quality Management</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
            Template Details
          </Typography>
          <TextField 
            label="Template Description *" 
            fullWidth 
            margin="normal" 
            multiline 
            rows={3}
            value={hodTemplateData.description || ''} 
            onChange={e => setHodTemplateData({ ...hodTemplateData, description: e.target.value })} 
            placeholder="Provide a detailed description of what this template is for and how it should be used..."
          />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Academic Year</InputLabel>
                <Select
                  value={hodTemplateData.academicYear || ''}
                  onChange={(e) => setHodTemplateData({ ...hodTemplateData, academicYear: e.target.value })}
                  label="Academic Year"
                >
                  {[new Date().getFullYear(), new Date().getFullYear() + 1, new Date().getFullYear() + 2].map((year) => (
                    <MenuItem key={year} value={year.toString()}>{year}-{(year + 1).toString().slice(-2)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={hodTemplateData.frequency || ''}
                  onChange={(e) => setHodTemplateData({ ...hodTemplateData, frequency: e.target.value })}
                  label="Frequency"
                >
                  <MenuItem value="OneTime">One Time</MenuItem>
                  <MenuItem value="Weekly">Weekly</MenuItem>
                  <MenuItem value="Monthly">Monthly</MenuItem>
                  <MenuItem value="Quarterly">Quarterly</MenuItem>
                  <MenuItem value="Semester">Semester</MenuItem>
                  <MenuItem value="Annual">Annual</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
            Template Content
          </Typography>
          <TextField 
            label="Template Content *" 
            fullWidth 
            margin="normal" 
            multiline 
            rows={8}
            placeholder="Enter the template content with placeholders like [HOD_NAME], [DEPARTMENT], [DATE], [ACADEMIC_YEAR], [STAFF_COUNT], etc. You can include sections, tables, and formatting instructions."
            value={hodTemplateData.content || ''} 
            onChange={e => setHodTemplateData({ ...hodTemplateData, content: e.target.value })} 
          />

          <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
            Template Configuration
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status *</InputLabel>
                <Select
                  value={hodTemplateData.status || 'Active'}
                  onChange={(e) => setHodTemplateData({ ...hodTemplateData, status: e.target.value })}
                  label="Status *"
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Draft">Draft</MenuItem>
                  <MenuItem value="UnderReview">Under Review</MenuItem>
                  <MenuItem value="Archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Version</InputLabel>
                <Select
                  value={hodTemplateData.version || '1.0'}
                  onChange={(e) => setHodTemplateData({ ...hodTemplateData, version: e.target.value })}
                  label="Version"
                >
                  <MenuItem value="1.0">Version 1.0</MenuItem>
                  <MenuItem value="1.1">Version 1.1</MenuItem>
                  <MenuItem value="1.2">Version 1.2</MenuItem>
                  <MenuItem value="2.0">Version 2.0</MenuItem>
                  <MenuItem value="2.1">Version 2.1</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField 
                label="Due Date" 
                type="date" 
                fullWidth 
                margin="normal" 
                value={hodTemplateData.dueDate || ''} 
                onChange={e => setHodTemplateData({ ...hodTemplateData, dueDate: e.target.value })} 
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                label="Review Cycle (days)" 
                type="number" 
                fullWidth 
                margin="normal" 
                value={hodTemplateData.reviewCycle || ''} 
                onChange={e => setHodTemplateData({ ...hodTemplateData, reviewCycle: e.target.value })} 
                placeholder="e.g., 30 for monthly review"
              />
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
            Additional Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField 
                label="Created By" 
                fullWidth 
                margin="normal" 
                value={hodTemplateData.createdBy || user?.name || ''} 
                onChange={e => setHodTemplateData({ ...hodTemplateData, createdBy: e.target.value })} 
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                label="Last Modified" 
                fullWidth 
                margin="normal" 
                value={hodTemplateData.lastModified || new Date().toISOString().split('T')[0]} 
                onChange={e => setHodTemplateData({ ...hodTemplateData, lastModified: e.target.value })} 
                InputProps={{ readOnly: true }}
              />
            </Grid>
          </Grid>

          <TextField 
            label="Instructions for Use" 
            fullWidth 
            margin="normal" 
            multiline 
            rows={3}
            value={hodTemplateData.instructions || ''} 
            onChange={e => setHodTemplateData({ ...hodTemplateData, instructions: e.target.value })} 
            placeholder="Provide instructions on how to use this template, any special requirements, or guidelines..."
          />

          <TextField 
            label="Notes/Comments" 
            fullWidth 
            margin="normal" 
            multiline 
            rows={2}
            value={hodTemplateData.notes || ''} 
            onChange={e => setHodTemplateData({ ...hodTemplateData, notes: e.target.value })} 
            placeholder="Any additional notes, comments, or special considerations..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHodTemplateDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => createHODTemplateMutation.mutate({
              ...hodTemplateData,
              createdBy: user?.id,
              createdAt: new Date().toISOString(),
              lastModified: new Date().toISOString()
            })}
            disabled={!hodTemplateData.title || !hodTemplateData.departmentId || !hodTemplateData.templateType || !hodTemplateData.content}
          >
            Create Template
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 