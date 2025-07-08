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
  Tabs,
  Tab,
  InputAdornment,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Inventory as InventoryIcon,
  School as SchoolIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Description as DescriptionIcon,
  Contacts as ContactsIcon,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import Papa from 'papaparse';

const A_Inventory = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [importDialog, setImportDialog] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetData, setSheetData] = useState([]);
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
  const [tab, setTab] = useState(0);
  const [suppliers, setSuppliers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [requestDialog, setRequestDialog] = useState(false);
  const [reqForm, setReqForm] = useState({ itemName:'', supplier:'', quantity:'', unit:'', expectedDate:'', quotation:'', message:'' });
  const [supplierDialog, setSupplierDialog] = useState(false);
  const [supplierForm, setSupplierForm] = useState({ name:'', category:'', location:'', phone:'', email:'' });

  useEffect(() => {
    fetchInventory();
    adminAPI.getSuppliers().then(setSuppliers);
    adminAPI.getSupplyRequests().then(setRequests);
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

  const handleExport = async () => {
    try {
      toast.info('Exporting inventory...');
      
      const response = await adminAPI.exportInventory();
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inventory_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export inventory');
    }
  };

  const handleImportSheet = async () => {
    try {
      // Convert Google Sheet link to CSV export link
      const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!match) {
        toast.error('Invalid Google Sheet link');
        return;
      }
      const sheetId = match[1];
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      const response = await fetch(csvUrl);
      const csv = await response.text();
      const parsed = Papa.parse(csv, { header: true });
      setSheetData(parsed.data);
      setPreviewOpen(true);
    } catch {
      toast.error('Failed to fetch or parse sheet');
    }
  };

  const bulkImportMutation = {
    mutate: async (items) => {
      try {
        const response = await adminAPI.bulkImportInventory(items);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    isLoading: false
  };

  const handleBulkImport = async () => {
    try {
      const response = await bulkImportMutation.mutate(sheetData);
      setPreviewOpen(false);
      setImportDialog(false);
      fetchInventory();
      
      // Show detailed results
      if (response.results) {
        const { successful, failed } = response.results;
        toast.success(`Import completed! ${successful.length} successful, ${failed.length} failed`);
        
        // Show errors for failed imports
        if (failed.length > 0) {
          const errorInfo = failed.map(f => `${f.name}: ${f.error}`).join('\n');
          alert(`Failed imports:\n${errorInfo}`);
        }
      } else {
        toast.success('Inventory imported successfully');
      }
    } catch (error) {
      console.error('Bulk import error:', error);
      toast.error(error.response?.data?.message || 'Bulk import failed');
    }
  };

  const handleReqChange=(e)=>{const {name,value}=e.target; setReqForm(prev=>({...prev,[name]:value}));};
  const submitSupplyRequest = async () => {
    if (!reqForm.itemName || !reqForm.quantity) {
      toast.error('Item name and quantity are required');
      return;
    }
    const payload = {
      ...reqForm,
      quantity: Number(reqForm.quantity),   // convert to number
    };
    try {
      const saved = await adminAPI.createSupplyRequest(payload);
      setRequests(prev => [saved, ...prev]);
      setRequestDialog(false);
      setReqForm({ itemName:'', supplier:'', quantity:'', unit:'', expectedDate:'', quotation:'', message:'' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Request failed');
    }
  };
  const updateRequestStatus=async(id,status)=>{try{const updated=await adminAPI.updateSupplyRequestStatus(id,status); setRequests(prev=>prev.map(r=>r._id===id?updated:r));}catch(err){console.error(err);}}
  const handleSupplierChange=e=>{const {name,value}=e.target; setSupplierForm(prev=>({...prev,[name]:value}));};
  const submitSupplier=async()=>{try{const saved=await adminAPI.addSupplier(supplierForm); setSuppliers(prev=>[...prev,saved]); setSupplierDialog(false); setSupplierForm({ name:'', category:'', location:'', phone:'', email:'' });}catch(err){console.error(err);}}

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
        <Box>
          <Button variant="outlined" sx={{ mr:2 }} onClick={()=>{setTab(1);}}>
            Supply Requests
          </Button>
          <Button variant="outlined" sx={{ mr:2 }} onClick={()=>{setTab(2);}}>
            Suppliers
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            sx={{ mr: 2 }}
          >
            Export Records
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<UploadIcon />}
            onClick={() => setImportDialog(true)}
            sx={{ mr: 2 }}
          >
            Import
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={()=>handleOpenDialog()}>
            Add Item
          </Button>
        </Box>
      </Box>

      <Tabs value={tab} onChange={(_,v)=>setTab(v)} sx={{ mb:3 }}>
        <Tab label="Inventory" />
        <Tab label="Supply Requests" />
        <Tab label="Suppliers" />
      </Tabs>

      {tab===0 && (
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
                  <TableCell>Item</TableCell><TableCell>Supplier</TableCell><TableCell>Qty</TableCell><TableCell>Date</TableCell><TableCell>Status</TableCell><TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
              {requests.map(r=>(
               <TableRow key={r._id}><TableCell>{r.itemName}</TableCell><TableCell>{r.supplier?.name}</TableCell><TableCell>{r.quantity} {r.unit}</TableCell><TableCell>{new Date(r.createdAt).toLocaleDateString()}</TableCell><TableCell>{r.status}</TableCell><TableCell>{r.status!=='Received'&&<Button size="small" onClick={()=>updateRequestStatus(r._id,'Received')}>Received</Button>} {r.status!=='Delayed'&&<Button size="small" color="secondary" onClick={()=>updateRequestStatus(r._id,'Delayed')}>Delayed</Button>}</TableCell></TableRow>
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
            <Table size="small"><TableHead><TableRow><TableCell>Name</TableCell><TableCell>Category</TableCell><TableCell>Location</TableCell><TableCell>Phone</TableCell><TableCell>Email</TableCell></TableRow></TableHead><TableBody>{suppliers.map(s=>(<TableRow key={s._id}><TableCell>{s.name}</TableCell><TableCell>{s.category}</TableCell><TableCell>{s.location}</TableCell><TableCell>{s.phone}</TableCell><TableCell>{s.email}</TableCell></TableRow>))}</TableBody></Table></TableContainer>
        </Box>
      )}

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

      {/* Import Dialog */}
      <Dialog open={importDialog} onClose={() => setImportDialog(false)}>
        <DialogTitle>Import Inventory from Google Sheet</DialogTitle>
        <DialogContent>
          <TextField
            label="Google Sheet Link"
            fullWidth
            margin="normal"
            value={sheetUrl}
            onChange={e => setSheetUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/..."
          />
          <Button variant="contained" onClick={handleImportSheet} sx={{ mt: 2 }}>
            Fetch & Preview
          </Button>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Preview Imported Inventory ({sheetData?.length || 0} items)</DialogTitle>
        <DialogContent>
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {sheetData && sheetData.length > 0 ? (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Unit</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Unit Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sheetData.slice(0, 10).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name || 'N/A'}</TableCell>
                        <TableCell>{item.category || 'N/A'}</TableCell>
                        <TableCell>{item.quantity || 'N/A'}</TableCell>
                        <TableCell>{item.unit || 'N/A'}</TableCell>
                        <TableCell>{item.location || 'N/A'}</TableCell>
                        <TableCell>{item.unitPrice || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="error">No data to preview</Typography>
            )}
            {sheetData && sheetData.length > 10 && (
              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                Showing first 10 of {sheetData.length} items
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleBulkImport}
            disabled={bulkImportMutation.isLoading}
          >
            {bulkImportMutation.isLoading ? <CircularProgress size={24} /> : `Import All (${sheetData?.length || 0})`}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={requestDialog} onClose={() => setRequestDialog(false)}>
        <DialogTitle>New Supply Request</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="itemName"
                label="Item Name"
                value={reqForm.itemName}
                onChange={handleReqChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="supplier"
                label="Supplier"
                value={reqForm.supplier}
                onChange={handleReqChange}
                fullWidth
                required
              >
                {suppliers.map((s)=>(<MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="quantity"
                label="Quantity"
                type="number"
                value={reqForm.quantity}
                onChange={handleReqChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="unit"
                label="Unit"
                value={reqForm.unit}
                onChange={handleReqChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="expectedDate"
                label="Expected Date"
                type="date"
                value={reqForm.expectedDate}
                onChange={handleReqChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="quotation"
                label="Quotation"
                value={reqForm.quotation}
                onChange={handleReqChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="message"
                label="Message"
                value={reqForm.message}
                onChange={handleReqChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDialog(false)}>Cancel</Button>
          <Button onClick={submitSupplyRequest} variant="contained" color="primary">
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={supplierDialog} onClose={() => setSupplierDialog(false)}>
        <DialogTitle>Add Supplier</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Name"
                value={supplierForm.name}
                onChange={handleSupplierChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="category"
                label="Category"
                value={supplierForm.category}
                onChange={handleSupplierChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="location"
                label="Location"
                value={supplierForm.location}
                onChange={handleSupplierChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Phone"
                value={supplierForm.phone}
                onChange={handleSupplierChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                value={supplierForm.email}
                onChange={handleSupplierChange}
                fullWidth
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSupplierDialog(false)}>Cancel</Button>
          <Button onClick={submitSupplier} variant="contained" color="primary">
            Add Supplier
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default A_Inventory; 