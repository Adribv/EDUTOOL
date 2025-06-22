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
  Chip,
} from '@mui/material';
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon,
  Grade as GradeIcon,
} from '@mui/icons-material';
import studentService from '../../services/studentService';

const S_Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalClasses: 0,
    upcomingAssignments: 0,
    averageGrade: 0,
    attendancePercentage: 0,
    recentAnnouncements: [],
    upcomingEvents: [],
    recentGrades: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await studentService.getDashboardStats();
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
        Student Dashboard
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
                <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Upcoming Assignments</Typography>
              </Box>
              <Typography variant="h4">{stats.upcomingAssignments}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <GradeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Average Grade</Typography>
              </Box>
              <Typography variant="h4">{stats.averageGrade}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Attendance</Typography>
              </Box>
              <Typography variant="h4">{stats.attendancePercentage}%</Typography>
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
                      <EventIcon color="primary" />
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

        {/* Recent Grades */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <GradeIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Recent Grades</Typography>
            </Box>
            <List>
              {stats.recentGrades.map((grade, index) => (
                <Box key={grade.id}>
                  <ListItem>
                    <ListItemIcon>
                      <AssignmentIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={grade.subject}
                      secondary={`${grade.assessmentType} - ${grade.marks}/${grade.totalMarks}`}
                    />
                    <Chip
                      label={`${Math.round((grade.marks / grade.totalMarks) * 100)}%`}
                      color={
                        (grade.marks / grade.totalMarks) * 100 >= 70
                          ? 'success'
                          : (grade.marks / grade.totalMarks) * 100 >= 50
                          ? 'warning'
                          : 'error'
                      }
                    />
                  </ListItem>
                  {index < stats.recentGrades.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default S_Dashboard; 