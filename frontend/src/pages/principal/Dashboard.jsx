import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  Avatar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Class as ClassIcon,
  Business as BusinessIcon,
  Notifications as NotificationsIcon,
  Event as EventIcon,
  Announcement as AnnouncementIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
  Message as MessageIcon,
  Inventory as InventoryIcon,
  DirectionsBus as TransportIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Report as ReportIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Add as AddIcon,
  NotificationsActive as AlertIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircleOutline as SuccessIcon,
  ErrorOutline as ErrorIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { principalAPI } from '../../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await principalAPI.getDashboard();
      console.log('📊 Principal dashboard data:', response.data);
      setDashboardData(response.data);
    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'error';
      case 'Pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getRequestTypeIcon = (type) => {
    switch (type) {
      case 'Event':
        return <EventIcon />;
      case 'Announcement':
        return <AnnouncementIcon />;
      case 'Fee':
        return <MoneyIcon />;
      case 'Leave':
        return <ScheduleIcon />;
      case 'Resource':
        return <InventoryIcon />;
      case 'Communication':
        return <MessageIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 75) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Welcome, {user?.name || 'Principal'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            School Management Dashboard - {new Date().toLocaleDateString()}
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={refreshData} disabled={refreshing}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ViewIcon />}
            href="/principal/reports"
          >
            View Reports
          </Button>
        </Box>
      </Box>

      {/* Real-time Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Students
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData?.stats?.totalStudents || 0}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    +{dashboardData?.stats?.newStudents || 0} this month
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <PeopleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Staff
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData?.stats?.totalStaff || 0}
                  </Typography>
                  <Typography variant="body2" color="info.main">
                    {dashboardData?.stats?.activeStaff || 0} active
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56 }}>
                  <SchoolIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Pending Approvals
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData?.stats?.pendingApprovals || 0}
                  </Typography>
                  <Typography variant="body2" color="warning.main">
                    Requires attention
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                  <CheckCircleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Today's Attendance
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData?.stats?.todayAttendance || 0}%
                  </Typography>
                  <Typography variant="body2" color={getAttendanceColor(dashboardData?.stats?.todayAttendance || 0)}>
                    {dashboardData?.stats?.todayAttendance >= 90 ? 'Excellent' : 'Needs attention'}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                  <SuccessIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Stats Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              title="School Overview"
              action={
                <Button size="small" startIcon={<ViewIcon />}>
                  View Details
                </Button>
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h6">{dashboardData?.stats?.totalClasses || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">Classes</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h6">{dashboardData?.stats?.totalDepartments || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">Departments</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h6">{dashboardData?.stats?.activeEvents || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">Active Events</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h6">{dashboardData?.stats?.feeCollection || 0}%</Typography>
                    <Typography variant="body2" color="text.secondary">Fee Collection</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Alerts & Notices" />
            <CardContent>
              <List dense>
                {dashboardData?.alerts?.slice(0, 3).map((alert, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <AlertIcon color={alert.priority === 'high' ? 'error' : 'warning'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={alert.title}
                      secondary={alert.message}
                    />
                  </ListItem>
                ))}
                {(!dashboardData?.alerts || dashboardData.alerts.length === 0) && (
                  <ListItem>
                    <ListItemText
                      primary="No alerts"
                      secondary="All systems running smoothly"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Pending Approvals */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Pending Approvals"
              action={
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    label={dashboardData?.stats?.pendingApprovals || 0}
                    color="warning"
                    size="small"
                  />
                  <Button size="small" startIcon={<ViewIcon />} href="/principal/approvals">
                    View All
                  </Button>
                </Box>
              }
            />
            <CardContent>
              {dashboardData?.pendingApprovals?.length > 0 ? (
                <List>
                  {dashboardData.pendingApprovals.slice(0, 5).map((approval) => (
                    <React.Fragment key={approval._id}>
                      <ListItem>
                        <ListItemIcon>
                          {getRequestTypeIcon(approval.requestType)}
                        </ListItemIcon>
                        <ListItemText
                          primary={approval.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {approval.description}
                              </Typography>
                              <Box display="flex" alignItems="center" mt={1} gap={1}>
                                <Typography variant="caption" color="text.secondary">
                                  By: {approval.requesterId?.name || 'Unknown'}
                                </Typography>
                                <Chip
                                  label={approval.requestType}
                                  size="small"
                                  variant="outlined"
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(approval.createdAt).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                        <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                          <Chip
                            label={approval.status}
                            color={getStatusColor(approval.status)}
                            size="small"
                          />
                          <Button size="small" variant="outlined" href={`/principal/approvals/${approval._id}`}>
                            Review
                          </Button>
                        </Box>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={2}>
                  <SuccessIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No pending approvals
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Recent Activities" 
              action={
                <Button size="small" startIcon={<ViewIcon />}>
                  View All
                </Button>
              }
            />
            <CardContent>
              <List>
                {dashboardData?.recentActivities?.events?.map((event, index) => (
                  <ListItem key={event._id || index}>
                    <ListItemIcon>
                      <EventIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={event.title}
                      secondary={`${new Date(event.startDate).toLocaleDateString()} - ${event.venue}`}
                    />
                  </ListItem>
                ))}
                {dashboardData?.recentActivities?.announcements?.map((announcement, index) => (
                  <ListItem key={announcement._id || index}>
                    <ListItemIcon>
                      <AnnouncementIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={announcement.title}
                      secondary={new Date(announcement.createdAt).toLocaleDateString()}
                    />
                  </ListItem>
                ))}
                {(!dashboardData?.recentActivities?.events?.length && !dashboardData?.recentActivities?.announcements?.length) && (
                  <ListItem>
                    <ListItemText
                      primary="No recent activities"
                      secondary="Check back later for updates"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Quick Actions" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CheckCircleIcon />}
                    href="/principal/approvals"
                  >
                    Review Approvals
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<SchoolIcon />}
                    href="/principal/staff"
                  >
                    Manage Staff
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<PeopleIcon />}
                    href="/principal/students"
                  >
                    Student Management
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<BusinessIcon />}
                    href="/principal/academic"
                  >
                    Academic Management
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<MoneyIcon />}
                    href="/principal/finance"
                  >
                    Finance & Fees
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<EventIcon />}
                    href="/principal/events"
                  >
                    Event Management
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<InventoryIcon />}
                    href="/principal/inventory"
                  >
                    Inventory
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<AssessmentIcon />}
                    href="/principal/reports"
                  >
                    Reports & Analytics
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<MessageIcon />}
                    href="/principal/communication"
                  >
                    Communication
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<SecurityIcon />}
                    href="/principal/security"
                  >
                    Security & Permissions
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Performance Metrics" />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Student Attendance</Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box flex={1}>
                      <LinearProgress 
                        variant="determinate" 
                        value={dashboardData?.stats?.todayAttendance || 0}
                        color={getAttendanceColor(dashboardData?.stats?.todayAttendance || 0)}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                    <Typography variant="body2">
                      {dashboardData?.stats?.todayAttendance || 0}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Fee Collection</Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box flex={1}>
                      <LinearProgress 
                        variant="determinate" 
                        value={dashboardData?.stats?.feeCollection || 0}
                        color={dashboardData?.stats?.feeCollection >= 80 ? 'success' : 'warning'}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                    <Typography variant="body2">
                      {dashboardData?.stats?.feeCollection || 0}%
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 