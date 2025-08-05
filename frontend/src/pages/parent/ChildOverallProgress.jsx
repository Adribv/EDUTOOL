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
import { parentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const ChildOverallProgress = () => {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
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
        name: 'John Doe',
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
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      // Try to fetch from API first
      try {
        const response = await parentAPI.getChildren();
        setChildren(response.data || []);
        if (response.data && response.data.length > 0) {
          setSelectedChild(response.data[0]._id);
        }
      } catch (apiError) {
        console.error('API Error:', apiError);
        // Fallback to mock data if API fails
        const mockChildren = [
          {
            _id: 'child1',
            name: 'John Doe',
            class: '10',
            section: 'A',
            rollNumber: 'STU2024001',
            admissionNumber: 'ADM2024001'
          },
          {
            _id: 'child2',
            name: 'Jane Doe',
            class: '8',
            section: 'B',
            rollNumber: 'STU2024002',
            admissionNumber: 'ADM2024002'
          },
          {
            _id: 'child3',
            name: 'Mike Smith',
            class: '12',
            section: 'C',
            rollNumber: 'STU2024003',
            admissionNumber: 'ADM2024003'
          }
        ];
        setChildren(mockChildren);
        if (mockChildren.length > 0) {
          setSelectedChild(mockChildren[0]._id);
        }
        toast.info('Displaying sample children data. API integration in progress.');
      }
    } catch (error) {
      console.error('Error fetching children:', error);
      toast.error('Failed to load children information');
    } finally {
      setLoading(false);
    }
  };

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
      case 'Stable':
        return <TimelineIcon color="info" />;
      default:
        return <TimelineIcon color="action" />;
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'success';
      case 'B+':
      case 'B':
        return 'warning';
      case 'C':
      case 'D':
        return 'error';
      default:
        return 'default';
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

  const selectedChildData = children.find(child => child._id === selectedChild);

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4, textAlign: 'center', backgroundColor: '#f8fafc', p: 3, borderRadius: 2, border: '1px solid #e2e8f0' }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: '#1e3a8a', mb: 1 }}>
          📊 Child Progress Reports
        </Typography>
        <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 500 }}>
          Monitor your children's academic performance and overall development
        </Typography>
      </Box>

      {/* Child Selection */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2, color: 'primary.main' }}>
          Select Child for Progress Report
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <FormControl fullWidth>
              <InputLabel>Select Child</InputLabel>
              <Select
                value={selectedChild || ''}
                label="Select Child"
                onChange={(e) => setSelectedChild(e.target.value)}
                sx={{ minHeight: 56 }}
              >
                {children.map((child) => (
                  <MenuItem key={child._id} value={child._id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 32, height: 32 }}>
                        {child.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {child.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Class {child.class} {child.section} | Roll No: {child.rollNumber}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Assessment Period</InputLabel>
              <Select
                value={selectedPeriod}
                label="Assessment Period"
                onChange={(e) => setSelectedPeriod(e.target.value)}
                sx={{ minHeight: 56 }}
              >
                <MenuItem value="current">Current Period</MenuItem>
                <MenuItem value="Monthly">Monthly</MenuItem>
                <MenuItem value="Quarterly">Quarterly</MenuItem>
                <MenuItem value="Half-Yearly">Half-Yearly</MenuItem>
                <MenuItem value="Annual">Annual</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        {/* Children Summary Cards */}
        {children.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
              All Your Children:
            </Typography>
            <Grid container spacing={2}>
              {children.map((child) => (
                <Grid item xs={12} sm={6} md={4} key={child._id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedChild === child._id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                      backgroundColor: selectedChild === child._id ? '#f3f6ff' : 'white',
                      '&:hover': {
                        borderColor: '#1976d2',
                        backgroundColor: '#f3f6ff'
                      }
                    }}
                    onClick={() => setSelectedChild(child._id)}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: 'primary.main', width: 48, height: 48 }}>
                        {child.name.charAt(0)}
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {child.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Class {child.class} {child.section}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Roll No: {child.rollNumber}
                      </Typography>
                      {selectedChild === child._id && (
                        <Chip 
                          label="Selected" 
                          color="primary" 
                          size="small" 
                          sx={{ mt: 1 }}
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>

      {/* Child Info Card */}
      {selectedChildData ? (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                {selectedChildData.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6">{selectedChildData.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Class {selectedChildData.class} {selectedChildData.section} | 
                  Roll No: {selectedChildData.rollNumber}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          Please select a child to view their progress report.
        </Alert>
      )}

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
          {selectedTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Subject-wise Performance
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Subject</TableCell>
                      <TableCell>Grade</TableCell>
                      <TableCell>Percentage</TableCell>
                      <TableCell>Improvement</TableCell>
                      <TableCell>Remarks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockData.academicPerformance.subjects.map((subject, index) => (
                      <TableRow key={index}>
                        <TableCell>{subject.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={subject.grade}
                            color={getGradeColor(subject.grade)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{subject.percentage}%</TableCell>
                        <TableCell>
                          <Chip
                            label={subject.improvement}
                            color={getRatingColor(subject.improvement)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{subject.teacherRemarks || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {selectedTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Attendance Details
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Total Days"
                      secondary={mockData.attendance.totalDays}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Days Present"
                      secondary={mockData.attendance.daysPresent}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Days Absent"
                      secondary={mockData.attendance.daysAbsent}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Late Arrivals"
                      secondary={mockData.attendance.lateArrivals}
                    />
                  </ListItem>
                </List>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Behavior Assessment
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Punctuality"
                      secondary={
                        <Chip
                          label={mockData.behavior.punctuality}
                          color={getRatingColor(mockData.behavior.punctuality)}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Discipline"
                      secondary={
                        <Chip
                          label={mockData.behavior.discipline}
                          color={getRatingColor(mockData.behavior.discipline)}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Participation"
                      secondary={
                        <Chip
                          label={mockData.behavior.participation}
                          color={getRatingColor(mockData.behavior.participation)}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Teamwork"
                      secondary={
                        <Chip
                          label={mockData.behavior.teamwork}
                          color={getRatingColor(mockData.behavior.teamwork)}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          )}

          {selectedTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Skills Assessment
                </Typography>
                <Box sx={{ mb: 3 }}>
                  {Object.entries(mockData.skills || {}).map(([skill, rating]) => (
                    <Box key={skill} sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                          {skill.replace(/([A-Z])/g, ' $1').trim()}
                        </Typography>
                        <Rating
                          value={getRatingScore(rating)}
                          readOnly
                          size="small"
                        />
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={getRatingScore(rating) * 20}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Co-Curricular Activities
                </Typography>
                <Accordion expanded={expandedAccordion === 'panel1'} onChange={handleAccordionChange('panel1')}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display="flex" alignItems="center">
                      <SportsIcon color="primary" sx={{ mr: 1 }} />
                      <Typography>Sports</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Participation"
                          secondary={mockData.coCurricular.sports.participated ? 'Yes' : 'No'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Achievements"
                          secondary={mockData.coCurricular.sports.achievements.join(', ')}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Rating"
                          secondary={
                            <Chip
                              label={mockData.coCurricular.sports.rating}
                              color={getRatingColor(mockData.coCurricular.sports.rating)}
                              size="small"
                            />
                          }
                        />
                      </ListItem>
                    </List>
                  </AccordionDetails>
                </Accordion>

                <Accordion expanded={expandedAccordion === 'panel2'} onChange={handleAccordionChange('panel2')}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display="flex" alignItems="center">
                      <MusicIcon color="primary" sx={{ mr: 1 }} />
                      <Typography>Cultural Activities</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Participation"
                          secondary={mockData.coCurricular.cultural.participated ? 'Yes' : 'No'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Achievements"
                          secondary={mockData.coCurricular.cultural.achievements.join(', ')}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Rating"
                          secondary={
                            <Chip
                              label={mockData.coCurricular.cultural.rating}
                              color={getRatingColor(mockData.coCurricular.cultural.rating)}
                              size="small"
                            />
                          }
                        />
                      </ListItem>
                    </List>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </Grid>
          )}

          {selectedTab === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Academic Trends
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { month: 'Jan', performance: 75 },
                    { month: 'Feb', performance: 78 },
                    { month: 'Mar', performance: 82 },
                    { month: 'Apr', performance: 85 },
                    { month: 'May', performance: 88 },
                    { month: 'Jun', performance: 85 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="performance" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Attendance Trends
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { month: 'Jan', attendance: 92 },
                    { month: 'Feb', attendance: 94 },
                    { month: 'Mar', attendance: 91 },
                    { month: 'Apr', attendance: 95 },
                    { month: 'May', attendance: 93 },
                    { month: 'Jun', attendance: 95 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="attendance" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          )}

          {selectedTab === 4 && (
            <Box>
              <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', color: '#1976d2', mb: 4 }}>
                COMPREHENSIVE PROGRESS REPORT
              </Typography>

              {/* School Information */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    School Information:
                  </Typography>
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
                        {selectedChildData ? selectedChildData.name : mockData.comprehensiveReport.studentInfo.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Admission Number:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {selectedChildData ? selectedChildData.rollNumber : mockData.comprehensiveReport.studentInfo.admissionNumber}
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
                        {selectedChildData ? `${selectedChildData.class}-${selectedChildData.section}` : mockData.comprehensiveReport.studentInfo.classSection}
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
                            <TableCell>{subject.teacherRemarks || 'N/A'}</TableCell>
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
                    {mockData.comprehensiveReport.recommendations.academic.length > 0 && (
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
                    )}
                    {mockData.comprehensiveReport.recommendations.behavioral.length > 0 && (
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
                    )}
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
                              <span class="value">${selectedChildData ? selectedChildData.name : mockData.comprehensiveReport.studentInfo.name}</span>
                            </div>
                            <div class="info-item">
                              <span class="label">Admission Number:</span>
                              <span class="value">${selectedChildData ? selectedChildData.rollNumber : mockData.comprehensiveReport.studentInfo.admissionNumber}</span>
                            </div>
                            <div class="info-item">
                              <span class="label">Class/Section:</span>
                              <span class="value">${selectedChildData ? `${selectedChildData.class}-${selectedChildData.section}` : mockData.comprehensiveReport.studentInfo.classSection}</span>
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
            Please share your thoughts about the progress report for {selectedChildData ? selectedChildData.name : 'your child'}.
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

export default ChildOverallProgress; 