import React, { useState, useEffect } from 'react';
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
  Divider,
  Tabs,
  Tab,
  TablePagination,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Download,
  Upload,
  Refresh,
  Assessment,
  School,
  Person,
  Schedule,
  Warning
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { syllabusAPI, adminAPI } from '../../services/api';
import { toast } from 'react-toastify';

const SyllabusCompletion = () => {
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formType, setFormType] = useState('');
  const [formFilters, setFormFilters] = useState({
    class: '',
    section: '',
    subject: '',
    teacherId: '',
    status: '',
    academicYear: new Date().getFullYear().toString(),
    semester: 'First Term'
  });
  const [filters, setFilters] = useState({
    class: '',
    section: '',
    subject: '',
    teacherId: '',
    status: '',
    academicYear: new Date().getFullYear().toString(),
    semester: 'First Term'
  });

  const [formData, setFormData] = useState({
    class: '',
    section: '',
    subject: '',
    teacherId: '',
    unitChapter: '',
    startDate: '',
    plannedCompletionDate: '',
    numberOfPeriodsAllotted: '',
    teachingMethodUsed: '',
    academicYear: new Date().getFullYear().toString(),
    semester: 'First Term',
    teacherRemarks: ''
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch teachers for dropdown
  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => adminAPI.getAllStaff({ role: 'Teacher' })
  });

  // Fetch syllabus entries
  const { data: syllabusData, isLoading } = useQuery({
    queryKey: ['syllabusEntries', filters, page, rowsPerPage],
    queryFn: () => syllabusAPI.getAllEntries({
      ...filters,
      page: page + 1,
      limit: rowsPerPage
    })
  });

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ['syllabusStats', filters],
    queryFn: () => syllabusAPI.getStats(filters)
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: syllabusAPI.createEntry,
    onSuccess: () => {
      queryClient.invalidateQueries(['syllabusEntries']);
      queryClient.invalidateQueries(['syllabusStats']);
      setSnackbar({ open: true, message: 'Syllabus entry created successfully', severity: 'success' });
      handleCloseDialog();
    },
    onError: (error) => {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to create syllabus entry', 
        severity: 'error' 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => syllabusAPI.updateEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['syllabusEntries']);
      queryClient.invalidateQueries(['syllabusStats']);
      setSnackbar({ open: true, message: 'Syllabus entry updated successfully', severity: 'success' });
      handleCloseDialog();
    },
    onError: (error) => {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to update syllabus entry', 
        severity: 'error' 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: syllabusAPI.deleteEntry,
    onSuccess: () => {
      queryClient.invalidateQueries(['syllabusEntries']);
      queryClient.invalidateQueries(['syllabusStats']);
      setSnackbar({ open: true, message: 'Syllabus entry deleted successfully', severity: 'success' });
    },
    onError: (error) => {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to delete syllabus entry', 
        severity: 'error' 
      });
    }
  });

  const generateFormMutation = useMutation({
    mutationFn: ({ formType, filters }) => syllabusAPI.generateForm(formType, filters),
    onSuccess: (data) => {
      setSnackbar({ 
        open: true, 
        message: `${formType} form generated successfully!`, 
        severity: 'success' 
      });
      handleCloseFormDialog();
      
      // TODO: Handle download URL when PDF generation is implemented
      if (data.downloadUrl) {
        console.log('Download URL:', data.downloadUrl);
      }
    },
    onError: (error) => {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to generate form', 
        severity: 'error' 
      });
    }
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (entry = null) => {
    if (entry) {
      setEditMode(true);
      setSelectedEntry(entry);
      setFormData({
        class: entry.class,
        section: entry.section,
        subject: entry.subject,
        teacherId: entry.teacherId._id || entry.teacherId,
        unitChapter: entry.unitChapter,
        startDate: entry.startDate ? new Date(entry.startDate).toISOString().split('T')[0] : '',
        plannedCompletionDate: entry.plannedCompletionDate ? new Date(entry.plannedCompletionDate).toISOString().split('T')[0] : '',
        numberOfPeriodsAllotted: entry.numberOfPeriodsAllotted,
        teachingMethodUsed: entry.teachingMethodUsed,
        academicYear: entry.academicYear,
        semester: entry.semester,
        teacherRemarks: entry.teacherRemarks || ''
      });
    } else {
      setEditMode(false);
      setSelectedEntry(null);
      setFormData({
        class: '',
        section: '',
        subject: '',
        teacherId: '',
        unitChapter: '',
        startDate: '',
        plannedCompletionDate: '',
        numberOfPeriodsAllotted: '',
        teachingMethodUsed: '',
        academicYear: new Date().getFullYear().toString(),
        semester: 'First Term',
        teacherRemarks: ''
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditMode(false);
    setSelectedEntry(null);
  };

  const handleSubmit = () => {
    if (editMode) {
      updateMutation.mutate({ id: selectedEntry._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this syllabus entry?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const handleFormFilterChange = (field, value) => {
    setFormFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleOpenFormDialog = (type) => {
    setFormType(type);
    setFormDialogOpen(true);
  };

  const handleCloseFormDialog = () => {
    setFormDialogOpen(false);
    setFormType('');
  };

  const handleGenerateForm = () => {
    generateFormMutation.mutate({ 
      formType, 
      filters: formFilters 
    });
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
  const teachingMethods = [
    'Lecture Method',
    'Discussion Method',
    'Demonstration Method',
    'Project Method',
    'Problem Solving Method',
    'Laboratory Method',
    'Field Trip Method',
    'Audio-Visual Method',
    'Interactive Method',
    'Blended Learning'
  ];

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Subject-wise Syllabus Completion
      </Typography>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Overview" icon={<Assessment />} />
        <Tab label="Manage Entries" icon={<School />} />
        <Tab label="Statistics" icon={<Visibility />} />
        <Tab label="Generate Forms" icon={<Download />} />
      </Tabs>

      {tabValue === 0 && (
        <Grid container spacing={3}>
          {/* Statistics Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Assessment color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Entries</Typography>
                </Box>
                <Typography variant="h4" color="primary">
                  {stats?.data?.totalEntries || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Schedule color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">Completed</Typography>
                </Box>
                <Typography variant="h4" color="success">
                  {stats?.data?.completedEntries || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Person color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6">In Progress</Typography>
                </Box>
                <Typography variant="h4" color="info">
                  {stats?.data?.statusBreakdown?.find(s => s._id === 'In Progress')?.count || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <School color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6">Completion Rate</Typography>
                </Box>
                <Typography variant="h4" color="warning">
                  {stats?.data?.overallCompletionPercentage || 0}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Entries */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Recent Entries</Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleOpenDialog()}
                >
                  Add Entry
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Class</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Unit/Chapter</TableCell>
                      <TableCell>Teacher</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Completion</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {syllabusData?.data?.slice(0, 5).map((entry) => (
                      <TableRow key={entry._id}>
                        <TableCell>{entry.class}-{entry.section}</TableCell>
                        <TableCell>{entry.subject}</TableCell>
                        <TableCell>{entry.unitChapter}</TableCell>
                        <TableCell>{entry.teacherId?.name || entry.teacherName}</TableCell>
                        <TableCell>
                          <Chip 
                            label={entry.status} 
                            color={getStatusColor(entry.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={`${entry.completionRate}%`}
                            color={getCompletionRateColor(entry.completionRate)}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Box>
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
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleOpenDialog()}
                >
                  Add Entry
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Table */}
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Class</TableCell>
                    <TableCell>Section</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Unit/Chapter</TableCell>
                    <TableCell>Teacher</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>Planned Completion</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Periods</TableCell>
                    <TableCell>Completion</TableCell>
                    <TableCell>Teacher Remarks</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={12} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : syllabusData?.data?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} align="center">
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
                        <TableCell>{entry.teacherId?.name || entry.teacherName}</TableCell>
                        <TableCell>
                          {entry.startDate ? new Date(entry.startDate).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          {entry.plannedCompletionDate ? new Date(entry.plannedCompletionDate).toLocaleDateString() : '-'}
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
                        <TableCell>
                          <Chip 
                            label={`${entry.completionRate}%`}
                            color={getCompletionRateColor(entry.completionRate)}
                            size="small"
                          />
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
                        <TableCell>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleOpenDialog(entry)}>
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDelete(entry._id)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={syllabusData?.pagination?.totalEntries || 0}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
            />
          </Paper>
        </Box>
      )}

      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Status Breakdown
              </Typography>
              {stats?.data?.statusBreakdown?.map((stat) => (
                <Box key={stat._id} display="flex" justifyContent="space-between" mb={2}>
                  <Typography>{stat._id}</Typography>
                  <Chip label={stat.count} color="primary" />
                </Box>
              ))}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Overall Statistics
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography>Total Entries:</Typography>
                <Typography variant="h6">{stats?.data?.totalEntries || 0}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography>Completed:</Typography>
                <Typography variant="h6" color="success.main">
                  {stats?.data?.completedEntries || 0}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography>Completion Rate:</Typography>
                <Typography variant="h6" color="primary">
                  {stats?.data?.overallCompletionPercentage || 0}%
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {tabValue === 3 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Generate Syllabus Completion Forms
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create various forms and reports for syllabus completion tracking and analysis.
          </Typography>

          <Grid container spacing={3}>
            {/* Form Generation Cards */}
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => handleOpenFormDialog('Progress Report')}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Assessment color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Progress Report</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Generate detailed progress reports for specific classes, subjects, or teachers showing completion status and timelines.
                  </Typography>
                  <Button variant="outlined" fullWidth>
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => handleOpenFormDialog('Teacher Performance')}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Person color="success" sx={{ mr: 1 }} />
                    <Typography variant="h6">Teacher Performance</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Create performance analysis forms for teachers showing their syllabus completion efficiency and student engagement.
                  </Typography>
                  <Button variant="outlined" fullWidth>
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => handleOpenFormDialog('Class Summary')}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <School color="info" sx={{ mr: 1 }} />
                    <Typography variant="h6">Class Summary</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Generate class-wise summary forms showing overall syllabus completion status and subject-wise breakdown.
                  </Typography>
                  <Button variant="outlined" fullWidth>
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => handleOpenFormDialog('Delayed Units')}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Warning color="warning" sx={{ mr: 1 }} />
                    <Typography variant="h6">Delayed Units</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Create forms highlighting units that are behind schedule with reasons and action plans.
                  </Typography>
                  <Button variant="outlined" fullWidth>
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => handleOpenFormDialog('Subject Analysis')}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Schedule color="secondary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Subject Analysis</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Generate subject-wise analysis forms showing completion rates, teaching methods used, and teacher remarks.
                  </Typography>
                  <Button variant="outlined" fullWidth>
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => handleOpenFormDialog('Academic Year Summary')}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Download color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Academic Year Summary</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Create comprehensive academic year summary forms with semester-wise breakdown and overall statistics.
                  </Typography>
                  <Button variant="outlined" fullWidth>
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Generated Forms */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recently Generated Forms
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Form Type</TableCell>
                    <TableCell>Generated On</TableCell>
                    <TableCell>Filters Applied</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Progress Report</TableCell>
                    <TableCell>{new Date().toLocaleDateString()}</TableCell>
                    <TableCell>Class 10, Mathematics</TableCell>
                    <TableCell>
                      <Chip label="Generated" color="success" size="small" />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary">
                        <Download />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Teacher Performance</TableCell>
                    <TableCell>{new Date(Date.now() - 86400000).toLocaleDateString()}</TableCell>
                    <TableCell>All Teachers</TableCell>
                    <TableCell>
                      <Chip label="Generated" color="success" size="small" />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary">
                        <Download />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Syllabus Entry' : 'Add New Syllabus Entry'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Class</InputLabel>
                <Select
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  label="Class"
                >
                  {classes.map(c => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
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
                  label="Section"
                >
                  {sections.map(s => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
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
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Teacher</InputLabel>
                <Select
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  label="Teacher"
                >
                  {teachers?.map(teacher => (
                    <MenuItem key={teacher._id} value={teacher._id}>
                      {teacher.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Planned Completion Date"
                type="date"
                value={formData.plannedCompletionDate}
                onChange={(e) => setFormData({ ...formData, plannedCompletionDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
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
              <FormControl fullWidth>
                <InputLabel>Teaching Method</InputLabel>
                <Select
                  value={formData.teachingMethodUsed}
                  onChange={(e) => setFormData({ ...formData, teachingMethodUsed: e.target.value })}
                  label="Teaching Method"
                >
                  {teachingMethods.map(method => (
                    <MenuItem key={method} value={method}>{method}</MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                  label="Semester"
                >
                  {semesters.map(s => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Teacher Remarks"
                multiline
                rows={3}
                value={formData.teacherRemarks}
                onChange={(e) => setFormData({ ...formData, teacherRemarks: e.target.value })}
                placeholder="Optional remarks for teachers..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={createMutation.isLoading || updateMutation.isLoading}
          >
            {createMutation.isLoading || updateMutation.isLoading ? (
              <CircularProgress size={20} />
            ) : editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Form Generation Dialog */}
      <Dialog open={formDialogOpen} onClose={handleCloseFormDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Generate {formType} Form
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Select filters for the {formType.toLowerCase()} form:
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Class</InputLabel>
                <Select
                  value={formFilters.class}
                  onChange={(e) => handleFormFilterChange('class', e.target.value)}
                  label="Class"
                >
                  <MenuItem value="">All Classes</MenuItem>
                  {classes.map(c => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Section</InputLabel>
                <Select
                  value={formFilters.section}
                  onChange={(e) => handleFormFilterChange('section', e.target.value)}
                  label="Section"
                >
                  <MenuItem value="">All Sections</MenuItem>
                  {sections.map(s => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Subject"
                value={formFilters.subject}
                onChange={(e) => handleFormFilterChange('subject', e.target.value)}
                placeholder="Enter subject name"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Teacher</InputLabel>
                <Select
                  value={formFilters.teacherId}
                  onChange={(e) => handleFormFilterChange('teacherId', e.target.value)}
                  label="Teacher"
                >
                  <MenuItem value="">All Teachers</MenuItem>
                  {teachers?.map(teacher => (
                    <MenuItem key={teacher._id} value={teacher._id}>
                      {teacher.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formFilters.status}
                  onChange={(e) => handleFormFilterChange('status', e.target.value)}
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
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Semester</InputLabel>
                <Select
                  value={formFilters.semester}
                  onChange={(e) => handleFormFilterChange('semester', e.target.value)}
                  label="Semester"
                >
                  {semesters.map(s => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Form Type:</strong> {formType}<br/>
                  <strong>Format:</strong> PDF<br/>
                  <strong>Include:</strong> Charts, Tables, and Summary Statistics
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFormDialog}>Cancel</Button>
          <Button 
            onClick={handleGenerateForm} 
            variant="contained"
            startIcon={<Download />}
            disabled={generateFormMutation.isLoading}
          >
            {generateFormMutation.isLoading ? (
              <CircularProgress size={20} />
            ) : 'Generate Form'}
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

export default SyllabusCompletion; 