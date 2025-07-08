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
import logo from '../assets/logo.jpg';

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedTab, setSelectedTab] = useState(0);

  const studentParentPortals = [
    {
      title: 'Student Portal',
      description: 'Access your academic dashboard, assignments, and grades',
      icon: <AutoStoriesIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#2563eb' }} />,
      color: '#2563eb',
      path: '/student-login',
      gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    },
    {
      title: 'Parent Portal',
      description: 'Monitor your child\'s progress and stay connected',
      icon: <FamilyRestroomIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#10b981' }} />,
      color: '#10b981',
      path: '/parent-login',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  const PortalCard = ({ portal, index }) => (
    <Grid item xs={12} key={index} sx={{ flexBasis: { xs: '100%', sm: '50%', md: '33.3333%' } }}>
      <motion.div
        variants={cardVariants}
        whileHover="hover"
        initial="hidden"
        animate="visible"
        transition={{ delay: index * 0.1 }}
      >
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease-in-out',
            cursor: 'pointer',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              background: 'rgba(255, 255, 255, 0.98)',
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
            justifyContent: 'center',
          }}>
            <Box sx={{ 
              mb: 2,
              p: 2,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${portal.color}15 0%, ${portal.color}25 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {portal.icon}
            </Box>
            <Typography
              variant="h5"
              component="h2"
              sx={{
                fontWeight: 700,
                mb: 1.5,
                color: portal.color,
                fontSize: { xs: '1.125rem', sm: '1.25rem' },
              }}
            >
              {portal.title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ 
                mb: 2,
                fontSize: { xs: '0.875rem', sm: '0.9rem' },
                lineHeight: 1.5,
              }}
            >
              {portal.description}
            </Typography>
          </CardContent>
          <CardActions sx={{ p: { xs: 2, sm: 3 }, pt: 0 }}>
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
    </Grid>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
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
                <img src={logo} alt="EDULIVES Logo" style={{ height: isMobile ? 60 : 80, width: 'auto', marginRight: isMobile ? 0 : 16, marginBottom: isMobile ? 16 : 0 }} />
              </Box>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                  fontWeight: 600,
                  color: 'white',
                  mb: 2,
                  opacity: 0.9,
                }}
              >
                Educational Excellence Platform
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  color: 'white',
                  opacity: 0.8,
                  maxWidth: 600,
                  mx: 'auto',
                  px: { xs: 1, sm: 0 },
                }}
              >
                Choose your portal to access the comprehensive school management system
              </Typography>
            </Box>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Paper 
              sx={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
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
                    color: 'white',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    fontWeight: 600,
                    textTransform: 'none',
                    py: 2,
                  },
                  '& .Mui-selected': {
                    color: 'white',
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: 'white',
                    height: 3,
                  },
                }}
              >
                <Tab 
                  icon={<GroupIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />} 
                  label="Students & Parents" 
                  iconPosition="start"
                  sx={{ '&.Mui-selected': { color: 'gray' } }}
                />
                <Tab 
                  icon={<BusinessIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />} 
                  label="Staff & Management" 
                  iconPosition="start"
                  sx={{ '&.Mui-selected': { color: 'gray' } }}
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
                    color: 'white',
                    fontWeight: 600,
                    mb: 2,
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                  }}
                >
                  Student & Parent Portals
                </Typography>
              </Box>
              <Grid container spacing={{ xs: 2, sm: 3 }} justifyContent="center">
                {studentParentPortals.map((portal, index) => (
                  <PortalCard key={index} portal={portal} index={index} />
                ))}
              </Grid>
            </motion.div>
          )}

          {selectedTab === 1 && (
            <motion.div variants={itemVariants}>
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h4"
                  sx={{
                    textAlign: 'center',
                    color: 'white',
                    fontWeight: 600,
                    mb: 2,
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                  }}
                >
                  Staff & Management Portal
                </Typography>
              </Box>
              <Grid container spacing={{ xs: 2, sm: 3 }} justifyContent="center">
                {managementPortals.map((portal, index) => (
                  <PortalCard key={index} portal={portal} index={index} />
                ))}
              </Grid>
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