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
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  School as SchoolIcon,
  Group as GroupIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';

const A_Classes = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    section: '',
    capacity: '',
    teacherId: '',
    roomNumber: '',
    schedule: '',
    academicYear: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesRes, teachersRes] = await Promise.all([
        adminAPI.getClasses(),
        adminAPI.getAllUsers(),
      ]);
      setClasses(classesRes);
      setTeachers(teachersRes.filter((user) => user.role === 'teacher'));
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (classData = null) => {
    if (classData) {
      setEditingClass(classData);
      setFormData({
        name: classData.name,
        grade: classData.grade,
        section: classData.section,
        capacity: classData.capacity,
        teacherId: classData.teacherId,
        roomNumber: classData.roomNumber,
        schedule: classData.schedule,
        academicYear: classData.academicYear,
      });
    } else {
      setEditingClass(null);
      setFormData({
        name: '',
        grade: '',
        section: '',
        capacity: '',
        teacherId: '',
        roomNumber: '',
        schedule: '',
        academicYear: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingClass(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (editingClass) {
        await adminAPI.updateClass(editingClass._id, formData);
      } else {
        await adminAPI.createClass(formData);
      }
      handleCloseDialog();
      fetchData();
    } catch {
      setError('Failed to save class');
    }
  };

  const handleDelete = async (classId) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await adminAPI.deleteClass(classId);
        fetchData();
      } catch {
        setError('Failed to delete class');
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
        <Typography variant="h4">Class Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add New Class
        </Button>
      </Box>

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
                {classes.reduce((total, cls) => total + (cls.studentCount || 0), 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PersonIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Average Class Size</Typography>
              </Box>
              <Typography variant="h4">
                {Math.round(
                  classes.reduce((total, cls) => total + (cls.studentCount || 0), 0) /
                    classes.length
                ) || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Class List */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Class Name</TableCell>
                  <TableCell>Section</TableCell>
                  <TableCell>Teacher</TableCell>
                  <TableCell>Room Number</TableCell>
                  <TableCell>Schedule</TableCell>
                  <TableCell>Students</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classes.map((cls) => (
                  <TableRow key={cls.id || cls._id}>
                    <TableCell>{cls.name}</TableCell>
                    <TableCell>{cls.section}</TableCell>
                    <TableCell>
                      {teachers.find((t) => t._id === cls.teacherId)?.firstName}{' '}
                      {teachers.find((t) => t._id === cls.teacherId)?.lastName}
                    </TableCell>
                    <TableCell>{cls.roomNumber}</TableCell>
                    <TableCell>{cls.schedule}</TableCell>
                    <TableCell>
                      {cls.studentCount || 0}/{cls.capacity}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          (cls.studentCount || 0) >= cls.capacity ? 'Full' : 'Available'
                        }
                        color={(cls.studentCount || 0) >= cls.capacity ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenDialog(cls)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(cls.id)} color="error">
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
          {editingClass ? 'Edit Class' : 'Add New Class'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Class Name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="grade"
                label="Grade"
                value={formData.grade}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="section"
                label="Section"
                value={formData.section}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="capacity"
                label="Capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Class Teacher</InputLabel>
                <Select
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={handleChange}
                  required
                >
                  {teachers.map((teacher) => (
                    <MenuItem key={teacher.id} value={teacher.id}>
                      {teacher.firstName} {teacher.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="roomNumber"
                label="Room Number"
                value={formData.roomNumber}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="schedule"
                label="Schedule"
                value={formData.schedule}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="academicYear"
                label="Academic Year"
                value={formData.academicYear}
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
            {editingClass ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default A_Classes; 