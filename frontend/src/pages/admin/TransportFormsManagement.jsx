import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Divider,
  Badge,
  Tooltip,
  Fab
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  Visibility,
  Download,
  PictureAsPdf,
  LocalShipping,
  Schedule,
  Person,
  School,
  TrendingUp,
  FilterList,
  Refresh,
  CheckCircle,
  Cancel,
  Pending,
  Warning
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { transportAPI } from '../../services/api';

const TransportFormsManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    studentName: '',
    rollNumber: '',
    dateFrom: '',
    dateTo: ''
  });

  // Fetch all transport forms
  const { data: formsResponse, isLoading, error } = useQuery({
    queryKey: ['transportForms', filters],
    queryFn: () => transportAPI.getAllForms(filters),
    onError: (error) => {
      console.error('Failed to fetch transport forms:', error);
    }
  });

  // Extract forms array from response, with fallback to empty array
  const forms = Array.isArray(formsResponse?.data) ? formsResponse.data : [];

  // Fetch statistics
  const { data: statsResponse } = useQuery({
    queryKey: ['transportFormStats'],
    queryFn: () => transportAPI.getFormStats('month'),
    onError: (error) => {
      console.error('Failed to fetch transport form stats:', error);
    }
  });

  const stats = statsResponse?.data || {};

  // Delete form mutation
  const deleteMutation = useMutation({
    mutationFn: (formId) => transportAPI.deleteForm(formId),
    onSuccess: () => {
      toast.success('Transport form deleted successfully');
      queryClient.invalidateQueries(['transportForms']);
      setDeleteDialogOpen(false);
      setFormToDelete(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete transport form');
    }
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ formId, statusData }) => transportAPI.updateFormStatus(formId, statusData),
    onSuccess: () => {
      toast.success('Transport form status updated');
      queryClient.invalidateQueries(['transportForms']);
      queryClient.invalidateQueries(['transportFormStats']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update transport form status');
    }
  });

  const handleMenuOpen = (event, form) => {
    setAnchorEl(event.currentTarget);
    setSelectedForm(form);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedForm(null);
  };

  const handleCreateNew = () => {
    navigate('/admin/transport-forms/create');
  };

  const handleEdit = (formId) => {
    navigate(`/admin/transport-forms/${formId}/edit`);
    handleMenuClose();
  };

  const handleView = (formId) => {
    navigate(`/admin/transport-forms/${formId}`);
    handleMenuClose();
  };

  const handleDownloadPDF = async (formId, studentName) => {
    try {
      toast.info('Downloading PDF...');
      
      const pdfBlob = await transportAPI.downloadFormPDF(formId);
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Transport_Form_${studentName}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF downloaded successfully');
      
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
   };

  const handleUpdateStatus = (formId, status) => {
    updateStatusMutation.mutate({ 
      formId, 
      statusData: { status } 
    });
    handleMenuClose();
  };

  const handleDeleteClick = (form) => {
    setFormToDelete(form);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = () => {
    if (formToDelete) {
      deleteMutation.mutate(formToDelete._id);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Pending />;
      case 'approved': return <CheckCircle />;
      case 'rejected': return <Cancel />;
      case 'completed': return <CheckCircle />;
      default: return <Warning />;
    }
  };

  const getRequestTypeLabel = (requestType) => {
    if (!requestType) return 'N/A';
    
    const types = [];
    const labels = {
      regularSchoolCommute: 'Regular School Commute',
      educationalTrip: 'Educational Trip',
      sportsEvent: 'Sports Event',
      culturalFieldVisit: 'Cultural/Field Visit',
      emergencyTransport: 'Emergency Transport',
      other: 'Other'
    };
    
    Object.entries(requestType).forEach(([key, value]) => {
      if (key !== 'otherDescription' && value) {
        const label = labels[key] || key;
        if (key === 'other' && requestType.otherDescription) {
          types.push(`${label} (${requestType.otherDescription})`);
        } else {
          types.push(label);
        }
      }
    });
    
    return types.join(', ') || 'N/A';
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      studentName: '',
      rollNumber: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load transport forms: {error.response?.data?.message || error.message}
        </Alert>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateNew}
        >
          Create New Transport Form
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Transport Services Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateNew}
        >
          Create New Transport Form
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Forms
                  </Typography>
                  <Typography variant="h4">
                    {stats.statusStats?.reduce((sum, stat) => sum + stat.count, 0) || 0}
                  </Typography>
                </Box>
                <LocalShipping color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Pending
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {stats.statusStats?.find(s => s._id === 'pending')?.count || 0}
                  </Typography>
                </Box>
                <Pending color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Approved
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stats.statusStats?.find(s => s._id === 'approved')?.count || 0}
                  </Typography>
                </Box>
                <CheckCircle color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Completed
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {stats.statusStats?.find(s => s._id === 'completed')?.count || 0}
                  </Typography>
                </Box>
                <CheckCircle color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Student Name"
                value={filters.studentName}
                onChange={(e) => handleFilterChange('studentName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Roll Number"
                value={filters.rollNumber}
                onChange={(e) => handleFilterChange('rollNumber', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Date From"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Date To"
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={clearFilters}
                  startIcon={<Refresh />}
                >
                  Clear
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Forms Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Transport Forms ({forms.length})
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Request Type</TableCell>
                  <TableCell>Dates</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {forms.map((form) => (
                  <TableRow key={form._id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {form.studentFullName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {form.gradeClassSection} • {form.rollNumber}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {getRequestTypeLabel(form.requestType)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {new Date(form.dateRequiredFrom).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          to {new Date(form.dateRequiredTo).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(form.status)}
                        label={form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                        color={getStatusColor(form.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(form.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, form)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleView(selectedForm?._id)}>
          <Visibility sx={{ mr: 1 }} fontSize="small" />
          View Form
        </MenuItem>
        <MenuItem onClick={() => handleEdit(selectedForm?._id)}>
          <Edit sx={{ mr: 1 }} fontSize="small" />
          Edit Form
        </MenuItem>
        <MenuItem onClick={() => handleDownloadPDF(selectedForm?._id, selectedForm?.studentFullName)}>
          <Download sx={{ mr: 1 }} fontSize="small" />
          Download PDF
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleUpdateStatus(selectedForm?._id, 'approved')}>
          <CheckCircle sx={{ mr: 1 }} fontSize="small" />
          Approve
        </MenuItem>
        <MenuItem onClick={() => handleUpdateStatus(selectedForm?._id, 'rejected')}>
          <Cancel sx={{ mr: 1 }} fontSize="small" />
          Reject
        </MenuItem>
        <MenuItem onClick={() => handleUpdateStatus(selectedForm?._id, 'completed')}>
          <CheckCircle sx={{ mr: 1 }} fontSize="small" />
          Mark Complete
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => handleDeleteClick(selectedForm)}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Delete Form
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the transport form for "{formToDelete?.studentFullName}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleCreateNew}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default TransportFormsManagement; 