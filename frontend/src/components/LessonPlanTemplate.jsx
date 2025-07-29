import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Book as BookIcon,
  VideoLibrary as VideoIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  Home as HomeIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

const LessonPlanTemplate = ({ 
  lessonPlan, 
  onSave, 
  isEditing = false, 
  userRole = 'Teacher',
  readOnly = false 
}) => {
  const [editingSection, setEditingSection] = useState(null);
  const [tempData, setTempData] = useState(lessonPlan || {
    title: '',
    class: '',
    subject: '',
    topic: '',
    duration: '',
    date: new Date().toISOString().split('T')[0],
    teacherName: '',
    numberOfStudents: '',
    objectives: [],
    materials: [],
    prerequisiteKnowledge: [],
    introduction: '',
    presentation: [],
    assessment: {
      questions: [],
      worksheet: ''
    },
    summary: '',
    homework: '',
    followUp: ''
  });

  const handleFieldChange = (field, value) => {
    const updatedData = { ...tempData, [field]: value };
    setTempData(updatedData);
    // Update parent state in real-time
    onSave(updatedData);
  };

  const handleArrayFieldChange = (field, index, value) => {
    const updatedData = {
      ...tempData,
      [field]: tempData[field].map((item, i) => i === index ? value : item)
    };
    setTempData(updatedData);
    // Update parent state in real-time
    onSave(updatedData);
  };

  const addArrayItem = (field) => {
    const updatedData = {
      ...tempData,
      [field]: [...tempData[field], '']
    };
    setTempData(updatedData);
    // Update parent state in real-time
    onSave(updatedData);
  };

  const removeArrayItem = (field, index) => {
    const updatedData = {
      ...tempData,
      [field]: tempData[field].filter((_, i) => i !== index)
    };
    setTempData(updatedData);
    // Update parent state in real-time
    onSave(updatedData);
  };

  const handlePresentationChange = (index, field, value) => {
    const updatedData = {
      ...tempData,
      presentation: tempData.presentation.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    };
    setTempData(updatedData);
    // Update parent state in real-time
    onSave(updatedData);
  };

  const addPresentationStep = () => {
    const updatedData = {
      ...tempData,
      presentation: [...tempData.presentation, {
        step: '',
        teacherActivity: '',
        studentActivity: '',
        teachingAids: ''
      }]
    };
    setTempData(updatedData);
    // Update parent state in real-time
    onSave(updatedData);
  };

  const removePresentationStep = (index) => {
    const updatedData = {
      ...tempData,
      presentation: tempData.presentation.filter((_, i) => i !== index)
    };
    setTempData(updatedData);
    // Update parent state in real-time
    onSave(updatedData);
  };

  const handleAssessmentQuestionChange = (index, value) => {
    const updatedData = {
      ...tempData,
      assessment: {
        ...tempData.assessment,
        questions: tempData.assessment.questions.map((q, i) => i === index ? value : q)
      }
    };
    setTempData(updatedData);
    // Update parent state in real-time
    onSave(updatedData);
  };

  const addAssessmentQuestion = () => {
    const updatedData = {
      ...tempData,
      assessment: {
        ...tempData.assessment,
        questions: [...tempData.assessment.questions, '']
      }
    };
    setTempData(updatedData);
    // Update parent state in real-time
    onSave(updatedData);
  };

  const removeAssessmentQuestion = (index) => {
    const updatedData = {
      ...tempData,
      assessment: {
        ...tempData.assessment,
        questions: tempData.assessment.questions.filter((_, i) => i !== index)
      }
    };
    setTempData(updatedData);
    // Update parent state in real-time
    onSave(updatedData);
  };

  const handleSave = () => {
    onSave(tempData);
    setEditingSection(null);
  };

  const handleCancel = () => {
    setTempData(lessonPlan || {});
    setEditingSection(null);
  };

  const renderSection = (title, icon, content, sectionKey) => {
    const isEditing = editingSection === sectionKey;
    
    return (
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            {icon}
            <Typography variant="h6" sx={{ ml: 1 }}>
              {title}
            </Typography>
            {!readOnly && userRole !== 'Student' && (
              <Box sx={{ ml: 'auto' }}>
                {isEditing ? (
                  <>
                    <IconButton size="small" onClick={handleSave} color="primary">
                      <SaveIcon />
                    </IconButton>
                    <IconButton size="small" onClick={handleCancel} color="error">
                      <CancelIcon />
                    </IconButton>
                  </>
                ) : (
                  <IconButton size="small" onClick={() => setEditingSection(sectionKey)}>
                    <EditIcon />
                  </IconButton>
                )}
              </Box>
            )}
          </Box>
          {content}
        </CardContent>
      </Card>
    );
  };

  const renderGeneralInfo = () => (
    <Grid container spacing={2}>
      {/* Title field - most important */}
      <Grid item xs={12}>
        <TextField
          label="Lesson Plan Title"
          fullWidth
          value={tempData.title}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          disabled={!isEditing || readOnly}
          placeholder="e.g., Class 7 Science Lesson Plan"
          sx={{ mb: 2 }}
        />
      </Grid>
      
      {/* Auto-assigned fields - show prominently */}
      <Grid item xs={12}>
        <Box p={2} bgcolor="info.light" borderRadius={1} mb={2}>
          <Typography variant="subtitle2" color="info.dark" gutterBottom>
            📚 Auto-assigned Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <TextField
                label="Class/Grade"
                fullWidth
                value={tempData.class}
                onChange={(e) => handleFieldChange('class', e.target.value)}
                disabled={true}
                size="small"
                helperText="Auto-assigned from your profile"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                label="Section"
                fullWidth
                value={tempData.section}
                onChange={(e) => handleFieldChange('section', e.target.value)}
                disabled={true}
                size="small"
                helperText="Auto-assigned from your profile"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                label="Subject"
                fullWidth
                value={tempData.subject}
                onChange={(e) => handleFieldChange('subject', e.target.value)}
                disabled={true}
                size="small"
                helperText="Auto-assigned from your profile"
              />
            </Grid>
          </Grid>
        </Box>
      </Grid>
      
      {/* Editable fields */}
      <Grid item xs={6} md={3}>
        <TextField
          label="Topic"
          fullWidth
          value={tempData.topic}
          onChange={(e) => handleFieldChange('topic', e.target.value)}
          disabled={!isEditing || readOnly}
          placeholder="e.g., Nutrition in Animals"
        />
      </Grid>
      <Grid item xs={6} md={3}>
        <TextField
          label="Duration"
          fullWidth
          value={tempData.duration}
          onChange={(e) => handleFieldChange('duration', e.target.value)}
          disabled={!isEditing || readOnly}
          placeholder="e.g., 40 Minutes"
        />
      </Grid>
      <Grid item xs={6} md={3}>
        <TextField
          label="Date"
          type="date"
          fullWidth
          value={tempData.date}
          onChange={(e) => handleFieldChange('date', e.target.value)}
          disabled={!isEditing || readOnly}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid item xs={6} md={3}>
        <TextField
          label="Teacher's Name"
          fullWidth
          value={tempData.teacherName}
          onChange={(e) => handleFieldChange('teacherName', e.target.value)}
          disabled={!isEditing || readOnly}
        />
      </Grid>
      <Grid item xs={6} md={3}>
        <TextField
          label="Number of Students"
          fullWidth
          value={tempData.numberOfStudents}
          onChange={(e) => handleFieldChange('numberOfStudents', e.target.value)}
          disabled={!isEditing || readOnly}
          placeholder="e.g., 30"
        />
      </Grid>
    </Grid>
  );

  const renderObjectives = () => (
    <Box>
      <Typography variant="body2" color="textSecondary" mb={2}>
        By the end of the lesson, students will be able to:
      </Typography>
      <List>
        {tempData.objectives.map((objective, index) => (
          <ListItem key={index} sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 30 }}>
              <Typography variant="body2" color="primary">•</Typography>
            </ListItemIcon>
            <ListItemText>
              {editingSection === 'objectives' && !readOnly ? (
                <Box display="flex" alignItems="center">
                  <TextField
                    fullWidth
                    value={objective}
                    onChange={(e) => handleArrayFieldChange('objectives', index, e.target.value)}
                    size="small"
                  />
                  <IconButton 
                    size="small" 
                    onClick={() => removeArrayItem('objectives', index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ) : (
                <Typography variant="body2">{objective}</Typography>
              )}
            </ListItemText>
          </ListItem>
        ))}
      </List>
      {editingSection === 'objectives' && !readOnly && (
        <Button
          startIcon={<AddIcon />}
          onClick={() => addArrayItem('objectives')}
          size="small"
          sx={{ mt: 1 }}
        >
          Add Objective
        </Button>
      )}
    </Box>
  );

  const renderMaterials = () => (
    <Box>
      <List>
        {tempData.materials.map((material, index) => (
          <ListItem key={index} sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 30 }}>
              <Typography variant="body2" color="primary">•</Typography>
            </ListItemIcon>
            <ListItemText>
              {editingSection === 'materials' && !readOnly ? (
                <Box display="flex" alignItems="center">
                  <TextField
                    fullWidth
                    value={material}
                    onChange={(e) => handleArrayFieldChange('materials', index, e.target.value)}
                    size="small"
                  />
                  <IconButton 
                    size="small" 
                    onClick={() => removeArrayItem('materials', index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ) : (
                <Typography variant="body2">{material}</Typography>
              )}
            </ListItemText>
          </ListItem>
        ))}
      </List>
      {editingSection === 'materials' && !readOnly && (
        <Button
          startIcon={<AddIcon />}
          onClick={() => addArrayItem('materials')}
          size="small"
          sx={{ mt: 1 }}
        >
          Add Material
        </Button>
      )}
    </Box>
  );

  const renderPrerequisiteKnowledge = () => (
    <Box>
      <Typography variant="body2" color="textSecondary" mb={2}>
        Students should:
      </Typography>
      <List>
        {tempData.prerequisiteKnowledge.map((knowledge, index) => (
          <ListItem key={index} sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 30 }}>
              <Typography variant="body2" color="primary">•</Typography>
            </ListItemIcon>
            <ListItemText>
              {editingSection === 'prerequisiteKnowledge' && !readOnly ? (
                <Box display="flex" alignItems="center">
                  <TextField
                    fullWidth
                    value={knowledge}
                    onChange={(e) => handleArrayFieldChange('prerequisiteKnowledge', index, e.target.value)}
                    size="small"
                  />
                  <IconButton 
                    size="small" 
                    onClick={() => removeArrayItem('prerequisiteKnowledge', index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ) : (
                <Typography variant="body2">{knowledge}</Typography>
              )}
            </ListItemText>
          </ListItem>
        ))}
      </List>
      {editingSection === 'prerequisiteKnowledge' && !readOnly && (
        <Button
          startIcon={<AddIcon />}
          onClick={() => addArrayItem('prerequisiteKnowledge')}
          size="small"
          sx={{ mt: 1 }}
        >
          Add Prerequisite
        </Button>
      )}
    </Box>
  );

  const renderIntroduction = () => (
    <TextField
      label="Lesson Introduction (Set Induction)"
      fullWidth
      multiline
      rows={4}
      value={tempData.introduction}
      onChange={(e) => handleFieldChange('introduction', e.target.value)}
      disabled={!isEditing || readOnly}
      placeholder="Describe the activity to introduce the lesson..."
    />
  );

  const renderPresentation = () => (
    <Box>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Step</TableCell>
              <TableCell>Teacher Activity</TableCell>
              <TableCell>Student Activity</TableCell>
              <TableCell>Teaching Aids</TableCell>
              {editingSection === 'presentation' && !readOnly && (
                <TableCell>Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {tempData.presentation.map((step, index) => (
              <TableRow key={index}>
                <TableCell>
                  {editingSection === 'presentation' && !readOnly ? (
                    <TextField
                      value={step.step}
                      onChange={(e) => handlePresentationChange(index, 'step', e.target.value)}
                      size="small"
                      fullWidth
                    />
                  ) : (
                    step.step
                  )}
                </TableCell>
                <TableCell>
                  {editingSection === 'presentation' && !readOnly ? (
                    <TextField
                      value={step.teacherActivity}
                      onChange={(e) => handlePresentationChange(index, 'teacherActivity', e.target.value)}
                      size="small"
                      fullWidth
                      multiline
                    />
                  ) : (
                    step.teacherActivity
                  )}
                </TableCell>
                <TableCell>
                  {editingSection === 'presentation' && !readOnly ? (
                    <TextField
                      value={step.studentActivity}
                      onChange={(e) => handlePresentationChange(index, 'studentActivity', e.target.value)}
                      size="small"
                      fullWidth
                      multiline
                    />
                  ) : (
                    step.studentActivity
                  )}
                </TableCell>
                <TableCell>
                  {editingSection === 'presentation' && !readOnly ? (
                    <TextField
                      value={step.teachingAids}
                      onChange={(e) => handlePresentationChange(index, 'teachingAids', e.target.value)}
                      size="small"
                      fullWidth
                    />
                  ) : (
                    step.teachingAids
                  )}
                </TableCell>
                {editingSection === 'presentation' && !readOnly && (
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => removePresentationStep(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {editingSection === 'presentation' && !readOnly && (
        <Button
          startIcon={<AddIcon />}
          onClick={addPresentationStep}
          size="small"
          sx={{ mt: 1 }}
        >
          Add Step
        </Button>
      )}
    </Box>
  );

  const renderAssessment = () => (
    <Box>
      <Typography variant="subtitle2" gutterBottom>Questions:</Typography>
      <List>
        {tempData.assessment.questions.map((question, index) => (
          <ListItem key={index} sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 30 }}>
              <Typography variant="body2" color="primary">•</Typography>
            </ListItemIcon>
            <ListItemText>
              {editingSection === 'assessment' && !readOnly ? (
                <Box display="flex" alignItems="center">
                  <TextField
                    fullWidth
                    value={question}
                    onChange={(e) => handleAssessmentQuestionChange(index, e.target.value)}
                    size="small"
                  />
                  <IconButton 
                    size="small" 
                    onClick={() => removeAssessmentQuestion(index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ) : (
                <Typography variant="body2">{question}</Typography>
              )}
            </ListItemText>
          </ListItem>
        ))}
      </List>
      {editingSection === 'assessment' && !readOnly && (
        <Button
          startIcon={<AddIcon />}
          onClick={addAssessmentQuestion}
          size="small"
          sx={{ mt: 1, mb: 2 }}
        >
          Add Question
        </Button>
      )}
      
      <Typography variant="subtitle2" gutterBottom>Worksheet:</Typography>
      <TextField
        fullWidth
        multiline
        rows={3}
        value={tempData.assessment.worksheet}
        onChange={(e) => {
          const updatedData = {
            ...tempData,
            assessment: {
              ...tempData.assessment,
              worksheet: e.target.value
            }
          };
          setTempData(updatedData);
          onSave(updatedData);
        }}
        disabled={!isEditing || readOnly}
        placeholder="Describe the worksheet or assessment activity..."
      />
    </Box>
  );

  const renderSummary = () => (
    <TextField
      label="Recapitulation / Summary"
      fullWidth
      multiline
      rows={3}
      value={tempData.summary}
      onChange={(e) => handleFieldChange('summary', e.target.value)}
      disabled={!isEditing || readOnly}
      placeholder="Summarize the key points of the lesson..."
    />
  );

  const renderHomework = () => (
    <TextField
      label="Homework"
      fullWidth
      multiline
      rows={3}
      value={tempData.homework}
      onChange={(e) => handleFieldChange('homework', e.target.value)}
      disabled={!isEditing || readOnly}
      placeholder="Assign homework activities..."
    />
  );

  const renderFollowUp = () => (
    <TextField
      label="Follow-up / Remedial Measures"
      fullWidth
      multiline
      rows={3}
      value={tempData.followUp}
      onChange={(e) => handleFieldChange('followUp', e.target.value)}
      disabled={!isEditing || readOnly}
      placeholder="Describe follow-up activities for struggling students and advanced learners..."
    />
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
        📗 {tempData.title || 'Lesson Plan Template'}
      </Typography>
      {!tempData.title && (
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Please enter a title for your lesson plan above
        </Typography>
      )}
      
      {renderSection('1. General Information', <SchoolIcon color="primary" />, renderGeneralInfo(), 'generalInfo')}
      {renderSection('2. Instructional Objectives', <AssignmentIcon color="warning" />, renderObjectives(), 'objectives')}
      {renderSection('3. Teaching Aids / Materials Required', <VideoIcon color="success" />, renderMaterials(), 'materials')}
      {renderSection('4. Prerequisite Knowledge', <BookIcon color="info" />, renderPrerequisiteKnowledge(), 'prerequisiteKnowledge')}
      {renderSection('5. Lesson Introduction (Set Induction)', <TrendingUpIcon color="error" />, renderIntroduction(), 'introduction')}
      {renderSection('6. Presentation / Teaching-Learning Process', <SchoolIcon color="primary" />, renderPresentation(), 'presentation')}
      {renderSection('7. Assessment / Evaluation', <QuizIcon color="warning" />, renderAssessment(), 'assessment')}
      {renderSection('8. Recapitulation / Summary', <TrendingUpIcon color="success" />, renderSummary(), 'summary')}
      {renderSection('9. Homework', <HomeIcon color="info" />, renderHomework(), 'homework')}
      {renderSection('10. Follow-up / Remedial Measures', <TrendingUpIcon color="error" />, renderFollowUp(), 'followUp')}
    </Box>
  );
};

export default LessonPlanTemplate; 