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
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedSessions: 0,
    activeStudents: 0,
  });

  const [upcomingAppointments, setUpcomingAppointments] = useState([
    {
      id: 1,
      studentName: 'John Doe',
      date: '2024-03-20',
      time: '10:00 AM',
      reason: 'Academic Performance',
    },
    {
      id: 2,
      studentName: 'Jane Smith',
      date: '2024-03-20',
      time: '11:30 AM',
      reason: 'Career Guidance',
    },
  ]);

  useEffect(() => {
    // TODO: Fetch actual stats from API
    setStats({
      totalAppointments: 25,
      pendingAppointments: 8,
      completedSessions: 17,
      activeStudents: 15,
    });
  }, []);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.name || 'Counselor'}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Appointments
              </Typography>
              <Typography variant="h5">
                {stats.totalAppointments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Appointments
              </Typography>
              <Typography variant="h5">
                {stats.pendingAppointments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completed Sessions
              </Typography>
              <Typography variant="h5">
                {stats.completedSessions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Students
              </Typography>
              <Typography variant="h5">
                {stats.activeStudents}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Appointments
            </Typography>
            <List>
              {upcomingAppointments.map((appointment) => (
                <ListItem key={appointment.id}>
                  <ListItemText
                    primary={appointment.studentName}
                    secondary={`${appointment.date} at ${appointment.time} - ${appointment.reason}`}
                  />
                  <Button size="small" color="primary">
                    View Details
                  </Button>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button variant="contained" color="primary" fullWidth>
                  Schedule New Appointment
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button variant="contained" color="secondary" fullWidth>
                  View Student Records
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