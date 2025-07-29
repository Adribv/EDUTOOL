import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  School,
  Grade,
  Assessment,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import studentService from '../../services/studentService';
import { toast } from 'react-toastify';

const ExamResults = () => {
  const [loading, setLoading] = useState(true);
  const [examResults, setExamResults] = useState([]);
  const [performance, setPerformance] = useState(null);

  useEffect(() => {
    fetchExamResults();
  }, []);

  const fetchExamResults = async () => {
    try {
      setLoading(true);
      const [resultsResponse, performanceResponse] = await Promise.all([
        studentService.getExamResults(),
        studentService.getPerformanceAnalytics(),
      ]);
      setExamResults(resultsResponse.data || []);
      setPerformance(performanceResponse.data);
    } catch (error) {
      console.error('Error fetching exam results:', error);
      toast.error('Failed to load exam results');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'success';
    if (grade >= 80) return 'primary';
    if (grade >= 70) return 'info';
    if (grade >= 60) return 'warning';
    return 'error';
  };

  const getPerformanceTrend = (current, previous) => {
    if (!previous) return 'neutral';
    return current > previous ? 'up' : current < previous ? 'down' : 'neutral';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          Exam Results
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
          View your examination results and performance analytics
        </Typography>

        {/* Performance Overview */}
        {performance && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Grade color="primary" />
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      Average Grade
                    </Typography>
                  </Box>
                  <Typography variant="h4" color="primary">
                    {performance.averageGrade || 0}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <School color="primary" />
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      Total Exams
                    </Typography>
                  </Box>
                  <Typography variant="h4" color="primary">
                    {examResults.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <TrendingUp color="success" />
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      Best Subject
                    </Typography>
                  </Box>
                  <Typography variant="h6" color="success.main">
                    {performance.bestSubject || 'N/A'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <TrendingDown color="warning" />
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      Needs Improvement
                    </Typography>
                  </Box>
                  <Typography variant="h6" color="warning.main">
                    {performance.weakSubject || 'N/A'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Exam Results Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Exam Results
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Exam Name</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Marks Obtained</TableCell>
                    <TableCell>Total Marks</TableCell>
                    <TableCell>Percentage</TableCell>
                    <TableCell>Grade</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {examResults.map((result) => {
                    const percentage = Math.round((result.marksObtained / result.totalMarks) * 100);
                    const trend = getPerformanceTrend(percentage, result.previousPercentage);
                    
                    return (
                      <TableRow key={result.id}>
                        <TableCell>{result.examName}</TableCell>
                        <TableCell>{result.subject}</TableCell>
                        <TableCell>{new Date(result.examDate).toLocaleDateString()}</TableCell>
                        <TableCell>{result.marksObtained}</TableCell>
                        <TableCell>{result.totalMarks}</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            {percentage}%
                            {trend === 'up' && <TrendingUp color="success" sx={{ ml: 1, fontSize: 16 }} />}
                            {trend === 'down' && <TrendingDown color="error" sx={{ ml: 1, fontSize: 16 }} />}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={result.grade}
                            color={getGradeColor(percentage)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={result.status}
                            color={result.status === 'passed' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {examResults.length === 0 && (
          <Box textAlign="center" py={4}>
            <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              No exam results found
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Your exam results will appear here once they are published
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ExamResults; 