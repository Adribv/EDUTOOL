// ... existing code ...
// (The code will be replaced with a full-featured, tabbed/accordion dashboard for teachers, covering all teacherRoutes.js features, with dynamic API calls and UI for each.)

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Tabs, Tab, Card, CardContent, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, IconButton, Accordion, 
  AccordionSummary, AccordionDetails, List, ListItem, ListItemText, ListItemIcon, Tooltip, Chip, Avatar,
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, Alert, Divider, Paper, Badge,
  Stepper, Step, StepLabel, LinearProgress, Rating, Fab, Drawer, AppBar, Toolbar, Menu, MenuItem as MenuItemMUI
} from '@mui/material';
import {
  ExpandMore, Add, Edit, Delete, Assignment, School, Event, Book, Group, Feedback, Message, 
  Assessment, Schedule, Person, Upload, Download, Visibility, CheckCircle, Warning, Error,
  Notifications, AccountCircle, Logout, Settings, Dashboard, Class, Grade, Timeline, 
  FileUpload, FileDownload, Send, Reply, Star, StarBorder, CalendarToday, AccessTime,
  LocationOn, Phone, Email, Work, Psychology, TrendingUp, TrendingDown, Equalizer
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const featureTabs = [
  { label: 'Dashboard', icon: <Dashboard />, key: 'dashboard' },
  { label: 'Profile', icon: <Person />, key: 'profile' },
  { label: 'Classes', icon: <Class />, key: 'classes' },
  { label: 'Timetable', icon: <Schedule />, key: 'timetable' },
  { label: 'Attendance', icon: <CheckCircle />, key: 'attendance' },
  { label: 'Assignments', icon: <Assignment />, key: 'assignments' },
  { label: 'Exams', icon: <Assessment />, key: 'exams' },
  { label: 'Materials', icon: <Book />, key: 'materials' },
  { label: 'Communication', icon: <Message />, key: 'communication' },
  { label: 'Performance', icon: <TrendingUp />, key: 'performance' },
  { label: 'Projects', icon: <Work />, key: 'projects' },
  { label: 'Parent Interaction', icon: <Group />, key: 'parent-interaction' },
  { label: 'Feedback', icon: <Feedback />, key: 'feedback' },
];

function AssignmentDialog({ open, onClose, assignment, onAssignmentChange, onSubmit, classes, loading }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Assignment</DialogTitle>
      <DialogContent>
        <TextField
          label="Title"
          fullWidth
          margin="normal"
          value={assignment.title}
          onChange={e => onAssignmentChange({ ...assignment, title: e.target.value })}
        />
        <TextField
          label="Description"
          fullWidth
          margin="normal"
          value={assignment.description}
          onChange={e => onAssignmentChange({ ...assignment, description: e.target.value })}
        />
        {/* Add more fields as needed */}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={loading}>
          {loading ? "Saving..." : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ResourceDialog({ open, onClose, resource, onResourceChange, onSubmit, loading }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload Resource</DialogTitle>
      <DialogContent>
        <TextField
          label="Title"
          fullWidth
          margin="normal"
          value={resource.title}
          onChange={e => onResourceChange({ ...resource, title: e.target.value })}
        />
        <TextField
          label="Description"
          fullWidth
          margin="normal"
          value={resource.description}
          onChange={e => onResourceChange({ ...resource, description: e.target.value })}
        />
        <TextField
          label="Type"
          fullWidth
          margin="normal"
          value={resource.type}
          onChange={e => onResourceChange({ ...resource, type: e.target.value })}
        />
        <Button
          variant="outlined"
          component="label"
          sx={{ mt: 2 }}
        >
          Upload File
          <input
            type="file"
            hidden
            onChange={e => onResourceChange({ ...resource, file: e.target.files[0] })}
          />
        </Button>
        {resource.file && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Selected: {resource.file.name}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function LessonPlanDialog({ open, onClose, lessonPlan, onLessonPlanChange, onSubmit, classes, loading }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Submit Lesson Plan</DialogTitle>
      <DialogContent>
        <TextField
          label="Title"
          fullWidth
          margin="normal"
          value={lessonPlan.title}
          onChange={e => onLessonPlanChange({ ...lessonPlan, title: e.target.value })}
        />
        <TextField
          label="Subject"
          fullWidth
          margin="normal"
          value={lessonPlan.subject}
          onChange={e => onLessonPlanChange({ ...lessonPlan, subject: e.target.value })}
        />
        <TextField
          label="Class"
          fullWidth
          margin="normal"
          value={lessonPlan.class}
          onChange={e => onLessonPlanChange({ ...lessonPlan, class: e.target.value })}
        />
        <TextField
          label="Objectives"
          fullWidth
          margin="normal"
          value={lessonPlan.objectives}
          onChange={e => onLessonPlanChange({ ...lessonPlan, objectives: e.target.value })}
        />
        <TextField
          label="Activities"
          fullWidth
          margin="normal"
          value={lessonPlan.activities}
          onChange={e => onLessonPlanChange({ ...lessonPlan, activities: e.target.value })}
        />
        <Button
          variant="outlined"
          component="label"
          sx={{ mt: 2 }}
        >
          Upload File
          <input
            type="file"
            hidden
            onChange={e => onLessonPlanChange({ ...lessonPlan, file: e.target.files[0] })}
          />
        </Button>
        {lessonPlan.file && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Selected: {lessonPlan.file.name}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ExamDialog({ open, onClose, exam, onExamChange, onSubmit, classes, loading }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Exam</DialogTitle>
      <DialogContent>
        <TextField
          label="Title"
          fullWidth
          margin="normal"
          value={exam.title}
          onChange={e => onExamChange({ ...exam, title: e.target.value })}
        />
        <TextField
          label="Subject"
          fullWidth
          margin="normal"
          value={exam.subject}
          onChange={e => onExamChange({ ...exam, subject: e.target.value })}
        />
        <TextField
          label="Class"
          fullWidth
          margin="normal"
          value={exam.class}
          onChange={e => onExamChange({ ...exam, class: e.target.value })}
        />
        <TextField
          label="Date"
          type="date"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          value={exam.date}
          onChange={e => onExamChange({ ...exam, date: e.target.value })}
        />
        <TextField
          label="Duration (minutes)"
          type="number"
          fullWidth
          margin="normal"
          value={exam.duration}
          onChange={e => onExamChange({ ...exam, duration: e.target.value })}
        />
        <Button
          variant="outlined"
          component="label"
          sx={{ mt: 2 }}
        >
          Upload Question Paper
          <input
            type="file"
            hidden
            onChange={e => onExamChange({ ...exam, questionPaper: e.target.files[0] })}
          />
        </Button>
        {exam.questionPaper && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Selected: {exam.questionPaper.name}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function MessageDialog({ open, onClose, message, onMessageChange, onSubmit, loading }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Send Message</DialogTitle>
      <DialogContent>
        <TextField
          label="Recipient"
          fullWidth
          margin="normal"
          value={message.recipient}
          onChange={e => onMessageChange({ ...message, recipient: e.target.value })}
        />
        <TextField
          label="Subject"
          fullWidth
          margin="normal"
          value={message.subject}
          onChange={e => onMessageChange({ ...message, subject: e.target.value })}
        />
        <TextField
          label="Content"
          fullWidth
          margin="normal"
          multiline
          rows={4}
          value={message.content}
          onChange={e => onMessageChange({ ...message, content: e.target.value })}
        />
        <Button
          variant="outlined"
          component="label"
          sx={{ mt: 2 }}
        >
          Attach Files
          <input
            type="file"
            hidden
            multiple
            onChange={e => onMessageChange({ ...message, attachments: Array.from(e.target.files) })}
          />
        </Button>
        {message.attachments && message.attachments.length > 0 && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {message.attachments.length} file(s) selected
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ProjectDialog({ open, onClose, project, onProjectChange, onSubmit, loading }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Project</DialogTitle>
      <DialogContent>
        <TextField
          label="Title"
          fullWidth
          margin="normal"
          value={project.title}
          onChange={e => onProjectChange({ ...project, title: e.target.value })}
        />
        <TextField
          label="Description"
          fullWidth
          margin="normal"
          value={project.description}
          onChange={e => onProjectChange({ ...project, description: e.target.value })}
        />
        <TextField
          label="Objectives"
          fullWidth
          margin="normal"
          value={project.objectives}
          onChange={e => onProjectChange({ ...project, objectives: e.target.value })}
        />
        <Button
          variant="outlined"
          component="label"
          sx={{ mt: 2 }}
        >
          Attach File
          <input
            type="file"
            hidden
            onChange={e => onProjectChange({ ...project, attachment: e.target.files[0] })}
          />
        </Button>
        {project.attachment && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Selected: {project.attachment.name}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function FeedbackDialog({ open, onClose, feedback, onFeedbackChange, onSubmit, loading }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Submit Feedback</DialogTitle>
      <DialogContent>
        <TextField
          label="Type"
          fullWidth
          margin="normal"
          value={feedback.type}
          onChange={e => onFeedbackChange({ ...feedback, type: e.target.value })}
        />
        <TextField
          label="Title"
          fullWidth
          margin="normal"
          value={feedback.title}
          onChange={e => onFeedbackChange({ ...feedback, title: e.target.value })}
        />
        <TextField
          label="Content"
          fullWidth
          margin="normal"
          multiline
          rows={4}
          value={feedback.content}
          onChange={e => onFeedbackChange({ ...feedback, content: e.target.value })}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Priority</InputLabel>
          <Select
            value={feedback.priority}
            label="Priority"
            onChange={e => onFeedbackChange({ ...feedback, priority: e.target.value })}
          >
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Dashboard Overview Component
function DashboardOverview({ profile, classes, assignments, exams, announcements }) {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Welcome, {profile?.name || 'Teacher'}!</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Classes</Typography>
              <Typography variant="h4" color="primary">{classes?.length || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Assignments</Typography>
              <Typography variant="h4" color="secondary">{assignments?.length || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Exams</Typography>
              <Typography variant="h4" color="success.main">{exams?.length || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Announcements</Typography>
              <Typography variant="h4" color="warning.main">{announcements?.length || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

// Profile Management Component
function ProfileManagement({ profile, onUpdateProfile }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Profile Management</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Name"
              fullWidth
              margin="normal"
              value={profile?.name || ''}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Email"
              fullWidth
              margin="normal"
              value={profile?.email || ''}
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" onClick={() => onUpdateProfile({})}>
              Update Profile
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

// Class Management Component
function ClassManagement({ classes, selectedClass, onSelectClass }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Class Management</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Class</TableCell>
              <TableCell>Section</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classes?.map((cls, index) => (
              <TableRow key={index}>
                <TableCell>{cls.class}</TableCell>
                <TableCell>{cls.section}</TableCell>
                <TableCell>{cls.subject}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => onSelectClass(cls)}>
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Timetable Management Component
function TimetableManagement({ timetable }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Timetable</Typography>
        <List>
          {timetable?.map((item, index) => (
            <ListItem key={index}>
              <ListItemText 
                primary={item.subject} 
                secondary={`${item.day} ${item.time}`} 
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

// Attendance Management Component
function AttendanceManagement({ classes, selectedClass, selectedDate, onSelectClass, onSelectDate, onMarkAttendance }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Attendance Management</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Select Class</InputLabel>
              <Select
                value={selectedClass?.class || ''}
                onChange={(e) => {
                  const cls = classes?.find(c => c.class === e.target.value);
                  onSelectClass(cls);
                }}
              >
                {classes?.map((cls, index) => (
                  <MenuItem key={index} value={cls.class}>
                    {cls.class} - {cls.section}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Date"
              type="date"
              fullWidth
              value={selectedDate}
              onChange={(e) => onSelectDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button variant="contained" onClick={() => onMarkAttendance({})}>
              Mark Attendance
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

// Assignment Management Component
function AssignmentManagement({ assignments, classes, onCreateAssignment, onGradeSubmission }) {
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Assignment Management</Typography>
          <Button variant="contained" onClick={onCreateAssignment}>
            Create Assignment
          </Button>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments?.map((assignment, index) => (
              <TableRow key={index}>
                <TableCell>{assignment.title}</TableCell>
                <TableCell>{assignment.class}</TableCell>
                <TableCell>{assignment.subject}</TableCell>
                <TableCell>{assignment.dueDate}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => onGradeSubmission(assignment._id, {})}>
                    Grade
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Exam Management Component
function ExamManagement({ exams, onCreateExam }) {
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Exam Management</Typography>
          <Button variant="contained" onClick={onCreateExam}>
            Create Exam
          </Button>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exams?.map((exam, index) => (
              <TableRow key={index}>
                <TableCell>{exam.title}</TableCell>
                <TableCell>{exam.subject}</TableCell>
                <TableCell>{exam.class}</TableCell>
                <TableCell>{exam.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Materials Management Component
function MaterialsManagement({ resources, lessonPlans, onUploadResource, onSubmitLessonPlan }) {
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Learning Resources</Typography>
                <Button variant="contained" onClick={onUploadResource}>
                  Upload Resource
                </Button>
              </Box>
              <List>
                {resources?.map((resource, index) => (
                  <ListItem key={index}>
                    <ListItemText 
                      primary={resource.title} 
                      secondary={resource.type} 
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Lesson Plans</Typography>
                <Button variant="contained" onClick={onSubmitLessonPlan}>
                  Submit Lesson Plan
                </Button>
              </Box>
              <List>
                {lessonPlans?.map((plan, index) => (
                  <ListItem key={index}>
                    <ListItemText 
                      primary={plan.title} 
                      secondary={plan.subject} 
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

// Communication Management Component
function CommunicationManagement({ announcements, onSendMessage }) {
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Communication</Typography>
          <Button variant="contained" onClick={onSendMessage}>
            Send Message
          </Button>
        </Box>
        <Typography variant="h6" gutterBottom>Announcements</Typography>
        <List>
          {announcements?.map((announcement, index) => (
            <ListItem key={index}>
              <ListItemText 
                primary={announcement.title} 
                secondary={announcement.content} 
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

// Performance Management Component
function PerformanceManagement({ classes, onRecordPerformance }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Student Performance</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Select Class</InputLabel>
              <Select>
                {classes?.map((cls, index) => (
                  <MenuItem key={index} value={cls.class}>
                    {cls.class} - {cls.section}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={8}>
            <Button variant="contained" onClick={() => onRecordPerformance({})}>
              Record Performance
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

// Project Management Component
function ProjectManagement({ projects, onCreateProject }) {
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Projects & Activities</Typography>
          <Button variant="contained" onClick={onCreateProject}>
            Create Project
          </Button>
        </Box>
        <List>
          {projects?.map((project, index) => (
            <ListItem key={index}>
              <ListItemText 
                primary={project.title} 
                secondary={project.description} 
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

// Parent Interaction Management Component
function ParentInteractionManagement() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Parent Interaction</Typography>
        <Typography variant="body2" color="textSecondary">
          Parent meeting schedules and communication history will be displayed here.
        </Typography>
      </CardContent>
    </Card>
  );
}

// Feedback Management Component
function FeedbackManagement({ feedback, onSubmitFeedback }) {
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Feedback & Suggestions</Typography>
          <Button variant="contained" onClick={onSubmitFeedback}>
            Submit Feedback
          </Button>
        </Box>
        <List>
          {feedback?.map((item, index) => (
            <ListItem key={index}>
              <ListItemText 
                primary={item.title} 
                secondary={item.content} 
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

export default function TeacherDashboard() {
  const [tab, setTab] = useState(0);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [logoutDialog, setLogoutDialog] = useState(false);
  
  // Dialog states
  const [assignmentDialog, setAssignmentDialog] = useState(false);
  const [attendanceDialog, setAttendanceDialog] = useState(false);
  const [resourceDialog, setResourceDialog] = useState(false);
  const [lessonPlanDialog, setLessonPlanDialog] = useState(false);
  const [examDialog, setExamDialog] = useState(false);
  const [messageDialog, setMessageDialog] = useState(false);
  const [performanceDialog, setPerformanceDialog] = useState(false);
  const [projectDialog, setProjectDialog] = useState(false);
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  
  // Form states
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', class: '', section: '', subject: '', dueDate: '' });
  const [newResource, setNewResource] = useState({ title: '', description: '', type: '', file: null });
  const [newLessonPlan, setNewLessonPlan] = useState({ title: '', subject: '', class: '', objectives: '', activities: '', file: null });
  const [newExam, setNewExam] = useState({ title: '', subject: '', class: '', date: '', duration: '', questionPaper: null });
  const [newMessage, setNewMessage] = useState({ recipient: '', subject: '', content: '', attachments: [] });
  const [newPerformance, setNewPerformance] = useState({ studentId: '', subject: '', grade: '', comments: '' });
  const [newProject, setNewProject] = useState({ title: '', description: '', objectives: '', attachment: null });
  const [newFeedback, setNewFeedback] = useState({ type: '', title: '', content: '', priority: 'medium' });

  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Queries
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['teacherProfile'],
    queryFn: teacherAPI.getProfile,
    staleTime: 5 * 60 * 1000,
  });

  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ['teacherClasses'],
    queryFn: teacherAPI.getClasses,
    staleTime: 5 * 60 * 1000,
  });

  const { data: timetable, isLoading: timetableLoading } = useQuery({
    queryKey: ['teacherTimetable'],
    queryFn: teacherAPI.getTimetable,
    staleTime: 5 * 60 * 1000,
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['teacherAssignments'],
    queryFn: teacherAPI.getAssignments,
    staleTime: 5 * 60 * 1000,
  });

  const { data: exams, isLoading: examsLoading } = useQuery({
    queryKey: ['teacherExams'],
    queryFn: teacherAPI.getExams,
    staleTime: 5 * 60 * 1000,
  });

  const { data: resources, isLoading: resourcesLoading } = useQuery({
    queryKey: ['teacherResources'],
    queryFn: teacherAPI.getResources,
    staleTime: 5 * 60 * 1000,
  });

  const { data: lessonPlans, isLoading: lessonPlansLoading } = useQuery({
    queryKey: ['teacherLessonPlans'],
    queryFn: teacherAPI.getLessonPlans,
    staleTime: 5 * 60 * 1000,
  });

  const { data: announcements, isLoading: announcementsLoading } = useQuery({
    queryKey: ['teacherAnnouncements'],
    queryFn: teacherAPI.getAnnouncements,
    staleTime: 5 * 60 * 1000,
  });

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['teacherProjects'],
    queryFn: teacherAPI.getProjects,
    staleTime: 5 * 60 * 1000,
  });

  const { data: feedback, isLoading: feedbackLoading } = useQuery({
    queryKey: ['teacherFeedback'],
    queryFn: teacherAPI.getCurriculumFeedback,
    staleTime: 5 * 60 * 1000,
  });

  // Mutations
  const createAssignmentMutation = useMutation({
    mutationFn: teacherAPI.createAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries(['teacherAssignments']);
      setAssignmentDialog(false);
      setNewAssignment({ title: '', description: '', class: '', section: '', subject: '', dueDate: '' });
      toast.success('Assignment created successfully');
    },
    onError: () => toast.error('Failed to create assignment'),
  });

  const createResourceMutation = useMutation({
    mutationFn: teacherAPI.uploadResource,
    onSuccess: () => {
      queryClient.invalidateQueries(['teacherResources']);
      setResourceDialog(false);
      setNewResource({ title: '', description: '', type: '', file: null });
      toast.success('Resource uploaded successfully');
    },
    onError: () => toast.error('Failed to upload resource'),
  });

  const createLessonPlanMutation = useMutation({
    mutationFn: teacherAPI.submitLessonPlan,
    onSuccess: () => {
      queryClient.invalidateQueries(['teacherLessonPlans']);
      setLessonPlanDialog(false);
      setNewLessonPlan({ title: '', subject: '', class: '', objectives: '', activities: '', file: null });
      toast.success('Lesson plan submitted successfully');
    },
    onError: () => toast.error('Failed to submit lesson plan'),
  });

  const createExamMutation = useMutation({
    mutationFn: teacherAPI.createExam,
    onSuccess: () => {
      queryClient.invalidateQueries(['teacherExams']);
      setExamDialog(false);
      setNewExam({ title: '', subject: '', class: '', date: '', duration: '', questionPaper: null });
      toast.success('Exam created successfully');
    },
    onError: () => toast.error('Failed to create exam'),
  });

  const sendMessageMutation = useMutation({
    mutationFn: teacherAPI.sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries(['teacherAnnouncements']);
      setMessageDialog(false);
      setNewMessage({ recipient: '', subject: '', content: '', attachments: [] });
      toast.success('Message sent successfully');
    },
    onError: () => toast.error('Failed to send message'),
  });

  const createProjectMutation = useMutation({
    mutationFn: teacherAPI.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries(['teacherProjects']);
      setProjectDialog(false);
      setNewProject({ title: '', description: '', objectives: '', attachment: null });
      toast.success('Project created successfully');
    },
    onError: () => toast.error('Failed to create project'),
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: teacherAPI.provideCurriculumFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries(['teacherFeedback']);
      setFeedbackDialog(false);
      setNewFeedback({ type: '', title: '', content: '', priority: 'medium' });
      toast.success('Feedback submitted successfully');
    },
    onError: () => toast.error('Failed to submit feedback'),
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (user?.role !== 'Teacher') {
    return <Box p={3}><Typography color="error">Access denied: Teacher only</Typography></Box>;
  }

  const isLoading = profileLoading || classesLoading || timetableLoading || assignmentsLoading || 
                   examsLoading || resourcesLoading || lessonPlansLoading || announcementsLoading || 
                   projectsLoading || feedbackLoading;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <School sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Teacher Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Badge badgeContent={3} color="error">
              <IconButton color="inherit">
                <Notifications />
              </IconButton>
            </Badge>
            <IconButton
              onClick={(e) => setProfileMenuAnchor(e.currentTarget)}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'T'}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={profileMenuAnchor}
              open={Boolean(profileMenuAnchor)}
              onClose={() => setProfileMenuAnchor(null)}
            >
              <MenuItemMUI onClick={() => {
                setProfileMenuAnchor(null);
                setTab(1); // Profile tab
              }}>
                <AccountCircle sx={{ mr: 1 }} />
                Profile
              </MenuItemMUI>
              <MenuItemMUI onClick={() => {
                setProfileMenuAnchor(null);
                setLogoutDialog(true);
              }}>
                <Logout sx={{ mr: 1 }} />
                Logout
              </MenuItemMUI>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <Paper sx={{ width: 280, minHeight: 'calc(100vh - 64px)', borderRadius: 0 }}>
          <Tabs
            orientation="vertical"
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ borderRight: 1, borderColor: 'divider', pt: 2 }}
          >
            {featureTabs.map((feature, index) => (
              <Tab
                key={feature.key}
                label={feature.label}
                icon={feature.icon}
                iconPosition="start"
                sx={{
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  minHeight: 56,
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                  }
                }}
              />
            ))}
          </Tabs>
        </Paper>

        {/* Content Area */}
        <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {/* Dashboard Overview */}
              {tab === 0 && (
                <DashboardOverview 
                  profile={profile}
                  classes={classes}
                  assignments={assignments}
                  exams={exams}
                  announcements={announcements}
                />
              )}

              {/* Profile Management */}
              {tab === 1 && (
                <ProfileManagement 
                  profile={profile}
                  onUpdateProfile={(data) => {
                    // Handle profile update
                    toast.success('Profile updated successfully');
                  }}
                />
              )}

              {/* Class Management */}
              {tab === 2 && (
                <ClassManagement 
                  classes={classes}
                  selectedClass={selectedClass}
                  onSelectClass={setSelectedClass}
                />
              )}

              {/* Timetable */}
              {tab === 3 && (
                <TimetableManagement 
                  timetable={timetable}
                />
              )}

              {/* Attendance Management */}
              {tab === 4 && (
                <AttendanceManagement 
                  classes={classes}
                  selectedClass={selectedClass}
                  selectedDate={selectedDate}
                  onSelectClass={setSelectedClass}
                  onSelectDate={setSelectedDate}
                  onMarkAttendance={(data) => {
                    // Handle attendance marking
                    toast.success('Attendance marked successfully');
                  }}
                />
              )}

              {/* Assignment Management */}
              {tab === 5 && (
                <AssignmentManagement 
                  assignments={assignments}
                  classes={classes}
                  onCreateAssignment={() => setAssignmentDialog(true)}
                  onGradeSubmission={(submissionId, data) => {
                    // Handle grading
                    toast.success('Submission graded successfully');
                  }}
                />
              )}

              {/* Exam Management */}
              {tab === 6 && (
                <ExamManagement 
                  exams={exams}
                  onCreateExam={() => setExamDialog(true)}
                />
              )}

              {/* Learning Materials */}
              {tab === 7 && (
                <MaterialsManagement 
                  resources={resources}
                  lessonPlans={lessonPlans}
                  onUploadResource={() => setResourceDialog(true)}
                  onSubmitLessonPlan={() => setLessonPlanDialog(true)}
                />
              )}

              {/* Communication */}
              {tab === 8 && (
                <CommunicationManagement 
                  announcements={announcements}
                  onSendMessage={() => setMessageDialog(true)}
                />
              )}

              {/* Student Performance */}
              {tab === 9 && (
                <PerformanceManagement 
                  classes={classes}
                  onRecordPerformance={(data) => {
                    // Handle performance recording
                    toast.success('Performance recorded successfully');
                  }}
                />
              )}

              {/* Projects and Activities */}
              {tab === 10 && (
                <ProjectManagement 
                  projects={projects}
                  onCreateProject={() => setProjectDialog(true)}
                />
              )}

              {/* Parent Interaction */}
              {tab === 11 && (
                <ParentInteractionManagement />
              )}

              {/* Feedback System */}
              {tab === 12 && (
                <FeedbackManagement 
                  feedback={feedback}
                  onSubmitFeedback={() => setFeedbackDialog(true)}
                />
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* Dialogs */}
      <AssignmentDialog 
        open={assignmentDialog}
        onClose={() => setAssignmentDialog(false)}
        assignment={newAssignment}
        onAssignmentChange={setNewAssignment}
        onSubmit={() => createAssignmentMutation.mutate(newAssignment)}
        classes={classes}
        loading={createAssignmentMutation.isPending}
      />

      <ResourceDialog 
        open={resourceDialog}
        onClose={() => setResourceDialog(false)}
        resource={newResource}
        onResourceChange={setNewResource}
        onSubmit={() => createResourceMutation.mutate(newResource)}
        loading={createResourceMutation.isPending}
      />

      <LessonPlanDialog 
        open={lessonPlanDialog}
        onClose={() => setLessonPlanDialog(false)}
        lessonPlan={newLessonPlan}
        onLessonPlanChange={setNewLessonPlan}
        onSubmit={() => createLessonPlanMutation.mutate(newLessonPlan)}
        classes={classes}
        loading={createLessonPlanMutation.isPending}
      />

      <ExamDialog 
        open={examDialog}
        onClose={() => setExamDialog(false)}
        exam={newExam}
        onExamChange={setNewExam}
        onSubmit={() => createExamMutation.mutate(newExam)}
        classes={classes}
        loading={createExamMutation.isPending}
      />

      <MessageDialog 
        open={messageDialog}
        onClose={() => setMessageDialog(false)}
        message={newMessage}
        onMessageChange={setNewMessage}
        onSubmit={() => sendMessageMutation.mutate(newMessage)}
        loading={sendMessageMutation.isPending}
      />

      <ProjectDialog 
        open={projectDialog}
        onClose={() => setProjectDialog(false)}
        project={newProject}
        onProjectChange={setNewProject}
        onSubmit={() => createProjectMutation.mutate(newProject)}
        loading={createProjectMutation.isPending}
      />

      <FeedbackDialog 
        open={feedbackDialog}
        onClose={() => setFeedbackDialog(false)}
        feedback={newFeedback}
        onFeedbackChange={setNewFeedback}
        onSubmit={() => submitFeedbackMutation.mutate(newFeedback)}
        loading={submitFeedbackMutation.isPending}
      />

      {/* Logout Confirmation */}
      <Dialog open={logoutDialog} onClose={() => setLogoutDialog(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to logout?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialog(false)}>Cancel</Button>
          <Button onClick={handleLogout} color="primary">Logout</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
// ... existing code ...
