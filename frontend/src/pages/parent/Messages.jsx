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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { parentAPI } from '../../services/api';

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [openNewMessage, setOpenNewMessage] = useState(false);
  const [messageForm, setMessageForm] = useState({
    recipientId: '',
    recipientModel: '',
    subject: '',
    message: '',
  });

  const queryClient = useQueryClient();

  const { data: receivedData } = useQuery({
    queryKey: ['parent_messages_received'],
    queryFn: parentAPI.getMessages,
  });

  const { data: sentData } = useQuery({
    queryKey: ['parent_messages_sent'],
    queryFn: parentAPI.getSentMessages,
  });

  const buildConversations = () => {
    const convMap = new Map();

    const processMsg = (msg, isSent) => {
      const counterpartId = isSent ? msg.recipientId : msg.senderId;
      const counterpartRole = isSent ? msg.recipientModel : msg.senderModel;
      const key = `${counterpartRole}-${counterpartId}`;

      if (!convMap.has(key)) {
        convMap.set(key, {
          id: key,
          counterpartId,
          counterpartRole,
          name: msg.senderName || msg.recipientName || 'User',
          avatar: null,
          unread: !isSent && !msg.read,
          messages: [],
        });
      }

      const conv = convMap.get(key);
      conv.messages.push({
        id: msg._id,
        sender: isSent ? 'You' : msg.senderName || 'User',
        message: msg.content || msg.message,
        timestamp: new Date(msg.createdAt).toLocaleString(),
      });
      conv.lastMessage = msg.content || msg.message;
      conv.timestamp = new Date(msg.createdAt).toLocaleString();
    };

    (Array.isArray(receivedData) ? receivedData : []).forEach((m) => processMsg(m, false));
    (Array.isArray(sentData) ? sentData : []).forEach((m) => processMsg(m, true));

    return Array.from(convMap.values()).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const conversations = buildConversations();

  const sendMutation = useMutation({
    mutationFn: parentAPI.sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries(['parent_messages_sent']);
      handleCloseNewMessage();
    },
  });

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const payload = {
      recipientId: selectedConversation.counterpartId,
      recipientModel: selectedConversation.counterpartRole,
      subject: 'RE',
      content: newMessage,
    };

    sendMutation.mutate(payload);
    setNewMessage('');
  };

  const handleNewMessage = () => setOpenNewMessage(true);

  const handleCloseNewMessage = () => {
    setOpenNewMessage(false);
    setMessageForm({ recipientId: '', recipientModel: '', subject: '', message: '' });
  };

  const handleMessageFormChange = (e) => {
    const { name, value } = e.target;
    setMessageForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitNewMessage = () => {
    if (!messageForm.recipientId || !messageForm.message) return;
    sendMutation.mutate({
      recipientId: messageForm.recipientId,
      recipientModel: messageForm.recipientModel || 'Staff',
      subject: messageForm.subject || 'Message',
      content: messageForm.message,
    });
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
                      <Avatar>{getAvatarIcon(conversation.counterpartRole)}</Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={conversation.name}
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
                  {selectedConversation.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {selectedConversation.counterpartRole}
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
                    name="recipientId"
                    value={messageForm.recipientId}
                    onChange={handleMessageFormChange}
                    label="Recipient"
                  >
                    {/* Placeholder for recipient selection */}
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