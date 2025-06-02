import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Close,
  Edit,
  Delete,
  AccessTime,
  LocationOn,
  School,
  Person,
  Save,
  Cancel,
} from '@mui/icons-material';
import { teacherAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Timetable = () => {
  const [loading, setLoading] = useState(true);
  const [timetable, setTimetable] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedSlot, setEditedSlot] = useState(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [newSlot, setNewSlot] = useState({
    day: 'Monday',
    time: '',
    duration: '',
    subject: '',
    class: '',
    section: '',
    room: '',
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
    '04:00 PM',
  ];

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getTimetable();
      setTimetable(response.data);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSlot = (slot) => {
    setEditedSlot(slot);
    setEditMode(true);
  };

  const handleSaveSlot = async () => {
    try {
      await teacherAPI.updateTimetableSlot(editedSlot.id, editedSlot);
      toast.success('Timetable slot updated successfully');
      setEditMode(false);
      setEditedSlot(null);
      fetchTimetable();
    } catch (error) {
      console.error('Error updating timetable slot:', error);
      toast.error('Failed to update timetable slot');
    }
  };

  const handleCreateSlot = async () => {
    try {
      await teacherAPI.createTimetableSlot(newSlot);
      toast.success('Timetable slot created successfully');
      setCreateDialog(false);
      setNewSlot({
        day: 'Monday',
        time: '',
        duration: '',
        subject: '',
        class: '',
        section: '',
        room: '',
      });
      fetchTimetable();
    } catch (error) {
      console.error('Error creating timetable slot:', error);
      toast.error('Failed to create timetable slot');
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (window.confirm('Are you sure you want to delete this timetable slot?')) {
      try {
        await teacherAPI.deleteTimetableSlot(slotId);
        toast.success('Timetable slot deleted successfully');
        fetchTimetable();
      } catch (error) {
        console.error('Error deleting timetable slot:', error);
        toast.error('Failed to delete timetable slot');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedSlot(null);
  };

  const getSlotForDayAndTime = (day, time) => {
    return timetable.find(slot => slot.day === day && slot.time === time);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Timetable
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialog(true)}
        >
          Add Slot
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              {days.map((day) => (
                <TableCell key={day}>{day}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {timeSlots.map((time) => (
              <TableRow key={time}>
                <TableCell>{time}</TableCell>
                {days.map((day) => {
                  const slot = getSlotForDayAndTime(day, time);
                  return (
                    <TableCell key={`${day}-${time}`}>
                      {slot ? (
                        <Card
                          sx={{
                            bgcolor: 'primary.light',
                            color: 'primary.contrastText',
                            '&:hover': {
                              bgcolor: 'primary.main',
                            },
                          }}
                        >
                          <CardContent sx={{ p: 1 }}>
                            <Typography variant="subtitle2">
                              {slot.subject}
                            </Typography>
                            <Typography variant="caption" display="block">
                              {slot.class} {slot.section}
                            </Typography>
                            <Typography variant="caption" display="block">
                              Room {slot.room}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditSlot(slot)}
                                  sx={{ color: 'inherit' }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteSlot(slot.id)}
                                  sx={{ color: 'inherit' }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </CardContent>
                        </Card>
                      ) : null}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Slot Dialog */}
      <Dialog
        open={editMode}
        onClose={handleCancelEdit}
        maxWidth="sm"
        fullWidth
      >
        {editedSlot && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Edit Timetable Slot</Typography>
                <IconButton onClick={handleCancelEdit}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Day</InputLabel>
                    <Select
                      value={editedSlot.day}
                      label="Day"
                      onChange={(e) => setEditedSlot({ ...editedSlot, day: e.target.value })}
                    >
                      {days.map((day) => (
                        <MenuItem key={day} value={day}>{day}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Time</InputLabel>
                    <Select
                      value={editedSlot.time}
                      label="Time"
                      onChange={(e) => setEditedSlot({ ...editedSlot, time: e.target.value })}
                    >
                      {timeSlots.map((time) => (
                        <MenuItem key={time} value={time}>{time}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Duration"
                    fullWidth
                    value={editedSlot.duration}
                    onChange={(e) => setEditedSlot({ ...editedSlot, duration: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Subject"
                    fullWidth
                    value={editedSlot.subject}
                    onChange={(e) => setEditedSlot({ ...editedSlot, subject: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Class"
                    fullWidth
                    value={editedSlot.class}
                    onChange={(e) => setEditedSlot({ ...editedSlot, class: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Section"
                    fullWidth
                    value={editedSlot.section}
                    onChange={(e) => setEditedSlot({ ...editedSlot, section: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Room"
                    fullWidth
                    value={editedSlot.room}
                    onChange={(e) => setEditedSlot({ ...editedSlot, room: e.target.value })}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelEdit}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleSaveSlot}
              >
                Save Changes
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create Slot Dialog */}
      <Dialog
        open={createDialog}
        onClose={() => setCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Add Timetable Slot</Typography>
            <IconButton onClick={() => setCreateDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Day</InputLabel>
                <Select
                  value={newSlot.day}
                  label="Day"
                  onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                >
                  {days.map((day) => (
                    <MenuItem key={day} value={day}>{day}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Time</InputLabel>
                <Select
                  value={newSlot.time}
                  label="Time"
                  onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
                >
                  {timeSlots.map((time) => (
                    <MenuItem key={time} value={time}>{time}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Duration"
                fullWidth
                value={newSlot.duration}
                onChange={(e) => setNewSlot({ ...newSlot, duration: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Subject"
                fullWidth
                value={newSlot.subject}
                onChange={(e) => setNewSlot({ ...newSlot, subject: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Class"
                fullWidth
                value={newSlot.class}
                onChange={(e) => setNewSlot({ ...newSlot, class: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Section"
                fullWidth
                value={newSlot.section}
                onChange={(e) => setNewSlot({ ...newSlot, section: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Room"
                fullWidth
                value={newSlot.room}
                onChange={(e) => setNewSlot({ ...newSlot, room: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateSlot}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Timetable; 