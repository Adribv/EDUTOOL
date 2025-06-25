import { useState } from 'react';
import { Box, Typography, Tabs, Tab, Card, CardContent, Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, CircularProgress, Select, MenuItem, FormControl, InputLabel, Grid, Paper, Divider, Alert, Switch, FormControlLabel, Avatar, Menu, MenuItem as MenuItemMUI } from '@mui/material';
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
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import React from 'react';

// API service for Vice Principal using axios instance (token auto-attached)
const vpAPI = {
  // Department Management
  getOverview: () => api.get('/api/vp/department/overview').then(res => res.data),
  getStaff: () => api.get('/api/vp/department/staff').then(res => res.data),
  getStatistics: () => api.get('/api/vp/department/statistics').then(res => res.data),
  getDepartment: () => api.get('/api/vp/department').then(res => res.data),
  updateDepartment: (data) => api.put(`/api/vp/department/${data.id}`, data).then(res => res.data),
  getTeachers: (departmentId) => api.get(`/api/vp/department/${departmentId}/teachers`).then(res => res.data),
  addTeacher: (data) => api.post('/api/vp/department/teacher', data).then(res => res.data),
  removeTeacher: (departmentId, teacherId) => api.delete(`/api/vp/department/${departmentId}/teacher/${teacherId}`).then(res => res.data),
  createDepartment: (data) => api.post('/api/vp/department', data).then(res => res.data),
  
  // HOD Management
  getAllDepartments: () => api.get('/api/vp/departments').then(res => res.data),
  assignHOD: (data) => api.post('/api/vp/department/hod', data).then(res => res.data),
  getHODs: () => api.get('/api/vp/hods').then(res => res.data),
  
  // Exam Management
  getExams: () => api.get('/api/vp/exams').then(res => res.data),
  createExam: (data) => api.post('/api/vp/exams', data).then(res => res.data),
  updateExam: (data) => api.put(`/api/vp/exams/${data.id}`, data).then(res => res.data),
  deleteExam: (examId) => api.delete(`/api/vp/exams/${examId}`).then(res => res.data),
  
  // Exam Timetable Management
  getTimetables: () => api.get('/api/vp/timetables').then(res => res.data),
  createTimetable: (data) => api.post('/api/vp/timetables', data).then(res => res.data),
  updateTimetable: (data) => api.put(`/api/vp/timetables/${data.id}`, data).then(res => res.data),
  deleteTimetable: (timetableId) => api.delete(`/api/vp/timetables/${timetableId}`).then(res => res.data),
  getTimetablesByDateRange: (startDate, endDate) => api.get(`/api/vp/timetables/date-range?startDate=${startDate}&endDate=${endDate}`).then(res => res.data),
  
  // Curriculum Management
  getCurriculumPlans: () => api.get('/api/vp/curriculum').then(res => res.data),
  createCurriculum: (data) => api.post('/api/vp/curriculum', data).then(res => res.data),
  updateCurriculum: (data) => api.put(`/api/vp/curriculum/${data.id}`, data).then(res => res.data),
  deleteCurriculum: (planId) => api.delete(`/api/vp/curriculum/${planId}`).then(res => res.data),
  approveCurriculum: (planId) => api.post(`/api/vp/curriculum/${planId}/approve`).then(res => res.data),
  
  // HOD Approval Management
  getHODSubmissions: () => api.get('/api/vp/hod-submissions').then(res => res.data),
  approveHODSubmission: (submissionId) => api.post(`/api/vp/hod-submissions/${submissionId}/approve`).then(res => res.data),
  rejectHODSubmission: (submissionId) => api.post(`/api/vp/hod-submissions/${submissionId}/reject`).then(res => res.data),
  
  // Profile Management
  getProfile: () => api.get('/api/vp/profile').then(res => res.data),
  updateProfile: (data) => api.put('/api/vp/profile', data).then(res => res.data),
  changePassword: (data) => api.post('/api/vp/change-password', data).then(res => res.data),
};

export default function VicePrincipalDashboard() {
  const [tab, setTab] = useState(0);
  const [editDialog, setEditDialog] = useState(false);
  const [editDept, setEditDept] = useState({});
  const [addTeacherDialog, setAddTeacherDialog] = useState(false);
  const [newTeacherId, setNewTeacherId] = useState('');
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
  const [newCurriculum, setNewCurriculum] = useState({ departmentId: '', subject: '', grade: '', description: '', objectives: '' });
  
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

  // Queries
  const { data: overview, isLoading: loadingOverview } = useQuery({ queryKey: ['vpOverview'], queryFn: vpAPI.getOverview });
  const { data: staff, isLoading: loadingStaff } = useQuery({ queryKey: ['vpStaff'], queryFn: vpAPI.getStaff });
  const { data: statistics, isLoading: loadingStats } = useQuery({ queryKey: ['vpStats'], queryFn: vpAPI.getStatistics });
  const { data: departments, isLoading: loadingDept } = useQuery({ queryKey: ['vpDepartment'], queryFn: vpAPI.getDepartment });
  const { data: teachers, isLoading: loadingTeachers } = useQuery({ 
    queryKey: ['vpTeachers', selectedDepartment?._id], 
    queryFn: () => selectedDepartment ? vpAPI.getTeachers(selectedDepartment._id) : Promise.resolve([]),
    enabled: !!selectedDepartment
  });
  
  // New queries for expanded features
  const { data: allDepartments, isLoading: loadingAllDepts } = useQuery({ queryKey: ['vpAllDepartments'], queryFn: vpAPI.getAllDepartments });
  const { data: hods, isLoading: loadingHODs } = useQuery({ queryKey: ['vpHODs'], queryFn: vpAPI.getHODs });
  const { data: exams, isLoading: loadingExams } = useQuery({ queryKey: ['vpExams'], queryFn: vpAPI.getExams });
  const { data: timetables, isLoading: loadingTimetables } = useQuery({ queryKey: ['vpTimetables'], queryFn: vpAPI.getTimetables });
  const { data: curriculumPlans, isLoading: loadingCurriculum } = useQuery({ queryKey: ['vpCurriculum'], queryFn: vpAPI.getCurriculumPlans });
  const { data: hodSubmissions, isLoading: loadingHODSubmissions } = useQuery({ queryKey: ['vpHODSubmissions'], queryFn: vpAPI.getHODSubmissions });

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

  const addTeacherMutation = useMutation({
    mutationFn: vpAPI.addTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries(['vpTeachers', selectedDepartment?._id]);
      setAddTeacherDialog(false);
      setNewTeacherId('');
      toast.success('Teacher added');
    },
    onError: () => toast.error('Failed to add teacher'),
  });

  const removeTeacherMutation = useMutation({
    mutationFn: ({ departmentId, teacherId }) => vpAPI.removeTeacher(departmentId, teacherId),
    onSuccess: () => {
      queryClient.invalidateQueries(['vpTeachers', selectedDepartment?._id]);
      toast.success('Teacher removed');
    },
    onError: () => toast.error('Failed to remove teacher'),
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
      setNewCurriculum({ departmentId: '', subject: '', grade: '', description: '', objectives: '' });
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

  if (user?.role !== 'VicePrincipal') {
    return <Box p={3}><Typography color="error">Access denied: Vice Principal only</Typography></Box>;
  }

  if (loadingOverview || loadingStaff || loadingStats || loadingDept || loadingTeachers || loadingAllDepts || loadingHODs || loadingExams || loadingTimetables || loadingCurriculum || loadingHODSubmissions) {
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
      
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Overview" icon={<AssessmentIcon />} />
        <Tab label="Departments" icon={<SchoolIcon />} />
        <Tab label="HOD Management" icon={<PeopleIcon />} />
        <Tab label="Exams" icon={<EventIcon />} />
        <Tab label="Timetables" icon={<ScheduleIcon />} />
        <Tab label="Curriculum" icon={<BookIcon />} />
        <Tab label="HOD Approvals" icon={<ApprovalIcon />} />
      </Tabs>

      {/* Overview Tab */}
      {tab === 0 && (
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
        </Grid>
      )}

      {/* Departments Tab */}
      {tab === 1 && (
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
                    {selectedDepartment ? `${selectedDepartment.name} Teachers` : 'Select a Department'}
                  </Typography>
                  {selectedDepartment ? (
                    <>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {selectedDepartment.description}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="body2">
                          HOD: {selectedDepartment.headOfDepartment?.name || 'Not Assigned'}
                        </Typography>
                        <Button 
                          size="small" 
                          variant="outlined"
                          onClick={() => setAddTeacherDialog(true)}
                        >
                          Add Teacher
                        </Button>
                      </Box>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell>Email</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {teachers?.map((teacher) => (
                              <TableRow key={teacher._id}>
                                <TableCell>{teacher.name}</TableCell>
                                <TableCell>{teacher.email}</TableCell>
                                <TableCell>
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => removeTeacherMutation.mutate({ 
                                      departmentId: selectedDepartment._id, 
                                      teacherId: teacher._id 
                                    })}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      Click on a department to view its teachers
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* HOD Management Tab */}
      {tab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>HOD Management</Typography>
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

      {/* Exams Tab */}
      {tab === 3 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Exam Management</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setExamDialog(true)}>
              Add Exam
            </Button>
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Exam Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Grade</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {exams?.map((exam) => (
                  <TableRow key={exam._id}>
                    <TableCell>{exam.subject}</TableCell>
                    <TableCell>{exam.departmentId?.name}</TableCell>
                    <TableCell>{exam.class}</TableCell>
                    <TableCell>{exam.subject}</TableCell>
                    <TableCell>{new Date(exam.examDate).toLocaleDateString()}</TableCell>
                    <TableCell>{exam.duration} mins</TableCell>
                    <TableCell>{exam.examType}</TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        color="primary"
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
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this exam?')) {
                            deleteExamMutation.mutate(exam._id);
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Timetables Tab */}
      {tab === 4 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Exam Timetable Management</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setTimetableDialog(true)}>
              Schedule Exam
            </Button>
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Exam Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Grade</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Room</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timetables?.map((timetable) => (
                  <TableRow key={timetable._id}>
                    <TableCell>{timetable.examName}</TableCell>
                    <TableCell>{timetable.departmentId?.name}</TableCell>
                    <TableCell>{timetable.subject}</TableCell>
                    <TableCell>{timetable.grade}</TableCell>
                    <TableCell>{new Date(timetable.examDate).toLocaleDateString()}</TableCell>
                    <TableCell>{timetable.startTime} - {timetable.endTime}</TableCell>
                    <TableCell>{timetable.duration} mins</TableCell>
                    <TableCell>{timetable.room}</TableCell>
                    <TableCell>
                      <Chip 
                        label={timetable.status} 
                        color={
                          timetable.status === 'Completed' ? 'success' : 
                          timetable.status === 'In Progress' ? 'warning' : 
                          timetable.status === 'Cancelled' ? 'error' : 'primary'
                        } 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => {
                          setEditingTimetable({
                            id: timetable._id,
                            departmentId: timetable.departmentId?._id,
                            examId: timetable.examId?._id,
                            examName: timetable.examName,
                            subject: timetable.subject,
                            grade: timetable.grade,
                            examDate: new Date(timetable.examDate).toISOString().split('T')[0],
                            startTime: timetable.startTime,
                            endTime: timetable.endTime,
                            duration: timetable.duration,
                            examType: timetable.examType,
                            room: timetable.room,
                            invigilator: timetable.invigilator
                          });
                          setEditTimetableDialog(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this exam schedule?')) {
                            deleteTimetableMutation.mutate(timetable._id);
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Curriculum Tab */}
      {tab === 5 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Curriculum Management</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCurriculumDialog(true)}>
              Add Curriculum Plan
            </Button>
          </Box>
          
          <Grid container spacing={2}>
            {curriculumPlans?.map((plan) => (
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
        </Box>
      )}

      {/* HOD Approvals Tab */}
      {tab === 6 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>HOD Submissions Pending Approval</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>HOD</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Submission Type</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {hodSubmissions?.map((submission) => (
                    <TableRow key={submission._id}>
                      <TableCell>{submission.hod?.name}</TableCell>
                      <TableCell>{submission.department?.name}</TableCell>
                      <TableCell>{submission.type}</TableCell>
                      <TableCell>{submission.title}</TableCell>
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
      <Dialog open={curriculumDialog} onClose={() => setCurriculumDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Curriculum Plan</DialogTitle>
        <DialogContent>
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
          <TextField 
            label="Subject" 
            fullWidth 
            margin="normal" 
            value={newCurriculum.subject} 
            onChange={e => setNewCurriculum({ ...newCurriculum, subject: e.target.value })} 
          />
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
          <TextField 
            label="Description" 
            fullWidth 
            margin="normal" 
            multiline 
            rows={3}
            value={newCurriculum.description} 
            onChange={e => setNewCurriculum({ ...newCurriculum, description: e.target.value })} 
          />
          <TextField 
            label="Learning Objectives" 
            fullWidth 
            margin="normal" 
            multiline 
            rows={4}
            value={newCurriculum.objectives} 
            onChange={e => setNewCurriculum({ ...newCurriculum, objectives: e.target.value })} 
          />
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

      {/* Add Teacher Dialog */}
      <Dialog open={addTeacherDialog} onClose={() => setAddTeacherDialog(false)}>
        <DialogTitle>Add Teacher to Department</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Department: {selectedDepartment?.name}
          </Typography>
          <TextField 
            label="Teacher ID" 
            fullWidth 
            margin="normal" 
            value={newTeacherId} 
            onChange={e => setNewTeacherId(e.target.value)} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddTeacherDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => addTeacherMutation.mutate({ 
              departmentId: selectedDepartment?._id, 
              teacherId: newTeacherId 
            })}
            disabled={!selectedDepartment || !newTeacherId}
          >
            Add
          </Button>
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
      <Dialog open={editCurriculumDialog} onClose={() => setEditCurriculumDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Curriculum Plan</DialogTitle>
        <DialogContent>
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
          <TextField 
            label="Subject" 
            fullWidth 
            margin="normal" 
            value={editingCurriculum.subject || ''} 
            onChange={e => setEditingCurriculum({ ...editingCurriculum, subject: e.target.value })} 
          />
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
          <TextField 
            label="Description" 
            fullWidth 
            margin="normal" 
            multiline 
            rows={3}
            value={editingCurriculum.description || ''} 
            onChange={e => setEditingCurriculum({ ...editingCurriculum, description: e.target.value })} 
          />
          <TextField 
            label="Learning Objectives" 
            fullWidth 
            margin="normal" 
            multiline 
            rows={4}
            value={editingCurriculum.objectives || ''} 
            onChange={e => setEditingCurriculum({ ...editingCurriculum, objectives: e.target.value })} 
          />
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
              navigate('/login');
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 