import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Search, Visibility, CheckCircle, HourglassEmpty, Assignment } from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import ConsentFormViewer from '../../components/ConsentFormViewer';

const ConsentFormsList = ({ userRole = 'teacher' }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEventId, setSelectedEventId] = useState(null);

  // Fetch events with consent forms
  const { data: events, isLoading, error } = useQuery({
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'awaitingParent': return 'warning';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle />;
      case 'awaitingParent': return <HourglassEmpty />;
      case 'draft': return <Assignment />;
      default: return <Assignment />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'awaitingParent': return 'Awaiting Parent';
      case 'draft': return 'Draft';
      default: return 'No Form';
    }
  };

  const filteredEvents = events?.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  const handleViewConsentForm = (eventId) => {
    setSelectedEventId(eventId);
  };

  const handleBackToList = () => {
    setSelectedEventId(null);
  };

  const getRoleBasedActions = (event) => {
    if (userRole === 'parent') {
      return (
        <Button
          size="small"
          variant="contained"
          onClick={() => navigate(`/parent/consent-form/${event._id}`)}
        >
          Fill Form
        </Button>
      );
    } else if (userRole === 'admin') {
      return (
        <Button
          size="small"
          variant="outlined"
          onClick={() => navigate(`/admin/events/${event._id}/consent`)}
        >
          Edit Template
        </Button>
      );
    } else {
      return (
        <Button
          size="small"
          variant="outlined"
          startIcon={<Visibility />}
          onClick={() => handleViewConsentForm(event._id)}
        >
          View Form
        </Button>
      );
    }
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
      <Box p={3}>
        <Alert severity="error">
          Failed to load consent forms. Please try again.
        </Alert>
      </Box>
    );
  }

  if (selectedEventId) {
    return (
      <Box p={3}>
        <Button onClick={handleBackToList} sx={{ mb: 2 }}>
          ← Back to Consent Forms List
        </Button>
        <ConsentFormViewer eventId={selectedEventId} />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Event Consent Forms
      </Typography>

      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status Filter"
              >
                <MenuItem value="all">All Events</MenuItem>
                <MenuItem value="completed">Completed Forms</MenuItem>
                <MenuItem value="awaitingParent">Awaiting Parent</MenuItem>
                <MenuItem value="draft">Draft Forms</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Events Grid */}
      <Grid container spacing={3}>
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <Grid item xs={12} md={6} lg={4} key={event._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {event.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {event.description}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Venue:</strong> {event.venue || 'TBD'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Organizer:</strong> {event.organizer}
                    </Typography>
                  </Box>
                  <Chip
                    icon={getStatusIcon('awaitingParent')}
                    label={getStatusLabel('awaitingParent')}
                    color={getStatusColor('awaitingParent')}
                    size="small"
                  />
                </CardContent>
                <CardActions>
                  {getRoleBasedActions(event)}
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Events Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm ? 'No events match your search criteria.' : 'No events with consent forms available.'}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ConsentFormsList; 