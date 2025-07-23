import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  AccountBalance,
  Payment,
  TrendingUp,
  TrendingDown,
  CalendarToday,
  Work,
  School,
  Person,
  Receipt,
  Download,
  Print,
  Visibility,
  ExpandMore,
  AttachMoney,
  AccountBox,
  CreditCard,
  ReceiptLong,
  Assessment,
  Timeline,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { staffAPI } from '../../services/api';
import { toast } from 'react-toastify';

const SalaryPayroll = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

  useEffect(() => {
    fetchSalaryRecords();
  }, []);

  const fetchSalaryRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const staffId = user?._id || user?.id;
      if (!staffId) {
        setError('User ID not found');
        setSalaryRecords([]);
        return;
      }

      const response = await staffAPI.getSalaryRecords(staffId);
      
      // Handle different response formats
      let records = [];
      if (Array.isArray(response)) {
        records = response;
      } else if (response && Array.isArray(response.data)) {
        records = response.data;
      } else {
        console.warn('Unexpected response format:', response);
        records = [];
      }

      setSalaryRecords(records);
      console.log('Salary records loaded:', records);
    } catch (error) {
      console.error('Error fetching salary records:', error);
      setError(error.response?.data?.message || 'Failed to load salary records');
      toast.error('Failed to load salary records');
      setSalaryRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setDetailsDialog(true);
  };

  const handleCloseDetails = () => {
    setDetailsDialog(false);
    setSelectedRecord(null);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'bank transfer':
        return <AccountBalance />;
      case 'cash':
        return <AttachMoney />;
      case 'check':
        return <Receipt />;
      case 'online':
        return <CreditCard />;
      default:
        return <Payment />;
    }
  };

  const calculateTotalAllowances = (allowances) => {
    if (!allowances || typeof allowances !== 'object') return 0;
    return Object.values(allowances).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  };

  const calculateTotalDeductions = (deductions) => {
    if (!deductions || typeof deductions !== 'object') return 0;
    return Object.values(deductions).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  };

  const calculateGrossSalary = (basicSalary, allowances) => {
    const basic = parseFloat(basicSalary) || 0;
    const totalAllowances = calculateTotalAllowances(allowances);
    return basic + totalAllowances;
  };

  const calculateNetSalary = (basicSalary, allowances, deductions) => {
    const gross = calculateGrossSalary(basicSalary, allowances);
    const totalDeductions = calculateTotalDeductions(deductions);
    return gross - totalDeductions;
  };

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const filteredRecords = (Array.isArray(salaryRecords) ? salaryRecords : []).filter(record => {
    if (filterMonth && record.month !== filterMonth) return false;
    if (filterYear && record.year !== parseInt(filterYear)) return false;
    return true;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Salary & Payroll
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalance sx={{ mr: 1 }} />
                <Typography variant="h6">Total Salary</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {formatCurrency((Array.isArray(salaryRecords) ? salaryRecords : []).reduce((sum, record) => 
                  sum + calculateNetSalary(record.basicSalary, record.allowances, record.deductions), 0
                ))}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                {(Array.isArray(salaryRecords) ? salaryRecords : []).length} month(s)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ mr: 1 }} />
                <Typography variant="h6">Total Allowances</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {formatCurrency((Array.isArray(salaryRecords) ? salaryRecords : []).reduce((sum, record) => sum + calculateTotalAllowances(record.allowances), 0))}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                All time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingDown sx={{ mr: 1 }} />
                <Typography variant="h6">Total Deductions</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {formatCurrency((Array.isArray(salaryRecords) ? salaryRecords : []).reduce((sum, record) => sum + calculateTotalDeductions(record.deductions), 0))}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                All time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Payment sx={{ mr: 1 }} />
                <Typography variant="h6">Latest Salary</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {salaryRecords.length > 0 ? formatCurrency(calculateNetSalary(salaryRecords[0].basicSalary, salaryRecords[0].allowances, salaryRecords[0].deductions)) : '₹0'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                {salaryRecords.length > 0 ? `${salaryRecords[0].month} ${salaryRecords[0].year}` : 'No records'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Filter by Month</InputLabel>
                <Select
                  value={filterMonth}
                  label="Filter by Month"
                  onChange={(e) => setFilterMonth(e.target.value)}
                >
                  <MenuItem value="">All Months</MenuItem>
                  <MenuItem value="January">January</MenuItem>
                  <MenuItem value="February">February</MenuItem>
                  <MenuItem value="March">March</MenuItem>
                  <MenuItem value="April">April</MenuItem>
                  <MenuItem value="May">May</MenuItem>
                  <MenuItem value="June">June</MenuItem>
                  <MenuItem value="July">July</MenuItem>
                  <MenuItem value="August">August</MenuItem>
                  <MenuItem value="September">September</MenuItem>
                  <MenuItem value="October">October</MenuItem>
                  <MenuItem value="November">November</MenuItem>
                  <MenuItem value="December">December</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Filter by Year</InputLabel>
                <Select
                  value={filterYear}
                  label="Filter by Year"
                  onChange={(e) => setFilterYear(e.target.value)}
                >
                  <MenuItem value="">All Years</MenuItem>
                  <MenuItem value="2025">2025</MenuItem>
                  <MenuItem value="2024">2024</MenuItem>
                  <MenuItem value="2023">2023</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="outlined"
                onClick={() => {
                  setFilterMonth('');
                  setFilterYear('');
                }}
                fullWidth
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Salary Records" icon={<ReceiptLong />} />
          <Tab label="Payment History" icon={<Timeline />} />
          <Tab label="Bank Details" icon={<AccountBox />} />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Month/Year</TableCell>
                <TableCell>Basic Salary</TableCell>
                <TableCell>Allowances</TableCell>
                <TableCell>Deductions</TableCell>
                <TableCell>Gross Salary</TableCell>
                <TableCell>Net Salary</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment Method</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record._id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {record.month} {record.year}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatDate(record.createdAt)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{formatCurrency(record.basicSalary)}</TableCell>
                  <TableCell>{formatCurrency(calculateTotalAllowances(record.allowances))}</TableCell>
                  <TableCell>{formatCurrency(calculateTotalDeductions(record.deductions))}</TableCell>
                  <TableCell>{formatCurrency(calculateGrossSalary(record.basicSalary, record.allowances))}</TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="bold" color="primary">
                      {formatCurrency(calculateNetSalary(record.basicSalary, record.allowances, record.deductions))}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={record.paymentStatus}
                      color={getStatusColor(record.paymentStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getPaymentMethodIcon(record.paymentMethod)}
                      <Typography variant="body2">{record.paymentMethod}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => handleViewDetails(record)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {filteredRecords.map((record) => (
            <Grid item xs={12} md={6} key={record._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">{record.month} {record.year}</Typography>
                    <Chip
                      label={record.paymentStatus}
                      color={getStatusColor(record.paymentStatus)}
                      size="small"
                    />
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Amount</Typography>
                      <Typography variant="h6" color="primary">
                        {formatCurrency(calculateNetSalary(record.basicSalary, record.allowances, record.deductions))}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Method</Typography>
                      <Typography variant="body1">{record.paymentMethod}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Date</Typography>
                      <Typography variant="body1">{formatDate(record.createdAt)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Employee ID</Typography>
                      <Typography variant="body1">{record.employeeId}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Bank Account Details</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <AccountBalance />
                    </ListItemIcon>
                    <ListItemText
                      primary="Bank Name"
                      secondary={selectedRecord?.bankDetails?.bankName || 'Not provided'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AccountBox />
                    </ListItemIcon>
                    <ListItemText
                      primary="Account Number"
                      secondary={selectedRecord?.bankDetails?.accountNumber || 'Not provided'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CreditCard />
                    </ListItemIcon>
                    <ListItemText
                      primary="IFSC Code"
                      secondary={selectedRecord?.bankDetails?.ifscCode || 'Not provided'}
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText
                      primary="Account Holder"
                      secondary={user?.name || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Work />
                    </ListItemIcon>
                    <ListItemText
                      primary="Branch"
                      secondary={selectedRecord?.bankDetails?.branch || 'Not provided'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Payment />
                    </ListItemIcon>
                    <ListItemText
                      primary="Account Type"
                      secondary="Savings Account"
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Salary Details Dialog */}
      <Dialog open={detailsDialog} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        <DialogTitle>
          Salary Details - {selectedRecord?.month} {selectedRecord?.year}
        </DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Basic Information</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Employee ID"
                        secondary={selectedRecord.employeeId}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Name"
                        secondary={selectedRecord.staffName}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Designation"
                        secondary={selectedRecord.designation}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Department"
                        secondary={selectedRecord.department || 'N/A'}
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Salary Breakdown</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Basic Salary"
                        secondary={formatCurrency(selectedRecord.basicSalary)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Gross Salary"
                        secondary={formatCurrency(calculateGrossSalary(selectedRecord.basicSalary, selectedRecord.allowances))}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Net Salary"
                        secondary={formatCurrency(calculateNetSalary(selectedRecord.basicSalary, selectedRecord.allowances, selectedRecord.deductions))}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Status"
                        secondary={
                          <Chip
                            label={selectedRecord.paymentStatus}
                            color={getStatusColor(selectedRecord.paymentStatus)}
                            size="small"
                          />
                        }
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="h6">Allowances</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="textSecondary">House Rent</Typography>
                          <Typography variant="body1">{formatCurrency(selectedRecord.allowances?.houseRentAllowance)}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="textSecondary">Dearness</Typography>
                          <Typography variant="body1">{formatCurrency(selectedRecord.allowances?.dearnessAllowance)}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="textSecondary">Transport</Typography>
                          <Typography variant="body1">{formatCurrency(selectedRecord.allowances?.transportAllowance)}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="textSecondary">Medical</Typography>
                          <Typography variant="body1">{formatCurrency(selectedRecord.allowances?.medicalAllowance)}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="textSecondary">Other</Typography>
                          <Typography variant="body1">{formatCurrency(selectedRecord.allowances?.otherAllowances)}</Typography>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
                <Grid item xs={12}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="h6">Deductions</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="textSecondary">Provident Fund</Typography>
                          <Typography variant="body1">{formatCurrency(selectedRecord.deductions?.providentFund)}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="textSecondary">Tax</Typography>
                          <Typography variant="body1">{formatCurrency(selectedRecord.deductions?.tax)}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="textSecondary">Insurance</Typography>
                          <Typography variant="body1">{formatCurrency(selectedRecord.deductions?.insurance)}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="textSecondary">Other</Typography>
                          <Typography variant="body1">{formatCurrency(selectedRecord.deductions?.otherDeductions)}</Typography>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
                <Grid item xs={12}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="h6">Attendance & Performance</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="textSecondary">Total Days</Typography>
                          <Typography variant="body1">{selectedRecord.attendance?.totalDays || 0}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="textSecondary">Present Days</Typography>
                          <Typography variant="body1">{selectedRecord.attendance?.presentDays || 0}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="textSecondary">Leave Days</Typography>
                          <Typography variant="body1">{selectedRecord.attendance?.leaveDays || 0}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="textSecondary">Performance Rating</Typography>
                          <Typography variant="body1">{selectedRecord.performance?.rating || 0}/5</Typography>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
          <Button variant="contained" startIcon={<Download />}>
            Download Payslip
          </Button>
          <Button variant="outlined" startIcon={<Print />}>
            Print
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalaryPayroll; 