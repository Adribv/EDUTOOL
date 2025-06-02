import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Class,
  Assignment,
  School,
  People,
  Event,
  Notifications,
} from '@mui/icons-material';
import { staffAPI } from '../../services/api';
import { toast } from 'react-toastify';

const StaffDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    classes: 0,
    students: 0,
    assignments: {
      pending: 0,
      graded: 0,
    },
    exams: {
      upcoming: 0,
      completed: 0,
    },
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await staffAPI.getDashboard();
      const { stats: dashboardStats, recentActivities: activities, notifications: notifs } = response.data;
      setStats(dashboardStats);
      setRecentActivities(activities);
      setNotifications(notifs);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" color={color}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Staff Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Classes"
            value={stats.classes}
            icon={<Class color="primary" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Students"
            value={stats.students}
            icon={<People color="success" />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Assignments"
            value={`${stats.assignments.graded} graded`}
            icon={<Assignment color="warning" />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Exams"
            value={`${stats.exams.completed} completed`}
            icon={<School color="error" />}
            color="error"
          />
        </Grid>

        {/* Today's Schedule */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Today's Schedule
            </Typography>
            <List>
              {recentActivities.map((activity, index) => (
                <Box key={index}>
                  <ListItem>
                    <ListItemIcon>
                      {activity.type === 'class' && <Class />}
                      {activity.type === 'assignment' && <Assignment />}
                      {activity.type === 'exam' && <School />}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.title}
                      secondary={activity.date}
                    />
                    <Chip
                      label={activity.status}
                      color={
                        activity.status === 'completed'
                          ? 'success'
                          : activity.status === 'pending'
                          ? 'warning'
                          : 'info'
                      }
                      size="small"
                    />
                  </ListItem>
                  {index < recentActivities.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<Event />}
                onClick={() => {/* Handle view full schedule */}}
              >
                View Full Schedule
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Notifications
            </Typography>
            <List>
              {notifications.map((notification, index) => (
                <Box key={index}>
                  <ListItem>
                    <ListItemIcon>
                      <Notifications color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={notification.message}
                      secondary={notification.time}
                    />
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="text"
                onClick={() => {/* Handle view all notifications */}}
              >
                View All
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StaffDashboard; 