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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import teacherService from '../../services/teacherService';

const T_Assignments = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classId: '',
    dueDate: '',
    totalMarks: '',
    type: '',
    attachments: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignmentsRes, classesRes] = await Promise.all([
        teacherService.getAssignments(),
        teacherService.getClasses(),
      ]);
      setAssignments(assignmentsRes.data);
      setClasses(classesRes.data);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (assignment = null) => {
    if (assignment) {
      setEditingAssignment(assignment);
      setFormData({
        title: assignment.title,
        description: assignment.description,
        classId: assignment.classId,
        dueDate: assignment.dueDate,
        totalMarks: assignment.totalMarks,
        type: assignment.type,
        attachments: assignment.attachments || [],
      });
    } else {
      setEditingAssignment(null);
      setFormData({
        title: '',
        description: '',
        classId: '',
        dueDate: '',
        totalMarks: '',
        type: '',
        attachments: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAssignment(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (editingAssignment) {
        await teacherService.updateAssignment(editingAssignment.id, formData);
      } else {
        await teacherService.createAssignment(formData);
      }
      handleCloseDialog();
      fetchData();
    } catch {
      setError('Failed to save assignment');
    }
  };

  const handleDelete = async (assignmentId) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await teacherService.deleteAssignment(assignmentId);
        fetchData();
      } catch {
        setError('Failed to delete assignment');
      }
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  const handleRemoveFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Assignments</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Assignment
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Assignment Statistics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Assignments</Typography>
              </Box>
              <Typography variant="h4">{assignments.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CheckCircleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Submitted</Typography>
              </Box>
              <Typography variant="h4">
                {assignments.reduce((total, assignment) => total + assignment.submittedCount, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CancelIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Pending</Typography>
              </Box>
              <Typography variant="h4">
                {assignments.reduce((total, assignment) => total + assignment.pendingCount, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Assignments List */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>{assignment.title}</TableCell>
                    <TableCell>
                      {classes.find((cls) => cls.id === assignment.classId)?.name}
                    </TableCell>
                    <TableCell>{assignment.dueDate}</TableCell>
                    <TableCell>
                      <Chip
                        label={assignment.type}
                        color={assignment.type === 'Homework' ? 'primary' : 'secondary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {assignment.submittedCount}/{assignment.totalStudents}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={assignment.status}
                        color={
                          assignment.status === 'Active'
                            ? 'success'
                            : assignment.status === 'Overdue'
                            ? 'error'
                            : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenDialog(assignment)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(assignment.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                      <IconButton color="primary">
                        <DownloadIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      {/* Assignment Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAssignment ? 'Edit Assignment' : 'Create Assignment'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Title"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Class</InputLabel>
                <Select
                  name="classId"
                  value={formData.classId}
                  onChange={handleChange}
                  required
                >
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="dueDate"
                label="Due Date"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="totalMarks"
                label="Total Marks"
                type="number"
                value={formData.totalMarks}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="Homework">Homework</MenuItem>
                  <MenuItem value="Project">Project</MenuItem>
                  <MenuItem value="Quiz">Quiz</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                fullWidth
              >
                Upload Attachments
                <input
                  type="file"
                  hidden
                  multiple
                  onChange={handleFileUpload}
                />
              </Button>
            </Grid>
            {formData.attachments.length > 0 && (
              <Grid item xs={12}>
                <List>
                  {formData.attachments.map((file, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleRemoveFile(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        <AssignmentIcon />
                      </ListItemIcon>
                      <ListItemText primary={file.name} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingAssignment ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default T_Assignments; 