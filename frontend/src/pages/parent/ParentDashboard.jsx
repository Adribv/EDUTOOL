import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Avatar,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  School,
  Assignment,
  Payment,
  Event,
  Message,
  Assessment,
  Timeline,
  Person,
  Notifications,
  CalendarToday,
  LocationOn,
  AccessTime,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Info,
} from '@mui/icons-material';
import { parentAPI } from '../../services/api';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';

const StatCard = ({ title, value, icon, color, onClick, subtitle, trend }) => {
  const { isDark } = useCustomTheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: isDark 
          ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' 
          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
        '&:hover': {
          transform: onClick ? 'translateY(-4px)' : 'none',
          boxShadow: onClick 
            ? (isDark ? '0 8px 25px rgba(0, 0, 0, 0.4)' : '0 8px 25px rgba(0, 0, 0, 0.15)')
            : (isDark ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.1)'),
        }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: isMobile ? 2 : 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={isMobile ? 1.5 : 2}>
          <Box display="flex" alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ 
              p: isMobile ? 1 : 1.5, 
              borderRadius: 2, 
              background: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.1)',
              mr: isMobile ? 1.5 : 2,
              flexShrink: 0
            }}>
              {icon}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant={isMobile ? "body1" : "h6"} component="div" sx={{ 
                fontWeight: 600,
                color: isDark ? '#f1f5f9' : '#1e293b',
                mb: 0.5,
                fontSize: isMobile ? '0.875rem' : '1rem'
              }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="caption" sx={{ 
                  color: isDark ? '#94a3b8' : '#64748b',
                  fontWeight: 500,
                  fontSize: isMobile ? '0.7rem' : '0.75rem'
                }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
          {trend && (
            <Chip 
              icon={trend === 'up' ? <TrendingUp /> : <TrendingDown />}
              label={trend === 'up' ? '+12%' : '-5%'}
              size="small"
              color={trend === 'up' ? 'success' : 'error'}
              sx={{ 
                background: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                border: isDark ? '1px solid #10b981' : '1px solid #10b981',
                fontSize: isMobile ? '0.6rem' : '0.75rem',
                height: isMobile ? 20 : 24
              }}
            />
          )}
        </Box>
        <Typography variant={isMobile ? "h4" : "h3"} component="div" sx={{ 
          color: color || (isDark ? '#60a5fa' : '#2563eb'),
          fontWeight: 800,
          textAlign: 'center',
          textShadow: isDark ? '0 2px 4px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
          fontSize: isMobile ? '1.75rem' : '3rem'
        }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

const ParentDashboard = () => {
  const [selectedChild, setSelectedChild] = useState(null);
  const { isDark } = useCustomTheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const { data: children, isLoading: childrenLoading, error: childrenError } = useQuery({
    queryKey: ['parent_children'],
    queryFn: parentAPI.getChildren,
    onSuccess: (data) => {
      if (data && data.length > 0) {
        setSelectedChild(data[0]);
      }
    }
  });

  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery({
    queryKey: ['parent_dashboard'],
    queryFn: parentAPI.getDashboard,
    enabled: !!children && children.length > 0,
  });
  
  const handleChildChange = (event, newValue) => {
    setSelectedChild(children[newValue]);
  };

  const isLoading = childrenLoading || dashboardLoading;
  const error = childrenError || dashboardError;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error">
          Failed to load dashboard data: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 },
      maxWidth: '100%',
      overflow: 'hidden'
    }}>
      {/* Modern Header */}
      <Box sx={{ 
        mb: { xs: 2, sm: 3, md: 4 }, 
        p: { xs: 2, sm: 3, md: 4 }, 
        background: isDark 
          ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' 
          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: { xs: 2, sm: 3 }, 
        boxShadow: isDark 
          ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
          : '0 4px 6px rgba(0, 0, 0, 0.05)',
        border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
        borderLeft: `4px solid ${isDark ? '#3b82f6' : '#2563eb'}`
      }}>
        <Typography 
          variant={isMobile ? "h4" : "h3"} 
          gutterBottom 
          sx={{ 
            fontWeight: 800,
            color: isDark ? '#f1f5f9' : '#1e293b',
            textShadow: isDark ? '0 2px 4px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
            mb: 1,
            fontSize: isMobile ? '1.5rem' : '2.5rem'
          }}
        >
          Parent Dashboard
        </Typography>
        <Typography 
          variant={isMobile ? "body1" : "h6"} 
          sx={{ 
            color: isDark ? '#cbd5e1' : '#64748b',
            fontWeight: 500,
            lineHeight: 1.6,
            fontSize: isMobile ? '0.875rem' : '1rem'
          }}
        >
          Welcome back, <strong style={{ color: isDark ? '#60a5fa' : '#2563eb' }}>Gokulpriyan Karthikeyan</strong>. 
          Monitor your children's progress and manage school-related activities.
        </Typography>
      </Box>

      {/* Child Selector */}
      {children && children.length > 0 && (
        <Paper elevation={0} sx={{ 
          mb: { xs: 2, sm: 3, md: 4 }, 
          p: { xs: 2, sm: 3 }, 
          borderRadius: { xs: 2, sm: 3 },
          background: isDark 
            ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' 
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
          boxShadow: isDark 
            ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
            : '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <Typography variant={isMobile ? "h6" : "h6"} sx={{ 
            mb: { xs: 1.5, sm: 2 }, 
            fontWeight: 600,
            color: isDark ? '#f1f5f9' : '#1e293b',
            fontSize: isMobile ? '1rem' : '1.125rem'
          }}>
            Select Child
          </Typography>
          <Tabs
            value={Math.max(0, children.findIndex(c => c._id === selectedChild?._id))}
            onChange={handleChildChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="child selector"
            sx={{
              '& .MuiTab-root': {
                color: isDark ? '#94a3b8' : '#64748b',
                fontWeight: 500,
                textTransform: 'none',
                minHeight: isMobile ? 48 : 64,
                borderRadius: 2,
                mx: 0.5,
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                '&.Mui-selected': {
                  color: isDark ? '#60a5fa' : '#2563eb',
                  background: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.1)',
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: isDark ? '#3b82f6' : '#2563eb',
                height: 3,
                borderRadius: 1.5
              }
            }}
          >
            {children.map(child => (
              <Tab 
                key={`child-tab-${child._id}`}
                label={
                  <Box display="flex" alignItems="center" sx={{ flexDirection: isMobile ? 'column' : 'row' }}>
                    <Avatar sx={{ 
                      width: isMobile ? 24 : 32, 
                      height: isMobile ? 24 : 32, 
                      mr: isMobile ? 0 : 1.5,
                      mb: isMobile ? 0.5 : 0,
                      border: isDark ? '2px solid #475569' : '2px solid #e2e8f0'
                    }} src={child.profilePhoto}>
                      {child.name.charAt(0)}
                    </Avatar>
                    <Typography sx={{ 
                      fontWeight: 600,
                      fontSize: isMobile ? '0.7rem' : '0.875rem',
                      textAlign: isMobile ? 'center' : 'left'
                    }}>
                      {child.name}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Paper>
      )}

      {selectedChild && dashboardData && (
        <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
          {/* Quick Stats */}
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Total Children"
              value={dashboardData.totalChildren || 0}
              icon={<Person sx={{ color: isDark ? '#60a5fa' : '#2563eb' }} />}
              color={isDark ? '#60a5fa' : '#2563eb'}
              subtitle="Registered children"
              trend="up"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Announcements"
              value={dashboardData.announcements?.length || 0}
              icon={<Notifications sx={{ color: isDark ? '#f59e0b' : '#f59e0b' }} />}
              color={isDark ? '#fbbf24' : '#f59e0b'}
              subtitle="New notifications"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Upcoming Events"
              value={dashboardData.upcomingEvents?.length || 0}
              icon={<Event sx={{ color: isDark ? '#10b981' : '#10b981' }} />}
              color={isDark ? '#34d399' : '#10b981'}
              subtitle="This month"
              trend="up"
            />
          </Grid>

          {/* Selected Child Details */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ 
              height: '100%',
              background: isDark 
                ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' 
                : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
              boxShadow: isDark 
                ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
                : '0 4px 6px rgba(0, 0, 0, 0.05)'
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant={isMobile ? "h6" : "h6"} gutterBottom sx={{ 
                  fontWeight: 600,
                  color: isDark ? '#f1f5f9' : '#1e293b',
                  mb: { xs: 2, sm: 3 },
                  fontSize: isMobile ? '1rem' : '1.125rem'
                }}>
                  Selected Child Details
                </Typography>
                <Box display="flex" alignItems="center" mb={3} sx={{ 
                  flexDirection: isMobile ? 'column' : 'row',
                  textAlign: isMobile ? 'center' : 'left'
                }}>
                  <Avatar 
                    src={selectedChild.profilePhoto} 
                    sx={{ 
                      width: isMobile ? 56 : 64, 
                      height: isMobile ? 56 : 64, 
                      mr: isMobile ? 0 : 3,
                      mb: isMobile ? 2 : 0,
                      border: isDark ? '3px solid #475569' : '3px solid #e2e8f0'
                    }}
                  >
                    {selectedChild.name.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant={isMobile ? "h6" : "h5"} sx={{ 
                      fontWeight: 700,
                      color: isDark ? '#f1f5f9' : '#1e293b',
                      mb: 1,
                      fontSize: isMobile ? '1.125rem' : '1.5rem'
                    }}>
                      {selectedChild.name}
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap" sx={{ 
                      justifyContent: isMobile ? 'center' : 'flex-start'
                    }}>
                      <Chip 
                        label={`Roll: ${selectedChild.rollNumber}`}
                        size="small"
                        sx={{ 
                          background: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.1)',
                          color: isDark ? '#60a5fa' : '#2563eb',
                          border: isDark ? '1px solid #3b82f6' : '1px solid #2563eb',
                          fontSize: isMobile ? '0.6rem' : '0.75rem'
                        }}
                      />
                      <Chip 
                        label={`Class: ${selectedChild.class}`}
                        size="small"
                        sx={{ 
                          background: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                          color: isDark ? '#34d399' : '#10b981',
                          border: isDark ? '1px solid #10b981' : '1px solid #10b981',
                          fontSize: isMobile ? '0.6rem' : '0.75rem'
                        }}
                      />
                      <Chip 
                        label={`Section: ${selectedChild.section}`}
                        size="small"
                        sx={{ 
                          background: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)',
                          color: isDark ? '#fbbf24' : '#f59e0b',
                          border: isDark ? '1px solid #f59e0b' : '1px solid #f59e0b',
                          fontSize: isMobile ? '0.6rem' : '0.75rem'
                        }}
                      />
                      <Chip 
                        label="Active"
                        size="small"
                        color="success"
                        sx={{ 
                          background: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                          border: isDark ? '1px solid #10b981' : '1px solid #10b981',
                          fontSize: isMobile ? '0.6rem' : '0.75rem'
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
                
                {/* Quick Actions */}
                <Box display="flex" gap={1} flexWrap="wrap" sx={{ 
                  justifyContent: isMobile ? 'center' : 'flex-start'
                }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<Assessment />}
                    size={isMobile ? "small" : "medium"}
                    sx={{ 
                      borderColor: isDark ? '#475569' : '#e2e8f0',
                      color: isDark ? '#f1f5f9' : '#1e293b',
                      fontSize: isMobile ? '0.7rem' : '0.875rem',
                      '&:hover': {
                        borderColor: isDark ? '#60a5fa' : '#2563eb',
                        background: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.1)'
                      }
                    }}
                  >
                    View Progress
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<Payment />}
                    size={isMobile ? "small" : "medium"}
                    sx={{ 
                      borderColor: isDark ? '#475569' : '#e2e8f0',
                      color: isDark ? '#f1f5f9' : '#1e293b',
                      fontSize: isMobile ? '0.7rem' : '0.875rem',
                      '&:hover': {
                        borderColor: isDark ? '#60a5fa' : '#2563eb',
                        background: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.1)'
                      }
                    }}
                  >
                    Pay Fees
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<Message />}
                    size={isMobile ? "small" : "medium"}
                    sx={{ 
                      borderColor: isDark ? '#475569' : '#e2e8f0',
                      color: isDark ? '#f1f5f9' : '#1e293b',
                      fontSize: isMobile ? '0.7rem' : '0.875rem',
                      '&:hover': {
                        borderColor: isDark ? '#60a5fa' : '#2563eb',
                        background: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.1)'
                      }
                    }}
                  >
                    Contact Teacher
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* All Your Children */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ 
              height: '100%',
              background: isDark 
                ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' 
                : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
              boxShadow: isDark 
                ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
                : '0 4px 6px rgba(0, 0, 0, 0.05)'
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant={isMobile ? "h6" : "h6"} gutterBottom sx={{ 
                  fontWeight: 600,
                  color: isDark ? '#f1f5f9' : '#1e293b',
                  mb: { xs: 2, sm: 3 },
                  fontSize: isMobile ? '1rem' : '1.125rem'
                }}>
                  All Your Children
                </Typography>
                <List sx={{ p: 0 }}>
                  {children.map((child, index) => (
                    <ListItem 
                      key={child._id} 
                      sx={{ 
                        mb: 1,
                        borderRadius: 2,
                        background: selectedChild?._id === child._id 
                          ? (isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.1)')
                          : 'transparent',
                        border: selectedChild?._id === child._id
                          ? (isDark ? '1px solid #3b82f6' : '1px solid #2563eb')
                          : '1px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        p: isMobile ? 1 : 1.5,
                        '&:hover': {
                          background: isDark 
                            ? 'rgba(59, 130, 246, 0.15)' 
                            : 'rgba(37, 99, 235, 0.08)',
                        }
                      }}
                      onClick={() => setSelectedChild(child)}
                    >
                      <ListItemIcon sx={{ minWidth: isMobile ? 40 : 48 }}>
                        <Avatar 
                          src={child.profilePhoto}
                          sx={{ 
                            width: isMobile ? 32 : 40,
                            height: isMobile ? 32 : 40,
                            border: isDark ? '2px solid #475569' : '2px solid #e2e8f0'
                          }}
                        >
                          {child.name.charAt(0)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText 
                        primary={child.name}
                        secondary={`Class ${child.class}-${child.section}`}
                        sx={{
                          '& .MuiTypography-root': {
                            color: isDark ? '#f1f5f9' : '#1e293b',
                            fontWeight: selectedChild?._id === child._id ? 600 : 500,
                            fontSize: isMobile ? '0.875rem' : '1rem'
                          },
                          '& .MuiTypography-body2': {
                            color: isDark ? '#94a3b8' : '#64748b',
                            fontSize: isMobile ? '0.7rem' : '0.875rem'
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ParentDashboard; 