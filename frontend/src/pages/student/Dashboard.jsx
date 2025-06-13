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
} from '@mui/material';
import {
  School,
  Assignment,
  Event,
  Notifications,
  TrendingUp,
  Schedule,
  Book,
} from '@mui/icons-material';
import { studentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    upcomingAssignments: [],
    recentAttendance: [],
    upcomingExams: [],
    notifications: [],
  });

  useEffect(() => {
    fetchData();
    fetchDashboardData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        profileRes,
        subjectsRes,
        assignmentsRes,
        announcementsRes,
        performanceRes,
      ] = await Promise.all([
        studentAPI.getProfile(),
        studentAPI.getSubjects(),
        studentAPI.getAssignments(),
        studentAPI.getAnnouncements(),
        studentAPI.getPerformanceAnalytics(),
      ]);

      setProfile(profileRes.data);
      setSubjects(subjectsRes.data.subjects);
      setAssignments(assignmentsRes.data);
      setAnnouncements(announcementsRes.data);
      setPerformance(performanceRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await studentAPI.get('/api/student/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'success';
    if (grade >= 80) return 'primary';
    if (grade >= 70) return 'info';
    if (grade >= 60) return 'warning';
    return 'error';
  };

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

  const StatCard = ({ title, value, icon }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          {icon}
          <Typography variant="h6" component="div" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  const ListCard = ({ title, items, icon }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          {icon}
          <Typography variant="h6" component="div" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <List>
          {items.map((item, index) => (
            <div key={index}>
              <ListItem>
                <ListItemText
                  primary={item.title}
                  secondary={item.date || item.status}
                />
              </ListItem>
              {index < items.length - 1 && <Divider />}
            </div>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back!
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Pending Assignments"
            value={dashboardData.upcomingAssignments.length}
            icon={<Assignment color="primary" />}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Upcoming Exams"
            value={dashboardData.upcomingExams.length}
            icon={<School color="primary" />}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Attendance Rate"
            value={`${dashboardData.attendanceRate || 0}%`}
            icon={<Event color="primary" />}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Notifications"
            value={dashboardData.notifications.length}
            icon={<Notifications color="primary" />}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <ListCard
            title="Upcoming Assignments"
            items={dashboardData.upcomingAssignments}
            icon={<Assignment color="primary" />}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <ListCard
            title="Recent Notifications"
            items={dashboardData.notifications}
            icon={<Notifications color="primary" />}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <ListCard
            title="Upcoming Exams"
            items={dashboardData.upcomingExams}
            icon={<School color="primary" />}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <ListCard
            title="Recent Attendance"
            items={dashboardData.recentAttendance}
            icon={<Event color="primary" />}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 