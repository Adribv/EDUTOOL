import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, CardHeader, Grid, Chip, Avatar, 
  List, ListItem, ListItemText, ListItemAvatar, Divider, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, ToggleButton, ToggleButtonGroup, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControl, InputLabel,
  Select, MenuItem, Alert, Skeleton, LinearProgress
} from '@mui/material';
import {
  Schedule, AccessTime, LocationOn, Class, Event, Add, Edit, Delete,
  ViewWeek, ViewDay, Apps, CalendarToday, School, Book
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherAPI } from '../../services/api';
import { toast } from 'react-toastify';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Timetable() {
  const [viewMode, setViewMode] = useState('week');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [addClassDialog, setAddClassDialog] = useState(false);
  const [newClassForm, setNewClassForm] = useState({
    day: 'Monday',
    time: '',
    subject: '',
    class: '',
    section: '',
    room: ''
  });

  const queryClient = useQueryClient();

  const { data: timetableData, isLoading, error } = useQuery({
    queryKey: ['timetable'],
    queryFn: () => teacherAPI.getTimetable()
  });

  // Add class mutation
  const addClassMutation = useMutation({
    mutationFn: (newClass) => teacherAPI.addTimetableEntry(newClass),
    onSuccess: () => {
      queryClient.invalidateQueries(['timetable']);
      toast.success('Class added successfully');
      setAddClassDialog(false);
      setNewClassForm({
        day: 'Monday',
        time: '',
        subject: '',
        class: '',
        section: '',
        room: ''
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add class');
    }
  });

  const handleAddClass = () => {
    if (!newClassForm.day || !newClassForm.time) {
      toast.error('Please fill in day and time');
      return;
    }
    addClassMutation.mutate(newClassForm);
  };

  const handleInputChange = (field, value) => {
    setNewClassForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5].map((item) => (
            <Grid item xs={12} md={6} key={item}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Failed to load timetable data</Alert>;
  }

  const timetable = Array.isArray(timetableData?.data) ? timetableData.data : [];

  const getClassesForDay = (day) => {
    return Array.isArray(timetable) ? timetable.filter(item => item.day === day) : [];
  };

  const getTimeSlots = () => {
    const slots = [
      '8:00 AM - 9:30 AM',
      '9:30 AM - 11:00 AM', 
      '11:00 AM - 12:30 PM',
      '12:30 PM - 2:00 PM',
      '2:00 PM - 3:30 PM',
      '3:30 PM - 5:00 PM'
    ];
    return slots;
  };

  const renderWeekView = () => (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="Weekly Schedule" 
          action={
            <Box display="flex" gap={1}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                size="small"
              >
                <ToggleButton value="week">
                  <ViewWeek />
                </ToggleButton>
                <ToggleButton value="day">
                  <ViewDay />
                </ToggleButton>
                <ToggleButton value="list">
                  <Apps />
                </ToggleButton>
              </ToggleButtonGroup>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={() => setAddClassDialog(true)}
              >
                Add Class
              </Button>
            </Box>
          }
        />
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  {daysOfWeek.slice(0, 5).map(day => (
                    <TableCell key={day} align="center">
                      <Typography variant="subtitle2">{day}</Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {getTimeSlots().map(timeSlot => (
                  <TableRow key={timeSlot}>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {timeSlot}
                      </Typography>
                    </TableCell>
                    {daysOfWeek.slice(0, 5).map(day => {
                      const classData = getClassesForDay(day).find(cls => 
                        cls.time === timeSlot
                      );
                      return (
                        <TableCell key={day} align="center">
                          {classData ? (
                            <Card 
                              sx={{ 
                                p: 1, 
                                cursor: 'pointer',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                '&:hover': { transform: 'scale(1.02)', transition: 'transform 0.2s' }
                              }}
                              onClick={() => {
                                setSelectedSlot(classData);
                                setDialogOpen(true);
                              }}
                            >
                              <Typography variant="caption" display="block">
                                {classData.subject}
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {classData.class}-{classData.section}
                              </Typography>
                              <Typography variant="caption" display="block">
                                {classData.room}
                              </Typography>
                            </Card>
                          ) : (
                            <Box 
                              sx={{ 
                                height: 60, 
                                border: '1px dashed #ccc',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 1
                              }}
                            >
                              <Typography variant="caption" color="textSecondary">
                                Free
                              </Typography>
                            </Box>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );

  const renderDayView = () => (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title={`${selectedDay} Schedule`}
          action={
            <Box display="flex" gap={1}>
              <FormControl size="small">
                <Select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                >
                  {daysOfWeek.map(day => (
                    <MenuItem key={day} value={day}>{day}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={() => setAddClassDialog(true)}
              >
                Add Class
              </Button>
            </Box>
          }
        />
        <CardContent>
          <List>
            {getClassesForDay(selectedDay).map((classData, index) => (
              <Box key={classData.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Class />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h6">{classData.subject}</Typography>
                        <Chip label={`${classData.class}-${classData.section}`} size="small" color="primary" />
                      </Box>
                    }
                    secondary={
                      <>
                        <Box display="flex" alignItems="center" gap={2} mt={1}>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <AccessTime fontSize="small" color="action" />
                            <Typography variant="body2">{classData.time}</Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <LocationOn fontSize="small" color="action" />
                            <Typography variant="body2">{classData.room}</Typography>
                          </Box>
                        </Box>
                      </>
                    }
                  />
                  <Box display="flex" gap={1}>
                    <IconButton size="small" color="primary">
                      <Edit />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <Delete />
                    </IconButton>
                  </Box>
                </ListItem>
                {index < getClassesForDay(selectedDay).length - 1 && <Divider variant="inset" component="li" />}
              </Box>
            ))}
            {getClassesForDay(selectedDay).length === 0 && (
              <ListItem>
                <ListItemText
                  primary="No classes scheduled"
                  secondary="Add a class to get started"
                />
              </ListItem>
            )}
          </List>
        </CardContent>
      </Card>
    </Box>
  );

  const renderListView = () => (
    <Box>
      <Card>
        <CardHeader 
          title="All Classes" 
          action={
            <Button 
              variant="contained" 
              startIcon={<Add />}
              onClick={() => setAddClassDialog(true)}
            >
              Add Class
            </Button>
          }
        />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Day</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Room</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timetable.map((classData) => (
                  <TableRow key={classData.id} hover>
                    <TableCell>
                      <Chip 
                        label={classData.day} 
                        color="primary" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{classData.time}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <School color="primary" fontSize="small" />
                        <Typography variant="body2">{classData.subject}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{classData.class}-{classData.section}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2">{classData.room}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton size="small" color="primary">
                          <Edit />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );

  const renderContent = () => {
    switch (viewMode) {
      case 'week':
        return renderWeekView();
      case 'day':
        return renderDayView();
      case 'list':
        return renderListView();
      default:
        return renderWeekView();
    }
  };

  return (
    <Box>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {Array.isArray(timetable) ? timetable.length : 0}
                  </Typography>
                  <Typography variant="body2">Total Classes</Typography>
                </Box>
                <Schedule sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {Array.isArray(timetable) ? new Set(timetable.map(t => t.day)).size : 0}
                  </Typography>
                  <Typography variant="body2">Active Days</Typography>
                </Box>
                <CalendarToday sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {Array.isArray(timetable) ? new Set(timetable.map(t => t.subject)).size : 0}
                  </Typography>
                  <Typography variant="body2">Subjects</Typography>
                </Box>
                <Book sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {Array.isArray(timetable) ? new Set(timetable.map(t => `${t.class}-${t.section}`)).size : 0}
                  </Typography>
                  <Typography variant="body2">Different Classes</Typography>
                </Box>
                <Class sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      {renderContent()}

      {/* Class Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Class Details</DialogTitle>
        <DialogContent>
          {selectedSlot && (
            <Box>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary">
                    {selectedSlot.subject}
                  </Typography>
                  <Typography variant="body1">
                    {selectedSlot.class}-{selectedSlot.section}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AccessTime color="action" />
                    <Typography variant="body2">{selectedSlot.time}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LocationOn color="action" />
                    <Typography variant="body2">{selectedSlot.room}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Event color="action" />
                    <Typography variant="body2">{selectedSlot.day}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<Edit />}>
            Edit Class
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Class Dialog */}
      <Dialog 
        open={addClassDialog} 
        onClose={() => setAddClassDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Class</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Day</InputLabel>
                <Select
                  value={newClassForm.day}
                  onChange={(e) => handleInputChange('day', e.target.value)}
                  label="Day"
                >
                  {daysOfWeek.slice(0, 5).map(day => (
                    <MenuItem key={day} value={day}>{day}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Time Slot</InputLabel>
                <Select
                  value={newClassForm.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  label="Time Slot"
                >
                  {getTimeSlots().map(slot => (
                    <MenuItem key={slot} value={slot}>{slot}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Subject"
                value={newClassForm.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="e.g., Mathematics"
                helperText="Enter the subject for this class"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Class (Optional - uses your assigned class)"
                value={newClassForm.class}
                onChange={(e) => handleInputChange('class', e.target.value)}
                placeholder="e.g., 10 (leave empty for default)"
                helperText="Leave empty to use your assigned class"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Section (Optional - uses your assigned section)"
                value={newClassForm.section}
                onChange={(e) => handleInputChange('section', e.target.value)}
                placeholder="e.g., A (leave empty for default)"
                helperText="Leave empty to use your assigned section"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Room"
                value={newClassForm.room}
                onChange={(e) => handleInputChange('room', e.target.value)}
                placeholder="e.g., Room 101"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddClassDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAddClass}
            disabled={addClassMutation.isPending}
          >
            {addClassMutation.isPending ? 'Adding...' : 'Add Class'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 