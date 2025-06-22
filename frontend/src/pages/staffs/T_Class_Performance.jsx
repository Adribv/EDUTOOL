import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from '@mui/material';
import staffService from '../../services/staffService';

const T_Class_Performance = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const response = await staffService.getClassPerformance();
      setPerformanceData(response.data);
    } catch {
      setError('Failed to load class performance data');
    } finally {
      setLoading(false);
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
    <Box>
      <Typography variant="h4" gutterBottom>
        Class Performance
      </Typography>

      <Paper sx={{ p: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Attendance</TableCell>
                <TableCell>Assignments</TableCell>
                <TableCell>Exams</TableCell>
                <TableCell>Overall</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {performanceData.map((data) => (
                <TableRow key={data.id}>
                  <TableCell>{data.studentName}</TableCell>
                  <TableCell>
                    <LinearProgress variant="determinate" value={data.attendance} />
                    {data.attendance}%
                  </TableCell>
                  <TableCell>
                    <LinearProgress variant="determinate" value={data.assignments} />
                    {data.assignments}%
                  </TableCell>
                  <TableCell>
                    <LinearProgress variant="determinate" value={data.exams} />
                    {data.exams}%
                  </TableCell>
                  <TableCell>
                    <LinearProgress variant="determinate" value={data.overall} />
                    {data.overall}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default T_Class_Performance; 