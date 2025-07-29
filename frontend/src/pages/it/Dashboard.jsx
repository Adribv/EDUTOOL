import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Chip, CircularProgress, Alert, Tabs, Tab } from '@mui/material';
import { api } from '../../services/api';
import { 
  filterDashboardTabsByActivitiesControl, 
  useUserActivitiesControl,
  getActivityNameFromTabLabel,
  getAccessLevelInfo
} from '../../utils/activitiesControl';

// IT Dashboard tabs configuration
const allITDashboardTabs = [
  { label: 'IT Support Requests', key: 'support-requests' },
  { label: 'System Reports', key: 'system-reports' },
  { label: 'User Management', key: 'user-management' },
  { label: 'System Settings', key: 'system-settings' },
];

const ITDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  // Activities control hook
  const { hasAccess, canEdit, canApprove, getAccessLevel } = useUserActivitiesControl();

  // Filter tabs based on activities control
  const itDashboardTabs = useMemo(() => {
    return filterDashboardTabsByActivitiesControl(allITDashboardTabs, 'ITAdmin');
  }, [hasAccess]);

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

  // Check access for current tab
  const currentTab = itDashboardTabs[activeTab];
  const activityName = currentTab ? getActivityNameFromTabLabel(currentTab.label, 'ITAdmin') : '';
  const accessLevelInfo = getAccessLevelInfo(activityName);

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">Failed to load IT support requests</Alert>;

  // Check if user has access to current tab
  if (!hasAccess(activityName, 'View')) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          <Typography variant="h6" gutterBottom>
            Access Restricted
          </Typography>
          <Typography>
            You don't have permission to access {currentTab?.label}. 
            Please contact your Vice Principal for access.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Separate solved and unsolved
  const solved = requests.filter(r => r.status === 'Resolved' || r.status === 'Closed');
  const unsolved = requests.filter(r => r.status !== 'Resolved' && r.status !== 'Closed');

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>IT Support Dashboard</Typography>
        <Chip 
          label={accessLevelInfo.label}
          color={accessLevelInfo.color}
          size="small"
        />
      </Box>
      
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
        {itDashboardTabs.map((tab, index) => (
          <Tab key={tab.key} label={tab.label} />
        ))}
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
                  {activeTab === 0 && canEdit(activityName) && (
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
          >
            Resolve
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ITDashboard; 