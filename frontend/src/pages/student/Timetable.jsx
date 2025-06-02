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
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AccessTime,
  LocationOn,
  Person,
  Book,
  Event,
} from '@mui/icons-material';
import { studentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Timetable = () => {
  const [loading, setLoading] = useState(true);
  const [timetable, setTimetable] = useState([]);
  const [currentDay, setCurrentDay] = useState(new Date().getDay());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getTimetable();
      setTimetable(response.data);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dayIndex) => {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return days[dayIndex];
  };

  const getTimeSlot = (startTime, endTime) => {
    return `${startTime} - ${endTime}`;
  };

  const isCurrentPeriod = (day, startTime, endTime) => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const periodStart = startHour * 60 + startMinute;
    const periodEnd = endHour * 60 + endMinute;

    return (
      day === currentDay && currentTime >= periodStart && currentTime <= periodEnd
    );
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
        Class Timetable
      </Typography>

      {/* Current Period Card */}
      {timetable[currentDay]?.find((period) =>
        isCurrentPeriod(
          currentDay,
          period.startTime,
          period.endTime
        )
      ) && (
        <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Current Period
            </Typography>
            {timetable[currentDay]
              ?.filter((period) =>
                isCurrentPeriod(currentDay, period.startTime, period.endTime)
              )
              .map((period, index) => (
                <Box key={index}>
                  <Typography variant="h5" gutterBottom>
                    {period.subject}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Chip
                      icon={<AccessTime />}
                      label={getTimeSlot(period.startTime, period.endTime)}
                      sx={{ bgcolor: 'white', color: 'primary.main' }}
                    />
                    <Chip
                      icon={<LocationOn />}
                      label={period.room}
                      sx={{ bgcolor: 'white', color: 'primary.main' }}
                    />
                    <Chip
                      icon={<Person />}
                      label={period.teacher}
                      sx={{ bgcolor: 'white', color: 'primary.main' }}
                    />
                  </Box>
                </Box>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Timetable */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              {Array.from({ length: 5 }, (_, i) => (
                <TableCell key={i} align="center">
                  {getDayName(i + 1)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 8 }, (_, periodIndex) => (
              <TableRow key={periodIndex}>
                <TableCell>
                  {getTimeSlot(
                    timetable[1]?.[periodIndex]?.startTime || '00:00',
                    timetable[1]?.[periodIndex]?.endTime || '00:00'
                  )}
                </TableCell>
                {Array.from({ length: 5 }, (_, dayIndex) => {
                  const period = timetable[dayIndex + 1]?.[periodIndex];
                  return (
                    <TableCell
                      key={dayIndex}
                      align="center"
                      sx={{
                        bgcolor: isCurrentPeriod(
                          dayIndex + 1,
                          period?.startTime,
                          period?.endTime
                        )
                          ? 'primary.light'
                          : 'inherit',
                      }}
                    >
                      {period ? (
                        <Box>
                          <Typography variant="subtitle1" gutterBottom>
                            {period.subject}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Tooltip title="Room">
                              <Chip
                                icon={<LocationOn />}
                                label={period.room}
                                size="small"
                              />
                            </Tooltip>
                            <Tooltip title="Teacher">
                              <Chip
                                icon={<Person />}
                                label={period.teacher}
                                size="small"
                              />
                            </Tooltip>
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No Class
                        </Typography>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Legend */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography variant="subtitle1">Legend:</Typography>
        <Chip icon={<AccessTime />} label="Time" />
        <Chip icon={<LocationOn />} label="Room" />
        <Chip icon={<Person />} label="Teacher" />
        <Chip
          icon={<Event />}
          label="Current Period"
          sx={{ bgcolor: 'primary.light', color: 'white' }}
        />
      </Box>
    </Box>
  );
};

export default Timetable; 