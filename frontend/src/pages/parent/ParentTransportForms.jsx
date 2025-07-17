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
  Fab,
  Accordion,
  AccordionSummary,
  AccordionDetails
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
  Warning,
  ExpandMore,
  CalendarToday,
  LocationOn,
  AccessTime
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { parentAPI } from '../../services/api';

const ParentTransportForms = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    studentName: '',
    dateFrom: '',
    dateTo: ''
  });

  // Fetch parent's transport forms
  const { data: formsResponse, isLoading, error } = useQuery({
    queryKey: ['parentTransportForms', filters],
    queryFn: () => parentAPI.getParentTransportForms(),
    onError: (error) => {
      console.error('Failed to fetch transport forms:', error);
    }
  });

  // Extract forms array from response, with fallback to empty array
  const forms = Array.isArray(formsResponse?.data) ? formsResponse.data : [];

  // Filter forms based on current filters
  const filteredForms = forms.filter(form => {
    if (filters.status && form.status !== filters.status) return false;
    if (filters.studentName && !form.studentFullName.toLowerCase().includes(filters.studentName.toLowerCase())) return false;
    if (filters.dateFrom && new Date(form.dateRequiredFrom) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(form.dateRequiredTo) > new Date(filters.dateTo)) return false;
    return true;
  });

  // Delete form mutation
  const deleteMutation = useMutation({
    mutationFn: (formId) => parentAPI.deleteTransportForm(formId),
    onSuccess: () => {
      toast.success('Transport form deleted successfully');
      queryClient.invalidateQueries(['parentTransportForms']);
      setDeleteDialogOpen(false);
      setFormToDelete(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete transport form');
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
    navigate('/parent/transport-forms/create');
  };

  const handleEdit = (formId) => {
    navigate(`/parent/transport-forms/${formId}/edit`);
    handleMenuClose();
  };

  const handleView = (formId) => {
    navigate(`/parent/transport-forms/${formId}`);
    handleMenuClose();
  };

  const handleDownloadPDF = async (formId, studentName) => {
    try {
      toast.info('Downloading PDF...');
      
      const pdfBlob = await parentAPI.downloadTransportFormPDF(formId);
      
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
      dateFrom: '',
      dateTo: ''
    });
  };

  // Calculate statistics
  const stats = {
    total: forms.length,
    pending: forms.filter(f => f.status === 'pending').length,
    approved: forms.filter(f => f.status === 'approved').length,
    completed: forms.filter(f => f.status === 'completed').length
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
        <Typography variant="h5">My Transport Forms</Typography>
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
                    {stats.total}
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
                    {stats.pending}
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
                    {stats.approved}
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
                    {stats.completed}
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
            <Grid item xs={12} sm={6} md={3}>
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
            <Grid item xs={12} sm={6} md={3}>
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

      {/* Forms List */}
      {filteredForms.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <LocalShipping sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Transport Forms Found
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              {forms.length === 0 
                ? "You haven't created any transport forms yet. Create your first transport request to get started."
                : "No forms match your current filters. Try adjusting your search criteria."
              }
            </Typography>
            {forms.length === 0 && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateNew}
                sx={{ mt: 2 }}
              >
                Create Your First Transport Form
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredForms.map((form) => (
            <Grid item xs={12} key={form._id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {form.studentFullName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {form.gradeClassSection} • {form.rollNumber}
                      </Typography>
                      <Chip
                        icon={getStatusIcon(form.status)}
                        label={form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                        color={getStatusColor(form.status)}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, form)}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="subtitle2">Transport Details</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Box display="flex" alignItems="center" mb={1}>
                            <LocationOn sx={{ mr: 1, fontSize: 16 }} />
                            <Typography variant="body2">
                              <strong>Pickup:</strong> {form.pickupLocation}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" mb={1}>
                            <LocationOn sx={{ mr: 1, fontSize: 16 }} />
                            <Typography variant="body2">
                              <strong>Drop:</strong> {form.dropLocation}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box display="flex" alignItems="center" mb={1}>
                            <CalendarToday sx={{ mr: 1, fontSize: 16 }} />
                            <Typography variant="body2">
                              <strong>Dates:</strong> {new Date(form.dateRequiredFrom).toLocaleDateString()} - {new Date(form.dateRequiredTo).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" mb={1}>
                            <AccessTime sx={{ mr: 1, fontSize: 16 }} />
                            <Typography variant="body2">
                              <strong>Times:</strong> {form.pickupTime} - {form.dropTime}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2">
                            <strong>Request Type:</strong> {getRequestTypeLabel(form.requestType)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2">
                            <strong>Purpose:</strong> {form.purposeOfTransportation}
                          </Typography>
                        </Grid>
                        {form.coordinatorComments && (
                          <Grid item xs={12}>
                            <Typography variant="body2" color="primary">
                              <strong>Admin Comments:</strong> {form.coordinatorComments}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

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
        {selectedForm?.status === 'pending' && (
          <MenuItem onClick={() => handleEdit(selectedForm?._id)}>
            <Edit sx={{ mr: 1 }} fontSize="small" />
            Edit Form
          </MenuItem>
        )}
        <MenuItem onClick={() => handleDownloadPDF(selectedForm?._id, selectedForm?.studentFullName)}>
          <Download sx={{ mr: 1 }} fontSize="small" />
          Download PDF
        </MenuItem>
        {selectedForm?.status === 'pending' && (
          <>
            <Divider />
            <MenuItem 
              onClick={() => handleDeleteClick(selectedForm)}
              sx={{ color: 'error.main' }}
            >
              <Delete sx={{ mr: 1 }} fontSize="small" />
              Delete Form
            </MenuItem>
          </>
        )}
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

export default ParentTransportForms; 