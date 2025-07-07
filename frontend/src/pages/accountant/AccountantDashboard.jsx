import { useQuery } from '@tanstack/react-query';
import { accountantAPI } from '../../services/api';
import { motion } from 'framer-motion';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  useTheme,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
} from '@mui/material';
import {
  MonetizationOn as IncomeIcon,
  MoneyOff as ExpenseIcon,
  TrendingUp as ProfitIcon,
  HourglassTop as DueIcon,
  Add,
  AccountCircle,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Paper elevation={6} sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Icon sx={{ fontSize: 40, color }} />
      <Box>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>{label}</Typography>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>{value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</Typography>
      </Box>
    </Paper>
  </motion.div>
);

const AccountantDashboard = () => {
  const theme = useTheme();
  const [openSampleDialog, setOpenSampleDialog] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const { data: summary, isLoading: loadingSummary } = useQuery({ queryKey: ['accountant-summary'], queryFn: accountantAPI.getSummary });
  const queryClient = useQueryClient();
  const { data: expenses = [], isLoading: loadingExpenses } = useQuery({ queryKey: ['accountant-expenses'], queryFn: accountantAPI.getExpenses });
  const { data: incomes = [], isLoading: loadingIncomes } = useQuery({ queryKey: ['accountant-incomes'], queryFn: accountantAPI.getIncomes });

  const sampleMutation = useMutation({
    mutationFn: accountantAPI.generateSampleData,
    onSuccess: ()=>{
      queryClient.invalidateQueries(['accountant-summary']);
      queryClient.invalidateQueries(['accountant-expenses']);
    }
  });

  if (loadingSummary) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const { income = 0, expenses: expensesTotal = 0, profitLoss = 0, dues = 0 } = summary || {};
  // build expenses by category
  const expenseByCategory = expenses.reduce((acc, ex) => {
    acc[ex.category] = (acc[ex.category] || 0) + ex.amount;
    return acc;
  }, {});
  const expensePieData = Object.entries(expenseByCategory).map(([k,v])=>({ name:k, value:v }));

  // Build time series (last 30 days)
  const buildSeries = (items, dateField) => {
    const today = new Date();
    const series = [];
    for (let i=29;i>=0;i--){
      const d = new Date(today); d.setDate(today.getDate()-i);
      const key = d.toISOString().slice(0,10);
      series.push({ date:key, value:0 });
    }
    items.forEach(item=>{
      const key = new Date(item[dateField]).toISOString().slice(0,10);
      const found = series.find(s=>s.date===key);
      if(found) found.value += item.amount || item.amountPaid || 0;
    });
    return series;
  };

  const expenseSeries = buildSeries(expenses,'date');
  const incomeSeries = buildSeries(incomes,'paymentDate');

  const chartData = [
    { name: 'Income', value: income },
    { name: 'Expenses', value: expensesTotal },
  ];

  return (
    <Box sx={{ minHeight:'100vh', background: theme.palette.grey[100] }}>
      {/* Generate sample data floating button */}
      <IconButton color="primary" onClick={()=>setOpenSampleDialog(true)} sx={{ position:'fixed', bottom:24, right:24, bgcolor:'white', boxShadow:theme.shadows[6] }} title="Generate Sample Data">
        <Add />
      </IconButton>

      {/* Profile / Logout Controls */}
      <Box sx={{ display:'flex', justifyContent:'flex-end', mb:2 }}> 
        <Tooltip title="Profile">
          <IconButton onClick={()=>navigate('/accountant/profile')}>
            <AccountCircle />
          </IconButton>
        </Tooltip>
        <Tooltip title="Logout">
          <IconButton onClick={async ()=>{ await logout(); navigate('/accountant-login'); }}>
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ p:{ xs:2, md:4 } }}>
        {/* Overview Section */}
        <Typography variant="h4" sx={{ fontWeight:700, mb:3 }}>Financial Overview</Typography>
        <Box sx={{
          display:'grid',
          gap:2,
          gridTemplateColumns:{ xs:'repeat(auto-fill, minmax(140px, 1fr))', sm:'repeat(auto-fill, minmax(180px, 1fr))', md:'repeat(auto-fill, minmax(220px, 1fr))'}
        }}>
          <StatCard icon={IncomeIcon} label="Total Income" value={income} color={theme.palette.success.main} />
          <StatCard icon={ExpenseIcon} label="Total Expenses" value={expensesTotal} color={theme.palette.error.main} />
          <StatCard icon={ProfitIcon} label="Profit / Loss" value={profitLoss} color={theme.palette.primary.main} />
          <StatCard icon={DueIcon} label="Outstanding Dues" value={dues} color={theme.palette.warning.main} />
        </Box>

        <Grid item xs={12}>
          <Paper elevation={6} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Income vs Expenses</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip formatter={(val) => val.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} />
                <Bar dataKey="value" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Expenses Section */}
        <Box sx={{ mt:5 }}>
          <Typography variant="h5" sx={{ mb:2 }}>Expenses</Typography>
          {loadingExpenses ? <CircularProgress/> : (
            <Grid container spacing={3} alignItems="stretch">
              <Grid item xs={12} md={6} sx={{ display:'flex', flexDirection:'column' }}>
                <Paper elevation={6} sx={{ p:3, flexGrow:1 }}>
                  <Typography variant="h6" sx={{ mb:2 }}>Expenses by Category</Typography>
                  {expensePieData.length ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={expensePieData} dataKey="value" nameKey="name" label>
                          {expensePieData.map((entry, idx)=>(<Cell key={`c-${idx}`} fill={theme.palette.chart?.[idx%10]||theme.palette.primary.main} />))}
                        </Pie>
                        <Tooltip formatter={(v)=>v.toLocaleString('en-IN',{style:'currency',currency:'INR'})} />
                      </PieChart>
                    </ResponsiveContainer>) : <Typography>No expense data.</Typography>}
                </Paper>
              </Grid>
              <Grid item xs={12} md={6} sx={{ display:'flex', flexDirection:'column' }}>
                <Paper elevation={6} sx={{ p:3, flexGrow:1, overflow:'auto' }}>
                  <Typography variant="h6" sx={{ mb:2 }}>Recent Expenses</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell><TableCell>Category</TableCell><TableCell align="right">Amount</TableCell><TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expenses.slice(0,10).map((ex)=>(
                        <TableRow key={ex._id}>
                          <TableCell>{ex.title}</TableCell>
                          <TableCell>{ex.category}</TableCell>
                          <TableCell align="right">{ex.amount.toLocaleString('en-IN',{style:'currency',currency:'INR'})}</TableCell>
                          <TableCell><Chip size="small" label={ex.status} color={ex.status==='Approved'?'success': ex.status==='Rejected'?'error':'warning'} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>

        {/* Income Section */}
        <Box sx={{ mt:5 }}>
          <Typography variant="h5" sx={{ mb:2 }}>Income</Typography>
          {loadingIncomes ? <CircularProgress/> : (
            <Grid container spacing={3} alignItems="stretch">
              <Grid item xs={12} md={4} sx={{ display:'flex', flexDirection:'column' }}>
                <Paper elevation={6} sx={{ p:3, flexGrow:1 }}>
                  <Typography variant="h6" sx={{ mb:2 }}>Total Income</Typography>
                  <Typography variant="h3" sx={{ fontWeight:700 }}>{income.toLocaleString('en-IN',{style:'currency',currency:'INR'})}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={8} sx={{ display:'flex', flexDirection:'column' }}>
                <Paper elevation={6} sx={{ p:3, flexGrow:1 }}>
                  <Typography variant="h6" sx={{ mb:2 }}>Income Trend (Last 30 days)</Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={incomeSeries}>
                      <XAxis dataKey="date" hide />
                      <YAxis tickFormatter={(v)=>v/1000+'k'} />
                      <Tooltip formatter={(v)=>v.toLocaleString('en-IN',{style:'currency',currency:'INR'})} labelFormatter={l=>l} />
                      <Line type="monotone" dataKey="value" stroke={theme.palette.success.main} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>

        {/* Profit / Loss Section */}
        <Box sx={{ mt:5 }}>
          <Typography variant="h5" sx={{ mb:2 }}>Profit / Loss</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper elevation={6} sx={{ p:3 }}>
                <Typography variant="h6" sx={{ mb:2 }}>Profit / Loss</Typography>
                <Typography variant="h3" sx={{ fontWeight:700, color: profitLoss>=0?theme.palette.success.main:theme.palette.error.main }}>{profitLoss.toLocaleString('en-IN',{style:'currency',currency:'INR'})}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={8}>
              <Paper elevation={6} sx={{ p:3 }}>
                <Typography variant="h6" sx={{ mb:2 }}>Profit Trend (Last 30 days)</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={incomeSeries.map((s,i)=>({ date:s.date, value:s.value - expenseSeries[i].value }))}>
                    <XAxis dataKey="date" hide />
                    <YAxis tickFormatter={(v)=>v/1000+'k'} />
                    <Tooltip formatter={(v)=>v.toLocaleString('en-IN',{style:'currency',currency:'INR'})} />
                    <Line type="monotone" dataKey="value" stroke={theme.palette.primary.main} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Approvals Section */}
        <Box sx={{ mt:5, mb:10 }}>
          <Typography variant="h5" sx={{ mb:2 }}>Expense Approval Status</Typography>
          {loadingExpenses ? <CircularProgress/> : (
            <Paper elevation={6} sx={{ overflow:'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow><TableCell>Title</TableCell><TableCell>Status</TableCell><TableCell>Amount</TableCell></TableRow>
              </TableHead>
              <TableBody>
                {expenses.map((ex)=>(<TableRow key={ex._id}><TableCell>{ex.title}</TableCell><TableCell><Chip size="small" label={ex.status} color={ex.status==='Approved'?'success': ex.status==='Rejected'?'error':'warning'} /></TableCell><TableCell>{ex.amount.toLocaleString('en-IN',{style:'currency',currency:'INR'})}</TableCell></TableRow>))}
              </TableBody>
            </Table>
            </Paper>
          )}
        </Box>

        {/* Fee Management Section */}
        <Box sx={{ mt:5 }}>
          <Typography variant="h5" sx={{ mb:1 }}>Fee Management Overview</Typography>
          {/* Placeholder message */}
          <Typography>Coming soon: detailed fee structure and collection analytics.</Typography>
        </Box>
      </Box>

      {/* Sample data dialog */}
      <Dialog open={openSampleDialog} onClose={()=>setOpenSampleDialog(false)}>
        <DialogTitle>Generate Sample Financial Data</DialogTitle>
        <DialogContent>
          <Typography>Generate 120 sample expenses and 120 sample fee payments for testing visuals. Existing sample data will be cleared.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenSampleDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={()=>{ sampleMutation.mutate(); setOpenSampleDialog(false); }} disabled={sampleMutation.isPending}>{sampleMutation.isPending?'Generating...':'Generate'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountantDashboard; 