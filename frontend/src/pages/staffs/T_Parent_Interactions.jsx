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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import staffService from '../../services/staffService';

const T_Parent_Interactions = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newInteraction, setNewInteraction] = useState({
    studentId: '',
    type: '',
    description: '',
    date: '',
  });

  useEffect(() => {
    fetchInteractions();
  }, []);

  const fetchInteractions = async () => {
    try {
      const response = await staffService.getParentInteractions();
      setInteractions(response.data);
    } catch {
      setError('Failed to load parent interactions');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewInteraction({
      studentId: '',
      type: '',
      description: '',
      date: '',
    });
  };

  const handleChange = (e) => {
    setNewInteraction({ ...newInteraction, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await staffService.createParentInteraction(newInteraction);
      handleCloseDialog();
      fetchInteractions();
    } catch {
      setError('Failed to create parent interaction');
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
        Parent Interactions
      </Typography>

      <Button variant="contained" color="primary" onClick={handleOpenDialog} sx={{ mb: 2 }}>
        Record New Interaction
      </Button>

      <Paper sx={{ p: 3 }}>
        <List>
          {interactions.map((interaction) => (
            <>
              <ListItem key={interaction.id} alignItems="flex-start">
                <ListItemText
                  primary={`${interaction.studentName} - ${interaction.type}`}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        Date: {interaction.date}
                      </Typography>
                      <br />
                      {interaction.description}
                    </>
                  }
                />
              </ListItem>
              <Divider component="li" />
            </>
          ))}
        </List>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Record Parent Interaction</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Student</InputLabel>
            <Select
              name="studentId"
              value={newInteraction.studentId}
              onChange={handleChange}
              required
            >
              {interactions.map((interaction) => (
                <MenuItem key={interaction.studentId} value={interaction.studentId}>
                  {interaction.studentName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Interaction Type</InputLabel>
            <Select
              name="type"
              value={newInteraction.type}
              onChange={handleChange}
              required
            >
              <MenuItem value="meeting">Meeting</MenuItem>
              <MenuItem value="phone">Phone Call</MenuItem>
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="message">Message</MenuItem>
            </Select>
          </FormControl>
          <TextField
            name="description"
            label="Description"
            value={newInteraction.description}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            required
          />
          <TextField
            name="date"
            type="date"
            label="Date"
            value={newInteraction.date}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            InputLabelProps={{ shrink: true }}
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

export default T_Parent_Interactions; 