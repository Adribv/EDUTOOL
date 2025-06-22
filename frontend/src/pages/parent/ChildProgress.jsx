import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Avatar,
} from '@mui/material';
import {
  ArrowBack,
  Assessment,
  Timeline,
  BarChart,
  Grade,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { parentAPI } from '../../services/api';

const ChildProgress = () => {
  const { childId } = useParams();
  const navigate = useNavigate();

  const { data: progressData, isLoading, error } = useQuery({
    queryKey: ['child_progress', childId],
    queryFn: () => parentAPI.getChildProgress(childId),
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error">Failed to load progress data: {error.message}</Alert>
      </Box>
    );
  }

  const { child, summary, recentGrades, attendance, performanceChartData } = progressData;

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/parent/children')} sx={{ mb: 2 }}>
        Back to My Children
      </Button>
      <Box display="flex" alignItems="center" mb={3}>
        <Avatar src={child.profilePicture} sx={{ width: 64, height: 64, mr: 2 }}>
          {child.name.charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            {child.name}'s Progress
          </Typography>
          <Typography color="text.secondary">
            Class: {child.class} | Roll No: {child.rollNumber}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Grade color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Overall Grade</Typography>
              </Box>
              <Typography variant="h4" color="primary.main">{summary.overallGrade}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Timeline color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">Attendance</Typography>
              </Box>
              <Typography variant="h4" color="secondary.main">{summary.attendanceRate}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Assessment color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Assignments</Typography>
              </Box>
              <Typography variant="h4" color="error.main">{summary.assignmentsCompleted}/{summary.assignmentsTotal}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Performance Over Time</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="grade" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Grades */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Recent Grades</Typography>
            <List>
              {recentGrades.map((grade, index) => (
                <ListItem key={index} divider={index < recentGrades.length - 1}>
                  <ListItemText primary={grade.subject} secondary={`Exam: ${grade.examName}`} />
                  <Chip label={`${grade.score}%`} color={grade.score >= 75 ? 'success' : grade.score >= 60 ? 'warning' : 'error'} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Attendance Records */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Recent Attendance</Typography>
            <List>
              {attendance.slice(0, 5).map((record, index) => (
                <ListItem key={index} divider={index < attendance.length - 1}>
                  <ListItemText primary={new Date(record.date).toLocaleDateString()} />
                  <Chip 
                    label={record.status} 
                    color={record.status === 'Present' ? 'success' : 'error'} 
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChildProgress; 