import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  InputAdornment,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { staffAPI } from '../../services/api';
import { toast } from 'react-toastify';

const ClassManagement = () => {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    grade: '',
    capacity: '',
    teacher: '',
    subjects: [],
    schedule: '',
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    filterClasses();
  }, [searchTerm, classes]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await staffAPI.getClasses();
      setClasses(response.data);
      setFilteredClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const filterClasses = () => {
    const filtered = classes.filter(
      (classItem) =>
        classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classItem.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classItem.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classItem.teacher.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClasses(filtered);
  };

  const handleAddClass = () => {
    setSelectedClass(null);
    setFormData({
      name: '',
      section: '',
      grade: '',
      capacity: '',
      teacher: '',
      subjects: [],
      schedule: '',
    });
    setOpenDialog(true);
  };

  const handleEditClass = (classItem) => {
    setSelectedClass(classItem);
    setFormData(classItem);
    setOpenDialog(true);
  };

  const handleDeleteClass = async (classId) => {
    try {
      await staffAPI.deleteClass(classId);
      toast.success('Class deleted successfully');
      fetchClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error('Failed to delete class');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveClass = async () => {
    try {
      if (selectedClass) {
        await staffAPI.updateClass(selectedClass.id, formData);
        toast.success('Class updated successfully');
      } else {
        await staffAPI.addClass(formData);
        toast.success('Class added successfully');
      }
      setOpenDialog(false);
      fetchClasses();
    } catch (error) {
      console.error('Error saving class:', error);
      toast.error('Failed to save class');
    }
  };

  const handleViewDetails = (classId) => {
    // Navigate to class details page or open dialog
    console.log('View details for class:', classId);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Class Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage classes, students, and schedules
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClass}
        >
          Add Class
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label="All Classes" />
          <Tab label="Students" />
          <Tab label="Schedule" />
        </Tabs>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search classes by name, section, grade, or teacher"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Class Name</TableCell>
                  <TableCell>Section</TableCell>
                  <TableCell>Grade</TableCell>
                  <TableCell>Teacher</TableCell>
                  <TableCell>Capacity</TableCell>
                  <TableCell>Subjects</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredClasses.map((classItem) => (
                  <TableRow key={classItem.id}>
                    <TableCell>{classItem.name}</TableCell>
                    <TableCell>{classItem.section}</TableCell>
                    <TableCell>{classItem.grade}</TableCell>
                    <TableCell>{classItem.teacher}</TableCell>
                    <TableCell>{classItem.capacity}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {classItem.subjects.map((subject) => (
                          <Chip
                            key={subject}
                            label={subject}
                            size="small"
                            sx={{ m: 0.5 }}
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(classItem.id)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Students">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(classItem.id)}
                        >
                          <PeopleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Schedule">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(classItem.id)}
                        >
                          <ScheduleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEditClass(classItem)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClass(classItem.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
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
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Section"
                name="section"
                value={formData.section}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Grade"
                name="grade"
                value={formData.grade}
                onChange={handleInputChange}
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
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Teacher"
                name="teacher"
                value={formData.teacher}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subjects"
                name="subjects"
                value={formData.subjects.join(', ')}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    subjects: e.target.value.split(',').map((s) => s.trim()),
                  }))
                }
                helperText="Enter subjects separated by commas"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Schedule"
                name="schedule"
                value={formData.schedule}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveClass} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassManagement; 