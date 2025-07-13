import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Papa from 'papaparse';
import { toast } from 'react-toastify';
import api, { adminAPI } from '../../services/api';

/*
 -----------------------------------------------------------------------------
  UnifiedStationeryRequestPage.jsx
  ---------------------------------------------------------------------------
  ‑ Combines features from:
    • Inventory_Management.jsx  – Stationery Request designer (20-row DataGrid)
    • SupplierRequestManagement.jsx – request list / PDF download helpers
    • A_Inventory.jsx – CSV export / Google-Sheets import for inventory items

  Structure (Tabs):
    0. Stationery Request Form   – exact layout as reference image
    1. Requests List             – filterable list + PDF export per request
    2. Suppliers                 – basic CRUD list (add new)
 -----------------------------------------------------------------------------
*/

const priorities = ['Low', 'Medium', 'High', 'Urgent'];
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

export default function UnifiedStationeryRequestPage() {
  /* --------------------------------------------------------------------- */
  /* Shared state & helpers                                                */
  /* --------------------------------------------------------------------- */
  const [tab, setTab] = useState(0);
  const handleTab = (_, v) => setTab(v);

  /* --------------------------------------------------------------------- */
  /* 0.  ───  Stationery Request Designer  ─────────────────────────────── */
  /* --------------------------------------------------------------------- */
  const freshForm = () => ({
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
    idNo: '',
    approvedBy: '',
    approvedDate: '',
  });

  const [reqForm, setReqForm] = useState(freshForm());
  const handleReqChange = (e) => {
    const { name, value } = e.target;
    setReqForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleItemChange = (index, field, value) => {
    const rows = [...reqForm.items];
    rows[index] = { ...rows[index], [field]: value };
    setReqForm({ ...reqForm, items: rows });
  };

  const submitStationeryRequest = async () => {
    // Strip out empty rows
    const payload = {
      ...reqForm,
      items: reqForm.items.filter((r) => r.description && r.qty),
    };
    if (payload.items.length === 0) {
      toast.error('Add at least one item');
      return;
    }
    try {
      const saved = await adminAPI.createSupplyRequest(payload);
      toast.success('Request saved');
      setRequests((prev) => [saved, ...prev]);
      setReqForm(freshForm());
      setTab(1); // switch to list view automatically
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed');
    }
  };

  /* --------------------------------------------------------------------- */
  /* 1.  ───  Request List Management  ─────────────────────────────────── */
  /* --------------------------------------------------------------------- */
  const [requests, setRequests] = useState([]);
  const [filterText, setFilterText] = useState('');

  const fetchRequests = async () => {
    try {
      const data = await adminAPI.getSupplyRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateRequestStatus = async (id, status) => {
    try {
      const updated = await adminAPI.updateSupplyRequestStatus(id, status);
      setRequests((prev) => prev.map((r) => (r._id === id ? updated : r)));
    } catch (err) {
      toast.error('Status update failed');
    }
  };

  /* PDF EXPORT (single request) */
  const generatePdf = async (request) => {
    if (!request) return;
    const hidden = document.createElement('div');
    hidden.style.position = 'fixed';
    hidden.style.left = '-10000px';
    hidden.style.top = '-10000px';
    hidden.style.width = '800px';
    hidden.style.padding = '20px';
    hidden.style.background = '#fff';
    hidden.innerHTML = `<h2 style="text-align:center;margin-bottom:16px;">Stationery Request</h2>
      <p><strong>Name:</strong> ${request.name}</p>
      <p><strong>Department:</strong> ${request.department}</p>
      <p><strong>Date:</strong> ${new Date(request.date).toLocaleDateString()}</p>
      <table style="width:100%;border-collapse:collapse;margin-top:12px;" border="1">
        <thead><tr><th>Sl</th><th>Item</th><th>Spec</th><th>Unit</th><th>Qty</th><th>Remarks</th></tr></thead>
        <tbody>
          ${request.items
            .map(
              (i, idx) =>
                `<tr><td>${idx + 1}</td><td>${i.description}</td><td>${
                  i.specification || ''
                }</td><td>${i.unit}</td><td>${i.qty}</td><td>${
                  i.remarks || ''
                }</td></tr>`
            )
            .join('')}
        </tbody>
      </table>`;
    document.body.appendChild(hidden);

    const canvas = await html2canvas(hidden, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = (canvas.height * pdfW) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
    pdf.save(`${request.requestRef || 'request'}.pdf`);
    document.body.removeChild(hidden);
  };

  /* --------------------------------------------------------------------- */
  /* 2.  ───  Suppliers  ───────────────────────────────────────────────── */
  /* --------------------------------------------------------------------- */
  const [suppliers, setSuppliers] = useState([]);
  const [supplierDialog, setSupplierDialog] = useState(false);
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    category: '',
    location: '',
    phone: '',
    email: '',
  });
  const handleSupplierChange = (e) => {
    const { name, value } = e.target;
    setSupplierForm((prev) => ({ ...prev, [name]: value }));
  };
  const submitSupplier = async () => {
    try {
      const saved = await adminAPI.addSupplier(supplierForm);
      setSuppliers((prev) => [...prev, saved]);
      setSupplierDialog(false);
      setSupplierForm({ name: '', category: '', location: '', phone: '', email: '' });
    } catch (err) {
      toast.error('Failed to add supplier');
    }
  };
  const fetchSuppliers = async () => {
    try {
      const data = await adminAPI.getSuppliers();
      setSuppliers(data);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetchSuppliers();
  }, []);

  /* --------------------------------------------------------------------- */
  return (
    <Box>
      <Tabs value={tab} onChange={handleTab} sx={{ mb: 3 }}>
        <Tab label="Stationery Request" />
        <Tab label="Requests" />
        <Tab label="Suppliers" />
      </Tabs>

      {/* ─────────────────────────────────── 0. Stationery Form ─────── */}
      {tab === 0 && (
        <Box sx={{ border: '1px solid #000', p: 2 }}>
          {/* Header Row */}
          <Grid container>
            <Grid item xs={4} sx={{ border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', height: 60 }}>
              <Typography variant="body2">SCHOOL LOGO</Typography>
            </Grid>
            <Grid item xs={4} sx={{ border: '1px solid #000', height: 60 }}></Grid>
            <Grid item xs={4} sx={{ border: '1px solid #000', textAlign: 'center', p: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>(SCHOOL NAME)</Typography>
              <Typography variant="caption">(BRANCH NAME AND ADDRESS)</Typography>
            </Grid>
          </Grid>

          {/* Title */}
          <Box sx={{ border: '1px solid #000', textAlign: 'center', p: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>STATIONERY REQUEST FORM</Typography>
          </Box>

          {/* Request Info */}
          <Box sx={{ border: '1px solid #000', p: 1 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={3}><TextField variant="standard" label="Request Ref" name="requestRef" fullWidth value={reqForm.requestRef} onChange={handleReqChange} /></Grid>
              <Grid item xs={4}><TextField variant="standard" label="Name" name="name" fullWidth value={reqForm.name} onChange={handleReqChange} /></Grid>
              <Grid item xs={3}><TextField variant="standard" label="Dept" name="department" fullWidth value={reqForm.department} onChange={handleReqChange} /></Grid>
              <Grid item xs={2}><TextField variant="standard" type="date" label="Date" name="date" fullWidth value={reqForm.date} onChange={handleReqChange} InputLabelProps={{ shrink: true }} /></Grid>
            </Grid>
          </Box>

          {/* Items DataGrid */}
          <Box sx={{ height: 500, width: '100%', border: '1px solid #000', mb: 2 }}>
            <DataGrid
              hideFooter
              columns={[
                { field: 'sl', headerName: 'Sl. No.', width: 80 },
                { field: 'itemCode', headerName: 'ITEM CODE', flex: 1, editable: true },
                { field: 'description', headerName: 'ITEM DESCRIPTION', flex: 1.5, editable: true },
                { field: 'specification', headerName: 'SPECIFICATION', flex: 1, editable: true },
                { field: 'unit', headerName: 'UNIT', width: 80, editable: true },
                { field: 'qty', headerName: 'QTY', width: 80, editable: true },
                { field: 'remarks', headerName: 'REMARKS', flex: 1, editable: true },
              ]}
              rows={reqForm.items.map((r, i) => ({ id: i, sl: i + 1, ...r }))}
              onCellEditCommit={({ id, field, value }) => handleItemChange(id, field, value)}
              sx={{ '& .MuiDataGrid-cell, & .MuiDataGrid-columnHeaders': { border: '1px solid #000' } }}
            />
          </Box>

          {/* Notes */}
          <Box sx={{ border: '1px solid #000', p: 1, minHeight: 60, mb: 1 }}>
            <TextField variant="standard" label="NOTES" name="notes" fullWidth multiline rows={2} value={reqForm.notes} onChange={handleReqChange} />
          </Box>
          <Typography variant="caption" display="block" gutterBottom>
            1. This requisition is used for school staff.
          </Typography>

          {/* Signature Section */}
          <Grid container sx={{ border: '1px solid #000', mb: 2 }}>
            <Grid item xs={4} sx={{ borderRight: '1px solid #000', p: 1 }}>
              <Typography variant="body2">Requester Name:</Typography>
              <TextField variant="standard" name="requesterName" fullWidth value={reqForm.requesterName} onChange={handleReqChange} />
              <Typography variant="body2">ID No:</Typography>
              <TextField variant="standard" name="idNo" fullWidth value={reqForm.idNo} onChange={handleReqChange} />
            </Grid>
            <Grid item xs={4} sx={{ borderRight: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Typography variant="body2">Signature</Typography>
            </Grid>
            <Grid item xs={4} sx={{ p: 1 }}>
              <Typography variant="body2">APPROVED BY:</Typography>
              <TextField variant="standard" name="approvedBy" fullWidth value={reqForm.approvedBy} onChange={handleReqChange} />
              <Typography variant="body2">DATE</Typography>
              <TextField variant="standard" type="date" name="approvedDate" fullWidth value={reqForm.approvedDate} onChange={handleReqChange} InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>

          <Box textAlign="right">
            <Button variant="contained" onClick={submitStationeryRequest}>Save Request</Button>
          </Box>
        </Box>
      )}

      {/* ─────────────────────────────────── 1. Requests List ─────────── */}
      {tab === 1 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <TextField placeholder="Search..." value={filterText} onChange={(e) => setFilterText(e.target.value)} size="small" />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setTab(0)}>
              New Request
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Ref</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Dept</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests
                  .filter((r) =>
                    [r.requestRef, r.name, r.department]
                      .join(' ')
                      .toLowerCase()
                      .includes(filterText.toLowerCase())
                  )
                  .map((r) => (
                    <TableRow key={r._id}>
                      <TableCell>{r.requestRef}</TableCell>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.department}</TableCell>
                      <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip label={r.status} size="small" />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary" onClick={() => generatePdf(r)}>
                          <PdfIcon fontSize="inherit" />
                        </IconButton>
                        {r.status !== 'Received' && (
                          <Button size="small" onClick={() => updateRequestStatus(r._id, 'Received')}>Received</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* ─────────────────────────────────── 2. Suppliers ─────────────── */}
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

      {/* ───────────────────────────── Supplier Dialog ─────────────── */}
      <Dialog open={supplierDialog} onClose={() => setSupplierDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Supplier</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField name="name" label="Name" value={supplierForm.name} onChange={handleSupplierChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="category" label="Category" value={supplierForm.category} onChange={handleSupplierChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="location" label="Location" value={supplierForm.location} onChange={handleSupplierChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="phone" label="Phone" value={supplierForm.phone} onChange={handleSupplierChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="email" label="Email" value={supplierForm.email} onChange={handleSupplierChange} fullWidth required />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSupplierDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitSupplier}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 