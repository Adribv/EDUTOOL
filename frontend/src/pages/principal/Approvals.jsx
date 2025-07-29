import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Event as EventIcon,
  Announcement as AnnouncementIcon,
  TrendingUp as FeeIcon,
  Notifications as NotificationIcon,
  History as HistoryIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { principalAPI } from '../../services/api';

const Approvals = () => {
  const [approvals, setApprovals] = useState([]);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [rejectionDialog, setRejectionDialog] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [comments, setComments] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch all approvals (not just pending ones) to show in all tabs
      const response = await principalAPI.getAllApprovals();
      console.log('📋 All approvals data:', response.data);
      setApprovals(response.data);
    } catch (err) {
      console.error('❌ Error fetching approvals:', err);
      setError('Failed to load approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'error';
      case 'Pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleApprove = async () => {
    if (!selectedApproval) return;

    try {
      setProcessing(true);
      await principalAPI.approveRequest(selectedApproval._id, { comments });
      setApprovalDialog(false);
      setComments('');
      setSelectedApproval(null);
      fetchApprovals(); // Refresh the list
    } catch (err) {
      console.error('Error approving request:', err);
      setError('Failed to approve request');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApproval) return;

    try {
      setProcessing(true);
      await principalAPI.rejectRequest(selectedApproval._id, { comments });
      setRejectionDialog(false);
      setComments('');
      setSelectedApproval(null);
      fetchApprovals(); // Refresh the list
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError('Failed to reject request');
    } finally {
      setProcessing(false);
    }
  };

  const openApprovalDialog = (approval) => {
    setSelectedApproval(approval);
    setApprovalDialog(true);
  };

  const openRejectionDialog = (approval) => {
    setSelectedApproval(approval);
    setRejectionDialog(true);
  };

  const openDetailsDialog = (approval) => {
    setSelectedApproval(approval);
    setDetailsDialog(true);
  };

  const filteredApprovals = () => {
    const tabFilters = ['Pending', 'Approved', 'Rejected'];
    return approvals.filter(approval => approval.status === tabFilters[selectedTab]);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Approval Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label={`Pending (${approvals.filter(a => a.status === 'Pending').length})`} />
          <Tab label={`Approved (${approvals.filter(a => a.status === 'Approved').length})`} />
          <Tab label={`Rejected (${approvals.filter(a => a.status === 'Rejected').length})`} />
        </Tabs>
      </Box>

      {/* Approvals Table */}
      <Card>
        <CardHeader
          title="Approval Requests"
          action={
            <Button
              startIcon={<FilterIcon />}
              variant="outlined"
              size="small"
            >
              Filter
            </Button>
          }
        />
        <CardContent>
          {filteredApprovals().length === 0 ? (
            <Alert severity="info">
              No {selectedTab === 0 ? 'pending' : selectedTab === 1 ? 'approved' : 'rejected'} approvals found.
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Requested By</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredApprovals().map((approval) => (
                    <TableRow key={approval._id}>
                      <TableCell>{approval.requestType}</TableCell>
                      <TableCell>
                        {approval.requestType === 'ServiceRequest' ? (
                          <>
                            {approval.requestData?.dutyType} - {approval.requestData?.staffName}
                          </>
                        ) : (
                          approval.title
                        )}
                      </TableCell>
                      <TableCell>{approval.requesterId?.name || 'Unknown'}</TableCell>
                      <TableCell>{approval.requesterId?.department?.name || '-'}</TableCell>
                      <TableCell>
                        {approval.requestType === 'ServiceRequest'
                          ? approval.requestData?.date
                          : new Date(approval.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip label={approval.status} color={getStatusColor(approval.status)} size="small" />
                      </TableCell>
                      <TableCell>
                        {approval.status === 'Pending' && approval.currentApprover === 'Principal' && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton color="success" onClick={() => openApprovalDialog(approval)}>
                                <ApproveIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton color="error" onClick={() => openRejectionDialog(approval)}>
                                <RejectIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        <Tooltip title="View Details">
                          <IconButton onClick={() => openDetailsDialog(approval)}>
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Approve Request</DialogTitle>
        <DialogContent>
          {selectedApproval && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedApproval.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedApproval.description}
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Requested by:</strong> {selectedApproval.requestedBy?.name}
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Type:</strong> {selectedApproval.requestType}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Comments (Optional)"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add any comments about this approval..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialog(false)} disabled={processing}>
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            color="success"
            variant="contained"
            disabled={processing}
            startIcon={processing ? <CircularProgress size={16} /> : <ApproveIcon />}
          >
            {processing ? 'Approving...' : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialog} onClose={() => setRejectionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Request</DialogTitle>
        <DialogContent>
          {selectedApproval && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedApproval.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedApproval.description}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Rejection Reason *"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                required
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectionDialog(false)} disabled={processing}>
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            color="error"
            variant="contained"
            disabled={processing || !comments.trim()}
            startIcon={processing ? <CircularProgress size={16} /> : <RejectIcon />}
          >
            {processing ? 'Rejecting...' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Request Details</DialogTitle>
        <DialogContent>
          {selectedApproval && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedApproval.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedApproval.description}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Request Type:</strong> {selectedApproval.requestType}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Status:</strong> {selectedApproval.status}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Requested By:</strong> {selectedApproval.requestedBy?.name}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Department:</strong> {selectedApproval.department?.name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Created:</strong> {new Date(selectedApproval.createdAt).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Updated:</strong> {new Date(selectedApproval.updatedAt).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>

              {selectedApproval.approvalHistory && selectedApproval.approvalHistory.length > 0 && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    Approval History
                  </Typography>
                  <List>
                    {selectedApproval.approvalHistory.map((history, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          {history.status === 'Approved' ? (
                            <ApproveIcon color="success" />
                          ) : history.status === 'Rejected' ? (
                            <RejectIcon color="error" />
                          ) : (
                            <HistoryIcon color="primary" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={`${history.status} by ${history.role}`}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                {new Date(history.timestamp).toLocaleString()}
                              </Typography>
                              {history.comments && (
                                <Typography variant="body2" color="text.secondary">
                                  {history.comments}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Approvals; 