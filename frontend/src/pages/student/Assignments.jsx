import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  Badge,
  Skeleton,
  IconButton,
  Tooltip,
  Rating
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Grade,
  AttachFile,
  Visibility,
  Close,
  Send,
  School,
  Subject,
  CalendarToday,
  Quiz as QuizIcon
} from '@mui/icons-material';
import { studentAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const Assignments = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionDialog, setSubmissionDialog] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submissionContent, setSubmissionContent] = useState('');

  // Fetch assignments with proper error handling
  const { data: assignments, isLoading, error, refetch } = useQuery({
    queryKey: ['studentAssignments'],
    queryFn: async () => {
      try {
        const response = await studentAPI.getAssignments();
        return response.data || [];
      } catch (error) {
        console.error('Error fetching assignments:', error);
        throw error;
      }
    },
    retry: 3,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Submit assignment mutation with enhanced error handling
  const submitAssignmentMutation = useMutation({
    mutationFn: ({ assignmentId, data }) => studentAPI.submitAssignment(assignmentId, data),
    onSuccess: () => {
      toast.success('Assignment submitted successfully!');
      handleCloseSubmissionDialog();
      // Invalidate and refetch assignments
      queryClient.invalidateQueries(['studentAssignments']);
      refetch();
    },
    onError: (error) => {
      console.error('Assignment submission error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to submit assignment. Please try again.';
      toast.error(errorMessage);
    }
  });

  const handleOpenSubmissionDialog = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionDialog(true);
    setSubmissionContent('');
    setSubmissionFile(null);
  };

  const handleCloseSubmissionDialog = () => {
    setSubmissionDialog(false);
    setSelectedAssignment(null);
    setSubmissionFile(null);
    setSubmissionContent('');
  };

  const handleOpenDetailsDialog = (assignment) => {
    setSelectedAssignment(assignment);
    setDetailsDialog(true);
  };

  const handleCloseDetailsDialog = () => {
    setDetailsDialog(false);
    setSelectedAssignment(null);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png'
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error('File type not supported. Please upload PDF, DOC, DOCX, TXT, JPG, or PNG files.');
        return;
      }
      setSubmissionFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!submissionFile && !submissionContent.trim()) {
      toast.error('Please provide either a file or text content for your submission');
      return;
    }

    if (!selectedAssignment) {
      toast.error('No assignment selected');
      return;
    }

    const submissionData = {
      content: submissionContent.trim(),
      file: submissionFile
    };

    submitAssignmentMutation.mutate({
      assignmentId: selectedAssignment._id,
      data: submissionData
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted': return 'success';
      case 'Graded': return 'info';
      case 'Late': return 'warning';
      case 'Not Submitted': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Submitted': return <CheckCircleIcon />;
      case 'Graded': return <Grade />;
      case 'Late': return <WarningIcon />;
      case 'Not Submitted': return <ScheduleIcon />;
      default: return <AssignmentIcon />;
    }
  };

  // Filter assignments by status with null safety
  const safeAssignments = assignments || [];
  const pendingAssignments = safeAssignments.filter(a => 
    a.submissionStatus === 'Not Submitted' && a.canSubmit
  );
  const submittedAssignments = safeAssignments.filter(a => 
    a.submissionStatus === 'Submitted' || a.submissionStatus === 'Late'
  );
  const gradedAssignments = safeAssignments.filter(a => 
    a.submissionStatus === 'Graded'
  );

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          {error.response?.data?.message || 'Failed to load assignments. Please try again.'}
        </Alert>
      </Box>
    );
  }

  const currentAssignments = selectedTab === 0 ? pendingAssignments :
                            selectedTab === 1 ? submittedAssignments :
                            selectedTab === 2 ? gradedAssignments :
                            []; // MCQ assignments will be handled separately

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Assignments
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {pendingAssignments.length}
                  </Typography>
                  <Typography variant="body2">Pending</Typography>
                </Box>
                <ScheduleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {submittedAssignments.length}
                  </Typography>
                  <Typography variant="body2">Submitted</Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {gradedAssignments.length}
                  </Typography>
                  <Typography variant="body2">Graded</Typography>
                </Box>
                <Grade sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs
        value={selectedTab}
        onChange={(e, newValue) => setSelectedTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab 
          label={
            <Badge badgeContent={pendingAssignments.length} color="error">
              Pending
            </Badge>
          } 
        />
        <Tab 
          label={
            <Badge badgeContent={submittedAssignments.length} color="info">
              Submitted
            </Badge>
          } 
        />
        <Tab 
          label={
            <Badge badgeContent={gradedAssignments.length} color="success">
              Graded
            </Badge>
          } 
        />
        <Tab 
          icon={<QuizIcon />}
          label={
            <Badge badgeContent={0} color="primary">
              MCQ Tests
            </Badge>
          } 
        />
      </Tabs>

      {/* Assignment Cards */}
      {selectedTab === 3 ? (
        // MCQ Assignments Section
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                MCQ Tests
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Take interactive multiple choice question tests with automatic grading.
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<QuizIcon />}
                  onClick={() => navigate('/student/mcq-assignments-list')}
                >
                  View MCQ Tests
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/student/mcq-assignments-list')}
                >
                  View Results
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {currentAssignments.map((assignment) => (
          <Grid item xs={12} md={6} lg={4} key={assignment._id}>
            <Card sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: 4,
                transition: 'all 0.3s ease'
              }
            }}>
              <CardHeader
                title={
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" noWrap>
                      {assignment.title}
                    </Typography>
                    <Chip
                      label={assignment.submissionStatus}
                      color={getStatusColor(assignment.submissionStatus)}
                      size="small"
                      icon={getStatusIcon(assignment.submissionStatus)}
                    />
                  </Box>
                }
                subheader={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {assignment.subject} • {assignment.class}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      {assignment.daysUntilDue > 0 && (
                        <span> ({assignment.daysUntilDue} days left)</span>
                      )}
                      {assignment.isOverdue && (
                        <span style={{ color: 'red' }}> (Overdue)</span>
                      )}
                    </Typography>
                  </Box>
                }
              />

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {assignment.description}
                </Typography>

                {assignment.grade !== null && assignment.grade !== undefined && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                      <Typography variant="h6" color="success.dark">
                        Grade: {assignment.grade}/{assignment.maxMarks || 100}
                      </Typography>
                      <Rating
                        value={(assignment.grade / (assignment.maxMarks || 100)) * 5}
                        readOnly
                        size="small"
                        precision={0.1}
                      />
                    </Box>
                    {assignment.feedback && (
                      <Typography variant="body2" color="success.dark">
                        Feedback: {assignment.feedback}
                      </Typography>
                    )}
                  </Box>
                )}

                {assignment.submittedAt && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Submitted: {new Date(assignment.submittedAt).toLocaleString()}
                    {assignment.isLate && (
                      <Chip label="Late" color="warning" size="small" sx={{ ml: 1 }} />
                    )}
                  </Typography>
                )}
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  startIcon={<Visibility />}
                  onClick={() => handleOpenDetailsDialog(assignment)}
                >
                  View Details
                </Button>
                {assignment.canSubmit && !assignment.hasSubmitted && (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Send />}
                    onClick={() => handleOpenSubmissionDialog(assignment)}
                    disabled={submitAssignmentMutation.isLoading}
                  >
                    Submit
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      )}

      {/* Empty State */}
      {selectedTab !== 3 && currentAssignments.length === 0 && (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <AssignmentIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No assignments found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedTab === 0 ? 'No pending assignments at the moment' :
                 selectedTab === 1 ? 'No submitted assignments yet' :
                 selectedTab === 2 ? 'No graded assignments available' :
                 'No assignments available'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Assignment Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={handleCloseDetailsDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedAssignment && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">{selectedAssignment.title}</Typography>
                <IconButton onClick={handleCloseDetailsDialog}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><Subject /></ListItemIcon>
                      <ListItemText primary="Subject" secondary={selectedAssignment.subject} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><School /></ListItemIcon>
                      <ListItemText primary="Class" secondary={selectedAssignment.class} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CalendarToday /></ListItemIcon>
                      <ListItemText 
                        primary="Due Date" 
                        secondary={new Date(selectedAssignment.dueDate).toLocaleString()} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Grade /></ListItemIcon>
                      <ListItemText 
                        primary="Max Marks" 
                        secondary={selectedAssignment.maxMarks || 100} 
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Description:</Typography>
                  <Typography variant="body2" paragraph>
                    {selectedAssignment.description}
                  </Typography>
                  
                  {selectedAssignment.instructions && (
                    <>
                      <Typography variant="subtitle2" gutterBottom>Instructions:</Typography>
                      <Typography variant="body2" paragraph>
                        {selectedAssignment.instructions}
                      </Typography>
                    </>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetailsDialog}>Close</Button>
              {selectedAssignment.canSubmit && !selectedAssignment.hasSubmitted && (
                <Button
                  variant="contained"
                  startIcon={<Send />}
                  onClick={() => {
                    handleCloseDetailsDialog();
                    handleOpenSubmissionDialog(selectedAssignment);
                  }}
                >
                  Submit Assignment
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Submission Dialog */}
      <Dialog
        open={submissionDialog}
        onClose={handleCloseSubmissionDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Submit Assignment</DialogTitle>
        <DialogContent>
          {selectedAssignment && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {selectedAssignment.title}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Due Date: {new Date(selectedAssignment.dueDate).toLocaleString()}
              </Typography>
              
              {selectedAssignment.instructions && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Instructions:</strong> {selectedAssignment.instructions}
                  </Typography>
                </Alert>
              )}

              <TextField
                fullWidth
                label="Text Submission (Optional)"
                multiline
                rows={4}
                value={submissionContent}
                onChange={(e) => setSubmissionContent(e.target.value)}
                placeholder="Enter your assignment content here..."
                sx={{ mb: 2 }}
              />

              <Box sx={{ mb: 2 }}>
                <input
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                  id="assignment-file"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="assignment-file">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<AttachFile />}
                    fullWidth
                  >
                    Attach File (Optional)
                  </Button>
                </label>
                {submissionFile && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Selected file: {submissionFile.name} ({(submissionFile.size / 1024 / 1024).toFixed(2)} MB)
                  </Typography>
                )}
              </Box>

              <Alert severity="warning" sx={{ mt: 2 }}>
                Please provide either text content or attach a file for your submission.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSubmissionDialog} disabled={submitAssignmentMutation.isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={
              submitAssignmentMutation.isLoading || 
              (!submissionFile && !submissionContent.trim())
            }
            startIcon={submitAssignmentMutation.isLoading ? <CircularProgress size={20} /> : <Send />}
          >
            {submitAssignmentMutation.isLoading ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading overlay for submission */}
      {submitAssignmentMutation.isLoading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Submitting assignment...</Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default Assignments; 