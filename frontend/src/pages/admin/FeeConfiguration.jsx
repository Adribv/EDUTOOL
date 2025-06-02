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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';

const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const feeTypes = ['Tuition', 'Transportation', 'Library', 'Laboratory', 'Sports', 'Other'];

function FeeConfiguration() {
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

  const { data: feeStructures, isLoading } = useQuery({
    queryKey: ['feeStructures'],
    queryFn: () => adminAPI.getFeeStructures(),
  });

  const createMutation = useMutation({
    mutationFn: adminAPI.configureFeeStructure,
    onSuccess: () => {
      queryClient.invalidateQueries(['feeStructures']);
      toast.success('Fee structure added successfully');
      handleClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add fee structure');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateFeeStructure(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['feeStructures']);
      toast.success('Fee structure updated successfully');
      handleClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update fee structure');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminAPI.deleteFeeStructure,
    onSuccess: () => {
      queryClient.invalidateQueries(['feeStructures']);
      toast.success('Fee structure deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete fee structure');
    },
  });

  const handleOpen = (fee = null) => {
    if (fee) {
      setSelectedFee(fee);
      setFormData({
        grade: fee.grade,
        feeType: fee.feeType,
        amount: fee.amount,
        dueDate: fee.dueDate,
        description: fee.description,
      });
    } else {
      setSelectedFee(null);
      setFormData({
        grade: '',
        feeType: '',
        amount: '',
        dueDate: '',
        description: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFee(null);
    setFormData({
      grade: '',
      feeType: '',
      amount: '',
      dueDate: '',
      description: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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

  const handleDownloadReport = async () => {
    try {
      const response = await adminAPI.generateFeeReport();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'fee-report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Fee Configuration</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadReport}
            sx={{ mr: 2 }}
          >
            Download Report
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Add Fee Structure
          </Button>
        </Box>
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
                <TableCell>{fee.grade}</TableCell>
                <TableCell>{fee.feeType}</TableCell>
                <TableCell>${fee.amount}</TableCell>
                <TableCell>{new Date(fee.dueDate).toLocaleDateString()}</TableCell>
                <TableCell>{fee.description}</TableCell>
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
                    startAdornment: '$',
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
    </Box>
  );
}

export default FeeConfiguration; 