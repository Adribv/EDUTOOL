import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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
  Avatar,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Divider,
  Alert,
  Skeleton,
  CircularProgress,
  Fab,
  Menu,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating
} from '@mui/material';
import {
  Add,
  Assignment,
  Visibility,
  Edit,
  Delete,
  Grade,
  Schedule,
  CheckCircle,
  Warning,
  Error,
  People,
  TrendingUp,
  TrendingDown,
  ExpandMore,
  MoreVert,
  Download,
  Upload,
  Send,
  AccessTime,
  School,
  Subject,
  CalendarToday,
  AttachFile,
  Feedback,
  Close,
  Save,
  FilterList,
  Refresh,
  Quiz
} from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { teacherAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const Assignments = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState(0);
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [submissionsDialog, setSubmissionsDialog] = useState(false);
  const [gradeDialog, setGradeDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [filterClass, setFilterClass] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');

  // Form states
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    instructions: '',
    class: '',
    section: '',
    subject: '',
    dueDate: '',
    maxMarks: 100,
    submissionType: 'Both',
    allowLateSubmission: true
  });

  const [gradeForm, setGradeForm] = useState({
    grade: '',
    feedback: ''
  });

  const staffId = user?._id || user?.id;

  // Fetch assignments
  const { data: assignments, isLoading: assignmentsLoading, refetch: refetchAssignments } = useQuery({
    queryKey: ['teacherAssignments', staffId, filterClass, filterSubject],
    queryFn: () => teacherAPI.getAssignments(),
    enabled: !!staffId
  });

  // Fetch coordinated classes
  const { data: coordinatedClasses } = useQuery({
    queryKey: ['coordinatedClasses', staffId],
    queryFn: () => teacherAPI.getClasses(staffId),
    enabled: !!staffId
  });

  // Create assignment mutation
  const createAssignmentMutation = useMutation({
    mutationFn: (data) => teacherAPI.createAssignment(data),
    onSuccess: () => {
      toast.success('Assignment created successfully');
      setCreateDialog(false);
      resetForm();
      refetchAssignments();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create assignment');
    }
  });

  // Update assignment mutation
  const updateAssignmentMutation = useMutation({
    mutationFn: ({ assignmentId, data }) => teacherAPI.updateAssignment(assignmentId, data),
    onSuccess: () => {
      toast.success('Assignment updated successfully');
      setEditDialog(false);
      resetForm();
      refetchAssignments();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update assignment');
    }
  });

  // Delete assignment mutation
  const deleteAssignmentMutation = useMutation({
    mutationFn: (assignmentId) => teacherAPI.deleteAssignment(assignmentId),
    onSuccess: () => {
      toast.success('Assignment deleted successfully');
      refetchAssignments();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete assignment');
    }
  });

  // Grade submission mutation
  const gradeSubmissionMutation = useMutation({
    mutationFn: ({ submissionId, data }) => teacherAPI.gradeSubmission(submissionId, data),
    onSuccess: () => {
      toast.success('Submission graded successfully');
      setGradeDialog(false);
      setGradeForm({ grade: '', feedback: '' });
      refetchSubmissions();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to grade submission');
    }
  });

  // Fetch submissions for selected assignment
  const { data: submissionsData, isLoading: submissionsLoading, refetch: refetchSubmissions } = useQuery({
    queryKey: ['assignmentSubmissions', selectedAssignment?._id],
    queryFn: () => teacherAPI.getSubmissions(selectedAssignment._id),
    enabled: !!selectedAssignment?._id
  });

  const resetForm = () => {
    setAssignmentForm({
      title: '',
      description: '',
      instructions: '',
      class: '',
      section: '',
      subject: '',
      dueDate: '',
      maxMarks: 100,
      submissionType: 'Both',
      allowLateSubmission: true
    });
  };

  const handleCreateAssignment = () => {
    setCreateDialog(true);
    resetForm();
  };

  const handleEditAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setAssignmentForm({
      title: assignment.title,
      description: assignment.description,
      instructions: assignment.instructions || '',
      class: assignment.class,
      section: assignment.section,
      subject: assignment.subject,
      dueDate: new Date(assignment.dueDate).toISOString().slice(0, 16),
      maxMarks: assignment.maxMarks || 100,
      submissionType: assignment.submissionType || 'Both',
      allowLateSubmission: assignment.allowLateSubmission !== false
    });
    setEditDialog(true);
  };

  const handleViewSubmissions = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionsDialog(true);
  };

  const handleGradeSubmission = (submission) => {
    setSelectedSubmission(submission);
    setGradeForm({
      grade: submission.grade || '',
      feedback: submission.feedback || ''
    });
    setGradeDialog(true);
  };

  const handleDeleteAssignment = (assignment) => {
    if (window.confirm(`Are you sure you want to delete "${assignment.title}"?`)) {
      deleteAssignmentMutation.mutate(assignment._id);
    }
  };

  const handleSubmitCreate = () => {
    createAssignmentMutation.mutate(assignmentForm);
  };

  const handleSubmitEdit = () => {
    updateAssignmentMutation.mutate({
      assignmentId: selectedAssignment._id,
      data: assignmentForm
    });
  };

  const handleSubmitGrade = () => {
    gradeSubmissionMutation.mutate({
      submissionId: selectedSubmission.submissionId,
      data: {
        grade: parseFloat(gradeForm.grade),
        feedback: gradeForm.feedback,
        maxMarks: selectedAssignment.maxMarks
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'primary';
      case 'Completed': return 'success';
      case 'Overdue': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active': return <Schedule />;
      case 'Completed': return <CheckCircle />;
      case 'Overdue': return <Warning />;
      default: return <Assignment />;
    }
  };

  const getSubmissionStatusColor = (status) => {
    switch (status) {
      case 'Submitted': return 'info';
      case 'Graded': return 'success';
      case 'Late': return 'warning';
      case 'Not Submitted': return 'error';
      default: return 'default';
    }
  };

  // Filter assignments based on selected filters
  const filteredAssignments = (assignments || []).filter(assignment => {
    const classMatch = filterClass === 'all' || assignment.class === filterClass;
    const subjectMatch = filterSubject === 'all' || assignment.subject === filterSubject;
    return classMatch && subjectMatch;
  });

  // Get unique subjects from assignments
  const uniqueSubjects = [...new Set((assignments || []).map(a => a.subject))];

  if (assignmentsLoading) {
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

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Assignment Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={refetchAssignments}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateAssignment}
          >
            Create Assignment
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filter by Class</InputLabel>
                <Select
                  value={filterClass}
                  label="Filter by Class"
                  onChange={(e) => setFilterClass(e.target.value)}
                >
                  <MenuItem value="all">All Classes</MenuItem>
                  {coordinatedClasses?.map((cls) => (
                    <MenuItem key={cls._id} value={cls.name || `${cls.grade} ${cls.section}`}>
                      {cls.name || `${cls.grade} ${cls.section}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filter by Subject</InputLabel>
                <Select
                  value={filterSubject}
                  label="Filter by Subject"
                  onChange={(e) => setFilterSubject(e.target.value)}
                >
                  <MenuItem value="all">All Subjects</MenuItem>
                  {uniqueSubjects.map((subject) => (
                    <MenuItem key={subject} value={subject}>
                      {subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setFilterClass('all');
                  setFilterSubject('all');
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {filteredAssignments.length}
                  </Typography>
                  <Typography variant="body2">Total Assignments</Typography>
                </Box>
                <Assignment sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {filteredAssignments.filter(a => a.status === 'Active').length}
                  </Typography>
                  <Typography variant="body2">Active</Typography>
                </Box>
                <Schedule sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {filteredAssignments.filter(a => a.status === 'Completed').length}
                  </Typography>
                  <Typography variant="body2">Completed</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {filteredAssignments.filter(a => a.status === 'Overdue').length}
                  </Typography>
                  <Typography variant="body2">Overdue</Typography>
                </Box>
                <Warning sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
          <Tab icon={<Assignment />} label="Regular Assignments" />
          <Tab icon={<Quiz />} label="MCQ Assignments" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {selectedTab === 0 && (
        <>
          {/* Regular Assignments Grid */}
          {filteredAssignments.length > 0 ? (
        <Grid container spacing={3}>
          {filteredAssignments.map((assignment) => (
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
                        label={assignment.status}
                        color={getStatusColor(assignment.status)}
                        size="small"
                        icon={getStatusIcon(assignment.status)}
                      />
                    </Box>
                  }
                  subheader={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {assignment.subject} • {assignment.class} - {assignment.section}
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

                  {assignment.stats && (
                    <Box sx={{ mt: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="caption">Submission Progress</Typography>
                        <Typography variant="caption">
                          {assignment.stats.submissionsCount}/{assignment.stats.totalStudents}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={assignment.stats.submissionRate} 
                        color={assignment.stats.submissionRate >= 80 ? 'success' : assignment.stats.submissionRate >= 50 ? 'warning' : 'error'}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {assignment.stats.submissionRate}% submitted
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={`Max: ${assignment.maxMarks} marks`} 
                      size="small" 
                      variant="outlined" 
                    />
                    {assignment.stats?.gradedCount > 0 && (
                      <Chip 
                        label={`${assignment.stats.gradedCount} graded`} 
                        size="small" 
                        color="success" 
                        variant="outlined" 
                      />
                    )}
                  </Box>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => handleViewSubmissions(assignment)}
                  >
                    View Submissions
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => handleEditAssignment(assignment)}
                  >
                    Edit
                  </Button>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteAssignment(assignment)}
                  >
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Assignment sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No assignments found
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Create your first assignment to get started
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateAssignment}
              >
                Create Assignment
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
        </>
      )}

      {selectedTab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">MCQ Assignment Management</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => window.location.href = '/teacher/mcq-builder'}
            >
              Create MCQ Assignment
            </Button>
          </Box>
          
          <Card>
            <CardContent>
              <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                MCQ Assignment Builder is now available! 
                <br />
                Click "Create MCQ Assignment" to build interactive multiple choice questions with automatic grading.
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => window.location.href = '/teacher/mcq-builder'}
                >
                  Go to MCQ Builder
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => window.location.href = '/teacher/mcq-management'}
                >
                  View MCQ Assignments
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Create/Edit Assignment Dialog */}
      <Dialog 
        open={createDialog || editDialog} 
        onClose={() => {
          setCreateDialog(false);
          setEditDialog(false);
          resetForm();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {createDialog ? 'Create New Assignment' : 'Edit Assignment'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Assignment Title"
                value={assignmentForm.title}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Class</InputLabel>
                <Select
                  value={assignmentForm.class}
                  label="Class"
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, class: e.target.value })}
                >
                  {coordinatedClasses?.map((cls) => (
                    <MenuItem key={cls._id} value={cls.name || `${cls.grade} ${cls.section}`}>
                      {cls.name || `${cls.grade} ${cls.section}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Section"
                value={assignmentForm.section}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, section: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Subject"
                value={assignmentForm.subject}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, subject: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Maximum Marks"
                type="number"
                value={assignmentForm.maxMarks}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, maxMarks: parseInt(e.target.value) })}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Due Date"
                type="datetime-local"
                value={assignmentForm.dueDate}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={assignmentForm.description}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Instructions"
                multiline
                rows={3}
                value={assignmentForm.instructions}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, instructions: e.target.value })}
                placeholder="Detailed instructions for students..."
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Submission Type</InputLabel>
                <Select
                  value={assignmentForm.submissionType}
                  label="Submission Type"
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, submissionType: e.target.value })}
                >
                  <MenuItem value="Text">Text Only</MenuItem>
                  <MenuItem value="File">File Only</MenuItem>
                  <MenuItem value="Both">Text & File</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Allow Late Submission</InputLabel>
                <Select
                  value={assignmentForm.allowLateSubmission}
                  label="Allow Late Submission"
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, allowLateSubmission: e.target.value })}
                >
                  <MenuItem value={true}>Yes</MenuItem>
                  <MenuItem value={false}>No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCreateDialog(false);
            setEditDialog(false);
            resetForm();
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={createDialog ? handleSubmitCreate : handleSubmitEdit}
            disabled={createAssignmentMutation.isLoading || updateAssignmentMutation.isLoading}
          >
            {createAssignmentMutation.isLoading || updateAssignmentMutation.isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Submissions Dialog */}
      <Dialog
        open={submissionsDialog}
        onClose={() => setSubmissionsDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              Submissions: {selectedAssignment?.title}
            </Typography>
            <IconButton onClick={() => setSubmissionsDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {submissionsLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : submissionsData ? (
            <Box>
              {/* Statistics */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="primary">
                        {submissionsData.stats?.totalStudents || 0}
                      </Typography>
                      <Typography variant="caption">Total Students</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="success.main">
                        {submissionsData.stats?.submittedCount || 0}
                      </Typography>
                      <Typography variant="caption">Submitted</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="error.main">
                        {submissionsData.stats?.pendingCount || 0}
                      </Typography>
                      <Typography variant="caption">Pending</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="info.main">
                        {submissionsData.stats?.gradedCount || 0}
                      </Typography>
                      <Typography variant="caption">Graded</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Submissions Table */}
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Roll Number</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Submitted Date</TableCell>
                      <TableCell>Grade</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {submissionsData.submissions?.map((submission) => (
                      <TableRow key={submission.studentId} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {submission.studentName?.charAt(0) || 'S'}
                            </Avatar>
                            <Typography variant="body2">
                              {submission.studentName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{submission.rollNumber}</TableCell>
                        <TableCell>
                          <Chip
                            label={submission.status}
                            color={getSubmissionStatusColor(submission.status)}
                            size="small"
                            variant="outlined"
                          />
                          {submission.isLate && (
                            <Chip
                              label={`${submission.daysLate} days late`}
                              color="warning"
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {submission.submissionDate 
                            ? new Date(submission.submissionDate).toLocaleDateString()
                            : 'Not submitted'
                          }
                        </TableCell>
                        <TableCell>
                          {submission.grade !== null ? (
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2" fontWeight="bold">
                                {submission.grade}/{selectedAssignment?.maxMarks || 100}
                              </Typography>
                              <Rating
                                value={(submission.grade / (selectedAssignment?.maxMarks || 100)) * 5}
                                readOnly
                                size="small"
                                precision={0.1}
                              />
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Not graded
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {submission.submitted && (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Grade />}
                              onClick={() => handleGradeSubmission(submission)}
                            >
                              {submission.grade !== null ? 'Edit Grade' : 'Grade'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <Alert severity="info">No submission data available</Alert>
          )}
        </DialogContent>
      </Dialog>

      {/* Grade Submission Dialog */}
      <Dialog
        open={gradeDialog}
        onClose={() => setGradeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Grade Submission</DialogTitle>
        <DialogContent>
          {selectedSubmission && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Student: {selectedSubmission.studentName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Roll Number: {selectedSubmission.rollNumber}
              </Typography>
              
              {selectedSubmission.content && (
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Submission Content:
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body2">
                      {selectedSubmission.content}
                    </Typography>
                  </Paper>
                </Box>
              )}

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Grade"
                    type="number"
                    value={gradeForm.grade}
                    onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                    inputProps={{ 
                      min: 0, 
                      max: selectedAssignment?.maxMarks || 100 
                    }}
                    helperText={`Out of ${selectedAssignment?.maxMarks || 100} marks`}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Feedback"
                    multiline
                    rows={4}
                    value={gradeForm.feedback}
                    onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                    placeholder="Provide feedback to the student..."
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGradeDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitGrade}
            disabled={gradeSubmissionMutation.isLoading || !gradeForm.grade}
          >
            {gradeSubmissionMutation.isLoading ? 'Saving...' : 'Save Grade'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Assignments; 