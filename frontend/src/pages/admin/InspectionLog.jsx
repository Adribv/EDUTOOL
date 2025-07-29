import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Grid,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  Alert,
  Snackbar,
  Tooltip,
  Fab,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { adminAPI } from '../../services/api';

const InspectionLog = () => {
  const [inspectionLogs, setInspectionLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [viewingLog, setViewingLog] = useState(null);

  const [statistics, setStatistics] = useState({});
  const [filters, setFilters] = useState({
    designation: '',
    purposeOfVisit: '',
    followUpRequired: '',
    startDate: null,
    endDate: null,
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form state
  const [formData, setFormData] = useState({
    dateOfInspection: new Date(),
    inspectorName: '',
    designation: '',
    purposeOfVisit: '',
    summaryOfObservations: '',
    recommendationsGiven: '',
    actionTakenBySchool: '',
    followUpRequired: false,
    nextVisitDate: null
  });



  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchInspectionLogs();
    fetchStatistics();
  }, [filters]);

  const fetchInspectionLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filters.designation) params.designation = filters.designation;
      if (filters.purposeOfVisit) params.purposeOfVisit = filters.purposeOfVisit;
      if (filters.followUpRequired !== '') params.followUpRequired = filters.followUpRequired;
      if (filters.startDate) params.startDate = format(filters.startDate, 'yyyy-MM-dd');
      if (filters.endDate) params.endDate = format(filters.endDate, 'yyyy-MM-dd');
      if (filters.search) params.search = filters.search;

      console.log('🔍 Fetching inspection logs with params:', params);
      console.log('🔍 User token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      console.log('🔍 User role:', user.role);

      const response = await adminAPI.getInspectionLogs(params);
      console.log('🔍 Inspection logs response:', response);
      setInspectionLogs(response.data || []);
    } catch (error) {
      console.error('❌ Error fetching inspection logs:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error message:', error.message);
      showSnackbar(`Error fetching inspection logs: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      console.log('🔍 Fetching inspection statistics...');
      const response = await adminAPI.getInspectionStatistics();
      console.log('🔍 Statistics response:', response);
      setStatistics(response.data);
    } catch (error) {
      console.error('❌ Error fetching statistics:', error);
      console.error('❌ Error response:', error.response);
    }
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        dateOfInspection: format(formData.dateOfInspection, 'yyyy-MM-dd'),
        nextVisitDate: formData.nextVisitDate ? format(formData.nextVisitDate, 'yyyy-MM-dd') : null
      };

      if (editingLog) {
        await adminAPI.updateInspectionLog(editingLog._id, data);
        showSnackbar('Inspection log updated successfully');
      } else {
        await adminAPI.createInspectionLog(data);
        showSnackbar('Inspection log created successfully');
      }

      handleCloseDialog();
      fetchInspectionLogs();
      fetchStatistics();
    } catch (error) {
      console.error('Error saving inspection log:', error);
      showSnackbar(error.response?.data?.message || 'Error saving inspection log', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this inspection log?')) {
      try {
        await adminAPI.deleteInspectionLog(id);
        showSnackbar('Inspection log deleted successfully');
        fetchInspectionLogs();
        fetchStatistics();
      } catch (error) {
        console.error('Error deleting inspection log:', error);
        showSnackbar(error.response?.data?.message || 'Error deleting inspection log', 'error');
      }
    }
  };



  const handleOpenDialog = (log = null) => {
    if (log) {
      setEditingLog(log);
      setFormData({
        dateOfInspection: new Date(log.dateOfInspection),
        inspectorName: log.inspectorName,
        designation: log.designation,
        purposeOfVisit: log.purposeOfVisit,
        summaryOfObservations: log.summaryOfObservations,
        recommendationsGiven: log.recommendationsGiven || '',
        actionTakenBySchool: log.actionTakenBySchool || '',
        followUpRequired: log.followUpRequired,
        nextVisitDate: log.nextVisitDate ? new Date(log.nextVisitDate) : null
      });
    } else {
      setEditingLog(null);
      setFormData({
        dateOfInspection: new Date(),
        inspectorName: '',
        designation: '',
        purposeOfVisit: '',
        summaryOfObservations: '',
        recommendationsGiven: '',
        actionTakenBySchool: '',
        followUpRequired: false,
        nextVisitDate: null
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingLog(null);
    setFormData({
      dateOfInspection: new Date(),
      inspectorName: '',
      designation: '',
      purposeOfVisit: '',
      summaryOfObservations: '',
      recommendationsGiven: '',
      actionTakenBySchool: '',
      followUpRequired: false,
      nextVisitDate: null
    });
  };

  const handleViewLog = (log) => {
    setViewingLog(log);
  };



  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };



  const canCreate = user.role === 'AdminStaff';
  const canEdit = (log) => {
    if (user.role === 'VP' || user.role === 'Principal') return true;
    if (user.role === 'AdminStaff') return log.createdBy?._id === user.id;
    return false;
  };
  const canDelete = (log) => {
    if (user.role === 'VP' || user.role === 'Principal') return true;
    if (user.role === 'AdminStaff') return log.createdBy?._id === user.id;
    return false;
  };


  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon />
            Inspection Log Management
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ mr: 1 }}
            >
              Filters
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                setFilters({
                  designation: '',
                  purposeOfVisit: '',
                  status: '',
                  followUpRequired: '',
                  startDate: null,
                  endDate: null,
                  search: ''
                });
              }}
              sx={{ mr: 1 }}
            >
              Clear
            </Button>
            {canCreate && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add Inspection Log
              </Button>
            )}
          </Box>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Inspections
                </Typography>
                <Typography variant="h4">
                  {statistics.totalInspections || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Follow-up Required
                </Typography>
                <Typography variant="h4" color="error.main">
                  {statistics.followUpRequired || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Recent (30 days)
                </Typography>
                <Typography variant="h4" color="info.main">
                  {statistics.recentInspections || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        {showFilters && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Search"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search inspector name, observations..."
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Designation</InputLabel>
                  <Select
                    value={filters.designation}
                    onChange={(e) => setFilters({ ...filters, designation: e.target.value })}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="DEO">DEO</MenuItem>
                    <MenuItem value="Cluster Officer">Cluster Officer</MenuItem>
                    <MenuItem value="Principal">Principal</MenuItem>
                    <MenuItem value="VP">VP</MenuItem>
                    <MenuItem value="HOD">HOD</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Purpose of Visit</InputLabel>
                  <Select
                    value={filters.purposeOfVisit}
                    onChange={(e) => setFilters({ ...filters, purposeOfVisit: e.target.value })}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Routine Check">Routine Check</MenuItem>
                    <MenuItem value="Surprise Audit">Surprise Audit</MenuItem>
                    <MenuItem value="Syllabus Review">Syllabus Review</MenuItem>
                    <MenuItem value="Safety Inspection">Safety Inspection</MenuItem>
                    <MenuItem value="Academic Review">Academic Review</MenuItem>
                    <MenuItem value="Infrastructure Check">Infrastructure Check</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Follow-up Required</InputLabel>
                  <Select
                    value={filters.followUpRequired}
                    onChange={(e) => setFilters({ ...filters, followUpRequired: e.target.value })}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="true">Yes</MenuItem>
                    <MenuItem value="false">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Start Date"
                  value={filters.startDate}
                  onChange={(date) => setFilters({ ...filters, startDate: date })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="End Date"
                  value={filters.endDate}
                  onChange={(date) => setFilters({ ...filters, endDate: date })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Inspection Logs Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Inspector</TableCell>
                <TableCell>Designation</TableCell>
                <TableCell>Purpose</TableCell>
                <TableCell>Follow-up</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inspectionLogs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell>
                    {format(new Date(log.dateOfInspection), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>{log.inspectorName}</TableCell>
                  <TableCell>{log.designation}</TableCell>
                  <TableCell>{log.purposeOfVisit}</TableCell>
                  <TableCell>
                    <Chip
                      label={log.followUpRequired ? 'Yes' : 'No'}
                      color={log.followUpRequired ? 'error' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewLog(log)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      {canEdit(log) && (
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(log)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canDelete(log) && (
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(log._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingLog ? 'Edit Inspection Log' : 'Add New Inspection Log'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date of Inspection"
                  value={formData.dateOfInspection}
                  onChange={(date) => setFormData({ ...formData, dateOfInspection: date })}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Inspector Name"
                  value={formData.inspectorName}
                  onChange={(e) => setFormData({ ...formData, inspectorName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Designation</InputLabel>
                  <Select
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  >
                    <MenuItem value="DEO">DEO</MenuItem>
                    <MenuItem value="Cluster Officer">Cluster Officer</MenuItem>
                    <MenuItem value="Principal">Principal</MenuItem>
                    <MenuItem value="VP">VP</MenuItem>
                    <MenuItem value="HOD">HOD</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Purpose of Visit</InputLabel>
                  <Select
                    value={formData.purposeOfVisit}
                    onChange={(e) => setFormData({ ...formData, purposeOfVisit: e.target.value })}
                  >
                    <MenuItem value="Routine Check">Routine Check</MenuItem>
                    <MenuItem value="Surprise Audit">Surprise Audit</MenuItem>
                    <MenuItem value="Syllabus Review">Syllabus Review</MenuItem>
                    <MenuItem value="Safety Inspection">Safety Inspection</MenuItem>
                    <MenuItem value="Academic Review">Academic Review</MenuItem>
                    <MenuItem value="Infrastructure Check">Infrastructure Check</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Summary of Observations"
                  value={formData.summaryOfObservations}
                  onChange={(e) => setFormData({ ...formData, summaryOfObservations: e.target.value })}
                  multiline
                  rows={3}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Recommendations Given"
                  value={formData.recommendationsGiven}
                  onChange={(e) => setFormData({ ...formData, recommendationsGiven: e.target.value })}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Action Taken by School"
                  value={formData.actionTakenBySchool}
                  onChange={(e) => setFormData({ ...formData, actionTakenBySchool: e.target.value })}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.followUpRequired}
                      onChange={(e) => setFormData({ ...formData, followUpRequired: e.target.checked })}
                    />
                  }
                  label="Follow-up Required"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Next Visit Date"
                  value={formData.nextVisitDate}
                  onChange={(date) => setFormData({ ...formData, nextVisitDate: date })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  disabled={!formData.followUpRequired}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingLog ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={!!viewingLog} onClose={() => setViewingLog(null)} maxWidth="md" fullWidth>
          {viewingLog && (
            <>
              <DialogTitle>Inspection Log Details</DialogTitle>
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Date of Inspection</Typography>
                    <Typography variant="body1">
                      {format(new Date(viewingLog.dateOfInspection), 'dd/MM/yyyy')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Inspector Name</Typography>
                    <Typography variant="body1">{viewingLog.inspectorName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Designation</Typography>
                    <Typography variant="body1">{viewingLog.designation}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Purpose of Visit</Typography>
                    <Typography variant="body1">{viewingLog.purposeOfVisit}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Summary of Observations</Typography>
                    <Typography variant="body1">{viewingLog.summaryOfObservations}</Typography>
                  </Grid>
                  {viewingLog.recommendationsGiven && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Recommendations Given</Typography>
                      <Typography variant="body1">{viewingLog.recommendationsGiven}</Typography>
                    </Grid>
                  )}
                  {viewingLog.actionTakenBySchool && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Action Taken by School</Typography>
                      <Typography variant="body1">{viewingLog.actionTakenBySchool}</Typography>
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Follow-up Required</Typography>
                    <Typography variant="body1">
                      {viewingLog.followUpRequired ? 'Yes' : 'No'}
                    </Typography>
                  </Grid>
                  {viewingLog.nextVisitDate && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Next Visit Date</Typography>
                      <Typography variant="body1">
                        {format(new Date(viewingLog.nextVisitDate), 'dd/MM/yyyy')}
                      </Typography>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" color="textSecondary">Created By</Typography>
                    <Typography variant="body1">
                      {viewingLog.createdBy?.name} ({viewingLog.createdBy?.designation})
                    </Typography>
                    {viewingLog.updatedBy && (
                      <>
                        <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 1 }}>
                          Last Updated By
                        </Typography>
                        <Typography variant="body1">
                          {viewingLog.updatedBy.name} ({viewingLog.updatedBy.designation})
                        </Typography>
                      </>
                    )}
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setViewingLog(null)}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>



        {/* Snackbar */}
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
    </LocalizationProvider>
  );
};

export default InspectionLog; 