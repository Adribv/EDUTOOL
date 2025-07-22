import { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { adminAPI, api } from '../../services/api';
import { toast } from 'react-toastify';

// Access level options
const accessLevels = ['No Access', 'View Access', 'Edit Access'];

// Available roles
const availableRoles = [
  'Admin',
  'Principal',
  'Vice Principal',
  'HOD',
  'Teacher',
  'Accountant',
  'Librarian',
  'Wellness Counsellor',
  'IT Support',
  'Office Manager',
  'Facility Manager',
  'Support Staff'
];

// Departments
const departments = [
  'Academics',
  'Administration',
  'Support Staff',
  'IT',
  'Library',
  'Wellness',
  'Finance'
];

// Key responsibilities by role
const keyResponsibilities = {
  'Admin': [
    'Overall system management',
    'User account management',
    'System configuration',
    'Data backup and security',
    'Policy implementation'
  ],
  'Principal': [
    'Strategic planning and leadership',
    'Academic oversight',
    'Staff management',
    'Policy formulation',
    'External relations'
  ],
  'Vice Principal': [
    'Academic administration',
    'Student affairs management',
    'Staff coordination',
    'Event management',
    'Academic standards maintenance'
  ],
  'HOD': [
    'Department management',
    'Faculty supervision',
    'Curriculum oversight',
    'Academic planning',
    'Resource allocation'
  ],
  'Teacher': [
    'Classroom instruction',
    'Student assessment',
    'Lesson planning',
    'Student mentoring',
    'Academic reporting'
  ],
  'Librarian': [
    'Library management',
    'Resource cataloging',
    'Student assistance',
    'Book procurement',
    'Digital resource management'
  ],
  'Wellness Counsellor': [
    'Student counseling',
    'Wellness programs',
    'Mental health support',
    'Crisis intervention',
    'Health education'
  ],
  'Accountant': [
    'Financial management',
    'Fee collection',
    'Budget planning',
    'Financial reporting',
    'Audit coordination'
  ],
  'IT Support': [
    'System maintenance',
    'Technical support',
    'Network management',
    'Software installation',
    'Hardware troubleshooting'
  ]
};

// Reporting hierarchy
const reportingHierarchy = {
  'Admin': 'School Board',
  'Principal': 'School Board',
  'Vice Principal': 'Principal',
  'HOD': 'Vice Principal',
  'Teacher': 'HOD',
  'Librarian': 'Vice Principal',
  'Wellness Counsellor': 'Principal',
  'Accountant': 'Principal',
  'IT Support': 'Vice Principal',
  'Office Manager': 'Principal',
  'Facility Manager': 'Vice Principal',
  'Support Staff': 'Facility Manager'
};

export default function PermissionsManagement() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [formData, setFormData] = useState({
    role: '',
    department: '',
    accessLevel: 'View Access',
    reportingTo: '',
    remarks: ''
  });

  // Permissions structure
  const [permissions, setPermissions] = useState({
    students: 'No Access',
    teachers: 'No Access',
    classes: 'No Access',
    subjects: 'No Access',
    timetable: 'No Access',
    attendance: 'No Access',
    assignments: 'No Access',
    exams: 'No Access',
    fees: 'No Access',
    payments: 'No Access',
    salaries: 'No Access',
    expenses: 'No Access',
    staff: 'No Access',
    parents: 'No Access',
    communications: 'No Access',
    events: 'No Access',
    reports: 'No Access',
    analytics: 'No Access',
    settings: 'No Access',
    users: 'No Access',
    permissions: 'No Access',
    library: 'No Access',
    wellness: 'No Access',
    counselling: 'No Access',
    itSupport: 'No Access',
    inventory: 'No Access',
    transport: 'No Access',
    disciplinary: 'No Access'
  });

  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    fetchStaffList();
  }, []);

  const fetchStaffList = async () => {
    try {
    setLoading(true);
      console.log('🔍 Fetching staff list...');
      const staffList = await adminAPI.getAllStaffPermissions();
      console.log('📋 Staff list response:', staffList);
      console.log('📋 Type of staffList:', typeof staffList);
      console.log('📋 Is array:', Array.isArray(staffList));
      
      // Ensure we always have an array
      const validStaffList = Array.isArray(staffList) ? staffList : [];
      setStaffList(validStaffList);
      console.log('✅ Set staff list with', validStaffList.length, 'items');
    } catch (error) {
      console.error('❌ Error fetching staff list:', error);
      
      // Try fallback to test data
      try {
        console.log('🔄 Trying fallback test data...');
        const testResponse = await adminAPI.get('/admin/test-staff');
        const testStaffList = testResponse.data.data || [];
        setStaffList(testStaffList);
        console.log('✅ Loaded test data with', testStaffList.length, 'items');
        toast.success('Loaded test staff data for demo');
      } catch (testError) {
        console.error('❌ Test data also failed:', testError);
        toast.error('Failed to fetch staff list');
        setStaffList([]); // Ensure we always set an array
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (role) => {
    setFormData({ ...formData, role });
    
    // Auto-set reporting hierarchy
    const reportingTo = reportingHierarchy[role] || '';
    setFormData(prev => ({ ...prev, reportingTo }));

    // Set default permissions based on role
    if (role) {
      const defaultPerms = getDefaultPermissions(role);
      setPermissions(defaultPerms);
    }
  };

  const getDefaultPermissions = (role) => {
    const defaults = {
      'Admin': {
        students: 'Edit Access',
        teachers: 'Edit Access',
        classes: 'Edit Access',
        subjects: 'Edit Access',
        timetable: 'Edit Access',
        attendance: 'Edit Access',
        assignments: 'Edit Access',
        exams: 'Edit Access',
        fees: 'Edit Access',
        payments: 'Edit Access',
        salaries: 'Edit Access',
        expenses: 'Edit Access',
        staff: 'Edit Access',
        parents: 'Edit Access',
        communications: 'Edit Access',
        events: 'Edit Access',
        reports: 'Edit Access',
        analytics: 'Edit Access',
        settings: 'Edit Access',
        users: 'Edit Access',
        permissions: 'Edit Access',
        library: 'Edit Access',
        wellness: 'Edit Access',
        counselling: 'Edit Access',
        itSupport: 'Edit Access',
        inventory: 'Edit Access',
        transport: 'Edit Access',
        disciplinary: 'Edit Access'
      },
      'Principal': {
        students: 'Edit Access',
        teachers: 'Edit Access',
        classes: 'Edit Access',
        subjects: 'Edit Access',
        timetable: 'Edit Access',
        attendance: 'View Access',
        assignments: 'View Access',
        exams: 'Edit Access',
        fees: 'Edit Access',
        payments: 'Edit Access',
        salaries: 'Edit Access',
        expenses: 'Edit Access',
        staff: 'Edit Access',
        parents: 'View Access',
        communications: 'Edit Access',
        events: 'Edit Access',
        reports: 'Edit Access',
        analytics: 'Edit Access',
        settings: 'Edit Access',
        users: 'View Access',
        permissions: 'View Access',
        library: 'View Access',
        wellness: 'View Access',
        counselling: 'View Access',
        itSupport: 'View Access',
        inventory: 'View Access',
        transport: 'View Access',
        disciplinary: 'Edit Access'
      },
      'Teacher': {
        students: 'View Access',
        teachers: 'View Access',
        classes: 'View Access',
        subjects: 'View Access',
        timetable: 'View Access',
        attendance: 'Edit Access',
        assignments: 'Edit Access',
        exams: 'Edit Access',
        fees: 'No Access',
        payments: 'No Access',
        salaries: 'No Access',
        expenses: 'No Access',
        staff: 'View Access',
        parents: 'View Access',
        communications: 'Edit Access',
        events: 'View Access',
        reports: 'View Access',
        analytics: 'View Access',
        settings: 'No Access',
        users: 'No Access',
        permissions: 'No Access',
        library: 'View Access',
        wellness: 'View Access',
        counselling: 'View Access',
        itSupport: 'No Access',
        inventory: 'No Access',
        transport: 'No Access',
        disciplinary: 'Edit Access'
      },
      'Librarian': {
        students: 'View Access',
        teachers: 'View Access',
        classes: 'No Access',
        subjects: 'No Access',
        timetable: 'No Access',
        attendance: 'No Access',
        assignments: 'No Access',
        exams: 'No Access',
        fees: 'No Access',
        payments: 'No Access',
        salaries: 'No Access',
        expenses: 'No Access',
        staff: 'View Access',
        parents: 'No Access',
        communications: 'View Access',
        events: 'View Access',
        reports: 'View Access',
        analytics: 'View Access',
        settings: 'No Access',
        users: 'No Access',
        permissions: 'No Access',
        library: 'Edit Access',
        wellness: 'No Access',
        counselling: 'No Access',
        itSupport: 'No Access',
        inventory: 'Edit Access',
        transport: 'No Access',
        disciplinary: 'No Access'
      }
    };

    return defaults[role] || permissions;
  };

  const handleOpenDialog = (staff = null) => {
    if (staff) {
      setSelectedStaff(staff);
      setFormData({
        role: staff.permissions?.role || staff.role || '',
        department: staff.department || '',
        accessLevel: 'View Access',
        reportingTo: staff.permissions?.reportingTo || reportingHierarchy[staff.role] || '',
        remarks: staff.permissions?.remarks || ''
      });
      
      if (staff.permissions?.permissions) {
        setPermissions(staff.permissions.permissions);
      }
    } else {
      setSelectedStaff(null);
      setFormData({
        role: '',
        department: '',
        accessLevel: 'View Access',
        reportingTo: '',
        remarks: ''
      });
      setPermissions({
        students: 'No Access',
        teachers: 'No Access',
        classes: 'No Access',
        subjects: 'No Access',
        timetable: 'No Access',
        attendance: 'No Access',
        assignments: 'No Access',
        exams: 'No Access',
        fees: 'No Access',
        payments: 'No Access',
        salaries: 'No Access',
        expenses: 'No Access',
        staff: 'No Access',
        parents: 'No Access',
        communications: 'No Access',
        events: 'No Access',
        reports: 'No Access',
        analytics: 'No Access',
        settings: 'No Access',
        users: 'No Access',
        permissions: 'No Access',
        library: 'No Access',
        wellness: 'No Access',
        counselling: 'No Access',
        itSupport: 'No Access',
        inventory: 'No Access',
        transport: 'No Access',
        disciplinary: 'No Access'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStaff(null);
  };

  const handleSavePermissions = async () => {
    setSaveError(null);
    if (!selectedStaff) {
      toast.error('Please select a staff member from the table first');
      handleCloseDialog();
      return;
    }

    try {
      setSaving(true);
      
      const payload = {
        role: formData.role,
        department: formData.department,
        permissions: permissions,
        reportingTo: formData.reportingTo,
        remarks: formData.remarks
      };

      // Update existing staff permissions
      await adminAPI.updateStaffPermissions(selectedStaff._id, payload);
      toast.success('Permissions updated successfully');

      handleCloseDialog();
      fetchStaffList();
    } catch (error) {
      setSaveError(error?.response?.data?.message || error.message || 'Unknown error');
      console.error('Error saving permissions:', error);
      toast.error('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const handlePermissionChange = (module, access) => {
    setPermissions(prev => ({
      ...prev,
      [module]: access
    }));
  };

  const getAccessColor = (access) => {
    switch (access) {
      case 'No Access':
        return 'error';
      case 'View Access':
        return 'warning';
      case 'Edit Access':
        return 'success';
      default:
        return 'default';
    }
  };

  const filteredStaff = (Array.isArray(staffList) ? staffList : []).filter(staff =>
    staff.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedStaff = filteredStaff.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', my: 4, p: 3 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        School Staff Roles & Responsibilities
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Manage staff roles, permissions, and responsibilities. Assign access levels and define reporting structure.
      </Typography>

      {/* Search and Actions */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search by name, email, role, or department"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ minWidth: 400 }}
        />
        
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchStaffList}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Assign Role
          </Button>
      </Stack>
    </Box>

      {/* Staff Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>S.no</TableCell>
                <TableCell>Staff Name</TableCell>
                <TableCell>Designation</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Assigned Role(s)</TableCell>
                <TableCell>Key Responsibilities</TableCell>
                <TableCell>Access Level</TableCell>
                <TableCell>Reporting To</TableCell>
                <TableCell>Remarks/Notes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedStaff.map((staff, index) => (
                <TableRow key={staff._id}>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {staff.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {staff.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{staff.designation || staff.role}</TableCell>
                  <TableCell>
                    <Chip 
                      label={staff.department || 'Not Assigned'} 
                      color={staff.department ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={staff.permissions?.role || staff.role || 'No Role'} 
                      color={staff.permissions?.role ? 'success' : 'warning'}
                      size="small"
                      />
                    </TableCell>
                  <TableCell>
                    <Box sx={{ maxWidth: 200 }}>
                      {keyResponsibilities[staff.permissions?.role || staff.role]?.slice(0, 2).map((resp, idx) => (
                        <Typography key={idx} variant="caption" display="block">
                          • {resp}
                        </Typography>
                      )) || <Typography variant="caption" color="textSecondary">Not defined</Typography>}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={staff.permissions?.accessLevel || 'View Access'} 
                      color={getAccessColor(staff.permissions?.accessLevel || 'View Access')}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {staff.permissions?.reportingTo || reportingHierarchy[staff.role] || 'Not Set'}
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ maxWidth: 150, display: 'block' }}>
                      {staff.permissions?.remarks || 'No remarks'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit Permissions">
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenDialog(staff)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredStaff.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </TableContainer>
      )}

      {/* Role Assignment Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {selectedStaff ? 'Edit Permissions' : 'Assign Role & Permissions'}
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {saveError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <strong>Error saving permissions:</strong> {saveError}
            </Alert>
          )}
          {selectedStaff && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Editing permissions for: <strong>{selectedStaff.name}</strong> ({selectedStaff.email})
            </Alert>
          )}
          
          {!selectedStaff && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Assign Role to Staff Member</strong>
              </Typography>
              <Typography variant="caption">
                Please select a staff member from the table below and click the Edit button to assign roles and permissions.
                This dialog is for editing existing staff permissions only.
              </Typography>
            </Alert>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  label="Role"
                >
                  {availableRoles.map(role => (
                    <MenuItem key={role} value={role}>{role}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  label="Department"
                >
                  {departments.map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Reporting To"
                value={formData.reportingTo}
                onChange={(e) => setFormData({ ...formData, reportingTo: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Overall Access Level</InputLabel>
                <Select
                  value={formData.accessLevel}
                  onChange={(e) => setFormData({ ...formData, accessLevel: e.target.value })}
                  label="Overall Access Level"
                >
                  {accessLevels.map(level => (
                    <MenuItem key={level} value={level}>{level}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Remarks/Notes"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Additional notes about this role assignment..."
              />
            </Grid>

            {/* Key Responsibilities */}
            {formData.role && keyResponsibilities[formData.role] && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Key Responsibilities - {formData.role}
                    </Typography>
                    <Stack spacing={1}>
                      {keyResponsibilities[formData.role].map((responsibility, index) => (
                        <Typography key={index} variant="body2">
                          • {responsibility}
                        </Typography>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Module Permissions */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Module Permissions
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Module</TableCell>
                      <TableCell align="center">Access Level</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(permissions).map(([module, access]) => (
                      <TableRow key={module}>
                        <TableCell>
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {module.replace(/([A-Z])/g, ' $1').trim()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={access}
                              onChange={(e) => handlePermissionChange(module, e.target.value)}
                            >
                              {accessLevels.map(level => (
                                <MenuItem key={level} value={level}>
                                  <Chip 
                                    label={level} 
                                    color={getAccessColor(level)}
                                    size="small"
                                  />
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleSavePermissions}
            disabled={saving || !formData.role || !selectedStaff}
            startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            {saving ? 'Saving...' : 'Save Permissions'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 