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
  Button,
  Chip,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  School,
  Assignment,
  Payment,
  Event,
  Message,
} from '@mui/icons-material';
import { parentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const ParentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [stats, setStats] = useState({
    fees: {
      paid: 0,
      pending: 0,
    },
    assignments: {
      completed: 0,
      pending: 0,
    },
    exams: {
      upcoming: 0,
      completed: 0,
    },
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await parentAPI.getDashboard();
      const {
        children: childrenData,
        stats: dashboardStats,
        recentActivities: activities,
        messages: msgs,
      } = response.data;
      setChildren(childrenData);
      setStats(dashboardStats);
      setRecentActivities(activities);
      setMessages(msgs);
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
        Parent Dashboard
      </Typography>

      {/* Children Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {children.map((child) => (
          <Grid item xs={12} md={6} key={child.id}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ width: 56, height: 56, mr: 2 }}>
                  {child.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{child.name}</Typography>
                  <Typography color="text.secondary">
                    Grade {child.grade}
                  </Typography>
                </Box>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Attendance
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {child.attendance}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Performance
                  </Typography>
                  <Typography variant="h6" color="success">
                    {child.performance}%
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Fees Paid"
            value={`₹${stats.fees.paid}`}
            icon={<Payment color="success" />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Assignments"
            value={`${stats.assignments.completed}/${stats.assignments.completed + stats.assignments.pending}`}
            icon={<Assignment color="warning" />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Exams"
            value={`${stats.exams.completed} completed`}
            icon={<School color="info" />}
            color="info"
          />
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              {recentActivities.map((activity, index) => (
                <Box key={index}>
                  <ListItem>
                    <ListItemIcon>
                      {activity.type === 'exam' && <School />}
                      {activity.type === 'assignment' && <Assignment />}
                      {activity.type === 'payment' && <Payment />}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.title}
                      secondary={activity.date}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {activity.score && (
                        <Typography variant="body2" color="primary">
                          {activity.score}
                        </Typography>
                      )}
                      {activity.amount && (
                        <Typography variant="body2" color="error">
                          {activity.amount}
                        </Typography>
                      )}
                      <Chip
                        label={activity.status}
                        color={
                          activity.status === 'completed'
                            ? 'success'
                            : activity.status === 'pending'
                            ? 'warning'
                            : 'info'
                        }
                        size="small"
                      />
                    </Box>
                  </ListItem>
                  {index < recentActivities.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Messages */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Messages
            </Typography>
            <List>
              {messages.map((message, index) => (
                <Box key={index}>
                  <ListItem>
                    <ListItemIcon>
                      <Message color={message.unread ? 'primary' : 'action'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: message.unread ? 'bold' : 'normal',
                            }}
                          >
                            {message.from}
                          </Typography>
                          {message.unread && (
                            <Chip
                              label="New"
                              color="primary"
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2">{message.subject}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {message.date}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < messages.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="text"
                startIcon={<Message />}
                onClick={() => {/* Handle view all messages */}}
              >
                View All Messages
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ParentDashboard; 