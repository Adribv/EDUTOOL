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
} from '@mui/icons-material';
import studentService from '../../services/studentService';
import { toast } from 'react-toastify';

const Dashboard = () => {
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
      ] = await Promise.all([
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
      ]);

      setProfile(profileRes.data);
      setSubjects(subjectsRes.data?.subjects || []);
      setAssignments(assignmentsRes.data || []);
      setAnnouncements(announcementsRes.data || []);
      setPerformance(performanceRes.data);
      setAttendance(attendanceRes.data || []);
      setUpcomingExams(examsRes.data || []);
      setMessages(messagesRes.data || []);
      setHomework(homeworkRes.data || []);
      setFeeStatus(feeRes.data);
      setLearningResources(resourcesRes.data || []);
      setLeaveRequests(leaveRes.data || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
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

  // Navigation cards for different student features
  const navigationCards = [
    {
      title: 'Assignments',
      description: 'View and submit homework assignments',
      icon: <Assignment color="primary" sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      path: '/student/assignments',
      count: assignments.filter(a => a.status === 'pending').length,
    },
    {
      title: 'Homework',
      description: 'Access and submit homework tasks',
      icon: <Book color="primary" sx={{ fontSize: 40 }} />,
      color: '#388e3c',
      path: '/student/homework',
      count: homework.filter(h => h.status === 'pending').length,
    },
    {
      title: 'Exam Results',
      description: 'View your examination results and grades',
      icon: <Grade color="primary" sx={{ fontSize: 40 }} />,
      color: '#f57c00',
      path: '/student/examinations',
      count: upcomingExams.length,
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
      count: learningResources.length,
    },
    {
      title: 'Communication',
      description: 'Connect with teachers and classmates',
      icon: <Forum color="primary" sx={{ fontSize: 40 }} />,
      color: '#f57c00',
      path: '/student/communication',
      count: messages.filter(m => !m.read).length,
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
      count: leaveRequests.filter(l => l.status === 'pending').length,
    },
    {
      title: 'Profile Settings',
      description: 'Manage your personal information',
      icon: <Settings color="primary" sx={{ fontSize: 40 }} />,
      color: '#5d4037',
      path: '/student/profile',
    },
  ];

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

  const ListCard = ({ title, items, icon, emptyMessage = "No items to display" }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          {icon}
          <Typography variant="h6" component="div" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        {items.length > 0 ? (
          <List>
            {items.map((item, index) => (
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
                {index < items.length - 1 && <Divider />}
              </div>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
            {emptyMessage}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

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

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar
              sx={{ width: 80, height: 80, mr: 3 }}
              src={profile?.profilePicture}
            >
              {profile?.name?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h4" gutterBottom>
                Welcome back, {profile?.name || 'Student'}!
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Student ID: {profile?.studentId} | Class: {profile?.class} {profile?.section}
              </Typography>
              {performance?.averageGrade && (
                <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                  Current Average: {performance.averageGrade}%
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* Statistics Cards */}
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Quick Overview
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending Assignments"
              value={assignments.filter(a => a.status === 'pending').length}
              icon={<Assignment color="primary" />}
              subtitle="Due soon"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Upcoming Exams"
              value={upcomingExams.length}
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
              value={messages.filter(m => !m.read).length}
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
              items={assignments.slice(0, 5)}
              icon={<Assignment color="primary" />}
              emptyMessage="No recent assignments"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ListCard
              title="Recent Announcements"
              items={announcements.slice(0, 5)}
              icon={<Notifications color="primary" />}
              emptyMessage="No recent announcements"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ListCard
              title="Upcoming Exams"
              items={upcomingExams.slice(0, 5)}
              icon={<School color="primary" />}
              emptyMessage="No upcoming exams"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ListCard
              title="Recent Messages"
              items={messages.slice(0, 5)}
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
                          {subjects.length}
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
                          {attendance.filter(a => a.status === 'present').length}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Absent Days
                        </Typography>
                        <Typography variant="h4" color="error.main">
                          {attendance.filter(a => a.status === 'absent').length}
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
    </Container>
  );
};

export default Dashboard; 