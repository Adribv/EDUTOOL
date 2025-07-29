import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Badge,
  LinearProgress
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Class as ClassIcon,
  Assessment as AssessmentIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Security as SecurityIcon,
  Grade as GradeIcon,
  Schedule as ScheduleIcon,
  Book as BookIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { principalAPI } from '../../services/api';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [admissionDialogOpen, setAdmissionDialogOpen] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState(null);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch student data, admissions, attendance, and performance data
      const [studentsResponse, admissionsResponse, attendanceResponse, performanceResponse] = await Promise.all([
        principalAPI.getAllStudents(),
        principalAPI.getAdmissions(),
        principalAPI.getStudentAttendance(),
        principalAPI.getStudentPerformance()
      ]);

      setStudents(studentsResponse.data || []);
      setAdmissions(admissionsResponse.data?.admissions || []);
      setAttendanceData(attendanceResponse.data || []);
      setPerformanceData(performanceResponse.data || []);
    } catch (err) {
      console.error('❌ Error fetching student data:', err);
      setError('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setStudentDialogOpen(true);
  };

  const handleAdmissionClick = (admission) => {
    setSelectedAdmission(admission);
    setAdmissionDialogOpen(true);
  };

  const handleApproveAdmission = async (admissionId) => {
    try {
      await principalAPI.approveAdmission(admissionId, { status: 'Approved' });
      fetchStudentData(); // Refresh data
      setAdmissionDialogOpen(false);
    } catch (error) {
      console.error('Error approving admission:', error);
    }
  };

  const handleRejectAdmission = async (admissionId) => {
    try {
      await principalAPI.rejectAdmission(admissionId, { status: 'Rejected' });
      fetchStudentData(); // Refresh data
      setAdmissionDialogOpen(false);
    } catch (error) {
      console.error('Error rejecting admission:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
      case 'Approved':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Inactive':
      case 'Rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'success';
    if (grade >= 80) return 'info';
    if (grade >= 70) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Student Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage student records, admissions, attendance, and academic performance
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchStudentData}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            href="/principal/students/add"
          >
            Add Student
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Students
                  </Typography>
                  <Typography variant="h4">
                    {students.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <PeopleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Students
                  </Typography>
                  <Typography variant="h4">
                    {students.filter(student => student.status === 'Active').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                  <CheckCircleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Pending Admissions
                  </Typography>
                  <Typography variant="h4">
                    {Array.isArray(admissions) ? admissions.filter(admission => admission.status === 'Pending').length : 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                  <ScheduleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Average Attendance
                  </Typography>
                  <Typography variant="h4">
                    {Array.isArray(attendanceData) && attendanceData.length > 0 
                      ? Math.round(attendanceData.reduce((sum, item) => sum + item.attendancePercentage, 0) / attendanceData.length)
                      : 0}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                  <CalendarIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange} variant="fullWidth">
          <Tab label="All Students" icon={<PeopleIcon />} />
          <Tab label="Admissions" icon={<AddIcon />} />
          <Tab label="Attendance" icon={<ScheduleIcon />} />
          <Tab label="Performance" icon={<AssessmentIcon />} />
          
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {selectedTab === 0 && (
        <Card>
          <CardHeader
            title="All Students"
            action={
              <Box display="flex" gap={1}>
                <TextField
                  size="small"
                  placeholder="Search students..."
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
                <Button startIcon={<FilterIcon />} variant="outlined">
                  Filter
                </Button>
              </Box>
            }
          />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Roll Number</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Performance</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student._id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar src={student.profileImage}>
                            {student.name?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{student.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {student.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={student.class}
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{student.rollNumber || 'N/A'}</TableCell>
                      <TableCell>{student.contactNumber || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={student.status}
                          color={getStatusColor(student.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinearProgress
                            variant="determinate"
                            value={student.performanceRating || 0}
                            sx={{ width: 60, height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="body2">
                            {student.performanceRating || 0}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleStudentClick(student)}>
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" href={`/principal/students/${student._id}/edit`}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {selectedTab === 1 && (
        <Card>
          <CardHeader
            title="Admission Requests"
            action={
              <Box display="flex" gap={1}>
                <Chip
                  label={`${Array.isArray(admissions) ? admissions.filter(admission => admission.status === 'Pending').length : 0} Pending`}
                  color="warning"
                />
                <Button startIcon={<DownloadIcon />} variant="outlined">
                  Export
                </Button>
              </Box>
            }
          />
          <CardContent>
            <List>
              {Array.isArray(admissions) && admissions.map((admission) => (
                <React.Fragment key={admission._id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        {admission.studentName?.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={admission.studentName}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            Class: {admission.applyingForClass} | Age: {admission.age} | Previous School: {admission.previousSchool}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Applied: {new Date(admission.applicationDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                    <Box display="flex" alignItems="center" gap={2}>
                      <Chip
                        label={admission.status}
                        color={getStatusColor(admission.status)}
                        size="small"
                      />
                      {admission.status === 'Pending' && (
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleApproveAdmission(admission._id)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleRejectAdmission(admission._id)}
                          >
                            Reject
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
              {(!Array.isArray(admissions) || admissions.length === 0) && (
                <ListItem>
                  <ListItemText
                    primary="No admission requests"
                    secondary="All admission requests have been processed"
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      )}

      {selectedTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader title="Attendance Overview" />
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Student</TableCell>
                        <TableCell>Class</TableCell>
                        <TableCell>Present Days</TableCell>
                        <TableCell>Total Days</TableCell>
                        <TableCell>Attendance %</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Array.isArray(attendanceData) && attendanceData.map((attendance) => (
                        <TableRow key={attendance._id}>
                          <TableCell>{attendance.studentName}</TableCell>
                          <TableCell>{attendance.class}</TableCell>
                          <TableCell>{attendance.presentDays}</TableCell>
                          <TableCell>{attendance.totalDays}</TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <LinearProgress
                                variant="determinate"
                                value={attendance.attendancePercentage}
                                color={attendance.attendancePercentage >= 90 ? 'success' : 'warning'}
                                sx={{ width: 60, height: 8, borderRadius: 4 }}
                              />
                              <Typography variant="body2">
                                {attendance.attendancePercentage}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={attendance.attendancePercentage >= 90 ? 'Good' : 'Needs Attention'}
                              color={attendance.attendancePercentage >= 90 ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Attendance Summary" />
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Good Attendance (≥90%)"
                      secondary={`${Array.isArray(attendanceData) ? attendanceData.filter(a => a.attendancePercentage >= 90).length : 0} students`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <WarningIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Needs Attention (<90%)"
                      secondary={`${Array.isArray(attendanceData) ? attendanceData.filter(a => a.attendancePercentage < 90).length : 0} students`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUpIcon color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Average Attendance"
                      secondary={`${Array.isArray(attendanceData) && attendanceData.length > 0 
                        ? Math.round(attendanceData.reduce((sum, item) => sum + item.attendancePercentage, 0) / attendanceData.length)
                        : 0}%`}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {selectedTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader title="Academic Performance" />
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Student</TableCell>
                        <TableCell>Class</TableCell>
                        <TableCell>Overall Grade</TableCell>
                        <TableCell>Subjects</TableCell>
                        <TableCell>Performance</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Array.isArray(performanceData) && performanceData.map((performance) => (
                        <TableRow key={performance._id}>
                          <TableCell>{performance.studentName}</TableCell>
                          <TableCell>{performance.class}</TableCell>
                          <TableCell>
                            <Chip
                              label={`${performance.overallGrade}%`}
                              color={getGradeColor(performance.overallGrade)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box display="flex" flexDirection="column" gap={0.5}>
                              {performance.subjects?.slice(0, 3).map((subject, index) => (
                                <Typography key={index} variant="caption">
                                  {subject.name}: {subject.grade}%
                                </Typography>
                              ))}
                              {performance.subjects?.length > 3 && (
                                <Typography variant="caption" color="text.secondary">
                                  +{performance.subjects.length - 3} more
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <LinearProgress
                                variant="determinate"
                                value={performance.overallGrade}
                                color={getGradeColor(performance.overallGrade)}
                                sx={{ width: 60, height: 8, borderRadius: 4 }}
                              />
                              <Typography variant="body2">
                                {performance.overallGrade}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Button size="small" variant="outlined" href={`/principal/students/${performance.studentId}/performance`}>
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Performance Summary" />
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <StarIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="High Performers (≥90%)"
                      secondary={`${Array.isArray(performanceData) ? performanceData.filter(p => p.overallGrade >= 90).length : 0} students`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUpIcon color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Good Performance (80-89%)"
                      secondary={`${Array.isArray(performanceData) ? performanceData.filter(p => p.overallGrade >= 80 && p.overallGrade < 90).length : 0} students`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <WarningIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Needs Improvement (<80%)"
                      secondary={`${Array.isArray(performanceData) ? performanceData.filter(p => p.overallGrade < 80).length : 0} students`}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Student Details Dialog */}
      <Dialog open={studentDialogOpen} onClose={() => setStudentDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Student Details</DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                  <Avatar
                    src={selectedStudent.profileImage}
                    sx={{ width: 120, height: 120 }}
                  >
                    {selectedStudent.name?.charAt(0)}
                  </Avatar>
                  <Typography variant="h6">{selectedStudent.name}</Typography>
                  <Chip
                    label={selectedStudent.class}
                    color="primary"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <List>
                  <ListItem>
                    <ListItemIcon><EmailIcon /></ListItemIcon>
                    <ListItemText primary="Email" secondary={selectedStudent.email} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><PhoneIcon /></ListItemIcon>
                    <ListItemText primary="Contact" secondary={selectedStudent.contactNumber} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><LocationIcon /></ListItemIcon>
                    <ListItemText primary="Address" secondary={selectedStudent.address} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><SchoolIcon /></ListItemIcon>
                    <ListItemText primary="Roll Number" secondary={selectedStudent.rollNumber} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CalendarIcon /></ListItemIcon>
                    <ListItemText 
                      primary="Admission Date" 
                      secondary={new Date(selectedStudent.createdAt).toLocaleDateString()} 
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStudentDialogOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            href={`/principal/students/${selectedStudent?._id}/edit`}
          >
            Edit Profile
          </Button>
        </DialogActions>
      </Dialog>

      {/* Admission Details Dialog */}
      <Dialog open={admissionDialogOpen} onClose={() => setAdmissionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Admission Request Details</DialogTitle>
        <DialogContent>
          {selectedAdmission && (
            <List>
              <ListItem>
                <ListItemText
                  primary="Student Name"
                  secondary={selectedAdmission.studentName}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Class"
                  secondary={selectedAdmission.class}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Age"
                  secondary={selectedAdmission.age}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Previous School"
                  secondary={selectedAdmission.previousSchool}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Parent Contact"
                  secondary={selectedAdmission.parentContact}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Status"
                  secondary={
                    <Chip
                      label={selectedAdmission.status}
                      color={getStatusColor(selectedAdmission.status)}
                      size="small"
                    />
                  }
                />
              </ListItem>
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdmissionDialogOpen(false)}>Close</Button>
          {selectedAdmission?.status === 'Pending' && (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleApproveAdmission(selectedAdmission._id)}
              >
                Approve
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleRejectAdmission(selectedAdmission._id)}
              >
                Reject
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentManagement; 