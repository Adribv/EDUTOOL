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
import { parentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const ChildProgress = () => {
  const [loading, setLoading] = useState(true);
  const [childData, setChildData] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [feedback, setFeedback] = useState('');
  const { user } = useAuth();
  const { rollNumber } = useParams();

  useEffect(() => {
    fetchChildData();
  }, [rollNumber]);

  useEffect(() => {
    if (childData) {
      fetchChildProgress();
    }
  }, [childData, selectedPeriod]);

  const fetchChildData = async () => {
    try {
      setLoading(true);
      const response = await parentAPI.getChildren();
      const child = response.data.find(c => c.rollNumber === rollNumber);
      if (child) {
        setChildData(child);
      }
    } catch (error) {
      console.error('Error fetching child data:', error);
      toast.error('Failed to load child information');
    } finally {
      setLoading(false);
    }
  };

  const fetchChildProgress = async () => {
    if (!childData) return;

    try {
      setLoading(true);
      const params = { academicYear: '2024-25' };
      if (selectedPeriod !== 'current') {
        params.reportPeriod = selectedPeriod;
      }

      try {
        const response = await parentAPI.getChildComprehensiveReport(childData._id, params);
        setReports(response.data || []);
        if (response.data && response.data.length > 0) {
          setSelectedReport(response.data[0]);
        } else {
          // Fallback to mock data if no API data
          const mockReport = {
            schoolInfo: {
              schoolName: 'EDULIVES School',
              academicYear: '2024-25',
              class: childData.class,
              term: 'Annual',
              reportDate: new Date().toLocaleDateString()
            },
            studentInfo: {
              name: childData.name,
              admissionNumber: childData.rollNumber,
              dateOfBirth: '15-03-2008',
              classSection: `${childData.class}-${childData.section}`,
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
          };
          setSelectedReport(mockReport);
          toast.info('Displaying sample data. API integration in progress.');
        }
      } catch (apiError) {
        console.error('API Error:', apiError);
        // Fallback to mock data if API fails
        const mockReport = {
          schoolInfo: {
            schoolName: 'EDULIVES School',
            academicYear: '2024-25',
            class: childData.class,
            term: 'Annual',
            reportDate: new Date().toLocaleDateString()
          },
          studentInfo: {
            name: childData.name,
            admissionNumber: childData.rollNumber,
            dateOfBirth: '15-03-2008',
            classSection: `${childData.class}-${childData.section}`,
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
        };
        setSelectedReport(mockReport);
        toast.info('Displaying sample data. API integration in progress.');
      }
    } catch (error) {
      console.error('Error fetching child progress:', error);
      toast.error('Failed to load progress reports');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    try {
      await parentAPI.submitComprehensiveFeedback(selectedReport._id, { parentComments: feedback });
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

  if (!childData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Child not found or access denied.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          CHILD COMPREHENSIVE PROGRESS REPORT
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Box>

      {/* Child Info Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center">
            <PersonIcon sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h6">{childData.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                Class {childData.class} {childData.section} | Roll No: {childData.rollNumber}
              </Typography>
            </Box>
          </Box>
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
                    {selectedReport.studentInfo?.name || childData.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="textSecondary">Admission Number:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {selectedReport.studentInfo?.admissionNumber || childData.rollNumber}
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
                    {selectedReport.generalRemarks?.classTeacher || 'No remarks available'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    Principal:
                  </Typography>
                  <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                    {selectedReport.generalRemarks?.principal || 'No remarks available'}
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
                    {selectedReport.signatures?.classTeacher || 'Not Signed'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="textSecondary">Parent/Guardian:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {selectedReport.signatures?.parentGuardian || 'Pending'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="textSecondary">Principal:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {selectedReport.signatures?.principal || 'Not Signed'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="textSecondary">Date:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {selectedReport.signatures?.date || new Date().toLocaleDateString()}
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
            label="Parent Comments"
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

export default ChildProgress; 