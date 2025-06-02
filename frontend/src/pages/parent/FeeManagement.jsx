import { useState, useEffect } from 'react';
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
  CircularProgress,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import { parentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const FeeManagement = () => {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [feeData, setFeeData] = useState({
    currentBalance: 0,
    upcomingPayments: [],
    paymentHistory: [],
    paymentMethods: [],
  });
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchFeeData();
    }
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await parentAPI.getChildren();
      setChildren(response.data);
      if (response.data.length > 0) {
        setSelectedChild(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
      toast.error('Failed to load children data');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeeData = async () => {
    try {
      setLoading(true);
      const [balanceRes, upcomingRes, historyRes, methodsRes] = await Promise.all([
        parentAPI.getFeeBalance(selectedChild),
        parentAPI.getUpcomingPayments(selectedChild),
        parentAPI.getPaymentHistory(selectedChild),
        parentAPI.getPaymentMethods(),
      ]);

      setFeeData({
        currentBalance: balanceRes.data,
        upcomingPayments: upcomingRes.data,
        paymentHistory: historyRes.data,
        paymentMethods: methodsRes.data,
      });
    } catch (error) {
      console.error('Error fetching fee data:', error);
      toast.error('Failed to load fee data');
    } finally {
      setLoading(false);
    }
  };

  const handleChildChange = (event) => {
    setSelectedChild(event.target.value);
  };

  const handlePaymentClick = (payment) => {
    setSelectedPayment(payment);
    setPaymentForm({
      amount: payment.amount,
      method: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
    });
    setPaymentDialog(true);
  };

  const handlePaymentFormChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaymentSubmit = async () => {
    try {
      await parentAPI.makePayment({
        childId: selectedChild,
        paymentId: selectedPayment.id,
        ...paymentForm,
      });
      toast.success('Payment successful');
      setPaymentDialog(false);
      fetchFeeData();
    } catch (error) {
      console.error('Error making payment:', error);
      toast.error('Payment failed');
    }
  };

  const handleDownloadReceipt = async (paymentId) => {
    try {
      const response = await parentAPI.downloadReceipt(paymentId);
      // Handle file download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Fee Management
      </Typography>

      {/* Child Selection */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Child</InputLabel>
        <Select
          value={selectedChild}
          onChange={handleChildChange}
          label="Select Child"
        >
          {children.map((child) => (
            <MenuItem key={child.id} value={child.id}>
              {child.name} - Class {child.class}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Grid container spacing={3}>
        {/* Current Balance */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Balance
              </Typography>
              <Typography variant="h4" color="error.main">
                ${feeData.currentBalance}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Payments */}
        <Grid item xs={12} md={8}>
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
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {feeData.upcomingPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{new Date(payment.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell>${payment.amount}</TableCell>
                        <TableCell>
                          <Chip
                            label={payment.status}
                            color={payment.status === 'Paid' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {payment.status !== 'Paid' && (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<PaymentIcon />}
                              onClick={() => handlePaymentClick(payment)}
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

        {/* Payment History */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment History
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Receipt</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {feeData.paymentHistory.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell>${payment.amount}</TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell>
                          <Chip
                            label={payment.status}
                            color={payment.status === 'Completed' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Download Receipt">
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadReceipt(payment.id)}
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
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

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Make Payment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount"
                value={paymentForm.amount}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={paymentForm.method}
                  onChange={handlePaymentFormChange}
                  name="method"
                  label="Payment Method"
                >
                  {feeData.paymentMethods.map((method) => (
                    <MenuItem key={method.id} value={method.id}>
                      {method.type === 'card' ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CreditCardIcon sx={{ mr: 1 }} />
                          {method.last4}
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccountBalanceIcon sx={{ mr: 1 }} />
                          {method.bankName}
                        </Box>
                      )}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {paymentForm.method && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Card Number"
                    name="cardNumber"
                    value={paymentForm.cardNumber}
                    onChange={handlePaymentFormChange}
                    placeholder="1234 5678 9012 3456"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Expiry Date"
                    name="expiryDate"
                    value={paymentForm.expiryDate}
                    onChange={handlePaymentFormChange}
                    placeholder="MM/YY"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="CVV"
                    name="cvv"
                    value={paymentForm.cvv}
                    onChange={handlePaymentFormChange}
                    type="password"
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handlePaymentSubmit}
            disabled={!paymentForm.method}
          >
            Pay Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeeManagement; 