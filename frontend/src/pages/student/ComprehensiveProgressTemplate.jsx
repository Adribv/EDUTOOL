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
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  Comment as CommentIcon,
  Send as SendIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { studentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const ComprehensiveProgressTemplate = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [feedback, setFeedback] = useState('');
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
      console.error('Error fetching reports:', error);
      toast.error('Failed to load progress reports');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    try {
      await studentAPI.submitComprehensiveFeedback(selectedReport._id, { studentComments: feedback });
      toast.success('Feedback submitted successfully');
      setFeedbackDialog(false);
      setFeedback('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    }
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
          COMPREHENSIVE PROGRESS REPORT
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Box>

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

      {selectedReport ? (
        <>
          {/* Report Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="textSecondary">School Name:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {selectedReport.schoolInfo?.schoolName || 'EDULIVES School'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="textSecondary">Academic Year:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {selectedReport.schoolInfo?.academicYear || selectedReport.academicYear}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="textSecondary">Class / Grade:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {selectedReport.schoolInfo?.class || selectedReport.class}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="textSecondary">Term:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {selectedReport.schoolInfo?.term || selectedReport.reportPeriod}
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
                    {selectedReport.studentInfo?.name || user?.name || 'Student Name'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="textSecondary">Admission Number:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {selectedReport.studentInfo?.admissionNumber || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="textSecondary">Date of Birth:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {selectedReport.studentInfo?.dateOfBirth || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="textSecondary">Class/Section:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {selectedReport.studentInfo?.classSection || `${selectedReport.class}-${selectedReport.section}`}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="textSecondary">Class Teacher:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {selectedReport.studentInfo?.classTeacher || 'Not Assigned'}
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
                    {selectedReport.academicPerformance?.subjects?.map((subject, index) => (
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
                    )) || (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No academic performance data available
                        </TableCell>
                      </TableRow>
                    )}
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
                    {selectedReport.coScholasticAreas?.map((area, index) => (
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
                    )) || (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          No co-scholastic data available
                        </TableCell>
                      </TableRow>
                    )}
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
                    {selectedReport.attendance?.totalDays || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="textSecondary">Days Present:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {selectedReport.attendance?.daysPresent || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="textSecondary">Absent Days:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {selectedReport.attendance?.daysAbsent || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="textSecondary">Attendance Percentage:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: selectedReport.attendance?.percentage >= 90 ? 'success.main' : 'warning.main' }}>
                    {selectedReport.attendance?.percentage || 0}%
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
                      Academic Progress: {selectedReport.trends?.academicProgress || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box display="flex" alignItems="center">
                    <SchoolIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      Attendance: {selectedReport.trends?.attendanceTrend || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box display="flex" alignItems="center">
                    <PersonIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      Behavior: {selectedReport.trends?.behaviorTrend || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box display="flex" alignItems="center">
                    <AssessmentIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      Assignments: {selectedReport.trends?.assignmentTrend || 'N/A'}
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
                {selectedReport.recommendations?.academic?.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      Academic Recommendations:
                    </Typography>
                    <List>
                      {selectedReport.recommendations.academic.map((rec, index) => (
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
                {selectedReport.recommendations?.behavioral?.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      Behavioral Recommendations:
                    </Typography>
                    <List>
                      {selectedReport.recommendations.behavioral.map((rec, index) => (
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
        </>
      ) : (
        <Alert severity="info">
          No comprehensive progress report available for the selected period. Please check back later.
        </Alert>
      )}

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
          <Button onClick={handleFeedbackSubmit} variant="contained" startIcon={<SendIcon />}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComprehensiveProgressTemplate; 