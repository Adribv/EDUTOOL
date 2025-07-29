import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Event as EventIcon,
  Grade as GradeIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { studentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Exams = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [examData, setExamData] = useState({
    upcomingExams: [],
    pastExams: [],
    examResults: [],
  });

  useEffect(() => {
    fetchExamData();
  }, []);

  const fetchExamData = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getExams();
      setExamData(response.data);
    } catch (error) {
      console.error('Error fetching exam data:', error);
      setError('Failed to load exam data');
      toast.error('Failed to load exam data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'success';
    if (grade >= 80) return 'info';
    if (grade >= 70) return 'primary';
    if (grade >= 60) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Exams
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab icon={<ScheduleIcon />} label="Upcoming Exams" />
          <Tab icon={<EventIcon />} label="Past Exams" />
          <Tab icon={<GradeIcon />} label="Results" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {examData.upcomingExams.map((exam) => (
            <Grid item xs={12} md={6} key={exam.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {exam.subject}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography color="textSecondary">Date</Typography>
                      <Typography>{exam.date}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography color="textSecondary">Time</Typography>
                      <Typography>{exam.time}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography color="textSecondary">Duration</Typography>
                      <Typography>{exam.duration}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography color="textSecondary">Room</Typography>
                      <Typography>{exam.room}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography color="textSecondary">Instructions</Typography>
                      <Typography>{exam.instructions}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Subject</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {examData.pastExams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell>{exam.subject}</TableCell>
                  <TableCell>{exam.date}</TableCell>
                  <TableCell>{exam.type}</TableCell>
                  <TableCell>
                    <Chip
                      label={exam.status}
                      color={exam.status === 'Completed' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{exam.remarks}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {activeTab === 2 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Subject</TableCell>
                <TableCell>Exam Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Grade</TableCell>
                <TableCell>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {examData.examResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>{result.subject}</TableCell>
                  <TableCell>{result.examType}</TableCell>
                  <TableCell>{result.date}</TableCell>
                  <TableCell>{result.score}%</TableCell>
                  <TableCell>
                    <Chip
                      label={result.grade}
                      color={getGradeColor(result.score)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{result.remarks}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Exams; 