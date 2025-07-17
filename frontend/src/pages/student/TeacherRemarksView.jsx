import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  LinearProgress,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Subject as SubjectIcon,
  Assessment as AssessmentIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { teacherRemarksAPI } from '../../services/api';

const TeacherRemarksView = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedForm, setSelectedForm] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter states
  const [filters, setFilters] = useState({
    subject: '',
    status: '',
    formStatus: '',
    academicYear: '',
    semester: ''
  });

  const semesters = ['First Term', 'Second Term', 'Third Term', 'Annual'];
  const statuses = ['Not started', 'In Progress', 'Completed', 'Delayed'];
  const formStatuses = ['Draft', 'Submitted', 'Reviewed', 'Approved'];

  useEffect(() => {
    fetchForms();
  }, [filters]);

  const fetchForms = async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      const response = await teacherRemarksAPI.getStudentForms(params);
      setForms(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch teacher remarks');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
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
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    }).replace(' ', '-');
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
    if (activeTab === 1) return form.formStatus === 'Submitted' || form.formStatus === 'Approved';
    if (activeTab === 2) return form.status === 'Delayed';
    if (activeTab === 3) return form.status === 'Completed';
    return true;
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedForms = filteredForms.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Subject wise syllabus completion format
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
                {forms.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completed Units
              </Typography>
              <Typography variant="h4">
                {forms.filter(f => f.status === 'Completed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                In Progress
              </Typography>
              <Typography variant="h4">
                {forms.filter(f => f.status === 'In Progress').length}
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
          <Tab label="All Units" />
          <Tab label="Teacher Remarks" />
          <Tab label="Delayed Units" />
          <Tab label="Completed Units" />
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

      {/* Table View */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
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
                <TableCell>No of Periods allotted</TableCell>
                <TableCell>No of Periods taken</TableCell>
                <TableCell>Teaching method used</TableCell>
                <TableCell>Completion rate</TableCell>
                <TableCell>Remarks/Topics left</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedForms.map((form) => (
                <TableRow key={form._id} hover>
                  <TableCell>{form.class}</TableCell>
                  <TableCell>{form.section}</TableCell>
                  <TableCell>{form.subject}</TableCell>
                  <TableCell>{form.teacherId?.name || form.teacherName || 'N/A'}</TableCell>
                  <TableCell>{form.unitChapter}</TableCell>
                  <TableCell>{formatDate(form.startDate)}</TableCell>
                  <TableCell>{formatDate(form.plannedCompletionDate)}</TableCell>
                  <TableCell>{formatDate(form.actualCompletionDate)}</TableCell>
                  <TableCell>
                      <Chip
                        label={form.status}
                        color={getStatusColor(form.status)}
                        size="small"
                      />
                  </TableCell>
                  <TableCell>{form.numberOfPeriodsAllotted}</TableCell>
                  <TableCell>{form.numberOfPeriodsTaken}</TableCell>
                  <TableCell>{form.teachingMethodUsed}</TableCell>
                  <TableCell>{form.completionRate}%</TableCell>
                  <TableCell>
                    {form.remarksTopicsLeft || 
                     (form.teacherRemarks ? 'Teacher remarks available' : '')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredForms.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {filteredForms.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            No teacher remarks found for the selected filters.
          </Typography>
        </Box>
      )}

      {/* Snackbars */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TeacherRemarksView; 