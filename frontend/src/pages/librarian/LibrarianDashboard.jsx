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
  FormControlLabel
} from '@mui/material';
import {
  Book as BookIcon,
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
  LibraryBooks as LibraryIcon,
  Category as CategoryIcon,
  LocalLibrary as StudentIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon
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

// Book Card Component
const BookCard = ({ book, onEdit, onDelete, onBorrow }) => (
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
            color={book.status === 'Available' ? 'success' : 'warning'} 
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          By {book.author}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          ISBN: {book.isbn}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Category: {book.category}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
          <IconButton size="small" onClick={() => onEdit(book)}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete(book._id)}>
            <DeleteIcon />
          </IconButton>
          {book.status === 'Available' && (
            <IconButton size="small" onClick={() => onBorrow(book)}>
              <BookmarkBorderIcon />
            </IconButton>
          )}
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
  const queryClient = useQueryClient();

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [bookDialog, setBookDialog] = useState(false);
  const [borrowDialog, setBorrowDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    description: '',
    copies: 1,
    location: '',
    publishedYear: ''
  });
  const [borrowForm, setBorrowForm] = useState({
    studentId: '',
    bookId: '',
    dueDate: '',
    remarks: ''
  });

  // Mock data - replace with actual API calls
  const libraryStats = {
    totalBooks: 1250,
    borrowedBooks: 89,
    availableBooks: 1161,
    overdueBooks: 12,
    totalStudents: 450,
    activeBorrowers: 67
  };

  const books = [
    {
      _id: '1',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '978-0743273565',
      category: 'Fiction',
      status: 'Available',
      copies: 3,
      location: 'Shelf A1'
    },
    {
      _id: '2',
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      isbn: '978-0446310789',
      category: 'Fiction',
      status: 'Borrowed',
      copies: 2,
      location: 'Shelf A2'
    }
  ];

  const borrowHistory = [
    {
      _id: '1',
      studentName: 'John Doe',
      bookTitle: 'The Great Gatsby',
      borrowedDate: '2024-01-15',
      dueDate: '2024-02-15',
      status: 'Active'
    }
  ];

  // Helper functions
  const resetBookForm = () => {
    setBookForm({
      title: '',
      author: '',
      isbn: '',
      category: '',
      description: '',
      copies: 1,
      location: '',
      publishedYear: ''
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

  const handleBorrowSubmit = () => {
    if (!borrowForm.studentId || !borrowForm.bookId || !borrowForm.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    // Borrow logic here
    setBorrowDialog(false);
    toast.success('Book borrowed successfully');
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
              Comprehensive Book and Student Management
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
              subtitle="In library collection"
              trend={5.2}
              delay={0.1}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStatCard
              icon={StudentIcon}
              label="Borrowed Books"
              value={libraryStats.borrowedBooks}
              color={theme.palette.warning.main}
              subtitle="Currently borrowed"
              trend={-2.1}
              delay={0.2}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStatCard
              icon={BookmarkIcon}
              label="Available Books"
              value={libraryStats.availableBooks}
              color={theme.palette.success.main}
              subtitle="Ready for borrowing"
              trend={8.7}
              delay={0.3}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStatCard
              icon={WarningIcon}
              label="Overdue Books"
              value={libraryStats.overdueBooks}
              color={theme.palette.error.main}
              subtitle="Need attention"
              trend={-15.3}
              delay={0.4}
            />
          </Grid>
        </Grid>

        {/* Main Content Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Overview" icon={<TimelineIcon />} />
            <Tab label="Books" icon={<BookIcon />} />
            <Tab label="Borrowing" icon={<StudentIcon />} />
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
                    <Typography variant="h6" sx={{ mb: 2 }}>Borrowing Trends</Typography>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { month: 'Jan', borrowed: 45, returned: 42, overdue: 3 },
                        { month: 'Feb', borrowed: 52, returned: 48, overdue: 4 },
                        { month: 'Mar', borrowed: 38, returned: 35, overdue: 3 },
                        { month: 'Apr', borrowed: 61, returned: 58, overdue: 3 },
                        { month: 'May', borrowed: 55, returned: 52, overdue: 3 },
                        { month: 'Jun', borrowed: 67, returned: 64, overdue: 3 },
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
              <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setBookDialog(true)}
                  sx={{ px: 3, py: 1.5 }}
                >
                  Add New Book
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                >
                  Import Books
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                >
                  Export Catalog
                </Button>
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
                        // Delete logic
                        toast.success('Book deleted successfully');
                      }}
                      onBorrow={(book) => {
                        setSelectedBook(book);
                        setBorrowForm({ ...borrowForm, bookId: book._id });
                        setBorrowDialog(true);
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          )}

          {activeTab === 2 && (
            <motion.div
              key="borrowing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Borrowing History</Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Book</TableCell>
                      <TableCell>Borrowed Date</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {borrowHistory.map((record) => (
                      <TableRow key={record._id}>
                        <TableCell>{record.studentName}</TableCell>
                        <TableCell>{record.bookTitle}</TableCell>
                        <TableCell>{record.borrowedDate}</TableCell>
                        <TableCell>{record.dueDate}</TableCell>
                        <TableCell>
                          <Chip 
                            label={record.status} 
                            size="small" 
                            color={record.status === 'Active' ? 'success' : 'warning'} 
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small">
                            <CheckCircleIcon />
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
                    <Typography variant="h6" sx={{ mb: 2 }}>Popular Books</Typography>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { title: 'The Great Gatsby', borrows: 25 },
                        { title: 'To Kill a Mockingbird', borrows: 22 },
                        { title: '1984', borrows: 18 },
                        { title: 'Pride and Prejudice', borrows: 15 },
                        { title: 'The Catcher in the Rye', borrows: 12 }
                      ]}>
                        <XAxis dataKey="title" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="borrows" fill={theme.palette.primary.main} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, height: 400 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Monthly Activity</Typography>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[
                        { month: 'Jan', newBooks: 15, borrows: 45 },
                        { month: 'Feb', newBooks: 12, borrows: 52 },
                        { month: 'Mar', newBooks: 18, borrows: 38 },
                        { month: 'Apr', newBooks: 10, borrows: 61 },
                        { month: 'May', newBooks: 22, borrows: 55 },
                        { month: 'Jun', newBooks: 14, borrows: 67 }
                      ]}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line type="monotone" dataKey="newBooks" stroke={theme.palette.success.main} />
                        <Line type="monotone" dataKey="borrows" stroke={theme.palette.primary.main} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Book Dialog */}
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
                <TextField
                  label="Category"
                  fullWidth
                  value={bookForm.category}
                  onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Published Year"
                  fullWidth
                  value={bookForm.publishedYear}
                  onChange={(e) => setBookForm({ ...bookForm, publishedYear: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Location"
                  fullWidth
                  value={bookForm.location}
                  onChange={(e) => setBookForm({ ...bookForm, location: e.target.value })}
                />
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
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  multiline
                  rows={3}
                  fullWidth
                  value={bookForm.description}
                  onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                />
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

        {/* Borrow Book Dialog */}
        <Dialog open={borrowDialog} onClose={() => setBorrowDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Borrow Book</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Student</InputLabel>
                  <Select
                    value={borrowForm.studentId}
                    onChange={(e) => setBorrowForm({ ...borrowForm, studentId: e.target.value })}
                  >
                    <MenuItem value="1">John Doe - Class 10A</MenuItem>
                    <MenuItem value="2">Jane Smith - Class 11B</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Due Date"
                  type="date"
                  fullWidth
                  value={borrowForm.dueDate}
                  onChange={(e) => setBorrowForm({ ...borrowForm, dueDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Remarks"
                  multiline
                  rows={2}
                  fullWidth
                  value={borrowForm.remarks}
                  onChange={(e) => setBorrowForm({ ...borrowForm, remarks: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBorrowDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleBorrowSubmit}>
              Borrow Book
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default LibrarianDashboard; 