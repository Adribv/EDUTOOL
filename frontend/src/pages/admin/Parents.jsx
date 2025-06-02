import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  Chip,
  CircularProgress,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Parents = () => {
  const [loading, setLoading] = useState(true);
  const [parents, setParents] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    occupation: '',
    relationship: '',
    status: 'active',
  });

  useEffect(() => {
    fetchParents();
  }, [page, rowsPerPage]);

  const fetchParents = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getParents({
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery,
      });
      setParents(response.data);
    } catch (error) {
      console.error('Error fetching parents:', error);
      toast.error('Failed to load parents');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
    fetchParents();
  };

  const handleOpenDialog = (parent = null) => {
    if (parent) {
      setSelectedParent(parent);
      setFormData({
        firstName: parent.firstName,
        lastName: parent.lastName,
        email: parent.email,
        phone: parent.phone,
        address: parent.address,
        occupation: parent.occupation,
        relationship: parent.relationship,
        status: parent.status,
      });
    } else {
      setSelectedParent(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        occupation: '',
        relationship: '',
        status: 'active',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedParent(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (selectedParent) {
        await adminAPI.updateParent(selectedParent.id, formData);
        toast.success('Parent updated successfully');
      } else {
        await adminAPI.createParent(formData);
        toast.success('Parent added successfully');
      }
      handleCloseDialog();
      fetchParents();
    } catch (error) {
      console.error('Error saving parent:', error);
      toast.error('Failed to save parent');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this parent?')) {
      try {
        await adminAPI.deleteParent(id);
        toast.success('Parent deleted successfully');
        fetchParents();
      } catch (error) {
        console.error('Error deleting parent:', error);
        toast.error('Failed to delete parent');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Parents Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Parent
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search parents..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Parent</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Occupation</TableCell>
              <TableCell>Relationship</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : parents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No parents found
                </TableCell>
              </TableRow>
            ) : (
              parents.map((parent) => (
                <TableRow key={parent.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body1">
                          {parent.firstName} {parent.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {parent.address}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{parent.email}</TableCell>
                  <TableCell>{parent.phone}</TableCell>
                  <TableCell>{parent.occupation}</TableCell>
                  <TableCell>{parent.relationship}</TableCell>
                  <TableCell>
                    <Chip
                      label={parent.status}
                      color={parent.status === 'active' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton size="small">
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(parent)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(parent.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={-1}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedParent ? 'Edit Parent' : 'Add New Parent'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
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
                required
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Relationship"
                name="relationship"
                value={formData.relationship}
                onChange={handleInputChange}
                required
              >
                <MenuItem value="father">Father</MenuItem>
                <MenuItem value="mother">Mother</MenuItem>
                <MenuItem value="guardian">Guardian</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedParent ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Parents; 