import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { teacherAPI } from '../../services/api';
import { toast } from 'react-toastify';

const ClassManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    grade: '',
    schedule: '',
    room: '',
    capacity: '',
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getClasses();
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setError('Failed to load classes');
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (classData = null) => {
    if (classData) {
      setSelectedClass(classData);
      setFormData({
        name: classData.name,
        subject: classData.subject,
        grade: classData.grade,
        schedule: classData.schedule,
        room: classData.room,
        capacity: classData.capacity,
      });
    } else {
      setSelectedClass(null);
      setFormData({
        name: '',
        subject: '',
        grade: '',
        schedule: '',
        room: '',
        capacity: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedClass(null);
    setFormData({
      name: '',
      subject: '',
      grade: '',
      schedule: '',
      room: '',
      capacity: '',
    });
  };

  const handleSubmit = async () => {
    try {
      if (selectedClass) {
        await teacherAPI.updateClass(selectedClass.id, formData);
        toast.success('Class updated successfully');
      } else {
        await teacherAPI.createClass(formData);
        toast.success('Class created successfully');
      }
      handleCloseDialog();
      fetchClasses();
    } catch (error) {
      console.error('Error saving class:', error);
      toast.error('Failed to save class');
    }
  };

  const handleDelete = async (classId) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await teacherAPI.deleteClass(classId);
        toast.success('Class deleted successfully');
        fetchClasses();
      } catch (error) {
        console.error('Error deleting class:', error);
        toast.error('Failed to delete class');
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
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Class Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add New Class
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab icon={<ScheduleIcon />} label="Classes" />
          <Tab icon={<PersonIcon />} label="Students" />
          <Tab icon={<AssignmentIcon />} label="Attendance" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {classes.map((classItem) => (
            <Grid item xs={12} md={6} key={classItem.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">{classItem.name}</Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(classItem)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(classItem.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography color="textSecondary" gutterBottom>
                    {classItem.subject} - Grade {classItem.grade}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Schedule
                      </Typography>
                      <Typography variant="body1">{classItem.schedule}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Room
                      </Typography>
                      <Typography variant="body1">{classItem.room}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Students
                      </Typography>
                      <Typography variant="body1">
                        {classItem.enrolledStudents}/{classItem.capacity}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Status
                      </Typography>
                      <Chip
                        label={classItem.status}
                        color={classItem.status === 'Active' ? 'success' : 'default'}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student Name</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Grade</TableCell>
                <TableCell>Attendance</TableCell>
                <TableCell>Performance</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classes.flatMap((classItem) =>
                classItem.students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{classItem.name}</TableCell>
                    <TableCell>{student.grade}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${student.attendance}%`}
                        color={student.attendance >= 75 ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={student.performance}
                        color={
                          student.performance === 'Excellent'
                            ? 'success'
                            : student.performance === 'Good'
                            ? 'primary'
                            : 'warning'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => {}}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {activeTab === 2 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Class</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Present</TableCell>
                <TableCell>Absent</TableCell>
                <TableCell>Late</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classes.map((classItem) =>
                classItem.attendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{classItem.name}</TableCell>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.present}</TableCell>
                    <TableCell>{record.absent}</TableCell>
                    <TableCell>{record.late}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => {}}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedClass ? 'Edit Class' : 'Add New Class'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Class Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Grade"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Schedule"
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Room"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Capacity"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={!formData.name || !formData.subject || !formData.grade}
          >
            {selectedClass ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassManagement; 