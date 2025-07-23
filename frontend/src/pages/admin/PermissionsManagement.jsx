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

// Define the assignable roles
const assignableRoles = [
  { key: 'itAdmin', label: 'IT Admin' },
  { key: 'librarian', label: 'Librarian' },
  { key: 'wellnessCounsellor', label: 'Wellness Counsellor' },
  { key: 'examinationController', label: 'Examination Controller' },
  { key: 'skillsCoordinator', label: 'Skills/Co-curricular Coordinator' },
  { key: 'supportStaffsManager', label: 'Support Staffs Manager' },
];
const accessLevels = ['Unauthorized', 'View Access', 'Edit Access'];

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
    department: '',
    remarks: ''
  });

  // Replace permissions state with roleAssignments
  const [roleAssignments, setRoleAssignments] = useState([]); // [{role: 'itAdmin', access: 'View Access'}]

  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    fetchStaffList();
  }, []);

  const fetchStaffList = async () => {
    try {
      setLoading(true);
      // Use the new /admin/permissions endpoint
      const response = await api.get('/admin/permissions');
      const staffList = response.data?.data || [];
      // Normalize department, designation, roles, and remarks
      const validStaffList = staffList.map(staff => ({
        ...staff,
        department: typeof staff.department === 'object' && staff.department !== null
          ? staff.department.name
          : staff.department || '',
        designation: typeof staff.designation === 'object' && staff.designation !== null
          ? staff.designation.name
          : staff.designation || '',
        roles: staff.permissions?.roleAssignments?.map(r => r.role) || [],
        remarks: staff.permissions?.remarks || '',
        roleAssignments: staff.permissions?.roleAssignments || [],
      }));
      setStaffList(validStaffList);
    } catch (error) {
      console.error('❌ Error fetching staff list:', error);
      // Try fallback to test data
      try {
        console.log('🔄 Trying fallback test data...');
        const testResponse = await api.get('/admin/test-staff');
        console.log('Fallback /admin/test-staff response:', testResponse);
        const testStaffList = testResponse.data.data || [];
        setStaffList(testStaffList);
        console.log('✅ Loaded test data with', testStaffList.length, 'items');
        toast.success('Loaded test staff data for demo');
      } catch (testError) {
        console.error('❌ Test data also failed:', testError);
        toast.error('Failed to fetch staff list (main and fallback). Please check your backend API endpoints.');
        setStaffList([]); // Ensure we always set an array
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleAssignmentChange = (roleKey, access) => {
    setRoleAssignments(prev => {
      const idx = prev.findIndex(r => r.role === roleKey);
      if (idx >= 0) {
        // Update access
        const updated = [...prev];
        updated[idx] = { ...updated[idx], access };
        return updated;
      } else {
        // Add new
        return [...prev, { role: roleKey, access }];
      }
    });
  };
  const handleRemoveRoleAssignment = (roleKey) => {
    setRoleAssignments(prev => prev.filter(r => r.role !== roleKey));
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
      // Send full roleAssignments, department, and remarks
      const payload = {
        roleAssignments,
        department: formData.department,
        remarks: formData.remarks,
      };
      await adminAPI.saveStaffRolesAndAccess(selectedStaff._id, payload);
      toast.success('Roles and access saved successfully');
      handleCloseDialog();
      fetchStaffList();
    } catch (error) {
      setSaveError(error?.response?.data?.message || error.message || 'Unknown error');
      console.error('Error saving roles and access:', error);
      toast.error('Failed to save roles and access');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDialog = (staff) => {
    setSelectedStaff(staff);
    setFormData({
      department: staff?.department || '',
      remarks: staff?.remarks || '',
    });
    setRoleAssignments(staff?.roleAssignments || []);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStaff(null);
  };

  // getAccessColor function is no longer needed as accessLevels is simplified
  // const getAccessColor = (access) => {
  //   switch (access) {
  //     case 'No Access':
  //       return 'error';
  //     case 'View Access':
  //       return 'warning';
  //     case 'Edit Access':
  //       return 'success';
  //     default:
  //       return 'default';
  //   }
  // };

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
                <TableCell>Email</TableCell>
                <TableCell>Designation</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Assigned Roles</TableCell>
                <TableCell>Remarks/Notes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedStaff.map((staff, index) => (
                <TableRow key={staff._id}>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{staff.name}</TableCell>
                  <TableCell>{staff.email}</TableCell>
                  <TableCell>{staff.designation || staff.role}</TableCell>
                  <TableCell>{staff.department || 'Not Assigned'}</TableCell>
                  <TableCell>
                    {Array.isArray(staff.roleAssignments) && staff.roleAssignments.filter(r => r.access && r.access !== 'Unauthorized').length > 0 ? (
                      staff.roleAssignments
                        .filter(r => r.access && r.access !== 'Unauthorized')
                        .map((role, idx) => (
                          <Chip
                            key={role.role + idx}
                            label={assignableRoles.find(ar => ar.key === role.role)?.label || role.role}
                            color="primary"
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))
                    ) : (
                      <Typography variant="caption" color="textSecondary">No roles assigned</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ maxWidth: 150, display: 'block' }}>
                      {staff.remarks || 'No remarks'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit Roles">
                      <IconButton size="small" onClick={() => handleOpenDialog(staff)} color="primary">
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
              <strong>Error saving roles:</strong> {saveError}
            </Alert>
          )}
          {selectedStaff && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Editing roles for: <strong>{selectedStaff.name}</strong> ({selectedStaff.email})
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
                multiline
                rows={3}
                label="Remarks/Notes"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Additional notes about this role assignment..."
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Assign Roles & Access
              </Typography>
              <Grid container spacing={2}>
                {assignableRoles.map(role => {
                  const assigned = roleAssignments.find(r => r.role === role.key);
                  return (
                    <Grid item xs={12} md={6} key={role.key}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="body1" sx={{ minWidth: 180 }}>{role.label}</Typography>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                            value={assigned ? assigned.access : 'Unauthorized'}
                            onChange={e => handleRoleAssignmentChange(role.key, e.target.value)}
                            >
                              {accessLevels.map(level => (
                              <MenuItem key={level} value={level}>{level}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        {assigned && assigned.access !== 'Unauthorized' && (
                          <IconButton size="small" onClick={() => handleRemoveRoleAssignment(role.key)}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
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
            disabled={saving || !selectedStaff}
            startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            {saving ? 'Saving...' : 'Save Permissions'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 