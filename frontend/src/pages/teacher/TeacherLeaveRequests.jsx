import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar
} from '@mui/material';
import {
  Add,
  Event,
  Schedule,
  CheckCircle,
  Cancel,
  Warning,
  Visibility,
  Close,
  CalendarToday,
  AccessTime,
  Person,
  Assignment
} from '@mui/icons-material';
import { teacherAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const TeacherLeaveRequests = () => {
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState(0);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newRequest, setNewRequest] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    attachmentUrl: ''
  });

  // Fetch leave requests
  const { data: leaveRequests = [], isLoading, error } = useQuery({
    queryKey: ['teacherLeaveRequests'],
    queryFn: teacherAPI.getMyLeaveRequests
  });

  // Fetch statistics
  const { data: statistics = {} } = useQuery({
    queryKey: ['teacherLeaveStatistics'],
    queryFn: teacherAPI.getMyLeaveStatistics
  });

  // Submit leave request mutation
  const submitMutation = useMutation({
    mutationFn: teacherAPI.submitMyLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries(['teacherLeaveRequests']);
      queryClient.invalidateQueries(['teacherLeaveStatistics']);
      toast.success('Leave request submitted successfully');
      handleCloseSubmitDialog();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit leave request');
    }
  });

  // Cancel leave request mutation
  const cancelMutation = useMutation({
    mutationFn: teacherAPI.cancelMyLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries(['teacherLeaveRequests']);
      queryClient.invalidateQueries(['teacherLeaveStatistics']);
      toast.success('Leave request cancelled successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to cancel leave request');
    }
  });

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleSubmitLeaveRequest = () => {
    if (!newRequest.leaveType || !newRequest.startDate || !newRequest.endDate || !newRequest.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    submitMutation.mutate(newRequest);
  };

  const handleCloseSubmitDialog = () => {
    setSubmitDialogOpen(false);
    setNewRequest({
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: '',
      attachmentUrl: ''
    });
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setDetailsDialogOpen(true);
  };

  const handleCancelRequest = (requestId) => {
    if (window.confirm('Are you sure you want to cancel this leave request?')) {
      cancelMutation.mutate(requestId);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      case 'Pending': return 'warning';
      case 'Cancelled': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return <CheckCircle />;
      case 'Rejected': return <Cancel />;
      case 'Pending': return <Schedule />;
      case 'Cancelled': return <Close />;
      default: return <Event />;
    }
  };

  const getDaysCount = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Filter requests based on selected tab
  const getFilteredRequests = () => {
    if (selectedTab === 0) return leaveRequests;
    if (selectedTab === 1) return leaveRequests.filter(req => req.status === 'Pending');
    if (selectedTab === 2) return leaveRequests.filter(req => req.status === 'Approved');
    if (selectedTab === 3) return leaveRequests.filter(req => req.status === 'Rejected');
    if (selectedTab === 4) return leaveRequests.filter(req => req.status === 'Cancelled');
    return leaveRequests;
  };

  const filteredRequests = getFilteredRequests();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error">Failed to load leave requests: {error.message}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Teacher's Leave Requests
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setSubmitDialogOpen(true)}
        >
          New Leave Request
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {statistics.total || 0}
                  </Typography>
                  <Typography variant="body2">Total Requests</Typography>
                </Box>
                <Event sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {statistics.pending || 0}
                  </Typography>
                  <Typography variant="body2">Pending</Typography>
                </Box>
                <Schedule sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {statistics.approved || 0}
                  </Typography>
                  <Typography variant="body2">Approved</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {statistics.rejected || 0}
                  </Typography>
                  <Typography variant="body2">Rejected</Typography>
                </Box>
                <Cancel sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        sx={{ mb: 3 }}
      >
        <Tab 
          label={
            <Badge badgeContent={leaveRequests.length} color="primary">
              All Requests
            </Badge>
          } 
        />
        <Tab 
          label={
            <Badge badgeContent={statistics.pending || 0} color="warning">
              Pending
            </Badge>
          } 
        />
        <Tab 
          label={
            <Badge badgeContent={statistics.approved || 0} color="success">
              Approved
            </Badge>
          } 
        />
        <Tab 
          label={
            <Badge badgeContent={statistics.rejected || 0} color="error">
              Rejected
            </Badge>
          } 
        />
        <Tab 
          label={
            <Badge badgeContent={statistics.cancelled || 0} color="default">
              Cancelled
            </Badge>
          } 
        />
      </Tabs>

      {/* Leave Requests Table */}
      {filteredRequests.length > 0 ? (
        <Card>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Leave Period</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRequests.map((request) => {
                    const daysCount = getDaysCount(request.startDate, request.endDate);
                    
                    return (
                      <TableRow key={request._id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {new Date(request.startDate).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              to {new Date(request.endDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2">
                            {daysCount} day{daysCount !== 1 ? 's' : ''}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Chip
                            label={request.leaveType}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        
                        <TableCell>
                          <Chip
                            label={request.status}
                            color={getStatusColor(request.status)}
                            size="small"
                            icon={getStatusIcon(request.status)}
                          />
                        </TableCell>
                        
                        <TableCell>
                          <Box>
                            <Tooltip title="View Details">
                              <IconButton 
                                size="small" 
                                onClick={() => handleViewDetails(request)}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            
                            {request.status === 'Pending' && (
                              <Tooltip title="Cancel Request">
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleCancelRequest(request._id)}
                                >
                                  <Cancel />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Event sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                No leave requests found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Submit a new leave request to get started
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Submit Leave Request Dialog */}
      <Dialog 
        open={submitDialogOpen} 
        onClose={handleCloseSubmitDialog} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Submit Leave Request</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Leave Type</InputLabel>
            <Select
              value={newRequest.leaveType}
              label="Leave Type"
              onChange={(e) => setNewRequest({ ...newRequest, leaveType: e.target.value })}
            >
              <MenuItem value="Sick">Sick Leave</MenuItem>
              <MenuItem value="Casual">Casual Leave</MenuItem>
              <MenuItem value="Maternity">Maternity Leave</MenuItem>
              <MenuItem value="Paternity">Paternity Leave</MenuItem>
              <MenuItem value="Study">Study Leave</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
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
          
          <TextField
            fullWidth
            label="Attachment URL (Optional)"
            value={newRequest.attachmentUrl}
            onChange={(e) => setNewRequest({ ...newRequest, attachmentUrl: e.target.value })}
            sx={{ mt: 2 }}
            helperText="Provide a link to any supporting documents"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSubmitDialog}>Cancel</Button>
          <Button
            onClick={handleSubmitLeaveRequest}
            variant="contained"
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? <CircularProgress size={20} /> : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Leave Request Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={() => setDetailsDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Leave Request Details</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardHeader title="Request Information" />
                  <CardContent>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><Event /></ListItemIcon>
                        <ListItemText 
                          primary="Leave Type" 
                          secondary={selectedRequest.leaveType}
                        />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon><CalendarToday /></ListItemIcon>
                        <ListItemText 
                          primary="Leave Period" 
                          secondary={`${new Date(selectedRequest.startDate).toLocaleDateString()} to ${new Date(selectedRequest.endDate).toLocaleDateString()}`}
                        />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon><AccessTime /></ListItemIcon>
                        <ListItemText 
                          primary="Duration" 
                          secondary={`${getDaysCount(selectedRequest.startDate, selectedRequest.endDate)} day(s)`}
                        />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon><Assignment /></ListItemIcon>
                        <ListItemText 
                          primary="Reason" 
                          secondary={selectedRequest.reason}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardHeader title="Status Information" />
                  <CardContent>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <Chip
                            label={selectedRequest.status}
                            color={getStatusColor(selectedRequest.status)}
                            size="small"
                            icon={getStatusIcon(selectedRequest.status)}
                          />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Status" 
                          secondary={selectedRequest.status}
                        />
                      </ListItem>
                      
                      {selectedRequest.processedBy && (
                        <ListItem>
                          <ListItemIcon><Person /></ListItemIcon>
                          <ListItemText 
                            primary="Processed By" 
                            secondary={selectedRequest.processedBy.name}
                          />
                        </ListItem>
                      )}
                      
                      {selectedRequest.processedAt && (
                        <ListItem>
                          <ListItemIcon><CalendarToday /></ListItemIcon>
                          <ListItemText 
                            primary="Processed At" 
                            secondary={new Date(selectedRequest.processedAt).toLocaleDateString()}
                          />
                        </ListItem>
                      )}
                      
                      {selectedRequest.hodComments && (
                        <ListItem>
                          <ListItemIcon><Assignment /></ListItemIcon>
                          <ListItemText 
                            primary="Comments" 
                            secondary={selectedRequest.hodComments}
                          />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherLeaveRequests; 