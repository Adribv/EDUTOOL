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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  InputAdornment,
} from '@mui/material';
import {
  Person,
  Add,
  Edit,
  Delete,
  Visibility,
  Close,
  School,
  Assignment,
  Grade,
  Search as SearchIcon,
} from '@mui/icons-material';
import { staffAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Students = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [createDialog, setCreateDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentData, setStudentData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    classId: '',
    rollNumber: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    parentName: '',
    parentContact: '',
  });
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await staffAPI.getStudents();
      setStudents(response.data);
      setFilteredStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await staffAPI.getClasses();
      setClasses(response.data.classes);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    }
  };

  const handleCreateDialogOpen = () => {
    setCreateDialog(true);
  };

  const handleCreateDialogClose = () => {
    setCreateDialog(false);
    setStudentData({
      firstName: '',
      lastName: '',
      email: '',
      classId: '',
      rollNumber: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      parentName: '',
      parentContact: '',
    });
  };

  const handleViewDialogOpen = (student) => {
    setSelectedStudent(student);
    setViewDialog(true);
  };

  const handleViewDialogClose = () => {
    setViewDialog(false);
    setSelectedStudent(null);
  };

  const handleStudentChange = (event) => {
    const { name, value } = event.target;
    setStudentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateStudent = async () => {
    try {
      await staffAPI.createStudent(studentData);
      toast.success('Student added successfully');
      handleCreateDialogClose();
      fetchStudents();
    } catch (error) {
      console.error('Error creating student:', error);
      toast.error('Failed to add student');
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const filterStudents = () => {
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.class.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setStudentData({
      firstName: '',
      lastName: '',
      email: '',
      classId: '',
      rollNumber: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      parentName: '',
      parentContact: '',
    });
    setCreateDialog(true);
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setStudentData(student);
    setCreateDialog(true);
  };

  const handleDeleteStudent = async (studentId) => {
    try {
      await staffAPI.deleteStudent(studentId);
      toast.success('Student deleted successfully');
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveStudent = async () => {
    try {
      if (selectedStudent) {
        await staffAPI.updateStudent(selectedStudent.id, studentData);
        toast.success('Student updated successfully');
      } else {
        await staffAPI.addStudent(studentData);
        toast.success('Student added successfully');
      }
      handleCreateDialogClose();
      fetchStudents();
    } catch (error) {
      console.error('Error saving student:', error);
      toast.error('Failed to save student');
    }
  };

  const handleViewDetails = (studentId) => {
    // Navigate to student details page or open dialog
    console.log('View details for student:', studentId);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Students</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddStudent}
        >
          Add Student
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Person color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Students</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {students.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assignment color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Pending Assignments</Typography>
              </Box>
              <Typography variant="h4" color="warning">
                {students.reduce(
                  (total, student) => total + student.pendingAssignments,
                  0
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Grade color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Average Grade</Typography>
              </Box>
              <Typography variant="h4" color="success">
                {(
                  students.reduce(
                    (total, student) => total + student.averageGrade,
                    0
                  ) / students.length
                ).toFixed(1)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label="All Students" />
          <Tab label="By Class" />
          <Tab label="Performance" />
        </Tabs>
      </Box>

      {/* Search Bar */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search students by name, email, roll number, or class"
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

      {/* Students Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Roll Number</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Parent Contact</TableCell>
              <TableCell>Performance</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  {student.firstName} {student.lastName}
                </TableCell>
                <TableCell>{student.className}</TableCell>
                <TableCell>{student.rollNumber}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.parentContact}</TableCell>
                <TableCell>
                  <Chip
                    label={`${student.averageGrade}%`}
                    color={
                      student.averageGrade >= 75
                        ? 'success'
                        : student.averageGrade >= 60
                        ? 'warning'
                        : 'error'
                    }
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton
                      color="primary"
                      onClick={() => handleViewDetails(student.id)}
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit Student">
                    <IconButton color="info" onClick={() => handleEditStudent(student)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Student">
                    <IconButton color="error" onClick={() => handleDeleteStudent(student.id)}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Student Dialog */}
      <Dialog open={createDialog} onClose={handleCreateDialogClose}>
        <DialogTitle>
          {selectedStudent ? 'Edit Student' : 'Add New Student'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={studentData.firstName}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={studentData.lastName}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={studentData.email}
              onChange={handleInputChange}
            />
            <FormControl fullWidth>
              <InputLabel>Class</InputLabel>
              <Select
                name="classId"
                value={studentData.classId}
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
            <TextField
              fullWidth
              label="Roll Number"
              name="rollNumber"
              value={studentData.rollNumber}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              type="date"
              label="Date of Birth"
              name="dateOfBirth"
              value={studentData.dateOfBirth}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={studentData.gender}
                onChange={handleInputChange}
                label="Gender"
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Address"
              name="address"
              multiline
              rows={2}
              value={studentData.address}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              label="Parent Name"
              name="parentName"
              value={studentData.parentName}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              label="Parent Contact"
              name="parentContact"
              value={studentData.parentContact}
              onChange={handleInputChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateDialogClose}>Cancel</Button>
          <Button onClick={handleSaveStudent} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Student Dialog */}
      <Dialog
        open={viewDialog}
        onClose={handleViewDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Student Details
          <IconButton
            onClick={handleViewDialogClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography>
                    <strong>Name:</strong> {selectedStudent.firstName}{' '}
                    {selectedStudent.lastName}
                  </Typography>
                  <Typography>
                    <strong>Roll Number:</strong> {selectedStudent.rollNumber}
                  </Typography>
                  <Typography>
                    <strong>Class:</strong> {selectedStudent.className}
                  </Typography>
                  <Typography>
                    <strong>Email:</strong> {selectedStudent.email}
                  </Typography>
                  <Typography>
                    <strong>Date of Birth:</strong>{' '}
                    {new Date(selectedStudent.dateOfBirth).toLocaleDateString()}
                  </Typography>
                  <Typography>
                    <strong>Gender:</strong> {selectedStudent.gender}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Parent Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography>
                    <strong>Parent Name:</strong> {selectedStudent.parentName}
                  </Typography>
                  <Typography>
                    <strong>Contact:</strong> {selectedStudent.parentContact}
                  </Typography>
                  <Typography>
                    <strong>Address:</strong> {selectedStudent.address}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Academic Performance
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Average Grade
                        </Typography>
                        <Typography variant="h4">
                          {selectedStudent.averageGrade}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Pending Assignments
                        </Typography>
                        <Typography variant="h4">
                          {selectedStudent.pendingAssignments}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Attendance Rate
                        </Typography>
                        <Typography variant="h4">
                          {selectedStudent.attendanceRate}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Students; 