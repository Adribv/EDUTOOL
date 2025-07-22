import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  ListItemIcon,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  History as HistoryIcon,
  Info as InfoIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import { studentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Fees = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingFeeRecords, setPendingFeeRecords] = useState([]);
  const [selectedFeeRecord, setSelectedFeeRecord] = useState(null);
  const [feeRecordDialog, setFeeRecordDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    amount: '',
    method: 'online',
    reference: '',
    feeRecordId: null,
  });

  useEffect(() => {
    fetchPendingFees();
  }, []);

  const fetchPendingFees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching pending fee records from StudentFeeRecord...');
      
      // First, get the payment status to check if there are pending fees
      const response = await studentAPI.getFees();
      console.log('📋 Payment status response:', response);
      
      if (response && response.data && response.data.dueAmount > 0) {
        // If there are pending fees, try to get detailed records
        try {
          const recordResponse = await studentAPI.testStudentFeeRecords();
          console.log('📄 Fee records response:', recordResponse);
          
          if (recordResponse && recordResponse.data) {
            // Filter only pending records for the current student
            const allRecords = recordResponse.data.pendingRecords || recordResponse.data.sampleRecords || [];
            const pendingRecords = allRecords.filter(record => 
              record.balanceDue > 0 && 
              ['Pending', 'Overdue', 'Partial'].includes(record.paymentStatus)
            );
            
            console.log('⚠️ Filtered pending records:', pendingRecords);
            setPendingFeeRecords(pendingRecords);
          } else {
            console.log('❌ No detailed fee records found');
            setPendingFeeRecords([]);
          }
        } catch (recordError) {
          console.error('❌ Error fetching detailed fee records:', recordError);
          // Create a mock record from the basic payment status data
          const mockRecord = {
            studentName: response.data.studentName || 'Current Student',
            totalFee: response.data.totalFee || 0,
            paymentReceived: response.data.currentBalance || 0,
            balanceDue: response.data.dueAmount || 0,
            dueDate: response.data.dueDate,
            paymentStatus: response.data.paymentStatus || 'Pending',
            term: response.data.term || 'Current Term',
            academicYear: new Date().getFullYear().toString(),
          };
          setPendingFeeRecords([mockRecord]);
        }
      } else {
        console.log('✅ No pending fees found');
        setPendingFeeRecords([]);
      }
    } catch (error) {
      console.error('❌ Error fetching pending fees:', error);
      setError('Failed to load pending fee records');
      toast.error('Failed to load pending fee records');
      setPendingFeeRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewFeeRecord = (record) => {
    setSelectedFeeRecord(record);
    setFeeRecordDialog(true);
  };

  const handleMakePayment = (record) => {
    setPaymentDetails({
      amount: record.balanceDue.toString(),
      method: 'online',
      reference: '',
      feeRecordId: record._id || record.studentId,
    });
    setSelectedFeeRecord(record);
    setPaymentDialog(true);
  };

  const handlePaymentSubmit = async () => {
    try {
      await studentAPI.submitPayment({
        ...paymentDetails,
        feeRecordId: selectedFeeRecord._id || selectedFeeRecord.studentId,
      });
      toast.success('Payment submitted successfully');
      setPaymentDialog(false);
      setPaymentDetails({
        amount: '',
        method: 'online',
        reference: '',
        feeRecordId: null,
      });
      fetchPendingFees(); // Refresh the data
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error('Failed to submit payment');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'completed':
        return 'success';
      case 'pending':
      case 'partial':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTotalPendingAmount = () => {
    return pendingFeeRecords.reduce((total, record) => total + (record.balanceDue || 0), 0);
  };

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
        <Button 
          variant="contained" 
          onClick={fetchPendingFees} 
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Pending Fee Payments
      </Typography>

      {/* Status Alert */}
      {pendingFeeRecords.length > 0 ? (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          icon={<WarningIcon />}
        >
          You have {pendingFeeRecords.length} pending fee record{pendingFeeRecords.length > 1 ? 's' : ''} 
          with a total outstanding amount of ₹{getTotalPendingAmount()}.
        </Alert>
      ) : (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
        >
          🎉 Congratulations! You have no pending fee payments. All fees are up to date.
        </Alert>
      )}

      {pendingFeeRecords.length > 0 ? (
      <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WarningIcon color="error" sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Pending</Typography>
              </Box>
                <Typography variant="h4" color="error">
                  ₹{getTotalPendingAmount()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Across {pendingFeeRecords.length} record{pendingFeeRecords.length > 1 ? 's' : ''}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

          <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Overdue Records</Typography>
              </Box>
              <Typography variant="h4" color="error">
                  {pendingFeeRecords.filter(r => r.paymentStatus === 'Overdue').length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Immediate attention required
              </Typography>
            </CardContent>
          </Card>
        </Grid>

          <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccountBalanceIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6">Partial Payments</Typography>
              </Box>
                <Typography variant="h4" color="warning.main">
                  {pendingFeeRecords.filter(r => r.paymentStatus === 'Partial').length}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Partially paid records
                </Typography>
            </CardContent>
          </Card>
        </Grid>

          {/* Pending Fee Records Table */}
          <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                  Pending Fee Records
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                        <TableCell>Student Info</TableCell>
                        <TableCell>Term</TableCell>
                        <TableCell>Total Fee</TableCell>
                        <TableCell>Paid Amount</TableCell>
                        <TableCell>Balance Due</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                      {pendingFeeRecords.map((record, index) => (
                        <TableRow key={record._id || index}>
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2">
                                {record.studentName || 'N/A'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {record.rollNumber || 'N/A'} | {record.class || 'N/A'}-{record.section || 'N/A'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {record.term || 'N/A'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {record.academicYear || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>₹{record.totalFee || 0}</TableCell>
                          <TableCell>₹{record.paymentReceived || 0}</TableCell>
                          <TableCell>
                            <Typography variant="body2" color="error.main" fontWeight="bold">
                              ₹{record.balanceDue || 0}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {record.dueDate ? new Date(record.dueDate).toLocaleDateString() : 'N/A'}
                            </Typography>
                          </TableCell>
                        <TableCell>
                          <Chip
                              label={record.paymentStatus || 'Pending'}
                              color={getStatusColor(record.paymentStatus)}
                            size="small"
                          />
                        </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleViewFeeRecord(record)}
                                startIcon={<InfoIcon />}
                              >
                                Details
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => handleMakePayment(record)}
                                startIcon={<PaymentIcon />}
                              >
                                Pay Now
                              </Button>
                            </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <PaymentIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              All Fees Paid!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              You have no pending fee payments at this time.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Check back later for new fee notifications or contact the accounts office for any queries.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Fee Record Details Dialog */}
      <Dialog open={feeRecordDialog} onClose={() => setFeeRecordDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <InfoIcon color="primary" sx={{ mr: 1 }} />
            Fee Record Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedFeeRecord ? (
            <Box>
              <Grid container spacing={3}>
                {/* Student Information */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <PersonIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Student Information</Typography>
                      </Box>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="Student Name"
                            secondary={selectedFeeRecord.studentName || 'N/A'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Roll Number"
                            secondary={selectedFeeRecord.rollNumber || 'N/A'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Class & Section"
                            secondary={`${selectedFeeRecord.class || 'N/A'} - ${selectedFeeRecord.section || 'N/A'}`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Academic Year"
                            secondary={selectedFeeRecord.academicYear || 'N/A'}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Fee Information */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <SchoolIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Fee Information</Typography>
                      </Box>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <ReceiptIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Total Fee"
                            secondary={`₹${selectedFeeRecord.totalFee || 0}`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <PaymentIcon color="success" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Payment Received"
                            secondary={`₹${selectedFeeRecord.paymentReceived || 0}`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <WarningIcon color="error" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Balance Due"
                            secondary={
                              <Typography variant="body2" color="error.main" fontWeight="bold">
                                ₹{selectedFeeRecord.balanceDue || 0}
                              </Typography>
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Payment Status"
                            secondary={
                              <Chip
                                label={selectedFeeRecord.paymentStatus || 'N/A'}
                                color={getStatusColor(selectedFeeRecord.paymentStatus)}
                                size="small"
                              />
                            }
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Additional Details */}
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Additional Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Term
                          </Typography>
                          <Typography variant="body1">
                            {selectedFeeRecord.term || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Due Date
                          </Typography>
                          <Typography variant="body1" color={
                            selectedFeeRecord.dueDate && new Date(selectedFeeRecord.dueDate) < new Date() 
                              ? 'error.main' 
                              : 'text.primary'
                          }>
                            {selectedFeeRecord.dueDate 
                              ? new Date(selectedFeeRecord.dueDate).toLocaleDateString() 
                              : 'N/A'
                            }
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Parent Name
                          </Typography>
                          <Typography variant="body1">
                            {selectedFeeRecord.parentName || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Contact Number
                          </Typography>
                          <Typography variant="body1">
                            {selectedFeeRecord.contactNumber || 'N/A'}
                          </Typography>
                        </Grid>
                        {selectedFeeRecord.remarks && (
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              Remarks
                            </Typography>
                            <Typography variant="body1">
                              {selectedFeeRecord.remarks}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Alert severity="info">
              No fee record selected.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeeRecordDialog(false)} color="primary">
            Close
          </Button>
          {selectedFeeRecord && selectedFeeRecord.balanceDue > 0 && (
            <Button
              onClick={() => {
                setFeeRecordDialog(false);
                handleMakePayment(selectedFeeRecord);
              }}
              variant="contained"
              color="primary"
              startIcon={<PaymentIcon />}
            >
              Pay ₹{selectedFeeRecord.balanceDue}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Make Payment</DialogTitle>
        <DialogContent>
          {selectedFeeRecord && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Fee Record: {selectedFeeRecord.term || 'N/A'}</Typography>
              <Typography variant="body2">
                Outstanding Amount: ₹{selectedFeeRecord.balanceDue || 0}
              </Typography>
            </Alert>
          )}
          <TextField
            fullWidth
            type="number"
            label="Amount"
            value={paymentDetails.amount}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, amount: e.target.value })}
            margin="normal"
            helperText="Enter amount in ₹"
          />
          <TextField
            fullWidth
            select
            label="Payment Method"
            value={paymentDetails.method}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, method: e.target.value })}
            margin="normal"
            SelectProps={{
              native: true,
            }}
          >
            <option value="online">Online Payment</option>
            <option value="card">Credit/Debit Card</option>
            <option value="bank">Bank Transfer</option>
            <option value="upi">UPI</option>
            <option value="cash">Cash</option>
          </TextField>
          <TextField
            fullWidth
            label="Reference Number"
            value={paymentDetails.reference}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, reference: e.target.value })}
            margin="normal"
            helperText="Enter transaction reference or receipt number"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>Cancel</Button>
          <Button
            onClick={handlePaymentSubmit}
            variant="contained"
            color="primary"
            disabled={!paymentDetails.amount || !paymentDetails.reference}
          >
            Submit Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Fees; 