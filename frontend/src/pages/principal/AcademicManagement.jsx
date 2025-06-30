import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  Event as EventIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { principalAPI } from '../../services/api';

const AcademicManagement = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedClass, setSelectedClass] = useState(null);
  const [curriculumDetails, setCurriculumDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
  // New state for other tabs
  const [examinations, setExaminations] = useState([]);
  const [results, setResults] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [tabLoading, setTabLoading] = useState(false);
  const [curriculumData, setCurriculumData] = useState([]);

  useEffect(() => {
    if (currentTab === 0) {
      fetchCurriculumData();
    } else if (currentTab === 1) {
      fetchExaminations();
    } else if (currentTab === 2) {
      fetchResults();
    } else if (currentTab === 3) {
      fetchAttendance();
    }
  }, [currentTab]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const fetchCurriculumData = async () => {
    try {
      setTabLoading(true);
      const response = await principalAPI.getCurriculumOverview();
      setCurriculumData(response.data);
    } catch (err) {
      console.error('Error fetching curriculum data:', err);
      setError('Failed to load curriculum data');
    } finally {
      setTabLoading(false);
    }
  };

  const debugData = async () => {
    try {
      console.log('🔍 Debugging curriculum data...');
      const response = await principalAPI.debugCurriculumData();
      console.log('📊 Debug data:', response.data);
      alert(`Debug data logged to console. Check browser console for details.\n\nTeachers: ${response.data.totalTeachers}\nStudents: ${response.data.totalStudents}\nAssignments: ${response.data.assignments.length}`);
    } catch (err) {
      console.error('Error debugging data:', err);
      alert('Error debugging data. Check console for details.');
    }
  };

  const fetchExaminations = async () => {
    try {
      setTabLoading(true);
      const response = await principalAPI.getAllExaminations();
      setExaminations(response.data);
    } catch (err) {
      console.error('Error fetching examinations:', err);
      setError('Failed to load examinations');
    } finally {
      setTabLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      setTabLoading(true);
      const response = await principalAPI.getAcademicResults();
      setResults(response.data);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to load academic results');
    } finally {
      setTabLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      setTabLoading(true);
      const response = await principalAPI.getAttendanceOverview();
      setAttendance(response.data);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError('Failed to load attendance data');
    } finally {
      setTabLoading(false);
    }
  };

  const handleViewDetails = async (className) => {
    console.log(`🔍 View Details clicked for class: ${className}`);
    setSelectedClass(className);
    setLoading(true);
    setError(null);
    setDetailsDialogOpen(true);

    try {
      console.log(`📡 Fetching curriculum details for class: ${className}`);
      const response = await principalAPI.getClassCurriculumDetails(className);
      console.log(`✅ Curriculum details received:`, response);
      setCurriculumDetails(response.data);
    } catch (err) {
      console.error('❌ Error fetching curriculum details:', err);
      setError(`Failed to load curriculum details for class ${className}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setDetailsDialogOpen(false);
    setSelectedClass(null);
    setCurriculumDetails(null);
    setError(null);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Academic Management
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Curriculum" />
          <Tab label="Examinations" />
          <Tab label="Results" />
          <Tab label="Attendance" />
        </Tabs>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {currentTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Curriculum Overview
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={debugData}
                    sx={{ mr: 2 }}
                  >
                    Debug Data
                  </Button>
                </Box>
                {tabLoading ? (
                  <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                  </Box>
                ) : curriculumData.length === 0 ? (
                  <Alert severity="info">No curriculum data found. Please add teachers and assign subjects to classes.</Alert>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Class</TableCell>
                          <TableCell>Subjects</TableCell>
                          <TableCell>Teachers</TableCell>
                          <TableCell>Students</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {curriculumData.map((classInfo) => (
                          <TableRow key={classInfo.className}>
                            <TableCell>Class {classInfo.className}</TableCell>
                            <TableCell>{classInfo.subjects}</TableCell>
                            <TableCell>{classInfo.teacherCount} Teachers</TableCell>
                            <TableCell>{classInfo.studentCount} Students</TableCell>
                            <TableCell>
                              <Button 
                                size="small" 
                                color="primary"
                                onClick={() => handleViewDetails(classInfo.className)}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {currentTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Examination Schedule
                </Typography>
                {tabLoading ? (
                  <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                  </Box>
                ) : examinations.length === 0 ? (
                  <Alert severity="info">No examinations found.</Alert>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Title</TableCell>
                          <TableCell>Class</TableCell>
                          <TableCell>Subject</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Source</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {examinations.map((exam) => (
                          <TableRow key={exam._id}>
                            <TableCell>{exam.title}</TableCell>
                            <TableCell>{exam.class} {exam.section}</TableCell>
                            <TableCell>{exam.subject}</TableCell>
                            <TableCell>
                              {new Date(exam.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={exam.type || 'Regular'} 
                                size="small" 
                                color="primary" 
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={exam.source || 'Teacher'} 
                                size="small" 
                                variant="outlined" 
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {currentTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Academic Results
                </Typography>
                {tabLoading ? (
                  <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                  </Box>
                ) : !results ? (
                  <Alert severity="info">No results found.</Alert>
                ) : (
                  <Box>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={3}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" color="primary">
                              {results.totalResults || 0}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Total Results
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={3}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" color="primary">
                              {Object.keys(results.resultsByClass || {}).length}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Classes
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={3}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" color="primary">
                              {Object.keys(results.resultsBySubject || {}).length}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Subjects
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>

                    {results.resultsByClass && Object.keys(results.resultsByClass).length > 0 && (
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="h6">Results by Class</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {Object.entries(results.resultsByClass).map(([classKey, classData]) => (
                            <Box key={classKey} sx={{ mb: 2 }}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                Class {classData.class} - Section {classData.section}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                Students: {classData.totalStudents} | Exams: {classData.totalExams} | 
                                Average: {classData.averageScore.toFixed(2)}%
                              </Typography>
                            </Box>
                          ))}
                        </AccordionDetails>
                      </Accordion>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {currentTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Attendance Overview
                </Typography>
                {tabLoading ? (
                  <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                  </Box>
                ) : !attendance ? (
                  <Alert severity="info">No attendance data found.</Alert>
                ) : (
                  <Box>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={3}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" color="primary">
                              {attendance.totalStudents || 0}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Total Students
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={3}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" color="primary">
                              {attendance.totalClasses || 0}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Total Classes
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>

                    {attendance.attendanceByClass && Object.keys(attendance.attendanceByClass).length > 0 && (
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="h6">Attendance by Class</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {Object.entries(attendance.attendanceByClass).map(([classKey, classData]) => (
                            <Box key={classKey} sx={{ mb: 2 }}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                Class {classData.class} - Section {classData.section}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                Students: {classData.totalStudents} | 
                                Present Today: {classData.presentToday} | 
                                Average: {classData.averageAttendance}%
                              </Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={classData.averageAttendance} 
                                sx={{ mt: 1 }}
                              />
                            </Box>
                          ))}
                        </AccordionDetails>
                      </Accordion>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Curriculum Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Curriculum Details - Class {selectedClass}
        </DialogTitle>
        <DialogContent>
          {loading && (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {curriculumDetails && !loading && (
            <Box>
              {/* Class Statistics */}
              {curriculumDetails.classStats && (
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Class Statistics
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={3}>
                        <Typography variant="body2" color="textSecondary">
                          Total Students
                        </Typography>
                        <Typography variant="h6">
                          {curriculumDetails.classStats.totalStudents ?? 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="body2" color="textSecondary">
                          Total Subjects
                        </Typography>
                        <Typography variant="h6">
                          {curriculumDetails.classStats.totalSubjects ?? 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="body2" color="textSecondary">
                          Total Teachers
                        </Typography>
                        <Typography variant="h6">
                          {curriculumDetails.classStats.totalTeachers ?? 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="body2" color="textSecondary">
                          Sections
                        </Typography>
                        <Typography variant="h6">
                          {curriculumDetails.classStats.sections ?? 0}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Subjects and Teachers */}
              {curriculumDetails.subjects && curriculumDetails.subjects.length > 0 && (
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Subjects & Teachers
                    </Typography>
                    {curriculumDetails.subjects.map((subject, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {subject.subject}
                        </Typography>
                        <Box sx={{ ml: 2 }}>
                          {subject.teachers && subject.teachers.map((teacher, tIndex) => (
                            <Chip
                              key={tIndex}
                              label={teacher.name}
                              size="small"
                              sx={{ mr: 1, mb: 1 }}
                            />
                          ))}
                        </Box>
                        {index < curriculumDetails.subjects.length - 1 && <Divider sx={{ mt: 1 }} />}
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Students by Section */}
              {curriculumDetails.studentsBySection && Object.keys(curriculumDetails.studentsBySection).length > 0 && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Students by Section
                    </Typography>
                    {Object.entries(curriculumDetails.studentsBySection).map(([section, students]) => (
                      <Box key={section} sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Section {section} ({students.length} students)
                        </Typography>
                        <Box sx={{ ml: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {students.map((student, sIndex) => (
                            <Chip
                              key={sIndex}
                              label={`${student.name} (${student.rollNumber})`}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                        {Object.keys(curriculumDetails.studentsBySection).indexOf(section) < Object.keys(curriculumDetails.studentsBySection).length - 1 && (
                          <Divider sx={{ mt: 1 }} />
                        )}
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AcademicManagement; 