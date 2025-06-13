import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../../services/api';

const categories = [
  'Stationery',
  'Classroom Supplies',
  'Lab Equipment',
  'Furniture',
  'Electronic Assets',
  'Library Assets',
  'Sports Equipment',
  'Medical Supplies',
  'Cleaning Supplies',
  'Uniform Store',
];

const validationSchema = Yup.object({
  name: Yup.string().required('Item name is required'),
  category: Yup.string().required('Category is required'),
  quantity: Yup.number()
    .required('Quantity is required')
    .min(0, 'Quantity cannot be negative'),
  unit: Yup.string().required('Unit is required'),
  minimumStock: Yup.number()
    .required('Minimum stock is required')
    .min(0, 'Minimum stock cannot be negative'),
});

const InventoryManagement = () => {
  const [items, setItems] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await api.get('/api/inventory');
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      category: '',
      quantity: '',
      unit: '',
      minimumStock: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (editingItem) {
          await api.put(`/api/inventory/${editingItem._id}`, values);
        } else {
          await api.post('/api/inventory', values);
        }
        fetchItems();
        handleCloseDialog();
      } catch (error) {
        console.error('Error saving item:', error);
      }
    },
  });

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      formik.setValues(item);
    } else {
      setEditingItem(null);
      formik.resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    formik.resetForm();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/api/inventory/${id}`);
        fetchItems();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Inventory Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add New Item
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Minimum Stock</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>{item.minimumStock}</TableCell>
                <TableCell>
                  <Typography
                    color={
                      item.quantity <= item.minimumStock ? 'error' : 'success'
                    }
                  >
                    {item.quantity <= item.minimumStock
                      ? 'Low Stock'
                      : 'In Stock'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(item)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(item._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? 'Edit Item' : 'Add New Item'}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="name"
                  label="Item Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  name="category"
                  label="Category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  error={formik.touched.category && Boolean(formik.errors.category)}
                  helperText={formik.touched.category && formik.errors.category}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="quantity"
                  label="Quantity"
                  type="number"
                  value={formik.values.quantity}
                  onChange={formik.handleChange}
                  error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                  helperText={formik.touched.quantity && formik.errors.quantity}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="unit"
                  label="Unit"
                  value={formik.values.unit}
                  onChange={formik.handleChange}
                  error={formik.touched.unit && Boolean(formik.errors.unit)}
                  helperText={formik.touched.unit && formik.errors.unit}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="minimumStock"
                  label="Minimum Stock"
                  type="number"
                  value={formik.values.minimumStock}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.minimumStock &&
                    Boolean(formik.errors.minimumStock)
                  }
                  helperText={
                    formik.touched.minimumStock && formik.errors.minimumStock
                  }
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingItem ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default InventoryManagement; 