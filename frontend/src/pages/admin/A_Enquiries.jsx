import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody,
  Paper, TableContainer, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Chip, IconButton, Grid, MenuItem, Select, InputLabel, FormControl, CircularProgress
} from '@mui/material';
import { adminAPI } from '../../services/api';
import ReplyIcon from '@mui/icons-material/Reply';
import Papa from 'papaparse';
import { Upload as UploadIcon, Google as GoogleIcon, Add as AddIcon } from '@mui/icons-material';

const statusOptions = ['Pending', 'Replied', 'Closed', 'New', 'In Progress', 'Resolved'];
const sourceOptions = ['Website', 'Phone', 'Walk-in', 'Referral', 'Other'];

const A_Enquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({ source: '', status: '', from: '', to: '' });
  const [importDialog, setImportDialog] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetData, setSheetData] = useState([]);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [addDialog, setAddDialog] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    enquiryType: 'General',
    priority: 'Medium',
    source: 'Website',
    tags: ''
  });

  const fetchEnquiries = () => {
    setLoading(true);
    setError(null);
    adminAPI.getEnquiries({
      source: filters.source,
      status: filters.status,
      startDate: filters.from,
      endDate: filters.to
    }).then(res => {
      console.log('Fetched enquiries response:', res);
      setEnquiries(res.data?.enquiries || res.data || []);
      console.log('Set enquiries to:', res.data?.enquiries || res.data || []);
      setLoading(false);
    }).catch(err => {
      console.error('Error fetching enquiries:', err);
      setEnquiries([]);
      setError('Failed to load enquiries. Please try again.');
      setLoading(false);
    });
    
    // Fetch stats if the method exists
    if (adminAPI.getEnquiryStats) {
      adminAPI.getEnquiryStats().then(setStats).catch(err => {
        console.error('Error fetching stats:', err);
        setStats({});
      });
    }
  };
  useEffect(fetchEnquiries, [filters]);

  const openReply = (e) => {
    setCurrent(e); setReplyText(e.reply || ''); setDialogOpen(true);
  };
  const submitReply = () => {
    adminAPI.updateEnquiry(current._id, { reply: replyText, status: 'Replied' }).then(updated => {
      setEnquiries(prev => prev.map(enq => enq._id === updated._id ? updated : enq));
      setDialogOpen(false);
    });
  };
  const setStatus = (id, status) => {
    console.log('Setting status for enquiry:', id, 'to:', status);
    if (!id) {
      console.error('No enquiry ID provided');
      return;
    }
    
    adminAPI.updateEnquiry(id, { status }).then(updated => {
      console.log('Enquiry updated successfully:', updated);
      setEnquiries(prev => prev.map(e => e._id === id ? updated : e));
    }).catch(error => {
      console.error('Error updating enquiry status:', error);
      alert('Failed to update enquiry status');
    });
  };
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  const handleReset = () => setFilters({ source: '', status: '', from: '', to: '' });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEnquiryForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEnquiry = async () => {
    try {
      // Validate required fields
      if (!enquiryForm.name || !enquiryForm.email || !enquiryForm.phone || !enquiryForm.subject || !enquiryForm.message) {
        alert('Please fill in all required fields');
        return;
      }

      const payload = {
        ...enquiryForm,
        tags: enquiryForm.tags ? enquiryForm.tags.split(',').map(t => t.trim()) : []
      };

      const response = await adminAPI.createEnquiry(payload);
      console.log('Enquiry created:', response);
      alert('Enquiry created successfully!');
      setAddDialog(false);
      setEnquiryForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        enquiryType: 'General',
        priority: 'Medium',
        source: 'Website',
        tags: ''
      });
      // Force refresh the enquiries list
      setTimeout(() => {
        fetchEnquiries();
      }, 100);
    } catch (error) {
      console.error('Error creating enquiry:', error);
      alert('Failed to create enquiry');
    }
  };

  // Google Sheets Import Logic
  const handleImportSheet = async () => {
    try {
      if (!sheetUrl) {
        alert('Please enter a Google Sheet URL');
        return;
      }
      const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!match) {
        alert('Invalid Google Sheet link');
        return;
      }
      const sheetId = match[1];
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      const response = await fetch(csvUrl);
      const csv = await response.text();
      const parsed = Papa.parse(csv, { header: true });
      setSheetData(parsed.data);
      setPreviewDialog(true);
    } catch (error) {
      console.error('Error importing sheet:', error);
      alert('Failed to fetch or parse sheet');
    }
  };
  const handleBulkImport = async () => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      // Map sheetData to expected enquiry fields
      const enquiriesToImport = sheetData.map(row => ({
        name: row['Name'] || '',
        email: row['Email'] || '',
        phone: row['Phone'] || '',
        subject: row['Subject'] || '',
        message: row['Message'] || '',
        enquiryType: row['Enquiry Type'] || 'General',
        priority: row['Priority'] || 'Medium',
        source: row['Source'] || 'Website',
        tags: row['Tags'] ? row['Tags'].split(',').map(t => t.trim()) : [],
        assignedTo: row['Assigned To'] || undefined
      }));
      await adminAPI.bulkImportEnquiries(enquiriesToImport, config);
      alert('Bulk import completed successfully!');
      setPreviewDialog(false);
      setImportDialog(false);
      setSheetData([]);
      setSheetUrl('');
      fetchEnquiries();
    } catch (error) {
      console.error('Error in bulk import:', error);
      alert('Failed to import records');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <Box p={4}><CircularProgress /></Box>;
  
  if (error) {
    return (
      <Box p={4}>
        <Typography variant="h6" color="error" gutterBottom>Error</Typography>
        <Typography>{error}</Typography>
        <Button variant="contained" onClick={fetchEnquiries} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }
  
  // Ensure enquiries is always an array
  const safeEnquiries = Array.isArray(enquiries) ? enquiries : [];
  
  return (
    <Box>
      <Typography variant="h4" mb={3}>Enquiries</Typography>
      {/* Status Cards */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={6} md={3}><Paper sx={{ p:2, textAlign:'center' }}><Typography variant="h6">Active</Typography><Typography variant="h5">{stats?.inProgressEnquiries || 0}</Typography></Paper></Grid>
        <Grid item xs={12} sm={6} md={3}><Paper sx={{ p:2, textAlign:'center' }}><Typography variant="h6">Inactive</Typography><Typography variant="h5">{stats?.closedEnquiries || 0}</Typography></Paper></Grid>
        <Grid item xs={12} sm={6} md={3}><Paper sx={{ p:2, textAlign:'center' }}><Typography variant="h6">Total Admission</Typography><Typography variant="h5">{stats?.totalEnquiries || 0}</Typography></Paper></Grid>
        <Grid item xs={12} sm={6} md={3}><Paper sx={{ p:2, textAlign:'center' }}><Typography variant="h6">Rejected</Typography><Typography variant="h5">{stats?.resolvedEnquiries || 0}</Typography></Paper></Grid>
      </Grid>
      {/* Filter/Search Section */}
      <Paper sx={{ p:2, mb:2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth><InputLabel>Source</InputLabel><Select name="source" value={filters.source} label="Source" onChange={handleFilterChange}><MenuItem value="">All</MenuItem>{sourceOptions.map(opt=>(<MenuItem key={opt} value={opt}>{opt}</MenuItem>))}</Select></FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth><InputLabel>Status</InputLabel><Select name="status" value={filters.status} label="Status" onChange={handleFilterChange}><MenuItem value="">All</MenuItem>{statusOptions.map(opt=>(<MenuItem key={opt} value={opt}>{opt}</MenuItem>))}</Select></FormControl>
          </Grid>
          <Grid item xs={12} sm={2}><TextField name="from" label="From Date" type="date" value={filters.from} onChange={handleFilterChange} fullWidth InputLabelProps={{ shrink: true }}/></Grid>
          <Grid item xs={12} sm={2}><TextField name="to" label="To Date" type="date" value={filters.to} onChange={handleFilterChange} fullWidth InputLabelProps={{ shrink: true }}/></Grid>
          <Grid item xs={12} sm={2} display="flex" gap={1}>
            <Button variant="outlined" onClick={handleReset}>Reset</Button>
            <Button variant="contained" onClick={fetchEnquiries}>Search</Button>
          </Grid>
        </Grid>
      </Paper>
      {/* Import Button */}
      <Box mb={2} display="flex" justifyContent="flex-end">
        <Button variant="contained" startIcon={<AddIcon />} onClick={()=>setAddDialog(true)} sx={{ mr:2 }}>Add Enquiry</Button>
        <Button variant="outlined" startIcon={<UploadIcon />} onClick={()=>setImportDialog(true)} sx={{ mr:2 }}>Import from Google Sheets</Button>
      </Box>
      {/* Enquiries Table */}
      <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
        <Table stickyHeader size="small">
          <TableHead><TableRow>
            <TableCell>Enquiry #</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Subject</TableCell>
            <TableCell>Message</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Source</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Tags</TableCell>
            <TableCell>Action</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {safeEnquiries.map(e=>(
              <TableRow key={e._id}>
                <TableCell>{e.enquiryNumber}</TableCell>
                <TableCell>{e.name}</TableCell>
                <TableCell>{e.email}</TableCell>
                <TableCell>{e.phone}</TableCell>
                <TableCell>{e.subject}</TableCell>
                <TableCell>{e.message}</TableCell>
                <TableCell>{e.enquiryType}</TableCell>
                <TableCell>{e.priority}</TableCell>
                <TableCell>{e.source}</TableCell>
                <TableCell><Chip label={e.status} color={e.status==='Pending'?'warning':e.status==='Replied'?'success':'default'} size="small"/></TableCell>
                <TableCell>{Array.isArray(e.tags)?e.tags.join(', '):''}</TableCell>
                <TableCell>
                  <IconButton onClick={()=>openReply(e)}><ReplyIcon/></IconButton>
                  {e.status!=='Closed' && (
                    <Button size="small" onClick={()=>setStatus(e._id,'Closed')}>Close</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Reply Dialog */}
      <Dialog open={dialogOpen} onClose={()=>setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reply to Enquiry</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" gutterBottom>{current?.message}</Typography>
          <TextField multiline fullWidth rows={4} value={replyText} onChange={e=>setReplyText(e.target.value)} label="Reply" sx={{ mt:2 }}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitReply}>Send Reply</Button>
        </DialogActions>
      </Dialog>
      {/* Import Dialog */}
      <Dialog open={importDialog} onClose={()=>setImportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import from Google Sheets</DialogTitle>
        <DialogContent dividers>
          <TextField label="Google Sheet URL" fullWidth value={sheetUrl} onChange={e => setSheetUrl(e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/..." helperText="Make sure the sheet is publicly accessible" />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setImportDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleImportSheet} startIcon={<GoogleIcon />}>Import Sheet</Button>
        </DialogActions>
      </Dialog>
      {/* Preview Dialog */}
      <Dialog open={previewDialog} onClose={()=>setPreviewDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Preview Import Data</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="textSecondary" gutterBottom>Found {sheetData.length} records to import</Typography>
          <TableContainer><Table size="small"><TableHead><TableRow>{sheetData.length > 0 && Object.keys(sheetData[0]).map((key) => (<TableCell key={key}>{key}</TableCell>))}</TableRow></TableHead><TableBody>{sheetData.slice(0, 5).map((row, index) => (<TableRow key={index}>{Object.values(row).map((value, i) => (<TableCell key={i}>{value}</TableCell>))}</TableRow>))}</TableBody></Table></TableContainer>{sheetData.length > 5 && (<Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>Showing first 5 records of {sheetData.length} total</Typography>)}
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setPreviewDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleBulkImport} disabled={processing} startIcon={processing ? <UploadIcon /> : <UploadIcon />}>{processing ? 'Importing...' : 'Import Records'}</Button>
        </DialogActions>
      </Dialog>
      {/* Add Enquiry Dialog */}
      <Dialog open={addDialog} onClose={()=>setAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Enquiry</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Name *"
                fullWidth
                value={enquiryForm.name}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email *"
                type="email"
                fullWidth
                value={enquiryForm.email}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Phone *"
                fullWidth
                value={enquiryForm.phone}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="subject"
                label="Subject *"
                fullWidth
                value={enquiryForm.subject}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="message"
                label="Message *"
                multiline
                rows={4}
                fullWidth
                value={enquiryForm.message}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Enquiry Type</InputLabel>
                <Select
                  name="enquiryType"
                  value={enquiryForm.enquiryType}
                  label="Enquiry Type"
                  onChange={handleFormChange}
                >
                  <MenuItem value="General">General</MenuItem>
                  <MenuItem value="Admission">Admission</MenuItem>
                  <MenuItem value="Academic">Academic</MenuItem>
                  <MenuItem value="Financial">Financial</MenuItem>
                  <MenuItem value="Technical">Technical</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={enquiryForm.priority}
                  label="Priority"
                  onChange={handleFormChange}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Source</InputLabel>
                <Select
                  name="source"
                  value={enquiryForm.source}
                  label="Source"
                  onChange={handleFormChange}
                >
                  <MenuItem value="Website">Website</MenuItem>
                  <MenuItem value="Phone">Phone</MenuItem>
                  <MenuItem value="Walk-in">Walk-in</MenuItem>
                  <MenuItem value="Referral">Referral</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="tags"
                label="Tags (comma-separated)"
                fullWidth
                value={enquiryForm.tags}
                onChange={handleFormChange}
                helperText="Enter tags separated by commas (e.g., urgent, follow-up, new-student)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setAddDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddEnquiry}>Add Enquiry</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default A_Enquiries; 