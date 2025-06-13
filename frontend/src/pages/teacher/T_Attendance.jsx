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
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Event as EventIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import teacherService from '../../services/teacherService';

const T_Attendance = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [formData, setFormData] = useState({
    classId: '',
    date: '',
    students: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [attendanceRes, classesRes] = await Promise.all([
        teacherService.getAttendance(),
        teacherService.getClasses(),
      ]);
      setAttendance(attendanceRes.data);
      setClasses(classesRes.data);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleClassSelect = (classData) => {
    setSelectedClass(classData);
  };

  const handleOpenDialog = (attendanceData = null) => {
    if (attendanceData) {
      setEditingAttendance(attendanceData);
      setFormData({
        classId: attendanceData.classId,
        date: attendanceData.date,
        students: attendanceData.students,
      });
    } else {
      setEditingAttendance(null);
      setFormData({
        classId: selectedClass?.id || '',
        date: new Date().toISOString().split('T')[0],
        students: selectedClass?.students.map((student) => ({
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          status: 'Present',
        })) || [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAttendance(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      if (editingAttendance) {
        await teacherService.updateAttendance(editingAttendance.id, formData);
      } else {
        await teacherService.createAttendance(formData);
      }
      handleCloseDialog();
      fetchData();
    } catch {
      setError('Failed to save attendance');
    }
  };

  const handleDelete = async (attendanceId) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        await teacherService.deleteAttendance(attendanceId);
        fetchData();
      } catch {
        setError('Failed to delete attendance record');
      }
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
        Attendance Management
      </Typography>

      <Grid container spacing={3}>
        {/* Attendance Statistics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <EventIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Records</Typography>
              </Box>
              <Typography variant="h4">{attendance.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CheckCircleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Average Attendance</Typography>
              </Box>
              <Typography variant="h4">
                {Math.round(
                  attendance.reduce(
                    (acc, record) =>
                      acc +
                      (record.students.filter((s) => s.status === 'Present').length /
                        record.students.length) *
                        100,
                    0
                  ) / attendance.length
                ) || 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Classes Today</Typography>
              </Box>
              <Typography variant="h4">
                {attendance.filter(
                  (record) =>
                    record.date === new Date().toISOString().split('T')[0]
                ).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Class Selection and Attendance Management */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {/* Class List */}
              <Grid item xs={12} md={3}>
                <Typography variant="h6" gutterBottom>
                  Classes
                </Typography>
                <List>
                  {classes.map((cls) => (
                    <ListItem
                      key={cls.id}
                      button
                      selected={selectedClass?.id === cls.id}
                      onClick={() => handleClassSelect(cls)}
                    >
                      <ListItemIcon>
                        <SchoolIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={cls.name} />
                    </ListItem>
                  ))}
                </List>
              </Grid>

              {/* Attendance Management */}
              <Grid item xs={12} md={9}>
                {selectedClass ? (
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">
                        Attendance - {selectedClass.name}
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                      >
                        Take Attendance
                      </Button>
                    </Box>

                    <Tabs value={activeTab} onChange={handleTabChange}>
                      <Tab label="Today's Attendance" />
                      <Tab label="History" />
                      <Tab label="Summary" />
                    </Tabs>

                    <Box mt={2}>
                      {activeTab === 0 && (
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Student</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Time</TableCell>
                                <TableCell>Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {attendance
                                .filter(
                                  (record) =>
                                    record.classId === selectedClass.id &&
                                    record.date === new Date().toISOString().split('T')[0]
                                )
                                .map((record) =>
                                  record.students.map((student) => (
                                    <TableRow key={student.id}>
                                      <TableCell>{student.name}</TableCell>
                                      <TableCell>
                                        <Chip
                                          label={student.status}
                                          color={
                                            student.status === 'Present'
                                              ? 'success'
                                              : 'error'
                                          }
                                        />
                                      </TableCell>
                                      <TableCell>{record.time}</TableCell>
                                      <TableCell>
                                        <IconButton
                                          onClick={() => handleOpenDialog(record)}
                                          color="primary"
                                        >
                                          <EditIcon />
                                        </IconButton>
                                        <IconButton
                                          onClick={() => handleDelete(record.id)}
                                          color="error"
                                        >
                                          <DeleteIcon />
                                        </IconButton>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}

                      {activeTab === 1 && (
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Present</TableCell>
                                <TableCell>Absent</TableCell>
                                <TableCell>Percentage</TableCell>
                                <TableCell>Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {attendance
                                .filter((record) => record.classId === selectedClass.id)
                                .map((record) => (
                                  <TableRow key={record.id}>
                                    <TableCell>{record.date}</TableCell>
                                    <TableCell>
                                      {
                                        record.students.filter(
                                          (s) => s.status === 'Present'
                                        ).length
                                      }
                                    </TableCell>
                                    <TableCell>
                                      {
                                        record.students.filter(
                                          (s) => s.status === 'Absent'
                                        ).length
                                      }
                                    </TableCell>
                                    <TableCell>
                                      {Math.round(
                                        (record.students.filter(
                                          (s) => s.status === 'Present'
                                        ).length /
                                          record.students.length) *
                                          100
                                      )}
                                      %
                                    </TableCell>
                                    <TableCell>
                                      <IconButton
                                        onClick={() => handleOpenDialog(record)}
                                        color="primary"
                                      >
                                        <EditIcon />
                                      </IconButton>
                                      <IconButton
                                        onClick={() => handleDelete(record.id)}
                                        color="error"
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}

                      {activeTab === 2 && (
                        <Box>
                          <Typography variant="subtitle1" gutterBottom>
                            Student Attendance Summary
                          </Typography>
                          <TableContainer>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Student</TableCell>
                                  <TableCell>Present Days</TableCell>
                                  <TableCell>Absent Days</TableCell>
                                  <TableCell>Attendance %</TableCell>
                                  <TableCell>Status</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {selectedClass.students.map((student) => {
                                  const studentRecords = attendance
                                    .filter((record) => record.classId === selectedClass.id)
                                    .flatMap((record) =>
                                      record.students.filter((s) => s.id === student.id)
                                    );
                                  const presentDays = studentRecords.filter(
                                    (s) => s.status === 'Present'
                                  ).length;
                                  const totalDays = studentRecords.length;
                                  const percentage = Math.round(
                                    (presentDays / totalDays) * 100
                                  );
                                  const status =
                                    percentage >= 90
                                      ? 'Excellent'
                                      : percentage >= 80
                                      ? 'Good'
                                      : percentage >= 70
                                      ? 'Average'
                                      : 'Poor';

                                  return (
                                    <TableRow key={student.id}>
                                      <TableCell>
                                        {student.firstName} {student.lastName}
                                      </TableCell>
                                      <TableCell>{presentDays}</TableCell>
                                      <TableCell>{totalDays - presentDays}</TableCell>
                                      <TableCell>{percentage}%</TableCell>
                                      <TableCell>
                                        <Chip
                                          label={status}
                                          color={
                                            status === 'Excellent'
                                              ? 'success'
                                              : status === 'Good'
                                              ? 'primary'
                                              : status === 'Average'
                                              ? 'warning'
                                              : 'error'
                                          }
                                        />
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      )}
                    </Box>
                  </Box>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <Typography color="textSecondary">
                      Select a class to view attendance
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Attendance Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAttendance ? 'Edit Attendance' : 'Take Attendance'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="date"
                label="Date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={student.status}
                            color={
                              student.status === 'Present' ? 'success' : 'error'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="success"
                            onClick={() =>
                              handleStudentStatusChange(student.id, 'Present')
                            }
                          >
                            <CheckCircleIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() =>
                              handleStudentStatusChange(student.id, 'Absent')
                            }
                          >
                            <CancelIcon />
                          </IconButton>
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
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingAttendance ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default T_Attendance; 