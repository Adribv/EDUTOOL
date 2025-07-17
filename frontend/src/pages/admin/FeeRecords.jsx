import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Tooltip,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tabs,
  Tab,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Google as GoogleIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';
import Papa from 'papaparse';

const FeeRecords = () => {
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [studentFeeRecords, setStudentFeeRecords] = useState([]);
  const [staffSalaryRecords, setStaffSalaryRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState({});
  
  // Dialog states
  const [studentFeeDialog, setStudentFeeDialog] = useState(false);
  const [staffSalaryDialog, setStaffSalaryDialog] = useState(false);
  const [importDialog, setImportDialog] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);
  
  // Form states
  const [studentFeeForm, setStudentFeeForm] = useState({
    studentId: '',
    academicYear: new Date().getFullYear().toString(),
    term: 'Annual',
    feeType: 'Tuition',
    amount: '',
    dueDate: '',
    remarks: '',
    parentContact: {
      name: '',
      phone: '',
      email: ''
    }
  });
  
  const [staffSalaryForm, setStaffSalaryForm] = useState({
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
    remarks: '',
    attendance: {
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
      leaveDays: 0
    },
    performance: {
      rating: 5,
      comments: ''
    }
  });
  
  // Import states
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetData, setSheetData] = useState([]);
  const [importType, setImportType] = useState('student');
  const [processing, setProcessing] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchData();
  }, [tabValue, page, rowsPerPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      const [studentsRes, staffRes, statsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin-staff/students/public'),
        axios.get('http://localhost:5000/api/admin-staff/staff/public'),
        axios.get('http://localhost:5000/api/admin-staff/fee-records/stats/public')
      ]);
      
      setStudents(studentsRes.data);
      setStaff(staffRes.data);
      setStats(statsRes.data);
      
      // Fetch records based on current tab
      if (tabValue === 0) {
        const studentRecordsRes = await axios.get(`http://localhost:5000/api/admin-staff/fee-records/student?page=${page + 1}&limit=${rowsPerPage}`, config);
        setStudentFeeRecords(studentRecordsRes.data.data);
        setTotalRecords(studentRecordsRes.data.pagination.totalRecords);
      } else {
        const staffRecordsRes = await axios.get(`http://localhost:5000/api/admin-staff/fee-records/staff?page=${page + 1}&limit=${rowsPerPage}`, config);
        setStaffSalaryRecords(staffRecordsRes.data.data);
        setTotalRecords(staffRecordsRes.data.pagination.totalRecords);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };

  const handleStudentFeeSubmit = async () => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      await axios.post('http://localhost:5000/api/admin-staff/fee-records/student', studentFeeForm, config);
      toast.success('Student fee record approval request submitted successfully');
      setStudentFeeDialog(false);
      resetStudentFeeForm();
      fetchData();
    } catch (error) {
      console.error('Error creating student fee record:', error);
      toast.error(error.response?.data?.message || 'Failed to create student fee record');
    } finally {
      setProcessing(false);
    }
  };

  const handleStaffSalarySubmit = async () => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      await axios.post('http://localhost:5000/api/admin-staff/fee-records/staff', staffSalaryForm, config);
      toast.success('Staff salary record approval request submitted successfully');
      setStaffSalaryDialog(false);
      resetStaffSalaryForm();
      fetchData();
    } catch (error) {
      console.error('Error creating staff salary record:', error);
      toast.error(error.response?.data?.message || 'Failed to create staff salary record');
    } finally {
      setProcessing(false);
    }
  };

  const handleImportSheet = async () => {
    try {
      if (!sheetUrl) {
        toast.error('Please enter a Google Sheet URL');
        return;
      }

      // Convert Google Sheet link to CSV export link
      const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!match) {
        toast.error('Invalid Google Sheet link');
        return;
      }
      
      const sheetId = match[1];
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      const response = await fetch(csvUrl);
      const csv = await response.text();
      const parsed = Papa.parse(csv, { header: true });
      setSheetData(parsed.data);
      setPreviewDialog(true);
    } catch (error) {
      console.error('Error importing sheet:', error);
      toast.error('Failed to fetch or parse sheet');
    }
  };

  const handleBulkImport = async () => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      const endpoint = importType === 'student' 
        ? 'http://localhost:5000/api/admin-staff/fee-records/student/bulk-import'
        : 'http://localhost:5000/api/admin-staff/fee-records/staff/bulk-import';
      
      const response = await axios.post(endpoint, { records: sheetData }, config);
      
      toast.success(`Bulk import completed! ${response.data.results.successful.length} successful, ${response.data.results.failed.length} failed`);
      
      if (response.data.results.failed.length > 0) {
        const errorInfo = response.data.results.failed.map(f => `${f.studentName || f.staffName}: ${f.error}`).join('\n');
        alert(`Failed imports:\n${errorInfo}`);
      }
      
      setPreviewDialog(false);
      setImportDialog(false);
      setSheetData([]);
      setSheetUrl('');
      fetchData();
    } catch (error) {
      console.error('Error in bulk import:', error);
      toast.error('Failed to import records');
    } finally {
      setProcessing(false);
    }
  };

  const resetStudentFeeForm = () => {
    setStudentFeeForm({
      studentId: '',
      academicYear: new Date().getFullYear().toString(),
      term: 'Annual',
      feeType: 'Tuition',
      amount: '',
      dueDate: '',
      remarks: '',
      parentContact: {
        name: '',
        phone: '',
        email: ''
      }
    });
  };

  const resetStaffSalaryForm = () => {
    setStaffSalaryForm({
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
      remarks: '',
      attendance: {
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        leaveDays: 0
      },
      performance: {
        rating: 5,
        comments: ''
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Pending': return 'warning';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'success';
      case 'Pending': return 'warning';
      case 'Overdue': return 'error';
      case 'Partial': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Fee Records Management</Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={async () => {
              try {
                const token = localStorage.getItem('token');
                console.log('🔑 Token:', token);
                const response = await axios.post('http://localhost:5000/api/admin-staff/fee-records/test', {
                  test: 'data'
                }, {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
                console.log('✅ Test response:', response.data);
                toast.success('Test endpoint working!');
              } catch (error) {
                console.error('❌ Test failed:', error);
                toast.error('Test failed: ' + error.message);
              }
            }}
            sx={{ mr: 2 }}
          >
            Test Auth
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => setImportDialog(true)}
            sx={{ mr: 2 }}
          >
            Import from Google Sheets
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => tabValue === 0 ? setStudentFeeDialog(true) : setStaffSalaryDialog(true)}
          >
            Add {tabValue === 0 ? 'Student Fee' : 'Staff Salary'} Record
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SchoolIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Student Fee Records</Typography>
              </Box>
              <Typography variant="h4">
                {stats.studentFeeRecords?.totalRecords || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Amount: ₹{stats.studentFeeRecords?.totalAmount || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <WorkIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Staff Salary Records</Typography>
              </Box>
              <Typography variant="h4">
                {stats.staffSalaryRecords?.totalRecords || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Net Salary: ₹{stats.staffSalaryRecords?.totalNetSalary || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <MoneyIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Paid</Typography>
              </Box>
              <Typography variant="h4">
                ₹{(stats.studentFeeRecords?.totalPaid || 0) + (stats.staffSalaryRecords?.totalPaid || 0)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Combined payments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <WarningIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Pending Amount</Typography>
              </Box>
              <Typography variant="h4">
                ₹{stats.studentFeeRecords?.pendingAmount || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Student fees pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Student Fee Records" />
          <Tab label="Staff Salary Records" />
        </Tabs>
      </Paper>

      {/* Records Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {tabValue === 0 ? (
                <>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Roll Number</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Fee Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Payment Status</TableCell>
                  <TableCell>Approval Status</TableCell>
                </>
              ) : (
                <>
                  <TableCell>Staff Name</TableCell>
                  <TableCell>Employee ID</TableCell>
                  <TableCell>Designation</TableCell>
                  <TableCell>Month/Year</TableCell>
                  <TableCell>Basic Salary</TableCell>
                  <TableCell>Net Salary</TableCell>
                  <TableCell>Payment Status</TableCell>
                  <TableCell>Approval Status</TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {tabValue === 0 ? (
              studentFeeRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No student fee records found
                  </TableCell>
                </TableRow>
              ) : (
                studentFeeRecords.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell>{record.studentName}</TableCell>
                    <TableCell>{record.rollNumber}</TableCell>
                    <TableCell>{record.class}-{record.section}</TableCell>
                    <TableCell>
                      <Chip label={record.feeType} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>₹{record.amount}</TableCell>
                    <TableCell>{new Date(record.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={record.paymentStatus}
                        color={getPaymentStatusColor(record.paymentStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.status}
                        color={getStatusColor(record.status)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )
            ) : (
              staffSalaryRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No staff salary records found
                  </TableCell>
                </TableRow>
              ) : (
                staffSalaryRecords.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell>{record.staffName}</TableCell>
                    <TableCell>{record.employeeId}</TableCell>
                    <TableCell>{record.designation}</TableCell>
                    <TableCell>{record.month} {record.year}</TableCell>
                    <TableCell>₹{record.basicSalary}</TableCell>
                    <TableCell>₹{record.netSalary}</TableCell>
                    <TableCell>
                      <Chip
                        label={record.paymentStatus}
                        color={getPaymentStatusColor(record.paymentStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.status}
                        color={getStatusColor(record.status)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalRecords}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Student Fee Record Dialog */}
      <Dialog open={studentFeeDialog} onClose={() => setStudentFeeDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Student Fee Record</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Student</InputLabel>
                <Select
                  value={studentFeeForm.studentId}
                  onChange={(e) => setStudentFeeForm({ ...studentFeeForm, studentId: e.target.value })}
                >
                  {students.map((student) => (
                    <MenuItem key={student._id} value={student._id}>
                      {student.name} - {student.rollNumber} ({student.class}-{student.section})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Academic Year"
                fullWidth
                value={studentFeeForm.academicYear}
                onChange={(e) => setStudentFeeForm({ ...studentFeeForm, academicYear: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Term</InputLabel>
                <Select
                  value={studentFeeForm.term}
                  onChange={(e) => setStudentFeeForm({ ...studentFeeForm, term: e.target.value })}
                >
                  <MenuItem value="Term 1">Term 1</MenuItem>
                  <MenuItem value="Term 2">Term 2</MenuItem>
                  <MenuItem value="Term 3">Term 3</MenuItem>
                  <MenuItem value="Annual">Annual</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Fee Type</InputLabel>
                <Select
                  value={studentFeeForm.feeType}
                  onChange={(e) => setStudentFeeForm({ ...studentFeeForm, feeType: e.target.value })}
                >
                  <MenuItem value="Tuition">Tuition</MenuItem>
                  <MenuItem value="Transportation">Transportation</MenuItem>
                  <MenuItem value="Library">Library</MenuItem>
                  <MenuItem value="Laboratory">Laboratory</MenuItem>
                  <MenuItem value="Sports">Sports</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Amount"
                type="number"
                fullWidth
                value={studentFeeForm.amount}
                onChange={(e) => setStudentFeeForm({ ...studentFeeForm, amount: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Due Date"
                type="date"
                fullWidth
                value={studentFeeForm.dueDate}
                onChange={(e) => setStudentFeeForm({ ...studentFeeForm, dueDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Remarks"
                multiline
                rows={3}
                fullWidth
                value={studentFeeForm.remarks}
                onChange={(e) => setStudentFeeForm({ ...studentFeeForm, remarks: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStudentFeeDialog(false)} disabled={processing}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleStudentFeeSubmit}
            disabled={processing || !studentFeeForm.studentId || !studentFeeForm.amount}
            startIcon={processing ? <CircularProgress size={16} /> : <AddIcon />}
          >
            {processing ? 'Submitting...' : 'Submit for Approval'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Staff Salary Record Dialog */}
      <Dialog open={staffSalaryDialog} onClose={() => setStaffSalaryDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Staff Salary Record</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Staff Member</InputLabel>
                <Select
                  value={staffSalaryForm.staffId}
                  onChange={(e) => setStaffSalaryForm({ ...staffSalaryForm, staffId: e.target.value })}
                >
                  {staff.map((staffMember) => (
                    <MenuItem key={staffMember._id} value={staffMember._id}>
                      {staffMember.name} - {staffMember.employeeId}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Month</InputLabel>
                <Select
                  value={staffSalaryForm.month}
                  onChange={(e) => setStaffSalaryForm({ ...staffSalaryForm, month: e.target.value })}
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                    <MenuItem key={month} value={month}>{month}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Year"
                type="number"
                fullWidth
                value={staffSalaryForm.year}
                onChange={(e) => setStaffSalaryForm({ ...staffSalaryForm, year: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Basic Salary"
                type="number"
                fullWidth
                value={staffSalaryForm.basicSalary}
                onChange={(e) => setStaffSalaryForm({ ...staffSalaryForm, basicSalary: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Allowances</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <TextField
                    label="HRA"
                    type="number"
                    fullWidth
                    value={staffSalaryForm.allowances.houseRentAllowance}
                    onChange={(e) => setStaffSalaryForm({
                      ...staffSalaryForm,
                      allowances: {
                        ...staffSalaryForm.allowances,
                        houseRentAllowance: parseFloat(e.target.value) || 0
                      }
                    })}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField
                    label="DA"
                    type="number"
                    fullWidth
                    value={staffSalaryForm.allowances.dearnessAllowance}
                    onChange={(e) => setStaffSalaryForm({
                      ...staffSalaryForm,
                      allowances: {
                        ...staffSalaryForm.allowances,
                        dearnessAllowance: parseFloat(e.target.value) || 0
                      }
                    })}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField
                    label="Transport"
                    type="number"
                    fullWidth
                    value={staffSalaryForm.allowances.transportAllowance}
                    onChange={(e) => setStaffSalaryForm({
                      ...staffSalaryForm,
                      allowances: {
                        ...staffSalaryForm.allowances,
                        transportAllowance: parseFloat(e.target.value) || 0
                      }
                    })}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField
                    label="Medical"
                    type="number"
                    fullWidth
                    value={staffSalaryForm.allowances.medicalAllowance}
                    onChange={(e) => setStaffSalaryForm({
                      ...staffSalaryForm,
                      allowances: {
                        ...staffSalaryForm.allowances,
                        medicalAllowance: parseFloat(e.target.value) || 0
                      }
                    })}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Deductions</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <TextField
                    label="PF"
                    type="number"
                    fullWidth
                    value={staffSalaryForm.deductions.providentFund}
                    onChange={(e) => setStaffSalaryForm({
                      ...staffSalaryForm,
                      deductions: {
                        ...staffSalaryForm.deductions,
                        providentFund: parseFloat(e.target.value) || 0
                      }
                    })}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField
                    label="Tax"
                    type="number"
                    fullWidth
                    value={staffSalaryForm.deductions.tax}
                    onChange={(e) => setStaffSalaryForm({
                      ...staffSalaryForm,
                      deductions: {
                        ...staffSalaryForm.deductions,
                        tax: parseFloat(e.target.value) || 0
                      }
                    })}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField
                    label="Insurance"
                    type="number"
                    fullWidth
                    value={staffSalaryForm.deductions.insurance}
                    onChange={(e) => setStaffSalaryForm({
                      ...staffSalaryForm,
                      deductions: {
                        ...staffSalaryForm.deductions,
                        insurance: parseFloat(e.target.value) || 0
                      }
                    })}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField
                    label="Others"
                    type="number"
                    fullWidth
                    value={staffSalaryForm.deductions.otherDeductions}
                    onChange={(e) => setStaffSalaryForm({
                      ...staffSalaryForm,
                      deductions: {
                        ...staffSalaryForm.deductions,
                        otherDeductions: parseFloat(e.target.value) || 0
                      }
                    })}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Remarks"
                multiline
                rows={3}
                fullWidth
                value={staffSalaryForm.remarks}
                onChange={(e) => setStaffSalaryForm({ ...staffSalaryForm, remarks: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStaffSalaryDialog(false)} disabled={processing}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleStaffSalarySubmit}
            disabled={processing || !staffSalaryForm.staffId || !staffSalaryForm.basicSalary}
            startIcon={processing ? <CircularProgress size={16} /> : <AddIcon />}
          >
            {processing ? 'Submitting...' : 'Submit for Approval'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialog} onClose={() => setImportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import from Google Sheets</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Import Type</InputLabel>
            <Select
              value={importType}
              onChange={(e) => setImportType(e.target.value)}
            >
              <MenuItem value="student">Student Fee Records</MenuItem>
              <MenuItem value="staff">Staff Salary Records</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Google Sheet URL"
            fullWidth
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/..."
            helperText="Make sure the sheet is publicly accessible"
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Required columns for {importType === 'student' ? 'Student Fee Records' : 'Staff Salary Records'}:</strong>
            </Typography>
            {importType === 'student' ? (
              <Typography variant="body2">
                studentName, rollNumber, class, section, academicYear, term, feeType, amount, dueDate, remarks
              </Typography>
            ) : (
              <Typography variant="body2">
                staffName, employeeId, designation, department, month, year, basicSalary, allowances, deductions, remarks
              </Typography>
            )}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleImportSheet}
            startIcon={<GoogleIcon />}
          >
            Import Sheet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialog} onClose={() => setPreviewDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Preview Import Data</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Found {sheetData.length} records to import
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {sheetData.length > 0 && Object.keys(sheetData[0]).map((key) => (
                    <TableCell key={key}>{key}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sheetData.slice(0, 5).map((row, index) => (
                  <TableRow key={index}>
                    {Object.values(row).map((value, i) => (
                      <TableCell key={i}>{value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {sheetData.length > 5 && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Showing first 5 records of {sheetData.length} total
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleBulkImport}
            disabled={processing}
            startIcon={processing ? <CircularProgress size={16} /> : <UploadIcon />}
          >
            {processing ? 'Importing...' : 'Import Records'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeeRecords; 