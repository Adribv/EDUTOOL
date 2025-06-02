import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  DirectionsBus,
  LocationOn,
  Phone,
  Email,
  Schedule,
  Map,
  Message,
  Close,
  Warning,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import { parentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Transport = () => {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [transportInfo, setTransportInfo] = useState({});
  const [messageDialog, setMessageDialog] = useState(false);
  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [childrenRes] = await Promise.all([
        parentAPI.getChildren(),
      ]);
      setChildren(childrenRes.data);
      
      // Fetch transport info for each child
      const transportPromises = childrenRes.data.map(child =>
        parentAPI.getChildTransportInfo(child.rollNumber)
      );
      const transportResults = await Promise.all(transportPromises);
      
      const transportMap = {};
      childrenRes.data.forEach((child, index) => {
        transportMap[child.rollNumber] = transportResults[index].data;
      });
      setTransportInfo(transportMap);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load transport information');
    } finally {
      setLoading(false);
    }
  };

  const handleMessageDialogOpen = () => {
    setMessageDialog(true);
  };

  const handleMessageDialogClose = () => {
    setMessageDialog(false);
    setNewMessage({ subject: '', content: '' });
  };

  const handleNewMessageChange = (field) => (event) => {
    setNewMessage({ ...newMessage, [field]: event.target.value });
  };

  const handleSendMessage = async () => {
    try {
      await parentAPI.contactTransportCoordinator(newMessage);
      toast.success('Message sent to transport coordinator');
      handleMessageDialogClose();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'On Time':
        return <Chip label="On Time" color="success" size="small" />;
      case 'Delayed':
        return <Chip label="Delayed" color="warning" size="small" />;
      case 'Not Started':
        return <Chip label="Not Started" color="error" size="small" />;
      default:
        return <Chip label={status} color="default" size="small" />;
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
        Transport Tracking
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DirectionsBus color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Active Routes</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {Object.values(transportInfo).filter(info => info.status === 'Active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Schedule color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Next Pickup</Typography>
              </Box>
              <Typography variant="h4" color="warning">
                {Object.values(transportInfo)[0]?.nextPickupTime || 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOn color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Stops</Typography>
              </Box>
              <Typography variant="h4" color="info">
                {Object.values(transportInfo).reduce((acc, info) => acc + (info.stops?.length || 0), 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transport Details */}
      <Grid container spacing={3}>
        {children.map((child) => (
          <Grid item xs={12} key={child.rollNumber}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {child.firstName} {child.lastName} - Transport Details
                  </Typography>
                  {getStatusChip(transportInfo[child.rollNumber]?.status)}
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <DirectionsBus />
                        </ListItemIcon>
                        <ListItemText
                          primary="Vehicle Details"
                          secondary={`${transportInfo[child.rollNumber]?.vehicleNumber} (${transportInfo[child.rollNumber]?.vehicleType})`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <LocationOn />
                        </ListItemIcon>
                        <ListItemText
                          primary="Route"
                          secondary={`Route ${transportInfo[child.rollNumber]?.routeNumber}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Schedule />
                        </ListItemIcon>
                        <ListItemText
                          primary="Pickup Time"
                          secondary={transportInfo[child.rollNumber]?.pickupTime}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <Phone />
                        </ListItemIcon>
                        <ListItemText
                          primary="Driver Contact"
                          secondary={transportInfo[child.rollNumber]?.driverContact}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <LocationOn />
                        </ListItemIcon>
                        <ListItemText
                          primary="Pickup Stop"
                          secondary={transportInfo[child.rollNumber]?.pickupStop}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <LocationOn />
                        </ListItemIcon>
                        <ListItemText
                          primary="Drop Stop"
                          secondary={transportInfo[child.rollNumber]?.dropStop}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Route Stops
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Stop Name</TableCell>
                          <TableCell>Time</TableCell>
                          <TableCell>Type</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {transportInfo[child.rollNumber]?.stops?.map((stop, index) => (
                          <TableRow key={index}>
                            <TableCell>{stop.name}</TableCell>
                            <TableCell>{stop.time}</TableCell>
                            <TableCell>
                              <Chip
                                label={stop.type}
                                color={stop.type === 'Pickup' ? 'primary' : 'secondary'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Message />}
                    onClick={handleMessageDialogOpen}
                  >
                    Contact Transport Coordinator
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Message Dialog */}
      <Dialog
        open={messageDialog}
        onClose={handleMessageDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Contact Transport Coordinator
          <IconButton
            onClick={handleMessageDialogClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Subject"
              fullWidth
              value={newMessage.subject}
              onChange={handleNewMessageChange('subject')}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Message"
              fullWidth
              multiline
              rows={4}
              value={newMessage.content}
              onChange={handleNewMessageChange('content')}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleMessageDialogClose}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendMessage}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Transport; 