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
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const StudentCounseling = () => {
  const [sessions, setSessions] = useState([
    {
      id: 1,
      studentName: 'John Doe',
      date: '2024-03-20',
      time: '10:00 AM',
      type: 'Academic',
      status: 'Scheduled',
      notes: 'Initial consultation',
    },
    {
      id: 2,
      studentName: 'Jane Smith',
      date: '2024-03-20',
      time: '11:30 AM',
      type: 'Career',
      status: 'Completed',
      notes: 'Career guidance session',
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [formData, setFormData] = useState({
    studentName: '',
    date: '',
    time: '',
    type: '',
    status: 'Scheduled',
    notes: '',
  });

  const handleOpenDialog = (session = null) => {
    if (session) {
      setSelectedSession(session);
      setFormData(session);
    } else {
      setSelectedSession(null);
      setFormData({
        studentName: '',
        date: '',
        time: '',
        type: '',
        status: 'Scheduled',
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSession(null);
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
    if (selectedSession) {
      // Update existing session
      setSessions((prev) =>
        prev.map((session) =>
          session.id === selectedSession.id ? { ...formData, id: session.id } : session
        )
      );
    } else {
      // Add new session
      setSessions((prev) => [
        ...prev,
        { ...formData, id: Date.now() },
      ]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    setSessions((prev) => prev.filter((session) => session.id !== id));
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4">Student Counseling</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenDialog()}
            >
              Schedule New Session
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
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>{session.studentName}</TableCell>
                    <TableCell>{session.date}</TableCell>
                    <TableCell>{session.time}</TableCell>
                    <TableCell>{session.type}</TableCell>
                    <TableCell>{session.status}</TableCell>
                    <TableCell>{session.notes}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(session)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(session.id)}
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
          {selectedSession ? 'Edit Session' : 'Schedule New Session'}
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
                    <MenuItem value="Scheduled">Scheduled</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
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
            {selectedSession ? 'Update' : 'Schedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentCounseling; 