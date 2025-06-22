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
      setFeeStructure(structureResponse.data);
      setPaymentStatus(statusResponse.data);
    } catch {
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
                    {feeStructure.map((fee) => (
                      <TableRow key={fee.id}>
                        <TableCell>{fee.type}</TableCell>
                        <TableCell>₹{fee.amount}</TableCell>
                        <TableCell>{new Date(fee.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={fee.status}
                            color={getStatusColor(fee.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {fee.status.toLowerCase() === 'pending' && (
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={() => {
                                setSelectedFee(fee);
                                setPaymentDetails({
                                  ...paymentDetails,
                                  amount: fee.amount,
                                });
                                setPaymentDialog(true);
                              }}
                            >
                              Pay Now
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
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
                    {paymentStatus.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                        <TableCell>{payment.feeType}</TableCell>
                        <TableCell>₹{payment.amount}</TableCell>
                        <TableCell>{payment.paymentMethod}</TableCell>
                        <TableCell>
                          <Chip
                            label={payment.status}
                            color={getStatusColor(payment.status)}
                            size="small"
                          />
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