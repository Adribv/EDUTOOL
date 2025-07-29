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
  LocalShipping,
  Download,
  Person,
  LocationOn,
  AccessTime,
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

  const handleDownloadTransportForm = async (formId, studentName) => {
    try {
      toast.info('Downloading transport form PDF...');
      
      const pdfBlob = await parentAPI.downloadAdminTransportFormPDF(formId);
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Admin_Transport_Form_${studentName}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Transport form PDF downloaded successfully');
      
    } catch (error) {
      console.error('Error downloading transport form PDF:', error);
      toast.error('Failed to download transport form PDF');
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
      case 'Transport':
        return <LocalShipping color="info" />;
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
      case 'Transport':
        return <Chip label="Transport" color="info" size="small" />;
      default:
        return <Chip label={type} color="default" size="small" />;
    }
  };

  const filteredEvents = events.filter(event => {
    switch (selectedTab) {
      case 0: // All Events
        return true;
      case 1: // Academic
        return event.eventType === 'Academic';
      case 2: // Assignments
        return event.eventType === 'Assignment';
      case 3: // Sports & Cultural
        return event.eventType === 'Sports' || event.eventType === 'Cultural';
      case 4: // Transport
        return event.eventType === 'Transport';
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
          <Tab label="Transport" />
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
                    {getEventTypeIcon(event.eventType)}
                    <Typography sx={{ ml: 1 }}>{event.title}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{getEventTypeChip(event.eventType)}</TableCell>
                <TableCell>
                  {new Date(event.startDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                  {new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </TableCell>
                <TableCell>{event.venue}</TableCell>
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
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {selectedEvent?.title}
            </Typography>
            <IconButton onClick={handleDetailsDialogClose}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box>
              <Box display="flex" alignItems="center" mb={2}>
                {getEventTypeIcon(selectedEvent.eventType)}
                {getEventTypeChip(selectedEvent.eventType)}
              </Box>

              <Typography variant="body1" paragraph>
                {selectedEvent.description}
              </Typography>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <CalendarMonth sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      <strong>Date:</strong> {new Date(selectedEvent.startDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <AccessTime sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      <strong>Time:</strong> {new Date(selectedEvent.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                      {new Date(selectedEvent.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                </Grid>
                {selectedEvent.venue && (
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <LocationOn sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        <strong>Location:</strong> {selectedEvent.venue}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {selectedEvent.organizer && (
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Person sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        <strong>Organizer:</strong> {selectedEvent.organizer}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>

              {/* Transport form specific details */}
              {selectedEvent.eventType === 'Transport' && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Transport Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2">
                        <strong>Student:</strong> {selectedEvent.studentName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2">
                        <strong>Roll Number:</strong> {selectedEvent.rollNumber}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2">
                        <strong>Pickup:</strong> {selectedEvent.pickupLocation}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2">
                        <strong>Drop:</strong> {selectedEvent.dropLocation}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2">
                        <strong>Pickup Time:</strong> {selectedEvent.pickupTime}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2">
                        <strong>Drop Time:</strong> {selectedEvent.dropTime}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Purpose:</strong> {selectedEvent.purpose}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedEvent?.eventType === 'Transport' && selectedEvent?.hasPDF && (
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={() => {
                handleDownloadTransportForm(selectedEvent.transportFormId, selectedEvent.studentName);
                handleDetailsDialogClose();
              }}
            >
              Download PDF
            </Button>
          )}
          <Button onClick={handleDetailsDialogClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Calendar; 