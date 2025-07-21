import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
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
  Chip,
  CircularProgress,
  LinearProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  Assessment,
  Schedule,
  CheckCircle,
  Warning,
  School,
  Person
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { syllabusAPI, parentAPI } from '../../services/api';

const SyllabusView = () => {
  const [selectedChild, setSelectedChild] = useState(null);
  const [filters, setFilters] = useState({
    subject: '',
    status: '',
    academicYear: new Date().getFullYear().toString(),
    semester: 'First Term'
  });

  // Fetch parent's children
  const { data: children } = useQuery({
    queryKey: ['parentChildren'],
    queryFn: () => parentAPI.getChildren()
  });

  // Fetch syllabus entries for selected child
  const { data: syllabusData, isLoading, error } = useQuery({
    queryKey: ['parentSyllabusEntries', selectedChild, filters],
    queryFn: () => syllabusAPI.getParentEntries(selectedChild, filters),
    enabled: !!selectedChild
  });

  const handleChildChange = (childId) => {
    setSelectedChild(childId);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'primary';
      case 'Delayed': return 'warning';
      case 'Not started': return 'default';
      default: return 'default';
    }
  };

  const getCompletionRateColor = (rate) => {
    if (rate >= 80) return 'success';
    if (rate >= 60) return 'warning';
    return 'error';
  };

  const semesters = ['First Term', 'Second Term', 'Third Term', 'Annual'];

  // Calculate statistics
  const totalEntries = syllabusData?.data?.length || 0;
  const completedEntries = syllabusData?.data?.filter(entry => entry.status === 'Completed').length || 0;
  const inProgressEntries = syllabusData?.data?.filter(entry => entry.status === 'In Progress').length || 0;
  const delayedEntries = syllabusData?.data?.filter(entry => entry.status === 'Delayed').length || 0;
  const overallCompletion = totalEntries > 0 ? Math.round((completedEntries / totalEntries) * 100) : 0;

  // Get unique subjects for filter
  const subjects = [...new Set(syllabusData?.data?.map(entry => entry.subject) || [])];

  if (!children?.length) {
    return (
      <Box p={3}>
        <Alert severity="info">
          No children found. Please contact the school administration if this is incorrect.
        </Alert>
      </Box>
    );
  }

  if (!selectedChild && children?.length > 0) {
    setSelectedChild(children[0]._id);
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load syllabus data. Please try again later.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Child's Syllabus Completion Progress
      </Typography>

      {/* Child Selection */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Select Child</InputLabel>
              <Select
                value={selectedChild || ''}
                onChange={(e) => handleChildChange(e.target.value)}
                label="Select Child"
              >
                {children?.map(child => (
                  <MenuItem key={child._id} value={child._id}>
                    {child.name} - Class {child.class} {child.section}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={8}>
            {selectedChild && children?.find(c => c._id === selectedChild) && (
              <Typography variant="body1">
                <strong>Selected:</strong> {children.find(c => c._id === selectedChild).name} 
                (Class {children.find(c => c._id === selectedChild).class} 
                {children.find(c => c._id === selectedChild).section})
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>

      {selectedChild && (
        <>
          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Assessment color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Total Units</Typography>
                  </Box>
                  <Typography variant="h4" color="primary">
                    {totalEntries}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <CheckCircle color="success" sx={{ mr: 1 }} />
                    <Typography variant="h6">Completed</Typography>
                  </Box>
                  <Typography variant="h4" color="success">
                    {completedEntries}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Schedule color="info" sx={{ mr: 1 }} />
                    <Typography variant="h6">In Progress</Typography>
                  </Box>
                  <Typography variant="h4" color="info">
                    {inProgressEntries}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Warning color="warning" sx={{ mr: 1 }} />
                    <Typography variant="h6">Completion Rate</Typography>
                  </Box>
                  <Typography variant="h4" color="warning">
                    {overallCompletion}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Subject</InputLabel>
                  <Select
                    value={filters.subject}
                    onChange={(e) => handleFilterChange('subject', e.target.value)}
                    label="Subject"
                  >
                    <MenuItem value="">All Subjects</MenuItem>
                    {subjects.map(subject => (
                      <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="Not started">Not started</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Delayed">Delayed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Semester</InputLabel>
                  <Select
                    value={filters.semester}
                    onChange={(e) => handleFilterChange('semester', e.target.value)}
                    label="Semester"
                  >
                    {semesters.map(s => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Showing {syllabusData?.data?.length || 0} entries
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Syllabus Table */}
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Class</TableCell>
                    <TableCell>Section</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Unit/Chapter</TableCell>
                    <TableCell>Teacher Name</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>Planned Completion</TableCell>
                    <TableCell>Actual Completion</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Periods Allotted</TableCell>
                    <TableCell>Periods Taken</TableCell>
                    <TableCell>Teaching Method</TableCell>
                    <TableCell>Completion Rate</TableCell>
                    <TableCell>Remarks/Topics Left</TableCell>
                    <TableCell>Syllabus Completion</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={15} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : syllabusData?.data?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={15} align="center">
                        No syllabus entries found for this child
                      </TableCell>
                    </TableRow>
                  ) : (
                    syllabusData?.data?.map((entry) => (
                      <TableRow key={entry._id}>
                        <TableCell>{entry.class}</TableCell>
                        <TableCell>{entry.section}</TableCell>
                        <TableCell>{entry.subject}</TableCell>
                        <TableCell>{entry.unitChapter}</TableCell>
                        <TableCell>{entry.teacherId?.name || entry.teacherName}</TableCell>
                        <TableCell>
                          {entry.startDate ? new Date(entry.startDate).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          {entry.plannedCompletionDate ? new Date(entry.plannedCompletionDate).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          {entry.actualCompletionDate ? new Date(entry.actualCompletionDate).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={entry.status} 
                            color={getStatusColor(entry.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{entry.numberOfPeriodsAllotted}</TableCell>
                        <TableCell>{entry.numberOfPeriodsTaken}</TableCell>
                        <TableCell>{entry.teachingMethodUsed}</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Chip 
                              label={`${entry.completionRate}%`}
                              color={getCompletionRateColor(entry.completionRate)}
                              size="small"
                              sx={{ mr: 1 }}
                            />
                            <LinearProgress 
                              variant="determinate" 
                              value={entry.completionRate} 
                              sx={{ width: 50, height: 6 }}
                              color={getCompletionRateColor(entry.completionRate)}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ 
                            maxWidth: 150, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {entry.remarksTopicsLeft || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ 
                            maxWidth: 150, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {entry.teacherRemarks || '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Summary Information */}
          <Grid container spacing={3} sx={{ mt: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Status Summary
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography>Completed:</Typography>
                  <Chip label={completedEntries} color="success" />
                </Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography>In Progress:</Typography>
                  <Chip label={inProgressEntries} color="primary" />
                </Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography>Delayed:</Typography>
                  <Chip label={delayedEntries} color="warning" />
                </Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography>Not Started:</Typography>
                  <Chip label={totalEntries - completedEntries - inProgressEntries - delayedEntries} color="default" />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Overall Progress
                </Typography>
                <Box display="flex" alignItems="center" mb={2}>
                  <Typography variant="h4" color="primary" sx={{ mr: 2 }}>
                    {overallCompletion}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={overallCompletion} 
                    sx={{ flexGrow: 1, height: 10 }}
                    color={getCompletionRateColor(overallCompletion)}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {completedEntries} out of {totalEntries} units completed
                </Typography>
                {overallCompletion >= 80 && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Excellent progress! Your child is on track with the syllabus completion.
                  </Alert>
                )}
                {overallCompletion < 60 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Some units are behind schedule. Consider discussing with teachers.
                  </Alert>
                )}
                {overallCompletion >= 60 && overallCompletion < 80 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Good progress! A few more units to complete.
                  </Alert>
                )}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default SyllabusView; 