import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Grade as GradeIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import teacherService from '../../services/teacherService';

const T_Grades = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [grades, setGrades] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    classId: '',
    subjectId: '',
    assessmentType: '',
    marks: '',
    totalMarks: '',
    comments: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [gradesRes, classesRes] = await Promise.all([
        teacherService.getGrades(),
        teacherService.getClasses(),
      ]);
      setGrades(gradesRes.data);
      setClasses(classesRes.data);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleClassSelect = (classData) => {
    setSelectedClass(classData);
  };

  const handleOpenDialog = (grade = null) => {
    if (grade) {
      setEditingGrade(grade);
      setFormData({
        studentId: grade.studentId,
        classId: grade.classId,
        subjectId: grade.subjectId,
        assessmentType: grade.assessmentType,
        marks: grade.marks,
        totalMarks: grade.totalMarks,
        comments: grade.comments,
      });
    } else {
      setEditingGrade(null);
      setFormData({
        studentId: '',
        classId: selectedClass?.id || '',
        subjectId: '',
        assessmentType: '',
        marks: '',
        totalMarks: '',
        comments: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGrade(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (editingGrade) {
        await teacherService.updateGrade(editingGrade.id, formData);
      } else {
        await teacherService.createGrade(formData);
      }
      handleCloseDialog();
      fetchData();
    } catch {
      setError('Failed to save grade');
    }
  };

  const handleDelete = async (gradeId) => {
    if (window.confirm('Are you sure you want to delete this grade?')) {
      try {
        await teacherService.deleteGrade(gradeId);
        fetchData();
      } catch {
        setError('Failed to delete grade');
      }
    }
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
    <Box>
      <Typography variant="h4" gutterBottom>
        Grade Management
      </Typography>

      <Grid container spacing={3}>
        {/* Grade Statistics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <GradeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Grades</Typography>
              </Box>
              <Typography variant="h4">{grades.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Average Grade</Typography>
              </Box>
              <Typography variant="h4">
                {Math.round(
                  grades.reduce((acc, grade) => acc + (grade.marks / grade.totalMarks) * 100, 0) /
                    grades.length
                ) || 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AssessmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Assessments</Typography>
              </Box>
              <Typography variant="h4">
                {new Set(grades.map((grade) => grade.assessmentType)).size}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Class Selection and Grade Management */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {/* Class List */}
              <Grid item xs={12} md={3}>
                <Typography variant="h6" gutterBottom>
                  Classes
                </Typography>
                <List>
                  {classes.map((cls) => (
                    <ListItem
                      key={cls.id}
                      button
                      selected={selectedClass?.id === cls.id}
                      onClick={() => handleClassSelect(cls)}
                    >
                      <ListItemIcon>
                        <SchoolIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={cls.name} />
                    </ListItem>
                  ))}
                </List>
              </Grid>

              {/* Grade Management */}
              <Grid item xs={12} md={9}>
                {selectedClass ? (
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">
                        Grades - {selectedClass.name}
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                      >
                        Add Grade
                      </Button>
                    </Box>

                    <Tabs value={activeTab} onChange={handleTabChange}>
                      <Tab label="All Grades" />
                      <Tab label="By Assessment" />
                      <Tab label="By Student" />
                    </Tabs>

                    <Box mt={2}>
                      {activeTab === 0 && (
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Student</TableCell>
                                <TableCell>Assessment</TableCell>
                                <TableCell>Marks</TableCell>
                                <TableCell>Percentage</TableCell>
                                <TableCell>Comments</TableCell>
                                <TableCell>Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {grades
                                .filter((grade) => grade.classId === selectedClass.id)
                                .map((grade) => (
                                  <TableRow key={grade.id}>
                                    <TableCell>{grade.studentName}</TableCell>
                                    <TableCell>{grade.assessmentType}</TableCell>
                                    <TableCell>
                                      {grade.marks}/{grade.totalMarks}
                                    </TableCell>
                                    <TableCell>
                                      {Math.round((grade.marks / grade.totalMarks) * 100)}%
                                    </TableCell>
                                    <TableCell>{grade.comments}</TableCell>
                                    <TableCell>
                                      <IconButton
                                        onClick={() => handleOpenDialog(grade)}
                                        color="primary"
                                      >
                                        <EditIcon />
                                      </IconButton>
                                      <IconButton
                                        onClick={() => handleDelete(grade.id)}
                                        color="error"
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}

                      {activeTab === 1 && (
                        <Box>
                          <Typography variant="subtitle1" gutterBottom>
                            Assessment Summary
                          </Typography>
                          <TableContainer>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Assessment Type</TableCell>
                                  <TableCell>Average</TableCell>
                                  <TableCell>Highest</TableCell>
                                  <TableCell>Lowest</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {Array.from(
                                  new Set(
                                    grades
                                      .filter((grade) => grade.classId === selectedClass.id)
                                      .map((grade) => grade.assessmentType)
                                  )
                                ).map((type) => {
                                  const typeGrades = grades.filter(
                                    (grade) =>
                                      grade.classId === selectedClass.id &&
                                      grade.assessmentType === type
                                  );
                                  const average =
                                    typeGrades.reduce(
                                      (acc, grade) =>
                                        acc + (grade.marks / grade.totalMarks) * 100,
                                      0
                                    ) / typeGrades.length;
                                  const highest = Math.max(
                                    ...typeGrades.map(
                                      (grade) => (grade.marks / grade.totalMarks) * 100
                                    )
                                  );
                                  const lowest = Math.min(
                                    ...typeGrades.map(
                                      (grade) => (grade.marks / grade.totalMarks) * 100
                                    )
                                  );

                                  return (
                                    <TableRow key={type}>
                                      <TableCell>{type}</TableCell>
                                      <TableCell>{Math.round(average)}%</TableCell>
                                      <TableCell>{Math.round(highest)}%</TableCell>
                                      <TableCell>{Math.round(lowest)}%</TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      )}

                      {activeTab === 2 && (
                        <Box>
                          <Typography variant="subtitle1" gutterBottom>
                            Student Performance
                          </Typography>
                          <TableContainer>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Student</TableCell>
                                  <TableCell>Overall Average</TableCell>
                                  <TableCell>Assessments</TableCell>
                                  <TableCell>Status</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {Array.from(
                                  new Set(
                                    grades
                                      .filter((grade) => grade.classId === selectedClass.id)
                                      .map((grade) => grade.studentId)
                                  )
                                ).map((studentId) => {
                                  const studentGrades = grades.filter(
                                    (grade) =>
                                      grade.classId === selectedClass.id &&
                                      grade.studentId === studentId
                                  );
                                  const average =
                                    studentGrades.reduce(
                                      (acc, grade) =>
                                        acc + (grade.marks / grade.totalMarks) * 100,
                                      0
                                    ) / studentGrades.length;
                                  const status =
                                    average >= 70
                                      ? 'Excellent'
                                      : average >= 60
                                      ? 'Good'
                                      : average >= 50
                                      ? 'Average'
                                      : 'Needs Improvement';

                                  return (
                                    <TableRow key={studentId}>
                                      <TableCell>
                                        {studentGrades[0]?.studentName}
                                      </TableCell>
                                      <TableCell>{Math.round(average)}%</TableCell>
                                      <TableCell>{studentGrades.length}</TableCell>
                                      <TableCell>
                                        <Chip
                                          label={status}
                                          color={
                                            status === 'Excellent'
                                              ? 'success'
                                              : status === 'Good'
                                              ? 'primary'
                                              : status === 'Average'
                                              ? 'warning'
                                              : 'error'
                                          }
                                        />
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      )}
                    </Box>
                  </Box>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <Typography color="textSecondary">
                      Select a class to view grades
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Grade Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingGrade ? 'Edit Grade' : 'Add Grade'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Assessment Type</InputLabel>
                <Select
                  name="assessmentType"
                  value={formData.assessmentType}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="Quiz">Quiz</MenuItem>
                  <MenuItem value="Assignment">Assignment</MenuItem>
                  <MenuItem value="Project">Project</MenuItem>
                  <MenuItem value="Midterm">Midterm</MenuItem>
                  <MenuItem value="Final">Final</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="marks"
                label="Marks Obtained"
                type="number"
                value={formData.marks}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="totalMarks"
                label="Total Marks"
                type="number"
                value={formData.totalMarks}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="comments"
                label="Comments"
                value={formData.comments}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingGrade ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default T_Grades; 