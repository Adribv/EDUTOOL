import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
} from '@mui/material';
import {
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import parentService from '../../services/parentService';

const Students = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await parentService.getStudents();
      setStudents(response.data);
    } catch {
      setError('Failed to load students data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (studentId) => {
    navigate(`/parent/students/${studentId}`);
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
        My Children
      </Typography>

      <Grid container spacing={3}>
        {students.map((student) => (
          <Grid item xs={12} md={6} key={student.id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar
                    src={student.profileImage}
                    sx={{ width: 64, height: 64, mr: 2 }}
                  >
                    {student.name[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{student.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Class {student.class} - Roll No: {student.rollNumber}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={1} mb={2}>
                  <Chip
                    icon={<SchoolIcon />}
                    label={`${student.attendance}% Attendance`}
                    color={student.attendance >= 75 ? 'success' : 'warning'}
                  />
                  <Chip
                    icon={<TrendingUpIcon />}
                    label={`${student.performance}% Performance`}
                    color={student.performance >= 80 ? 'success' : 'warning'}
                  />
                </Box>

                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    startIcon={<EventIcon />}
                    onClick={() => handleViewDetails(student.id)}
                  >
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Students; 