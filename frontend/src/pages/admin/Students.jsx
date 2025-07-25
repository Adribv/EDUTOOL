import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  InputAdornment,
  Chip,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useFormik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
  rollNumber: yup.string().required('Roll Number is required'),
  class: yup.string().required('Class is required'),
  section: yup.string().required('Section is required'),
  parentName: yup.string().required('Parent Name is required'),
  contactNumber: yup.string().required('Contact Number is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  city: yup.string().required('City is required'),
});

function Students() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch students data
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
              const response = await axios.get('https://api.edulives.com/api/admin-staff/students');
      return response.data;
    }
  });

  // Fetch classes data for dropdown
  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
              const response = await axios.get('https://api.edulives.com/api/admin-staff/classes');
      return response.data;
    }
  });

  // Add/Edit student mutation
  const mutation = useMutation({
    mutationFn: async (values) => {
      if (selectedStudent) {
                  await axios.put(`https://api.edulives.com/api/admin-staff/students/${selectedStudent.id}`, values);
      } else {
                  await axios.post('https://api.edulives.com/api/admin-staff/students', values);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['students']);
      handleClose();
      setSnackbar({
        open: true,
        message: `Student ${selectedStudent ? 'updated' : 'added'} successfully`,
        severity: 'success'
      });
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'An error occurred',
        severity: 'error'
      });
    }
  });

  // Delete student mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
              await axios.delete(`https://api.edulives.com/api/admin-staff/students/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['students']);
      setSnackbar({
        open: true,
        message: 'Student deleted successfully',
        severity: 'success'
      });
    }
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      rollNumber: '',
      class: '',
      section: '',
      parentName: '',
      contactNumber: '',
      email: '',
      city: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      mutation.mutate(values);
    },
  });

  const handleClickOpen = () => {
    setSelectedStudent(null);
    formik.resetForm();
    setOpen(true);
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    formik.setValues(student);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    formik.resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      deleteMutation.mutate(id);
    }
  };

  // Get available sections for selected class
  const getAvailableSections = (selectedClass) => {
    if (!selectedClass || !classes) return [];
    const classData = classes.find(c => c.name === selectedClass);
    return classData ? [classData.section] : [];
  };

  const columns = [
    { field: 'rollNumber', headerName: 'Roll Number', width: 130 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'class', headerName: 'Class', width: 100 },
    { field: 'section', headerName: 'Section', width: 100 },
    { field: 'parentName', headerName: 'Parent Name', width: 200 },
    { field: 'contactNumber', headerName: 'Contact', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'Active' ? 'success' : 'error'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleEdit(params.row)}
            sx={{ color: theme.palette.primary.main }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(params.row.id)}
            sx={{ color: theme.palette.error.main }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (studentsLoading || classesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <div>
        <Box sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Student Management
            </Typography>
            <Box>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                sx={{ mr: 2 }}
                onClick={() => {/* Handle export */}}
              >
                Export
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleClickOpen}
              >
                Add Student
              </Button>
            </Box>
          </Box>

          <Box sx={{ height: 600, width: '100%', bgcolor: 'background.paper' }}>
            <DataGrid
              rows={students || []}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              checkboxSelection
              disableSelectionOnClick
              components={{ Toolbar: GridToolbar }}
              componentsProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 500 },
                },
              }}
              sx={{
                '& .MuiDataGrid-cell:hover': {
                  color: 'primary.main',
                },
              }}
            />
          </Box>
        </Box>

        {/* Add/Edit Student Dialog */}
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>{selectedStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
          <form onSubmit={formik.handleSubmit}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="name"
                    label="Full Name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="rollNumber"
                    label="Roll Number"
                    value={formik.values.rollNumber}
                    onChange={formik.handleChange}
                    error={formik.touched.rollNumber && Boolean(formik.errors.rollNumber)}
                    helperText={formik.touched.rollNumber && formik.errors.rollNumber}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Class</InputLabel>
                    <Select
                      name="class"
                      value={formik.values.class}
                      onChange={formik.handleChange}
                      error={formik.touched.class && Boolean(formik.errors.class)}
                    >
                      {classes?.map((cls) => (
                        <MenuItem key={cls._id} value={cls.name}>
                          {cls.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Section</InputLabel>
                    <Select
                      name="section"
                      value={formik.values.section}
                      onChange={formik.handleChange}
                      error={formik.touched.section && Boolean(formik.errors.section)}
                    >
                      {getAvailableSections(formik.values.class).map((section) => (
                        <MenuItem key={section} value={section}>
                          {section}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="parentName"
                    label="Parent Name"
                    value={formik.values.parentName}
                    onChange={formik.handleChange}
                    error={formik.touched.parentName && Boolean(formik.errors.parentName)}
                    helperText={formik.touched.parentName && formik.errors.parentName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="contactNumber"
                    label="Contact Number"
                    value={formik.values.contactNumber}
                    onChange={formik.handleChange}
                    error={formik.touched.contactNumber && Boolean(formik.errors.contactNumber)}
                    helperText={formik.touched.contactNumber && formik.errors.contactNumber}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="city"
                    label="City"
                    value={formik.values.city}
                    onChange={formik.handleChange}
                    error={formik.touched.city && Boolean(formik.errors.city)}
                    helperText={formik.touched.city && formik.errors.city}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="email"
                    label="Email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </Container>
  );
}

export default Students; 