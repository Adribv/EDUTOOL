import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  InputAdornment,
  Chip,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { staffAPI } from '../../services/api';
import { toast } from 'react-toastify';

const ExamManagement = () => {
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    class: '',
    examDate: '',
    startTime: '',
    duration: '',
    totalMarks: '',
    passingMarks: '',
    instructions: '',
    type: '',
  });

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    filterExams();
  }, [searchTerm, exams]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await staffAPI.getExams();
      setExams(response.data);
      setFilteredExams(response.data);
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const filterExams = () => {
    const filtered = exams.filter(
      (exam) =>
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.class.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredExams(filtered);
  };

  const handleAddExam = () => {
    setSelectedExam(null);
    setFormData({
      title: '',
      subject: '',
      class: '',
      examDate: '',
      startTime: '',
      duration: '',
      totalMarks: '',
      passingMarks: '',
      instructions: '',
      type: '',
    });
    setOpenDialog(true);
  };

  const handleEditExam = (exam) => {
    setSelectedExam(exam);
    setFormData(exam);
    setOpenDialog(true);
  };

  const handleDeleteExam = async (examId) => {
    try {
      await staffAPI.deleteExam(examId);
      toast.success('Exam deleted successfully');
      fetchExams();
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast.error('Failed to delete exam');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveExam = async () => {
    try {
      if (selectedExam) {
        await staffAPI.updateExam(selectedExam.id, formData);
        toast.success('Exam updated successfully');
      } else {
        await staffAPI.addExam(formData);
        toast.success('Exam added successfully');
      }
      setOpenDialog(false);
      fetchExams();
    } catch (error) {
      console.error('Error saving exam:', error);
      toast.error('Failed to save exam');
    }
  };

  const handleViewResults = (examId) => {
    // Navigate to results page or open dialog
    console.log('View results for exam:', examId);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
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
            Exam Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create and manage exams
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddExam}
        >
          Add Exam
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label="All Exams" />
          <Tab label="Upcoming" />
          <Tab label="Completed" />
        </Tabs>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search exams by title, subject, or class"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredExams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell>{exam.title}</TableCell>
                    <TableCell>{exam.subject}</TableCell>
                    <TableCell>{exam.class}</TableCell>
                    <TableCell>{new Date(exam.examDate).toLocaleDateString()}</TableCell>
                    <TableCell>{exam.startTime}</TableCell>
                    <TableCell>{exam.duration} minutes</TableCell>
                    <TableCell>
                      <Chip
                        label={exam.status}
                        color={
                          exam.status === 'Upcoming'
                            ? 'warning'
                            : exam.status === 'Completed'
                            ? 'success'
                            : 'error'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Results">
                        <IconButton
                          size="small"
                          onClick={() => handleViewResults(exam.id)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEditExam(exam)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteExam(exam.id)}
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
          {selectedExam ? 'Edit Exam' : 'Add New Exam'}
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
                label="Exam Date"
                name="examDate"
                type="date"
                value={formData.examDate}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Time"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Exam Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  label="Exam Type"
                >
                  <MenuItem value="Midterm">Midterm</MenuItem>
                  <MenuItem value="Final">Final</MenuItem>
                  <MenuItem value="Quiz">Quiz</MenuItem>
                  <MenuItem value="Assignment">Assignment</MenuItem>
                </Select>
              </FormControl>
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Passing Marks"
                name="passingMarks"
                type="number"
                value={formData.passingMarks}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Instructions"
                name="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveExam} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExamManagement; 