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
  const [expandedPanel, setExpandedPanel] = useState('panel1');
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [feedback, setFeedback] = useState('');
  const { user } = useAuth();

  // Mock data for demonstration - in real implementation, this would come from API
  const mockReportData = {
    schoolInfo: {
      schoolName: "EDULIVES School",
      academicYear: "2024-2025",
      class: "Class 10",
      term: "First Term",
      reportDate: new Date().toLocaleDateString()
    },
    studentInfo: {
      name: user?.name || "Student Name",
      admissionNumber: "ADM2024001",
      dateOfBirth: "15/03/2008",
      classSection: "Class 10-A",
      classTeacher: "Mrs. Sarah Johnson"
    },
    academicPerformance: [
      {
        subject: "English",
        marksObtained: 85,
        maximumMarks: 100,
        grade: "A",
        teacherRemarks: "Excellent performance in literature and grammar"
      },
      {
        subject: "Mathematics",
        marksObtained: 92,
        maximumMarks: 100,
        grade: "A+",
        teacherRemarks: "Outstanding problem-solving skills"
      },
      {
        subject: "Science",
        marksObtained: 88,
        maximumMarks: 100,
        grade: "A",
        teacherRemarks: "Good understanding of scientific concepts"
      },
      {
        subject: "Social Studies",
        marksObtained: 78,
        maximumMarks: 100,
        grade: "B+",
        teacherRemarks: "Good knowledge of historical events"
      },
      {
        subject: "Computer Science",
        marksObtained: 95,
        maximumMarks: 100,
        grade: "A+",
        teacherRemarks: "Excellent programming skills"
      }
    ],
    coScholasticAreas: [
      {
        area: "Work Habits",
        grade: "A",
        teacherComments: "Consistently completes assignments on time"
      },
      {
        area: "Communication Skills",
        grade: "A",
        teacherComments: "Excellent verbal and written communication"
      },
      {
        area: "Teamwork & Leadership",
        grade: "B+",
        teacherComments: "Good team player, shows leadership potential"
      },
      {
        area: "Discipline",
        grade: "A",
        teacherComments: "Maintains excellent classroom behavior"
      },
      {
        area: "Creativity",
        grade: "A",
        teacherComments: "Shows creative thinking in projects"
      },
      {
        area: "Participation in Activities",
        grade: "A",
        teacherComments: "Actively participates in school activities"
      }
    ],
    attendance: {
      totalWorkingDays: 120,
      daysPresent: 115,
      absentDays: 5,
      attendancePercentage: 95.8
    },
    generalRemarks: {
      classTeacher: "Student shows excellent academic progress and maintains good attendance. Demonstrates strong leadership qualities and active participation in extracurricular activities.",
      principal: "Outstanding performance throughout the term. Continue to maintain this level of excellence."
    }
  };

  useEffect(() => {
    fetchComprehensiveReports();
  }, []);

  const fetchComprehensiveReports = async () => {
    try {
      setLoading(true);
      // In real implementation, this would fetch from API
      // const response = await studentAPI.getComprehensiveReports();
      // setReports(response.data);
      
      // For now, use mock data
      setReports([mockReportData]);
      setSelectedReport(mockReportData);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load progress reports');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  const handleFeedbackSubmit = async () => {
    try {
      // In real implementation, this would submit to API
      // await studentAPI.submitFeedback({ reportId: selectedReport.id, feedback });
      toast.success('Feedback submitted successfully');
      setFeedbackDialog(false);
      setFeedback('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    }
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? <TrendingUpIcon color="success" /> : <TrendingDownIcon color="error" />;
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+': return 'success';
      case 'A': return 'success';
      case 'B+': return 'warning';
      case 'B': return 'warning';
      case 'C': return 'error';
      default: return 'default';
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 90) return 'success';
    if (rating >= 80) return 'warning';
    return 'error';
  };

  const getRatingScore = (rating) => {
    return `${rating}%`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          STUDENT PROGRESS REPORT TEMPLATE
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
                {selectedReport?.schoolInfo?.schoolName}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">Academic Year:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {selectedReport?.schoolInfo?.academicYear}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">Class / Grade:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {selectedReport?.schoolInfo?.class}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">Term:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {selectedReport?.schoolInfo?.term}
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
                {selectedReport?.studentInfo?.name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">Admission Number:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {selectedReport?.studentInfo?.admissionNumber}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">Date of Birth:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {selectedReport?.studentInfo?.dateOfBirth}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">Class/Section:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {selectedReport?.studentInfo?.classSection}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">Class Teacher:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {selectedReport?.studentInfo?.classTeacher}
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
                {selectedReport?.academicPerformance?.map((subject, index) => (
                  <TableRow key={index}>
                    <TableCell>{subject.subject}</TableCell>
                    <TableCell>{subject.marksObtained}</TableCell>
                    <TableCell>{subject.maximumMarks}</TableCell>
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
                {selectedReport?.coScholasticAreas?.map((area, index) => (
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
                {selectedReport?.attendance?.totalWorkingDays}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">Days Present:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {selectedReport?.attendance?.daysPresent}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">Absent Days:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {selectedReport?.attendance?.absentDays}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">Attendance Percentage:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: getRatingColor(selectedReport?.attendance?.attendancePercentage) }}>
                {selectedReport?.attendance?.attendancePercentage}%
              </Typography>
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
              <Typography variant="body2" color="textSecondary" gutterBottom>Class Teacher:</Typography>
              <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                {selectedReport?.generalRemarks?.classTeacher}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary" gutterBottom>Principal:</Typography>
              <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                {selectedReport?.generalRemarks?.principal}
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
            // Download functionality
            toast.info('Download feature coming soon');
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

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialog} onClose={() => setFeedbackDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Submit Feedback</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialog(false)}>Cancel</Button>
          <Button onClick={handleFeedbackSubmit} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComprehensiveProgressTemplate; 