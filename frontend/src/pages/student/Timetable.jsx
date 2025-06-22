import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { toast } from 'react-toastify';
import studentService from '../../services/studentService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = ['1', '2', '3', '4', '5', '6', '7', '8'];

const Timetable = () => {
  const [loading, setLoading] = useState(true);
  const [timetable, setTimetable] = useState([]);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const response = await studentService.getTimetable();
      setTimetable(response.data);
    } catch {
      toast.error('Failed to load timetable');
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Weekly Timetable
      </Typography>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Period</TableCell>
                  {DAYS.map((day) => (
                    <TableCell key={day} align="center">
                      {day}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {PERIODS.map((period) => (
                  <TableRow key={period}>
                    <TableCell component="th" scope="row">
                      {period}
                    </TableCell>
                    {DAYS.map((day) => {
                      const slot = timetable.find(
                        (t) => t.day === day && t.period === period
                      );
                      return (
                        <TableCell key={`${day}-${period}`} align="center">
                          {slot ? (
                            <Box>
                              <Typography variant="subtitle2">
                                {slot.subject}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {slot.teacher}
                              </Typography>
                              <Typography variant="caption" display="block" color="textSecondary">
                                {slot.room}
                              </Typography>
                            </Box>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Timetable; 