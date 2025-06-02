import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Person,
  Event,
  LocationOn,
  AccessTime,
  Book,
  Group,
  CheckCircle,
  Warning,
  Close,
  Edit,
  Save,
  Cancel,
} from '@mui/icons-material';
import { teacherAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Classes = () => {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedClass, setSelectedClass] = useState(null);
  const [attendanceDialog, setAttendanceDialog] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editedClass, setEditedClass] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getClasses();
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleViewClass = async (classItem) => {
    try {
      const response = await teacherAPI.getClassDetails(classItem.id);
      setSelectedClass(response.data);
      setAttendanceData(response.data.students.map(student => ({
        ...student,
        status: 'Present',
        remarks: '',
      })));
    } catch (error) {
      console.error('Error fetching class details:', error);
      toast.error('Failed to load class details');
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData(prev =>
      prev.map(student =>
        student.id === studentId ? { ...student, status } : student
      )
    );
  };

  const handleRemarksChange = (studentId, remarks) => {
    setAttendanceData(prev =>
      prev.map(student =>
        student.id === studentId ? { ...student, remarks } : student
      )
    );
  };

  const handleSaveAttendance = async () => {
    try {
      await teacherAPI.saveAttendance(selectedClass.id, attendanceData);
      toast.success('Attendance saved successfully');
      setAttendanceDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Failed to save attendance');
    }
  };

  const handleEditClass = (classItem) => {
    setEditedClass(classItem);
    setEditMode(true);
  };

  const handleSaveClass = async () => {
    try {
      await teacherAPI.updateClass(editedClass.id, editedClass);
      toast.success('Class updated successfully');
      setEditMode(false);
      setEditedClass(null);
      fetchData();
    } catch (error) {
      console.error('Error updating class:', error);
      toast.error('Failed to update class');
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedClass(null);
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
      <Typography variant="h4" sx={{ mb: 3 }}>
        My Classes
      </Typography>

      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        sx={{ mb: 3 }}
      >
        <Tab label="All Classes" />
        <Tab label="Today's Classes" />
        <Tab label="Upcoming Classes" />
      </Tabs>

      <Grid container spacing={3}>
        {classes
          .filter(classItem => {
            if (selectedTab === 1) return classItem.isToday;
            if (selectedTab === 2) return classItem.isUpcoming;
            return true;
          })
          .map((classItem) => (
            <Grid item xs={12} md={6} key={classItem.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {classItem.subject}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Book sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="body2">
                          {classItem.class} {classItem.section}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <AccessTime sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="body2">
                          {classItem.time}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOn sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="body2">
                          Room {classItem.room}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Chip
                        icon={<Group />}
                        label={`${classItem.students} students`}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      {classItem.isToday && (
                        <Chip
                          icon={<Event />}
                          label="Today"
                          color="primary"
                          size="small"
                        />
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleViewClass(classItem)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleEditClass(classItem)}
                    >
                      Edit
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>

      {/* Class Details Dialog */}
      <Dialog
        open={!!selectedClass}
        onClose={() => setSelectedClass(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedClass && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  {selectedClass.subject} - {selectedClass.class} {selectedClass.section}
                </Typography>
                <IconButton onClick={() => setSelectedClass(null)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Class Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTime sx={{ mr: 1 }} />
                        <Typography>
                          Time: {selectedClass.time}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOn sx={{ mr: 1 }} />
                        <Typography>
                          Room: {selectedClass.room}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Students
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Roll No</TableCell>
                          <TableCell>Attendance</TableCell>
                          <TableCell>Remarks</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {attendanceData.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>{student.rollNo}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip
                                  label="Present"
                                  color={student.status === 'Present' ? 'success' : 'default'}
                                  size="small"
                                  onClick={() => handleAttendanceChange(student.id, 'Present')}
                                />
                                <Chip
                                  label="Absent"
                                  color={student.status === 'Absent' ? 'error' : 'default'}
                                  size="small"
                                  onClick={() => handleAttendanceChange(student.id, 'Absent')}
                                />
                                <Chip
                                  label="Late"
                                  color={student.status === 'Late' ? 'warning' : 'default'}
                                  size="small"
                                  onClick={() => handleAttendanceChange(student.id, 'Late')}
                                />
                              </Box>
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                value={student.remarks}
                                onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                                placeholder="Add remarks"
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
              <Button onClick={() => setSelectedClass(null)}>Close</Button>
              <Button
                variant="contained"
                onClick={handleSaveAttendance}
              >
                Save Attendance
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit Class Dialog */}
      <Dialog
        open={editMode}
        onClose={handleCancelEdit}
        maxWidth="sm"
        fullWidth
      >
        {editedClass && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Edit Class</Typography>
                <IconButton onClick={handleCancelEdit}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    label="Subject"
                    fullWidth
                    value={editedClass.subject}
                    onChange={(e) => setEditedClass({ ...editedClass, subject: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Class"
                    fullWidth
                    value={editedClass.class}
                    onChange={(e) => setEditedClass({ ...editedClass, class: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Section"
                    fullWidth
                    value={editedClass.section}
                    onChange={(e) => setEditedClass({ ...editedClass, section: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Time"
                    fullWidth
                    value={editedClass.time}
                    onChange={(e) => setEditedClass({ ...editedClass, time: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Room"
                    fullWidth
                    value={editedClass.room}
                    onChange={(e) => setEditedClass({ ...editedClass, room: e.target.value })}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelEdit}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleSaveClass}
              >
                Save Changes
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Classes; 