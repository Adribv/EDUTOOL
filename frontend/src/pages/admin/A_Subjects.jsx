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
  Book as BookIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';

const A_Subjects = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    grade: '',
    description: '',
    classId: '',
    teacherId: '',
    credits: '',
    type: '',
    schedule: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subjectsRes, classesRes, teachersRes] = await Promise.all([
        adminAPI.getSubjects(),
        adminAPI.getClasses(),
        adminAPI.getAllUsers(),
      ]);
      setSubjects(subjectsRes);
      setClasses(classesRes);
      setTeachers(teachersRes.filter((u)=>u.role==='teacher'));
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (subjectData = null) => {
    if (subjectData) {
      setEditingSubject(subjectData);
      setFormData({
        name: subjectData.name,
        code: subjectData.code,
        grade: subjectData.grade,
        description: subjectData.description,
        classId: subjectData.classId,
        teacherId: subjectData.teacherId,
        credits: subjectData.credits,
        type: subjectData.type,
        schedule: subjectData.schedule,
      });
    } else {
      setEditingSubject(null);
      setFormData({
        name: '',
        code: '',
        grade: '',
        description: '',
        classId: '',
        teacherId: '',
        credits: '',
        type: '',
        schedule: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSubject(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (editingSubject) {
        await adminAPI.updateSubject(editingSubject._id, formData);
      } else {
        await adminAPI.createSubject(formData);
      }
      handleCloseDialog();
      fetchData();
    } catch {
      setError('Failed to save subject');
    }
  };

  const handleDelete = async (subjectId) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await adminAPI.deleteSubject(subjectId);
        fetchData();
      } catch {
        setError('Failed to delete subject');
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
        <Typography variant="h4">Subject Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add New Subject
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Subject Statistics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <BookIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Subjects</Typography>
              </Box>
              <Typography variant="h4">{subjects.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SchoolIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Classes with Subjects</Typography>
              </Box>
              <Typography variant="h4">
                {new Set(subjects.map((subject) => subject.classId)).size}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PersonIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Average Subjects per Class</Typography>
              </Box>
              <Typography variant="h4">
                {Math.round(
                  subjects.length /
                    new Set(subjects.map((subject) => subject.classId)).size
                ) || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Subject List */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Subject Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Teacher</TableCell>
                  <TableCell>Credits</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Schedule</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell>{subject.name}</TableCell>
                    <TableCell>{subject.code}</TableCell>
                    <TableCell>
                      {classes.find((cls) => cls.id === subject.classId)?.name}
                    </TableCell>
                    <TableCell>
                      {teachers.find((t) => t.id === subject.teacherId)?.firstName}{' '}
                      {teachers.find((t) => t.id === subject.teacherId)?.lastName}
                    </TableCell>
                    <TableCell>{subject.credits}</TableCell>
                    <TableCell>
                      <Chip
                        label={subject.type}
                        color={subject.type === 'core' ? 'primary' : 'secondary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{subject.schedule}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenDialog(subject)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(subject.id)} color="error">
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
          {editingSubject ? 'Edit Subject' : 'Add New Subject'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Subject Name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="code"
                label="Subject Code"
                value={formData.code}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="grade"
                label="Grade"
                value={formData.grade}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
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
                      {cls.name}
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
                      {teacher.firstName} {teacher.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="credits"
                label="Credits"
                type="number"
                value={formData.credits}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="core">Core</MenuItem>
                  <MenuItem value="elective">Elective</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="schedule"
                label="Schedule"
                value={formData.schedule}
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
            {editingSubject ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default A_Subjects; 