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
  ListItemIcon,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from '@mui/material';
import {
  DirectionsBus,
  LocationOn,
  AccessTime,
  Person,
  Phone,
  Edit,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import studentService from '../../services/studentService';

const Transport = () => {
  const [loading, setLoading] = useState(true);
  const [transportDetails, setTransportDetails] = useState(null);
  const [routeDetails, setRouteDetails] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [editData, setEditData] = useState({
    pickupPoint: '',
    emergencyContact: '',
  });

  useEffect(() => {
    fetchTransportDetails();
  }, []);

  const fetchTransportDetails = async () => {
    try {
      const [transportResponse, routeResponse] = await Promise.all([
        studentService.getTransportDetails(),
        studentService.getRouteDetails(),
      ]);
      setTransportDetails(transportResponse.data);
      setRouteDetails(routeResponse.data);
    } catch {
      toast.error('Failed to load transport details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDetails = async () => {
    try {
      await studentService.updateTransportDetails(editData);
      toast.success('Transport details updated successfully');
      setEditDialog(false);
      fetchTransportDetails();
    } catch {
      toast.error('Failed to update transport details');
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
      <Typography variant="h4" gutterBottom>
        Transport Details
      </Typography>

      <Grid container spacing={3}>
        {/* Transport Details */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Your Transport Information</Typography>
              <Button
                startIcon={<Edit />}
                onClick={() => {
                  setEditData({
                    pickupPoint: transportDetails.pickupPoint,
                    emergencyContact: transportDetails.emergencyContact,
                  });
                  setEditDialog(true);
                }}
              >
                Edit
              </Button>
            </Box>

            <List>
              <ListItem>
                <ListItemIcon>
                  <DirectionsBus color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Bus Number"
                  secondary={transportDetails.busNumber}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <LocationOn color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Pickup Point"
                  secondary={transportDetails.pickupPoint}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <AccessTime color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Pickup Time"
                  secondary={transportDetails.pickupTime}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <Person color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Driver Name"
                  secondary={transportDetails.driverName}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <Phone color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Driver Contact"
                  secondary={transportDetails.driverContact}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Route Details */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Route Information
            </Typography>

            <List>
              {routeDetails.stops.map((stop, index) => (
                <React.Fragment key={stop.id}>
                  <ListItem>
                    <ListItemIcon>
                      <LocationOn color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={stop.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Arrival Time: {stop.arrivalTime}
                          </Typography>
                          <Box mt={1}>
                            {stop.students.map((student) => (
                              <Chip
                                key={student.id}
                                label={student.name}
                                size="small"
                                sx={{ mr: 1, mb: 1 }}
                              />
                            ))}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < routeDetails.stops.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Transport Details</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Pickup Point"
            value={editData.pickupPoint}
            onChange={(e) =>
              setEditData({ ...editData, pickupPoint: e.target.value })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Emergency Contact"
            value={editData.emergencyContact}
            onChange={(e) =>
              setEditData({ ...editData, emergencyContact: e.target.value })
            }
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateDetails}
            variant="contained"
            disabled={!editData.pickupPoint || !editData.emergencyContact}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Transport; 