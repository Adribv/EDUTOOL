import { useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  School,
  Assignment,
  Event,
  Payment,
  TrendingUp,
  Notifications,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Mock data for demonstration
const mockData = {
  stats: {
    assignments: 5,
    attendance: '95%',
    upcomingExams: 2,
    pendingFees: 1500,
  },
  recentActivities: [
    { id: 1, type: 'assignment', title: 'Math Assignment Due', date: '2024-03-20' },
    { id: 2, type: 'exam', title: 'Science Mid-term', date: '2024-03-25' },
    { id: 3, type: 'payment', title: 'Tuition Fee Paid', date: '2024-03-15' },
  ],
};

function Dashboard() {
  const [stats, setStats] = useState(mockData.stats);
  const [activities, setActivities] = useState(mockData.recentActivities);

  // Uncomment when backend is ready
  // const { data: dashboardData, isLoading } = useQuery({
  //   queryKey: ['dashboard'],
  //   queryFn: async () => {
  //     const response = await axios.get('http://localhost:5000/api/dashboard', {
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem('token')}`,
  //       },
  //     });
  //     return response.data;
  //   },
  // });

  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: '50%',
              p: 1,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  const ActivityItem = ({ activity }) => {
    const getIcon = () => {
      switch (activity.type) {
        case 'assignment':
          return <Assignment color="primary" />;
        case 'exam':
          return <School color="secondary" />;
        case 'payment':
          return <Payment color="success" />;
        default:
          return <Notifications />;
      }
    };

    return (
      <ListItem>
        <ListItemIcon>{getIcon()}</ListItemIcon>
        <ListItemText
          primary={activity.title}
          secondary={new Date(activity.date).toLocaleDateString()}
        />
      </ListItem>
    );
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Assignments"
            value={stats.assignments}
            icon={<Assignment sx={{ color: 'primary.main' }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Attendance"
            value={stats.attendance}
            icon={<Event sx={{ color: 'success.main' }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Upcoming Exams"
            value={stats.upcomingExams}
            icon={<School sx={{ color: 'warning.main' }} />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Fees"
            value={`$${stats.pendingFees}`}
            icon={<Payment sx={{ color: 'error.main' }} />}
            color="error"
          />
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Activities
            </Typography>
            <List>
              {activities.map((activity, index) => (
                <Box key={activity.id}>
                  <ActivityItem activity={activity} />
                  {index < activities.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Performance Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Performance Overview
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '200px',
              }}
            >
              <TrendingUp sx={{ fontSize: 100, color: 'primary.main', opacity: 0.2 }} />
              {/* Add Chart.js component here */}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard; 