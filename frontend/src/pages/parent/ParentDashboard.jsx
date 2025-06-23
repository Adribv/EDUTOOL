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
  LocationOn,
  AccessTime,
} from '@mui/icons-material';
import { parentAPI } from '../../services/api';

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
    queryKey: ['parent_dashboard'],
    queryFn: parentAPI.getDashboard,
    enabled: !!children && children.length > 0,
  });
  
  const handleChildChange = (event, newValue) => {
    setSelectedChild(children[newValue]);
  };

  const isLoading = childrenLoading || dashboardLoading;
  const error = childrenError || dashboardError;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
            value={Math.max(0, children.findIndex(c => c._id === selectedChild?._id))}
            onChange={handleChildChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="child selector"
          >
            {children.map(child => (
              <Tab 
                key={`child-tab-${child._id}`}
                label={
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, mr: 1 }} src={child.profilePhoto}>
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
              title="Total Children"
              value={dashboardData.totalChildren || 0}
              icon={<Person color="primary" />}
              color="primary.main"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Announcements"
              value={dashboardData.announcements?.length || 0}
              icon={<Notifications color="secondary" />}
              color="secondary.main"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Upcoming Events"
              value={dashboardData.upcomingEvents?.length || 0}
              icon={<Event color="error" />}
              color="error.main"
            />
          </Grid>

          {/* Selected Child Details */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Selected Child Details</Typography>
                <Box display="flex" alignItems="center" p={2} border={1} borderColor="divider" borderRadius={1}>
                  <Avatar sx={{ width: 60, height: 60, mr: 3 }} src={selectedChild.profilePhoto}>
                    {selectedChild.name.charAt(0)}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="h5" gutterBottom>{selectedChild.name}</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Roll Number</Typography>
                        <Typography variant="body1" fontWeight="medium">{selectedChild.rollNumber}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Class</Typography>
                        <Typography variant="body1" fontWeight="medium">{selectedChild.class}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Section</Typography>
                        <Typography variant="body1" fontWeight="medium">{selectedChild.section}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Status</Typography>
                        <Chip 
                          label={selectedChild.status || 'Active'} 
                          color={selectedChild.status === 'Active' ? 'success' : 'default'}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* All Children List */}
          {dashboardData.children && dashboardData.children.length > 1 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>All Your Children</Typography>
                  <Grid container spacing={2}>
                    {dashboardData.children.map((child) => (
                      <Grid item xs={12} sm={6} md={4} key={child._id}>
                        <Box 
                          display="flex" 
                          alignItems="center" 
                          p={2} 
                          border={1} 
                          borderColor={selectedChild._id === child._id ? "primary.main" : "divider"} 
                          borderRadius={1}
                          sx={{ 
                            backgroundColor: selectedChild._id === child._id ? "primary.50" : "transparent",
                            cursor: "pointer"
                          }}
                          onClick={() => setSelectedChild(child)}
                        >
                          <Avatar sx={{ width: 40, height: 40, mr: 2 }} src={child.profilePhoto}>
                            {child.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="medium">{child.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Class {child.class} - {child.section}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Roll: {child.rollNumber}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}
          
          {/* Recent Announcements */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Recent Announcements</Typography>
              {dashboardData.announcements && dashboardData.announcements.length > 0 ? (
                <List>
                  {dashboardData.announcements.slice(0, 5).map((announcement, index) => (
                    <ListItem key={`announcement-${announcement._id || index}`} divider={index < (dashboardData.announcements?.length || 0) - 1}>
                      <ListItemIcon>
                        <Notifications color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle2" fontWeight="medium">
                              {announcement.title}
                            </Typography>
                            <Chip 
                              label={announcement.priority} 
                              size="small" 
                              color={announcement.priority === 'Urgent' ? 'error' : announcement.priority === 'High' ? 'warning' : 'default'}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {announcement.content}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(announcement.publishedAt)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography color="text.secondary">No announcements available</Typography>
                </Box>
              )}
            </Paper>
          </Grid>
          
          {/* Upcoming Events */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Upcoming Events</Typography>
              {dashboardData.upcomingEvents && dashboardData.upcomingEvents.length > 0 ? (
                <List>
                  {dashboardData.upcomingEvents.slice(0, 5).map((event, index) => (
                    <ListItem key={`event-${event._id || index}`} divider={index < (dashboardData.upcomingEvents?.length || 0) - 1}>
                      <ListItemIcon>
                        <Event color="secondary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle2" fontWeight="medium">
                              {event.title}
                            </Typography>
                            <Chip 
                              label={event.status} 
                              size="small" 
                              color={event.status === 'Scheduled' ? 'primary' : 'default'}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {event.description}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <CalendarToday fontSize="small" />
                                <Typography variant="caption">
                                  {formatDate(event.startDate)}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <LocationOn fontSize="small" />
                                <Typography variant="caption">
                                  {event.venue}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography color="text.secondary">No upcoming events</Typography>
                </Box>
              )}
            </Paper>
          </Grid>

        </Grid>
      )}
    </Box>
  );
};

export default ParentDashboard; 