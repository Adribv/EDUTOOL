import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Button,
  Paper,
  Divider,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { studentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getMessages();
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTeacher) return;

    try {
      await studentAPI.sendMessage({
        teacherId: selectedTeacher._id,
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
          Communicate with your teachers
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Paper sx={{ flex: 1, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Teachers
          </Typography>
          <List>
            {messages.map((message) => (
              <ListItem
                key={message.teacher._id}
                button
                selected={selectedTeacher?._id === message.teacher._id}
                onClick={() => setSelectedTeacher(message.teacher)}
              >
                <ListItemAvatar>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={message.teacher.name}
                  secondary={message.lastMessage}
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        <Paper sx={{ flex: 2, p: 2, display: 'flex', flexDirection: 'column' }}>
          {selectedTeacher ? (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6">
                  {selectedTeacher.name}
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
                {messages
                  .find((m) => m.teacher._id === selectedTeacher._id)
                  ?.messages.map((message, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        justifyContent: message.isFromStudent ? 'flex-end' : 'flex-start',
                        mb: 1,
                      }}
                    >
                      <Paper
                        sx={{
                          p: 1,
                          maxWidth: '70%',
                          bgcolor: message.isFromStudent ? 'primary.light' : 'grey.100',
                          color: message.isFromStudent ? 'white' : 'text.primary',
                        }}
                      >
                        <Typography variant="body1">{message.content}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(message.timestamp).toLocaleString()}
                        </Typography>
                      </Paper>
                    </Box>
                  ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Type your message..."
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
                Select a teacher to start messaging
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Messages; 