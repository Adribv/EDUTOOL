import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
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
} from '@mui/material';
import staffService from '../../services/staffService';

const T_Partial_Inventory_Control = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    category: '',
    location: '',
  });

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  const fetchInventoryItems = async () => {
    try {
      const response = await staffService.getInventoryItems();
      setInventoryItems(response.data);
    } catch {
      setError('Failed to load inventory items');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewItem({
      name: '',
      quantity: '',
      category: '',
      location: '',
    });
  };

  const handleChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await staffService.createInventoryItem(newItem);
      handleCloseDialog();
      fetchInventoryItems();
    } catch {
      setError('Failed to create inventory item');
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
      <Typography variant="h4" gutterBottom>
        Partial Inventory Control
      </Typography>

      <Button variant="contained" color="primary" onClick={handleOpenDialog} sx={{ mb: 2 }}>
        Add New Item
      </Button>

      <Paper sx={{ p: 3 }}>
        <List>
          {inventoryItems.map((item) => (
            <>
              <ListItem key={item.id} alignItems="flex-start">
                <ListItemText
                  primary={item.name}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        Quantity: {item.quantity}
                      </Typography>
                      <br />
                      Category: {item.category}
                      <br />
                      Location: {item.location}
                    </>
                  }
                />
              </ListItem>
              <Divider component="li" />
            </>
          ))}
        </List>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add New Inventory Item</DialogTitle>
        <DialogContent>
          <TextField
            name="name"
            label="Item Name"
            value={newItem.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            name="quantity"
            label="Quantity"
            type="number"
            value={newItem.quantity}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={newItem.category}
              onChange={handleChange}
              required
            >
              <MenuItem value="stationery">Stationery</MenuItem>
              <MenuItem value="equipment">Equipment</MenuItem>
              <MenuItem value="furniture">Furniture</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField
            name="location"
            label="Location"
            value={newItem.location}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default T_Partial_Inventory_Control; 