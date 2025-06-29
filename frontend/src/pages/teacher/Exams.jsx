import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Avatar,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Skeleton
} from '@mui/material';
import {
  Event,
  Book,
  Group,
  CheckCircle,
  Warning,
  Close,
  Edit,
  Save,
  Cancel,
  Add,
  Download,
  Upload,
  Assessment,
  Schedule,
  School,
  AccessTime,
  CalendarToday,
  LocationOn,
  Assignment,
  TrendingUp,
  TrendingDown,
  Timer,
  Visibility,
  Print,
  Info
} from '@mui/icons-material';
import { teacherAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';

const Exams = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examDetailsDialog, setExamDetailsDialog] = useState(false);
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');

  // Fetch VP-scheduled exams
  const { data: vpExams, isLoading: vpExamsLoading, error: vpExamsError } = useQuery({
    queryKey: ['vpExams', user?.id],
    queryFn: () => {
      const staffId = user?._id || user?.id;
      if (!staffId) {
        throw new Error('User ID not available');
      }
      return teacherAPI.getVPExams(staffId);
    },
    enabled: !!user?.id || !!user?._id,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Fetch teacher's own exams
  const { data: teacherExams, isLoading: teacherExamsLoading } = useQuery({
    queryKey: ['teacherExams'],
    queryFn: () => teacherAPI.getExams(),
  });

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleExamClick = (exam) => {
    setSelectedExam(exam);
    setExamDetailsDialog(true);
  };

  const handleCloseExamDetails = () => {
    setExamDetailsDialog(false);
    setSelectedExam(null);
  };

  // Calculate days left until exam
  const getDaysLeft = (examDate) => {
    const today = new Date();
    const exam = new Date(examDate);
    const diffTime = exam - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get exam status based on days left
  const getExamStatus = (examDate) => {
    const daysLeft = getDaysLeft(examDate);
    if (daysLeft < 0) return { label: 'Completed', color: 'success', severity: 'success' };
    if (daysLeft === 0) return { label: 'Today', color: 'error', severity: 'error' };
    if (daysLeft <= 3) return { label: 'Urgent', color: 'warning', severity: 'warning' };
    if (daysLeft <= 7) return { label: 'Soon', color: 'info', severity: 'info' };
    return { label: 'Upcoming', color: 'primary', severity: 'info' };
  };

  // Get time until exam in human readable format
  const getTimeUntilExam = (examDate) => {
    const daysLeft = getDaysLeft(examDate);
    if (daysLeft < 0) return `${Math.abs(daysLeft)} days ago`;
    if (daysLeft === 0) return 'Today';
    if (daysLeft === 1) return 'Tomorrow';
    return `${daysLeft} days left`;
  };

  // Filter exams based on selected filters
  const getFilteredExams = (exams) => {
    if (!exams) return [];
    
    return exams.filter(exam => {
      const gradeMatch = filterGrade === 'all' || exam.class === filterGrade || exam.grade === filterGrade;
      const subjectMatch = filterSubject === 'all' || exam.subject === filterSubject;
      
      if (selectedTab === 1) {
        // Upcoming exams
        const daysLeft = getDaysLeft(exam.examDate || exam.date);
        return daysLeft >= 0 && gradeMatch && subjectMatch;
      } else if (selectedTab === 2) {
        // Today's exams
        const daysLeft = getDaysLeft(exam.examDate || exam.date);
        return daysLeft === 0 && gradeMatch && subjectMatch;
      } else if (selectedTab === 3) {
        // Completed exams
        const daysLeft = getDaysLeft(exam.examDate || exam.date);
        return daysLeft < 0 && gradeMatch && subjectMatch;
      }
      
      return gradeMatch && subjectMatch;
    });
  };

  // Get unique grades and subjects for filtering
  const getUniqueValues = (exams, field) => {
    if (!exams) return [];
    return [...new Set(exams.map(exam => exam[field]).filter(Boolean))];
  };

  const allExams = [...(vpExams || []), ...(teacherExams || [])];
  const filteredExams = getFilteredExams(selectedTab === 0 ? vpExams : allExams);
  const uniqueGrades = getUniqueValues(allExams, 'class').concat(getUniqueValues(allExams, 'grade'));
  const uniqueSubjects = getUniqueValues(allExams, 'subject');

  if (vpExamsLoading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (vpExamsError) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          VP Exam Schedule Not Available
        </Typography>
        <Typography variant="body2">
          The VP exam schedule is currently not available. This could be because:
        </Typography>
        <ul style={{ marginTop: 8, paddingLeft: 20 }}>
          <li>No exams have been scheduled by the Vice Principal yet</li>
          <li>The database connection is temporarily unavailable</li>
          <li>You may need to refresh the page</li>
        </ul>
        <Button 
          variant="outlined" 
          onClick={() => window.location.reload()} 
          sx={{ mt: 2 }}
        >
          Refresh Page
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Exam Schedule
        </Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Grade</InputLabel>
            <Select
              value={filterGrade}
              label="Grade"
              onChange={(e) => setFilterGrade(e.target.value)}
            >
              <MenuItem value="all">All Grades</MenuItem>
              {uniqueGrades.map((grade) => (
                <MenuItem key={grade} value={grade}>
                  {grade}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Subject</InputLabel>
            <Select
              value={filterSubject}
              label="Subject"
              onChange={(e) => setFilterSubject(e.target.value)}
            >
              <MenuItem value="all">All Subjects</MenuItem>
              {uniqueSubjects.map((subject) => (
                <MenuItem key={subject} value={subject}>
                  {subject}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {(vpExams || []).length}
                  </Typography>
                  <Typography variant="body2">VP Scheduled Exams</Typography>
                </Box>
                <Assessment sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {(vpExams || []).filter(exam => getDaysLeft(exam.examDate) >= 0).length}
                  </Typography>
                  <Typography variant="body2">Upcoming Exams</Typography>
                </Box>
                <Schedule sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {(vpExams || []).filter(exam => getDaysLeft(exam.examDate) === 0).length}
                  </Typography>
                  <Typography variant="body2">Today's Exams</Typography>
                </Box>
                <CalendarToday sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {(vpExams || []).filter(exam => getDaysLeft(exam.examDate) <= 7 && getDaysLeft(exam.examDate) >= 0).length}
                  </Typography>
                  <Typography variant="body2">This Week</Typography>
                </Box>
                <Timer sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        sx={{ mb: 3 }}
      >
        <Tab 
          label={
            <Badge badgeContent={(vpExams || []).length} color="primary">
              VP Scheduled Exams
            </Badge>
          } 
        />
        <Tab 
          label={
            <Badge badgeContent={(vpExams || []).filter(exam => getDaysLeft(exam.examDate) >= 0).length} color="warning">
              Upcoming Exams
            </Badge>
          } 
        />
        <Tab 
          label={
            <Badge badgeContent={(vpExams || []).filter(exam => getDaysLeft(exam.examDate) === 0).length} color="error">
              Today's Exams
            </Badge>
          } 
        />
        <Tab 
          label={
            <Badge badgeContent={(vpExams || []).filter(exam => getDaysLeft(exam.examDate) < 0).length} color="success">
              Completed Exams
            </Badge>
          } 
        />
      </Tabs>

      {/* Exams Grid */}
      {filteredExams.length > 0 ? (
        <Grid container spacing={3}>
          {filteredExams.map((exam, index) => {
            const examDate = exam.examDate || exam.date;
            const daysLeft = getDaysLeft(examDate);
            const status = getExamStatus(examDate);
            const timeUntil = getTimeUntilExam(examDate);

            return (
              <Grid item xs={12} sm={6} md={4} key={exam._id || exam.id || index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    '&:hover': { 
                      transform: 'translateY(-4px)', 
                      boxShadow: 6,
                      transition: 'all 0.3s ease'
                    },
                    border: daysLeft === 0 ? '2px solid #f44336' : 
                           daysLeft <= 3 ? '2px solid #ff9800' : 'none'
                  }}
                  onClick={() => handleExamClick(exam)}
                >
                  <CardHeader
                    avatar={
                      <Avatar sx={{ bgcolor: status.color + '.main' }}>
                        <Assessment />
                      </Avatar>
                    }
                    title={
                      <Box>
                        <Typography variant="h6" noWrap>
                          {exam.subject}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {exam.examType || exam.type || 'Regular Exam'}
                        </Typography>
                      </Box>
                    }
                    action={
                      <Chip 
                        label={status.label} 
                        color={status.color}
                        size="small"
                        icon={daysLeft === 0 ? <Warning /> : <Schedule />}
                      />
                    }
                  />
                  <CardContent>
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <School fontSize="small" color="action" />
                        <Typography variant="body2">
                          {exam.class || exam.grade} {exam.section ? `- ${exam.section}` : ''}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <CalendarToday fontSize="small" color="action" />
                        <Typography variant="body2">
                          {new Date(examDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <AccessTime fontSize="small" color="action" />
                        <Typography variant="body2">
                          Duration: {exam.duration} minutes
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <Assignment fontSize="small" color="action" />
                        <Typography variant="body2">
                          Total Marks: {exam.totalMarks}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Days Left Indicator */}
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography 
                        variant="h5" 
                        fontWeight="bold" 
                        color={status.color + '.main'}
                      >
                        {timeUntil}
                      </Typography>
                      {daysLeft >= 0 && (
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.max(0, 100 - (daysLeft * 10))} 
                          sx={{ mt: 1, height: 6, borderRadius: 3 }}
                          color={status.color}
                        />
                      )}
                    </Box>

                    {exam.departmentId && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Department: {exam.departmentId.name || 'N/A'}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Assessment sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No exams found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedTab === 0 ? 
                  'No VP-scheduled exams are currently available. The Vice Principal may not have scheduled any exams yet, or they may not be published.' :
                 selectedTab === 1 ? 'No upcoming exams' :
                 selectedTab === 2 ? 'No exams scheduled for today' :
                 'No completed exams'}
              </Typography>
              {selectedTab === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Check back later or contact the administration for more information.
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Exam Details Dialog */}
      <Dialog 
        open={examDetailsDialog} 
        onClose={handleCloseExamDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedExam && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <Assessment />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {selectedExam.subject} Exam
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedExam.examType || selectedExam.type || 'Regular Exam'}
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={handleCloseExamDetails}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardHeader title="Exam Information" />
                    <CardContent>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <School />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Class/Grade" 
                            secondary={`${selectedExam.class || selectedExam.grade} ${selectedExam.section ? `- ${selectedExam.section}` : ''}`}
                          />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemIcon>
                            <CalendarToday />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Exam Date" 
                            secondary={new Date(selectedExam.examDate || selectedExam.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemIcon>
                            <AccessTime />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Duration" 
                            secondary={`${selectedExam.duration} minutes`}
                          />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemIcon>
                            <Assignment />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Total Marks" 
                            secondary={selectedExam.totalMarks}
                          />
                        </ListItem>

                        {selectedExam.passingMarks && (
                          <ListItem>
                            <ListItemIcon>
                              <CheckCircle />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Passing Marks" 
                              secondary={selectedExam.passingMarks}
                            />
                          </ListItem>
                        )}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardHeader title="Time Information" />
                    <CardContent>
                      <Box textAlign="center" mb={3}>
                        <Typography variant="h4" color="primary.main" fontWeight="bold">
                          {getTimeUntilExam(selectedExam.examDate || selectedExam.date)}
                        </Typography>
                        <Chip 
                          label={getExamStatus(selectedExam.examDate || selectedExam.date).label}
                          color={getExamStatus(selectedExam.examDate || selectedExam.date).color}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      
                      {selectedExam.instructions && selectedExam.instructions.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Instructions:
                          </Typography>
                          <List dense>
                            {selectedExam.instructions.map((instruction, index) => (
                              <ListItem key={index}>
                                <ListItemIcon>
                                  <Info fontSize="small" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={instruction}
                                  primaryTypographyProps={{ variant: 'body2' }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                      
                      {selectedExam.departmentId && (
                        <Box mt={2}>
                          <Typography variant="subtitle2" gutterBottom>
                            Department:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedExam.departmentId.name || 'N/A'}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseExamDetails}>Close</Button>
              <Button variant="outlined" startIcon={<Print />}>
                Print Details
              </Button>
              <Button variant="contained" startIcon={<Visibility />}>
                View Full Schedule
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Exams; 