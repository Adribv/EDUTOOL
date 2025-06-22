import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Avatar,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  useTheme,
} from '@mui/material';
import {
  School,
  Assignment,
  Payment,
  Event,
  Message,
  Assessment,
  Timeline,
  Person,
  Notifications,
  CalendarToday,
} from '@mui/icons-material';
import { parentAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon, color, onClick }) => (
  <Card 
    sx={{ 
      height: '100%', 
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: onClick ? 'translateY(-4px)' : 'none',
        boxShadow: onClick ? 4 : 1,
      }
    }}
    onClick={onClick}
  >
    <CardContent>
      <Box display="flex" alignItems="center" mb={2}>
        {icon}
        <Typography variant="h6" component="div" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" color={color}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const ParentDashboard = () => {
  const [selectedChild, setSelectedChild] = useState(null);
  const theme = useTheme();
  const navigate = useNavigate();

  const { data: children, isLoading: childrenLoading, error: childrenError } = useQuery({
    queryKey: ['parent_children'],
    queryFn: parentAPI.getChildren,
    onSuccess: (data) => {
      if (data && data.length > 0) {
        setSelectedChild(data[0]);
      }
    }
  });

  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery({
    queryKey: ['parent_dashboard', selectedChild?.id],
    queryFn: () => parentAPI.getDashboard(selectedChild.id),
    enabled: !!selectedChild,
  });
  
  const handleChildChange = (event, newValue) => {
    setSelectedChild(children[newValue]);
  };

  const isLoading = childrenLoading || dashboardLoading;
  const error = childrenError || dashboardError;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error">
          Failed to load dashboard data: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Parent Dashboard
      </Typography>

      {/* Child Selector */}
      {children && children.length > 0 && (
        <Paper elevation={3} sx={{ mb: 3, p: 2, borderRadius: 2 }}>
          <Tabs
            value={children.findIndex(c => c.id === selectedChild?.id)}
            onChange={handleChildChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="child selector"
          >
            {children.map(child => (
              <Tab 
                key={child.id} 
                label={
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, mr: 1 }} src={child.profilePicture}>
                      {child.name.charAt(0)}
                    </Avatar>
                    <Typography>{child.name}</Typography>
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Paper>
      )}

      {selectedChild && dashboardData && (
        <Grid container spacing={3}>
          {/* Quick Stats */}
          <Grid item xs={12} md={4}>
            <StatCard
              title="Attendance"
              value={`${dashboardData.attendance.rate}%`}
              icon={<Timeline color="primary" />}
              color="primary.main"
              onClick={() => navigate(`/parent/children/${selectedChild.id}/attendance`)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Recent Grades"
              value={`${dashboardData.grades.average || 'N/A'}`}
              icon={<Assessment color="secondary" />}
              color="secondary.main"
              onClick={() => navigate(`/parent/children/${selectedChild.id}/grades`)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Pending Assignments"
              value={dashboardData.assignments.pending}
              icon={<Assignment color="error" />}
              color="error.main"
              onClick={() => navigate(`/parent/children/${selectedChild.id}/assignments`)}
            />
          </Grid>

          {/* Fee Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Fee Status</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">Total Due</Typography>
                    <Typography variant="h5" color="error.main">₹{dashboardData.fees.due}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">Next Due Date</Typography>
                    <Typography variant="h5">{dashboardData.fees.dueDate}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4} sx={{ textAlign: 'right', alignSelf: 'center' }}>
                    <Button variant="contained" onClick={() => navigate('/parent/fees')}>
                      Pay Now
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Recent Activity */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Recent Activity</Typography>
              <List>
                {dashboardData.recentActivities.slice(0, 5).map((activity, index) => (
                  <ListItem key={index} divider={index < dashboardData.recentActivities.length - 1}>
                    <ListItemIcon>
                      {activity.type === 'exam' && <School />}
                      {activity.type === 'assignment' && <Assignment />}
                      {activity.type === 'event' && <Event />}
                    </ListItemIcon>
                    <ListItemText primary={activity.title} secondary={activity.date} />
                    <Chip label={activity.status || activity.grade} size="small" />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          
          {/* Upcoming Events */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Upcoming Events</Typography>
              <List>
                {dashboardData.upcomingEvents.slice(0, 5).map((event, index) => (
                  <ListItem key={index} divider={index < dashboardData.upcomingEvents.length - 1}>
                    <ListItemIcon>
                      <CalendarToday />
                    </ListItemIcon>
                    <ListItemText primary={event.title} secondary={event.date} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

        </Grid>
      )}
    </Box>
  );
};

export default ParentDashboard; 