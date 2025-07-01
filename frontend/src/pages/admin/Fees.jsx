import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Tooltip,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import axios from 'axios';

const Fees = () => {
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [feeStructures, setFeeStructures] = useState([]);
  const [payments, setPayments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    classId: '',
    feeType: '',
    amount: '',
    dueDate: '',
    description: '',
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await adminAPI.getClasses();
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    }
  };

  const fetchFeeStructures = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getFeeStructures({
        classId: selectedClass,
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery,
      });
      setFeeStructures(response.data);
    } catch (error) {
      console.error('Error fetching fee structures:', error);
      toast.error('Failed to load fee structures');
    } finally {
      setLoading(false);
    }
  }, [selectedClass, page, rowsPerPage, searchQuery]);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPayments({
        classId: selectedClass,
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery,
      });
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [selectedClass, page, rowsPerPage, searchQuery]);

  useEffect(() => {
    if (selectedClass) {
      if (tabValue === 0) {
        fetchFeeStructures();
      } else {
        fetchPayments();
      }
    }
  }, [selectedClass, tabValue, page, rowsPerPage, searchQuery, fetchFeeStructures, fetchPayments]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };

  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
    if (tabValue === 0) {
      fetchFeeStructures();
    } else {
      fetchPayments();
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        classId: item.classId,
        feeType: item.feeType,
        amount: item.amount,
        dueDate: item.dueDate,
        description: item.description,
      });
    } else {
      setSelectedItem(null);
      setFormData({
        classId: selectedClass,
        feeType: '',
        amount: '',
        dueDate: '',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (selectedItem) {
        await adminAPI.updateFeeStructure(selectedItem.id, formData);
        toast.success('Fee structure updated successfully');
      } else {
        await axios.post('https://edulives.com/api/api/admin-staff/fee-structure/approval', formData);
        toast.success('Fee approval request submitted successfully. Waiting for principal approval.');
      }
      handleCloseDialog();
      fetchFeeStructures();
    } catch (error) {
      console.error('Error saving fee structure:', error);
      toast.error('Failed to save fee structure');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this fee structure?')) {
      try {
        await adminAPI.deleteFeeStructure(id);
        toast.success('Fee structure deleted successfully');
        fetchFeeStructures();
      } catch (error) {
        console.error('Error deleting fee structure:', error);
        toast.error('Failed to delete fee structure');
      }
    }
  };

  const handleExportPayments = async () => {
    try {
      const response = await adminAPI.exportPayments(selectedClass);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'fee-payments.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Payments exported successfully');
    } catch (error) {
      console.error('Error exporting payments:', error);
      toast.error('Failed to export payments');
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Fees Management</Typography>
        {tabValue === 1 && (
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportPayments}
          >
            Export Payments
          </Button>
        )}
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Fee Structure" />
          <Tab label="Payments" />
        </Tabs>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Select Class</InputLabel>
            <Select
              value={selectedClass}
              onChange={handleClassChange}
              label="Select Class"
            >
              {classes.map((classItem) => (
                <MenuItem key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={`Search ${tabValue === 0 ? 'fee structures' : 'payments'}...`}
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : selectedClass ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {tabValue === 0 ? (
                  <>
                    <TableCell>Fee Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Actions</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>Student</TableCell>
                    <TableCell>Fee Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Payment Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Receipt</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {tabValue === 0 ? (
                feeStructures.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No fee structures found
                    </TableCell>
                  </TableRow>
                ) : (
                  feeStructures.map((structure) => (
                    <TableRow key={structure.id}>
                      <TableCell>{structure.feeType}</TableCell>
                      <TableCell>${structure.amount}</TableCell>
                      <TableCell>{new Date(structure.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>{structure.description}</TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(structure)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(structure.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )
              ) : (
                payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {payment.student.firstName} {payment.student.lastName}
                      </TableCell>
                      <TableCell>{payment.feeType}</TableCell>
                      <TableCell>${payment.amount}</TableCell>
                      <TableCell>
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={payment.status}
                          color={getPaymentStatusColor(payment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Receipt">
                          <IconButton size="small">
                            <ReceiptIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={-1}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <PaymentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Please select a class to view {tabValue === 0 ? 'fee structures' : 'payments'}
          </Typography>
        </Paper>
      )}

      {tabValue === 0 && (
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedItem ? 'Edit Fee Structure' : 'Add Fee Structure'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Fee Type"
                  name="feeType"
                  value={formData.feeType}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {selectedItem ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default Fees; 