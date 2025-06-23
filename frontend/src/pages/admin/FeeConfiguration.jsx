import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  Grid,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Receipt as ReceiptIcon,
  FileDownload as FileDownloadIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const feeTypes = ['Tuition', 'Transportation', 'Library', 'Laboratory', 'Sports', 'Other'];

function TabPanel({ children, value, index }) {
  return value === index && <Box sx={{ py: 3 }}>{children}</Box>;
}

function FeeConfiguration() {
  const [tabValue, setTabValue] = useState(0);
  const [open, setOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [formData, setFormData] = useState({
    grade: '',
    feeType: '',
    amount: '',
    dueDate: '',
    description: '',
  });

  const queryClient = useQueryClient();

  // Fetch fee structures
  const { data: feeStructures, isLoading: isLoadingStructures } = useQuery({
    queryKey: ['feeStructures'],
    queryFn: () => adminAPI.getFeeStructures(),
  });

  const createMutation = useMutation({
    mutationFn: (newData) => adminAPI.createFeeStructure(newData),
    onSuccess: () => {
      toast.success('Fee structure created successfully');
      queryClient.invalidateQueries(['feeStructures']);
      handleClose();
    },
    onError: () => {
      toast.error('Failed to create fee structure');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateFeeStructure(id, data),
    onSuccess: () => {
      toast.success('Fee structure updated successfully');
      queryClient.invalidateQueries(['feeStructures']);
      handleClose();
    },
    onError: () => {
      toast.error('Failed to update fee structure');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteFeeStructure(id),
    onSuccess: () => {
      toast.success('Fee structure deleted successfully');
      queryClient.invalidateQueries(['feeStructures']);
    },
    onError: () => {
      toast.error('Failed to delete fee structure');
    }
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpen = (fee = null) => {
    setSelectedFee(fee);
    setFormData(fee ? { ...fee, dueDate: fee.dueDate.split('T')[0] } : {
      grade: '',
      feeType: '',
      amount: '',
      dueDate: '',
      description: '',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFee(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (selectedFee) {
      updateMutation.mutate({ id: selectedFee._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this fee structure?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoadingStructures) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Fee Structure" />
            <Tab label="Student Fee Records" />
            <Tab label="Staff Salary Records" />
          </Tabs>
        </Box>

        {/* Fee Structure Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5">Fee Structure Configuration</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
            >
              Add Fee Structure
            </Button>
          </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Grade</TableCell>
              <TableCell>Fee Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {feeStructures?.map((fee) => (
              <TableRow key={fee._id}>
                <TableCell>{fee.grade || fee.class}</TableCell>
                <TableCell>{fee.feeType || (fee.components?.[0]?.name)}</TableCell>
                <TableCell>₹{fee.amount || fee.totalAmount}</TableCell>
                <TableCell>{fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : ''}</TableCell>
                <TableCell>{fee.description || fee.components?.[0]?.description}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(fee)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(fee._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedFee ? 'Edit Fee Structure' : 'Add New Fee Structure'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  required
                >
                  {grades.map((grade) => (
                    <MenuItem key={grade} value={grade}>
                      {grade}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Fee Type"
                  name="feeType"
                  value={formData.feeType}
                  onChange={handleInputChange}
                  required
                >
                  {feeTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
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
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
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
                  InputLabelProps={{ shrink: true }}
                  required
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
                  rows={2}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {selectedFee ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      </TabPanel>
    </Box>
  );
}

export default FeeConfiguration; 