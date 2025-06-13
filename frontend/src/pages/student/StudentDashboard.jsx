import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Button,
  LinearProgress,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  School as SchoolIcon,
  Functions as FunctionsIcon,
  Visibility as VisibilityIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';

const StudentDashboard = () => {
  const { data: studentData, isLoading } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/students/dashboard', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('studentToken')}`,
        },
      });
      return response.data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to load dashboard data');
    },
  });

  const CourseCard = ({ subject, chapter, homework }) => (
    <Card sx={{ height: '100%', bgcolor: '#1a237e', color: 'white', position: 'relative' }}>
      <CardContent>
        <Typography variant="h6" component="div" sx={{ mb: 2 }}>
          {subject}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Chapter: {chapter}</Typography>
          <Typography variant="body2">Homework: {homework}</Typography>
        </Box>
        <Typography variant="body2" sx={{ mb: 2 }}>
          C3: Algebraic Expressions
        </Typography>
        <Box sx={{ position: 'absolute', bottom: 16, right: 16 }}>
          <Button
            variant="contained"
            size="small"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
            }}
          >
            View Notes
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const StudentInfo = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Welcome Back {studentData?.name || 'Student'}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Typography variant="body1" color="text.secondary">
          REGNO: {studentData?.regNo || 'ABC1234'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          CLASS: {studentData?.class || '11'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          SECTION: {studentData?.section || 'B'}
        </Typography>
      </Box>
    </Box>
  );

  const ProgressChart = () => (
    <Card>
      <CardHeader title="Student Progress" />
      <CardContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Subject</TableCell>
                <TableCell align="right">ET-1</TableCell>
                <TableCell align="right">FT-2</TableCell>
                <TableCell align="right">Annual</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {['Maths', 'Science', 'English', 'Language-2', 'CSE'].map((subject) => (
                <TableRow key={subject}>
                  <TableCell component="th" scope="row">
                    {subject}
                  </TableCell>
                  <TableCell align="right">85%</TableCell>
                  <TableCell align="right">78%</TableCell>
                  <TableCell align="right">92%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const TimeTable = () => (
    <Card>
      <CardHeader title="Timetable" />
      <CardContent>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Day</TableCell>
                {[1, 2, 3, 4, 5, 6, 7].map((period) => (
                  <TableCell key={period} align="center">{period}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {['MON', 'TUE', 'WED', 'THU', 'FRI'].map((day) => (
                <TableRow key={day}>
                  <TableCell component="th" scope="row">
                    {day}
                  </TableCell>
                  {[1, 2, 3, 4, 5, 6, 7].map((period) => (
                    <TableCell key={`${day}-${period}`} align="center">-</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <StudentInfo />
      
      <Typography variant="h6" sx={{ mb: 2 }}>
        COURSE ASSIGNMENTS
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[1, 2, 3].map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item}>
            <CourseCard subject="MATHS" chapter="2" homework="2" />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ProgressChart />
        </Grid>
        <Grid item xs={12} md={6}>
          <TimeTable />
        </Grid>
      </Grid>
    </Container>
  );
};

export default StudentDashboard; 