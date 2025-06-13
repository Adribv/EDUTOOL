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
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { studentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Fees = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feeData, setFeeData] = useState({
    currentBalance: 0,
    dueAmount: 0,
    paymentHistory: [],
    upcomingPayments: [],
  });
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    amount: '',
    method: 'online',
    reference: '',
  });

  useEffect(() => {
    fetchFeeData();
  }, []);

  const fetchFeeData = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getFees();
      setFeeData(response.data);
    } catch (error) {
      console.error('Error fetching fee data:', error);
      setError('Failed to load fee data');
      toast.error('Failed to load fee data');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async () => {
    try {
      await studentAPI.submitPayment(paymentDetails);
      toast.success('Payment submitted successfully');
      setPaymentDialog(false);
      setPaymentDetails({
        amount: '',
        method: 'online',
        reference: '',
      });
      fetchFeeData();
    } catch (error) {
      console.error('Error submitting payment:', error);
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

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Fees
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PaymentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Current Balance</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                ${feeData.currentBalance}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={() => setPaymentDialog(true)}
              >
                Make Payment
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ReceiptIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Due Amount</Typography>
              </Box>
              <Typography variant="h4" color="error">
                ${feeData.dueAmount}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Due Date: {feeData.dueDate}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HistoryIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Payment History</Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Reference</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {feeData.paymentHistory.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell>${payment.amount}</TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell>
                          <Chip
                            label={payment.status}
                            color={getStatusColor(payment.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{payment.reference}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Payments
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {feeData.upcomingPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.dueDate}</TableCell>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell>${payment.amount}</TableCell>
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
            type="number"
            label="Amount"
            value={paymentDetails.amount}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, amount: e.target.value })}
            margin="normal"
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
          </TextField>
          <TextField
            fullWidth
            label="Reference Number"
            value={paymentDetails.reference}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, reference: e.target.value })}
            margin="normal"
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