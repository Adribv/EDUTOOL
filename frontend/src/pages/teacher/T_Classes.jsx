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
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import {
  School as SchoolIcon,
  Group as GroupIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import teacherService from '../../services/teacherService';

const T_Classes = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [attendanceData, setAttendanceData] = useState({});

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await teacherService.getClasses();
      setClasses(response.data);
    } catch {
      setError('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleClassSelect = (classData) => {
    setSelectedClass(classData);
    fetchAttendanceData(classData.id);
  };

  const fetchAttendanceData = async (classId) => {
    try {
      const response = await teacherService.getClassAttendance(classId);
      setAttendanceData(response.data);
    } catch {
      setError('Failed to load attendance data');
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleAttendanceSubmit = async () => {
    try {
      await teacherService.updateAttendance(selectedClass.id, attendanceData);
      handleCloseDialog();
      fetchAttendanceData(selectedClass.id);
    } catch {
      setError('Failed to update attendance');
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: status,
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
      <Typography variant="h4" gutterBottom>
        My Classes
      </Typography>

      <Grid container spacing={3}>
        {/* Class Statistics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SchoolIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Classes</Typography>
              </Box>
              <Typography variant="h4">{classes.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <GroupIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Students</Typography>
              </Box>
              <Typography variant="h4">
                {classes.reduce((total, cls) => total + cls.students.length, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <EventIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Classes Today</Typography>
              </Box>
              <Typography variant="h4">
                {classes.filter((cls) => cls.schedule.includes('Today')).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Class List and Details */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {/* Class List */}
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  Class List
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
                      <ListItemText
                        primary={cls.name}
                        secondary={`${cls.schedule} - ${cls.students.length} students`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>

              {/* Class Details */}
              <Grid item xs={12} md={8}>
                {selectedClass ? (
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">
                        {selectedClass.name} - {selectedClass.schedule}
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleOpenDialog}
                      >
                        Take Attendance
                      </Button>
                    </Box>

                    <Tabs value={activeTab} onChange={handleTabChange}>
                      <Tab label="Students" />
                      <Tab label="Schedule" />
                      <Tab label="Attendance" />
                    </Tabs>

                    <Box mt={2}>
                      {activeTab === 0 && (
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Roll Number</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Status</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {selectedClass.students.map((student) => (
                                <TableRow key={student.id}>
                                  <TableCell>
                                    {student.firstName} {student.lastName}
                                  </TableCell>
                                  <TableCell>{student.rollNumber}</TableCell>
                                  <TableCell>{student.email}</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={student.status}
                                      color={student.status === 'Active' ? 'success' : 'default'}
                                      size="small"
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}

                      {activeTab === 1 && (
                        <Box>
                          <Typography variant="subtitle1" gutterBottom>
                            Class Schedule
                          </Typography>
                          <List>
                            {selectedClass.scheduleDetails.map((detail, index) => (
                              <ListItem key={index}>
                                <ListItemIcon>
                                  <AccessTimeIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                  primary={detail.day}
                                  secondary={`${detail.startTime} - ${detail.endTime}`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}

                      {activeTab === 2 && (
                        <Box>
                          <Typography variant="subtitle1" gutterBottom>
                            Attendance History
                          </Typography>
                          <TableContainer>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Date</TableCell>
                                  <TableCell>Present</TableCell>
                                  <TableCell>Absent</TableCell>
                                  <TableCell>Percentage</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {selectedClass.attendanceHistory.map((record) => (
                                  <TableRow key={record.date}>
                                    <TableCell>{record.date}</TableCell>
                                    <TableCell>{record.present}</TableCell>
                                    <TableCell>{record.absent}</TableCell>
                                    <TableCell>{record.percentage}%</TableCell>
                                  </TableRow>
                                ))}
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
                      Select a class to view details
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
        <DialogTitle>Take Attendance - {selectedClass?.name}</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Roll Number</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedClass?.students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell>{student.rollNumber}</TableCell>
                    <TableCell>
                      <Chip
                        label={attendanceData[student.id] || 'Not Marked'}
                        color={
                          attendanceData[student.id] === 'Present'
                            ? 'success'
                            : attendanceData[student.id] === 'Absent'
                            ? 'error'
                            : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="success"
                        onClick={() => handleAttendanceChange(student.id, 'Present')}
                      >
                        <CheckCircleIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleAttendanceChange(student.id, 'Absent')}
                      >
                        <CancelIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAttendanceSubmit} variant="contained" color="primary">
            Save Attendance
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default T_Classes; 