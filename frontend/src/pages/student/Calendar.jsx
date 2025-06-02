import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  Event,
  Assignment,
  Sports,
  School,
  LocationOn,
  AccessTime,
  Person,
  CalendarToday,
  Close,
} from '@mui/icons-material';
import { studentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Calendar = () => {
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDialog, setEventDialog] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getCalendarEvents();
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setEventDialog(true);
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'academic':
        return <School />;
      case 'exam':
        return <Assignment />;
      case 'sports':
        return <Sports />;
      default:
        return <Event />;
    }
  };

  const getEventType = (type) => {
    switch (type) {
      case 'academic':
        return 'Academic';
      case 'exam':
        return 'Exam';
      case 'sports':
        return 'Sports';
      default:
        return type;
    }
  };

  const filterEvents = (type) => {
    return events.filter((event) => event.type === type);
  };

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
      <Typography variant="h4" sx={{ mb: 3 }}>
        School Calendar
      </Typography>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
        >
          <Tab icon={<Event />} label="All Events" />
          <Tab icon={<School />} label="Academic" />
          <Tab icon={<Assignment />} label="Exams" />
          <Tab icon={<Sports />} label="Sports" />
        </Tabs>
      </Box>

      {/* Events List */}
      <List>
        {(selectedTab === 0
          ? events
          : filterEvents(
              selectedTab === 1
                ? 'academic'
                : selectedTab === 2
                ? 'exam'
                : 'sports'
            )
        ).map((event) => (
          <Card key={event.id} sx={{ mb: 2 }}>
            <CardContent>
              <ListItem>
                <ListItemIcon>{getEventIcon(event.type)}</ListItemIcon>
                <ListItemText
                  primary={event.title}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {event.description}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          size="small"
                          icon={<CalendarToday />}
                          label={new Date(event.date).toLocaleDateString()}
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          size="small"
                          icon={<AccessTime />}
                          label={event.time}
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          size="small"
                          icon={<LocationOn />}
                          label={event.location}
                        />
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleViewEvent(event)}
                  >
                    <Event />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </CardContent>
          </Card>
        ))}
      </List>

      {/* Event Dialog */}
      <Dialog
        open={eventDialog}
        onClose={() => setEventDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {selectedEvent && (
              <>
                {getEventIcon(selectedEvent.type)}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {selectedEvent.title}
                </Typography>
              </>
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" paragraph>
                {selectedEvent.description}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Date and Time
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(selectedEvent.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {selectedEvent.time}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Location
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {selectedEvent.location}
                    </Typography>
                  </Box>
                </Grid>
                {selectedEvent.organizer && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Organizer
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Person sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {selectedEvent.organizer}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {selectedEvent.additionalInfo && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Additional Information
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Typography variant="body2">
                        {selectedEvent.additionalInfo}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Calendar; 