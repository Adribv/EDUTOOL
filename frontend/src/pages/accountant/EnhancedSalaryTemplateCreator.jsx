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
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Avatar,
  InputAdornment,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Tooltip,
  Fab,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  AttachMoney as MoneyIcon,
  Percent as PercentIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  Engineering as EngineeringIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Group as GroupIcon,
  Work as WorkIcon,
  AccountBalance as BankIcon,
  Receipt as ReceiptIcon,
  Calculate as CalculateIcon,
  Preview as PreviewIcon,
  Send as SendIcon
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

// Role Icon Component
const RoleIcon = ({ role }) => {
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

// Staff Card Component
const StaffCard = ({ staff, isSelected, onToggle }) => {
  const theme = useTheme();
  
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
        onClick={() => onToggle(staff._id)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Checkbox 
              checked={isSelected}
              onChange={() => onToggle(staff._id)}
              sx={{ mr: 1 }}
            />
            <Avatar sx={{ width: 40, height: 40, mr: 2 }}>
              {staff.name?.charAt(0) || 'S'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {staff.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {staff.employeeId} • {staff.department?.name || 'N/A'}
              </Typography>
            </Box>
            <Chip 
              label={staff.role} 
              size="small" 
              color="primary" 
              icon={<RoleIcon role={staff.role} />}
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {staff.designation || staff.role}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {staff.joiningDate ? new Date(staff.joiningDate).getFullYear() : 'N/A'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Enhanced Salary Template Creator
const EnhancedSalaryTemplateCreator = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();

  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    role: '',
    roleDisplayName: '',
    basicSalary: '',
    allowances: {
      houseRentAllowance: 0,
      dearnessAllowance: 0,
      transportAllowance: 0,
      medicalAllowance: 0,
      otherAllowances: 0,
      specialAllowance: 0,
      performanceAllowance: 0,
      educationAllowance: 0,
      uniformAllowance: 0
    },
    deductions: {
      providentFund: 0,
      tax: 0,
      insurance: 0,
      otherDeductions: 0,
      professionalTax: 0,
      loanDeduction: 0,
      advanceDeduction: 0,
      unionDues: 0
    },
    taxSettings: {
      taxSlab: '0-250000',
      taxPercentage: 0,
      surcharge: 0,
      educationCess: 4
    },
    pfSettings: {
      pfPercentage: 12,
      pfLimit: 15000,
      employerContribution: 12
    },
    benefits: {
      gratuity: true,
      leaveEncashment: true,
      bonus: true,
      healthInsurance: true,
      lifeInsurance: true
    },
    description: '',
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear()
  });

  // Queries
  const { data: availableRoles, isLoading: loadingRoles } = useQuery({
    queryKey: ['available-roles'],
    queryFn: accountantAPI.getAvailableRoles
  });

  const { data: staffByRole, isLoading: loadingStaff } = useQuery({
    queryKey: ['staff-by-role', selectedRole],
    queryFn: () => accountantAPI.getStaffByRole(selectedRole),
    enabled: !!selectedRole
  });

  const { data: roleStats, isLoading: loadingStats } = useQuery({
    queryKey: ['role-statistics'],
    queryFn: accountantAPI.getRoleStatistics
  });

  // Mutations
  const createTemplateMutation = useMutation({
    mutationFn: accountantAPI.createSalaryTemplate,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['salary-templates']);
      queryClient.invalidateQueries(['salary-template-stats']);
      queryClient.invalidateQueries(['role-statistics']);
      toast.success(`Salary template created successfully! Affects ${data.affectedStaff} staff members.`);
      setActiveStep(3); // Move to success step
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create salary template');
    }
  });

  const applyTemplateMutation = useMutation({
    mutationFn: accountantAPI.applyTemplateToStaff,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['staff-salary-records']);
      toast.success(`Template applied successfully! ${data.results.successful.length} staff members affected.`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to apply template to staff');
    }
  });

  // Helper functions
  const calculateNetSalary = () => {
    const basicSalary = parseFloat(templateForm.basicSalary) || 0;
    const totalAllowances = Object.values(templateForm.allowances).reduce((sum, val) => {
      const numVal = parseFloat(val) || 0;
      return sum + numVal;
    }, 0);
    const totalDeductions = Object.values(templateForm.deductions).reduce((sum, val) => {
      const numVal = parseFloat(val) || 0;
      return sum + numVal;
    }, 0);
    const grossSalary = basicSalary + totalAllowances;
    return grossSalary - totalDeductions;
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setSelectedStaff([]);
    const roleData = availableRoles?.find(r => r.value === role);
    setTemplateForm({
      ...templateForm,
      role,
      roleDisplayName: roleData?.label || role
    });
  };

  const handleStaffToggle = (staffId) => {
    setSelectedStaff(prev => 
      prev.includes(staffId) 
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  const handleNext = () => {
    if (activeStep === 0 && !selectedRole) {
      toast.error('Please select a role');
      return;
    }
    if (activeStep === 1 && selectedStaff.length === 0) {
      toast.error('Please select at least one staff member');
      return;
    }
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleCreateTemplate = () => {
    if (!templateForm.role || !templateForm.basicSalary) {
      toast.error('Please fill in all required fields');
      return;
    }

    createTemplateMutation.mutate(templateForm);
  };

  const handleApplyTemplate = () => {
    if (selectedStaff.length === 0) {
      toast.error('Please select staff members');
      return;
    }

    applyTemplateMutation.mutate({
      templateId: createTemplateMutation.data?.template?._id,
      staffIds: selectedStaff,
      month: templateForm.month,
      year: templateForm.year
    });
  };

  const steps = [
    'Select Role',
    'Select Staff',
    'Configure Salary',
    'Review & Create'
  ];

  if (loadingRoles || loadingStats) {
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Create Salary Template
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Set up comprehensive salary templates for roles and automatically assign to staff
          </Typography>
        </motion.div>
      </Box>

      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Stepper */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {activeStep === 0 && (
            <motion.div
              key="role-selection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Select Role for Salary Template</Typography>
                
                <Grid container spacing={3}>
                  {availableRoles?.map((role) => (
                    <Grid item xs={12} sm={6} md={4} key={role.value}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          border: selectedRole === role.value ? '2px solid' : '1px solid',
                          borderColor: selectedRole === role.value ? 'primary.main' : 'divider',
                          bgcolor: selectedRole === role.value ? 'primary.50' : 'background.paper'
                        }}
                        onClick={() => handleRoleChange(role.value)}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <RoleIcon role={role.value} />
                            <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
                              {role.label}
                            </Typography>
                          </Box>
                          
                          {roleStats?.statistics?.find(stat => stat.role === role.value) && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                {roleStats.statistics.find(stat => stat.role === role.value)?.staffCount || 0} staff members
                              </Typography>
                              {roleStats.statistics.find(stat => stat.role === role.value)?.hasTemplate && (
                                <Chip 
                                  label="Template exists" 
                                  size="small" 
                                  color="warning" 
                                  sx={{ mt: 1 }}
                                />
                              )}
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </motion.div>
          )}

          {activeStep === 1 && (
            <motion.div
              key="staff-selection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Select Staff Members for {templateForm.roleDisplayName}
                  </Typography>
                  <Chip 
                    label={`${selectedStaff.length} selected`} 
                    color="primary" 
                    icon={<PeopleIcon />}
                  />
                </Box>

                {loadingStaff ? (
                  <CircularProgress />
                ) : (
                  <Grid container spacing={2}>
                    {staffByRole?.staff?.map((staff) => (
                      <Grid item xs={12} sm={6} md={4} key={staff._id}>
                        <StaffCard
                          staff={staff}
                          isSelected={selectedStaff.includes(staff._id)}
                          onToggle={handleStaffToggle}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}

                {staffByRole?.staff?.length === 0 && (
                  <Alert severity="info">
                    No staff members found for the selected role.
                  </Alert>
                )}
              </Paper>
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div
              key="salary-configuration"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Configure Salary Details</Typography>
                
                <Grid container spacing={3}>
                  {/* Basic Salary */}
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

                  {/* Month and Year */}
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Month</InputLabel>
                      <Select
                        value={templateForm.month}
                        onChange={(e) => setTemplateForm({ ...templateForm, month: e.target.value })}
                      >
                        {['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                          <MenuItem key={month} value={month}>{month}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      label="Year"
                      type="number"
                      fullWidth
                      value={templateForm.year}
                      onChange={(e) => setTemplateForm({ ...templateForm, year: e.target.value })}
                    />
                  </Grid>

                  {/* Allowances */}
                  <Grid item xs={12}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Allowances</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
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
                      </AccordionDetails>
                    </Accordion>
                  </Grid>

                  {/* Deductions */}
                  <Grid item xs={12}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Deductions</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
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
                      </AccordionDetails>
                    </Accordion>
                  </Grid>

                  {/* Tax Settings */}
                  <Grid item xs={12}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Tax Settings</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                              <InputLabel>Tax Slab</InputLabel>
                              <Select
                                value={templateForm.taxSettings.taxSlab}
                                onChange={(e) => setTemplateForm({
                                  ...templateForm,
                                  taxSettings: {
                                    ...templateForm.taxSettings,
                                    taxSlab: e.target.value
                                  }
                                })}
                              >
                                <MenuItem value="0-250000">₹0 - ₹2,50,000 (0%)</MenuItem>
                                <MenuItem value="250001-500000">₹2,50,001 - ₹5,00,000 (5%)</MenuItem>
                                <MenuItem value="500001-1000000">₹5,00,001 - ₹10,00,000 (20%)</MenuItem>
                                <MenuItem value="1000000+">₹10,00,000+ (30%)</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              label="Education Cess (%)"
                              type="number"
                              fullWidth
                              value={templateForm.taxSettings.educationCess}
                              onChange={(e) => setTemplateForm({
                                ...templateForm,
                                taxSettings: {
                                  ...templateForm.taxSettings,
                                  educationCess: parseFloat(e.target.value) || 0
                                }
                              })}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                              }}
                            />
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>

                  {/* PF Settings */}
                  <Grid item xs={12}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Provident Fund Settings</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={4}>
                            <TextField
                              label="PF Percentage"
                              type="number"
                              fullWidth
                              value={templateForm.pfSettings.pfPercentage}
                              onChange={(e) => setTemplateForm({
                                ...templateForm,
                                pfSettings: {
                                  ...templateForm.pfSettings,
                                  pfPercentage: parseFloat(e.target.value) || 0
                                }
                              })}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              label="PF Limit"
                              type="number"
                              fullWidth
                              value={templateForm.pfSettings.pfLimit}
                              onChange={(e) => setTemplateForm({
                                ...templateForm,
                                pfSettings: {
                                  ...templateForm.pfSettings,
                                  pfLimit: parseFloat(e.target.value) || 0
                                }
                              })}
                              InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              label="Employer Contribution"
                              type="number"
                              fullWidth
                              value={templateForm.pfSettings.employerContribution}
                              onChange={(e) => setTemplateForm({
                                ...templateForm,
                                pfSettings: {
                                  ...templateForm.pfSettings,
                                  employerContribution: parseFloat(e.target.value) || 0
                                }
                              })}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                              }}
                            />
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>

                  {/* Benefits */}
                  <Grid item xs={12}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Benefits</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          {Object.entries(templateForm.benefits).map(([key, value]) => (
                            <Grid item xs={12} sm={6} md={4} key={key}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={value}
                                    onChange={(e) => setTemplateForm({
                                      ...templateForm,
                                      benefits: {
                                        ...templateForm.benefits,
                                        [key]: e.target.checked
                                      }
                                    })}
                                  />
                                }
                                label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>

                  {/* Summary */}
                  <Grid item xs={12}>
                    <Alert severity="info">
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        Salary Summary
                      </Typography>
                      <Typography variant="body2">
                        Basic Salary: ₹{templateForm.basicSalary || 0} | 
                        Total Allowances: ₹{Object.values(templateForm.allowances).reduce((sum, val) => sum + (val || 0), 0)} | 
                        Total Deductions: ₹{Object.values(templateForm.deductions).reduce((sum, val) => sum + (val || 0), 0)} | 
                        Net Salary: ₹{calculateNetSalary()}
                      </Typography>
                    </Alert>
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>
          )}

          {activeStep === 3 && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Review and Create Template</Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>Template Details</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Role:</strong> {templateForm.roleDisplayName}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Basic Salary:</strong> ₹{templateForm.basicSalary}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Net Salary:</strong> ₹{calculateNetSalary()}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Month/Year:</strong> {templateForm.month} {templateForm.year}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>Staff Assignment</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Selected Staff:</strong> {selectedStaff.length} members
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Total Cost:</strong> ₹{selectedStaff.length * calculateNetSalary()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<SaveIcon />}
                        onClick={handleCreateTemplate}
                        disabled={createTemplateMutation.isLoading}
                      >
                        {createTemplateMutation.isLoading ? 'Creating...' : 'Create Template'}
                      </Button>
                      
                      {createTemplateMutation.data && (
                        <Button
                          variant="outlined"
                          size="large"
                          startIcon={<SendIcon />}
                          onClick={handleApplyTemplate}
                          disabled={applyTemplateMutation.isLoading}
                        >
                          {applyTemplateMutation.isLoading ? 'Applying...' : 'Apply to Staff'}
                        </Button>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={activeStep === steps.length - 1}
          >
            {activeStep === steps.length - 2 ? 'Create Template' : 'Next'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default EnhancedSalaryTemplateCreator; 