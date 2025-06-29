import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, CardHeader, Grid, Chip, Avatar, 
  List, ListItem, ListItemText, ListItemAvatar, Divider, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, FormControl, InputLabel, Select, MenuItem, Alert, Skeleton, 
  LinearProgress, Badge, CardActions, Accordion, AccordionSummary, 
  AccordionDetails, ListItemIcon, Tooltip, Fab, ToggleButton, ToggleButtonGroup,
  Rating, ListItemSecondaryAction
} from '@mui/material';
import {
  Group, Add, Edit, Delete, Visibility, Email, Phone, School, 
  CheckCircle, Schedule, Grade, TrendingUp, TrendingDown, Equalizer,
  Assessment, Book, Person, MoreVert, FilterList, Search, Refresh,
  ExpandMore, LocationOn, CalendarToday, AccessTime, Star, StarBorder,
  Apps, List as ListIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { teacherAPI } from '../../services/api';

export default function Students() {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterClass, setFilterClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: studentsData, isLoading, error } = useQuery({
    queryKey: ['students'],
    queryFn: () => teacherAPI.getStudents()
  });

  const { data: gradesData } = useQuery({
    queryKey: ['grades'],
    queryFn: () => teacherAPI.getGrades()
  });

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Failed to load students data</Alert>;
  }

  const students = studentsData?.data || [];
  const grades = gradesData?.data || [];

  const filteredStudents = (students || []).filter(student => {
    const matchesClass = filterClass === 'all' || student.class.includes(filterClass);
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesClass && matchesSearch;
  });

  const getStudentGrades = (studentId) => {
    return (grades || []).filter(grade => grade.studentId === studentId);
  };

  const getAverageGrade = (studentId) => {
    const studentGrades = getStudentGrades(studentId);
    if (studentGrades.length === 0) return 0;
    const total = studentGrades.reduce((sum, grade) => sum + grade.percentage, 0);
    return (total / studentGrades.length).toFixed(1);
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'success';
    if (grade >= 80) return 'primary';
    if (grade >= 70) return 'warning';
    return 'error';
  };

  const renderGridCard = (student) => (
    <Card key={student.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {student.name.charAt(0).toUpperCase()}
          </Avatar>
        }
        action={
          <IconButton>
            <MoreVert />
          </IconButton>
        }
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" noWrap>
              {student.name}
            </Typography>
            <Chip 
              label={student.status} 
              size="small" 
              color={student.status === 'Active' ? 'success' : 'warning'}
            />
          </Box>
        }
        subheader={
          <Box>
            <Typography variant="body2" color="textSecondary">
              {student.studentId}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {student.class}
            </Typography>
          </Box>
        }
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ mb: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="caption">Average Grade</Typography>
            <Typography variant="caption">
              {getAverageGrade(student.id)}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={getAverageGrade(student.id)} 
            sx={{ height: 6, borderRadius: 3 }}
            color={getGradeColor(getAverageGrade(student.id))}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="caption">Attendance Rate</Typography>
            <Typography variant="caption">
              {student.attendanceRate}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={student.attendanceRate} 
            sx={{ height: 6, borderRadius: 3 }}
            color="secondary"
          />
        </Box>

        <Box display="flex" alignItems="center" gap={2} mt={2}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <Email fontSize="small" color="action" />
            <Typography variant="caption">{student.email}</Typography>
          </Box>
        </Box>
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          startIcon={<Visibility />}
          onClick={() => {
            setSelectedStudent(student);
            setDialogOpen(true);
          }}
        >
          View Details
        </Button>
        <Button size="small" startIcon={<Email />}>
          Contact
        </Button>
        <Button size="small" startIcon={<Grade />}>
          Grades
        </Button>
      </CardActions>
    </Card>
  );

  const renderTableView = () => (
    <Card>
      <CardContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Student ID</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Avg Grade</TableCell>
                <TableCell>Attendance</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {student.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2">{student.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{student.studentId}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={student.class} size="small" color="primary" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{student.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box textAlign="center">
                      <Typography variant="body2" color="primary">
                        {getAverageGrade(student.id)}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={getAverageGrade(student.id)} 
                        sx={{ mt: 0.5 }}
                        color={getGradeColor(getAverageGrade(student.id))}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box textAlign="center">
                      <Typography variant="body2" color="success.main">
                        {student.attendanceRate}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={student.attendanceRate} 
                        sx={{ mt: 0.5 }}
                        color="secondary"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={student.status} 
                      size="small" 
                      color={student.status === 'Active' ? 'success' : 'warning'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => {
                          setSelectedStudent(student);
                          setDialogOpen(true);
                        }}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton size="small" color="secondary">
                        <Email />
                      </IconButton>
                      <IconButton size="small" color="info">
                        <Grade />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {students.length}
                  </Typography>
                  <Typography variant="body2">Total Students</Typography>
                </Box>
                <Group sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {(students || []).filter(s => s.status === 'Active').length}
                  </Typography>
                  <Typography variant="body2">Active Students</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {new Set(students.map(s => s.class)).size}
                  </Typography>
                  <Typography variant="body2">Classes</Typography>
                </Box>
                <School sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {(students.reduce((sum, s) => sum + s.averageGrade, 0) / students.length).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2">Avg Grade</Typography>
                </Box>
                <Grade sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                size="small"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search fontSize="small" color="action" />
                }}
              />
              <FormControl size="small">
                <InputLabel>Class</InputLabel>
                <Select
                  value={filterClass}
                  label="Class"
                  onChange={(e) => setFilterClass(e.target.value)}
                >
                  <MenuItem value="all">All Classes</MenuItem>
                  {Array.from(new Set(students.map(s => s.class))).map(cls => (
                    <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box display="flex" gap={1}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                size="small"
              >
                <ToggleButton value="grid">
                  <Apps />
                </ToggleButton>
                <ToggleButton value="table">
                  <ListIcon />
                </ToggleButton>
              </ToggleButtonGroup>
              <Button variant="contained" startIcon={<Add />}>
                Add Student
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Content */}
      {viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {filteredStudents.map(student => (
            <Grid item xs={12} sm={6} md={4} key={student.id}>
              {renderGridCard(student)}
            </Grid>
          ))}
        </Grid>
      ) : (
        renderTableView()
      )}

      {/* Student Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Student Details - {selectedStudent?.name}
        </DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Box>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Avatar 
                      sx={{ 
                        width: 120, 
                        height: 120, 
                        mx: 'auto', 
                        mb: 2,
                        fontSize: 48,
                        bgcolor: 'primary.main'
                      }}
                    >
                      {selectedStudent.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="h6">{selectedStudent.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {selectedStudent.studentId}
                    </Typography>
                    <Chip 
                      label={selectedStudent.status} 
                      color={selectedStudent.status === 'Active' ? 'success' : 'warning'}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={selectedStudent.email}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={selectedStudent.phone}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Class"
                        value={selectedStudent.class}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Average Grade"
                        value={`${getAverageGrade(selectedStudent.id)}%`}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Attendance Rate"
                        value={`${selectedStudent.attendanceRate}%`}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              {/* Recent Grades */}
              <Card sx={{ mt: 3 }}>
                <CardHeader title="Recent Grades" />
                <CardContent>
                  <List>
                    {getStudentGrades(selectedStudent.id).slice(0, 5).map((grade, index) => (
                      <ListItem key={grade.id}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <Grade />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={grade.assignmentTitle}
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                {grade.className}
                              </Typography>
                              <Typography variant="caption" display="block" color="text.secondary">
                                {grade.date}
                              </Typography>
                            </>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Typography variant="h6" color="primary">
                            {grade.percentage}%
                          </Typography>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<Email />}>
            Send Message
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab 
        color="primary" 
        aria-label="add student"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <Add />
      </Fab>
    </Box>
  );
} 