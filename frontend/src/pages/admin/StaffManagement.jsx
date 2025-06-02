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
    role: '',
    department: '',
    phone: '',
    address: '',
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
        phone: staff.phone,
        address: staff.address,
      });
    } else {
      setSelectedStaff(null);
      setFormData({
        name: '',
        email: '',
        role: '',
        department: '',
        phone: '',
        address: '',
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
      role: '',
      department: '',
      phone: '',
      address: '',
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
    if (selectedStaff) {
      updateMutation.mutate({ id: selectedStaff._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await adminAPI.generateStaffReport();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'staff-report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded successfully');
    } catch (error) {
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
        <DialogTitle>
          {selectedStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  {roles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {selectedStaff ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default StaffManagement; 