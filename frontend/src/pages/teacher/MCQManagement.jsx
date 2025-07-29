import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  LinearProgress,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  ExpandMore as ExpandMoreIcon,
  BarChart as BarChartIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { teacherAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const MCQManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionsDialog, setSubmissionsDialog] = useState(false);
  const [analyticsDialog, setAnalyticsDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [filterClass, setFilterClass] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getMCQAssignments();
      setAssignments(response.data || []);
    } catch (error) {
      console.error('Error fetching MCQ assignments:', error);
      toast.error('Failed to load MCQ assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleViewSubmissions = async (assignment) => {
    try {
      setSelectedAssignment(assignment);
      setSubmissionsDialog(true);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast.error('Failed to load submissions');
    }
  };

  const handleViewAnalytics = (assignment) => {
    setSelectedAssignment(assignment);
    setAnalyticsDialog(true);
  };

  const handleDeleteAssignment = async () => {
    if (!selectedAssignment) return;
    
    try {
      await teacherAPI.deleteMCQAssignment(selectedAssignment._id);
      toast.success('MCQ Assignment deleted successfully');
      setDeleteDialog(false);
      setSelectedAssignment(null);
      fetchAssignments();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Draft': return 'warning';
      case 'Completed': return 'info';
      case 'Overdue': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active': return <CheckCircleIcon />;
      case 'Draft': return <ScheduleIcon />;
      case 'Completed': return <AssessmentIcon />;
      case 'Overdue': return <WarningIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const formatDuration = (minutes) => {
    if (minutes === 0) return 'No limit';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} minutes`;
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (filterClass !== 'all' && assignment.class !== filterClass) return false;
    if (filterSubject !== 'all' && assignment.subject !== filterSubject) return false;
    if (filterStatus !== 'all' && assignment.status !== filterStatus) return false;
    return true;
  });

  const getUniqueClasses = () => [...new Set(assignments.map(a => a.class))];
  const getUniqueSubjects = () => [...new Set(assignments.map(a => a.subject))];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">MCQ Assignment Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/teacher/mcq-builder')}
        >
          Create MCQ Assignment
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Class</InputLabel>
                <Select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  label="Class"
                >
                  <MenuItem value="all">All Classes</MenuItem>
                  {getUniqueClasses().map(cls => (
                    <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={filterSubject}
                  onChange={(e) => setSubject(e.target.value)}
                  label="Subject"
                >
                  <MenuItem value="all">All Subjects</MenuItem>
                  {getUniqueSubjects().map(sub => (
                    <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="Draft">Draft</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Overdue">Overdue</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchAssignments}
                fullWidth
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AssessmentIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{assignments.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Assignments</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {assignments.filter(a => a.status === 'Active').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Active</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleIcon color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {assignments.reduce((sum, a) => sum + (a.stats?.submissionsCount || 0), 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Total Submissions</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BarChartIcon color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {assignments.length > 0 
                      ? Math.round(assignments.reduce((sum, a) => sum + (a.stats?.averageScore || 0), 0) / assignments.length)
                      : 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Avg Score</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Assignments Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>MCQ Assignments</Typography>
          
          {filteredAssignments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No MCQ assignments found. Create your first MCQ assignment!
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/teacher/mcq-builder')}
                sx={{ mt: 2 }}
              >
                Create MCQ Assignment
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Questions</TableCell>
                    <TableCell>Time Limit</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Submissions</TableCell>
                    <TableCell>Avg Score</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAssignments.map((assignment) => (
                    <TableRow key={assignment._id}>
                      <TableCell>
                        <Typography variant="subtitle2">{assignment.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {assignment.description.substring(0, 50)}...
                        </Typography>
                      </TableCell>
                      <TableCell>{assignment.class} - {assignment.section}</TableCell>
                      <TableCell>{assignment.subject}</TableCell>
                      <TableCell>{assignment.totalQuestions}</TableCell>
                      <TableCell>{formatDuration(assignment.timeLimit)}</TableCell>
                      <TableCell>
                        {new Date(assignment.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(assignment.status)}
                          label={assignment.status}
                          color={getStatusColor(assignment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {assignment.stats?.submissionsCount || 0} / {assignment.stats?.totalStudents || 0}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={assignment.stats?.submissionRate || 0}
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {assignment.stats?.averageScore || 0}%
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Submissions">
                            <IconButton
                              size="small"
                              onClick={() => handleViewSubmissions(assignment)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Analytics">
                            <IconButton
                              size="small"
                              onClick={() => handleViewAnalytics(assignment)}
                            >
                              <BarChartIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/teacher/mcq-builder/${assignment._id}`)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setSelectedAssignment(assignment);
                                setDeleteDialog(true);
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Submissions Dialog */}
      <Dialog open={submissionsDialog} onClose={() => setSubmissionsDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Submissions - {selectedAssignment?.title}
        </DialogTitle>
        <DialogContent>
          {selectedAssignment && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{selectedAssignment.stats?.totalStudents || 0}</Typography>
                      <Typography variant="body2">Total Students</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{selectedAssignment.stats?.submissionsCount || 0}</Typography>
                      <Typography variant="body2">Submitted</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{selectedAssignment.stats?.pendingSubmissions || 0}</Typography>
                      <Typography variant="body2">Pending</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{selectedAssignment.stats?.averageScore || 0}%</Typography>
                      <Typography variant="body2">Average Score</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Typography variant="h6" gutterBottom>Student Submissions</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell>Percentage</TableCell>
                      <TableCell>Time Taken</TableCell>
                      <TableCell>Submitted</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedAssignment.submissions?.map((submission) => (
                      <TableRow key={submission.submissionId}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                              {submission.studentName?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2">{submission.studentName}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {submission.rollNumber}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={submission.status}
                            color={submission.submitted ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{submission.score || '-'}</TableCell>
                        <TableCell>{submission.percentage || '-'}%</TableCell>
                        <TableCell>
                          {submission.timeTaken 
                            ? `${Math.floor(submission.timeTaken / 60)}m ${submission.timeTaken % 60}s`
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          {submission.submissionDate 
                            ? new Date(submission.submissionDate).toLocaleString()
                            : '-'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmissionsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={analyticsDialog} onClose={() => setAnalyticsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Analytics - {selectedAssignment?.title}
        </DialogTitle>
        <DialogContent>
          {selectedAssignment && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Score Distribution</Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2">Highest Score: {selectedAssignment.stats?.highestScore || 0}%</Typography>
                        <Typography variant="body2">Lowest Score: {selectedAssignment.stats?.lowestScore || 0}%</Typography>
                        <Typography variant="body2">Average Score: {selectedAssignment.stats?.averageScore || 0}%</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Submission Stats</Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2">Submission Rate: {selectedAssignment.stats?.submissionRate || 0}%</Typography>
                        <Typography variant="body2">Grading Rate: {selectedAssignment.stats?.gradingRate || 0}%</Typography>
                        <Typography variant="body2">Pending: {selectedAssignment.stats?.pendingSubmissions || 0}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnalyticsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete MCQ Assignment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedAssignment?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteAssignment} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MCQManagement; 