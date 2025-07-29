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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Grade as GradeIcon,
  Schedule as ScheduleIcon,
  Search as SearchIcon,
  Class as ClassIcon,
} from '@mui/icons-material';
import { teacherAPI } from '../../services/api';
import { toast } from 'react-toastify';

const StudentManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [students, setStudents] = useState([]);
  const [coordinatedClasses, setCoordinatedClasses] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');

  useEffect(() => {
    fetchCoordinatedData();
  }, []);

  const fetchCoordinatedData = async () => {
    try {
      setLoading(true);
      const [studentsResponse, classesResponse] = await Promise.all([
        teacherAPI.getCoordinatedStudents(),
        teacherAPI.getClasses()
      ]);
      
      setStudents(studentsResponse || []);
      setCoordinatedClasses(classesResponse || []);
    } catch (error) {
      console.error('Error fetching coordinated data:', error);
      setError('Failed to load coordinated students and classes');
      toast.error('Failed to load coordinated data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (student) => {
    setSelectedStudent(student);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedStudent(null);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleClassFilter = (event) => {
    setSelectedClass(event.target.value);
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'all' || 
      student.class === selectedClass || 
      `${student.grade}${student.section}` === selectedClass;
    return matchesSearch && matchesClass;
  });

  const getGradeColor = (grade) => {
    if (!grade) return 'default';
    switch (grade.toUpperCase()) {
      case 'A':
        return 'success';
      case 'B':
        return 'info';
      case 'C':
        return 'warning';
      case 'D':
      case 'F':
        return 'error';
      default:
        return 'default';
    }
  };

  const getClassOptions = () => {
    const options = [{ value: 'all', label: 'All Classes' }];
    coordinatedClasses.forEach(cls => {
      const classLabel = cls.name || `${cls.grade}${cls.section}`;
      options.push({ value: classLabel, label: classLabel });
    });
    return options;
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

  if (coordinatedClasses.length === 0) {
    return (
      <Box p={3}>
        <Alert severity="info">
          You are not assigned as a coordinator for any classes. Please contact the administration to be assigned as a class coordinator.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Student Management</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search students..."
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Class</InputLabel>
            <Select
              value={selectedClass}
              label="Class"
              onChange={handleClassFilter}
            >
              {getClassOptions().map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Coordinated Classes Summary */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <ClassIcon sx={{ mr: 1 }} />
          Your Coordinated Classes
        </Typography>
        <Grid container spacing={2}>
          {coordinatedClasses.map((cls) => (
            <Grid item xs={12} sm={6} md={4} key={cls._id || cls.id}>
              <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6">
                    {cls.name || `${cls.grade}${cls.section}`}
                  </Typography>
                  <Typography variant="body2">
                    Students: {cls.studentCount || 0}
                  </Typography>
                  {cls.capacity && (
                    <Typography variant="body2">
                      Capacity: {cls.capacity}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab icon={<PersonIcon />} label="Students" />
          <Tab icon={<AssignmentIcon />} label="Assignments" />
          <Tab icon={<GradeIcon />} label="Grades" />
          <Tab icon={<ScheduleIcon />} label="Attendance" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {filteredStudents.length === 0 ? (
            <Grid item xs={12}>
              <Alert severity="info">
                No students found in your coordinated classes.
              </Alert>
            </Grid>
          ) : (
            filteredStudents.map((student) => (
              <Grid item xs={12} md={6} key={student._id || student.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2 }}>{student.name?.[0] || 'S'}</Avatar>
                      <Box>
                        <Typography variant="h6">{student.name || 'N/A'}</Typography>
                        <Typography color="textSecondary">
                          ID: {student.rollNumber || student.studentId || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Class
                        </Typography>
                        <Typography variant="body1">
                          {student.class || `${student.grade}${student.section}` || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Grade
                        </Typography>
                        <Chip
                          label={student.grade || 'N/A'}
                          color={getGradeColor(student.grade)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Attendance
                        </Typography>
                        <Typography variant="body1">
                          {student.attendance ? `${student.attendance}%` : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Performance
                        </Typography>
                        <Chip
                          label={student.performance || 'N/A'}
                          color={student.performance === 'Good' ? 'success' : 'warning'}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        onClick={() => handleOpenDialog(student)}
                      >
                        View Details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {activeTab === 1 && (
        <Alert severity="info">
          Assignment management will be implemented in the next phase.
        </Alert>
      )}

      {activeTab === 2 && (
        <Alert severity="info">
          Grade management will be implemented in the next phase.
        </Alert>
      )}

      {activeTab === 3 && (
        <Alert severity="info">
          Attendance management will be implemented in the next phase.
        </Alert>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Student Details</DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ width: 64, height: 64, mr: 2 }}>
                    {selectedStudent.name?.[0] || 'S'}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{selectedStudent.name || 'N/A'}</Typography>
                    <Typography color="textSecondary">
                      ID: {selectedStudent.rollNumber || selectedStudent.studentId || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Class</Typography>
                <Typography variant="body1">
                  {selectedStudent.class || `${selectedStudent.grade}${selectedStudent.section}` || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Grade</Typography>
                <Chip
                  label={selectedStudent.grade || 'N/A'}
                  color={getGradeColor(selectedStudent.grade)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Attendance</Typography>
                <Typography variant="body1">
                  {selectedStudent.attendance ? `${selectedStudent.attendance}%` : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Performance</Typography>
                <Chip
                  label={selectedStudent.performance || 'N/A'}
                  color={selectedStudent.performance === 'Good' ? 'success' : 'warning'}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">Contact Information</Typography>
                <Typography variant="body1">
                  Email: {selectedStudent.email || 'N/A'}
                </Typography>
                <Typography variant="body1">
                  Phone: {selectedStudent.contactNumber || selectedStudent.phone || 'N/A'}
                </Typography>
              </Grid>
              {selectedStudent.address && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Address</Typography>
                  <Typography variant="body1">{selectedStudent.address}</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentManagement; 