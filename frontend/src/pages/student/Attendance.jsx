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
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { studentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Attendance = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState({
    overallAttendance: 0,
    subjectWiseAttendance: [],
    recentRecords: [],
  });

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getAttendance();
      const records = Array.isArray(response.data) ? response.data : [];

      // calculate overall percentage
      const total = records.length;
      const attended = records.filter(r=>r.status==='Present').length;
      const overall = total? Math.round((attended/total)*100):0;

      // build subject wise summary
      const subjectMap = {};
      records.forEach(r=>{
        const subj = r.subject || 'General';
        if(!subjectMap[subj]) subjectMap[subj]={name:subj, attended:0,total:0};
        subjectMap[subj].total++;
        if(r.status==='Present') subjectMap[subj].attended++;
      });
      const subjectWise = Object.values(subjectMap).map(s=>({
        ...s,
        percentage: s.total? Math.round((s.attended/s.total)*100):0,
        id: s.name
      }));

      const recentRecords = records.slice(-10).reverse();

      setAttendanceData({
        overallAttendance: overall,
        subjectWiseAttendance: subjectWise,
        recentRecords
      });
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setError('Failed to load attendance data');
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStatus = (percentage) => {
    if (percentage >= 75) return { color: 'success', label: 'Good' };
    if (percentage >= 60) return { color: 'warning', label: 'Fair' };
    return { color: 'error', label: 'Poor' };
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present':
        return <CheckCircleIcon color="success" />;
      case 'Absent':
        return <CancelIcon color="error" />;
      case 'Late':
        return <WarningIcon color="warning" />;
      default:
        return null;
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
      <Typography variant="h4" gutterBottom>
        Attendance
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Overall Attendance
              </Typography>
              <Typography variant="h3" color="primary">
                {attendanceData.overallAttendance}%
              </Typography>
              <Chip
                label={getAttendanceStatus(attendanceData.overallAttendance).label}
                color={getAttendanceStatus(attendanceData.overallAttendance).color}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Subject-wise Attendance
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Subject</TableCell>
                      <TableCell>Classes Attended</TableCell>
                      <TableCell>Total Classes</TableCell>
                      <TableCell>Attendance %</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendanceData.subjectWiseAttendance.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell>{subject.name}</TableCell>
                        <TableCell>{subject.attended}</TableCell>
                        <TableCell>{subject.total}</TableCell>
                        <TableCell>{subject.percentage}%</TableCell>
                        <TableCell>
                          <Chip
                            label={getAttendanceStatus(subject.percentage).label}
                            color={getAttendanceStatus(subject.percentage).color}
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

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Attendance Records
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Remarks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendanceData.recentRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>{record.subject}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getStatusIcon(record.status)}
                            <Typography sx={{ ml: 1 }}>{record.status}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{record.remarks}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Attendance; 