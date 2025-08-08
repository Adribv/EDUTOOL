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
  Person,
  Group,
  TrendingUp,
  CheckCircle,
  Payment,
  Event,
  Message,
  CalendarToday,
  EmojiEvents,
  Star,
  Notifications,
  Settings,
  School,
  Assessment
} from '@mui/icons-material';
import ModernLayout from '../../components/ModernLayout';

const ParentDashboard = () => {
  const theme = useTheme();
  const [parentData, setParentData] = useState({
    name: 'Sarah Johnson',
    children: [
      { name: 'Alex Johnson', grade: 'Grade 10', age: 15 },
      { name: 'Emma Johnson', grade: 'Grade 8', age: 13 }
    ],
    notifications: 7,
    achievements: [
      { title: 'Perfect Attendance', icon: Star, color: 'success', child: 'Alex' },
      { title: 'Top Performer', icon: Star, color: 'warning', child: 'Emma' },
      { title: 'Quick Learner', icon: EmojiEvents, color: 'info', child: 'Alex' }
    ],
    childrenProgress: [
      {
        name: 'Alex Johnson',
        subjects: [
          { name: 'Mathematics', progress: 85, grade: 'A-' },
          { name: 'Science', progress: 92, grade: 'A' },
          { name: 'English', progress: 78, grade: 'B+' },
          { name: 'History', progress: 88, grade: 'A-' }
        ],
        attendance: 95,
        performance: 88
      },
      {
        name: 'Emma Johnson',
        subjects: [
          { name: 'Mathematics', progress: 78, grade: 'B+' },
          { name: 'Science', progress: 85, grade: 'A-' },
          { name: 'English', progress: 92, grade: 'A' },
          { name: 'History', progress: 80, grade: 'B+' }
        ],
        attendance: 92,
        performance: 84
      }
    ],
    upcomingEvents: [
      { title: 'Parent-Teacher Meeting', date: 'Tomorrow', time: '3:00 PM' },
      { title: 'Science Fair', date: 'Next Week', time: '2:00 PM' },
      { title: 'Sports Day', date: 'Friday', time: '9:00 AM' }
    ],
    feeStatus: {
      total: 5000,
      paid: 3500,
      pending: 1500,
      dueDate: '2024-02-15'
    }
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

  return (
    <ModernLayout userType="parent">
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
                background: `linear-gradient(135deg, ${theme.palette.parent.main}20 0%, ${theme.palette.parent.main}10 100%)`,
                border: `2px solid ${theme.palette.parent.main}30`,
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
                  background: `linear-gradient(135deg, ${theme.palette.parent.main}10 0%, transparent 100%)`,
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
                          bgcolor: theme.palette.parent.main,
                          fontSize: '2rem',
                          boxShadow: `0 8px 32px ${theme.palette.parent.main}40`
                        }}
                      >
                        <Person />
                      </Avatar>
                    </motion.div>
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
                        Welcome back, {parentData.name}!
                      </Typography>
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        Parent Dashboard • {parentData.children.length} Children
                      </Typography>
                      <Box display="flex" gap={1}>
                        <Chip
                          label="Active"
                          color="success"
                          size="small"
                          icon={<Star />}
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
                        <Badge badgeContent={parentData.notifications} color="error">
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

          {/* Children Overview */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {parentData.children.map((child, index) => (
              <Grid item xs={12} md={6} key={index}>
                <motion.div variants={itemVariants}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: `0 25px 50px ${theme.palette.parent.main}20`
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" gap={2} mb={3}>
                        <Avatar
                          sx={{
                            width: 60,
                            height: 60,
                            bgcolor: theme.palette.parent.main,
                            fontSize: '1.5rem'
                          }}
                        >
                          {child.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={600}>
                            {child.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {child.grade} • Age {child.age}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Attendance
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {parentData.childrenProgress[index]?.attendance || 0}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={parentData.childrenProgress[index]?.attendance || 0}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: `${theme.palette.parent.main}20`,
                          mb: 2,
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            background: `linear-gradient(90deg, ${theme.palette.parent.main} 0%, ${theme.palette.parent.main}dd 100%)`
                          }
                        }}
                      />
                      
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          Performance
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {parentData.childrenProgress[index]?.performance || 0}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={parentData.childrenProgress[index]?.performance || 0}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: `${theme.palette.parent.main}20`,
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            background: `linear-gradient(90deg, ${theme.palette.parent.main} 0%, ${theme.palette.parent.main}dd 100%)`
                          }
                        }}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Main Content Grid */}
          <Grid container spacing={3}>
            {/* Children Academic Progress */}
            <Grid item xs={12} md={8}>
              <motion.div variants={itemVariants}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Children Academic Progress
                    </Typography>
                    <Box sx={{ mt: 3 }}>
                      {parentData.childrenProgress.map((child, childIndex) => (
                        <Box key={childIndex} sx={{ mb: 4 }}>
                          <Typography variant="h6" fontWeight={600} color="text.primary" gutterBottom>
                            {child.name}
                          </Typography>
                          {child.subjects.map((subject, subjectIndex) => (
                            <Box key={subjectIndex} sx={{ mb: 2 }}>
                              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="body2" fontWeight={600}>
                                  {subject.name}
                                </Typography>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Typography variant="body2" color="text.secondary">
                                    {subject.progress}%
                                  </Typography>
                                  <Chip
                                    label={subject.grade}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                </Box>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={subject.progress}
                                sx={{
                                  height: 6,
                                  borderRadius: 3,
                                  bgcolor: `${theme.palette.parent.main}20`,
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 3,
                                    background: `linear-gradient(90deg, ${theme.palette.parent.main} 0%, ${theme.palette.parent.main}dd 100%)`
                                  }
                                }}
                              />
                            </Box>
                          ))}
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
                {/* Fee Status */}
                <Grid item xs={12}>
                  <motion.div variants={itemVariants}>
                    <Card>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Fee Status
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2">Total Fee</Typography>
                            <Typography variant="body2" fontWeight={600}>
                              ${parentData.feeStatus.total}
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2">Paid</Typography>
                            <Typography variant="body2" color="success.main" fontWeight={600}>
                              ${parentData.feeStatus.paid}
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between" mb={2}>
                            <Typography variant="body2">Pending</Typography>
                            <Typography variant="body2" color="error.main" fontWeight={600}>
                              ${parentData.feeStatus.pending}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(parentData.feeStatus.paid / parentData.feeStatus.total) * 100}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: `${theme.palette.parent.main}20`,
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                background: `linear-gradient(90deg, ${theme.palette.parent.main} 0%, ${theme.palette.parent.main}dd 100%)`
                              }
                            }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Due: {parentData.feeStatus.dueDate}
                          </Typography>
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
                          Children Achievements
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          {parentData.achievements.map((achievement, index) => (
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
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {achievement.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {achievement.child}
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>

                {/* Upcoming Events */}
                <Grid item xs={12}>
                  <motion.div variants={itemVariants}>
                    <Card>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Upcoming Events
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          {parentData.upcomingEvents.map((event, index) => (
                            <Box
                              key={index}
                              sx={{
                                mb: 2,
                                p: 2,
                                borderRadius: 2,
                                bgcolor: `${theme.palette.parent.main}10`,
                                border: `1px solid ${theme.palette.parent.main}20`
                              }}
                            >
                              <Typography variant="body2" fontWeight={600} gutterBottom>
                                {event.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {event.date} • {event.time}
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

export default ParentDashboard; 