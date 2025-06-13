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

const T_Leave = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newLeaveRequest, setNewLeaveRequest] = useState({ reason: '', fromDate: '', toDate: '' });

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const response = await staffService.getLeaveRequests();
      setLeaveRequests(response.data);
    } catch {
      setError('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewLeaveRequest({ reason: '', fromDate: '', toDate: '' });
  };

  const handleChange = (e) => {
    setNewLeaveRequest({ ...newLeaveRequest, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await staffService.submitLeaveRequest(newLeaveRequest);
      handleCloseDialog();
      fetchLeaveRequests();
    } catch {
      setError('Failed to submit leave request');
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
        Leave Requests
      </Typography>

      <Button variant="contained" color="primary" onClick={handleOpenDialog} sx={{ mb: 2 }}>
        Submit Leave Request
      </Button>

      <Paper sx={{ p: 3 }}>
        <List>
          {leaveRequests.map((request) => (
            <>
              <ListItem key={request.id} alignItems="flex-start">
                <ListItemText
                  primary={request.reason}
                  secondary={`From: ${request.fromDate} To: ${request.toDate}`}
                />
              </ListItem>
              <Divider component="li" />
            </>
          ))}
        </List>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Submit Leave Request</DialogTitle>
        <DialogContent>
          <TextField
            name="reason"
            label="Reason"
            value={newLeaveRequest.reason}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            name="fromDate"
            label="From Date"
            type="date"
            value={newLeaveRequest.fromDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            name="toDate"
            label="To Date"
            type="date"
            value={newLeaveRequest.toDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
            margin="normal"
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

export default T_Leave; 