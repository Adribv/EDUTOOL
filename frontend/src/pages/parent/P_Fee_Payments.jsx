import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import { Payment, Receipt, AccountBalance } from '@mui/icons-material';
import parentService from '../../services/parentService';

const P_Fee_Payments = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [feeStructure, setFeeStructure] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: '',
    components: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [childrenData, methodsData] = await Promise.all([
        parentService.getChildren(),
        parentService.getPaymentMethods()
      ]);
      
      // Ensure childrenData is an array
      const childrenArray = Array.isArray(childrenData) ? childrenData : [];
      console.log('🔍 Children data received:', childrenData);
      console.log('🔍 Children array:', childrenArray);
      
      setChildren(childrenArray);
      setPaymentMethods(methodsData);
      // Do not set selectedChild here
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
      setChildren([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchChildFeeData = async (rollNumber) => {
    try {
      // Defensive: if rollNumber is an object, extract rollNumber
      if (typeof rollNumber === 'object' && rollNumber !== null && rollNumber.rollNumber) {
        console.warn('⚠️ fetchChildFeeData: rollNumber is object, extracting rollNumber:', rollNumber);
        rollNumber = rollNumber.rollNumber;
      }
      // Final fallback: always use String
      rollNumber = String(rollNumber);
      console.log('🔍 fetchChildFeeData final rollNumber:', rollNumber, typeof rollNumber);
      const [structure, status] = await Promise.all([
        parentService.getFees(rollNumber),
        parentService.getPaymentStatus(rollNumber)
      ]);
      setFeeStructure(structure);
      setPaymentStatus(status);
    } catch (err) {
      console.error('Error fetching fee data:', err);
    }
  };

  useEffect(() => {
    if (selectedChild) {
      console.log('🔍 useEffect triggered with selectedChild:', selectedChild);
      console.log('🔍 Type of selectedChild:', typeof selectedChild);
      fetchChildFeeData(selectedChild);
    } else {
      setFeeStructure(null);
      setPaymentStatus(null);
    }
  }, [selectedChild]);

  const handlePayment = async () => {
    try {
      const child = children.find(c => c.rollNumber === selectedChild);
      const paymentData = {
        studentId: child._id,
        amount: parseFloat(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        components: paymentForm.components
      };

      const result = await parentService.payFees(paymentData);
      
      setPaymentDialog(false);
      setPaymentForm({ amount: '', paymentMethod: '', components: [] });
      
      // Refresh fee data
      fetchChildFeeData(selectedChild);
      
      alert(`Payment successful! Receipt: ${result.receiptUrl}`);
    } catch (err) {
      setError('Payment failed. Please try again.');
      console.error(err);
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
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Fee Payments
      </Typography>

      {/* Child Selection */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Select Student</InputLabel>
          <Select
            value={selectedChild}
            onChange={e => setSelectedChild(String(e.target.value))}
          >
            {Array.isArray(children) && children.map((child) => (
              <MenuItem key={child._id} value={child.rollNumber}>
                {child.name} - Class {child.class}{child.section}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* Only show fee/payment info if a student is selected */}
      {selectedChild && (
        <Grid container spacing={3}>
          {/* Fee Structure */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <AccountBalance sx={{ mr: 1 }} />
                  Fee Structure
                </Typography>
                {feeStructure ? (
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Academic Year: {feeStructure.academicYear}
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Component</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Frequency</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {feeStructure.feeComponents?.map((component, index) => (
                            <TableRow key={index}>
                              <TableCell>{component.name}</TableCell>
                              <TableCell>₹{component.amount}</TableCell>
                              <TableCell>{component.frequency}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ) : (
                  <Typography>No fee structure available</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Payment Status */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Receipt sx={{ mr: 1 }} />
                  Payment Status
                </Typography>
                {paymentStatus ? (
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Total Due: ₹{paymentStatus.totalDue}
                    </Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                      Paid: ₹{paymentStatus.totalPaid}
                    </Typography>
                    <Chip
                      label={paymentStatus.status}
                      color={paymentStatus.status === 'Paid' ? 'success' : 'warning'}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                ) : (
                  <Typography>No payment status available</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Make Payment */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Payment sx={{ mr: 1 }} />
                  Make Payment
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setPaymentDialog(true)}
                  disabled={!feeStructure}
                >
                  Pay Fees
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Make Payment</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
              >
                {paymentMethods.map((method) => (
                  <MenuItem key={method.id} value={method.id}>
                    {method.name} - {method.description}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>Cancel</Button>
          <Button onClick={handlePayment} variant="contained">
            Confirm Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default P_Fee_Payments; 