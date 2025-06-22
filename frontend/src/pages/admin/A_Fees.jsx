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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  AttachMoney as AttachMoneyIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import adminService from '../../services/adminService';

const A_Fees = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fees, setFees] = useState([]);
  const [classes, setClasses] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [formData, setFormData] = useState({
    classId: '',
    type: '',
    amount: '',
    dueDate: '',
    description: '',
    academicYear: '',
  });

  useEffect(() => {
    fetchFees();
    fetchClasses();
  }, []);

  const fetchFees = async () => {
    try {
      const response = await adminService.getFees();
      setFees(response.data);
    } catch {
      setError('Failed to load fees');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await adminService.getClasses();
      setClasses(response.data);
    } catch {
      setError('Failed to load classes');
    }
  };

  const handleOpenDialog = (feeData = null) => {
    if (feeData) {
      setEditingFee(feeData);
      setFormData({
        classId: feeData.classId,
        type: feeData.type,
        amount: feeData.amount,
        dueDate: feeData.dueDate,
        description: feeData.description,
        academicYear: feeData.academicYear,
      });
    } else {
      setEditingFee(null);
      setFormData({
        classId: '',
        type: '',
        amount: '',
        dueDate: '',
        description: '',
        academicYear: '',
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
        await adminService.updateFee(editingFee.id, formData);
      } else {
        await adminService.createFee(formData);
      }
      handleCloseDialog();
      fetchFees();
    } catch {
      setError('Failed to save fee');
    }
  };

  const handleDelete = async (feeId) => {
    if (window.confirm('Are you sure you want to delete this fee?')) {
      try {
        await adminService.deleteFee(feeId);
        fetchFees();
      } catch {
        setError('Failed to delete fee');
      }
    }
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
        <Grid item xs={12} md={4}>
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
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SchoolIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Classes with Fees</Typography>
              </Box>
              <Typography variant="h4">
                {new Set(fees.map((fee) => fee.classId)).size}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Amount</Typography>
              </Box>
              <Typography variant="h4">
                ${fees.reduce((total, fee) => total + parseFloat(fee.amount), 0).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Fee List */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Class</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Academic Year</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fees.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell>{fee.className}</TableCell>
                    <TableCell>{fee.type}</TableCell>
                    <TableCell>${fee.amount}</TableCell>
                    <TableCell>{new Date(fee.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{fee.academicYear}</TableCell>
                    <TableCell>
                      <Chip
                        label={fee.status}
                        color={fee.status === 'paid' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenDialog(fee)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(fee.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingFee ? 'Edit Fee' : 'Add New Fee'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Class</InputLabel>
                <Select
                  name="classId"
                  value={formData.classId}
                  onChange={handleChange}
                  required
                >
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.name} - {cls.section}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="tuition">Tuition</MenuItem>
                  <MenuItem value="exam">Exam</MenuItem>
                  <MenuItem value="library">Library</MenuItem>
                  <MenuItem value="sports">Sports</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="amount"
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                fullWidth
                required
                InputProps={{
                  startAdornment: '$',
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="dueDate"
                label="Due Date"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="academicYear"
                label="Academic Year"
                value={formData.academicYear}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingFee ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default A_Fees; 