import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  School,
  Person,
  Assessment,
  Event,
  TrendingUp,
  Download,
  Print,
  Share,
  Visibility,
  Grade,
  Schedule,
  CheckCircle,
  Warning,
  Info,
  FamilyRestroom,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { parentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const ProgressReport = () => {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportDialog, setReportDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch parent's children
  const { data: childrenData, isLoading: childrenLoading } = useQuery({
    queryKey: ['parentChildren'],
    queryFn: () => parentAPI.getChildren(),
    onError: (error) => {
      toast.error('Failed to load children data');
      console.error('Error fetching children:', error);
    }
  });

  // Fetch comprehensive child data
  const { data: childData, isLoading: childLoading } = useQuery({
    queryKey: ['childProgressData', selectedChild],
    queryFn: async () => {
      if (!selectedChild) return null;
      
      const [
        profileResponse,
        attendanceResponse,
        examsResponse,
        activitiesResponse,
        coScholasticResponse,
        remarksResponse
      ] = await Promise.all([
        parentAPI.getChildProfile(selectedChild),
        parentAPI.getChildAttendance(selectedChild),
        parentAPI.getChildExamResults(selectedChild),
        parentAPI.getChildActivities(selectedChild),
        parentAPI.getChildCoScholastic(selectedChild),
        parentAPI.getChildTeacherRemarks(selectedChild)
      ]);

      return {
        profile: profileResponse.data,
        attendance: attendanceResponse.data,
        exams: examsResponse.data,
        activities: activitiesResponse.data,
        coScholastic: coScholasticResponse.data,
        remarks: remarksResponse.data
      };
    },
    enabled: !!selectedChild,
    onError: (error) => {
      toast.error('Failed to load progress data');
      console.error('Error fetching progress data:', error);
    }
  });

  // Set first child as default when children data loads
  useEffect(() => {
    if (childrenData?.data?.length > 0 && !selectedChild) {
      setSelectedChild(childrenData.data[0].id);
    }
  }, [childrenData, selectedChild]);

  // Calculate attendance statistics
  const getAttendanceStats = () => {
    if (!childData?.attendance) return { total: 0, present: 0, absent: 0, percentage: 0 };
    
    const total = childData.attendance.length;
    const present = childData.attendance.filter(a => a.status === 'present').length;
    const absent = total - present;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    return { total, present, absent, percentage };
  };

  // Calculate academic performance
  const getAcademicPerformance = () => {
    if (!childData?.exams) return [];
    
    const subjects = [...new Set(childData.exams.map(exam => exam.subject))];
    return subjects.map(subject => {
      const subjectExams = childData.exams.filter(exam => exam.subject === subject);
      const totalMarks = subjectExams.reduce((sum, exam) => sum + exam.marksObtained, 0);
      const maxMarks = subjectExams.reduce((sum, exam) => sum + exam.maxMarks, 0);
      const average = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0;
      
      return {
        subject,
        marksObtained: totalMarks,
        maxMarks,
        average,
        grade: getGrade(average),
        remarks: getSubjectRemarks(average)
      };
    });
  };

  // Get grade based on percentage
  const getGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    return 'D';
  };

  // Get subject remarks
  const getSubjectRemarks = (percentage) => {
    if (percentage >= 90) return 'Excellent performance';
    if (percentage >= 80) return 'Very good work';
    if (percentage >= 70) return 'Good progress';
    if (percentage >= 60) return 'Satisfactory';
    if (percentage >= 50) return 'Needs improvement';
    return 'Requires attention';
  };

  // Get co-scholastic performance
  const getCoScholasticPerformance = () => {
    if (!childData?.coScholastic) return [];
    
    return [
      { area: 'Work Habits', grade: childData.coScholastic.workHabits || 'B', comments: childData.coScholastic.workHabitsComments || 'Good work habits' },
      { area: 'Communication Skills', grade: childData.coScholastic.communication || 'B+', comments: childData.coScholastic.communicationComments || 'Effective communication' },
      { area: 'Teamwork & Leadership', grade: childData.coScholastic.teamwork || 'A', comments: childData.coScholastic.teamworkComments || 'Strong leadership skills' },
      { area: 'Discipline', grade: childData.coScholastic.discipline || 'A', comments: childData.coScholastic.disciplineComments || 'Well-disciplined student' },
      { area: 'Creativity', grade: childData.coScholastic.creativity || 'B+', comments: childData.coScholastic.creativityComments || 'Shows creative thinking' },
      { area: 'Participation in Activities', grade: childData.coScholastic.participation || 'A', comments: childData.coScholastic.participationComments || 'Active participation' }
    ];
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setReportDialog(true);
  };

  const handleDownloadReport = async () => {
    setLoading(true);
    try {
      // Generate and download PDF report
      const response = await parentAPI.downloadChildProgressReport(selectedChild);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Progress_Report_${childData?.profile?.name || 'Child'}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to download report');
    } finally {
      setLoading(false);
    }
  };

  const attendanceStats = getAttendanceStats();
  const academicPerformance = getAcademicPerformance();
  const coScholasticPerformance = getCoScholasticPerformance();

  if (childrenLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Child Progress Report
      </Typography>

      {/* Child Selection */}
      {childrenData?.data?.length > 1 && (
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Select Child
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Choose Child</InputLabel>
              <Select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                label="Choose Child"
              >
                {childrenData.data.map((child) => (
                  <MenuItem key={child.id} value={child.id}>
                    {child.name} - Class {child.class} {child.section}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>
      )}

      {!selectedChild ? (
        <Alert severity="info">
          Please select a child to view their progress report.
        </Alert>
      ) : childLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Child Information Card */}
          <Card sx={{ mb: 3, boxShadow: 2 }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Child Information
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Name:</strong> {childData?.profile?.name || 'N/A'}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Admission Number:</strong> {childData?.profile?.admissionNumber || 'N/A'}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Class/Section:</strong> {childData?.profile?.class} {childData?.profile?.section}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Academic Year:</strong> {childData?.profile?.academicYear || '2024-25'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Quick Stats
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2">Attendance Rate</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {attendanceStats.percentage}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={attendanceStats.percentage} 
                      sx={{ mb: 2 }}
                    />
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Average Grade</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {academicPerformance.length > 0 
                          ? Math.round(academicPerformance.reduce((sum, subj) => sum + subj.average, 0) / academicPerformance.length)
                          : 0}%
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Academic Performance */}
          <Card sx={{ mb: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Academic Performance
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Marks Obtained</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Maximum Marks</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Percentage</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Grade</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Teacher's Remarks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {academicPerformance.map((subject, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ fontWeight: 500 }}>{subject.subject}</TableCell>
                        <TableCell align="center">{subject.marksObtained}</TableCell>
                        <TableCell align="center">{subject.maxMarks}</TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={`${subject.average}%`}
                            color={subject.average >= 80 ? 'success' : subject.average >= 60 ? 'warning' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={subject.grade}
                            color={subject.grade === 'A+' || subject.grade === 'A' ? 'success' : 
                                   subject.grade === 'B+' || subject.grade === 'B' ? 'warning' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="textSecondary">
                            {subject.remarks}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Co-Scholastic Performance */}
          <Card sx={{ mb: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Co-Scholastic Areas
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Area</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Grade/Rating</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Teacher's Comments</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {coScholasticPerformance.map((area, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ fontWeight: 500 }}>{area.area}</TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={area.grade}
                            color={area.grade === 'A' ? 'success' : area.grade === 'B+' ? 'primary' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="textSecondary">
                            {area.comments}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Attendance Details */}
          <Card sx={{ mb: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Attendance Summary
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                      {attendanceStats.total}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Working Days
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                      {attendanceStats.present}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Days Present
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="error.main" sx={{ fontWeight: 700 }}>
                      {attendanceStats.absent}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Days Absent
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                      {attendanceStats.percentage}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Attendance Rate
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Teacher Remarks */}
          {childData?.remarks && (
            <Card sx={{ mb: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  General Remarks
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Class Teacher:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {childData.remarks.classTeacher || 'No remarks available'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Principal:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {childData.remarks.principal || 'No remarks available'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleDownloadReport}
              disabled={loading}
              sx={{ minWidth: 150 }}
            >
              {loading ? 'Generating...' : 'Download Report'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Print />}
              onClick={() => window.print()}
              sx={{ minWidth: 150 }}
            >
              Print Report
            </Button>
            <Button
              variant="outlined"
              startIcon={<Share />}
              onClick={() => toast.info('Share feature coming soon!')}
              sx={{ minWidth: 150 }}
            >
              Share Report
            </Button>
          </Box>
        </>
      )}

      {/* Report Dialog */}
      <Dialog
        open={reportDialog}
        onClose={() => setReportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Detailed Progress Report
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box sx={{ mt: 2 }}>
              {/* Detailed report content would go here */}
              <Typography variant="body1">
                Detailed report view coming soon...
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProgressReport; 