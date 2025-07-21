import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Grid,
  Paper,
  Typography,
  useTheme,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Avatar,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  AppBar,
  Toolbar,
  Breadcrumbs,
  Link,
  Alert,
  AlertTitle,
  CircularProgress
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Security as SecurityIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  AccountCircle,
  Logout as LogoutIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  LibraryBooks as LibraryIcon,
  Psychology as PsychologyIcon,
  SportsSoccer as SportsIcon,
  Event as EventIcon,
  DirectionsBus as TransportIcon,
  EmojiEvents as AchievementIcon,
  SwapHoriz as SwapIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Notifications as NotificationIcon,
  Inventory as InventoryIcon,
  School as SchoolIcon,
  RateReview as RateReviewIcon,
  Feedback as FeedbackIcon,
  Message as MessageIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import {
  XAxis,
  YAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useStaffPermissions } from '../../context/StaffPermissionContext';
import { accountantAPI } from '../../services/api';
import A_ServiceRequests from './A_ServiceRequests';

// Role Icons and Colors Mapping
const roleIcons = {
  librarian: LibraryIcon,
  counselor: PsychologyIcon,
  ptteacher: SportsIcon,
  eventhandler: EventIcon,
  transportmanager: TransportIcon,
  softskillsmanager: AchievementIcon,
  admin: AdminIcon
};

const roleColors = {
  librarian: '#1976d2',
  counselor: '#388e3c',
  ptteacher: '#f57c00',
  eventhandler: '#7b1fa2',
  transportmanager: '#d32f2f',
  softskillsmanager: '#ff6f00',
  admin: '#424242'
};

// Animated Stat Card Component
const AnimatedStatCard = ({ icon: Icon, label, value, color, subtitle, trend, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ scale: 1.02, y: -5 }}
  >
    <Paper 
      elevation={6} 
      sx={{ 
        p: 3, 
        borderRadius: 3, 
        background: `linear-gradient(135deg, ${color}15, ${color}05)`,
        border: `1px solid ${color}20`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ position: 'absolute', top: 0, right: 0, p: 1 }}>
        <Icon sx={{ fontSize: 40, color: `${color}40` }} />
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>{label}</Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: color }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            {subtitle}
          </Typography>
        )}
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            {trend > 0 ? (
              <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main', mr: 0.5 }} />
            )}
            <Typography variant="body2" sx={{ color: trend > 0 ? 'success.main' : 'error.main' }}>
              {Math.abs(trend)}% from last month
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  </motion.div>
);

// Staff Card Component
const StaffCard = ({ staff, onEdit, onDelete, onView, onToggleRole, onTogglePermission }) => {
  const theme = useTheme();
  const RoleIcon = roleIcons[staff.primaryRole] || PersonIcon;
  const roleColor = roleColors[staff.primaryRole] || theme.palette.grey[500];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: roleColor, 
                mr: 2,
                width: 56,
                height: 56
              }}
            >
              <RoleIcon />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {staff.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {staff.email}
              </Typography>
            </Box>
            <Chip 
              label={staff.primaryRole} 
              size="small" 
              sx={{ 
                bgcolor: `${roleColor}20`, 
                color: roleColor,
                fontWeight: 600
              }} 
            />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Department: {staff.department}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Joined: {new Date(staff.joinDate).toLocaleDateString()}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Assigned Roles:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {staff.assignedRoles.map((role) => (
                <Chip
                  key={role}
                  label={role}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    borderColor: roleColors[role] || theme.palette.grey[400],
                    color: roleColors[role] || theme.palette.grey[600]
                  }}
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
            <IconButton size="small" onClick={() => onView(staff)}>
              <ViewIcon />
            </IconButton>
            <IconButton size="small" onClick={() => onEdit(staff)}>
              <EditIcon />
            </IconButton>
            <IconButton size="small" onClick={() => onToggleRole(staff)}>
              <SwapIcon />
            </IconButton>
            <IconButton size="small" onClick={() => onTogglePermission(staff)}>
              <SecurityIcon />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(staff._id)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Role Permission Manager Component
const RolePermissionManager = ({ staff, open, onClose, onSave }) => {
  const theme = useTheme();
  const [selectedRoles, setSelectedRoles] = useState(staff?.assignedRoles || []);

  const allRoles = [
    { key: 'librarian', label: 'Librarian', icon: LibraryIcon, description: 'Manage library resources and book borrowing' },
    { key: 'counselor', label: 'Mental Wellness Counselor', icon: PsychologyIcon, description: 'Provide mental health support and counseling' },
    { key: 'ptteacher', label: 'PT Teacher', icon: SportsIcon, description: 'Manage sports events and fitness assessments' },
    { key: 'eventhandler', label: 'Event Handler', icon: EventIcon, description: 'Organize and manage school events' },
    { key: 'transportmanager', label: 'Transport Manager', icon: TransportIcon, description: 'Manage transportation and routes' },
    { key: 'softskillsmanager', label: 'Soft Skills Manager', icon: AchievementIcon, description: 'Track soft skills and achievements' }
  ];

  const handleRoleToggle = (roleKey) => {
    setSelectedRoles(prev => 
      prev.includes(roleKey) 
        ? prev.filter(r => r !== roleKey)
        : [...prev, roleKey]
    );
  };

  const handleSave = () => {
    onSave(staff._id, selectedRoles);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon color="primary" />
          <Typography variant="h6">Role Permission Management</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Managing roles for {staff?.name}
        </Typography>
      </DialogTitle>
      
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>Role Assignment</AlertTitle>
          Select the roles you want to assign to this staff member. They will have access to the corresponding dashboards and features.
        </Alert>

        <Typography variant="h6" sx={{ mb: 2 }}>Available Roles</Typography>
        <Grid container spacing={2}>
          {allRoles.map((role) => {
            const RoleIcon = role.icon;
            const isSelected = selectedRoles.includes(role.key);
            
            return (
              <Grid item xs={12} sm={6} key={role.key}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: isSelected ? `2px solid ${roleColors[role.key]}` : '2px solid transparent',
                    bgcolor: isSelected ? `${roleColors[role.key]}10` : 'background.paper',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: roleColors[role.key],
                      bgcolor: `${roleColors[role.key]}05`
                    }
                  }}
                  onClick={() => handleRoleToggle(role.key)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <RoleIcon sx={{ color: roleColors[role.key], mr: 1 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {role.label}
                      </Typography>
                      {isSelected && (
                        <CheckIcon sx={{ color: roleColors[role.key], ml: 'auto' }} />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {role.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Permission Management Component
const PermissionManager = ({ staff, open, onClose, onSave }) => {
  const theme = useTheme();
  const [permissions, setPermissions] = useState(staff?.permissions || {});

  const featureCategories = {
    inventory: {
      name: 'Inventory Management',
      icon: 'Inventory',
      color: '#1976d2',
      features: {
        view_inventory: { name: 'View Inventory', description: 'Browse and search inventory items' },
        manage_inventory: { name: 'Manage Inventory', description: 'Add, edit, and delete inventory items' },
        approve_requests: { name: 'Approve Requests', description: 'Approve inventory requests from staff' },
        generate_reports: { name: 'Generate Reports', description: 'Create inventory reports and analytics' }
      }
    },
    student_records: {
      name: 'Student Records',
      icon: 'School',
      color: '#388e3c',
      features: {
        view_students: { name: 'View Students', description: 'Browse student information' },
        edit_students: { name: 'Edit Students', description: 'Modify student records and details' },
        view_academics: { name: 'View Academics', description: 'Access academic records and grades' },
        manage_attendance: { name: 'Manage Attendance', description: 'Update and manage attendance records' }
      }
    },
    teacher_remarks: {
      name: 'Teacher Remarks',
      icon: 'RateReview',
      color: '#f57c00',
      features: {
        view_remarks: { name: 'View Remarks', description: 'Read teacher remarks and comments' },
        add_remarks: { name: 'Add Remarks', description: 'Create new teacher remarks' },
        edit_remarks: { name: 'Edit Remarks', description: 'Modify existing remarks' },
        approve_remarks: { name: 'Approve Remarks', description: 'Approve remarks before publication' }
      }
    },
    feedbacks: {
      name: 'Feedbacks',
      icon: 'Feedback',
      color: '#7b1fa2',
      features: {
        view_feedback: { name: 'View Feedback', description: 'Read feedback and suggestions' },
        respond_feedback: { name: 'Respond to Feedback', description: 'Reply to feedback messages' },
        manage_feedback: { name: 'Manage Feedback', description: 'Delete or archive feedback' },
        generate_reports: { name: 'Generate Reports', description: 'Create feedback analysis reports' }
      }
    },
    events: {
      name: 'Events',
      icon: 'Event',
      color: '#d32f2f',
      features: {
        view_events: { name: 'View Events', description: 'Browse upcoming and past events' },
        create_events: { name: 'Create Events', description: 'Schedule new events' },
        manage_events: { name: 'Manage Events', description: 'Edit and delete events' },
        approve_events: { name: 'Approve Events', description: 'Approve event proposals' }
      }
    },
    communication: {
      name: 'Communication',
      icon: 'Message',
      color: '#ff6f00',
      features: {
        send_messages: { name: 'Send Messages', description: 'Send messages to students and staff' },
        view_messages: { name: 'View Messages', description: 'Read received messages' },
        manage_announcements: { name: 'Manage Announcements', description: 'Create and edit announcements' },
        access_notifications: { name: 'Access Notifications', description: 'View and manage notifications' }
      }
    }
  };

  const handlePermissionToggle = (category, feature) => {
    setPermissions(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [feature]: !prev[category]?.[feature]
      }
    }));
  };

  const handleCategoryToggle = (category, enabled) => {
    const categoryFeatures = featureCategories[category].features;
    const newCategoryPermissions = {};
    
    Object.keys(categoryFeatures).forEach(feature => {
      newCategoryPermissions[feature] = enabled;
    });

    setPermissions(prev => ({
      ...prev,
      [category]: newCategoryPermissions
    }));
  };

  const handleSave = () => {
    onSave(staff._id, permissions);
    onClose();
  };

  const getCategoryStatus = (category) => {
    const categoryPermissions = permissions[category] || {};
    const totalFeatures = Object.keys(featureCategories[category].features).length;
    const enabledFeatures = Object.values(categoryPermissions).filter(Boolean).length;
    
    if (enabledFeatures === 0) return 'none';
    if (enabledFeatures === totalFeatures) return 'all';
    return 'partial';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon color="primary" />
          <Typography variant="h6">Permission Management</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Managing permissions for {staff?.name}
        </Typography>
      </DialogTitle>
      
      <DialogContent dividers sx={{ maxHeight: '70vh' }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>Permission Control</AlertTitle>
          Enable or disable specific features for this staff member. Changes will take effect immediately.
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {Object.entries(featureCategories).map(([categoryKey, category]) => {
            const categoryStatus = getCategoryStatus(categoryKey);
            const isAllEnabled = categoryStatus === 'all';
            const isPartialEnabled = categoryStatus === 'partial';
            
            return (
              <Card key={categoryKey} sx={{ border: `2px solid ${category.color}20` }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box 
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: '50%', 
                          bgcolor: category.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}
                      >
                        {category.icon === 'Inventory' && <InventoryIcon />}
                        {category.icon === 'School' && <SchoolIcon />}
                        {category.icon === 'RateReview' && <RateReviewIcon />}
                        {category.icon === 'Feedback' && <FeedbackIcon />}
                        {category.icon === 'Event' && <EventIcon />}
                        {category.icon === 'Message' && <MessageIcon />}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {category.name}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={categoryStatus === 'all' ? 'All Enabled' : categoryStatus === 'partial' ? 'Partial' : 'All Disabled'}
                        size="small"
                        color={categoryStatus === 'all' ? 'success' : categoryStatus === 'partial' ? 'warning' : 'default'}
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={isAllEnabled}
                            indeterminate={isPartialEnabled}
                            onChange={(e) => handleCategoryToggle(categoryKey, e.target.checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: category.color,
                                '&:hover': {
                                  backgroundColor: `${category.color}20`,
                                },
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: category.color,
                              },
                            }}
                          />
                        }
                        label=""
                      />
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Grid container spacing={2}>
                    {Object.entries(category.features).map(([featureKey, feature]) => (
                      <Grid item xs={12} sm={6} key={featureKey}>
                        <Box 
                          sx={{ 
                            p: 2, 
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 1,
                            bgcolor: permissions[categoryKey]?.[featureKey] ? `${category.color}05` : 'background.paper',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: permissions[categoryKey]?.[featureKey] ? `${category.color}10` : 'grey.50'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {feature.name}
                            </Typography>
                            <Switch
                              size="small"
                              checked={permissions[categoryKey]?.[featureKey] || false}
                              onChange={() => handlePermissionToggle(categoryKey, featureKey)}
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: category.color,
                                  '&:hover': {
                                    backgroundColor: `${category.color}20`,
                                  },
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: category.color,
                                },
                              }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {feature.description}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save Permissions
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Quick Actions Panel Component
const QuickActionsPanel = ({ onAction }) => {
  const theme = useTheme();
  
  const quickActions = [
    {
      title: 'Add Staff Member',
      icon: AddIcon,
      color: 'primary',
      action: 'add_staff',
      description: 'Register new staff member'
    },
    {
      title: 'Bulk Permissions',
      icon: SecurityIcon,
      color: 'warning',
      action: 'bulk_permissions',
      description: 'Manage permissions for multiple staff'
    },
    {
      title: 'System Settings',
      icon: SettingsIcon,
      color: 'info',
      action: 'system_settings',
      description: 'Configure system parameters'
    },
    {
      title: 'Generate Reports',
      icon: AssessmentIcon,
      color: 'success',
      action: 'generate_reports',
      description: 'Create comprehensive reports'
    }
  ];

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={2}>
        {quickActions.map((action) => {
          const ActionIcon = action.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={action.action}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: `2px solid ${theme.palette[action.color].main}20`,
                    '&:hover': {
                      borderColor: theme.palette[action.color].main,
                      boxShadow: theme.shadows[4]
                    }
                  }}
                  onClick={() => onAction(action.action)}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <ActionIcon 
                      sx={{ 
                        fontSize: 32, 
                        color: theme.palette[action.color].main,
                        mb: 1
                      }} 
                    />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {action.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
};

// Notification Center Component
const NotificationCenter = ({ notifications = [] }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const mockNotifications = [
    {
      id: 1,
      type: 'info',
      title: 'New Staff Registration',
      message: 'Sarah Johnson has been registered as a counselor',
      time: '2 minutes ago',
      read: false
    },
    {
      id: 2,
      type: 'warning',
      title: 'Permission Update',
      message: 'Library permissions updated for 3 staff members',
      time: '15 minutes ago',
      read: false
    },
    {
      id: 3,
      type: 'success',
      title: 'System Backup',
      message: 'Daily backup completed successfully',
      time: '1 hour ago',
      read: true
    }
  ];

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'info': return <InfoIcon />;
      case 'warning': return <WarningIcon />;
      case 'success': return <CheckCircleIcon />;
      case 'error': return <ErrorIcon />;
      default: return <InfoIcon />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'info': return theme.palette.info.main;
      case 'warning': return theme.palette.warning.main;
      case 'success': return theme.palette.success.main;
      case 'error': return theme.palette.error.main;
      default: return theme.palette.info.main;
    }
  };

  return (
    <>
      <IconButton 
        onClick={() => setOpen(true)}
        sx={{ position: 'relative' }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationIcon />
        </Badge>
      </IconButton>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Notifications</Typography>
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <List sx={{ p: 0 }}>
            {mockNotifications.map((notification) => (
              <ListItem 
                key={notification.id}
                sx={{ 
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  bgcolor: notification.read ? 'transparent' : `${getNotificationColor(notification.type)}05`
                }}
              >
                <ListItemIcon>
                  <Box 
                    sx={{ 
                      color: getNotificationColor(notification.type),
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                      {notification.title}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {notification.time}
                      </Typography>
                    </Box>
                  }
                />
                {!notification.read && (
                  <Box 
                    sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      bgcolor: getNotificationColor(notification.type) 
                    }} 
                  />
                )}
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
          <Button variant="contained">Mark All Read</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// System Health Monitor Component
const SystemHealthMonitor = () => {
  const theme = useTheme();
  
  const systemMetrics = [
    { label: 'CPU Usage', value: 45, color: 'success' },
    { label: 'Memory Usage', value: 72, color: 'warning' },
    { label: 'Disk Space', value: 38, color: 'success' },
    { label: 'Network', value: 89, color: 'error' }
  ];

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        System Health Monitor
      </Typography>
      <Grid container spacing={2}>
        {systemMetrics.map((metric) => (
          <Grid item xs={12} sm={6} md={3} key={metric.label}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                color: theme.palette[metric.color].main 
              }}>
                {metric.value}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {metric.label}
              </Typography>
              <Box sx={{ 
                width: '100%', 
                height: 4, 
                bgcolor: theme.palette.grey[200], 
                borderRadius: 2,
                mt: 1,
                overflow: 'hidden'
              }}>
                <Box sx={{ 
                  width: `${metric.value}%`, 
                  height: '100%', 
                  bgcolor: theme.palette[metric.color].main,
                  transition: 'width 0.3s ease'
                }} />
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

// Recent Activity Feed Component
const RecentActivityFeed = () => {
  const theme = useTheme();
  
  const activities = [
    {
      id: 1,
      user: 'John Smith',
      action: 'updated permissions for',
      target: 'Sarah Johnson',
      time: '2 minutes ago',
      type: 'permission'
    },
    {
      id: 2,
      user: 'Admin',
      action: 'added new staff member',
      target: 'Mike Wilson',
      time: '15 minutes ago',
      type: 'staff'
    },
    {
      id: 3,
      user: 'System',
      action: 'performed backup',
      target: 'database',
      time: '1 hour ago',
      type: 'system'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'permission': return <SecurityIcon />;
      case 'staff': return <PersonIcon />;
      case 'system': return <SettingsIcon />;
      default: return <InfoIcon />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'permission': return theme.palette.warning.main;
      case 'staff': return theme.palette.success.main;
      case 'system': return theme.palette.info.main;
      default: return theme.palette.grey[500];
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Recent Activity
      </Typography>
      <List sx={{ p: 0 }}>
        {activities.map((activity) => (
          <ListItem key={activity.id} sx={{ px: 0 }}>
            <ListItemIcon>
              <Box 
                sx={{ 
                  color: getActivityColor(activity.type),
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {getActivityIcon(activity.type)}
              </Box>
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2">
                  <strong>{activity.user}</strong> {activity.action} <strong>{activity.target}</strong>
                </Typography>
              }
              secondary={
                <Typography variant="caption" color="text.secondary">
                  {activity.time}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

// Admin Dashboard Component
const AdminDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { 
    staffMembers, 
    loading, 
    error, 
    updateStaffRoles, 
    updateStaffPermissions,
    addStaffMember, 
    removeStaffMember,
    updateStaffStatus 
  } = useStaffPermissions();

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [roleDialog, setRoleDialog] = useState(false);
  const [permissionDialog, setPermissionDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');

  // Mock data - replace with actual API calls
  const adminStats = {
    totalStaff: staffMembers.length,
    activeStaff: staffMembers.filter(staff => staff.status === 'Active').length,
    pendingApprovals: staffMembers.filter(staff => staff.status === 'Pending').length,
    systemHealth: 98.5
  };

  // Helper functions
  const handleRoleToggle = (staff) => {
    setSelectedStaff(staff);
    setRoleDialog(true);
  };

  const handlePermissionToggle = (staff) => {
    setSelectedStaff(staff);
    setPermissionDialog(true);
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'add_staff':
        console.log('Add staff member');
        break;
      case 'bulk_permissions':
        console.log('Bulk permissions management');
        break;
      case 'system_settings':
        console.log('System settings');
        break;
      case 'generate_reports':
        console.log('Generate reports');
        break;
      default:
        break;
    }
  };

  const handleRoleSave = async (staffId, newRoles) => {
    const result = await updateStaffRoles(staffId, newRoles);
    if (result.success) {
      toast.success('Staff roles updated successfully');
    } else {
      toast.error(result.error || 'Failed to update staff roles');
    }
  };

  const handlePermissionSave = async (staffId, permissions) => {
    const result = await updateStaffPermissions(staffId, permissions);
    if (result.success) {
      toast.success('Staff permissions updated successfully');
    } else {
      toast.error(result.error || 'Failed to update staff permissions');
    }
  };

  const handleStaffDelete = async (staffId) => {
    const result = await removeStaffMember(staffId);
    if (result.success) {
      toast.success('Staff member deleted successfully');
    } else {
      toast.error(result.error || 'Failed to delete staff member');
    }
  };

  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || staff.primaryRole === filterRole;
    
    return matchesSearch && matchesRole;
  });

  // Loading state
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading admin dashboard...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: theme.palette.grey[50] }}>
      {/* Header */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Admin Dashboard
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Staff Management & System Administration
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <NotificationCenter />
            <Tooltip title="Profile">
              <IconButton color="inherit">
                <AccountCircle />
              </IconButton>
            </Tooltip>
            <Tooltip title="Logout">
              <IconButton 
                color="inherit"
                onClick={async () => { await logout(); navigate('/admin-login'); }}
              >
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Breadcrumbs */}
      <Box sx={{ p: 2, background: 'white' }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="#" underline="hover">
            Dashboard
          </Link>
          <Typography color="text.primary">Staff Management</Typography>
        </Breadcrumbs>
      </Box>

      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Quick Actions Panel */}
        <QuickActionsPanel onAction={handleQuickAction} />

        {/* System Health Monitor */}
        <SystemHealthMonitor />

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStatCard
              icon={PeopleIcon}
              label="Total Staff"
              value={adminStats.totalStaff}
              color={theme.palette.primary.main}
              subtitle="Active members"
              trend={5.2}
              delay={0.1}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStatCard
              icon={CheckCircleIcon}
              label="Active Staff"
              value={adminStats.activeStaff}
              color={theme.palette.success.main}
              subtitle="Currently working"
              trend={2.1}
              delay={0.2}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStatCard
              icon={WarningIcon}
              label="Pending Approvals"
              value={adminStats.pendingApprovals}
              color={theme.palette.warning.main}
              subtitle="Awaiting review"
              trend={-15.3}
              delay={0.3}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStatCard
              icon={SecurityIcon}
              label="System Health"
              value={`${adminStats.systemHealth}%`}
              color={theme.palette.info.main}
              subtitle="Overall performance"
              trend={1.8}
              delay={0.4}
            />
          </Grid>
        </Grid>

        {/* Main Content Area */}
        <Grid container spacing={3}>
          {/* Left Column - Main Content */}
          <Grid item xs={12} lg={8}>
            {/* Main Content Tabs */}
            <Paper sx={{ mb: 3 }}>
              <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                <Tab label="Overview" icon={<DashboardIcon />} />
                <Tab label="Staff Management" icon={<PeopleIcon />} />
                <Tab label="Role Permissions" icon={<SecurityIcon />} />
                <Tab label="Feature Permissions" icon={<SecurityIcon />} />
                <Tab label="Permission" icon={<SecurityIcon />} />
                <Tab label="Service Requests" icon={<AssignmentIcon />} />
              </Tabs>
            </Paper>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 0 && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <Paper sx={{ p: 3, height: 400 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Staff Distribution by Role</Typography>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { role: 'Librarian', count: staffMembers.filter(s => s.assignedRoles.includes('librarian')).length, color: roleColors.librarian },
                            { role: 'Counselor', count: staffMembers.filter(s => s.assignedRoles.includes('counselor')).length, color: roleColors.counselor },
                            { role: 'PT Teacher', count: staffMembers.filter(s => s.assignedRoles.includes('ptteacher')).length, color: roleColors.ptteacher },
                            { role: 'Event Handler', count: staffMembers.filter(s => s.assignedRoles.includes('eventhandler')).length, color: roleColors.eventhandler },
                            { role: 'Transport Manager', count: staffMembers.filter(s => s.assignedRoles.includes('transportmanager')).length, color: roleColors.transportmanager },
                            { role: 'Soft Skills Manager', count: staffMembers.filter(s => s.assignedRoles.includes('softskillsmanager')).length, color: roleColors.softskillsmanager }
                          ]}>
                            <XAxis dataKey="role" />
                            <YAxis />
                            <RechartsTooltip />
                            <Bar dataKey="count" fill={theme.palette.primary.main} />
                          </BarChart>
                        </ResponsiveContainer>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 3, height: 400 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Role Distribution</Typography>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Librarian', value: staffMembers.filter(s => s.assignedRoles.includes('librarian')).length, color: roleColors.librarian },
                                { name: 'Counselor', value: staffMembers.filter(s => s.assignedRoles.includes('counselor')).length, color: roleColors.counselor },
                                { name: 'PT Teacher', value: staffMembers.filter(s => s.assignedRoles.includes('ptteacher')).length, color: roleColors.ptteacher },
                                { name: 'Event Handler', value: staffMembers.filter(s => s.assignedRoles.includes('eventhandler')).length, color: roleColors.eventhandler },
                                { name: 'Transport Manager', value: staffMembers.filter(s => s.assignedRoles.includes('transportmanager')).length, color: roleColors.transportmanager },
                                { name: 'Soft Skills Manager', value: staffMembers.filter(s => s.assignedRoles.includes('softskillsmanager')).length, color: roleColors.softskillsmanager }
                              ]}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="value"
                            >
                              {[
                                { name: 'Librarian', value: staffMembers.filter(s => s.assignedRoles.includes('librarian')).length, color: roleColors.librarian },
                                { name: 'Counselor', value: staffMembers.filter(s => s.assignedRoles.includes('counselor')).length, color: roleColors.counselor },
                                { name: 'PT Teacher', value: staffMembers.filter(s => s.assignedRoles.includes('ptteacher')).length, color: roleColors.ptteacher },
                                { name: 'Event Handler', value: staffMembers.filter(s => s.assignedRoles.includes('eventhandler')).length, color: roleColors.eventhandler },
                                { name: 'Transport Manager', value: staffMembers.filter(s => s.assignedRoles.includes('transportmanager')).length, color: roleColors.transportmanager },
                                { name: 'Soft Skills Manager', value: staffMembers.filter(s => s.assignedRoles.includes('softskillsmanager')).length, color: roleColors.softskillsmanager }
                              ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </Paper>
                    </Grid>
                  </Grid>
                </motion.div>
              )}

              {activeTab === 1 && (
                <motion.div
                  key="staff"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Search and Filter Bar */}
                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          placeholder="Search staff by name or email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon />
                              </InputAdornment>
                            )
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                          <InputLabel>Filter by Role</InputLabel>
                          <Select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                          >
                            <MenuItem value="">All Roles</MenuItem>
                            <MenuItem value="librarian">Librarian</MenuItem>
                            <MenuItem value="counselor">Counselor</MenuItem>
                            <MenuItem value="ptteacher">PT Teacher</MenuItem>
                            <MenuItem value="eventhandler">Event Handler</MenuItem>
                            <MenuItem value="transportmanager">Transport Manager</MenuItem>
                            <MenuItem value="softskillsmanager">Soft Skills Manager</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          fullWidth
                          onClick={() => handleQuickAction('add_staff')}
                        >
                          Add Staff
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Staff Grid */}
                  <Grid container spacing={3}>
                    {filteredStaff.map((staff) => (
                      <Grid item xs={12} sm={6} md={4} key={staff._id}>
                        <StaffCard
                          staff={staff}
                          onEdit={(staff) => {
                            console.log('Edit staff:', staff);
                          }}
                          onDelete={handleStaffDelete}
                          onView={(staff) => {
                            console.log('View staff:', staff);
                          }}
                          onToggleRole={handleRoleToggle}
                          onTogglePermission={handlePermissionToggle}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </motion.div>
              )}

              {activeTab === 2 && (
                <motion.div
                  key="permissions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Role Permission Matrix</Typography>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Role</TableCell>
                          <TableCell>Dashboard Access</TableCell>
                          <TableCell>Record Management</TableCell>
                          <TableCell>Report Generation</TableCell>
                          <TableCell>Admin Access</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(roleColors).map(([role, color]) => {
                          const RoleIcon = roleIcons[role];
                          
                          return (
                            <TableRow key={role}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <RoleIcon sx={{ color }} />
                                  <Typography sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
                                    {role}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip label="Yes" size="small" color="success" />
                              </TableCell>
                              <TableCell>
                                <Chip label="Yes" size="small" color="success" />
                              </TableCell>
                              <TableCell>
                                <Chip label="Yes" size="small" color="success" />
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={role === 'admin' ? 'Yes' : 'No'} 
                                  size="small" 
                                  color={role === 'admin' ? 'success' : 'default'} 
                                />
                              </TableCell>
                              <TableCell>
                                <IconButton size="small">
                                  <EditIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Paper>
                </motion.div>
              )}

              {activeTab === 3 && (
                <motion.div
                  key="feature-permissions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6">Feature Permission Management</Typography>
                      <Button
                        variant="contained"
                        startIcon={<SecurityIcon />}
                        onClick={() => handleQuickAction('bulk_permissions')}
                      >
                        Bulk Permissions
                      </Button>
                    </Box>
                    
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <AlertTitle>Feature Permissions</AlertTitle>
                      Manage granular permissions for each staff member. Control access to specific features like inventory, student records, teacher remarks, feedbacks, events, and communication.
                    </Alert>

                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Staff Member</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Inventory</TableCell>
                          <TableCell>Student Records</TableCell>
                          <TableCell>Teacher Remarks</TableCell>
                          <TableCell>Feedbacks</TableCell>
                          <TableCell>Events</TableCell>
                          <TableCell>Communication</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {staffMembers.map((staff) => (
                          <TableRow key={staff._id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: roleColors[staff.primaryRole] }}>
                                  <PersonIcon />
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle2">{staff.name}</Typography>
                                  <Typography variant="body2" color="text.secondary">{staff.email}</Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={staff.primaryRole} 
                                size="small" 
                                sx={{ 
                                  bgcolor: `${roleColors[staff.primaryRole]}20`,
                                  color: roleColors[staff.primaryRole]
                                }} 
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={staff.permissions?.inventory?.view_inventory ? "Enabled" : "Disabled"} 
                                size="small" 
                                color={staff.permissions?.inventory?.view_inventory ? "success" : "default"} 
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={staff.permissions?.student_records?.view_students ? "Enabled" : "Disabled"} 
                                size="small" 
                                color={staff.permissions?.student_records?.view_students ? "success" : "default"} 
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={staff.permissions?.teacher_remarks?.view_remarks ? "Enabled" : "Disabled"} 
                                size="small" 
                                color={staff.permissions?.teacher_remarks?.view_remarks ? "success" : "default"} 
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={staff.permissions?.feedbacks?.view_feedback ? "Enabled" : "Disabled"} 
                                size="small" 
                                color={staff.permissions?.feedbacks?.view_feedback ? "success" : "default"} 
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={staff.permissions?.events?.view_events ? "Enabled" : "Disabled"} 
                                size="small" 
                                color={staff.permissions?.events?.view_events ? "success" : "default"} 
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={staff.permissions?.communication?.send_messages ? "Enabled" : "Disabled"} 
                                size="small" 
                                color={staff.permissions?.communication?.send_messages ? "success" : "default"} 
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton 
                                size="small" 
                                onClick={() => handlePermissionToggle(staff)}
                                sx={{ color: theme.palette.primary.main }}
                              >
                                <SecurityIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                </motion.div>
              )}

              {activeTab === 4 && (
                <motion.div
                  key="permission-tab"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Staff Permission Management</Typography>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Staff Member</TableCell>
                          <TableCell>Role(s)</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {staffMembers.map((staff) => (
                          <TableRow key={staff._id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: roleColors[staff.primaryRole] }}>
                                  <PersonIcon />
                                </Avatar>
                                <Typography variant="subtitle2">{staff.name}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              {staff.assignedRoles && staff.assignedRoles.length > 0
                                ? staff.assignedRoles.map(role => (
                                    <Chip key={role} label={role} size="small" sx={{ mr: 0.5, bgcolor: roleColors[role], color: '#fff' }} />
                                  ))
                                : <Chip label="No Roles" size="small" color="default" />}
                            </TableCell>
                            <TableCell>{staff.email}</TableCell>
                            <TableCell>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<SecurityIcon />}
                                onClick={() => handlePermissionToggle(staff)}
                              >
                                Edit Permissions
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                </motion.div>
              )}

              {activeTab === 5 && (
                <motion.div
                  key="service-requests"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <A_ServiceRequests />
                </motion.div>
              )}
            </AnimatePresence>
          </Grid>

          {/* Right Column - Sidebar */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ position: 'sticky', top: 20 }}>
              {/* Recent Activity Feed */}
              <RecentActivityFeed />
            </Box>
          </Grid>
        </Grid>

        {/* Role Permission Manager Dialog */}
        <RolePermissionManager
          staff={selectedStaff}
          open={roleDialog}
          onClose={() => setRoleDialog(false)}
          onSave={handleRoleSave}
        />

        {/* Feature Permission Manager Dialog */}
        <PermissionManager
          staff={selectedStaff}
          open={permissionDialog}
          onClose={() => setPermissionDialog(false)}
          onSave={handlePermissionSave}
        />
      </Box>
    </Box>
  );
};

export default AdminDashboard; 