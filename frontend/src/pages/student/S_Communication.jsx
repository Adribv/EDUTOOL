import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Announcement as AnnouncementIcon,
  Message as MessageIcon,
  Event as EventIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  PriorityHigh as PriorityHighIcon,
} from '@mui/icons-material';
import studentService from '../../services/studentService';

const S_Communication = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [announcementsResponse, messagesResponse] = await Promise.all([
        studentService.getAnnouncements(),
        studentService.getMessages(),
      ]);
      setAnnouncements(announcementsResponse.data);
      setMessages(messagesResponse.data);
    } catch {
      setError('Failed to load communication data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedItem(null);
    setReplyMessage('');
  };

  const handleReply = async () => {
    try {
      await studentService.replyToMessage(selectedItem.id, replyMessage);
      await fetchData();
      handleDialogClose();
    } catch {
      setError('Failed to send reply');
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
                <AnnouncementIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Announcements</Typography>
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
                <Typography variant="h6">Messages</Typography>
              </Box>
              <Typography variant="h4">{messages.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <EventIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Upcoming Events</Typography>
              </Box>
              <Typography variant="h4">
                {announcements.filter((a) => a.type === 'Event').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Communication List */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Announcements" />
              <Tab label="Messages" />
            </Tabs>

            <Box mt={2}>
              {activeTab === 0 && (
                <List>
                  {announcements.map((announcement) => (
                    <ListItem
                      key={announcement.id}
                      button
                      onClick={() => handleItemClick(announcement)}
                    >
                      <ListItemIcon>
                        <AnnouncementIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center">
                            {announcement.title}
                            {announcement.priority === 'High' && (
                              <PriorityHighIcon color="error" sx={{ ml: 1 }} />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              {announcement.content}
                            </Typography>
                            <Box display="flex" alignItems="center" mt={1}>
                              <SchoolIcon sx={{ mr: 0.5, fontSize: 16 }} />
                              <Typography variant="caption" sx={{ mr: 2 }}>
                                {announcement.className}
                              </Typography>
                              <EventIcon sx={{ mr: 0.5, fontSize: 16 }} />
                              <Typography variant="caption">
                                {announcement.date}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                      <Chip
                        label={announcement.type}
                        color={announcement.type === 'Event' ? 'primary' : 'default'}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              )}

              {activeTab === 1 && (
                <List>
                  {messages.map((message) => (
                    <ListItem
                      key={message.id}
                      button
                      onClick={() => handleItemClick(message)}
                    >
                      <ListItemIcon>
                        <MessageIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center">
                            {message.subject}
                            {!message.read && (
                              <Chip
                                label="New"
                                color="primary"
                                size="small"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              {message.content}
                            </Typography>
                            <Box display="flex" alignItems="center" mt={1}>
                              <PersonIcon sx={{ mr: 0.5, fontSize: 16 }} />
                              <Typography variant="caption" sx={{ mr: 2 }}>
                                {message.sender}
                              </Typography>
                              <EventIcon sx={{ mr: 0.5, fontSize: 16 }} />
                              <Typography variant="caption">
                                {message.date}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {activeTab === 0 ? 'Announcement Details' : 'Message Details'}
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedItem.title || selectedItem.subject}
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedItem.content}
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                {activeTab === 0 ? (
                  <>
                    <SchoolIcon sx={{ mr: 1 }} color="primary" />
                    <Typography variant="body2" sx={{ mr: 2 }}>
                      {selectedItem.className}
                    </Typography>
                  </>
                ) : (
                  <>
                    <PersonIcon sx={{ mr: 1 }} color="primary" />
                    <Typography variant="body2" sx={{ mr: 2 }}>
                      From: {selectedItem.sender}
                    </Typography>
                  </>
                )}
                <EventIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="body2">
                  {selectedItem.date}
                </Typography>
              </Box>
              {activeTab === 1 && (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Reply"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  margin="normal"
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Close</Button>
          {activeTab === 1 && (
            <Button
              onClick={handleReply}
              variant="contained"
              disabled={!replyMessage.trim()}
            >
              Send Reply
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default S_Communication; 