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
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Papa from 'papaparse';

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
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filters, setFilters] = useState({
    grade: '',
    section: '',
    gender: '',
  });
  const [importDialog, setImportDialog] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetData, setSheetData] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Fetch students data
  const { data: students, isLoading } = useQuery({
    queryKey: ['students', filters],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/admin-staff/students', { params: filters });
      return response.data;
    },
    keepPreviousData: true,
  });

  // Add/Edit student mutation
  const mutation = useMutation({
    mutationFn: async (values) => {
      if (selectedStudent) {
        await axios.put(`http://localhost:5000/api/admin-staff/students/${selectedStudent._id}`, values);
      } else {
        await axios.post('http://localhost:5000/api/admin-staff/students', values);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['students']);
      handleClose();
      toast.success(`Student ${selectedStudent ? 'updated' : 'added'} successfully`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'An error occurred');
    }
  });

  // Delete student mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`http://localhost:5000/api/admin-staff/students/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['students']);
      toast.success('Student deleted successfully');
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
      dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
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
    toast.info('Exporting records...');
    // Mock functionality, replace with actual API call
    // try {
    //   const response = await adminAPI.generateStudentReport();
    //   const url = window.URL.createObjectURL(new Blob([response.data]));
    //   const link = document.createElement('a');
    //   link.href = url;
    //   link.setAttribute('download', 'student-report.pdf');
    //   document.body.appendChild(link);
    //   link.click();
    //   link.remove();
    //   toast.success('Report downloaded successfully');
    // } catch {
    //   toast.error('Failed to download report');
    // }
  };

  const handleImportSheet = async () => {
    try {
      // Convert Google Sheet link to CSV export link
      const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!match) {
        toast.error('Invalid Google Sheet link');
        return;
      }
      const sheetId = match[1];
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      const response = await fetch(csvUrl);
      const csv = await response.text();
      const parsed = Papa.parse(csv, { header: true });
      setSheetData(parsed.data);
      setPreviewOpen(true);
    } catch (err) {
      toast.error('Failed to fetch or parse sheet');
    }
  };

  const bulkImportMutation = useMutation({
    mutationFn: async (students) => {
      await axios.post('http://localhost:5000/api/admin-staff/students/bulk', { students });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['students']);
      setPreviewOpen(false);
      setImportDialog(false);
      toast.success('Students imported successfully');
    },
    onError: () => toast.error('Bulk import failed'),
  });

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'grade', headerName: 'Grade', width: 100 },
    { field: 'section', headerName: 'Section', width: 100 },
    { field: 'rollNumber', headerName: 'Roll No', width: 100 },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      width: 150,
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

  const filteredStudents = students?.filter(student => {
    return (
      (filters.grade ? student.grade === filters.grade : true) &&
      (filters.section ? student.section === filters.section : true) &&
      (filters.gender ? student.gender === filters.gender : true)
    );
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
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
                onClick={handleDownloadReport}
              >
                Export Records
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleClickOpen}
                sx={{ mr: 2 }}
              >
                Add Record
              </Button>
              <Button
                variant="outlined"
                onClick={() => setImportDialog(true)}
              >
                Import from Google Sheet
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
                      <MenuItem value="">All Genders</MenuItem>
                      {genders.map((gender) => (
                        <MenuItem key={gender} value={gender} sx={{ textTransform: 'capitalize' }}>
                          {gender}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                 <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    onClick={() => setFilters({ grade: '', section: '', gender: '' })}
                  >
                    Clear Filters
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Box sx={{ height: 650, width: '100%' }}>
            <DataGrid
              rows={filteredStudents || []}
              columns={columns}
              loading={isLoading}
              getRowId={(row) => row._id}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10, page: 0 },
                },
              }}
              slots={{ toolbar: GridToolbar }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 500 },
                },
              }}
              autoHeight
            />
          </Box>
        </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{selectedStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="name"
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
                  id="email"
                  name="email"
                  label="Email Address"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  id="grade"
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  id="section"
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="rollNumber"
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
                  id="dateOfBirth"
                  name="dateOfBirth"
                  label="Date of Birth"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formik.values.dateOfBirth}
                  onChange={formik.handleChange}
                  error={formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)}
                  helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  id="gender"
                  name="gender"
                  label="Gender"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                  error={formik.touched.gender && Boolean(formik.errors.gender)}
                  helperText={formik.touched.gender && formik.errors.gender}
                >
                  {genders.map((gender) => (
                    <MenuItem key={gender} value={gender} sx={{ textTransform: 'capitalize' }}>
                      {gender}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="parentName"
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
                  id="parentPhone"
                  name="parentPhone"
                  label="Parent Phone"
                  value={formik.values.parentPhone}
                  onChange={formik.handleChange}
                  error={formik.touched.parentPhone && Boolean(formik.errors.parentPhone)}
                  helperText={formik.touched.parentPhone && formik.errors.parentPhone}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="address"
                  name="address"
                  label="Address"
                  multiline
                  rows={3}
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  error={formik.touched.address && Boolean(formik.errors.address)}
                  helperText={formik.touched.address && formik.errors.address}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={mutation.isLoading}>
              {mutation.isLoading ? <CircularProgress size={24} /> : (selectedStudent ? 'Update' : 'Add')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={importDialog} onClose={() => setImportDialog(false)}>
        <DialogTitle>Import Students from Google Sheet</DialogTitle>
        <DialogContent>
          <TextField
            label="Google Sheet Link"
            fullWidth
            margin="normal"
            value={sheetUrl}
            onChange={e => setSheetUrl(e.target.value)}
          />
          <Button variant="contained" onClick={handleImportSheet} sx={{ mt: 2 }}>Fetch & Preview</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Preview Imported Students</DialogTitle>
        <DialogContent>
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            <pre>{JSON.stringify(sheetData, null, 2)}</pre>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => bulkImportMutation.mutate(sheetData)}>Import All</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default StudentRecords; 