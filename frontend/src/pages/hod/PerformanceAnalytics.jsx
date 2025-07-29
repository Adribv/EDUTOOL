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
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
} from '@mui/icons-material';
import { hodAPI } from '../../services/api';
import { toast } from 'react-toastify';

const PerformanceAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [performanceData, setPerformanceData] = useState({});
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    teacherId: '',
    academicYear: '',
    semester: '',
    performanceMetrics: {
      attendance: 0,
      evaluations: 0,
      studentSatisfaction: 0,
      academicPerformance: 0,
      professionalDevelopment: 0,
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [performanceResponse, teachersResponse] = await Promise.all([
        hodAPI.getPerformanceAnalytics(),
        hodAPI.getStaff(),
      ]);
      
      setPerformanceData(performanceResponse.data || {});
      setTeachers(teachersResponse.data || []);
      setError(null);
    } catch (error) {
      setError('Failed to load performance data');
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (teacher = null) => {
    if (teacher) {
      setSelectedTeacher(teacher);
      setFormData({
        teacherId: teacher.id,
        academicYear: teacher.academicYear || '',
        semester: teacher.semester || '',
        performanceMetrics: teacher.performanceMetrics || {
          attendance: 0,
          evaluations: 0,
          studentSatisfaction: 0,
          academicPerformance: 0,
          professionalDevelopment: 0,
        },
      });
    } else {
      setSelectedTeacher(null);
      setFormData({
        teacherId: '',
        academicYear: '',
        semester: '',
        performanceMetrics: {
          attendance: 0,
          evaluations: 0,
          studentSatisfaction: 0,
          academicPerformance: 0,
          professionalDevelopment: 0,
        },
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTeacher(null);
    setFormData({
      teacherId: '',
      academicYear: '',
      semester: '',
      performanceMetrics: {
        attendance: 0,
        evaluations: 0,
        studentSatisfaction: 0,
        academicPerformance: 0,
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

  const handleMetricChange = (metric, value) => {
    setFormData((prev) => ({
      ...prev,
      performanceMetrics: {
        ...prev.performanceMetrics,
        [metric]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await hodAPI.updatePerformanceAnalytics(formData);
      toast.success('Performance data saved successfully');
      handleCloseDialog();
      fetchData();
    } catch (error) {
      toast.error('Failed to save performance data');
    }
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? teacher.name : 'Unknown Teacher';
  };

  const calculateOverallScore = (metrics) => {
    const values = Object.values(metrics);
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
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
        <Typography variant="h4">Performance Analytics</Typography>
        <Button
          variant="contained"
          startIcon={<AssessmentIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Performance Data
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Performance
              </Typography>
              <Typography variant="h4">
                {performanceData.averagePerformance || 75}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={performanceData.averagePerformance || 75}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Top Performers
              </Typography>
              <Typography variant="h4">
                {performanceData.topPerformers || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Improvement Needed
              </Typography>
              <Typography variant="h4">
                {performanceData.improvementNeeded || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Evaluations
              </Typography>
              <Typography variant="h4">
                {performanceData.totalEvaluations || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Teacher</TableCell>
              <TableCell>Academic Year</TableCell>
              <TableCell>Semester</TableCell>
              <TableCell>Attendance</TableCell>
              <TableCell>Evaluations</TableCell>
              <TableCell>Student Satisfaction</TableCell>
              <TableCell>Academic Performance</TableCell>
              <TableCell>Professional Development</TableCell>
              <TableCell>Overall Score</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {performanceData.teacherPerformance?.map((performance) => (
              <TableRow key={performance.id}>
                <TableCell>{getTeacherName(performance.teacherId)}</TableCell>
                <TableCell>{performance.academicYear}</TableCell>
                <TableCell>{performance.semester}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={performance.performanceMetrics?.attendance || 0}
                      sx={{ width: 60, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2">
                      {performance.performanceMetrics?.attendance || 0}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={performance.performanceMetrics?.evaluations || 0}
                    color={getScoreColor(performance.performanceMetrics?.evaluations || 0)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={performance.performanceMetrics?.studentSatisfaction || 0}
                    color={getScoreColor(performance.performanceMetrics?.studentSatisfaction || 0)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={performance.performanceMetrics?.academicPerformance || 0}
                    color={getScoreColor(performance.performanceMetrics?.academicPerformance || 0)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={performance.performanceMetrics?.professionalDevelopment || 0}
                    color={getScoreColor(performance.performanceMetrics?.professionalDevelopment || 0)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${calculateOverallScore(performance.performanceMetrics || {}).toFixed(1)}%`}
                    color={getScoreColor(calculateOverallScore(performance.performanceMetrics || {}))}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(performance)}
                  >
                    <AssessmentIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Performance Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTeacher ? 'Edit Performance Data' : 'Add Performance Data'}
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Academic Year"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                placeholder="e.g., 2024-2025"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Semester</InputLabel>
                <Select
                  name="semester"
                  value={formData.semester}
                  label="Semester"
                  onChange={handleChange}
                >
                  <MenuItem value="1">Semester 1</MenuItem>
                  <MenuItem value="2">Semester 2</MenuItem>
                  <MenuItem value="3">Semester 3</MenuItem>
                  <MenuItem value="4">Semester 4</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Attendance Rate (%)
              </Typography>
              <TextField
                fullWidth
                type="number"
                value={formData.performanceMetrics.attendance}
                onChange={(e) => handleMetricChange('attendance', parseInt(e.target.value))}
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Evaluation Score (%)
              </Typography>
              <TextField
                fullWidth
                type="number"
                value={formData.performanceMetrics.evaluations}
                onChange={(e) => handleMetricChange('evaluations', parseInt(e.target.value))}
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Student Satisfaction (%)
              </Typography>
              <TextField
                fullWidth
                type="number"
                value={formData.performanceMetrics.studentSatisfaction}
                onChange={(e) => handleMetricChange('studentSatisfaction', parseInt(e.target.value))}
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Academic Performance (%)
              </Typography>
              <TextField
                fullWidth
                type="number"
                value={formData.performanceMetrics.academicPerformance}
                onChange={(e) => handleMetricChange('academicPerformance', parseInt(e.target.value))}
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Professional Development (%)
              </Typography>
              <TextField
                fullWidth
                type="number"
                value={formData.performanceMetrics.professionalDevelopment}
                onChange={(e) => handleMetricChange('professionalDevelopment', parseInt(e.target.value))}
                inputProps={{ min: 0, max: 100 }}
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
            disabled={!formData.teacherId || !formData.academicYear}
          >
            {selectedTeacher ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PerformanceAnalytics; 