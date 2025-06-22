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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import staffService from '../../services/staffService';

const T_Class_Activities = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activities, setActivities] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newActivity, setNewActivity] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await staffService.getClassActivities();
      setActivities(response.data);
    } catch {
      setError('Failed to load class activities');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewActivity({ title: '', description: '' });
  };

  const handleChange = (e) => {
    setNewActivity({ ...newActivity, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await staffService.createClassActivity(newActivity);
      handleCloseDialog();
      fetchActivities();
    } catch {
      setError('Failed to create class activity');
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
        Class Activities
      </Typography>

      <Button variant="contained" color="primary" onClick={handleOpenDialog} sx={{ mb: 2 }}>
        Add New Activity
      </Button>

      <Paper sx={{ p: 3 }}>
        <List>
          {activities.map((activity) => (
            <>
              <ListItem key={activity.id} alignItems="flex-start">
                <ListItemText
                  primary={activity.title}
                  secondary={activity.description}
                />
              </ListItem>
              <Divider component="li" />
            </>
          ))}
        </List>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add New Activity</DialogTitle>
        <DialogContent>
          <TextField
            name="title"
            label="Title"
            value={newActivity.title}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            name="description"
            label="Description"
            value={newActivity.description}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
            minRows={2}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default T_Class_Activities; 