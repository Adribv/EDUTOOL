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
  VolumeUp, VolumeOff, Fullscreen, FullscreenExit, ZoomIn, ZoomOut, RotateLeft, RotateRight
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import teacherService from '../../services/teacherService';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Timetable from './Timetable';
import Assignments from './Assignments';
import Students from './Students';

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
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => teacherService.getDashboardStats()
  });

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

  if (error) {
    return <Alert severity="error">Failed to load dashboard data</Alert>;
  }

  const stats = dashboardData?.data || {};

  return (
    <Box>
      {/* Welcome Section */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Welcome back, Dr. Sarah Wilson! 👋
          </Typography>
          <Typography variant="body1">
            Here's what's happening in your classes today
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
                    {stats.totalClasses || 0}
                  </Typography>
                  <Typography variant="body2">Total Classes</Typography>
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
                    {stats.totalStudents || 0}
                  </Typography>
                  <Typography variant="body2">Total Students</Typography>
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
                    {stats.upcomingClasses || 0}
                  </Typography>
                  <Typography variant="body2">Upcoming Classes</Typography>
                </Box>
                <Event sx={{ fontSize: 40, opacity: 0.8 }} />
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
                    {stats.pendingAssignments || 0}
                  </Typography>
                  <Typography variant="body2">Pending Assignments</Typography>
                </Box>
                <Assignment sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Metrics */}
      {stats.performanceMetrics && (
        <Card sx={{ mb: 3 }}>
          <CardHeader 
            title="Performance Metrics" 
            action={
              <IconButton>
                <TrendingUp />
              </IconButton>
            }
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h6" color="primary">
                    {stats.performanceMetrics.averageAttendance}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Average Attendance
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats.performanceMetrics.averageAttendance} 
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h6" color="primary">
                    {stats.performanceMetrics.averageGrade}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Average Grade
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats.performanceMetrics.averageGrade} 
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h6" color="primary">
                    {stats.performanceMetrics.assignmentsCompleted}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Assignments Completed
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats.performanceMetrics.assignmentsCompleted} 
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Rating 
                    value={stats.performanceMetrics.studentSatisfaction} 
                    readOnly 
                    precision={0.1}
                  />
                  <Typography variant="body2" color="textSecondary">
                    Student Satisfaction
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Recent Announcements" 
              action={
                <IconButton>
                  <MoreVert />
                </IconButton>
              }
            />
            <CardContent>
              <List>
                {stats.recentAnnouncements?.map((announcement, index) => (
                  <Box key={announcement.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: announcement.priority === 'high' ? 'error.main' : 'primary.main' }}>
                          <Notifications />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            {announcement.title}
                            <Chip 
                              label={announcement.priority} 
                              size="small" 
                              color={announcement.priority === 'high' ? 'error' : 'default'}
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {announcement.content}
                            </Typography>
                            <Typography variant="caption" display="block" color="text.secondary">
                              {announcement.date}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < stats.recentAnnouncements.length - 1 && <Divider variant="inset" component="li" />}
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Upcoming Events" 
              action={
                <IconButton>
                  <MoreVert />
                </IconButton>
              }
            />
            <CardContent>
              <List>
                {stats.upcomingEvents?.map((event, index) => (
                  <Box key={event.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          <Event />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={event.title}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {event.date} at {event.time}
                            </Typography>
                            <Typography variant="caption" display="block" color="text.secondary">
                              {event.location}
                            </Typography>
                          </>
                        }
                      />
                      <IconButton size="small">
                        <AccessTime />
                      </IconButton>
                    </ListItem>
                    {index < stats.upcomingEvents.length - 1 && <Divider variant="inset" component="li" />}
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

// Profile Management Component
function ProfileManagement() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => teacherService.getProfile()
  });

  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});

  useEffect(() => {
    if (profile?.data) {
      setEditedProfile(profile.data);
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await teacherService.updateProfile(editedProfile);
      toast.success('Profile updated successfully');
      setEditMode(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  const profileData = profile?.data || {};

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
                <Typography variant="body2" color="textSecondary">{profileData.designation}</Typography>
                <Chip label={profileData.department} color="primary" sx={{ mt: 1 }} />
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
              <ListItem key={dev.id}>
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
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}

// Classes Management Component
function ClassesManagement() {
  const { data: classes, isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: () => teacherService.getClasses()
  });

  const [selectedClass, setSelectedClass] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  if (isLoading) {
    return <CircularProgress />;
  }

  const classesData = classes?.data || [];

  return (
    <Box>
      <Card>
        <CardHeader 
          title="Class Management" 
          action={
            <Button variant="contained" startIcon={<Add />}>
              Add New Class
            </Button>
          }
        />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Class Name</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Room</TableCell>
                  <TableCell>Schedule</TableCell>
                  <TableCell>Students</TableCell>
                  <TableCell>Avg Grade</TableCell>
                  <TableCell>Attendance</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classesData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((cls) => (
                  <TableRow key={cls.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{cls.name}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          Grade {cls.grade} - Section {cls.section}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={cls.subject} size="small" color="primary" />
                    </TableCell>
                    <TableCell>{cls.room}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{cls.schedule}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box textAlign="center">
                        <Typography variant="h6">{cls.totalStudents}</Typography>
                        <Typography variant="caption">students</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box textAlign="center">
                        <Typography variant="h6" color="primary">
                          {cls.averageGrade}%
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={cls.averageGrade} 
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box textAlign="center">
                        <Typography variant="h6" color="success.main">
                          {cls.attendanceRate}%
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={cls.attendanceRate} 
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton size="small" color="primary">
                          <Visibility />
                        </IconButton>
                        <IconButton size="small" color="secondary">
                          <Edit />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={classesData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </CardContent>
      </Card>
    </Box>
  );
}

// Main Dashboard Component
export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Fetch notifications
  useEffect(() => {
    teacherService.getNotifications().then(res => {
      setNotifications(res.data);
    });
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

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
        return <div>Attendance Component</div>;
      case 5:
        return <Assignments />;
      case 6:
        return <div>Exams Component</div>;
      case 7:
        return <div>Grades Component</div>;
      case 8:
        return <Students />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Bar */}
      <AppBar position="static" sx={{ mb: 3 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Teacher Dashboard
          </Typography>
          
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton color="inherit" onClick={() => setNotificationsOpen(true)}>
              <Badge badgeContent={unreadNotifications} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            
            <IconButton color="inherit">
              <AccountCircle />
            </IconButton>
            
            <IconButton color="inherit" onClick={handleLogout}>
              <Logout />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ p: 3 }}>
        {/* Tabs */}
        <Card sx={{ mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            {featureTabs.map((tab, index) => (
              <Tab 
                key={tab.key}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
                sx={{ minHeight: 64 }}
              />
            ))}
          </Tabs>
        </Card>

        {/* Tab Content */}
        <Box sx={{ mt: 3 }}>
          {renderTabContent()}
        </Box>
      </Box>

      {/* Notifications Drawer */}
      <Drawer
        anchor="right"
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      >
        <Box sx={{ width: 350, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Notifications
          </Typography>
          <List>
            {notifications.map((notification) => (
              <ListItem key={notification.id}>
                <ListItemAvatar>
                  <Avatar sx={{ 
                    bgcolor: notification.read ? 'grey.300' : 'primary.main',
                    color: notification.read ? 'grey.600' : 'white'
                  }}>
                    <Notifications />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={notification.title}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {notification.content}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {new Date(notification.date).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Floating Action Button */}
      <Fab 
        color="primary" 
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <Add />
      </Fab>
    </Box>
  );
}
// ... existing code ...
