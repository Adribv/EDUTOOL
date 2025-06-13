import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Grid,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Announcement,
  Message,
  Person,
  Send,
  Notifications,
  Download,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import studentService from '../../services/studentService';

const Communication = () => {
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
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
      const [announcementsResponse, messagesResponse] = await Promise.all([
        studentService.getAnnouncements(),
        studentService.getMessages(),
      ]);
      setAnnouncements(announcementsResponse.data);
      setMessages(messagesResponse.data);
    } catch {
      toast.error('Failed to load communication data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    try {
      await studentService.sendMessage(newMessage);
      toast.success('Message sent successfully');
      setMessageDialog(false);
      setNewMessage({
        recipient: '',
        subject: '',
        content: '',
      });
      fetchData();
    } catch {
      toast.error('Failed to send message');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Communication</Typography>
        <Button
          variant="contained"
          startIcon={<Send />}
          onClick={() => setMessageDialog(true)}
        >
          New Message
        </Button>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab icon={<Announcement />} label="Announcements" />
        <Tab icon={<Message />} label="Messages" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {announcements.map((announcement) => (
            <Grid item xs={12} key={announcement.id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Notifications color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">{announcement.title}</Typography>
                  </Box>
                  <Typography color="textSecondary" gutterBottom>
                    Posted by: {announcement.postedBy} on{' '}
                    {new Date(announcement.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {announcement.content}
                  </Typography>
                  {announcement.attachments && (
                    <Box mt={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        Attachments:
                      </Typography>
                      {announcement.attachments.map((attachment, index) => (
                        <Button
                          key={index}
                          variant="outlined"
                          size="small"
                          startIcon={<Download />}
                          sx={{ mr: 1 }}
                          onClick={() => window.open(attachment.url, '_blank')}
                        >
                          {attachment.name}
                        </Button>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 1 && (
        <List>
          {messages.map((message) => (
            <React.Fragment key={message.id}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar>
                    <Person />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="subtitle1">
                        {message.sender}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(message.date).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="subtitle2" color="primary">
                        {message.subject}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {message.content}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      )}

      <Dialog open={messageDialog} onClose={() => setMessageDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Message</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Recipient"
            value={newMessage.recipient}
            onChange={(e) => setNewMessage({ ...newMessage, recipient: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Subject"
            value={newMessage.subject}
            onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Message"
            value={newMessage.content}
            onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMessageDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSendMessage}
            variant="contained"
            color="primary"
            disabled={!newMessage.recipient || !newMessage.subject || !newMessage.content}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Communication; 