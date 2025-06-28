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
} from '@mui/icons-material';
import parentService from '../../services/parentService';

const Events = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [eventSummary, setEventSummary] = useState({});

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await parentService.getUpcomingEvents();
      console.log('📅 Raw events data:', response);
      
      const eventsData = Array.isArray(response) ? response : (response.data || []);
      console.log('📊 Processed events:', eventsData);
      
      setEvents(eventsData);
      
      // Calculate event summary
      const summary = eventsData.reduce((acc, event) => {
        const type = event.eventType || 'Other';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      setEventSummary(summary);
      
      console.log('📈 Event summary:', summary);
    } catch (err) {
      console.error('❌ Error fetching events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
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
          {filteredEvents.map((event) => (
            <Grid item xs={12} md={6} lg={4} key={event._id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: event.isHoliday ? '2px solid #ff9800' : '1px solid #e0e0e0'
                }}
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
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Debug Info */}
      {import.meta.env.DEV && (
        <Box sx={{ mt: 4, p: 2, backgroundColor: '#f0f0f0', borderRadius: 1 }}>
          <Typography variant="h6">Debug Info:</Typography>
          <Typography variant="body2">Total events: {events.length}</Typography>
          <Typography variant="body2">Filtered events: {filteredEvents.length}</Typography>
          <Typography variant="body2">Selected tab: {tabLabels[selectedTab]}</Typography>
          <Typography variant="body2">Event types: {[...new Set(events.map(e => e.eventType))].join(', ')}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default Events; 