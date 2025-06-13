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
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import parentService from '../../services/parentService';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    students: [],
    upcomingEvents: [],
    notifications: [],
    recentAssignments: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await parentService.getDashboard();
      setDashboardData(response.data);
    } catch {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Parent Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Students Overview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              My Children
            </Typography>
            <List>
              {dashboardData.students.map((student) => (
                <Card key={student.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1">
                      {student.name} - {student.grade}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Class: {student.class}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Roll Number: {student.rollNumber}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Upcoming Events */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Events
            </Typography>
            <List>
              {dashboardData.upcomingEvents.map((event) => (
                <ListItem key={event.id}>
                  <ListItemIcon>
                    <EventIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={event.title}
                    secondary={`${event.date} - ${event.time}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recent Assignments */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Assignments
            </Typography>
            <List>
              {dashboardData.recentAssignments.map((assignment) => (
                <ListItem key={assignment.id}>
                  <ListItemIcon>
                    <AssignmentIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={assignment.title}
                    secondary={`Due: ${assignment.dueDate}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notifications
            </Typography>
            <List>
              {dashboardData.notifications.map((notification) => (
                <ListItem key={notification.id}>
                  <ListItemIcon>
                    <NotificationsIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.title}
                    secondary={notification.message}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 