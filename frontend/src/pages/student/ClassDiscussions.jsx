import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  Tooltip,
  Collapse,
  Alert
} from '@mui/material';
import {
  Send as SendIcon,
  Reply as ReplyIcon,
  ThumbUp as LikeIcon,
  ThumbDown as DislikeIcon,
  MoreVert as MoreIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon
} from '@mui/icons-material';

const ClassDiscussions = () => {
  const [discussions, setDiscussions] = useState([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [expandedReplies, setExpandedReplies] = useState({});

  // Mock data for discussions
  const mockDiscussions = [
    {
      id: 1,
      subject: 'Mathematics',
      title: 'Help with Calculus Problem',
      content: 'I\'m having trouble understanding the chain rule in calculus. Can anyone explain it with a simple example?',
      author: 'John Doe',
      authorAvatar: 'JD',
      timestamp: '2024-01-15T10:30:00',
      likes: 5,
      dislikes: 1,
      replies: [
        {
          id: 1,
          author: 'Jane Smith',
          authorAvatar: 'JS',
          content: 'The chain rule is like a recipe! If you have f(g(x)), the derivative is f\'(g(x)) * g\'(x). Think of it as taking the derivative of the outer function and multiplying by the derivative of the inner function.',
          timestamp: '2024-01-15T11:00:00',
          likes: 3,
          dislikes: 0
        },
        {
          id: 2,
          author: 'Mike Johnson',
          authorAvatar: 'MJ',
          content: 'Great explanation Jane! Here\'s a visual example: if f(x) = sin(x²), then f\'(x) = cos(x²) * 2x',
          timestamp: '2024-01-15T11:15:00',
          likes: 2,
          dislikes: 0
        }
      ],
      tags: ['Calculus', 'Help Needed']
    },
    {
      id: 2,
      subject: 'English',
      title: 'Essay Writing Tips',
      content: 'What are your best tips for writing a compelling introduction paragraph? I always struggle with hooking the reader.',
      author: 'Sarah Wilson',
      authorAvatar: 'SW',
      timestamp: '2024-01-14T14:20:00',
      likes: 8,
      dislikes: 0,
      replies: [
        {
          id: 3,
          author: 'Emily Brown',
          authorAvatar: 'EB',
          content: 'I always start with a surprising fact or statistic related to my topic. It immediately grabs attention!',
          timestamp: '2024-01-14T15:00:00',
          likes: 4,
          dislikes: 0
        }
      ],
      tags: ['Essay Writing', 'Tips']
    },
    {
      id: 3,
      subject: 'Science',
      title: 'Lab Report Discussion',
      content: 'For our chemistry lab on titration, what should we include in the discussion section?',
      author: 'Alex Chen',
      authorAvatar: 'AC',
      timestamp: '2024-01-13T09:45:00',
      likes: 3,
      dislikes: 0,
      replies: [],
      tags: ['Chemistry', 'Lab Report']
    }
  ];

  useEffect(() => {
    setDiscussions(mockDiscussions);
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const reply = {
        id: Date.now(),
        author: 'You',
        authorAvatar: 'YO',
        content: newMessage,
        timestamp: new Date().toISOString(),
        likes: 0,
        dislikes: 0
      };

      setDiscussions(prev => 
        prev.map(discussion => 
          discussion.id === selectedDiscussion.id 
            ? { ...discussion, replies: [...discussion.replies, reply] }
            : discussion
        )
      );

      setNewMessage('');
    }
  };

  const handleLike = (discussionId, replyId = null) => {
    setDiscussions(prev => 
      prev.map(discussion => {
        if (discussion.id === discussionId) {
          if (replyId) {
            return {
              ...discussion,
              replies: discussion.replies.map(reply =>
                reply.id === replyId ? { ...reply, likes: reply.likes + 1 } : reply
              )
            };
          } else {
            return { ...discussion, likes: discussion.likes + 1 };
          }
        }
        return discussion;
      })
    );
  };

  const handleDislike = (discussionId, replyId = null) => {
    setDiscussions(prev => 
      prev.map(discussion => {
        if (discussion.id === discussionId) {
          if (replyId) {
            return {
              ...discussion,
              replies: discussion.replies.map(reply =>
                reply.id === replyId ? { ...reply, dislikes: reply.dislikes + 1 } : reply
              )
            };
          } else {
            return { ...discussion, dislikes: discussion.dislikes + 1 };
          }
        }
        return discussion;
      })
    );
  };

  const handleReply = (discussion) => {
    setSelectedDiscussion(discussion);
    setOpenDialog(true);
  };

  const toggleReplies = (discussionId) => {
    setExpandedReplies(prev => ({
      ...prev,
      [discussionId]: !prev[discussionId]
    }));
  };

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discussion.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === 'all' || discussion.subject === filterSubject;
    return matchesSearch && matchesSubject;
  });

  const subjects = ['all', 'Mathematics', 'English', 'Science', 'History', 'Geography'];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Class Discussions
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Engage with classmates and teachers in academic discussions
        </Typography>
      </Box>

      {/* Search and Filter */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search discussions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter by Subject</InputLabel>
              <Select
                value={filterSubject}
                label="Filter by Subject"
                onChange={(e) => setFilterSubject(e.target.value)}
              >
                {subjects.map(subject => (
                  <MenuItem key={subject} value={subject}>
                    {subject === 'all' ? 'All Subjects' : subject}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              fullWidth
              onClick={() => setOpenDialog(true)}
            >
              New Discussion
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Discussions List */}
      <Grid container spacing={3}>
        {filteredDiscussions.map((discussion) => (
          <Grid item xs={12} key={discussion.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {discussion.authorAvatar}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {discussion.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        by {discussion.author} • {new Date(discussion.timestamp).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip label={discussion.subject} color="primary" size="small" />
                </Box>

                <Typography variant="body1" sx={{ mb: 2 }}>
                  {discussion.content}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  {discussion.tags.map((tag, index) => (
                    <Chip key={index} label={tag} variant="outlined" size="small" />
                  ))}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Button
                    size="small"
                    startIcon={<LikeIcon />}
                    onClick={() => handleLike(discussion.id)}
                  >
                    {discussion.likes}
                  </Button>
                  <Button
                    size="small"
                    startIcon={<DislikeIcon />}
                    onClick={() => handleDislike(discussion.id)}
                  >
                    {discussion.dislikes}
                  </Button>
                  <Button
                    size="small"
                    startIcon={<ReplyIcon />}
                    onClick={() => handleReply(discussion)}
                  >
                    Reply ({discussion.replies.length})
                  </Button>
                  {discussion.replies.length > 0 && (
                    <Button
                      size="small"
                      endIcon={expandedReplies[discussion.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      onClick={() => toggleReplies(discussion.id)}
                    >
                      {expandedReplies[discussion.id] ? 'Hide' : 'Show'} Replies
                    </Button>
                  )}
                </Box>

                {/* Replies */}
                <Collapse in={expandedReplies[discussion.id]}>
                  <Box sx={{ ml: 4, mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Replies ({discussion.replies.length})
                    </Typography>
                    {discussion.replies.map((reply) => (
                      <Paper key={reply.id} sx={{ p: 2, mb: 2, backgroundColor: 'grey.50' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                            {reply.authorAvatar}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {reply.author}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(reply.timestamp).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {reply.content}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            startIcon={<LikeIcon />}
                            onClick={() => handleLike(discussion.id, reply.id)}
                          >
                            {reply.likes}
                          </Button>
                          <Button
                            size="small"
                            startIcon={<DislikeIcon />}
                            onClick={() => handleDislike(discussion.id, reply.id)}
                          >
                            {reply.dislikes}
                          </Button>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Reply Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedDiscussion ? `Reply to: ${selectedDiscussion.title}` : 'New Discussion'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Attach file">
                <IconButton>
                  <AttachFileIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Add image">
                <IconButton>
                  <ImageIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Add video">
                <IconButton>
                  <VideoIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            startIcon={<SendIcon />}
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassDiscussions; 