import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Person,
  Send,
  ThumbUp,
  Comment,
  Add,
  Close,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import studentService from '../../services/studentService';

const Forum = () => {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [newPostDialog, setNewPostDialog] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'general',
  });
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentDialog, setCommentDialog] = useState(false);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await studentService.getForumPosts();
      setPosts(response.data);
    } catch {
      toast.error('Failed to load forum posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    try {
      await studentService.createForumPost(newPost);
      toast.success('Post created successfully');
      setNewPostDialog(false);
      setNewPost({
        title: '',
        content: '',
        category: 'general',
      });
      fetchPosts();
    } catch {
      toast.error('Failed to create post');
    }
  };

  const handleAddComment = async () => {
    try {
      await studentService.addForumComment(selectedPost.id, {
        content: newComment,
      });
      toast.success('Comment added successfully');
      setCommentDialog(false);
      setNewComment('');
      fetchPosts();
    } catch {
      toast.error('Failed to add comment');
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await studentService.likeForumPost(postId);
      fetchPosts();
    } catch {
      toast.error('Failed to like post');
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
        <Typography variant="h4">Student Forum</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setNewPostDialog(true)}
        >
          New Post
        </Button>
      </Box>

      <Grid container spacing={3}>
        {posts.map((post) => (
          <Grid item xs={12} key={post.id}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ mr: 2 }}>
                  <Person />
                </Avatar>
                <Box flex={1}>
                  <Typography variant="h6">{post.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Posted by {post.author} on{' '}
                    {new Date(post.date).toLocaleDateString()}
                  </Typography>
                </Box>
                <Chip label={post.category} color="primary" size="small" />
              </Box>

              <Typography variant="body1" paragraph>
                {post.content}
              </Typography>

              <Box display="flex" alignItems="center" mt={2}>
                <Button
                  startIcon={<ThumbUp />}
                  onClick={() => handleLikePost(post.id)}
                  sx={{ mr: 2 }}
                >
                  {post.likes} Likes
                </Button>
                <Button
                  startIcon={<Comment />}
                  onClick={() => {
                    setSelectedPost(post);
                    setCommentDialog(true);
                  }}
                >
                  {post.comments.length} Comments
                </Button>
              </Box>

              {post.comments.length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Comments
                  </Typography>
                  <List>
                    {post.comments.map((comment, index) => (
                      <React.Fragment key={comment.id}>
                        <ListItem alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar>
                              <Person />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={comment.author}
                            secondary={
                              <>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="textPrimary"
                                >
                                  {comment.content}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                  display="block"
                                >
                                  {new Date(comment.date).toLocaleString()}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                        {index < post.comments.length - 1 && (
                          <Divider variant="inset" component="li" />
                        )}
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* New Post Dialog */}
      <Dialog
        open={newPostDialog}
        onClose={() => setNewPostDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Post</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={newPost.title}
            onChange={(e) =>
              setNewPost({ ...newPost, title: e.target.value })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Content"
            value={newPost.content}
            onChange={(e) =>
              setNewPost({ ...newPost, content: e.target.value })
            }
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewPostDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreatePost}
            variant="contained"
            disabled={!newPost.title || !newPost.content}
          >
            Post
          </Button>
        </DialogActions>
      </Dialog>

      {/* Comment Dialog */}
      <Dialog
        open={commentDialog}
        onClose={() => setCommentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Add Comment</Typography>
            <IconButton onClick={() => setCommentDialog(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Your Comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddComment}
            variant="contained"
            disabled={!newComment}
          >
            Comment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Forum; 