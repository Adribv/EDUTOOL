import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Announcement,
  Message,
  Send,
  Email,
  Phone,
  Person,
  Subject,
  Close,
  Notifications,
  Schedule,
} from '@mui/icons-material';
import { studentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Communication = () => {
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [announcementDialog, setAnnouncementDialog] = useState(false);
  const [messageDialog, setMessageDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [messageData, setMessageData] = useState({
    subject: '',
    message: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [announcementsRes, teachersRes] = await Promise.all([
        studentAPI.getAnnouncements(),
        studentAPI.getTeachers(),
      ]);

      setAnnouncements(announcementsRes.data);
      setTeachers(teachersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load communication data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
    setAnnouncementDialog(true);
  };

  const handleSendMessage = (teacher) => {
    setSelectedTeacher(teacher);
    setMessageData({ subject: '', message: '' });
    setMessageDialog(true);
  };

  const handleSubmitMessage = async () => {
    try {
      await studentAPI.sendMessage({
        teacherId: selectedTeacher.id,
        ...messageData,
      });
      toast.success('Message sent successfully');
      setMessageDialog(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const getAnnouncementIcon = (type) => {
    switch (type) {
      case 'general':
        return <Announcement />;
      case 'exam':
        return <Schedule />;
      case 'event':
        return <Notifications />;
      default:
        return <Announcement />;
    }
  };

  const getAnnouncementType = (type) => {
    switch (type) {
      case 'general':
        return 'General';
      case 'exam':
        return 'Exam';
      case 'event':
        return 'Event';
      default:
        return type;
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
        Communication
      </Typography>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
        >
          <Tab icon={<Announcement />} label="Announcements" />
          <Tab icon={<Message />} label="Contact Teachers" />
        </Tabs>
      </Box>

      {/* Announcements Tab */}
      {selectedTab === 0 && (
        <List>
          {announcements.map((announcement) => (
            <Card key={announcement.id} sx={{ mb: 2 }}>
              <CardContent>
                <ListItem>
                  <ListItemIcon>
                    {getAnnouncementIcon(announcement.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={announcement.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {announcement.content}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip
                            size="small"
                            label={getAnnouncementType(announcement.type)}
                            sx={{ mr: 1 }}
                          />
                          <Chip
                            size="small"
                            label={new Date(
                              announcement.date
                            ).toLocaleDateString()}
                          />
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleViewAnnouncement(announcement)}
                    >
                      <Message />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </CardContent>
            </Card>
          ))}
        </List>
      )}

      {/* Contact Teachers Tab */}
      {selectedTab === 1 && (
        <Grid container spacing={3}>
          {teachers.map((teacher) => (
            <Grid item xs={12} sm={6} md={4} key={teacher.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Person sx={{ mr: 1 }} />
                    <Typography variant="h6">{teacher.name}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {teacher.subject}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Email />}
                      onClick={() => window.location.href = `mailto:${teacher.email}`}
                      sx={{ mr: 1 }}
                    >
                      Email
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Message />}
                      onClick={() => handleSendMessage(teacher)}
                    >
                      Message
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Announcement Dialog */}
      <Dialog
        open={announcementDialog}
        onClose={() => setAnnouncementDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {selectedAnnouncement && (
              <>
                {getAnnouncementIcon(selectedAnnouncement.type)}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {selectedAnnouncement.title}
                </Typography>
              </>
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedAnnouncement && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" paragraph>
                {selectedAnnouncement.content}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Chip
                  icon={<Schedule />}
                  label={`Posted on ${new Date(
                    selectedAnnouncement.date
                  ).toLocaleDateString()}`}
                  sx={{ mr: 1 }}
                />
                <Chip
                  icon={getAnnouncementIcon(selectedAnnouncement.type)}
                  label={getAnnouncementType(selectedAnnouncement.type)}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnnouncementDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Message Dialog */}
      <Dialog
        open={messageDialog}
        onClose={() => setMessageDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Message sx={{ mr: 1 }} />
            <Typography variant="h6">
              Message to {selectedTeacher?.name}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Subject"
              value={messageData.subject}
              onChange={(e) =>
                setMessageData({ ...messageData, subject: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={4}
              value={messageData.message}
              onChange={(e) =>
                setMessageData({ ...messageData, message: e.target.value })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMessageDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={handleSubmitMessage}
            disabled={!messageData.subject || !messageData.message}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Communication; 