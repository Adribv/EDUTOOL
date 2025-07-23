import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Chip, CircularProgress, Alert, Tabs, Tab } from '@mui/material';
import { api } from '../../services/api';

const ITDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  // Fetch all IT support requests
  const { data: requests, isLoading, error, refetch } = useQuery({
    queryKey: ['allITSupportRequests'],
    queryFn: async () => {
      const res = await api.get('/teachers/all-it-support-requests');
      return res.data?.data || [];
    }
  });

  // Mutation to update a request (add comment, mark as solved)
  const updateRequest = useMutation({
    mutationFn: async ({ id, update }) => {
      await api.put(`/teachers/it-support-requests/${id}`, update);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allITSupportRequests']);
      setSelectedRequest(null);
      setComment('');
    }
  });

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">Failed to load IT support requests</Alert>;

  // Separate solved and unsolved
  const solved = requests.filter(r => r.status === 'Resolved' || r.status === 'Closed');
  const unsolved = requests.filter(r => r.status !== 'Resolved' && r.status !== 'Closed');

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>IT Support Dashboard</Typography>
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
        <Tab label={`Unsolved (${unsolved.length})`} />
        <Tab label={`Solved (${solved.length})`} />
      </Tabs>
      <Box sx={{ width: '100%', overflowX: 'auto', minWidth: 900 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Request Number</TableCell>
              <TableCell>Requester</TableCell>
              <TableCell>Issue</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(activeTab === 0 ? unsolved : solved).map(req => (
              <TableRow key={req._id}>
                <TableCell>{req.requestNumber}</TableCell>
                <TableCell>{req.requesterInfo?.name}</TableCell>
                <TableCell>{req.issueDescription}</TableCell>
                <TableCell>
                  <Chip label={req.status} color={req.status === 'Resolved' ? 'success' : 'warning'} />
                </TableCell>
                <TableCell>
                  {activeTab === 0 && (
                    <Button onClick={() => setSelectedRequest(req)}>Reply / Solve</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      {/* Reply/Solve Dialog */}
      <Dialog open={!!selectedRequest} onClose={() => setSelectedRequest(null)}>
        <DialogTitle>Reply to IT Support Request</DialogTitle>
        <DialogContent>
          <Typography>Issue: {selectedRequest?.issueDescription}</Typography>
          <TextField
            label="Comment"
            fullWidth
            multiline
            rows={3}
            value={comment}
            onChange={e => setComment(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedRequest(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => updateRequest.mutate({
              id: selectedRequest._id,
              update: {
                reply: comment,
                status: 'Resolved'
              }
            })}
            disabled={!comment}
          >
            Mark as Solved
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ITDashboard; 