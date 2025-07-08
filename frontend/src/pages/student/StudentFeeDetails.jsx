import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Chip,
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
  LinearProgress,
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentAPI } from '../../services/api';
import { toast } from 'react-toastify';

function StudentFeeDetails() {
  const [activeTab, setActiveTab] = useState(0);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const queryClient = useQueryClient();

  // Fetch fee structure
  const { data: feeStructure, isLoading: feeStructureLoading } = useQuery({
    queryKey: ['feeStructure'],
    queryFn: () => studentAPI.getFeeStructure(),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch payment status
  const { data: paymentStatus, isLoading: paymentStatusLoading } = useQuery({
    queryKey: ['paymentStatus'],
    queryFn: () => studentAPI.getFees(),
    staleTime: 5 * 60 * 1000,
  });

  // Payment mutation
  const paymentMutation = useMutation({
    mutationFn: (paymentData) => studentAPI.makePayment(paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries(['paymentStatus']);
      toast.success('Payment processed successfully!');
      setPaymentDialogOpen(false);
      setPaymentAmount('');
      setPaymentMethod('');
      setSelectedFee(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Payment failed');
    },
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePayment = (fee) => {
    setSelectedFee(fee);
    setPaymentAmount(fee.amount.toString());
    setPaymentDialogOpen(true);
  };

  const processPayment = () => {
    if (!paymentAmount || !paymentMethod) {
      toast.error('Please fill in all fields');
      return;
    }

    const paymentData = {
      feeId: selectedFee.id,
      amount: parseFloat(paymentAmount),
      paymentMethod: paymentMethod,
      description: `Payment for ${selectedFee.description}`
    };

    paymentMutation.mutate(paymentData);
  };

  const calculateTotalFees = () => {
    if (!feeStructure) return 0;
    return feeStructure.reduce((total, fee) => total + fee.amount, 0);
  };

  const calculatePaidAmount = () => {
    if (!paymentStatus) return 0;
    return paymentStatus.reduce((total, payment) => total + payment.amount, 0);
  };

  const calculateBalance = () => {
    return calculateTotalFees() - calculatePaidAmount();
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'Paid':
        return <CheckCircleIcon color="success" />;
      case 'Pending':
        return <WarningIcon color="warning" />;
      case 'Overdue':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon />;
    }
  };

  const downloadReceipt = async (paymentId) => {
    try {
      const response = await studentAPI.getPaymentReceipt(paymentId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt_${paymentId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Receipt downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download receipt');
    }
  };

  const isLoading = feeStructureLoading || paymentStatusLoading;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Fee Details
      </Typography>

      {/* Fee Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <MoneyIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Fees</Typography>
              </Box>
              <Typography variant="h4">
                ₹{calculateTotalFees().toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total amount due
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PaymentIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Paid Amount</Typography>
              </Box>
              <Typography variant="h4">
                ₹{calculatePaidAmount().toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total paid
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AccountBalanceIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Balance</Typography>
              </Box>
              <Typography variant="h4">
                ₹{calculateBalance().toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Amount remaining
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUpIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Progress</Typography>
              </Box>
              <Typography variant="h4">
                {calculateTotalFees() > 0 ? Math.round((calculatePaidAmount() / calculateTotalFees()) * 100) : 0}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={calculateTotalFees() > 0 ? (calculatePaidAmount() / calculateTotalFees()) * 100 : 0}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Fee Structure" />
          <Tab label="Payment History" />
          <Tab label="Payment Options" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fee Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {feeStructure && feeStructure.length > 0 ? (
                  feeStructure.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell>
                        <Typography variant="subtitle2">{fee.feeType}</Typography>
                      </TableCell>
                      <TableCell>{fee.description}</TableCell>
                      <TableCell>₹{fee.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        {new Date(fee.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getPaymentStatusIcon(fee.status)}
                          label={fee.status}
                          color={getPaymentStatusColor(fee.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {fee.status !== 'Paid' && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handlePayment(fee)}
                            startIcon={<PaymentIcon />}
                          >
                            Pay Now
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No fee structure available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment History
                </Typography>
                {paymentStatus && paymentStatus.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Method</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paymentStatus.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>
                              {new Date(payment.paymentDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{payment.description}</TableCell>
                            <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                            <TableCell>{payment.paymentMethod}</TableCell>
                            <TableCell>
                              <Chip
                                icon={getPaymentStatusIcon(payment.status)}
                                label={payment.status}
                                color={getPaymentStatusColor(payment.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Tooltip title="Download Receipt">
                                <IconButton
                                  size="small"
                                  onClick={() => downloadReceipt(payment.id)}
                                >
                                  <DownloadIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Print Receipt">
                                <IconButton size="small">
                                  <PrintIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No payment history available
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Methods
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <PaymentIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Online Banking"
                      secondary="Pay through your bank's online portal"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PaymentIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Credit/Debit Card"
                      secondary="Secure payment through cards"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PaymentIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="UPI"
                      secondary="Quick payment through UPI"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PaymentIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Cash/Cheque"
                      secondary="Pay at the school office"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Schedule
                </Typography>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Monthly Fees</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2">
                      Due by 5th of every month. Late fees apply after 15th.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Annual Fees</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2">
                      Due by 30th June. Can be paid in installments.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Late Payment Policy</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2">
                      Late fees of ₹50 per day after due date. Students with outstanding fees may not be allowed to attend classes.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Make Payment
          {selectedFee && (
            <Typography variant="body2" color="text.secondary">
              {selectedFee.feeType} - {selectedFee.description}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              margin="normal"
              InputProps={{
                startAdornment: <Typography>₹</Typography>,
              }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                label="Payment Method"
              >
                <MenuItem value="Online Banking">Online Banking</MenuItem>
                <MenuItem value="Credit Card">Credit Card</MenuItem>
                <MenuItem value="Debit Card">Debit Card</MenuItem>
                <MenuItem value="UPI">UPI</MenuItem>
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="Cheque">Cheque</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={processPayment}
            variant="contained"
            disabled={paymentMutation.isPending}
          >
            {paymentMutation.isPending ? 'Processing...' : 'Pay Now'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default StudentFeeDetails; 