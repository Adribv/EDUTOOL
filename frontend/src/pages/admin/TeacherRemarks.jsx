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
  Stack,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Subject as SubjectIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { teacherRemarksAPI } from '../../services/api';

const TeacherRemarks = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [editingForm, setEditingForm] = useState(null);
  const [stats, setStats] = useState({});
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

  // Form states
  const [formData, setFormData] = useState({
    class: '',
    section: '',
    subject: '',
    unitChapter: '',
    startDate: null,
    plannedCompletionDate: null,
    numberOfPeriodsAllotted: '',
    teachingMethodUsed: '',
    academicYear: '',
    semester: ''
  });

  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C', 'D', 'E', 'F'];
  const semesters = ['First Term', 'Second Term', 'Third Term', 'Annual'];
  const statuses = ['Not started', 'In Progress', 'Completed', 'Delayed'];
  const formStatuses = ['Draft', 'Submitted', 'Reviewed', 'Approved'];

  useEffect(() => {
    fetchForms();
    fetchStats();
  }, [pagination.currentPage, filters]);

  const fetchForms = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.formsPerPage,
        ...filters
      };
      
      const response = await teacherRemarksAPI.getAllForms(params);
      setForms(response.data);
      setPagination(prev => ({
        ...prev,
        currentPage: response.pagination.currentPage,
        totalPages: response.pagination.totalPages,
        totalForms: response.pagination.totalForms
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch forms');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await teacherRemarksAPI.getStats(filters);
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleCreateForm = async () => {
    try {
      const response = await teacherRemarksAPI.createForm(formData);
      setSuccess('Teacher remarks form created successfully');
      setOpenDialog(false);
      resetFormData();
      fetchForms();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create form');
    }
  };

  const handleUpdateForm = async () => {
    try {
      const response = await teacherRemarksAPI.updateForm(editingForm._id, formData);
      setSuccess('Teacher remarks form updated successfully');
      setOpenDialog(false);
      setEditingForm(null);
      resetFormData();
      fetchForms();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update form');
    }
  };

  const handleDeleteForm = async (id) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      try {
        await teacherRemarksAPI.deleteForm(id);
        setSuccess('Teacher remarks form deleted successfully');
        fetchForms();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete form');
      }
    }
  };

  const handleEditForm = (form) => {
    setEditingForm(form);
    setFormData({
      class: form.class,
      section: form.section,
      subject: form.subject,
      unitChapter: form.unitChapter,
      startDate: new Date(form.startDate),
      plannedCompletionDate: new Date(form.plannedCompletionDate),
      numberOfPeriodsAllotted: form.numberOfPeriodsAllotted,
      teachingMethodUsed: form.teachingMethodUsed,
      academicYear: form.academicYear,
      semester: form.semester
    });
    setOpenDialog(true);
  };

  const handleViewForm = (form) => {
    setSelectedForm(form);
    setOpenViewDialog(true);
  };

  const resetFormData = () => {
    setFormData({
      class: '',
      section: '',
      subject: '',
      unitChapter: '',
      startDate: null,
      plannedCompletionDate: null,
      numberOfPeriodsAllotted: '',
      teachingMethodUsed: '',
      academicYear: '',
      semester: ''
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
                  Total Forms
                </Typography>
                <Typography variant="h4">
                  {stats.totalForms || 0}
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
                  {stats.submittedForms || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Submission Rate
                </Typography>
                <Typography variant="h4">
                  {stats.submissionRate || 0}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Approved Forms
                </Typography>
                <Typography variant="h4">
                  {stats.approvedForms || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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
                {forms.map((form) => (
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
                    <TableCell>{form.completionRate}%</TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton onClick={() => handleViewForm(form)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Form">
                        <IconButton onClick={() => handleEditForm(form)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Form">
                        <IconButton onClick={() => handleDeleteForm(form._id)}>
                          <DeleteIcon />
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

        {/* Create/Edit Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingForm ? 'Edit Teacher Remarks Form' : 'Create Teacher Remarks Form'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Class</InputLabel>
                  <Select
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  >
                    {classes.map(cls => (
                      <MenuItem key={cls} value={cls}>Class {cls}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Section</InputLabel>
                  <Select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  >
                    {sections.map(sec => (
                      <MenuItem key={sec} value={sec}>Section {sec}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Unit/Chapter"
                  value={formData.unitChapter}
                  onChange={(e) => setFormData({ ...formData, unitChapter: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(date) => setFormData({ ...formData, startDate: date })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Planned Completion Date"
                  value={formData.plannedCompletionDate}
                  onChange={(date) => setFormData({ ...formData, plannedCompletionDate: date })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Number of Periods Allotted"
                  type="number"
                  value={formData.numberOfPeriodsAllotted}
                  onChange={(e) => setFormData({ ...formData, numberOfPeriodsAllotted: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teaching Method Used"
                  value={formData.teachingMethodUsed}
                  onChange={(e) => setFormData({ ...formData, teachingMethodUsed: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Academic Year"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Semester</InputLabel>
                  <Select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  >
                    {semesters.map(sem => (
                      <MenuItem key={sem} value={sem}>{sem}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button
              onClick={editingForm ? handleUpdateForm : handleCreateForm}
              variant="contained"
            >
              {editingForm ? 'Update' : 'Create'}
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
                <Grid item xs={12}>
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
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Teacher Remarks:</Typography>
                  <Typography>{selectedForm.teacherRemarks || 'No remarks yet'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Areas of Concern:</Typography>
                  <Typography>{selectedForm.areasOfConcern || 'None specified'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Suggestions for Improvement:</Typography>
                  <Typography>{selectedForm.suggestionsForImprovement || 'None specified'}</Typography>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => {
            setEditingForm(null);
            resetFormData();
            setOpenDialog(true);
          }}
        >
          <AddIcon />
        </Fab>

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