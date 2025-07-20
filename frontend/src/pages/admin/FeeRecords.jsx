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
  Card,
  CardContent,
  Alert,
  Snackbar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  InputAdornment
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
  const [studentFeeRecords, setStudentFeeRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({});
  
  // Dialog states
  const [studentFeeDialog, setStudentFeeDialog] = useState(false);
  const [importDialog, setImportDialog] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);
  
  // Form states
  const [studentFeeForm, setStudentFeeForm] = useState({
    studentId: '',
    academicYear: new Date().getFullYear().toString(),
    term: 'Annual',
    totalFee: '',
    paymentReceived: '0',
    dueDate: '',
    parentName: '',
    contactNumber: '',
    admissionNumber: '',
    paymentMethod: '',
    reminderDate: '',
    followUpDate: '',
    noticeIssueDate: '',
    modeOfContact: '',
    remarks: '',
    parentContact: {
      name: '',
      phone: '',
      email: ''
    }
  });
  
  // Import states
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetData, setSheetData] = useState([]);
  const [processing, setProcessing] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage]);

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
      
      const [studentsRes, statsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin-staff/students/public'),
        axios.get('http://localhost:5000/api/admin-staff/fee-records/stats/public')
      ]);
      
      setStudents(studentsRes.data);
      setStats(statsRes.data);
      
      // Fetch student fee records
      const studentRecordsRes = await axios.get(`http://localhost:5000/api/admin-staff/fee-records/student?page=${page + 1}&limit=${rowsPerPage}`, config);
      setStudentFeeRecords(studentRecordsRes.data.data);
      setTotalRecords(studentRecordsRes.data.pagination.totalRecords);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
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
      // Use direct creation endpoint for immediate testing
      await axios.post('http://localhost:5000/api/admin-staff/fee-records/student/direct', studentFeeForm, config);
      toast.success('Student fee record created successfully');
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
      
      const response = await axios.post('http://localhost:5000/api/admin-staff/fee-records/student/bulk-import', { records: sheetData }, config);
      
      toast.success(`Bulk import completed! ${response.data.results.successful.length} successful, ${response.data.results.failed.length} failed`);
      
      if (response.data.results.failed.length > 0) {
        const errorInfo = response.data.results.failed.map(f => `${f.studentName}: ${f.error}`).join('\n');
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

  const checkPendingApprovals = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      const response = await axios.get('http://localhost:5000/api/admin-staff/fee-records/pending-approvals', config);
      console.log('📋 Pending approvals:', response.data);
      if (response.data.count > 0) {
        toast.info(`Found ${response.data.count} pending fee record approvals`);
        alert(`Pending Approvals:\n${response.data.pendingApprovals.map(approval => 
          `- ${approval.title} (${approval.requesterId?.name || 'Unknown'})`
        ).join('\n')}`);
      } else {
        toast.success('No pending fee record approvals found');
      }
    } catch (error) {
      console.error('Error checking pending approvals:', error);
      toast.error('Failed to check pending approvals');
    }
  };

  const resetStudentFeeForm = () => {
    setStudentFeeForm({
      studentId: '',
      academicYear: new Date().getFullYear().toString(),
      term: 'Annual',
      totalFee: '',
      paymentReceived: '0',
      dueDate: '',
      parentName: '',
      contactNumber: '',
      admissionNumber: '',
      paymentMethod: '',
      reminderDate: '',
      followUpDate: '',
      noticeIssueDate: '',
      modeOfContact: '',
      remarks: '',
      parentContact: {
        name: '',
        phone: '',
        email: ''
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
        <Typography variant="h4">Student Fee Records Management</Typography>
        <Box display="flex" gap={2} alignItems="center">
          <Button
            variant="outlined"
            size="small"
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
          >
            Test Auth
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={checkPendingApprovals}
          >
            Check Pending Approvals
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<UploadIcon />}
            onClick={() => setImportDialog(true)}
          >
            Import from Google Sheets
          </Button>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => setStudentFeeDialog(true)}
            sx={{
              px: 3,
              py: 1.5,
              fontWeight: 600,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-1px)'
              }
            }}
          >
            Add Student Fee Record
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={4}>
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
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <MoneyIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Paid</Typography>
              </Box>
              <Typography variant="h4">
                ₹{stats.studentFeeRecords?.totalPaid || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Student fees paid
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
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

      {/* Records Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>S.No</TableCell>
              <TableCell>Student Name</TableCell>
              <TableCell>Admission No</TableCell>
              <TableCell>Class-Section</TableCell>
              <TableCell>Parent Name</TableCell>
              <TableCell>Contact Number</TableCell>
              <TableCell>Total Fee</TableCell>
              <TableCell>Payment Received</TableCell>
              <TableCell>Balance Due</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell>Mode of Payment</TableCell>
              <TableCell>Reminder Date</TableCell>
              <TableCell>Follow Up Date</TableCell>
              <TableCell>Notice Issue Date</TableCell>
              <TableCell>Mode of Contact</TableCell>
              <TableCell>Approval Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {studentFeeRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={17} align="center">
                  No student fee records found
                </TableCell>
              </TableRow>
            ) : (
              studentFeeRecords.map((record, index) => (
                <TableRow key={record._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{record.studentName}</TableCell>
                  <TableCell>{record.admissionNumber || 'N/A'}</TableCell>
                  <TableCell>{record.class}-{record.section}</TableCell>
                  <TableCell>{record.parentName || 'N/A'}</TableCell>
                  <TableCell>{record.contactNumber || 'N/A'}</TableCell>
                  <TableCell>₹{record.totalFee || record.amount || 0}</TableCell>
                  <TableCell>₹{record.paymentReceived || record.amountPaid || 0}</TableCell>
                  <TableCell>₹{record.balanceDue || ((record.totalFee || record.amount || 0) - (record.paymentReceived || record.amountPaid || 0))}</TableCell>
                  <TableCell>{new Date(record.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={record.paymentStatus}
                      color={getPaymentStatusColor(record.paymentStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{record.paymentMethod || 'N/A'}</TableCell>
                  <TableCell>{record.reminderDate ? new Date(record.reminderDate).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>{record.followUpDate ? new Date(record.followUpDate).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>{record.noticeIssueDate ? new Date(record.noticeIssueDate).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>{record.modeOfContact || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={record.status}
                      color={getStatusColor(record.status)}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))
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
      <Dialog open={studentFeeDialog} onClose={() => setStudentFeeDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Add Student Fee Record</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* Student Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Student Information</Typography>
            </Grid>
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
                label="Admission Number"
                fullWidth
                value={studentFeeForm.admissionNumber}
                onChange={(e) => setStudentFeeForm({ ...studentFeeForm, admissionNumber: e.target.value })}
                required
              />
            </Grid>
            
            {/* Academic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Academic Information</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Academic Year"
                fullWidth
                value={studentFeeForm.academicYear}
                onChange={(e) => setStudentFeeForm({ ...studentFeeForm, academicYear: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Term</InputLabel>
                <Select
                  value={studentFeeForm.term}
                  onChange={(e) => setStudentFeeForm({ ...studentFeeForm, term: e.target.value })}
                  required
                >
                  <MenuItem value="Term 1">Term 1</MenuItem>
                  <MenuItem value="Term 2">Term 2</MenuItem>
                  <MenuItem value="Term 3">Term 3</MenuItem>
                  <MenuItem value="Annual">Annual</MenuItem>
                  <MenuItem value="Quarter 1">Quarter 1</MenuItem>
                  <MenuItem value="Quarter 2">Quarter 2</MenuItem>
                  <MenuItem value="Quarter 3">Quarter 3</MenuItem>
                  <MenuItem value="Quarter 4">Quarter 4</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Parent Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Parent Information</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Parent Name"
                fullWidth
                value={studentFeeForm.parentName}
                onChange={(e) => setStudentFeeForm({ ...studentFeeForm, parentName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Contact Number"
                fullWidth
                value={studentFeeForm.contactNumber}
                onChange={(e) => setStudentFeeForm({ ...studentFeeForm, contactNumber: e.target.value })}
                required
              />
            </Grid>
            
            {/* Fee Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Fee Information</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Total Fee"
                type="number"
                fullWidth
                value={studentFeeForm.totalFee}
                onChange={(e) => setStudentFeeForm({ ...studentFeeForm, totalFee: e.target.value })}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Payment Received"
                type="number"
                fullWidth
                value={studentFeeForm.paymentReceived}
                onChange={(e) => setStudentFeeForm({ ...studentFeeForm, paymentReceived: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Due Date"
                type="date"
                fullWidth
                value={studentFeeForm.dueDate}
                onChange={(e) => setStudentFeeForm({ ...studentFeeForm, dueDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            
            {/* Payment Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Payment Details</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Mode of Payment</InputLabel>
                <Select
                  value={studentFeeForm.paymentMethod}
                  onChange={(e) => setStudentFeeForm({ ...studentFeeForm, paymentMethod: e.target.value })}
                >
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                  <MenuItem value="Credit Card">Credit Card</MenuItem>
                  <MenuItem value="Debit Card">Debit Card</MenuItem>
                  <MenuItem value="Cheque">Cheque</MenuItem>
                  <MenuItem value="Online Payment">Online Payment</MenuItem>
                  <MenuItem value="UPI">UPI</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Mode of Contact</InputLabel>
                <Select
                  value={studentFeeForm.modeOfContact}
                  onChange={(e) => setStudentFeeForm({ ...studentFeeForm, modeOfContact: e.target.value })}
                >
                  <MenuItem value="Phone">Phone</MenuItem>
                  <MenuItem value="Email">Email</MenuItem>
                  <MenuItem value="SMS">SMS</MenuItem>
                  <MenuItem value="WhatsApp">WhatsApp</MenuItem>
                  <MenuItem value="In Person">In Person</MenuItem>
                  <MenuItem value="Letter">Letter</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Reminder Dates */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Reminder & Follow-up Dates</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Reminder Date"
                type="date"
                fullWidth
                value={studentFeeForm.reminderDate}
                onChange={(e) => setStudentFeeForm({ ...studentFeeForm, reminderDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                helperText="Keep date format to select reminder date"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Follow Up Date"
                type="date"
                fullWidth
                value={studentFeeForm.followUpDate}
                onChange={(e) => setStudentFeeForm({ ...studentFeeForm, followUpDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                helperText="Keep date format to select date"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Notice Issue Date"
                type="date"
                fullWidth
                value={studentFeeForm.noticeIssueDate}
                onChange={(e) => setStudentFeeForm({ ...studentFeeForm, noticeIssueDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                helperText="Keep date format"
              />
            </Grid>
            
            {/* Additional Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Additional Information</Typography>
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
            disabled={processing || !studentFeeForm.studentId || !studentFeeForm.totalFee || !studentFeeForm.parentName || !studentFeeForm.contactNumber || !studentFeeForm.admissionNumber}
            startIcon={processing ? <CircularProgress size={16} /> : <AddIcon />}
          >
            {processing ? 'Creating...' : 'Create Fee Record'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialog} onClose={() => setImportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import Student Fee Records from Google Sheets</DialogTitle>
        <DialogContent dividers>
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
              <strong>Required columns for Student Fee Records:</strong>
            </Typography>
            <Typography variant="body2">
              studentName, rollNumber, admissionNumber, class, section, academicYear, term, totalFee, paymentReceived, dueDate, parentName, contactNumber, paymentMethod, reminderDate, followUpDate, noticeIssueDate, modeOfContact, remarks
            </Typography>
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