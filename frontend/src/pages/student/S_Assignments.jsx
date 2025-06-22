import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Event as EventIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import studentService from '../../services/studentService';

const S_Assignments = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submissionComment, setSubmissionComment] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await studentService.getAssignments();
      setAssignments(response.data);
    } catch {
      setError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleDialogOpen = (assignment) => {
    setSelectedAssignment(assignment);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedAssignment(null);
    setSubmissionFile(null);
    setSubmissionComment('');
  };

  const handleFileChange = (event) => {
    setSubmissionFile(event.target.files[0]);
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('file', submissionFile);
      formData.append('comment', submissionComment);
      formData.append('assignmentId', selectedAssignment.id);

      await studentService.submitAssignment(formData);
      await fetchAssignments();
      handleDialogClose();
    } catch {
      setError('Failed to submit assignment');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const pendingAssignments = assignments.filter((a) => a.status === 'Pending');
  const submittedAssignments = assignments.filter((a) => a.status === 'Submitted');
  const gradedAssignments = assignments.filter((a) => a.status === 'Graded');

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Assignments
      </Typography>

      <Grid container spacing={3}>
        {/* Assignment Statistics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Pending</Typography>
              </Box>
              <Typography variant="h4">{pendingAssignments.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AssignmentIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Submitted</Typography>
              </Box>
              <Typography variant="h4">{submittedAssignments.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AssignmentIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Graded</Typography>
              </Box>
              <Typography variant="h4">{gradedAssignments.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Assignments List */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Assignment</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Grade</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <AssignmentIcon sx={{ mr: 1 }} color="primary" />
                          {assignment.title}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <SchoolIcon sx={{ mr: 1 }} color="primary" />
                          {assignment.className}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <EventIcon sx={{ mr: 1 }} color="primary" />
                          {assignment.dueDate}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={assignment.status}
                          color={
                            assignment.status === 'Submitted'
                              ? 'success'
                              : assignment.status === 'Pending'
                              ? 'warning'
                              : 'info'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {assignment.grade ? (
                          <Chip
                            label={`${assignment.grade}/${assignment.totalMarks}`}
                            color={
                              (assignment.grade / assignment.totalMarks) * 100 >= 70
                                ? 'success'
                                : (assignment.grade / assignment.totalMarks) * 100 >= 50
                                ? 'warning'
                                : 'error'
                            }
                            size="small"
                          />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<UploadIcon />}
                          onClick={() => handleDialogOpen(assignment)}
                          disabled={assignment.status === 'Graded'}
                        >
                          Submit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Submission Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Submit Assignment</DialogTitle>
        <DialogContent>
          {selectedAssignment && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedAssignment.title}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                {selectedAssignment.description}
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <SchoolIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Class"
                    secondary={selectedAssignment.className}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <EventIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Due Date"
                    secondary={selectedAssignment.dueDate}
                  />
                </ListItem>
              </List>
              <Box mt={2}>
                <input
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  id="submission-file"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="submission-file">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                  >
                    Upload File
                  </Button>
                </label>
                {submissionFile && (
                  <Box mt={1} display="flex" alignItems="center">
                    <DescriptionIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">{submissionFile.name}</Typography>
                    <IconButton
                      size="small"
                      onClick={() => setSubmissionFile(null)}
                      sx={{ ml: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Comments"
                value={submissionComment}
                onChange={(e) => setSubmissionComment(e.target.value)}
                margin="normal"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!submissionFile}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default S_Assignments; 