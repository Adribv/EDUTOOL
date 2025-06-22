import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Add,
  Close,
  Edit,
  Delete,
  Event,
  Class,
  Assignment,
  Assessment,
  Sports,
  LocationOn,
  AccessTime,
  Person,
  School,
} from '@mui/icons-material';
import { teacherAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Calendar = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedEvent, setEditedEvent] = useState(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'Class',
    date: '',
    time: '',
    duration: '',
    location: '',
    organizer: '',
    class: '',
    section: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getCalendarEvents();
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
  };

  const handleEditEvent = (event) => {
    setEditedEvent(event);
    setEditMode(true);
  };

  const handleSaveEvent = async () => {
    try {
      await teacherAPI.updateEvent(editedEvent.id, editedEvent);
      toast.success('Event updated successfully');
      setEditMode(false);
      setEditedEvent(null);
      fetchEvents();
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    }
  };

  const handleCreateEvent = async () => {
    try {
      await teacherAPI.createEvent(newEvent);
      toast.success('Event created successfully');
      setCreateDialog(false);
      setNewEvent({
        title: '',
        description: '',
        type: 'Class',
        date: '',
        time: '',
        duration: '',
        location: '',
        organizer: '',
        class: '',
        section: '',
      });
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await teacherAPI.deleteEvent(eventId);
        toast.success('Event deleted successfully');
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedEvent(null);
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'Class':
        return <Class />;
      case 'Assignment':
        return <Assignment />;
      case 'Exam':
        return <Assessment />;
      case 'Sports':
        return <Sports />;
      default:
        return <Event />;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'Class':
        return 'primary';
      case 'Assignment':
        return 'success';
      case 'Exam':
        return 'error';
      case 'Sports':
        return 'warning';
      default:
        return 'default';
    }
  };

  const filteredEvents = events.filter(event => {
    switch (selectedTab) {
      case 0: // All Events
        return true;
      case 1: // Classes
        return event.type === 'Class';
      case 2: // Exams
        return event.type === 'Exam';
      case 3: // Sports
        return event.type === 'Sports';
      default:
        return true;
    }
  });

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Calendar
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialog(true)}
        >
          Add Event
        </Button>
      </Box>

      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        sx={{ mb: 3 }}
      >
        <Tab label="All Events" />
        <Tab label="Classes" />
        <Tab label="Exams" />
        <Tab label="Sports" />
      </Tabs>

      <Grid container spacing={3}>
        {filteredEvents.map((event) => (
          <Grid item xs={12} md={6} key={event.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      sx={{
                        bgcolor: `${getEventColor(event.type)}.light`,
                        color: `${getEventColor(event.type)}.main`,
                        '&:hover': {
                          bgcolor: `${getEventColor(event.type)}.light`,
                        },
                      }}
                    >
                      {getEventIcon(event.type)}
                    </IconButton>
                    <Box>
                      <Typography variant="h6">
                        {event.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.description}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={event.type}
                    color={getEventColor(event.type)}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip
                    icon={<AccessTime />}
                    label={`${event.time} (${event.duration})`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    icon={<LocationOn />}
                    label={event.location}
                    size="small"
                    variant="outlined"
                  />
                  {event.class && event.section && (
                    <Chip
                      icon={<School />}
                      label={`${event.class} ${event.section}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleViewEvent(event)}
                  >
                    View
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleEditEvent(event)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Event Details Dialog */}
      <Dialog
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedEvent && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  {selectedEvent.title}
                </Typography>
                <IconButton onClick={() => setSelectedEvent(null)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Description
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedEvent.description}
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Type</Typography>
                  <Typography variant="body2">
                    {selectedEvent.type}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Date</Typography>
                  <Typography variant="body2">
                    {new Date(selectedEvent.date).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Time</Typography>
                  <Typography variant="body2">
                    {selectedEvent.time} ({selectedEvent.duration})
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Location</Typography>
                  <Typography variant="body2">
                    {selectedEvent.location}
                  </Typography>
                </Grid>
                {selectedEvent.class && selectedEvent.section && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Class</Typography>
                      <Typography variant="body2">
                        {selectedEvent.class}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Section</Typography>
                      <Typography variant="body2">
                        {selectedEvent.section}
                      </Typography>
                    </Grid>
                  </>
                )}
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Organizer</Typography>
                  <Typography variant="body2">
                    {selectedEvent.organizer}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedEvent(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog
        open={editMode}
        onClose={handleCancelEdit}
        maxWidth="sm"
        fullWidth
      >
        {editedEvent && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Edit Event</Typography>
                <IconButton onClick={handleCancelEdit}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    label="Title"
                    fullWidth
                    value={editedEvent.title}
                    onChange={(e) => setEditedEvent({ ...editedEvent, title: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={4}
                    value={editedEvent.description}
                    onChange={(e) => setEditedEvent({ ...editedEvent, description: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={editedEvent.type}
                      label="Type"
                      onChange={(e) => setEditedEvent({ ...editedEvent, type: e.target.value })}
                    >
                      <MenuItem value="Class">Class</MenuItem>
                      <MenuItem value="Assignment">Assignment</MenuItem>
                      <MenuItem value="Exam">Exam</MenuItem>
                      <MenuItem value="Sports">Sports</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Date"
                    type="date"
                    fullWidth
                    value={editedEvent.date}
                    onChange={(e) => setEditedEvent({ ...editedEvent, date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Time"
                    type="time"
                    fullWidth
                    value={editedEvent.time}
                    onChange={(e) => setEditedEvent({ ...editedEvent, time: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Duration"
                    fullWidth
                    value={editedEvent.duration}
                    onChange={(e) => setEditedEvent({ ...editedEvent, duration: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Location"
                    fullWidth
                    value={editedEvent.location}
                    onChange={(e) => setEditedEvent({ ...editedEvent, location: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Class"
                    fullWidth
                    value={editedEvent.class}
                    onChange={(e) => setEditedEvent({ ...editedEvent, class: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Section"
                    fullWidth
                    value={editedEvent.section}
                    onChange={(e) => setEditedEvent({ ...editedEvent, section: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Organizer"
                    fullWidth
                    value={editedEvent.organizer}
                    onChange={(e) => setEditedEvent({ ...editedEvent, organizer: e.target.value })}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelEdit}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleSaveEvent}
              >
                Save Changes
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create Event Dialog */}
      <Dialog
        open={createDialog}
        onClose={() => setCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Create Event</Typography>
            <IconButton onClick={() => setCreateDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                fullWidth
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={4}
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newEvent.type}
                  label="Type"
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                >
                  <MenuItem value="Class">Class</MenuItem>
                  <MenuItem value="Assignment">Assignment</MenuItem>
                  <MenuItem value="Exam">Exam</MenuItem>
                  <MenuItem value="Sports">Sports</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Time"
                type="time"
                fullWidth
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Duration"
                fullWidth
                value={newEvent.duration}
                onChange={(e) => setNewEvent({ ...newEvent, duration: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Location"
                fullWidth
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Class"
                fullWidth
                value={newEvent.class}
                onChange={(e) => setNewEvent({ ...newEvent, class: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Section"
                fullWidth
                value={newEvent.section}
                onChange={(e) => setNewEvent({ ...newEvent, section: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Organizer"
                fullWidth
                value={newEvent.organizer}
                onChange={(e) => setNewEvent({ ...newEvent, organizer: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateEvent}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Calendar; 