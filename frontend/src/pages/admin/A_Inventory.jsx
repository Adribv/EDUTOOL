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
  Inventory as InventoryIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';

const A_Inventory = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: '',
    location: '',
    description: '',
    supplier: '',
    lastRestocked: '',
    unitPrice: '',
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const data = await adminAPI.getInventory();
      setInventory(data);
    } catch {
      setError('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (itemData = null) => {
    if (itemData) {
      setEditingItem(itemData);
      setFormData({
        name: itemData.name,
        category: itemData.category,
        quantity: itemData.quantity,
        unit: itemData.unit,
        location: itemData.location,
        description: itemData.description,
        supplier: itemData.supplier,
        lastRestocked: itemData.lastRestocked,
        unitPrice: itemData.unitPrice,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        category: '',
        quantity: '',
        unit: '',
        location: '',
        description: '',
        supplier: '',
        lastRestocked: '',
        unitPrice: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (editingItem) {
        await adminAPI.updateInventoryItem(editingItem._id, formData);
      } else {
        await adminAPI.createInventoryItem(formData);
      }
      handleCloseDialog();
      fetchInventory();
    } catch {
      setError('Failed to save inventory item');
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await adminAPI.deleteInventoryItem(itemId);
        fetchInventory();
      } catch {
        setError('Failed to delete inventory item');
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
        <Typography variant="h4">Inventory Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add New Item
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Inventory Statistics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <InventoryIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Items</Typography>
              </Box>
              <Typography variant="h4">{inventory.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SchoolIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Categories</Typography>
              </Box>
              <Typography variant="h4">
                {new Set(inventory.map((item) => item.category)).size}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <InventoryIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Low Stock Items</Typography>
              </Box>
              <Typography variant="h4">
                {inventory.filter((item) => item.quantity < 10).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Inventory List */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell>Last Restocked</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item._id || item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      {item.quantity} {item.unit}
                    </TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{item.supplier?.name ?? '-'}</TableCell>
                    <TableCell>
                      {new Date(item.lastRestocked).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.quantity < 10 ? 'Low Stock' : 'In Stock'}
                        color={item.quantity < 10 ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenDialog(item)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(item._id)} color="error">
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
          {editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Item Name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="furniture">Furniture</MenuItem>
                  <MenuItem value="electronics">Electronics</MenuItem>
                  <MenuItem value="stationery">Stationery</MenuItem>
                  <MenuItem value="sports">Sports</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="quantity"
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="unit"
                label="Unit"
                value={formData.unit}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="unitPrice"
                label="Unit Price"
                type="number"
                value={formData.unitPrice}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="location"
                label="Location"
                value={formData.location}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="supplier"
                label="Supplier"
                value={formData.supplier}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="lastRestocked"
                label="Last Restocked"
                type="date"
                value={formData.lastRestocked}
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default A_Inventory; 