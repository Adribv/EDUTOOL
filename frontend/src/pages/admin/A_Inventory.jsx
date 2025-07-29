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
  Divider,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Category list used in item form
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

// Validation schema for MUI / Formik inventory form
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

const A_Inventory = () => {
  /* -------------------------------------------------------------- */
  /* Core state                                                     */
  /* -------------------------------------------------------------- */
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState(0);
  const [suppliers, setSuppliers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [openDialog, setOpenDialog] = useState(false); // item add / edit dialog
  const [editingItem, setEditingItem] = useState(null);
  const [requestDialog, setRequestDialog] = useState(false);
  const [reqForm, setReqForm] = useState({
    requestRef: '',
    name: '',
    department: '',
    date: new Date().toISOString().split('T')[0],
    items: Array.from({ length: 20 }).map(() => ({
      itemCode: '',
      description: '',
      specification: '',
      unit: '',
      qty: '',
      remarks: '',
    })),
    notes: '',
    requesterName: '',
    approvedBy: '',
    approvedDate: '',
    idNo: '',
  });
  const [supplierDialog, setSupplierDialog] = useState(false);
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    category: '',
    location: '',
    phone: '',
    email: '',
  });

  /* -------------------------------------------------------------- */
  /* Initial data fetch                                             */
  /* -------------------------------------------------------------- */
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

  /* -------------------------------------------------------------- */
  /* Inventory CRUD (Formik)                                        */
  /* -------------------------------------------------------------- */
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

  /* -------------------------------------------------------------- */
  /* Stationery Request helpers                                     */
  /* -------------------------------------------------------------- */
  const handleReqChange = (e) => {
    const { name, value } = e.target;
    setReqForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...reqForm.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setReqForm({ ...reqForm, items: newItems });
  };

  const submitSupplyRequest = async () => {
    try {
      const saved = await adminAPI.createSupplyRequest(reqForm);
      setRequests((prev) => [saved, ...prev]);
      setRequestDialog(false);

      // Prompt download
      const proceed = window.confirm('Request saved successfully. Would you like to download the PDF?');
      if (proceed) {
        await generatePdf(saved);
      }

      // reset form
      setReqForm({
        requestRef: '',
        name: '',
        department: '',
        date: new Date().toISOString().split('T')[0],
        items: Array.from({ length: 20 }).map(() => ({
          itemCode: '',
          description: '',
          specification: '',
          unit: '',
          qty: '',
          remarks: '',
        })),
        notes: '',
        requesterName: '',
        approvedBy: '',
        approvedDate: '',
        idNo: '',
      });
    } catch (err) {
      console.error(err);
      alert('Failed to save request');
    }
  };

  // Generate PDF similar to reference image using off-screen render
  const generatePdf = async (request) => {
    if (!request) return;
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-10000px';
    container.style.top = '-10000px';
    container.style.width = '800px';
    container.style.padding = '20px';
    container.style.background = '#fff';

    container.innerHTML = `
      <h2 style="text-align:center;margin-bottom:16px;">STATIONERY REQUEST FORM</h2>
      <p><strong>Request Ref:</strong> ${request.requestRef || ''}</p>
      <p><strong>Name:</strong> ${request.name || ''}</p>
      <p><strong>Dept:</strong> ${request.department || ''}</p>
      <p><strong>Date:</strong> ${request.date ? new Date(request.date).toLocaleDateString() : ''}</p>
      <table style="width:100%;border-collapse:collapse;margin-top:12px;" border="1" cellspacing="0" cellpadding="4">
        <thead><tr><th>Sl</th><th>Description</th><th>Spec</th><th>Unit</th><th>Qty</th><th>Remarks</th></tr></thead>
        <tbody>
          ${request.items
            .map(
              (i, idx) =>
                `<tr><td>${idx + 1}</td><td>${i.description || ''}</td><td>${i.specification || ''}</td><td>${i.unit || ''}</td><td>${i.qty || ''}</td><td>${i.remarks || ''}</td></tr>`
            )
            .join('')}
        </tbody>
      </table>
      <p style="margin-top:12px;"><strong>Notes:</strong> ${request.notes || ''}</p>
    `;

    document.body.appendChild(container);
    const canvas = await html2canvas(container, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${request.requestRef || 'stationery_request'}.pdf`);
    document.body.removeChild(container);
  };

  const updateRequestStatus = async (id, status) => {
    try {
      const updated = await adminAPI.updateSupplyRequestStatus(id, status);
      setRequests((prev) => prev.map((r) => (r._id === id ? updated : r)));
    } catch (err) {
      console.error(err);
    }
  };

  /* -------------------------------------------------------------- */
  /* Supplier helpers                                               */
  /* -------------------------------------------------------------- */
  const handleSupplierChange = (e) => {
    const { name, value } = e.target;
    setSupplierForm({ ...supplierForm, [name]: value });
  };

  const submitSupplier = async () => {
    try {
      const saved = await adminAPI.addSupplier(supplierForm);
      setSuppliers((prev) => [...prev, saved]);
      setSupplierDialog(false);
      setSupplierForm({ name: '', category: '', location: '', phone: '', email: '' });
    } catch (err) {
      console.error(err);
    }
  };

  /* -------------------------------------------------------------- */
  /* Render                                                          */
  /* -------------------------------------------------------------- */
  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Inventory" />
        <Tab label="Supply Requests" />
        <Tab label="Suppliers" />
      </Tabs>

      {/* ------------------------- Tab 0: Inventory ----------------- */}
      {tab === 0 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">Inventory Management</Typography>
            <Box>
              <Button variant="outlined" sx={{ mr: 2 }} onClick={() => setTab(1)}>
                Supply Requests
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
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
                      <Typography color={item.quantity <= item.minimumStock ? 'error' : 'success'}>
                        {item.quantity <= item.minimumStock ? 'Low Stock' : 'In Stock'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleOpenDialog(item)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(item._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Item dialog */}
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
            <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
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
                      error={formik.touched.minimumStock && Boolean(formik.errors.minimumStock)}
                      helperText={formik.touched.minimumStock && formik.errors.minimumStock}
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

      {/* ------------------- Tab 1: Stationery Requests -------------- */}
      {tab === 1 && (
        <Box>
          {/* Stationery Request Form Generator (image-based layout) */}
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
            Stationery Request Generator
          </Typography>

          {/* ---- The request form replicating reference image ---- */}
          <Box sx={{ border: '1px solid #000', p: 2, mb: 3 }}>
            {/* Top Header Row */}
            <Grid container>
              <Grid
                item
                xs={4}
                sx={{ border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', height: 60 }}
              >
                <Typography variant="body2">SCHOOL LOGO</Typography>
              </Grid>
              <Grid item xs={4} sx={{ border: '1px solid #000', height: 60 }}></Grid>
              <Grid item xs={4} sx={{ border: '1px solid #000', textAlign: 'center', p: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  (SCHOOL NAME)
                </Typography>
                <Typography variant="caption">(BRANCH NAME AND ADDRESS)</Typography>
              </Grid>
            </Grid>

            {/* Title */}
            <Box sx={{ border: '1px solid #000', textAlign: 'center', p: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                STATIONERY REQUEST FORM
              </Typography>
            </Box>

            {/* Request Info Row */}
            <Box sx={{ border: '1px solid #000', p: 1 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={3}>
                  <TextField label="Request Ref" name="requestRef" value={reqForm.requestRef} onChange={handleReqChange} variant="standard" fullWidth />
                </Grid>
                <Grid item xs={4}>
                  <TextField label="Name" name="name" value={reqForm.name} onChange={handleReqChange} variant="standard" fullWidth />
                </Grid>
                <Grid item xs={3}>
                  <TextField label="Dept" name="department" value={reqForm.department} onChange={handleReqChange} variant="standard" fullWidth />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    type="date"
                    label="Date"
                    name="date"
                    value={reqForm.date}
                    onChange={handleReqChange}
                    variant="standard"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Items Grid */}
            <Box sx={{ height: 500, width: '100%', border: '1px solid #000', mb: 2 }}>
              <DataGrid
                columns={[
                  { field: 'sl', headerName: 'Sl. No.', width: 80, editable: false },
                  { field: 'itemCode', headerName: 'Item Code', flex: 1, editable: true },
                  { field: 'description', headerName: 'Item Description', flex: 1.5, editable: true },
                  { field: 'specification', headerName: 'Specification', flex: 1, editable: true },
                  { field: 'unit', headerName: 'Unit', width: 80, editable: true },
                  { field: 'qty', headerName: 'Qty', width: 80, editable: true },
                  { field: 'remarks', headerName: 'Remarks', flex: 1, editable: true },
                ]}
                rows={reqForm.items.map((r, i) => ({ id: i, sl: i + 1, ...r }))}
                hideFooter
                onCellEditCommit={(params) => {
                  const { id, field, value } = params;
                  handleItemChange(id, field, value);
                }}
                sx={{ '& .MuiDataGrid-cell, & .MuiDataGrid-columnHeaders': { border: '1px solid #000' } }}
              />
            </Box>

            {/* Notes */}
            <Box sx={{ border: '1px solid #000', p: 1, minHeight: 60, mb: 1 }}>
              <TextField label="NOTES" name="notes" value={reqForm.notes} onChange={handleReqChange} variant="standard" multiline fullWidth rows={2} />
            </Box>

            <Typography variant="caption" display="block" gutterBottom>
              1. This requisition is used for school staff.
            </Typography>

            {/* Signature Section */}
            <Grid container sx={{ border: '1px solid #000', mb: 2 }}>
              <Grid item xs={4} sx={{ borderRight: '1px solid #000', p: 1 }}>
                <Typography variant="body2">Requester Name:</Typography>
                <TextField name="requesterName" value={reqForm.requesterName} onChange={handleReqChange} variant="standard" fullWidth />
                <Typography variant="body2">ID No:</Typography>
                <TextField name="idNo" value={reqForm.idNo} onChange={handleReqChange} variant="standard" fullWidth />
              </Grid>
              <Grid
                item
                xs={4}
                sx={{ borderRight: '1px solid #000', p: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
              >
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Signature
                </Typography>
              </Grid>
              <Grid item xs={4} sx={{ p: 1 }}>
                <Typography variant="body2">APPROVED BY:</Typography>
                <TextField name="approvedBy" value={reqForm.approvedBy} onChange={handleReqChange} variant="standard" fullWidth />
                <Typography variant="body2">DATE</Typography>
                <TextField
                  type="date"
                  name="approvedDate"
                  value={reqForm.approvedDate}
                  onChange={handleReqChange}
                  variant="standard"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Box textAlign="right">
              <Button variant="contained" onClick={submitSupplyRequest}>
                Save Request
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* ------------------------- Tab 2: Suppliers ------------------ */}
      {tab === 2 && (
        <Box>
          <Button variant="contained" sx={{ mb: 2 }} startIcon={<AddIcon />} onClick={() => setSupplierDialog(true)}>
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
                {suppliers.map((s) => (
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

      {/* Supplier dialog */}
      <Dialog open={supplierDialog} onClose={() => setSupplierDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Supplier</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Supplier Name" name="name" value={supplierForm.name} onChange={handleSupplierChange} sx={{ mt: 1 }} />
          <TextField fullWidth label="Category" name="category" value={supplierForm.category} onChange={handleSupplierChange} sx={{ mt: 2 }} />
          <TextField fullWidth label="Location" name="location" value={supplierForm.location} onChange={handleSupplierChange} sx={{ mt: 2 }} />
          <TextField fullWidth label="Phone" name="phone" value={supplierForm.phone} onChange={handleSupplierChange} sx={{ mt: 2 }} />
          <TextField fullWidth label="Email" name="email" value={supplierForm.email} onChange={handleSupplierChange} sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSupplierDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitSupplier}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default A_Inventory; 