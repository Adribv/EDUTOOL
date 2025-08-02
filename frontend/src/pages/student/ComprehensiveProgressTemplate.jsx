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
  Payment as PaymentIcon,
  HealthAndSafety as HealthIcon,
  Assignment as AssignmentIcon,
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

const ComprehensiveProgressTemplate = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [selectedTab, setSelectedTab] = useState(0);
  const [expandedAccordion, setExpandedAccordion] = useState('panel1');
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [feedback, setFeedback] = useState({ studentComments: '' });
  const { user } = useAuth();

  useEffect(() => {
    fetchComprehensiveReports();
  }, [selectedPeriod]);

  const fetchComprehensiveReports = async () => {
    try {
      setLoading(true);
      const params = { academicYear: '2024-25' };
      if (selectedPeriod !== 'current') {
        params.reportPeriod = selectedPeriod;
      }

      const response = await studentAPI.getMyComprehensiveReport(params);
      setReports(response.data || []);
      if (response.data && response.data.length > 0) {
        setSelectedReport(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching comprehensive reports:', error);
      toast.error('Failed to load comprehensive reports');
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

  const handleFeedbackSubmit = async () => {
    try {
      await studentAPI.submitComprehensiveFeedback(selectedReport._id, feedback);
      toast.success('Feedback submitted successfully');
      setFeedbackDialog(false);
      setFeedback({ studentComments: '' });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    }
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!selectedReport) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          No comprehensive progress reports available. Please check back later or contact your teacher.
        </Alert>
      </Box>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Comprehensive Progress Report
      </Typography>

      {/* Report Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {user?.name?.charAt(0) || 'S'}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h6">{user?.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                Class {selectedReport.class} {selectedReport.section} | 
                Roll No: {selectedReport.studentId?.rollNumber}
              </Typography>
            </Grid>
            <Grid item>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={() => window.print()}
                >
                  Print
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => {/* Download functionality */}}
                >
                  Download
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CommentIcon />}
                  onClick={() => setFeedbackDialog(true)}
                >
                  Feedback
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Period Selection */}
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Report Period</InputLabel>
          <Select
            value={selectedPeriod}
            label="Report Period"
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
                    {selectedReport.examPerformance?.averageScore || 0}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Average Exam Score
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
                    {selectedReport.attendance?.percentage || 0}%
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
                <AssignmentIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {selectedReport.assignmentPerformance?.averageScore || 0}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Assignment Average
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
                    {selectedReport.behavior?.overallRating || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Behavior Rating
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Report Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Academic Performance" />
          <Tab label="Attendance & Assignments" />
          <Tab label="Behavior & Activities" />
          <Tab label="Health & Fees" />
          <Tab label="Analytics & Trends" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {selectedTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Exam Performance
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Exam</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell>Percentage</TableCell>
                      <TableCell>Grade</TableCell>
                      <TableCell>Rank</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedReport.examPerformance?.exams?.map((exam, index) => (
                      <TableRow key={index}>
                        <TableCell>{exam.examName}</TableCell>
                        <TableCell>{exam.subject}</TableCell>
                        <TableCell>{exam.score}/{exam.maxScore}</TableCell>
                        <TableCell>{exam.percentage}%</TableCell>
                        <TableCell>
                          <Chip
                            label={exam.grade}
                            color={getGradeColor(exam.grade)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{exam.rank || 'N/A'}</TableCell>
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
                      secondary={selectedReport.attendance?.totalDays || 0}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Days Present"
                      secondary={selectedReport.attendance?.daysPresent || 0}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Days Absent"
                      secondary={selectedReport.attendance?.daysAbsent || 0}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Late Arrivals"
                      secondary={selectedReport.attendance?.lateArrivals || 0}
                    />
                  </ListItem>
                </List>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Assignment Performance
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Total Assignments"
                      secondary={selectedReport.assignmentPerformance?.totalAssignments || 0}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Submitted"
                      secondary={selectedReport.assignmentPerformance?.submittedAssignments || 0}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Pending"
                      secondary={selectedReport.assignmentPerformance?.pendingAssignments || 0}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Average Score"
                      secondary={`${selectedReport.assignmentPerformance?.averageScore || 0}%`}
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
                  Behavior Assessment
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Overall Rating"
                      secondary={
                        <Chip
                          label={selectedReport.behavior?.overallRating}
                          color={getRatingColor(selectedReport.behavior?.overallRating)}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Punctuality"
                      secondary={
                        <Chip
                          label={selectedReport.behavior?.punctuality}
                          color={getRatingColor(selectedReport.behavior?.punctuality)}
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
                          label={selectedReport.behavior?.discipline}
                          color={getRatingColor(selectedReport.behavior?.discipline)}
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
                          label={selectedReport.behavior?.participation}
                          color={getRatingColor(selectedReport.behavior?.participation)}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                </List>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Co-curricular Activities
                </Typography>
                <Accordion expanded={expandedAccordion === 'panel1'} onChange={handleAccordionChange('panel1')}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <SportsIcon sx={{ mr: 1 }} />
                    <Typography>Sports</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      <Typography variant="body2">
                        Participated: {selectedReport.coCurricular?.sports?.participated ? 'Yes' : 'No'}
                      </Typography>
                      {selectedReport.coCurricular?.sports?.achievements?.length > 0 && (
                        <Typography variant="body2">
                          Achievements: {selectedReport.coCurricular.sports.achievements.join(', ')}
                        </Typography>
                      )}
                      <Chip
                        label={selectedReport.coCurricular?.sports?.rating}
                        color={getRatingColor(selectedReport.coCurricular?.sports?.rating)}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </AccordionDetails>
                </Accordion>

                <Accordion expanded={expandedAccordion === 'panel2'} onChange={handleAccordionChange('panel2')}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <MusicIcon sx={{ mr: 1 }} />
                    <Typography>Cultural</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      <Typography variant="body2">
                        Participated: {selectedReport.coCurricular?.cultural?.participated ? 'Yes' : 'No'}
                      </Typography>
                      {selectedReport.coCurricular?.cultural?.achievements?.length > 0 && (
                        <Typography variant="body2">
                          Achievements: {selectedReport.coCurricular.cultural.achievements.join(', ')}
                        </Typography>
                      )}
                      <Chip
                        label={selectedReport.coCurricular?.cultural?.rating}
                        color={getRatingColor(selectedReport.coCurricular?.cultural?.rating)}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </Grid>
          )}

          {selectedTab === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Health Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Height"
                      secondary={`${selectedReport.healthInfo?.height || 0} cm`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Weight"
                      secondary={`${selectedReport.healthInfo?.weight || 0} kg`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="BMI"
                      secondary={selectedReport.healthInfo?.bmi || 0}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Blood Group"
                      secondary={selectedReport.healthInfo?.bloodGroup || 'Unknown'}
                    />
                  </ListItem>
                </List>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Fee Status
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Total Fees"
                      secondary={`₹${selectedReport.feeStatus?.totalFees?.toLocaleString() || 0}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Paid Amount"
                      secondary={`₹${selectedReport.feeStatus?.paidAmount?.toLocaleString() || 0}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Pending Amount"
                      secondary={`₹${selectedReport.feeStatus?.pendingAmount?.toLocaleString() || 0}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Payment Status"
                      secondary={
                        <Chip
                          label={selectedReport.feeStatus?.paymentStatus}
                          color={selectedReport.feeStatus?.paymentStatus === 'Paid' ? 'success' : 'warning'}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          )}

          {selectedTab === 4 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Progress Trends
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                    {getTrendIcon(selectedReport.trends?.academicProgress)}
                    <Typography variant="body1" sx={{ ml: 1 }}>
                      Academic Progress: {selectedReport.trends?.academicProgress}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                    {getTrendIcon(selectedReport.trends?.attendanceTrend)}
                    <Typography variant="body1" sx={{ ml: 1 }}>
                      Attendance: {selectedReport.trends?.attendanceTrend}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                    {getTrendIcon(selectedReport.trends?.behaviorTrend)}
                    <Typography variant="body1" sx={{ ml: 1 }}>
                      Behavior: {selectedReport.trends?.behaviorTrend}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    {getTrendIcon(selectedReport.trends?.assignmentTrend)}
                    <Typography variant="body1" sx={{ ml: 1 }}>
                      Assignments: {selectedReport.trends?.assignmentTrend}
                    </Typography>
                  </Box>
                </Box>

                {selectedReport.recommendations && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Recommendations
                    </Typography>
                    <List>
                      {selectedReport.recommendations.academic?.map((recommendation, index) => (
                        <ListItem key={index}>
                          <ListItemAvatar>
                            <CheckCircleIcon color="primary" />
                          </ListItemAvatar>
                          <ListItemText primary={recommendation} />
                        </ListItem>
                      ))}
                      {selectedReport.recommendations.behavioral?.map((recommendation, index) => (
                        <ListItem key={`behavioral-${index}`}>
                          <ListItemAvatar>
                            <CheckCircleIcon color="primary" />
                          </ListItemAvatar>
                          <ListItemText primary={recommendation} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Data Sources
                </Typography>
                <List>
                  {Object.entries(selectedReport.dataSources || {}).map(([source, data]) => (
                    <ListItem key={source}>
                      <ListItemText
                        primary={source.charAt(0).toUpperCase() + source.slice(1)}
                        secondary={`${data.source} - Last updated: ${new Date(data.lastUpdated).toLocaleDateString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          )}
        </Box>
      </Paper>

      {/* Report Footer */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Report Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="textSecondary">
                Report Period: {selectedReport.reportPeriod}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="textSecondary">
                Generated Date: {new Date(selectedReport.generatedDate).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="textSecondary">
                Generated By: {selectedReport.generatedBy?.name || 'System'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialog} onClose={() => setFeedbackDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Submit Feedback</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Student Comments"
            value={feedback.studentComments}
            onChange={(e) => setFeedback({ ...feedback, studentComments: e.target.value })}
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

export default ComprehensiveProgressTemplate; 