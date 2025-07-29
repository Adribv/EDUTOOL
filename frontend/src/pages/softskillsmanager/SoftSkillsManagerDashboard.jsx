import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, Paper, useTheme, Tabs, Tab, Button, Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, Alert, IconButton, Chip, CircularProgress } from '@mui/material';
import { EmojiEvents as AchievementIcon, Edit, Delete, Group, Add, Visibility as VisibilityIcon, Security as SecurityIcon } from '@mui/icons-material';
import { api } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { usePermission } from '../../components/PermissionGuard';
import { useNavigate } from 'react-router-dom';

const eventCategories = ['Event', 'Club', 'Competition', 'Cultural'];

const SoftSkillsManagerDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { canView, canEdit, loading: permissionLoading, error: permissionError, dashboardName } = usePermission('softSkills');
  const [tab, setTab] = useState(0);
  // Events state
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', description: '', startDate: '', endDate: '', venue: '', organizer: '', category: 'Event', skills: [] });
  const [editingEventId, setEditingEventId] = useState(null);
  const [eventSuccess, setEventSuccess] = useState('');
  const [eventError, setEventError] = useState('');
  // Participation state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participant, setParticipant] = useState('');
  const [participantSuccess, setParticipantSuccess] = useState('');
  const [participantError, setParticipantError] = useState('');
  // Skill logs state
  const [skillLogs, setSkillLogs] = useState([]);
  const [skillForm, setSkillForm] = useState({ studentName: '', title: '', description: '', date: '', category: 'Other', level: 'School', position: '', certificateUrl: '' });
  const [openSkillDialog, setOpenSkillDialog] = useState(false);
  const [skillSuccess, setSkillSuccess] = useState('');
  const [skillError, setSkillError] = useState('');
  // Student list for skill log
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [loadingAchievements, setLoadingAchievements] = useState(false);

  // Fetch all events
  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await api.get('/admin/softskills/events');
      setEvents(res.data.data || []);
    } catch {
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Fetch all skill logs
  const fetchSkillLogs = async () => {
    try {
      const res = await api.get('/admin/softskills/skill-logs');
      setSkillLogs(res.data.data || []);
    } catch {
      setSkillLogs([]);
    }
  };

  // Fetch all students for dropdown
  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await api.get('/students');
      setStudents(res.data.data || []);
    } catch {
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Fetch all achievements
  const fetchAchievements = async () => {
    setLoadingAchievements(true);
    try {
      const res = await api.get('/admin/softskills/achievements');
      setAchievements(res.data.data || []);
    } catch {
      setAchievements([]);
    } finally {
      setLoadingAchievements(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchSkillLogs();
    fetchAchievements();
  }, []);

  // Event form handlers
  const handleEventFormChange = (e) => {
    const { name, value } = e.target;
    setEventForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleEventSkillsChange = (e) => {
    setEventForm((prev) => ({ ...prev, skills: e.target.value.split(',').map(s => s.trim()) }));
  };
  const handleEventSubmit = async () => {
    if (!canEdit) {
      setEventError('You do not have permission to perform this action');
      return;
    }
    try {
      if (editingEventId) {
        await api.put(`/admin/softskills/events/${editingEventId}`, eventForm);
        setEventSuccess('Event updated');
      } else {
        await api.post('/admin/softskills/events', eventForm);
        setEventSuccess('Event created');
      }
      setOpenEventDialog(false);
      setEventForm({ title: '', description: '', startDate: '', endDate: '', venue: '', organizer: '', category: 'Event', skills: [] });
      setEditingEventId(null);
      fetchEvents();
    } catch {
      setEventError('Failed to save event');
    }
  };
  const handleEventEdit = (event) => {
    if (!canEdit) {
      setEventError('You do not have permission to perform this action');
      return;
    }
    setEventForm({ ...event, skills: event.skills || [] });
    setEditingEventId(event._id);
    setOpenEventDialog(true);
  };
  const handleEventDelete = async (id) => {
    if (!canEdit) {
      setEventError('You do not have permission to perform this action');
      return;
    }
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/admin/softskills/events/${id}`);
      setEventSuccess('Event deleted');
      fetchEvents();
    } catch {
      setEventError('Failed to delete event');
    }
  };

  // Participation handlers
  const handleAddParticipant = async () => {
    if (!canEdit) {
      setParticipantError('You do not have permission to perform this action');
      return;
    }
    if (!participant) return;
    try {
      await api.post(`/admin/softskills/events/${selectedEvent._id}/participant`, { participant });
      setParticipantSuccess('Participant added');
      setParticipant('');
      fetchEvents();
    } catch {
      setParticipantError('Failed to add participant');
    }
  };
  const handleRemoveParticipant = async (p) => {
    if (!canEdit) {
      setParticipantError('You do not have permission to perform this action');
      return;
    }
    try {
      await api.delete(`/admin/softskills/events/${selectedEvent._id}/participant`, { data: { participant: p } });
      setParticipantSuccess('Participant removed');
      fetchEvents();
    } catch {
      setParticipantError('Failed to remove participant');
    }
  };

  // Skill log handlers
  const handleSkillFormChange = (e) => {
    const { name, value } = e.target;
    setSkillForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSkillSubmit = async () => {
    if (!canEdit) {
      setSkillError('You do not have permission to perform this action');
      return;
    }
    // Validate required fields
    const requiredFields = ['studentName', 'title', 'description', 'date', 'category', 'level'];
    for (const field of requiredFields) {
      if (!skillForm[field] || skillForm[field].toString().trim() === '') {
        setSkillError(`Field '${field}' is required.`);
        return;
      }
    }
    // TODO: Replace 'user._id' with actual staff ID from auth context
    const recordedBy = ""
    const payload = { ...skillForm, recordedBy };
    console.log('Submitting skill log payload:', payload);
    try {
      await api.post('/admin/softskills/skill-log', payload);
      setSkillSuccess('Skill log added');
      setOpenSkillDialog(false);
      setSkillForm({ studentName: '', title: '', description: '', date: '', category: 'Other', level: 'School', position: '', certificateUrl: '' });
      fetchSkillLogs();
    } catch {
      setSkillError('Failed to add skill log. Please check all fields and try again.');
    }
  };

  // Open skill dialog and fetch students
  const handleOpenSkillDialog = () => {
    if (!canEdit) {
      setSkillError('You do not have permission to perform this action');
      return;
    }
    setOpenSkillDialog(true);
    fetchStudents();
  };

  // Show loading while permissions are being fetched
  if (permissionLoading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Loading permissions...
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Show error if permissions failed to load
  if (permissionError) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
          <SecurityIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Permission Error
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {permissionError}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  // Show access denied if no view permission
  if (!canView) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
          <SecurityIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You don't have permission to view the {dashboardName}.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please contact your administrator for access.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  // UI
  return (
    <Box sx={{ minHeight: '100vh', background: theme.palette.grey[50] }}>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Paper sx={{ p: 4 }}>
          {/* Header with permission indicator */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              Soft Skills Manager Dashboard
            </Typography>
            {!canEdit && (
              <Chip 
                icon={<VisibilityIcon />} 
                label="View Only" 
                color="warning" 
                variant="outlined"
              />
            )}
          </Box>
          
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label="Plan & Manage" />
            <Tab label="Participation" />
            <Tab label="Skill Logs" />
            <Tab label="Overview" />
            <Tab label="All Achievements" />
          </Tabs>
          {/* Plan & Manage Tab */}
          {tab === 0 && (
            <Box>
              {canEdit && (
                <Box display="flex" justifyContent="flex-end" mb={2}>
                  <Button variant="contained" startIcon={<Add />} onClick={() => { setOpenEventDialog(true); setEditingEventId(null); setEventForm({ title: '', description: '', startDate: '', endDate: '', venue: '', organizer: '', category: 'Event', skills: [] }); }}>Add Event</Button>
                </Box>
              )}
              {eventSuccess && <Alert severity="success" onClose={() => setEventSuccess('')}>{eventSuccess}</Alert>}
              {eventError && <Alert severity="error" onClose={() => setEventError('')}>{eventError}</Alert>}
              <Table><TableHead><TableRow>
                <TableCell>Title</TableCell><TableCell>Category</TableCell><TableCell>Start</TableCell><TableCell>End</TableCell><TableCell>Venue</TableCell><TableCell>Organizer</TableCell><TableCell>Skills</TableCell>
                {canEdit && <TableCell>Actions</TableCell>}
              </TableRow></TableHead><TableBody>
                {events.map(ev => (
                  <TableRow key={ev._id}>
                    <TableCell>{ev.title}</TableCell>
                    <TableCell>{ev.category}</TableCell>
                    <TableCell>{ev.startDate ? new Date(ev.startDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{ev.endDate ? new Date(ev.endDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{ev.venue}</TableCell>
                    <TableCell>{ev.organizer}</TableCell>
                    <TableCell>{(ev.skills || []).join(', ')}</TableCell>
                    {canEdit && (
                      <TableCell>
                        <IconButton onClick={() => handleEventEdit(ev)}><Edit /></IconButton>
                        <IconButton onClick={() => handleEventDelete(ev._id)}><Delete /></IconButton>
                        <IconButton onClick={() => { setTab(1); setSelectedEvent(ev); }}><Group /></IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody></Table>
              {canEdit && (
                <Dialog open={openEventDialog} onClose={() => setOpenEventDialog(false)}>
                  <DialogTitle>{editingEventId ? 'Edit Event' : 'Add Event'}</DialogTitle>
                  <DialogContent sx={{ minWidth: 350 }}>
                    <TextField label="Title" name="title" value={eventForm.title} onChange={handleEventFormChange} fullWidth sx={{ mb: 2 }} />
                    <TextField label="Description" name="description" value={eventForm.description} onChange={handleEventFormChange} fullWidth sx={{ mb: 2 }} />
                    <TextField label="Start Date" name="startDate" type="date" value={eventForm.startDate} onChange={handleEventFormChange} fullWidth sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
                    <TextField label="End Date" name="endDate" type="date" value={eventForm.endDate} onChange={handleEventFormChange} fullWidth sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
                    <TextField label="Venue" name="venue" value={eventForm.venue} onChange={handleEventFormChange} fullWidth sx={{ mb: 2 }} />
                    <TextField label="Organizer" name="organizer" value={eventForm.organizer} onChange={handleEventFormChange} fullWidth sx={{ mb: 2 }} />
                    <Select label="Category" name="category" value={eventForm.category} onChange={handleEventFormChange} fullWidth sx={{ mb: 2 }}>
                      {eventCategories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                    </Select>
                    <TextField label="Skills (comma separated)" value={eventForm.skills.join(', ')} onChange={handleEventSkillsChange} fullWidth sx={{ mb: 2 }} />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setOpenEventDialog(false)}>Cancel</Button>
                    <Button onClick={handleEventSubmit} variant="contained">Save</Button>
                  </DialogActions>
                </Dialog>
              )}
            </Box>
          )}
          {/* Participation Tab */}
          {tab === 1 && selectedEvent && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>{selectedEvent.title} - Participants</Typography>
              {participantSuccess && <Alert severity="success" onClose={() => setParticipantSuccess('')}>{participantSuccess}</Alert>}
              {participantError && <Alert severity="error" onClose={() => setParticipantError('')}>{participantError}</Alert>}
              {canEdit && (
                <Box display="flex" gap={2} mb={2}>
                  <TextField label="Participant Name/ID" value={participant} onChange={e => setParticipant(e.target.value)} />
                  <Button onClick={handleAddParticipant} variant="contained">Add</Button>
                </Box>
              )}
              <Button onClick={() => setSelectedEvent(null)}>Back</Button>
              <Table><TableHead><TableRow>
                <TableCell>Name/ID</TableCell>
                {canEdit && <TableCell>Actions</TableCell>}
              </TableRow></TableHead><TableBody>
                {(selectedEvent.participants || []).map(p => (
                  <TableRow key={p}>
                    <TableCell>{p}</TableCell>
                    {canEdit && (
                      <TableCell><Button color="error" onClick={() => handleRemoveParticipant(p)}>Remove</Button></TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody></Table>
            </Box>
          )}
          {/* Skill Logs Tab */}
          {tab === 2 && (
            <Box>
              {canEdit && (
                <Box display="flex" justifyContent="flex-end" mb={2}>
                  <Button variant="contained" startIcon={<Add />} onClick={handleOpenSkillDialog}>Log Skill</Button>
                </Box>
              )}
              {skillSuccess && <Alert severity="success" onClose={() => setSkillSuccess('')}>{skillSuccess}</Alert>}
              {skillError && <Alert severity="error" onClose={() => setSkillError('')}>{skillError}</Alert>}
              <Table><TableHead><TableRow>
                <TableCell>Student</TableCell><TableCell>Title</TableCell><TableCell>Description</TableCell><TableCell>Date</TableCell><TableCell>Category</TableCell><TableCell>Level</TableCell><TableCell>Position</TableCell>
              </TableRow></TableHead><TableBody>
                {skillLogs.map(log => (
                  <TableRow key={log._id}>
                    <TableCell>{log.studentName}</TableCell>
                    <TableCell>{log.title}</TableCell>
                    <TableCell>{log.description}</TableCell>
                    <TableCell>{log.date ? new Date(log.date).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{log.category}</TableCell>
                    <TableCell>{log.level}</TableCell>
                    <TableCell>{log.position}</TableCell>
                  </TableRow>
                ))}
              </TableBody></Table>
              {canEdit && (
                <Dialog open={openSkillDialog} onClose={() => setOpenSkillDialog(false)}>
                  <DialogTitle>Log Skill Development</DialogTitle>
                  <DialogContent sx={{ minWidth: 350 }}>
                    <TextField label="Student Name" name="studentName" value={skillForm.studentName} onChange={handleSkillFormChange} fullWidth sx={{ mb: 2 }} />
                    <TextField label="Title" name="title" value={skillForm.title} onChange={handleSkillFormChange} fullWidth sx={{ mb: 2 }} />
                    <TextField label="Description" name="description" value={skillForm.description} onChange={handleSkillFormChange} fullWidth sx={{ mb: 2 }} />
                    <TextField label="Date" name="date" type="date" value={skillForm.date} onChange={handleSkillFormChange} fullWidth sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
                    <Select label="Category" name="category" value={skillForm.category} onChange={handleSkillFormChange} fullWidth sx={{ mb: 2 }}>
                      {['Sports', 'Arts', 'Music', 'Debate', 'Science', 'Community Service', 'Other'].map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                    </Select>
                    <Select label="Level" name="level" value={skillForm.level} onChange={handleSkillFormChange} fullWidth sx={{ mb: 2 }}>
                      {['School', 'District', 'State', 'National', 'International'].map(lvl => <MenuItem key={lvl} value={lvl}>{lvl}</MenuItem>)}
                    </Select>
                    <TextField label="Position" name="position" value={skillForm.position} onChange={handleSkillFormChange} fullWidth sx={{ mb: 2 }} />
                    <TextField label="Certificate URL" name="certificateUrl" value={skillForm.certificateUrl} onChange={handleSkillFormChange} fullWidth sx={{ mb: 2 }} />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setOpenSkillDialog(false)}>Cancel</Button>
                    <Button onClick={handleSkillSubmit} variant="contained">Save</Button>
                  </DialogActions>
                </Dialog>
              )}
            </Box>
          )}
          {/* Overview Tab */}
          {tab === 3 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Overview</Typography>
              <Typography>Total Events: {events.length}</Typography>
              <Typography>Total Skill Logs: {skillLogs.length}</Typography>
              <Typography>Total Participants: {events.reduce((sum, ev) => sum + (ev.participants?.length || 0), 0)}</Typography>
            </Box>
          )}
          {/* All Achievements Tab */}
          {tab === 4 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>All Extracurricular Achievements</Typography>
              {loadingAchievements ? <Typography>Loading...</Typography> : (
                <Table><TableHead><TableRow>
                  <TableCell>Student Name</TableCell><TableCell>Title</TableCell><TableCell>Description</TableCell><TableCell>Date</TableCell><TableCell>Category</TableCell><TableCell>Level</TableCell><TableCell>Position</TableCell><TableCell>Certificate URL</TableCell>
                </TableRow></TableHead><TableBody>
                  {achievements.map(a => (
                    <TableRow key={a._id}>
                      <TableCell>{a.studentName}</TableCell>
                      <TableCell>{a.title}</TableCell>
                      <TableCell>{a.description}</TableCell>
                      <TableCell>{a.date ? new Date(a.date).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{a.category}</TableCell>
                      <TableCell>{a.level}</TableCell>
                      <TableCell>{a.position}</TableCell>
                      <TableCell>{a.certificateUrl}</TableCell>
                    </TableRow>
                  ))}
                </TableBody></Table>
              )}
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default SoftSkillsManagerDashboard; 