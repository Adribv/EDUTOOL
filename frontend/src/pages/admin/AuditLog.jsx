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
  CardHeader,
  LinearProgress,
  Stack,
  FormHelperText,
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
  Warning,
  CheckCircle,
  Error,
  Info,
  FilterList,
  Search,
  DateRange,
  TrendingUp,
  BarChart,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, parseISO } from 'date-fns';

const AuditLog = () => {
  const [tab, setTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAudit, setEditingAudit] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    auditType: '',
    complianceStatus: '',
    status: '',
    responsiblePerson: '',
    startDate: null,
    endDate: null,
    search: '',
  });

  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    dateOfAudit: new Date(),
    auditType: '',
    auditorName: '',
    auditorDesignation: '',
    scopeOfAudit: '',
    complianceStatus: '',
    nonConformitiesIdentified: '',
    recommendations: '',
    correctiveActions: '',
    responsiblePerson: '',
    targetCompletionDate: new Date(),
    status: 'Open',
  });

  // Fetch audit logs
  const {
    data: auditLogsData,
    isLoading: loadingAuditLogs,
    error: auditLogsError,
    refetch: refetchAuditLogs,
  } = useQuery({
    queryKey: ['auditLogs', page, rowsPerPage, filters],
    queryFn: () => adminAPI.getAuditLogs({
      page: page + 1,
      limit: rowsPerPage,
      ...filters,
      startDate: filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : undefined,
      endDate: filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : undefined,
    }),
  });

  // Fetch audit statistics
  const {
    data: statistics,
    isLoading: loadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ['auditStatistics'],
    queryFn: adminAPI.getAuditStatistics,
  });

  // Create audit log mutation
  const createMutation = useMutation({
    mutationFn: adminAPI.createAuditLog,
    onSuccess: () => {
      queryClient.invalidateQueries(['auditLogs']);
      queryClient.invalidateQueries(['auditStatistics']);
      setSuccess('Audit log created successfully');
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Failed to create audit log');
    },
  });

  // Update audit log mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateAuditLog(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['auditLogs']);
      queryClient.invalidateQueries(['auditStatistics']);
      setSuccess('Audit log updated successfully');
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Failed to update audit log');
    },
  });

  // Delete audit log mutation
  const deleteMutation = useMutation({
    mutationFn: adminAPI.deleteAuditLog,
    onSuccess: () => {
      queryClient.invalidateQueries(['auditLogs']);
      queryClient.invalidateQueries(['auditStatistics']);
      setSuccess('Audit log deleted successfully');
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Failed to delete audit log');
    },
  });

  const auditLogs = auditLogsData?.data || [];
  const pagination = auditLogsData?.pagination || {};

  const resetForm = () => {
    setFormData({
      dateOfAudit: new Date(),
      auditType: '',
      auditorName: '',
      auditorDesignation: '',
      scopeOfAudit: '',
      complianceStatus: '',
      nonConformitiesIdentified: '',
      recommendations: '',
      correctiveActions: '',
      responsiblePerson: '',
      targetCompletionDate: new Date(),
      status: 'Open',
    });
    setEditingAudit(null);
  };

  const handleOpenDialog = (audit = null) => {
    if (audit) {
      setEditingAudit(audit);
      setFormData({
        dateOfAudit: new Date(audit.dateOfAudit),
        auditType: audit.auditType,
        auditorName: audit.auditorName,
        auditorDesignation: audit.auditorDesignation,
        scopeOfAudit: audit.scopeOfAudit,
        complianceStatus: audit.complianceStatus,
        nonConformitiesIdentified: audit.nonConformitiesIdentified || '',
        recommendations: audit.recommendations || '',
        correctiveActions: audit.correctiveActions || '',
        responsiblePerson: audit.responsiblePerson,
        targetCompletionDate: new Date(audit.targetCompletionDate),
        status: audit.status,
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const data = {
      ...formData,
      dateOfAudit: format(formData.dateOfAudit, 'yyyy-MM-dd'),
      targetCompletionDate: format(formData.targetCompletionDate, 'yyyy-MM-dd'),
    };

    if (editingAudit) {
      updateMutation.mutate({ id: editingAudit._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this audit log?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const getComplianceStatusColor = (status) => {
    switch (status) {
      case 'Compliant': return 'success';
      case 'Partially Compliant': return 'warning';
      case 'Non-Compliant': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'error';
      case 'In Progress': return 'warning';
      case 'Closed': return 'success';
      default: return 'default';
    }
  };

  const getAuditTypeColor = (type) => {
    switch (type) {
      case 'Financial': return 'error';
      case 'Academic': return 'primary';
      case 'Safety': return 'warning';
      case 'Infrastructure': return 'info';
      case 'Administrative': return 'secondary';
      default: return 'default';
    }
  };

  const stats = statistics?.data?.overview || {};
  const auditTypeStats = statistics?.data?.auditTypes || [];

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Audit Log Management
      </Typography>

      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Audits
              </Typography>
              <Typography variant="h4">
                {stats.totalAudits || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Compliant
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.compliant || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Open Issues
              </Typography>
              <Typography variant="h4" color="error.main">
                {stats.open || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Closed Issues
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.closed || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
          <Tab label="Audit Logs" icon={<Assessment />} />
          <Tab label="Statistics" icon={<BarChart />} />
        </Tabs>
      </Paper>

      {/* Audit Logs Tab */}
      {tab === 0 && (
        <Box>
          {/* Filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Audit Type</InputLabel>
                  <Select
                    value={filters.auditType}
                    onChange={(e) => handleFilterChange('auditType', e.target.value)}
                    label="Audit Type"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Financial">Financial</MenuItem>
                    <MenuItem value="Academic">Academic</MenuItem>
                    <MenuItem value="Safety">Safety</MenuItem>
                    <MenuItem value="Infrastructure">Infrastructure</MenuItem>
                    <MenuItem value="Administrative">Administrative</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Compliance Status</InputLabel>
                  <Select
                    value={filters.complianceStatus}
                    onChange={(e) => handleFilterChange('complianceStatus', e.target.value)}
                    label="Compliance Status"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Compliant">Compliant</MenuItem>
                    <MenuItem value="Partially Compliant">Partially Compliant</MenuItem>
                    <MenuItem value="Non-Compliant">Non-Compliant</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Open">Open</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Closed">Closed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Responsible Person"
                  value={filters.responsiblePerson}
                  onChange={(e) => handleFilterChange('responsiblePerson', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => {
                    setFilters({
                      auditType: '',
                      complianceStatus: '',
                      status: '',
                      responsiblePerson: '',
                      startDate: null,
                      endDate: null,
                      search: '',
                    });
                    setPage(0);
                  }}
                  fullWidth
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Actions */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Audit Logs ({pagination.totalItems || 0})
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Add Audit Log
            </Button>
          </Box>

          {/* Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date of Audit</TableCell>
                  <TableCell>Audit Type</TableCell>
                  <TableCell>Auditor</TableCell>
                  <TableCell>Scope</TableCell>
                  <TableCell>Compliance</TableCell>
                  <TableCell>Responsible Person</TableCell>
                  <TableCell>Target Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingAuditLogs ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : auditLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  auditLogs.map((audit) => (
                    <TableRow key={audit._id}>
                      <TableCell>
                        {format(new Date(audit.dateOfAudit), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={audit.auditType}
                          size="small"
                          color={getAuditTypeColor(audit.auditType)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {audit.auditorName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {audit.auditorDesignation}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={audit.scopeOfAudit}>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {audit.scopeOfAudit}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={audit.complianceStatus}
                          size="small"
                          color={getComplianceStatusColor(audit.complianceStatus)}
                        />
                      </TableCell>
                      <TableCell>{audit.responsiblePerson}</TableCell>
                      <TableCell>
                        {format(new Date(audit.targetCompletionDate), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={audit.status}
                          size="small"
                          color={getStatusColor(audit.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(audit)}
                          color="primary"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(audit._id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={pagination.totalItems || 0}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Box>
      )}

      {/* Statistics Tab */}
      {tab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Compliance Overview" />
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Compliant</Typography>
                      <Typography variant="body2">{stats.compliant || 0}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={stats.totalAudits ? (stats.compliant / stats.totalAudits) * 100 : 0}
                      color="success"
                    />
                  </Box>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Partially Compliant</Typography>
                      <Typography variant="body2">{stats.partiallyCompliant || 0}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={stats.totalAudits ? (stats.partiallyCompliant / stats.totalAudits) * 100 : 0}
                      color="warning"
                    />
                  </Box>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Non-Compliant</Typography>
                      <Typography variant="body2">{stats.nonCompliant || 0}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={stats.totalAudits ? (stats.nonCompliant / stats.totalAudits) * 100 : 0}
                      color="error"
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Status Overview" />
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Open</Typography>
                      <Typography variant="body2">{stats.open || 0}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={stats.totalAudits ? (stats.open / stats.totalAudits) * 100 : 0}
                      color="error"
                    />
                  </Box>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">In Progress</Typography>
                      <Typography variant="body2">{stats.inProgress || 0}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={stats.totalAudits ? (stats.inProgress / stats.totalAudits) * 100 : 0}
                      color="warning"
                    />
                  </Box>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Closed</Typography>
                      <Typography variant="body2">{stats.closed || 0}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={stats.totalAudits ? (stats.closed / stats.totalAudits) * 100 : 0}
                      color="success"
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Audit Types Distribution" />
              <CardContent>
                <Grid container spacing={2}>
                  {auditTypeStats.map((type) => (
                    <Grid item xs={12} sm={6} md={3} key={type._id}>
                      <Box textAlign="center">
                        <Typography variant="h6" color="primary">
                          {type.count}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {type._id}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAudit ? 'Edit Audit Log' : 'Add New Audit Log'}
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date of Audit"
                  value={formData.dateOfAudit}
                  onChange={(newValue) => setFormData(prev => ({ ...prev, dateOfAudit: newValue }))}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Audit Type</InputLabel>
                  <Select
                    value={formData.auditType}
                    onChange={(e) => setFormData(prev => ({ ...prev, auditType: e.target.value }))}
                    label="Audit Type"
                  >
                    <MenuItem value="Financial">Financial</MenuItem>
                    <MenuItem value="Academic">Academic</MenuItem>
                    <MenuItem value="Safety">Safety</MenuItem>
                    <MenuItem value="Infrastructure">Infrastructure</MenuItem>
                    <MenuItem value="Administrative">Administrative</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Auditor Name"
                  value={formData.auditorName}
                  onChange={(e) => setFormData(prev => ({ ...prev, auditorName: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Auditor Designation"
                  value={formData.auditorDesignation}
                  onChange={(e) => setFormData(prev => ({ ...prev, auditorDesignation: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Scope of Audit"
                  value={formData.scopeOfAudit}
                  onChange={(e) => setFormData(prev => ({ ...prev, scopeOfAudit: e.target.value }))}
                  multiline
                  rows={2}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Compliance Status</InputLabel>
                  <Select
                    value={formData.complianceStatus}
                    onChange={(e) => setFormData(prev => ({ ...prev, complianceStatus: e.target.value }))}
                    label="Compliance Status"
                  >
                    <MenuItem value="Compliant">Compliant</MenuItem>
                    <MenuItem value="Partially Compliant">Partially Compliant</MenuItem>
                    <MenuItem value="Non-Compliant">Non-Compliant</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    label="Status"
                  >
                    <MenuItem value="Open">Open</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Closed">Closed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Non-Conformities Identified"
                  value={formData.nonConformitiesIdentified}
                  onChange={(e) => setFormData(prev => ({ ...prev, nonConformitiesIdentified: e.target.value }))}
                  multiline
                  rows={3}
                  placeholder="Describe any deviations from standards or expected practices..."
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Recommendations"
                  value={formData.recommendations}
                  onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
                  multiline
                  rows={3}
                  placeholder="What actions are advised..."
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Corrective Actions"
                  value={formData.correctiveActions}
                  onChange={(e) => setFormData(prev => ({ ...prev, correctiveActions: e.target.value }))}
                  multiline
                  rows={3}
                  placeholder="Specific actions to be taken..."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Responsible Person"
                  value={formData.responsiblePerson}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsiblePerson: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Target Completion Date"
                  value={formData.targetCompletionDate}
                  onChange={(newValue) => setFormData(prev => ({ ...prev, targetCompletionDate: newValue }))}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={createMutation.isLoading || updateMutation.isLoading}
          >
            {createMutation.isLoading || updateMutation.isLoading ? (
              <CircularProgress size={20} />
            ) : editingAudit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditLog; 