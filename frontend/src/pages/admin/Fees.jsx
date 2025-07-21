import { useState, useEffect, useCallback } from 'react';
import FeeRecords from './FeeRecords';
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
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import axios from 'axios';

const Fees = () => {
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [feeStructures, setFeeStructures] = useState([]);
  // (No class filtering variable needed)
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

  // Removed fetchClasses logic as dropdown removed

  const fetchFeeStructures = useCallback(async () => {
    try {
      setLoading(true);
      // Some API helpers return the data directly, others wrap in { data }
      const res = await adminAPI.getFeeStructures({
        // No class filter
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery,
      });
      // Normalise: ensure we always pass an array
      const data = Array.isArray(res?.data) ? res.data
                   : Array.isArray(res) ? res
                   : Array.isArray(res?.data?.data) ? res.data.data
                   : [];
      setFeeStructures(data);
    } catch (error) {
      console.error('Error fetching fee structures:', error);
      toast.error('Failed to load fee structures');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchQuery]);

  // Removed payments export handler

  useEffect(() => {
    if (tabValue === 0) {
      fetchFeeStructures();
    }
    // No fetch needed for tabValue 2 (Fee Records) – component handles its own data
  }, [tabValue, page, rowsPerPage, searchQuery, fetchFeeStructures]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };

  // Removed class change handler

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
    fetchFeeStructures();
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
        classId: '', // No class selected for fee structure
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
        await axios.post('https://api.edulives.com/api/admin-staff/fee-structure/approval', formData);
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

  // Removed getPaymentStatusColor since payments tab is removed

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Fees Management</Typography>
        {/* No payments tab; export removed */}
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Fee Structure" />
          <Tab label="Fee Records" />
        </Tabs>
      </Paper>

      {/* Add Fee Structure Button - only show on Fee Structure tab */}
      {tabValue === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Fee Structure
          </Button>
        </Box>
      )}

      {/* Class dropdown removed per requirements */}

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

      {tabValue === 1 ? (
        <FeeRecords />
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
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
                (!Array.isArray(feeStructures) || feeStructures.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No fee structures found
                    </TableCell>
                  </TableRow>
                ) : (
                  (Array.isArray(feeStructures) ? feeStructures : []).map((structure) => (
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
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No fee records found
                  </TableCell>
                </TableRow>
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