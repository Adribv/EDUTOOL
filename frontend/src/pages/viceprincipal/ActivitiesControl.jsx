import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  TablePagination,
  Autocomplete,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  Badge,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Radio,
  RadioGroup,
  FormLabel,
  AccordionActions,
  Chip as MuiChip,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  Edit as EditAccessIcon,
  CheckCircle as ApproveIcon,
  Block as UnauthorizedIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  Event as EventIcon,
  Message as MessageIcon,
  School as SchoolIcon,
  Payment as PaymentIcon,
  Inventory as InventoryIcon,
  Notifications as NotificationsIcon,
  Group as GroupIcon,
  Warning as WarningIcon,
  RateReview as RateReviewIcon,
  AccountBalance as AccountBalanceIcon,
  Psychology as PsychologyIcon,
  CalendarToday as CalendarIcon,
  Approval as ApprovalIcon,
  Book as BookIcon,
  SupervisorAccount as SupervisorAccountIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  LocalShipping as LocalShippingIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { api } from '../../services/api';

// API service for activities control
const activitiesControlAPI = {
  getAllStaff: () => api.get('/vp/activities-control/staff').then(res => res.data),
  getStaffActivities: (staffId) => api.get(`/vp/activities-control/staff/${staffId}`).then(res => res.data),
  saveStaffActivities: (staffId, data) => api.post(`/vp/activities-control/staff/${staffId}`, data).then(res => res.data),
  deleteStaffActivities: (staffId) => api.delete(`/vp/activities-control/staff/${staffId}`).then(res => res.data),
  getAvailableActivities: () => api.get('/vp/activities-control/activities').then(res => res.data),
  bulkAssignActivities: (data) => api.post('/vp/activities-control/bulk-assign', data).then(res => res.data),
  getSummary: () => api.get('/vp/activities-control/summary').then(res => res.data),
};

// Activity icons mapping
const activityIcons = {
  'Staff Management': <PeopleIcon />,
  'Student Records': <SchoolIcon />,
  'Fee Management': <PaymentIcon />,
  'Inventory': <InventoryIcon />,
  'Events': <EventIcon />,
  'Communications': <MessageIcon />,
  'Classes': <SchoolIcon />,
  'System Settings': <SettingsIcon />,
  'User Management': <PeopleIcon />,
  'Permissions': <SecurityIcon />,
  'Reports': <AssessmentIcon />,
  'Enquiries': <MessageIcon />,
  'Visitors': <GroupIcon />,
  'Service Requests': <ApprovalIcon />,
  'Syllabus Completion': <RateReviewIcon />,
  'Salary Payroll': <AccountBalanceIcon />,
  'Audit Log': <AssessmentIcon />,
  'Assignments': <AssignmentIcon />,
  'Calendar': <CalendarIcon />,
  'Substitute Teacher Request': <ApprovalIcon />,
  'My Substitute Requests': <ApprovalIcon />,
  'Teacher Remarks': <RateReviewIcon />,
  'Counselling Request Form': <PsychologyIcon />,
  'Courses': <SchoolIcon />,
  'Student Assignments': <AssignmentIcon />,
  'Student Calendar': <CalendarIcon />,
  'Student Counselling Request Form': <PsychologyIcon />,
  'Principal Staff Management': <SupervisorAccountIcon />,
  'Principal Student Management': <SchoolIcon />,
  'School Management': <SettingsIcon />,
  'Academic Management': <BookIcon />,
  'Principal Approvals': <ApprovalIcon />,
  'Principal Reports': <AssessmentIcon />,
  'Department Management': <SchoolIcon />,
  'HOD Staff Management': <PeopleIcon />,
  'Course Management': <AssignmentIcon />,
  'HOD Reports': <AssessmentIcon />,
  'Lesson Plan Approvals': <ApprovalIcon />,
  'Counselling Requests': <PsychologyIcon />,
  'IT User Management': <PeopleIcon />,
  'IT Reports': <AssessmentIcon />,
  'IT System Settings': <SettingsIcon />
};

// Access level colors
const accessLevelColors = {
  'Unauthorized': 'error',
  'View': 'info',
  'Edit': 'warning',
  'Approve': 'success'
};

// Access level icons
const accessLevelIcons = {
  'Unauthorized': <UnauthorizedIcon />,
  'View': <VisibilityIcon />,
  'Edit': <EditAccessIcon />,
  'Approve': <ApproveIcon />
};

// Department enum values (should match backend model)
const departmentOptions = [
  'Academics',
  'Administration',
  'Support Staff',
  'IT',
  'Library',
  'Wellness',
  'Finance',
  'Admin'
];

export default function ActivitiesControl() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [formData, setFormData] = useState({
    department: '',
    remarks: ''
  });
  const [activityAssignments, setActivityAssignments] = useState([]);
  const [saveError, setSaveError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [bulkAssignDialog, setBulkAssignDialog] = useState(false);
  const [selectedStaffForBulk, setSelectedStaffForBulk] = useState([]);
  const [bulkActivityAssignments, setBulkActivityAssignments] = useState([]);
  const [bulkFormData, setBulkFormData] = useState({
    department: '',
    remarks: ''
  });

  const queryClient = useQueryClient();

  // Queries
  const { data: staffList, isLoading: loadingStaff, refetch: refetchStaff } = useQuery({
    queryKey: ['vpActivitiesControlStaff'],
    queryFn: activitiesControlAPI.getAllStaff
  });

  const { data: availableActivities, isLoading: loadingActivities } = useQuery({
    queryKey: ['vpAvailableActivities'],
    queryFn: activitiesControlAPI.getAvailableActivities
  });

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['vpActivitiesSummary'],
    queryFn: activitiesControlAPI.getSummary
  });

  // Mutations
  const saveActivitiesMutation = useMutation({
    mutationFn: ({ staffId, data }) => activitiesControlAPI.saveStaffActivities(staffId, data),
    onSuccess: () => {
      toast.success('Activities control saved successfully');
      queryClient.invalidateQueries(['vpActivitiesControlStaff']);
      queryClient.invalidateQueries(['vpActivitiesSummary']);
      handleCloseDialog();
    },
    onError: (error) => {
      setSaveError(error?.response?.data?.message || error.message || 'Unknown error');
      toast.error('Failed to save activities control');
    }
  });

  const deleteActivitiesMutation = useMutation({
    mutationFn: activitiesControlAPI.deleteStaffActivities,
    onSuccess: () => {
      toast.success('Activities control deleted successfully');
      queryClient.invalidateQueries(['vpActivitiesControlStaff']);
      queryClient.invalidateQueries(['vpActivitiesSummary']);
    },
    onError: (error) => {
      toast.error('Failed to delete activities control');
    }
  });

  const bulkAssignMutation = useMutation({
    mutationFn: activitiesControlAPI.bulkAssignActivities,
    onSuccess: (data) => {
      toast.success('Bulk assignment completed successfully');
      queryClient.invalidateQueries(['vpActivitiesControlStaff']);
      queryClient.invalidateQueries(['vpActivitiesSummary']);
      handleCloseBulkDialog();
    },
    onError: (error) => {
      toast.error('Failed to perform bulk assignment');
    }
  });

  // Filter staff based on search term
  const filteredStaff = staffList?.data?.filter(staff =>
    staff.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.department?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleActivityAssignmentChange = (activity, accessLevel) => {
    setActivityAssignments(prev => {
      const idx = prev.findIndex(a => a.activity === activity);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], accessLevel };
        return updated;
      } else {
        return [...prev, { activity, accessLevel }];
      }
    });
  };

  const handleRemoveActivityAssignment = (activity) => {
    setActivityAssignments(prev => prev.filter(a => a.activity !== activity));
  };

  const handleSaveActivities = async () => {
    setSaveError(null);
    if (!selectedStaff) {
      toast.error('Please select a staff member from the table first');
      handleCloseDialog();
      return;
    }

    const payload = {
      activityAssignments,
      department: formData.department,
      remarks: formData.remarks,
    };

    saveActivitiesMutation.mutate({ staffId: selectedStaff._id, data: payload });
  };

  const handleOpenDialog = (staff) => {
    setSelectedStaff(staff);
    setFormData({
      department: staff?.department || '',
      remarks: staff?.remarks || '',
    });
    setActivityAssignments(staff?.activityAssignments || []);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStaff(null);
    setActivityAssignments([]);
    setFormData({ department: '', remarks: '' });
    setSaveError(null);
  };

  const handleOpenBulkDialog = () => {
    setBulkAssignDialog(true);
    setSelectedStaffForBulk([]);
    setBulkActivityAssignments([]);
    setBulkFormData({ department: '', remarks: '' });
  };

  const handleCloseBulkDialog = () => {
    setBulkAssignDialog(false);
    setSelectedStaffForBulk([]);
    setBulkActivityAssignments([]);
    setBulkFormData({ department: '', remarks: '' });
  };

  const handleBulkActivityAssignmentChange = (activity, accessLevel) => {
    setBulkActivityAssignments(prev => {
      const idx = prev.findIndex(a => a.activity === activity);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], accessLevel };
        return updated;
      } else {
        return [...prev, { activity, accessLevel }];
      }
    });
  };

  const handleBulkAssign = async () => {
    if (selectedStaffForBulk.length === 0) {
      toast.error('Please select at least one staff member');
      return;
    }

    const payload = {
      staffIds: selectedStaffForBulk.map(staff => staff._id),
      activityAssignments: bulkActivityAssignments,
      department: bulkFormData.department,
      remarks: bulkFormData.remarks,
    };

    bulkAssignMutation.mutate(payload);
  };

  const getAccessLevelForActivity = (staff, activity) => {
    const assignment = staff.activityAssignments?.find(a => a.activity === activity);
    return assignment ? assignment.accessLevel : 'Unauthorized';
  };

  const getAccessLevelCount = (staff, level) => {
    return staff.activityAssignments?.filter(a => a.accessLevel === level).length || 0;
  };

  if (loadingStaff || loadingActivities || loadingSummary) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <SecurityIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h4" fontWeight={700}>Activities Control</Typography>
          <Chip label="VP Management" color="success" sx={{ ml: 2 }} />
        </Box>
        
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetchStaff()}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenBulkDialog}
          >
            Bulk Assign
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Staff</Typography>
              <Typography variant="h4" color="primary">
                {summary?.data?.totalStaff || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>With Activities</Typography>
              <Typography variant="h4" color="success">
                {summary?.data?.staffWithActivities || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>View Access</Typography>
              <Typography variant="h4" color="info">
                {summary?.data?.levelStats?.View || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Edit/Approve</Typography>
              <Typography variant="h4" color="warning">
                {(summary?.data?.levelStats?.Edit || 0) + (summary?.data?.levelStats?.Approve || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Staff Activities Control</Typography>
            <TextField
              size="small"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ width: 300 }}
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Staff Member</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Access Levels</TableCell>
                  <TableCell>Last Modified</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStaff
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((staff) => (
                    <TableRow key={staff._id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                            {staff.name?.charAt(0)?.toUpperCase() || 'S'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{staff.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {staff.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={staff.role} size="small" />
                      </TableCell>
                      <TableCell>{staff.department || 'N/A'}</TableCell>
                      <TableCell>
                        <Box display="flex" gap={1} flexWrap="wrap">
                          <Chip
                            label={`View: ${getAccessLevelCount(staff, 'View')}`}
                            size="small"
                            color="info"
                            variant="outlined"
                          />
                          <Chip
                            label={`Edit: ${getAccessLevelCount(staff, 'Edit')}`}
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                          <Chip
                            label={`Approve: ${getAccessLevelCount(staff, 'Approve')}`}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        {staff.lastModified ? new Date(staff.lastModified).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(staff)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete activities control for this staff member?')) {
                              deleteActivitiesMutation.mutate(staff._id);
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredStaff.length}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </CardContent>
      </Card>

      {/* Individual Staff Activities Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <SecurityIcon color="primary" />
            <Typography variant="h6">Activities Control</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Managing activities for {selectedStaff?.name}
          </Typography>
        </DialogTitle>
        
        <DialogContent dividers>
          {saveError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {saveError}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.department}
                  label="Department"
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <MenuItem value="">Select Department</MenuItem>
                  {departmentOptions.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Assign Activities & Access Levels
          </Typography>

          {availableActivities?.data?.groupedActivities && 
            Object.entries(availableActivities.data.groupedActivities).map(([category, activities]) => (
              <Accordion key={category} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {category}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {activities.map((activity) => {
                      const assigned = activityAssignments.find(a => a.activity === activity);
                      return (
                        <Grid item xs={12} md={6} key={activity}>
                          <Box display="flex" alignItems="center" gap={2} p={1} border={1} borderColor="divider" borderRadius={1}>
                            <Box sx={{ color: 'primary.main' }}>
                              {activityIcons[activity] || <AssignmentIcon />}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {activity}
                              </Typography>
                            </Box>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                              <Select
                                value={assigned ? assigned.accessLevel : 'Unauthorized'}
                                onChange={(e) => handleActivityAssignmentChange(activity, e.target.value)}
                                displayEmpty
                              >
                                <MenuItem value="Unauthorized">Unauthorized</MenuItem>
                                <MenuItem value="View">View</MenuItem>
                                <MenuItem value="Edit">Edit</MenuItem>
                                <MenuItem value="Approve">Approve</MenuItem>
                              </Select>
                            </FormControl>
                            {assigned && assigned.accessLevel !== 'Unauthorized' && (
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveActivityAssignment(activity)}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleSaveActivities}
            disabled={saveActivitiesMutation.isPending}
            startIcon={saveActivitiesMutation.isPending ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            {saveActivitiesMutation.isPending ? 'Saving...' : 'Save Activities'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Assign Dialog */}
      <Dialog open={bulkAssignDialog} onClose={handleCloseBulkDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <PeopleIcon color="primary" />
            <Typography variant="h6">Bulk Assign Activities</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Select Staff Members
              </Typography>
              <Autocomplete
                multiple
                options={staffList?.data || []}
                getOptionLabel={(option) => `${option.name} (${option.role})`}
                value={selectedStaffForBulk}
                onChange={(event, newValue) => setSelectedStaffForBulk(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Staff"
                    placeholder="Choose staff members..."
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.main' }}>
                      {option.name?.charAt(0)?.toUpperCase() || 'S'}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">{option.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.role} • {option.department}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Department</InputLabel>
                <Select
                  value={bulkFormData.department}
                  label="Department"
                  onChange={(e) => setBulkFormData({ ...bulkFormData, department: e.target.value })}
                >
                  <MenuItem value="">Select Department</MenuItem>
                  {departmentOptions.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Remarks"
                value={bulkFormData.remarks}
                onChange={(e) => setBulkFormData({ ...bulkFormData, remarks: e.target.value })}
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Assign Activities & Access Levels
          </Typography>

          {availableActivities?.data?.groupedActivities && 
            Object.entries(availableActivities.data.groupedActivities).map(([category, activities]) => (
              <Accordion key={category} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {category}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {activities.map((activity) => {
                      const assigned = bulkActivityAssignments.find(a => a.activity === activity);
                      return (
                        <Grid item xs={12} md={6} key={activity}>
                          <Box display="flex" alignItems="center" gap={2} p={1} border={1} borderColor="divider" borderRadius={1}>
                            <Box sx={{ color: 'primary.main' }}>
                              {activityIcons[activity] || <AssignmentIcon />}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {activity}
                              </Typography>
                            </Box>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                              <Select
                                value={assigned ? assigned.accessLevel : 'Unauthorized'}
                                onChange={(e) => handleBulkActivityAssignmentChange(activity, e.target.value)}
                                displayEmpty
                              >
                                <MenuItem value="Unauthorized">Unauthorized</MenuItem>
                                <MenuItem value="View">View</MenuItem>
                                <MenuItem value="Edit">Edit</MenuItem>
                                <MenuItem value="Approve">Approve</MenuItem>
                              </Select>
                            </FormControl>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseBulkDialog}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleBulkAssign}
            disabled={bulkAssignMutation.isPending || selectedStaffForBulk.length === 0}
            startIcon={bulkAssignMutation.isPending ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            {bulkAssignMutation.isPending ? 'Assigning...' : `Assign to ${selectedStaffForBulk.length} Staff`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 