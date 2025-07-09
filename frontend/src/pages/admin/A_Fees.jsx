import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
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
  IconButton,
  Chip,
  Card,
  CardContent,
  Snackbar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  AttachMoney as AttachMoneyIcon,
  School as SchoolIcon,
  Pending as PendingIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
} from '@mui/icons-material';
import axios from 'axios';

const A_Fees = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fees, setFees] = useState([]);
  const [classes, setClasses] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    grade: '',
    feeType: '',
    amount: '',
    dueDate: '',
    description: '',
    academicYear: ''
  });

  useEffect(() => {
    fetchFees();
    fetchClasses();
  }, []);

  const fetchFees = async () => {
    try {
      const [feesResponse, approvalsResponse] = await Promise.all([
        axios.get('https://api.edulives.com/admin-staff/fee-structure/public'),
        axios.get('https://api.edulives.com/admin-staff/approvals?requestType=Fee')
      ]);
      
      const feesData = feesResponse.data;
      const approvalsData = approvalsResponse.data;
      
      // Add approval status to existing fees
      const feesWithStatus = feesData.map(fee => ({
        ...fee,
        status: 'Approved' // Fees in the fee-structure collection are already approved
      }));
      
      // Add pending/rejected fees from approval requests
      const pendingFees = approvalsData
        .filter(approval => approval.status !== 'Approved')
        .map(approval => ({
          _id: approval._id,
          grade: approval.requestData?.grade || '',
          feeType: approval.requestData?.feeType || '',
          amount: approval.requestData?.amount || '',
          dueDate: approval.requestData?.dueDate || '',
          description: approval.description,
          academicYear: approval.requestData?.academicYear || '',
          status: approval.status,
          approvalId: approval._id
        }));
      
      setFees([...feesWithStatus, ...pendingFees]);
    } catch (error) {
      console.error('Error fetching fees:', error);
      setSnackbar({ open: true, message: 'Failed to load fees', severity: 'error' });
      setError('Failed to load fees');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get('https://api.edulives.com/admin-staff/classes/public');
      console.log('Classes data received:', response.data);
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setSnackbar({ open: true, message: 'Failed to load classes', severity: 'error' });
    }
  };

  const handleOpenDialog = (feeData = null) => {
    if (feeData) {
      setEditingFee(feeData);
      setFormData({
        grade: feeData.grade,
        feeType: feeData.feeType,
        amount: feeData.amount,
        dueDate: feeData.dueDate ? new Date(feeData.dueDate).toISOString().split('T')[0] : '',
        description: feeData.description,
        academicYear: feeData.academicYear
      });
    } else {
      setEditingFee(null);
      setFormData({
        grade: '',
        feeType: '',
        amount: '',
        dueDate: '',
        description: '',
        academicYear: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingFee(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (editingFee) {
        await axios.put(`https://api.edulives.com/admin-staff/fee-structure/public/${editingFee._id || editingFee.id}`, formData);
        setSnackbar({ open: true, message: 'Fee updated successfully', severity: 'success' });
      } else {
        // Create approval request instead of directly creating fee
        await axios.post('https://api.edulives.com/admin-staff/fee-structure/approval', formData);
        setSnackbar({ 
          open: true, 
          message: 'Fee approval request submitted successfully. Waiting for principal approval.', 
          severity: 'info' 
        });
      }
      handleCloseDialog();
      fetchFees();
    } catch (error) {
      console.error('Error saving fee:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to save fee', 
        severity: 'error' 
      });
    }
  };

  const handleDelete = async (feeId) => {
    if (window.confirm('Are you sure you want to delete this fee?')) {
      try {
        await axios.delete(`https://api.edulives.com/admin-staff/fee-structure/public/${feeId}`);
        setSnackbar({ open: true, message: 'Fee deleted successfully', severity: 'success' });
        fetchFees();
      } catch (error) {
        console.error('Error deleting fee:', error);
        setSnackbar({ 
          open: true, 
          message: error.response?.data?.message || 'Failed to delete fee', 
          severity: 'error' 
        });
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <ApprovedIcon />;
      case 'Pending':
        return <PendingIcon />;
      case 'Rejected':
        return <RejectedIcon />;
      default:
        return null;
    }
  };

  const getUniqueGrades = () => {
    const grades = classes.map(cls => cls.grade).filter(Boolean);
    return [...new Set(grades)].sort();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Fee Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add New Fee
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Fee Statistics */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Fees</Typography>
              </Box>
              <Typography variant="h4">{fees.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ApprovedIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Approved Fees</Typography>
              </Box>
              <Typography variant="h4">
                {fees.filter((fee) => fee.status === 'Approved').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PendingIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Pending Approval</Typography>
              </Box>
              <Typography variant="h4">
                {fees.filter((fee) => fee.status === 'Pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SchoolIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Grades with Fees</Typography>
              </Box>
              <Typography variant="h4">
                {new Set(fees.map((fee) => fee.grade)).size}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Fee List */}
        <Grid item xs={12}>
          <Paper sx={{ width: '100%', overflow: 'hidden', mt: 3 }}>
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Grade</TableCell>
                    <TableCell>Fee Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Academic Year</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No fees found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    fees.map((fee) => (
                      <TableRow key={fee._id || fee.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {fee.grade}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={fee.feeType} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            ₹{fee.amount}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>{fee.academicYear || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(fee.status)}
                            label={fee.status || 'Pending'}
                            color={getStatusColor(fee.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenDialog(fee)}
                              disabled={fee.status === 'Rejected'}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(fee._id || fee.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Add/Edit Fee Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingFee ? 'Edit Fee' : 'Add New Fee'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Grade</InputLabel>
                <Select
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  label="Grade"
                  required
                >
                  {getUniqueGrades().map((grade) => (
                    <MenuItem key={grade} value={grade}>
                      {grade}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Fee Type</InputLabel>
                <Select
                  name="feeType"
                  value={formData.feeType}
                  onChange={handleChange}
                  label="Fee Type"
                  required
                >
                  <MenuItem value="Tuition Fee">Tuition Fee</MenuItem>
                  <MenuItem value="Transport Fee">Transport Fee</MenuItem>
                  <MenuItem value="Library Fee">Library Fee</MenuItem>
                  <MenuItem value="Laboratory Fee">Laboratory Fee</MenuItem>
                  <MenuItem value="Sports Fee">Sports Fee</MenuItem>
                  <MenuItem value="Examination Fee">Examination Fee</MenuItem>
                  <MenuItem value="Development Fee">Development Fee</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount (₹)"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Due Date"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Academic Year"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                variant="outlined"
                placeholder="e.g., 2024-2025"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                variant="outlined"
                multiline
                rows={3}
                placeholder="Additional details about the fee"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            {editingFee ? 'Update' : 'Submit for Approval'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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

export default A_Fees; 