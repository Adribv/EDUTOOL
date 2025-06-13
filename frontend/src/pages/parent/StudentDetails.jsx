import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
} from '@mui/material';
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import parentService from '../../services/parentService';

const StudentDetails = () => {
  const { studentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [progress, setProgress] = useState({});
  const [assignments, setAssignments] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      const [studentRes, attendanceRes, progressRes, assignmentsRes] = await Promise.all([
        parentService.getStudentDetails(studentId),
        parentService.getStudentAttendance(studentId),
        parentService.getStudentProgress(studentId),
        parentService.getStudentAssignments(studentId),
      ]);

      setStudent(studentRes.data);
      setAttendance(attendanceRes.data);
      setProgress(progressRes.data);
      setAssignments(assignmentsRes.data);
    } catch {
      setError('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
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
      <Typography variant="h4" gutterBottom>
        {student.name}
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Typography variant="body1">
              Class: {student.class}
            </Typography>
            <Typography variant="body1">
              Roll Number: {student.rollNumber}
            </Typography>
            <Typography variant="body1">
              Section: {student.section}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Academic Overview
            </Typography>
            <Box mb={2}>
              <Typography variant="body2" gutterBottom>
                Overall Performance
              </Typography>
              <LinearProgress
                variant="determinate"
                value={student.performance}
                color={student.performance >= 80 ? 'success' : 'warning'}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="body2" color="text.secondary" mt={1}>
                {student.performance}%
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" gutterBottom>
                Attendance
              </Typography>
              <LinearProgress
                variant="determinate"
                value={student.attendance}
                color={student.attendance >= 75 ? 'success' : 'warning'}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="body2" color="text.secondary" mt={1}>
                {student.attendance}%
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab icon={<SchoolIcon />} label="Attendance" />
          <Tab icon={<TrendingUpIcon />} label="Progress" />
          <Tab icon={<AssignmentIcon />} label="Assignments" />
          <Tab icon={<EventIcon />} label="Events" />
        </Tabs>

        {selectedTab === 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.status}</TableCell>
                    <TableCell>{record.remarks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {selectedTab === 1 && (
          <Grid container spacing={3}>
            {Object.entries(progress).map(([subject, data]) => (
              <Grid item xs={12} md={6} key={subject}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {subject}
                    </Typography>
                    <Box mb={2}>
                      <Typography variant="body2" gutterBottom>
                        Performance
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={data.performance}
                        color={data.performance >= 80 ? 'success' : 'warning'}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        {data.performance}%
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Last Assessment: {data.lastAssessment}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {selectedTab === 2 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>{assignment.title}</TableCell>
                    <TableCell>{assignment.subject}</TableCell>
                    <TableCell>{assignment.dueDate}</TableCell>
                    <TableCell>{assignment.status}</TableCell>
                    <TableCell>{assignment.score || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {selectedTab === 3 && (
          <Grid container spacing={3}>
            {student.events.map((event) => (
              <Grid item xs={12} md={6} key={event.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {event.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Date: {event.date}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Time: {event.time}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Location: {event.location}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default StudentDetails; 