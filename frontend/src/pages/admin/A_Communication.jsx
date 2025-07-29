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
  Snackbar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Announcement as AnnouncementIcon,
  Message as MessageIcon,
  Pending as PendingIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';

const A_Communication = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [messages, setMessages] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: '',
    priority: '',
    targetAudience: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [list, approvalsData] = await Promise.all([
        adminAPI.getCommunications(),
        adminAPI.getApprovalRequests({ requestType: 'Communication' })
      ]);
      
      const activeItems = list.filter((c)=>c.status !== 'Deleted');
      
      // Add approval status to existing communications
      const communicationsWithStatus = activeItems.map(item => ({
        ...item,
        status: 'Approved' // Communications in the communications collection are already approved
      }));
      
      // Add pending/rejected communications from approval requests
      const pendingCommunications = approvalsData
        .filter(approval => approval.status !== 'Approved')
        .map(approval => ({
          _id: approval._id,
          title: approval.title,
          content: approval.description,
          type: approval.requestData?.communicationType || 'Announcement',
          priority: approval.requestData?.priority || 'Normal',
          targetAudience: approval.requestData?.recipients?.[0] || 'All',
          startDate: approval.requestData?.scheduledDate || '',
          endDate: approval.requestData?.endDate || '',
          status: approval.status,
          approvalId: approval._id
        }));
      
      const allCommunications = [...communicationsWithStatus, ...pendingCommunications];
      
      setAnnouncements(allCommunications.filter((c)=>c.type==='Announcement'));
      setMessages(allCommunications.filter((c)=>c.type==='Message'));
    } catch (error) {
      console.error('Error fetching communication data:', error);
      setError('Failed to load communication data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        content: item.content,
        type: item.type,
        priority: item.priority,
        targetAudience: item.targetAudience,
        startDate: item.startDate,
        endDate: item.endDate,
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        content: '',
        type: '',
        priority: '',
        targetAudience: '',
        startDate: '',
        endDate: '',
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
        await adminAPI.updateCommunication(editingItem._id, formData);
        setSnackbar({ open: true, message: 'Communication updated successfully', severity: 'success' });
      } else {
        // Create approval request instead of directly creating communication
        const communicationData = { 
          ...formData, 
          type: activeTab === 0 ? 'Announcement' : 'Message' 
        };
        await adminAPI.createCommunicationApproval(communicationData);
        setSnackbar({ 
          open: true, 
          message: 'Communication approval request submitted successfully. Waiting for principal approval.', 
          severity: 'info' 
        });
      }
      handleCloseDialog();
      fetchData();
    } catch (error) {
      console.error('Error saving communication:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to save communication item', 
        severity: 'error' 
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await adminAPI.updateCommunicationStatus(id, { status: 'Deleted' });
        setSnackbar({ open: true, message: 'Item deleted successfully', severity: 'success' });
        fetchData();
      } catch {
        setSnackbar({ open: true, message: 'Failed to delete item', severity: 'error' });
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <ApprovedIcon />;
      case 'Pending':
        return <PendingIcon />;
      case 'Rejected':
        return <RejectedIcon />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'error';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'success';
      default:
        return 'default';
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

  const currentItems = activeTab === 0 ? announcements : messages;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Communication Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add New {activeTab === 0 ? 'Announcement' : 'Message'}
        </Button>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Announcements" />
        <Tab label="Messages" />
      </Tabs>

      <Grid container spacing={3}>
        {/* Statistics */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AnnouncementIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Total {activeTab === 0 ? 'Announcements' : 'Messages'}
                </Typography>
              </Box>
              <Typography variant="h4">{currentItems.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ApprovedIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Approved</Typography>
              </Box>
              <Typography variant="h4">
                {currentItems.filter((item) => item.status === 'Approved').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PendingIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Pending Approval</Typography>
              </Box>
              <Typography variant="h4">
                {currentItems.filter((item) => item.status === 'Pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <MessageIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">High Priority</Typography>
              </Box>
              <Typography variant="h4">
                {currentItems.filter((item) => item.priority === 'High').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* List */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Target Audience</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No {activeTab === 0 ? 'announcements' : 'messages'} found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((item) => (
                    <TableRow key={item._id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {item.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.content?.substring(0, 50)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={item.type} 
                          size="small" 
                          variant="outlined"
                          color={item.type === 'Announcement' ? 'primary' : 'secondary'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.priority || 'Normal'}
                          color={getPriorityColor(item.priority)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={item.targetAudience || 'All'} 
                          size="small" 
                          variant="outlined" 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(item.status)}
                          label={item.status || 'Pending'}
                          color={getStatusColor(item.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(item)}
                            disabled={item.status === 'Rejected'}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(item._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? 'Edit Communication' : `Add New ${activeTab === 0 ? 'Announcement' : 'Message'}`}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                variant="outlined"
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  label="Priority"
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Target Audience</InputLabel>
                <Select
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleChange}
                  label="Target Audience"
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Students">Students</MenuItem>
                  <MenuItem value="Parents">Parents</MenuItem>
                  <MenuItem value="Teachers">Teachers</MenuItem>
                  <MenuItem value="Staff">Staff</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            {editingItem ? 'Update' : 'Submit for Approval'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default A_Communication; 