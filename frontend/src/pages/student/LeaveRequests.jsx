import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Event,
  Schedule,
  CheckCircle,
  Warning,
  Pending,
  Add,
} from '@mui/icons-material';
import studentService from '../../services/studentService';
import { toast } from 'react-toastify';

const LeaveRequests = () => {
  const [loading, setLoading] = useState(true);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    type: 'sick',
  });

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await studentService.getLeaveRequests();
      setLeaveRequests(response.data || []);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLeaveRequest = async () => {
    try {
      await studentService.submitLeaveRequest(newRequest);
      toast.success('Leave request submitted successfully');
      setSubmitDialogOpen(false);
      setNewRequest({ startDate: '', endDate: '', reason: '', type: 'sick' });
      fetchLeaveRequests();
    } catch (error) {
      console.error('Error submitting leave request:', error);
      toast.error('Failed to submit leave request');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle color="success" />;
      case 'pending':
        return <Pending color="warning" />;
      case 'rejected':
        return <Warning color="error" />;
      default:
        return <Event color="primary" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Leave Requests
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Submit and track your leave applications
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setSubmitDialogOpen(true)}
          >
            New Leave Request
          </Button>
        </Box>

        <Grid container spacing={3}>
          {leaveRequests.map((request, index) => (
            <Grid item xs={12} md={6} lg={4} key={request._id || request.id || index}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    {getStatusIcon(request.status)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {request.type} Leave
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {request.reason}
                  </Typography>
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body2">
                      <Schedule sx={{ fontSize: 16, mr: 0.5 }} />
                      {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                    </Typography>
                    <Chip
                      label={request.status}
                      color={getStatusColor(request.status)}
                      size="small"
                    />
                  </Box>
                  
                  {request.comments && (
                    <Typography variant="body2" color="textSecondary">
                      Comments: {request.comments}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {leaveRequests.length === 0 && (
          <Box textAlign="center" py={4}>
            <Event sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              No leave requests found
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Submit a new leave request to get started
            </Typography>
          </Box>
        )}

        {/* Submit Leave Request Dialog */}
        <Dialog
          open={submitDialogOpen}
          onClose={() => setSubmitDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Submit Leave Request
          </DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Leave Type</InputLabel>
              <Select
                value={newRequest.type}
                label="Leave Type"
                onChange={(e) => setNewRequest({ ...newRequest, type: e.target.value })}
              >
                <MenuItem value="sick">Sick Leave</MenuItem>
                <MenuItem value="personal">Personal Leave</MenuItem>
                <MenuItem value="emergency">Emergency Leave</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={newRequest.startDate}
              onChange={(e) => setNewRequest({ ...newRequest, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ mt: 2 }}
            />
            
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={newRequest.endDate}
              onChange={(e) => setNewRequest({ ...newRequest, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ mt: 2 }}
            />
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Reason"
              value={newRequest.reason}
              onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSubmitDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitLeaveRequest}
              variant="contained"
              disabled={!newRequest.startDate || !newRequest.endDate || !newRequest.reason.trim()}
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default LeaveRequests; 