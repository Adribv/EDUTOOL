import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
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
  LinearProgress,
} from '@mui/material';
import {
  Payment,
  Receipt,
  Download,
  Warning,
  CheckCircle,
  Pending,
} from '@mui/icons-material';
import { studentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Fees = () => {
  const [loading, setLoading] = useState(true);
  const [feeStructure, setFeeStructure] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptDialog, setReceiptDialog] = useState(false);
  const [stats, setStats] = useState({
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    dueDate: null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [structureRes, historyRes] = await Promise.all([
        studentAPI.getFeeStructure(),
        studentAPI.getPaymentHistory(),
      ]);

      setFeeStructure(structureRes.data);
      setPaymentHistory(historyRes.data.payments);
      setStats(historyRes.data.stats);
    } catch (error) {
      console.error('Error fetching fee data:', error);
      toast.error('Failed to load fee information');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    setReceiptDialog(true);
  };

  const getStatusColor = (status) => {
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle />;
      case 'Pending':
        return <Pending />;
      case 'Overdue':
        return <Warning />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Fees
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Payment color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Amount</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                ${stats.totalAmount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Paid Amount</Typography>
              </Box>
              <Typography variant="h4" color="success">
                ${stats.paidAmount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Warning color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Pending Amount</Typography>
              </Box>
              <Typography variant="h4" color="warning">
                ${stats.pendingAmount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Payment color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Due Date</Typography>
              </Box>
              <Typography variant="h4" color="error">
                {stats.dueDate
                  ? new Date(stats.dueDate).toLocaleDateString()
                  : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payment Progress */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Payment Progress
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ flexGrow: 1, mr: 2 }}>
              <LinearProgress
                variant="determinate"
                value={(stats.paidAmount / stats.totalAmount) * 100}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {Math.round((stats.paidAmount / stats.totalAmount) * 100)}%
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Fee Structure */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Fee Structure
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fee Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {feeStructure.map((fee) => (
              <TableRow key={fee.id}>
                <TableCell>{fee.type}</TableCell>
                <TableCell>${fee.amount}</TableCell>
                <TableCell>
                  {new Date(fee.dueDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getStatusIcon(fee.status)}
                    label={fee.status}
                    color={getStatusColor(fee.status)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Payment History */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Payment History
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paymentHistory.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  {new Date(payment.date).toLocaleDateString()}
                </TableCell>
                <TableCell>${payment.amount}</TableCell>
                <TableCell>{payment.method}</TableCell>
                <TableCell>
                  <Chip
                    icon={getStatusIcon(payment.status)}
                    label={payment.status}
                    color={getStatusColor(payment.status)}
                  />
                </TableCell>
                <TableCell>
                  {payment.receipt && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Receipt />}
                      onClick={() => handleViewReceipt(payment.receipt)}
                    >
                      View Receipt
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Receipt Dialog */}
      <Dialog
        open={receiptDialog}
        onClose={() => setReceiptDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Payment Receipt</DialogTitle>
        <DialogContent>
          {selectedReceipt && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Receipt Number: {selectedReceipt.receiptNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Date: {new Date(selectedReceipt.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Amount: ${selectedReceipt.amount}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Payment Method: {selectedReceipt.paymentMethod}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Transaction ID: {selectedReceipt.transactionId}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={() => window.open(selectedReceipt.downloadUrl, '_blank')}
                  >
                    Download Receipt
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceiptDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Fees; 