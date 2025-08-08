import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Grid, Typography, useTheme, useMediaQuery } from '@mui/material';
import GlassmorphismCard from './GlassmorphismCard';

const ModernDashboardLayout = ({ 
  children, 
  title = "Dashboard",
  subtitle,
  stats = [],
  quickActions = [],
  recentActivity = [],
  isLoading = false,
  sx = {}
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  // Background gradient
  const backgroundGradient = isDark
    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: backgroundGradient,
        backgroundAttachment: 'fixed',
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
            ? 'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.05) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)',
          pointerEvents: 'none'
        },
        ...sx
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, pb: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                background: isDark 
                  ? 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)'
                  : 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                mb: subtitle ? 1 : 0,
                textAlign: { xs: 'center', md: 'left' }
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="h6"
                sx={{
                  color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 65, 81, 0.7)',
                  fontWeight: 400,
                  textAlign: { xs: 'center', md: 'left' },
                  fontSize: { xs: '1rem', sm: '1.125rem' }
                }}
              >
                {subtitle}
              </Typography>
            )}
          </motion.div>
        </Box>

        {/* Stats Grid */}
        {stats.length > 0 && (
          <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, pt: 0 }}>
            <Grid container spacing={3}>
              {stats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <GlassmorphismCard
                    title={stat.title}
                    value={stat.value}
                    subtitle={stat.subtitle}
                    icon={stat.icon}
                    color={stat.color || 'primary'}
                    trend={stat.trend}
                    trendValue={stat.trendValue}
                    showTrend={stat.showTrend}
                    showProgress={stat.showProgress}
                    progressValue={stat.progressValue}
                    progressColor={stat.progressColor}
                    size={stat.size || 'medium'}
                    delay={index * 0.1}
                    onClick={stat.onClick}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Main Content */}
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, pt: 0 }}>
          <Grid container spacing={3}>
            {/* Main Content Area */}
            <Grid item xs={12} lg={quickActions.length > 0 ? 8 : 12}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {children}
              </motion.div>
            </Grid>

            {/* Quick Actions Sidebar */}
            {quickActions.length > 0 && (
              <Grid item xs={12} lg={4}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: isDark ? '#f1f5f9' : '#1e293b',
                        mb: 2,
                        fontSize: { xs: '1.125rem', sm: '1.25rem' }
                      }}
                    >
                      Quick Actions
                    </Typography>
                    <Grid container spacing={2}>
                      {quickActions.map((action, index) => (
                        <Grid item xs={12} sm={6} lg={12} key={index}>
                          <GlassmorphismCard
                            title={action.title}
                            subtitle={action.subtitle}
                            icon={action.icon}
                            color={action.color || 'info'}
                            size="small"
                            delay={0.5 + index * 0.1}
                            onClick={action.onClick}
                            sx={{ height: '100%' }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </motion.div>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Recent Activity Section */}
        {recentActivity.length > 0 && (
          <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, pt: 0 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: isDark ? '#f1f5f9' : '#1e293b',
                  mb: 3,
                  fontSize: { xs: '1.125rem', sm: '1.25rem' }
                }}
              >
                Recent Activity
              </Typography>
              <Grid container spacing={2}>
                {recentActivity.map((activity, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <GlassmorphismCard
                      title={activity.title}
                      subtitle={activity.subtitle}
                      icon={activity.icon}
                      color={activity.color || 'secondary'}
                      size="small"
                      delay={0.7 + index * 0.1}
                      onClick={activity.onClick}
                      sx={{ height: '100%' }}
                    />
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          </Box>
        )}
      </motion.div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}
          >
            <Box
              sx={{
                background: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: 4,
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
              }}
            >
              <div className="loading-spinner" />
              <Typography
                variant="body1"
                sx={{
                  color: isDark ? '#f1f5f9' : '#1e293b',
                  fontWeight: 500
                }}
              >
                Loading...
              </Typography>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSS for loading spinner */}
      <style jsx>{`
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
          border-top: 3px solid ${theme.palette.primary.main};
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  );
};

export default ModernDashboardLayout;
