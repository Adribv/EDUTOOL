import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const DepartmentManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    status: 'Active',
    details: '',
  });

  const [teachers, setTeachers] = useState([
    {
      id: 1,
      name: 'Dr. John Smith',
      specialization: 'Computer Science',
      courses: ['Data Structures', 'Algorithms'],
      status: 'Active',
    },
    {
      id: 2,
      name: 'Dr. Sarah Johnson',
      specialization: 'Software Engineering',
      courses: ['Web Development', 'Database Systems'],
      status: 'Active',
    },
  ]);

  const [courses, setCourses] = useState([
    {
      id: 1,
      name: 'Data Structures',
      code: 'CS201',
      credits: 3,
      teacher: 'Dr. John Smith',
      students: 45,
    },
    {
      id: 2,
      name: 'Web Development',
      code: 'CS301',
      credits: 4,
      teacher: 'Dr. Sarah Johnson',
      students: 38,
    },
  ]);

  const [resources, setResources] = useState([
    {
      id: 1,
      name: 'Computer Lab 101',
      type: 'Laboratory',
      capacity: 30,
      status: 'Available',
    },
    {
      id: 2,
      name: 'Projector Room',
      type: 'Equipment',
      capacity: 50,
      status: 'In Use',
    },
  ]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setSelectedItem(item);
      setFormData(item);
    } else {
      setSelectedItem(null);
      setFormData({
        name: '',
        type: '',
        status: 'Active',
        details: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement form submission logic
    console.log('Form submitted:', formData);
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    // TODO: Implement delete logic
    console.log('Delete item:', id);
  };

  const renderTeachersTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Specialization</TableCell>
            <TableCell>Courses</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {teachers.map((teacher) => (
            <TableRow key={teacher.id}>
              <TableCell>{teacher.name}</TableCell>
              <TableCell>{teacher.specialization}</TableCell>
              <TableCell>{teacher.courses.join(', ')}</TableCell>
              <TableCell>{teacher.status}</TableCell>
              <TableCell>
                <IconButton
                  color="primary"
                  onClick={() => handleOpenDialog(teacher)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleDelete(teacher.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderCoursesTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Course Name</TableCell>
            <TableCell>Code</TableCell>
            <TableCell>Credits</TableCell>
            <TableCell>Teacher</TableCell>
            <TableCell>Students</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.id}>
              <TableCell>{course.name}</TableCell>
              <TableCell>{course.code}</TableCell>
              <TableCell>{course.credits}</TableCell>
              <TableCell>{course.teacher}</TableCell>
              <TableCell>{course.students}</TableCell>
              <TableCell>
                <IconButton
                  color="primary"
                  onClick={() => handleOpenDialog(course)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleDelete(course.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderResourcesTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Capacity</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {resources.map((resource) => (
            <TableRow key={resource.id}>
              <TableCell>{resource.name}</TableCell>
              <TableCell>{resource.type}</TableCell>
              <TableCell>{resource.capacity}</TableCell>
              <TableCell>{resource.status}</TableCell>
              <TableCell>
                <IconButton
                  color="primary"
                  onClick={() => handleOpenDialog(resource)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleDelete(resource.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4">Department Management</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenDialog()}
            >
              Add New
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Teachers" />
              <Tab label="Courses" />
              <Tab label="Resources" />
            </Tabs>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          {activeTab === 0 && renderTeachersTable()}
          {activeTab === 1 && renderCoursesTable()}
          {activeTab === 2 && renderResourcesTable()}
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedItem ? 'Edit Item' : 'Add New Item'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    label="Type"
                  >
                    <MenuItem value="Teacher">Teacher</MenuItem>
                    <MenuItem value="Course">Course</MenuItem>
                    <MenuItem value="Resource">Resource</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Details"
                  name="details"
                  multiline
                  rows={4}
                  value={formData.details}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedItem ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DepartmentManagement; 