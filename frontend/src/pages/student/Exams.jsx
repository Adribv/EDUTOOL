import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Tabs,
  Tab,
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
} from '@mui/material';
import {
  Event,
  School,
  Assignment,
  TrendingUp,
  Download,
} from '@mui/icons-material';
import { studentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Exams = () => {
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [resultDialog, setResultDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [upcomingRes, resultsRes] = await Promise.all([
        studentAPI.getUpcomingExams(),
        studentAPI.getExamResults(),
      ]);

      setUpcomingExams(upcomingRes.data);
      setExamResults(resultsRes.data);
    } catch (error) {
      console.error('Error fetching exam data:', error);
      toast.error('Failed to load exam data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleResultClick = (result) => {
    setSelectedResult(result);
    setResultDialog(true);
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'success';
    if (grade >= 80) return 'primary';
    if (grade >= 70) return 'info';
    if (grade >= 60) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Exams
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Event color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Upcoming Exams</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {upcomingExams.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <School color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Average Score</Typography>
              </Box>
              <Typography variant="h4" color="success">
                {examResults.length > 0
                  ? (
                      examResults.reduce((acc, curr) => acc + curr.score, 0) /
                      examResults.length
                    ).toFixed(1)
                  : 0}
                %
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Highest Score</Typography>
              </Box>
              <Typography variant="h4" color="info">
                {examResults.length > 0
                  ? Math.max(...examResults.map((result) => result.score))
                  : 0}
                %
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Upcoming Exams" />
          <Tab label="Exam Results" />
        </Tabs>
      </Paper>

      {/* Upcoming Exams Tab */}
      {selectedTab === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Subject</TableCell>
                <TableCell>Exam Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Room</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {upcomingExams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell>{exam.subject}</TableCell>
                  <TableCell>{exam.type}</TableCell>
                  <TableCell>
                    {new Date(exam.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{exam.time}</TableCell>
                  <TableCell>{exam.duration} minutes</TableCell>
                  <TableCell>{exam.room}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Exam Results Tab */}
      {selectedTab === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Subject</TableCell>
                <TableCell>Exam Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Grade</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {examResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>{result.subject}</TableCell>
                  <TableCell>{result.examType}</TableCell>
                  <TableCell>
                    {new Date(result.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${result.score}%`}
                      color={getGradeColor(result.score)}
                    />
                  </TableCell>
                  <TableCell>{result.grade}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Assignment />}
                      onClick={() => handleResultClick(result)}
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

      {/* Result Details Dialog */}
      <Dialog
        open={resultDialog}
        onClose={() => setResultDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Exam Result Details</DialogTitle>
        <DialogContent>
          {selectedResult && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Subject: {selectedResult.subject}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Exam Type: {selectedResult.examType}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Date: {new Date(selectedResult.date).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Score: {selectedResult.score}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Grade: {selectedResult.grade}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Rank: {selectedResult.rank}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Teacher's Comments
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {selectedResult.comments}
                  </Typography>
                </Grid>
                {selectedResult.reportCard && (
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={<Download />}
                      onClick={() => window.open(selectedResult.reportCard, '_blank')}
                    >
                      Download Report Card
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResultDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Exams; 