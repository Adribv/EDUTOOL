import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  School as SchoolIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { staffAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    pendingAssignments: 0,
    upcomingEvents: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, activitiesResponse, notificationsResponse] = await Promise.all([
        staffAPI.getStats(),
        staffAPI.getRecentActivities(),
        staffAPI.getNotifications(),
      ]);

      setStats(statsResponse.data);
      setRecentActivities(activitiesResponse.data);
      setNotifications(notificationsResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Staff Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back! Here's an overview of your activities
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SchoolIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Students</Typography>
              </Box>
              <Typography variant="h4">{stats.totalStudents}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <GroupIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Classes</Typography>
              </Box>
              <Typography variant="h4">{stats.totalClasses}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Pending Assignments</Typography>
              </Box>
              <Typography variant="h4">{stats.pendingAssignments}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EventIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Upcoming Events</Typography>
              </Box>
              <Typography variant="h4">{stats.upcomingEvents}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              <List>
                {recentActivities.map((activity, index) => (
                  <Box key={index}>
                    <ListItem>
                      <ListItemIcon>
                        {activity.type === 'assignment' ? (
                          <AssignmentIcon />
                        ) : activity.type === 'event' ? (
                          <EventIcon />
                        ) : (
                          <SchoolIcon />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.title}
                        secondary={new Date(activity.timestamp).toLocaleString()}
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </CardContent>
            <CardActions>
              <Button size="small">View All Activities</Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notifications
              </Typography>
              <List>
                {notifications.map((notification, index) => (
                  <Box key={index}>
                    <ListItem>
                      <ListItemIcon>
                        <NotificationsIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={notification.title}
                        secondary={notification.message}
                      />
                    </ListItem>
                    {index < notifications.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </CardContent>
            <CardActions>
              <Button size="small">View All Notifications</Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 