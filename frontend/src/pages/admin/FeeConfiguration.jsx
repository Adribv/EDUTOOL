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
import { motion } from 'framer-motion';
import axios from 'axios';

const feeTypes = ['Tuition', 'Transportation', 'Library', 'Laboratory', 'Sports', 'Other'];
const paymentStatus = ['Paid', 'Pending', 'Overdue'];
const initialFormData = { grade: '', feeType: '', amount: '', dueDate: '', description: '' };

function TabPanel({ children, value, index }) {
  return value === index && <Box sx={{ py: 3 }}>{children}</Box>;
}

function FeeConfiguration() {
  const [tabValue, setTabValue] = useState(0);
  const [open, setOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [filters, setFilters] = useState({
    grade: '',
    feeType: '',
    amount: '',
    dueDate: '',
    description: '',
  });

  const queryClient = useQueryClient();

  // Fetch classes to get available grades
  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
              const response = await axios.get('https://api.edulives.com/api/admin-staff/classes/public');
      return response.data;
    },
    onError: (error) => {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    }
  });

  // Get unique grades from classes
  const grades = classes && Array.isArray(classes) ? 
    [...new Set(classes.map(cls => cls.grade))].sort() : [];

  // Fetch fee structures
  const { data: feeStructures, isLoading: isLoadingStructures } = useQuery({
    queryKey: ['feeStructures'],
    queryFn: async () => {
              const response = await axios.get('https://api.edulives.com/api/admin-staff/fee-structure/public');
      return response.data;
    },
    onError: (error) => {
      console.error('Error fetching fee structures:', error);
      toast.error('Failed to load fee structures');
    }
  });

  // Fetch student fee records
  const { data: studentFees, isLoading: isLoadingStudentFees } = useQuery({
    queryKey: ['studentFees'],
    queryFn: () => adminAPI.getStudentFees(),
  });

  // Fetch staff salary records
  const { data: staffSalaries, isLoading: isLoadingStaffSalaries } = useQuery({
    queryKey: ['staffSalaries'],
    queryFn: () => adminAPI.getStaffSalaries(),
  });

  const mutation = useMutation({
    mutationFn: async (values) => {
      if (selectedFee) {
        return axios.put(`https://api.edulives.com/api/admin-staff/fee-structure/public/${selectedFee._id}`, values);
      } else {
        // Create approval request instead of directly creating fee
                  return axios.post('https://api.edulives.com/api/admin-staff/fee-structure/approval', values);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['feeStructures']);
      handleClose();
      if (selectedFee) {
        toast.success('Fee structure updated successfully');
      } else {
        toast.success('Fee approval request submitted successfully. Waiting for principal approval.');
      }
    },
    onError: (error) => {
      console.error('Error saving fee structure:', error);
      toast.error(error.response?.data?.message || 'An error occurred');
    }
  });

  const deleteMutation = useMutation({
          mutationFn: (id) => axios.delete(`https://api.edulives.com/api/admin-staff/fee-structure/public/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['feeStructures']);
      toast.success('Fee structure deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting fee structure:', error);
      toast.error(error.response?.data?.message || 'An error occurred');
    }
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddNew = () => {
    setSelectedFee(null);
    setFormData(initialFormData);
    setOpen(true);
  };

  const handleOpen = (fee) => {
    setSelectedFee(fee);
    setFormData({
      grade: fee.grade || fee.class || '',
      feeType: fee.feeType || fee.components?.[0]?.name || '',
      amount: fee.amount || fee.totalAmount || '',
      dueDate: fee.dueDate ? new Date(fee.dueDate).toISOString().split('T')[0] : '',
      description: fee.description || fee.components?.[0]?.description || '',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFee(null);
    setFormData(initialFormData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this fee structure?')) {
      deleteMutation.mutate(id);
    }
  };

  const exportToExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const downloadReceipt = async (id) => {
    try {
      const response = await adminAPI.generateFeeReceipt(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fee-receipt-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded successfully');
    } catch {
      toast.error('Failed to download report');
    }
  };

  if (isLoadingStructures || isLoadingStudentFees || isLoadingStaffSalaries || classesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Fee Structure" />
           
          </Tabs>
        </Box>

        {/* Fee Structure Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5">Fee Structure Configuration</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
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
                      disabled={classesLoading}
                    >
                      {classesLoading ? (
                        <MenuItem disabled>Loading grades...</MenuItem>
                      ) : (
                        grades.map((grade) => (
                          <MenuItem key={grade} value={grade}>
                            Grade {grade}
                          </MenuItem>
                        ))
                      )}
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
                  disabled={mutation.isPending}
                >
                  {selectedFee ? 'Update' : 'Add'}
                </Button>
              </DialogActions>
            </form>
          </Dialog>
        </TabPanel>
      </motion.div>
    </Box>
  );
}

export default FeeConfiguration; 