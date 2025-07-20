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
  Notifications as NotificationIcon
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
const StaffCard = ({ staff, onEdit, onDelete, onView, onToggleRole }) => {
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
    addStaffMember, 
    removeStaffMember,
    updateStaffStatus 
  } = useStaffPermissions();

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [roleDialog, setRoleDialog] = useState(false);
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

  const handleRoleSave = async (staffId, newRoles) => {
    const result = await updateStaffRoles(staffId, newRoles);
    if (result.success) {
      toast.success('Staff roles updated successfully');
    } else {
      toast.error(result.error || 'Failed to update staff roles');
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
            <Tooltip title="Notifications">
              <IconButton color="inherit">
                <Badge badgeContent={3} color="error">
                  <NotificationIcon />
                </Badge>
              </IconButton>
            </Tooltip>
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

        {/* Main Content Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Overview" icon={<DashboardIcon />} />
            <Tab label="Staff Management" icon={<PeopleIcon />} />
            <Tab label="Role Permissions" icon={<SecurityIcon />} />
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
        </AnimatePresence>

        {/* Role Permission Manager Dialog */}
        <RolePermissionManager
          staff={selectedStaff}
          open={roleDialog}
          onClose={() => setRoleDialog(false)}
          onSave={handleRoleSave}
        />
      </Box>
    </Box>
  );
};

export default AdminDashboard; 