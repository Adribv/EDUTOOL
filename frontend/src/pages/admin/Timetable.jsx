import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  '8:00 AM - 9:00 AM',
  '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 1:00 PM',
  '1:00 PM - 2:00 PM',
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM',
];

const Timetable = () => {
  const [loading, setLoading] = useState(true);
  const [timetable, setTimetable] = useState({});
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({
    day: '',
    timeSlot: '',
    subjectId: '',
    teacherId: '',
    room: '',
  });

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchTimetable();
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const response = await adminAPI.getClasses();
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await adminAPI.getSubjects();
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await adminAPI.getTeachers();
      setTeachers(response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to load teachers');
    }
  };

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getTimetable(selectedClass);
      setTimetable(response.data);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
  };

  const handleOpenDialog = (day, timeSlot, slot = null) => {
    setSelectedSlot(slot);
    setFormData({
      day,
      timeSlot,
      subjectId: slot?.subjectId || '',
      teacherId: slot?.teacherId || '',
      room: slot?.room || '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSlot(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (selectedSlot) {
        await adminAPI.updateTimetableSlot(selectedClass, selectedSlot.id, formData);
        toast.success('Timetable slot updated successfully');
      } else {
        await adminAPI.createTimetableSlot(selectedClass, formData);
        toast.success('Timetable slot added successfully');
      }
      handleCloseDialog();
      fetchTimetable();
    } catch (error) {
      console.error('Error saving timetable slot:', error);
      toast.error('Failed to save timetable slot');
    }
  };

  const handleDelete = async (slotId) => {
    if (window.confirm('Are you sure you want to delete this timetable slot?')) {
      try {
        await adminAPI.deleteTimetableSlot(selectedClass, slotId);
        toast.success('Timetable slot deleted successfully');
        fetchTimetable();
      } catch (error) {
        console.error('Error deleting timetable slot:', error);
        toast.error('Failed to delete timetable slot');
      }
    }
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject ? subject.name : 'N/A';
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'N/A';
  };

  const getSlotContent = (day, timeSlot) => {
    const slot = timetable[day]?.[timeSlot];
    if (!slot) return null;

    return (
      <Box>
        <Typography variant="subtitle2">{getSubjectName(slot.subjectId)}</Typography>
        <Typography variant="body2" color="text.secondary">
          {getTeacherName(slot.teacherId)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Room: {slot.room}
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => handleOpenDialog(day, timeSlot, slot)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => handleDelete(slot.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Timetable Management</Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Select Class</InputLabel>
          <Select
            value={selectedClass}
            onChange={handleClassChange}
            label="Select Class"
          >
            {classes.map((classItem) => (
              <MenuItem key={classItem.id} value={classItem.id}>
                {classItem.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : selectedClass ? (
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', mb: 2 }}>
                <Box sx={{ width: 150 }} />
                {DAYS.map((day) => (
                  <Box
                    key={day}
                    sx={{
                      flex: 1,
                      textAlign: 'center',
                      fontWeight: 'bold',
                      p: 1,
                      borderBottom: '2px solid',
                      borderColor: 'primary.main',
                    }}
                  >
                    {day}
                  </Box>
                ))}
              </Box>
            </Grid>
            {TIME_SLOTS.map((timeSlot) => (
              <Grid item xs={12} key={timeSlot}>
                <Box sx={{ display: 'flex' }}>
                  <Box
                    sx={{
                      width: 150,
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      fontWeight: 'bold',
                    }}
                  >
                    {timeSlot}
                  </Box>
                  {DAYS.map((day) => (
                    <Box
                      key={`${day}-${timeSlot}`}
                      sx={{
                        flex: 1,
                        p: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        minHeight: 100,
                        position: 'relative',
                      }}
                    >
                      {getSlotContent(day, timeSlot) || (
                        <Button
                          startIcon={<AddIcon />}
                          onClick={() => handleOpenDialog(day, timeSlot)}
                          sx={{ height: '100%', width: '100%' }}
                        >
                          Add Slot
                        </Button>
                      )}
                    </Box>
                  ))}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Please select a class to view and manage its timetable
          </Typography>
        </Paper>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedSlot ? 'Edit Timetable Slot' : 'Add Timetable Slot'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                {formData.day} - {formData.timeSlot}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Subject</InputLabel>
                <Select
                  name="subjectId"
                  value={formData.subjectId}
                  onChange={handleInputChange}
                  label="Subject"
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Teacher</InputLabel>
                <Select
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={handleInputChange}
                  label="Teacher"
                >
                  {teachers.map((teacher) => (
                    <MenuItem key={teacher.id} value={teacher.id}>
                      {teacher.firstName} {teacher.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Room"
                name="room"
                value={formData.room}
                onChange={handleInputChange}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedSlot ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Timetable; 