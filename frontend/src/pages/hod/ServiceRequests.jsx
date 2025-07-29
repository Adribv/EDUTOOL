import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
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
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Refresh as RefreshIcon,
  Assignment,
  Computer as ITIcon,
  Build as GeneralIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { hodAPI } from '../../services/api';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`service-requests-tabpanel-${index}`}
      aria-labelledby={`service-requests-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ServiceRequests = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [rejectionDialog, setRejectionDialog] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Queries
  const { data: leaveRequests, isLoading: leaveLoading } = useQuery({
    queryKey: ['hodLeaveRequests'],
    queryFn: hodAPI.getLeaveRequests,
    staleTime: 5 * 60 * 1000,
  });

  const { data: itRequests, isLoading: itLoading } = useQuery({
    queryKey: ['hodITRequests'],
    queryFn: hodAPI.getITSupportRequests,
    staleTime: 5 * 60 * 1000,
  });

  const { data: generalRequests, isLoading: generalLoading } = useQuery({
    queryKey: ['hodGeneralRequests'],
    queryFn: hodAPI.getGeneralServiceRequests,
    staleTime: 5 * 60 * 1000,
  });

  // Mutations
  const approveRequestMutation = useMutation({
    mutationFn: ({ requestId, requestType, feedback }) => 
      hodAPI.approveServiceRequest(requestType, requestId, { feedback }),
    onSuccess: () => {
      queryClient.invalidateQueries(['hodLeaveRequests']);
      queryClient.invalidateQueries(['hodITRequests']);
      queryClient.invalidateQueries(['hodGeneralRequests']);
      setApprovalDialog(false);
      setFeedback('');
      setSelectedRequest(null);
      toast.success('Request approved successfully');
    },
    onError: () => toast.error('Failed to approve request'),
  });

  const rejectRequestMutation = useMutation({
    mutationFn: ({ requestId, requestType, feedback }) => 
      hodAPI.rejectServiceRequest(requestType, requestId, { feedback }),
    onSuccess: () => {
      queryClient.invalidateQueries(['hodLeaveRequests']);
      queryClient.invalidateQueries(['hodITRequests']);
      queryClient.invalidateQueries(['hodGeneralRequests']);
      setRejectionDialog(false);
      setFeedback('');
      setSelectedRequest(null);
      toast.success('Request rejected successfully');
    },
    onError: () => toast.error('Failed to reject request'),
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setViewDialog(true);
  };

  const handleApprove = () => {
    if (!selectedRequest) return;
    
    const requestType = tabValue === 0 ? 'leave' : tabValue === 1 ? 'it-support' : 'general';
    approveRequestMutation.mutate({
      requestId: selectedRequest._id,
      requestType,
      feedback
    });
  };

  const handleReject = () => {
    if (!selectedRequest) return;
    
    const requestType = tabValue === 0 ? 'leave' : tabValue === 1 ? 'it-support' : 'general';
    rejectRequestMutation.mutate({
      requestId: selectedRequest._id,
      requestType,
      feedback
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      case 'In Progress': return 'info';
      case 'Resolved': return 'success';
      default: return 'default';
    }
  };

  const getRequestTypeIcon = (type) => {
    switch (type) {
      case 'leave': return <Assignment />;
      case 'it-support': return <ITIcon />;
      case 'general': return <GeneralIcon />;
      default: return <Assignment />;
    }
  };

  const renderRequestsTable = (requests, requestType) => {
    if (!requests || requests.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} align="center">
            <Typography variant="body2" color="text.secondary">
              No {requestType} requests found
            </Typography>
          </TableCell>
        </TableRow>
      );
    }

    return requests.map((request) => (
      <TableRow key={request._id}>
        <TableCell>
          <Box display="flex" alignItems="center">
            {getRequestTypeIcon(requestType)}
            <Typography variant="body2" sx={{ ml: 1 }}>
              {request.requestType || requestType}
            </Typography>
          </Box>
        </TableCell>
        <TableCell>{request.requesterName || request.staffName || 'N/A'}</TableCell>
        <TableCell>
          <Chip 
            label={request.status} 
            color={getStatusColor(request.status)}
            size="small"
          />
        </TableCell>
        <TableCell>
          {new Date(request.createdAt || request.submittedAt).toLocaleDateString()}
        </TableCell>
        <TableCell>
          <Tooltip title="View Details">
            <IconButton 
              size="small" 
              color="primary"
              onClick={() => handleViewRequest(request)}
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
          {request.status === 'Pending' && (
            <>
              <Tooltip title="Approve">
                <IconButton 
                  size="small" 
                  color="success"
                  onClick={() => {
                    setSelectedRequest(request);
                    setApprovalDialog(true);
                  }}
                >
                  <ApproveIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject">
                <IconButton 
                  size="small" 
                  color="error"
                  onClick={() => {
                    setSelectedRequest(request);
                    setRejectionDialog(true);
                  }}
                >
                  <RejectIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </TableCell>
      </TableRow>
    ));
  };

  if (leaveLoading || itLoading || generalLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600}>
          Service Requests Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => {
            queryClient.invalidateQueries(['hodLeaveRequests']);
            queryClient.invalidateQueries(['hodITRequests']);
            queryClient.invalidateQueries(['hodGeneralRequests']);
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
                              <Box display="flex" alignItems="center">
                  <Assignment color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="primary">
                    {leaveRequests?.filter(req => req.status === 'Pending').length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Leave Requests
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ITIcon color="secondary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="secondary">
                    {itRequests?.filter(req => req.status === 'Submitted' || req.status === 'In Progress').length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active IT Support Requests
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <GeneralIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="success.main">
                    {generalRequests?.filter(req => req.status === 'Pending').length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending General Requests
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Leave Requests" icon={<Assignment />} />
          <Tab label="IT Support Requests" icon={<ITIcon />} />
          <Tab label="General Service Requests" icon={<GeneralIcon />} />
        </Tabs>

        {/* Leave Requests Tab */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Request Type</TableCell>
                  <TableCell>Requester</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {renderRequestsTable(leaveRequests, 'leave')}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* IT Support Requests Tab */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Request Type</TableCell>
                  <TableCell>Requester</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {renderRequestsTable(itRequests, 'it-support')}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* General Service Requests Tab */}
        <TabPanel value={tabValue} index={2}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Request Type</TableCell>
                  <TableCell>Requester</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {renderRequestsTable(generalRequests, 'general')}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* View Request Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Request Details</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Requester</Typography>
                  <Typography variant="body1">{selectedRequest.requesterName || selectedRequest.staffName}</Typography>
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
                  <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                  <Typography variant="body1">
                    {new Date(selectedRequest.createdAt || selectedRequest.submittedAt).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body1">
                    {selectedRequest.reason || selectedRequest.issueDescription || selectedRequest.description || 'No description provided'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Approve Request</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Feedback (Optional)"
            multiline
            rows={4}
            margin="normal"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Add any comments or feedback..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialog(false)}>Cancel</Button>
          <Button onClick={handleApprove} variant="contained" color="success">
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialog} onClose={() => setRejectionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Request</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Rejection Reason"
            multiline
            rows={4}
            margin="normal"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Please provide a reason for rejection..."
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectionDialog(false)}>Cancel</Button>
          <Button onClick={handleReject} variant="contained" color="error">
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServiceRequests; 