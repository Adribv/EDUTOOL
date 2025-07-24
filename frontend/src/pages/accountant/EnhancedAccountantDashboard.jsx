import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountantAPI } from '../../services/api';
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
          ₹{value.toLocaleString('en-IN')}
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

// Salary Template Card Component
const SalaryTemplateCard = ({ role, template, onSelect, isSelected }) => (
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
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
            {role}
          </Typography>
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
          ₹{template.basicSalary.toLocaleString('en-IN')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Basic Salary
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="success.main">
            + ₹{Object.values(template.allowances).reduce((sum, val) => sum + val, 0).toLocaleString('en-IN')} Allowances
          </Typography>
          <Typography variant="body2" color="error.main">
            - ₹{Object.values(template.deductions).reduce((sum, val) => sum + val, 0).toLocaleString('en-IN')} Deductions
          </Typography>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

// Student Fee Status Manager Component
const StudentFeeStatusManager = () => {
  const theme = useTheme();
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
        <Typography variant="h6" sx={{ mb: 2 }}>Filters</Typography>
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

// Enhanced Accountant Dashboard
const EnhancedAccountantDashboard = () => {
  const theme = useTheme();
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
              Accountant Dashboard
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Comprehensive Staff Salary Management System
            </Typography>
          </motion.div>
          <Box sx={{ display: 'flex', gap: 1 }}>
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
              value={income}
              color={theme.palette.success.main}
              subtitle="From fee collections"
              trend={12.5}
              delay={0.1}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStatCard
              icon={ExpenseIcon}
              label="Total Expenses"
              value={expenses}
              color={theme.palette.error.main}
              subtitle="Operational costs"
              trend={-5.2}
              delay={0.2}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStatCard
              icon={MoneyIcon}
              label="Salary Paid"
              value={salaryStats.totalSalaryPaid || 0}
              color={theme.palette.info.main}
              subtitle={`${salaryStats.totalRecords || 0} staff members`}
              trend={8.7}
              delay={0.3}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStatCard
              icon={TrendingUpIcon}
              label="Net Profit"
              value={profitLoss}
              color={theme.palette.warning.main}
              subtitle="After all expenses"
              trend={15.3}
              delay={0.4}
            />
          </Grid>
        </Grid>

        {/* Main Content Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Overview" icon={<TimelineIcon />} />
            <Tab label="Staff Salaries" icon={<PeopleIcon />} />
            <Tab label="Salary Templates" icon={<SettingsIcon />} />
            <Tab label="Pending Approvals" icon={<HistoryIcon />} />
            <Tab label="Student Fee Status" icon={<AssessmentIcon />} />
            <Tab label="Transaction Log" icon={<HistoryIcon />} />
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
                    <Typography variant="h6" sx={{ mb: 2 }}>Financial Overview</Typography>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { month: 'Jan', income: income * 0.2, expenses: expenses * 0.2, salary: salaryStats.totalSalaryPaid * 0.2 },
                        { month: 'Feb', income: income * 0.3, expenses: expenses * 0.3, salary: salaryStats.totalSalaryPaid * 0.3 },
                        { month: 'Mar', income: income * 0.4, expenses: expenses * 0.4, salary: salaryStats.totalSalaryPaid * 0.4 },
                        { month: 'Apr', income: income * 0.5, expenses: expenses * 0.5, salary: salaryStats.totalSalaryPaid * 0.5 },
                        { month: 'May', income: income * 0.6, expenses: expenses * 0.6, salary: salaryStats.totalSalaryPaid * 0.6 },
                        { month: 'Jun', income: income * 0.7, expenses: expenses * 0.7, salary: salaryStats.totalSalaryPaid * 0.7 },
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
                            { name: 'Operations', value: expenses * 0.3, color: theme.palette.warning.main },
                            { name: 'Maintenance', value: expenses * 0.2, color: theme.palette.error.main },
                            { name: 'Others', value: expenses * 0.5, color: theme.palette.grey[500] }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                        >
                          {[
                            { name: 'Salaries', value: salaryStats.totalSalaryPaid || 0, color: theme.palette.info.main },
                            { name: 'Operations', value: expenses * 0.3, color: theme.palette.warning.main },
                            { name: 'Maintenance', value: expenses * 0.2, color: theme.palette.error.main },
                            { name: 'Others', value: expenses * 0.5, color: theme.palette.grey[500] }
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
              <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setSalaryDialog(true)}
                  sx={{ px: 3, py: 1.5 }}
                >
                  Create Salary Record
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={() => setTemplateDialog(true)}
                >
                  Salary Templates
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                >
                  Bulk Import
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                >
                  Export Report
                </Button>
              </Box>

              {/* Staff List */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Staff Members</Typography>
                {loadingStaff ? (
                  <CircularProgress />
                ) : (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Employee ID</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell>Basic Salary</TableCell>
                        <TableCell>Last Payment</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {staffList?.map((staff) => (
                        <TableRow key={staff._id}>
                          <TableCell>{staff.name}</TableCell>
                          <TableCell>{staff.employeeId}</TableCell>
                          <TableCell>
                            <Chip label={staff.role} size="small" color="primary" />
                          </TableCell>
                          <TableCell>{staff.department?.name || 'N/A'}</TableCell>
                          <TableCell>₹{salaryTemplates?.[staff.role]?.basicSalary?.toLocaleString('en-IN') || 'N/A'}</TableCell>
                          <TableCell>N/A</TableCell>
                          <TableCell>
                            <Chip label="Active" size="small" color="success" />
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" onClick={() => setSelectedStaff(staff)}>
                              <ViewIcon />
                            </IconButton>
                            <IconButton size="small" onClick={() => {
                              setSelectedStaff(staff);
                              setSalaryDialog(true);
                            }}>
                              <EditIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
              <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setTemplateDialog(true)}
                  sx={{ px: 3, py: 1.5 }}
                >
                  Create Template
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={() => window.open('/accountant/salary-template-creator', '_blank')}
                >
                  Advanced Template Creator
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
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
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Transaction Log</Typography>
                {loadingTransactionLog ? <CircularProgress /> : (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>ID</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Method</TableCell>
                        <TableCell>Reference</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactionLog?.map((log, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <Chip label={log.type} color={log.type === 'Salary Credited' ? 'success' : 'error'} />
                          </TableCell>
                          <TableCell>{log.name}</TableCell>
                          <TableCell>{log.id}</TableCell>
                          <TableCell>₹{log.amount}</TableCell>
                          <TableCell>{log.date ? new Date(log.date).toLocaleDateString() : ''}</TableCell>
                          <TableCell>{log.method}</TableCell>
                          <TableCell>{log.ref}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Paper>
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