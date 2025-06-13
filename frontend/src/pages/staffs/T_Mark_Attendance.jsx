import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import staffService from '../../services/staffService';

const T_Mark_Attendance = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [attendanceDate, setAttendanceDate] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState('present');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await staffService.getStudents();
      setStudents(response.data);
    } catch {
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent('');
    setAttendanceDate('');
    setAttendanceStatus('present');
  };

  const handleSubmit = async () => {
    try {
      await staffService.markAttendance({
        studentId: selectedStudent,
        date: attendanceDate,
        status: attendanceStatus,
      });
      handleCloseDialog();
      fetchStudents();
    } catch {
      setError('Failed to mark attendance');
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mark Attendance
      </Typography>

      <Button variant="contained" color="primary" onClick={handleOpenDialog} sx={{ mb: 2 }}>
        Mark New Attendance
      </Button>

      <Paper sx={{ p: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student Name</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Roll Number</TableCell>
                <TableCell>Attendance Status</TableCell>
                <TableCell>Last Updated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.class}</TableCell>
                  <TableCell>{student.rollNumber}</TableCell>
                  <TableCell>{student.attendanceStatus}</TableCell>
                  <TableCell>{student.lastAttendanceUpdate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Mark Attendance</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Student</InputLabel>
            <Select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              required
            >
              {students.map((student) => (
                <MenuItem key={student.id} value={student.id}>
                  {student.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            type="date"
            label="Attendance Date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            fullWidth
            margin="normal"
            required
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Attendance Status</InputLabel>
            <Select
              value={attendanceStatus}
              onChange={(e) => setAttendanceStatus(e.target.value)}
              required
            >
              <MenuItem value="present">Present</MenuItem>
              <MenuItem value="absent">Absent</MenuItem>
              <MenuItem value="late">Late</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default T_Mark_Attendance; 