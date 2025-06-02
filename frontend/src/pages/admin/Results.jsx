import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
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
  CircularProgress,
  Tooltip,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Results = () => {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [formData, setFormData] = useState({
    examId: '',
    studentId: '',
    marks: '',
    grade: '',
    remarks: '',
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchExams();
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedExam) {
      fetchResults();
    }
  }, [selectedExam, page, rowsPerPage]);

  const fetchClasses = async () => {
    try {
      const response = await adminAPI.getClasses();
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    }
  };

  const fetchExams = async () => {
    try {
      const response = await adminAPI.getExams({ classId: selectedClass });
      setExams(response.data);
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to load exams');
    }
  };

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getResults({
        examId: selectedExam,
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery,
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
    setSelectedExam('');
  };

  const handleExamChange = (event) => {
    setSelectedExam(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
    fetchResults();
  };

  const handleOpenDialog = (result = null) => {
    if (result) {
      setSelectedResult(result);
      setFormData({
        examId: result.examId,
        studentId: result.studentId,
        marks: result.marks,
        grade: result.grade,
        remarks: result.remarks,
      });
    } else {
      setSelectedResult(null);
      setFormData({
        examId: selectedExam,
        studentId: '',
        marks: '',
        grade: '',
        remarks: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedResult(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (selectedResult) {
        await adminAPI.updateResult(selectedResult.id, formData);
        toast.success('Result updated successfully');
      } else {
        await adminAPI.createResult(formData);
        toast.success('Result added successfully');
      }
      handleCloseDialog();
      fetchResults();
    } catch (error) {
      console.error('Error saving result:', error);
      toast.error('Failed to save result');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this result?')) {
      try {
        await adminAPI.deleteResult(id);
        toast.success('Result deleted successfully');
        fetchResults();
      } catch (error) {
        console.error('Error deleting result:', error);
        toast.error('Failed to delete result');
      }
    }
  };

  const handleExportResults = async () => {
    try {
      const response = await adminAPI.exportResults(selectedExam);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'exam-results.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Results exported successfully');
    } catch (error) {
      console.error('Error exporting results:', error);
      toast.error('Failed to export results');
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A':
      case 'A+':
        return 'success';
      case 'B':
      case 'B+':
        return 'info';
      case 'C':
      case 'C+':
        return 'warning';
      case 'D':
      case 'F':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Results Management</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportResults}
            sx={{ mr: 2 }}
          >
            Export Results
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Result
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Select Class</InputLabel>
            <Select
              value={selectedClass}
              onChange={handleClassChange}
              label="Select Class"
            >
              {classes.map((classItem) => (
                <MenuItem key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Select Exam</InputLabel>
            <Select
              value={selectedExam}
              onChange={handleExamChange}
              label="Select Exam"
              disabled={!selectedClass}
            >
              {exams.map((exam) => (
                <MenuItem key={exam.id} value={exam.id}>
                  {exam.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search results..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : selectedExam ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Marks</TableCell>
                <TableCell>Grade</TableCell>
                <TableCell>Percentage</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No results found
                  </TableCell>
                </TableRow>
              ) : (
                results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>
                      {result.student.firstName} {result.student.lastName}
                    </TableCell>
                    <TableCell>
                      {result.marks} / {result.exam.totalMarks}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={result.grade}
                        color={getGradeColor(result.grade)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {((result.marks / result.exam.totalMarks) * 100).toFixed(2)}%
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={result.marks >= result.exam.passingMarks ? 'Pass' : 'Fail'}
                        color={result.marks >= result.exam.passingMarks ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{result.remarks}</TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(result)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(result.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={-1}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <AssessmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Please select a class and exam to view results
          </Typography>
        </Paper>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedResult ? 'Edit Result' : 'Add Result'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Student</InputLabel>
                <Select
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  label="Student"
                >
                  {results.map((result) => (
                    <MenuItem key={result.student.id} value={result.student.id}>
                      {result.student.firstName} {result.student.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Marks"
                name="marks"
                type="number"
                value={formData.marks}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Grade</InputLabel>
                <Select
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  label="Grade"
                >
                  <MenuItem value="A+">A+</MenuItem>
                  <MenuItem value="A">A</MenuItem>
                  <MenuItem value="B+">B+</MenuItem>
                  <MenuItem value="B">B</MenuItem>
                  <MenuItem value="C+">C+</MenuItem>
                  <MenuItem value="C">C</MenuItem>
                  <MenuItem value="D">D</MenuItem>
                  <MenuItem value="F">F</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedResult ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Results; 