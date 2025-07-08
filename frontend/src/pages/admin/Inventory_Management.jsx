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
  Tabs,
  Tab,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api, { adminAPI } from '../../services/api';
import DescriptionIcon from '@mui/icons-material/Description';
import ContactsIcon from '@mui/icons-material/Contacts';

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
  const [tab, setTab] = useState(0);
  const [suppliers, setSuppliers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [requestDialog, setRequestDialog] = useState(false);
  const [reqForm, setReqForm] = useState({ itemName:'', supplier:'', quantity:'', unit:'', expectedDate:'', quotation:'', message:'' });
  const [supplierDialog, setSupplierDialog] = useState(false);
  const [supplierForm, setSupplierForm] = useState({ name:'', category:'', location:'', phone:'', email:'' });

  useEffect(() => {
    fetchItems();
    adminAPI.getSuppliers().then(setSuppliers);
    adminAPI.getSupplyRequests().then(setRequests);
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

  const handleReqChange = (e) => {
    const { name, value } = e.target;
    setReqForm((prev)=>({ ...prev, [name]: value }));
  };

  const submitSupplyRequest = async () => {
    try {
      const saved = await adminAPI.createSupplyRequest(reqForm);
      setRequests(prev=>[saved, ...prev]);
      setRequestDialog(false);
      setReqForm({ itemName:'', supplier:'', quantity:'', unit:'', expectedDate:'', quotation:'', message:'' });
    } catch (err) {
      console.error(err);
    }
  };

  const updateRequestStatus = async (id, status) => {
    try {
      const updated = await adminAPI.updateSupplyRequestStatus(id,status);
      setRequests(prev=>prev.map(r=>r._id===id?updated:r));
    } catch (err) { console.error(err); }
  };

  const handleSupplierChange=(e)=>{
    const {name,value}=e.target; setSupplierForm({...supplierForm,[name]:value});
  };

  const submitSupplier=async()=>{
    try{
      const saved=await adminAPI.addSupplier(supplierForm);
      setSuppliers(prev=>[...prev,saved]);
      setSupplierDialog(false);
      setSupplierForm({ name:'', category:'', location:'', phone:'', email:'' });
    }catch(err){console.error(err);}
  };

  return (
    <Box>
      <Tabs value={tab} onChange={(_,v)=>setTab(v)} sx={{ mb:3 }}>
        <Tab label="Inventory" />
        <Tab label="Supply Requests" />
        <Tab label="Suppliers" />
      </Tabs>

      {tab===0 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">Inventory Management</Typography>
            <Box>
              <Button variant="outlined" sx={{ mr:2 }} onClick={()=>setTab(1)}>
                Supply Requests
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add New Item
              </Button>
            </Box>
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
      )}

      {tab===1 && (
        <Box>
          <Button variant="contained" sx={{ mb:2 }} startIcon={<AddIcon />} onClick={()=>setRequestDialog(true)}>
            New Supply Request
          </Button>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((r)=>(
                  <TableRow key={r._id}>
                    <TableCell>{r.itemName}</TableCell>
                    <TableCell>{r.supplier?.name}</TableCell>
                    <TableCell>{r.quantity} {r.unit}</TableCell>
                    <TableCell>{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{r.status}</TableCell>
                    <TableCell>
                      {r.status!=='Received' && (
                        <Button size="small" onClick={()=>updateRequestStatus(r._id,'Received')}>Received</Button>
                      )}
                      {r.status!=='Delayed' && (
                        <Button size="small" color="secondary" onClick={()=>updateRequestStatus(r._id,'Delayed')}>Delayed</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {tab===2 && (
        <Box>
          <Button variant="contained" sx={{ mb:2 }} startIcon={<AddIcon />} onClick={()=>setSupplierDialog(true)}>
            Add Supplier
          </Button>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Email</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {suppliers.map(s=>(
                  <TableRow key={s._id}>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.category}</TableCell>
                    <TableCell>{s.location}</TableCell>
                    <TableCell>{s.phone}</TableCell>
                    <TableCell>{s.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Dialog open={requestDialog} onClose={()=>setRequestDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Supply Request</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Item Name" name="itemName" value={reqForm.itemName} onChange={handleReqChange} sx={{ mt:1 }} />
          <TextField select fullWidth label="Supplier" name="supplier" value={reqForm.supplier} onChange={handleReqChange} sx={{ mt:2 }}>
            {suppliers.map(s=>(<MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>))}
          </TextField>
          <Grid container spacing={2} sx={{ mt:1 }}>
            <Grid item xs={6}><TextField fullWidth label="Quantity" name="quantity" type="number" value={reqForm.quantity} onChange={handleReqChange} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Unit" name="unit" value={reqForm.unit} onChange={handleReqChange} /></Grid>
          </Grid>
          <TextField fullWidth type="date" name="expectedDate" label="Expected Date" InputLabelProps={{shrink:true}} value={reqForm.expectedDate} onChange={handleReqChange} sx={{ mt:2 }} />
          <TextField fullWidth label="Quotation" name="quotation" value={reqForm.quotation} onChange={handleReqChange} sx={{ mt:2 }} InputProps={{ startAdornment:<InputAdornment position="start"><DescriptionIcon/></InputAdornment> }} />
          <TextField fullWidth multiline rows={3} label="Message" name="message" value={reqForm.message} onChange={handleReqChange} sx={{ mt:2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setRequestDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitSupplyRequest}>Submit</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={supplierDialog} onClose={()=>setSupplierDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Supplier</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Supplier Name" name="name" value={supplierForm.name} onChange={handleSupplierChange} sx={{ mt:1 }} />
          <TextField fullWidth label="Category" name="category" value={supplierForm.category} onChange={handleSupplierChange} sx={{ mt:2 }} />
          <TextField fullWidth label="Location" name="location" value={supplierForm.location} onChange={handleSupplierChange} sx={{ mt:2 }} />
          <TextField fullWidth label="Phone" name="phone" value={supplierForm.phone} onChange={handleSupplierChange} sx={{ mt:2 }} />
          <TextField fullWidth label="Email" name="email" value={supplierForm.email} onChange={handleSupplierChange} sx={{ mt:2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setSupplierDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitSupplier}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryManagement; 