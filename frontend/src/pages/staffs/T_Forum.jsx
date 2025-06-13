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

const T_Forum = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    try {
      const response = await staffService.getDiscussions();
      setDiscussions(response.data);
    } catch {
      setError('Failed to load forum discussions');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewDiscussion({ title: '', content: '' });
  };

  const handleChange = (e) => {
    setNewDiscussion({ ...newDiscussion, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await staffService.createDiscussion(newDiscussion);
      handleCloseDialog();
      fetchDiscussions();
    } catch {
      setError('Failed to create discussion');
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
        Forum Discussions
      </Typography>

      <Button variant="contained" color="primary" onClick={handleOpenDialog} sx={{ mb: 2 }}>
        Start New Discussion
      </Button>

      <Paper sx={{ p: 3 }}>
        <List>
          {discussions.map((discussion) => (
            <>
              <ListItem key={discussion.id} alignItems="flex-start">
                <ListItemText
                  primary={discussion.title}
                  secondary={discussion.content}
                />
              </ListItem>
              <Divider component="li" />
            </>
          ))}
        </List>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Start New Discussion</DialogTitle>
        <DialogContent>
          <TextField
            name="title"
            label="Title"
            value={newDiscussion.title}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            name="content"
            label="Content"
            value={newDiscussion.content}
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

export default T_Forum; 