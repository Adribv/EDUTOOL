import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { staffAPI } from '../../services/api';
import { toast } from 'react-toastify';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
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

const Schedule = () => {
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [formData, setFormData] = useState({
    day: '',
    timeSlot: '',
    subject: '',
    class: '',
    room: '',
  });

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const response = await staffAPI.getSchedule();
      setSchedule(response.data);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = () => {
    setSelectedClass(null);
    setFormData({
      day: '',
      timeSlot: '',
      subject: '',
      class: '',
      room: '',
    });
    setOpenDialog(true);
  };

  const handleEditClass = (classData) => {
    setSelectedClass(classData);
    setFormData(classData);
    setOpenDialog(true);
  };

  const handleDeleteClass = async (classId) => {
    try {
      await staffAPI.deleteClass(classId);
      toast.success('Class deleted successfully');
      fetchSchedule();
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error('Failed to delete class');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveClass = async () => {
    try {
      if (selectedClass) {
        await staffAPI.updateClass(selectedClass.id, formData);
        toast.success('Class updated successfully');
      } else {
        await staffAPI.addClass(formData);
        toast.success('Class added successfully');
      }
      setOpenDialog(false);
      fetchSchedule();
    } catch (error) {
      console.error('Error saving class:', error);
      toast.error('Failed to save class');
    }
  };

  const getClassForTimeSlot = (day, timeSlot) => {
    return schedule.find(
      (item) => item.day === day && item.timeSlot === timeSlot
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Class Schedule
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your teaching schedule
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClass}
        >
          Add Class
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Grid container>
            <Grid item xs={12}>
              <Box sx={{ overflowX: 'auto' }}>
                <Paper sx={{ width: '100%', minWidth: 800 }}>
                  <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider' }}>
                    <Box sx={{ width: 150, p: 2, borderRight: 1, borderColor: 'divider' }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Time
                      </Typography>
                    </Box>
                    {DAYS.map((day) => (
                      <Box
                        key={day}
                        sx={{
                          flex: 1,
                          p: 2,
                          borderRight: 1,
                          borderColor: 'divider',
                          textAlign: 'center',
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="bold">
                          {day}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  {TIME_SLOTS.map((timeSlot) => (
                    <Box
                      key={timeSlot}
                      sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider' }}
                    >
                      <Box
                        sx={{
                          width: 150,
                          p: 2,
                          borderRight: 1,
                          borderColor: 'divider',
                          bgcolor: 'grey.50',
                        }}
                      >
                        <Typography variant="body2">{timeSlot}</Typography>
                      </Box>
                      {DAYS.map((day) => {
                        const classData = getClassForTimeSlot(day, timeSlot);
                        return (
                          <Box
                            key={`${day}-${timeSlot}`}
                            sx={{
                              flex: 1,
                              p: 2,
                              borderRight: 1,
                              borderColor: 'divider',
                              position: 'relative',
                              minHeight: 100,
                            }}
                          >
                            {classData ? (
                              <Box>
                                <Typography variant="subtitle2" gutterBottom>
                                  {classData.subject}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Class: {classData.class}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Room: {classData.room}
                                </Typography>
                                <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                                  <Tooltip title="Edit">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleEditClass(classData)}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleDeleteClass(classData.id)}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Typography variant="body2" color="text.secondary">
                                  No Class
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  ))}
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedClass ? 'Edit Class' : 'Add New Class'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Day"
                name="day"
                value={formData.day}
                onChange={handleInputChange}
              >
                {DAYS.map((day) => (
                  <MenuItem key={day} value={day}>
                    {day}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Time Slot"
                name="timeSlot"
                value={formData.timeSlot}
                onChange={handleInputChange}
              >
                {TIME_SLOTS.map((slot) => (
                  <MenuItem key={slot} value={slot}>
                    {slot}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Class"
                name="class"
                value={formData.class}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Room"
                name="room"
                value={formData.room}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveClass} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Schedule; 