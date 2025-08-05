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
              <Box display="flex" alignItems="center">
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
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
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
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
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
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
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
          {selectedTab === 4 && (
            <Box>
              {/* Header */}
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  COMPREHENSIVE PROGRESS REPORT
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Box>

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
                          Academic Progress: {mockData.comprehensiveReport.trends.academicProgress}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box display="flex" alignItems="center">
                        <SchoolIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body1">
                          Attendance: {mockData.comprehensiveReport.trends.attendanceTrend}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box display="flex" alignItems="center">
                        <PersonIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body1">
                          Behavior: {mockData.comprehensiveReport.trends.behaviorTrend}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box display="flex" alignItems="center">
                        <AssessmentIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body1">
                          Assignments: {mockData.comprehensiveReport.trends.assignmentTrend}
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
                              <CheckCircleIcon color="primary" />
                            </ListItemAvatar>
                            <ListItemText primary={rec} />
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
                              <CheckCircleIcon color="primary" />
                            </ListItemAvatar>
                            <ListItemText primary={rec} />
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
                    // Generate and download PDF
                    const element = document.createElement('a');
                    const file = new Blob([`
                      COMPREHENSIVE PROGRESS REPORT
                      
                      School Information:
                      School Name: ${mockData.comprehensiveReport.schoolInfo.schoolName}
                      Academic Year: ${mockData.comprehensiveReport.schoolInfo.academicYear}
                      Class: ${mockData.comprehensiveReport.schoolInfo.class}
                      Term: ${mockData.comprehensiveReport.schoolInfo.term}
                      
                      Student Information:
                      Name: ${user?.name || mockData.comprehensiveReport.studentInfo.name}
                      Admission Number: ${mockData.comprehensiveReport.studentInfo.admissionNumber}
                      Class/Section: ${mockData.comprehensiveReport.studentInfo.classSection}
                      
                      Academic Performance:
                      ${mockData.comprehensiveReport.academicPerformance.subjects.map(subject => 
                        `${subject.name}: ${subject.marks}/${subject.totalMarks} (${subject.grade}) - ${subject.teacherRemarks}`
                      ).join('\n')}
                      
                      Co-Scholastic Areas:
                      ${mockData.comprehensiveReport.coScholasticAreas.map(area => 
                        `${area.area}: ${area.grade} - ${area.teacherComments}`
                      ).join('\n')}
                      
                      Attendance: ${mockData.comprehensiveReport.attendance.percentage}%
                      Total Days: ${mockData.comprehensiveReport.attendance.totalDays}
                      Days Present: ${mockData.comprehensiveReport.attendance.daysPresent}
                      Days Absent: ${mockData.comprehensiveReport.attendance.daysAbsent}
                      
                      General Remarks:
                      Class Teacher: ${mockData.comprehensiveReport.generalRemarks.classTeacher}
                      Principal: ${mockData.comprehensiveReport.generalRemarks.principal}
                      
                      Signatures:
                      Class Teacher: ${mockData.comprehensiveReport.signatures.classTeacher}
                      Parent/Guardian: ${mockData.comprehensiveReport.signatures.parentGuardian}
                      Principal: ${mockData.comprehensiveReport.signatures.principal}
                      Date: ${mockData.comprehensiveReport.signatures.date}
                    `], {type: 'text/plain'});
                    element.href = URL.createObjectURL(file);
                    element.download = `Progress_Report_${user?.name || 'Student'}.txt`;
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                    toast.success('Progress report downloaded successfully!');
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