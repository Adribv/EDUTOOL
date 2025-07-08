import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  FormControl,
  FormControlLabel,
  Switch,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Radio,
  RadioGroup,
  Checkbox,
  FormGroup,
  Tooltip,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  DragIndicator as DragIndicatorIcon,
  ContentCopy as ContentCopyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Timer as TimerIcon,
  Shuffle as ShuffleIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { teacherAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';

const MCQBuilder = () => {
  const { user } = useAuth();
  const staffId = user?._id || user?.id;
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Assignment basic info
  const [assignment, setAssignment] = useState({
    title: '',
    description: '',
    class: '',
    section: '',
    subject: '',
    dueDate: '',
    maxMarks: 100,
    instructions: ''
  });

  // MCQ specific settings
  const [mcqSettings, setMcqSettings] = useState({
    timeLimit: 0, // 0 means no time limit
    allowReview: true,
    showResults: true,
    randomizeQuestions: false,
    randomizeOptions: false
  });

  // Questions array
  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: '',
      options: [
        { id: 1, text: '', isCorrect: false },
        { id: 2, text: '', isCorrect: false },
        { id: 3, text: '', isCorrect: false },
        { id: 4, text: '', isCorrect: false }
      ],
      points: 1,
      explanation: ''
    }
  ]);

  // Form validation
  const [errors, setErrors] = useState({});

  // Fetch teacher's coordinated classes
  const { data: coordinatedClasses, isLoading: classesLoading } = useQuery({
    queryKey: ['coordinatedClasses', staffId],
    queryFn: () => teacherAPI.getClasses(staffId),
    enabled: !!staffId
  });

  // Extract unique classes and sections from coordinated classes
  const classes = coordinatedClasses ? [...new Set(coordinatedClasses.map(cls => cls.grade || cls.name))] : [];
  const sections = coordinatedClasses ? [...new Set(coordinatedClasses.map(cls => cls.section))] : [];

  useEffect(() => {
    // Set default due date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setAssignment(prev => ({
      ...prev,
      dueDate: tomorrow.toISOString().split('T')[0]
    }));
  }, []);

  // Show loading state while fetching data
  if (classesLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error if no classes are assigned
  if (!classesLoading && (!coordinatedClasses || coordinatedClasses.length === 0)) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          <Typography variant="h6" gutterBottom>
            No Classes Assigned
          </Typography>
          <Typography variant="body2">
            You don't have any classes assigned to you yet. Please contact your administrator to get assigned to classes before creating MCQ assignments.
          </Typography>
        </Alert>
      </Box>
    );
  }

  const validateForm = () => {
    const newErrors = {};

    // Validate basic assignment info
    if (!assignment.title.trim()) newErrors.title = 'Title is required';
    if (!assignment.description.trim()) newErrors.description = 'Description is required';
    if (!assignment.class) newErrors.class = 'Class is required';
    if (!assignment.section) newErrors.section = 'Section is required';
    if (!assignment.subject) newErrors.subject = 'Subject is required';
    if (!assignment.dueDate) newErrors.dueDate = 'Due date is required';

    // Validate questions
    if (questions.length === 0) {
      newErrors.questions = 'At least one question is required';
    } else {
      questions.forEach((q, index) => {
        if (!q.question.trim()) {
          newErrors[`question_${index}`] = 'Question text is required';
        }
        
        const validOptions = q.options.filter(opt => opt.text.trim() !== '');
        if (validOptions.length < 2) {
          newErrors[`options_${index}`] = 'At least 2 options are required';
        }
        
        const correctOptions = q.options.filter(opt => opt.isCorrect);
        if (correctOptions.length === 0) {
          newErrors[`correct_${index}`] = 'At least one correct answer is required';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAssignmentChange = (field, value) => {
    setAssignment(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleMcqSettingsChange = (field, value) => {
    setMcqSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question: '',
      options: [
        { id: 1, text: '', isCorrect: false },
        { id: 2, text: '', isCorrect: false },
        { id: 3, text: '', isCorrect: false },
        { id: 4, text: '', isCorrect: false }
      ],
      points: 1,
      explanation: ''
    };
    setQuestions(prev => [...prev, newQuestion]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(prev => prev.filter((_, i) => i !== index));
    } else {
      toast.warning('At least one question is required');
    }
  };

  const updateQuestion = (index, field, value) => {
    setQuestions(prev => prev.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    ));
  };

  const updateOption = (questionIndex, optionIndex, field, value) => {
    setQuestions(prev => prev.map((q, i) => 
      i === questionIndex ? {
        ...q,
        options: q.options.map((opt, j) => 
          j === optionIndex ? { ...opt, [field]: value } : opt
        )
      } : q
    ));
  };

  const addOption = (questionIndex) => {
    setQuestions(prev => prev.map((q, i) => 
      i === questionIndex ? {
        ...q,
        options: [...q.options, { 
          id: Date.now(), 
          text: '', 
          isCorrect: false 
        }]
      } : q
    ));
  };

  const removeOption = (questionIndex, optionIndex) => {
    setQuestions(prev => prev.map((q, i) => 
      i === questionIndex ? {
        ...q,
        options: q.options.filter((_, j) => j !== optionIndex)
      } : q
    ));
  };

  const duplicateQuestion = (index) => {
    const questionToDuplicate = questions[index];
    const newQuestion = {
      ...questionToDuplicate,
      id: Date.now(),
      question: `${questionToDuplicate.question} (Copy)`,
      options: questionToDuplicate.options.map(opt => ({
        ...opt,
        id: Date.now() + Math.random()
      }))
    };
    setQuestions(prev => [...prev, newQuestion]);
  };

  const saveAssignment = async (status = 'Draft') => {
    if (!validateForm()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    setSaving(true);
    try {
      const assignmentData = {
        ...assignment,
        ...mcqSettings,
        questions: questions.map(q => ({
          question: q.question,
          options: q.options,
          points: q.points,
          explanation: q.explanation
        })),
        status
      };

      await teacherAPI.createMCQAssignment(assignmentData);
      toast.success(`MCQ Assignment ${status === 'Draft' ? 'saved as draft' : 'published'} successfully!`);
      
      // Reset form if published
      if (status === 'Active') {
        resetForm();
      }
    } catch (error) {
      console.error('Error saving MCQ assignment:', error);
      toast.error('Failed to save MCQ assignment');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setAssignment({
      title: '',
      description: '',
      class: '',
      section: '',
      subject: '',
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      maxMarks: 100,
      instructions: ''
    });
    setMcqSettings({
      timeLimit: 0,
      allowReview: true,
      showResults: true,
      randomizeQuestions: false,
      randomizeOptions: false
    });
    setQuestions([{
      id: 1,
      question: '',
      options: [
        { id: 1, text: '', isCorrect: false },
        { id: 2, text: '', isCorrect: false },
        { id: 3, text: '', isCorrect: false },
        { id: 4, text: '', isCorrect: false }
      ],
      points: 1,
      explanation: ''
    }]);
    setErrors({});
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          MCQ Assignment Builder
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PreviewIcon />}
            onClick={() => setPreviewOpen(true)}
          >
            Preview
          </Button>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setSettingsOpen(true)}
          >
            Settings
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => saveAssignment('Draft')}
            disabled={saving}
          >
            {saving ? <CircularProgress size={20} /> : 'Save Draft'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => saveAssignment('Active')}
            disabled={saving}
          >
            {saving ? <CircularProgress size={20} /> : 'Publish'}
          </Button>
        </Box>
      </Box>

      {/* Basic Assignment Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Assignment Details
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Assignment Title"
                value={assignment.title}
                onChange={(e) => handleAssignmentChange('title', e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                placeholder="Enter assignment title..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={assignment.description}
                onChange={(e) => handleAssignmentChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
                placeholder="Describe what this assignment covers..."
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth error={!!errors.class}>
                <InputLabel>Class</InputLabel>
                <Select
                  value={assignment.class}
                  onChange={(e) => handleAssignmentChange('class', e.target.value)}
                  label="Class"
                >
                  {classes.length > 0 ? (
                    classes.map(cls => (
                      <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No classes assigned</MenuItem>
                  )}
                </Select>
                {errors.class && <Typography variant="caption" color="error">{errors.class}</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth error={!!errors.section}>
                <InputLabel>Section</InputLabel>
                <Select
                  value={assignment.section}
                  onChange={(e) => handleAssignmentChange('section', e.target.value)}
                  label="Section"
                >
                  {sections.length > 0 ? (
                    sections.map(sec => (
                      <MenuItem key={sec} value={sec}>{sec}</MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No sections available</MenuItem>
                  )}
                </Select>
                {errors.section && <Typography variant="caption" color="error">{errors.section}</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Subject"
                value={assignment.subject}
                onChange={(e) => handleAssignmentChange('subject', e.target.value)}
                error={!!errors.subject}
                helperText={errors.subject}
                placeholder="Enter subject name..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Due Date"
                value={assignment.dueDate}
                onChange={(e) => handleAssignmentChange('dueDate', e.target.value)}
                error={!!errors.dueDate}
                helperText={errors.dueDate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Max Marks"
                value={assignment.maxMarks}
                onChange={(e) => handleAssignmentChange('maxMarks', parseInt(e.target.value))}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Instructions (Optional)"
                value={assignment.instructions}
                onChange={(e) => handleAssignmentChange('instructions', e.target.value)}
                placeholder="Any special instructions for students..."
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Questions Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Questions ({questions.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip 
                label={`Total Points: ${totalPoints}`} 
                color="primary" 
                variant="outlined" 
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={addQuestion}
              >
                Add Question
              </Button>
            </Box>
          </Box>

          {errors.questions && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.questions}
            </Alert>
          )}

          {questions.map((question, questionIndex) => (
            <Accordion key={question.id} defaultExpanded sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <DragIndicatorIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="subtitle1">
                    Question {questionIndex + 1}
                  </Typography>
                  {errors[`question_${questionIndex}`] && (
                    <Chip 
                      label="Error" 
                      color="error" 
                      size="small" 
                      sx={{ ml: 2 }} 
                    />
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {/* Question Text */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Question"
                      value={question.question}
                      onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                      error={!!errors[`question_${questionIndex}`]}
                      helperText={errors[`question_${questionIndex}`]}
                      placeholder="Enter your question here..."
                    />
                  </Grid>

                  {/* Options */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Options
                    </Typography>
                    {errors[`options_${questionIndex}`] && (
                      <Alert severity="error" sx={{ mb: 1 }}>
                        {errors[`options_${questionIndex}`]}
                      </Alert>
                    )}
                    {errors[`correct_${questionIndex}`] && (
                      <Alert severity="error" sx={{ mb: 1 }}>
                        {errors[`correct_${questionIndex}`]}
                      </Alert>
                    )}
                    
                    {question.options.map((option, optionIndex) => (
                      <Box key={option.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Radio
                          checked={option.isCorrect}
                          onChange={() => updateOption(questionIndex, optionIndex, 'isCorrect', true)}
                          name={`question-${questionIndex}`}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          placeholder={`Option ${optionIndex + 1}`}
                          value={option.text}
                          onChange={(e) => updateOption(questionIndex, optionIndex, 'text', e.target.value)}
                          sx={{ mx: 1 }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => removeOption(questionIndex, optionIndex)}
                          disabled={question.options.length <= 2}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                    
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => addOption(questionIndex)}
                    >
                      Add Option
                    </Button>
                  </Grid>

                  {/* Question Settings */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Points"
                      value={question.points}
                      onChange={(e) => updateQuestion(questionIndex, 'points', parseInt(e.target.value))}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Explanation (Optional)"
                      value={question.explanation}
                      onChange={(e) => updateQuestion(questionIndex, 'explanation', e.target.value)}
                      placeholder="Explanation for the correct answer..."
                    />
                  </Grid>

                  {/* Question Actions */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Tooltip title="Duplicate Question">
                        <IconButton onClick={() => duplicateQuestion(questionIndex)}>
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Question">
                        <IconButton 
                          onClick={() => removeQuestion(questionIndex)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add question"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={addQuestion}
      >
        <AddIcon />
      </Fab>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>MCQ Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Time Limit (minutes)"
                value={mcqSettings.timeLimit}
                onChange={(e) => handleMcqSettingsChange('timeLimit', parseInt(e.target.value))}
                helperText="0 means no time limit"
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={mcqSettings.allowReview}
                      onChange={(e) => handleMcqSettingsChange('allowReview', e.target.checked)}
                    />
                  }
                  label="Allow students to review their answers before submission"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={mcqSettings.showResults}
                      onChange={(e) => handleMcqSettingsChange('showResults', e.target.checked)}
                    />
                  }
                  label="Show results immediately after submission"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={mcqSettings.randomizeQuestions}
                      onChange={(e) => handleMcqSettingsChange('randomizeQuestions', e.target.checked)}
                    />
                  }
                  label="Randomize question order"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={mcqSettings.randomizeOptions}
                      onChange={(e) => handleMcqSettingsChange('randomizeOptions', e.target.checked)}
                    />
                  }
                  label="Randomize option order"
                />
              </FormGroup>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Assignment Preview</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>{assignment.title || 'Untitled Assignment'}</Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {assignment.description || 'No description provided'}
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Chip label={`Class: ${assignment.class || 'Not set'}`} sx={{ mr: 1 }} />
              <Chip label={`Section: ${assignment.section || 'Not set'}`} sx={{ mr: 1 }} />
              <Chip label={`Subject: ${assignment.subject || 'Not set'}`} sx={{ mr: 1 }} />
              <Chip label={`Due: ${assignment.dueDate || 'Not set'}`} />
            </Box>

            {questions.map((q, index) => (
              <Card key={index} sx={{ mb: 2, p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Question {index + 1} ({q.points} points)
                </Typography>
                <Typography variant="body1" paragraph>
                  {q.question || 'No question text'}
                </Typography>
                <RadioGroup>
                  {q.options.map((opt, optIndex) => (
                    <FormControlLabel
                      key={optIndex}
                      value={optIndex}
                      control={<Radio />}
                      label={opt.text || `Option ${optIndex + 1}`}
                    />
                  ))}
                </RadioGroup>
              </Card>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MCQBuilder; 