import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Badge,
  Divider
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Assignment as LessonPlanIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { principalAPI } from '../../services/api';
import { toast } from 'react-toastify';

const LessonPlanApprovals = () => {
  const [lessonPlans, setLessonPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [rejectionDialog, setRejectionDialog] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchLessonPlans();
  }, []);

  const fetchLessonPlans = async () => {
    try {
      setLoading(true);
      const response = await principalAPI.getLessonPlansForApproval();
      setLessonPlans(response);
    } catch (error) {
      console.error('Error fetching lesson plans:', error);
      toast.error('Failed to load lesson plans');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedPlan) return;
    
    try {
      setProcessing(true);
      await principalAPI.approveLessonPlan(selectedPlan._id, {
        status: 'Principal_Approved',
        feedback: feedback
      });
      
      toast.success('Lesson plan approved and published');
      setApprovalDialog(false);
      setFeedback('');
      setSelectedPlan(null);
      fetchLessonPlans();
    } catch (error) {
      console.error('Error approving lesson plan:', error);
      toast.error(error.response?.data?.message || 'Failed to approve lesson plan');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPlan) return;
    
    try {
      setProcessing(true);
      await principalAPI.approveLessonPlan(selectedPlan._id, {
        status: 'Rejected',
        feedback: feedback
      });
      
      toast.success('Lesson plan rejected');
      setRejectionDialog(false);
      setFeedback('');
      setSelectedPlan(null);
      fetchLessonPlans();
    } catch (error) {
      console.error('Error rejecting lesson plan:', error);
      toast.error(error.response?.data?.message || 'Failed to reject lesson plan');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'HOD_Approved': return 'info';
      case 'Principal_Approved': return 'success';
      case 'Published': return 'success';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'HOD_Approved': return 'Pending Principal Approval';
      case 'Principal_Approved': return 'Approved by Principal';
      case 'Published': return 'Published';
      case 'Rejected': return 'Rejected';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          Lesson Plan Approvals
          <Badge badgeContent={lessonPlans.length} color="primary" sx={{ ml: 2 }}>
            <LessonPlanIcon />
          </Badge>
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchLessonPlans}
        >
          Refresh
        </Button>
      </Box>

      {lessonPlans.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6" color="textSecondary" align="center">
              No lesson plans pending approval
            </Typography>
            <Typography variant="body2" color="textSecondary" align="center">
              All lesson plans have been reviewed or there are no new submissions from HODs.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Teacher</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>HOD Approved</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lessonPlans.map((plan) => (
                <TableRow key={plan._id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {plan.submittedBy?.name || 'Unknown'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {plan.submittedBy?.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {plan.title}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {plan.description?.substring(0, 50)}...
                    </Typography>
                  </TableCell>
                  <TableCell>{plan.subject}</TableCell>
                  <TableCell>{plan.class || '-'}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {plan.hodApprovedBy?.name || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {plan.hodApprovedAt ? new Date(plan.hodApprovedAt).toLocaleDateString() : '-'}
                      </Typography>
                    </Box>
                  </TableCell>
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
                        onClick={() => {
                          setSelectedPlan(plan);
                          setDetailsDialog(true);
                        }}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    {plan.status === 'HOD_Approved' && (
                      <>
                        <Tooltip title="Approve & Publish">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => {
                              setSelectedPlan(plan);
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
                              setSelectedPlan(plan);
                              setRejectionDialog(true);
                            }}
                          >
                            <RejectIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    {plan.pdfUrl && (
                      <Tooltip title="Download PDF">
                        <IconButton
                          size="small"
                          component="a"
                          href={`/${plan.pdfUrl}`}
                          target="_blank"
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Approval Dialog */}
      <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Approve & Publish Lesson Plan</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            This lesson plan has been approved by HOD and is ready for final approval and publication.
          </Alert>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            This lesson plan will be published and made available to students.
          </Typography>
          <TextField
            label="Feedback (Optional)"
            multiline
            rows={3}
            fullWidth
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Add any feedback or comments..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialog(false)} disabled={processing}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleApprove}
            disabled={processing}
            startIcon={processing ? <CircularProgress size={16} /> : <ApproveIcon />}
          >
            {processing ? 'Approving...' : 'Approve & Publish'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialog} onClose={() => setRejectionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Lesson Plan</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action will reject the lesson plan and notify the teacher and HOD.
          </Alert>
          <TextField
            label="Rejection Reason"
            multiline
            rows={3}
            fullWidth
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Please provide a reason for rejection..."
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectionDialog(false)} disabled={processing}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReject}
            disabled={processing || !feedback.trim()}
            startIcon={processing ? <CircularProgress size={16} /> : <RejectIcon />}
          >
            {processing ? 'Rejecting...' : 'Reject Lesson Plan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Lesson Plan Details</DialogTitle>
        <DialogContent>
          {selectedPlan && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    {selectedPlan.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {selectedPlan.description}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Teacher
                  </Typography>
                  <Typography variant="body2">
                    {selectedPlan.submittedBy?.name}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Subject
                  </Typography>
                  <Typography variant="body2">
                    {selectedPlan.subject}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Class
                  </Typography>
                  <Typography variant="body2">
                    {selectedPlan.class || 'Not specified'}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Submitted
                  </Typography>
                  <Typography variant="body2">
                    {new Date(selectedPlan.createdAt).toLocaleString()}
                  </Typography>
                </Grid>
                
                {selectedPlan.hodApprovedBy && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        HOD Approved By
                      </Typography>
                      <Typography variant="body2">
                        {selectedPlan.hodApprovedBy.name}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        HOD Approved At
                      </Typography>
                      <Typography variant="body2">
                        {selectedPlan.hodApprovedAt ? new Date(selectedPlan.hodApprovedAt).toLocaleString() : '-'}
                      </Typography>
                    </Grid>
                    
                    {selectedPlan.hodFeedback && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">
                          HOD Feedback
                        </Typography>
                        <Typography variant="body2">
                          {selectedPlan.hodFeedback}
                        </Typography>
                      </Grid>
                    )}
                  </>
                )}
                
                {selectedPlan.videoLink && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Video Link
                    </Typography>
                    <Typography variant="body2">
                      <a href={selectedPlan.videoLink} target="_blank" rel="noopener noreferrer">
                        {selectedPlan.videoLink}
                      </a>
                    </Typography>
                  </Grid>
                )}
              </Grid>
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

export default LessonPlanApprovals; 