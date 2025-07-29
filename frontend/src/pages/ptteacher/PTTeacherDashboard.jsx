import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  useTheme,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  InputAdornment,
  Switch,
  FormControlLabel,
  Rating,
  Avatar
} from '@mui/material';
import {
  SportsSoccer as SoccerIcon,
  SportsBasketball as BasketballIcon,
  SportsCricket as CricketIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  AccountCircle,
  Logout as LogoutIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  EmojiEvents as TrophyIcon,
  FitnessCenter as FitnessIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationIcon,
  Security as SecurityIcon,
  DirectionsRun as RunIcon,
  Pool as SwimmingIcon,
  SportsTennis as TennisIcon,
  SportsVolleyball as VolleyballIcon,
  TrackChanges as TrackIcon,
  Timer as TimerIcon,
  Speed as SpeedIcon,
  Height as HeightIcon,
  MonitorWeight as WeightIcon
} from '@mui/icons-material';
import {
  XAxis,
  YAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

// Animated Stat Card Component
const AnimatedStatCard = ({ icon: Icon, label, value, color, subtitle, trend, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ scale: 1.02, y: -5 }}
  >
    <Paper 
      elevation={6} 
      sx={{ 
        p: 3, 
        borderRadius: 3, 
        background: `linear-gradient(135deg, ${color}15, ${color}05)`,
        border: `1px solid ${color}20`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ position: 'absolute', top: 0, right: 0, p: 1 }}>
        <Icon sx={{ fontSize: 40, color: `${color}40` }} />
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>{label}</Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: color }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            {subtitle}
          </Typography>
        )}
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            {trend > 0 ? (
              <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main', mr: 0.5 }} />
            )}
            <Typography variant="body2" sx={{ color: trend > 0 ? 'success.main' : 'error.main' }}>
              {Math.abs(trend)}% from last month
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  </motion.div>
);

// Sport Event Card Component
const SportEventCard = ({ event, onEdit, onDelete, onView }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {event.sport === 'Football' && <SoccerIcon color="primary" sx={{ mr: 1 }} />}
          {event.sport === 'Basketball' && <BasketballIcon color="primary" sx={{ mr: 1 }} />}
          {event.sport === 'Cricket' && <CricketIcon color="primary" sx={{ mr: 1 }} />}
          {event.sport === 'Swimming' && <SwimmingIcon color="primary" sx={{ mr: 1 }} />}
          {event.sport === 'Tennis' && <TennisIcon color="primary" sx={{ mr: 1 }} />}
          {event.sport === 'Volleyball' && <VolleyballIcon color="primary" sx={{ mr: 1 }} />}
          <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
            {event.title}
          </Typography>
          <Chip 
            label={event.status} 
            size="small" 
            color={event.status === 'Completed' ? 'success' : event.status === 'Upcoming' ? 'primary' : 'warning'} 
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Sport: {event.sport}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Date: {event.date}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Participants: {event.participants}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
          <IconButton size="small" onClick={() => onView(event)}>
            <ViewIcon />
          </IconButton>
          <IconButton size="small" onClick={() => onEdit(event)}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete(event._id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

// PT Teacher Dashboard
const PTTeacherDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [eventDialog, setEventDialog] = useState(false);
  const [fitnessDialog, setFitnessDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    sport: '',
    date: '',
    time: '',
    venue: '',
    participants: '',
    description: '',
    status: 'Upcoming'
  });
  const [fitnessForm, setFitnessForm] = useState({
    studentId: '',
    height: '',
    weight: '',
    bmi: '',
    fitnessScore: '',
    notes: ''
  });

  // Mock data - replace with actual API calls
  const sportsStats = {
    totalStudents: 450,
    activeAthletes: 89,
    upcomingEvents: 12,
    completedEvents: 45,
    fitnessTests: 156,
    improvedStudents: 67
  };

  const events = [
    {
      _id: '1',
      title: 'Annual Sports Meet',
      sport: 'Multi-Sport',
      date: '2024-02-15',
      time: '9:00 AM',
      venue: 'School Ground',
      participants: '150',
      status: 'Upcoming',
      description: 'Annual sports competition'
    },
    {
      _id: '2',
      title: 'Basketball Tournament',
      sport: 'Basketball',
      date: '2024-01-20',
      time: '3:00 PM',
      venue: 'Indoor Court',
      participants: '24',
      status: 'Completed',
      description: 'Inter-class basketball tournament'
    }
  ];

  const fitnessRecords = [
    {
      _id: '1',
      studentName: 'John Doe',
      height: '170cm',
      weight: '65kg',
      bmi: '22.5',
      fitnessScore: '85',
      date: '2024-01-10',
      status: 'Good'
    }
  ];

  // Helper functions
  const resetEventForm = () => {
    setEventForm({
      title: '',
      sport: '',
      date: '',
      time: '',
      venue: '',
      participants: '',
      description: '',
      status: 'Upcoming'
    });
  };

  const handleEventSubmit = () => {
    if (!eventForm.title || !eventForm.sport || !eventForm.date) {
      toast.error('Please fill in all required fields');
      return;
    }
    // Add event logic here
    setEventDialog(false);
    resetEventForm();
    toast.success('Event created successfully');
  };

  const handleFitnessSubmit = () => {
    if (!fitnessForm.studentId || !fitnessForm.height || !fitnessForm.weight) {
      toast.error('Please fill in all required fields');
      return;
    }
    // Add fitness record logic here
    setFitnessDialog(false);
    toast.success('Fitness record saved successfully');
  };

  return (
    <Box sx={{ minHeight: '100vh', background: theme.palette.grey[50] }}>
      {/* Header */}
      <Box sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
        color: 'white',
        p: 3,
        mb: 3
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Physical Education & Sports
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Sports Management and Student Fitness Tracking
            </Typography>
          </motion.div>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Profile">
              <IconButton onClick={() => navigate('/ptteacher/profile')} sx={{ color: 'white' }}>
                <AccountCircle />
              </IconButton>
            </Tooltip>
            <Tooltip title="Logout">
              <IconButton onClick={async () => { await logout(); navigate('/ptteacher-login'); }} sx={{ color: 'white' }}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStatCard
              icon={FitnessIcon}
              label="Active Athletes"
              value={sportsStats.activeAthletes}
              color={theme.palette.primary.main}
              subtitle="Currently participating"
              trend={12.5}
              delay={0.1}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStatCard
              icon={EventIcon}
              label="Upcoming Events"
              value={sportsStats.upcomingEvents}
              color={theme.palette.warning.main}
              subtitle="Scheduled events"
              trend={8.7}
              delay={0.2}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStatCard
              icon={TrophyIcon}
              label="Completed Events"
              value={sportsStats.completedEvents}
              color={theme.palette.success.main}
              subtitle="Successfully held"
              trend={15.3}
              delay={0.3}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStatCard
              icon={AssessmentIcon}
              label="Fitness Tests"
              value={sportsStats.fitnessTests}
              color={theme.palette.info.main}
              subtitle="Conducted this month"
              trend={5.2}
              delay={0.4}
            />
          </Grid>
        </Grid>

        {/* Main Content Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Overview" icon={<TimelineIcon />} />
            <Tab label="Sports Events" icon={<EventIcon />} />
            <Tab label="Fitness Records" icon={<FitnessIcon />} />
            <Tab label="Reports" icon={<AssessmentIcon />} />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 0 && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 3, height: 400 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Sports Participation Trends</Typography>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { month: 'Jan', events: 8, participants: 120, fitnessTests: 45 },
                        { month: 'Feb', events: 12, participants: 180, fitnessTests: 52 },
                        { month: 'Mar', events: 6, participants: 90, fitnessTests: 38 },
                        { month: 'Apr', events: 15, participants: 220, fitnessTests: 61 },
                        { month: 'May', events: 10, participants: 150, fitnessTests: 55 },
                        { month: 'Jun', events: 18, participants: 280, fitnessTests: 67 },
                      ]}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Area type="monotone" dataKey="events" stackId="1" stroke={theme.palette.primary.main} fill={theme.palette.primary.main} fillOpacity={0.6} />
                        <Area type="monotone" dataKey="participants" stackId="1" stroke={theme.palette.secondary.main} fill={theme.palette.secondary.main} fillOpacity={0.6} />
                        <Area type="monotone" dataKey="fitnessTests" stackId="1" stroke={theme.palette.success.main} fill={theme.palette.success.main} fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, height: 400 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Popular Sports</Typography>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Football', value: 35, color: theme.palette.primary.main },
                            { name: 'Basketball', value: 25, color: theme.palette.secondary.main },
                            { name: 'Cricket', value: 20, color: theme.palette.success.main },
                            { name: 'Swimming', value: 15, color: theme.palette.warning.main },
                            { name: 'Others', value: 5, color: theme.palette.error.main }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                        >
                          {[
                            { name: 'Football', value: 35, color: theme.palette.primary.main },
                            { name: 'Basketball', value: 25, color: theme.palette.secondary.main },
                            { name: 'Cricket', value: 20, color: theme.palette.success.main },
                            { name: 'Swimming', value: 15, color: theme.palette.warning.main },
                            { name: 'Others', value: 5, color: theme.palette.error.main }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
            </motion.div>
          )}

          {activeTab === 1 && (
            <motion.div
              key="events"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setEventDialog(true)}
                  sx={{ px: 3, py: 1.5 }}
                >
                  Create Event
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FitnessIcon />}
                  onClick={() => setFitnessDialog(true)}
                >
                  Fitness Test
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                >
                  Export Report
                </Button>
              </Box>

              <Grid container spacing={3}>
                {events.map((event) => (
                  <Grid item xs={12} sm={6} md={4} key={event._id}>
                    <SportEventCard
                      event={event}
                      onEdit={(event) => {
                        setSelectedEvent(event);
                        setEventForm(event);
                        setEventDialog(true);
                      }}
                      onDelete={(id) => {
                        // Delete logic
                        toast.success('Event deleted successfully');
                      }}
                      onView={(event) => {
                        // View logic
                        console.log('View event:', event);
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          )}

          {activeTab === 2 && (
            <motion.div
              key="fitness"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Student Fitness Records</Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Height</TableCell>
                      <TableCell>Weight</TableCell>
                      <TableCell>BMI</TableCell>
                      <TableCell>Fitness Score</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fitnessRecords.map((record) => (
                      <TableRow key={record._id}>
                        <TableCell>{record.studentName}</TableCell>
                        <TableCell>{record.height}</TableCell>
                        <TableCell>{record.weight}</TableCell>
                        <TableCell>{record.bmi}</TableCell>
                        <TableCell>{record.fitnessScore}</TableCell>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>
                          <Chip 
                            label={record.status} 
                            size="small" 
                            color={record.status === 'Good' ? 'success' : record.status === 'Average' ? 'warning' : 'error'} 
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </motion.div>
          )}

          {activeTab === 3 && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, height: 400 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Event Participation</Typography>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { event: 'Annual Sports Meet', participants: 150 },
                        { event: 'Basketball Tournament', participants: 24 },
                        { event: 'Swimming Competition', participants: 18 },
                        { event: 'Athletics Meet', participants: 45 },
                        { event: 'Cricket Tournament', participants: 32 }
                      ]}>
                        <XAxis dataKey="event" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="participants" fill={theme.palette.primary.main} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, height: 400 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Fitness Trends</Typography>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[
                        { month: 'Jan', avgFitnessScore: 75, tests: 45 },
                        { month: 'Feb', avgFitnessScore: 78, tests: 52 },
                        { month: 'Mar', avgFitnessScore: 76, tests: 38 },
                        { month: 'Apr', avgFitnessScore: 82, tests: 61 },
                        { month: 'May', avgFitnessScore: 80, tests: 55 },
                        { month: 'Jun', avgFitnessScore: 85, tests: 67 }
                      ]}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line type="monotone" dataKey="avgFitnessScore" stroke={theme.palette.primary.main} />
                        <Line type="monotone" dataKey="tests" stroke={theme.palette.success.main} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Event Dialog */}
        <Dialog open={eventDialog} onClose={() => setEventDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>{selectedEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Event Title"
                  fullWidth
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Sport</InputLabel>
                  <Select
                    value={eventForm.sport}
                    onChange={(e) => setEventForm({ ...eventForm, sport: e.target.value })}
                  >
                    <MenuItem value="Football">Football</MenuItem>
                    <MenuItem value="Basketball">Basketball</MenuItem>
                    <MenuItem value="Cricket">Cricket</MenuItem>
                    <MenuItem value="Swimming">Swimming</MenuItem>
                    <MenuItem value="Tennis">Tennis</MenuItem>
                    <MenuItem value="Volleyball">Volleyball</MenuItem>
                    <MenuItem value="Multi-Sport">Multi-Sport</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Date"
                  type="date"
                  fullWidth
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Time"
                  type="time"
                  fullWidth
                  value={eventForm.time}
                  onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Venue"
                  fullWidth
                  value={eventForm.venue}
                  onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Expected Participants"
                  type="number"
                  fullWidth
                  value={eventForm.participants}
                  onChange={(e) => setEventForm({ ...eventForm, participants: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  multiline
                  rows={3}
                  fullWidth
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEventDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleEventSubmit}>
              {selectedEvent ? 'Update Event' : 'Create Event'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Fitness Test Dialog */}
        <Dialog open={fitnessDialog} onClose={() => setFitnessDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Fitness Assessment</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Student</InputLabel>
                  <Select
                    value={fitnessForm.studentId}
                    onChange={(e) => setFitnessForm({ ...fitnessForm, studentId: e.target.value })}
                  >
                    <MenuItem value="1">John Doe - Class 10A</MenuItem>
                    <MenuItem value="2">Jane Smith - Class 11B</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Height (cm)"
                  type="number"
                  fullWidth
                  value={fitnessForm.height}
                  onChange={(e) => setFitnessForm({ ...fitnessForm, height: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Weight (kg)"
                  type="number"
                  fullWidth
                  value={fitnessForm.weight}
                  onChange={(e) => setFitnessForm({ ...fitnessForm, weight: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="BMI"
                  type="number"
                  fullWidth
                  value={fitnessForm.bmi}
                  onChange={(e) => setFitnessForm({ ...fitnessForm, bmi: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Fitness Score"
                  type="number"
                  fullWidth
                  value={fitnessForm.fitnessScore}
                  onChange={(e) => setFitnessForm({ ...fitnessForm, fitnessScore: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  multiline
                  rows={3}
                  fullWidth
                  value={fitnessForm.notes}
                  onChange={(e) => setFitnessForm({ ...fitnessForm, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFitnessDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleFitnessSubmit}>
              Save Assessment
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default PTTeacherDashboard; 