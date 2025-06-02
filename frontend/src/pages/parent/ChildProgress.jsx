import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Tabs,
  Tab,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { parentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const ChildProgress = () => {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [academicData, setAcademicData] = useState({
    grades: [],
    attendance: {},
    assignments: [],
    exams: [],
  });

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchChildProgress();
    }
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await parentAPI.getChildren();
      setChildren(response.data);
      if (response.data.length > 0) {
        setSelectedChild(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
      toast.error('Failed to load children data');
    } finally {
      setLoading(false);
    }
  };

  const fetchChildProgress = async () => {
    try {
      setLoading(true);
      const [gradesRes, attendanceRes, assignmentsRes, examsRes] = await Promise.all([
        parentAPI.getChildGrades(selectedChild),
        parentAPI.getChildAttendance(selectedChild),
        parentAPI.getChildAssignments(selectedChild),
        parentAPI.getChildExams(selectedChild),
      ]);

      setAcademicData({
        grades: gradesRes.data,
        attendance: attendanceRes.data,
        assignments: assignmentsRes.data,
        exams: examsRes.data,
      });
    } catch (error) {
      console.error('Error fetching child progress:', error);
      toast.error('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const handleChildChange = (event) => {
    setSelectedChild(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'success.main';
    if (grade >= 70) return 'warning.main';
    return 'error.main';
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return 'success.main';
    if (percentage >= 75) return 'warning.main';
    return 'error.main';
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
      <Typography variant="h4" gutterBottom>
        Child Progress
      </Typography>

      {/* Child Selection */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Child</InputLabel>
        <Select
          value={selectedChild}
          onChange={handleChildChange}
          label="Select Child"
        >
          {children.map((child) => (
            <MenuItem key={child.id} value={child.id}>
              {child.name} - Class {child.class}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Progress Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab icon={<SchoolIcon />} label="Academic Performance" />
          <Tab icon={<TrendingUpIcon />} label="Attendance" />
          <Tab icon={<AssignmentIcon />} label="Assignments" />
          <Tab icon={<EventIcon />} label="Exams" />
        </Tabs>
      </Box>

      {/* Academic Performance Tab */}
      {selectedTab === 0 && (
        <Grid container spacing={3}>
          {academicData.grades.map((subject) => (
            <Grid item xs={12} sm={6} md={4} key={subject.name}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {subject.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h4" sx={{ color: getGradeColor(subject.grade) }}>
                      {subject.grade}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={subject.grade}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getGradeColor(subject.grade),
                      },
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Attendance Tab */}
      {selectedTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Overall Attendance
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography
                    variant="h4"
                    sx={{ color: getAttendanceColor(academicData.attendance.overall) }}
                  >
                    {academicData.attendance.overall}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={academicData.attendance.overall}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getAttendanceColor(academicData.attendance.overall),
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Monthly Attendance
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Month</TableCell>
                        <TableCell align="right">Present</TableCell>
                        <TableCell align="right">Absent</TableCell>
                        <TableCell align="right">Percentage</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {academicData.attendance.monthly.map((month) => (
                        <TableRow key={month.month}>
                          <TableCell>{month.month}</TableCell>
                          <TableCell align="right">{month.present}</TableCell>
                          <TableCell align="right">{month.absent}</TableCell>
                          <TableCell
                            align="right"
                            sx={{ color: getAttendanceColor(month.percentage) }}
                          >
                            {month.percentage}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Assignments Tab */}
      {selectedTab === 2 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Subject</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Grade</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {academicData.assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>{assignment.subject}</TableCell>
                  <TableCell>{assignment.title}</TableCell>
                  <TableCell>{new Date(assignment.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>{assignment.status}</TableCell>
                  <TableCell sx={{ color: getGradeColor(assignment.grade) }}>
                    {assignment.grade}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Exams Tab */}
      {selectedTab === 3 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Subject</TableCell>
                <TableCell>Exam Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Total Marks</TableCell>
                <TableCell>Obtained Marks</TableCell>
                <TableCell>Percentage</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {academicData.exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell>{exam.subject}</TableCell>
                  <TableCell>{exam.type}</TableCell>
                  <TableCell>{new Date(exam.date).toLocaleDateString()}</TableCell>
                  <TableCell>{exam.totalMarks}</TableCell>
                  <TableCell>{exam.obtainedMarks}</TableCell>
                  <TableCell sx={{ color: getGradeColor(exam.percentage) }}>
                    {exam.percentage}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ChildProgress; 