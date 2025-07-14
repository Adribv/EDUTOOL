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
  Edit as EditIcon
} from '@mui/icons-material';
import { hodAPI } from '../../services/api';
import { toast } from 'react-toastify';
import LessonPlanViewer from '../../components/LessonPlanViewer';
import LessonPlanTemplate from '../../components/LessonPlanTemplate';

const LessonPlanApprovals = () => {
  const [lessonPlans, setLessonPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [rejectionDialog, setRejectionDialog] = useState(false);
  const [viewerDialog, setViewerDialog] = useState(false);
  const [templateEditDialog, setTemplateEditDialog] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [processing, setProcessing] = useState(false);
  const [templateData, setTemplateData] = useState(null);

  useEffect(() => {
    fetchLessonPlans();
  }, []);

  const fetchLessonPlans = async () => {
    try {
      setLoading(true);
      const response = await hodAPI.getLessonPlansForReview();
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
      await hodAPI.reviewLessonPlan(selectedPlan._id, {
        status: 'HOD_Approved',
        feedback: feedback
      });
      
      toast.success('Lesson plan approved and forwarded to Principal');
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
      await hodAPI.reviewLessonPlan(selectedPlan._id, {
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

  const handleEditTemplate = (plan) => {
    setSelectedPlan(plan);
    setTemplateData(plan.templateData || {
      title: plan.title,
      class: plan.class,
      subject: plan.subject,
      topic: plan.description,
      duration: '40 Minutes',
      date: new Date(plan.createdAt).toISOString().split('T')[0],
      teacherName: plan.submittedBy?.name || 'Unknown',
      numberOfStudents: '30',
      objectives: [''],
      materials: [''],
      prerequisiteKnowledge: [''],
      introduction: '',
      presentation: [{
        step: '',
        teacherActivity: '',
        studentActivity: '',
        teachingAids: ''
      }],
      assessment: {
        questions: [''],
        worksheet: ''
      },
      summary: '',
      homework: '',
      followUp: ''
    });
    setTemplateEditDialog(true);
  };

  const handleSaveTemplate = async () => {
    if (!selectedPlan || !templateData) return;
    
    try {
      setProcessing(true);
      // Update the lesson plan with modified template data only (no status change)
      await hodAPI.reviewLessonPlan(selectedPlan._id, {
        templateData: templateData
      });
      
      toast.success('Template updated successfully');
      setTemplateEditDialog(false);
      setTemplateData(null);
      setSelectedPlan(null);
      fetchLessonPlans();
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error(error.response?.data?.message || 'Failed to update template');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'HOD_Approved': return 'info';
      case 'Principal_Approved': return 'success';
      case 'Published': return 'success';
      case 'Rejected': return 'error';
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
              All lesson plans have been reviewed or there are no new submissions.
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
                <TableCell>Submitted</TableCell>
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
                    {new Date(plan.createdAt).toLocaleDateString()}
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
                          setViewerDialog(true);
                        }}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    {plan.status === 'Pending' && (
                      <>
                        <Tooltip title="Approve">
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
                        <Tooltip title="Edit Template">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleEditTemplate(plan)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    {plan.pdfUrl && (
                      <Tooltip title="Download PDF">
                        <IconButton
                          size="small"
                          component="a"
                          href={`https://api.edulives.com/${plan.pdfUrl}`}
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
        <DialogTitle>Approve Lesson Plan</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            This lesson plan will be forwarded to the Principal for final approval.
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
            {processing ? 'Approving...' : 'Approve & Forward to Principal'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialog} onClose={() => setRejectionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Lesson Plan</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action will reject the lesson plan and notify the teacher.
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

      {/* Template Edit Dialog */}
      <Dialog open={templateEditDialog} onClose={() => setTemplateEditDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Edit Lesson Plan Template</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            You can edit the lesson plan template before approval. Changes will be saved with the lesson plan.
          </Typography>
          {templateData && (
            <LessonPlanTemplate
              lessonPlan={templateData}
              onSave={setTemplateData}
              isEditing={true}
              userRole="HOD"
              readOnly={false}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateEditDialog(false)} disabled={processing}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveTemplate}
            disabled={processing}
            startIcon={processing ? <CircularProgress size={16} /> : <EditIcon />}
          >
            {processing ? 'Saving...' : 'Save Template'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lesson Plan Viewer */}
      <LessonPlanViewer
        lessonPlan={selectedPlan}
        open={viewerDialog}
        onClose={() => setViewerDialog(false)}
      />
    </Box>
  );
};

export default LessonPlanApprovals; 