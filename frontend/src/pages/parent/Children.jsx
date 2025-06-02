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
} from '@mui/material';
import {
  Person,
  School,
  Assignment,
  Grade,
  Event,
  Visibility,
  Close,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { parentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Children = () => {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);

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

  const getPerformanceTrend = (currentGrade, previousGrade) => {
    const difference = currentGrade - previousGrade;
    if (difference > 0) {
      return <TrendingUp color="success" />;
    } else if (difference < 0) {
      return <TrendingDown color="error" />;
    }
    return null;
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
        My Children
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Person color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Children</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {children.length}
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
                {children.reduce(
                  (total, child) => total + child.pendingAssignments,
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
                <Event color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Upcoming Exams</Typography>
              </Box>
              <Typography variant="h4" color="info">
                {children.reduce(
                  (total, child) => total + child.upcomingExams,
                  0
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Children Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Roll Number</TableCell>
              <TableCell>Attendance</TableCell>
              <TableCell>Performance</TableCell>
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
                <TableCell>{child.rollNumber}</TableCell>
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={`${child.averageGrade}%`}
                      color={
                        child.averageGrade >= 75
                          ? 'success'
                          : child.averageGrade >= 60
                          ? 'warning'
                          : 'error'
                      }
                    />
                    {getPerformanceTrend(
                      child.averageGrade,
                      child.previousGrade
                    )}
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

      {/* Child Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={handleDetailsDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Child Details
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
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Academic Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography>
                    <strong>Class:</strong> {selectedChild.className}
                  </Typography>
                  <Typography>
                    <strong>Roll Number:</strong> {selectedChild.rollNumber}
                  </Typography>
                  <Typography>
                    <strong>Class Teacher:</strong> {selectedChild.classTeacher}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Performance Overview
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Average Grade
                        </Typography>
                        <Typography variant="h4">
                          {selectedChild.averageGrade}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Attendance Rate
                        </Typography>
                        <Typography variant="h4">
                          {selectedChild.attendanceRate}%
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

export default Children; 