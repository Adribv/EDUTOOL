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
  People as PeopleIcon,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Classes = () => {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    capacity: '',
    teacherId: '',
    academicYear: '',
    description: '',
    status: 'active',
  });
  const [sheetLinks, setSheetLinks] = useState({});

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, [page, rowsPerPage]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getClasses({
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery,
      });
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
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
    fetchClasses();
  };

  const handleOpenDialog = (classItem = null) => {
    if (classItem) {
      setSelectedClass(classItem);
      setFormData({
        name: classItem.name,
        section: classItem.section,
        capacity: classItem.capacity,
        teacherId: classItem.teacherId,
        academicYear: classItem.academicYear,
        description: classItem.description,
        status: classItem.status,
      });
    } else {
      setSelectedClass(null);
      setFormData({
        name: '',
        section: '',
        capacity: '',
        teacherId: '',
        academicYear: '',
        description: '',
        status: 'active',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClass(null);
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
      let createdClass;
      if (selectedClass) {
        await adminAPI.updateClass(selectedClass.id, formData);
        toast.success('Class updated successfully');
      } else {
        createdClass = await adminAPI.createClass(formData);
        toast.success('Class added successfully');
        // Auto-generate Google Sheet after class creation
        if (createdClass?.data?.id || createdClass?.data?._id) {
          const classId = createdClass.data.id || createdClass.data._id;
          try {
            const response = await adminAPI.generateClassSheet(classId);
            setSheetLinks((prev) => ({ ...prev, [classId]: response.data.sheetUrl }));
          } catch (err) {
            toast.error('Failed to auto-generate sheet');
          }
        }
      }
      handleCloseDialog();
      fetchClasses();
    } catch (error) {
      console.error('Error saving class:', error);
      toast.error('Failed to save class');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await adminAPI.deleteClass(id);
        toast.success('Class deleted successfully');
        fetchClasses();
      } catch (error) {
        console.error('Error deleting class:', error);
        toast.error('Failed to delete class');
      }
    }
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'N/A';
  };

  const generateSheet = async (classId) => {
    try {
      const response = await adminAPI.generateClassSheet(classId);
      setSheetLinks((prev) => ({ ...prev, [classId]: response.data.sheetUrl }));
      toast.success('Google Sheet generated!');
      fetchClasses();
    } catch (err) {
      toast.error('Failed to generate sheet');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Classes Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Class
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search classes..."
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
              <TableCell>Class Name</TableCell>
              <TableCell>Section</TableCell>
              <TableCell>Teacher</TableCell>
              <TableCell>Capacity</TableCell>
              <TableCell>Academic Year</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Sheet Link</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : classes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No classes found
                </TableCell>
              </TableRow>
            ) : (
              classes.map((classItem) => (
                <TableRow key={classItem.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body1">{classItem.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{classItem.section}</TableCell>
                  <TableCell>{getTeacherName(classItem.teacherId)}</TableCell>
                  <TableCell>{classItem.capacity}</TableCell>
                  <TableCell>{classItem.academicYear}</TableCell>
                  <TableCell>
                    <Chip
                      label={classItem.status}
                      color={classItem.status === 'active' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {sheetLinks[classItem.id] ? (
                      <Button href={sheetLinks[classItem.id]} target="_blank" size="small">View Sheet</Button>
                    ) : (
                      <Typography variant="body2" color="text.secondary">Generating...</Typography>
                    )}
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
                        onClick={() => handleOpenDialog(classItem)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(classItem.id)}
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
          {selectedClass ? 'Edit Class' : 'Add New Class'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Class Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Section"
                name="section"
                value={formData.section}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Class Teacher</InputLabel>
                <Select
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={handleInputChange}
                  label="Class Teacher"
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
                fullWidth
                label="Academic Year"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleInputChange}
                required
              />
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
            {selectedClass ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Classes; 