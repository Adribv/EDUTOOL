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
  ViewWeek, ViewDay, Apps, CalendarToday, School, Book, Person
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { studentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Timetable() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('week');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Debug user information
  console.log('👤 Student user info:', user);
  
  // Test API connection
  React.useEffect(() => {
    if (user) {
      console.log('🔍 Testing API connection...');
      fetch('https://api.edulives.com/api/students/timetable', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(response => {
        console.log('🌐 Raw fetch response status:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('🌐 Raw fetch response data:', data);
      })
      .catch(err => {
        console.error('🌐 Raw fetch error:', err);
      });
    }
  }, [user]);

  const { data: timetableData, isLoading, error } = useQuery({
    queryKey: ['studentTimetable'],
    queryFn: async () => {
      console.log('🔍 Fetching timetable for student:', user?.name, 'Class:', user?.class, 'Section:', user?.section);
      try {
        const response = await studentAPI.getTimetable();
        console.log('📅 Raw API response:', response);
        return response;
      } catch (err) {
        console.error('❌ API call failed:', err);
        throw err;
      }
    },
    enabled: !!user,
    retry: 1,
    retryDelay: 1000
  });

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
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load timetable data: {error.message}
        </Alert>
        <Card>
          <CardContent>
            <Typography variant="h6" color="textSecondary">
              Debug Information
            </Typography>
            <Typography variant="body2">
              User: {user?.name || 'Unknown'} ({user?.email || 'No email'})
            </Typography>
            <Typography variant="body2">
              Class: {user?.class || 'Not set'}, Section: {user?.section || 'Not set'}
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Error Details: {error.response?.status} - {error.response?.statusText}
            </Typography>
            <Typography variant="body2">
              API Endpoint: /students/timetable
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Handle nested data structure from API response
  const timetable = Array.isArray(timetableData?.data?.data) ? timetableData.data.data : 
                   Array.isArray(timetableData?.data) ? timetableData.data : [];
  
  // Show message if no timetable data
  if (!isLoading && !error && timetable.length === 0) {
    return (
      <Box>
        <Alert severity="info" sx={{ mb: 2 }}>
          No timetable found for your class and section.
        </Alert>
        <Card>
          <CardContent>
            <Typography variant="h6" color="textSecondary">
              Student Information
            </Typography>
            <Typography variant="body2">
              Name: {user?.name || 'Unknown'}
            </Typography>
            <Typography variant="body2">
              Class: {user?.class || 'Not set'}, Section: {user?.section || 'Not set'}
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              API Response: {JSON.stringify(timetableData)}
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Please contact your teacher or administrator if you believe this is an error.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

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
                                {classData.teacherName || 'Teacher'}
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
                      <School />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h6">{classData.subject}</Typography>
                        <Chip label={classData.teacherName || 'Teacher'} size="small" color="primary" />
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
                </ListItem>
                {index < getClassesForDay(selectedDay).length - 1 && <Divider variant="inset" component="li" />}
              </Box>
            ))}
            {Array.isArray(getClassesForDay(selectedDay)) && getClassesForDay(selectedDay).length === 0 && (
              <ListItem>
                <ListItemText
                  primary="No classes scheduled"
                  secondary="Enjoy your free time!"
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
        />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Day</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Teacher</TableCell>
                  <TableCell>Room</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(timetable) ? timetable.map((classData) => (
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
                      <Box display="flex" alignItems="center" gap={1}>
                        <Person color="primary" fontSize="small" />
                        <Typography variant="body2">{classData.teacherName || 'Teacher'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2">{classData.room}</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )) : null}
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
                    {Array.isArray(timetable) ? new Set(timetable.map(t => t.teacherName || t.teacher)).size : 0}
                  </Typography>
                  <Typography variant="body2">Teachers</Typography>
                </Box>
                <Person sx={{ fontSize: 40, opacity: 0.8 }} />
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
                    {selectedSlot.teacherName || 'Teacher'}
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
        </DialogActions>
      </Dialog>
    </Box>
  );
} 