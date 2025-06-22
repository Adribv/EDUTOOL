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
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';

function AdminDashboard() {
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: adminAPI.getDashboardStats,
  });

  const handleRefresh = () => {
    refetch();
    toast.success('Dashboard refreshed');
  };

  const handleDownloadReport = async (type) => {
    try {
      const response = await adminAPI.generateFinancialReport();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  if (isLoading) {
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
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <People color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Staff</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {stats?.totalStaff || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <School color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Students</Typography>
              </Box>
              <Typography variant="h4" color="secondary">
                {stats?.totalStudents || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Payment color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Fee Collection</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                ${stats?.totalFeeCollection || 0}
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
                    startIcon={<Event />}
                    href="/admin/settings"
                  >
                    System Settings
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