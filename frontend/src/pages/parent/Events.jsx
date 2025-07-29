import React, { useState, useEffect } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Event as EventIcon,
  School as SchoolIcon,
  Sports as SportsIcon,
  Celebration as CelebrationIcon,
  Assignment as AssignmentIcon,
  CalendarToday,
  LocationOn,
  Person,
  AccessTime,
  Assignment as ConsentIcon,
  Description,
  Close,
  CheckCircle,
  HourglassEmpty,
} from '@mui/icons-material';
import { parentAPI, consentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Events = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [eventSummary, setEventSummary] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDialog, setEventDialog] = useState(false);
  const [consentForms, setConsentForms] = useState({});

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await parentAPI.getSchoolCalendar();
      console.log('📅 Raw events data:', response);
      
      const eventsData = Array.isArray(response) ? response : (response.data || []);
      console.log('📊 Processed events:', eventsData);
      
      // Filter out transport events and only show regular events
      const filteredEvents = eventsData.filter(event => event.eventType !== 'Transport');
      
      setEvents(filteredEvents);
      
      // Calculate event summary
      const summary = filteredEvents.reduce((acc, event) => {
        const type = event.eventType || 'Other';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      setEventSummary(summary);
      
      // Fetch consent forms for events that have them
      await fetchConsentForms(filteredEvents);
      
      console.log('📈 Event summary:', summary);
    } catch (err) {
      console.error('❌ Error fetching events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchConsentForms = async (eventsList) => {
    try {
      const consentFormsData = {};
      
      // Fetch consent forms for each event
      for (const event of eventsList) {
        try {
          const consentForm = await consentAPI.getForm(event._id);
          if (consentForm) {
            consentFormsData[event._id] = consentForm;
          }
        } catch (error) {
          // Consent form doesn't exist for this event, which is fine
          console.log(`No consent form for event ${event._id}`);
        }
      }
      
      setConsentForms(consentFormsData);
    } catch (error) {
      console.error('Error fetching consent forms:', error);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setEventDialog(true);
  };

  const handleCloseDialog = () => {
    setEventDialog(false);
    setSelectedEvent(null);
  };

  const handleFillConsentForm = (eventId) => {
    // Navigate to consent form page
    window.location.href = `/parent/consent-form/${eventId}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not specified';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Date format error';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Time not specified';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid time';
      
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting time:', dateString, error);
      return 'Time format error';
    }
  };

  const getEventTypeColor = (eventType) => {
    const colors = {
      'Academic': 'primary',
      'Exam': 'error',
      'Holiday': 'warning',
      'Event': 'success',
      'Meeting': 'info',
      'Other': 'default'
    };
    return colors[eventType] || 'default';
  };

  const getEventTypeIcon = (eventType) => {
    switch (eventType) {
      case 'Academic':
        return <SchoolIcon />;
      case 'Exam':
        return <AssignmentIcon />;
      case 'Sports':
        return <SportsIcon />;
      case 'Cultural':
        return <CelebrationIcon />;
      default:
        return <EventIcon />;
    }
  };

  const getConsentFormStatus = (eventId) => {
    const consentForm = consentForms[eventId];
    if (!consentForm) return null;
    
    return {
      status: consentForm.status,
      color: consentForm.status === 'completed' ? 'success' : 
             consentForm.status === 'awaitingParent' ? 'warning' : 'default',
      icon: consentForm.status === 'completed' ? <CheckCircle /> : <HourglassEmpty />,
      label: consentForm.status === 'completed' ? 'Completed' : 
             consentForm.status === 'awaitingParent' ? 'Awaiting Response' : 'Draft'
    };
  };

  const filterEventsByType = (eventType) => {
    if (eventType === 'All') return events;
    
    return events.filter(event => {
      const type = event.eventType || 'Other';
      // For academic events, include Academic, Exam, and Meeting types
      if (eventType === 'Academic') {
        return ['Academic', 'Exam', 'Meeting'].includes(type);
      }
      return type === eventType;
    });
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const tabLabels = ['All', 'Academic', 'Exam', 'Holiday', 'Event', 'Meeting'];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  const filteredEvents = filterEventsByType(tabLabels[selectedTab]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        School Events & Calendar
      </Typography>

      {/* Event Summary */}
      {Object.keys(eventSummary).length > 0 && (
        <Card sx={{ mb: 3, backgroundColor: '#f5f5f5' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Event Summary
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {Object.entries(eventSummary).map(([type, count]) => (
                <Chip
                  key={type}
                  label={`${type}: ${count}`}
                  color={getEventTypeColor(type)}
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          {tabLabels.map((label) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>
      </Box>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <Alert severity="info">
          No events found for the selected category.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredEvents.map((event) => {
            const consentFormStatus = getConsentFormStatus(event._id);
            
            return (
              <Grid item xs={12} md={6} lg={4} key={event._id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: event.isHoliday ? '2px solid #ff9800' : '1px solid #e0e0e0',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    }
                  }}
                  onClick={() => handleEventClick(event)}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', flex: 1 }}>
                        {event.title}
                      </Typography>
                      <Chip
                        label={event.eventType || 'Other'}
                        color={getEventTypeColor(event.eventType)}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Box>

                    {event.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {event.description}
                      </Typography>
                    )}

                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} />
                        <Typography variant="body2">
                          {formatDate(event.startDate)}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" mb={1}>
                        <AccessTime sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} />
                        <Typography variant="body2">
                          {formatTime(event.startDate)} - {formatTime(event.endDate)}
                        </Typography>
                      </Box>

                      {event.venue && (
                        <Box display="flex" alignItems="center" mb={1}>
                          <LocationOn sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} />
                          <Typography variant="body2">
                            {event.venue}
                          </Typography>
                        </Box>
                      )}

                      {event.organizer && (
                        <Box display="flex" alignItems="center" mb={1}>
                          <Person sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} />
                          <Typography variant="body2">
                            {event.organizer}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {event.isHoliday && (
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        This is a school holiday
                      </Alert>
                    )}

                    {/* Consent form status */}
                    {consentFormStatus && (
                      <Box sx={{ mt: 2, p: 1, bgcolor: 'primary.light', borderRadius: 1 }}>
                        <Typography variant="body2" color="white" sx={{ display: 'flex', alignItems: 'center' }}>
                          <ConsentIcon sx={{ mr: 1, fontSize: 16 }} />
                          Consent Form: {consentFormStatus.label}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Event Details Dialog */}
      <Dialog 
        open={eventDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {selectedEvent?.title}
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box>
              <Box display="flex" alignItems="center" mb={2}>
                {getEventTypeIcon(selectedEvent.eventType)}
                <Chip
                  label={selectedEvent.eventType || 'Other'}
                  color={getEventTypeColor(selectedEvent.eventType)}
                  sx={{ ml: 2 }}
                />
              </Box>

              <Typography variant="body1" paragraph>
                {selectedEvent.description}
              </Typography>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <CalendarToday sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      <strong>Date:</strong> {formatDate(selectedEvent.startDate)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <AccessTime sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      <strong>Time:</strong> {formatTime(selectedEvent.startDate)} - {formatTime(selectedEvent.endDate)}
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

              {/* Consent form details */}
              {consentForms[selectedEvent._id] && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Consent Form Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2">
                        <strong>Status:</strong> {getConsentFormStatus(selectedEvent._id)?.label}
                      </Typography>
                    </Grid>
                    {consentForms[selectedEvent._id].purpose && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2">
                          <strong>Purpose:</strong> {consentForms[selectedEvent._id].purpose}
                        </Typography>
                      </Grid>
                    )}
                    {consentForms[selectedEvent._id].dateFrom && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2">
                          <strong>From:</strong> {formatDate(consentForms[selectedEvent._id].dateFrom)}
                        </Typography>
                      </Grid>
                    )}
                    {consentForms[selectedEvent._id].dateTo && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2">
                          <strong>To:</strong> {formatDate(consentForms[selectedEvent._id].dateTo)}
                        </Typography>
                      </Grid>
                    )}
                    {consentForms[selectedEvent._id].venue && (
                      <Grid item xs={12}>
                        <Typography variant="body2">
                          <strong>Venue:</strong> {consentForms[selectedEvent._id].venue}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {consentForms[selectedEvent?._id] && (
            <Button
              variant="contained"
              startIcon={<ConsentIcon />}
              onClick={() => {
                handleFillConsentForm(selectedEvent._id);
                handleCloseDialog();
              }}
            >
              {getConsentFormStatus(selectedEvent?._id)?.status === 'completed' ? 'View Form' : 'Fill Consent Form'}
            </Button>
          )}
          <Button onClick={handleCloseDialog}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Events; 