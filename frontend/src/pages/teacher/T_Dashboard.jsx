import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  School as SchoolIcon,
  Group as GroupIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import teacherService from '../../services/teacherService';

const T_Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    upcomingClasses: 0,
    pendingAssignments: 0,
    recentAnnouncements: [],
    upcomingEvents: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await teacherService.getDashboardStats();
      setStats(response.data);
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
        Teacher Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Overview Statistics */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SchoolIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Classes</Typography>
              </Box>
              <Typography variant="h4">{stats.totalClasses}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <GroupIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Students</Typography>
              </Box>
              <Typography variant="h4">{stats.totalStudents}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <EventIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Upcoming Classes</Typography>
              </Box>
              <Typography variant="h4">{stats.upcomingClasses}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Pending Assignments</Typography>
              </Box>
              <Typography variant="h4">{stats.pendingAssignments}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Announcements */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <NotificationsIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Recent Announcements</Typography>
            </Box>
            <List>
              {stats.recentAnnouncements.map((announcement, index) => (
                <Box key={announcement.id}>
                  <ListItem>
                    <ListItemText
                      primary={announcement.title}
                      secondary={announcement.content}
                    />
                  </ListItem>
                  {index < stats.recentAnnouncements.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Upcoming Events */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <EventIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Upcoming Events</Typography>
            </Box>
            <List>
              {stats.upcomingEvents.map((event, index) => (
                <Box key={event.id}>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUpIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={event.title}
                      secondary={`${event.date} - ${event.time}`}
                    />
                  </ListItem>
                  {index < stats.upcomingEvents.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default T_Dashboard; 