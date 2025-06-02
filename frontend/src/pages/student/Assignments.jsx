import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Assignment,
  CheckCircle,
  Warning,
  Description,
  AttachFile,
  Download,
  Upload,
} from '@mui/icons-material';
import { studentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Assignments = () => {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionDialog, setSubmissionDialog] = useState(false);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submissionComment, setSubmissionComment] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getAssignments();
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmission = async () => {
    if (!submissionFile) {
      toast.error('Please select a file to submit');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', submissionFile);
      formData.append('comment', submissionComment);

      await studentAPI.submitAssignment(selectedAssignment.id, formData);
      toast.success('Assignment submitted successfully');
      setSubmissionDialog(false);
      fetchAssignments();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error('Failed to submit assignment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted':
        return 'success';
      case 'Not Submitted':
        return 'warning';
      case 'Late':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'all') return true;
    if (filter === 'pending') return assignment.submissionStatus === 'Not Submitted';
    if (filter === 'submitted') return assignment.submissionStatus === 'Submitted';
    return true;
  });

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Assignments</Typography>
        <TextField
          select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          size="small"
          sx={{ width: 200 }}
        >
          <MenuItem value="all">All Assignments</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="submitted">Submitted</MenuItem>
        </TextField>
      </Box>

      <Grid container spacing={3}>
        {filteredAssignments.map((assignment) => (
          <Grid item xs={12} key={assignment.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {assignment.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Subject: {assignment.subject}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {assignment.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Chip
                        icon={<Assignment />}
                        label={`Due: ${new Date(assignment.dueDate).toLocaleDateString()}`}
                        size="small"
                      />
                      <Chip
                        icon={assignment.submissionStatus === 'Submitted' ? <CheckCircle /> : <Warning />}
                        label={assignment.submissionStatus}
                        color={getStatusColor(assignment.submissionStatus)}
                        size="small"
                      />
                    </Box>
                  </Box>
                  <Box>
                    {assignment.attachment && (
                      <Tooltip title="Download Assignment">
                        <IconButton
                          onClick={() => window.open(assignment.attachment, '_blank')}
                          color="primary"
                        >
                          <Download />
                        </IconButton>
                      </Tooltip>
                    )}
                    {assignment.submissionStatus !== 'Submitted' && (
                      <Button
                        variant="contained"
                        startIcon={<Upload />}
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setSubmissionDialog(true);
                        }}
                      >
                        Submit
                      </Button>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Submission Dialog */}
      <Dialog
        open={submissionDialog}
        onClose={() => setSubmissionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Submit Assignment</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {selectedAssignment?.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Due: {selectedAssignment?.dueDate && new Date(selectedAssignment.dueDate).toLocaleDateString()}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Comments (Optional)"
              value={submissionComment}
              onChange={(e) => setSubmissionComment(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="outlined"
              component="label"
              startIcon={<AttachFile />}
              fullWidth
            >
              Upload File
              <input
                type="file"
                hidden
                onChange={(e) => setSubmissionFile(e.target.files[0])}
              />
            </Button>
            {submissionFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected file: {submissionFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmissionDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmission}
            disabled={!submissionFile}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Assignments; 