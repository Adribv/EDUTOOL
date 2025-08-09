import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Grid,
  useTheme,
  useMediaQuery,
  Container,
  Paper,
} from '@mui/material';
import {
  School,
  People,
  Business,
  AccountBalance,
} from '@mui/icons-material';

import logo from '../assets/logo.png';

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const intervalRef = useRef(null);

  const userTypes = [
    {
      id: 'student',
      label: 'Student',
      icon: School,
      color: '#2563eb',
      description: 'Access academic dashboard',
      inputPlaceholder: 'Admission No'
    },
    {
      id: 'parent',
      label: 'Parent',
      icon: People,
      color: '#dc2626',
      description: 'Monitor child progress',
      inputPlaceholder: 'Email ID'
    },
    {
      id: 'staff',
      label: 'Staff',
      icon: Business,
      color: '#0891b2',
      description: 'Staff management portal',
      inputPlaceholder: 'Email ID'
    },
    {
      id: 'accountant',
      label: 'Accountant',
      icon: AccountBalance,
      color: '#d97706',
      description: 'Financial management portal',
      inputPlaceholder: 'Email ID'
    }
  ];

  // Video sequence effect with bgv5
  useEffect(() => {
    const videos = ['/assets/mp4/bgv1.mp4', '/assets/mp4/bgv2.mp4', '/assets/mp4/bgv3.mp4', '/assets/mp4/bgv4.mp4', '/assets/mp4/bgv5.mp4'];
    
    intervalRef.current = setInterval(() => {
      setCurrentVideoIndex(prevIndex => (prevIndex + 1) % videos.length);
    }, 5000); // 5 seconds for smooth viewing

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);



  const handleUserTypeSelect = (userType) => {
    // Direct navigation to respective login pages
    switch (userType) {
      case 'student':
        navigate('/student-login');
        break;
      case 'parent':
        navigate('/parent-login');
        break;
      case 'staff':
        navigate('/management-login');
        break;
      case 'accountant':
        navigate('/accountant-login');
        break;
      default:
        break;
    }
  };



  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
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

  const videos = ['/assets/mp4/bgv1.mp4', '/assets/mp4/bgv2.mp4', '/assets/mp4/bgv3.mp4', '/assets/mp4/bgv4.mp4', '/assets/mp4/bgv5.mp4'];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)',
          zIndex: 0
        },
        '@keyframes shimmer': {
          '0%': {
            backgroundPosition: '-200% 0',
          },
          '100%': {
            backgroundPosition: '200% 0',
          },
        },
        '@keyframes float': {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
        '@keyframes pulse': {
          '0%, 100%': {
            opacity: 1,
          },
          '50%': {
            opacity: 0.7,
          },
        },

      }}
    >
      {/* Video Background Sequence */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          overflow: 'hidden',
          background: '#000'
        }}
      >
        <AnimatePresence mode="wait">
          {videos.map((video, index) => (
            index === currentVideoIndex && (
              <motion.video
                key={`${video}-${index}`}
                autoPlay
                muted
                loop={false}
                playsInline
                preload="auto"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: 1,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: 0.6,
                  ease: "easeInOut"
                }}
                onEnded={() => {
                  setCurrentVideoIndex(prevIndex => (prevIndex + 1) % videos.length);
                }}
              >
                <source src={video} type="video/mp4" />
                Your browser does not support the video tag.
              </motion.video>
            )
          ))}
        </AnimatePresence>
      </Box>

      {/* Video Overlay */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.3) 0%, rgba(30, 41, 59, 0.2) 50%, rgba(51, 65, 85, 0.3) 100%)',
          zIndex: 1,
        }}
      />



      {/* Main Content */}
      <Container maxWidth="xl" sx={{ 
        position: 'relative', 
        zIndex: 2, 
        py: { xs: 2, sm: 3, md: 4 }, 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ width: '100%', maxWidth: '1200px' }}
        >
          {/* Header with Logo */}
          <motion.div variants={itemVariants}>
            <Box sx={{ textAlign: 'center', mb: { xs: 1, sm: 2 } }}>
                              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
              >
                <Box
                  component="img"
                  src={logo}
                  alt="EDULIVES Logo"
                  sx={{
                    height: { xs: 100, sm: 120, md: 150, lg: 180 },
                    width: 'auto',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    mb: { xs: 1, sm: 2 },
                    filter: 'drop-shadow(0 12px 24px rgba(0, 0, 0, 0.4))',
                    display: 'block',
                    margin: '0 auto',
                    cursor: 'pointer',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '-10px',
                      left: '-10px',
                      right: '-10px',
                      bottom: '-10px',
                      background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)',
                      borderRadius: '20px',
                      zIndex: -1,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    },
                    '&:hover::before': {
                      opacity: 0.3,
                    }
                  }}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.95)',
                    fontWeight: 600,
                    mb: { xs: 2, sm: 3 },
                    fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.7rem', lg: '1.9rem' },
                    textAlign: 'center',
                    textShadow: '0 3px 6px rgba(0, 0, 0, 0.4)',
                    letterSpacing: '0.8px',
                    lineHeight: 1.3,
                    fontFamily: '"Inter", "Roboto", sans-serif',
                    background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #cbd5e1 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    position: 'relative',
                    textTransform: 'uppercase',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '-10px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '80px',
                      height: '3px',
                      background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)',
                      borderRadius: '2px',
                      opacity: 0.9,
                      animation: 'shimmer 2s ease-in-out infinite'
                    }
                  }}
                >
                  Your comprehensive educational management platform
                </Typography>
              </motion.div>
            </Box>
          </motion.div>

          {/* Main Login Section */}
          <motion.div variants={itemVariants}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                gap: { xs: 2, sm: 3, lg: 4 },
                maxWidth: 1200,
                mx: 'auto',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: { xs: '60vh', sm: '65vh', md: '70vh' },
                position: 'relative',
                zIndex: 2,
                width: '100%'
              }}
            >
              {/* Left Section - Branding & Info */}
              <motion.div
                variants={itemVariants}
                sx={{
                  flex: 1,
                  display: { xs: 'none', lg: 'flex' },
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  color: 'black'
                }}
              >
                <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 800,
                      mb: { xs: 2, sm: 3 },
                      fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem', lg: '3.5rem' },
                      background: 'linear-gradient(135deg, #fff 0%, #e2e8f0 50%, #cbd5e1 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textAlign: 'center',
                      textShadow: '0 4px 8px rgba(0, 0, 0, 0.4)',
                      letterSpacing: '0.5px',
                      lineHeight: 1.1
                    }}
                  >
                    Transforming Education
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: 400,
                      mb: { xs: 2, sm: 3, md: 4 },
                      fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem', lg: '1.8rem' },
                      textAlign: 'center',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                      letterSpacing: '0.2px',
                      lineHeight: 1.2,
                      fontStyle: 'italic',
                      fontFamily: '"Playfair Display", "Georgia", serif',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: '-15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '2px',
                        height: '70%',
                        background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899)',
                        borderRadius: '1px',
                        animation: 'cursorBlink 2s infinite',
                        opacity: 0,
                        transition: 'opacity 0.3s ease'
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        right: '-15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '2px',
                        height: '70%',
                        background: 'linear-gradient(45deg, #ec4899, #8b5cf6, #3b82f6)',
                        borderRadius: '1px',
                        animation: 'cursorBlink 2s infinite 1s',
                        opacity: 0,
                        transition: 'opacity 0.3s ease'
                      },
                      '&:hover::before': {
                        opacity: 1
                      },
                      '&:hover::after': {
                        opacity: 1
                      },
                      '@keyframes cursorBlink': {
                        '0%, 50%': {
                          opacity: 1,
                          transform: 'translateY(-50%) scaleY(1)'
                        },
                        '51%, 100%': {
                          opacity: 0.3,
                          transform: 'translateY(-50%) scaleY(0.8)'
                        }
                      }
                    }}
                  >
                    Next Generation Learning Platform
                  </Typography>
                </Box>
              </motion.div>

              {/* Right Section - Login Form */}
              <motion.div
                variants={itemVariants}
                sx={{
                  flex: 1,
                  maxWidth: 500,
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                  style={{
                    width: '100%',
                    maxWidth: '500px',
                    margin: '0 auto'
                  }}
                >
                  <Box
                    sx={{
                      p: { xs: 3, sm: 4 },
                      borderRadius: 4,
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                      position: 'relative',
                      overflow: 'hidden',
                      width: '100%',
                      maxWidth: { xs: '100%', sm: '500px', md: '550px' },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, rgba(30, 144, 255, 0.15) 0%, rgba(30, 144, 255, 0.1) 30%, rgba(255, 193, 7, 0.15) 45%, rgba(255, 193, 7, 0.1) 55%, rgba(76, 175, 80, 0.1) 70%, rgba(76, 175, 80, 0.15) 100%)',
                        borderRadius: 'inherit',
                        zIndex: 0,
                      }
                    }}
                  >
                    {/* Modern Sign In Heading */}
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                                              color: 'rgba(0, 0, 0, 0.9)',
                      mb: 1,
                      textAlign: 'center',
                      fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
                      textShadow: '0 2px 4px rgba(255, 255, 255, 0.3)',
                        letterSpacing: '0.5px',
                        fontFamily: '"Inter", "Roboto", sans-serif',
                        position: 'relative',
                        zIndex: 1
                      }}
                    >
                      Welcome Back
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        color: 'rgba(0, 0, 0, 0.7)',
                        mb: 3,
                        textAlign: 'center',
                        fontWeight: 400,
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        fontFamily: '"Inter", "Roboto", sans-serif',
                        position: 'relative',
                        zIndex: 1
                      }}
                    >
                      Choose your portal to continue
                    </Typography>

                    {/* Sleek User Type Selection */}
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: { xs: 1.5, sm: 2 },
                      position: 'relative',
                      zIndex: 1
                    }}>
                      {userTypes.map((userType, index) => (
                        <motion.div
                          key={userType.id}
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          whileHover={{ 
                            scale: 1.01,
                            x: 5,
                            transition: { duration: 0.2 }
                          }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <Button
                            fullWidth
                            onClick={() => handleUserTypeSelect(userType.id)}
                            sx={{
                              py: { xs: 2, sm: 2.5 },
                              px: { xs: 3, sm: 4 },
                              borderRadius: 3,
                              background: 'rgba(255, 255, 255, 0.2)',
                              backdropFilter: 'blur(15px)',
                              border: '1px solid rgba(255, 255, 255, 0.4)',
                              color: 'rgba(0, 0, 0, 0.9)',
                              fontWeight: 600,
                              textTransform: 'none',
                              fontSize: { xs: '1rem', sm: '1.1rem' },
                              height: 'auto',
                              minHeight: { xs: '60px', sm: '70px' },
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-start',
                              gap: { xs: 2, sm: 3 },
                              position: 'relative',
                              overflow: 'hidden',
                              fontFamily: '"Inter", "Roboto", sans-serif',
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: `linear-gradient(135deg, ${userType.color}20 0%, ${userType.color}10 100%)`,
                                opacity: 0,
                                transition: 'opacity 0.3s ease',
                              },
                              '&:hover': {
                                background: 'rgba(255, 255, 255, 0.25)',
                                borderColor: 'rgba(255, 255, 255, 0.4)',
                                transform: 'translateY(-1px)',
                                boxShadow: `0 6px 20px ${userType.color}30`,
                                '&::before': {
                                  opacity: 1,
                                }
                              }
                            }}
                          >
                            <Box sx={{ 
                              fontSize: { xs: '1.5rem', sm: '1.8rem' },
                              color: userType.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: { xs: 40, sm: 45 },
                              height: { xs: 40, sm: 45 },
                              borderRadius: '50%',
                              background: 'rgba(255, 255, 255, 0.2)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              mr: { xs: 1.5, sm: 2 }
                            }}>
                              <userType.icon />
                            </Box>
                            <Box sx={{ textAlign: 'left', flex: 1 }}>
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  fontWeight: 700,
                                  color: 'rgba(0, 0, 0, 0.9)',
                                  mb: 0.5,
                                  fontSize: { xs: '1rem', sm: '1.1rem' }
                                }}
                              >
                                {userType.label}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: 'rgba(0, 0, 0, 0.6)',
                                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                  fontWeight: 400
                                }}
                              >
                                {userType.description}
                              </Typography>
                            </Box>
                            <Box sx={{ 
                              fontSize: { xs: '1.2rem', sm: '1.4rem' },
                              color: 'rgba(0, 0, 0, 0.5)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                color: 'rgba(0, 0, 0, 0.8)',
                                transform: 'translateX(3px)',
                              }
                            }}>
                              →
                            </Box>
                          </Button>
                        </motion.div>
                      ))}
                    </Box>
                  </Box>
                </motion.div>
                </motion.div>
            </Box>
          </motion.div>
        </motion.div>
      </Container>

      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0
        }}
      >
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              x: [0, 150, 0],
              y: [0, -150, 0],
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 25 + i * 3,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              position: 'absolute',
              width: 6 + i * 3,
              height: 6 + i * 3,
              background: `rgba(255, 255, 255, ${0.15 - i * 0.01})`,
              borderRadius: '50%',
              left: `${15 + i * 12}%`,
              top: `${25 + i * 8}%`,
              filter: 'blur(1px)',
            }}
          />
        ))}
        
        {/* Floating Icons */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`icon-${i}`}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              position: 'absolute',
              left: `${10 + i * 15}%`,
              top: `${40 + i * 10}%`,
              color: 'rgba(255, 255, 255, 0.1)',
              fontSize: 24 + i * 4,
            }}
          >
            {i % 4 === 0 ? <School /> :
             i % 4 === 1 ? <People /> :
             i % 4 === 2 ? <Business /> :
             <AccountBalance />}
          </motion.div>
        ))}
      </Box>
    </Box>
  );
};

export default Home; 