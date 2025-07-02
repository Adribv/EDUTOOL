import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  School as SchoolIcon,
  Grade as GradeIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  EmojiEvents as TrophyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { studentAPI } from '../../services/api';

const PerformanceAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [tabValue, setTabValue] = useState(0);

  // Fetch real performance data
  const { data: performanceData, isLoading, error } = useQuery({
    queryKey: ['studentPerformance'],
    queryFn: async () => {
      try {
        const response = await studentAPI.getPerformanceAnalytics();
        return response.data || {};
      } catch (error) {
        console.error('Error fetching performance data:', error);
        throw error;
      }
    },
    retry: 3,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
  const realChartData = subjectPerformance ? Object.keys(subjectPerformance).map(subject => ({
    subject,
    average: subjectPerformance[subject].average,
    highest: subjectPerformance[subject].highest,
    lowest: subjectPerformance[subject].lowest,
  })) : [];

  // Use real data if available, otherwise use fallback
  const chartData = realChartData.length > 0 ? realChartData : [
    { month: 'Jan', Mathematics: 88, English: 85, Science: 87, History: 82, Geography: 80 },
    { month: 'Feb', Mathematics: 90, English: 86, Science: 86, History: 84, Geography: 81 },
    { month: 'Mar', Mathematics: 92, English: 88, Science: 85, History: 90, Geography: 82 },
    { month: 'Apr', Mathematics: 91, English: 87, Science: 84, History: 89, Geography: 83 },
    { month: 'May', Mathematics: 93, English: 89, Science: 86, History: 91, Geography: 84 },
    { month: 'Jun', Mathematics: 92, English: 88, Science: 85, History: 90, Geography: 82 }
  ];

  const gradeDistribution = [
    { name: 'A', value: 3, color: '#4caf50' },
    { name: 'A-', value: 1, color: '#8bc34a' },
    { name: 'B+', value: 1, color: '#ff9800' },
    { name: 'B', value: 1, color: '#ff5722' },
    { name: 'C', value: 0, color: '#f44336' }
  ];

  const strengths = [
    'Strong mathematical reasoning',
    'Excellent writing skills',
    'Good analytical thinking',
    'Consistent attendance',
    'Active class participation'
  ];

  const areasForImprovement = [
    'Science practical skills',
    'Time management in exams',
    'Group project collaboration'
  ];

  const achievements = [
    'Top 5% in Mathematics',
    'Perfect attendance award',
    'Best essay in English',
    'Science fair participant'
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? 
      <TrendingUpIcon color="success" /> : 
      <TrendingDownIcon color="error" />;
  };

  const getTrendColor = (trend) => {
    return trend === 'up' ? 'success' : 'error';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Performance Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Comprehensive analysis of your academic performance and progress
        </Typography>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Time Period</InputLabel>
              <Select
                value={selectedPeriod}
                label="Time Period"
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <MenuItem value="current">Current Term</MenuItem>
                <MenuItem value="previous">Previous Term</MenuItem>
                <MenuItem value="year">Academic Year</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Subject</InputLabel>
              <Select
                value={selectedSubject}
                label="Subject"
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <MenuItem value="all">All Subjects</MenuItem>
                <MenuItem value="mathematics">Mathematics</MenuItem>
                <MenuItem value="english">English</MenuItem>
                <MenuItem value="science">Science</MenuItem>
                <MenuItem value="history">History</MenuItem>
                <MenuItem value="geography">Geography</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SchoolIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Current GPA</Typography>
              </Box>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {overallPerformance ? overallPerformance.averageScore?.toFixed(1) || 'N/A' : 'N/A'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                  {overallPerformance ? `${overallPerformance.examsTaken} exams taken` : 'No data available'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrophyIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">Class Rank</Typography>
              </Box>
              <Typography variant="h4" color="secondary.main" fontWeight="bold">
                #{performanceData.current.rank}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                of {performanceData.current.totalStudents} students
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Attendance</Typography>
              </Box>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {performanceData.current.attendance}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Excellent attendance record
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <GradeIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Behavior</Typography>
              </Box>
              <Typography variant="h6" color="info.main" fontWeight="bold">
                {performanceData.current.behavior}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Outstanding conduct
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for different views */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Performance Trends" />
          <Tab label="Subject Analysis" />
          <Tab label="Strengths & Areas" />
          <Tab label="Achievements" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Performance Trends Over Time
          </Typography>
          <Paper sx={{ p: 2, mb: 3 }}>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Mathematics" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="English" stroke="#82ca9d" strokeWidth={2} />
                <Line type="monotone" dataKey="Science" stroke="#ffc658" strokeWidth={2} />
                <Line type="monotone" dataKey="History" stroke="#ff7300" strokeWidth={2} />
                <Line type="monotone" dataKey="Geography" stroke="#00ff00" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Subject Performance Analysis
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Subject</TableCell>
                      <TableCell align="center">Current Score</TableCell>
                      <TableCell align="center">Previous Score</TableCell>
                      <TableCell align="center">Trend</TableCell>
                      <TableCell align="center">Grade</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {performanceData.current.subjects.map((subject, index) => (
                      <TableRow key={index}>
                        <TableCell>{subject.name}</TableCell>
                        <TableCell align="center">{subject.current}%</TableCell>
                        <TableCell align="center">{subject.previous}%</TableCell>
                        <TableCell align="center">
                          <Chip
                            icon={getTrendIcon(subject.trend)}
                            label={subject.trend === 'up' ? 'Improving' : 'Declining'}
                            color={getTrendColor(subject.trend)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={subject.grade} color="primary" size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Grade Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={gradeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {gradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Strengths & Areas for Improvement
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="success.main">
                    <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Strengths
                  </Typography>
                  <List>
                    {strengths.map((strength, index) => (
                      <ListItem key={index} dense>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'success.main', width: 24, height: 24 }}>
                            <CheckCircleIcon sx={{ fontSize: 16 }} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={strength} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="warning.main">
                    <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Areas for Improvement
                  </Typography>
                  <List>
                    {areasForImprovement.map((area, index) => (
                      <ListItem key={index} dense>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'warning.main', width: 24, height: 24 }}>
                            <WarningIcon sx={{ fontSize: 16 }} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={area} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {tabValue === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Achievements & Recognition
          </Typography>
          <Grid container spacing={2}>
            {achievements.map((achievement, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrophyIcon color="primary" sx={{ mr: 2 }} />
                      <Typography variant="body1">
                        {achievement}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default PerformanceAnalytics; 