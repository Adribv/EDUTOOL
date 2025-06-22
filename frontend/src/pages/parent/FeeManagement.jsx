import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import { Payment, Receipt, History } from '@mui/icons-material';
import { parentAPI } from '../../services/api';

const FeeManagement = () => {
  const { data: feeData, isLoading, error } = useQuery({
    queryKey: ['parent_fees'],
    queryFn: parentAPI.getFees,
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error">Failed to load fee information: {error.message}</Alert>
      </Box>
    );
  }

  const { summary, upcomingPayments, paymentHistory } = feeData;

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Fee Management
      </Typography>

      {/* Fee Summary */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Outstanding</Typography>
              <Typography variant="h4" color="error.main">₹{summary.outstanding}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Next Due Date</Typography>
              <Typography variant="h4">{summary.nextDueDate}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4} sx={{ alignSelf: 'center', textAlign: 'center' }}>
          <Button variant="contained" size="large" startIcon={<Payment />}>
            Pay Now
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Upcoming Payments */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Upcoming Payments</Typography>
            <List>
              {upcomingPayments.map((payment) => (
                <ListItem key={payment.id} divider>
                  <ListItemText
                    primary={payment.description}
                    secondary={`Due Date: ${payment.dueDate}`}
                  />
                  <Typography variant="h6">₹{payment.amount}</Typography>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Payment History */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Payment History</Typography>
            <List>
              {paymentHistory.map((payment) => (
                <ListItem key={payment.id} divider>
                  <ListItemText
                    primary={payment.description}
                    secondary={`Paid on: ${payment.date}`}
                  />
                  <Chip icon={<Receipt />} label="View Receipt" onClick={() => { /* TODO */ }} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FeeManagement; 