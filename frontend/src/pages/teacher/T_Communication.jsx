import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
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
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import {
  Message as MessageIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Notifications as NotificationsIcon,
  School as SchoolIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import teacherService from '../../services/teacherService';

const T_Communication = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [messages, setMessages] = useState([]);
  const [classes, setClasses] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
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
      const [announcementsRes, messagesRes, classesRes] = await Promise.all([
        teacherService.getAnnouncements(),
        teacherService.getMessages(),
        teacherService.getClasses(),
      ]);
      setAnnouncements(announcementsRes.data);
      setMessages(messagesRes.data);
      setClasses(classesRes.data);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
        type: activeTab === 0 ? 'Announcement' : 'Message',
        priority: 'Normal',
        targetAudience: '',
        startDate: new Date().toISOString().split('T')[0],
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
        if (activeTab === 0) {
          await teacherService.updateAnnouncement(editingItem.id, formData);
        } else {
          await teacherService.updateMessage(editingItem.id, formData);
        }
      } else {
        if (activeTab === 0) {
          await teacherService.createAnnouncement(formData);
        } else {
          await teacherService.createMessage(formData);
        }
      }
      handleCloseDialog();
      fetchData();
    } catch {
      setError('Failed to save communication');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        if (activeTab === 0) {
          await teacherService.deleteAnnouncement(id);
        } else {
          await teacherService.deleteMessage(id);
        }
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
      <Typography variant="h4" gutterBottom>
        Communication
      </Typography>

      <Grid container spacing={3}>
        {/* Communication Statistics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <NotificationsIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Announcements</Typography>
              </Box>
              <Typography variant="h4">{announcements.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <MessageIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Messages</Typography>
              </Box>
              <Typography variant="h4">{messages.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SchoolIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Active Classes</Typography>
              </Box>
              <Typography variant="h4">{classes.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Communication Management */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Announcements" />
                <Tab label="Messages" />
              </Tabs>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                {activeTab === 0 ? 'New Announcement' : 'New Message'}
              </Button>
            </Box>

            {activeTab === 0 ? (
              <TableContainer>
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
                    {announcements.map((announcement) => (
                      <TableRow key={announcement.id}>
                        <TableCell>{announcement.title}</TableCell>
                        <TableCell>{announcement.type}</TableCell>
                        <TableCell>
                          <Chip
                            label={announcement.priority}
                            color={
                              announcement.priority === 'High'
                                ? 'error'
                                : announcement.priority === 'Medium'
                                ? 'warning'
                                : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{announcement.targetAudience}</TableCell>
                        <TableCell>{announcement.startDate}</TableCell>
                        <TableCell>{announcement.endDate}</TableCell>
                        <TableCell>
                          <Chip
                            label={announcement.status}
                            color={
                              announcement.status === 'Active'
                                ? 'success'
                                : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleOpenDialog(announcement)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(announcement.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <List>
                {messages.map((message) => (
                  <Box key={message.id}>
                    <ListItem>
                      <ListItemIcon>
                        <MessageIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={message.title}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="textPrimary">
                              To: {message.targetAudience}
                            </Typography>
                            {' — '}
                            {message.content}
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleOpenDialog(message)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => handleDelete(message.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </Box>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Communication Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem
            ? `Edit ${activeTab === 0 ? 'Announcement' : 'Message'}`
            : `New ${activeTab === 0 ? 'Announcement' : 'Message'}`}
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
                  <MenuItem value="Announcement">Announcement</MenuItem>
                  <MenuItem value="Message">Message</MenuItem>
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
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Normal">Normal</MenuItem>
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
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.name}>
                      {cls.name}
                    </MenuItem>
                  ))}
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
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingItem ? 'Update' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default T_Communication; 