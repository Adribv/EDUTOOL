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
} from '@mui/material';
import staffService from '../../services/staffService';

const T_Feedback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await staffService.getFeedbacks();
      setFeedbacks(response.data);
    } catch {
      setError('Failed to load feedback data');
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
        Feedback
      </Typography>

      <Paper sx={{ p: 3 }}>
        <List>
          {feedbacks.map((feedback) => (
            <>
              <ListItem key={feedback.id} alignItems="flex-start">
                <ListItemText
                  primary={feedback.title}
                  secondary={feedback.description}
                />
              </ListItem>
              <Divider component="li" />
            </>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default T_Feedback; 