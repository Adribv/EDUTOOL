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
  School,
  Assignment,
  Assessment,
  CheckCircle,
  TrendingUp,
  Event,
  Message,
  CalendarToday,
  LibraryBooks,
  EmojiEvents,
  Star,
  Notifications,
  Settings
} from '@mui/icons-material';
import ModernLayout from '../../components/ModernLayout';
import ModernDashboard from '../../components/ModernDashboard';

const StudentDashboard = () => {
  const theme = useTheme();
  const [studentData, setStudentData] = useState({
    name: 'Alex Johnson',
    grade: 'Grade 10',
    attendance: 95,
    performance: 88,
    courses: 6,
    assignments: 8,
    notifications: 5,
    achievements: [
      { title: 'Perfect Attendance', icon: CheckCircle, color: 'success' },
      { title: 'Top Performer', icon: Star, color: 'warning' },
      { title: 'Quick Learner', icon: EmojiEvents, color: 'info' }
    ],
    subjects: [
      { name: 'Mathematics', progress: 85, grade: 'A-' },
      { name: 'Science', progress: 92, grade: 'A' },
      { name: 'English', progress: 78, grade: 'B+' },
      { name: 'History', progress: 88, grade: 'A-' }
    ],
    upcomingEvents: [
      { title: 'Math Quiz', date: 'Tomorrow', time: '10:00 AM' },
      { title: 'Science Fair', date: 'Next Week', time: '2:00 PM' },
      { title: 'Parent Meeting', date: 'Friday', time: '3:30 PM' }
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

  return (
    <ModernLayout userType="student">
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
                background: `linear-gradient(135deg, ${theme.palette.student.main}20 0%, ${theme.palette.student.main}10 100%)`,
                border: `2px solid ${theme.palette.student.main}30`,
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
                  background: `linear-gradient(135deg, ${theme.palette.student.main}10 0%, transparent 100%)`,
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
                          bgcolor: theme.palette.student.main,
                          fontSize: '2rem',
                          boxShadow: `0 8px 32px ${theme.palette.student.main}40`
                        }}
                      >
                        <School />
                      </Avatar>
                    </motion.div>
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
                        Welcome back, {studentData.name}!
                      </Typography>
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        {studentData.grade} • Student Dashboard
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
                        <Badge badgeContent={studentData.notifications} color="error">
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
              { title: 'Total Courses', value: studentData.courses, icon: School, trend: '+1', color: 'success' },
              { title: 'Pending Assignments', value: studentData.assignments, icon: Assignment, trend: '-2', color: 'warning' },
              { title: 'Attendance', value: `${studentData.attendance}%`, icon: CheckCircle, trend: '+1%', color: 'success' },
              { title: 'Performance', value: `${studentData.performance}%`, icon: TrendingUp, trend: '+3%', color: 'info' }
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
                        boxShadow: `0 25px 50px ${theme.palette.student.main}20`
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
                            bgcolor: `${theme.palette.student.main}20`,
                            color: theme.palette.student.main,
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
            {/* Academic Progress */}
            <Grid item xs={12} md={8}>
              <motion.div variants={itemVariants}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Academic Progress
                    </Typography>
                    <Box sx={{ mt: 3 }}>
                      {studentData.subjects.map((subject, index) => (
                        <Box key={index} sx={{ mb: 3 }}>
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
                              height: 8,
                              borderRadius: 4,
                              bgcolor: `${theme.palette.student.main}20`,
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                background: `linear-gradient(90deg, ${theme.palette.student.main} 0%, ${theme.palette.student.main}dd 100%)`
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

            {/* Sidebar */}
            <Grid item xs={12} md={4}>
              <Grid container spacing={3}>
                {/* Achievements */}
                <Grid item xs={12}>
                  <motion.div variants={itemVariants}>
                    <Card>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Recent Achievements
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          {studentData.achievements.map((achievement, index) => (
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

                {/* Upcoming Events */}
                <Grid item xs={12}>
                  <motion.div variants={itemVariants}>
                    <Card>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Upcoming Events
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          {studentData.upcomingEvents.map((event, index) => (
                            <Box
                              key={index}
                              sx={{
                                mb: 2,
                                p: 2,
                                borderRadius: 2,
                                bgcolor: `${theme.palette.student.main}10`,
                                border: `1px solid ${theme.palette.student.main}20`
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

export default StudentDashboard; 