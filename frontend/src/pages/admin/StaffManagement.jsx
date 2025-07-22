import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  MenuItem,
  Grid,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import adminService from '../../services/adminService';
import { toast } from 'react-toastify';

const roles = [
  'Teacher',
  'HOD',
  'VicePrincipal',
  'Principal',
  'Accountant',
  'AdminStaff',
  'ITAdmin',
  'Counsellor',
];

function StaffManagement() {
  const [open, setOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    department: '',
    contactNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India'
    },
    employeeId: '',
    joiningDate: new Date().toISOString().split('T')[0],
    qualification: '',
    experience: '',
    coordinator: [],
    dateOfBirth: '',
    lastWorkingDate: '',
    workingStatus: 'Working',
    remarks: '',
    workedSchools: [],
    supportingDocuments: []
  });

  const queryClient = useQueryClient();

  const { data: staff, isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const response = await adminAPI.getAllStaff();
      return response.data;
    },
  });

  const { data: departments, isLoading: departmentsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: adminAPI.getDepartments,
    staleTime: 5 * 60 * 1000,
  });

  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: adminAPI.getClasses,
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: adminAPI.registerStaff,
    onSuccess: () => {
      queryClient.invalidateQueries(['staff']);
      toast.success('Staff member added successfully');
      handleClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add staff member');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateStaff(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['staff']);
      toast.success('Staff member updated successfully');
      handleClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update staff member');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminAPI.deleteStaff,
    onSuccess: () => {
      queryClient.invalidateQueries(['staff']);
      toast.success('Staff member deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete staff member');
    },
  });

  const handleOpen = (staff = null) => {
    if (staff) {
      setSelectedStaff(staff);
      setFormData({
        name: staff.name,
        email: staff.email,
        role: staff.role,
        department: staff.department?._id || staff.department || '',
        contactNumber: staff.phone,
        address: {
          street: staff.address?.street || '',
          city: staff.address?.city || '',
          state: staff.address?.state || '',
          postalCode: staff.address?.postalCode || '',
          country: staff.address?.country || 'India'
        },
        employeeId: staff.employeeId,
        joiningDate: staff.joiningDate,
        qualification: staff.qualification,
        experience: staff.experience,
        coordinator: staff.coordinator || [],
        dateOfBirth: staff.dateOfBirth ? new Date(staff.dateOfBirth).toISOString().split('T')[0] : '',
        lastWorkingDate: staff.lastWorkingDate ? new Date(staff.lastWorkingDate).toISOString().split('T')[0] : '',
        workingStatus: staff.workingStatus || 'Working',
        remarks: staff.remarks || '',
        workedSchools: staff.workedSchools || [],
        supportingDocuments: staff.supportingDocuments || []
      });
    } else {
      setSelectedStaff(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: '',
        department: '',
        contactNumber: '',
        address: {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'India'
        },
        employeeId: '',
        joiningDate: new Date().toISOString().split('T')[0],
        qualification: '',
        experience: '',
        coordinator: [],
        dateOfBirth: '',
        lastWorkingDate: '',
        workingStatus: 'Working',
        remarks: '',
        workedSchools: [],
        supportingDocuments: []
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedStaff(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: '',
      department: '',
      contactNumber: '',
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India'
      },
      employeeId: '',
      joiningDate: new Date().toISOString().split('T')[0],
      qualification: '',
      experience: '',
      coordinator: [],
      dateOfBirth: '',
      lastWorkingDate: '',
      workingStatus: 'Working',
      remarks: '',
      workedSchools: [],
      supportingDocuments: []
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields based on whether it's a create or update operation
    if (selectedStaff) {
      // For updates, only validate name, email, and role
      if (!formData.name || !formData.email || !formData.role) {
        toast.error('Please fill in all required fields');
        return;
      }
    } else {
      // For new staff, validate all required fields including password
      if (!formData.name || !formData.email || !formData.password || !formData.role) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Validate password length only for new staff
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return;
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate role
    if (!roles.includes(formData.role)) {
      toast.error('Please select a valid role');
      return;
    }

    // Generate employee ID if not provided
    if (!formData.employeeId) {
      const timestamp = new Date().getTime();
      const randomNum = Math.floor(Math.random() * 1000);
      formData.employeeId = `EMP${timestamp}${randomNum}`;
    }

    if (selectedStaff) {
      updateMutation.mutate({ id: selectedStaff._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          queryClient.invalidateQueries(['staff']);
          toast.success('Staff member deleted successfully');
        },
        onError: (error) => {
          console.error('Error deleting staff:', error);
          toast.error(error.response?.data?.message || 'Failed to delete staff member');
        }
      });
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await adminAPI.generateStaffReport();
      const reportData = response.data;
      
      // Convert the report data to a formatted string
      const reportContent = `
Staff Report
Generated on: ${new Date(reportData.generatedAt).toLocaleString()}

Total Staff: ${reportData.totalStaff}

Department Distribution:
${Object.entries(reportData.departmentCounts)
  .map(([dept, count]) => `${dept}: ${count}`)
  .join('\n')}

Role Distribution:
${Object.entries(reportData.roleCounts)
  .map(([role, count]) => `${role}: ${count}`)
  .join('\n')}

Filters Applied:
${Object.entries(reportData.filters)
  .filter(([_, value]) => value)
  .map(([key, value]) => `${key}: ${value}`)
  .join('\n')}
      `;

      // Create a blob with the formatted content
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'staff-report.txt');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  const filteredStaff = staff?.filter((member) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      member.name?.toLowerCase().includes(searchLower) ||
      member.email?.toLowerCase().includes(searchLower) ||
      member.role?.toLowerCase().includes(searchLower) ||
      member.department?.name?.toLowerCase().includes(searchLower) ||
      member.phone?.toLowerCase().includes(searchLower) ||
      member.employeeId?.toLowerCase().includes(searchLower) ||
      member.qualification?.toLowerCase().includes(searchLower) ||
      member.experience?.toString().includes(searchLower)
    );

    const matchesRoleFilter = !roleFilter || member.role === roleFilter;

    return matchesSearch && matchesRoleFilter;
  });

  // Sort the filtered staff
  const sortedStaff = filteredStaff?.sort((a, b) => {
    if (!sortBy) return 0;

    let aValue, bValue;

    switch (sortBy) {
      case 'experience':
        aValue = parseInt(a.experience) || 0;
        bValue = parseInt(b.experience) || 0;
        break;
      case 'department':
        aValue = a.department?.name || '';
        bValue = b.department?.name || '';
        break;
      case 'role':
        aValue = a.role || '';
        bValue = b.role || '';
        break;
      case 'name':
        aValue = a.name || '';
        bValue = b.name || '';
        break;
      case 'email':
        aValue = a.email || '';
        bValue = b.email || '';
        break;
      default:
        return 0;
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Staff Management</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadReport}
            sx={{ mr: 2 }}
          >
            Download Report
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Add Staff
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter by Role</InputLabel>
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  label="Filter by Role"
                >
                  <MenuItem value="">All Roles</MenuItem>
                  {roles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="">No Sorting</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="role">Role</MenuItem>
                  <MenuItem value="department">Department</MenuItem>
                  <MenuItem value="experience">Experience</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Order</InputLabel>
                <Select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  label="Order"
                  disabled={!sortBy}
                >
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Experience</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Working Status</TableCell>
              <TableCell>DOB</TableCell>
              <TableCell>Coordinated Classes</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedStaff?.map((member) => (
              <TableRow key={member._id}>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>
                  <Chip
                    label={member.role}
                    color={
                      member.role === 'Principal'
                        ? 'error'
                        : member.role === 'HOD'
                        ? 'warning'
                        : 'primary'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>{member.department?.name || 'No Department'}</TableCell>
                <TableCell>{member.experience}</TableCell>
                <TableCell>{member.phone}</TableCell>
                <TableCell>
                  <Chip
                    label={member.workingStatus || 'Working'}
                    color={member.workingStatus === 'Left' ? 'error' : 'success'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : 'Not specified'}
                </TableCell>
                <TableCell>{member.coordinator?.map(c => c.name).join(', ') || 'No Coordinated Classes'}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(member)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(member._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{selectedStaff ? 'Edit Staff Member' : 'Add Staff Member'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />
            {!selectedStaff && (
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                sx={{ mb: 2 }}
              />
            )}
            <TextField
              fullWidth
              select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            >
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              select
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              disabled={departmentsLoading}
            >
              <MenuItem value="">
                {departmentsLoading ? 'Loading departments...' : 'Select Department'}
              </MenuItem>
              {departments?.map((dept) => (
                <MenuItem key={dept._id || dept.id} value={dept._id || dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Contact Number"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  name="address.street"
                  value={formData.address.street}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, street: e.target.value }
                  }))}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="address.city"
                  value={formData.address.city}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, city: e.target.value }
                  }))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State"
                  name="address.state"
                  value={formData.address.state}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, state: e.target.value }
                  }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  name="address.postalCode"
                  value={formData.address.postalCode}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, postalCode: e.target.value }
                  }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  name="address.country"
                  value={formData.address.country}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, country: e.target.value }
                  }))}
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Qualification"
              name="qualification"
              value={formData.qualification}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Experience"
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Joining Date"
              name="joiningDate"
              type="date"
              value={formData.joiningDate}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              select
              multiple
              label="Coordinated Classes"
              name="coordinator"
              value={formData.coordinator}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              disabled={classesLoading}
              helperText={classesLoading ? 'Loading classes...' : 'Select classes this staff member coordinates'}
            >
              {classes?.map((cls) => (
                <MenuItem key={cls._id || cls.id} value={cls._id || cls.id}>
                  {cls.name} ({cls.grade}-{cls.section})
                </MenuItem>
              ))}
            </TextField>
            
            {/* New fields as requested */}
            <TextField
              fullWidth
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Last Working Date"
              name="lastWorkingDate"
              type="date"
              value={formData.lastWorkingDate}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              select
              label="Working Status"
              name="workingStatus"
              value={formData.workingStatus}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            >
              <MenuItem value="Working">Working</MenuItem>
              <MenuItem value="Left">Left</MenuItem>
            </TextField>
            
            <TextField
              fullWidth
              label="Remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            
            {/* Worked Schools Section */}
            <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>
              Worked Schools
            </Typography>
            {formData.workedSchools.map((school, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="School Name"
                      value={school.schoolName || ''}
                      onChange={(e) => {
                        const updatedSchools = [...formData.workedSchools];
                        updatedSchools[index] = { ...school, schoolName: e.target.value };
                        setFormData(prev => ({ ...prev, workedSchools: updatedSchools }));
                      }}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Position"
                      value={school.position || ''}
                      onChange={(e) => {
                        const updatedSchools = [...formData.workedSchools];
                        updatedSchools[index] = { ...school, position: e.target.value };
                        setFormData(prev => ({ ...prev, workedSchools: updatedSchools }));
                      }}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="From Date"
                      type="date"
                      value={school.fromDate ? new Date(school.fromDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        const updatedSchools = [...formData.workedSchools];
                        updatedSchools[index] = { ...school, fromDate: e.target.value };
                        setFormData(prev => ({ ...prev, workedSchools: updatedSchools }));
                      }}
                      InputLabelProps={{ shrink: true }}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="To Date"
                      type="date"
                      value={school.toDate ? new Date(school.toDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        const updatedSchools = [...formData.workedSchools];
                        updatedSchools[index] = { ...school, toDate: e.target.value };
                        setFormData(prev => ({ ...prev, workedSchools: updatedSchools }));
                      }}
                      InputLabelProps={{ shrink: true }}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Reason for Leaving"
                      value={school.reasonForLeaving || ''}
                      onChange={(e) => {
                        const updatedSchools = [...formData.workedSchools];
                        updatedSchools[index] = { ...school, reasonForLeaving: e.target.value };
                        setFormData(prev => ({ ...prev, workedSchools: updatedSchools }));
                      }}
                      multiline
                      rows={2}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        const updatedSchools = formData.workedSchools.filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, workedSchools: updatedSchools }));
                      }}
                    >
                      Remove School
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            ))}
            <Button
              variant="outlined"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  workedSchools: [...prev.workedSchools, {
                    schoolName: '',
                    position: '',
                    fromDate: '',
                    toDate: '',
                    reasonForLeaving: ''
                  }]
                }));
              }}
              sx={{ mb: 2 }}
            >
              Add Worked School
            </Button>
            
            {/* Supporting Documents Section */}
            <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>
              Supporting Documents
            </Typography>
            {formData.supportingDocuments.map((doc, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Document Type"
                      value={doc.documentType || ''}
                      onChange={(e) => {
                        const updatedDocs = [...formData.supportingDocuments];
                        updatedDocs[index] = { ...doc, documentType: e.target.value };
                        setFormData(prev => ({ ...prev, supportingDocuments: updatedDocs }));
                      }}
                      sx={{ mb: 2 }}
                    >
                      <MenuItem value="qualification">Qualification</MenuItem>
                      <MenuItem value="experience">Experience</MenuItem>
                      <MenuItem value="identity">Identity</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={doc.description || ''}
                      onChange={(e) => {
                        const updatedDocs = [...formData.supportingDocuments];
                        updatedDocs[index] = { ...doc, description: e.target.value };
                        setFormData(prev => ({ ...prev, supportingDocuments: updatedDocs }));
                      }}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          try {
                            const formDataToUpload = new FormData();
                            formDataToUpload.append('documents', file);
                            formDataToUpload.append('documentType', doc.documentType || 'other');
                            formDataToUpload.append('description', doc.description || '');
                            
                            const response = await adminService.uploadStaffDocuments(formDataToUpload);
                            
                            if (response.data && response.data.files && response.data.files.length > 0) {
                              const uploadedFile = response.data.files[0];
                              const updatedDocs = [...formData.supportingDocuments];
                              updatedDocs[index] = { 
                                ...doc, 
                                fileName: uploadedFile.fileName,
                                filePath: uploadedFile.filePath,
                                uploadedAt: uploadedFile.uploadedAt
                              };
                              setFormData(prev => ({ ...prev, supportingDocuments: updatedDocs }));
                              toast.success('File uploaded successfully');
                            }
                          } catch (error) {
                            console.error('File upload error:', error);
                            toast.error('Failed to upload file. Please try again.');
                          }
                        }
                      }}
                      style={{ marginBottom: '16px' }}
                    />
                    {doc.fileName && (
                      <Typography variant="body2" color="textSecondary">
                        Selected file: {doc.fileName}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        const updatedDocs = formData.supportingDocuments.filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, supportingDocuments: updatedDocs }));
                      }}
                    >
                      Remove Document
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            ))}
            <Button
              variant="outlined"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  supportingDocuments: [...prev.supportingDocuments, {
                    documentType: '',
                    fileName: '',
                    filePath: '',
                    description: ''
                  }]
                }));
              }}
              sx={{ mb: 2 }}
            >
              Add Supporting Document
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedStaff ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default StaffManagement; 