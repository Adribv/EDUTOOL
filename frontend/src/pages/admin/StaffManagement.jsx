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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';

const roles = [
  'Teacher',
  'HOD',
  'VicePrincipal',
  'Principal',
  'AdminStaff',
  'ITAdmin',
  'Counsellor',
];

const departments = [
  'Mathematics',
  'Science',
  'English',
  'History',
  'Geography',
  'Computer Science',
  'Physical Education',
  'Arts',
  'Music',
];

function StaffManagement() {
  const [open, setOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    department: '',
    contactNumber: '',
    address: '',
    employeeId: '',
    joiningDate: new Date().toISOString().split('T')[0],
    qualification: '',
    experience: ''
  });

  const queryClient = useQueryClient();

  const { data: staff, isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const response = await adminAPI.getAllStaff();
      return response.data;
    },
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
        department: staff.department,
        contactNumber: staff.phone,
        address: staff.address,
        employeeId: staff.employeeId,
        joiningDate: staff.joiningDate,
        qualification: staff.qualification,
        experience: staff.experience,
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
        address: '',
        employeeId: '',
        joiningDate: new Date().toISOString().split('T')[0],
        qualification: '',
        experience: ''
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
      address: '',
      employeeId: '',
      joiningDate: new Date().toISOString().split('T')[0],
      qualification: '',
      experience: ''
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

  const filteredStaff = staff?.filter((member) =>
    Object.values(member).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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
              <TableCell>Phone</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStaff?.map((member) => (
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
                <TableCell>{member.department}</TableCell>
                <TableCell>{member.phone}</TableCell>
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
            >
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
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
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
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