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
  Rating
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
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
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  EmojiEmotions as EmojiIcon,
  SentimentDissatisfied as SadIcon,
  SentimentSatisfied as HappyIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationIcon,
  Security as SecurityIcon
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

// Session Card Component
const SessionCard = ({ session, onEdit, onDelete, onView }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PsychologyIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
            {session.studentName}
          </Typography>
          <Chip 
            label={session.status} 
            size="small" 
            color={session.status === 'Completed' ? 'success' : session.status === 'Scheduled' ? 'primary' : 'warning'} 
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Date: {session.date}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Time: {session.time}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Type: {session.type}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
          <IconButton size="small" onClick={() => onView(session)}>
            <ViewIcon />
          </IconButton>
          <IconButton size="small" onClick={() => onEdit(session)}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete(session._id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

// Mental Wellness Dashboard
const MentalWellnessDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [sessionDialog, setSessionDialog] = useState(false);
  const [assessmentDialog, setAssessmentDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionForm, setSessionForm] = useState({
    studentId: '',
    date: '',
    time: '',
    type: 'Individual',
    notes: '',
    status: 'Scheduled'
  });
  const [assessmentForm, setAssessmentForm] = useState({
    studentId: '',
    assessmentType: '',
    score: '',
    notes: '',
    recommendations: ''
  });

  // Mock data - replace with actual API calls
  const wellnessStats = {
    totalStudents: 450,
    activeSessions: 23,
    completedSessions: 156,
    pendingSessions: 8,
    highRiskStudents: 5,
    improvedStudents: 89
  };

  const sessions = [
    {
      _id: '1',
      studentName: 'John Doe',
      date: '2024-01-15',
      time: '10:00 AM',
      type: 'Individual',
      status: 'Completed',
      notes: 'Discussed academic stress and coping strategies'
    },
    {
      _id: '2',
      studentName: 'Jane Smith',
      date: '2024-01-16',
      time: '2:00 PM',
      type: 'Group',
      status: 'Scheduled',
      notes: 'Peer support group session'
    }
  ];

  const assessments = [
    {
      _id: '1',
      studentName: 'John Doe',
      assessmentType: 'Anxiety Screening',
      score: 'Moderate',
      date: '2024-01-10',
      status: 'Completed'
    }
  ];

  // Helper functions
  const resetSessionForm = () => {
    setSessionForm({
      studentId: '',
      date: '',
      time: '',
      type: 'Individual',
      notes: '',
      status: 'Scheduled'
    });
  };

  const handleSessionSubmit = () => {
    if (!sessionForm.studentId || !sessionForm.date || !sessionForm.time) {
      toast.error('Please fill in all required fields');
      return;
    }
    // Add session logic here
    setSessionDialog(false);
    resetSessionForm();
    toast.success('Session scheduled successfully');
  };

  const handleAssessmentSubmit = () => {
    if (!assessmentForm.studentId || !assessmentForm.assessmentType) {
      toast.error('Please fill in all required fields');
      return;
    }
    // Add assessment logic here
    setAssessmentDialog(false);
    toast.success('Assessment recorded successfully');
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
              Mental Wellness Center
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Student Mental Health and Wellbeing Management
            </Typography>
          </motion.div>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Profile">
              <IconButton onClick={() => navigate('/counselor/profile')} sx={{ color: 'white' }}>
                <AccountCircle />
              </IconButton>
            </Tooltip>
            <Tooltip title="Logout">
              <IconButton onClick={async () => { await logout(); navigate('/counselor-login'); }} sx={{ color: 'white' }}>
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
              icon={PsychologyIcon}
              label="Active Sessions"
              value={wellnessStats.activeSessions}
              color={theme.palette.primary.main}
              subtitle="Currently scheduled"
              trend={12.5}
              delay={0.1}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStatCard
              icon={HappyIcon}
              label="Improved Students"
              value={wellnessStats.improvedStudents}
              color={theme.palette.success.main}
              subtitle="Positive outcomes"
              trend={8.7}
              delay={0.2}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStatCard
              icon={WarningIcon}
              label="High Risk"
              value={wellnessStats.highRiskStudents}
              color={theme.palette.error.main}
              subtitle="Need attention"
              trend={-15.3}
              delay={0.3}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStatCard
              icon={ScheduleIcon}
              label="Pending Sessions"
              value={wellnessStats.pendingSessions}
              color={theme.palette.warning.main}
              subtitle="Awaiting confirmation"
              trend={5.2}
              delay={0.4}
            />
          </Grid>
        </Grid>

        {/* Main Content Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Overview" icon={<TimelineIcon />} />
            <Tab label="Sessions" icon={<PsychologyIcon />} />
            <Tab label="Assessments" icon={<AssessmentIcon />} />
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
                    <Typography variant="h6" sx={{ mb: 2 }}>Wellness Trends</Typography>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { month: 'Jan', sessions: 45, assessments: 32, improvements: 28 },
                        { month: 'Feb', sessions: 52, assessments: 38, improvements: 35 },
                        { month: 'Mar', sessions: 38, assessments: 25, improvements: 22 },
                        { month: 'Apr', sessions: 61, assessments: 45, improvements: 42 },
                        { month: 'May', sessions: 55, assessments: 40, improvements: 38 },
                        { month: 'Jun', sessions: 67, assessments: 52, improvements: 48 },
                      ]}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Area type="monotone" dataKey="sessions" stackId="1" stroke={theme.palette.primary.main} fill={theme.palette.primary.main} fillOpacity={0.6} />
                        <Area type="monotone" dataKey="assessments" stackId="1" stroke={theme.palette.secondary.main} fill={theme.palette.secondary.main} fillOpacity={0.6} />
                        <Area type="monotone" dataKey="improvements" stackId="1" stroke={theme.palette.success.main} fill={theme.palette.success.main} fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, height: 400 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Session Types</Typography>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Individual', value: 65, color: theme.palette.primary.main },
                            { name: 'Group', value: 25, color: theme.palette.secondary.main },
                            { name: 'Crisis', value: 10, color: theme.palette.error.main }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                        >
                          {[
                            { name: 'Individual', value: 65, color: theme.palette.primary.main },
                            { name: 'Group', value: 25, color: theme.palette.secondary.main },
                            { name: 'Crisis', value: 10, color: theme.palette.error.main }
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
              key="sessions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setSessionDialog(true)}
                  sx={{ px: 3, py: 1.5 }}
                >
                  Schedule Session
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AssessmentIcon />}
                  onClick={() => setAssessmentDialog(true)}
                >
                  New Assessment
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                >
                  Export Report
                </Button>
              </Box>

              <Grid container spacing={3}>
                {sessions.map((session) => (
                  <Grid item xs={12} sm={6} md={4} key={session._id}>
                    <SessionCard
                      session={session}
                      onEdit={(session) => {
                        setSelectedSession(session);
                        setSessionForm(session);
                        setSessionDialog(true);
                      }}
                      onDelete={(id) => {
                        // Delete logic
                        toast.success('Session deleted successfully');
                      }}
                      onView={(session) => {
                        // View logic
                        console.log('View session:', session);
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          )}

          {activeTab === 2 && (
            <motion.div
              key="assessments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Mental Health Assessments</Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Assessment Type</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assessments.map((assessment) => (
                      <TableRow key={assessment._id}>
                        <TableCell>{assessment.studentName}</TableCell>
                        <TableCell>{assessment.assessmentType}</TableCell>
                        <TableCell>
                          <Chip 
                            label={assessment.score} 
                            size="small" 
                            color={assessment.score === 'Low' ? 'success' : assessment.score === 'Moderate' ? 'warning' : 'error'} 
                          />
                        </TableCell>
                        <TableCell>{assessment.date}</TableCell>
                        <TableCell>
                          <Chip 
                            label={assessment.status} 
                            size="small" 
                            color={assessment.status === 'Completed' ? 'success' : 'warning'} 
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
                    <Typography variant="h6" sx={{ mb: 2 }}>Common Issues</Typography>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { issue: 'Academic Stress', count: 45 },
                        { issue: 'Anxiety', count: 32 },
                        { issue: 'Depression', count: 28 },
                        { issue: 'Peer Pressure', count: 25 },
                        { issue: 'Family Issues', count: 18 }
                      ]}>
                        <XAxis dataKey="issue" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="count" fill={theme.palette.primary.main} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, height: 400 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Improvement Trends</Typography>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[
                        { month: 'Jan', sessions: 45, improvements: 28 },
                        { month: 'Feb', sessions: 52, improvements: 35 },
                        { month: 'Mar', sessions: 38, improvements: 22 },
                        { month: 'Apr', sessions: 61, improvements: 42 },
                        { month: 'May', sessions: 55, improvements: 38 },
                        { month: 'Jun', sessions: 67, improvements: 48 }
                      ]}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line type="monotone" dataKey="sessions" stroke={theme.palette.primary.main} />
                        <Line type="monotone" dataKey="improvements" stroke={theme.palette.success.main} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Session Dialog */}
        <Dialog open={sessionDialog} onClose={() => setSessionDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>{selectedSession ? 'Edit Session' : 'Schedule New Session'}</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Student</InputLabel>
                  <Select
                    value={sessionForm.studentId}
                    onChange={(e) => setSessionForm({ ...sessionForm, studentId: e.target.value })}
                  >
                    <MenuItem value="1">John Doe - Class 10A</MenuItem>
                    <MenuItem value="2">Jane Smith - Class 11B</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Session Type</InputLabel>
                  <Select
                    value={sessionForm.type}
                    onChange={(e) => setSessionForm({ ...sessionForm, type: e.target.value })}
                  >
                    <MenuItem value="Individual">Individual</MenuItem>
                    <MenuItem value="Group">Group</MenuItem>
                    <MenuItem value="Crisis">Crisis</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Date"
                  type="date"
                  fullWidth
                  value={sessionForm.date}
                  onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Time"
                  type="time"
                  fullWidth
                  value={sessionForm.time}
                  onChange={(e) => setSessionForm({ ...sessionForm, time: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  multiline
                  rows={3}
                  fullWidth
                  value={sessionForm.notes}
                  onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSessionDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSessionSubmit}>
              {selectedSession ? 'Update Session' : 'Schedule Session'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Assessment Dialog */}
        <Dialog open={assessmentDialog} onClose={() => setAssessmentDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>New Assessment</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Student</InputLabel>
                  <Select
                    value={assessmentForm.studentId}
                    onChange={(e) => setAssessmentForm({ ...assessmentForm, studentId: e.target.value })}
                  >
                    <MenuItem value="1">John Doe - Class 10A</MenuItem>
                    <MenuItem value="2">Jane Smith - Class 11B</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Assessment Type</InputLabel>
                  <Select
                    value={assessmentForm.assessmentType}
                    onChange={(e) => setAssessmentForm({ ...assessmentForm, assessmentType: e.target.value })}
                  >
                    <MenuItem value="Anxiety Screening">Anxiety Screening</MenuItem>
                    <MenuItem value="Depression Screening">Depression Screening</MenuItem>
                    <MenuItem value="Stress Assessment">Stress Assessment</MenuItem>
                    <MenuItem value="Behavioral Assessment">Behavioral Assessment</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Score</InputLabel>
                  <Select
                    value={assessmentForm.score}
                    onChange={(e) => setAssessmentForm({ ...assessmentForm, score: e.target.value })}
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Moderate">Moderate</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  multiline
                  rows={3}
                  fullWidth
                  value={assessmentForm.notes}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, notes: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Recommendations"
                  multiline
                  rows={3}
                  fullWidth
                  value={assessmentForm.recommendations}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, recommendations: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAssessmentDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleAssessmentSubmit}>
              Save Assessment
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default MentalWellnessDashboard; 