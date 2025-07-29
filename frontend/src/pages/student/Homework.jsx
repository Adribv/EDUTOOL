import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Container,
} from '@mui/material';
import {
  Assignment,
  Book,
  Schedule,
  Grade,
  Upload,
  CheckCircle,
  Warning,
  Pending,
} from '@mui/icons-material';
import studentService from '../../services/studentService';
import { toast } from 'react-toastify';

const Homework = () => {
  const [loading, setLoading] = useState(true);
  const [homework, setHomework] = useState([]);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submissionData, setSubmissionData] = useState({
    content: '',
    attachments: [],
  });

  useEffect(() => {
    fetchHomework();
  }, []);

  const fetchHomework = async () => {
    try {
      setLoading(true);
      const response = await studentService.getHomework();
      setHomework(response.data || []);
    } catch (error) {
      console.error('Error fetching homework:', error);
      toast.error('Failed to load homework');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitHomework = async () => {
    try {
      await studentService.submitHomework(selectedHomework.id, submissionData);
      toast.success('Homework submitted successfully');
      setSubmitDialogOpen(false);
      setSelectedHomework(null);
      setSubmissionData({ content: '', attachments: [] });
      fetchHomework();
    } catch (error) {
      console.error('Error submitting homework:', error);
      toast.error('Failed to submit homework');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'pending':
        return <Pending color="warning" />;
      case 'overdue':
        return <Warning color="error" />;
      default:
        return <Assignment color="primary" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
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
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          Homework Management
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
          View and submit your homework assignments
        </Typography>

        <Grid container spacing={3}>
          {homework.map((item) => (
            <Grid item xs={12} md={6} lg={4} key={item.id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    {getStatusIcon(item.status)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {item.title}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {item.description}
                  </Typography>
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body2">
                      <Schedule sx={{ fontSize: 16, mr: 0.5 }} />
                      Due: {new Date(item.dueDate).toLocaleDateString()}
                    </Typography>
                    <Chip
                      label={item.status}
                      color={getStatusColor(item.status)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary">
                    Subject: {item.subject}
                  </Typography>
                  
                  {item.grade && (
                    <Box display="flex" alignItems="center" mt={1}>
                      <Grade sx={{ fontSize: 16, mr: 0.5 }} />
                      <Typography variant="body2">
                        Grade: {item.grade}%
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => {
                      setSelectedHomework(item);
                      // Fetch homework details
                      studentService.getHomeworkDetails(item.id)
                        .then(response => {
                          setSelectedHomework({ ...item, ...response.data });
                        })
                        .catch(error => {
                          console.error('Error fetching homework details:', error);
                        });
                    }}
                  >
                    View Details
                  </Button>
                  
                  {item.status === 'pending' && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => {
                        setSelectedHomework(item);
                        setSubmitDialogOpen(true);
                      }}
                    >
                      Submit
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {homework.length === 0 && (
          <Box textAlign="center" py={4}>
            <Book sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              No homework assignments found
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Check back later for new assignments
            </Typography>
          </Box>
        )}

        {/* Submit Homework Dialog */}
        <Dialog
          open={submitDialogOpen}
          onClose={() => setSubmitDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Submit Homework: {selectedHomework?.title}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Your Answer"
              value={submissionData.content}
              onChange={(e) => setSubmissionData({ ...submissionData, content: e.target.value })}
              sx={{ mt: 2 }}
            />
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Upload />}
                component="label"
              >
                Upload Files
                <input
                  type="file"
                  hidden
                  multiple
                  onChange={(e) => {
                    setSubmissionData({
                      ...submissionData,
                      attachments: Array.from(e.target.files)
                    });
                  }}
                />
              </Button>
              {submissionData.attachments.length > 0 && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {submissionData.attachments.length} file(s) selected
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSubmitDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitHomework}
              variant="contained"
              disabled={!submissionData.content.trim()}
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Homework; 