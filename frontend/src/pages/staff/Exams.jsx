import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  School,
  Add,
  Edit,
  Delete,
  Visibility,
  Close,
  CheckCircle,
  Pending,
  Error,
} from '@mui/icons-material';
import { staffAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Exams = () => {
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [createDialog, setCreateDialog] = useState(false);
  const [examData, setExamData] = useState({
    title: '',
    subject: '',
    classId: '',
    date: '',
    duration: '',
    totalMarks: '',
    instructions: '',
  });

  useEffect(() => {
    fetchExams();
    fetchClasses();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await staffAPI.getExams();
      setExams(response.data);
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await staffAPI.getClasses();
      setClasses(response.data.classes);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    }
  };

  const handleCreateDialogOpen = () => {
    setCreateDialog(true);
  };

  const handleCreateDialogClose = () => {
    setCreateDialog(false);
    setExamData({
      title: '',
      subject: '',
      classId: '',
      date: '',
      duration: '',
      totalMarks: '',
      instructions: '',
    });
  };

  const handleExamChange = (event) => {
    const { name, value } = event.target;
    setExamData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateExam = async () => {
    try {
      await staffAPI.createExam(examData);
      toast.success('Exam created successfully');
      handleCreateDialogClose();
      fetchExams();
    } catch (error) {
      console.error('Error creating exam:', error);
      toast.error('Failed to create exam');
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'completed':
        return <Chip icon={<CheckCircle />} label="Completed" color="success" />;
      case 'upcoming':
        return <Chip icon={<Pending />} label="Upcoming" color="warning" />;
      case 'in_progress':
        return <Chip icon={<Pending />} label="In Progress" color="info" />;
      default:
        return null;
    }
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Exams</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateDialogOpen}
        >
          Create Exam
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <School color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Exams</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {exams.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Pending color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Upcoming Exams</Typography>
              </Box>
              <Typography variant="h4" color="warning">
                {exams.filter((exam) => exam.status === 'upcoming').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Completed Exams</Typography>
              </Box>
              <Typography variant="h4" color="success">
                {exams.filter((exam) => exam.status === 'completed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Exams Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Date & Time</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exams.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell>{exam.title}</TableCell>
                <TableCell>{exam.subject}</TableCell>
                <TableCell>{exam.className}</TableCell>
                <TableCell>
                  {new Date(exam.date).toLocaleDateString()} at{' '}
                  {new Date(exam.date).toLocaleTimeString()}
                </TableCell>
                <TableCell>{exam.duration} minutes</TableCell>
                <TableCell>{getStatusChip(exam.status)}</TableCell>
                <TableCell>
                  <Tooltip title="View Results">
                    <IconButton
                      color="primary"
                      onClick={() => {/* Handle view results */}}
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit Exam">
                    <IconButton color="info">
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Exam">
                    <IconButton color="error">
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Exam Dialog */}
      <Dialog open={createDialog} onClose={handleCreateDialogClose}>
        <DialogTitle>Create New Exam</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={examData.title}
              onChange={handleExamChange}
            />
            <TextField
              fullWidth
              label="Subject"
              name="subject"
              value={examData.subject}
              onChange={handleExamChange}
            />
            <FormControl fullWidth>
              <InputLabel>Class</InputLabel>
              <Select
                name="classId"
                value={examData.classId}
                onChange={handleExamChange}
                label="Class"
              >
                {classes.map((classItem) => (
                  <MenuItem key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="datetime-local"
              label="Date & Time"
              name="date"
              value={examData.date}
              onChange={handleExamChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              type="number"
              label="Duration (minutes)"
              name="duration"
              value={examData.duration}
              onChange={handleExamChange}
            />
            <TextField
              fullWidth
              type="number"
              label="Total Marks"
              name="totalMarks"
              value={examData.totalMarks}
              onChange={handleExamChange}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Instructions"
              name="instructions"
              value={examData.instructions}
              onChange={handleExamChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateDialogClose}>Cancel</Button>
          <Button onClick={handleCreateExam} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Exams; 