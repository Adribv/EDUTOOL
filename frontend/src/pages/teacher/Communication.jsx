import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Announcement,
  Message,
  Close,
  Edit,
  Save,
  Cancel,
  Add,
  Delete,
  Visibility,
  Search,
  FilterList,
  Person,
  Email,
  Phone,
  School,
  Send,
} from '@mui/icons-material';
import { teacherAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Communication = () => {
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedAnnouncement, setEditedAnnouncement] = useState(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'General',
    target: 'All',
    class: '',
    section: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDialog, setFilterDialog] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    target: '',
    class: '',
    section: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [announcementsResponse, messagesResponse] = await Promise.all([
        teacherAPI.getAnnouncements(),
        teacherAPI.getMessages(),
      ]);
      setAnnouncements(announcementsResponse.data);
      setMessages(messagesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleViewAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
  };

  const handleEditAnnouncement = (announcement) => {
    setEditedAnnouncement(announcement);
    setEditMode(true);
  };

  const handleSaveAnnouncement = async () => {
    try {
      await teacherAPI.updateAnnouncement(editedAnnouncement.id, editedAnnouncement);
      toast.success('Announcement updated successfully');
      setEditMode(false);
      setEditedAnnouncement(null);
      fetchData();
    } catch (error) {
      console.error('Error updating announcement:', error);
      toast.error('Failed to update announcement');
    }
  };

  const handleCreateAnnouncement = async () => {
    try {
      await teacherAPI.createAnnouncement(newAnnouncement);
      toast.success('Announcement created successfully');
      setCreateDialog(false);
      setNewAnnouncement({
        title: '',
        content: '',
        type: 'General',
        target: 'All',
        class: '',
        section: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error('Failed to create announcement');
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await teacherAPI.deleteAnnouncement(announcementId);
        toast.success('Announcement deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting announcement:', error);
        toast.error('Failed to delete announcement');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedAnnouncement(null);
  };

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
  };

  const handleReplyMessage = async (messageId, reply) => {
    try {
      await teacherAPI.replyToMessage(messageId, { reply });
      toast.success('Reply sent successfully');
      setSelectedMessage(null);
      fetchData();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilters = (!filters.type || announcement.type === filters.type) &&
      (!filters.target || announcement.target === filters.target) &&
      (!filters.class || announcement.class === filters.class) &&
      (!filters.section || announcement.section === filters.section);
    return matchesSearch && matchesFilters;
  });

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Communication
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialog(true)}
        >
          Create Announcement
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={() => setFilterDialog(true)}
        >
          Filter
        </Button>
      </Box>

      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        sx={{ mb: 3 }}
      >
        <Tab label="Announcements" />
        <Tab label="Messages" />
      </Tabs>

      {selectedTab === 0 ? (
        <Grid container spacing={3}>
          {filteredAnnouncements.map((announcement) => (
            <Grid item xs={12} md={6} key={announcement.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {announcement.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {announcement.content}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={announcement.type}
                          color={
                            announcement.type === 'General' ? 'default' :
                            announcement.type === 'Exam' ? 'error' :
                            announcement.type === 'Event' ? 'success' : 'primary'
                          }
                          size="small"
                        />
                        <Chip
                          label={announcement.target}
                          size="small"
                        />
                        {announcement.class && announcement.section && (
                          <Chip
                            label={`${announcement.class} ${announcement.section}`}
                            size="small"
                          />
                        )}
                      </Box>
                    </Box>
                    <Box>
                      <Chip
                        label={new Date(announcement.date).toLocaleDateString()}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleViewAnnouncement(announcement)}
                    >
                      View
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleEditAnnouncement(announcement)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <List>
          {messages.map((message) => (
            <React.Fragment key={message.id}>
              <ListItem
                button
                onClick={() => handleViewMessage(message)}
                sx={{
                  bgcolor: message.read ? 'transparent' : 'action.hover',
                }}
              >
                <ListItemAvatar>
                  <Avatar>
                    <Person />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={message.subject}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {message.senderName}
                      </Typography>
                      {` — ${message.content}`}
                    </>
                  }
                />
                <Chip
                  label={new Date(message.date).toLocaleDateString()}
                  size="small"
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      )}

      {/* Announcement Details Dialog */}
      <Dialog
        open={!!selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedAnnouncement && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  {selectedAnnouncement.title}
                </Typography>
                <IconButton onClick={() => setSelectedAnnouncement(null)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Content
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedAnnouncement.content}
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Type</Typography>
                  <Typography variant="body2">
                    {selectedAnnouncement.type}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Target</Typography>
                  <Typography variant="body2">
                    {selectedAnnouncement.target}
                  </Typography>
                </Grid>
                {selectedAnnouncement.class && selectedAnnouncement.section && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Class</Typography>
                      <Typography variant="body2">
                        {selectedAnnouncement.class}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Section</Typography>
                      <Typography variant="body2">
                        {selectedAnnouncement.section}
                      </Typography>
                    </Grid>
                  </>
                )}
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Date</Typography>
                  <Typography variant="body2">
                    {new Date(selectedAnnouncement.date).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedAnnouncement(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit Announcement Dialog */}
      <Dialog
        open={editMode}
        onClose={handleCancelEdit}
        maxWidth="sm"
        fullWidth
      >
        {editedAnnouncement && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Edit Announcement</Typography>
                <IconButton onClick={handleCancelEdit}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    label="Title"
                    fullWidth
                    value={editedAnnouncement.title}
                    onChange={(e) => setEditedAnnouncement({ ...editedAnnouncement, title: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Content"
                    fullWidth
                    multiline
                    rows={4}
                    value={editedAnnouncement.content}
                    onChange={(e) => setEditedAnnouncement({ ...editedAnnouncement, content: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={editedAnnouncement.type}
                      label="Type"
                      onChange={(e) => setEditedAnnouncement({ ...editedAnnouncement, type: e.target.value })}
                    >
                      <MenuItem value="General">General</MenuItem>
                      <MenuItem value="Exam">Exam</MenuItem>
                      <MenuItem value="Event">Event</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Target</InputLabel>
                    <Select
                      value={editedAnnouncement.target}
                      label="Target"
                      onChange={(e) => setEditedAnnouncement({ ...editedAnnouncement, target: e.target.value })}
                    >
                      <MenuItem value="All">All</MenuItem>
                      <MenuItem value="Students">Students</MenuItem>
                      <MenuItem value="Parents">Parents</MenuItem>
                      <MenuItem value="Teachers">Teachers</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Class"
                    fullWidth
                    value={editedAnnouncement.class}
                    onChange={(e) => setEditedAnnouncement({ ...editedAnnouncement, class: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Section"
                    fullWidth
                    value={editedAnnouncement.section}
                    onChange={(e) => setEditedAnnouncement({ ...editedAnnouncement, section: e.target.value })}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelEdit}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleSaveAnnouncement}
              >
                Save Changes
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create Announcement Dialog */}
      <Dialog
        open={createDialog}
        onClose={() => setCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Create Announcement</Typography>
            <IconButton onClick={() => setCreateDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                fullWidth
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Content"
                fullWidth
                multiline
                rows={4}
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newAnnouncement.type}
                  label="Type"
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value })}
                >
                  <MenuItem value="General">General</MenuItem>
                  <MenuItem value="Exam">Exam</MenuItem>
                  <MenuItem value="Event">Event</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Target</InputLabel>
                <Select
                  value={newAnnouncement.target}
                  label="Target"
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, target: e.target.value })}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Students">Students</MenuItem>
                  <MenuItem value="Parents">Parents</MenuItem>
                  <MenuItem value="Teachers">Teachers</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Class"
                fullWidth
                value={newAnnouncement.class}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, class: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Section"
                fullWidth
                value={newAnnouncement.section}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, section: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateAnnouncement}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Message Details Dialog */}
      <Dialog
        open={!!selectedMessage}
        onClose={() => setSelectedMessage(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedMessage && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  {selectedMessage.subject}
                </Typography>
                <IconButton onClick={() => setSelectedMessage(null)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  From: {selectedMessage.senderName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {selectedMessage.content}
                </Typography>
                {selectedMessage.reply && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Your Reply:
                    </Typography>
                    <Typography variant="body2">
                      {selectedMessage.reply}
                    </Typography>
                  </Box>
                )}
              </Box>
              {!selectedMessage.reply && (
                <TextField
                  label="Reply"
                  fullWidth
                  multiline
                  rows={4}
                  onChange={(e) => {
                    const reply = e.target.value;
                    if (reply.trim()) {
                      handleReplyMessage(selectedMessage.id, reply);
                    }
                  }}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedMessage(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Filter Dialog */}
      <Dialog
        open={filterDialog}
        onClose={() => setFilterDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Filter Announcements</Typography>
            <IconButton onClick={() => setFilterDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.type}
                  label="Type"
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="General">General</MenuItem>
                  <MenuItem value="Exam">Exam</MenuItem>
                  <MenuItem value="Event">Event</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Target</InputLabel>
                <Select
                  value={filters.target}
                  label="Target"
                  onChange={(e) => setFilters({ ...filters, target: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Students">Students</MenuItem>
                  <MenuItem value="Parents">Parents</MenuItem>
                  <MenuItem value="Teachers">Teachers</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Class</InputLabel>
                <Select
                  value={filters.class}
                  label="Class"
                  onChange={(e) => setFilters({ ...filters, class: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="1">Class 1</MenuItem>
                  <MenuItem value="2">Class 2</MenuItem>
                  <MenuItem value="3">Class 3</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Section</InputLabel>
                <Select
                  value={filters.section}
                  label="Section"
                  onChange={(e) => setFilters({ ...filters, section: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="A">Section A</MenuItem>
                  <MenuItem value="B">Section B</MenuItem>
                  <MenuItem value="C">Section C</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setFilters({
              type: '',
              target: '',
              class: '',
              section: '',
            })}
          >
            Clear Filters
          </Button>
          <Button onClick={() => setFilterDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Communication; 