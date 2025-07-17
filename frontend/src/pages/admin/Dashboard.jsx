import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button,
  IconButton,
  Tooltip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  People,
  School,
  Payment,
  Assignment,
  Event,
  Message,
  Refresh,
  Download,
  Inventory,
  Settings,
  Assessment,
  Group as GroupIcon,
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon,
  Warning,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { roleConfig } from './roleConfig';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalStaff: 0,
    totalClasses: 0,
    upcomingEvents: [],
    recentAnnouncements: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
    toast.success('Dashboard refreshed');
  };

  const handleDownloadReport = (type) => {
    // Implement report download logic
    toast.info(`Downloading ${type} report...`);
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

  // If user is AdminStaff and has a designation in roleConfig, show only their dashboard widgets
  if (user?.role === 'AdminStaff' && roleConfig[user?.designation]) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">{user.designation} Dashboard</Typography>
          <Box>
            <Tooltip title="Refresh Dashboard">
              <IconButton onClick={handleRefresh} sx={{ mr: 1 }}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Grid container spacing={3}>
          {roleConfig[user.designation].dashboard.map((widget) => (
            <Grid item xs={12} sm={6} md={4} key={widget}>
              <Card sx={{ height: '100%', cursor: 'pointer' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {widget.includes('Attendance') && <Assignment color="primary" sx={{ mr: 1 }} />}
                    {widget.includes('Behavior') && <People color="warning" sx={{ mr: 1 }} />}
                    {widget.includes('Finance') && <Payment color="success" sx={{ mr: 1 }} />}
                    {widget.includes('Inventory') && <Inventory color="info" sx={{ mr: 1 }} />}
                    {widget.includes('Systems') && <Settings color="secondary" sx={{ mr: 1 }} />}
                    {widget.includes('Catalog') && <School color="primary" sx={{ mr: 1 }} />}
                    {widget.includes('Counseling') && <People color="success" sx={{ mr: 1 }} />}
                    {widget.includes('Exam') && <Assessment color="warning" sx={{ mr: 1 }} />}
                    {widget.includes('Event') && <Event color="info" sx={{ mr: 1 }} />}
                    {widget.includes('Campus') && <Settings color="secondary" sx={{ mr: 1 }} />}
                    {!widget.includes('Attendance') && !widget.includes('Behavior') && !widget.includes('Finance') && 
                     !widget.includes('Inventory') && !widget.includes('Systems') && !widget.includes('Catalog') && 
                     !widget.includes('Counseling') && !widget.includes('Exam') && !widget.includes('Event') && 
                     !widget.includes('Campus') && <Assignment color="primary" sx={{ mr: 1 }} />}
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {widget}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {widget.includes('Attendance') && 'Track student attendance and monitor patterns'}
                    {widget.includes('Behavior') && 'Manage and address student behavior issues'}
                    {widget.includes('Finance') && 'Handle financial operations and fee management'}
                    {widget.includes('Inventory') && 'Manage school inventory and resources'}
                    {widget.includes('Systems') && 'Maintain and configure system settings'}
                    {widget.includes('Catalog') && 'Manage library catalog and resources'}
                    {widget.includes('Counseling') && 'Provide student counseling and support'}
                    {widget.includes('Exam') && 'Manage examination schedules and results'}
                    {widget.includes('Event') && 'Plan and organize school events'}
                    {widget.includes('Campus') && 'Ensure campus cleanliness and safety'}
                    {!widget.includes('Attendance') && !widget.includes('Behavior') && !widget.includes('Finance') && 
                     !widget.includes('Inventory') && !widget.includes('Systems') && !widget.includes('Catalog') && 
                     !widget.includes('Counseling') && !widget.includes('Exam') && !widget.includes('Event') && 
                     !widget.includes('Campus') && 'Manage related functions and operations'}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    fullWidth
                    onClick={() => {
                      // Navigate to the relevant section based on widget
                      const section = widget.toLowerCase().replace(/\s+/g, '');
                      navigate(`/admin/${section}`);
                    }}
                  >
                    Access {widget}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Admin Dashboard</Typography>
        <Box>
          <Tooltip title="Refresh Dashboard">
            <IconButton onClick={handleRefresh} sx={{ mr: 1 }}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => handleDownloadReport('financial')}
          >
            Download Report
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <People color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Students</Typography>
              </Box>
              <Typography variant="h4" color="primary.main">
                {stats?.totalStudents || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <School color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Staff</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {stats?.totalStaff || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Event color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Events</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {stats?.upcomingEvents?.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assignment color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Pending Tasks</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {stats?.pendingTasks || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3}>
        <Grid xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<People />}
                    href="/admin/staff"
                  >
                    Manage Staff
                  </Button>
                </Grid>
                <Grid xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<School />}
                    href="/admin/students"
                  >
                    Manage Students
                  </Button>
                </Grid>
                <Grid xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Payment />}
                    href="/admin/fees"
                  >
                    Fee Configuration
                  </Button>
                </Grid>
                <Grid xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Warning />}
                    href="/admin/disciplinary-forms"
                  >
                    Disciplinary Forms
                  </Button>
                </Grid>
                <Grid xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Assessment />}
                    href="/admin/syllabus-completion"
                  >
                    Syllabus Completion
                  </Button>
                </Grid>
                <Grid xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Event />}
                    href="/admin/events"
                  >
                    Event Management
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              {stats?.recentActivities?.map((activity, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                    p: 1,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                  }}
                >
                  <Box sx={{ mr: 2 }}>
                    {activity.type === 'staff' && <People />}
                    {activity.type === 'student' && <School />}
                    {activity.type === 'fee' && <Payment />}
                    {activity.type === 'task' && <Assignment />}
                    {activity.type === 'event' && <Event />}
                    {activity.type === 'message' && <Message />}
                  </Box>
                  <Box>
                    <Typography variant="body2">{activity.description}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(activity.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AdminDashboard; 