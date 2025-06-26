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
import axios from 'axios';
import { toast } from 'react-toastify';

const A_Fees = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fees, setFees] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
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
      const response = await axios.get('http://localhost:5000/api/admin-staff/fee-structure/public');
      setFees(response.data);
    } catch (error) {
      console.error('Error fetching fees:', error);
      toast.error('Failed to load fees');
      setError('Failed to load fees');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin-staff/classes/public');
      console.log('Classes data received:', response.data);
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setClassesLoading(false);
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
        await axios.put(`http://localhost:5000/api/admin-staff/fee-structure/public/${editingFee._id || editingFee.id}`, formData);
        toast.success('Fee updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/admin-staff/fee-structure/public', formData);
        toast.success('Fee created successfully');
      }
      handleCloseDialog();
      fetchFees();
    } catch (error) {
      console.error('Error saving fee:', error);
      toast.error(error.response?.data?.message || 'Failed to save fee');
    }
  };

  const handleDelete = async (feeId) => {
    if (window.confirm('Are you sure you want to delete this fee?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin-staff/fee-structure/public/${feeId}`);
        toast.success('Fee deleted successfully');
        fetchFees();
      } catch (error) {
        console.error('Error deleting fee:', error);
        toast.error(error.response?.data?.message || 'Failed to delete fee');
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
                <Typography variant="h6">Grades with Fees</Typography>
              </Box>
              <Typography variant="h4">
                {new Set(fees.filter(fee => fee.grade).map((fee) => fee.grade)).size}
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
                ${fees.reduce((total, fee) => {
                  const amount = parseFloat(fee.amount) || 0;
                  return total + amount;
                }, 0).toFixed(2)}
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
                  <TableCell>Grade</TableCell>
                  <TableCell>Fee Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fees.map((fee) => (
                  <TableRow key={fee._id || fee.id}>
                    <TableCell>{fee.grade}</TableCell>
                    <TableCell>{fee.feeType}</TableCell>
                    <TableCell>${fee.amount}</TableCell>
                    <TableCell>{new Date(fee.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{fee.description}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenDialog(fee)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(fee._id || fee.id)} color="error">
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
                <InputLabel>Grade</InputLabel>
                <Select
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  required
                  disabled={classesLoading}
                >
                  {classesLoading ? (
                    <MenuItem disabled>Loading grades...</MenuItem>
                  ) : (
                    (() => {
                      const uniqueGrades = classes && Array.isArray(classes) ? 
                        [...new Set(classes.map(cls => cls.grade))].sort() : [];
                      console.log('Available grades:', uniqueGrades);
                      return uniqueGrades.map((grade) => (
                        <MenuItem key={grade} value={grade}>
                          Grade {grade}
                        </MenuItem>
                      ));
                    })()
                  )}
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
                  required
                >
                  <MenuItem value="Tuition">Tuition</MenuItem>
                  <MenuItem value="Exam">Exam</MenuItem>
                  <MenuItem value="Library">Library</MenuItem>
                  <MenuItem value="Sports">Sports</MenuItem>
                  <MenuItem value="Transport">Transport</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
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