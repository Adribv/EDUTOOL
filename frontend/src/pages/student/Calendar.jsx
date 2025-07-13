import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Event,
  Assignment,
  School,
  Sports,
  Celebration,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import studentService from '../../services/studentService';

const Calendar = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDialog, setEventDialog] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await studentService.getCalendarEvents();
      console.log('📅 Calendar events response:', response);
      
      // Handle nested data structure similar to timetable
      const eventsData = Array.isArray(response?.data?.data) ? response.data.data :
                        Array.isArray(response?.data) ? response.data : [];
      
      console.log('📅 Processed events data:', eventsData);
      setEvents(eventsData);
    } catch (error) {
      console.error('❌ Error fetching calendar events:', error);
      toast.error('Failed to load calendar events');
      setEvents([]); // Set empty array to prevent map error
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'exam':
        return <Assignment />;
      case 'academic':
        return <School />;
      case 'sports':
        return <Sports />;
      case 'celebration':
        return <Celebration />;
      default:
        return <Event />;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'exam':
        return 'error';
      case 'academic':
        return 'primary';
      case 'sports':
        return 'success';
      case 'celebration':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setEventDialog(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Academic Calendar
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Events
            </Typography>
            <List>
              {Array.isArray(events) && events.length > 0 ? (
                events.map((event) => (
                  <ListItem
                    key={event.id}
                    button
                    onClick={() => handleEventClick(event)}
                    sx={{
                      mb: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <ListItemIcon>{getEventIcon(event.type)}</ListItemIcon>
                    <ListItemText
                      primary={event.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {new Date(event.date).toLocaleDateString()} at{' '}
                            {new Date(event.date).toLocaleTimeString()}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Location: {event.location}
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip
                      label={event.type}
                      color={getEventColor(event.type)}
                      size="small"
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary="No calendar events found"
                    secondary="Check back later for upcoming events"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Event Categories
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Assignment color="error" />
                </ListItemIcon>
                <ListItemText primary="Examinations" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <School color="primary" />
                </ListItemIcon>
                <ListItemText primary="Academic Events" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Sports color="success" />
                </ListItemIcon>
                <ListItemText primary="Sports Events" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Celebration color="warning" />
                </ListItemIcon>
                <ListItemText primary="Celebrations" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={eventDialog}
        onClose={() => setEventDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedEvent && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center">
                {getEventIcon(selectedEvent.type)}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {selectedEvent.title}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" paragraph>
                {selectedEvent.description}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Date & Time:
              </Typography>
              <Typography variant="body2" paragraph>
                {new Date(selectedEvent.date).toLocaleString()}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Location:
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedEvent.location}
              </Typography>
              {selectedEvent.organizer && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Organizer:
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {selectedEvent.organizer}
                  </Typography>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEventDialog(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default Calendar; 