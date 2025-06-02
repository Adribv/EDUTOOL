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

  useEffect(() => {
    fetchData();
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

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Welcome, {profile?.name}
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <School color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Class</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {profile?.class} {profile?.section}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assignment color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Pending Assignments</Typography>
              </Box>
              <Typography variant="h4" color="warning">
                {assignments.filter(a => a.submissionStatus === 'Not Submitted').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Average Grade</Typography>
              </Box>
              <Typography variant="h4" color="success">
                {performance?.overallPerformance?.averageScore?.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Event color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Upcoming Exams</Typography>
              </Box>
              <Typography variant="h4" color="info">
                {performance?.upcomingExams?.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Subjects and Teachers */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Subjects & Teachers
              </Typography>
              <List>
                {subjects.map((subject, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Book />
                    </ListItemIcon>
                    <ListItemText
                      primary={subject.name}
                      secondary={`Teacher: ${subject.teacher}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Assignments */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Assignments
              </Typography>
              <List>
                {assignments.slice(0, 5).map((assignment, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Assignment color={assignment.submissionStatus === 'Submitted' ? 'success' : 'warning'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={assignment.title}
                      secondary={`Due: ${new Date(assignment.dueDate).toLocaleDateString()}`}
                    />
                    <Chip
                      label={assignment.submissionStatus}
                      color={assignment.submissionStatus === 'Submitted' ? 'success' : 'warning'}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => window.location.href = '/student/assignments'}
              >
                View All Assignments
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Performance Overview
              </Typography>
              <List>
                {Object.entries(performance?.subjectPerformance || {}).map(([subject, data], index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <TrendingUp color={getGradeColor(data.average)} />
                    </ListItemIcon>
                    <ListItemText
                      primary={subject}
                      secondary={`Average: ${data.average.toFixed(1)}%`}
                    />
                    <Chip
                      label={`${data.average.toFixed(1)}%`}
                      color={getGradeColor(data.average)}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Announcements */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Announcements
              </Typography>
              <List>
                {announcements.slice(0, 5).map((announcement, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Notifications />
                    </ListItemIcon>
                    <ListItemText
                      primary={announcement.title}
                      secondary={new Date(announcement.createdAt).toLocaleDateString()}
                    />
                  </ListItem>
                ))}
              </List>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => window.location.href = '/student/announcements'}
              >
                View All Announcements
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 