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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, Bar } from 'recharts';
import parentService from '../../services/parentService';

const ChildProgress = () => {
  const { rollNumber } = useParams();
  const navigate = useNavigate();

  const { data: performanceData, isLoading, error } = useQuery({
    queryKey: ['child_performance', rollNumber],
    queryFn: () => parentService.getChildProgress(rollNumber),
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
        <Alert severity="error">Failed to load performance data: {error.message}</Alert>
      </Box>
    );
  }

  // Transform the data for display
  const { subjectPerformance, overallPerformance } = performanceData || {};

  // Create chart data from subject performance
  const chartData = subjectPerformance ? Object.keys(subjectPerformance).map(subject => ({
    subject,
    average: subjectPerformance[subject].average,
    highest: subjectPerformance[subject].highest,
    lowest: subjectPerformance[subject].lowest,
  })) : [];

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/parent/children')} sx={{ mb: 2 }}>
        Back to My Children
      </Button>
      
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Child Performance Analytics
      </Typography>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Grade color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Overall Average</Typography>
              </Box>
              <Typography variant="h4" color="primary.main">
                {overallPerformance?.averageScore?.toFixed(1) || 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Assessment color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">Exams Taken</Typography>
              </Box>
              <Typography variant="h4" color="secondary.main">
                {overallPerformance?.examsTaken || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <BarChart color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Subjects</Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                {Object.keys(subjectPerformance || {}).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Chart */}
        {chartData.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Subject Performance Overview</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="average" fill="#8884d8" name="Average Score" />
                  <Bar dataKey="highest" fill="#82ca9d" name="Highest Score" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* Subject Performance Details */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Subject-wise Performance</Typography>
            {subjectPerformance && Object.keys(subjectPerformance).length > 0 ? (
              <Grid container spacing={2}>
                {Object.keys(subjectPerformance).map((subject) => {
                  const data = subjectPerformance[subject];
                  return (
                    <Grid item xs={12} sm={6} md={4} key={subject}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>{subject}</Typography>
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2">Average:</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {data.average.toFixed(1)}%
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2">Highest:</Typography>
                            <Typography variant="body2" color="success.main" fontWeight="bold">
                              {data.highest}%
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2">Lowest:</Typography>
                            <Typography variant="body2" color="error.main" fontWeight="bold">
                              {data.lowest}%
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2">Exams:</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {data.scores.length}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary">No performance data available</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Performance Insights */}
        {overallPerformance && overallPerformance.examsTaken > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Performance Insights</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Total Exams Taken:</strong> {overallPerformance.examsTaken}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Overall Average:</strong> {overallPerformance.averageScore.toFixed(1)}%
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Subjects Covered:</strong> {Object.keys(subjectPerformance || {}).length}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Performance Level:</strong> 
                    <Chip 
                      label={
                        overallPerformance.averageScore >= 90 ? 'Excellent' :
                        overallPerformance.averageScore >= 80 ? 'Very Good' :
                        overallPerformance.averageScore >= 70 ? 'Good' :
                        overallPerformance.averageScore >= 60 ? 'Average' : 'Needs Improvement'
                      }
                      color={
                        overallPerformance.averageScore >= 90 ? 'success' :
                        overallPerformance.averageScore >= 80 ? 'primary' :
                        overallPerformance.averageScore >= 70 ? 'warning' : 'error'
                      }
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ChildProgress; 