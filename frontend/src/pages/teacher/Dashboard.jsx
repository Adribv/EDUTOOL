// ... existing code ...
// (The code will be replaced with a full-featured, tabbed/accordion dashboard for teachers, covering all teacherRoutes.js features, with dynamic API calls and UI for each.)

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Tabs, Tab, Card, CardContent, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, IconButton, Accordion, 
  AccordionSummary, AccordionDetails, List, ListItem, ListItemText, ListItemIcon, Tooltip, Chip, Avatar,
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, Alert, Divider, Paper, Badge,
  Stepper, Step, StepLabel, LinearProgress, Rating, Fab, Drawer, AppBar, Toolbar, Menu, MenuItem as MenuItemMUI,
  CardHeader, CardActions, ListItemAvatar, CardMedia, Chip as MuiChip, AlertTitle, Skeleton, 
  TableContainer, TablePagination, Autocomplete, InputAdornment, Slider, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import {
  ExpandMore, Add, Edit, Delete, Assignment, School, Event, Book, Group, Feedback, Message, 
  Assessment, Schedule, Person, Upload, Download, Visibility, CheckCircle, Warning, Error,
  Notifications, AccountCircle, Logout, Settings, Dashboard, Class, Grade, Timeline, 
  FileUpload, FileDownload, Send, Reply, Star, StarBorder, CalendarToday, AccessTime,
  LocationOn, Phone, Email, Work, Psychology, TrendingUp, TrendingDown, Equalizer,
  BarChart, PieChart, MoreVert, FilterList, Search, Refresh, Print, Share,
  Favorite, FavoriteBorder, ThumbUp, ThumbDown, VisibilityOff, Archive, Unarchive,
  Block, Report, Flag, Bookmark, BookmarkBorder, PlayArrow, Pause, Stop, SkipNext,
  VolumeUp, VolumeOff, Fullscreen, FullscreenExit, ZoomIn, ZoomOut, RotateLeft, RotateRight,
  SupervisorAccount, People, Cancel
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherAPI, staffAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Timetable from './Timetable';
import Assignments from './Assignments';
import Students from './Students';
import Attendance from './Attendance';
import Exams from './Exams';
import LearningResources from './LearningResources';
import Communication from './Communication';
import LeaveRequests from './LeaveRequests';
import TeacherLeaveRequests from './TeacherLeaveRequests';

// Feature tabs configuration
const featureTabs = [
  { label: 'Dashboard', icon: <Dashboard />, key: 'dashboard' },
  { label: 'Profile', icon: <Person />, key: 'profile' },
  { label: 'Classes', icon: <Class />, key: 'classes' },
  { label: 'Timetable', icon: <Schedule />, key: 'timetable' },
  { label: 'Attendance', icon: <CheckCircle />, key: 'attendance' },
  { label: 'Assignments', icon: <Assignment />, key: 'assignments' },
  { label: 'Exams', icon: <Assessment />, key: 'exams' },
  { label: 'Grades', icon: <Grade />, key: 'grades' },
  { label: 'Students', icon: <Group />, key: 'students' },
  { label: 'Leave Requests', icon: <Event />, key: 'leaveRequests' },
  { label: "Teacher's Leave", icon: <Assignment />, key: 'teacherLeaveRequests' },
  { label: 'Resources', icon: <Book />, key: 'resources' },
  { label: 'Lesson Plans', icon: <Work />, key: 'lessonPlans' },
  { label: 'Communication', icon: <Message />, key: 'communication' },
  { label: 'Projects', icon: <Psychology />, key: 'projects' },
  { label: 'Parent Interaction', icon: <Group />, key: 'parentInteraction' },
  { label: 'Feedback', icon: <Feedback />, key: 'feedback' },
  { label: 'Notifications', icon: <Notifications />, key: 'notifications' },
];

// Dashboard Overview Component
function DashboardOverview() {
  const { user } = useAuth();
  const staffId = user?._id || user?.id; // Try both _id and id properties
  
  // Show error if no valid staffId
  if (!staffId || staffId === 'undefined') {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            Unable to load dashboard. User ID not found. Please try logging in again.
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  // Fetch teacher profile data
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['teacherProfile', staffId],
    queryFn: () => teacherAPI.getProfile(staffId),
    enabled: !!staffId && staffId !== 'undefined'
  });

  // Fetch teacher coordinated classes
  const { data: classesData, isLoading: classesLoading } = useQuery({
    queryKey: ['teacherClasses', staffId],
    queryFn: () => teacherAPI.getClasses(staffId),
    enabled: !!staffId && staffId !== 'undefined'
  });

  // Fetch teacher coordinated students
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['teacherStudents', staffId],
    queryFn: () => teacherAPI.getStudents(staffId),
    enabled: !!staffId && staffId !== 'undefined'
  });

  // Fetch teacher coordinated parents
  const { data: parentsData, isLoading: parentsLoading } = useQuery({
    queryKey: ['teacherParents', staffId],
    queryFn: () => teacherAPI.getCoordinatedParents(staffId),
    enabled: !!staffId && staffId !== 'undefined'
  });

  // Fetch teacher assignments
  const { data: assignmentsData, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['teacherAssignments'],
    queryFn: () => teacherAPI.getAssignments(),
    enabled: !!staffId && staffId !== 'undefined'
  });

  // Fetch teacher timetable
  const { data: timetableData, isLoading: timetableLoading } = useQuery({
    queryKey: ['teacherTimetable'],
    queryFn: () => teacherAPI.getTimetable(),
    enabled: !!staffId && staffId !== 'undefined'
  });

  // Fetch teacher announcements
  const { data: announcementsData, isLoading: announcementsLoading } = useQuery({
    queryKey: ['teacherAnnouncements'],
    queryFn: () => teacherAPI.getAnnouncements(),
    enabled: !!staffId && staffId !== 'undefined'
  });

  // Fetch leave requests
  const { data: leaveRequestsData, isLoading: leaveRequestsLoading } = useQuery({
    queryKey: ['teacherLeaveRequests', staffId],
    queryFn: () => teacherAPI.getLeaveRequests(staffId),
    enabled: !!staffId && staffId !== 'undefined'
  });

  const isLoading = profileLoading || classesLoading || studentsLoading || parentsLoading || assignmentsLoading || timetableLoading || announcementsLoading || leaveRequestsLoading;

  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item}>
            <Card>
              <CardContent>
                <Skeleton variant="rectangular" height={60} />
                <Skeleton variant="text" sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  // Calculate dashboard statistics from real data
  const stats = {
    totalClasses: classesData?.length || 0,
    totalStudents: studentsData?.length || 0,
    totalParents: parentsData?.length || 0,
    upcomingClasses: (timetableData || []).filter(cls => new Date(cls.startTime) > new Date()).length || 0,
    pendingAssignments: (assignmentsData || []).filter(assignment => assignment.status === 'active').length || 0,
    pendingLeaveRequests: (leaveRequestsData || []).filter(request => request.status === 'pending').length || 0,
    averageAttendance: 85, // This would need to be calculated from attendance data
    averageGrade: 78, // This would need to be calculated from grades data
    assignmentsCompleted: 65, // This would need to be calculated from assignment submissions
    studentSatisfaction: 4.2 // This would need to be fetched from feedback data
  };

  const teacherName = profileData?.name || user?.name || 'Teacher';
  const teacherRole = profileData?.role || user?.role || 'Teacher';
  const teacherDepartment = profileData?.department?.name || profileData?.department || 'Department';

  return (
    <Box>
      {/* Welcome Section */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Welcome back, {teacherName}! 👋
          </Typography>
          <Typography variant="body1">
            Here's what's happening in your coordinated classes today
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
            {teacherRole} • {teacherDepartment}
          </Typography>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.3s ease' }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalClasses}
                  </Typography>
                  <Typography variant="body2">Coordinated Classes</Typography>
                </Box>
                <School sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.3s ease' }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalStudents}
                  </Typography>
                  <Typography variant="body2">Coordinated Students</Typography>
                </Box>
                <Group sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white',
            '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.3s ease' }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalParents}
                  </Typography>
                  <Typography variant="body2">Coordinated Parents</Typography>
                </Box>
                <SupervisorAccount sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: 'white',
            '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.3s ease' }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.pendingLeaveRequests}
                  </Typography>
                  <Typography variant="body2">Pending Leave Requests</Typography>
                </Box>
                <Warning sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Coordinated Classes Overview */}
      {classesData && classesData.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardHeader 
            title="Coordinated Classes" 
            action={
              <Button variant="outlined" startIcon={<Visibility />}>
                View All
              </Button>
            }
          />
          <CardContent>
            <Grid container spacing={2}>
              {classesData.slice(0, 4).map((cls, index) => (
                <Grid item xs={12} sm={6} md={3} key={cls._id || index}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {cls.name || `${cls.grade} ${cls.section}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Students: {cls.studentCount || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Capacity: {cls.capacity || 'N/A'}
                    </Typography>
                    {cls.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {cls.description}
                      </Typography>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Recent Students */}
      {studentsData && studentsData.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardHeader 
            title="Recent Students" 
            action={
              <Button variant="outlined" startIcon={<Visibility />}>
                View All
              </Button>
            }
          />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Roll Number</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Section</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentsData.slice(0, 5).map((student, index) => (
                    <TableRow key={student._id || index}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                            {student.name?.charAt(0) || 'S'}
                          </Avatar>
                          {student.name}
                        </Box>
                      </TableCell>
                      <TableCell>{student.rollNumber}</TableCell>
                      <TableCell>{student.class}</TableCell>
                      <TableCell>{student.section}</TableCell>
                      <TableCell>
                        <Chip 
                          label={student.status || 'Active'} 
                          color={student.status === 'Active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Leave Requests */}
      {leaveRequestsData && leaveRequestsData.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardHeader 
            title="Recent Leave Requests" 
            action={
              <Button variant="outlined" startIcon={<Visibility />}>
                View All
              </Button>
            }
          />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>From</TableCell>
                    <TableCell>To</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaveRequestsData.slice(0, 5).map((request, index) => (
                    <TableRow key={request._id || index}>
                      <TableCell>
                        {request.studentId?.name || 'Unknown Student'}
                      </TableCell>
                      <TableCell>{request.leaveType || request.type || 'General'}</TableCell>
                      <TableCell>{new Date(request.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(request.endDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label={request.status} 
                          color={
                            request.status === 'approved' ? 'success' : 
                            request.status === 'rejected' ? 'error' : 'warning'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {request.status === 'pending' && (
                          <Box>
                            <IconButton size="small" color="success">
                              <CheckCircle />
                            </IconButton>
                            <IconButton size="small" color="error">
                              <Cancel />
                            </IconButton>
                          </Box>
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

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Quick Actions" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<Assignment />}
                sx={{ mb: 1 }}
              >
                Create Assignment
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<Assessment />}
                sx={{ mb: 1 }}
              >
                Schedule Exam
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<Message />}
                sx={{ mb: 1 }}
              >
                Send Message
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<Upload />}
                sx={{ mb: 1 }}
              >
                Upload Resource
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

// Profile Management Component
function ProfileManagement() {
  const { user } = useAuth();
  const staffId = user?._id || user?.id; // Try both _id and id properties
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['teacherProfile', staffId],
    queryFn: () => teacherAPI.getProfile(staffId),
    enabled: !!staffId && staffId !== 'undefined'
  });

  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});

  useEffect(() => {
    if (profile) {
      setEditedProfile(profile);
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await teacherAPI.updateProfile(staffId, editedProfile);
      toast.success('Profile updated successfully');
      setEditMode(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  // Show error if no valid staffId
  if (!staffId || staffId === 'undefined') {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            Unable to load profile. User ID not found. Please try logging in again.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return <CircularProgress />;
  }

  const profileData = profile || {};

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="Profile Information" 
          action={
            <Button 
              variant={editMode ? "contained" : "outlined"}
              onClick={() => setEditMode(!editMode)}
              startIcon={editMode ? <CheckCircle /> : <Edit />}
            >
              {editMode ? 'Save' : 'Edit'}
            </Button>
          }
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Avatar 
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    mx: 'auto', 
                    mb: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                >
                  <Person sx={{ fontSize: 60 }} />
                </Avatar>
                <Typography variant="h6">{profileData.name}</Typography>
                <Typography variant="body2" color="textSecondary">{profileData.designation || profileData.role}</Typography>
                <Chip label={profileData.department?.name || profileData.department || 'Department'} color="primary" sx={{ mt: 1 }} />
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={editMode ? editedProfile.name : profileData.name}
                    onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={editMode ? editedProfile.email : profileData.email}
                    onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={editMode ? editedProfile.phone : profileData.phone}
                    onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Qualification"
                    value={editMode ? editedProfile.qualification : profileData.qualification}
                    onChange={(e) => setEditedProfile({...editedProfile, qualification: e.target.value})}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Bio"
                    value={editMode ? editedProfile.bio : profileData.bio}
                    onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                    disabled={!editMode}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Professional Development */}
      <Card>
        <CardHeader title="Professional Development" />
        <CardContent>
          <List>
            {profileData.professionalDevelopment?.map((dev, index) => (
              <ListItem key={dev.id || index}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <School />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={dev.title}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {dev.institution}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {dev.date} • {dev.duration}
                      </Typography>
                    </>
                  }
                />
                <IconButton>
                  <Download />
                </IconButton>
              </ListItem>
            ))}
            {(!profileData.professionalDevelopment || profileData.professionalDevelopment.length === 0) && (
              <ListItem>
                <ListItemText primary="No professional development records" />
              </ListItem>
            )}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}

// Classes Management Component
function ClassesManagement() {
  const { user } = useAuth();
  const staffId = user?._id || user?.id; // Try both _id and id properties
  const [selectedClass, setSelectedClass] = useState(null);
  const [showClassDetails, setShowClassDetails] = useState(false);

  // Show error if no valid staffId
  if (!staffId || staffId === 'undefined') {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            Unable to load classes. User ID not found. Please try logging in again.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Fetch coordinated classes
  const { data: classesData, isLoading: classesLoading, refetch: refetchClasses } = useQuery({
    queryKey: ['teacherClasses', staffId],
    queryFn: () => teacherAPI.getClasses(staffId),
    enabled: !!staffId && staffId !== 'undefined'
  });

  // Fetch coordinated students
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['teacherStudents', staffId],
    queryFn: () => teacherAPI.getStudents(staffId),
    enabled: !!staffId && staffId !== 'undefined'
  });

  const handleClassClick = (cls) => {
    setSelectedClass(cls);
    setShowClassDetails(true);
  };

  const handleCloseClassDetails = () => {
    setShowClassDetails(false);
    setSelectedClass(null);
  };

  if (classesLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Coordinated Classes Management
      </Typography>
      
      {classesData && classesData.length > 0 ? (
        <Grid container spacing={3}>
          {classesData.map((cls, index) => (
            <Grid item xs={12} sm={6} md={4} key={cls._id || index}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { 
                    transform: 'translateY(-4px)', 
                    boxShadow: 4,
                    transition: 'all 0.3s ease'
                  }
                }}
                onClick={() => handleClassClick(cls)}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="h6" color="primary">
                      {cls.name || `${cls.grade} ${cls.section}`}
                    </Typography>
                    <Chip 
                      label={`${cls.studentCount || 0} students`}
                      color="primary"
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Capacity:</strong> {cls.capacity || 'N/A'}
                  </Typography>
                  
                  {cls.description && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {cls.description}
                    </Typography>
                  )}
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <Typography variant="caption" color="text.secondary">
                      Class ID: {cls._id}
                    </Typography>
                    <IconButton size="small">
                      <Visibility />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" textAlign="center" color="text.secondary">
              No coordinated classes found
            </Typography>
            <Typography variant="body2" textAlign="center" color="text.secondary">
              You haven't been assigned to coordinate any classes yet.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Class Details Dialog */}
      <Dialog 
        open={showClassDetails} 
        onClose={handleCloseClassDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedClass && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">
                  {selectedClass.name || `${selectedClass.grade} ${selectedClass.section}`} - Class Details
                </Typography>
                <IconButton onClick={handleCloseClassDetails}>
                  <Cancel />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardHeader title="Class Information" />
                    <CardContent>
                      <Typography variant="body1" gutterBottom>
                        <strong>Name:</strong> {selectedClass.name || `${selectedClass.grade} ${selectedClass.section}`}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Grade:</strong> {selectedClass.grade}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Section:</strong> {selectedClass.section}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Capacity:</strong> {selectedClass.capacity || 'N/A'}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Current Students:</strong> {selectedClass.studentCount || 0}
                      </Typography>
                      {selectedClass.description && (
                        <Typography variant="body1" gutterBottom>
                          <strong>Description:</strong> {selectedClass.description}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardHeader title="Students in this Class" />
                    <CardContent>
                      {studentsLoading ? (
                        <CircularProgress size={20} />
                      ) : studentsData && studentsData.length > 0 ? (
                        <List dense>
                          {(studentsData || [])
                            .filter(student => 
                              student.class === selectedClass.name || 
                              (student.class === selectedClass.grade && student.section === selectedClass.section)
                            )
                            .slice(0, 5)
                            .map((student, index) => (
                              <ListItem key={student._id || index}>
                                <ListItemAvatar>
                                  <Avatar sx={{ width: 32, height: 32 }}>
                                    {student.name?.charAt(0) || 'S'}
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={student.name}
                                  secondary={`Roll: ${student.rollNumber} | Status: ${student.status || 'Active'}`}
                                />
                              </ListItem>
                            ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No students found in this class
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseClassDetails}>Close</Button>
              <Button variant="contained" startIcon={<Assignment />}>
                Manage Assignments
              </Button>
              <Button variant="contained" startIcon={<Assessment />}>
                View Attendance
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

// Students Management Component
function StudentsManagement() {
  const { user } = useAuth();
  const staffId = user?._id || user?.id; // Try both _id and id properties
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');

  // Show error if no valid staffId
  if (!staffId || staffId === 'undefined') {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            Unable to load students. User ID not found. Please try logging in again.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Fetch coordinated students
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['teacherStudents', staffId],
    queryFn: () => teacherAPI.getStudents(staffId),
    enabled: !!staffId && staffId !== 'undefined'
  });

  // Fetch coordinated classes for filtering
  const { data: classesData, isLoading: classesLoading } = useQuery({
    queryKey: ['teacherClasses', staffId],
    queryFn: () => teacherAPI.getClasses(staffId),
    enabled: !!staffId && staffId !== 'undefined'
  });

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setShowStudentDetails(true);
  };

  const handleCloseStudentDetails = () => {
    setShowStudentDetails(false);
    setSelectedStudent(null);
  };

  // Filter students based on search term and class
  const filteredStudents = (studentsData || []).filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'all' || student.class === filterClass;
    return matchesSearch && matchesClass;
  });

  if (studentsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Coordinated Students Management
      </Typography>

      {/* Search and Filter Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search students"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filter by Class</InputLabel>
                <Select
                  value={filterClass}
                  label="Filter by Class"
                  onChange={(e) => setFilterClass(e.target.value)}
                >
                  <MenuItem value="all">All Classes</MenuItem>
                  {classesData?.map((cls) => (
                    <MenuItem key={cls._id} value={cls.name || `${cls.grade} ${cls.section}`}>
                      {cls.name || `${cls.grade} ${cls.section}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => {
                  setSearchTerm('');
                  setFilterClass('all');
                }}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Students Grid */}
      {filteredStudents.length > 0 ? (
        <Grid container spacing={3}>
          {filteredStudents.map((student, index) => (
            <Grid item xs={12} sm={6} md={4} key={student._id || index}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { 
                    transform: 'translateY(-4px)', 
                    boxShadow: 4,
                    transition: 'all 0.3s ease'
                  }
                }}
                onClick={() => handleStudentClick(student)}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ mr: 2, width: 48, height: 48 }}>
                      {student.name?.charAt(0) || 'S'}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6" gutterBottom>
                        {student.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Roll: {student.rollNumber}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Class: {student.class}
                    </Typography>
                    <Chip 
                      label={student.status || 'Active'} 
                      color={student.status === 'Active' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Section: {student.section}
                  </Typography>
                  
                  {student.gender && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Gender: {student.gender}
                    </Typography>
                  )}
                  
                  {student.contactNumber && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Contact: {student.contactNumber}
                    </Typography>
                  )}
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <Typography variant="caption" color="text.secondary">
                      Student ID: {student._id}
                    </Typography>
                    <IconButton size="small">
                      <Visibility />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" textAlign="center" color="text.secondary">
              {searchTerm || filterClass !== 'all' ? 'No students found matching your criteria' : 'No coordinated students found'}
            </Typography>
            <Typography variant="body2" textAlign="center" color="text.secondary">
              {searchTerm || filterClass !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'You haven\'t been assigned to coordinate any students yet.'
              }
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Student Details Dialog */}
      <Dialog 
        open={showStudentDetails} 
        onClose={handleCloseStudentDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedStudent && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">
                  {selectedStudent.name} - Student Details
                </Typography>
                <IconButton onClick={handleCloseStudentDetails}>
                  <Cancel />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardHeader title="Personal Information" />
                    <CardContent>
                      <Typography variant="body1" gutterBottom>
                        <strong>Name:</strong> {selectedStudent.name}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Roll Number:</strong> {selectedStudent.rollNumber}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Class:</strong> {selectedStudent.class}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Section:</strong> {selectedStudent.section}
                      </Typography>
                      {selectedStudent.gender && (
                        <Typography variant="body1" gutterBottom>
                          <strong>Gender:</strong> {selectedStudent.gender}
                        </Typography>
                      )}
                      {selectedStudent.dateOfBirth && (
                        <Typography variant="body1" gutterBottom>
                          <strong>Date of Birth:</strong> {new Date(selectedStudent.dateOfBirth).toLocaleDateString()}
                        </Typography>
                      )}
                      <Typography variant="body1" gutterBottom>
                        <strong>Status:</strong> 
                        <Chip 
                          label={selectedStudent.status || 'Active'} 
                          color={selectedStudent.status === 'Active' ? 'success' : 'default'}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardHeader title="Contact Information" />
                    <CardContent>
                      {selectedStudent.email && (
                        <Typography variant="body1" gutterBottom>
                          <strong>Email:</strong> {selectedStudent.email}
                        </Typography>
                      )}
                      {selectedStudent.contactNumber && (
                        <Typography variant="body1" gutterBottom>
                          <strong>Contact Number:</strong> {selectedStudent.contactNumber}
                        </Typography>
                      )}
                      {selectedStudent.address && (
                        <Typography variant="body1" gutterBottom>
                          <strong>Address:</strong> {selectedStudent.address}
                        </Typography>
                      )}
                      {selectedStudent.emergencyContact && (
                        <Typography variant="body1" gutterBottom>
                          <strong>Emergency Contact:</strong> {selectedStudent.emergencyContact}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseStudentDetails}>Close</Button>
              <Button variant="contained" startIcon={<Assessment />}>
                View Performance
              </Button>
              <Button variant="contained" startIcon={<Message />}>
                Contact Parent
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

// Coordinator Portal Component
function CoordinatorPortal() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [parentDialogOpen, setParentDialogOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await staffAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setStudentDialogOpen(true);
  };
  const handleParentClick = (parent) => {
    setSelectedParent(parent);
    setParentDialogOpen(true);
  };
  const handleApproveLeave = async (leaveId) => {
    await staffAPI.updateLeaveRequest(leaveId, { status: 'Approved' });
    fetchDashboardData();
  };
  const handleRejectLeave = async (leaveId) => {
    await staffAPI.updateLeaveRequest(leaveId, { status: 'Rejected' });
    fetchDashboardData();
  };

  if (loading) return <CircularProgress />;
  if (!dashboardData) return <Alert severity="error">No coordinator data</Alert>;

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        <SupervisorAccount sx={{ mr: 1, verticalAlign: 'middle' }} />
        Class Coordinator Portal
      </Typography>
      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><Class color="primary" /><Typography variant="h6" sx={{ ml: 1 }}>Coordinated Classes</Typography></Box><Typography variant="h4" color="primary">{dashboardData.stats?.classes || 0}</Typography><Typography variant="body2" color="text.secondary">Classes under your coordination</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><People color="success" /><Typography variant="h6" sx={{ ml: 1 }}>Total Students</Typography></Box><Typography variant="h4" color="success">{dashboardData.stats?.students || 0}</Typography><Typography variant="body2" color="text.secondary">Students in your classes</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><Group color="info" /><Typography variant="h6" sx={{ ml: 1 }}>Connected Parents</Typography></Box><Typography variant="h4" color="info">{dashboardData.stats?.parents || 0}</Typography><Typography variant="body2" color="text.secondary">Parents of your students</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><Assignment color="error" /><Typography variant="h6" sx={{ ml: 1 }}>Pending Requests</Typography></Box><Typography variant="h4" color="error">{dashboardData.stats?.pendingLeaveRequests || 0}</Typography><Typography variant="body2" color="text.secondary">Leave requests to review</Typography></CardContent></Card>
        </Grid>
      </Grid>
      {/* Accordions for Classes, Leave Requests, Students, Parents, Events */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}><Typography variant="h6"><School sx={{ mr: 1, verticalAlign: 'middle' }} />Coordinated Classes</Typography></AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>{dashboardData.coordinatedClasses?.map((cls) => (<Grid item xs={12} key={cls._id}><Card variant="outlined"><CardContent><Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><School color="primary" sx={{ mr: 1 }} /><Typography variant="h6">{cls.name}</Typography></Box><Typography variant="body2" color="text.secondary" gutterBottom>Grade: {cls.grade} | Section: {cls.section}</Typography><Typography variant="body2" color="text.secondary">Capacity: {cls.capacity || 'N/A'}</Typography>{cls.description && (<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{cls.description}</Typography>)}</CardContent></Card></Grid>))}</Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
        <Grid item xs={12} md={6}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}><Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}><Typography variant="h6"><Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />Leave Requests</Typography>{dashboardData.stats?.pendingLeaveRequests > 0 && (<Badge badgeContent={dashboardData.stats.pendingLeaveRequests} color="error" sx={{ ml: 'auto' }} />)}</Box></AccordionSummary>
            <AccordionDetails>
              <TableContainer><Table size="small"><TableHead><TableRow><TableCell>Student</TableCell><TableCell>Type</TableCell><TableCell>Dates</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell></TableRow></TableHead><TableBody>{dashboardData.pendingLeaveRequests?.map((request) => (<TableRow key={request._id}><TableCell><Box><Typography variant="body2" fontWeight="bold">{request.studentId?.name || request.studentName}</Typography><Typography variant="caption" color="text.secondary">{request.studentId?.class || request.studentClass} - {request.studentId?.section || request.studentSection}</Typography></Box></TableCell><TableCell>{request.leaveType || request.type || 'General'}</TableCell><TableCell><Typography variant="caption">{new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}</Typography></TableCell><TableCell><Chip label={request.status} color={request.status === 'Approved' ? 'success' : request.status === 'Rejected' ? 'error' : 'warning'} size="small" /></TableCell><TableCell>{request.status === 'Pending' && (<Box><Tooltip title="Approve"><IconButton size="small" color="success" onClick={() => handleApproveLeave(request._id)} sx={{ mr: 1 }}><CheckCircle /></IconButton></Tooltip><Tooltip title="Reject"><IconButton size="small" color="error" onClick={() => handleRejectLeave(request._id)}><Cancel /></IconButton></Tooltip></Box>)}</TableCell></TableRow>))}{(!dashboardData.pendingLeaveRequests || dashboardData.pendingLeaveRequests.length === 0) && (<TableRow><TableCell colSpan={5} align="center">No pending leave requests</TableCell></TableRow>)}</TableBody></Table></TableContainer>
            </AccordionDetails>
          </Accordion>
        </Grid>
        <Grid item xs={12} md={6}>
          <Accordion><AccordionSummary expandIcon={<ExpandMore />}><Typography variant="h6"><People sx={{ mr: 1, verticalAlign: 'middle' }} />Students ({dashboardData.students?.length || 0})</Typography></AccordionSummary><AccordionDetails><TableContainer><Table size="small"><TableHead><TableRow><TableCell>Name</TableCell><TableCell>Roll Number</TableCell><TableCell>Class</TableCell><TableCell>Actions</TableCell></TableRow></TableHead><TableBody>{dashboardData.students?.slice(0, 10).map((student) => (<TableRow key={student._id}><TableCell><Box sx={{ display: 'flex', alignItems: 'center' }}><Avatar sx={{ mr: 2, width: 24, height: 24 }}>{student.name?.charAt(0)}</Avatar>{student.name}</Box></TableCell><TableCell>{student.rollNumber}</TableCell><TableCell>{student.class} - {student.section}</TableCell><TableCell><Tooltip title="View Details"><IconButton size="small" onClick={() => handleStudentClick(student)}><Visibility /></IconButton></Tooltip></TableCell></TableRow>))}{dashboardData.students?.length > 10 && (<TableRow><TableCell colSpan={4} align="center"><Typography variant="body2" color="text.secondary">Showing first 10 students. Total: {dashboardData.students.length}</Typography></TableCell></TableRow>)}</TableBody></Table></TableContainer></AccordionDetails></Accordion>
        </Grid>
        <Grid item xs={12} md={6}>
          <Accordion><AccordionSummary expandIcon={<ExpandMore />}><Typography variant="h6"><Group sx={{ mr: 1, verticalAlign: 'middle' }} />Parents ({dashboardData.parents?.length || 0})</Typography></AccordionSummary><AccordionDetails><TableContainer><Table size="small"><TableHead><TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Contact</TableCell><TableCell>Actions</TableCell></TableRow></TableHead><TableBody>{dashboardData.parents?.slice(0, 10).map((parent) => (<TableRow key={parent._id}><TableCell><Box sx={{ display: 'flex', alignItems: 'center' }}><Avatar sx={{ mr: 2, width: 24, height: 24 }}>{parent.name?.charAt(0)}</Avatar>{parent.name}</Box></TableCell><TableCell>{parent.email}</TableCell><TableCell>{parent.contactNumber || 'N/A'}</TableCell><TableCell><Tooltip title="View Details"><IconButton size="small" onClick={() => handleParentClick(parent)}><Visibility /></IconButton></Tooltip></TableCell></TableRow>))}{dashboardData.parents?.length > 10 && (<TableRow><TableCell colSpan={4} align="center"><Typography variant="body2" color="text.secondary">Showing first 10 parents. Total: {dashboardData.parents.length}</Typography></TableCell></TableRow>)}</TableBody></Table></TableContainer></AccordionDetails></Accordion>
        </Grid>
        <Grid item xs={12}>
          <Accordion><AccordionSummary expandIcon={<ExpandMore />}><Typography variant="h6"><Event sx={{ mr: 1, verticalAlign: 'middle' }} />Class Events & Activities</Typography></AccordionSummary><AccordionDetails><Grid container spacing={3}><Grid item xs={12} md={6}><Typography variant="h6" gutterBottom>Today's Class Events</Typography><List>{dashboardData.todayEvents?.map((event, index) => (<Box key={index}><ListItem><ListItemIcon><CalendarToday color="primary" /></ListItemIcon><ListItemText primary={event.title} secondary={`${new Date(event.startDate).toLocaleTimeString()} - ${event.description}`} /><Chip label="Today" color="primary" size="small" /></ListItem>{index < dashboardData.todayEvents.length - 1 && <Divider />}</Box>))}{(!dashboardData.todayEvents || dashboardData.todayEvents.length === 0) && (<ListItem><ListItemText primary="No class events scheduled for today" /></ListItem>)}</List></Grid><Grid item xs={12} md={6}><Typography variant="h6" gutterBottom>Upcoming Class Events</Typography><List>{dashboardData.upcomingEvents?.map((event, index) => (<Box key={index}><ListItem><ListItemIcon><Event color="warning" /></ListItemIcon><ListItemText primary={event.title} secondary={`${new Date(event.startDate).toLocaleDateString()} - ${event.description}`} /><Chip label="Upcoming" color="warning" size="small" /></ListItem>{index < dashboardData.upcomingEvents.length - 1 && <Divider />}</Box>))}{(!dashboardData.upcomingEvents || dashboardData.upcomingEvents.length === 0) && (<ListItem><ListItemText primary="No upcoming class events" /></ListItem>)}</List></Grid></Grid></AccordionDetails></Accordion>
        </Grid>
      </Grid>
      {/* Student Details Dialog */}
      <Dialog open={studentDialogOpen} onClose={() => setStudentDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Student Details</DialogTitle>
        <DialogContent>{selectedStudent && (<Grid container spacing={2} sx={{ mt: 1 }}><Grid item xs={12} sm={6}><TextField fullWidth label="Name" value={selectedStudent.name || ''} InputProps={{ readOnly: true }} /></Grid><Grid item xs={12} sm={6}><TextField fullWidth label="Roll Number" value={selectedStudent.rollNumber || ''} InputProps={{ readOnly: true }} /></Grid><Grid item xs={12} sm={6}><TextField fullWidth label="Class" value={selectedStudent.class || ''} InputProps={{ readOnly: true }} /></Grid><Grid item xs={12} sm={6}><TextField fullWidth label="Section" value={selectedStudent.section || ''} InputProps={{ readOnly: true }} /></Grid><Grid item xs={12} sm={6}><TextField fullWidth label="Contact Number" value={selectedStudent.contactNumber || 'N/A'} InputProps={{ readOnly: true }} /></Grid><Grid item xs={12} sm={6}><TextField fullWidth label="Email" value={selectedStudent.email || 'N/A'} InputProps={{ readOnly: true }} /></Grid><Grid item xs={12}><TextField fullWidth label="Address" value={selectedStudent.address || 'N/A'} multiline rows={2} InputProps={{ readOnly: true }} /></Grid></Grid>)}</DialogContent><DialogActions><Button onClick={() => setStudentDialogOpen(false)}>Close</Button></DialogActions></Dialog>
      {/* Parent Details Dialog */}
      <Dialog open={parentDialogOpen} onClose={() => setParentDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Parent Details</DialogTitle>
        <DialogContent>{selectedParent && (<Grid container spacing={2} sx={{ mt: 1 }}><Grid item xs={12} sm={6}><TextField fullWidth label="Name" value={selectedParent.name || ''} InputProps={{ readOnly: true }} /></Grid><Grid item xs={12} sm={6}><TextField fullWidth label="Email" value={selectedParent.email || ''} InputProps={{ readOnly: true }} /></Grid><Grid item xs={12} sm={6}><TextField fullWidth label="Contact Number" value={selectedParent.contactNumber || 'N/A'} InputProps={{ readOnly: true }} /></Grid><Grid item xs={12} sm={6}><TextField fullWidth label="Children" value={selectedParent.childRollNumbers?.join(', ') || 'N/A'} InputProps={{ readOnly: true }} /></Grid><Grid item xs={12}><TextField fullWidth label="Address" value={selectedParent.address || 'N/A'} multiline rows={2} InputProps={{ readOnly: true }} /></Grid></Grid>)}</DialogContent><DialogActions><Button onClick={() => setParentDialogOpen(false)}>Close</Button></DialogActions></Dialog>
    </Box>
  );
}

// Main Teacher Dashboard Component
export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const staffId = user?._id || user?.id; // Try both _id and id properties

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <DashboardOverview />;
      case 1:
        return <ProfileManagement />;
      case 2:
        return <ClassesManagement />;
      case 3:
        return <Timetable />;
      case 4:
        return <Attendance />;
      case 5:
        return <Assignments />;
      case 6:
        return <Exams />;
      case 7:
        return <div>Grades Component</div>;
      case 8:
        return <StudentsManagement />;
      case 9:
        return <LeaveRequests />;
      case 10:
        return <TeacherLeaveRequests />;
      case 11:
        return <LearningResources />;
      case 12:
        return <div>Lesson Plans Component</div>;
      case 13:
        return <Communication />;
      case 14:
        return <div>Projects Component</div>;
      case 15:
        return <div>Parent Interaction Component</div>;
      case 16:
        return <div>Feedback Component</div>;
      case 17:
        return <div>Notifications Component</div>;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Teacher Dashboard
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton color="inherit">
              <Notifications />
            </IconButton>
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <Person fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Sidebar with Tabs */}
        <Box sx={{ width: 280, bgcolor: 'background.paper', borderRight: 1, borderColor: 'divider' }}>
          <Tabs
            orientation="vertical"
            value={activeTab}
            onChange={handleTabChange}
            sx={{ borderRight: 1, borderColor: 'divider', minHeight: 'calc(100vh - 64px)' }}
          >
            {featureTabs.map((tab, index) => (
              <Tab
                key={tab.key}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    {tab.icon}
                    {tab.label}
                  </Box>
                }
                sx={{
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  minHeight: 64,
                  '&.Mui-selected': {
                    bgcolor: 'action.selected',
                  },
                }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Content Area */}
        <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
          {renderTabContent()}
        </Box>
      </Box>
    </Box>
  );
}
// ... existing code ...
