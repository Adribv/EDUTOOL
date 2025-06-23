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
  Chip,
  useTheme,
  MenuItem,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { motion } from 'framer-motion';

const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const sections = ['A', 'B', 'C', 'D', 'E'];
const genders = ['male', 'female', 'other'];

const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  grade: yup.string().required('Grade is required'),
  section: yup.string().required('Section is required'),
  rollNumber: yup.string().required('Roll Number is required'),
  dateOfBirth: yup.string().required('Date of Birth is required'),
  gender: yup.string().required('Gender is required'),
  parentName: yup.string().required('Parent Name is required'),
  parentPhone: yup.string().required('Parent Phone is required'),
  address: yup.string().required('Address is required'),
});

function StudentRecords() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filters, setFilters] = useState({
    grade: '',
    section: '',
    gender: '',
  });

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Fetch students data
  const { data: students, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/admin/students');
      return response.data;
    }
  });

  // Add/Edit student mutation
  const mutation = useMutation({
    mutationFn: async (values) => {
      if (selectedStudent) {
        await axios.put(`http://localhost:5000/api/admin/students/${selectedStudent._id}`, values);
      } else {
        await axios.post('http://localhost:5000/api/admin/students', values);
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
      await axios.delete(`http://localhost:5000/api/admin/students/${id}`);
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
      email: '',
      grade: '',
      section: '',
      rollNumber: '',
      dateOfBirth: '',
      gender: '',
      parentName: '',
      parentPhone: '',
      address: '',
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
    formik.setValues({
      ...student,
      dateOfBirth: student.dateOfBirth.split('T')[0], // Format date for input
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    formik.resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this student record?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await adminAPI.generateStudentReport();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'student-report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded successfully');
    } catch {
      toast.error('Failed to download report');
    }
  };

  const filteredStudents = students?.filter((student) => {
    return (
      (!filters.grade || student.grade === filters.grade) &&
      (!filters.section || student.section === filters.section) &&
      (!filters.gender || student.gender.toLowerCase() === filters.gender)
    );
  });

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    { field: 'grade', headerName: 'Grade', width: 100 },
    { field: 'section', headerName: 'Section', width: 100 },
    { field: 'rollNumber', headerName: 'Roll No.', width: 120 },
    { field: 'parentPhone', headerName: "Parent's Phone", flex: 1, minWidth: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleEdit(params.row)} size="small">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row._id)} size="small">
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Student Records
            </Typography>
            <Box>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                sx={{ mr: 2 }}
                onClick={() => {/* Handle export */}}
              >
                Export Records
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleClickOpen}
              >
                Add Record
              </Button>
            </Box>
          </Box>

          {/* Filters */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Grade</InputLabel>
                    <Select
                      name="grade"
                      value={filters.grade}
                      onChange={handleFilterChange}
                      label="Grade"
                    >
                      <MenuItem value="">All Grades</MenuItem>
                      {grades.map((grade) => (
                        <MenuItem key={grade} value={grade}>
                          Grade {grade}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Section</InputLabel>
                    <Select
                      name="section"
                      value={filters.section}
                      onChange={handleFilterChange}
                      label="Section"
                    >
                      <MenuItem value="">All Sections</MenuItem>
                      {sections.map((section) => (
                        <MenuItem key={section} value={section}>
                          Section {section}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Gender</InputLabel>
                    <Select
                      name="gender"
                      value={filters.gender}
                      onChange={handleFilterChange}
                      label="Gender"
                    >
                      <MenuItem value="">All</MenuItem>
                      {genders.map((gender) => (
                        <MenuItem key={gender} value={gender}>
                          {gender.charAt(0).toUpperCase() + gender.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FilterListIcon />}
                    onClick={() => setFilters({ grade: '', section: '', gender: '' })}
                  >
                    Clear Filters
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Data Grid */}
          <Box sx={{ height: 600, width: '100%', bgcolor: 'background.paper' }}>
            <DataGrid
              rows={filteredStudents || []}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              checkboxSelection
              disableSelectionOnClick
              getRowId={(row) => row._id}
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
          <DialogTitle>
            {selectedStudent ? 'Edit Student Record' : 'Add New Student Record'}
          </DialogTitle>
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
                    name="email"
                    label="Email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    select
                    name="grade"
                    label="Grade"
                    value={formik.values.grade}
                    onChange={formik.handleChange}
                    error={formik.touched.grade && Boolean(formik.errors.grade)}
                    helperText={formik.touched.grade && formik.errors.grade}
                  >
                    {grades.map((grade) => (
                      <MenuItem key={grade} value={grade}>
                        Grade {grade}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    select
                    name="section"
                    label="Section"
                    value={formik.values.section}
                    onChange={formik.handleChange}
                    error={formik.touched.section && Boolean(formik.errors.section)}
                    helperText={formik.touched.section && formik.errors.section}
                  >
                    {sections.map((section) => (
                      <MenuItem key={section} value={section}>
                        Section {section}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
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
                  <TextField
                    fullWidth
                    name="dateOfBirth"
                    label="Date of Birth"
                    type="date"
                    value={formik.values.dateOfBirth}
                    onChange={formik.handleChange}
                    InputLabelProps={{ shrink: true }}
                    error={formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)}
                    helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    name="gender"
                    label="Gender"
                    value={formik.values.gender}
                    onChange={formik.handleChange}
                    error={formik.touched.gender && Boolean(formik.errors.gender)}
                    helperText={formik.touched.gender && formik.errors.gender}
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Parent Name"
                  name="parentName"
                  value={formik.values.parentName}
                  onChange={formik.handleChange}
                  error={formik.touched.parentName && Boolean(formik.errors.parentName)}
                  helperText={formik.touched.parentName && formik.errors.parentName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Parent Phone"
                  name="parentPhone"
                  value={formik.values.parentPhone}
                  onChange={formik.handleChange}
                  error={formik.touched.parentPhone && Boolean(formik.errors.parentPhone)}
                  helperText={formik.touched.parentPhone && formik.errors.parentPhone}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  error={formik.touched.address && Boolean(formik.errors.address)}
                  helperText={formik.touched.address && formik.errors.address}
                  multiline
                  rows={2}
                />
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={mutation.isPending}
              >
                {selectedStudent ? 'Update' : 'Add'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </motion.div>
    </Container>
  );
}

export default StudentRecords; 