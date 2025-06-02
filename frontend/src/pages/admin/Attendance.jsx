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
  CalendarToday as CalendarIcon,
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  Help as LateIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Attendance = () => {
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date(),
    classId: '',
    students: [],
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchAttendance();
    }
  }, [selectedClass, selectedDate]);

  const fetchClasses = async () => {
    try {
      const response = await adminAPI.getClasses();
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAttendance({
        classId: selectedClass,
        date: selectedDate.toISOString(),
      });
      setAttendance(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleOpenDialog = (record = null) => {
    if (record) {
      setSelectedRecord(record);
      setFormData({
        date: new Date(record.date),
        classId: record.classId,
        students: record.students,
      });
    } else {
      setSelectedRecord(null);
      setFormData({
        date: selectedDate,
        classId: selectedClass,
        students: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRecord(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStudentStatusChange = (studentId, status) => {
    setFormData((prev) => ({
      ...prev,
      students: prev.students.map((student) =>
        student.id === studentId ? { ...student, status } : student
      ),
    }));
  };

  const handleSubmit = async () => {
    try {
      if (selectedRecord) {
        await adminAPI.updateAttendance(selectedRecord.id, formData);
        toast.success('Attendance record updated successfully');
      } else {
        await adminAPI.createAttendance(formData);
        toast.success('Attendance record added successfully');
      }
      handleCloseDialog();
      fetchAttendance();
    } catch (error) {
      console.error('Error saving attendance record:', error);
      toast.error('Failed to save attendance record');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        await adminAPI.deleteAttendance(id);
        toast.success('Attendance record deleted successfully');
        fetchAttendance();
      } catch (error) {
        console.error('Error deleting attendance record:', error);
        toast.error('Failed to delete attendance record');
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <PresentIcon color="success" />;
      case 'absent':
        return <AbsentIcon color="error" />;
      case 'late':
        return <LateIcon color="warning" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'absent':
        return 'error';
      case 'late':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Attendance Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Mark Attendance
        </Button>
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
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={handleDateChange}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : selectedClass ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No attendance records found
                  </TableCell>
                </TableRow>
              ) : (
                attendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {record.student.firstName} {record.student.lastName}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(record.status)}
                        label={record.status}
                        color={getStatusColor(record.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(record.time).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>{record.remarks}</TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(record)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(record.id)}
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
          <CalendarIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Please select a class and date to view attendance records
          </Typography>
        </Paper>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedRecord ? 'Edit Attendance' : 'Mark Attendance'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={formData.date}
                  onChange={(date) =>
                    setFormData((prev) => ({ ...prev, date }))
                  }
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Class</InputLabel>
                <Select
                  name="classId"
                  value={formData.classId}
                  onChange={handleInputChange}
                  label="Class"
                >
                  {classes.map((classItem) => (
                    <MenuItem key={classItem.id} value={classItem.id}>
                      {classItem.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Remarks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          {student.firstName} {student.lastName}
                        </TableCell>
                        <TableCell>
                          <FormControl fullWidth>
                            <Select
                              value={student.status}
                              onChange={(e) =>
                                handleStudentStatusChange(student.id, e.target.value)
                              }
                            >
                              <MenuItem value="present">Present</MenuItem>
                              <MenuItem value="absent">Absent</MenuItem>
                              <MenuItem value="late">Late</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            value={student.remarks}
                            onChange={(e) =>
                              handleStudentStatusChange(student.id, {
                                ...student,
                                remarks: e.target.value,
                              })
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedRecord ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Attendance; 