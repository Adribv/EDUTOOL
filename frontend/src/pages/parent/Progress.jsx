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
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  School,
  Assignment,
  Event,
  Grade,
  Visibility,
  Close,
  BarChart,
  PieChart,
} from '@mui/icons-material';
import { parentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Progress = () => {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await parentAPI.getChildren();
      setChildren(response.data);
    } catch (error) {
      console.error('Error fetching children:', error);
      toast.error('Failed to load children information');
    } finally {
      setLoading(false);
    }
  };

  const handleDetailsDialogOpen = (child) => {
    setSelectedChild(child);
    setDetailsDialog(true);
  };

  const handleDetailsDialogClose = () => {
    setDetailsDialog(false);
    setSelectedChild(null);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const getPerformanceTrend = (currentGrade, previousGrade) => {
    const difference = currentGrade - previousGrade;
    if (difference > 0) {
      return <TrendingUp color="success" />;
    } else if (difference < 0) {
      return <TrendingDown color="error" />;
    }
    return null;
  };

  const getGradeColor = (grade) => {
    if (grade >= 75) return 'success';
    if (grade >= 60) return 'warning';
    return 'error';
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
      <Typography variant="h4" sx={{ mb: 3 }}>
        Progress Tracking
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <School color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Average Grade</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {children.reduce((acc, child) => acc + child.averageGrade, 0) /
                  children.length}
                %
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assignment color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Assignment Completion</Typography>
              </Box>
              <Typography variant="h4" color="warning">
                {children.reduce(
                  (acc, child) =>
                    acc +
                    (child.completedAssignments /
                      (child.completedAssignments + child.pendingAssignments)) *
                      100,
                  0
                ) / children.length}
                %
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Event color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Attendance Rate</Typography>
              </Box>
              <Typography variant="h4" color="info">
                {children.reduce(
                  (acc, child) => acc + child.attendanceRate,
                  0
                ) / children.length}
                %
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Progress Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label="Academic Performance" />
          <Tab label="Subject-wise Analysis" />
          <Tab label="Attendance History" />
        </Tabs>
      </Box>

      {/* Academic Performance Tab */}
      {selectedTab === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Child</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Average Grade</TableCell>
                <TableCell>Trend</TableCell>
                <TableCell>Assignment Completion</TableCell>
                <TableCell>Attendance</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {children.map((child) => (
                <TableRow key={child.id}>
                  <TableCell>
                    {child.firstName} {child.lastName}
                  </TableCell>
                  <TableCell>{child.className}</TableCell>
                  <TableCell>
                    <Chip
                      label={`${child.averageGrade}%`}
                      color={getGradeColor(child.averageGrade)}
                    />
                  </TableCell>
                  <TableCell>
                    {getPerformanceTrend(
                      child.averageGrade,
                      child.previousGrade
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        {Math.round(
                          (child.completedAssignments /
                            (child.completedAssignments +
                              child.pendingAssignments)) *
                            100
                        )}
                        %
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={
                          (child.completedAssignments /
                            (child.completedAssignments +
                              child.pendingAssignments)) *
                          100
                        }
                        sx={{ width: 100 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        {child.attendanceRate}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={child.attendanceRate}
                        sx={{ width: 100 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        color="primary"
                        onClick={() => handleDetailsDialogOpen(child)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Subject-wise Analysis Tab */}
      {selectedTab === 1 && (
        <Grid container spacing={3}>
          {children.map((child) => (
            <Grid item xs={12} key={child.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {child.firstName} {child.lastName} - Subject Performance
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Subject</TableCell>
                          <TableCell>Grade</TableCell>
                          <TableCell>Trend</TableCell>
                          <TableCell>Assignments</TableCell>
                          <TableCell>Exams</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {child.subjects.map((subject) => (
                          <TableRow key={subject.id}>
                            <TableCell>{subject.name}</TableCell>
                            <TableCell>
                              <Chip
                                label={`${subject.grade}%`}
                                color={getGradeColor(subject.grade)}
                              />
                            </TableCell>
                            <TableCell>
                              {getPerformanceTrend(
                                subject.grade,
                                subject.previousGrade
                              )}
                            </TableCell>
                            <TableCell>
                              {subject.completedAssignments}/
                              {subject.totalAssignments}
                            </TableCell>
                            <TableCell>
                              {subject.completedExams}/{subject.totalExams}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Attendance History Tab */}
      {selectedTab === 2 && (
        <Grid container spacing={3}>
          {children.map((child) => (
            <Grid item xs={12} key={child.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {child.firstName} {child.lastName} - Attendance History
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Month</TableCell>
                          <TableCell>Present Days</TableCell>
                          <TableCell>Absent Days</TableCell>
                          <TableCell>Attendance Rate</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {child.attendanceHistory.map((record) => (
                          <TableRow key={record.month}>
                            <TableCell>{record.month}</TableCell>
                            <TableCell>{record.presentDays}</TableCell>
                            <TableCell>{record.absentDays}</TableCell>
                            <TableCell>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                }}
                              >
                                <Typography variant="body2">
                                  {record.attendanceRate}%
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={record.attendanceRate}
                                  sx={{ width: 100 }}
                                />
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  record.attendanceRate >= 75
                                    ? 'Good'
                                    : record.attendanceRate >= 60
                                    ? 'Average'
                                    : 'Poor'
                                }
                                color={
                                  record.attendanceRate >= 75
                                    ? 'success'
                                    : record.attendanceRate >= 60
                                    ? 'warning'
                                    : 'error'
                                }
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
          ))}
        </Grid>
      )}

      {/* Child Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={handleDetailsDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detailed Progress Report
          <IconButton
            onClick={handleDetailsDialogClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedChild && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Performance Overview
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Current Grade
                        </Typography>
                        <Typography variant="h4">
                          {selectedChild.averageGrade}%
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Previous: {selectedChild.previousGrade}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Assignment Completion
                        </Typography>
                        <Typography variant="h4">
                          {Math.round(
                            (selectedChild.completedAssignments /
                              (selectedChild.completedAssignments +
                                selectedChild.pendingAssignments)) *
                              100
                          )}
                          %
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {selectedChild.completedAssignments} completed
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
                          {selectedChild.attendanceRate}%
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Last Month: {selectedChild.previousAttendanceRate}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Recent Activities
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Grade</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedChild.recentActivities.map((activity) => (
                        <TableRow key={activity.id}>
                          <TableCell>
                            {new Date(activity.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{activity.type}</TableCell>
                          <TableCell>{activity.description}</TableCell>
                          <TableCell>
                            <Chip
                              label={activity.status}
                              color={
                                activity.status === 'completed'
                                  ? 'success'
                                  : activity.status === 'pending'
                                  ? 'warning'
                                  : 'error'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {activity.grade ? `${activity.grade}%` : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDetailsDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Progress; 