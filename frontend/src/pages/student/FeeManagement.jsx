import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
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
  TextField,
} from '@mui/material';
import { toast } from 'react-toastify';
import studentService from '../../services/studentService';

const FeeManagement = () => {
  const [loading, setLoading] = useState(true);
  const [feeStructure, setFeeStructure] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState([]);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({
    amount: '',
    paymentMethod: '',
    transactionId: '',
  });

  useEffect(() => {
    fetchFeeData();
  }, []);

  const fetchFeeData = async () => {
    try {
      const [structureResponse, statusResponse] = await Promise.all([
        studentService.getFeeStructure(),
        studentService.getPaymentStatus(),
      ]);
      
      console.log('Fee structure response:', structureResponse);
      console.log('Payment status response:', statusResponse);
      
      // Handle fee structure data
      const structure = structureResponse.data || structureResponse;
      const components = Array.isArray(structure) ? structure : (structure.components || []);
      setFeeStructure(components);
      
      // Handle payment status data
      const paymentsData = statusResponse.data || statusResponse;
      const payments = Array.isArray(paymentsData) ? paymentsData : (paymentsData.paymentHistory || []);
      setPaymentStatus(payments);
    } catch (error) {
      console.error('Error fetching fee data:', error);
      toast.error('Failed to load fee data');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedFee) return;

    try {
      await studentService.submitPayment({
        feeId: selectedFee.id,
        ...paymentDetails,
      });
      toast.success('Payment submitted successfully');
      setPaymentDialog(false);
      setPaymentDetails({
        amount: '',
        paymentMethod: '',
        transactionId: '',
      });
      fetchFeeData();
    } catch {
      toast.error('Failed to submit payment');
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'default';
    
    switch (status.toLowerCase()) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
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
      <Typography variant="h4" gutterBottom>
        Fee Management
      </Typography>

      {/* Fee Summary */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Current Balance</Typography>
              <Typography variant="h4" color="success.main">
                ₹{paymentStatus.currentBalance || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Due Amount</Typography>
              <Typography variant="h4" color="error.main">
                ₹{paymentStatus.dueAmount || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Due Date</Typography>
              <Typography variant="h4" color="warning.main">
                {paymentStatus.dueDate || 'Not specified'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Fee Structure
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Fee Type</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {feeStructure.length > 0 ? (
                      feeStructure.map((fee, index) => (
                        <TableRow key={fee._id || fee.id || `fee-${index}`}>
                          <TableCell>{fee.name || fee.type || 'Fee Component'}</TableCell>
                          <TableCell>₹{fee.amount || 0}</TableCell>
                          <TableCell>
                            {fee.dueDate ? 
                              (fee.dueDate instanceof Date ? 
                                fee.dueDate.toLocaleDateString() : 
                                new Date(fee.dueDate).toLocaleDateString()
                              ) : 
                              'Not specified'
                            }
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={fee.status || 'Pending'}
                              color={getStatusColor(fee.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {(fee.status && fee.status.toLowerCase() === 'pending') || !fee.status ? (
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={() => {
                                  setSelectedFee(fee);
                                  setPaymentDetails({
                                    ...paymentDetails,
                                    amount: fee.amount || 0,
                                  });
                                  setPaymentDialog(true);
                                }}
                              >
                                Pay Now
                              </Button>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                {fee.status}
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No fee structure available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment History
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Fee Type</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Payment Method</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paymentStatus.length > 0 ? (
                      paymentStatus.map((payment, index) => (
                        <TableRow key={payment._id || payment.id || `payment-${index}`}>
                          <TableCell>
                            {payment.date ? 
                              (payment.date instanceof Date ? 
                                payment.date.toLocaleDateString() : 
                                new Date(payment.date).toLocaleDateString()
                              ) : 
                              'Not specified'
                            }
                          </TableCell>
                          <TableCell>{payment.description || payment.feeType || 'Fee Payment'}</TableCell>
                          <TableCell>₹{payment.amount || payment.amountPaid || 0}</TableCell>
                          <TableCell>{payment.method || payment.paymentMethod || 'Not specified'}</TableCell>
                          <TableCell>
                            <Chip
                              label={payment.status || 'Completed'}
                              color={getStatusColor(payment.status)}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No payment history available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Make Payment</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Amount"
            value={paymentDetails.amount}
            disabled
            margin="normal"
          />
          <TextField
            fullWidth
            select
            label="Payment Method"
            value={paymentDetails.paymentMethod}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, paymentMethod: e.target.value })}
            margin="normal"
            SelectProps={{
              native: true,
            }}
          >
            <option value="">Select Payment Method</option>
            <option value="credit_card">Credit Card</option>
            <option value="debit_card">Debit Card</option>
            <option value="net_banking">Net Banking</option>
            <option value="upi">UPI</option>
          </TextField>
          <TextField
            fullWidth
            label="Transaction ID"
            value={paymentDetails.transactionId}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, transactionId: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>Cancel</Button>
          <Button
            onClick={handlePayment}
            variant="contained"
            color="primary"
            disabled={!paymentDetails.paymentMethod || !paymentDetails.transactionId}
          >
            Submit Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeeManagement; 