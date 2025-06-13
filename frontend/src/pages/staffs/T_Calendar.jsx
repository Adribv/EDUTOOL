import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import staffService from '../../services/staffService';

const T_Calendar = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await staffService.getCalendarEvents();
      setEvents(response.data);
    } catch {
      setError('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

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
        Staff Calendar
      </Typography>

      <Paper sx={{ p: 3 }}>
        <List>
          {events.map((event) => (
            <>
              <ListItem key={event.id} alignItems="flex-start">
                <ListItemText
                  primary={event.title}
                  secondary={`${event.date} | ${event.time}`}
                />
                <Chip label={event.type} color="primary" size="small" />
              </ListItem>
              <Divider component="li" />
            </>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default T_Calendar; 