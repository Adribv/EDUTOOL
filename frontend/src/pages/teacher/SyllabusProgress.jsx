import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  CircularProgress,
  Snackbar,
  Tooltip,
  LinearProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Refresh,
  Assessment,
  Schedule,
  CheckCircle,
  Warning,
  Comment
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { syllabusAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SyllabusProgress = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [remarksDialogOpen, setRemarksDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [filters, setFilters] = useState({
    class: '',
    section: '',
    subject: '',
    status: '',
    academicYear: new Date().getFullYear().toString(),
    semester: 'First Term'
  });

  const [editData, setEditData] = useState({
    numberOfPeriodsTaken: '',
    actualCompletionDate: '',
    remarksTopicsLeft: ''
  });

  const [remarksData, setRemarksData] = useState({
    teacherRemarks: ''
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch teacher's syllabus entries
  const { data: syllabusData, isLoading } = useQuery({
    queryKey: ['teacherSyllabusEntries', user?.id, filters],
    queryFn: () => syllabusAPI.getTeacherEntries(user?.id, filters),
    enabled: !!user?.id
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: ({ id, data }) => syllabusAPI.updateProgress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['teacherSyllabusEntries']);
      setSnackbar({ open: true, message: 'Progress updated successfully', severity: 'success' });
      handleCloseEditDialog();
    },
    onError: (error) => {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to update progress', 
        severity: 'error' 
      });
    }
  });

  // Update teacher remarks mutation
  const updateRemarksMutation = useMutation({
    mutationFn: ({ id, data }) => syllabusAPI.updateTeacherRemarks(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['teacherSyllabusEntries']);
      setSnackbar({ open: true, message: 'Teacher remarks updated successfully', severity: 'success' });
      handleCloseRemarksDialog();
    },
    onError: (error) => {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to update teacher remarks', 
        severity: 'error' 
      });
    }
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenEditDialog = (entry) => {
    setSelectedEntry(entry);
    setEditData({
      numberOfPeriodsTaken: entry.numberOfPeriodsTaken || '',
      actualCompletionDate: entry.actualCompletionDate ? new Date(entry.actualCompletionDate).toISOString().split('T')[0] : '',
      remarksTopicsLeft: entry.remarksTopicsLeft || ''
    });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedEntry(null);
    setEditData({
      numberOfPeriodsTaken: '',
      actualCompletionDate: '',
      remarksTopicsLeft: ''
    });
  };

  const handleOpenRemarksDialog = (entry) => {
    setSelectedEntry(entry);
    setRemarksData({
      teacherRemarks: entry.teacherRemarks || ''
    });
    setRemarksDialogOpen(true);
  };

  const handleCloseRemarksDialog = () => {
    setRemarksDialogOpen(false);
    setSelectedEntry(null);
    setRemarksData({
      teacherRemarks: ''
    });
  };

  const handleUpdateProgress = () => {
    if (!selectedEntry) return;

    const updatePayload = {
      numberOfPeriodsTaken: parseInt(editData.numberOfPeriodsTaken) || 0,
      remarksTopicsLeft: editData.remarksTopicsLeft
    };

    if (editData.actualCompletionDate) {
      updatePayload.actualCompletionDate = editData.actualCompletionDate;
    }

    updateProgressMutation.mutate({ id: selectedEntry._id, data: updatePayload });
  };

  const handleUpdateRemarks = () => {
    if (!selectedEntry) return;

    updateRemarksMutation.mutate({ 
      id: selectedEntry._id, 
      data: { teacherRemarks: remarksData.teacherRemarks } 
    });
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

  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C', 'D', 'E', 'F'];
  const semesters = ['First Term', 'Second Term', 'Third Term', 'Annual'];

  // Calculate statistics
  const totalEntries = syllabusData?.data?.length || 0;
  const completedEntries = syllabusData?.data?.filter(entry => entry.status === 'Completed').length || 0;
  const inProgressEntries = syllabusData?.data?.filter(entry => entry.status === 'In Progress').length || 0;
  const delayedEntries = syllabusData?.data?.filter(entry => entry.status === 'Delayed').length || 0;
  const overallCompletion = totalEntries > 0 ? Math.round((completedEntries / totalEntries) * 100) : 0;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Syllabus Completion Progress
      </Typography>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Progress Overview" icon={<Assessment />} />
        <Tab label="Teacher Remarks" icon={<Comment />} />
      </Tabs>

      {tabValue === 0 && (
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
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Class</InputLabel>
                  <Select
                    value={filters.class}
                    onChange={(e) => handleFilterChange('class', e.target.value)}
                    label="Class"
                  >
                    <MenuItem value="">All Classes</MenuItem>
                    {classes.map(c => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Section</InputLabel>
                  <Select
                    value={filters.section}
                    onChange={(e) => handleFilterChange('section', e.target.value)}
                    label="Section"
                  >
                    <MenuItem value="">All Sections</MenuItem>
                    {sections.map(s => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Subject"
                  value={filters.subject}
                  onChange={(e) => handleFilterChange('subject', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
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
              <Grid item xs={12} sm={6} md={2}>
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
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => queryClient.invalidateQueries(['teacherSyllabusEntries'])}
                >
                  Refresh
                </Button>
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
                    <TableCell>Start Date</TableCell>
                    <TableCell>Planned Completion</TableCell>
                    <TableCell>Actual Completion</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Periods Taken/Allotted</TableCell>
                    <TableCell>Teaching Method</TableCell>
                    <TableCell>Completion Rate</TableCell>
                    <TableCell>Remarks/Topics Left</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={13} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : syllabusData?.data?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={13} align="center">
                        No syllabus entries found
                      </TableCell>
                    </TableRow>
                  ) : (
                    syllabusData?.data?.map((entry) => (
                      <TableRow key={entry._id}>
                        <TableCell>{entry.class}</TableCell>
                        <TableCell>{entry.section}</TableCell>
                        <TableCell>{entry.subject}</TableCell>
                        <TableCell>{entry.unitChapter}</TableCell>
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
                        <TableCell>
                          {entry.numberOfPeriodsTaken}/{entry.numberOfPeriodsAllotted}
                        </TableCell>
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
                          <Tooltip title="Update Progress">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleOpenEditDialog(entry)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {tabValue === 1 && (
        <>
          {/* Teacher Remarks Section */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Teacher Remarks Management
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add detailed remarks and comments about syllabus progress, challenges, and observations for each unit.
            </Typography>
          </Paper>

          {/* Teacher Remarks Table */}
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Class</TableCell>
                    <TableCell>Section</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Unit/Chapter</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Current Remarks</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : syllabusData?.data?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No syllabus entries found
                      </TableCell>
                    </TableRow>
                  ) : (
                    syllabusData?.data?.map((entry) => (
                      <TableRow key={entry._id}>
                        <TableCell>{entry.class}</TableCell>
                        <TableCell>{entry.section}</TableCell>
                        <TableCell>{entry.subject}</TableCell>
                        <TableCell>{entry.unitChapter}</TableCell>
                        <TableCell>
                          <Chip 
                            label={entry.status} 
                            color={getStatusColor(entry.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ 
                            maxWidth: 200, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {entry.teacherRemarks || 'No remarks added'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Add/Edit Remarks">
                            <IconButton 
                              size="small" 
                              color="secondary"
                              onClick={() => handleOpenRemarksDialog(entry)}
                            >
                              <Comment />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {/* Edit Progress Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Update Syllabus Progress - {selectedEntry?.subject} ({selectedEntry?.class}-{selectedEntry?.section})
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Unit/Chapter: {selectedEntry?.unitChapter}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Number of Periods Taken"
                type="number"
                value={editData.numberOfPeriodsTaken}
                onChange={(e) => setEditData({ ...editData, numberOfPeriodsTaken: e.target.value })}
                helperText={`Allotted: ${selectedEntry?.numberOfPeriodsAllotted} periods`}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Actual Completion Date"
                type="date"
                value={editData.actualCompletionDate}
                onChange={(e) => setEditData({ ...editData, actualCompletionDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                helperText="Leave empty if not completed"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Remarks/Topics Left"
                multiline
                rows={3}
                value={editData.remarksTopicsLeft}
                onChange={(e) => setEditData({ ...editData, remarksTopicsLeft: e.target.value })}
                placeholder="Enter any remarks or topics that are left to cover..."
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Current Status:</strong> {selectedEntry?.status}<br/>
                  <strong>Completion Rate:</strong> {selectedEntry?.completionRate}%<br/>
                  <strong>Teaching Method:</strong> {selectedEntry?.teachingMethodUsed}
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button 
            onClick={handleUpdateProgress} 
            variant="contained"
            disabled={updateProgressMutation.isLoading}
          >
            {updateProgressMutation.isLoading ? (
              <CircularProgress size={20} />
            ) : 'Update Progress'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Teacher Remarks Dialog */}
      <Dialog open={remarksDialogOpen} onClose={handleCloseRemarksDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Teacher Remarks - {selectedEntry?.subject} ({selectedEntry?.class}-{selectedEntry?.section})
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Unit/Chapter: {selectedEntry?.unitChapter}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Teacher Remarks"
                multiline
                rows={6}
                value={remarksData.teacherRemarks}
                onChange={(e) => setRemarksData({ ...remarksData, teacherRemarks: e.target.value })}
                placeholder="Add detailed remarks about syllabus progress, challenges faced, student engagement, teaching strategies used, or any other observations..."
                helperText="These remarks are for internal use and can include teaching insights, challenges, and recommendations."
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Current Status:</strong> {selectedEntry?.status}<br/>
                  <strong>Completion Rate:</strong> {selectedEntry?.completionRate}%<br/>
                  <strong>Periods Taken:</strong> {selectedEntry?.numberOfPeriodsTaken}/{selectedEntry?.numberOfPeriodsAllotted}
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemarksDialog}>Cancel</Button>
          <Button 
            onClick={handleUpdateRemarks} 
            variant="contained"
            disabled={updateRemarksMutation.isLoading}
          >
            {updateRemarksMutation.isLoading ? (
              <CircularProgress size={20} />
            ) : 'Save Remarks'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SyllabusProgress; 