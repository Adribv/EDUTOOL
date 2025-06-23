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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  School,
  Assignment,
  Event,
  Notifications,
  TrendingUp,
  Schedule,
  Book,
  Group,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { teacherAPI } from '../../services/api';
import { placeholderData, createMockResponse } from '../../services/placeholderData';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [performance, setPerformance] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch data with fallback to placeholder data
      const [
        profileRes,
        classesRes,
        assignmentsRes,
        announcementsRes,
        performanceRes,
      ] = await Promise.allSettled([
        teacherAPI.getProfile().catch(() => createMockResponse(placeholderData.teacherProfile)),
        teacherAPI.getClasses().catch(() => createMockResponse([])),
        teacherAPI.getAssignments().catch(() => createMockResponse(placeholderData.assignments)),
        teacherAPI.getAnnouncements().catch(() => createMockResponse(placeholderData.announcements)),
        teacherAPI.getPerformanceAnalytics().catch(() => createMockResponse(placeholderData.performance)),
      ]);

      // Extract data from resolved promises, using placeholder data if rejected
      const profile = profileRes.status === 'fulfilled' ? profileRes.value.data : placeholderData.teacherProfile;
      const classes = classesRes.status === 'fulfilled' ? (classesRes.value.data || []) : [];
      const assignments = assignmentsRes.status === 'fulfilled' ? (assignmentsRes.value.data || []) : placeholderData.assignments;
      const announcements = announcementsRes.status === 'fulfilled' ? (announcementsRes.value.data || []) : placeholderData.announcements;
      const performance = performanceRes.status === 'fulfilled' ? performanceRes.value.data : placeholderData.performance;

      setProfile(profile);
      setClasses(classes);
      setAssignments(assignments);
      setAnnouncements(announcements);
      setPerformance(performance);

      // Show info toast if using placeholder data
      const usingPlaceholder = [
        profileRes.status === 'rejected',
        classesRes.status === 'rejected',
        assignmentsRes.status === 'rejected',
        announcementsRes.status === 'rejected',
        performanceRes.status === 'rejected',
      ].some(Boolean);

      if (usingPlaceholder) {
        toast.info('Using demo data - some features may be limited');
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      
      // Set placeholder data as fallback
      setProfile(placeholderData.teacherProfile);
      setClasses([]);
      setAssignments(placeholderData.assignments);
      setAnnouncements(placeholderData.announcements);
      setPerformance(placeholderData.performance);
      
      toast.info('Using demo data - some features may be limited');
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
                <Group color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Students</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {performance?.totalStudents}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assignment color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Pending Reviews</Typography>
              </Box>
              <Typography variant="h4" color="warning">
                {assignments.filter(a => a.status === 'Pending Review').length}
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
                <Typography variant="h6">Upcoming Classes</Typography>
              </Box>
              <Typography variant="h4" color="info">
                {classes.filter(c => c.isUpcoming).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Classes */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Today's Classes
              </Typography>
              <List>
                {classes
                  .filter(c => c.isToday)
                  .map((classItem, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Book />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${classItem.subject} - ${classItem.class} ${classItem.section}`}
                        secondary={`${classItem.time} | Room ${classItem.room}`}
                      />
                      <Chip
                        label={`${classItem.students} students`}
                        size="small"
                      />
                    </ListItem>
                  ))}
              </List>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => window.location.href = '/teacher/classes'}
              >
                View All Classes
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Assignments */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Pending Reviews
              </Typography>
              <List>
                {assignments
                  .filter(a => a.status === 'Pending Review')
                  .slice(0, 5)
                  .map((assignment, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Assignment color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary={assignment.title}
                        secondary={`${assignment.submittedCount} submissions`}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => window.location.href = `/teacher/assignments/${assignment.id}`}
                      >
                        Review
                      </Button>
                    </ListItem>
                  ))}
              </List>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => window.location.href = '/teacher/assignments'}
              >
                View All Assignments
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Class Performance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Class Performance
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Class</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Average</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {performance?.classPerformance?.map((classPerf, index) => (
                      <TableRow key={index}>
                        <TableCell>{classPerf.class}</TableCell>
                        <TableCell>{classPerf.subject}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${classPerf.average.toFixed(1)}%`}
                            color={getGradeColor(classPerf.average)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={classPerf.trend === 'up' ? <TrendingUp /> : <Warning />}
                            label={classPerf.trend === 'up' ? 'Improving' : 'Needs Attention'}
                            color={classPerf.trend === 'up' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
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
                onClick={() => window.location.href = '/teacher/announcements'}
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