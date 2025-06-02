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
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  Assignment,
  Event,
  School,
  Payment,
} from '@mui/icons-material';
import { studentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    attendance: 0,
    assignments: {
      completed: 0,
      pending: 0,
    },
    exams: {
      upcoming: 0,
      completed: 0,
    },
    fees: {
      paid: 0,
      pending: 0,
    },
  });

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getDashboard();
      const { stats: dashboardStats, recentActivities: activities } = response.data;
      setStats(dashboardStats);
      setRecentActivities(activities);
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
        Student Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Attendance"
            value={`${stats.attendance}%`}
            icon={<Event color="primary" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Assignments"
            value={`${stats.assignments.completed}/${stats.assignments.completed + stats.assignments.pending}`}
            icon={<Assignment color="success" />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Exams"
            value={`${stats.exams.completed} completed`}
            icon={<School color="warning" />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Fees Paid"
            value={`₹${stats.fees.paid}`}
            icon={<Payment color="error" />}
            color="error"
          />
        </Grid>

        {/* Progress Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Academic Progress
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Overall Performance
              </Typography>
              <LinearProgress
                variant="determinate"
                value={stats.attendance}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Assignment Completion
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(stats.assignments.completed / (stats.assignments.completed + stats.assignments.pending)) * 100}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Attendance Rate
              </Typography>
              <LinearProgress
                variant="determinate"
                value={stats.attendance}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              {recentActivities.map((activity, index) => (
                <Box key={index}>
                  <ListItem>
                    <ListItemIcon>
                      {activity.type === 'assignment' && <Assignment />}
                      {activity.type === 'exam' && <School />}
                      {activity.type === 'attendance' && <Event />}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.title}
                      secondary={activity.date}
                    />
                  </ListItem>
                  {index < recentActivities.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard; 