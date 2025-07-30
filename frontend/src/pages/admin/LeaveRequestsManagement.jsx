import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { api } from '../../services/api';
import { toast } from 'react-toastify';

const LeaveRequestsManagement = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both staff and student leave requests
      const [staffResponse, studentResponse] = await Promise.all([
        api.get('/admin-staff/leave-requests'),
        api.get('/admin-staff/student-leave-requests')
      ]);

      const staffRequests = staffResponse.data || [];
      const studentRequests = studentResponse.data || [];

      // Combine and format the requests
      const allRequests = [
        ...staffRequests.map(req => ({ ...req, type: 'Staff' })),
        ...studentRequests.map(req => ({ ...req, type: 'Student' }))
      ];

      setLeaveRequests(allRequests);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      setError('Failed to load leave requests');
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setDetailsDialog(true);
  };

  const handleCloseDetails = () => {
    setDetailsDialog(false);
    setSelectedRequest(null);
  };

  const handleApprove = async (requestId) => {
    try {
      const endpoint = selectedRequest.type === 'Staff' 
        ? `/admin-staff/leave-requests/${requestId}/approve`
        : `/admin-staff/student-leave-requests/${requestId}/approve`;
      
      await api.put(endpoint, { status: 'Approved' });
      toast.success('Leave request approved successfully');
      fetchLeaveRequests();
      handleCloseDetails();
    } catch (error) {
      console.error('Error approving leave request:', error);
      toast.error('Failed to approve leave request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      const endpoint = selectedRequest.type === 'Staff' 
        ? `/admin-staff/leave-requests/${requestId}/reject`
        : `/admin-staff/student-leave-requests/${requestId}/reject`;
      
      await api.put(endpoint, { status: 'Rejected' });
      toast.success('Leave request rejected successfully');
      fetchLeaveRequests();
      handleCloseDetails();
    } catch (error) {
      console.error('Error rejecting leave request:', error);
      toast.error('Failed to reject leave request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  };

  const getFilteredRequests = () => {
    let filtered = leaveRequests;

    // Filter by tab (Staff/Student)
    if (activeTab === 0) {
      filtered = filtered.filter(req => req.type === 'Staff');
    } else if (activeTab === 1) {
      filtered = filtered.filter(req => req.type === 'Student');
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(req => req.status === filterStatus);
    }

    return filtered;
  };

  const filteredRequests = getFilteredRequests();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Leave Requests Management
      </Typography>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon />
                Staff Leave Requests
                <Chip 
                  label={leaveRequests.filter(req => req.type === 'Staff').length} 
                  size="small" 
                  color="primary" 
                />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventIcon />
                Student Leave Requests
                <Chip 
                  label={leaveRequests.filter(req => req.type === 'Student').length} 
                  size="small" 
                  color="primary" 
                />
              </Box>
            } 
          />
        </Tabs>
      </Paper>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold">
                {filteredRequests.filter(req => req.status === 'Pending').length}
              </Typography>
              <Typography variant="body2">Pending</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold">
                {filteredRequests.filter(req => req.status === 'Approved').length}
              </Typography>
              <Typography variant="body2">Approved</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'error.light', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold">
                {filteredRequests.filter(req => req.status === 'Rejected').length}
              </Typography>
              <Typography variant="body2">Rejected</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.light', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold">
                {filteredRequests.length}
              </Typography>
              <Typography variant="body2">Total</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Requests Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {activeTab === 0 ? 'Staff' : 'Student'} Leave Requests
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {request.staffName || request.studentName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {request.employeeId || request.rollNumber}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={request.leaveType || request.type} 
                        size="small" 
                        color="primary" 
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(request.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(request.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {request.reason}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={request.status} 
                        color={getStatusColor(request.status)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewDetails(request)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        {request.status === 'Pending' && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => handleApprove(request._id)}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleReject(request._id)}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRequests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No leave requests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsDialog} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        <DialogTitle>
          Leave Request Details
          {selectedRequest && (
            <Chip 
              label={selectedRequest.type} 
              color="primary" 
              size="small" 
              sx={{ ml: 2 }}
            />
          )}
        </DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedRequest.staffName || selectedRequest.studentName}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">ID</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedRequest.employeeId || selectedRequest.rollNumber}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Leave Type</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedRequest.leaveType || selectedRequest.type}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Chip 
                  label={selectedRequest.status} 
                  color={getStatusColor(selectedRequest.status)} 
                  size="small" 
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Start Date</Typography>
                <Typography variant="body1" gutterBottom>
                  {new Date(selectedRequest.startDate).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">End Date</Typography>
                <Typography variant="body1" gutterBottom>
                  {new Date(selectedRequest.endDate).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Reason</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedRequest.reason}
                </Typography>
              </Grid>
              {selectedRequest.comments && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Comments</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRequest.comments}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
          {selectedRequest && selectedRequest.status === 'Pending' && (
            <>
              <Button 
                color="success" 
                variant="contained"
                onClick={() => handleApprove(selectedRequest._id)}
              >
                Approve
              </Button>
              <Button 
                color="error" 
                variant="contained"
                onClick={() => handleReject(selectedRequest._id)}
              >
                Reject
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveRequestsManagement; 