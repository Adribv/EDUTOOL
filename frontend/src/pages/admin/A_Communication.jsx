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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Announcement as AnnouncementIcon,
  Message as MessageIcon,
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
      const list = await adminAPI.getCommunications();
      const activeItems = list.filter((c)=>c.status !== 'Deleted');
      setAnnouncements(activeItems.filter((c)=>c.type==='Announcement'));
      setMessages(activeItems.filter((c)=>c.type==='Message'));
    } catch {
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
      } else {
        await adminAPI.createCommunication({ ...formData, type: activeTab === 0 ? 'Announcement' : 'Message' });
      }
      handleCloseDialog();
      fetchData();
    } catch {
      setError('Failed to save communication item');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await adminAPI.updateCommunicationStatus(id, { status: 'Deleted' });
        fetchData();
      } catch {
        setError('Failed to delete item');
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
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AnnouncementIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Total {activeTab === 0 ? 'Announcements' : 'Messages'}
                </Typography>
              </Box>
              <Typography variant="h4">
                {activeTab === 0 ? announcements.length : messages.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <MessageIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Active Items</Typography>
              </Box>
              <Typography variant="h4">
                {activeTab === 0
                  ? announcements.filter(
                      (a) =>
                        new Date(a.startDate) <= new Date() &&
                        new Date(a.endDate) >= new Date()
                    ).length
                  : messages.filter(
                      (m) =>
                        new Date(m.startDate) <= new Date() &&
                        new Date(m.endDate) >= new Date()
                    ).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AnnouncementIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">High Priority</Typography>
              </Box>
              <Typography variant="h4">
                {activeTab === 0
                  ? announcements.filter((a) => a.priority === 'high').length
                  : messages.filter((m) => m.priority === 'high').length}
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
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(activeTab === 0 ? announcements : messages).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.priority}
                        color={
                          item.priority === 'high'
                            ? 'error'
                            : item.priority === 'medium'
                            ? 'warning'
                            : 'success'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{item.targetAudience}</TableCell>
                    <TableCell>{new Date(item.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(item.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          new Date(item.startDate) <= new Date() &&
                          new Date(item.endDate) >= new Date()
                            ? 'Active'
                            : 'Inactive'
                        }
                        color={
                          new Date(item.startDate) <= new Date() &&
                          new Date(item.endDate) >= new Date()
                            ? 'success'
                            : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenDialog(item)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(item.id)} color="error">
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
          {editingItem
            ? `Edit ${activeTab === 0 ? 'Announcement' : 'Message'}`
            : `Add New ${activeTab === 0 ? 'Announcement' : 'Message'}`}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Title"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="content"
                label="Content"
                value={formData.content}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="academic">Academic</MenuItem>
                  <MenuItem value="event">Event</MenuItem>
                  <MenuItem value="emergency">Emergency</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
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
                  required
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="students">Students</MenuItem>
                  <MenuItem value="staff">Staff</MenuItem>
                  <MenuItem value="parents">Parents</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="startDate"
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="endDate"
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
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

export default A_Communication; 