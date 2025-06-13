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
} from '@mui/material';
import {
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Grade as GradeIcon,
  Schedule as ScheduleIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { teacherAPI } from '../../services/api';
import { toast } from 'react-toastify';

const StudentManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getStudents();
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students');
      toast.error('Failed to load students');
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
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'all' || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const getGradeColor = (grade) => {
    switch (grade) {
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
              <MenuItem value="all">All Classes</MenuItem>
              <MenuItem value="Class A">Class A</MenuItem>
              <MenuItem value="Class B">Class B</MenuItem>
              <MenuItem value="Class C">Class C</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

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
          {filteredStudents.map((student) => (
            <Grid item xs={12} md={6} key={student.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2 }}>{student.name[0]}</Avatar>
                    <Box>
                      <Typography variant="h6">{student.name}</Typography>
                      <Typography color="textSecondary">ID: {student.id}</Typography>
                    </Box>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Class
                      </Typography>
                      <Typography variant="body1">{student.class}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Grade
                      </Typography>
                      <Chip
                        label={student.grade}
                        color={getGradeColor(student.grade)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Attendance
                      </Typography>
                      <Typography variant="body1">{student.attendance}%</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Performance
                      </Typography>
                      <Chip
                        label={student.performance}
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
          ))}
        </Grid>
      )}

      {activeTab === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Assignment</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.flatMap((student) =>
                student.assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{assignment.title}</TableCell>
                    <TableCell>{assignment.dueDate}</TableCell>
                    <TableCell>
                      <Chip
                        label={assignment.status}
                        color={assignment.status === 'Submitted' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {assignment.score ? `${assignment.score}/${assignment.totalMarks}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => {}}>
                        Grade
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
                <TableCell>Student</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Midterm</TableCell>
                <TableCell>Final</TableCell>
                <TableCell>Average</TableCell>
                <TableCell>Grade</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.flatMap((student) =>
                student.grades.map((grade) => (
                  <TableRow key={grade.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{grade.subject}</TableCell>
                    <TableCell>{grade.midterm}</TableCell>
                    <TableCell>{grade.final}</TableCell>
                    <TableCell>{grade.average}</TableCell>
                    <TableCell>
                      <Chip
                        label={grade.letterGrade}
                        color={getGradeColor(grade.letterGrade)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => {}}>
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {activeTab === 3 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.flatMap((student) =>
                student.attendanceRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>
                      <Chip
                        label={record.status}
                        color={record.status === 'Present' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{record.remarks}</TableCell>
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

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Student Details</DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ width: 64, height: 64, mr: 2 }}>{selectedStudent.name[0]}</Avatar>
                  <Box>
                    <Typography variant="h6">{selectedStudent.name}</Typography>
                    <Typography color="textSecondary">ID: {selectedStudent.id}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Class</Typography>
                <Typography variant="body1">{selectedStudent.class}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Grade</Typography>
                <Chip
                  label={selectedStudent.grade}
                  color={getGradeColor(selectedStudent.grade)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Attendance</Typography>
                <Typography variant="body1">{selectedStudent.attendance}%</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Performance</Typography>
                <Chip
                  label={selectedStudent.performance}
                  color={selectedStudent.performance === 'Good' ? 'success' : 'warning'}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">Contact Information</Typography>
                <Typography variant="body1">Email: {selectedStudent.email}</Typography>
                <Typography variant="body1">Phone: {selectedStudent.phone}</Typography>
              </Grid>
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