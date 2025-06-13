import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Event as EventIcon,
  School as SchoolIcon,
  Sports as SportsIcon,
  Celebration as CelebrationIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import parentService from '../../services/parentService';

const Events = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await parentService.getUpcomingEvents();
      setEvents(response.data);
    } catch {
      setError('Failed to load events data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const getEventIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'academic':
        return <SchoolIcon />;
      case 'sports':
        return <SportsIcon />;
      case 'cultural':
        return <CelebrationIcon />;
      case 'exam':
        return <AssignmentIcon />;
      default:
        return <EventIcon />;
    }
  };

  const getEventColor = (type) => {
    switch (type.toLowerCase()) {
      case 'academic':
        return 'primary';
      case 'sports':
        return 'success';
      case 'cultural':
        return 'secondary';
      case 'exam':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredEvents = events.filter((event) => {
    if (selectedTab === 0) return true;
    return event.type.toLowerCase() === ['all', 'academic', 'sports', 'cultural', 'exam'][selectedTab];
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        School Events
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="All Events" />
          <Tab label="Academic" />
          <Tab label="Sports" />
          <Tab label="Cultural" />
          <Tab label="Exams" />
        </Tabs>

        <Grid container spacing={3}>
          {filteredEvents.map((event) => (
            <Grid item xs={12} md={6} key={event.id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <ListItemIcon>
                      {getEventIcon(event.type)}
                    </ListItemIcon>
                    <Typography variant="h6" sx={{ flex: 1 }}>
                      {event.title}
                    </Typography>
                    <Chip
                      label={event.type}
                      color={getEventColor(event.type)}
                      size="small"
                    />
                  </Box>

                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Date"
                        secondary={event.date}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Time"
                        secondary={event.time}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Location"
                        secondary={event.location}
                      />
                    </ListItem>
                    {event.description && (
                      <ListItem>
                        <ListItemText
                          primary="Description"
                          secondary={event.description}
                        />
                      </ListItem>
                    )}
                  </List>

                  {event.participants && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" gutterBottom>
                        Participants
                      </Typography>
                      <List dense>
                        {event.participants.map((participant) => (
                          <ListItem key={participant.id}>
                            <ListItemText
                              primary={participant.name}
                              secondary={participant.role}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default Events; 