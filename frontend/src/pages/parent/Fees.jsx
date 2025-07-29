import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  AccountBalance,
  Payment,
  Receipt,
  Download,
  Close,
  CheckCircle,
  Warning,
  Error,
} from '@mui/icons-material';
import parentService from '../../services/parentService';
import { toast } from 'react-toastify';

const Fees = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fees, setFees] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const childrenData = await parentService.getChildren();
      // Ensure childrenData is an array
      const childrenArray = Array.isArray(childrenData) ? childrenData : [];
      console.log('🔍 Children data received:', childrenData);
      console.log('🔍 Children array:', childrenArray);
      setChildren(childrenArray);
    } catch (error) {
      console.error('Error fetching children:', error);
      setError('Failed to load children data');
      setChildren([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChild) {
      fetchFees();
    } else {
      setFees([]);
    }
  }, [selectedChild]);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const response = await parentService.getFees(selectedChild);
      setFees(response.data || response);
    } catch (error) {
      console.error('Error fetching fees:', error);
      toast.error('Failed to load fee information');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentDialogOpen = (fee) => {
    setSelectedFee(fee);
    setPaymentDialog(true);
  };

  const handlePaymentDialogClose = () => {
    setPaymentDialog(false);
    setSelectedFee(null);
  };

  const handlePayment = async () => {
    try {
      await parentService.makePayment(selectedFee.id);
      toast.success('Payment successful');
      handlePaymentDialogClose();
      fetchFees();
    } catch (error) {
      console.error('Error making payment:', error);
      toast.error('Failed to process payment');
    }
  };

  const handleDownloadReceipt = async (feeId) => {
    try {
      const response = await parentService.downloadReceipt(feeId);
      // Handle file download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${feeId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'paid':
        return <Chip icon={<CheckCircle />} label="Paid" color="success" />;
      case 'pending':
        return <Chip icon={<Warning />} label="Pending" color="warning" />;
      case 'overdue':
        return <Chip icon={<Error />} label="Overdue" color="error" />;
      default:
        return null;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
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

  const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0);
  const paidFees = fees.reduce(
    (sum, fee) => sum + (fee.status === 'paid' ? fee.amount : 0),
    0
  );
  const pendingFees = totalFees - paidFees;
  const paymentProgress = (paidFees / totalFees) * 100;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Fee Management
      </Typography>

      {/* Child Selection */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Select Student</InputLabel>
          <Select
            value={selectedChild}
            onChange={e => setSelectedChild(String(e.target.value))}
          >
            {Array.isArray(children) && children.map(child => (
              <MenuItem key={child._id} value={String(child.rollNumber)}>
                {child.name} - Class {child.class}{child.section}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Only show fee data if a student is selected */}
      {selectedChild && (
        <>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccountBalance color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Total Fees</Typography>
                  </Box>
                  <Typography variant="h4" color="primary">
                    {formatCurrency(totalFees)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Payment color="success" sx={{ mr: 1 }} />
                    <Typography variant="h6">Paid Amount</Typography>
                  </Box>
                  <Typography variant="h4" color="success">
                    {formatCurrency(paidFees)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Warning color="warning" sx={{ mr: 1 }} />
                    <Typography variant="h6">Pending Amount</Typography>
                  </Box>
                  <Typography variant="h4" color="warning">
                    {formatCurrency(pendingFees)}
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={paymentProgress}
                  sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {paymentProgress.toFixed(1)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Fees Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Child</TableCell>
                  <TableCell>Fee Type</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Payment Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fees.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell>
                      {fee.childName} ({fee.className})
                    </TableCell>
                    <TableCell>{fee.type}</TableCell>
                    <TableCell>
                      {new Date(fee.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{formatCurrency(fee.amount)}</TableCell>
                    <TableCell>{getStatusChip(fee.status)}</TableCell>
                    <TableCell>
                      {fee.paymentDate
                        ? new Date(fee.paymentDate).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {fee.status === 'paid' ? (
                        <Tooltip title="Download Receipt">
                          <IconButton
                            color="primary"
                            onClick={() => handleDownloadReceipt(fee.id)}
                          >
                            <Download />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Make Payment">
                          <IconButton
                            color="primary"
                            onClick={() => handlePaymentDialogOpen(fee)}
                          >
                            <Payment />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {!selectedChild && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Select a student to view fee information
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose a student from the dropdown above to see their fee structure and payment status.
          </Typography>
        </Paper>
      )}

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onClose={handlePaymentDialogClose}>
        <DialogTitle>
          Make Payment
          <IconButton
            onClick={handlePaymentDialogClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedFee && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Payment Details
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography>
                  <strong>Child:</strong> {selectedFee.childName}
                </Typography>
                <Typography>
                  <strong>Fee Type:</strong> {selectedFee.type}
                </Typography>
                <Typography>
                  <strong>Amount:</strong> {formatCurrency(selectedFee.amount)}
                </Typography>
                <Typography>
                  <strong>Due Date:</strong>{' '}
                  {new Date(selectedFee.dueDate).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePaymentDialogClose}>Cancel</Button>
          <Button onClick={handlePayment} variant="contained" color="primary">
            Pay Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Fees; 