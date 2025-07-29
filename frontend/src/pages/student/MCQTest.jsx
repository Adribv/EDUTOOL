import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Paper,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Timer as TimerIcon,
  Warning as WarningIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Flag as FlagIcon,
  Send as SendIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const MCQTest = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [assignment, setAssignment] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    loadAssignment();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [assignmentId]);

  useEffect(() => {
    if (assignment && assignment.timeLimit > 0 && !isPaused) {
      startTimer();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [assignment, isPaused]);

  const loadAssignment = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.startMCQAssignment(assignmentId);
      setAssignment(response.data.assignment);
      setTimeLeft(response.data.assignment.timeLimit * 60); // Convert to seconds
      
      // Initialize answers object
      const initialAnswers = {};
      response.data.assignment.questions.forEach((q, index) => {
        initialAnswers[index] = null;
      });
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Error loading MCQ assignment:', error);
      toast.error('Failed to load assignment');
      navigate('/student/mcq-assignments-list');
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAutoSubmit = async () => {
    toast.warning('Time is up! Submitting your answers automatically.');
    await submitAssignment();
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionIndex, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleFlagQuestion = (questionIndex) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionIndex)) {
        newSet.delete(questionIndex);
      } else {
        newSet.add(questionIndex);
      }
      return newSet;
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < assignment.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleGoToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handlePauseResume = () => {
    setIsPaused(prev => !prev);
    if (isPaused) {
      startTimer();
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const submitAssignment = async () => {
    try {
      setSubmitting(true);
      
      // Convert answers to the format expected by the API
      const answersArray = Object.entries(answers).map(([questionIndex, selectedOption]) => ({
        questionId: assignment.questions[parseInt(questionIndex)]._id,
        selectedOption: selectedOption,
        timeSpent: 0 // You could track individual question time if needed
      }));

      await studentAPI.submitMCQAssignment(assignmentId, {
        answers: answersArray
      });

      toast.success('Assignment submitted successfully!');
      
      // Navigate to results page or show results
      navigate(`/student/mcq-results/${assignmentId}`);
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error('Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const getAnsweredQuestionsCount = () => {
    return Object.values(answers).filter(answer => answer !== null).length;
  };

  const getProgressPercentage = () => {
    return (getAnsweredQuestionsCount() / assignment?.questions.length) * 100;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!assignment) {
    return (
      <Box p={3}>
        <Alert severity="error">Assignment not found</Alert>
      </Box>
    );
  }

  const currentQuestion = assignment.questions[currentQuestionIndex];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">{assignment.title}</Typography>
            {assignment.timeLimit > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimerIcon color={timeLeft < 300 ? 'error' : 'primary'} />
                <Typography 
                  variant="h6" 
                  color={timeLeft < 300 ? 'error' : 'primary'}
                  sx={{ fontFamily: 'monospace' }}
                >
                  {formatTime(timeLeft)}
                </Typography>
                <IconButton onClick={handlePauseResume} size="small">
                  {isPaused ? <PlayArrowIcon /> : <PauseIcon />}
                </IconButton>
              </Box>
            )}
          </Box>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            {assignment.description}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip label={`${assignment.questions.length} Questions`} />
            <Chip label={`${assignment.class} - ${assignment.section}`} />
            <Chip label={assignment.subject} />
            {assignment.timeLimit > 0 && (
              <Chip label={`${assignment.timeLimit} min time limit`} />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2">
              Progress: {getAnsweredQuestionsCount()} / {assignment.questions.length} questions answered
            </Typography>
            <Typography variant="body2">
              {Math.round(getProgressPercentage())}% Complete
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={getProgressPercentage()} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Main Question Area */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              {/* Question Navigation */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Question {currentQuestionIndex + 1} of {assignment.questions.length}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Flag for review">
                    <IconButton
                      onClick={() => handleFlagQuestion(currentQuestionIndex)}
                      color={flaggedQuestions.has(currentQuestionIndex) ? 'primary' : 'default'}
                    >
                      <FlagIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Question */}
              <Typography variant="h6" paragraph>
                {currentQuestion.question}
              </Typography>

              {/* Options */}
              <FormControl component="fieldset" sx={{ width: '100%' }}>
                <RadioGroup
                  value={answers[currentQuestionIndex] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestionIndex, parseInt(e.target.value))}
                >
                  {currentQuestion.options.map((option, optionIndex) => (
                    <FormControlLabel
                      key={optionIndex}
                      value={optionIndex}
                      control={<Radio />}
                      label={option.text}
                      sx={{
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        p: 1,
                        mb: 1,
                        '&:hover': {
                          backgroundColor: '#f5f5f5'
                        },
                        '&.Mui-checked': {
                          borderColor: 'primary.main',
                          backgroundColor: 'primary.50'
                        }
                      }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>

              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<NavigateBeforeIcon />}
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setShowReviewDialog(true)}
                  >
                    Review
                  </Button>
                  <Button
                    variant="contained"
                    endIcon={<NavigateNextIcon />}
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === assignment.questions.length - 1}
                  >
                    Next
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Question Navigator */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Question Navigator
              </Typography>
              
              <Grid container spacing={1}>
                {assignment.questions.map((question, index) => (
                  <Grid item xs={3} key={index}>
                    <Button
                      variant={
                        answers[index] !== null 
                          ? 'contained' 
                          : flaggedQuestions.has(index)
                          ? 'outlined'
                          : 'outlined'
                      }
                      color={
                        answers[index] !== null 
                          ? 'success' 
                          : flaggedQuestions.has(index)
                          ? 'warning'
                          : 'default'
                      }
                      size="small"
                      onClick={() => handleGoToQuestion(index)}
                      sx={{ 
                        minWidth: 'auto',
                        width: '100%',
                        height: 40
                      }}
                    >
                      {index + 1}
                    </Button>
                  </Grid>
                ))}
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>Legend:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ width: 16, height: 16, backgroundColor: 'success.main', borderRadius: 1 }} />
                  <Typography variant="body2">Answered</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ width: 16, height: 16, border: '1px solid #ff9800', borderRadius: 1 }} />
                  <Typography variant="body2">Flagged</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, border: '1px solid #ccc', borderRadius: 1 }} />
                  <Typography variant="body2">Unanswered</Typography>
                </Box>
              </Box>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<SendIcon />}
                onClick={() => setShowSubmitDialog(true)}
                disabled={submitting}
              >
                {submitting ? <CircularProgress size={20} /> : 'Submit Assignment'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onClose={() => setShowSubmitDialog(false)}>
        <DialogTitle>Submit Assignment</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Are you sure you want to submit your assignment?
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText 
                primary={`${getAnsweredQuestionsCount()} questions answered`}
                secondary={`${assignment.questions.length - getAnsweredQuestionsCount()} questions unanswered`}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <FlagIcon color="warning" />
              </ListItemIcon>
              <ListItemText 
                primary={`${flaggedQuestions.size} questions flagged for review`}
              />
            </ListItem>
          </List>
          {getAnsweredQuestionsCount() < assignment.questions.length && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              You have unanswered questions. You can still submit, but unanswered questions will be marked as incorrect.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSubmitDialog(false)}>Cancel</Button>
          <Button onClick={submitAssignment} variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={20} /> : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onClose={() => setShowReviewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Review Your Answers</DialogTitle>
        <DialogContent>
          <List>
            {assignment.questions.map((question, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={`Question ${index + 1}`}
                  secondary={
                    <Box>
                      <Typography variant="body2" paragraph>
                        {question.question}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          label={answers[index] !== null ? 'Answered' : 'Not Answered'} 
                          color={answers[index] !== null ? 'success' : 'error'}
                          size="small"
                        />
                        {flaggedQuestions.has(index) && (
                          <Chip label="Flagged" color="warning" size="small" />
                        )}
                        {answers[index] !== null && (
                          <Chip 
                            label={`Selected: ${question.options[answers[index]]?.text}`}
                            variant="outlined"
                            size="small"
                          />
                        )}
                      </Box>
                    </Box>
                  }
                />
                <Button
                  size="small"
                  onClick={() => {
                    setCurrentQuestionIndex(index);
                    setShowReviewDialog(false);
                  }}
                >
                  Go to Question
                </Button>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReviewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MCQTest; 