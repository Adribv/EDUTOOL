import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      studentName: 'John Doe',
      date: '2024-03-20',
      time: '10:00 AM',
      duration: '45',
      type: 'Academic',
      status: 'Confirmed',
      contactInfo: 'john.doe@email.com',
      notes: 'Initial consultation',
    },
    {
      id: 2,
      studentName: 'Jane Smith',
      date: '2024-03-20',
      time: '11:30 AM',
      duration: '30',
      type: 'Career',
      status: 'Pending',
      contactInfo: 'jane.smith@email.com',
      notes: 'Career guidance session',
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    studentName: '',
    date: '',
    time: '',
    duration: '30',
    type: '',
    status: 'Pending',
    contactInfo: '',
    notes: '',
  });

  const handleOpenDialog = (appointment = null) => {
    if (appointment) {
      setSelectedAppointment(appointment);
      setFormData(appointment);
    } else {
      setSelectedAppointment(null);
      setFormData({
        studentName: '',
        date: '',
        time: '',
        duration: '30',
        type: '',
        status: 'Pending',
        contactInfo: '',
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAppointment(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedAppointment) {
      // Update existing appointment
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === selectedAppointment.id
            ? { ...formData, id: appointment.id }
            : appointment
        )
      );
    } else {
      // Add new appointment
      setAppointments((prev) => [
        ...prev,
        { ...formData, id: Date.now() },
      ]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    setAppointments((prev) => prev.filter((appointment) => appointment.id !== id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4">Appointment Management</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenDialog()}
            >
              Schedule New Appointment
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Duration (min)</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Contact Info</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{appointment.studentName}</TableCell>
                    <TableCell>{appointment.date}</TableCell>
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell>{appointment.duration}</TableCell>
                    <TableCell>{appointment.type}</TableCell>
                    <TableCell>
                      <Chip
                        label={appointment.status}
                        color={getStatusColor(appointment.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{appointment.contactInfo}</TableCell>
                    <TableCell>{appointment.notes}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(appointment)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(appointment.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Student Name"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    label="Type"
                  >
                    <MenuItem value="Academic">Academic</MenuItem>
                    <MenuItem value="Career">Career</MenuItem>
                    <MenuItem value="Personal">Personal</MenuItem>
                    <MenuItem value="Behavioral">Behavioral</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                  >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Confirmed">Confirmed</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Info"
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  multiline
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedAppointment ? 'Update' : 'Schedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppointmentManagement; 