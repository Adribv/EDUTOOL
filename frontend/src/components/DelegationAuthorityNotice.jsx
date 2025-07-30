import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  DateRange as DateRangeIcon,
  Security as SecurityIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  SupervisorAccount as SupervisorAccountIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { delegationAuthorityAPI } from '../services/api';



export default function DelegationAuthorityNotice() {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const queryClient = useQueryClient();

  // State management
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalData, setApprovalData] = useState({
    comments: '',
    effectiveDate: new Date().toISOString().split('T')[0]
  });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    delegatorName: '',
    delegatorPosition: '',
    delegatorDepartment: '',
    delegateName: '',
    delegatePosition: '',
    delegateDepartment: '',
    delegationType: '',
    authorityScope: '',
    responsibilities: '',
    limitations: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    conditions: '',
    reportingStructure: '',
    emergencyContact: '',
    approvalRequired: false,
    status: 'Draft'
  });

  // Queries
  const { data: notices, isLoading: noticesLoading } = useQuery({
    queryKey: ['delegationNotices'],
    queryFn: delegationAuthorityAPI.getAllNotices,
    staleTime: 5 * 60 * 1000,
  });

  const { data: pendingNotices, isLoading: pendingLoading } = useQuery({
    queryKey: ['pendingDelegationNotices'],
    queryFn: delegationAuthorityAPI.getPendingNotices,
    staleTime: 2 * 60 * 1000,
  });

  const { data: staffMembers, isLoading: staffLoading, error: staffError } = useQuery({
    queryKey: ['delegationStaff'],
    queryFn: delegationAuthorityAPI.getStaffMembers,
    staleTime: 10 * 60 * 1000,
    onSuccess: (data) => {
      console.log('✅ Staff members loaded:', data?.length || 0, 'members');
    },
    onError: (error) => {
      console.error('❌ Error loading staff members:', error);
    }
  });

  const { data: departments, isLoading: departmentsLoading } = useQuery({
    queryKey: ['delegationDepartments'],
    queryFn: delegationAuthorityAPI.getDepartments,
    staleTime: 10 * 60 * 1000,
    onSuccess: (data) => {
      console.log('✅ Departments loaded:', data?.length || 0, 'departments');
    },
    onError: (error) => {
      console.error('❌ Error loading departments:', error);
    }
  });

  // Mutations
  const createNoticeMutation = useMutation({
    mutationFn: delegationAuthorityAPI.createNotice,
    onSuccess: () => {
      queryClient.invalidateQueries(['delegationNotices']);
      queryClient.invalidateQueries(['pendingDelegationNotices']);
      setDialogOpen(false);
      resetForm();
      toast.success('Delegation authority notice created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create notice');
    },
  });

  const updateNoticeMutation = useMutation({
    mutationFn: ({ id, data }) => delegationAuthorityAPI.updateNotice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['delegationNotices']);
      queryClient.invalidateQueries(['pendingDelegationNotices']);
      setDialogOpen(false);
      resetForm();
      toast.success('Delegation authority notice updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update notice');
    },
  });

  const deleteNoticeMutation = useMutation({
    mutationFn: delegationAuthorityAPI.deleteNotice,
    onSuccess: () => {
      queryClient.invalidateQueries(['delegationNotices']);
      queryClient.invalidateQueries(['pendingDelegationNotices']);
      toast.success('Delegation authority notice deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete notice');
    },
  });

  const approveNoticeMutation = useMutation({
    mutationFn: ({ id, data }) => delegationAuthorityAPI.approveNotice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['delegationNotices']);
      queryClient.invalidateQueries(['pendingDelegationNotices']);
      setApprovalDialogOpen(false);
      toast.success('Delegation authority notice approved successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to approve notice');
    },
  });

  const rejectNoticeMutation = useMutation({
    mutationFn: ({ id, data }) => delegationAuthorityAPI.rejectNotice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['delegationNotices']);
      queryClient.invalidateQueries(['pendingDelegationNotices']);
      setApprovalDialogOpen(false);
      toast.success('Delegation authority notice rejected');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reject notice');
    },
  });

  // Helper functions
  const resetForm = () => {
    setFormData({
      title: '',
      delegatorName: '',
      delegatorPosition: '',
      delegatorDepartment: '',
      delegateName: '',
      delegatePosition: '',
      delegateDepartment: '',
      delegationType: '',
      authorityScope: '',
      responsibilities: '',
      limitations: '',
      effectiveDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      conditions: '',
      reportingStructure: '',
      emergencyContact: '',
      approvalRequired: false,
      status: 'Draft'
    });
    setIsEditMode(false);
  };



  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log('🔄 Form change:', { name, value, type, checked });
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      
      // Auto-populate position when staff member is selected
      if (name === 'delegatorName' && value) {
        const selectedStaff = staffMembers?.find(staff => staff.name === value);
        if (selectedStaff) {
          newData.delegatorPosition = selectedStaff.designation || selectedStaff.role || '';
          newData.delegatorDepartment = selectedStaff.department?.name || '';
        }
      }
      
      if (name === 'delegateName' && value) {
        const selectedStaff = staffMembers?.find(staff => staff.name === value);
        if (selectedStaff) {
          newData.delegatePosition = selectedStaff.designation || selectedStaff.role || '';
          newData.delegateDepartment = selectedStaff.department?.name || '';
        }
      }
      
      console.log('📝 Updated form data:', newData);
      return newData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('🔍 Form submission debug:', {
      staffMembers: staffMembers?.length || 0,
      departments: departments?.length || 0,
      formData: formData,
      delegateName: formData.delegateName,
      staffError: staffError?.message
    });
    
    // Check if required data is loaded
    if (!staffMembers || staffMembers.length === 0) {
      toast.error('Staff members data is not loaded yet. Please wait and try again.');
      return;
    }
    
    if (!departments || departments.length === 0) {
      toast.error('Departments data is not loaded yet. Please wait and try again.');
      return;
    }
    
         // Client-side validation
     const requiredFields = ['title', 'delegatorName', 'delegatorPosition', 'delegatorDepartment', 'delegateName', 'delegatePosition', 'delegateDepartment', 'delegationType', 'authorityScope', 'responsibilities', 'effectiveDate'];
     const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');
    
    if (missingFields.length > 0) {
      console.log('❌ Missing fields:', missingFields);
      console.log('❌ Form data values:', requiredFields.map(field => ({ field, value: formData[field] })));
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    if (isEditMode) {
      updateNoticeMutation.mutate({ id: selectedNotice._id, data: formData });
    } else {
      createNoticeMutation.mutate(formData);
    }
  };

  const handleEdit = (notice) => {
    setSelectedNotice(notice);
    setFormData({
      title: notice.title || '',
      delegatorName: notice.delegatorName || '',
      delegatorPosition: notice.delegatorPosition || '',
      delegatorDepartment: notice.delegatorDepartment || '',
      delegateName: notice.delegateName || '',
      delegatePosition: notice.delegatePosition || '',
      delegateDepartment: notice.delegateDepartment || '',
      delegationType: notice.delegationType || '',
      authorityScope: notice.authorityScope || '',
      responsibilities: notice.responsibilities || '',
      limitations: notice.limitations || '',
      effectiveDate: notice.effectiveDate ? new Date(notice.effectiveDate).toISOString().split('T')[0] : '',
      expiryDate: notice.expiryDate ? new Date(notice.expiryDate).toISOString().split('T')[0] : '',
      conditions: notice.conditions || '',
      reportingStructure: notice.reportingStructure || '',
      emergencyContact: notice.emergencyContact || '',
      approvalRequired: notice.approvalRequired || false,
      status: notice.status || 'Draft'
    });
    setIsEditMode(true);
    setDialogOpen(true);
  };

  const handleView = (notice) => {
    setSelectedNotice(notice);
    setViewDialogOpen(true);
  };

  const handleDelete = (notice) => {
    if (window.confirm('Are you sure you want to delete this delegation authority notice?')) {
      deleteNoticeMutation.mutate(notice._id);
    }
  };

  const handleApproval = (notice, action) => {
    setSelectedNotice(notice);
    setApprovalData({
      comments: '',
      effectiveDate: new Date().toISOString().split('T')[0]
    });
    setApprovalDialogOpen(true);
  };

  const handleApprovalSubmit = (action) => {
    if (action === 'approve') {
      approveNoticeMutation.mutate({ 
        id: selectedNotice._id, 
        data: approvalData 
      });
    } else {
      rejectNoticeMutation.mutate({ 
        id: selectedNotice._id, 
        data: approvalData 
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Pending': return 'warning';
      case 'Rejected': return 'error';
      case 'Draft': return 'default';
      default: return 'default';
    }
  };

  const canApprove = () => {
    return ['Principal', 'VicePrincipal'].includes(user?.role);
  };

  const canCreate = () => {
    return ['Principal', 'VicePrincipal', 'HOD'].includes(user?.role);
  };

  if (noticesLoading || pendingLoading || staffLoading || departmentsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <SecurityIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h4" fontWeight={700}>
            Delegation Authority Notice
          </Typography>
        </Box>
        {canCreate() && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
            size={isMobile ? 'small' : 'medium'}
          >
            Create Notice
          </Button>
        )}
      </Box>

      {/* Pending Approvals Alert */}
      {pendingNotices?.length > 0 && canApprove() && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Pending Approvals ({pendingNotices.length})
          </Typography>
          <Typography variant="body2">
            You have {pendingNotices.length} delegation authority notice(s) pending your approval.
          </Typography>
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <DescriptionIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary">
                {notices?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Notices
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
                              <WarningIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {pendingNotices?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Approval
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
                              <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {notices?.filter(n => n.status === 'Approved').length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Approved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
                              <ScheduleIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {notices?.filter(n => n.status === 'Active').length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Delegations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Notices Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Delegator</TableCell>
                <TableCell>Delegate</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Effective Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notices?.map((notice) => (
                <TableRow key={notice._id}>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {notice.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {notice.delegatorName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {notice.delegatorPosition} - {notice.delegatorDepartment}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {notice.delegateName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {notice.delegatePosition} - {notice.delegateDepartment}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={notice.delegationType} 
                      size="small" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(notice.effectiveDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={notice.status} 
                      color={getStatusColor(notice.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleView(notice)}
                        title="View Details"
                      >
                        <ViewIcon />
                      </IconButton>
                      {canCreate() && notice.status === 'Draft' && (
                        <IconButton 
                          size="small" 
                          onClick={() => handleEdit(notice)}
                          title="Edit"
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                      {canCreate() && notice.status === 'Draft' && (
                        <IconButton 
                          size="small" 
                          onClick={() => handleDelete(notice)}
                          title="Delete"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                      {canApprove() && notice.status === 'Pending' && (
                        <IconButton 
                          size="small" 
                          color="success"
                          onClick={() => handleApproval(notice, 'approve')}
                          title="Approve"
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      )}
                      {canApprove() && notice.status === 'Pending' && (
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleApproval(notice, 'reject')}
                          title="Reject"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {isEditMode ? 'Edit Delegation Authority Notice' : 'Create Delegation Authority Notice'}
        </DialogTitle>
        <DialogContent>
          {(staffLoading || departmentsLoading) && (
            <Box display="flex" justifyContent="center" alignItems="center" py={3}>
              <CircularProgress />
              <Typography variant="body2" sx={{ ml: 2 }}>
                Loading form data...
              </Typography>
            </Box>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={3} sx={{ opacity: (staffLoading || departmentsLoading) ? 0.6 : 1, pointerEvents: (staffLoading || departmentsLoading) ? 'none' : 'auto' }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notice Title"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  required
                />
              </Grid>
              
              {/* Delegator Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Delegator Information
                </Typography>
              </Grid>
                             <Grid item xs={12} md={4}>
                 <FormControl fullWidth required>
                   <InputLabel>Delegator Name</InputLabel>
                   <Select
                     name="delegatorName"
                     value={formData.delegatorName || ''}
                     onChange={handleFormChange}
                     label="Delegator Name"
                     displayEmpty
                   >
                     <MenuItem value="" disabled>
                       <em>Select a delegator</em>
                     </MenuItem>
                     {staffMembers?.map((staff) => (
                       <MenuItem key={staff._id} value={staff.name}>
                         {staff.name} - {staff.designation || staff.role} ({staff.department?.name || 'No Department'})
                       </MenuItem>
                     ))}
                   </Select>
                 </FormControl>
               </Grid>
               <Grid item xs={12} md={4}>
                 <TextField
                   fullWidth
                   label="Position"
                   name="delegatorPosition"
                   value={formData.delegatorPosition}
                   onChange={handleFormChange}
                   required
                   InputProps={{
                     readOnly: true,
                   }}
                   helperText="Auto-populated from staff selection"
                 />
               </Grid>
               <Grid item xs={12} md={4}>
                 <TextField
                   fullWidth
                   label="Department"
                   name="delegatorDepartment"
                   value={formData.delegatorDepartment}
                   onChange={handleFormChange}
                   required
                   InputProps={{
                     readOnly: true,
                   }}
                   helperText="Auto-populated from staff selection"
                 />
               </Grid>

              {/* Delegate Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Delegate Information
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth required>
                  <InputLabel>Delegate Name</InputLabel>
                                     <Select
                     name="delegateName"
                     value={formData.delegateName || ''}
                     onChange={handleFormChange}
                     label="Delegate Name"
                     displayEmpty
                     error={!formData.delegateName && formData.delegateName !== undefined}
                   >
                    <MenuItem value="" disabled>
                      <em>Select a delegate</em>
                    </MenuItem>
                                         {staffMembers?.map((staff) => (
                       <MenuItem key={staff._id} value={staff.name}>
                         {staff.name} - {staff.designation || staff.role} ({staff.department?.name || 'No Department'})
                       </MenuItem>
                     ))}
                     {process.env.NODE_ENV === 'development' && (
                       <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                         Available staff: {staffMembers?.map(s => s.name).join(', ')}
                       </Typography>
                     )}
                    {(!staffMembers || staffMembers.length === 0) && (
                      <MenuItem value="" disabled>
                        <em>No staff members available</em>
                      </MenuItem>
                    )}
                                     </Select>
                   {process.env.NODE_ENV === 'development' && (
                     <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                       Debug: {staffMembers?.length || 0} staff members loaded, Selected: "{formData.delegateName || 'none'}"
                       {staffError && `, Error: ${staffError.message}`}
                       <br />
                       Form data delegateName: "{formData.delegateName || 'undefined'}"
                     </Typography>
                   )}
                 </FormControl>
              </Grid>
                             <Grid item xs={12} md={4}>
                 <TextField
                   fullWidth
                   label="Position"
                   name="delegatePosition"
                   value={formData.delegatePosition}
                   onChange={handleFormChange}
                   required
                   InputProps={{
                     readOnly: true,
                   }}
                   helperText="Auto-populated from staff selection"
                 />
               </Grid>
               <Grid item xs={12} md={4}>
                 <TextField
                   fullWidth
                   label="Department"
                   name="delegateDepartment"
                   value={formData.delegateDepartment}
                   onChange={handleFormChange}
                   required
                   InputProps={{
                     readOnly: true,
                   }}
                   helperText="Auto-populated from staff selection"
                 />
               </Grid>

              {/* Delegation Details */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Delegation Details
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Delegation Type</InputLabel>
                  <Select
                    name="delegationType"
                    value={formData.delegationType}
                    onChange={handleFormChange}
                    label="Delegation Type"
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      <em>Select delegation type</em>
                    </MenuItem>
                    <MenuItem value="Temporary">Temporary</MenuItem>
                    <MenuItem value="Permanent">Permanent</MenuItem>
                    <MenuItem value="Emergency">Emergency</MenuItem>
                    <MenuItem value="Project-based">Project-based</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Authority Scope"
                  name="authorityScope"
                  value={formData.authorityScope}
                  onChange={handleFormChange}
                  required
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Responsibilities"
                  name="responsibilities"
                  value={formData.responsibilities}
                  onChange={handleFormChange}
                  required
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Limitations"
                  name="limitations"
                  value={formData.limitations}
                  onChange={handleFormChange}
                  multiline
                  rows={2}
                />
              </Grid>

              {/* Dates */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  <DateRangeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Effective Dates
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Effective Date"
                  name="effectiveDate"
                  type="date"
                  value={formData.effectiveDate}
                  onChange={handleFormChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  name="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Additional Information */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Conditions"
                  name="conditions"
                  value={formData.conditions}
                  onChange={handleFormChange}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reporting Structure"
                  name="reportingStructure"
                  value={formData.reportingStructure}
                  onChange={handleFormChange}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Emergency Contact"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleFormChange}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            onClick={handleSubmit}
            disabled={createNoticeMutation.isPending || updateNoticeMutation.isPending}
            startIcon={createNoticeMutation.isPending || updateNoticeMutation.isPending ? <CircularProgress size={20} /> : null}
          >
            {createNoticeMutation.isPending || updateNoticeMutation.isPending 
              ? (isEditMode ? 'Updating...' : 'Creating...') 
              : (isEditMode ? 'Update' : 'Create') + ' Notice'
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Delegation Authority Notice Details
        </DialogTitle>
        <DialogContent>
          {selectedNotice && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h5" gutterBottom>
                    {selectedNotice.title}
                  </Typography>
                  <Chip 
                    label={selectedNotice.status} 
                    color={getStatusColor(selectedNotice.status)}
                    sx={{ mb: 2 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Delegator Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Name" 
                        secondary={selectedNotice.delegatorName} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Position" 
                        secondary={selectedNotice.delegatorPosition} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Department" 
                        secondary={selectedNotice.delegatorDepartment} 
                      />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Delegate Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Name" 
                        secondary={selectedNotice.delegateName} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Position" 
                        secondary={selectedNotice.delegatePosition} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Department" 
                        secondary={selectedNotice.delegateDepartment} 
                      />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Delegation Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Type
                      </Typography>
                      <Typography variant="body1">
                        {selectedNotice.delegationType}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Authority Scope
                      </Typography>
                      <Typography variant="body1">
                        {selectedNotice.authorityScope}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Responsibilities
                      </Typography>
                      <Typography variant="body1">
                        {selectedNotice.responsibilities}
                      </Typography>
                    </Grid>
                    {selectedNotice.limitations && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Limitations
                        </Typography>
                        <Typography variant="body1">
                          {selectedNotice.limitations}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Dates and Conditions
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Effective Date
                      </Typography>
                      <Typography variant="body1">
                        {new Date(selectedNotice.effectiveDate).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    {selectedNotice.expiryDate && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Expiry Date
                        </Typography>
                        <Typography variant="body1">
                          {new Date(selectedNotice.expiryDate).toLocaleDateString()}
                        </Typography>
                      </Grid>
                    )}
                    {selectedNotice.conditions && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Conditions
                        </Typography>
                        <Typography variant="body1">
                          {selectedNotice.conditions}
                        </Typography>
                      </Grid>
                    )}
                    {selectedNotice.reportingStructure && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Reporting Structure
                        </Typography>
                        <Typography variant="body1">
                          {selectedNotice.reportingStructure}
                        </Typography>
                      </Grid>
                    )}
                    {selectedNotice.emergencyContact && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Emergency Contact
                        </Typography>
                        <Typography variant="body1">
                          {selectedNotice.emergencyContact}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button 
            startIcon={<DownloadIcon />}
            onClick={() => delegationAuthorityAPI.generatePDF(selectedNotice._id)}
          >
            Download PDF
          </Button>
          <Button 
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog 
        open={approvalDialogOpen} 
        onClose={() => setApprovalDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {approvalData.action === 'approve' ? 'Approve' : 'Reject'} Delegation Authority Notice
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Comments"
              name="comments"
              value={approvalData.comments}
              onChange={(e) => setApprovalData(prev => ({ ...prev, comments: e.target.value }))}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Effective Date"
              name="effectiveDate"
              type="date"
              value={approvalData.effectiveDate}
              onChange={(e) => setApprovalData(prev => ({ ...prev, effectiveDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialogOpen(false)}>Cancel</Button>
          <Button 
            color="error"
            onClick={() => handleApprovalSubmit('reject')}
            disabled={rejectNoticeMutation.isPending}
          >
            Reject
          </Button>
          <Button 
            color="success"
            variant="contained"
            onClick={() => handleApprovalSubmit('approve')}
            disabled={approveNoticeMutation.isPending}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 