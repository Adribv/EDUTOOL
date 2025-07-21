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
  Avatar,
  Badge
} from '@mui/material';
import {
  LibraryBooks as LibraryIcon,
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
  Book as BookIcon,
  Bookmark as BookmarkIcon,
  LocalLibrary as LocalLibraryIcon,
  School as StudentIcon,
  Inventory as InventoryIcon,
  RateReview as RemarksIcon,
  Feedback as FeedbackIcon,
  Event as EventIcon,
  Message as MessageIcon
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
import { useStaffPermissions } from '../../context/StaffPermissionContext';
import { 
  PermissionGate, 
  PermissionFeatureCard, 
  PermissionNavItem, 
  PermissionButton,
  PermissionStatus 
} from '../../components/permissions/PermissionGate';
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

// Book Card Component
const BookCard = ({ book, onEdit, onDelete, onView }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <BookIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
            {book.title}
          </Typography>
          <Chip 
            label={book.status} 
            size="small" 
            color={book.status === 'Available' ? 'success' : book.status === 'Borrowed' ? 'warning' : 'error'} 
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Author: {book.author}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          ISBN: {book.isbn}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Category: {book.category}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
          <IconButton size="small" onClick={() => onView(book)}>
            <ViewIcon />
          </IconButton>
          <IconButton size="small" onClick={() => onEdit(book)}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete(book._id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

// Librarian Dashboard
const LibrarianDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { getUserFeaturePermissions } = useStaffPermissions();
  const queryClient = useQueryClient();

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [bookDialog, setBookDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    copies: '',
    status: 'Available'
  });

  // Get user permissions
  const userPermissions = getUserFeaturePermissions();

  // Mock data - replace with actual API calls
  const libraryStats = {
    totalBooks: 1250,
    borrowedBooks: 342,
    availableBooks: 908,
    totalMembers: 450,
    overdueBooks: 15,
    totalCategories: 25
  };

  const books = [
    {
      _id: '1',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '978-0743273565',
      category: 'Fiction',
      status: 'Available',
      copies: 3
    },
    {
      _id: '2',
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      isbn: '978-0446310789',
      category: 'Fiction',
      status: 'Borrowed',
      copies: 2
    }
  ];

  // Helper functions
  const resetBookForm = () => {
    setBookForm({
      title: '',
      author: '',
      isbn: '',
      category: '',
      copies: '',
      status: 'Available'
    });
  };

  const handleBookSubmit = () => {
    if (!bookForm.title || !bookForm.author || !bookForm.isbn) {
      toast.error('Please fill in all required fields');
      return;
    }
    // Add book logic here
    setBookDialog(false);
    resetBookForm();
    toast.success('Book added successfully');
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
              Library Management System
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Comprehensive Library Resource Management
            </Typography>
          </motion.div>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Profile">
              <IconButton onClick={() => navigate('/librarian/profile')} sx={{ color: 'white' }}>
                <AccountCircle />
              </IconButton>
            </Tooltip>
            <Tooltip title="Logout">
              <IconButton onClick={async () => { await logout(); navigate('/librarian-login'); }} sx={{ color: 'white' }}>
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
              icon={BookIcon}
              label="Total Books"
              value={libraryStats.totalBooks}
              color={theme.palette.primary.main}
              subtitle="In library"
              trend={12.5}
              delay={0.1}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStatCard
              icon={BookmarkIcon}
              label="Borrowed Books"
              value={libraryStats.borrowedBooks}
              color={theme.palette.warning.main}
              subtitle="Currently out"
              trend={8.7}
              delay={0.2}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStatCard
              icon={LocalLibraryIcon}
              label="Available Books"
              value={libraryStats.availableBooks}
              color={theme.palette.success.main}
              subtitle="Ready to borrow"
              trend={15.3}
              delay={0.3}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStatCard
              icon={StudentIcon}
              label="Total Members"
              value={libraryStats.totalMembers}
              color={theme.palette.info.main}
              subtitle="Registered users"
              trend={5.2}
              delay={0.4}
            />
          </Grid>
        </Grid>

        {/* Feature Cards with Permissions */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <PermissionFeatureCard
              title="Inventory Management"
              description="Manage library inventory and book catalog"
              icon={InventoryIcon}
              permission="inventory.view_inventory"
              color="primary"
              onClick={() => setActiveTab(1)}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {libraryStats.totalBooks} books in catalog
                </Typography>
                <PermissionStatus permission="inventory.view_inventory" />
              </Box>
            </PermissionFeatureCard>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <PermissionFeatureCard
              title="Student Records"
              description="Access student information and records"
              icon={StudentIcon}
              permission="student_records.view_students"
              color="success"
              onClick={() => console.log('Navigate to student records')}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {libraryStats.totalMembers} registered students
                </Typography>
                <PermissionStatus permission="student_records.view_students" />
              </Box>
            </PermissionFeatureCard>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <PermissionFeatureCard
              title="Teacher Remarks"
              description="View and manage teacher remarks"
              icon={RemarksIcon}
              permission="teacher_remarks.view_remarks"
              color="warning"
              onClick={() => console.log('Navigate to teacher remarks')}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Access teacher feedback
                </Typography>
                <PermissionStatus permission="teacher_remarks.view_remarks" />
              </Box>
            </PermissionFeatureCard>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <PermissionFeatureCard
              title="Feedback System"
              description="Manage feedback and suggestions"
              icon={FeedbackIcon}
              permission="feedbacks.view_feedback"
              color="info"
              onClick={() => console.log('Navigate to feedback')}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Respond to user feedback
                </Typography>
                <PermissionStatus permission="feedbacks.view_feedback" />
              </Box>
            </PermissionFeatureCard>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <PermissionFeatureCard
              title="Event Management"
              description="Manage library events and activities"
              icon={EventIcon}
              permission="events.view_events"
              color="secondary"
              onClick={() => console.log('Navigate to events')}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Library events and activities
                </Typography>
                <PermissionStatus permission="events.view_events" />
              </Box>
            </PermissionFeatureCard>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <PermissionFeatureCard
              title="Communication"
              description="Send messages and announcements"
              icon={MessageIcon}
              permission="communication.send_messages"
              color="error"
              onClick={() => console.log('Navigate to communication')}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Send messages to users
                </Typography>
                <PermissionStatus permission="communication.send_messages" />
              </Box>
            </PermissionFeatureCard>
          </Grid>
        </Grid>

        {/* Main Content Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Overview" icon={<TimelineIcon />} />
            <Tab label="Books" icon={<BookIcon />} />
            <Tab label="Members" icon={<PersonIcon />} />
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
                    <Typography variant="h6" sx={{ mb: 2 }}>Book Borrowing Trends</Typography>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { month: 'Jan', borrowed: 45, returned: 42, overdue: 3 },
                        { month: 'Feb', borrowed: 52, returned: 48, overdue: 4 },
                        { month: 'Mar', borrowed: 38, returned: 35, overdue: 3 },
                        { month: 'Apr', borrowed: 61, returned: 58, overdue: 3 },
                        { month: 'May', borrowed: 55, returned: 52, overdue: 3 },
                        { month: 'Jun', borrowed: 67, returned: 65, overdue: 2 },
                      ]}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Area type="monotone" dataKey="borrowed" stackId="1" stroke={theme.palette.primary.main} fill={theme.palette.primary.main} fillOpacity={0.6} />
                        <Area type="monotone" dataKey="returned" stackId="1" stroke={theme.palette.success.main} fill={theme.palette.success.main} fillOpacity={0.6} />
                        <Area type="monotone" dataKey="overdue" stackId="1" stroke={theme.palette.error.main} fill={theme.palette.error.main} fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, height: 400 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Book Categories</Typography>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Fiction', value: 450, color: theme.palette.primary.main },
                            { name: 'Non-Fiction', value: 380, color: theme.palette.secondary.main },
                            { name: 'Science', value: 220, color: theme.palette.success.main },
                            { name: 'History', value: 200, color: theme.palette.warning.main }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                        >
                          {[
                            { name: 'Fiction', value: 450, color: theme.palette.primary.main },
                            { name: 'Non-Fiction', value: 380, color: theme.palette.secondary.main },
                            { name: 'Science', value: 220, color: theme.palette.success.main },
                            { name: 'History', value: 200, color: theme.palette.warning.main }
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
              key="books"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PermissionGate permission="inventory.view_inventory">
                <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <PermissionButton
                    permission="inventory.manage_inventory"
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setBookDialog(true)}
                  >
                    Add Book
                  </PermissionButton>
                  <PermissionButton
                    permission="inventory.generate_reports"
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => console.log('Export books')}
                  >
                    Export Books
                  </PermissionButton>
                </Box>

                <Grid container spacing={3}>
                  {books.map((book) => (
                    <Grid item xs={12} sm={6} md={4} key={book._id}>
                      <BookCard
                        book={book}
                        onEdit={(book) => {
                          setSelectedBook(book);
                          setBookForm(book);
                          setBookDialog(true);
                        }}
                        onDelete={(id) => {
                          toast.success('Book deleted successfully');
                        }}
                        onView={(book) => {
                          console.log('View book:', book);
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </PermissionGate>
            </motion.div>
          )}

          {activeTab === 2 && (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PermissionGate permission="student_records.view_students">
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Library Members</Typography>
                  <Typography variant="body1" color="text.secondary">
                    Access to student records is available. You can view member information and manage library accounts.
                  </Typography>
                </Paper>
              </PermissionGate>
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
              <PermissionGate permission="inventory.generate_reports">
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: 400 }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>Monthly Borrowing Report</Typography>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { category: 'Fiction', borrowed: 45, returned: 42 },
                          { category: 'Non-Fiction', borrowed: 38, returned: 35 },
                          { category: 'Science', borrowed: 22, returned: 20 },
                          { category: 'History', borrowed: 20, returned: 18 }
                        ]}>
                          <XAxis dataKey="category" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Bar dataKey="borrowed" fill={theme.palette.primary.main} />
                          <Bar dataKey="returned" fill={theme.palette.success.main} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: 400 }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>Member Activity</Typography>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[
                          { month: 'Jan', active: 120, new: 15 },
                          { month: 'Feb', active: 135, new: 18 },
                          { month: 'Mar', active: 110, new: 12 },
                          { month: 'Apr', active: 145, new: 22 },
                          { month: 'May', active: 130, new: 16 },
                          { month: 'Jun', active: 155, new: 25 }
                        ]}>
                          <XAxis dataKey="month" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Line type="monotone" dataKey="active" stroke={theme.palette.primary.main} />
                          <Line type="monotone" dataKey="new" stroke={theme.palette.success.main} />
                        </LineChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                </Grid>
              </PermissionGate>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Book Dialog */}
        <Dialog open={bookDialog} onClose={() => setBookDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>{selectedBook ? 'Edit Book' : 'Add New Book'}</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Book Title"
                  fullWidth
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Author"
                  fullWidth
                  value={bookForm.author}
                  onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="ISBN"
                  fullWidth
                  value={bookForm.isbn}
                  onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={bookForm.category}
                    onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                  >
                    <MenuItem value="Fiction">Fiction</MenuItem>
                    <MenuItem value="Non-Fiction">Non-Fiction</MenuItem>
                    <MenuItem value="Science">Science</MenuItem>
                    <MenuItem value="History">History</MenuItem>
                    <MenuItem value="Biography">Biography</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Number of Copies"
                  type="number"
                  fullWidth
                  value={bookForm.copies}
                  onChange={(e) => setBookForm({ ...bookForm, copies: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={bookForm.status}
                    onChange={(e) => setBookForm({ ...bookForm, status: e.target.value })}
                  >
                    <MenuItem value="Available">Available</MenuItem>
                    <MenuItem value="Borrowed">Borrowed</MenuItem>
                    <MenuItem value="Maintenance">Maintenance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBookDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleBookSubmit}>
              {selectedBook ? 'Update Book' : 'Add Book'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default LibrarianDashboard; 