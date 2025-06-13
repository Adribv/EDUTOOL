import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Divider,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  School as SchoolIcon,
} from '@mui/icons-material';

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'academic',
      title: 'Exam Schedule Released',
      message: 'The final exam schedule for your child has been released. Please check the academic calendar.',
      date: '2024-03-20',
      read: false,
      priority: 'high',
    },
    {
      id: 2,
      type: 'attendance',
      title: 'Attendance Alert',
      message: 'Your child was absent from school on March 19, 2024.',
      date: '2024-03-19',
      read: true,
      priority: 'medium',
    },
    {
      id: 3,
      type: 'event',
      title: 'Parent-Teacher Meeting',
      message: 'Parent-teacher meeting is scheduled for March 25, 2024, at 2:00 PM.',
      date: '2024-03-18',
      read: false,
      priority: 'high',
    },
    {
      id: 4,
      type: 'fee',
      title: 'Fee Payment Reminder',
      message: 'The quarterly fee payment is due by March 31, 2024.',
      date: '2024-03-17',
      read: false,
      priority: 'medium',
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const handleOpenDialog = (notification) => {
    setSelectedNotification(notification);
    setOpenDialog(true);
    // Mark as read when opened
    if (!notification.read) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, read: true } : n
        )
      );
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedNotification(null);
  };

  const handleDelete = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'academic':
        return <SchoolIcon color="primary" />;
      case 'attendance':
        return <WarningIcon color="warning" />;
      case 'event':
        return <InfoIcon color="info" />;
      case 'fee':
        return <CheckCircleIcon color="success" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Notifications</Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleMarkAllRead}
        >
          Mark All as Read
        </Button>
      </Box>

      <Paper>
        <List>
          {notifications.map((notification, index) => (
            <Box key={notification.id}>
              <ListItem
                alignItems="flex-start"
                sx={{
                  bgcolor: notification.read ? 'inherit' : 'action.hover',
                }}
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">
                        {notification.title}
                      </Typography>
                      <Chip
                        label={notification.priority}
                        size="small"
                        color={getPriorityColor(notification.priority)}
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {notification.message}
                      </Typography>
                      <br />
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                      >
                        {notification.date}
                      </Typography>
                    </>
                  }
                />
                <Box>
                  <IconButton
                    edge="end"
                    onClick={() => handleOpenDialog(notification)}
                  >
                    <InfoIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleDelete(notification.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </ListItem>
              {index < notifications.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedNotification?.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              {selectedNotification?.message}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Date: {selectedNotification?.date}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Notifications; 