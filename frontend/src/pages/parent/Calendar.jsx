import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Event,
  School,
  Assignment,
  Sports,
  Celebration,
  Close,
  CalendarMonth,
  Notifications,
  Description,
} from '@mui/icons-material';
import { parentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Calendar = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [calendarRes] = await Promise.all([
        parentAPI.getSchoolCalendar(),
      ]);
      setEvents(calendarRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleDetailsDialogOpen = (event) => {
    setSelectedEvent(event);
    setDetailsDialog(true);
  };

  const handleDetailsDialogClose = () => {
    setDetailsDialog(false);
    setSelectedEvent(null);
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'Academic':
        return <School color="primary" />;
      case 'Assignment':
        return <Assignment color="warning" />;
      case 'Sports':
        return <Sports color="success" />;
      case 'Cultural':
        return <Celebration color="secondary" />;
      default:
        return <Event color="info" />;
    }
  };

  const getEventTypeChip = (type) => {
    switch (type) {
      case 'Academic':
        return <Chip label="Academic" color="primary" size="small" />;
      case 'Assignment':
        return <Chip label="Assignment" color="warning" size="small" />;
      case 'Sports':
        return <Chip label="Sports" color="success" size="small" />;
      case 'Cultural':
        return <Chip label="Cultural" color="secondary" size="small" />;
      default:
        return <Chip label={type} color="default" size="small" />;
    }
  };

  const filteredEvents = events.filter(event => {
    switch (selectedTab) {
      case 0: // All Events
        return true;
      case 1: // Academic
        return event.type === 'Academic';
      case 2: // Assignments
        return event.type === 'Assignment';
      case 3: // Sports & Cultural
        return event.type === 'Sports' || event.type === 'Cultural';
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
      <Typography variant="h4" sx={{ mb: 3 }}>
        School Calendar
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Event color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Events</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {events.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <School color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Academic Events</Typography>
              </Box>
              <Typography variant="h4" color="warning">
                {events.filter(event => event.type === 'Academic').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assignment color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Upcoming Deadlines</Typography>
              </Box>
              <Typography variant="h4" color="info">
                {events.filter(event => event.type === 'Assignment').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Events" />
          <Tab label="Academic" />
          <Tab label="Assignments" />
          <Tab label="Sports & Cultural" />
        </Tabs>
      </Paper>

      {/* Events Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Event</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEvents.map((event, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getEventTypeIcon(event.type)}
                    <Typography sx={{ ml: 1 }}>{event.title}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{getEventTypeChip(event.type)}</TableCell>
                <TableCell>
                  {new Date(event.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{event.time}</TableCell>
                <TableCell>{event.location}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleDetailsDialogOpen(event)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Event Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={handleDetailsDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Event Details
          <IconButton
            onClick={handleDetailsDialogClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getEventTypeIcon(selectedEvent.type)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {selectedEvent.title}
                    </Typography>
                  </Box>
                  {getEventTypeChip(selectedEvent.type)}
                </Grid>

                <Grid item xs={12}>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarMonth />
                      </ListItemIcon>
                      <ListItemText
                        primary="Date & Time"
                        secondary={`${new Date(selectedEvent.date).toLocaleDateString()} at ${selectedEvent.time}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Description />
                      </ListItemIcon>
                      <ListItemText
                        primary="Description"
                        secondary={selectedEvent.description}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Notifications />
                      </ListItemIcon>
                      <ListItemText
                        primary="Additional Information"
                        secondary={selectedEvent.additionalInfo || 'No additional information available'}
                      />
                    </ListItem>
                  </List>
                </Grid>

                {selectedEvent.requirements && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Requirements
                    </Typography>
                    <List>
                      {selectedEvent.requirements.map((requirement, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={requirement} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDetailsDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Calendar; 