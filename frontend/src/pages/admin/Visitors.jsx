import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import Papa from 'papaparse';
import { Upload as UploadIcon, Google as GoogleIcon } from '@mui/icons-material';

// Sample visitor object shape for reference
// {
//   wardId: 'studentObjectId',
//   parentId: 'parentObjectId',
//   visitorName: 'John Doe',
//   visitorIntime: new Date().toISOString(),
//   visitorOuttime: null,
//   reason: 'Meeting',
//   wardPickup: false,
// }

const sampleVisitors = [
  {
    _id: '1',
    wardId: '64f7bd71236b7a6a9b36f001',
    parentName: 'Mr. Johnson',
    contactNumber: '9876543210',
    visitorName: 'Alice Johnson',
    visitorIntime: new Date().toISOString(),
    visitorOuttime: null,
    reason: 'Pay fees',
    wardPickup: false,
  },
  {
    _id: '2',
    wardId: '64f7bd71236b7a6a9b36f002',
    parentName: 'Mrs. Smith',
    contactNumber: '9123456780',
    visitorName: 'Bob Smith',
    visitorIntime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    visitorOuttime: new Date().toISOString(),
    reason: 'Collect report card',
    wardPickup: true,
  },
];

function Visitors() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [importDialog, setImportDialog] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetData, setSheetData] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [form, setForm] = useState({
    wardId: '',
    parentName: '',
    contactNumber: '',
    visitorName: '',
    reason: '',
    wardPickup: false,
    idCardNo: '',
    meetingWith: '',
    totalPerson: 1,
    date: '',
    purpose: '',
    inTime: '',
    outTime: '',
    attachDocument: null,
  });

  const { data: visitors = sampleVisitors, isLoading } = useQuery({
    queryKey: ['visitors'],
    queryFn: () => adminAPI.getVisitors ? adminAPI.getVisitors() : Promise.resolve(sampleVisitors),
    // Fallback to sample if API undefined
    staleTime: 5 * 60 * 1000,
    retry: 0,
  });

  // console.log(visitors);

  const addVisitorMutation = useMutation({
    mutationFn: (payload) => adminAPI.addVisitor ? adminAPI.addVisitor(payload) : Promise.resolve({ data: payload }),
    onSuccess: () => {
      toast.success('Visitor added');
      queryClient.invalidateQueries(['visitors']);
      setOpen(false);
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || 'Failed to add visitor';
      toast.error(msg);
    },
  });

  const exitMutation = useMutation({
    mutationFn: (id) => adminAPI.updateVisitorExit ? adminAPI.updateVisitorExit(id) : Promise.resolve(),
    onSuccess: () => {
      toast.success('Visitor marked as exited');
      queryClient.invalidateQueries(['visitors']);
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || 'Failed to mark exit';
      toast.error(msg);
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleSubmit = () => {
    const payload = {
      name: form.visitorName || form.parentName || 'Visitor',
      contactNumber: form.contactNumber,
      purpose: form.purpose || form.reason || 'Visit',
      whomToMeet: form.meetingWith || form.wardId,
      idProofType: 'Other',
      idProofNumber: form.idCardNo || 'N/A',
      parentName: form.parentName,
      wardId: form.wardId,
      wardPickup: form.wardPickup,
      totalPerson: form.totalPerson,
      date: form.date,
      inTime: form.inTime,
      outTime: form.outTime,
      attachDocument: form.attachDocument,
    };
    addVisitorMutation.mutate(payload);
  };

  // Google Sheets Import Logic
  const handleImportSheet = async () => {
    try {
      if (!sheetUrl) {
        toast.error('Please enter a Google Sheet URL');
        return;
      }
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
      setPreviewDialog(true);
    } catch {
      toast.error('Failed to fetch or parse sheet');
    }
  };

  const handleBulkImport = async () => {
    try {
      setProcessing(true);
      // You may need to adjust the endpoint to match your backend
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      // Map sheetData to expected visitor fields
      const visitors = sheetData.map(row => ({
        name: row['Visitors Name'] || row['Visitor Name'] || row['Name'] || '',
        idProofNumber: row['ID Card No.'] || row['ID Card No'] || '',
        contactNumber: row['Phone'] || row['Contact Number'] || '',
        whomToMeet: row['Meeting With'] || row['Whom To Meet'] || '',
        totalPerson: row['Total Person'] || row['TOTAL PERSON'] || 1,
        date: row['Date'] || '',
        purpose: row['Purpose'] || row['Reason'] || '',
        inTime: row['In Time'] || '',
        outTime: row['Out Time'] || '',
        parentName: row['Parent Name'] || '',
        wardPickup: row['Ward Pickup'] === 'Yes' || row['Ward Pickup'] === 'yes' || false,
        // Attach document upload is not supported in bulk import for now
      }));
      await adminAPI.bulkImportVisitors(visitors, config); // Implement this API in your backend if not present
      toast.success('Bulk import completed!');
      setPreviewDialog(false);
      setImportDialog(false);
      setSheetData([]);
      setSheetUrl('');
      queryClient.invalidateQueries(['visitors']);
    } catch {
      toast.error('Failed to import records');
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkExit = (id) => {
    if (window.confirm('Mark this visitor as exited?')) {
      exitMutation.mutate(id);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Visitor Management</Typography>
        <Box>
          <Button variant="outlined" startIcon={<UploadIcon />} onClick={() => setImportDialog(true)} sx={{ mr: 2 }}>
            Import from Google Sheets
          </Button>
          <Button variant="contained" onClick={() => setOpen(true)}>
            Add Visitor
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Visitor Name</TableCell>
              <TableCell>Ward ID</TableCell>
              <TableCell>Parent Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>In Time</TableCell>
              <TableCell>Out Time</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Ward Pickup</TableCell>
              {Array.isArray(visitors) && visitors.some(v => v.attachDocument) && (
                <TableCell>Document</TableCell>
              )}
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (
              (visitors || []).map((v) => (
                <TableRow key={v._id} hover>
                  <TableCell>{v.visitorName || v.name}</TableCell>
                  <TableCell>{v.whomToMeet || 'N/A'}</TableCell>
                  <TableCell>{v.parentName}</TableCell>
                  <TableCell>{v.contactNumber}</TableCell>
                  <TableCell>{new Date(v.visitorIntime || v.entryTime).toLocaleString()}</TableCell>
                  <TableCell>{v.exitTime ? new Date(v.exitTime).toLocaleString() : '-'}</TableCell>
                  <TableCell>{v.reason || v.purpose}</TableCell>
                  <TableCell>{v.wardPickup ? 'Yes' : 'No'}</TableCell>
                  {Array.isArray(visitors) && visitors.some(x => x.attachDocument) && (
                    <TableCell>
                      {v.attachDocument ? (
                        (() => {
                          const fileUrl = `/${v.attachDocument.replace(/^uploads\//, 'EDUTOOL/uploads/')}`;
                          const fileName = v.attachDocument.split('/').pop();
                          const ext = fileName.split('.').pop().toLowerCase();
                          if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
                            return (
                              <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                <img src={fileUrl} alt={fileName} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, border: '1px solid #ccc' }} />
                              </a>
                            );
                          } else if (ext === "pdf") {
                            return (
                              <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span role="img" aria-label="PDF" style={{ fontSize: 24 }}>��</span> {fileName}
                              </a>
                            );
                          } else {
                            return (
                              <a href={fileUrl} target="_blank" rel="noopener noreferrer">{fileName}</a>
                            );
                          }
                        })()
                      ) : ''}
                    </TableCell>
                  )}
                  <TableCell>
                    {!v.exitTime && (
                      <Button size="small" variant="outlined" onClick={() => handleMarkExit(v._id)} disabled={exitMutation.isLoading}>
                        Mark Exit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Visitor</DialogTitle>
        <DialogContent dividers>
          <TextField margin="dense" label="Visitors Name" name="visitorName" fullWidth value={form.visitorName} onChange={handleChange} />
          <TextField margin="dense" label="ID Card No." name="idCardNo" fullWidth value={form.idCardNo} onChange={handleChange} />
          <TextField margin="dense" label="Phone" name="contactNumber" fullWidth value={form.contactNumber} onChange={handleChange} />
          <TextField margin="dense" label="Meeting With" name="meetingWith" fullWidth value={form.meetingWith} onChange={handleChange} />
          <TextField margin="dense" label="Total Person" name="totalPerson" type="number" fullWidth value={form.totalPerson} onChange={handleChange} />
          <TextField margin="dense" label="Date" name="date" type="date" fullWidth value={form.date} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          <TextField margin="dense" label="Purpose" name="purpose" fullWidth value={form.purpose} onChange={handleChange} />
          <TextField margin="dense" label="In Time" name="inTime" type="time" fullWidth value={form.inTime} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          <TextField margin="dense" label="Out Time" name="outTime" type="time" fullWidth value={form.outTime} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          <TextField margin="dense" label="Ward ID" name="wardId" fullWidth value={form.wardId} onChange={handleChange} />
          <TextField margin="dense" label="Parent Name" name="parentName" fullWidth value={form.parentName} onChange={handleChange} />
          <FormControlLabel control={<Checkbox checked={form.wardPickup} onChange={handleChange} name="wardPickup" />} label="Ward Pickup" />
          <Button variant="outlined" component="label" sx={{ mt: 2 }}>
            Attach Document
            <input type="file" hidden name="attachDocument" onChange={handleChange} />
          </Button>
          {form.attachDocument && <Typography variant="body2" sx={{ mt: 1 }}>{form.attachDocument.name}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={addVisitorMutation.isLoading}>Submit</Button>
        </DialogActions>
      </Dialog>
      {/* Import Dialog */}
      <Dialog open={importDialog} onClose={() => setImportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import from Google Sheets</DialogTitle>
        <DialogContent dividers>
          <TextField label="Google Sheet URL" fullWidth value={sheetUrl} onChange={e => setSheetUrl(e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/..." helperText="Make sure the sheet is publicly accessible" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleImportSheet} startIcon={<GoogleIcon />}>Import Sheet</Button>
        </DialogActions>
      </Dialog>
      {/* Preview Dialog */}
      <Dialog open={previewDialog} onClose={() => setPreviewDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Preview Import Data</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="textSecondary" gutterBottom>Found {sheetData.length} records to import</Typography>
          <TableContainer><Table size="small"><TableHead><TableRow>{sheetData.length > 0 && Object.keys(sheetData[0]).map((key) => (<TableCell key={key}>{key}</TableCell>))}</TableRow></TableHead><TableBody>{sheetData.slice(0, 5).map((row, index) => (<TableRow key={index}>{Object.values(row).map((value, i) => (<TableCell key={i}>{value}</TableCell>))}</TableRow>))}</TableBody></Table></TableContainer>{sheetData.length > 5 && (<Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>Showing first 5 records of {sheetData.length} total</Typography>)}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleBulkImport} disabled={processing} startIcon={processing ? <UploadIcon /> : <UploadIcon />}>{processing ? 'Importing...' : 'Import Records'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Visitors; 