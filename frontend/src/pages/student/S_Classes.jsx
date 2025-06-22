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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import studentService from '../../services/studentService';

const S_Classes = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await studentService.getClasses();
      setClasses(response.data);
      if (response.data.length > 0) {
        setSelectedClass(response.data[0]);
      }
    } catch {
      setError('Failed to load classes');
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
        My Classes
      </Typography>

      <Grid container spacing={3}>
        {/* Class Statistics */}
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
                <PersonIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Teachers</Typography>
              </Box>
              <Typography variant="h4">
                {new Set(classes.map((cls) => cls.teacherId)).size}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <EventIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Classes Today</Typography>
              </Box>
              <Typography variant="h4">
                {classes.filter((cls) => cls.schedule.includes('Today')).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Class List and Details */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {/* Class List */}
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  Class List
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
                      <ListItemText
                        primary={cls.name}
                        secondary={`${cls.schedule} - ${cls.teacherName}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>

              {/* Class Details */}
              <Grid item xs={12} md={8}>
                {selectedClass ? (
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">
                        {selectedClass.name} - {selectedClass.schedule}
                      </Typography>
                    </Box>

                    <Tabs value={activeTab} onChange={handleTabChange}>
                      <Tab label="Schedule" />
                      <Tab label="Assignments" />
                      <Tab label="Grades" />
                    </Tabs>

                    <Box mt={2}>
                      {activeTab === 0 && (
                        <Box>
                          <Typography variant="subtitle1" gutterBottom>
                            Class Schedule
                          </Typography>
                          <List>
                            {selectedClass.scheduleDetails.map((detail, index) => (
                              <ListItem key={index}>
                                <ListItemIcon>
                                  <AccessTimeIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                  primary={detail.day}
                                  secondary={`${detail.startTime} - ${detail.endTime}`}
                                />
                                <ListItemIcon>
                                  <LocationIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText secondary={detail.room} />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}

                      {activeTab === 1 && (
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Assignment</TableCell>
                                <TableCell>Due Date</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Grade</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {selectedClass.assignments.map((assignment) => (
                                <TableRow key={assignment.id}>
                                  <TableCell>{assignment.title}</TableCell>
                                  <TableCell>{assignment.dueDate}</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={assignment.status}
                                      color={
                                        assignment.status === 'Submitted'
                                          ? 'success'
                                          : assignment.status === 'Pending'
                                          ? 'warning'
                                          : 'error'
                                      }
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    {assignment.grade ? (
                                      <Chip
                                        label={`${assignment.grade}/${assignment.totalMarks}`}
                                        color={
                                          (assignment.grade / assignment.totalMarks) * 100 >= 70
                                            ? 'success'
                                            : (assignment.grade / assignment.totalMarks) * 100 >= 50
                                            ? 'warning'
                                            : 'error'
                                        }
                                        size="small"
                                      />
                                    ) : (
                                      '-'
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}

                      {activeTab === 2 && (
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Assessment</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Marks</TableCell>
                                <TableCell>Percentage</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {selectedClass.grades.map((grade) => (
                                <TableRow key={grade.id}>
                                  <TableCell>{grade.title}</TableCell>
                                  <TableCell>{grade.type}</TableCell>
                                  <TableCell>
                                    {grade.marks}/{grade.totalMarks}
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={`${Math.round(
                                        (grade.marks / grade.totalMarks) * 100
                                      )}%`}
                                      color={
                                        (grade.marks / grade.totalMarks) * 100 >= 70
                                          ? 'success'
                                          : (grade.marks / grade.totalMarks) * 100 >= 50
                                          ? 'warning'
                                          : 'error'
                                      }
                                      size="small"
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </Box>
                  </Box>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <Typography color="textSecondary">
                      Select a class to view details
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

export default S_Classes; 