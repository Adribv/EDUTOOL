import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  Event,
  CheckCircle,
  Warning,
  CalendarToday,
  Send,
} from '@mui/icons-material';
import { studentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Attendance = () => {
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    percentage: 0,
  });
  const [leaveDialog, setLeaveDialog] = useState(false);
  const [leaveData, setLeaveData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    type: 'sick',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getAttendance();
      setAttendance(response.data.records);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveSubmit = async () => {
    try {
      await studentAPI.submitLeaveApplication(leaveData);
      toast.success('Leave application submitted successfully');
      setLeaveDialog(false);
      setLeaveData({
        startDate: '',
        endDate: '',
        reason: '',
        type: 'sick',
      });
    } catch (error) {
      console.error('Error submitting leave application:', error);
      toast.error('Failed to submit leave application');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return 'success';
      case 'Absent':
        return 'error';
      case 'Late':
        return 'warning';
      default:
        return 'default';
    }
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
        Attendance
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Present Days</Typography>
              </Box>
              <Typography variant="h4" color="success">
                {stats.present}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Warning color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Absent Days</Typography>
              </Box>
              <Typography variant="h4" color="error">
                {stats.absent}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Warning color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Late Days</Typography>
              </Box>
              <Typography variant="h4" color="warning">
                {stats.late}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalendarToday color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Attendance Rate</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {stats.percentage}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Leave Application Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Send />}
          onClick={() => setLeaveDialog(true)}
        >
          Apply for Leave
        </Button>
      </Box>

      {/* Attendance Records */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Day</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Remarks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendance.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  {new Date(record.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(record.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                  })}
                </TableCell>
                <TableCell>
                  <Chip
                    label={record.status}
                    color={getStatusColor(record.status)}
                  />
                </TableCell>
                <TableCell>{record.time}</TableCell>
                <TableCell>{record.remarks}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Leave Application Dialog */}
      <Dialog
        open={leaveDialog}
        onClose={() => setLeaveDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Apply for Leave</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              select
              fullWidth
              label="Leave Type"
              value={leaveData.type}
              onChange={(e) =>
                setLeaveData({ ...leaveData, type: e.target.value })
              }
              sx={{ mb: 2 }}
            >
              <MenuItem value="sick">Sick Leave</MenuItem>
              <MenuItem value="personal">Personal Leave</MenuItem>
              <MenuItem value="emergency">Emergency Leave</MenuItem>
            </TextField>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={leaveData.startDate}
              onChange={(e) =>
                setLeaveData({ ...leaveData, startDate: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={leaveData.endDate}
              onChange={(e) =>
                setLeaveData({ ...leaveData, endDate: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Reason"
              value={leaveData.reason}
              onChange={(e) =>
                setLeaveData({ ...leaveData, reason: e.target.value })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaveDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleLeaveSubmit}
            disabled={!leaveData.startDate || !leaveData.endDate || !leaveData.reason}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Attendance; 