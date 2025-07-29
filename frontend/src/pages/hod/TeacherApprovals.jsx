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
  IconButton,
  Tooltip,
  CircularProgress,
  Divider,
  Badge
} from '@mui/material';
import {
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Refresh as RefreshIcon,
  Assignment as LessonPlanIcon,
  Event as LeaveIcon,
  Download as DownloadIcon
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
      id={`teacher-approvals-tabpanel-${index}`}
      aria-labelledby={`teacher-approvals-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const TeacherApprovals = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [rejectionDialog, setRejectionDialog] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Queries
  const { data: lessonPlans, isLoading: lessonPlansLoading } = useQuery({
    queryKey: ['hodLessonPlansForApproval'],
    queryFn: hodAPI.getLessonPlansForReview,
    staleTime: 5 * 60 * 1000,
  });

  const { data: teacherLeaveRequests, isLoading: leaveRequestsLoading } = useQuery({
    queryKey: ['hodTeacherLeaveRequests'],
    queryFn: hodAPI.getTeacherLeaveRequests,
    staleTime: 5 * 60 * 1000,
  });

  // Mutations
  const approveLessonPlanMutation = useMutation({
    mutationFn: ({ planId, feedback }) => 
      hodAPI.reviewLessonPlan(planId, { status: 'HOD_Approved', feedback }),
    onSuccess: () => {
      queryClient.invalidateQueries(['hodLessonPlansForApproval']);
      queryClient.invalidateQueries(['hodLessonPlanHistory']);
      setApprovalDialog(false);
      setFeedback('');
      setSelectedRequest(null);
      toast.success('Lesson plan approved and forwarded to Principal');
    },
    onError: () => toast.error('Failed to approve lesson plan'),
  });

  const rejectLessonPlanMutation = useMutation({
    mutationFn: ({ planId, feedback }) => 
      hodAPI.reviewLessonPlan(planId, { status: 'Rejected', feedback }),
    onSuccess: () => {
      queryClient.invalidateQueries(['hodLessonPlansForApproval']);
      queryClient.invalidateQueries(['hodLessonPlanHistory']);
      setRejectionDialog(false);
      setFeedback('');
      setSelectedRequest(null);
      toast.success('Lesson plan rejected');
    },
    onError: () => toast.error('Failed to reject lesson plan'),
  });

  const approveLeaveRequestMutation = useMutation({
    mutationFn: ({ requestId, feedback }) => 
      hodAPI.approveTeacherLeaveRequest(requestId, { status: 'Approved', comments: feedback }),
    onSuccess: () => {
      queryClient.invalidateQueries(['hodTeacherLeaveRequests']);
      setApprovalDialog(false);
      setFeedback('');
      setSelectedRequest(null);
      toast.success('Leave request approved');
    },
    onError: () => toast.error('Failed to approve leave request'),
  });

  const rejectLeaveRequestMutation = useMutation({
    mutationFn: ({ requestId, feedback }) => 
      hodAPI.rejectTeacherLeaveRequest(requestId, { status: 'Rejected', comments: feedback }),
    onSuccess: () => {
      queryClient.invalidateQueries(['hodTeacherLeaveRequests']);
      setRejectionDialog(false);
      setFeedback('');
      setSelectedRequest(null);
      toast.success('Leave request rejected');
    },
    onError: () => toast.error('Failed to reject leave request'),
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
    
    if (tabValue === 0) {
      // Lesson Plan Approval
      approveLessonPlanMutation.mutate({
        planId: selectedRequest._id,
        feedback
      });
    } else {
      // Leave Request Approval
      approveLeaveRequestMutation.mutate({
        requestId: selectedRequest._id,
        feedback
      });
    }
  };

  const handleReject = () => {
    if (!selectedRequest) return;
    
    if (tabValue === 0) {
      // Lesson Plan Rejection
      rejectLessonPlanMutation.mutate({
        planId: selectedRequest._id,
        feedback
      });
    } else {
      // Leave Request Rejection
      rejectLeaveRequestMutation.mutate({
        requestId: selectedRequest._id,
        feedback
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      case 'HOD_Approved': return 'info';
      case 'Principal_Approved': return 'success';
      case 'Published': return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Pending': return 'Pending HOD Approval';
      case 'HOD_Approved': return 'Pending Principal Approval';
      case 'Principal_Approved': return 'Approved by Principal';
      case 'Published': return 'Published';
      case 'Rejected': return 'Rejected';
      default: return status;
    }
  };

  const renderLessonPlansTable = () => {
    const pendingPlans = lessonPlans?.filter(plan => plan.status === 'Pending') || [];
    
    if (pendingPlans.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} align="center">
            <Typography variant="body2" color="text.secondary">
              No lesson plans pending approval
            </Typography>
          </TableCell>
        </TableRow>
      );
    }

    return pendingPlans.map((plan) => (
      <TableRow key={plan._id}>
        <TableCell>
          <Box display="flex" alignItems="center">
            <LessonPlanIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="body2">
              {plan.title || 'Untitled Lesson Plan'}
            </Typography>
          </Box>
        </TableCell>
        <TableCell>{plan.submittedBy?.name || 'Unknown Teacher'}</TableCell>
        <TableCell>{plan.subject || 'N/A'}</TableCell>
        <TableCell>{plan.class || 'N/A'}</TableCell>
        <TableCell>
          <Chip 
            label={getStatusLabel(plan.status)} 
            color={getStatusColor(plan.status)}
            size="small"
          />
        </TableCell>
        <TableCell>
          <Tooltip title="View Details">
            <IconButton 
              size="small" 
              color="primary"
              onClick={() => handleViewRequest(plan)}
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
          {plan.fileUrl && (
            <Tooltip title="Download">
              <IconButton 
                size="small" 
                color="secondary"
                onClick={() => window.open(plan.fileUrl, '_blank')}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Approve">
            <IconButton 
              size="small" 
              color="success"
              onClick={() => {
                setSelectedRequest(plan);
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
                setSelectedRequest(plan);
                setRejectionDialog(true);
              }}
            >
              <RejectIcon />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
    ));
  };

  const renderLeaveRequestsTable = () => {
    const pendingRequests = teacherLeaveRequests?.filter(req => req.status === 'Pending') || [];
    
    if (pendingRequests.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} align="center">
            <Typography variant="body2" color="text.secondary">
              No leave requests pending approval
            </Typography>
          </TableCell>
        </TableRow>
      );
    }

    return pendingRequests.map((request) => (
      <TableRow key={request._id}>
        <TableCell>
          <Box display="flex" alignItems="center">
            <LeaveIcon color="warning" sx={{ mr: 1 }} />
            <Typography variant="body2">
              {request.leaveType} Leave
            </Typography>
          </Box>
        </TableCell>
        <TableCell>{request.teacherId?.name || 'Unknown Teacher'}</TableCell>
        <TableCell>
          {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
        </TableCell>
        <TableCell>{request.reason}</TableCell>
        <TableCell>
          <Chip 
            label={request.status} 
            color={getStatusColor(request.status)}
            size="small"
          />
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
        </TableCell>
      </TableRow>
    ));
  };

  if (lessonPlansLoading || leaveRequestsLoading) {
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
          Teacher Approvals Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => {
            queryClient.invalidateQueries(['hodLessonPlansForApproval']);
            queryClient.invalidateQueries(['hodTeacherLeaveRequests']);
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <LessonPlanIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="primary">
                    {lessonPlans?.filter(plan => plan.status === 'Pending').length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Lesson Plan Approvals
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <LeaveIcon color="warning" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="warning.main">
                    {teacherLeaveRequests?.filter(req => req.status === 'Pending').length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Teacher Leave Approvals
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
          <Tab 
            label={
              <Badge badgeContent={lessonPlans?.filter(plan => plan.status === 'Pending').length || 0} color="primary">
                Lesson Plan Approvals
              </Badge>
            } 
            icon={<LessonPlanIcon />} 
          />
          <Tab 
            label={
              <Badge badgeContent={teacherLeaveRequests?.filter(req => req.status === 'Pending').length || 0} color="warning">
                Teacher Leave Approvals
              </Badge>
            } 
            icon={<LeaveIcon />} 
          />
        </Tabs>

        {/* Lesson Plan Approvals Tab */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Lesson Plan</TableCell>
                  <TableCell>Teacher</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {renderLessonPlansTable()}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Teacher Leave Approvals Tab */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Leave Type</TableCell>
                  <TableCell>Teacher</TableCell>
                  <TableCell>Date Range</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {renderLeaveRequestsTable()}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* View Request Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {tabValue === 0 ? 'Lesson Plan Details' : 'Leave Request Details'}
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box>
              <Grid container spacing={2}>
                {tabValue === 0 ? (
                  // Lesson Plan Details
                  <>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                      <Typography variant="body1">{selectedRequest.title || 'Untitled'}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">Teacher</Typography>
                      <Typography variant="body1">{selectedRequest.submittedBy?.name || 'Unknown'}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">Subject</Typography>
                      <Typography variant="body1">{selectedRequest.subject || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">Class</Typography>
                      <Typography variant="body1">{selectedRequest.class || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                      <Typography variant="body1">{selectedRequest.description || 'No description provided'}</Typography>
                    </Grid>
                  </>
                ) : (
                  // Leave Request Details
                  <>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">Teacher</Typography>
                      <Typography variant="body1">{selectedRequest.teacherId?.name || 'Unknown'}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">Leave Type</Typography>
                      <Typography variant="body1">{selectedRequest.leaveType}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">Start Date</Typography>
                      <Typography variant="body1">
                        {new Date(selectedRequest.startDate).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">End Date</Typography>
                      <Typography variant="body1">
                        {new Date(selectedRequest.endDate).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">Reason</Typography>
                      <Typography variant="body1">{selectedRequest.reason}</Typography>
                    </Grid>
                  </>
                )}
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
        <DialogTitle>
          {tabValue === 0 ? 'Approve Lesson Plan' : 'Approve Leave Request'}
        </DialogTitle>
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
        <DialogTitle>
          {tabValue === 0 ? 'Reject Lesson Plan' : 'Reject Leave Request'}
        </DialogTitle>
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

export default TeacherApprovals; 