import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Paper,
  CircularProgress,
  IconButton,
  InputAdornment,
  Badge,
} from '@mui/material';
import {
  Send as SendIcon,
  Search as SearchIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { staffAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Messages = () => {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchMessages();
    fetchUsers();
  }, []);

  useEffect(() => {
    filterMessages();
  }, [searchTerm, messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await staffAPI.getMessages();
      setMessages(response.data);
      setFilteredMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await staffAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const filterMessages = () => {
    const filtered = messages.filter(
      (message) =>
        message.sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.receiver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMessages(filtered);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      await staffAPI.sendMessage({
        receiverId: selectedUser.id,
        content: newMessage,
      });
      setNewMessage('');
      fetchMessages();
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const getConversationMessages = () => {
    if (!selectedUser) return [];
    return filteredMessages.filter(
      (message) =>
        (message.sender.id === selectedUser.id ||
          message.receiver.id === selectedUser.id) &&
        (message.sender.id === 'current-user-id' ||
          message.receiver.id === 'current-user-id')
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Messages
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Communicate with students and staff members
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <TextField
                fullWidth
                placeholder="Search messages"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              <List>
                {users.map((user) => (
                  <ListItem
                    key={user.id}
                    button
                    selected={selectedUser?.id === user.id}
                    onClick={() => handleUserSelect(user)}
                  >
                    <ListItemAvatar>
                      <Badge
                        color="success"
                        variant="dot"
                        invisible={!user.online}
                      >
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.name}
                      secondary={user.role}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              {selectedUser ? (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6">
                      {selectedUser.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedUser.role}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      flexGrow: 1,
                      overflow: 'auto',
                      mb: 2,
                      maxHeight: '400px',
                    }}
                  >
                    {getConversationMessages().map((message, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          justifyContent:
                            message.sender.id === 'current-user-id'
                              ? 'flex-end'
                              : 'flex-start',
                          mb: 2,
                        }}
                      >
                        <Paper
                          sx={{
                            p: 2,
                            maxWidth: '70%',
                            backgroundColor:
                              message.sender.id === 'current-user-id'
                                ? 'primary.main'
                                : 'grey.100',
                            color:
                              message.sender.id === 'current-user-id'
                                ? 'white'
                                : 'text.primary',
                          }}
                        >
                          <Typography variant="body1">
                            {message.content}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              mt: 1,
                              color:
                                message.sender.id === 'current-user-id'
                                  ? 'rgba(255, 255, 255, 0.7)'
                                  : 'text.secondary',
                            }}
                          >
                            {new Date(message.timestamp).toLocaleString()}
                          </Typography>
                        </Paper>
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
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
                    <IconButton
                      color="primary"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <SendIcon />
                    </IconButton>
                  </Box>
                </>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    Select a user to start messaging
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Messages; 