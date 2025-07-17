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
  Rating,
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

  // Progress form states
  const [progressData, setProgressData] = useState({
    numberOfPeriodsTaken: '',
    actualCompletionDate: null,
    status: '',
    remarksTopicsLeft: ''
  });

  // Detailed remarks form states
  const [remarksData, setRemarksData] = useState({
    teacherRemarks: '',
    studentPerformance: 'Average',
    classParticipation: 'Moderate',
    homeworkCompletion: 'Sometimes Complete',
    understandingLevel: 'Average',
    areasOfConcern: '',
    suggestionsForImprovement: '',
    parentCommunication: '',
    formStatus: 'Draft'
  });

  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C', 'D', 'E', 'F'];
  const semesters = ['First Term', 'Second Term', 'Third Term', 'Annual'];
  const statuses = ['Not started', 'In Progress', 'Completed', 'Delayed'];
  const formStatuses = ['Draft', 'Submitted', 'Reviewed', 'Approved'];
  const performanceLevels = ['Excellent', 'Good', 'Average', 'Below Average', 'Poor'];
  const participationLevels = ['Very Active', 'Active', 'Moderate', 'Low', 'Very Low'];
  const homeworkLevels = ['Always Complete', 'Usually Complete', 'Sometimes Complete', 'Rarely Complete', 'Never Complete'];

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
      console.log('Updating progress for form:', editingForm._id);
      console.log('Progress data:', progressData);
      
      const response = await teacherRemarksAPI.updateProgress(editingForm._id, progressData);
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
      remarksTopicsLeft: form.remarksTopicsLeft || ''
    });
    setOpenProgressDialog(true);
  };

  const handleEditRemarks = (form) => {
    setEditingForm(form);
    setRemarksData({
      teacherRemarks: form.teacherRemarks || '',
      studentPerformance: form.studentPerformance || 'Average',
      classParticipation: form.classParticipation || 'Moderate',
      homeworkCompletion: form.homeworkCompletion || 'Sometimes Complete',
      understandingLevel: form.understandingLevel || 'Average',
      areasOfConcern: form.areasOfConcern || '',
      suggestionsForImprovement: form.suggestionsForImprovement || '',
      parentCommunication: form.parentCommunication || '',
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
      remarksTopicsLeft: ''
    });
  };

  const resetRemarksData = () => {
    setRemarksData({
      teacherRemarks: '',
      studentPerformance: 'Average',
      classParticipation: 'Moderate',
      homeworkCompletion: 'Sometimes Complete',
      understandingLevel: 'Average',
      areasOfConcern: '',
      suggestionsForImprovement: '',
      parentCommunication: '',
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

  const getPerformanceIcon = (level) => {
    switch (level) {
      case 'Excellent': return <CheckCircleIcon color="success" />;
      case 'Good': return <CheckCircleIcon color="primary" />;
      case 'Average': return <ScheduleIcon color="warning" />;
      case 'Below Average': return <WarningIcon color="warning" />;
      case 'Poor': return <WarningIcon color="error" />;
      default: return null;
    }
  };

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
          Teacher Remarks Management
        </Typography>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Forms
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
                  Draft Forms
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
                  Submitted Forms
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
        </Grid>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="All Forms" />
            <Tab label="Draft Forms" />
            <Tab label="Submitted Forms" />
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
                  <TableCell>Unit/Chapter</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Form Status</TableCell>
                  <TableCell>Completion Rate</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredForms.map((form) => (
                  <TableRow key={form._id}>
                    <TableCell>Class {form.class}</TableCell>
                    <TableCell>Section {form.section}</TableCell>
                    <TableCell>{form.subject}</TableCell>
                    <TableCell>{form.unitChapter}</TableCell>
                    <TableCell>
                      <Chip
                        label={form.status}
                        color={getStatusColor(form.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={form.formStatus}
                        color={getFormStatusColor(form.formStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={form.completionRate}
                            color={form.completionRate === 100 ? 'success' : 'primary'}
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">
                            {form.completionRate}%
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
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
          <DialogTitle>Update Progress</DialogTitle>
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
                  label="Remarks/Topics Left"
                  multiline
                  rows={3}
                  value={progressData.remarksTopicsLeft}
                  onChange={(e) => setProgressData({ ...progressData, remarksTopicsLeft: e.target.value })}
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

        {/* Detailed Remarks Dialog */}
        <Dialog open={openRemarksDialog} onClose={() => setOpenRemarksDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Teacher Remarks</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Teacher Remarks"
                  multiline
                  rows={4}
                  value={remarksData.teacherRemarks}
                  onChange={(e) => setRemarksData({ ...remarksData, teacherRemarks: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Student Performance</InputLabel>
                  <Select
                    value={remarksData.studentPerformance}
                    onChange={(e) => setRemarksData({ ...remarksData, studentPerformance: e.target.value })}
                  >
                    {performanceLevels.map(level => (
                      <MenuItem key={level} value={level}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getPerformanceIcon(level)}
                          <Typography sx={{ ml: 1 }}>{level}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Class Participation</InputLabel>
                  <Select
                    value={remarksData.classParticipation}
                    onChange={(e) => setRemarksData({ ...remarksData, classParticipation: e.target.value })}
                  >
                    {participationLevels.map(level => (
                      <MenuItem key={level} value={level}>{level}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Homework Completion</InputLabel>
                  <Select
                    value={remarksData.homeworkCompletion}
                    onChange={(e) => setRemarksData({ ...remarksData, homeworkCompletion: e.target.value })}
                  >
                    {homeworkLevels.map(level => (
                      <MenuItem key={level} value={level}>{level}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Understanding Level</InputLabel>
                  <Select
                    value={remarksData.understandingLevel}
                    onChange={(e) => setRemarksData({ ...remarksData, understandingLevel: e.target.value })}
                  >
                    {performanceLevels.map(level => (
                      <MenuItem key={level} value={level}>{level}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Areas of Concern"
                  multiline
                  rows={3}
                  value={remarksData.areasOfConcern}
                  onChange={(e) => setRemarksData({ ...remarksData, areasOfConcern: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Suggestions for Improvement"
                  multiline
                  rows={3}
                  value={remarksData.suggestionsForImprovement}
                  onChange={(e) => setRemarksData({ ...remarksData, suggestionsForImprovement: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Parent Communication"
                  multiline
                  rows={2}
                  value={remarksData.parentCommunication}
                  onChange={(e) => setRemarksData({ ...remarksData, parentCommunication: e.target.value })}
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
          <DialogTitle>Teacher Remarks Form Details</DialogTitle>
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
                  <Typography>{selectedForm.completionRate}%</Typography>
                </Grid>
                <Divider sx={{ my: 2, width: '100%' }} />
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Teacher Remarks</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">General Remarks:</Typography>
                  <Typography>{selectedForm.teacherRemarks || 'No remarks yet'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Student Performance:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getPerformanceIcon(selectedForm.studentPerformance)}
                    <Typography sx={{ ml: 1 }}>{selectedForm.studentPerformance || 'Not rated'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Class Participation:</Typography>
                  <Typography>{selectedForm.classParticipation || 'Not rated'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Homework Completion:</Typography>
                  <Typography>{selectedForm.homeworkCompletion || 'Not rated'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Understanding Level:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getPerformanceIcon(selectedForm.understandingLevel)}
                    <Typography sx={{ ml: 1 }}>{selectedForm.understandingLevel || 'Not rated'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Areas of Concern:</Typography>
                  <Typography>{selectedForm.areasOfConcern || 'None specified'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Suggestions for Improvement:</Typography>
                  <Typography>{selectedForm.suggestionsForImprovement || 'None specified'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Parent Communication:</Typography>
                  <Typography>{selectedForm.parentCommunication || 'None specified'}</Typography>
                </Grid>
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