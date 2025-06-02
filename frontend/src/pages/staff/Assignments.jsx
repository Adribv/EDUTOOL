import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { staffAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Assignments = () => {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    class: '',
    dueDate: '',
    totalMarks: '',
    file: null,
  });

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await staffAPI.getAssignments();
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAssignment = () => {
    setSelectedAssignment(null);
    setFormData({
      title: '',
      description: '',
      subject: '',
      class: '',
      dueDate: '',
      totalMarks: '',
      file: null,
    });
    setOpenDialog(true);
  };

  const handleEditAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setFormData(assignment);
    setOpenDialog(true);
  };

  const handleDeleteAssignment = async (assignmentId) => {
    try {
      await staffAPI.deleteAssignment(assignmentId);
      toast.success('Assignment deleted successfully');
      fetchAssignments();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      file,
    }));
  };

  const handleSaveAssignment = async () => {
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      if (selectedAssignment) {
        await staffAPI.updateAssignment(selectedAssignment.id, formDataToSend);
        toast.success('Assignment updated successfully');
      } else {
        await staffAPI.addAssignment(formDataToSend);
        toast.success('Assignment added successfully');
      }
      setOpenDialog(false);
      fetchAssignments();
    } catch (error) {
      console.error('Error saving assignment:', error);
      toast.error('Failed to save assignment');
    }
  };

  const handleDownload = async (assignmentId) => {
    try {
      const response = await staffAPI.downloadAssignment(assignmentId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'assignment.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading assignment:', error);
      toast.error('Failed to download assignment');
    }
  };

  const handleViewSubmissions = (assignmentId) => {
    // Navigate to submissions page or open dialog
    console.log('View submissions for assignment:', assignmentId);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Assignments
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track student assignments
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddAssignment}
        >
          Add Assignment
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Total Marks</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>{assignment.title}</TableCell>
                    <TableCell>{assignment.subject}</TableCell>
                    <TableCell>{assignment.class}</TableCell>
                    <TableCell>{new Date(assignment.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{assignment.totalMarks}</TableCell>
                    <TableCell>
                      <Chip
                        label={assignment.status}
                        color={
                          assignment.status === 'Active'
                            ? 'success'
                            : assignment.status === 'Pending'
                            ? 'warning'
                            : 'error'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Submissions">
                        <IconButton
                          size="small"
                          onClick={() => handleViewSubmissions(assignment.id)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download">
                        <IconButton
                          size="small"
                          onClick={() => handleDownload(assignment.id)}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEditAssignment(assignment)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteAssignment(assignment.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedAssignment ? 'Edit Assignment' : 'Add New Assignment'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Class"
                name="class"
                value={formData.class}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Due Date"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Marks"
                name="totalMarks"
                type="number"
                value={formData.totalMarks}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
              >
                Upload Assignment File
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
              {formData.file && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected file: {formData.file.name}
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveAssignment} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Assignments; 