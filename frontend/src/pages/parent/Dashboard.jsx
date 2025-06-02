import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  Avatar,
  Chip,
  Button,
} from '@mui/material';
import {
  School as SchoolIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { parentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const ParentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [academicProgress, setAcademicProgress] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [childrenRes, eventsRes, notificationsRes, attendanceRes, progressRes] = await Promise.all([
        parentAPI.getChildren(),
        parentAPI.getUpcomingEvents(),
        parentAPI.getNotifications(),
        parentAPI.getAttendance(),
        parentAPI.getAcademicProgress(),
      ]);

      setChildren(childrenRes.data);
      setUpcomingEvents(eventsRes.data);
      setNotifications(notificationsRes.data);
      setAttendance(attendanceRes.data);
      setAcademicProgress(progressRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 75) return 'warning';
    return 'error';
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Parent Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Children Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="My Children"
              action={
                <IconButton>
                  <PersonIcon />
                </IconButton>
              }
            />
            <CardContent>
              <List>
                {children.map((child) => (
                  <ListItem key={child.id}>
                    <ListItemIcon>
                      <Avatar src={child.avatar}>{child.name[0]}</Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={child.name}
                      secondary={`Class ${child.class} - Roll No: ${child.rollNumber}`}
                    />
                    <Chip
                      label={`${attendance[child.id]?.percentage || 0}% Attendance`}
                      color={getAttendanceColor(attendance[child.id]?.percentage || 0)}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Academic Progress */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Academic Progress"
              action={
                <IconButton>
                  <TrendingUpIcon />
                </IconButton>
              }
            />
            <CardContent>
              {children.map((child) => (
                <Box key={child.id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {child.name}
                  </Typography>
                  {Object.entries(academicProgress[child.id] || {}).map(([subject, progress]) => (
                    <Box key={subject} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">{subject}</Typography>
                        <Typography variant="body2">{progress}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        color={getProgressColor(progress)}
                      />
                    </Box>
                  ))}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Events */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Upcoming Events"
              action={
                <IconButton>
                  <EventIcon />
                </IconButton>
              }
            />
            <CardContent>
              <List>
                {upcomingEvents.map((event) => (
                  <ListItem key={event.id}>
                    <ListItemIcon>
                      <CalendarIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={event.title}
                      secondary={`${new Date(event.date).toLocaleDateString()} - ${event.time}`}
                    />
                    <Chip label={event.type} size="small" />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Recent Notifications"
              action={
                <IconButton>
                  <NotificationsIcon />
                </IconButton>
              }
            />
            <CardContent>
              <List>
                {notifications.map((notification) => (
                  <ListItem key={notification.id}>
                    <ListItemIcon>
                      {notification.type === 'assignment' && <AssignmentIcon color="primary" />}
                      {notification.type === 'event' && <EventIcon color="primary" />}
                      {notification.type === 'academic' && <SchoolIcon color="primary" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={notification.title}
                      secondary={notification.message}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(notification.date).toLocaleDateString()}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Quick Actions" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item>
                  <Button
                    variant="outlined"
                    startIcon={<AssignmentIcon />}
                    onClick={() => {/* Handle view assignments */}}
                  >
                    View Assignments
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    startIcon={<SchoolIcon />}
                    onClick={() => {/* Handle view progress */}}
                  >
                    View Progress Reports
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    startIcon={<EventIcon />}
                    onClick={() => {/* Handle view calendar */}}
                  >
                    View Calendar
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    startIcon={<NotificationsIcon />}
                    onClick={() => {/* Handle view notifications */}}
                  >
                    View All Notifications
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ParentDashboard; 