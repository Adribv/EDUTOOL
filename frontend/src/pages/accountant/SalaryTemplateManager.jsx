import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountantAPI } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
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
  Alert,
  Snackbar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Slider,
  LinearProgress,
  Fab,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  Engineering as EngineeringIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  AttachMoney as MoneyIcon,
  Percent as PercentIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  History as HistoryIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import { toast } from 'react-toastify';

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
          ₹{value.toLocaleString('en-IN')}
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

// Salary Template Card Component
const SalaryTemplateCard = ({ template, onEdit, onDelete, onView, isSelected }) => {
  const theme = useTheme();
  
  const getRoleIcon = (role) => {
    switch (role) {
      case 'Teacher': return <SchoolIcon color="primary" />;
      case 'HOD': return <BusinessIcon color="primary" />;
      case 'AdminStaff': return <AdminIcon color="primary" />;
      case 'Accountant': return <MoneyIcon color="primary" />;
      case 'Principal': return <PersonIcon color="primary" />;
      case 'VicePrincipal': return <EngineeringIcon color="primary" />;
      case 'ITAdmin': return <AdminIcon color="primary" />;
      case 'Counsellor': return <PersonIcon color="primary" />;
      case 'ClassCoord': return <SchoolIcon color="primary" />;
      default: return <PersonIcon color="primary" />;
    }
  };

  const totalAllowances = Object.values(template.allowances).reduce((sum, val) => sum + (val || 0), 0);
  const totalDeductions = Object.values(template.deductions).reduce((sum, val) => sum + (val || 0), 0);
  const grossSalary = template.basicSalary + totalAllowances;
  const netSalary = grossSalary - totalDeductions;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        sx={{ 
          cursor: 'pointer',
          border: isSelected ? '2px solid' : '1px solid',
          borderColor: isSelected ? 'primary.main' : 'divider',
          bgcolor: isSelected ? 'primary.50' : 'background.paper',
          position: 'relative'
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {getRoleIcon(template.role)}
            <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
              {template.roleDisplayName}
            </Typography>
            <Chip 
              label={`v${template.version}`} 
              size="small" 
              color="secondary" 
              sx={{ ml: 'auto' }}
            />
          </Box>
          
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
            ₹{template.basicSalary.toLocaleString('en-IN')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Basic Salary
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="success.main">
              + ₹{totalAllowances.toLocaleString('en-IN')} Allowances
            </Typography>
            <Typography variant="body2" color="error.main">
              - ₹{totalDeductions.toLocaleString('en-IN')} Deductions
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
              Net: ₹{netSalary.toLocaleString('en-IN')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <IconButton size="small" onClick={() => onView(template)}>
              <ViewIcon />
            </IconButton>
            <IconButton size="small" onClick={() => onEdit(template)}>
              <EditIcon />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(template)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Enhanced Salary Template Manager
const SalaryTemplateManager = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateDialog, setTemplateDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    role: '',
    roleDisplayName: '',
    basicSalary: '',
    allowances: {
      houseRentAllowance: 0,
      dearnessAllowance: 0,
      transportAllowance: 0,
      medicalAllowance: 0,
      otherAllowances: 0
    },
    deductions: {
      providentFund: 0,
      tax: 0,
      insurance: 0,
      otherDeductions: 0
    },
    description: '',
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: '',
    changeReason: ''
  });

  // Queries
  const { data: templates, isLoading: loadingTemplates } = useQuery({
    queryKey: ['salary-templates'],
    queryFn: accountantAPI.getSalaryTemplates
  });

  const { data: templateStats, isLoading: loadingStats } = useQuery({
    queryKey: ['salary-template-stats'],
    queryFn: accountantAPI.getSalaryTemplateStats
  });

  const { data: availableRoles, isLoading: loadingRoles } = useQuery({
    queryKey: ['available-roles'],
    queryFn: accountantAPI.getAvailableRoles
  });

  // Mutations
  const createTemplateMutation = useMutation({
    mutationFn: accountantAPI.createSalaryTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries(['salary-templates']);
      queryClient.invalidateQueries(['salary-template-stats']);
      setTemplateDialog(false);
      resetTemplateForm();
      toast.success('Salary template created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create salary template');
    }
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }) => accountantAPI.updateSalaryTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['salary-templates']);
      queryClient.invalidateQueries(['salary-template-stats']);
      setTemplateDialog(false);
      resetTemplateForm();
      toast.success('Salary template updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update salary template');
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: accountantAPI.deleteSalaryTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries(['salary-templates']);
      queryClient.invalidateQueries(['salary-template-stats']);
      toast.success('Salary template deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete salary template');
    }
  });

  // Helper functions
  const resetTemplateForm = () => {
    setTemplateForm({
      role: '',
      roleDisplayName: '',
      basicSalary: '',
      allowances: {
        houseRentAllowance: 0,
        dearnessAllowance: 0,
        transportAllowance: 0,
        medicalAllowance: 0,
        otherAllowances: 0
      },
      deductions: {
        providentFund: 0,
        tax: 0,
        insurance: 0,
        otherDeductions: 0
      },
      description: '',
      effectiveFrom: new Date().toISOString().split('T')[0],
      effectiveTo: '',
      changeReason: ''
    });
  };

  const calculateNetSalary = () => {
    const totalAllowances = Object.values(templateForm.allowances).reduce((sum, val) => sum + (val || 0), 0);
    const totalDeductions = Object.values(templateForm.deductions).reduce((sum, val) => sum + (val || 0), 0);
    const grossSalary = (templateForm.basicSalary || 0) + totalAllowances;
    return grossSalary - totalDeductions;
  };

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setEditMode(true);
    setTemplateForm({
      role: template.role,
      roleDisplayName: template.roleDisplayName,
      basicSalary: template.basicSalary,
      allowances: { ...template.allowances },
      deductions: { ...template.deductions },
      description: template.description,
      effectiveFrom: template.effectiveFrom ? new Date(template.effectiveFrom).toISOString().split('T')[0] : '',
      effectiveTo: template.effectiveTo ? new Date(template.effectiveTo).toISOString().split('T')[0] : '',
      changeReason: ''
    });
    setTemplateDialog(true);
  };

  const handleCreate = () => {
    setSelectedTemplate(null);
    setEditMode(false);
    resetTemplateForm();
    setTemplateDialog(true);
  };

  const handleDelete = (template) => {
    if (window.confirm(`Are you sure you want to delete the salary template for ${template.roleDisplayName}?`)) {
      deleteTemplateMutation.mutate(template._id);
    }
  };

  const handleView = (template) => {
    setSelectedTemplate(template);
    setEditMode(false);
    setTemplateForm({
      role: template.role,
      roleDisplayName: template.roleDisplayName,
      basicSalary: template.basicSalary,
      allowances: { ...template.allowances },
      deductions: { ...template.deductions },
      description: template.description,
      effectiveFrom: template.effectiveFrom ? new Date(template.effectiveFrom).toISOString().split('T')[0] : '',
      effectiveTo: template.effectiveTo ? new Date(template.effectiveTo).toISOString().split('T')[0] : '',
      changeReason: ''
    });
    setTemplateDialog(true);
  };

  const handleSubmit = () => {
    if (!templateForm.role || !templateForm.basicSalary) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editMode) {
      updateTemplateMutation.mutate({ id: selectedTemplate._id, data: templateForm });
    } else {
      createTemplateMutation.mutate(templateForm);
    }
  };

  if (loadingTemplates || loadingStats) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: theme.palette.grey[50] }}>
      {/* Header */}
      <Box sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
        color: 'white',
        p: 3,
        mb: 3
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Salary Template Management
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Manage salary templates for all roles with comprehensive statistics
            </Typography>
          </motion.div>
          <Fab
            color="secondary"
            onClick={handleCreate}
            sx={{ color: 'white' }}
          >
            <AddIcon />
          </Fab>
        </Box>
      </Box>

      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Statistics Cards */}
        {templateStats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <AnimatedStatCard
                icon={MoneyIcon}
                label="Total Templates"
                value={templateStats.totalTemplates}
                color={theme.palette.primary.main}
                subtitle="Active salary templates"
                delay={0.1}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <AnimatedStatCard
                icon={TrendingUpIcon}
                label="Average Basic Salary"
                value={templateStats.averageBasicSalary || 0}
                color={theme.palette.success.main}
                subtitle="Across all roles"
                delay={0.2}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <AnimatedStatCard
                icon={PercentIcon}
                label="Average Net Salary"
                value={templateStats.averageNetSalary || 0}
                color={theme.palette.info.main}
                subtitle="After deductions"
                delay={0.3}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <AnimatedStatCard
                icon={BarChartIcon}
                label="Total Gross Salary"
                value={templateStats.totalGrossSalary || 0}
                color={theme.palette.warning.main}
                subtitle="All templates combined"
                delay={0.4}
              />
            </Grid>
          </Grid>
        )}

        {/* Main Content Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Templates" icon={<SettingsIcon />} />
            <Tab label="Statistics" icon={<BarChartIcon />} />
            <Tab label="Role Distribution" icon={<PieChartIcon />} />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 0 && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Grid container spacing={3}>
                {templates?.map((template) => (
                  <Grid item xs={12} sm={6} md={4} key={template._id}>
                    <SalaryTemplateCard
                      template={template}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onView={handleView}
                      isSelected={selectedTemplate?._id === template._id}
                    />
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          )}

          {activeTab === 1 && (
            <motion.div
              key="statistics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, height: 400 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Salary Distribution by Role</Typography>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={templateStats?.roleDistribution || []}>
                        <XAxis dataKey="roleDisplayName" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="netSalary" fill={theme.palette.primary.main} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, height: 400 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Allowances vs Deductions</Typography>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Total Allowances', value: templateStats?.totalAllowances || 0, color: theme.palette.success.main },
                            { name: 'Total Deductions', value: templateStats?.totalDeductions || 0, color: theme.palette.error.main }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                        >
                          {[
                            { name: 'Total Allowances', value: templateStats?.totalAllowances || 0, color: theme.palette.success.main },
                            { name: 'Total Deductions', value: templateStats?.totalDeductions || 0, color: theme.palette.error.main }
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

          {activeTab === 2 && (
            <motion.div
              key="distribution"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Role-wise Salary Distribution</Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Role</TableCell>
                      <TableCell>Basic Salary</TableCell>
                      <TableCell>Total Allowances</TableCell>
                      <TableCell>Total Deductions</TableCell>
                      <TableCell>Net Salary</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {templateStats?.roleDistribution?.map((role) => (
                      <TableRow key={role.role}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {role.roleDisplayName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>₹{role.basicSalary.toLocaleString('en-IN')}</TableCell>
                        <TableCell>₹{role.totalAllowances.toLocaleString('en-IN')}</TableCell>
                        <TableCell>₹{role.totalDeductions.toLocaleString('en-IN')}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                            ₹{role.netSalary.toLocaleString('en-IN')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => {
                            const template = templates.find(t => t.role === role.role);
                            if (template) handleEdit(template);
                          }}>
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Template Dialog */}
        <Dialog open={templateDialog} onClose={() => setTemplateDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editMode ? 'Edit Salary Template' : 'Create Salary Template'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={templateForm.role}
                    onChange={(e) => {
                      const role = e.target.value;
                      const roleData = availableRoles?.find(r => r.value === role);
                      setTemplateForm({
                        ...templateForm,
                        role,
                        roleDisplayName: roleData?.label || role
                      });
                    }}
                    disabled={editMode}
                  >
                    {availableRoles?.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        {role.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Basic Salary"
                  type="number"
                  fullWidth
                  value={templateForm.basicSalary}
                  onChange={(e) => setTemplateForm({ ...templateForm, basicSalary: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Allowances</Typography>
                <Grid container spacing={2}>
                  {Object.entries(templateForm.allowances).map(([key, value]) => (
                    <Grid item xs={12} sm={6} md={4} key={key}>
                      <TextField
                        label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        type="number"
                        fullWidth
                        value={value}
                        onChange={(e) => setTemplateForm({
                          ...templateForm,
                          allowances: {
                            ...templateForm.allowances,
                            [key]: parseFloat(e.target.value) || 0
                          }
                        })}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Deductions</Typography>
                <Grid container spacing={2}>
                  {Object.entries(templateForm.deductions).map(([key, value]) => (
                    <Grid item xs={12} sm={6} md={4} key={key}>
                      <TextField
                        label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        type="number"
                        fullWidth
                        value={value}
                        onChange={(e) => setTemplateForm({
                          ...templateForm,
                          deductions: {
                            ...templateForm.deductions,
                            [key]: parseFloat(e.target.value) || 0
                          }
                        })}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              {editMode && (
                <Grid item xs={12}>
                  <TextField
                    label="Reason for Change"
                    multiline
                    rows={2}
                    fullWidth
                    value={templateForm.changeReason}
                    onChange={(e) => setTemplateForm({ ...templateForm, changeReason: e.target.value })}
                    helperText="Please provide a reason for the salary template changes"
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <Alert severity="info">
                  Net Salary: ₹{calculateNetSalary().toLocaleString('en-IN')}
                </Alert>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTemplateDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={createTemplateMutation.isLoading || updateTemplateMutation.isLoading}
            >
              {createTemplateMutation.isLoading || updateTemplateMutation.isLoading ? 'Saving...' : 'Save Template'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default SalaryTemplateManager; 