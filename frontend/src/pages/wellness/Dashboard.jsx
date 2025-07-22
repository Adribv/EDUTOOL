import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Psychology,
  HealthAndSafety,
  People,
  EventNote,
  TrendingUp,
  Schedule,
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color = 'primary' }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="h6">
            {title}
          </Typography>
          <Typography variant="h4" component="div" color={color}>
            {value}
          </Typography>
        </Box>
        <Box sx={{ color: `${color}.main` }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const WellnessDashboard = () => {
  const [stats] = useState({
    totalSessions: 145,
    thisWeekSessions: 12,
    studentsHelped: 89,
    wellnessPrograms: 8,
    pendingAppointments: 5,
    completedSessions: 140
  });

  const [upcomingSessions] = useState([
    { id: 1, student: 'John Doe', time: '10:00 AM', type: 'Individual Counselling', status: 'Confirmed' },
    { id: 2, student: 'Jane Smith', time: '11:30 AM', type: 'Group Session', status: 'Pending' },
    { id: 3, student: 'Mike Johnson', time: '2:00 PM', type: 'Career Guidance', status: 'Confirmed' },
    { id: 4, student: 'Sarah Wilson', time: '3:30 PM', type: 'Stress Management', status: 'Confirmed' },
  ]);

  const [wellnessPrograms] = useState([
    { name: 'Stress Management Workshop', participants: 25, status: 'Active' },
    { name: 'Mental Health Awareness', participants: 40, status: 'Active' },
    { name: 'Study Skills Training', participants: 18, status: 'Completed' },
    { name: 'Peer Support Groups', participants: 15, status: 'Active' },
  ]);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Wellness & Counselling Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Support student mental health and well-being through counselling and wellness programs.
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Sessions"
            value={stats.totalSessions}
            icon={<Psychology sx={{ fontSize: 40 }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="This Week"
            value={stats.thisWeekSessions}
            icon={<Schedule sx={{ fontSize: 40 }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Students Helped"
            value={stats.studentsHelped}
            icon={<People sx={{ fontSize: 40 }} />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Active Programs"
            value={stats.wellnessPrograms}
            icon={<HealthAndSafety sx={{ fontSize: 40 }} />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Pending Appointments"
            value={stats.pendingAppointments}
            icon={<EventNote sx={{ fontSize: 40 }} />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Completed Sessions"
            value={stats.completedSessions}
            icon={<TrendingUp sx={{ fontSize: 40 }} />}
            color="success"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Upcoming Sessions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Sessions
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {upcomingSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>{session.student}</TableCell>
                        <TableCell>{session.time}</TableCell>
                        <TableCell>{session.type}</TableCell>
                        <TableCell>
                          <Chip 
                            label={session.status} 
                            size="small" 
                            color={session.status === 'Confirmed' ? 'success' : 'warning'} 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                View All Sessions
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Wellness Programs */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Wellness Programs
              </Typography>
              <Stack spacing={2}>
                {wellnessPrograms.map((program, index) => (
                  <Box key={index}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight={500}>
                        {program.name}
                      </Typography>
                      <Chip 
                        label={program.status} 
                        size="small" 
                        color={program.status === 'Active' ? 'success' : 'default'} 
                      />
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      {program.participants} participants
                    </Typography>
                  </Box>
                ))}
              </Stack>
              <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                Manage Programs
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<EventNote />}
                    onClick={() => window.location.href = '/wellness/sessions'}
                  >
                    Schedule Session
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<HealthAndSafety />}
                    onClick={() => window.location.href = '/wellness/programs'}
                  >
                    Wellness Programs
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Psychology />}
                    onClick={() => window.location.href = '/counselling'}
                  >
                    Counselling Records
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<TrendingUp />}
                    onClick={() => window.location.href = '/wellness/reports'}
                  >
                    View Reports
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WellnessDashboard; 