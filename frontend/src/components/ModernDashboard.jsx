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
  IconButton,
  LinearProgress,
  CircularProgress,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  School,
  Person,
  Assignment,
  Assessment,
  Payment,
  Notifications,
  Settings,
  Dashboard as DashboardIcon,
  EmojiEvents,
  Star,
  CheckCircle,
  Warning,
  Info
} from '@mui/icons-material';

const ModernDashboard = ({ userType = 'student', data = {} }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

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

  const getColorByType = (type) => {
    const colors = {
      student: '#2563eb', // primary blue
      parent: '#10b981', // success green
      staff: '#f59e0b', // warning orange
      accountant: '#7c3aed' // secondary purple
    };
    return colors[type] || '#2563eb';
  };

  const getIconByType = (type) => {
    const icons = {
      student: School,
      parent: Person,
      staff: Assignment,
      accountant: Payment
    };
    return icons[type] || School;
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        flexDirection="column"
        gap={3}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <CircularProgress size={60} thickness={4} />
        </motion.div>
        <Typography variant="h6" color="text.secondary">
          Loading your dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Header Section */}
        <motion.div variants={itemVariants}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${getColorByType(userType)}20 0%, ${getColorByType(userType)}10 100%)`,
              border: `2px solid ${getColorByType(userType)}30`,
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
                background: `linear-gradient(135deg, ${getColorByType(userType)}10 0%, transparent 100%)`,
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
                        bgcolor: getColorByType(userType),
                        fontSize: '2rem',
                        boxShadow: `0 8px 32px ${getColorByType(userType)}40`
                      }}
                    >
                      {React.createElement(getIconByType(userType), { fontSize: 'inherit' })}
                    </Avatar>
                  </motion.div>
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
                      Welcome back, {data.name || 'User'}!
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {data.role || userType.charAt(0).toUpperCase() + userType.slice(1)} Dashboard
                    </Typography>
                    <Box display="flex" gap={1} mt={1}>
                      <Chip
                        label={data.status || 'Active'}
                        color="success"
                        size="small"
                        icon={<CheckCircle />}
                      />
                      <Chip
                        label={data.lastLogin || 'Today'}
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
                      <Badge badgeContent={data.notifications || 3} color="error">
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

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { title: 'Total Courses', value: data.courses || 12, icon: School, trend: '+5%', color: 'success' },
            { title: 'Assignments', value: data.assignments || 8, icon: Assignment, trend: '-2%', color: 'warning' },
            { title: 'Attendance', value: `${data.attendance || 95}%`, icon: CheckCircle, trend: '+1%', color: 'success' },
            { title: 'Performance', value: `${data.performance || 88}%`, icon: TrendingUp, trend: '+3%', color: 'info' }
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
                      boxShadow: `0 25px 50px ${getColorByType(userType)}20`
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
                          bgcolor: `${getColorByType(userType)}20`,
                          color: getColorByType(userType),
                          mx: 'auto',
                          mb: 2
                        }}
                      >
                        <stat.icon />
                      </Avatar>
                    </motion.div>
                    <Typography variant="h3" fontWeight={700} color="text.primary" gutterBottom>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                      {stat.trend.startsWith('+') ? (
                        <TrendingUp sx={{ color: 'success.main', fontSize: 16 }} />
                      ) : (
                        <TrendingDown sx={{ color: 'error.main', fontSize: 16 }} />
                      )}
                      <Typography
                        variant="caption"
                        color={stat.trend.startsWith('+') ? 'success.main' : 'error.main'}
                        fontWeight={600}
                      >
                        {stat.trend}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Progress Section */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Current Progress
                  </Typography>
                  <Box sx={{ mt: 3 }}>
                    {[
                      { subject: 'Mathematics', progress: 85, color: getColorByType(userType) },
                      { subject: 'Science', progress: 92, color: theme.palette.success.main },
                      { subject: 'English', progress: 78, color: theme.palette.warning.main },
                      { subject: 'History', progress: 88, color: theme.palette.info.main }
                    ].map((item, index) => (
                      <Box key={index} sx={{ mb: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="body2" fontWeight={600}>
                            {item.subject}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.progress}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={item.progress}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: `${item.color}20`,
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              background: `linear-gradient(90deg, ${item.color} 0%, ${item.color}dd 100%)`
                            }
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Recent Achievements
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {[
                      { title: 'Perfect Attendance', icon: CheckCircle, color: 'success' },
                      { title: 'Top Performer', icon: Star, color: 'warning' },
                      { title: 'Quick Learner', icon: EmojiEvents, color: 'info' }
                    ].map((achievement, index) => (
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
        </Grid>
      </Box>
    </motion.div>
  );
};

export default ModernDashboard;
