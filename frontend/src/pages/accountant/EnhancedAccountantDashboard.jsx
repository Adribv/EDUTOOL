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
    const totalAllowances = Object.values(salaryForm.allowances).reduce((sum, val) => sum + (val || 0), 0);
    const totalDeductions = Object.values(salaryForm.deductions).reduce((sum, val) => sum + (val || 0), 0);
    const grossSalary = (salaryForm.basicSalary || 0) + totalAllowances;
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