import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import { toast } from 'react-toastify';
import studentService from '../../services/studentService';

const Examinations = () => {
  const [loading, setLoading] = useState(true);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const [upcomingResponse, resultsResponse] = await Promise.all([
        studentService.getUpcomingExams(),
        studentService.getExamResults(),
      ]);
      setUpcomingExams(upcomingResponse.data);
      setExamResults(resultsResponse.data);
    } catch {
      toast.error('Failed to load examination data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'upcoming':
        return 'info';
      case 'ongoing':
        return 'warning';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'success';
    if (grade >= 80) return 'info';
    if (grade >= 70) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Examinations
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Upcoming Exams" />
        <Tab label="Exam Results" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {upcomingExams.map((exam) => (
            <Grid item xs={12} md={6} key={exam.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">{exam.subject}</Typography>
                    <Chip
                      label={exam.status}
                      color={getStatusColor(exam.status)}
                      size="small"
                    />
                  </Box>
                  <Typography color="textSecondary" gutterBottom>
                    Date: {new Date(exam.date).toLocaleDateString()}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    Time: {exam.startTime} - {exam.endTime}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    Duration: {exam.duration} minutes
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    Room: {exam.room}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {exam.instructions}
                  </Typography>
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
                <TableCell>Exam Date</TableCell>
                <TableCell>Marks Obtained</TableCell>
                <TableCell>Total Marks</TableCell>
                <TableCell>Percentage</TableCell>
                <TableCell>Grade</TableCell>
                <TableCell>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {examResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>{result.subject}</TableCell>
                  <TableCell>{new Date(result.examDate).toLocaleDateString()}</TableCell>
                  <TableCell>{result.marksObtained}</TableCell>
                  <TableCell>{result.totalMarks}</TableCell>
                  <TableCell>{result.percentage}%</TableCell>
                  <TableCell>
                    <Chip
                      label={result.grade}
                      color={getGradeColor(result.percentage)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{result.remarks || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Examinations; 