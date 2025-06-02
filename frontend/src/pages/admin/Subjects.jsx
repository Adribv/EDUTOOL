import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  Chip,
  CircularProgress,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Book as BookIcon,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Subjects = () => {
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    teacherId: '',
    classId: '',
    credits: '',
    type: 'compulsory',
    status: 'active',
  });

  useEffect(() => {
    fetchSubjects();
    fetchTeachers();
    fetchClasses();
  }, [page, rowsPerPage]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getSubjects({
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery,
      });
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await adminAPI.getTeachers();
      setTeachers(response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to load teachers');
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await adminAPI.getClasses();
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    }
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
    fetchSubjects();
  };

  const handleOpenDialog = (subject = null) => {
    if (subject) {
      setSelectedSubject(subject);
      setFormData({
        name: subject.name,
        code: subject.code,
        description: subject.description,
        teacherId: subject.teacherId,
        classId: subject.classId,
        credits: subject.credits,
        type: subject.type,
        status: subject.status,
      });
    } else {
      setSelectedSubject(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        teacherId: '',
        classId: '',
        credits: '',
        type: 'compulsory',
        status: 'active',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSubject(null);
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
      if (selectedSubject) {
        await adminAPI.updateSubject(selectedSubject.id, formData);
        toast.success('Subject updated successfully');
      } else {
        await adminAPI.createSubject(formData);
        toast.success('Subject added successfully');
      }
      handleCloseDialog();
      fetchSubjects();
    } catch (error) {
      console.error('Error saving subject:', error);
      toast.error('Failed to save subject');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await adminAPI.deleteSubject(id);
        toast.success('Subject deleted successfully');
        fetchSubjects();
      } catch (error) {
        console.error('Error deleting subject:', error);
        toast.error('Failed to delete subject');
      }
    }
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'N/A';
  };

  const getClassName = (classId) => {
    const classItem = classes.find((c) => c.id === classId);
    return classItem ? classItem.name : 'N/A';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Subjects Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Subject
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search subjects..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Subject</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Teacher</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Credits</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : subjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No subjects found
                </TableCell>
              </TableRow>
            ) : (
              subjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BookIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body1">{subject.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{subject.code}</TableCell>
                  <TableCell>{getTeacherName(subject.teacherId)}</TableCell>
                  <TableCell>{getClassName(subject.classId)}</TableCell>
                  <TableCell>{subject.credits}</TableCell>
                  <TableCell>
                    <Chip
                      label={subject.type}
                      color={subject.type === 'compulsory' ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={subject.status}
                      color={subject.status === 'active' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton size="small">
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(subject)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(subject.id)}
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedSubject ? 'Edit Subject' : 'Add New Subject'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Subject Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Subject Code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Teacher</InputLabel>
                <Select
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={handleInputChange}
                  label="Teacher"
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Credits"
                name="credits"
                type="number"
                value={formData.credits}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  label="Type"
                >
                  <MenuItem value="compulsory">Compulsory</MenuItem>
                  <MenuItem value="elective">Elective</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
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
            {selectedSubject ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Subjects; 