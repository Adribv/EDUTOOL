import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
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
  Tabs,
  Tab,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Assignment,
  Event,
  Book,
  Group,
  CheckCircle,
  Warning,
  Close,
  Edit,
  Save,
  Cancel,
  Add,
  Download,
  Upload,
} from '@mui/icons-material';
import { teacherAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Assignments = () => {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editedAssignment, setEditedAssignment] = useState(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    subject: '',
    class: '',
    section: '',
    dueDate: '',
    totalMarks: '',
    type: 'Regular',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getAssignments();
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleViewAssignment = async (assignment) => {
    try {
      const response = await teacherAPI.getAssignmentSubmissions(assignment.id);
      setSelectedAssignment(assignment);
      setSubmissions(response.data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load submissions');
    }
  };

  const handleGradeSubmission = async (submissionId, grade, feedback) => {
    try {
      await teacherAPI.gradeSubmission(submissionId, { grade, feedback });
      toast.success('Grade submitted successfully');
      handleViewAssignment(selectedAssignment);
    } catch (error) {
      console.error('Error submitting grade:', error);
      toast.error('Failed to submit grade');
    }
  };

  const handleEditAssignment = (assignment) => {
    setEditedAssignment(assignment);
    setEditMode(true);
  };

  const handleSaveAssignment = async () => {
    try {
      await teacherAPI.updateAssignment(editedAssignment.id, editedAssignment);
      toast.success('Assignment updated successfully');
      setEditMode(false);
      setEditedAssignment(null);
      fetchData();
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast.error('Failed to update assignment');
    }
  };

  const handleCreateAssignment = async () => {
    try {
      await teacherAPI.createAssignment(newAssignment);
      toast.success('Assignment created successfully');
      setCreateDialog(false);
      setNewAssignment({
        title: '',
        description: '',
        subject: '',
        class: '',
        section: '',
        dueDate: '',
        totalMarks: '',
        type: 'Regular',
      });
      fetchData();
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment');
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedAssignment(null);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Assignments
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialog(true)}
        >
          Create Assignment
        </Button>
      </Box>

      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        sx={{ mb: 3 }}
      >
        <Tab label="All Assignments" />
        <Tab label="Pending Review" />
        <Tab label="Graded" />
      </Tabs>

      <Grid container spacing={3}>
        {assignments
          .filter(assignment => {
            if (selectedTab === 1) return assignment.status === 'Pending Review';
            if (selectedTab === 2) return assignment.status === 'Graded';
            return true;
          })
          .map((assignment) => (
            <Grid item xs={12} md={6} key={assignment.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {assignment.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Book sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="body2">
                          {assignment.subject} - {assignment.class} {assignment.section}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Event sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="body2">
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Chip
                        icon={<Group />}
                        label={`${assignment.submittedCount} submissions`}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      <Chip
                        label={assignment.status}
                        color={assignment.status === 'Pending Review' ? 'warning' : 'success'}
                        size="small"
                      />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleViewAssignment(assignment)}
                    >
                      View Submissions
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleEditAssignment(assignment)}
                    >
                      Edit
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>

      {/* Submissions Dialog */}
      <Dialog
        open={!!selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedAssignment && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  {selectedAssignment.title} - Submissions
                </Typography>
                <IconButton onClick={() => setSelectedAssignment(null)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Submitted On</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Grade</TableCell>
                      <TableCell>Feedback</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>{submission.studentName}</TableCell>
                        <TableCell>
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={submission.status}
                            color={submission.status === 'Graded' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {submission.grade || '-'}
                        </TableCell>
                        <TableCell>
                          {submission.feedback || '-'}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Download />}
                              onClick={() => window.open(submission.fileUrl)}
                            >
                              Download
                            </Button>
                            {submission.status !== 'Graded' && (
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => {
                                  const grade = prompt('Enter grade:');
                                  const feedback = prompt('Enter feedback:');
                                  if (grade && feedback) {
                                    handleGradeSubmission(submission.id, grade, feedback);
                                  }
                                }}
                              >
                                Grade
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedAssignment(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit Assignment Dialog */}
      <Dialog
        open={editMode}
        onClose={handleCancelEdit}
        maxWidth="sm"
        fullWidth
      >
        {editedAssignment && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Edit Assignment</Typography>
                <IconButton onClick={handleCancelEdit}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    label="Title"
                    fullWidth
                    value={editedAssignment.title}
                    onChange={(e) => setEditedAssignment({ ...editedAssignment, title: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={4}
                    value={editedAssignment.description}
                    onChange={(e) => setEditedAssignment({ ...editedAssignment, description: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Subject"
                    fullWidth
                    value={editedAssignment.subject}
                    onChange={(e) => setEditedAssignment({ ...editedAssignment, subject: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Class"
                    fullWidth
                    value={editedAssignment.class}
                    onChange={(e) => setEditedAssignment({ ...editedAssignment, class: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Section"
                    fullWidth
                    value={editedAssignment.section}
                    onChange={(e) => setEditedAssignment({ ...editedAssignment, section: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Due Date"
                    type="date"
                    fullWidth
                    value={editedAssignment.dueDate}
                    onChange={(e) => setEditedAssignment({ ...editedAssignment, dueDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Total Marks"
                    type="number"
                    fullWidth
                    value={editedAssignment.totalMarks}
                    onChange={(e) => setEditedAssignment({ ...editedAssignment, totalMarks: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={editedAssignment.type}
                      label="Type"
                      onChange={(e) => setEditedAssignment({ ...editedAssignment, type: e.target.value })}
                    >
                      <MenuItem value="Regular">Regular</MenuItem>
                      <MenuItem value="Project">Project</MenuItem>
                      <MenuItem value="Quiz">Quiz</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelEdit}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleSaveAssignment}
              >
                Save Changes
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create Assignment Dialog */}
      <Dialog
        open={createDialog}
        onClose={() => setCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Create Assignment</Typography>
            <IconButton onClick={() => setCreateDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                fullWidth
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={4}
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Subject"
                fullWidth
                value={newAssignment.subject}
                onChange={(e) => setNewAssignment({ ...newAssignment, subject: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Class"
                fullWidth
                value={newAssignment.class}
                onChange={(e) => setNewAssignment({ ...newAssignment, class: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Section"
                fullWidth
                value={newAssignment.section}
                onChange={(e) => setNewAssignment({ ...newAssignment, section: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Due Date"
                type="date"
                fullWidth
                value={newAssignment.dueDate}
                onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Total Marks"
                type="number"
                fullWidth
                value={newAssignment.totalMarks}
                onChange={(e) => setNewAssignment({ ...newAssignment, totalMarks: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newAssignment.type}
                  label="Type"
                  onChange={(e) => setNewAssignment({ ...newAssignment, type: e.target.value })}
                >
                  <MenuItem value="Regular">Regular</MenuItem>
                  <MenuItem value="Project">Project</MenuItem>
                  <MenuItem value="Quiz">Quiz</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateAssignment}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Assignments; 