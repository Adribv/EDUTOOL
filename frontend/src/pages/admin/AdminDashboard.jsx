import React, { useState, useEffect } from 'react';
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

import { 
  getUserActivitiesControl, 
  hasAnyActivityAccess, 
  getActivityAccessLevel,
  getAccessLevelInfo 
} from '../../utils/activitiesControl';
import { api, staffActivitiesControlAPI } from '../../services/api';
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
const StaffCard = ({ staff, onEdit, onDelete, onView, onToggleRole, onTogglePermission, accessInfo }) => {
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
            {accessInfo?.canRead && (
              <IconButton 
                size="small" 
                onClick={() => onView(staff)}
                title="View staff details"
              >
                <ViewIcon />
              </IconButton>
            )}
            {accessInfo?.canUpdate && (
              <IconButton 
                size="small" 
                onClick={() => onEdit(staff)}
                title="Edit staff information"
              >
                <EditIcon />
              </IconButton>
            )}
            {accessInfo?.canUpdate && (
              <IconButton 
                size="small" 
                onClick={() => onToggleRole(staff)}
                title="Manage staff roles"
              >
                <SwapIcon />
              </IconButton>
            )}
            {accessInfo?.canManage && (
              <IconButton 
                size="small" 
                onClick={() => onTogglePermission(staff)}
                title="Manage staff permissions"
              >
                <SecurityIcon />
              </IconButton>
            )}
            {accessInfo?.canDelete && (
              <IconButton 
                size="small" 
                onClick={() => onDelete(staff._id)}
                title="Delete staff member"
                sx={{ color: 'error.main' }}
              >
                <DeleteIcon />
              </IconButton>
            )}
            
            {/* Show message if no actions are available or if read-only */}
            {(!accessInfo?.canRead && !accessInfo?.canUpdate && !accessInfo?.canManage && !accessInfo?.canDelete) && (
              <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center', ml: 1 }}>
                No access
              </Typography>
            )}
            {accessInfo?.isReadOnly && accessInfo?.canRead && (
              <Typography variant="caption" color="warning.main" sx={{ alignSelf: 'center', ml: 1, fontWeight: 'bold' }}>
                READ ONLY
              </Typography>
            )}
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
const QuickActionsPanel = ({ onAction, accessInfo }) => {
  const theme = useTheme();
  
  const quickActions = [
    {
      title: 'Add Staff Member',
      icon: AddIcon,
      color: 'primary',
      action: 'add_staff',
      description: 'Register new staff member',
      requiredPermission: accessInfo?.canAddStaff,
      viewOnly: false
    },
    {
      title: 'Bulk Permissions',
      icon: SecurityIcon,
      color: 'warning',
      action: 'bulk_permissions',
      description: 'Manage permissions for multiple staff',
      requiredPermission: accessInfo?.canManagePermissions,
      viewOnly: false
    },
    {
      title: 'System Settings',
      icon: SettingsIcon,
      color: 'info',
      action: 'system_settings',
      description: 'Configure system parameters',
      requiredPermission: accessInfo?.canManageSystem,
      viewOnly: false
    },
    {
      title: 'Generate Reports',
      icon: AssessmentIcon,
      color: 'success',
      action: 'generate_reports',
      description: 'Create comprehensive reports',
      requiredPermission: accessInfo?.canGenerateReports,
      viewOnly: true // Reports can be viewed even in view-only mode
    },
    {
      title: 'View Staff Directory',
      icon: PeopleIcon,
      color: 'secondary',
      action: 'view_staff_directory',
      description: 'Browse staff information',
      requiredPermission: true, // Always available for viewing
      viewOnly: true
    },
    {
      title: 'View Permissions',
      icon: SecurityIcon,
      color: 'info',
      action: 'view_permissions',
      description: 'Review current permissions',
      requiredPermission: true, // Always available for viewing
      viewOnly: true
    }
  ];

  // Filter actions based on permissions and view-only mode
  const availableActions = quickActions.filter(action => {
    if (!action.requiredPermission) return false;
    
    // If user has edit access, show all available actions
    if (accessInfo?.canEdit) return true;
    
    // If user has only view access, show only view-only actions
    return action.viewOnly;
  });

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Quick Actions
      </Typography>
      {availableActions.length > 0 ? (
        <Grid container spacing={2}>
          {availableActions.map((action) => {
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
                      bgcolor: action.viewOnly && !accessInfo?.canEdit ? '#fafafa' : 'white',
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
                      {action.viewOnly && !accessInfo?.canEdit && (
                        <Chip
                          label="View Only"
                          size="small"
                          color="warning"
                          sx={{ mt: 1, fontSize: '0.7rem' }}
                        />
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Alert severity="info">
          <AlertTitle>No Quick Actions Available</AlertTitle>
          You don't have permission to perform any quick actions. Contact your Vice Principal to request additional permissions.
        </Alert>
      )}
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

// View Only Staff Card Component
const ViewOnlyStaffCard = ({ staff }) => {
  const theme = useTheme();
  const RoleIcon = roleIcons[staff.primaryRole] || PersonIcon;
  const roleColor = roleColors[staff.primaryRole] || theme.palette.grey[500];

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Card sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        border: '2px solid #e0e0e0',
        bgcolor: '#fafafa'
      }}>
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

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 'auto' }}>
            <Chip
              label="VIEW ONLY"
              size="small"
              color="warning"
              sx={{ 
                fontWeight: 'bold',
                fontSize: '0.7rem'
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Admin Dashboard Component
const AdminDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { logout, user } = useAuth();


  // State management
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [roleDialog, setRoleDialog] = useState(false);
  const [permissionDialog, setPermissionDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [userActivitiesControl, setUserActivitiesControl] = useState(null);

  // Fetch user's activities control on component mount
  useEffect(() => {
    const fetchUserActivitiesControl = async () => {
      try {
        if (user?._id || user?.id) {
          const staffId = user._id || user.id;
          
          // Use the staff endpoint instead of VP endpoint for getting own activities control
          const response = await staffActivitiesControlAPI.getMyActivities();
          const activitiesControl = response?.data;
          
          if (activitiesControl) {
            setUserActivitiesControl(activitiesControl);
          }
        }
      } catch (error) {
        console.log('No activities control found for user, using default permissions');
        setUserActivitiesControl(null);
      }
    };

    fetchUserActivitiesControl();
  }, [user]);

  // Mock functions to replace the missing hook
  const updateStaffRoles = async (staffId, newRoles) => {
    console.log('Mock updateStaffRoles called:', { staffId, newRoles });
    return { success: true };
  };

  const updateStaffPermissions = async (staffId, permissions) => {
    console.log('Mock updateStaffPermissions called:', { staffId, permissions });
    return { success: true };
  };

  const addStaffMember = async (staffData) => {
    console.log('Mock addStaffMember called:', staffData);
    return { success: true };
  };

  const removeStaffMember = async (staffId) => {
    console.log('Mock removeStaffMember called:', staffId);
    return { success: true };
  };

  const updateStaffStatus = async (staffId, status) => {
    console.log('Mock updateStaffStatus called:', { staffId, status });
    return { success: true };
  };

  // Define all available tabs with their activity mappings
  const allTabs = [
    { label: 'Overview', icon: <DashboardIcon />, activity: null }, // Always accessible
    { label: 'Staff Management', icon: <PeopleIcon />, activity: 'Staff Management' },
    { label: 'Role Permissions', icon: <SecurityIcon />, activity: 'User Management' },
    { label: 'Feature Permissions', icon: <SecurityIcon />, activity: 'Permissions' },
    { label: 'Permission', icon: <SecurityIcon />, activity: 'Permissions' },
    { label: 'Service Requests', icon: <AssignmentIcon />, activity: 'Service Requests' },
  ];

  // Filter tabs based on activities control
  const filteredTabs = allTabs.filter(tab => {
    // Always allow Overview tab
    if (tab.label === 'Overview') {
      return true;
    }
    
    // If no activities control, show all tabs (default permissions)
    if (!userActivitiesControl || !userActivitiesControl.activityAssignments) {
      console.log('No activities control found, showing all tabs (default permissions)');
      return true;
    }
    
    // Check if user has access to this activity
    if (tab.activity) {
      const activityAssignment = userActivitiesControl.activityAssignments.find(
        a => a.activity === tab.activity
      );
      
      if (!activityAssignment) {
        console.log(`❌ No activity assignment found for tab: ${tab.label} (${tab.activity}) - HIDDEN`);
        return false; // Hide tab if no assignment found
      }
      
      const hasAccess = activityAssignment.accessLevel !== 'Unauthorized';
      console.log(`${hasAccess ? '✅' : '❌'} Tab: ${tab.label} (${tab.activity}) - Access Level: ${activityAssignment.accessLevel} - ${hasAccess ? 'SHOWN' : 'HIDDEN'}`);
      return hasAccess; // Only show if not unauthorized
    }
    
    return true;
  });

  // Reset active tab if current tab is not in filtered tabs
  useEffect(() => {
    if (filteredTabs.length > 0 && activeTab >= filteredTabs.length) {
      setActiveTab(0);
    }
  }, [filteredTabs, activeTab]);

  // Secure tab change handler - prevents navigation to unauthorized tabs
  const handleSecureTabChange = (event, newValue) => {
    // Check if the new tab is in the filtered (authorized) tabs
    if (newValue >= 0 && newValue < filteredTabs.length) {
      const targetTab = filteredTabs[newValue];
      
      // Additional security check - verify the tab is actually accessible
      if (targetTab.label === 'Overview') {
        // Overview is always accessible
        setActiveTab(newValue);
        return;
      }
      
      if (userActivitiesControl && userActivitiesControl.activityAssignments) {
        const activityAssignment = userActivitiesControl.activityAssignments.find(
          a => a.activity === targetTab.activity
        );
        
        if (activityAssignment && activityAssignment.accessLevel !== 'Unauthorized') {
          console.log(`✅ Navigation allowed to tab: ${targetTab.label} (${targetTab.activity}) - Access Level: ${activityAssignment.accessLevel}`);
          setActiveTab(newValue);
        } else {
          console.log(`❌ Navigation blocked to unauthorized tab: ${targetTab.label} (${targetTab.activity})`);
          toast.error(`Access denied: You don't have permission to access ${targetTab.label}`);
        }
      } else {
        // If no activities control, allow navigation (default permissions)
        setActiveTab(newValue);
      }
    } else {
      console.log(`❌ Navigation blocked: Invalid tab index ${newValue}`);
      toast.error('Invalid tab selection');
    }
  };

  // Navigation guard - redirect to first authorized tab if current tab is unauthorized
  useEffect(() => {
    if (filteredTabs.length > 0) {
      const currentTab = filteredTabs[activeTab];
      
      if (currentTab && currentTab.label !== 'Overview') {
        if (userActivitiesControl && userActivitiesControl.activityAssignments) {
          const activityAssignment = userActivitiesControl.activityAssignments.find(
            a => a.activity === currentTab.activity
          );
          
          if (!activityAssignment || activityAssignment.accessLevel === 'Unauthorized') {
            console.log(`🚫 Redirecting from unauthorized tab: ${currentTab.label}`);
            toast.warning(`Access denied to ${currentTab.label}. Redirecting to Overview.`);
            setActiveTab(0); // Redirect to Overview tab
          }
        }
      }
    }
  }, [activeTab, filteredTabs, userActivitiesControl]);

  // Keyboard navigation protection - prevent arrow key navigation to unauthorized tabs
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        const currentIndex = activeTab;
        const newIndex = event.key === 'ArrowLeft' ? currentIndex - 1 : currentIndex + 1;
        
        // Check if the new tab would be unauthorized
        if (newIndex >= 0 && newIndex < filteredTabs.length) {
          const targetTab = filteredTabs[newIndex];
          
          if (targetTab.label !== 'Overview') {
            if (userActivitiesControl && userActivitiesControl.activityAssignments) {
              const activityAssignment = userActivitiesControl.activityAssignments.find(
                a => a.activity === targetTab.activity
              );
              
              if (!activityAssignment || activityAssignment.accessLevel === 'Unauthorized') {
                event.preventDefault();
                console.log(`🚫 Keyboard navigation blocked to unauthorized tab: ${targetTab.label}`);
                toast.error(`Cannot navigate to ${targetTab.label} - Access denied`);
                return;
              }
            }
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, filteredTabs, userActivitiesControl]);

  console.log('🔍 Admin Dashboard Tabs Summary:', {
    totalTabs: allTabs.length,
    filteredTabs: filteredTabs.length,
    availableTabs: filteredTabs.map(tab => tab.label),
    hiddenTabs: allTabs.filter(tab => !filteredTabs.includes(tab)).map(tab => tab.label),
    userActivitiesControl: userActivitiesControl?.activityAssignments
  });

  // Show message if no tabs are accessible (except Overview)
  const accessibleTabs = filteredTabs.filter(tab => tab.label !== 'Overview');
  const hasNoAccess = userActivitiesControl && accessibleTabs.length === 0;

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
        if (hasEditAccess('Staff Management')) {
          console.log('Add staff member');
        } else {
          toast.error('You do not have permission to add staff members. Contact your VP for Edit or Approve access.');
        }
        break;
      case 'bulk_permissions':
        if (hasEditAccess('Permissions')) {
          console.log('Bulk permissions management');
        } else {
          toast.error('You do not have permission to manage permissions. Contact your VP for Edit or Approve access.');
        }
        break;
      case 'system_settings':
        if (hasEditAccess('User Management')) {
          console.log('System settings');
        } else {
          toast.error('You do not have permission to access system settings. Contact your VP for Edit or Approve access.');
        }
        break;
      case 'generate_reports':
        if (hasViewAccess('Staff Management')) {
          console.log('Generate reports');
          toast.info('Report generation feature coming soon');
        } else {
          toast.error('You do not have permission to generate reports.');
        }
        break;
      case 'view_staff_directory':
        if (hasViewAccess('Staff Management')) {
          console.log('View staff directory');
          toast.info('Staff directory view feature coming soon');
        } else {
          toast.error('You do not have permission to view staff directory.');
        }
        break;
      case 'view_permissions':
        if (hasViewAccess('Permissions')) {
          console.log('View permissions');
          toast.info('Permission review feature coming soon');
        } else {
          toast.error('You do not have permission to view permissions.');
        }
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

  // Helper function to check user's access level for a specific activity
  const getUserAccessLevel = (activity) => {
    if (!userActivitiesControl || !userActivitiesControl.activityAssignments) {
      return 'Full'; // Default to full access if no activities control
    }
    
    const activityAssignment = userActivitiesControl.activityAssignments.find(
      a => a.activity === activity
    );
    
    return activityAssignment ? activityAssignment.accessLevel : 'Unauthorized';
  };

  // Helper function to check if user can perform an action
  const canPerformAction = (activity, requiredLevel = 'View') => {
    const userLevel = getUserAccessLevel(activity);
    
    const levelHierarchy = {
      'Unauthorized': 0,
      'View': 1,
      'Edit': 2,
      'Approve': 3,
      'Full': 4
    };
    
    return levelHierarchy[userLevel] >= levelHierarchy[requiredLevel];
  };

  // Helper function to check if user can perform CRUD operations
  const canPerformCRUD = (activity, operation = 'read') => {
    const userLevel = getUserAccessLevel(activity);
    
    // Define what operations each access level can perform
    const operationPermissions = {
      'Unauthorized': { read: false, create: false, update: false, delete: false },
      'View': { read: true, create: false, update: false, delete: false },
      'Edit': { read: true, create: true, update: true, delete: false },
      'Approve': { read: true, create: true, update: true, delete: true },
      'Full': { read: true, create: true, update: true, delete: true }
    };
    
    return operationPermissions[userLevel]?.[operation] || false;
  };

  // Enhanced access level info with CRUD permissions
  const getAccessLevelInfo = (activity) => {
    const level = getUserAccessLevel(activity);
    const info = {
      level,
      canView: canPerformAction(activity, 'View'),
      canEdit: canPerformAction(activity, 'Edit'),
      canApprove: canPerformAction(activity, 'Approve'),
      canDelete: canPerformAction(activity, 'Approve'),
      canCreate: canPerformAction(activity, 'Edit'),
      canUpdate: canPerformAction(activity, 'Edit'),
      canManage: canPerformAction(activity, 'Approve'),
      // CRUD specific permissions
      canRead: canPerformCRUD(activity, 'read'),
      canCreateCRUD: canPerformCRUD(activity, 'create'),
      canUpdateCRUD: canPerformCRUD(activity, 'update'),
      canDeleteCRUD: canPerformCRUD(activity, 'delete'),
      // Helper for UI
      isReadOnly: level === 'View',
      canModify: level === 'Edit' || level === 'Approve' || level === 'Full',
      canDeleteUI: level === 'Approve' || level === 'Full'
    };
    
    console.log(`🔐 Access Level for ${activity}:`, info);
    return info;
  };

  // Helper function to check if user has edit access for a specific activity
  const hasEditAccess = (activity) => {
    const userLevel = getUserAccessLevel(activity);
    return userLevel === 'Edit' || userLevel === 'Approve' || userLevel === 'Full';
  };

  // Helper function to check if user has view access for a specific activity
  const hasViewAccess = (activity) => {
    const userLevel = getUserAccessLevel(activity);
    return userLevel === 'View' || userLevel === 'Edit' || userLevel === 'Approve' || userLevel === 'Full';
  };

  // Helper function to get access type for display
  const getAccessType = (activity) => {
    const userLevel = getUserAccessLevel(activity);
    if (userLevel === 'View') return 'View Only';
    if (userLevel === 'Edit') return 'Edit Access';
    if (userLevel === 'Approve') return 'Full Access';
    if (userLevel === 'Full') return 'Full Access';
    return 'No Access';
  };

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
            {userActivitiesControl && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Chip
                  label={`VP Controlled - ${filteredTabs.length}/${allTabs.length} tabs accessible`}
                  size="small"
                  color="success"
                  sx={{ fontSize: '0.7rem' }}
                />
                {!hasEditAccess('Staff Management') && !hasEditAccess('Permissions') && !hasEditAccess('User Management') && (
                  <Chip
                    label="VIEW ONLY MODE"
                    size="small"
                    color="warning"
                    sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}
                  />
                )}
              </Box>
            )}
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
        {/* Access Mode Indicator */}
        {userActivitiesControl && (
          <Paper sx={{ 
            p: 2, 
            mb: 3, 
            bgcolor: !hasEditAccess('Staff Management') && !hasEditAccess('Permissions') && !hasEditAccess('User Management') 
              ? '#fff3cd' 
              : '#e8f5e8',
            border: !hasEditAccess('Staff Management') && !hasEditAccess('Permissions') && !hasEditAccess('User Management')
              ? '1px solid #ffeaa7'
              : '1px solid #c8e6c9'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {!hasEditAccess('Staff Management') && !hasEditAccess('Permissions') && !hasEditAccess('User Management') ? (
                <>
                  <WarningIcon sx={{ color: '#856404', fontSize: 28 }} />
                  <Box>
                    <Typography variant="h6" sx={{ color: '#856404', fontWeight: 'bold' }}>
                      View Only Mode
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#856404' }}>
                      You have read-only access to all admin functions. Contact your Vice Principal for edit permissions.
                    </Typography>
                  </Box>
                </>
              ) : (
                <>
                  <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: 28 }} />
                  <Box>
                    <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                      Edit Mode Available
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#2e7d32' }}>
                      You have edit access to some or all admin functions.
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </Paper>
        )}

        {/* Quick Actions Panel */}
        <QuickActionsPanel 
          onAction={handleQuickAction} 
          accessInfo={{
            canAddStaff: canPerformCRUD('Staff Management', 'create'),
            canManagePermissions: canPerformCRUD('Permissions', 'update'),
            canManageSystem: canPerformCRUD('User Management', 'update'),
            canGenerateReports: canPerformCRUD('Staff Management', 'read'),
            canEdit: hasEditAccess('Staff Management') || hasEditAccess('Permissions') || hasEditAccess('User Management')
          }}
        />

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
              {hasNoAccess ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <AlertTitle>No Access Granted</AlertTitle>
                    You don't have access to any admin features. Please contact your Vice Principal to request access to specific features.
                  </Alert>
                  <Typography variant="body2" color="text.secondary">
                    Available tabs: {filteredTabs.length} of {allTabs.length}
                  </Typography>
                </Box>
              ) : (
                <Tabs value={activeTab} onChange={handleSecureTabChange}>
                  {filteredTabs.map((tab, index) => {
                    // Get access level for this tab
                    let accessLevel = null;
                    let accessLevelColor = 'default';
                    
                    if (tab.activity && userActivitiesControl?.activityAssignments) {
                      const activityAssignment = userActivitiesControl.activityAssignments.find(
                        a => a.activity === tab.activity
                      );
                      if (activityAssignment) {
                        accessLevel = activityAssignment.accessLevel;
                        switch (accessLevel) {
                          case 'View':
                            accessLevelColor = 'info';
                            break;
                          case 'Edit':
                            accessLevelColor = 'warning';
                            break;
                          case 'Approve':
                            accessLevelColor = 'success';
                            break;
                          case 'Unauthorized':
                            accessLevelColor = 'error';
                            break;
                          default:
                            accessLevelColor = 'default';
                        }
                      }
                    }

                    // Check if this tab is currently accessible
                    const isAccessible = tab.label === 'Overview' || 
                      (userActivitiesControl && userActivitiesControl.activityAssignments) ? 
                      userActivitiesControl.activityAssignments.find(a => a.activity === tab.activity)?.accessLevel !== 'Unauthorized' : 
                      true;

                    return (
                      <Tab 
                        key={tab.label} 
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {tab.label}
                            {accessLevel && accessLevel !== 'Unauthorized' && (
                              <Chip
                                label={accessLevel}
                                size="small"
                                color={accessLevelColor}
                                sx={{
                                  height: 16,
                                  fontSize: '0.6rem',
                                  '& .MuiChip-label': {
                                    px: 0.5,
                                  },
                                }}
                              />
                            )}
                            {!isAccessible && (
                              <Chip
                                label="Blocked"
                                size="small"
                                color="error"
                                sx={{
                                  height: 16,
                                  fontSize: '0.6rem',
                                  '& .MuiChip-label': {
                                    px: 0.5,
                                  },
                                }}
                              />
                            )}
                          </Box>
                        }
                        icon={tab.icon} 
                        disabled={!isAccessible}
                        sx={{
                          opacity: isAccessible ? 1 : 0.5,
                          '&.Mui-disabled': {
                            opacity: 0.5,
                          }
                        }}
                      />
                    );
                  })}
                </Tabs>
              )}
            </Paper>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {hasNoAccess ? (
                <motion.div
                  key="no-access"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Box sx={{ mb: 3 }}>
                      <SecurityIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
                      <Typography variant="h5" gutterBottom>
                        Access Restricted
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        You don't have permission to access any admin features. 
                        Only the Overview tab is available to you.
                      </Typography>
                    </Box>
                    
                    <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto' }}>
                      <Typography variant="body2">
                        <strong>To request access:</strong>
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        1. Contact your Vice Principal<br/>
                        2. Request specific feature access<br/>
                        3. Wait for approval and assignment
                      </Typography>
                    </Alert>
                  </Paper>
                </motion.div>
              ) : (
                filteredTabs.map((tab, index) => {
                  // Security check - verify tab access before rendering
                  const hasTabAccess = (() => {
                    if (tab.label === 'Overview') return true;
                    if (!userActivitiesControl || !userActivitiesControl.activityAssignments) return true;
                    
                    const activityAssignment = userActivitiesControl.activityAssignments.find(
                      a => a.activity === tab.activity
                    );
                    
                    return activityAssignment && activityAssignment.accessLevel !== 'Unauthorized';
                  })();

                  // If no access to this tab, don't render it
                  if (!hasTabAccess) {
                    console.log(`🚫 Blocking render of unauthorized tab: ${tab.label}`);
                    return null;
                  }

                  return (
                    <motion.div
                      key={tab.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {activeTab === index && (
                        <Box sx={{ mt: 3 }}>
                          {tab.label === 'Overview' && (
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

                          {tab.label === 'Staff Management' && (
                            <motion.div
                              key="staff"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3 }}
                            >
                              {(() => {
                                const accessInfo = getAccessLevelInfo('Staff Management');
                                const isViewOnly = !hasEditAccess('Staff Management');
                                
                                return (
                                  <>
                                    {/* Access Level Banner */}
                                    <Alert 
                                      severity={accessInfo.level === 'Unauthorized' ? 'error' : isViewOnly ? 'warning' : 'info'} 
                                      sx={{ mb: 3 }}
                                    >
                                      <AlertTitle>Access Level: {getAccessType('Staff Management')}</AlertTitle>
                                      {isViewOnly && 'You have VIEW-ONLY access. You can view staff information but cannot create, edit, or delete any records.'}
                                      {accessInfo.level === 'Edit' && 'You can view and edit staff information. Approval and deletion actions are not allowed.'}
                                      {accessInfo.level === 'Approve' && 'You have full access to manage staff including approvals and deletions.'}
                                      {accessInfo.level === 'Unauthorized' && 'You do not have access to staff management features.'}
                                    </Alert>

                                    {isViewOnly ? (
                                      // View Only Mode
                                      <>
                                        {/* Search and Filter Bar - Read Only */}
                                        <Paper sx={{ p: 3, mb: 3, bgcolor: '#fafafa' }}>
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
                                                variant="outlined"
                                                startIcon={<AddIcon />}
                                                fullWidth
                                                disabled
                                                sx={{ 
                                                  bgcolor: '#f5f5f5',
                                                  color: '#999',
                                                  borderColor: '#ddd'
                                                }}
                                              >
                                                Add Staff
                                              </Button>
                                            </Grid>
                                          </Grid>
                                        </Paper>

                                        {/* View Only Staff Grid */}
                                        <Grid container spacing={3}>
                                          {filteredStaff.map((staff) => (
                                            <Grid item xs={12} sm={6} md={4} key={staff._id}>
                                              <ViewOnlyStaffCard staff={staff} />
                                            </Grid>
                                          ))}
                                        </Grid>

                                        {/* View Only Summary */}
                                        <Paper sx={{ p: 3, mt: 3, bgcolor: '#fff3cd', border: '1px solid #ffeaa7' }}>
                                          <Typography variant="h6" sx={{ mb: 2, color: '#856404' }}>
                                            📊 Staff Management Summary (View Only)
                                          </Typography>
                                          <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6} md={3}>
                                              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'white', borderRadius: 1 }}>
                                                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                                                  {filteredStaff.length}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                  Total Staff
                                                </Typography>
                                              </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={3}>
                                              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'white', borderRadius: 1 }}>
                                                <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                                                  {filteredStaff.filter(s => s.status === 'Active').length}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                  Active Staff
                                                </Typography>
                                              </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={3}>
                                              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'white', borderRadius: 1 }}>
                                                <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                                                  {filteredStaff.filter(s => s.status === 'Pending').length}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                  Pending Approval
                                                </Typography>
                                              </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={3}>
                                              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'white', borderRadius: 1 }}>
                                                <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                                                  {new Set(filteredStaff.map(s => s.department)).size}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                  Departments
                                                </Typography>
                                              </Box>
                                            </Grid>
                                          </Grid>
                                        </Paper>
                                      </>
                                    ) : (
                                      // Edit Mode
                                      <>
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
                                                disabled={!accessInfo.canCreate}
                                                onClick={() => {
                                                  if (accessInfo.canCreate) {
                                                    handleQuickAction('add_staff');
                                                  } else {
                                                    toast.error('You do not have permission to add staff members. Contact your VP for Edit or Approve access.');
                                                  }
                                                }}
                                                title={!accessInfo.canCreate ? 'Insufficient permissions to add staff' : 'Add new staff member'}
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
                                                  if (accessInfo.canUpdate) {
                                                    console.log('Edit staff:', staff);
                                                  } else {
                                                    toast.error('You do not have permission to edit staff information. Contact your VP for Edit or Approve access.');
                                                  }
                                                }}
                                                onDelete={(staffId) => {
                                                  if (accessInfo.canDelete) {
                                                    handleStaffDelete(staffId);
                                                  } else {
                                                    toast.error('You do not have permission to delete staff members. Contact your VP for Approve access.');
                                                  }
                                                }}
                                                onView={(staff) => {
                                                  if (accessInfo.canRead) {
                                                    console.log('View staff:', staff);
                                                  } else {
                                                    toast.error('You do not have permission to view staff details.');
                                                  }
                                                }}
                                                onToggleRole={(staff) => {
                                                  if (accessInfo.canUpdate) {
                                                    handleRoleToggle(staff);
                                                  } else {
                                                    toast.error('You do not have permission to modify staff roles. Contact your VP for Edit or Approve access.');
                                                  }
                                                }}
                                                onTogglePermission={(staff) => {
                                                  if (accessInfo.canManage) {
                                                    handlePermissionToggle(staff);
                                                  } else {
                                                    toast.error('You do not have permission to manage staff permissions. Contact your VP for Approve access.');
                                                  }
                                                }}
                                                accessInfo={accessInfo}
                                              />
                                            </Grid>
                                          ))}
                                        </Grid>
                                      </>
                                    )}
                                  </>
                                );
                              })()}
                            </motion.div>
                          )}

                          {tab.label === 'Role Permissions' && (
                            <motion.div
                              key="permissions"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3 }}
                            >
                              {(() => {
                                const accessInfo = getAccessLevelInfo('User Management');
                                const isViewOnly = !hasEditAccess('User Management');
                                
                                return (
                                  <>
                                    {/* Access Level Banner */}
                                    <Alert 
                                      severity={accessInfo.level === 'Unauthorized' ? 'error' : isViewOnly ? 'warning' : 'info'} 
                                      sx={{ mb: 3 }}
                                    >
                                      <AlertTitle>Access Level: {getAccessType('User Management')}</AlertTitle>
                                      {isViewOnly && 'You have VIEW-ONLY access. You can view role permissions but cannot modify any settings.'}
                                      {accessInfo.level === 'Edit' && 'You can view and modify role permissions. Approval actions are not allowed.'}
                                      {accessInfo.level === 'Approve' && 'You have full access to manage role permissions including approvals.'}
                                      {accessInfo.level === 'Unauthorized' && 'You do not have access to role permission management.'}
                                    </Alert>

                                    <Paper sx={{ p: 3, bgcolor: isViewOnly ? '#fafafa' : 'white' }}>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6">Role Permission Matrix</Typography>
                                        {!isViewOnly && accessInfo.canUpdate && (
                                          <Button
                                            variant="outlined"
                                            startIcon={<EditIcon />}
                                            size="small"
                                            onClick={() => {
                                              if (accessInfo.canUpdate) {
                                                toast.info('Role permission editing feature coming soon');
                                              } else {
                                                toast.error('You do not have permission to edit role permissions. Contact your VP for Edit or Approve access.');
                                              }
                                            }}
                                            disabled={!accessInfo.canUpdate}
                                          >
                                            Edit Permissions
                                          </Button>
                                        )}
                                      </Box>
                                      <Table>
                                        <TableHead>
                                          <TableRow>
                                            <TableCell>Role</TableCell>
                                            <TableCell>Dashboard Access</TableCell>
                                            <TableCell>Record Management</TableCell>
                                            <TableCell>Report Generation</TableCell>
                                            <TableCell>Admin Access</TableCell>
                                            {!isViewOnly && accessInfo.canUpdate && <TableCell>Actions</TableCell>}
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
                                                {!isViewOnly && accessInfo.canUpdate && (
                                                  <TableCell>
                                                    <IconButton 
                                                      size="small"
                                                      onClick={() => {
                                                        if (accessInfo.canUpdate) {
                                                          toast.info(`Edit permissions for ${role} role`);
                                                        } else {
                                                          toast.error('You do not have permission to edit role permissions. Contact your VP for Edit or Approve access.');
                                                        }
                                                      }}
                                                      title={`Edit ${role} role permissions`}
                                                      disabled={!accessInfo.canUpdate}
                                                    >
                                                      <EditIcon />
                                                    </IconButton>
                                                  </TableCell>
                                                )}
                                              </TableRow>
                                            );
                                          })}
                                        </TableBody>
                                      </Table>
                                      
                                      {isViewOnly && (
                                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                                          <Alert severity="warning" sx={{ maxWidth: 600, mx: 'auto' }}>
                                            <AlertTitle>View Only Access</AlertTitle>
                                            You can only view role permissions. To modify settings, contact your Vice Principal for Edit or Approve access.
                                          </Alert>
                                        </Box>
                                      )}
                                    </Paper>
                                  </>
                                );
                              })()}
                            </motion.div>
                          )}

                          {tab.label === 'Feature Permissions' && (
                            <motion.div
                              key="feature-permissions"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3 }}
                            >
                              {(() => {
                                const accessInfo = getAccessLevelInfo('Permissions');
                                const isViewOnly = !hasEditAccess('Permissions');
                                
                                return (
                                  <>
                                    {/* Access Level Banner */}
                                    <Alert 
                                      severity={accessInfo.level === 'Unauthorized' ? 'error' : isViewOnly ? 'warning' : 'info'} 
                                      sx={{ mb: 3 }}
                                    >
                                      <AlertTitle>Access Level: {getAccessType('Permissions')}</AlertTitle>
                                      {isViewOnly && 'You have VIEW-ONLY access. You can view feature permissions but cannot modify any settings.'}
                                      {accessInfo.level === 'Edit' && 'You can view and modify feature permissions. Approval actions are not allowed.'}
                                      {accessInfo.level === 'Approve' && 'You have full access to manage feature permissions including approvals.'}
                                      {accessInfo.level === 'Unauthorized' && 'You do not have access to feature permission management.'}
                                    </Alert>

                                    <Paper sx={{ p: 3, bgcolor: isViewOnly ? '#fafafa' : 'white' }}>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                        <Typography variant="h6">Feature Permission Management</Typography>
                                        {!isViewOnly && accessInfo.canManage && (
                                          <Button
                                            variant="contained"
                                            startIcon={<SecurityIcon />}
                                            onClick={() => {
                                              if (accessInfo.canManage) {
                                                handleQuickAction('bulk_permissions');
                                              } else {
                                                toast.error('You do not have permission to perform bulk operations. Contact your VP for Approve access.');
                                              }
                                            }}
                                            disabled={!accessInfo.canManage}
                                          >
                                            Bulk Permissions
                                          </Button>
                                        )}
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
                                            {!isViewOnly && accessInfo.canUpdate && <TableCell>Actions</TableCell>}
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
                                              {!isViewOnly && accessInfo.canUpdate && (
                                                <TableCell>
                                                  <IconButton 
                                                    size="small" 
                                                    onClick={() => {
                                                      if (accessInfo.canUpdate) {
                                                        handlePermissionToggle(staff);
                                                      } else {
                                                        toast.error('You do not have permission to edit permissions. Contact your VP for Edit or Approve access.');
                                                      }
                                                    }}
                                                    sx={{ color: theme.palette.primary.main }}
                                                    title="Edit staff permissions"
                                                    disabled={!accessInfo.canUpdate}
                                                  >
                                                    <SecurityIcon />
                                                  </IconButton>
                                                </TableCell>
                                              )}
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                      
                                      {isViewOnly && (
                                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                                          <Alert severity="warning" sx={{ maxWidth: 600, mx: 'auto' }}>
                                            <AlertTitle>View Only Access</AlertTitle>
                                            You can only view feature permissions. To modify settings, contact your Vice Principal for Edit or Approve access.
                                          </Alert>
                                        </Box>
                                      )}
                                    </Paper>
                                  </>
                                );
                              })()}
                            </motion.div>
                          )}

                          {tab.label === 'Permission' && (
                            <motion.div
                              key="permission-tab"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3 }}
                            >
                              {(() => {
                                const accessInfo = getAccessLevelInfo('Permissions');
                                const isViewOnly = !hasEditAccess('Permissions');
                                
                                return (
                                  <>
                                    {/* Access Level Banner */}
                                    <Alert 
                                      severity={accessInfo.level === 'Unauthorized' ? 'error' : isViewOnly ? 'warning' : 'info'} 
                                      sx={{ mb: 3 }}
                                    >
                                      <AlertTitle>Access Level: {getAccessType('Permissions')}</AlertTitle>
                                      {isViewOnly && 'You have VIEW-ONLY access. You can view staff permissions but cannot modify any settings.'}
                                      {accessInfo.level === 'Edit' && 'You can view and modify staff permissions. Approval actions are not allowed.'}
                                      {accessInfo.level === 'Approve' && 'You have full access to manage staff permissions including approvals.'}
                                      {accessInfo.level === 'Unauthorized' && 'You do not have access to permission management.'}
                                    </Alert>

                                    <Paper sx={{ p: 3, bgcolor: isViewOnly ? '#fafafa' : 'white' }}>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6">Staff Permission Management</Typography>
                                        {!isViewOnly && accessInfo.canManage && (
                                          <Button
                                            variant="outlined"
                                            startIcon={<SecurityIcon />}
                                            size="small"
                                            onClick={() => {
                                              if (accessInfo.canManage) {
                                                toast.info('Bulk permission management feature coming soon');
                                              } else {
                                                toast.error('You do not have permission to perform bulk operations. Contact your VP for Approve access.');
                                              }
                                            }}
                                          >
                                            Bulk Manage
                                          </Button>
                                        )}
                                      </Box>
                                      <Table>
                                        <TableHead>
                                          <TableRow>
                                            <TableCell>Staff Member</TableCell>
                                            <TableCell>Role(s)</TableCell>
                                            <TableCell>Email</TableCell>
                                            {!isViewOnly && accessInfo.canUpdate && <TableCell>Actions</TableCell>}
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
                                                {staff.assignedRoles && staff.assignedRoles.length > 0
                                                  ? staff.assignedRoles.map(role => (
                                                      <Chip key={role} label={role} size="small" sx={{ mr: 0.5, bgcolor: roleColors[role], color: '#fff' }} />
                                                    ))
                                                  : <Chip label="No Roles" size="small" color="default" />}
                                              </TableCell>
                                              <TableCell>{staff.email}</TableCell>
                                              {!isViewOnly && accessInfo.canUpdate && (
                                                <TableCell>
                                                  <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<SecurityIcon />}
                                                    onClick={() => {
                                                      if (accessInfo.canUpdate) {
                                                        handlePermissionToggle(staff);
                                                      } else {
                                                        toast.error('You do not have permission to edit permissions. Contact your VP for Edit or Approve access.');
                                                      }
                                                    }}
                                                    title="Edit staff permissions"
                                                    disabled={!accessInfo.canUpdate}
                                                  >
                                                    Edit Permissions
                                                  </Button>
                                                </TableCell>
                                              )}
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                      
                                      {isViewOnly && (
                                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                                          <Alert severity="warning" sx={{ maxWidth: 600, mx: 'auto' }}>
                                            <AlertTitle>View Only Access</AlertTitle>
                                            You can only view staff permissions. To modify settings, contact your Vice Principal for Edit or Approve access.
                                          </Alert>
                                        </Box>
                                      )}
                                    </Paper>
                                  </>
                                );
                              })()}
                            </motion.div>
                          )}

                          {tab.label === 'Service Requests' && (
                            <motion.div
                              key="service-requests"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3 }}
                            >
                              {(() => {
                                const accessInfo = getAccessLevelInfo('Service Requests');
                                const isViewOnly = !hasEditAccess('Service Requests');
                                
                                return (
                                  <>
                                    {/* Access Level Banner */}
                                    <Alert 
                                      severity={accessInfo.level === 'Unauthorized' ? 'error' : isViewOnly ? 'warning' : 'info'} 
                                      sx={{ mb: 3 }}
                                    >
                                      <AlertTitle>Access Level: {getAccessType('Service Requests')}</AlertTitle>
                                      {isViewOnly && 'You have VIEW-ONLY access. You can view service requests but cannot process or approve them.'}
                                      {accessInfo.level === 'Edit' && 'You can view and process service requests. Approval actions are not allowed.'}
                                      {accessInfo.level === 'Approve' && 'You have full access to manage service requests including approvals.'}
                                      {accessInfo.level === 'Unauthorized' && 'You do not have access to service request management.'}
                                    </Alert>

                                    {/* Pass access info to the service requests component */}
                                    <A_ServiceRequests accessInfo={accessInfo} isViewOnly={isViewOnly} />
                                  </>
                                );
                              })()}
                            </motion.div>
                          )}
                        </Box>
                      )}
                    </motion.div>
                  );
                })
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