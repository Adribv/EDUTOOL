import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import parentService from '../../services/parentService';

const P_Feedback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await parentService.getFeedbacks();
      setFeedbacks(response.data);
    } catch {
      setError('Failed to load feedback history');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await parentService.submitFeedback({ text: feedbackText });
      setFeedbackText('');
      fetchFeedbacks();
    } catch {
      setError('Failed to submit feedback');
    } finally {
      setSubmitting(false);
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

      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={10}>
              <TextField
                label="Your Feedback"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                fullWidth
                multiline
                minRows={2}
                required
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={submitting || !feedbackText.trim()}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Feedback History
        </Typography>
        <List>
          {feedbacks.map((fb) => (
            <>
              <ListItem key={fb.id} alignItems="flex-start">
                <ListItemText
                  primary={fb.text}
                  secondary={fb.date}
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

export default P_Feedback; 