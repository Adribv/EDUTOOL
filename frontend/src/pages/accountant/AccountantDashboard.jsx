import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  LinearProgress,
  Button,
  IconButton,
  Badge,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Payment,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Group,
  Assessment,
  Event,
  Message,
  CalendarToday,
  EmojiEvents,
  Star,
  Notifications,
  Settings,
  AccountBalance,
  Receipt,
  MonetizationOn
} from '@mui/icons-material';
import ModernLayout from '../../components/ModernLayout';

const AccountantDashboard = () => {
  const theme = useTheme();
  

  const [accountantData, setAccountantData] = useState({
    name: 'Michael Chen',
    role: 'Senior Accountant',
    notifications: 12,
    achievements: [
      { title: 'Perfect Records', icon: CheckCircle, color: 'success' },
      { title: 'Top Performer', icon: Star, color: 'warning' },
      { title: 'Quick Processor', icon: EmojiEvents, color: 'info' }
    ],
    financialStats: {
      totalRevenue: 125000,
      totalExpenses: 85000,
      netProfit: 40000,
      pendingPayments: 15000,
      overduePayments: 5000,
      monthlyGrowth: 12.5
    },
    recentTransactions: [
      { id: 'TXN001', student: 'Alex Johnson', amount: 2500, status: 'completed', date: '2024-01-15' },
      { id: 'TXN002', student: 'Emma Wilson', amount: 1800, status: 'pending', date: '2024-01-14' },
      { id: 'TXN003', student: 'David Brown', amount: 3200, status: 'completed', date: '2024-01-13' },
      { id: 'TXN004', student: 'Sarah Davis', amount: 2100, status: 'overdue', date: '2024-01-12' }
    ],
    upcomingDeadlines: [
      { title: 'Monthly Report Due', date: 'Tomorrow', time: '5:00 PM' },
      { title: 'Tax Filing Deadline', date: 'Next Week', time: '3:00 PM' },
      { title: 'Audit Meeting', date: 'Friday', time: '10:00 AM' }
    ],
    feeCategories: [
      { name: 'Tuition Fees', collected: 85000, total: 100000, percentage: 85 },
      { name: 'Transport Fees', collected: 12000, total: 15000, percentage: 80 },
      { name: 'Library Fees', collected: 8000, total: 10000, percentage: 80 },
      { name: 'Sports Fees', collected: 5000, total: 8000, percentage: 62.5 }
    ]
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <ModernLayout userType="accountant">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          {/* Welcome Header */}
          <motion.div variants={itemVariants}>
            <Card
              sx={{
                        background: `linear-gradient(135deg, ${theme.palette.accountant.main}20 0%, ${theme.palette.accountant.main}10 100%)`,
        border: `2px solid ${theme.palette.accountant.main}30`,
                mb: 4,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.palette.accountant.main}10 0%, transparent 100%)`,
                  opacity: 0.6
                }}
              />
              <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                  <Box display="flex" alignItems="center" gap={3}>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: theme.palette.accountant.main,
                          fontSize: '2rem',
                          boxShadow: `0 8px 32px ${theme.palette.accountant.main}40`
                        }}
                      >
                        <Payment />
                      </Avatar>
                    </motion.div>
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
                        Welcome back, {accountantData.name}!
                      </Typography>
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        {accountantData.role} • Financial Management Dashboard
                      </Typography>
                      <Box display="flex" gap={1}>
                        <Chip
                          label="Active"
                          color="success"
                          size="small"
                          icon={<CheckCircle />}
                        />
                        <Chip
                          label="Today"
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                    </Box>
                  </Box>
                  <Box display="flex" gap={1}>
                    <Tooltip title="Notifications">
                      <IconButton
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' }
                        }}
                      >
                        <Badge badgeContent={accountantData.notifications} color="error">
                          <Notifications />
                        </Badge>
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Settings">
                      <IconButton
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' }
                        }}
                      >
                        <Settings />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>

          {/* Financial Stats Grid */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              { 
                title: 'Total Revenue', 
                value: formatCurrency(accountantData.financialStats.totalRevenue), 
                icon: TrendingUp, 
                trend: `+${accountantData.financialStats.monthlyGrowth}%`, 
                color: 'success' 
              },
              { 
                title: 'Total Expenses', 
                value: formatCurrency(accountantData.financialStats.totalExpenses), 
                icon: TrendingDown, 
                trend: '-5.2%', 
                color: 'warning' 
              },
              { 
                title: 'Net Profit', 
                value: formatCurrency(accountantData.financialStats.netProfit), 
                icon: AccountBalance, 
                trend: '+8.7%', 
                color: 'success' 
              },
              { 
                title: 'Pending Payments', 
                value: formatCurrency(accountantData.financialStats.pendingPayments), 
                icon: Payment, 
                trend: '-12%', 
                color: 'warning' 
              }
            ].map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div variants={itemVariants}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: `0 25px 50px ${theme.palette.accountant.main}20`
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Avatar
                          sx={{
                            width: 60,
                            height: 60,
                            bgcolor: `${theme.palette.accountant.main}20`,
                            color: theme.palette.accountant.main,
                            mx: 'auto',
                            mb: 2
                          }}
                        >
                          <stat.icon />
                        </Avatar>
                      </motion.div>
                      <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {stat.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        color={stat.trend.startsWith('+') ? 'success.main' : 'error.main'}
                        fontWeight={600}
                      >
                        {stat.trend}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Main Content Grid */}
          <Grid container spacing={3}>
            {/* Fee Collection Progress */}
            <Grid item xs={12} md={8}>
              <motion.div variants={itemVariants}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Fee Collection Progress
                    </Typography>
                    <Box sx={{ mt: 3 }}>
                      {accountantData.feeCategories.map((category, index) => (
                        <Box key={index} sx={{ mb: 3 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="body2" fontWeight={600}>
                              {category.name}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2" color="text.secondary">
                                {category.percentage}%
                              </Typography>
                              <Chip
                                label={formatCurrency(category.collected)}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={category.percentage}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: `${theme.palette.accountant.main}20`,
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                background: `linear-gradient(90deg, ${theme.palette.accountant.main} 0%, ${theme.palette.accountant.main}dd 100%)`
                              }
                            }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            {formatCurrency(category.collected)} of {formatCurrency(category.total)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} md={4}>
              <Grid container spacing={3}>
                {/* Recent Transactions */}
                <Grid item xs={12}>
                  <motion.div variants={itemVariants}>
                    <Card>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Recent Transactions
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          {accountantData.recentTransactions.map((transaction, index) => (
                            <Box
                              key={index}
                              sx={{
                                mb: 2,
                                p: 2,
                                borderRadius: 2,
                                bgcolor: 'grey.50',
                                border: `1px solid ${theme.palette.accountant.main}20`
                              }}
                            >
                              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="body2" fontWeight={600}>
                                  {transaction.student}
                                </Typography>
                                <Chip
                                  label={transaction.status}
                                  size="small"
                                  color={getStatusColor(transaction.status)}
                                />
                              </Box>
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="caption" color="text.secondary">
                                  {transaction.id}
                                </Typography>
                                <Typography variant="body2" fontWeight={600}>
                                  {formatCurrency(transaction.amount)}
                                </Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {transaction.date}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>

                {/* Achievements */}
                <Grid item xs={12}>
                  <motion.div variants={itemVariants}>
                    <Card>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Achievements
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          {accountantData.achievements.map((achievement, index) => (
                            <Box
                              key={index}
                              display="flex"
                              alignItems="center"
                              gap={2}
                              sx={{ mb: 2, p: 1, borderRadius: 2, bgcolor: 'grey.50' }}
                            >
                              <Avatar
                                sx={{
                                  width: 40,
                                  height: 40,
                                  bgcolor: `${achievement.color}.main`,
                                  color: 'white'
                                }}
                              >
                                <achievement.icon />
                              </Avatar>
                              <Typography variant="body2" fontWeight={500}>
                                {achievement.title}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>

                {/* Upcoming Deadlines */}
                <Grid item xs={12}>
                  <motion.div variants={itemVariants}>
                    <Card>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Upcoming Deadlines
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          {accountantData.upcomingDeadlines.map((deadline, index) => (
                            <Box
                              key={index}
                              sx={{
                                mb: 2,
                                p: 2,
                                borderRadius: 2,
                                                bgcolor: `${theme.palette.accountant.main}10`,
                border: `1px solid ${theme.palette.accountant.main}20`
                              }}
                            >
                              <Typography variant="body2" fontWeight={600} gutterBottom>
                                {deadline.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {deadline.date} • {deadline.time}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </motion.div>
    </ModernLayout>
  );
};

export default AccountantDashboard; 