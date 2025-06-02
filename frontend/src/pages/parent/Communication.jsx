import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Badge,
} from '@mui/material';
import {
  Message,
  Announcement,
  Event,
  Send,
  Close,
  Notifications,
  NotificationsActive,
  NotificationsOff,
  Person,
  School,
  CalendarToday,
} from '@mui/icons-material';
import { parentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Communication = () => {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageDialog, setMessageDialog] = useState(false);
  const [newMessage, setNewMessage] = useState({
    recipient: '',
    subject: '',
    content: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [messagesRes, announcementsRes, eventsRes] = await Promise.all([
        parentAPI.getMessages(),
        parentAPI.getAnnouncements(),
        parentAPI.getEvents(),
      ]);
      setMessages(messagesRes.data);
      setAnnouncements(announcementsRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load communication data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleMessageDialogOpen = (message) => {
    setSelectedMessage(message);
    setMessageDialog(true);
  };

  const handleMessageDialogClose = () => {
    setMessageDialog(false);
    setSelectedMessage(null);
  };

  const handleNewMessageChange = (field) => (event) => {
    setNewMessage({ ...newMessage, [field]: event.target.value });
  };

  const handleSendMessage = async () => {
    try {
      await parentAPI.sendMessage(newMessage);
      toast.success('Message sent successfully');
      setNewMessage({ recipient: '', subject: '', content: '' });
      fetchData();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const getMessageStatusChip = (status) => {
    switch (status) {
      case 'read':
        return <Chip label="Read" color="success" size="small" />;
      case 'unread':
        return <Chip label="Unread" color="warning" size="small" />;
      default:
        return null;
    }
  };

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
      <Typography variant="h4" sx={{ mb: 3 }}>
        Communication Center
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Message color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Messages</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {messages.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {messages.filter((m) => m.status === 'unread').length} unread
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Announcement color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Announcements</Typography>
              </Box>
              <Typography variant="h4" color="warning">
                {announcements.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {announcements.filter((a) => a.isNew).length} new
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Event color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Upcoming Events</Typography>
              </Box>
              <Typography variant="h4" color="info">
                {events.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Next event: {events[0]?.date}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Communication Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label="Messages" />
          <Tab label="Announcements" />
          <Tab label="Events" />
        </Tabs>
      </Box>

      {/* Messages Tab */}
      {selectedTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>From</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 1 }}>
                            {message.sender.charAt(0)}
                          </Avatar>
                          {message.sender}
                        </Box>
                      </TableCell>
                      <TableCell>{message.subject}</TableCell>
                      <TableCell>
                        {new Date(message.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getMessageStatusChip(message.status)}</TableCell>
                      <TableCell>
                        <Tooltip title="View Message">
                          <IconButton
                            color="primary"
                            onClick={() => handleMessageDialogOpen(message)}
                          >
                            <Message />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  New Message
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="To"
                    fullWidth
                    value={newMessage.recipient}
                    onChange={handleNewMessageChange('recipient')}
                  />
                  <TextField
                    label="Subject"
                    fullWidth
                    value={newMessage.subject}
                    onChange={handleNewMessageChange('subject')}
                  />
                  <TextField
                    label="Message"
                    fullWidth
                    multiline
                    rows={4}
                    value={newMessage.content}
                    onChange={handleNewMessageChange('content')}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Send />}
                    onClick={handleSendMessage}
                  >
                    Send Message
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Announcements Tab */}
      {selectedTab === 1 && (
        <Grid container spacing={3}>
          {announcements.map((announcement) => (
            <Grid item xs={12} key={announcement.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <School color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">{announcement.title}</Typography>
                    {announcement.isNew && (
                      <Chip
                        label="New"
                        color="primary"
                        size="small"
                        sx={{ ml: 2 }}
                      />
                    )}
                  </Box>
                  <Typography variant="body1" paragraph>
                    {announcement.content}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Posted by: {announcement.author}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(announcement.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Events Tab */}
      {selectedTab === 2 && (
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CalendarToday color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">{event.title}</Typography>
                  </Box>
                  <Typography variant="body1" paragraph>
                    {event.description}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Date: {new Date(event.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Time: {event.time}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Location: {event.location}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Message Dialog */}
      <Dialog
        open={messageDialog}
        onClose={handleMessageDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Message Details
          <IconButton
            onClick={handleMessageDialogClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedMessage && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 1 }}>{selectedMessage.sender.charAt(0)}</Avatar>
                <Box>
                  <Typography variant="subtitle1">
                    From: {selectedMessage.sender}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(selectedMessage.date).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h6" gutterBottom>
                {selectedMessage.subject}
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedMessage.content}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleMessageDialogClose}>Close</Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Send />}
            onClick={() => {
              setNewMessage({
                recipient: selectedMessage.sender,
                subject: `Re: ${selectedMessage.subject}`,
                content: '',
              });
              handleMessageDialogClose();
              setSelectedTab(0);
            }}
          >
            Reply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Communication; 