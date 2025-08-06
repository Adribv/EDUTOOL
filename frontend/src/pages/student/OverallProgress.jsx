import React, { useState, useEffect } from 'react';
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
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
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
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  Star as StarIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Psychology as PsychologyIcon,
  SportsEsports as SportsIcon,
  MusicNote as MusicIcon,
  Science as ScienceIcon,
  Comment as CommentIcon,
  Send as SendIcon,
  Print as PrintIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { studentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const OverallProgress = () => {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [selectedTab, setSelectedTab] = useState(4); // Start with comprehensive report tab
  const [expandedAccordion, setExpandedAccordion] = useState('panel1');
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [feedback, setFeedback] = useState('');
  const { user } = useAuth();

  // Mock data that matches the PDF template
  const mockData = {
    academicPerformance: {
      overallPercentage: 85,
      overallGrade: 'A',
      rank: 5,
      subjects: [
        { name: 'English', grade: 'A+', percentage: 92, improvement: 'Excellent', teacherRemarks: 'Excellent writing and communication skills' },
        { name: 'Mathematics', grade: 'A', percentage: 88, improvement: 'Good', teacherRemarks: 'Strong problem-solving abilities' },
        { name: 'Science', grade: 'A', percentage: 87, improvement: 'Good', teacherRemarks: 'Good understanding of scientific concepts' },
        { name: 'Social Studies', grade: 'B+', percentage: 82, improvement: 'Satisfactory', teacherRemarks: 'Keep improving historical knowledge' },
        { name: 'Computer Science', grade: 'A+', percentage: 95, improvement: 'Excellent', teacherRemarks: 'Excellent programming skills' }
      ]
    },
    attendance: {
      percentage: 95,
      totalDays: 180,
      daysPresent: 171,
      daysAbsent: 9,
      lateArrivals: 2
    },
    behavior: {
      overallRating: 'Excellent',
      punctuality: 'Excellent',
      discipline: 'Good',
      participation: 'Excellent',
      teamwork: 'Good'
    },
    skills: {
      communication: 'Excellent',
      leadership: 'Good',
      creativity: 'Satisfactory',
      problemSolving: 'Excellent'
    },
    coCurricular: {
      sports: { participated: true, achievements: ['First in Basketball'], rating: 'Excellent' },
      cultural: { participated: true, achievements: ['Drama Competition Winner'], rating: 'Good' },
      academic: { participated: true, achievements: ['Science Fair Winner'], rating: 'Excellent' }
    },
    goals: {
      academic: { currentTarget: 'Achieve 90% in all subjects', achieved: false },
      behavioral: { currentTarget: 'Improve punctuality', achieved: true },
      personal: { currentTarget: 'Participate in more activities', achieved: true }
    },
    comprehensiveReport: {
      schoolInfo: {
        schoolName: 'EDULIVES School',
        academicYear: '2024-25',
        class: 'Class 10',
        term: 'Annual',
        reportDate: new Date().toLocaleDateString()
      },
      studentInfo: {
        name: user?.name || 'Student Name',
        admissionNumber: 'STU2024001',
        dateOfBirth: '15-03-2008',
        classSection: '10-A',
        classTeacher: 'Mrs. Sarah Johnson'
      },
      academicPerformance: {
        subjects: [
          { name: 'English', marks: 92, totalMarks: 100, grade: 'A+', teacherRemarks: 'Excellent writing and communication skills' },
          { name: 'Mathematics', marks: 88, totalMarks: 100, grade: 'A', teacherRemarks: 'Strong problem-solving abilities' },
          { name: 'Science', marks: 87, totalMarks: 100, grade: 'A', teacherRemarks: 'Good understanding of scientific concepts' },
          { name: 'Social Studies', marks: 82, totalMarks: 100, grade: 'B+', teacherRemarks: 'Keep improving historical knowledge' },
          { name: 'Computer Science', marks: 95, totalMarks: 100, grade: 'A+', teacherRemarks: 'Excellent programming skills' }
        ]
      },
      coScholasticAreas: [
        { area: 'Work Habits', grade: 'A+', teacherComments: 'Excellent work habits and time management' },
        { area: 'Communication Skills', grade: 'A', teacherComments: 'Good verbal and written communication' },
        { area: 'Teamwork & Leadership', grade: 'B+', teacherComments: 'Shows leadership qualities in group activities' },
        { area: 'Discipline', grade: 'A', teacherComments: 'Maintains good discipline in class' },
        { area: 'Creativity', grade: 'B+', teacherComments: 'Shows creative thinking in projects' },
        { area: 'Participation in Activities', grade: 'A', teacherComments: 'Active participation in school activities' }
      ],
      attendance: {
        totalDays: 180,
        daysPresent: 171,
        daysAbsent: 9,
        percentage: 95
      },
      trends: {
        academicProgress: 'Improving',
        attendanceTrend: 'Stable',
        behaviorTrend: 'Excellent',
        assignmentTrend: 'Good'
      },
      recommendations: {
        academic: [
          'Focus more on English writing skills',
          'Practice more mathematical problems',
          'Read more books to improve vocabulary'
        ],
        behavioral: [
          'Continue maintaining good attendance',
          'Participate more in class discussions',
          'Help classmates with their studies'
        ]
      },
      generalRemarks: {
        classTeacher: 'Student shows excellent academic performance with room for improvement in social studies.',
        principal: 'Overall satisfactory performance. Keep up the good work.'
      },
      signatures: {
        classTeacher: 'Mrs. Sarah Johnson',
        parentGuardian: 'Online acceptance with comments',
        principal: 'Dr. Michael Brown',
        date: new Date().toLocaleDateString()
      }
    }
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'Improving':
        return <TrendingUpIcon color="success" />;
      case 'Declining':
        return <TrendingDownIcon color="error" />;
      default:
        return <TimelineIcon color="info" />;
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'success';
      case 'B+':
      case 'B':
        return 'primary';
      case 'C+':
      case 'C':
        return 'warning';
      default:
        return 'error';
    }
  };

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'Excellent':
        return 'success';
      case 'Good':
        return 'primary';
      case 'Satisfactory':
        return 'warning';
      case 'Needs Improvement':
      case 'Poor':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRatingScore = (rating) => {
    const ratings = {
      'Excellent': 5,
      'Good': 4,
      'Satisfactory': 3,
      'Needs Improvement': 2,
      'Poor': 1
    };
    return ratings[rating] || 3;
  };

  // Helper function to get trend color
  const getTrendColor = (trend) => {
    switch (trend) {
      case 'Improving':
        return 'success.main';
      case 'Stable':
        return 'info.main';
      case 'Declining':
        return 'error.main';
      case 'Excellent':
        return 'success.main';
      case 'Good':
        return 'info.main';
      default:
        return 'text.primary';
    }
  };

  // Helper function to get recommendation priority color
  const getRecommendationPriorityColor = (recommendation, index) => {
    // Academic recommendations are high priority
    if (recommendation.includes('Focus') || recommendation.includes('Practice') || recommendation.includes('improve')) {
      return 'error.main';
    }
    // Behavioral recommendations are medium priority
    if (recommendation.includes('Continue') || recommendation.includes('Participate')) {
      return 'warning.main';
    }
    // General recommendations are low priority
    return 'info.main';
  };

  // Helper function to get recommendation priority
  const getRecommendationPriority = (recommendation) => {
    if (recommendation.includes('Focus') || recommendation.includes('Practice') || recommendation.includes('improve')) {
      return 'High';
    }
    if (recommendation.includes('Continue') || recommendation.includes('Participate')) {
      return 'Medium';
    }
    return 'Low';
  };

  const handleFeedbackSubmit = async () => {
    try {
      if (!feedback.trim()) {
        toast.error('Please enter your feedback before submitting');
        return;
      }
      
      // Submit feedback logic here
      console.log('Feedback submitted:', feedback);
      toast.success('Feedback submitted successfully! Thank you for your input.');
      setFeedbackDialog(false);
      setFeedback('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Overall Progress Report
      </Typography>

      {/* Period Selection */}
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Assessment Period</InputLabel>
          <Select
            value={selectedPeriod}
            label="Assessment Period"
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <MenuItem value="current">Current Period</MenuItem>
            <MenuItem value="Monthly">Monthly</MenuItem>
            <MenuItem value="Quarterly">Quarterly</MenuItem>
            <MenuItem value="Half-Yearly">Half-Yearly</MenuItem>
            <MenuItem value="Annual">Annual</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                <SchoolIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {mockData.academicPerformance.overallPercentage}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Overall Grade: {mockData.academicPerformance.overallGrade}
                  </Typography>
                </Box>
              </Box>
              {/* Academic Performance Bar Graph */}
              <Box sx={{ mt: 2 }}>
                <ResponsiveContainer width="100%" height={60}>
                  <BarChart data={[
                    { subject: 'Overall', score: mockData.academicPerformance.overallPercentage }
                  ]}>
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <Bar dataKey="score" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                <CalendarIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {mockData.attendance.percentage}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Attendance Rate
                  </Typography>
                </Box>
              </Box>
              {/* Attendance Bar Graph */}
              <Box sx={{ mt: 2 }}>
                <ResponsiveContainer width="100%" height={60}>
                  <BarChart data={[
                    { status: 'Present', days: mockData.attendance.daysPresent, color: '#4caf50' },
                    { status: 'Absent', days: mockData.attendance.daysAbsent, color: '#f44336' }
                  ]}>
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Bar dataKey="days" fill={(entry) => entry.color} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                <PsychologyIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {mockData.behavior.overallRating}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Behavior Rating
                  </Typography>
                </Box>
              </Box>
              {/* Behavior Rating Bar Graph */}
              <Box sx={{ mt: 2 }}>
                <ResponsiveContainer width="100%" height={60}>
                  <BarChart data={[
                    { aspect: 'Overall', rating: getRatingScore(mockData.behavior.overallRating), color: getRatingColor(mockData.behavior.overallRating) }
                  ]}>
                    <XAxis dataKey="aspect" />
                    <YAxis />
                    <Bar dataKey="rating" fill={(entry) => entry.color} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                <TrophyIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {mockData.academicPerformance.rank || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Class Rank
                  </Typography>
                </Box>
              </Box>
              {/* Class Rank Visualization */}
              <Box sx={{ mt: 2 }}>
                <ResponsiveContainer width="100%" height={60}>
                  <BarChart data={[
                    { metric: 'Rank', value: mockData.academicPerformance.rank || 0, color: '#ff9800' }
                  ]}>
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Bar dataKey="value" fill={(entry) => entry.color} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Progress Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Academic Performance" />
          <Tab label="Attendance & Behavior" />
          <Tab label="Skills & Activities" />
          <Tab label="Analytics & Trends" />
          <Tab label="Comprehensive Report" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Academic Performance Tab */}
          {selectedTab === 0 && (
            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                Academic Performance
              </Typography>
              
              {/* Subject Performance */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Subject-wise Performance
                  </Typography>
                  <Grid container spacing={3}>
                    {mockData.academicPerformance.subjects.map((subject, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" sx={{ color: getGradeColor(subject.grade) }}>
                              {subject.name}
                            </Typography>
                            <Typography variant="h4" sx={{ color: getGradeColor(subject.grade), fontWeight: 'bold' }}>
                              {subject.grade}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {subject.percentage}% | {subject.marks}/{subject.totalMarks}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={subject.percentage} 
                                sx={{ 
                                  height: 8, 
                                  borderRadius: 4,
                                  backgroundColor: 'grey.200',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: getGradeColor(subject.grade)
                                  }
                                }} 
                              />
                            </Box>
                            <Typography variant="caption" color="textSecondary">
                              {subject.teacherRemarks}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>

              {/* Performance Chart */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Performance Trends
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockData.academicPerformance.subjects.map(subject => ({
                      subject: subject.name,
                      percentage: subject.percentage,
                      grade: subject.grade
                    }))}>
                      <XAxis dataKey="subject" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="percentage" fill="#1976d2" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Attendance & Behavior Tab */}
          {selectedTab === 1 && (
            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                Attendance & Behavior
              </Typography>
              
              {/* Attendance Details */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Attendance Details
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom>Monthly Attendance</Typography>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={[
                          { month: 'Jan', present: 22, absent: 2 },
                          { month: 'Feb', present: 20, absent: 1 },
                          { month: 'Mar', present: 23, absent: 0 },
                          { month: 'Apr', present: 21, absent: 1 },
                          { month: 'May', present: 22, absent: 1 },
                          { month: 'Jun', present: 20, absent: 2 }
                        ]}>
                          <XAxis dataKey="month" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Bar dataKey="present" fill="#4caf50" />
                          <Bar dataKey="absent" fill="#f44336" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom>Behavior Assessment</Typography>
                      <Box>
                        {Object.entries(mockData.behavior).map(([key, value]) => (
                          <Box key={key} sx={{ mb: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'bold', color: getRatingColor(value) }}>
                                {value}
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={getRatingScore(value) * 20} 
                              sx={{ 
                                height: 6, 
                                borderRadius: 3,
                                backgroundColor: 'grey.200',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: getRatingColor(value)
                                }
                              }} 
                            />
                          </Box>
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Skills & Activities Tab */}
          {selectedTab === 2 && (
            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                Skills & Activities
              </Typography>
              
              {/* Skills Assessment */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Skills Assessment
                  </Typography>
                  <Grid container spacing={3}>
                    {Object.entries(mockData.skills).map(([skill, rating]) => (
                      <Grid item xs={12} sm={6} md={4} key={skill}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" sx={{ textTransform: 'capitalize', mb: 1 }}>
                              {skill.replace(/([A-Z])/g, ' $1').trim()}
                            </Typography>
                            <Typography variant="h4" sx={{ color: getRatingColor(rating), fontWeight: 'bold' }}>
                              {rating}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={getRatingScore(rating) * 20} 
                                sx={{ 
                                  height: 8, 
                                  borderRadius: 4,
                                  backgroundColor: 'grey.200',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: getRatingColor(rating)
                                  }
                                }} 
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>

              {/* Co-Scholastic Activities */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Co-Scholastic Activities
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Activity</TableCell>
                          <TableCell>Grade</TableCell>
                          <TableCell>Teacher's Comments</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mockData.comprehensiveReport.coScholasticAreas.map((activity, index) => (
                          <TableRow key={index}>
                            <TableCell>{activity.area}</TableCell>
                            <TableCell>
                              <Chip 
                                label={activity.grade} 
                                color={getGradeColor(activity.grade) === 'success.main' ? 'success' : 'primary'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{activity.teacherComments}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Analytics & Trends Tab */}
          {selectedTab === 3 && (
            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                Analytics & Trends
              </Typography>
              
              {/* Performance Analytics */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Academic Performance Trends
                      </Typography>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={[
                          { month: 'Jan', score: 82 },
                          { month: 'Feb', score: 85 },
                          { month: 'Mar', score: 87 },
                          { month: 'Apr', score: 84 },
                          { month: 'May', score: 88 },
                          { month: 'Jun', score: 85 }
                        ]}>
                          <XAxis dataKey="month" />
                          <YAxis />
                          <RechartsTooltip />
                          <Line type="monotone" dataKey="score" stroke="#1976d2" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Attendance Trends
                      </Typography>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={[
                          { month: 'Jan', attendance: 92 },
                          { month: 'Feb', attendance: 95 },
                          { month: 'Mar', attendance: 98 },
                          { month: 'Apr', attendance: 94 },
                          { month: 'May', attendance: 96 },
                          { month: 'Jun', attendance: 95 }
                        ]}>
                          <XAxis dataKey="month" />
                          <YAxis />
                          <RechartsTooltip />
                          <Line type="monotone" dataKey="attendance" stroke="#4caf50" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Progress Indicators */}
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Progress Indicators
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                          {mockData.academicPerformance.overallPercentage}%
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Academic Performance
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" sx={{ color: 'info.main', fontWeight: 'bold' }}>
                          {mockData.attendance.percentage}%
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Attendance Rate
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                          {getRatingScore(mockData.behavior.overallRating) * 20}%
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Behavior Rating
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                          {mockData.academicPerformance.rank || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Class Rank
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Comprehensive Report Tab */}
          {selectedTab === 4 && (
            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                Comprehensive Report
              </Typography>
              
              {/* Report Information */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">School Name:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {mockData.comprehensiveReport.schoolInfo.schoolName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Academic Year:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {mockData.comprehensiveReport.schoolInfo.academicYear}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Class / Grade:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {mockData.comprehensiveReport.schoolInfo.class}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Term:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {mockData.comprehensiveReport.schoolInfo.term}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Divider sx={{ mb: 3 }} />

              {/* Student Information */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Student Information:
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Name:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {mockData.comprehensiveReport.studentInfo.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Admission Number:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {mockData.comprehensiveReport.studentInfo.admissionNumber}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Date of Birth:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {mockData.comprehensiveReport.studentInfo.dateOfBirth}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Class/Section:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {mockData.comprehensiveReport.studentInfo.classSection}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Class Teacher:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {mockData.comprehensiveReport.studentInfo.classTeacher}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Divider sx={{ mb: 3 }} />

              {/* Academic Performance */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Academic Performance:
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Marks Obtained</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Maximum Marks</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Grade</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Teacher's Remarks</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mockData.comprehensiveReport.academicPerformance.subjects.map((subject, index) => (
                          <TableRow key={index}>
                            <TableCell>{subject.name}</TableCell>
                            <TableCell>{subject.marks}</TableCell>
                            <TableCell>{subject.totalMarks}</TableCell>
                            <TableCell>
                              <Chip 
                                label={subject.grade} 
                                color={getGradeColor(subject.grade)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{subject.teacherRemarks}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              <Divider sx={{ mb: 3 }} />

              {/* Co-Scholastic Areas */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Co-Scholastic Areas:
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Area</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Grade / Rating</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Teacher's Comments</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mockData.comprehensiveReport.coScholasticAreas.map((area, index) => (
                          <TableRow key={index}>
                            <TableCell>{area.area}</TableCell>
                            <TableCell>
                              <Chip 
                                label={area.grade} 
                                color={getGradeColor(area.grade)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{area.teacherComments}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              <Divider sx={{ mb: 3 }} />

              {/* Attendance */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Attendance:
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Total Working Days:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {mockData.comprehensiveReport.attendance.totalDays}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Days Present:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {mockData.comprehensiveReport.attendance.daysPresent}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Absent Days:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {mockData.comprehensiveReport.attendance.daysAbsent}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Attendance Percentage:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: mockData.comprehensiveReport.attendance.percentage >= 90 ? 'success.main' : 'warning.main' }}>
                        {mockData.comprehensiveReport.attendance.percentage}%
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  {/* Attendance Bar Graph */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Attendance Overview:
                    </Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={[
                        { 
                          category: 'Present', 
                          days: mockData.comprehensiveReport.attendance.daysPresent,
                          color: '#4caf50'
                        },
                        { 
                          category: 'Absent', 
                          days: mockData.comprehensiveReport.attendance.daysAbsent,
                          color: '#f44336'
                        }
                      ]}>
                        <XAxis dataKey="category" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="days" fill={(entry) => entry.color} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>

              <Divider sx={{ mb: 3 }} />

              {/* Progress Trends */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Progress Trends:
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box display="flex" alignItems="center">
                        <AssessmentIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body1">
                          Academic Progress: 
                          <Typography 
                            component="span" 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 'bold', 
                              color: getTrendColor(mockData.comprehensiveReport.trends.academicProgress),
                              ml: 1
                            }}
                          >
                            {mockData.comprehensiveReport.trends.academicProgress}
                          </Typography>
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box display="flex" alignItems="center">
                        <SchoolIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body1">
                          Attendance: 
                          <Typography 
                            component="span" 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 'bold', 
                              color: getTrendColor(mockData.comprehensiveReport.trends.attendanceTrend),
                              ml: 1
                            }}
                          >
                            {mockData.comprehensiveReport.trends.attendanceTrend}
                          </Typography>
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box display="flex" alignItems="center">
                        <PersonIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body1">
                          Behavior: 
                          <Typography 
                            component="span" 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 'bold', 
                              color: getTrendColor(mockData.comprehensiveReport.trends.behaviorTrend),
                              ml: 1
                            }}
                          >
                            {mockData.comprehensiveReport.trends.behaviorTrend}
                          </Typography>
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box display="flex" alignItems="center">
                        <AssessmentIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body1">
                          Assignments: 
                          <Typography 
                            component="span" 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 'bold', 
                              color: getTrendColor(mockData.comprehensiveReport.trends.assignmentTrend),
                              ml: 1
                            }}
                          >
                            {mockData.comprehensiveReport.trends.assignmentTrend}
                          </Typography>
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Divider sx={{ mb: 3 }} />

              {/* Recommendations */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Recommendations:
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" color="primary" gutterBottom>
                        Academic Recommendations:
                      </Typography>
                      <List>
                        {mockData.comprehensiveReport.recommendations.academic.map((rec, index) => (
                          <ListItem key={index}>
                            <ListItemAvatar>
                              <CheckCircleIcon 
                                sx={{ 
                                  color: getRecommendationPriorityColor(rec, index) 
                                }} 
                              />
                            </ListItemAvatar>
                            <ListItemText 
                              primary={
                                <Box>
                                  <Typography 
                                    variant="body1" 
                                    sx={{ 
                                      color: getRecommendationPriorityColor(rec, index),
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    {rec}
                                  </Typography>
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      color: 'text.secondary',
                                      fontStyle: 'italic'
                                    }}
                                  >
                                    Priority: {getRecommendationPriority(rec)}
                                  </Typography>
                                </Box>
                              } 
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" color="primary" gutterBottom>
                        Behavioral Recommendations:
                      </Typography>
                      <List>
                        {mockData.comprehensiveReport.recommendations.behavioral.map((rec, index) => (
                          <ListItem key={index}>
                            <ListItemAvatar>
                              <CheckCircleIcon 
                                sx={{ 
                                  color: getRecommendationPriorityColor(rec, index) 
                                }} 
                              />
                            </ListItemAvatar>
                            <ListItemText 
                              primary={
                                <Box>
                                  <Typography 
                                    variant="body1" 
                                    sx={{ 
                                      color: getRecommendationPriorityColor(rec, index),
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    {rec}
                                  </Typography>
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      color: 'text.secondary',
                                      fontStyle: 'italic'
                                    }}
                                  >
                                    Priority: {getRecommendationPriority(rec)}
                                  </Typography>
                                </Box>
                              } 
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Divider sx={{ mb: 3 }} />

              {/* General Remarks */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    General Remarks:
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" color="primary" gutterBottom>
                        Class Teacher:
                      </Typography>
                      <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                        {mockData.comprehensiveReport.generalRemarks.classTeacher}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" color="primary" gutterBottom>
                        Principal:
                      </Typography>
                      <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                        {mockData.comprehensiveReport.generalRemarks.principal}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Divider sx={{ mb: 3 }} />

              {/* Signatures */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Signatures:
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Class Teacher:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {mockData.comprehensiveReport.signatures.classTeacher}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Parent/Guardian:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {mockData.comprehensiveReport.signatures.parentGuardian}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Principal:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {mockData.comprehensiveReport.signatures.principal}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Date:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {mockData.comprehensiveReport.signatures.date}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
                <Button
                  variant="contained"
                  startIcon={<PrintIcon />}
                  onClick={() => window.print()}
                >
                  Print Report
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => {
                    // Generate PDF using browser print functionality
                    const printContent = `
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <title>Comprehensive Progress Report</title>
                        <style>
                          body { font-family: Arial, sans-serif; margin: 20px; }
                          .header { text-align: center; margin-bottom: 30px; }
                          .section { margin-bottom: 20px; }
                          .section h3 { color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 5px; }
                          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; }
                          .info-item { margin: 5px 0; }
                          .label { font-weight: bold; color: #666; }
                          .value { font-weight: bold; }
                          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                          th { background-color: #f5f5f5; font-weight: bold; }
                          .grade { padding: 2px 8px; border-radius: 3px; font-size: 12px; }
                          .grade-A { background-color: #4caf50; color: white; }
                          .grade-B { background-color: #ff9800; color: white; }
                          .grade-C { background-color: #f44336; color: white; }
                          .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 30px; }
                          .signature-item { text-align: center; }
                          @media print {
                            body { margin: 0; }
                            .no-print { display: none; }
                          }
                        </style>
                      </head>
                      <body>
                        <div class="header">
                          <h1>COMPREHENSIVE PROGRESS REPORT</h1>
                          <p>Academic Year: ${mockData.comprehensiveReport.schoolInfo.academicYear}</p>
                        </div>

                        <div class="section">
                          <h3>School Information</h3>
                          <div class="info-grid">
                            <div class="info-item">
                              <span class="label">School Name:</span>
                              <span class="value">${mockData.comprehensiveReport.schoolInfo.schoolName}</span>
                            </div>
                            <div class="info-item">
                              <span class="label">Class:</span>
                              <span class="value">${mockData.comprehensiveReport.schoolInfo.class}</span>
                            </div>
                            <div class="info-item">
                              <span class="label">Term:</span>
                              <span class="value">${mockData.comprehensiveReport.schoolInfo.term}</span>
                            </div>
                            <div class="info-item">
                              <span class="label">Report Date:</span>
                              <span class="value">${mockData.comprehensiveReport.schoolInfo.reportDate}</span>
                            </div>
                          </div>
                        </div>

                        <div class="section">
                          <h3>Student Information</h3>
                          <div class="info-grid">
                            <div class="info-item">
                              <span class="label">Name:</span>
                              <span class="value">${user?.name || mockData.comprehensiveReport.studentInfo.name}</span>
                            </div>
                            <div class="info-item">
                              <span class="label">Admission Number:</span>
                              <span class="value">${mockData.comprehensiveReport.studentInfo.admissionNumber}</span>
                            </div>
                            <div class="info-item">
                              <span class="label">Class/Section:</span>
                              <span class="value">${mockData.comprehensiveReport.studentInfo.classSection}</span>
                            </div>
                            <div class="info-item">
                              <span class="label">Class Teacher:</span>
                              <span class="value">${mockData.comprehensiveReport.studentInfo.classTeacher}</span>
                            </div>
                          </div>
                        </div>

                        <div class="section">
                          <h3>Academic Performance</h3>
                          <table>
                            <thead>
                              <tr>
                                <th>Subject</th>
                                <th>Marks Obtained</th>
                                <th>Maximum Marks</th>
                                <th>Grade</th>
                                <th>Teacher's Remarks</th>
                              </tr>
                            </thead>
                            <tbody>
                              ${mockData.comprehensiveReport.academicPerformance.subjects.map(subject => `
                                <tr>
                                  <td>${subject.name}</td>
                                  <td>${subject.marks}</td>
                                  <td>${subject.totalMarks}</td>
                                  <td><span class="grade grade-${subject.grade.charAt(0)}">${subject.grade}</span></td>
                                  <td>${subject.teacherRemarks}</td>
                                </tr>
                              `).join('')}
                            </tbody>
                          </table>
                        </div>

                        <div class="section">
                          <h3>Co-Scholastic Areas</h3>
                          <table>
                            <thead>
                              <tr>
                                <th>Area</th>
                                <th>Grade</th>
                                <th>Teacher's Comments</th>
                              </tr>
                            </thead>
                            <tbody>
                              ${mockData.comprehensiveReport.coScholasticAreas.map(area => `
                                <tr>
                                  <td>${area.area}</td>
                                  <td><span class="grade grade-${area.grade.charAt(0)}">${area.grade}</span></td>
                                  <td>${area.teacherComments}</td>
                                </tr>
                              `).join('')}
                            </tbody>
                          </table>
                        </div>

                        <div class="section">
                          <h3>Attendance Summary</h3>
                          <div class="info-grid">
                            <div class="info-item">
                              <span class="label">Total Working Days:</span>
                              <span class="value">${mockData.comprehensiveReport.attendance.totalDays}</span>
                            </div>
                            <div class="info-item">
                              <span class="label">Days Present:</span>
                              <span class="value">${mockData.comprehensiveReport.attendance.daysPresent}</span>
                            </div>
                            <div class="info-item">
                              <span class="label">Days Absent:</span>
                              <span class="value">${mockData.comprehensiveReport.attendance.daysAbsent}</span>
                            </div>
                            <div class="info-item">
                              <span class="label">Attendance Percentage:</span>
                              <span class="value">${mockData.comprehensiveReport.attendance.percentage}%</span>
                            </div>
                          </div>
                        </div>

                        <div class="section">
                          <h3>General Remarks</h3>
                          <div class="info-grid">
                            <div class="info-item">
                              <span class="label">Class Teacher:</span>
                              <span class="value">${mockData.comprehensiveReport.generalRemarks.classTeacher}</span>
                            </div>
                            <div class="info-item">
                              <span class="label">Principal:</span>
                              <span class="value">${mockData.comprehensiveReport.generalRemarks.principal}</span>
                            </div>
                          </div>
                        </div>

                        <div class="section">
                          <h3>Signatures</h3>
                          <div class="signatures">
                            <div class="signature-item">
                              <div class="label">Class Teacher</div>
                              <div class="value">${mockData.comprehensiveReport.signatures.classTeacher}</div>
                            </div>
                            <div class="signature-item">
                              <div class="label">Parent/Guardian</div>
                              <div class="value">${mockData.comprehensiveReport.signatures.parentGuardian}</div>
                            </div>
                            <div class="signature-item">
                              <div class="label">Principal</div>
                              <div class="value">${mockData.comprehensiveReport.signatures.principal}</div>
                            </div>
                          </div>
                          <div style="text-align: center; margin-top: 10px;">
                            <span class="label">Date: </span>
                            <span class="value">${mockData.comprehensiveReport.signatures.date}</span>
                          </div>
                        </div>
                      </body>
                      </html>
                    `;

                    const printWindow = window.open('', '_blank');
                    printWindow.document.write(printContent);
                    printWindow.document.close();
                    
                    // Wait for content to load then print
                    printWindow.onload = function() {
                      printWindow.print();
                      printWindow.close();
                    };
                    
                    toast.success('PDF generation started! Check your print dialog.');
                  }}
                >
                  Download PDF
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CommentIcon />}
                  onClick={() => setFeedbackDialog(true)}
                >
                  Submit Feedback
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialog} onClose={() => setFeedbackDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Submit Feedback</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Please share your thoughts about your progress report.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Feedback"
            placeholder="Enter your comments, suggestions, or questions..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialog(false)}>Cancel</Button>
          <Button onClick={handleFeedbackSubmit} variant="contained" startIcon={<SendIcon />}>
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OverallProgress; 