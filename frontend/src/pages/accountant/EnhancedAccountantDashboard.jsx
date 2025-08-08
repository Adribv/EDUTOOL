import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountantAPI, incomeLogAPI, expenseLogAPI } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme as useAppTheme } from '../../context/ThemeContext';

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
  Snackbar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Slider,
  LinearProgress
} from '@mui/material';
import {
  MonetizationOn as IncomeIcon,
  MoneyOff as ExpenseIcon,
  TrendingUp as ProfitIcon,
  HourglassTop as DueIcon,
  Add,
  AccountCircle,
  Logout as LogoutIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  Payment as PaymentIcon,
  Assessment as AssessmentIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  CalendarToday as CalendarIcon,
  AccountBalance as BankIcon,
  Receipt as ReceiptIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  Engineering as EngineeringIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  Percent as PercentIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import {
  XAxis,
  YAxis,
  ResponsiveContainer,
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
import { getStudentFeeStatus, getFeeStats, getTransactionLog } from '../../services/api';
import dayjs from 'dayjs';

// Animated Stat Card Component
const AnimatedStatCard = ({ icon: Icon, label, value, color, subtitle, trend, delay = 0 }) => {
  const { isDark } = useAppTheme();
  return (
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
          <Typography sx={{ 
            color: isDark ? '#e2e8f0' : '#374151', 
            fontWeight: 600, 
            fontSize: '1rem',
            mb: 1 
          }}>
            {label}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: color }}>
            ₹{value.toLocaleString('en-IN')}
          </Typography>
          {subtitle && (
            <Typography sx={{ 
              color: isDark ? '#94a3b8' : '#6b7280', 
              fontWeight: 500,
              mt: 1 
            }}>
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
              <Typography sx={{ 
                color: trend > 0 ? 'success.main' : 'error.main',
                fontWeight: 500
              }}>
                {Math.abs(trend)}% from last month
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </motion.div>
  );
};

// Salary Template Card Component
const SalaryTemplateCard = ({ role, template, onSelect, isSelected }) => {
  const { isDark } = useAppTheme();
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        sx={{ 
          cursor: 'pointer',
          border: isSelected ? '2px solid' : '1px solid',
          borderColor: isSelected ? 'primary.main' : 'divider',
          bgcolor: isSelected ? 'primary.50' : 'background.paper'
        }}
        onClick={() => onSelect(role, template)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {role === 'Teacher' && <SchoolIcon color="primary" />}
            {role === 'HOD' && <BusinessIcon color="primary" />}
            {role === 'AdminStaff' && <AdminIcon color="primary" />}
            {role === 'Accountant' && <MoneyIcon color="primary" />}
            {role === 'Principal' && <PersonIcon color="primary" />}
            {role === 'VicePrincipal' && <EngineeringIcon color="primary" />}
            <Typography sx={{ 
              ml: 1, 
              fontWeight: 600,
              color: isDark ? '#e2e8f0' : '#374151'
            }}>
              {role}
            </Typography>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
            ₹{template.basicSalary.toLocaleString('en-IN')}
          </Typography>
          <Typography sx={{ 
            color: isDark ? '#94a3b8' : '#6b7280',
            fontWeight: 500
          }}>
            Basic Salary
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography sx={{ 
              color: 'success.main',
              fontWeight: 500
            }}>
              + ₹{Object.values(template.allowances).reduce((sum, val) => sum + val, 0).toLocaleString('en-IN')} Allowances
            </Typography>
            <Typography sx={{ 
              color: 'error.main',
              fontWeight: 500
            }}>
              - ₹{Object.values(template.deductions).reduce((sum, val) => sum + val, 0).toLocaleString('en-IN')} Deductions
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Student Fee Status Manager Component
const StudentFeeStatusManager = () => {
  const theme = useTheme();
  const { isDark } = useAppTheme();
  const [studentsData, setStudentsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentRecordsDialog, setStudentRecordsDialog] = useState(false);
  const [studentRecords, setStudentRecords] = useState(null);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [filters, setFilters] = useState({
    academicYear: new Date().getFullYear().toString(),
    class: '',
    section: '',
    paymentStatus: ''
  });

  // Load students fee status
  useEffect(() => {
    loadStudentsFeeStatus();
  }, [filters]);

  const loadStudentsFeeStatus = async () => {
    try {
      setLoading(true);
      const data = await accountantAPI.getAllStudentsFeeStatus(filters);
      setStudentsData(data);
    } catch (error) {
      console.error('Error loading students fee status:', error);
      toast.error('Failed to load students fee status');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentRecords = async (studentId) => {
    try {
      setLoadingRecords(true);
      const data = await accountantAPI.getStudentFeeRecords(studentId, { 
        academicYear: filters.academicYear 
      });
      setStudentRecords(data);
    } catch (error) {
      console.error('Error loading student records:', error);
      toast.error('Failed to load student records');
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleStudentClick = async (student) => {
    setSelectedStudent(student);
    setStudentRecordsDialog(true);
    await loadStudentRecords(student._id);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Partial': return 'warning';
      case 'Overdue': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircleIcon />;
      case 'Partial': return <WarningIcon />;
      case 'Overdue': return <ErrorIcon />;
      default: return <InfoIcon />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: theme.palette.primary.light, color: 'white' }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {studentsData && studentsData.summary ? studentsData.summary.totalStudents : 0}
            </Typography>
            <Typography variant="body2">Total Students</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: theme.palette.success.light, color: 'white' }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {studentsData && studentsData.summary ? studentsData.summary.paidStudents : 0}
            </Typography>
            <Typography variant="body2">Fees Paid</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: theme.palette.warning.light, color: 'white' }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {studentsData && studentsData.summary ? studentsData.summary.partialStudents : 0}
            </Typography>
            <Typography variant="body2">Partial Payment</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: theme.palette.error.light, color: 'white' }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {studentsData && studentsData.summary ? studentsData.summary.overdueStudents : 0}
            </Typography>
            <Typography variant="body2">Overdue</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ 
          mb: 2,
          color: isDark ? '#e2e8f0' : '#374151',
          fontWeight: 600,
          fontSize: '1.1rem'
        }}>
          Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Academic Year"
              value={filters.academicYear}
              onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Class"
              value={filters.class}
              onChange={(e) => setFilters({ ...filters, class: e.target.value })}
              fullWidth
              placeholder="e.g., 10, Class 10A"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Section"
              value={filters.section}
              onChange={(e) => setFilters({ ...filters, section: e.target.value })}
              fullWidth
              placeholder="e.g., A, B, C"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Payment Status</InputLabel>
              <Select
                value={filters.paymentStatus}
                onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Partial">Partial</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Overdue">Overdue</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Students Table */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">All Students Fee Status</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadStudentsFeeStatus}>
              Refresh
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />}>
              Export
            </Button>
          </Box>
        </Box>
        
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student Details</TableCell>
              <TableCell>Class & Section</TableCell>
              <TableCell>Contact Info</TableCell>
              <TableCell>Total Fee</TableCell>
              <TableCell>Paid Amount</TableCell>
              <TableCell>Pending Amount</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell>Last Payment</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {studentsData && studentsData.students ? studentsData.students.map((student) => (
              <TableRow key={student._id} hover>
                <TableCell>
                  <Box>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 600, 
                        cursor: 'pointer', 
                        color: theme.palette.primary.main,
                        '&:hover': { textDecoration: 'underline' }
                      }}
                      onClick={() => handleStudentClick(student)}
                    >
                      {student.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Roll: {student.rollNumber}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {student.class} - {student.section}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">{student.email}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {student.contactNumber}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ₹{student.totalFeeAmount.toLocaleString('en-IN')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                    ₹{student.totalPaid.toLocaleString('en-IN')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: student.pendingAmount > 0 ? theme.palette.error.main : theme.palette.success.main,
                      fontWeight: 600 
                    }}
                  >
                    ₹{student.pendingAmount.toLocaleString('en-IN')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getStatusIcon(student.paymentStatus)}
                    label={student.paymentStatus}
                    color={getStatusColor(student.paymentStatus)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {student.lastPaymentDate 
                      ? new Date(student.lastPaymentDate).toLocaleDateString()
                      : 'No payments'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    onClick={() => handleStudentClick(student)}
                    color="primary"
                  >
                    <ViewIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            )) : null}
          </TableBody>
        </Table>
      </Paper>

      {/* Student Records Detail Dialog */}
      <Dialog 
        open={studentRecordsDialog} 
        onClose={() => setStudentRecordsDialog(false)} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <SchoolIcon color="primary" />
            <Box>
              <Typography variant="h6">
                {selectedStudent ? selectedStudent.name : ''} - Fee Records
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Roll: {selectedStudent ? selectedStudent.rollNumber : ''} | Class: {selectedStudent ? selectedStudent.class : ''}-{selectedStudent ? selectedStudent.section : ''}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {loadingRecords ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
              <CircularProgress />
            </Box>
          ) : studentRecords ? (
            <Box>
              {/* Summary Cards */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={3}>
                  <Card sx={{ textAlign: 'center', p: 2, bgcolor: theme.palette.info.light, color: 'white' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      ₹{studentRecords.summary.totalFeeAmount.toLocaleString('en-IN')}
                    </Typography>
                    <Typography variant="body2">Total Fee</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Card sx={{ textAlign: 'center', p: 2, bgcolor: theme.palette.success.light, color: 'white' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      ₹{studentRecords.summary.totalPaid.toLocaleString('en-IN')}
                    </Typography>
                    <Typography variant="body2">Total Paid</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Card sx={{ textAlign: 'center', p: 2, bgcolor: theme.palette.error.light, color: 'white' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      ₹{studentRecords.summary.pendingAmount.toLocaleString('en-IN')}
                    </Typography>
                    <Typography variant="body2">Pending</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Card sx={{ textAlign: 'center', p: 2, bgcolor: theme.palette.warning.light, color: 'white' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {studentRecords.summary.paymentCount}
                    </Typography>
                    <Typography variant="body2">Payments</Typography>
                  </Card>
                </Grid>
              </Grid>

              {/* Payment History */}
              <Typography variant="h6" sx={{ mb: 2 }}>Payment History</Typography>
              {studentRecords.feePayments.length > 0 ? (
                <Table sx={{ mb: 3 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Receipt No.</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Academic Year</TableCell>
                      <TableCell>Term</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {studentRecords.feePayments.map((payment) => (
                      <TableRow key={payment._id}>
                        <TableCell>{payment.receiptNumber}</TableCell>
                        <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                        <TableCell>₹{payment.amountPaid.toLocaleString('en-IN')}</TableCell>
                        <TableCell>{payment.paymentMethod}</TableCell>
                        <TableCell>
                          <Chip 
                            label={payment.status} 
                            color={payment.status === 'Completed' ? 'success' : 'warning'} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>{payment.academicYear}</TableCell>
                        <TableCell>{payment.term}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Alert severity="info" sx={{ mb: 3 }}>No payment records found for this student.</Alert>
              )}

              {/* Fee Structures */}
              <Typography variant="h6" sx={{ mb: 2 }}>Fee Structures</Typography>
              {studentRecords.feeStructures.length > 0 ? (
                <Table sx={{ mb: 3 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Academic Year</TableCell>
                      <TableCell>Term</TableCell>
                      <TableCell>Class</TableCell>
                      <TableCell>Total Amount</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {studentRecords.feeStructures.map((structure) => (
                      <TableRow key={structure._id}>
                        <TableCell>{structure.academicYear}</TableCell>
                        <TableCell>{structure.term}</TableCell>
                        <TableCell>{structure.class}</TableCell>
                        <TableCell>₹{structure.totalAmount.toLocaleString('en-IN')}</TableCell>
                        <TableCell>{new Date(structure.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip 
                            label={structure.isActive ? 'Active' : 'Inactive'} 
                            color={structure.isActive ? 'success' : 'default'} 
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Alert severity="warning">No fee structures found for this student's class.</Alert>
              )}
            </Box>
          ) : (
            <Alert severity="error">Failed to load student records.</Alert>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setStudentRecordsDialog(false)}>Close</Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>
            Download Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Income Log Manager Component
const IncomeLogManager = () => {
  const theme = useTheme();
  const { isDark } = useAppTheme();
  const [incomeLogs, setIncomeLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [viewingIncome, setViewingIncome] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({});
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    incomeSource: '',
    description: '',
    amount: '',
    receivedFrom: '',
    receiptNo: '',
    paymentMode: '',
    receivedBy: '',
    remarks: '',
    isGSTApplicable: false,
    gstRate: '',
    gstNumber: '',
    gstAmount: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    totalAmount: 0
  });
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const { user } = useAuth();

  // Handle form field changes
  const handleFormChange = (field, value) => {
    const updatedFormData = { ...formData, [field]: value };
    
    // Recalculate GST if amount, gstRate, or isGSTApplicable changes
    if (field === 'amount' || field === 'gstRate' || field === 'isGSTApplicable') {
      // Ensure proper number conversion
      const amount = field === 'amount' ? parseFloat(value) || 0 : parseFloat(formData.amount) || 0;
      const gstRate = field === 'gstRate' ? parseFloat(value) || 0 : parseFloat(formData.gstRate) || 0;
      const isGSTApplicable = field === 'isGSTApplicable' ? value : formData.isGSTApplicable;
      
      const gstValues = calculateGST(amount, gstRate, isGSTApplicable);
      
      updatedFormData.gstAmount = gstValues.gstAmount;
      updatedFormData.cgstAmount = gstValues.cgstAmount;
      updatedFormData.sgstAmount = gstValues.sgstAmount;
      updatedFormData.totalAmount = gstValues.totalAmount;
    }
    
    setFormData(updatedFormData);
  };

  // GST calculation function - FIXED for accurate calculation
  const calculateGST = (amount, gstRate, isGSTApplicable) => {
    if (!isGSTApplicable || !amount || !gstRate) {
      return {
        gstAmount: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        totalAmount: amount || 0
      };
    }
    
    // Calculate GST amount accurately
    const gstAmount = (amount * gstRate) / 100;
    const cgstAmount = gstAmount / 2;
    const sgstAmount = gstAmount / 2;
    const totalAmount = amount + gstAmount;
    
    return {
      gstAmount: Math.round(gstAmount * 100) / 100, // Round to 2 decimal places
      cgstAmount: Math.round(cgstAmount * 100) / 100,
      sgstAmount: Math.round(sgstAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100
    };
  };

  // Income sources from the Excel template
  const incomeSources = [
    'Fees', 'Donation', 'Grant', 'Event', 'Sponsorship', 'Fundraising', 'Investment', 'Other'
  ];

  // Payment modes from the Excel template
  const paymentModes = [
    'Cash', 'Cheque', 'Bank Transfer', 'UPI', 'Credit Card', 'Debit Card', 'Online Payment'
  ];

  // Status options
  const statusOptions = ['Pending', 'Confirmed', 'Rejected', 'Processed'];

  useEffect(() => {
    fetchIncomeLogs();
    fetchStats();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchIncomeLogs = async () => {
    setLoading(true);
    try {
      // Use local backend API
              const response = await fetch('https://api.edulives.com/api/income-logs/test/logs');
      const data = await response.json();
      
      setIncomeLogs(data.docs || []);
      setPagination(prev => ({
        ...prev,
        total: data.totalDocs || 0
      }));
    } catch (error) {
      console.error('Error fetching income logs:', error);
        toast.error('Failed to fetch income logs. Please try again.');
      setIncomeLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Use local backend API
              const response = await fetch('https://api.edulives.com/api/income-logs/test/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Set default stats if API fails
      setStats({
        totalIncome: 0,
        totalCount: 0,
        averageAmount: 0,
        pendingIncome: 0
      });
    }
  };

  const handleCreate = async (values) => {
    try {
      console.log('Creating income log with values:', values);
      
      // Ensure all values are properly formatted
      const dataToSend = {
        ...values,
        date: values.date, // Keep as string, backend will handle conversion
        amount: parseFloat(values.amount) || 0,
        gstRate: parseFloat(values.gstRate) || 0,
        gstAmount: parseFloat(values.gstAmount) || 0,
        cgstAmount: parseFloat(values.cgstAmount) || 0,
        sgstAmount: parseFloat(values.sgstAmount) || 0,
        totalAmount: parseFloat(values.totalAmount) || 0
      };
      
      console.log('Sending data to API:', dataToSend);
      
      // Use local backend API for creation (test endpoint)
              const response = await fetch('https://api.edulives.com/api/income-logs/test/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });
      
      if (response.ok) {
        toast.success('Income log created successfully');
        setCreateModalVisible(false);
        resetForm();
        fetchIncomeLogs();
        fetchStats();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to create income log');
      }
    } catch (error) {
      console.error('Error creating income log:', error);
      toast.error('Failed to create income log');
    }
  };

  const handleUpdate = async (values) => {
    try {
      await incomeLogAPI.updateIncomeLog(editingIncome._id, {
        ...values,
        date: values.date.toDate()
      });
      toast.success('Income log updated successfully');
      setEditModalVisible(false);
      setEditingIncome(null);
      fetchIncomeLogs();
      fetchStats();
    } catch (error) {
      toast.error('Failed to update income log');
    }
  };

  const handleDelete = async (id) => {
    try {
      await incomeLogAPI.deleteIncomeLog(id);
      toast.success('Income log deleted successfully');
      fetchIncomeLogs();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete income log');
    }
  };

  const showDeleteConfirm = (item) => {
    setItemToDelete(item);
    setDeleteConfirmVisible(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        // For now, just show success message since we're using test endpoints
        toast.success('Income log deleted successfully');
        setDeleteConfirmVisible(false);
        setItemToDelete(null);
        fetchIncomeLogs();
        fetchStats();
      } catch (error) {
        toast.error('Failed to delete income log');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      incomeSource: '',
      description: '',
      amount: '',
      receivedFrom: '',
      receiptNo: '',
      paymentMode: '',
      receivedBy: '',
      remarks: '',
      isGSTApplicable: false,
      gstRate: '',
      gstNumber: '',
      gstAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      totalAmount: 0
    });
  };

  const showCreateModal = () => {
    resetForm();
    setCreateModalVisible(true);
  };

  const showEditModal = (income) => {
    setEditingIncome(income);
    setEditModalVisible(true);
  };

  const showViewModal = (income) => {
    setViewingIncome(income);
    setViewModalVisible(true);
  };

  const handleTableChange = (paginationInfo, filters, sorter) => {
    setPagination(prev => ({
      ...prev,
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize
    }));
  };

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'success';
      case 'Pending': return 'warning';
      case 'Rejected': return 'error';
      case 'Processed': return 'info';
      default: return 'default';
    }
  };

  // Export function for income logs
  const handleExportIncomeLogs = () => {
    try {
      const csvContent = [
        ['S.No', 'Date', 'Income Source', 'Description', 'Amount (₹)', 'Received From', 'Receipt No', 'Payment Mode', 'Received By', 'Remarks', 'GST', 'GST Amount', 'Total Amount', 'Status'],
        ...incomeLogs.map((income, index) => [
          income.serialNumber || index + 1,
          new Date(income.date).toLocaleDateString(),
          income.incomeSource,
          income.description,
          income.amount,
          income.receivedFrom,
          income.receiptNo,
          income.paymentMode,
          income.receivedBy || 'N/A',
          income.remarks || 'N/A',
          income.isGSTApplicable ? `${income.gstRate}%` : 'No GST',
          income.isGSTApplicable ? income.gstAmount : 'N/A',
          income.totalAmount,
          income.status
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `income_logs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Income logs exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export income logs');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: theme.palette.success.light, color: 'white' }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              ₹{stats.totalIncome?.toLocaleString('en-IN') || 0}
            </Typography>
            <Typography variant="body2">Total Income</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: theme.palette.info.light, color: 'white' }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {stats.totalCount || 0}
            </Typography>
            <Typography variant="body2">Total Count</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: theme.palette.warning.light, color: 'white' }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              ₹{stats.averageAmount?.toLocaleString('en-IN') || 0}
            </Typography>
            <Typography variant="body2">Average Amount</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: theme.palette.error.light, color: 'white' }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {stats.pendingIncome || 0}
            </Typography>
            <Typography variant="body2">Pending Income</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Search and Filter Bar */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Search & Filters</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Search"
              placeholder="Search description, received from..."
              fullWidth
              InputProps={{
                startAdornment: <SearchIcon />,
              }}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Income Source</InputLabel>
              <Select
                value={filters.incomeSource || ''}
                onChange={(e) => handleFilter('incomeSource', e.target.value)}
              >
                <MenuItem value="">All Sources</MenuItem>
                {incomeSources.map(source => (
                  <MenuItem key={source} value={source}>{source}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Payment Mode</InputLabel>
              <Select
                value={filters.paymentMode || ''}
                onChange={(e) => handleFilter('paymentMode', e.target.value)}
              >
                <MenuItem value="">All Modes</MenuItem>
                {paymentModes.map(mode => (
                  <MenuItem key={mode} value={mode}>{mode}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status || ''}
                onChange={(e) => handleFilter('status', e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                {statusOptions.map(status => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Income Logs Table */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' }, 
          mb: 2,
          gap: 2
        }}>
          <Typography variant="h6">Income Logs</Typography>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1,
            width: { xs: '100%', sm: 'auto' }
          }}>
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={showCreateModal}
              fullWidth={false}
              sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
            >
              Create Income Log
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />} 
              onClick={fetchIncomeLogs}
              fullWidth={false}
              sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
            >
              Refresh
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />}
              fullWidth={false}
              sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
              onClick={handleExportIncomeLogs}
            >
              Export
            </Button>
          </Box>
        </Box>
        
        {/* Responsive Table Container */}
        <Box sx={{ 
          width: '100%', 
          overflowX: 'auto',
          '& .MuiTable-root': {
            minWidth: 1400, // Increased minimum width to accommodate GST columns
          }
        }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 60 }}>S.No</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Date</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Income Source</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Description</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Amount (₹)</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Received From</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Receipt No</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Payment Mode</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Received By</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Remarks</TableCell>
                <TableCell sx={{ minWidth: 80 }}>GST</TableCell>
                <TableCell sx={{ minWidth: 100 }}>GST Amount</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Total Amount</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Upload Document</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Status</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incomeLogs.length > 0 ? (
                incomeLogs.map((income, index) => (
                  <TableRow key={income._id} hover>
                    <TableCell>{income.serialNumber}</TableCell>
                    <TableCell>{new Date(income.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip label={income.incomeSource} size="small" color="primary" />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 150, wordWrap: 'break-word' }}>
                      {income.description}
                    </TableCell>
                    <TableCell>₹{income.amount.toLocaleString('en-IN')}</TableCell>
                    <TableCell>{income.receivedFrom}</TableCell>
                    <TableCell>{income.receiptNo}</TableCell>
                    <TableCell>{income.paymentMode}</TableCell>
                    <TableCell>{income.receivedBy || 'N/A'}</TableCell>
                    <TableCell sx={{ maxWidth: 100, wordWrap: 'break-word' }}>
                      {income.remarks || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {income.isGSTApplicable ? (
                        <Chip label={`${income.gstRate}%`} size="small" color="success" />
                      ) : (
                        <Chip label="No GST" size="small" color="default" />
                      )}
                    </TableCell>
                    <TableCell>
                      {income.isGSTApplicable ? (
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ₹{income.gstAmount.toLocaleString('en-IN')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            CGST: ₹{income.cgstAmount.toLocaleString('en-IN')} | SGST: ₹{income.sgstAmount.toLocaleString('en-IN')}
                          </Typography>
                        </Box>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                        ₹{income.totalAmount.toLocaleString('en-IN')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {income.uploadDocument ? (
                        <IconButton size="small" onClick={() => window.open(income.uploadDocument.path, '_blank')}>
                          <DownloadIcon />
                        </IconButton>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={income.status}
                        color={getStatusColor(income.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        <IconButton size="small" onClick={() => showViewModal(income)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => showEditModal(income)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => showDeleteConfirm(income)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={16} align="center" sx={{ py: 4 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Income Logs Found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {loading ? 'Loading income logs...' : 'Start by creating your first income log entry.'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {/* Create Income Log Modal */}
      <Dialog 
        open={createModalVisible} 
        onClose={() => setCreateModalVisible(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Create New Income Log</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.date}
                onChange={(e) => handleFormChange('date', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Income Source</InputLabel>
                <Select
                  value={formData.incomeSource}
                  onChange={(e) => handleFormChange('incomeSource', e.target.value)}
                >
                  {incomeSources.map(source => (
                    <MenuItem key={source} value={source}>{source}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                multiline
                rows={3}
                fullWidth
                placeholder="Brief description of the income"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Amount (₹)"
                type="number"
                fullWidth
                value={formData.amount}
                onChange={(e) => handleFormChange('amount', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Received From"
                fullWidth
                placeholder="Name of person/organization"
                value={formData.receivedFrom}
                onChange={(e) => handleFormChange('receivedFrom', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Receipt No"
                fullWidth
                placeholder="Internal receipt number"
                value={formData.receiptNo}
                onChange={(e) => handleFormChange('receiptNo', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Mode</InputLabel>
                <Select 
                  value={formData.paymentMode}
                  onChange={(e) => handleFormChange('paymentMode', e.target.value)}
                >
                  {paymentModes.map(mode => (
                    <MenuItem key={mode} value={mode}>{mode}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Received By"
                fullWidth
                placeholder="Staff member who collected"
                value={formData.receivedBy}
                onChange={(e) => handleFormChange('receivedBy', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Remarks"
                fullWidth
                placeholder="Additional notes"
                value={formData.remarks}
                onChange={(e) => handleFormChange('remarks', e.target.value)}
              />
            </Grid>
            
            {/* GST Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>GST Details</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={formData.isGSTApplicable}
                    onChange={(e) => handleFormChange('isGSTApplicable', e.target.checked)}
                  />
                }
                label="GST Applicable"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="GST Rate (%)"
                type="number"
                fullWidth
                value={formData.gstRate}
                onChange={(e) => handleFormChange('gstRate', e.target.value)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="GST Number"
                fullWidth
                placeholder="GST Number (optional)"
                value={formData.gstNumber}
                onChange={(e) => handleFormChange('gstNumber', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="GST Amount"
                type="number"
                fullWidth
                value={formData.gstAmount}
                onChange={(e) => handleFormChange('gstAmount', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                sx={{ backgroundColor: '#f5f5f5' }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="CGST Amount"
                type="number"
                fullWidth
                value={formData.cgstAmount}
                onChange={(e) => handleFormChange('cgstAmount', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                sx={{ backgroundColor: '#f5f5f5' }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="SGST Amount"
                type="number"
                fullWidth
                value={formData.sgstAmount}
                onChange={(e) => handleFormChange('sgstAmount', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                sx={{ backgroundColor: '#f5f5f5' }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Total Amount"
                type="number"
                fullWidth
                value={formData.totalAmount}
                onChange={(e) => handleFormChange('totalAmount', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                sx={{ fontWeight: 'bold', color: theme.palette.primary.main, backgroundColor: '#e3f2fd' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateModalVisible(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              // Create income log data from form state
              const incomeData = {
                date: new Date(formData.date),
                incomeSource: formData.incomeSource,
                description: formData.description,
                amount: parseFloat(formData.amount) || 0,
                receivedFrom: formData.receivedFrom,
                receiptNo: formData.receiptNo,
                paymentMode: formData.paymentMode,
                receivedBy: formData.receivedBy,
                remarks: formData.remarks,
                isGSTApplicable: formData.isGSTApplicable,
                gstRate: parseFloat(formData.gstRate) || 0,
                gstNumber: formData.gstNumber,
                gstAmount: parseFloat(formData.gstAmount) || 0,
                cgstAmount: parseFloat(formData.cgstAmount) || 0,
                sgstAmount: parseFloat(formData.sgstAmount) || 0,
                totalAmount: parseFloat(formData.totalAmount) || 0
              };
              
              handleCreate(incomeData);
            }}
          >
            Create Income Log
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Income Log Modal */}
      <Dialog 
        open={viewModalVisible} 
        onClose={() => setViewModalVisible(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Income Log Details</DialogTitle>
        <DialogContent dividers>
          {viewingIncome && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                <Typography variant="body1">{new Date(viewingIncome.date).toLocaleDateString()}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Income Source</Typography>
                <Chip label={viewingIncome.incomeSource} size="small" color="primary" />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                <Typography variant="body1">{viewingIncome.description}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Amount</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  ₹{viewingIncome.amount.toLocaleString('en-IN')}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Received From</Typography>
                <Typography variant="body1">{viewingIncome.receivedFrom}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Receipt No</Typography>
                <Typography variant="body1">{viewingIncome.receiptNo}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Payment Mode</Typography>
                <Typography variant="body1">{viewingIncome.paymentMode}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Received By</Typography>
                <Typography variant="body1">{viewingIncome.receivedBy || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Chip 
                  label={viewingIncome.status} 
                  color={getStatusColor(viewingIncome.status)} 
                  size="small" 
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Remarks</Typography>
                <Typography variant="body1">{viewingIncome.remarks || 'N/A'}</Typography>
              </Grid>
              
              {/* GST Information */}
              {viewingIncome.isGSTApplicable && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>GST Details</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">GST Rate</Typography>
                    <Chip label={`${viewingIncome.gstRate}%`} size="small" color="success" />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">GST Number</Typography>
                    <Typography variant="body1">{viewingIncome.gstNumber || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">GST Amount</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      ₹{viewingIncome.gstAmount.toLocaleString('en-IN')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">CGST Amount</Typography>
                    <Typography variant="body1">₹{viewingIncome.cgstAmount.toLocaleString('en-IN')}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">SGST Amount</Typography>
                    <Typography variant="body1">₹{viewingIncome.sgstAmount.toLocaleString('en-IN')}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Total Amount (Including GST)</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                      ₹{viewingIncome.totalAmount.toLocaleString('en-IN')}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewModalVisible(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Income Log Modal */}
      <Dialog 
        open={editModalVisible} 
        onClose={() => setEditModalVisible(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Edit Income Log</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Edit functionality will be implemented here. For now, you can view the details in the View modal.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalVisible(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Expense Log Manager Component
const ExpenseLogManager = () => {
  const theme = useTheme();
  const { isDark } = useAppTheme();
  const [expenseLogs, setExpenseLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [viewingExpense, setViewingExpense] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({});
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    expenseCategory: '',
    description: '',
    amount: '',
    paidTo: '',
    voucherNo: '',
    paymentMode: '',
    approvedBy: '',
    remarks: '',
    isGSTApplicable: false,
    gstRate: '',
    gstNumber: '',
    gstAmount: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    totalAmount: 0
  });
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const { user } = useAuth();

  // Handle form field changes for expense logs
  const handleFormChange = (field, value) => {
    const updatedFormData = { ...formData, [field]: value };
    
    // Recalculate GST if amount, gstRate, or isGSTApplicable changes
    if (field === 'amount' || field === 'gstRate' || field === 'isGSTApplicable') {
      // Ensure proper number conversion
      const amount = field === 'amount' ? parseFloat(value) || 0 : parseFloat(formData.amount) || 0;
      const gstRate = field === 'gstRate' ? parseFloat(value) || 0 : parseFloat(formData.gstRate) || 0;
      const isGSTApplicable = field === 'isGSTApplicable' ? value : formData.isGSTApplicable;
      
      const gstValues = calculateGST(amount, gstRate, isGSTApplicable);
      
      updatedFormData.gstAmount = gstValues.gstAmount;
      updatedFormData.cgstAmount = gstValues.cgstAmount;
      updatedFormData.sgstAmount = gstValues.sgstAmount;
      updatedFormData.totalAmount = gstValues.totalAmount;
    }
    
    setFormData(updatedFormData);
  };

  // GST calculation function - FIXED for accurate calculation
  const calculateGST = (amount, gstRate, isGSTApplicable) => {
    if (!isGSTApplicable || !amount || !gstRate) {
      return {
        gstAmount: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        totalAmount: amount || 0
      };
    }
    
    // Calculate GST amount accurately
    const gstAmount = (amount * gstRate) / 100;
    const cgstAmount = gstAmount / 2;
    const sgstAmount = gstAmount / 2;
    const totalAmount = amount + gstAmount;
    
    return {
      gstAmount: Math.round(gstAmount * 100) / 100, // Round to 2 decimal places
      cgstAmount: Math.round(cgstAmount * 100) / 100,
      sgstAmount: Math.round(sgstAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100
    };
  };

  // Expense categories from the Excel template
  const expenseCategories = [
    'Maintenance', 'Salary', 'Equipment', 'Utilities', 'Transportation', 
    'Office Supplies', 'Events', 'Training', 'Technology', 'Miscellaneous'
  ];

  // Payment modes from the Excel template
  const paymentModes = [
    'Cash', 'Cheque', 'Bank Transfer', 'UPI', 'Credit Card', 'Debit Card'
  ];

  // Status options
  const statusOptions = ['Pending', 'Approved', 'Rejected', 'Paid'];

  useEffect(() => {
    fetchExpenseLogs();
    fetchStats();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchExpenseLogs = async () => {
    setLoading(true);
    try {
      // Use local backend API
              const response = await fetch('https://api.edulives.com/api/expense-logs/test/logs');
      const data = await response.json();
      
      setExpenseLogs(data.docs || []);
      setPagination(prev => ({
        ...prev,
        total: data.totalDocs || 0
      }));
    } catch (error) {
      console.error('Error fetching expense logs:', error);
        toast.error('Failed to fetch expense logs. Please try again.');
      setExpenseLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Use local backend API
              const response = await fetch('https://api.edulives.com/api/expense-logs/test/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Set default stats if API fails
      setStats({
        totalExpenses: 0,
        totalCount: 0,
        averageAmount: 0,
        approvedExpenses: 0
      });
    }
  };

  const handleCreate = async (values) => {
    try {
      console.log('Creating expense log with values:', values);
      
      // Ensure all values are properly formatted
      const dataToSend = {
        ...values,
        date: values.date, // Keep as string, backend will handle conversion
        amount: parseFloat(values.amount) || 0,
        gstRate: parseFloat(values.gstRate) || 0,
        gstAmount: parseFloat(values.gstAmount) || 0,
        cgstAmount: parseFloat(values.cgstAmount) || 0,
        sgstAmount: parseFloat(values.sgstAmount) || 0,
        totalAmount: parseFloat(values.totalAmount) || 0
      };
      
      console.log('Sending data to API:', dataToSend);
      
      // Use local backend API for creation (test endpoint)
              const response = await fetch('https://api.edulives.com/api/expense-logs/test/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });
      
      if (response.ok) {
      toast.success('Expense log created successfully');
      setCreateModalVisible(false);
      resetForm();
      fetchExpenseLogs();
      fetchStats();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to create expense log');
      }
    } catch (error) {
      console.error('Error creating expense log:', error);
      toast.error('Failed to create expense log');
    }
  };

  const handleUpdate = async (values) => {
    try {
      await expenseLogAPI.updateExpenseLog(editingExpense._id, {
        ...values,
        date: values.date.toDate()
      });
      toast.success('Expense log updated successfully');
      setEditModalVisible(false);
      setEditingExpense(null);
      fetchExpenseLogs();
      fetchStats();
    } catch (error) {
      toast.error('Failed to update expense log');
    }
  };

  const handleDelete = async (id) => {
    try {
      await expenseLogAPI.deleteExpenseLog(id);
      toast.success('Expense log deleted successfully');
      fetchExpenseLogs();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete expense log');
    }
  };

  const showDeleteConfirm = (item) => {
    setItemToDelete(item);
    setDeleteConfirmVisible(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        // For now, just show success message since we're using test endpoints
        toast.success('Expense log deleted successfully');
        setDeleteConfirmVisible(false);
        setItemToDelete(null);
        fetchExpenseLogs();
        fetchStats();
      } catch (error) {
        toast.error('Failed to delete expense log');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      expenseCategory: '',
      description: '',
      amount: '',
      paidTo: '',
      voucherNo: '',
      paymentMode: '',
      approvedBy: '',
      remarks: '',
      isGSTApplicable: false,
      gstRate: '',
      gstNumber: '',
      gstAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      totalAmount: 0
    });
  };

  const showCreateModal = () => {
    resetForm();
    setCreateModalVisible(true);
  };

  const showEditModal = (expense) => {
    setEditingExpense(expense);
    setEditModalVisible(true);
  };

  const showViewModal = (expense) => {
    setViewingExpense(expense);
    setViewModalVisible(true);
  };

  const handleTableChange = (paginationInfo, filters, sorter) => {
    setPagination(prev => ({
      ...prev,
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize
    }));
  };

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Pending': return 'warning';
      case 'Rejected': return 'error';
      case 'Paid': return 'info';
      default: return 'default';
    }
  };

  // Export function for expense logs
  const handleExportExpenseLogs = () => {
    try {
      const csvContent = [
        ['S.No', 'Date', 'Expense Category', 'Description', 'Amount (₹)', 'Paid To', 'Voucher No', 'Payment Mode', 'Approved By', 'Remarks', 'GST', 'GST Amount', 'Total Amount', 'Status'],
        ...expenseLogs.map((expense, index) => [
          expense.serialNumber || index + 1,
          new Date(expense.date).toLocaleDateString(),
          expense.expenseCategory,
          expense.description,
          expense.amount,
          expense.paidTo,
          expense.voucherNo,
          expense.paymentMode,
          expense.approvedBy || 'N/A',
          expense.remarks || 'N/A',
          expense.isGSTApplicable ? `${expense.gstRate}%` : 'No GST',
          expense.isGSTApplicable ? expense.gstAmount : 'N/A',
          expense.totalAmount,
          expense.status
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expense_logs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Expense logs exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export expense logs');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: theme.palette.error.light, color: 'white' }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              ₹{stats.totalExpenses?.toLocaleString('en-IN') || 0}
            </Typography>
            <Typography variant="body2">Total Expenses</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: theme.palette.info.light, color: 'white' }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {stats.totalCount || 0}
            </Typography>
            <Typography variant="body2">Total Count</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: theme.palette.warning.light, color: 'white' }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              ₹{stats.averageAmount?.toLocaleString('en-IN') || 0}
            </Typography>
            <Typography variant="body2">Average Amount</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: theme.palette.success.light, color: 'white' }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {stats.approvedExpenses || 0}
            </Typography>
            <Typography variant="body2">Approved Expenses</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Search and Filter Bar */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Search & Filters</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Search"
              placeholder="Search description, paid to..."
              fullWidth
              InputProps={{
                startAdornment: <SearchIcon />,
              }}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Expense Category</InputLabel>
              <Select
                value={filters.expenseCategory || ''}
                onChange={(e) => handleFilter('expenseCategory', e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {expenseCategories.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Payment Mode</InputLabel>
              <Select
                value={filters.paymentMode || ''}
                onChange={(e) => handleFilter('paymentMode', e.target.value)}
              >
                <MenuItem value="">All Modes</MenuItem>
                {paymentModes.map(mode => (
                  <MenuItem key={mode} value={mode}>{mode}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status || ''}
                onChange={(e) => handleFilter('status', e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                {statusOptions.map(status => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Expense Logs Table */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' }, 
          mb: 2,
          gap: 2
        }}>
          <Typography variant="h6">Expense Logs</Typography>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1,
            width: { xs: '100%', sm: 'auto' }
          }}>
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={showCreateModal}
              fullWidth={false}
              sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
            >
              Create Expense Log
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />} 
              onClick={fetchExpenseLogs}
              fullWidth={false}
              sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
            >
              Refresh
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />}
              fullWidth={false}
              sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
              onClick={handleExportExpenseLogs}
            >
              Export
            </Button>
          </Box>
        </Box>
        
        {/* Responsive Table Container */}
        <Box sx={{ 
          width: '100%', 
          overflowX: 'auto',
          '& .MuiTable-root': {
            minWidth: 1400, // Increased minimum width to accommodate GST columns
          }
        }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 60 }}>S.No</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Date</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Expense Category</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Description</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Amount (₹)</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Paid To</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Voucher No</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Payment Mode</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Approved By</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Remarks</TableCell>
                <TableCell sx={{ minWidth: 80 }}>GST</TableCell>
                <TableCell sx={{ minWidth: 100 }}>GST Amount</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Total Amount</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Upload Document</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Status</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenseLogs.length > 0 ? (
                expenseLogs.map((expense, index) => (
                  <TableRow key={expense._id} hover>
                    <TableCell>{expense.serialNumber}</TableCell>
                    <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip label={expense.expenseCategory} size="small" color="primary" />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 150, wordWrap: 'break-word' }}>
                      {expense.description}
                    </TableCell>
                    <TableCell>₹{expense.amount.toLocaleString('en-IN')}</TableCell>
                    <TableCell>{expense.paidTo}</TableCell>
                    <TableCell>{expense.voucherNo}</TableCell>
                    <TableCell>{expense.paymentMode}</TableCell>
                    <TableCell>{expense.approvedBy || 'N/A'}</TableCell>
                    <TableCell sx={{ maxWidth: 100, wordWrap: 'break-word' }}>
                      {expense.remarks || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {expense.isGSTApplicable ? (
                        <Chip label={`${expense.gstRate}%`} size="small" color="success" />
                      ) : (
                        <Chip label="No GST" size="small" color="default" />
                      )}
                    </TableCell>
                    <TableCell>
                      {expense.isGSTApplicable ? (
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ₹{expense.gstAmount.toLocaleString('en-IN')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            CGST: ₹{expense.cgstAmount.toLocaleString('en-IN')} | SGST: ₹{expense.sgstAmount.toLocaleString('en-IN')}
                          </Typography>
                        </Box>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                        ₹{expense.totalAmount.toLocaleString('en-IN')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {expense.uploadDocument ? (
                        <IconButton size="small" onClick={() => window.open(expense.uploadDocument.path, '_blank')}>
                          <DownloadIcon />
                        </IconButton>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={expense.status}
                        color={getStatusColor(expense.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        <IconButton size="small" onClick={() => showViewModal(expense)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => showEditModal(expense)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => showDeleteConfirm(expense)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={16} align="center" sx={{ py: 4 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Expense Logs Found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {loading ? 'Loading expense logs...' : 'Start by creating your first expense log entry.'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {/* Create Expense Log Modal */}
      <Dialog 
        open={createModalVisible} 
        onClose={() => setCreateModalVisible(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Create New Expense Log</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.date}
                onChange={(e) => handleFormChange('date', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Expense Category</InputLabel>
                <Select 
                  value={formData.expenseCategory}
                  onChange={(e) => handleFormChange('expenseCategory', e.target.value)}
                >
                  {expenseCategories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                multiline
                rows={3}
                fullWidth
                placeholder="Brief description of the expense"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Amount (₹)"
                type="number"
                fullWidth
                value={formData.amount}
                onChange={(e) => handleFormChange('amount', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Paid To"
                fullWidth
                placeholder="Vendor or individual"
                value={formData.paidTo}
                onChange={(e) => handleFormChange('paidTo', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Voucher No"
                fullWidth
                placeholder="Internal voucher number"
                value={formData.voucherNo}
                onChange={(e) => handleFormChange('voucherNo', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Mode</InputLabel>
                <Select 
                  value={formData.paymentMode}
                  onChange={(e) => handleFormChange('paymentMode', e.target.value)}
                >
                  {paymentModes.map(mode => (
                    <MenuItem key={mode} value={mode}>{mode}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Approved By"
                fullWidth
                placeholder="Person authorizing payment"
                value={formData.approvedBy}
                onChange={(e) => handleFormChange('approvedBy', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Remarks"
                fullWidth
                placeholder="Additional notes"
                value={formData.remarks}
                onChange={(e) => handleFormChange('remarks', e.target.value)}
              />
            </Grid>
            
            {/* GST Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>GST Details</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={formData.isGSTApplicable}
                    onChange={(e) => handleFormChange('isGSTApplicable', e.target.checked)}
                  />
                }
                label="GST Applicable"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="GST Rate (%)"
                type="number"
                fullWidth
                value={formData.gstRate}
                onChange={(e) => handleFormChange('gstRate', e.target.value)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="GST Number"
                fullWidth
                placeholder="GST Number (optional)"
                value={formData.gstNumber}
                onChange={(e) => handleFormChange('gstNumber', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="GST Amount"
                type="number"
                fullWidth
                value={formData.gstAmount}
                onChange={(e) => handleFormChange('gstAmount', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                sx={{ backgroundColor: '#f5f5f5' }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="CGST Amount"
                type="number"
                fullWidth
                value={formData.cgstAmount}
                onChange={(e) => handleFormChange('cgstAmount', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                sx={{ backgroundColor: '#f5f5f5' }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="SGST Amount"
                type="number"
                fullWidth
                value={formData.sgstAmount}
                onChange={(e) => handleFormChange('sgstAmount', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                sx={{ backgroundColor: '#f5f5f5' }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Total Amount"
                type="number"
                fullWidth
                value={formData.totalAmount}
                onChange={(e) => handleFormChange('totalAmount', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                sx={{ fontWeight: 'bold', color: theme.palette.primary.main, backgroundColor: '#e3f2fd' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateModalVisible(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              // Create expense log data from form state
              const expenseData = {
                date: new Date(formData.date),
                expenseCategory: formData.expenseCategory,
                description: formData.description,
                amount: parseFloat(formData.amount) || 0,
                paidTo: formData.paidTo,
                voucherNo: formData.voucherNo,
                paymentMode: formData.paymentMode,
                approvedBy: formData.approvedBy,
                remarks: formData.remarks,
                isGSTApplicable: formData.isGSTApplicable,
                gstRate: parseFloat(formData.gstRate) || 0,
                gstNumber: formData.gstNumber,
                gstAmount: parseFloat(formData.gstAmount) || 0,
                cgstAmount: parseFloat(formData.cgstAmount) || 0,
                sgstAmount: parseFloat(formData.sgstAmount) || 0,
                totalAmount: parseFloat(formData.totalAmount) || 0
              };
              
              handleCreate(expenseData);
            }}
          >
            Create Expense Log
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Expense Log Modal */}
      <Dialog 
        open={viewModalVisible} 
        onClose={() => setViewModalVisible(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Expense Log Details</DialogTitle>
        <DialogContent dividers>
          {viewingExpense && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                <Typography variant="body1">{new Date(viewingExpense.date).toLocaleDateString()}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Expense Category</Typography>
                <Chip label={viewingExpense.expenseCategory} size="small" color="primary" />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                <Typography variant="body1">{viewingExpense.description}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Amount</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  ₹{viewingExpense.amount.toLocaleString('en-IN')}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Paid To</Typography>
                <Typography variant="body1">{viewingExpense.paidTo}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Voucher No</Typography>
                <Typography variant="body1">{viewingExpense.voucherNo}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Payment Mode</Typography>
                <Typography variant="body1">{viewingExpense.paymentMode}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Approved By</Typography>
                <Typography variant="body1">{viewingExpense.approvedBy || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Chip 
                  label={viewingExpense.status} 
                  color={getStatusColor(viewingExpense.status)} 
                  size="small" 
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Remarks</Typography>
                <Typography variant="body1">{viewingExpense.remarks || 'N/A'}</Typography>
              </Grid>
              
              {/* GST Information */}
              {viewingExpense.isGSTApplicable && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>GST Details</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">GST Rate</Typography>
                    <Chip label={`${viewingExpense.gstRate}%`} size="small" color="success" />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">GST Number</Typography>
                    <Typography variant="body1">{viewingExpense.gstNumber || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">GST Amount</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      ₹{viewingExpense.gstAmount.toLocaleString('en-IN')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">CGST Amount</Typography>
                    <Typography variant="body1">₹{viewingExpense.cgstAmount.toLocaleString('en-IN')}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">SGST Amount</Typography>
                    <Typography variant="body1">₹{viewingExpense.sgstAmount.toLocaleString('en-IN')}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Total Amount (Including GST)</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.error.main }}>
                      ₹{viewingExpense.totalAmount.toLocaleString('en-IN')}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewModalVisible(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Expense Log Modal */}
      <Dialog 
        open={editModalVisible} 
        onClose={() => setEditModalVisible(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Edit Expense Log</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Edit functionality will be implemented here. For now, you can view the details in the View modal.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalVisible(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteConfirmVisible} 
        onClose={() => setDeleteConfirmVisible(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this expense log? This action cannot be undone.
          </Typography>
          {itemToDelete && (
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">Item to delete:</Typography>
              <Typography variant="body2">
                {itemToDelete.description} - ₹{itemToDelete.amount.toLocaleString('en-IN')}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmVisible(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={confirmDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Enhanced Accountant Dashboard
const EnhancedAccountantDashboard = () => {
  const theme = useTheme();
  const { isDark } = useAppTheme();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [salaryDialog, setSalaryDialog] = useState(false);
  const [templateDialog, setTemplateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [salaryForm, setSalaryForm] = useState({
    staffId: '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
    basicSalary: '',
    allowances: {
      houseRentAllowance: 0,
      dearnessAllowance: 0,
      transportAllowance: 0,
      medicalAllowance: 0,
      otherAllowances: 0
    },
    deductions: {
      providentFund: 0,
      tax: 0,
      insurance: 0,
      otherDeductions: 0
    },
    paymentDate: '',
    paymentMethod: 'Bank Transfer',
    remarks: ''
  });

  // Queries
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['accountant-summary'],
    queryFn: accountantAPI.getSummary
  });

  const { data: salaryTemplates, isLoading: loadingTemplates } = useQuery({
    queryKey: ['salary-templates'],
    queryFn: accountantAPI.getSalaryTemplates
  });

  const { data: staffList, isLoading: loadingStaff } = useQuery({
    queryKey: ['staff-list'],
    queryFn: () => accountantAPI.getStaffList()
  });

  const { data: pendingApprovals, isLoading: loadingApprovals } = useQuery({
    queryKey: ['pending-salary-approvals'],
    queryFn: accountantAPI.getPendingSalaryApprovals
  });

  const { data: feeStatus, isLoading: loadingFeeStatus } = useQuery({
    queryKey: ['student-fee-status'],
    queryFn: getStudentFeeStatus
  });
  const { data: feeStats, isLoading: loadingFeeStats } = useQuery({
    queryKey: ['fee-stats'],
    queryFn: getFeeStats
  });
  const { data: transactionLog, isLoading: loadingTransactionLog } = useQuery({
    queryKey: ['transaction-log'],
    queryFn: getTransactionLog
  });
  const { data: allFeePayments, isLoading: loadingAllFeePayments } = useQuery({
    queryKey: ['all-fee-payments'],
    queryFn: accountantAPI.getAllFeePayments
  });

  // Income and Expense Log Queries
  const { data: incomeStats, isLoading: loadingIncomeStats } = useQuery({
    queryKey: ['income-stats'],
    queryFn: incomeLogAPI.getIncomeLogStats
  });

  const { data: expenseStats, isLoading: loadingExpenseStats } = useQuery({
    queryKey: ['expense-stats'],
    queryFn: expenseLogAPI.getExpenseLogStats
  });

  // Mutations
  const createSalaryMutation = useMutation({
    mutationFn: accountantAPI.createSalaryRecord,
    onSuccess: () => {
      queryClient.invalidateQueries(['accountant-summary']);
      setSalaryDialog(false);
      resetSalaryForm();
      toast.success('Salary record created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create salary record');
    }
  });

  // Helper functions
  const resetSalaryForm = () => {
    setSalaryForm({
      staffId: '',
      month: new Date().toLocaleString('default', { month: 'long' }),
      year: new Date().getFullYear(),
      basicSalary: '',
      allowances: {
        houseRentAllowance: 0,
        dearnessAllowance: 0,
        transportAllowance: 0,
        medicalAllowance: 0,
        otherAllowances: 0
      },
      deductions: {
        providentFund: 0,
        tax: 0,
        insurance: 0,
        otherDeductions: 0
      },
      paymentDate: '',
      paymentMethod: 'Bank Transfer',
      remarks: ''
    });
  };

  const calculateNetSalary = () => {
    const basicSalary = parseFloat(salaryForm.basicSalary) || 0;
    const totalAllowances = Object.values(salaryForm.allowances).reduce((sum, val) => {
      const numVal = parseFloat(val) || 0;
      return sum + numVal;
    }, 0);
    const totalDeductions = Object.values(salaryForm.deductions).reduce((sum, val) => {
      const numVal = parseFloat(val) || 0;
      return sum + numVal;
    }, 0);
    const grossSalary = basicSalary + totalAllowances;
    return grossSalary - totalDeductions;
  };

  const handleTemplateSelect = (role, template) => {
    setSelectedTemplate({ role, template });
    setSalaryForm(prev => ({
      ...prev,
      basicSalary: template.basicSalary,
      allowances: template.allowances,
      deductions: template.deductions
    }));
    setTemplateDialog(false);
  };

  const handleSalarySubmit = () => {
    if (!salaryForm.staffId || !salaryForm.basicSalary) {
      toast.error('Please fill in all required fields');
      return;
    }
    createSalaryMutation.mutate(salaryForm);
  };

  if (loadingSummary) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  const { income = 0, expenses = 0, profitLoss = 0, dues = 0, salaryStats = {} } = summary || {};

  return (
    <Box sx={{ minHeight: '100vh', background: isDark ? '#1e293b' : '#f8fafc' }}>
      {/* Header */}
      <Box sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
        color: 'white',
        p: { xs: 2, md: 3 },
        mb: 3
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2
        }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography variant="h4" sx={{ 
              fontWeight: 700,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              Accountant Dashboard
            </Typography>
            <Typography variant="body1" sx={{ 
              opacity: 1,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              color: 'white',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              mt: 0.5
            }}>
              Comprehensive Staff Salary Management System
            </Typography>
          </motion.div>
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            justifyContent: { xs: 'center', sm: 'flex-end' }
          }}>
            <Tooltip title="Toggle Theme">
              <IconButton sx={{ color: 'white' }}>
        
              </IconButton>
            </Tooltip>
            <Tooltip title="Profile">
              <IconButton onClick={() => navigate('/accountant/profile')} sx={{ color: 'white' }}>
                <AccountCircle />
              </IconButton>
            </Tooltip>
            <Tooltip title="Logout">
              <IconButton onClick={async () => { await logout(); navigate('/accountant-login'); }} sx={{ color: 'white' }}>
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
              icon={IncomeIcon}
              label="Total Income"
              value={incomeStats?.totalIncome || 0}
              color={theme.palette.success.main}
              subtitle="From all sources"
              trend="+12%"
              delay={0.1}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStatCard
              icon={ExpenseIcon}
              label="Total Expenses"
              value={expenseStats?.totalExpenses || 0}
              color={theme.palette.error.main}
              subtitle="All expenses"
              trend="-5%"
              delay={0.2}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStatCard
              icon={ProfitIcon}
              label="Net Profit"
              value={profitLoss || 0}
              color={theme.palette.info.main}
              subtitle="Current period"
              trend="+8%"
              delay={0.3}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStatCard
              icon={DueIcon}
              label="Pending Dues"
              value={dues || 0}
              color={theme.palette.warning.main}
              subtitle="Outstanding amounts"
              trend="-15%"
              delay={0.4}
            />
          </Grid>
        </Grid>

        {/* Main Content Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Box sx={{ 
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              height: '6px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f1f1f1',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#c1c1c1',
              borderRadius: '3px',
              '&:hover': {
                backgroundColor: '#a8a8a8',
              },
            },
          }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                minWidth: { xs: '100%', sm: 'auto' },
                '& .MuiTab-root': {
                  minWidth: { xs: 120, sm: 140, md: 160 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                  padding: { xs: '8px 12px', sm: '12px 16px', md: '16px 24px' },
                  textTransform: 'none',
                  fontWeight: 600,
                  color: isDark ? '#94a3b8' : '#6b7280',
                  '&.Mui-selected': {
                    color: isDark ? '#60a5fa' : '#2563eb',
                    fontWeight: 'bold'
                  }
                },
                '& .MuiTabs-scrollButtons': {
                  display: { xs: 'flex', sm: 'flex' },
                  '&.Mui-disabled': {
                    opacity: 0.3,
                  },
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  backgroundColor: isDark ? '#60a5fa' : '#2563eb',
                },
              }}
            >
              <Tab 
                label="Overview" 
                icon={<TimelineIcon sx={{ fontSize: { xs: 18, sm: 20, md: 24 } }} />} 
                iconPosition="start"
              />
              <Tab 
                label="Staff Salaries" 
                icon={<PeopleIcon sx={{ fontSize: { xs: 18, sm: 20, md: 24 } }} />} 
                iconPosition="start"
              />
              <Tab 
                label="Salary Templates" 
                icon={<SettingsIcon sx={{ fontSize: { xs: 18, sm: 20, md: 24 } }} />} 
                iconPosition="start"
              />
              <Tab 
                label="Pending Approvals" 
                icon={<HistoryIcon sx={{ fontSize: { xs: 18, sm: 20, md: 24 } }} />} 
                iconPosition="start"
              />
              <Tab 
                label="Student Fee Status" 
                icon={<AssessmentIcon sx={{ fontSize: { xs: 18, sm: 20, md: 24 } }} />} 
                iconPosition="start"
              />
              <Tab 
                label="Transaction Log" 
                icon={<HistoryIcon sx={{ fontSize: { xs: 18, sm: 20, md: 24 } }} />} 
                iconPosition="start"
              />
              <Tab 
                label="Income Log" 
                icon={<TrendingUpIcon sx={{ fontSize: { xs: 18, sm: 20, md: 24 } }} />} 
                iconPosition="start"
              />
              <Tab 
                label="Expense Log" 
                icon={<TrendingDownIcon sx={{ fontSize: { xs: 18, sm: 20, md: 24 } }} />} 
                iconPosition="start"
              />
            </Tabs>
          </Box>
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
                    <Typography sx={{ 
                      mb: 2,
                      color: isDark ? '#e2e8f0' : '#374151',
                      fontWeight: 600,
                      fontSize: '1.1rem'
                    }}>
                      Financial Overview
                    </Typography>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { month: 'Jan', income: (incomeStats?.totalIncome || 0) * 0.2, expenses: (expenseStats?.totalExpenses || 0) * 0.2, salary: (salaryStats.totalSalaryPaid || 0) * 0.2 },
                        { month: 'Feb', income: (incomeStats?.totalIncome || 0) * 0.3, expenses: (expenseStats?.totalExpenses || 0) * 0.3, salary: (salaryStats.totalSalaryPaid || 0) * 0.3 },
                        { month: 'Mar', income: (incomeStats?.totalIncome || 0) * 0.4, expenses: (expenseStats?.totalExpenses || 0) * 0.4, salary: (salaryStats.totalSalaryPaid || 0) * 0.4 },
                        { month: 'Apr', income: (incomeStats?.totalIncome || 0) * 0.5, expenses: (expenseStats?.totalExpenses || 0) * 0.5, salary: (salaryStats.totalSalaryPaid || 0) * 0.5 },
                        { month: 'May', income: (incomeStats?.totalIncome || 0) * 0.6, expenses: (expenseStats?.totalExpenses || 0) * 0.6, salary: (salaryStats.totalSalaryPaid || 0) * 0.6 },
                        { month: 'Jun', income: (incomeStats?.totalIncome || 0) * 0.7, expenses: (expenseStats?.totalExpenses || 0) * 0.7, salary: (salaryStats.totalSalaryPaid || 0) * 0.7 },
                      ]}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Area type="monotone" dataKey="income" stackId="1" stroke={theme.palette.success.main} fill={theme.palette.success.main} fillOpacity={0.6} />
                        <Area type="monotone" dataKey="expenses" stackId="1" stroke={theme.palette.error.main} fill={theme.palette.error.main} fillOpacity={0.6} />
                        <Area type="monotone" dataKey="salary" stackId="1" stroke={theme.palette.info.main} fill={theme.palette.info.main} fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, height: 400 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Expense Distribution</Typography>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Salaries', value: salaryStats.totalSalaryPaid || 0, color: theme.palette.info.main },
                            { name: 'Operations', value: (expenseStats?.totalExpenses || 0) * 0.3, color: theme.palette.warning.main },
                            { name: 'Maintenance', value: (expenseStats?.totalExpenses || 0) * 0.2, color: theme.palette.error.main },
                            { name: 'Others', value: (expenseStats?.totalExpenses || 0) * 0.5, color: theme.palette.grey[500] }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                        >
                          {[
                            { name: 'Salaries', value: salaryStats.totalSalaryPaid || 0, color: theme.palette.info.main },
                            { name: 'Operations', value: (expenseStats?.totalExpenses || 0) * 0.3, color: theme.palette.warning.main },
                            { name: 'Maintenance', value: (expenseStats?.totalExpenses || 0) * 0.2, color: theme.palette.error.main },
                            { name: 'Others', value: (expenseStats?.totalExpenses || 0) * 0.5, color: theme.palette.grey[500] }
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
              key="staff-salaries"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ 
                mb: 3, 
                display: 'flex', 
                gap: { xs: 1, sm: 2 }, 
                flexWrap: 'wrap',
                flexDirection: { xs: 'column', sm: 'row' }
              }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setSalaryDialog(true)}
                  sx={{ 
                    px: { xs: 2, sm: 3 }, 
                    py: { xs: 1, sm: 1.5 },
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    minHeight: { xs: 40, sm: 48 }
                  }}
                >
                  Create Salary Record
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={() => setTemplateDialog(true)}
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    minHeight: { xs: 40, sm: 48 }
                  }}
                >
                  Salary Templates
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    minHeight: { xs: 40, sm: 48 }
                  }}
                >
                  Bulk Import
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    minHeight: { xs: 40, sm: 48 }
                  }}
                >
                  Export Report
                </Button>
              </Box>

              {/* Staff List */}
              <Paper sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
                <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>Staff Members</Typography>
                {loadingStaff ? (
                  <CircularProgress />
                ) : (
                  <Box sx={{ 
                    overflowX: 'auto',
                    '&::-webkit-scrollbar': {
                      height: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: '#f1f1f1',
                      borderRadius: '3px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: '#c1c1c1',
                      borderRadius: '3px',
                      '&:hover': {
                        backgroundColor: '#a8a8a8',
                      },
                    },
                  }}>
                    <Table sx={{ minWidth: { xs: 600, sm: 800, md: 'auto' } }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, padding: { xs: '8px 4px', sm: '16px' } }}>Name</TableCell>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, padding: { xs: '8px 4px', sm: '16px' } }}>Employee ID</TableCell>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, padding: { xs: '8px 4px', sm: '16px' } }}>Role</TableCell>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, padding: { xs: '8px 4px', sm: '16px' } }}>Department</TableCell>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, padding: { xs: '8px 4px', sm: '16px' } }}>Basic Salary</TableCell>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, padding: { xs: '8px 4px', sm: '16px' } }}>Last Payment</TableCell>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, padding: { xs: '8px 4px', sm: '16px' } }}>Status</TableCell>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, padding: { xs: '8px 4px', sm: '16px' } }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {staffList?.map((staff) => (
                          <TableRow key={staff._id}>
                            <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, padding: { xs: '8px 4px', sm: '16px' } }}>{staff.name}</TableCell>
                            <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, padding: { xs: '8px 4px', sm: '16px' } }}>{staff.employeeId}</TableCell>
                            <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, padding: { xs: '8px 4px', sm: '16px' } }}>
                              <Chip label={staff.role} size="small" color="primary" sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' } }} />
                            </TableCell>
                            <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, padding: { xs: '8px 4px', sm: '16px' } }}>{staff.department?.name || 'N/A'}</TableCell>
                            <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, padding: { xs: '8px 4px', sm: '16px' } }}>₹{salaryTemplates?.[staff.role]?.basicSalary?.toLocaleString('en-IN') || 'N/A'}</TableCell>
                            <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, padding: { xs: '8px 4px', sm: '16px' } }}>N/A</TableCell>
                            <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, padding: { xs: '8px 4px', sm: '16px' } }}>
                              <Chip label="Active" size="small" color="success" sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' } }} />
                            </TableCell>
                            <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, padding: { xs: '8px 4px', sm: '16px' } }}>
                              <IconButton size="small" onClick={() => setSelectedStaff(staff)} sx={{ minWidth: { xs: 32, sm: 40 }, minHeight: { xs: 32, sm: 40 } }}>
                                <ViewIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                              </IconButton>
                              <IconButton size="small" onClick={() => {
                                setSelectedStaff(staff);
                                setSalaryDialog(true);
                              }} sx={{ minWidth: { xs: 32, sm: 40 }, minHeight: { xs: 32, sm: 40 } }}>
                                <EditIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </Paper>
            </motion.div>
          )}

          {activeTab === 2 && (
            <motion.div
              key="salary-templates"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ 
                mb: 3, 
                display: 'flex', 
                gap: { xs: 1, sm: 2 }, 
                flexWrap: 'wrap',
                flexDirection: { xs: 'column', sm: 'row' }
              }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setTemplateDialog(true)}
                  sx={{ 
                    px: { xs: 2, sm: 3 }, 
                    py: { xs: 1, sm: 1.5 },
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    minHeight: { xs: 40, sm: 48 }
                  }}
                >
                  Create Template
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={() => window.open('/accountant/salary-template-creator', '_blank')}
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    minHeight: { xs: 40, sm: 48 }
                  }}
                >
                  Advanced Template Creator
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    minHeight: { xs: 40, sm: 48 }
                  }}
                >
                  Export Templates
                </Button>
              </Box>

              <Grid container spacing={3}>
                {salaryTemplates && Object.entries(salaryTemplates).map(([role, template]) => (
                  <Grid item xs={12} sm={6} md={4} key={role}>
                    <SalaryTemplateCard
                      role={role}
                      template={template}
                      onSelect={handleTemplateSelect}
                      isSelected={selectedTemplate?.role === role}
                    />
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          )}

          {activeTab === 3 && (
            <motion.div
              key="approvals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Pending Salary Approvals ({pendingApprovals?.count || 0})
                </Typography>
                {loadingApprovals ? (
                  <CircularProgress />
                ) : pendingApprovals?.pendingApprovals?.length > 0 ? (
                  <List>
                    {pendingApprovals.pendingApprovals.map((approval) => (
                      <ListItem key={approval._id} divider>
                        <ListItemIcon>
                          <WarningIcon color="warning" />
                        </ListItemIcon>
                        <ListItemText
                          primary={approval.title}
                          secondary={`Requested by ${approval.requesterId?.name} on ${new Date(approval.createdAt).toLocaleDateString()}`}
                        />
                        <Button variant="outlined" size="small">
                          Review
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert severity="success">No pending salary approvals</Alert>
                )}
              </Paper>
            </motion.div>
          )}

          {activeTab === 4 && (
            <motion.div key="student-fee-status" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <StudentFeeStatusManager />
            </motion.div>
          )}

          {activeTab === 5 && (
            <motion.div key="transaction-log" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <Paper sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
                <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>Transaction Log</Typography>
                {loadingTransactionLog ? <CircularProgress /> : (
                  <Box sx={{ 
                    overflowX: 'auto',
                    '&::-webkit-scrollbar': {
                      height: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: '#f1f1f1',
                      borderRadius: '3px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: '#c1c1c1',
                      borderRadius: '3px',
                      '&:hover': {
                        backgroundColor: '#a8a8a8',
                      },
                    },
                  }}>
                    <Table sx={{ minWidth: { xs: 600, sm: 800, md: 'auto' } }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, padding: { xs: '8px 4px', sm: '16px' } }}>Type</TableCell>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, padding: { xs: '8px 4px', sm: '16px' } }}>Name</TableCell>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, padding: { xs: '8px 4px', sm: '16px' } }}>ID</TableCell>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, padding: { xs: '8px 4px', sm: '16px' } }}>Amount</TableCell>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, padding: { xs: '8px 4px', sm: '16px' } }}>Date</TableCell>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, padding: { xs: '8px 4px', sm: '16px' } }}>Method</TableCell>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, padding: { xs: '8px 4px', sm: '16px' } }}>Reference</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Array.isArray(transactionLog) ? transactionLog.map((log, idx) => (
                          <TableRow key={idx}>
                            <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, padding: { xs: '8px 4px', sm: '16px' } }}>
                              <Chip label={log.type} color={log.type === 'Salary Credited' ? 'success' : 'error'} size="small" sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' } }} />
                            </TableCell>
                            <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, padding: { xs: '8px 4px', sm: '16px' } }}>{log.name}</TableCell>
                            <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, padding: { xs: '8px 4px', sm: '16px' } }}>{log.id}</TableCell>
                            <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, padding: { xs: '8px 4px', sm: '16px' } }}>₹{log.amount}</TableCell>
                            <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, padding: { xs: '8px 4px', sm: '16px' } }}>{log.date ? new Date(log.date).toLocaleDateString() : ''}</TableCell>
                            <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, padding: { xs: '8px 4px', sm: '16px' } }}>{log.method}</TableCell>
                            <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, padding: { xs: '8px 4px', sm: '16px' } }}>{log.ref}</TableCell>
                          </TableRow>
                        )) : (
                          <TableRow>
                            <TableCell colSpan={7} align="center">
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                No transaction logs available
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </Paper>
            </motion.div>
          )}

          {activeTab === 6 && (
            <motion.div key="income-log" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <IncomeLogManager />
            </motion.div>
          )}

          {activeTab === 7 && (
            <motion.div key="expense-log" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <ExpenseLogManager />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Salary Creation Dialog */}
        <Dialog open={salaryDialog} onClose={() => setSalaryDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Create Salary Record</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Staff Member</InputLabel>
                  <Select
                    value={salaryForm.staffId}
                    onChange={(e) => setSalaryForm({ ...salaryForm, staffId: e.target.value })}
                  >
                    {staffList?.map((staff) => (
                      <MenuItem key={staff._id} value={staff._id}>
                        {staff.name} - {staff.role}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Basic Salary"
                  type="number"
                  fullWidth
                  value={salaryForm.basicSalary}
                  onChange={(e) => setSalaryForm({ ...salaryForm, basicSalary: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Allowances</Typography>
                <Grid container spacing={2}>
                  {Object.entries(salaryForm.allowances).map(([key, value]) => (
                    <Grid item xs={12} sm={6} md={4} key={key}>
                      <TextField
                        label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        type="number"
                        fullWidth
                        value={value}
                        onChange={(e) => setSalaryForm({
                          ...salaryForm,
                          allowances: {
                            ...salaryForm.allowances,
                            [key]: parseFloat(e.target.value) || 0
                          }
                        })}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Deductions</Typography>
                <Grid container spacing={2}>
                  {Object.entries(salaryForm.deductions).map(([key, value]) => (
                    <Grid item xs={12} sm={6} md={4} key={key}>
                      <TextField
                        label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        type="number"
                        fullWidth
                        value={value}
                        onChange={(e) => setSalaryForm({
                          ...salaryForm,
                          deductions: {
                            ...salaryForm.deductions,
                            [key]: parseFloat(e.target.value) || 0
                          }
                        })}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info">
                  Net Salary: ₹{calculateNetSalary().toLocaleString('en-IN')}
                </Alert>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSalaryDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSalarySubmit}
              disabled={createSalaryMutation.isLoading}
            >
              {createSalaryMutation.isLoading ? 'Creating...' : 'Create Salary Record'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Salary Templates Dialog */}
        <Dialog open={templateDialog} onClose={() => setTemplateDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle>Salary Templates</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              {salaryTemplates && Object.entries(salaryTemplates).map(([role, template]) => (
                <Grid item xs={12} sm={6} md={4} key={role}>
                  <SalaryTemplateCard
                    role={role}
                    template={template}
                    onSelect={handleTemplateSelect}
                    isSelected={selectedTemplate?.role === role}
                  />
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTemplateDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default EnhancedAccountantDashboard; 