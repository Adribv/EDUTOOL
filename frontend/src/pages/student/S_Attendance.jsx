import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Event as EventIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import studentService from '../../services/studentService';

const S_Attendance = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await studentService.getAttendance();
      setAttendance(response.data);
      if (response.data.length > 0) {
        setSelectedClass(response.data[0].classId);
      }
    } catch {
      setError('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const calculateAttendancePercentage = (classId) => {
    const classAttendance = attendance.filter((a) => a.classId === classId);
    if (classAttendance.length === 0) return 0;
    const present = classAttendance.filter((a) => a.status === 'Present').length;
    return (present / classAttendance.length) * 100;
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 80) return 'info';
    if (percentage >= 70) return 'warning';
    return 'error';
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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

  const classes = [...new Set(attendance.map((a) => a.classId))];
  const selectedClassAttendance = attendance.filter((a) => a.classId === selectedClass);
  const overallAttendance = attendance.filter((a) => a.status === 'Present').length / attendance.length * 100;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Attendance
      </Typography>

      <Grid container spacing={3}>
        {/* Attendance Statistics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <EventIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Overall Attendance</Typography>
              </Box>
              <Typography variant="h4">
                {Math.round(overallAttendance)}%
              </Typography>
              <Chip
                label={overallAttendance >= 75 ? 'Good Standing' : 'Needs Improvement'}
                color={getAttendanceColor(overallAttendance)}
                size="small"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SchoolIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Classes</Typography>
              </Box>
              <Typography variant="h4">{classes.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <EventIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Sessions</Typography>
              </Box>
              <Typography variant="h4">{attendance.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Class Selection and Attendance */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {/* Class List */}
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  Classes
                </Typography>
                <List>
                  {classes.map((classId) => {
                    const classData = attendance.find((a) => a.classId === classId);
                    const attendancePercentage = calculateAttendancePercentage(classId);
                    return (
                      <ListItem
                        key={classId}
                        button
                        selected={selectedClass === classId}
                        onClick={() => setSelectedClass(classId)}
                      >
                        <ListItemIcon>
                          <SchoolIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={classData.className}
                          secondary={
                            <Box display="flex" alignItems="center">
                              <Typography
                                variant="body2"
                                color={getAttendanceColor(attendancePercentage)}
                                sx={{ mr: 1 }}
                              >
                                {Math.round(attendancePercentage)}%
                              </Typography>
                              <Chip
                                label={attendancePercentage >= 75 ? 'Good' : 'Needs Improvement'}
                                color={getAttendanceColor(attendancePercentage)}
                                size="small"
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Grid>

              {/* Attendance Details */}
              <Grid item xs={12} md={8}>
                {selectedClass ? (
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">
                        {selectedClassAttendance[0]?.className} - Attendance
                      </Typography>
                      <Chip
                        label={`Attendance: ${Math.round(calculateAttendancePercentage(selectedClass))}%`}
                        color={getAttendanceColor(calculateAttendancePercentage(selectedClass))}
                      />
                    </Box>

                    <Tabs value={activeTab} onChange={handleTabChange}>
                      <Tab label="History" />
                      <Tab label="Statistics" />
                    </Tabs>

                    <Box mt={2}>
                      {activeTab === 0 && (
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Time</TableCell>
                                <TableCell>Remarks</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {selectedClassAttendance.map((record) => (
                                <TableRow key={record.id}>
                                  <TableCell>
                                    <Box display="flex" alignItems="center">
                                      <EventIcon sx={{ mr: 1 }} color="primary" />
                                      {record.date}
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      icon={record.status === 'Present' ? <CheckCircleIcon /> : <CancelIcon />}
                                      label={record.status}
                                      color={record.status === 'Present' ? 'success' : 'error'}
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell>{record.time}</TableCell>
                                  <TableCell>
                                    {record.remarks || '-'}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}

                      {activeTab === 1 && (
                        <Box>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Card>
                                <CardContent>
                                  <Typography variant="h6" gutterBottom>
                                    Monthly Attendance
                                  </Typography>
                                  <Box display="flex" alignItems="center">
                                    {calculateAttendancePercentage(selectedClass) >= 75 ? (
                                      <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                                    ) : (
                                      <TrendingDownIcon color="error" sx={{ mr: 1 }} />
                                    )}
                                    <Typography variant="h4">
                                      {Math.round(calculateAttendancePercentage(selectedClass))}%
                                    </Typography>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Card>
                                <CardContent>
                                  <Typography variant="h6" gutterBottom>
                                    Attendance Status
                                  </Typography>
                                  <Box display="flex" flexDirection="column" gap={1}>
                                    <Box display="flex" justifyContent="space-between">
                                      <Typography>Present</Typography>
                                      <Typography>
                                        {selectedClassAttendance.filter((a) => a.status === 'Present').length}
                                      </Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                      <Typography>Absent</Typography>
                                      <Typography>
                                        {selectedClassAttendance.filter((a) => a.status === 'Absent').length}
                                      </Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                      <Typography>Late</Typography>
                                      <Typography>
                                        {selectedClassAttendance.filter((a) => a.status === 'Late').length}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                          </Grid>
                        </Box>
                      )}
                    </Box>
                  </Box>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <Typography color="textSecondary">
                      Select a class to view attendance
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default S_Attendance; 