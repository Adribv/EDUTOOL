import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Badge,
} from '@mui/material';
import {
  Send as SendIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [openNewMessage, setOpenNewMessage] = useState(false);
  const [messageForm, setMessageForm] = useState({
    recipient: '',
    subject: '',
    message: '',
  });

  const [conversations, setConversations] = useState([
    {
      id: 1,
      recipient: {
        name: 'Dr. John Smith',
        role: 'Teacher',
        avatar: null,
      },
      lastMessage: 'Please review the homework assignment',
      timestamp: '2024-03-20 14:30',
      unread: true,
      messages: [
        {
          id: 1,
          sender: 'Dr. John Smith',
          message: 'Please review the homework assignment',
          timestamp: '2024-03-20 14:30',
        },
        {
          id: 2,
          sender: 'You',
          message: 'I will review it tonight',
          timestamp: '2024-03-20 15:00',
        },
      ],
    },
    {
      id: 2,
      recipient: {
        name: 'Sarah Johnson',
        role: 'Counselor',
        avatar: null,
      },
      lastMessage: 'Regarding the upcoming parent-teacher meeting',
      timestamp: '2024-03-19 10:15',
      unread: false,
      messages: [
        {
          id: 1,
          sender: 'Sarah Johnson',
          message: 'Regarding the upcoming parent-teacher meeting',
          timestamp: '2024-03-19 10:15',
        },
        {
          id: 2,
          sender: 'You',
          message: 'I can attend on Thursday',
          timestamp: '2024-03-19 11:00',
        },
      ],
    },
  ]);

  const recipients = [
    { id: 1, name: 'Dr. John Smith', role: 'Teacher' },
    { id: 2, name: 'Sarah Johnson', role: 'Counselor' },
    { id: 3, name: 'Principal Office', role: 'Administration' },
  ];

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    // Mark as read when selected
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversation.id ? { ...conv, unread: false } : conv
      )
    );
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'You',
      message: newMessage,
      timestamp: new Date().toLocaleString(),
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversation.id
          ? {
              ...conv,
              messages: [...conv.messages, newMsg],
              lastMessage: newMessage,
              timestamp: new Date().toLocaleString(),
            }
          : conv
      )
    );

    setNewMessage('');
  };

  const handleNewMessage = () => {
    setOpenNewMessage(true);
  };

  const handleCloseNewMessage = () => {
    setOpenNewMessage(false);
    setMessageForm({
      recipient: '',
      subject: '',
      message: '',
    });
  };

  const handleMessageFormChange = (e) => {
    const { name, value } = e.target;
    setMessageForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitNewMessage = () => {
    const recipient = recipients.find((r) => r.id === messageForm.recipient);
    const newConversation = {
      id: Date.now(),
      recipient: {
        name: recipient.name,
        role: recipient.role,
        avatar: null,
      },
      lastMessage: messageForm.message,
      timestamp: new Date().toLocaleString(),
      unread: false,
      messages: [
        {
          id: 1,
          sender: 'You',
          message: messageForm.message,
          timestamp: new Date().toLocaleString(),
        },
      ],
    };

    setConversations((prev) => [newConversation, ...prev]);
    handleCloseNewMessage();
  };

  const getAvatarIcon = (role) => {
    switch (role) {
      case 'Teacher':
        return <SchoolIcon />;
      case 'Counselor':
        return <PersonIcon />;
      case 'Administration':
        return <AdminIcon />;
      default:
        return <PersonIcon />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4">Messages</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNewMessage}
            >
              New Message
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ height: 'calc(100vh - 200px)', overflow: 'auto' }}>
            <List>
              {conversations.map((conversation) => (
                <ListItem
                  key={conversation.id}
                  button
                  selected={selectedConversation?.id === conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                >
                  <ListItemAvatar>
                    <Badge
                      color="error"
                      variant="dot"
                      invisible={!conversation.unread}
                    >
                      <Avatar>{getAvatarIcon(conversation.recipient.role)}</Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={conversation.recipient.name}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="textPrimary"
                        >
                          {conversation.lastMessage}
                        </Typography>
                        <br />
                        {conversation.timestamp}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          {selectedConversation ? (
            <Paper sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">
                  {selectedConversation.recipient.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {selectedConversation.recipient.role}
                </Typography>
              </Box>

              <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                {selectedConversation.messages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      display: 'flex',
                      justifyContent: message.sender === 'You' ? 'flex-end' : 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Paper
                      sx={{
                        p: 2,
                        maxWidth: '70%',
                        backgroundColor: message.sender === 'You' ? 'primary.light' : 'grey.100',
                      }}
                    >
                      <Typography variant="body1">{message.message}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {message.timestamp}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
              </Box>

              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Grid container spacing={2}>
                  <Grid item xs>
                    <TextField
                      fullWidth
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSendMessage();
                        }
                      }}
                    />
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSendMessage}
                      endIcon={<SendIcon />}
                    >
                      Send
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          ) : (
            <Paper
              sx={{
                height: 'calc(100vh - 200px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h6" color="textSecondary">
                Select a conversation to view messages
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      <Dialog open={openNewMessage} onClose={handleCloseNewMessage} maxWidth="sm" fullWidth>
        <DialogTitle>New Message</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Recipient</InputLabel>
                  <Select
                    name="recipient"
                    value={messageForm.recipient}
                    onChange={handleMessageFormChange}
                    label="Recipient"
                  >
                    {recipients.map((recipient) => (
                      <MenuItem key={recipient.id} value={recipient.id}>
                        {recipient.name} ({recipient.role})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject"
                  name="subject"
                  value={messageForm.subject}
                  onChange={handleMessageFormChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Message"
                  name="message"
                  multiline
                  rows={4}
                  value={messageForm.message}
                  onChange={handleMessageFormChange}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewMessage}>Cancel</Button>
          <Button onClick={handleSubmitNewMessage} variant="contained" color="primary">
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Messages; 