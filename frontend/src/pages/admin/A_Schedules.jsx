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
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  AccessTime as AccessTimeIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';

const A_Schedules = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    classId: '',
    subjectId: '',
    teacherId: '',
    day: '',
    startTime: '',
    endTime: '',
    roomNumber: '',
  });

  useEffect(() => {
    fetchSchedules();
    fetchClasses();
    fetchSubjects();
    fetchTeachers();
  }, []);

  const fetchSchedules = async () => {
    try {
      const data = await adminAPI.getSchedules();
      setSchedules(data);
    } catch {
      setError('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await adminAPI.getClasses();
      setClasses(data);
    } catch {
      setError('Failed to load classes');
    }
  };

  const fetchSubjects = async () => {
    try {
      const dataSub = await adminAPI.getSubjects();
      setSubjects(dataSub);
    } catch {
      setError('Failed to load subjects');
    }
  };

  const fetchTeachers = async () => {
    try {
      const users = await adminAPI.getAllUsers();
      setTeachers(users.filter(u=>u.role==='staff'));
    } catch {
      setError('Failed to load teachers');
    }
  };

  const handleOpenDialog = (scheduleData = null) => {
    if (scheduleData) {
      setEditingSchedule(scheduleData);
      setFormData({
        classId: scheduleData.classId,
        subjectId: scheduleData.subjectId,
        teacherId: scheduleData.teacherId,
        day: scheduleData.day,
        startTime: scheduleData.startTime,
        endTime: scheduleData.endTime,
        roomNumber: scheduleData.roomNumber,
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        classId: '',
        subjectId: '',
        teacherId: '',
        day: '',
        startTime: '',
        endTime: '',
        roomNumber: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSchedule(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (editingSchedule) {
        await adminAPI.updateSchedule(editingSchedule._id, formData);
      } else {
        await adminAPI.createSchedule(formData);
      }
      handleCloseDialog();
      fetchSchedules();
    } catch {
      setError('Failed to save schedule');
    }
  };

  const handleDelete = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await adminAPI.deleteSchedule(scheduleId);
        fetchSchedules();
      } catch {
        setError('Failed to delete schedule');
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Schedule Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add New Schedule
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Schedule Statistics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Schedules</Typography>
              </Box>
              <Typography variant="h4">{schedules.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SchoolIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Classes with Schedules</Typography>
              </Box>
              <Typography variant="h4">
                {new Set(schedules.map((schedule) => schedule.classId)).size}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Average Schedules per Class</Typography>
              </Box>
              <Typography variant="h4">
                {Math.round(schedules.length / classes.length)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Schedule List */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Class</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Teacher</TableCell>
                  <TableCell>Day</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  <TableCell>Room</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>{schedule.className}</TableCell>
                    <TableCell>{schedule.subjectName}</TableCell>
                    <TableCell>{schedule.teacherName}</TableCell>
                    <TableCell>{schedule.day}</TableCell>
                    <TableCell>{schedule.startTime}</TableCell>
                    <TableCell>{schedule.endTime}</TableCell>
                    <TableCell>{schedule.roomNumber}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenDialog(schedule)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(schedule.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
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
                      {cls.name} - {cls.section}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Subject</InputLabel>
                <Select
                  name="subjectId"
                  value={formData.subjectId}
                  onChange={handleChange}
                  required
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Teacher</InputLabel>
                <Select
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={handleChange}
                  required
                >
                  {teachers.map((teacher) => (
                    <MenuItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Day</InputLabel>
                <Select
                  name="day"
                  value={formData.day}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="Monday">Monday</MenuItem>
                  <MenuItem value="Tuesday">Tuesday</MenuItem>
                  <MenuItem value="Wednesday">Wednesday</MenuItem>
                  <MenuItem value="Thursday">Thursday</MenuItem>
                  <MenuItem value="Friday">Friday</MenuItem>
                  <MenuItem value="Saturday">Saturday</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="startTime"
                label="Start Time"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="endTime"
                label="End Time"
                type="time"
                value={formData.endTime}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="roomNumber"
                label="Room Number"
                value={formData.roomNumber}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingSchedule ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default A_Schedules; 