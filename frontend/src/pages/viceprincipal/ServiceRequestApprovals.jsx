import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Snackbar
} from '@mui/material';
import { api } from '../../services/api';

const ServiceRequestApprovals = () => {
  const [requests, setRequests] = useState([]);
  // const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState('');
  const [comments, setComments] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/vp/service-requests');
      setRequests(res.data || []);
    } catch {
      setRequests([]);
      setError('Failed to load service requests');
    } finally {
      // setLoading(false);
    }
  };

  const handleAction = (req, act) => {
    setSelected(req);
    setAction(act);
    setComments('');
  };

  const handleDialogClose = () => {
    setSelected(null);
    setAction('');
    setComments('');
  };

  const handleSubmit = async () => {
    if (!selected) return;
    try {
      const url = `/vp/service-requests/${selected._id}/${action}`;
      await api.post(url, { comments });
      setSnackbar({ open: true, message: `Request ${action}ed successfully`, severity: 'success' });
      fetchRequests();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Action failed', severity: 'error' });
    } finally {
      handleDialogClose();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>VP Service Request Approvals</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Staff Name</TableCell>
              <TableCell>Duty Type</TableCell>
              <TableCell>Time Slot</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Current Approver</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req._id}>
                <TableCell>{req.requestData?.date}</TableCell>
                <TableCell>{req.requestData?.staffName}</TableCell>
                <TableCell>{req.requestData?.dutyType}</TableCell>
                <TableCell>{req.requestData?.timeSlot}</TableCell>
                <TableCell>{req.status}</TableCell>
                <TableCell>{req.currentApprover}</TableCell>
                <TableCell>
                  {req.status === 'Pending' && req.currentApprover === 'VP' && (
                    <>
                      <Button variant="contained" color="success" size="small" sx={{ mr: 1 }} onClick={() => handleAction(req, 'approve')}>Approve</Button>
                      <Button variant="contained" color="error" size="small" onClick={() => handleAction(req, 'reject')}>Reject</Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={!!selected} onClose={handleDialogClose}>
        <DialogTitle>{action === 'approve' ? 'Approve' : 'Reject'} Service Request</DialogTitle>
        <DialogContent>
          <TextField
            label="Comments"
            value={comments}
            onChange={e => setComments(e.target.value)}
            fullWidth
            multiline
            rows={3}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color={action === 'approve' ? 'success' : 'error'}>
            {action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ServiceRequestApprovals; 