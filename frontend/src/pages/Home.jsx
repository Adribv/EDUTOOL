import { useNavigate } from 'react-router-dom';
import { color, motion } from 'framer-motion';
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
import logo from '../assets/logo.png';
import { useTheme as useAppTheme } from '../context/ThemeContext';

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
      icon: <AutoStoriesIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#1E3A8A' }} />,
      color: '#1E3A8A',
      path: '/student-login',
      gradient: 'linear-gradient(135deg, #1E3A8A 0%, #14285B 100%)',
    },
    {
      title: 'Parent Portal',
      description: 'Monitor your child\'s progress and stay connected',
      icon: <FamilyRestroomIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#F97316' }} />,
      color: '#F97316',
      path: '/parent-login',
      gradient: 'linear-gradient(135deg, #F97316 0%, #C45A12 100%)',
    },
  ];

  const managementPortals = useMemo(() => [
    {
      title: 'Staff Login',
      description: 'Login for all teaching and non-teaching staff, principals, HODs, and officials',
      icon: <BusinessIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#7c3aed' }} />,
      color: '#7c3aed',
      path: '/management-login',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
    },
    {
      title: 'Accountant Login',
      description: 'Access financial dashboard and manage school expenses',
      icon: <AccountBalanceWalletIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#f59e0b' }} />,
      color: '#f59e0b',
      path: '/accountant-login',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
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
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    hover: {
      y: -8,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  const PortalCard = ({ portal, index }) => (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.1 }}
      style={{ 
        width: '100%', 
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Card
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.2)',
          transition: 'all 0.3s ease-in-out',
          cursor: 'pointer',
          minHeight: { xs: '280px', sm: '320px', md: '360px' },
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.3)' : '0 20px 40px rgba(0,0,0,0.15)',
            background: isDark ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)',
          },
        }}
        onClick={() => handlePortalClick(portal.path)}
      >
        <CardContent sx={{ 
          flexGrow: 1, 
          textAlign: 'center', 
          p: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
          minHeight: { xs: '200px', sm: '220px', md: '240px' },
        }}>
          <Box sx={{ 
            mb: 2,
            p: 2,
            borderRadius: '50%',
            background: isDark 
              ? `linear-gradient(135deg, ${portal.color}20 0%, ${portal.color}30 100%)`
              : `linear-gradient(135deg, ${portal.color}15 0%, ${portal.color}25 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            {portal.icon}
          </Box>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 1.5,
              color: isDark ? '#ffffff' : portal.color,
              fontSize: { xs: '1.125rem', sm: '1.25rem' },
              flexShrink: 0,
            }}
          >
            {portal.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{ 
              mb: 2,
              fontSize: { xs: '0.875rem', sm: '0.9rem' },
              lineHeight: 1.5,
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              color: isDark ? '#cbd5e1' : '#64748b',
            }}
          >
            {portal.description}
          </Typography>
        </CardContent>
        <CardActions sx={{ p: { xs: 2, sm: 3 }, pt: 0, flexShrink: 0 }}>
          <Button
            fullWidth
            variant="contained"
            sx={{
              background: portal.gradient,
              color: 'white',
              py: { xs: 1, sm: 1.5 },
              fontWeight: 600,
              textTransform: 'none',
              fontSize: { xs: '0.875rem', sm: '0.9rem' },
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
        </CardActions>
      </Card>
    </motion.div>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isDark 
          ? `linear-gradient(135deg, #0f172a 0%, #1e293b 100%)`
          : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        display: 'flex',
        alignItems: 'center',
        py: { xs: 2, sm: 4 },
        px: { xs: 1, sm: 2 },
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Box sx={{ textAlign: 'center', mb: { xs: 4, sm: 6 } }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                mb: 3,
                flexDirection: { xs: 'column', sm: 'row' }
              }}>
                <img 
                  src={logo} 
                  alt="EDULIVES Logo" 
                  style={{ 
                    height: isMobile ? 60 : 80, 
                    width: 'auto', 
                    marginRight: isMobile ? 0 : 16, 
                    marginBottom: isMobile ? 16 : 0,
                    objectFit: 'contain',
                    maxWidth: '100%',
                    maxHeight: '100%'
                  }} 
                />
              </Box>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                  fontWeight: 700,
                  color: '#ffffff',
                  mb: 2,
                  opacity: 1,
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                }}
              >
                Educational Excellence Platform
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  color: '#f1f5f9',
                  opacity: 0.95,
                  maxWidth: 600,
                  mx: 'auto',
                  px: { xs: 1, sm: 0 },
                  fontWeight: 500,
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                }}
              >
                Choose your portal to access the comprehensive school management system
              </Typography>
            </Box>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Paper 
              sx={{ 
                background: isDark ? 'rgba(30, 41, 59, 0.1)' : 'rgba(255, 255, 255, 0.1)', 
                backdropFilter: 'blur(10px)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 3,
                mb: 4
              }}
            >
              <Tabs 
                value={selectedTab} 
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  '& .MuiTab-root': {
                    color: isDark ? '#e2e8f0' : '#ffffff',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    fontWeight: 600,
                    textTransform: 'none',
                    py: 2,
                    opacity: 0.8,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      opacity: 1,
                      color: isDark ? '#ffffff' : '#ffffff',
                    },
                  },
                  '& .Mui-selected': {
                    color: '#ffffff !important',
                    opacity: 1,
                    fontWeight: 700,
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#ffffff',
                    height: 3,
                  },
                }}
              >
                <Tab 
                  icon={<GroupIcon sx={{ fontSize: { xs: 20, sm: 24 }, color: 'inherit' }} />} 
                  label="Students & Parents" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<BusinessIcon sx={{ fontSize: { xs: 20, sm: 24 }, color: 'inherit' }} />} 
                  label="Staff & Management" 
                  iconPosition="start"
                />
              </Tabs>
            </Paper>
          </motion.div>

          {selectedTab === 0 && (
            <motion.div variants={itemVariants}>
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h4"
                  sx={{
                    textAlign: 'center',
                    color: '#ffffff',
                    fontWeight: 700,
                    mb: 2,
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  Student & Parent Portals
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: { xs: 2, sm: 3 },
                  maxWidth: '800px',
                  mx: 'auto',
                  '& > *': {
                    height: { xs: '280px', sm: '320px', md: '360px' },
                  }
                }}
              >
                {studentParentPortals.map((portal, index) => (
                  <PortalCard key={index} portal={portal} index={index} />
                ))}
              </Box>
            </motion.div>
          )}

          {selectedTab === 1 && (
            <motion.div variants={itemVariants}>
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h4"
                  sx={{
                    textAlign: 'center',
                    color: '#ffffff',
                    fontWeight: 700,
                    mb: 2,
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  Staff & Management Portal
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: { xs: 2, sm: 3 },
                  maxWidth: '800px',
                  mx: 'auto',
                  '& > *': {
                    height: { xs: '280px', sm: '320px', md: '360px' },
                  }
                }}
              >
                {managementPortals.map((portal, index) => (
                  <PortalCard key={index} portal={portal} index={index} />
                ))}
              </Box>
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
            <Box sx={{ textAlign: 'center', mt: { xs: 4, sm: 6 } }}>
              <Typography
                variant="body2"
                sx={{
                  color: 'white',
                  opacity: 0.7,
                  fontSize: '0.875rem',
                }}
              >
                © 2024 EDULIVES. All rights reserved.
              </Typography>
            </Box>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Home; 