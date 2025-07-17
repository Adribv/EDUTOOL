import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { parentAPI } from '../../services/api';
import {
  Person,
  School,
  Assignment,
  Event,
  Notifications,
  Assessment,
  Add,
  TrendingUp,
  Schedule,
  Payment,
  Assignment as ConsentIcon,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';

const Dashboard = () => {
  const navigate = useNavigate();

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['parent_dashboard'],
    queryFn: parentAPI.getDashboard,
  });

  // Fetch events that have consent forms
  const { data: eventsWithConsentForms } = useQuery({
    queryKey: ['eventsWithConsentForms'],
    queryFn: async () => {
      try {
        const events = await adminAPI.getEvents();
        return events.filter(event => event.status === 'Approved');
      } catch (error) {
        console.error('Error fetching events:', error);
        return [];
      }
    },
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load dashboard data. Please try again.
        </Alert>
      </Box>
    );
  }

  const data = dashboardData || {
    children: [],
    upcomingEvents: [],
    recentAssignments: [],
    notifications: [],
    feeStatus: [],
    attendanceSummary: [],
  };

  const hasChildren = data.children && data.children.length > 0;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Parent Dashboard
      </Typography>

      {!hasChildren ? (
        <Paper sx={{ p: 4, textAlign: 'center', mb: 3 }}>
          <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Welcome to Your Parent Portal
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            To get started, you need to link your child(ren) to your account.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<Add />}
            onClick={() => navigate('/parent/children')}
            sx={{ mt: 2 }}
          >
            Link Your Child
          </Button>
        </Paper>
      ) : (
        <>
          {/* Children Overview */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                My Children
              </Typography>
            </Grid>
            {data.children.map((child) => (
              <Grid item xs={12} sm={6} md={4} key={child._id}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{child.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Class {child.class}-{child.section}
                        </Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">
                        Roll No: {child.rollNumber}
                      </Typography>
                      <Chip 
                        label="Active" 
                        color="success" 
                        size="small" 
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Quick Stats */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Assignment sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                    <Box>
                      <Typography variant="h4">
                        {data.recentAssignments?.length || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pending Assignments
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Event sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                    <Box>
                      <Typography variant="h4">
                        {data.upcomingEvents?.length || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Upcoming Events
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Notifications sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                    <Box>
                      <Typography variant="h4">
                        {data.notifications?.length || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        New Notifications
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Payment sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
                    <Box>
                      <Typography variant="h4">
                        {data.feeStatus?.filter(f => f.status === 'Pending').length || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pending Fees
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Activities */}
          <Grid container spacing={3}>
            {/* Recent Assignments */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Assignments
                  </Typography>
                  {data.recentAssignments && data.recentAssignments.length > 0 ? (
                    <List>
                      {data.recentAssignments.slice(0, 5).map((assignment) => (
                        <ListItem key={assignment._id} divider>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <Assignment />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={assignment.title}
                            secondary={`${assignment.subject} - Due: ${new Date(assignment.dueDate).toLocaleDateString()}`}
                          />
                          <Chip 
                            label={assignment.status} 
                            color={assignment.status === 'Submitted' ? 'success' : 'warning'}
                            size="small"
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      No recent assignments
                    </Typography>
                  )}
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/parent/assignments')}
                    sx={{ mt: 2 }}
                  >
                    View All Assignments
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Upcoming Events */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Upcoming Events
                  </Typography>
                  {data.upcomingEvents && data.upcomingEvents.length > 0 ? (
                    <List>
                      {data.upcomingEvents.slice(0, 5).map((event) => (
                        <ListItem key={event._id} divider>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'secondary.main' }}>
                              <Event />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={event.title}
                            secondary={`${new Date(event.startDate).toLocaleDateString()} - ${event.venue}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      No upcoming events
                    </Typography>
                  )}
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/parent/calendar')}
                    sx={{ mt: 2 }}
                  >
                    View Calendar
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Consent Forms */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Consent Forms
                  </Typography>
                  {eventsWithConsentForms && eventsWithConsentForms.length > 0 ? (
                    <List>
                      {eventsWithConsentForms.slice(0, 5).map((event) => (
                        <ListItem key={event._id} divider>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'warning.main' }}>
                              <ConsentIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={event.title}
                            secondary={`Event Date: ${new Date(event.date).toLocaleDateString()}`}
                            action={
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => navigate(`/parent/consent-form/${event._id}`)}
                              >
                                Fill Form
                              </Button>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      No consent forms available
                    </Typography>
                  )}
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/parent/consent-forms')}
                    sx={{ mt: 2 }}
                  >
                    View All Consent Forms
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Teacher Remarks */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Teacher Remarks
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    View teacher remarks and syllabus completion for your children
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/parent/teacher-remarks')}
                    sx={{ mt: 2 }}
                    startIcon={<Assessment />}
                  >
                    View Teacher Remarks
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Dashboard; 