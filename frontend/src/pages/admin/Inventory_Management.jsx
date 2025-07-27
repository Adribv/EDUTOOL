import React, { useState, useEffect } from 'react';
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
  Chip,
  MenuItem,
  Grid,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Alert,
  AlertTitle,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Sort as SortIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api, { adminAPI } from '../../services/api';
import adminService from '../../services/adminService';
import { toast } from 'react-toastify';
import ViewOnlyWrapper from './ViewOnlyWrapper';
import { useAccessControl, canPerformAction, getAccessTypeDisplay } from './accessControlUtils';

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
  // Access control
  const { accessLevel, isViewOnly, hasEditAccess, hasViewAccess, loading: accessLoading } = useAccessControl('Inventory_Management');
  
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState(0);
  const [suppliers, setSuppliers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [requestDialog, setRequestDialog] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [reqForm, setReqForm] = useState({
    requestRef:'',
    name:'',
    department:'',
    date:new Date().toISOString().split('T')[0],
    items: Array.from({length:20}).map(()=>({ itemCode:'', description:'', specification:'', unit:'', qty:'', remarks:'' })),
    notes:'',
    requesterName:'',
    approvedBy:'',
    approvedDate:'',
    idNo:'',
  });
  const [supplierDialog, setSupplierDialog] = useState(false);
  const [supplierForm, setSupplierForm] = useState({ name:'', category:'', location:'', phone:'', email:'' });

  // Formik setup for inventory items
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
          await api.put(`/inventory/${editingItem._id}`, values);
        } else {
          await api.post('/inventory', values);
        }
        fetchItems();
        handleCloseDialog();
      } catch (error) {
        console.error('Error saving item:', error);
      }
    },
  });

  // If no view access, show access denied
  if (!accessLoading && !hasViewAccess) {
    return (
      <ViewOnlyWrapper
        title="Inventory Management"
        description="Manage school inventory and supplies"
        accessLevel={accessLevel}
        activity="Inventory"
      >
        <Alert severity="error" sx={{ m: 3 }}>
          <AlertTitle>Access Denied</AlertTitle>
          You do not have permission to access Inventory Management. Contact your Vice Principal for access.
        </Alert>
      </ViewOnlyWrapper>
    );
  }

  useEffect(() => {
    fetchItems();
    adminAPI.getSuppliers().then(setSuppliers);
    adminAPI.getSupplyRequests().then(setRequests);
  }, []);

  const fetchItems = async () => {
    try {
      const response = await api.get('/inventory');
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

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
        await api.delete(`/inventory/${id}`);
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

  const handleItemChange = (index, field, value) => {
    const newItems = [...reqForm.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setReqForm({...reqForm, items:newItems});
  };

  const submitSupplyRequest = async () => {
    try {
      const saved = await adminAPI.createSupplyRequest(reqForm);
      setRequests(prev=>[saved, ...prev]);
      setRequestDialog(false);
      setReqForm({
        requestRef:'',
        name:'',
        department:'',
        date:new Date().toISOString().split('T')[0],
        items: Array.from({length:20}).map(()=>({ itemCode:'', description:'', specification:'', unit:'', qty:'', remarks:'' })),
        notes:'',
        requesterName:'',
        approvedBy:'',
        approvedDate:'',
        idNo:'',
      });
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
    <ViewOnlyWrapper
      title="Inventory Management"
      description="Manage school inventory and supplies"
      accessLevel={accessLevel}
      activity="Inventory"
    >
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
                  disabled={!canPerformAction(accessLevel, 'create')}
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
                    {hasEditAccess && <TableCell>Actions</TableCell>}
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
                      {hasEditAccess && (
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(item)}
                            disabled={!canPerformAction(accessLevel, 'update')}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(item._id)}
                            disabled={!canPerformAction(accessLevel, 'delete')}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      )}
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
            {/* Stationery Request Form Generator */}
            <Typography variant="h5" sx={{ mb:2, fontWeight:'bold' }}>Stationery Request Generator</Typography>

            <Box sx={{ border:'1px solid #000', p:2, mb:3 }}>
              {/* Top Header Row */}
              <Grid container>
                <Grid item xs={4} sx={{ border:'1px solid #000', display:'flex', justifyContent:'center', alignItems:'center', height:60 }}>
                  <Typography variant="body2">SCHOOL LOGO</Typography>
                </Grid>
                <Grid item xs={4} sx={{ border:'1px solid #000', height:60 }}></Grid>
                <Grid item xs={4} sx={{ border:'1px solid #000', textAlign:'center', p:1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight:'bold' }}>(SCHOOL NAME)</Typography>
                  <Typography variant="caption">(BRANCH NAME AND ADDRESS)</Typography>
                </Grid>
              </Grid>

              {/* Title */}
              <Box sx={{ border:'1px solid #000', textAlign:'center', p:1 }}>
                <Typography variant="h6" sx={{ fontWeight:'bold' }}>STATIONERY REQUEST FORM</Typography>
              </Box>

              {/* Request Info */}
              <Box sx={{ border:'1px solid #000', p:1 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={3}><TextField label="Request Ref" name="requestRef" value={reqForm.requestRef} onChange={handleReqChange} variant="standard" fullWidth /></Grid>
                  <Grid item xs={4}><TextField label="Name" name="name" value={reqForm.name} onChange={handleReqChange} variant="standard" fullWidth /></Grid>
                  <Grid item xs={3}><TextField label="Dept" name="department" value={reqForm.department} onChange={handleReqChange} variant="standard" fullWidth /></Grid>
                  <Grid item xs={2}><TextField type="date" label="Date" name="date" value={reqForm.date} onChange={handleReqChange} variant="standard" fullWidth InputLabelProps={{ shrink: true }} /></Grid>
                </Grid>
              </Box>

              {/* Items Grid */}
              <Box sx={{ height: 500, width: '100%', border:'1px solid #000', mb:2 }}>
                <DataGrid
                  columns={[
                    { field:'sl', headerName:'Sl. No.', width:80, editable:false },
                    { field:'itemCode', headerName:'Item Code', flex:1, editable:true },
                    { field:'description', headerName:'Item Description', flex:1.5, editable:true },
                    { field:'specification', headerName:'Specification', flex:1, editable:true },
                    { field:'unit', headerName:'Unit', width:80, editable:true },
                    { field:'qty', headerName:'Qty', width:80, editable:true },
                    { field:'remarks', headerName:'Remarks', flex:1, editable:true },
                  ]}
                  rows={reqForm.items.map((r,i)=>({ id:i, sl:i+1, ...r }))}
                  hideFooter
                  onCellEditCommit={(params)=>{
                    const { id, field, value } = params;
                    handleItemChange(id, field, value);
                  }}
                  sx={{ '& .MuiDataGrid-cell, & .MuiDataGrid-columnHeaders': { border:'1px solid #000' } }}
                />
              </Box>

              {/* Notes */}
              <Box sx={{ border:'1px solid #000', p:1, minHeight:60, mb:1 }}>
                <TextField label="NOTES" name="notes" value={reqForm.notes} onChange={handleReqChange} variant="standard" multiline fullWidth rows={2} />
              </Box>

              <Typography variant="caption" display="block" gutterBottom>1. This requisition is used for school staff.</Typography>

              {/* Signature Section */}
              <Grid container sx={{ border:'1px solid #000', mb:2 }}>
                <Grid item xs={4} sx={{ borderRight:'1px solid #000', p:1 }}>
                  <Typography variant="body2">Requester Name:</Typography>
                  <TextField name="requesterName" value={reqForm.requesterName} onChange={handleReqChange} variant="standard" fullWidth />
                  <Typography variant="body2">ID No:</Typography>
                  <TextField name="idNo" value={reqForm.idNo} onChange={handleReqChange} variant="standard" fullWidth />
                </Grid>
                <Grid item xs={4} sx={{ borderRight:'1px solid #000', p:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center' }}>
                  <Typography variant="body2" sx={{ mb:1 }}>Signature</Typography>
                </Grid>
                <Grid item xs={4} sx={{ p:1 }}>
                  <Typography variant="body2">APPROVED BY:</Typography>
                  <TextField name="approvedBy" value={reqForm.approvedBy} onChange={handleReqChange} variant="standard" fullWidth />
                  <Typography variant="body2">DATE</Typography>
                  <TextField type="date" name="approvedDate" value={reqForm.approvedDate} onChange={handleReqChange} variant="standard" fullWidth InputLabelProps={{shrink:true}} />
                </Grid>
              </Grid>

              <Box textAlign="right">
                <Button variant="contained" onClick={submitSupplyRequest}>Save Request</Button>
              </Box>
            </Box>
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

        <Dialog open={requestDialog} onClose={()=>setRequestDialog(false)} fullScreen>
          <DialogTitle sx={{ textAlign:'center', fontWeight:'bold' }}>STATIONERY REQUEST FORM</DialogTitle>
          <DialogContent>
            <Box sx={{ border:'1px solid #000', p:2 }}>
              {/* Top Header Row */}
              <Grid container>
                <Grid item xs={4} sx={{ border:'1px solid #000', display:'flex', justifyContent:'center', alignItems:'center', height:60 }}>
                  <Typography variant="body2">SCHOOL LOGO</Typography>
                </Grid>
                <Grid item xs={4} sx={{ border:'1px solid #000', height:60 }}></Grid>
                <Grid item xs={4} sx={{ border:'1px solid #000', textAlign:'center', p:1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight:'bold' }}>(SCHOOL NAME)</Typography>
                  <Typography variant="caption">(BRANCH NAME AND ADDRESS)</Typography>
                </Grid>
              </Grid>

              {/* Title */}
              <Box sx={{ border:'1px solid #000', textAlign:'center', p:1 }}>
                <Typography variant="h6" sx={{ fontWeight:'bold' }}>STATIONERY REQUEST FORM</Typography>
              </Box>

              {/* Request Info Row */}
              <Box sx={{ border:'1px solid #000', p:1 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={3}><TextField label="Request Ref" name="requestRef" value={reqForm.requestRef} onChange={handleReqChange} variant="standard" fullWidth /></Grid>
                  <Grid item xs={4}><TextField label="Name" name="name" value={reqForm.name} onChange={handleReqChange} variant="standard" fullWidth /></Grid>
                  <Grid item xs={3}><TextField label="Dept" name="department" value={reqForm.department} onChange={handleReqChange} variant="standard" fullWidth /></Grid>
                  <Grid item xs={2}><TextField type="date" label="Date" name="date" value={reqForm.date} onChange={handleReqChange} variant="standard" fullWidth InputLabelProps={{ shrink: true }} /></Grid>
                </Grid>
              </Box>

              {/* Items Table */}
              <Box sx={{ height: 500, width: '100%', border:'1px solid #000', mb:2 }}>
                <DataGrid
                  columns={[
                    { field:'sl', headerName:'Sl. No.', width:80, editable:false },
                    { field:'itemCode', headerName:'Item Code', flex:1, editable:true },
                    { field:'description', headerName:'Item Description', flex:1.5, editable:true },
                    { field:'specification', headerName:'Specification', flex:1, editable:true },
                    { field:'unit', headerName:'Unit', width:80, editable:true },
                    { field:'qty', headerName:'Qty', width:80, editable:true },
                    { field:'remarks', headerName:'Remarks', flex:1, editable:true },
                  ]}
                  rows={reqForm.items.map((r,i)=>({ id:i, sl:i+1, ...r }))}
                  hideFooter
                  onCellEditCommit={(params)=>{
                    const { id, field, value } = params;
                    handleItemChange(id, field, value);
                  }}
                  sx={{
                    '& .MuiDataGrid-cell, & .MuiDataGrid-columnHeaders': { border:'1px solid #000' },
                  }}
                />
              </Box>

              {/* Notes */}
              <Box sx={{ border:'1px solid #000', p:1, minHeight:60, mb:1 }}>
                <TextField label="NOTES" name="notes" value={reqForm.notes} onChange={handleReqChange} variant="standard" multiline fullWidth rows={2} />
              </Box>

              {/* Footnote */}
              <Typography variant="caption" display="block" gutterBottom>1. This requisition is used for school staff.</Typography>

              {/* Signature Row */}
              <Grid container sx={{ border:'1px solid #000' }}>
                <Grid item xs={4} sx={{ borderRight:'1px solid #000', p:1 }}>
                  <Typography variant="body2">Requester Name:</Typography>
                  <TextField name="requesterName" value={reqForm.requesterName} onChange={handleReqChange} variant="standard" fullWidth />
                  <Typography variant="body2">ID No:</Typography>
                  <TextField name="idNo" value={reqForm.idNo} onChange={handleReqChange} variant="standard" fullWidth />
                </Grid>
                <Grid item xs={4} sx={{ borderRight:'1px solid #000', p:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center' }}>
                  <Typography variant="body2" sx={{ mb:1 }}>Signature</Typography>
                </Grid>
                <Grid item xs={4} sx={{ p:1 }}>
                  <Typography variant="body2">APPROVED BY:</Typography>
                  <TextField name="approvedBy" value={reqForm.approvedBy} onChange={handleReqChange} variant="standard" fullWidth />
                  <Typography variant="body2">DATE</Typography>
                  <TextField type="date" name="approvedDate" value={reqForm.approvedDate} onChange={handleReqChange} variant="standard" fullWidth InputLabelProps={{shrink:true}} />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setRequestDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={submitSupplyRequest}>Submit Request</Button>
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
    </ViewOnlyWrapper>
  );
};

export default InventoryManagement; 