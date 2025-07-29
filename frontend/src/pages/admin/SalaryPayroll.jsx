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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
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
import { adminAPI, staffAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const AdminSalaryPayroll = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allSalaryRecords, setAllSalaryRecords] = useState([]);
  const [individualSalaryRecords, setIndividualSalaryRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchAllSalaryRecords();
    fetchIndividualSalaryRecords();
  }, []);

  const fetchAllSalaryRecords = async () => {
    try {
      setLoading(true);
      // For admin, we'll fetch all salary records
      const response = await adminAPI.getAllStaff();
      const staffData = response.data || response; // Handle both response.data and direct response
      const staffIds = Array.isArray(staffData) ? staffData.map(staff => staff._id || staff.id) : [];
      
      // Fetch salary records for all staff
      const allRecords = [];
      for (const staffId of staffIds) {
        try {
          const salaryResponse = await adminAPI.getSalaryRecords(staffId);
          if (salaryResponse.data && Array.isArray(salaryResponse.data)) {
            allRecords.push(...salaryResponse.data);
          }
        } catch {
          console.log(`No salary records for staff ${staffId}`);
        }
      }
      
      setAllSalaryRecords(allRecords);
      setError(null);
    } catch (error) {
      console.error('Error fetching salary records:', error);
      setError('Failed to load salary records');
      toast.error('Failed to load salary records');
    } finally {
      setLoading(false);
    }
  };

  const fetchIndividualSalaryRecords = async () => {
    try {
      if (user?._id || user?.id) {
        const response = await staffAPI.getSalaryRecords(user._id || user.id);
        const records = Array.isArray(response.data) ? response.data : [];
        setIndividualSalaryRecords(records);
      }
    } catch (error) {
      console.error('Error fetching individual salary records:', error);
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

  const calculateTotalAllowances = (allowances) => {
    if (!allowances) return 0;
    return Object.values(allowances).reduce((sum, value) => sum + (value || 0), 0);
  };

  const calculateTotalDeductions = (deductions) => {
    if (!deductions) return 0;
    return Object.values(deductions).reduce((sum, value) => sum + (value || 0), 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const filteredRecords = (Array.isArray(allSalaryRecords) ? allSalaryRecords : []).filter(record => {
    if (filterMonth && record.month !== filterMonth) return false;
    if (filterYear && record.year !== parseInt(filterYear)) return false;
    if (filterDepartment && record.department !== filterDepartment) return false;
    if (filterStatus && record.paymentStatus?.toLowerCase() !== filterStatus.toLowerCase()) return false;
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
        Admin Salary & Payroll Management
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
                <Typography variant="h6">Total Salary Paid</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {formatCurrency((Array.isArray(allSalaryRecords) ? allSalaryRecords : []).reduce((sum, record) => sum + (record.netSalary || 0), 0))}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                {(Array.isArray(allSalaryRecords) ? allSalaryRecords : []).length} records
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
                {formatCurrency((Array.isArray(allSalaryRecords) ? allSalaryRecords : []).reduce((sum, record) => sum + calculateTotalAllowances(record.allowances), 0))}
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
                {formatCurrency((Array.isArray(allSalaryRecords) ? allSalaryRecords : []).reduce((sum, record) => sum + calculateTotalDeductions(record.deductions), 0))}
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
                <Typography variant="h6">Paid Records</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {(Array.isArray(allSalaryRecords) ? allSalaryRecords : []).filter(record => record.paymentStatus?.toLowerCase() === 'paid').length}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                Successfully processed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Filters</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Month</InputLabel>
                <Select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  label="Month"
                >
                  <MenuItem value="">All Months</MenuItem>
                  {['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                    <MenuItem key={month} value={month}>{month}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Year</InputLabel>
                <Select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  label="Year"
                >
                  <MenuItem value="">All Years</MenuItem>
                  {[2023, 2024, 2025].map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  label="Department"
                >
                  <MenuItem value="">All Departments</MenuItem>
                  {Array.from(new Set((Array.isArray(allSalaryRecords) ? allSalaryRecords : []).map(record => record.department))).map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <CardContent>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="My Salary" icon={<Person />} />
            <Tab label="All Records" icon={<Assessment />} />
            <Tab label="Summary" icon={<Timeline />} />
          </Tabs>

          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>My Salary Records</Typography>
              {individualSalaryRecords.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Month/Year</TableCell>
                        <TableCell>Basic Salary</TableCell>
                        <TableCell>Allowances</TableCell>
                        <TableCell>Deductions</TableCell>
                        <TableCell>Net Salary</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {individualSalaryRecords.map((record) => (
                        <TableRow key={record._id} hover>
                          <TableCell>{record.month} {record.year}</TableCell>
                          <TableCell>{formatCurrency(record.basicSalary)}</TableCell>
                          <TableCell>{formatCurrency(calculateTotalAllowances(record.allowances))}</TableCell>
                          <TableCell>{formatCurrency(calculateTotalDeductions(record.deductions))}</TableCell>
                          <TableCell>{formatCurrency(record.netSalary)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={record.paymentStatus} 
                              color={getStatusColor(record.paymentStatus)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton onClick={() => handleViewDetails(record)} size="small">
                              <Visibility />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No salary records found for your account.
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Staff Name</TableCell>
                    <TableCell>Employee ID</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Month/Year</TableCell>
                    <TableCell>Basic Salary</TableCell>
                    <TableCell>Net Salary</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record._id} hover>
                      <TableCell>{record.staffName}</TableCell>
                      <TableCell>{record.employeeId}</TableCell>
                      <TableCell>{record.department}</TableCell>
                      <TableCell>{record.month} {record.year}</TableCell>
                      <TableCell>{formatCurrency(record.basicSalary)}</TableCell>
                      <TableCell>{formatCurrency(record.netSalary)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={record.paymentStatus} 
                          color={getStatusColor(record.paymentStatus)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleViewDetails(record)} size="small">
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>Salary Summary by Department</Typography>
              <Grid container spacing={3}>
                {Array.from(new Set((Array.isArray(allSalaryRecords) ? allSalaryRecords : []).map(record => record.department))).map(dept => {
                  const deptRecords = (Array.isArray(allSalaryRecords) ? allSalaryRecords : []).filter(record => record.department === dept);
                  const totalSalary = deptRecords.reduce((sum, record) => sum + (record.netSalary || 0), 0);
                  const avgSalary = deptRecords.length > 0 ? totalSalary / deptRecords.length : 0;
                  
                  return (
                    <Grid item xs={12} md={6} key={dept}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>{dept}</Typography>
                          <Typography variant="body2">Total Salary: {formatCurrency(totalSalary)}</Typography>
                          <Typography variant="body2">Average Salary: {formatCurrency(avgSalary)}</Typography>
                          <Typography variant="body2">Records: {deptRecords.length}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Salary Details Dialog */}
      <Dialog open={detailsDialog} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        <DialogTitle>
          Salary Details - {selectedRecord?.staffName} ({selectedRecord?.month} {selectedRecord?.year})
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
                        secondary={formatCurrency(selectedRecord.grossSalary)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Net Salary"
                        secondary={formatCurrency(selectedRecord.netSalary)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Payment Status"
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
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminSalaryPayroll; 