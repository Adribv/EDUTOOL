import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Flag as FlagIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  Assessment as AssessmentIcon,
  Timer as TimerIcon,
  Grade as GradeIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const MCQResults = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  useEffect(() => {
    loadResults();
  }, [assignmentId]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getMCQSubmissionResults(assignmentId);
      console.log('MCQ Results response:', response.data);
      setResults(response.data);
    } catch (error) {
      console.error('Error loading MCQ results:', error);
      toast.error('Failed to load results');
      navigate('/student/mcq-assignments-list');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 80) return 'info';
    if (percentage >= 70) return 'warning';
    return 'error';
  };

  const getGradeLetter = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const handleViewQuestionDetails = (question) => {
    setSelectedQuestion(question);
    setShowDetailedView(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!results) {
    return (
      <Box p={3}>
        <Alert severity="error">Results not found</Alert>
      </Box>
    );
  }

  // Destructure with null checks
  const { assignment, submission, performance } = results;

  // Additional safety checks
  if (!assignment || !submission || !performance) {
    return (
      <Box p={3}>
        <Alert severity="error">Invalid results data structure</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">MCQ Assignment Results</Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/student/assignments')}
        >
          Back to Assignments
        </Button>
      </Box>

      {/* Assignment Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>{assignment.title}</Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {assignment.description}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <Chip label={`${assignment.class} - ${assignment.section}`} />
            <Chip label={assignment.subject} />
            <Chip label={`${assignment.questions.length} Questions`} />
            <Chip label={`${assignment.maxMarks} Total Marks`} />
          </Box>

          <Typography variant="body2" color="text.secondary">
            Due Date: {new Date(assignment.dueDate).toLocaleDateString()}
          </Typography>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <GradeIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h4" color="primary">
                {performance.score}/{performance.totalMarks}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AssessmentIcon color="info" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {performance.percentage}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Percentage
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Chip 
                label={getGradeLetter(performance.percentage)}
                color={getGradeColor(performance.percentage)}
                sx={{ fontSize: '2rem', height: 60, width: 60, mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Grade
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TimerIcon color="secondary" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h6" color="secondary.main">
                {formatTime(submission.timeTaken || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Time Taken
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Performance */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Question Analysis</Typography>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Question</TableCell>
                      <TableCell>Your Answer</TableCell>
                      <TableCell>Correct Answer</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Points</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {submission.answers
                      .map((answer, index) => {
                        const question = assignment.questions.find(q => q._id.toString() === answer.questionId);
                        if (!question) {
                          console.warn('Question not found for answer:', answer);
                          return null;
                        }
                        
                        const isCorrect = answer.isCorrect;
                        const selectedOption = question.options[answer.selectedOption];
                        const correctOption = question.options.find(opt => opt.isCorrect);
                        
                        return (
                          <TableRow key={answer.questionId || index}>
                            <TableCell>
                              <Typography variant="body2">
                                {question.question.substring(0, 50)}...
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {isCorrect ? (
                                  <CheckCircleIcon color="success" fontSize="small" />
                                ) : (
                                  <CancelIcon color="error" fontSize="small" />
                                )}
                                <Typography variant="body2">
                                  {selectedOption?.text || 'Not answered'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {correctOption?.text}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={isCorrect ? 'Correct' : 'Incorrect'}
                                color={isCorrect ? 'success' : 'error'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {isCorrect ? question.points : 0} / {question.points}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewQuestionDetails({
                                    ...question,
                                    studentAnswer: answer,
                                    questionIndex: index
                                  })}
                                >
                                  <VisibilityIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })
                      .filter(Boolean)
                    }
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Performance Summary</Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${performance.correctAnswers} Correct Answers`}
                    secondary={`${performance.questionsAnswered} questions attempted`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CancelIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${performance.incorrectAnswers} Incorrect Answers`}
                    secondary={`${performance.questionsAnswered - performance.correctAnswers} wrong answers`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <FlagIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${performance.unansweredQuestions} Unanswered`}
                    secondary={`${assignment.questions.length - performance.questionsAnswered} questions skipped`}
                  />
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>Score Breakdown</Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Correct Answers</Typography>
                  <Typography variant="body2">{performance.correctAnswers * assignment.questions[0]?.points || 0} pts</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Incorrect Answers</Typography>
                  <Typography variant="body2">0 pts</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Unanswered</Typography>
                  <Typography variant="body2">0 pts</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2">Total</Typography>
                  <Typography variant="subtitle2">{performance.score} pts</Typography>
                </Box>
              </Box>

              {performance.percentage >= 70 ? (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Great job! You passed this assignment.
                </Alert>
              ) : (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Keep practicing! Review the questions you got wrong.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Question Details Dialog */}
      <Dialog open={showDetailedView} onClose={() => setShowDetailedView(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Question {selectedQuestion?.questionIndex + 1} Details
        </DialogTitle>
        <DialogContent>
          {selectedQuestion && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedQuestion.question}
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>Options:</Typography>
              {selectedQuestion.options.map((option, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Chip
                    label={option.text}
                    color={
                      option.isCorrect 
                        ? 'success' 
                        : index === selectedQuestion.studentAnswer.selectedOption
                        ? 'error'
                        : 'default'
                    }
                    variant={
                      option.isCorrect || index === selectedQuestion.studentAnswer.selectedOption
                        ? 'filled'
                        : 'outlined'
                    }
                    icon={
                      option.isCorrect 
                        ? <CheckCircleIcon />
                        : index === selectedQuestion.studentAnswer.selectedOption
                        ? <CancelIcon />
                        : null
                    }
                  />
                </Box>
              ))}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>Your Answer:</Typography>
              <Typography variant="body1" paragraph>
                {selectedQuestion.options[selectedQuestion.studentAnswer.selectedOption]?.text || 'Not answered'}
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>Correct Answer:</Typography>
              <Typography variant="body1" paragraph>
                {selectedQuestion.options.find(opt => opt.isCorrect)?.text}
              </Typography>
              
              {selectedQuestion.explanation && (
                <>
                  <Typography variant="subtitle2" gutterBottom>Explanation:</Typography>
                  <Typography variant="body1" paragraph>
                    {selectedQuestion.explanation}
                  </Typography>
                </>
              )}
              
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={selectedQuestion.studentAnswer.isCorrect ? 'Correct' : 'Incorrect'}
                  color={selectedQuestion.studentAnswer.isCorrect ? 'success' : 'error'}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Points: {selectedQuestion.studentAnswer.isCorrect ? selectedQuestion.points : 0} / {selectedQuestion.points}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailedView(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MCQResults; 