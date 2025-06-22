import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalStudents: 0,
    activeCourses: 0,
    pendingTasks: 0,
  });

  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      type: 'Course Update',
      description: 'Updated curriculum for Computer Science 101',
      date: '2024-03-20',
    },
    {
      id: 2,
      type: 'Teacher Assignment',
      description: 'Assigned Dr. Smith to Data Structures course',
      date: '2024-03-19',
    },
    {
      id: 3,
      type: 'Student Concern',
      description: 'Addressed student feedback for Algorithms course',
      date: '2024-03-18',
    },
  ]);

  const [upcomingTasks, setUpcomingTasks] = useState([
    {
      id: 1,
      title: 'Department Meeting',
      date: '2024-03-25',
      priority: 'High',
    },
    {
      id: 2,
      title: 'Review Course Evaluations',
      date: '2024-03-26',
      priority: 'Medium',
    },
    {
      id: 3,
      title: 'Faculty Performance Review',
      date: '2024-03-28',
      priority: 'High',
    },
  ]);

  useEffect(() => {
    // TODO: Fetch actual stats from API
    setStats({
      totalTeachers: 15,
      totalStudents: 450,
      activeCourses: 25,
      pendingTasks: 8,
    });
  }, []);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.name || 'HOD'}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Teachers
              </Typography>
              <Typography variant="h5">
                {stats.totalTeachers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Students
              </Typography>
              <Typography variant="h5">
                {stats.totalStudents}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Courses
              </Typography>
              <Typography variant="h5">
                {stats.activeCourses}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Tasks
              </Typography>
              <Typography variant="h5">
                {stats.pendingTasks}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              {recentActivities.map((activity) => (
                <ListItem key={activity.id}>
                  <ListItemText
                    primary={activity.description}
                    secondary={`${activity.type} - ${activity.date}`}
                  />
                </ListItem>
              ))}
            </List>
            <Divider />
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button variant="outlined" color="primary">
                View All Activities
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Tasks
            </Typography>
            <List>
              {upcomingTasks.map((task) => (
                <ListItem key={task.id}>
                  <ListItemText
                    primary={task.title}
                    secondary={`${task.date} - Priority: ${task.priority}`}
                  />
                </ListItem>
              ))}
            </List>
            <Divider />
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button variant="outlined" color="primary">
                View All Tasks
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button variant="contained" color="primary" fullWidth>
                  Manage Teachers
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button variant="contained" color="secondary" fullWidth>
                  Course Management
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button variant="contained" color="info" fullWidth>
                  View Reports
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button variant="contained" color="success" fullWidth>
                  Schedule Meeting
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 