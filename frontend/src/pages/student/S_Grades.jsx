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
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Grade as GradeIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  EmojiEvents as EmojiEventsIcon,
} from '@mui/icons-material';
import studentService from '../../services/studentService';

const S_Grades = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [grades, setGrades] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await studentService.getGrades();
      setGrades(response.data);
      if (response.data.length > 0) {
        setSelectedClass(response.data[0].classId);
      }
    } catch {
      setError('Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const calculateClassAverage = (classId) => {
    const classGrades = grades.filter((g) => g.classId === classId);
    if (classGrades.length === 0) return 0;
    const total = classGrades.reduce((sum, g) => sum + (g.marks / g.totalMarks) * 100, 0);
    return total / classGrades.length;
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 80) return 'info';
    if (percentage >= 70) return 'primary';
    if (percentage >= 60) return 'warning';
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

  const classes = [...new Set(grades.map((g) => g.classId))];
  const selectedClassGrades = grades.filter((g) => g.classId === selectedClass);
  const overallAverage = grades.reduce((sum, g) => sum + (g.marks / g.totalMarks) * 100, 0) / grades.length;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Grades
      </Typography>

      <Grid container spacing={3}>
        {/* Grade Statistics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <GradeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Overall Average</Typography>
              </Box>
              <Typography variant="h4">
                {Math.round(overallAverage)}%
              </Typography>
              <Typography variant="h6" color={getGradeColor(overallAverage)}>
                {getGradeLetter(overallAverage)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SchoolIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Classes</Typography>
              </Box>
              <Typography variant="h4">{classes.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Assessments</Typography>
              </Box>
              <Typography variant="h4">{grades.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Class Selection and Grades */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {/* Class List */}
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  Classes
                </Typography>
                <List>
                  {classes.map((classId) => {
                    const classData = grades.find((g) => g.classId === classId);
                    const classAverage = calculateClassAverage(classId);
                    return (
                      <ListItem
                        key={classId}
                        button
                        selected={selectedClass === classId}
                        onClick={() => setSelectedClass(classId)}
                      >
                        <ListItemIcon>
                          <SchoolIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={classData.className}
                          secondary={
                            <Box display="flex" alignItems="center">
                              <Typography
                                variant="body2"
                                color={getGradeColor(classAverage)}
                                sx={{ mr: 1 }}
                              >
                                {Math.round(classAverage)}%
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {getGradeLetter(classAverage)}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Grid>

              {/* Grades Table */}
              <Grid item xs={12} md={8}>
                {selectedClass ? (
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">
                        {selectedClassGrades[0]?.className} - Grades
                      </Typography>
                      <Chip
                        label={`Average: ${Math.round(calculateClassAverage(selectedClass))}%`}
                        color={getGradeColor(calculateClassAverage(selectedClass))}
                      />
                    </Box>

                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Assessment</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Marks</TableCell>
                            <TableCell>Percentage</TableCell>
                            <TableCell>Grade</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedClassGrades.map((grade) => {
                            const percentage = (grade.marks / grade.totalMarks) * 100;
                            return (
                              <TableRow key={grade.id}>
                                <TableCell>
                                  <Box display="flex" alignItems="center">
                                    <AssignmentIcon sx={{ mr: 1 }} color="primary" />
                                    {grade.title}
                                  </Box>
                                </TableCell>
                                <TableCell>{grade.type}</TableCell>
                                <TableCell>
                                  {grade.marks}/{grade.totalMarks}
                                </TableCell>
                                <TableCell>
                                  <Box display="flex" alignItems="center">
                                    {percentage >= 70 ? (
                                      <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                                    ) : (
                                      <TrendingDownIcon color="error" sx={{ mr: 1 }} />
                                    )}
                                    {Math.round(percentage)}%
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={getGradeLetter(percentage)}
                                    color={getGradeColor(percentage)}
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
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
    </Box>
  );
};

export default S_Grades; 