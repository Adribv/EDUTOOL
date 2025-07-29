import React, { useState, useEffect } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assessment as AssessmentIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { hodAPI } from '../../services/api';
import { toast } from 'react-toastify';

const TeacherEvaluation = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    teacherId: '',
    rating: 0,
    comments: '',
    evaluationDate: new Date().toISOString().split('T')[0],
    criteria: {
      teachingQuality: 0,
      studentEngagement: 0,
      lessonPreparation: 0,
      classroomManagement: 0,
      professionalDevelopment: 0,
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [evaluationsResponse, teachersResponse] = await Promise.all([
        hodAPI.getTeacherEvaluations(),
        hodAPI.getStaff(),
      ]);
      
      setEvaluations(evaluationsResponse.data || []);
      setTeachers(teachersResponse.data || []);
      setError(null);
    } catch (error) {
      setError('Failed to load evaluation data');
      toast.error('Failed to load evaluation data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (evaluation = null) => {
    if (evaluation) {
      setSelectedEvaluation(evaluation);
      setFormData({
        teacherId: evaluation.teacherId,
        rating: evaluation.rating,
        comments: evaluation.comments,
        evaluationDate: evaluation.evaluationDate,
        criteria: evaluation.criteria || {
          teachingQuality: 0,
          studentEngagement: 0,
          lessonPreparation: 0,
          classroomManagement: 0,
          professionalDevelopment: 0,
        },
      });
    } else {
      setSelectedEvaluation(null);
      setFormData({
        teacherId: '',
        rating: 0,
        comments: '',
        evaluationDate: new Date().toISOString().split('T')[0],
        criteria: {
          teachingQuality: 0,
          studentEngagement: 0,
          lessonPreparation: 0,
          classroomManagement: 0,
          professionalDevelopment: 0,
        },
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedEvaluation(null);
    setFormData({
      teacherId: '',
      rating: 0,
      comments: '',
      evaluationDate: new Date().toISOString().split('T')[0],
      criteria: {
        teachingQuality: 0,
        studentEngagement: 0,
        lessonPreparation: 0,
        classroomManagement: 0,
        professionalDevelopment: 0,
      },
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCriteriaChange = (criteria, value) => {
    setFormData((prev) => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        [criteria]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedEvaluation) {
        await hodAPI.updateTeacherEvaluation(selectedEvaluation.id, formData);
        toast.success('Evaluation updated successfully');
      } else {
        await hodAPI.createTeacherEvaluation(formData);
        toast.success('Evaluation created successfully');
      }
      handleCloseDialog();
      fetchData();
    } catch (error) {
      toast.error('Failed to save evaluation');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this evaluation?')) {
      try {
        await hodAPI.deleteTeacherEvaluation(id);
        toast.success('Evaluation deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete evaluation');
      }
    }
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? teacher.name : 'Unknown Teacher';
  };

  const calculateAverageRating = (criteria) => {
    const values = Object.values(criteria);
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'success';
    if (rating >= 3) return 'warning';
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Teacher Evaluation</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          New Evaluation
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Evaluations
              </Typography>
              <Typography variant="h4">{evaluations.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Rating
              </Typography>
              <Typography variant="h4">
                {evaluations.length > 0
                  ? (evaluations.reduce((sum, eval) => sum + eval.rating, 0) / evaluations.length).toFixed(1)
                  : '0.0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Teachers Evaluated
              </Typography>
              <Typography variant="h4">
                {new Set(evaluations.map((eval) => eval.teacherId)).size}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Evaluations Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Teacher</TableCell>
              <TableCell>Overall Rating</TableCell>
              <TableCell>Teaching Quality</TableCell>
              <TableCell>Student Engagement</TableCell>
              <TableCell>Lesson Preparation</TableCell>
              <TableCell>Classroom Management</TableCell>
              <TableCell>Professional Development</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {evaluations.map((evaluation) => (
              <TableRow key={evaluation.id}>
                <TableCell>{getTeacherName(evaluation.teacherId)}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating value={evaluation.rating} readOnly size="small" />
                    <Typography variant="body2">({evaluation.rating})</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={evaluation.criteria?.teachingQuality || 0}
                    color={getRatingColor(evaluation.criteria?.teachingQuality || 0)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={evaluation.criteria?.studentEngagement || 0}
                    color={getRatingColor(evaluation.criteria?.studentEngagement || 0)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={evaluation.criteria?.lessonPreparation || 0}
                    color={getRatingColor(evaluation.criteria?.lessonPreparation || 0)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={evaluation.criteria?.classroomManagement || 0}
                    color={getRatingColor(evaluation.criteria?.classroomManagement || 0)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={evaluation.criteria?.professionalDevelopment || 0}
                    color={getRatingColor(evaluation.criteria?.professionalDevelopment || 0)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(evaluation.evaluationDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(evaluation)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(evaluation.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Evaluation Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedEvaluation ? 'Edit Evaluation' : 'New Evaluation'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Teacher</InputLabel>
                <Select
                  name="teacherId"
                  value={formData.teacherId}
                  label="Teacher"
                  onChange={handleChange}
                >
                  {teachers.map((teacher) => (
                    <MenuItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Overall Rating
              </Typography>
              <Rating
                name="rating"
                value={formData.rating}
                onChange={(event, newValue) => {
                  setFormData((prev) => ({ ...prev, rating: newValue }));
                }}
                size="large"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Teaching Quality
              </Typography>
              <Rating
                value={formData.criteria.teachingQuality}
                onChange={(event, newValue) => handleCriteriaChange('teachingQuality', newValue)}
                size="medium"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Student Engagement
              </Typography>
              <Rating
                value={formData.criteria.studentEngagement}
                onChange={(event, newValue) => handleCriteriaChange('studentEngagement', newValue)}
                size="medium"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Lesson Preparation
              </Typography>
              <Rating
                value={formData.criteria.lessonPreparation}
                onChange={(event, newValue) => handleCriteriaChange('lessonPreparation', newValue)}
                size="medium"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Classroom Management
              </Typography>
              <Rating
                value={formData.criteria.classroomManagement}
                onChange={(event, newValue) => handleCriteriaChange('classroomManagement', newValue)}
                size="medium"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Professional Development
              </Typography>
              <Rating
                value={formData.criteria.professionalDevelopment}
                onChange={(event, newValue) => handleCriteriaChange('professionalDevelopment', newValue)}
                size="medium"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Evaluation Date"
                type="date"
                name="evaluationDate"
                value={formData.evaluationDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Comments"
                name="comments"
                value={formData.comments}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={!formData.teacherId || formData.rating === 0}
          >
            {selectedEvaluation ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherEvaluation; 