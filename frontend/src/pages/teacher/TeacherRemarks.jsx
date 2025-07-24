import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Tooltip,
  Fab,
  Pagination,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  LinearProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as ViewIcon,
  Save as SaveIcon,
  Send as SendIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Subject as SubjectIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { teacherRemarksAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TeacherRemarks = () => {
  const { user } = useAuth();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openProgressDialog, setOpenProgressDialog] = useState(false);
  const [openRemarksDialog, setOpenRemarksDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [editingForm, setEditingForm] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalForms: 0,
    formsPerPage: 10
  });

  // Filter states
  const [filters, setFilters] = useState({
    class: '',
    section: '',
    subject: '',
    status: '',
    formStatus: '',
    academicYear: '',
    semester: ''
  });

  // Progress form states - focused on teacher progress tracking
  const [progressData, setProgressData] = useState({
    numberOfPeriodsTaken: '',
    actualCompletionDate: null,
    status: '',
    remarksTopicsLeft: '',
    lessonsCompleted: '',
    lessonsPending: ''
  });

  // Teacher remarks form states - simplified for teacher progress
  const [remarksData, setRemarksData] = useState({
    teacherRemarks: '',
    formStatus: 'Draft'
  });

  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C', 'D', 'E', 'F'];
  const semesters = ['First Term', 'Second Term', 'Third Term', 'Annual'];
  const statuses = ['Not started', 'In Progress', 'Completed', 'Delayed'];
  const formStatuses = ['Draft', 'Submitted', 'Reviewed', 'Approved'];

  // Get teacher ID from auth context or use a fallback for testing
  const teacherId = user?._id || user?.id || '507f1f77bcf86cd799439011';

  useEffect(() => {
    if (teacherId) {
      fetchForms();
    }
  }, [pagination.currentPage, filters, teacherId]);

  const fetchForms = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.formsPerPage,
        ...filters
      };
      
      // Fetch all forms created by admin
      const response = await teacherRemarksAPI.getAllForms(params);
      
      setForms(response.data);
      setPagination(prev => ({
        ...prev,
        currentPage: response.pagination.currentPage,
        totalPages: response.pagination.totalPages,
        totalForms: response.pagination.totalForms
      }));
    } catch (err) {
      console.error('Error fetching forms:', err);
      setError(err.response?.data?.message || 'Failed to fetch forms');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async () => {
    try {
      const updateData = {
        numberOfPeriodsTaken: progressData.numberOfPeriodsTaken,
        actualCompletionDate: progressData.actualCompletionDate,
        status: progressData.status,
        remarksTopicsLeft: progressData.remarksTopicsLeft,
        lessonsCompleted: parseInt(progressData.lessonsCompleted) || 0,
        lessonsPending: parseInt(progressData.lessonsPending) || 0
      };
      
      const response = await teacherRemarksAPI.updateProgress(editingForm._id, updateData);
      
      setSuccess('Progress updated successfully');
      setOpenProgressDialog(false);
      setEditingForm(null);
      resetProgressData();
      fetchForms();
    } catch (err) {
      console.error('Error updating progress:', err);
      setError(err.response?.data?.message || 'Failed to update progress');
    }
  };

  const handleUpdateRemarks = async () => {
    try {
      const response = await teacherRemarksAPI.updateDetailedRemarks(editingForm._id, remarksData);
      setSuccess('Teacher remarks updated successfully');
      setOpenRemarksDialog(false);
      setEditingForm(null);
      resetRemarksData();
      fetchForms();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update remarks');
    }
  };

  const handleEditProgress = (form) => {
    setEditingForm(form);
    setProgressData({
      numberOfPeriodsTaken: form.numberOfPeriodsTaken || '',
      actualCompletionDate: form.actualCompletionDate ? new Date(form.actualCompletionDate) : null,
      status: form.status || '',
      remarksTopicsLeft: form.remarksTopicsLeft || '',
      lessonsCompleted: form.lessonsCompleted || '',
      lessonsPending: form.lessonsPending || ''
    });
    setOpenProgressDialog(true);
  };

  const handleEditRemarks = (form) => {
    setEditingForm(form);
    setRemarksData({
      teacherRemarks: form.teacherRemarks || '',
      formStatus: form.formStatus || 'Draft'
    });
    setOpenRemarksDialog(true);
  };

  const handleViewForm = (form) => {
    setSelectedForm(form);
    setOpenViewDialog(true);
  };

  const resetProgressData = () => {
    setProgressData({
      numberOfPeriodsTaken: '',
      actualCompletionDate: null,
      status: '',
      remarksTopicsLeft: '',
      lessonsCompleted: '',
      lessonsPending: ''
    });
  };

  const resetRemarksData = () => {
    setRemarksData({
      teacherRemarks: '',
      formStatus: 'Draft'
    });
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'info';
      case 'Delayed': return 'warning';
      case 'Not started': return 'error';
      default: return 'default';
    }
  };

  const getFormStatusColor = (formStatus) => {
    switch (formStatus) {
      case 'Approved': return 'success';
      case 'Submitted': return 'info';
      case 'Reviewed': return 'warning';
      case 'Draft': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  // Calculate current completion rate for display in progress dialog
  const currentCompletionRate = (() => {
    const lessonsCompleted = parseInt(progressData.lessonsCompleted) || 0;
    const lessonsPending = parseInt(progressData.lessonsPending) || 0;
    const totalLessons = lessonsCompleted + lessonsPending;
    return totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;
  })();

  const filteredForms = forms.filter(form => {
    if (activeTab === 0) return true; // All forms
    if (activeTab === 1) return form.formStatus === 'Draft';
    if (activeTab === 2) return form.formStatus === 'Submitted';
    if (activeTab === 3) return form.status === 'Delayed';
    return true;
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Syllabus Completion
        </Typography>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Units
                </Typography>
                <Typography variant="h4">
                  {pagination.totalForms}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Draft Progress
                </Typography>
                <Typography variant="h4">
                  {forms.filter(f => f.formStatus === 'Draft').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Submitted Progress
                </Typography>
                <Typography variant="h4">
                  {forms.filter(f => f.formStatus === 'Submitted').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Delayed Units
                </Typography>
                <Typography variant="h4">
                  {forms.filter(f => f.status === 'Delayed').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Typography color="inherit" gutterBottom>
                  Overall Completion Rate
                </Typography>
                <Typography variant="h4" sx={{ color: 'white' }}>
                  {(() => {
                    const totalCompletionRate = forms.reduce((sum, form) => sum + (form.completionRate || 0), 0);
                    return forms.length > 0 ? Math.round(totalCompletionRate / forms.length) : 0;
                  })()}%
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(() => {
                      const totalCompletionRate = forms.reduce((sum, form) => sum + (form.completionRate || 0), 0);
                      return forms.length > 0 ? Math.round(totalCompletionRate / forms.length) : 0;
                    })()}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'white'
                      }
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="All Units" />
            <Tab label="Draft Progress" />
            <Tab label="Submitted Progress" />
            <Tab label="Delayed Units" />
          </Tabs>
        </Box>

        {/* Filters */}
        <Accordion sx={{ mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <FilterIcon sx={{ mr: 1 }} />
            <Typography>Filters</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Class</InputLabel>
                  <Select
                    value={filters.class}
                    onChange={(e) => handleFilterChange('class', e.target.value)}
                  >
                    <MenuItem value="">All Classes</MenuItem>
                    {classes.map(cls => (
                      <MenuItem key={cls} value={cls}>Class {cls}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Section</InputLabel>
                  <Select
                    value={filters.section}
                    onChange={(e) => handleFilterChange('section', e.target.value)}
                  >
                    <MenuItem value="">All Sections</MenuItem>
                    {sections.map(sec => (
                      <MenuItem key={sec} value={sec}>Section {sec}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Subject"
                  value={filters.subject}
                  onChange={(e) => handleFilterChange('subject', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    {statuses.map(status => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Form Status</InputLabel>
                  <Select
                    value={filters.formStatus}
                    onChange={(e) => handleFilterChange('formStatus', e.target.value)}
                  >
                    <MenuItem value="">All Form Statuses</MenuItem>
                    {formStatuses.map(status => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Academic Year"
                  value={filters.academicYear}
                  onChange={(e) => handleFilterChange('academicYear', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Semester</InputLabel>
                  <Select
                    value={filters.semester}
                    onChange={(e) => handleFilterChange('semester', e.target.value)}
                  >
                    <MenuItem value="">All Semesters</MenuItem>
                    {semesters.map(sem => (
                      <MenuItem key={sem} value={sem}>{sem}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => {
                    setFilters({
                      class: '',
                      section: '',
                      subject: '',
                      status: '',
                      formStatus: '',
                      academicYear: '',
                      semester: ''
                    });
                  }}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Forms Table */}
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Class</TableCell>
                  <TableCell>Section</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Teacher Name</TableCell>
                  <TableCell>Unit/Chapter</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>Planned Completion Date</TableCell>
                  <TableCell>Actual Completion Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>No of Periods Allotted</TableCell>
                  <TableCell>No of Periods Taken</TableCell>
                  <TableCell>Teaching Method Used</TableCell>
                  <TableCell>Completion Rate</TableCell>
                  <TableCell>Remarks/Topics Left</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredForms.map((form) => (
                  <TableRow key={form._id}>
                    <TableCell>{form.class}</TableCell>
                    <TableCell>{form.section}</TableCell>
                    <TableCell>{form.subject}</TableCell>
                    <TableCell>{form.teacherName}</TableCell>
                    <TableCell>{form.unitChapter}</TableCell>
                    <TableCell>{form.startDate ? new Date(form.startDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{form.plannedCompletionDate ? new Date(form.plannedCompletionDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{form.actualCompletionDate ? new Date(form.actualCompletionDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={form.status}
                        color={getStatusColor(form.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{form.numberOfPeriodsAllotted || '-'}</TableCell>
                    <TableCell>{form.numberOfPeriodsTaken || '0'}</TableCell>
                    <TableCell>{form.teachingMethodUsed || '-'}</TableCell>
                    <TableCell>{form.completionRate || '0'}</TableCell>
                    <TableCell>{form.remarksTopicsLeft || '-'}</TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton onClick={() => handleViewForm(form)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Update Progress">
                        <IconButton onClick={() => handleEditProgress(form)}>
                          <AssessmentIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Remarks">
                        <IconButton onClick={() => handleEditRemarks(form)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>

        {/* Progress Update Dialog */}
        <Dialog open={openProgressDialog} onClose={() => setOpenProgressDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Update Teaching Progress</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Number of Periods Taken"
                  type="number"
                  value={progressData.numberOfPeriodsTaken}
                  onChange={(e) => setProgressData({ ...progressData, numberOfPeriodsTaken: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Actual Completion Date"
                  value={progressData.actualCompletionDate}
                  onChange={(date) => setProgressData({ ...progressData, actualCompletionDate: date })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Lessons Completed"
                  type="number"
                  value={progressData.lessonsCompleted}
                  onChange={(e) => setProgressData({ ...progressData, lessonsCompleted: e.target.value })}
                  helperText="Number of lessons completed in this unit"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Lessons Pending"
                  type="number"
                  value={progressData.lessonsPending}
                  onChange={(e) => setProgressData({ ...progressData, lessonsPending: e.target.value })}
                  helperText="Number of lessons remaining in this unit"
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Completion Rate Preview
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={currentCompletionRate}
                        color={currentCompletionRate === 100 ? 'success' : 'primary'}
                      />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                      <Typography variant="body2" color="text.secondary">
                        {currentCompletionRate}%
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {progressData.lessonsCompleted || 0} completed / {parseInt(progressData.lessonsCompleted || 0) + parseInt(progressData.lessonsPending || 0)} total lessons
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={progressData.status}
                    onChange={(e) => setProgressData({ ...progressData, status: e.target.value })}
                  >
                    {statuses.map(status => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Topics/Remarks Left"
                  multiline
                  rows={3}
                  value={progressData.remarksTopicsLeft}
                  onChange={(e) => setProgressData({ ...progressData, remarksTopicsLeft: e.target.value })}
                  helperText="Any remaining topics or important remarks about the unit progress"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenProgressDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateProgress} variant="contained" startIcon={<SaveIcon />}>
              Update Progress
            </Button>
          </DialogActions>
        </Dialog>

        {/* Teacher Remarks Dialog */}
        <Dialog open={openRemarksDialog} onClose={() => setOpenRemarksDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Teacher Progress Remarks</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Teacher Remarks"
                  multiline
                  rows={6}
                  value={remarksData.teacherRemarks}
                  onChange={(e) => setRemarksData({ ...remarksData, teacherRemarks: e.target.value })}
                  placeholder="Add your remarks about the unit progress, teaching experience, challenges faced, strategies used, or any other observations..."
                  helperText="These remarks are for tracking your teaching progress and can include insights about the unit completion."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Form Status</InputLabel>
                  <Select
                    value={remarksData.formStatus}
                    onChange={(e) => setRemarksData({ ...remarksData, formStatus: e.target.value })}
                  >
                    {formStatuses.map(status => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenRemarksDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateRemarks} variant="contained" startIcon={<SaveIcon />}>
              Save as Draft
            </Button>
            <Button 
              onClick={() => {
                setRemarksData({ ...remarksData, formStatus: 'Submitted' });
                handleUpdateRemarks();
              }} 
              variant="contained" 
              color="success"
              startIcon={<SendIcon />}
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Unit Progress Details</DialogTitle>
          <DialogContent>
            {selectedForm && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Class:</Typography>
                  <Typography>Class {selectedForm.class}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Section:</Typography>
                  <Typography>Section {selectedForm.section}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Subject:</Typography>
                  <Typography>{selectedForm.subject}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Unit/Chapter:</Typography>
                  <Typography>{selectedForm.unitChapter}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Start Date:</Typography>
                  <Typography>{formatDate(selectedForm.startDate)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Planned Completion:</Typography>
                  <Typography>{formatDate(selectedForm.plannedCompletionDate)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Actual Completion:</Typography>
                  <Typography>
                    {selectedForm.actualCompletionDate ? formatDate(selectedForm.actualCompletionDate) : 'Not completed'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Status:</Typography>
                  <Chip
                    label={selectedForm.status}
                    color={getStatusColor(selectedForm.status)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Form Status:</Typography>
                  <Chip
                    label={selectedForm.formStatus}
                    color={getFormStatusColor(selectedForm.formStatus)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Completion Rate:</Typography>
                  <Typography>{selectedForm.completionRate || 0}%</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Completion Ratio:</Typography>
                  <Typography>{(selectedForm.completionRatio || 0).toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Periods Taken:</Typography>
                  <Typography>{selectedForm.numberOfPeriodsTaken}/{selectedForm.numberOfPeriodsAllotted}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Lessons Completed:</Typography>
                  <Typography>{selectedForm.lessonsCompleted || 0}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Lessons Pending:</Typography>
                  <Typography>{selectedForm.lessonsPending || 0}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Lesson Progress:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={selectedForm.completionRate || 0}
                        color={(selectedForm.completionRate || 0) === 100 ? 'success' : 'primary'}
                      />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                      <Typography variant="body2" color="text.secondary">
                        {selectedForm.completionRate || 0}%
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {selectedForm.lessonsCompleted || 0} completed / {(selectedForm.lessonsCompleted || 0) + (selectedForm.lessonsPending || 0)} total lessons
                  </Typography>
                </Grid>
                <Divider sx={{ my: 2, width: '100%' }} />
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Teacher Remarks</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Progress Remarks:</Typography>
                  <Typography>{selectedForm.teacherRemarks || 'No remarks yet'}</Typography>
                </Grid>
                {selectedForm.remarksTopicsLeft && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Topics/Remarks Left:</Typography>
                    <Typography>{selectedForm.remarksTopicsLeft}</Typography>
                  </Grid>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbars */}
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
          <Alert onClose={() => setError('')} severity="error">
            {error}
          </Alert>
        </Snackbar>
        <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')}>
          <Alert onClose={() => setSuccess('')} severity="success">
            {success}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default TeacherRemarks; 