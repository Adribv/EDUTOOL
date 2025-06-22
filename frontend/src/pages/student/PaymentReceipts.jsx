import React, { useState, useEffect } from 'react';
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
  Button,
  Chip,
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
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  Visibility as ViewIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  AccountBalance as BankIcon,
  CreditCard as CardIcon,
  AttachMoney as CashIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

const PaymentReceipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');

  // Mock data for payment receipts
  const mockReceipts = [
    {
      id: 'RCP001',
      date: '2024-01-15',
      amount: 500.00,
      method: 'Credit Card',
      status: 'Completed',
      description: 'Tuition Fee - January 2024',
      reference: 'TXN123456789',
      category: 'Tuition',
      semester: 'Spring 2024',
      paymentDetails: {
        cardLast4: '1234',
        cardType: 'Visa',
        transactionId: 'TXN123456789',
        processingFee: 2.50
      },
      breakdown: [
        { item: 'Tuition Fee', amount: 450.00 },
        { item: 'Library Fee', amount: 25.00 },
        { item: 'Technology Fee', amount: 25.00 }
      ]
    },
    {
      id: 'RCP002',
      date: '2024-01-15',
      amount: 500.00,
      method: 'Credit Card',
      status: 'Completed',
      description: 'Tuition Fee - January 2024',
      reference: 'TXN123456789',
      category: 'Tuition',
      semester: 'Spring 2024',
      paymentDetails: {
        cardLast4: '1234',
        cardType: 'Visa',
        transactionId: 'TXN123456789',
        processingFee: 2.50
      },
      breakdown: [
        { item: 'Tuition Fee', amount: 450.00 },
        { item: 'Library Fee', amount: 25.00 },
        { item: 'Technology Fee', amount: 25.00 }
      ]
    }
  ];

  useEffect(() => {
    setReceipts(mockReceipts);
  }, []);

  const handleViewReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReceipt(null);
  };

  const handleDownload = (receipt) => {
    // Mock download functionality
    console.log('Downloading receipt:', receipt.id);
  };

  const handlePrint = (receipt) => {
    // Mock print functionality
    console.log('Printing receipt:', receipt.id);
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return 'success';
      case 'A-': return 'success';
      case 'B+': return 'primary';
      case 'B': return 'primary';
      case 'B-': return 'warning';
      case 'C+': return 'warning';
      case 'C': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Payment Receipts
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and download your payment receipts
        </Typography>
      </Box>

      {/* Search and Filter */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search receipts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filterStatus}
                label="Filter by Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Error">Error</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Filter by Method</InputLabel>
              <Select
                value={filterMethod}
                label="Filter by Method"
                onChange={(e) => setFilterMethod(e.target.value)}
              >
                <MenuItem value="all">All Methods</MenuItem>
                <MenuItem value="Credit Card">Credit Card</MenuItem>
                <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                <MenuItem value="Cash">Cash</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Receipts List */}
      <Grid container spacing={3}>
        {receipts.map((receipt) => (
          <Grid item xs={12} key={receipt.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {receipt.id.substring(0, 4)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {receipt.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {receipt.date}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip label={receipt.status} color={receipt.status === 'Completed' ? 'success' : receipt.status === 'Pending' ? 'warning' : 'error'} size="small" />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Amount
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary.main">
                      ${receipt.amount.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Method
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="secondary.main">
                      {receipt.method}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ViewIcon />}
                    onClick={() => handleViewReceipt(receipt)}
                    fullWidth
                  >
                    View
                  </Button>
                  <Tooltip title="Download PDF">
                    <IconButton 
                      size="small" 
                      onClick={() => handleDownload(receipt)}
                      disabled={receipt.status !== 'Completed'}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Print">
                    <IconButton 
                      size="small" 
                      onClick={() => handlePrint(receipt)}
                      disabled={receipt.status !== 'Completed'}
                    >
                      <PrintIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Detailed Receipt Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ReceiptIcon color="primary" />
            <Typography variant="h6">
              {selectedReceipt?.description}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedReceipt && (
            <Box>
              {/* Header Information */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date: {new Date(selectedReceipt.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Amount: ${selectedReceipt.amount.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Method: {selectedReceipt.method}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status: {selectedReceipt.status}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Reference: {selectedReceipt.reference}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Category: {selectedReceipt.category}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Payment Details */}
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Payment Details
              </Typography>
              <Paper sx={{ p: 2, mb: 3, backgroundColor: 'grey.50' }}>
                <Typography variant="body1">
                  {selectedReceipt.paymentDetails.cardLast4 && (
                    <>
                      <strong>Card Last 4 Digits:</strong> {selectedReceipt.paymentDetails.cardLast4}
                      <br />
                    </>
                  )}
                  {selectedReceipt.paymentDetails.cardType && (
                    <>
                      <strong>Card Type:</strong> {selectedReceipt.paymentDetails.cardType}
                      <br />
                    </>
                  )}
                  {selectedReceipt.paymentDetails.transactionId && (
                    <>
                      <strong>Transaction ID:</strong> {selectedReceipt.paymentDetails.transactionId}
                      <br />
                    </>
                  )}
                  {selectedReceipt.paymentDetails.processingFee && (
                    <>
                      <strong>Processing Fee:</strong> ${selectedReceipt.paymentDetails.processingFee.toFixed(2)}
                      <br />
                    </>
                  )}
                </Typography>
              </Paper>

              {/* Breakdown */}
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Breakdown
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="center">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedReceipt.breakdown.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.item}</TableCell>
                        <TableCell align="center">${item.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
            onClick={() => selectedReceipt && handleDownload(selectedReceipt)}
            disabled={selectedReceipt?.status !== 'Completed'}
          >
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentReceipts; 