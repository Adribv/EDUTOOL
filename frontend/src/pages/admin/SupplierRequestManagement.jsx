import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Chip,
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
  IconButton,
  Tooltip,
  Pagination,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';

const categories = ['Stationery', 'Classroom Materials', 'Sports Equipment', 'Lab Supplies', 'Maintenance', 'Furniture', 'Other'];
const priorities = ['Low', 'Medium', 'High', 'Urgent'];
const statuses = ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'In Progress', 'Completed'];

function SupplierRequestManagement() {
  const [open, setOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Stationery',
    priority: 'Medium',
    items: [{ name: '', quantity: 1, unit: '', estimatedPrice: 0, specifications: '' }],
    expectedDeliveryDate: '',
    supplier: {
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: ''
    },
    budget: {
      allocated: 0,
      spent: 0,
      remaining: 0
    },
    tags: []
  });

  const queryClient = useQueryClient();

  // Fetch supplier requests
  const { data: requestData, isLoading } = useQuery({
    queryKey: ['supplierRequests', page, searchTerm, statusFilter, priorityFilter, categoryFilter],
    queryFn: () => adminAPI.getSupplierRequests({
      page,
      search: searchTerm,
      status: statusFilter,
      priority: priorityFilter,
      category: categoryFilter
    }),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch supplier request statistics
  const { data: stats } = useQuery({
    queryKey: ['supplierRequestStats'],
    queryFn: () => adminAPI.getSupplierRequestStats(),
    staleTime: 5 * 60 * 1000,
  });

  // Create supplier request mutation
  const createMutation = useMutation({
    mutationFn: adminAPI.createSupplierRequest,
    onSuccess: () => {
      queryClient.invalidateQueries(['supplierRequests']);
      queryClient.invalidateQueries(['supplierRequestStats']);
      toast.success('Supplier request created successfully');
      handleClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create supplier request');
    },
  });

  // Update supplier request mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateSupplierRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['supplierRequests']);
      queryClient.invalidateQueries(['supplierRequestStats']);
      toast.success('Supplier request updated successfully');
      handleClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update supplier request');
    },
  });

  // Delete supplier request mutation
  const deleteMutation = useMutation({
    mutationFn: adminAPI.deleteSupplierRequest,
    onSuccess: () => {
      queryClient.invalidateQueries(['supplierRequests']);
      queryClient.invalidateQueries(['supplierRequestStats']);
      toast.success('Supplier request deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete supplier request');
    },
  });

  const handleOpen = (request = null) => {
    if (request) {
      setSelectedRequest(request);
      setFormData({
        title: request.title,
        description: request.description,
        category: request.category,
        priority: request.priority,
        items: request.items || [{ name: '', quantity: 1, unit: '', estimatedPrice: 0, specifications: '' }],
        expectedDeliveryDate: request.expectedDeliveryDate ? new Date(request.expectedDeliveryDate).toISOString().split('T')[0] : '',
        supplier: request.supplier || { name: '', contactPerson: '', email: '', phone: '', address: '' },
        budget: request.budget || { allocated: 0, spent: 0, remaining: 0 },
        tags: request.tags || []
      });
    } else {
      setSelectedRequest(null);
      setFormData({
        title: '',
        description: '',
        category: 'Stationery',
        priority: 'Medium',
        items: [{ name: '', quantity: 1, unit: '', estimatedPrice: 0, specifications: '' }],
        expectedDeliveryDate: '',
        supplier: { name: '', contactPerson: '', email: '', phone: '', address: '' },
        budget: { allocated: 0, spent: 0, remaining: 0 },
        tags: []
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRequest(null);
    setFormData({
      title: '',
      description: '',
      category: 'Stationery',
      priority: 'Medium',
      items: [{ name: '', quantity: 1, unit: '', estimatedPrice: 0, specifications: '' }],
      expectedDeliveryDate: '',
      supplier: { name: '', contactPerson: '', email: '', phone: '', address: '' },
      budget: { allocated: 0, spent: 0, remaining: 0 },
      tags: []
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate items
    const validItems = formData.items.filter(item => item.name && item.quantity && item.unit);
    if (validItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    const submitData = {
      ...formData,
      items: validItems
    };

    if (selectedRequest) {
      updateMutation.mutate({ id: selectedRequest._id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this supplier request?')) {
      deleteMutation.mutate(id);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent': return 'error';
      case 'High': return 'warning';
      case 'Medium': return 'info';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Approved': return 'info';
      case 'In Progress': return 'warning';
      case 'Rejected': return 'error';
      case 'Submitted': return 'primary';
      case 'Under Review': return 'secondary';
      case 'Draft': return 'default';
      default: return 'default';
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPriorityFilter('');
    setCategoryFilter('');
    setPage(1);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Supplier Request Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          New Request
        </Button>
      </Box>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Requests</Typography>
                </Box>
                <Typography variant="h4">{stats.totalRequests}</Typography>
                <Typography variant="body2" color="text.secondary">
                  All time requests
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">Completed</Typography>
                </Box>
                <Typography variant="h4">{stats.completedRequests}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Successfully delivered
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <BusinessIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6">Submitted</Typography>
                </Box>
                <Typography variant="h4">{stats.submittedRequests}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending approval
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <MoneyIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Cost</Typography>
                </Box>
                <Typography variant="h4">₹{stats.totalEstimatedCost?.toLocaleString() || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Estimated budget
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, description..."
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                {statuses.map(status => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                label="Priority"
              >
                <MenuItem value="">All</MenuItem>
                {priorities.map(priority => (
                  <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
              >
                <MenuItem value="">All</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Requests Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Request #</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Total Cost</TableCell>
                <TableCell>Requested By</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requestData?.requests?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No supplier requests found
                  </TableCell>
                </TableRow>
              ) : (
                requestData?.requests?.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>{request.requestNumber}</TableCell>
                    <TableCell>{request.title}</TableCell>
                    <TableCell>
                      <Chip label={request.category} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={request.priority} 
                        color={getPriorityColor(request.priority)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={request.status} 
                        color={getStatusColor(request.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>₹{request.totalEstimatedCost?.toLocaleString()}</TableCell>
                    <TableCell>{request.requestedBy?.name}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        {request.status === 'Draft' && (
                          <>
                            <Tooltip title="Edit">
                              <IconButton 
                                size="small"
                                onClick={() => handleOpen(request)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton 
                                size="small"
                                onClick={() => handleDelete(request._id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        {requestData?.pagination && (
          <Box display="flex" justifyContent="center" p={2}>
            <Pagination
              count={requestData.pagination.totalPages}
              page={requestData.pagination.currentPage}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedRequest ? 'Edit Supplier Request' : 'New Supplier Request'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    label="Category"
                  >
                    {categories.map(category => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    label="Priority"
                  >
                    {priorities.map(priority => (
                      <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Expected Delivery Date"
                  type="date"
                  value={formData.expectedDeliveryDate}
                  onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SupplierRequestManagement; 