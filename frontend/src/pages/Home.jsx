import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useCallback, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  useTheme,
  useMediaQuery,
  Divider,
  Paper,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BusinessIcon from '@mui/icons-material/Business';
import GroupIcon from '@mui/icons-material/Group';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import School from '@mui/icons-material/School';
import Book from '@mui/icons-material/Book';
import Assignment from '@mui/icons-material/Assignment';
import Event from '@mui/icons-material/Event';
import logo from '../assets/logo.png';
import backgroundVideo from '../assets/background.mp4';
import { useTheme as useAppTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { isDark } = useAppTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedTab, setSelectedTab] = useState(0);

  const studentParentPortals = [
    {
      title: 'Student Portal',
      description: 'Access your academic dashboard, assignments, and grades',
      icon: <AutoStoriesIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#ffffff' }} />,
      color: '#2563eb',
      path: '/student-login',
      gradient: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
    },
    {
      title: 'Parent Portal',
      description: 'Monitor your child\'s progress and stay connected',
      icon: <FamilyRestroomIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#ffffff' }} />,
      color: '#dc2626',
      path: '/parent-login',
      gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
    },
  ];

  const managementPortals = useMemo(() => [
    {
      title: 'Staff Login',
      description: 'Login for all teaching and non-teaching staff, principals, HODs, and officials',
      icon: <BusinessIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#ffffff' }} />,
      color: '#0891b2',
      path: '/management-login',
      gradient: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
    },
    {
      title: 'Accountant Login',
      description: 'Access financial dashboard and manage school expenses',
      icon: <AccountBalanceWalletIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#ffffff' }} />,
      color: '#d97706',
      path: '/accountant-login',
      gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
    },
  ], []);

  const handlePortalClick = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  const handleTabChange = useCallback((event, newValue) => {
    setSelectedTab(newValue);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const PortalCard = ({ portal, index }) => (
      <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.1 * index, ease: "easeOut" }}
      whileHover={{ 
        y: -10,
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      >
        <Card
        onClick={() => handlePortalClick(portal.path)}
          sx={{
          height: { xs: '320px', sm: '380px', md: '420px' },
            display: 'flex',
            flexDirection: 'column',
          background: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: isDark ? '1px solid rgba(148, 163, 184, 0.2)' : '1px solid rgba(37, 99, 235, 0.2)',
          borderRadius: 3,
          boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(37, 99, 235, 0.1)',
            transition: 'all 0.3s ease-in-out',
            cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
            '&:hover': {
              transform: 'translateY(-8px)',
            boxShadow: isDark ? '0 20px 40px rgba(0, 0, 0, 0.4)' : '0 20px 40px rgba(37, 99, 235, 0.15)',
            },
          }}
        >
          <CardContent sx={{ 
          flex: 1, 
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          p: 3,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.05) 50%, transparent 70%)',
            backgroundSize: '200% 200%',
            animation: 'shimmer 3s ease-in-out infinite',
            borderRadius: 'inherit',
            zIndex: 0,
          }
        }}>
          <Box>
            <motion.div
              whileHover={{ 
                scale: 1.1,
                transition: { duration: 0.2 }
              }}
              whileTap={{ 
                scale: 0.95,
                transition: { duration: 0.1 }
              }}
            >
              <Box
                sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
                  width: 100,
                  height: 100,
                  borderRadius: 3,
                  background: portal.gradient,
                  mb: 4,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -2,
                    left: -2,
                    right: -2,
                    bottom: -2,
                    background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)',
                    borderRadius: 'inherit',
                    zIndex: -1,
                    opacity: 0,
                    transition: 'opacity 0.3s ease-in-out',
                  },
                  '&:hover::before': {
                    opacity: 1,
                  }
                }}
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
              {portal.icon}
                </motion.div>
            </Box>
            </motion.div>
            
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: isDark ? '#ffffff' : 'text.primary',
                mb: 3,
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                textShadow: isDark ? '0 1px 2px rgba(0, 0, 0, 0.5)' : 'none',
              }}
            >
              {portal.title}
            </Typography>
            
            <Typography
              variant="body2"
              sx={{ 
                color: isDark ? '#e2e8f0' : 'text.secondary',
                lineHeight: 1.6,
                fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                fontWeight: isDark ? 500 : 400,
                textShadow: isDark ? '0 1px 2px rgba(0, 0, 0, 0.3)' : 'none',
                minHeight: '4rem',
                display: 'flex',
                alignItems: 'flex-start',
              }}
            >
              {portal.description}
            </Typography>
          </Box>
          
            <Button
              variant="contained"
              sx={{
                background: portal.gradient,
                color: 'white',
              mt: 0,
              py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                '&:hover': {
                  background: portal.gradient,
                  opacity: 0.9,
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Access Portal
            </Button>
        </CardContent>
        </Card>
      </motion.div>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDark 
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.6) 50%, rgba(51, 65, 85, 0.6) 100%)'
            : 'linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(30, 41, 59, 0.4) 50%, rgba(51, 65, 85, 0.4) 100%)',
          zIndex: 1,
        },
      }}
    >
      {/* Theme Toggle Button */}
      <Box
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999,
          pointerEvents: 'auto',
        }}
      >
        <IconButton
          sx={{
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.95)',
            color: isDark ? '#ffffff' : '#1976d2',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            width: 48,
            height: 48,
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 1)',
              transform: 'scale(1.05)',
            }
          }}
        >
          <ThemeToggle />
        </IconButton>
      </Box>
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      >
        <source src={backgroundVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Simple Floating Icons */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              left: `${20 + (i * 20)}%`,
              top: `${30 + (i * 15)}%`,
              color: isDark ? '#ffffff' : '#1e293b',
              opacity: 0.05,
            }}
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
          >
            {i % 4 === 0 ? <School sx={{ fontSize: 24 }} /> :
             i % 4 === 1 ? <Book sx={{ fontSize: 20 }} /> :
             i % 4 === 2 ? <Assignment sx={{ fontSize: 22 }} /> :
             <Event sx={{ fontSize: 18 }} />}
          </motion.div>
        ))}
      </Box>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants}>
            <Box
              sx={{
                textAlign: 'center',
                py: { xs: 4, md: 6 },
                mb: 4,
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center', 
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: -30 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: 0
                }}
                transition={{ 
                  duration: 0.8, 
                  ease: "easeOut"
                }}
                whileHover={{ 
                  scale: 1.1,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ 
                  scale: 0.95,
                  transition: { duration: 0.1 }
                }}
              >
                <Box
                  component="img"
                  src={logo}
                  alt="EDULIVES Logo"
                  sx={{
                    height: isMobile ? 180 : 240,
                    width: 'auto',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    mb: 3,
                    filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2))',
                    display: 'block',
                    margin: '0 auto',
                    cursor: 'pointer',
                  }}
                />
              </motion.div>
              
                              <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                >
                  <motion.div
                    animate={{ 
                      y: [0, -5, 0]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                      <Typography
                        variant="h1"
                        sx={{
                          fontWeight: 900,
                          mb: 2,
                          fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                          background: isDark 
                            ? 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #cbd5e1 100%)'
                            : 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 50%, #e2e8f0 100%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          letterSpacing: '-0.02em',
                          filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
                          position: 'relative',
                          cursor: 'pointer',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.1) 50%, transparent 70%)',
                            backgroundSize: '200% 200%',
                            animation: 'shimmer 3s ease-in-out infinite',
                          }
                        }}
                      >
                        Welcome to EduTool
              </Typography>
                      
                      {/* Simple Glow Effect */}
                      <motion.div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          width: '100%',
                          height: '100%',
                          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
                          borderRadius: '50%',
                          transform: 'translate(-50%, -50%)',
                        }}
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    </Box>
                  </motion.div>
                </motion.div>
              
                              <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <motion.div
                    animate={{ 
                      opacity: [0.95, 1, 0.95],
                      scale: [1, 1.01, 1]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                                         <Box
                       sx={{
                         background: isDark 
                           ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)'
                           : 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)',
                         backdropFilter: 'blur(10px)',
                         border: isDark 
                           ? '1px solid rgba(59, 130, 246, 0.2)'
                           : '1px solid rgba(59, 130, 246, 0.1)',
                         borderRadius: 2,
                         padding: '1rem 2rem',
                         position: 'relative',
                         overflow: 'hidden',
                       }}
                     >
              <Typography
                variant="h5"
                sx={{
                          color: isDark ? '#e2e8f0' : '#ffffff',
                          fontWeight: 600,
                          mb: 4,
                          fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                          maxWidth: '800px',
                          margin: '0 auto',
                          lineHeight: 1.4,
                          textShadow: isDark 
                            ? '0 2px 4px rgba(255, 255, 255, 0.2)'
                            : '0 2px 4px rgba(0, 0, 0, 0.7)',
                          filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
                          position: 'relative',
                          zIndex: 1,
                        }}
                      >
                        Your comprehensive educational management platform.
              </Typography>
                    </Box>
                  </motion.div>
                </motion.div>
            </Box>
          </motion.div>

          {/* Portal Selection Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Paper 
              sx={{ 
                background: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: isDark ? '1px solid rgba(148, 163, 184, 0.2)' : '1px solid rgba(37, 99, 235, 0.2)',
                borderRadius: 3,
                mb: 4,
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Tabs 
                value={selectedTab} 
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  '& .MuiTabs-indicator': {
                    height: 3,
                    background: 'linear-gradient(135deg, #2563eb 0%, #dc2626 100%)',
                  },
                  '& .MuiTab-root': {
                    color: isDark ? '#94a3b8' : '#64748b',
                    fontWeight: 600,
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    textTransform: 'none',
                    py: 2,
                    '&.Mui-selected': {
                      color: isDark ? '#ffffff' : '#2563eb',
                      fontWeight: 700,
                  },
                    '&:hover': {
                      color: isDark ? '#cbd5e1' : '#475569',
                  },
                  },
                }}
              >
                <Tab label="Students & Parents" />
                <Tab label="Management" />
              </Tabs>
            </Paper>
          </motion.div>

          {/* Portal Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <AnimatePresence mode="wait">
              {selectedTab === 0 ? (
                <motion.div
                  key="students-parents"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <Box
                  sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 3,
                      maxWidth: 800,
                      mx: 'auto',
                    }}
                  >
                {studentParentPortals.map((portal, index) => (
                      <PortalCard key={portal.title} portal={portal} index={index} />
                ))}
                  </Box>
            </motion.div>
              ) : (
                <motion.div
                  key="management"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                  sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 3,
                      maxWidth: 800,
                      mx: 'auto',
                    }}
                  >
                {managementPortals.map((portal, index) => (
                      <PortalCard key={portal.title} portal={portal} index={index} />
                ))}
                  </Box>
            </motion.div>
          )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Home; 