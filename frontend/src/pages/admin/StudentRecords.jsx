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
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Divider,
  AlertTitle,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Papa from 'papaparse';
import ViewOnlyWrapper from './ViewOnlyWrapper';
import { useAccessControl, canPerformAction, getAccessTypeDisplay } from './accessControlUtils';

const genders = ['male', 'female', 'other'];

const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  class: yup.string().required('Class is required'),
  section: yup.string().required('Section is required'),
  rollNumber: yup.string().required('Roll Number is required'),
  dateOfBirth: yup.string().required('Date of Birth is required'),
  gender: yup.string().required('Gender is required'),
  parentName: yup.string().required('Parent Name is required'),
  parentPhone: yup.string().required('Parent Phone is required'),
  city: yup.string().required('City is required'),
  address: yup.string().required('Address is required'),
  admissionNumber: yup.string().required('Admission Number is required'),
  admissionSource: yup.string(),
  admissionTransferTo: yup.string(),
  courseDuration: yup.string(),
  category: yup.string(),
  religion: yup.string(),
  mobile: yup.string().required('Mobile is required'),
  educationQualification: yup.string(),
  bloodGroup: yup.string(),
  admissionDate: yup.string(),
  admissionSession: yup.string(),
  studentDomicile: yup.string(),
  grandTotalFee: yup.string(),
  applicableDiscount: yup.string(),
  fatherName: yup.string(),
  fatherMobile: yup.string(),
  fatherOccupation: yup.string(),
  motherName: yup.string(),
  motherMobile: yup.string(),
});

function StudentRecords() {
  // Access control
  const { accessLevel, isViewOnly, hasEditAccess, hasViewAccess, loading: accessLoading } = useAccessControl('StudentRecords');
  
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filters, setFilters] = useState({
    class: '',
    section: '',
    gender: '',
  });
  const [importDialog, setImportDialog] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetData, setSheetData] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  // If no view access, show access denied
  if (!accessLoading && !hasViewAccess) {
    return (
      <ViewOnlyWrapper
        title="Student Records"
        description="Manage student information and records"
        accessLevel={accessLevel}
        activity="Student Records"
      >
        <Alert severity="error" sx={{ m: 3 }}>
          <AlertTitle>Access Denied</AlertTitle>
          You do not have permission to access Student Records. Contact your Vice Principal for access.
        </Alert>
      </ViewOnlyWrapper>
    );
  }

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Fetch students data
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
              const response = await axios.get('https://api.edulives.com/api/admin-staff/students/public');
      return response.data;
    },
    onError: (error) => {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    }
  });

  // Fetch classes data for dropdown
  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
              const response = await axios.get('https://api.edulives.com/api/admin-staff/classes/public');
      return response.data;
    },
    onError: (error) => {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    }
  });

  // Add/Edit student mutation
  const mutation = useMutation({
    mutationFn: async (values) => {
      // Create FormData so we can upload files along with text fields
      const formData = new FormData();
      Object.entries(values).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          formData.append(key, val);
        }
      });
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (selectedStudent) {
                  await axios.put(`https://api.edulives.com/api/admin-staff/students/public/${selectedStudent._id}`, formData, config);
      } else {
                  await axios.post('https://api.edulives.com/api/admin-staff/students/public', formData, config);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['students']);
      handleClose();
      
      // Show password info if student was created
      if (!selectedStudent && data?.student?.password) {
        toast.success(`Student added successfully! Password: ${data.student.password}`, {
          autoClose: 10000, // Show for 10 seconds
          position: "top-center"
        });
      } else {
        toast.success(`Student ${selectedStudent ? 'updated' : 'added'} successfully`);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'An error occurred');
    }
  });

  // Delete student mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
              await axios.delete(`https://api.edulives.com/api/admin-staff/students/public/${id}`);
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
      class: '',
      section: '',
      rollNumber: '',
      password: '',
      dateOfBirth: '',
      gender: '',
      parentName: '',
      parentPhone: '',
      city: '',
      address: '',
      admissionNumber: '',
      admissionSource: '',
      admissionTransferTo: '',
      courseDuration: '',
      category: '',
      religion: '',
      mobile: '',
      educationQualification: '',
      bloodGroup: '',
      studentPhoto: null,
      idProof: null,
      addressProof: null,
      admissionDate: '',
      admissionSession: '',
      studentDomicile: '',
      grandTotalFee: '',
      applicableDiscount: '',
      fatherName: '',
      fatherMobile: '',
      fatherOccupation: '',
      motherName: '',
      motherMobile: '',
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
    try {
      toast.info('Exporting records...');
      
      // Build query parameters for filters
      const params = new URLSearchParams();
      if (filters.class) params.append('class', filters.class);
      if (filters.section) params.append('section', filters.section);
      if (filters.gender) params.append('gender', filters.gender);
      params.append('format', 'csv');
      
              const response = await axios.get(`https://api.edulives.com/api/admin-staff/students/export?${params.toString()}`, {
        responseType: 'blob'
      });
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Create filename with filters
      let filename = `students_export_${new Date().toISOString().split('T')[0]}`;
      if (filters.class) filename += `_${filters.class}`;
      if (filters.section) filename += `_${filters.section}`;
      if (filters.gender) filename += `_${filters.gender}`;
      filename += '.csv';
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export records');
    }
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
    } catch {
      toast.error('Failed to fetch or parse sheet');
    }
  };

  const bulkImportMutation = useMutation({
    mutationFn: async (students) => {
              const response = await axios.post('https://api.edulives.com/api/admin-staff/students/bulk', { students });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['students']);
      setPreviewOpen(false);
      setImportDialog(false);
      
      // Show detailed results
      if (data.results) {
        const { successful, failed } = data.results;
        toast.success(`Import completed! ${successful.length} successful, ${failed.length} failed`);
        
        // Show passwords for successful imports
        if (successful.length > 0) {
          const passwordInfo = successful.map(s => `${s.name}: ${s.password}`).join('\n');
          alert(`Generated passwords:\n${passwordInfo}`);
        }
        
        // Show errors for failed imports
        if (failed.length > 0) {
          const errorInfo = failed.map(f => `${f.name}: ${f.error}`).join('\n');
          alert(`Failed imports:\n${errorInfo}`);
        }
      } else {
        toast.success('Students imported successfully');
      }
    },
    onError: (error) => {
      console.error('Bulk import error:', error);
      toast.error(error.response?.data?.message || 'Bulk import failed');
    }
  });

  const baseColumns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'class', headerName: 'Class', width: 100 },
    { field: 'section', headerName: 'Section', width: 100 },
    { field: 'rollNumber', headerName: 'Roll No', width: 100 },
  ];

  const actionColumn = {
    field: 'actions',
    headerName: 'Actions',
    sortable: false,
    filterable: false,
    width: 150,
    renderCell: (params) => (
      <Box>
        <IconButton 
          onClick={() => handleEdit(params.row)} 
          size="small"
          disabled={!canPerformAction(accessLevel, 'update')}
        >
          <EditIcon />
        </IconButton>
        <IconButton 
          onClick={() => handleDelete(params.row._id)} 
          size="small"
          disabled={!canPerformAction(accessLevel, 'delete')}
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    ),
  };

  const columns = hasEditAccess ? [...baseColumns, actionColumn] : baseColumns;

  const filteredStudents = students?.filter(student => {
    return (
      (filters.class ? student.class === filters.class : true) &&
      (filters.section ? student.section === filters.section : true) &&
      (filters.gender ? student.gender === filters.gender : true)
    );
  });

  // Get available sections for selected class
  const getAvailableSections = (selectedClass) => {
    if (!selectedClass || !classes || !Array.isArray(classes) || classes.length === 0) return [];
    const classData = classes.find(c => c.name === selectedClass);
    return classData ? [classData.section] : [];
  };

  if (studentsLoading || classesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ViewOnlyWrapper
      title="Student Records"
      description="Manage student information and records"
      accessLevel={accessLevel}
      activity="Student Records"
    >
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
                disabled={!canPerformAction(accessLevel, 'read')}
              >
                Export Records
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleClickOpen}
                sx={{ mr: 2 }}
                disabled={!canPerformAction(accessLevel, 'create')}
              >
                Add Record
              </Button>
              <Button
                variant="outlined"
                onClick={() => setImportDialog(true)}
                disabled={!canPerformAction(accessLevel, 'create')}
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
                    <InputLabel>Class</InputLabel>
                    <Select
                      name="class"
                      value={filters.class}
                      onChange={handleFilterChange}
                      disabled={classesLoading}
                    >
                      <MenuItem value="">All Classes</MenuItem>
                      {classes && Array.isArray(classes) && classes.map((classData) => (
                        <MenuItem key={classData.name} value={classData.name}>
                          {classData.name}
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
                      disabled={classesLoading}
                    >
                      <MenuItem value="">All Sections</MenuItem>
                      {getAvailableSections(filters.class).map((section) => (
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
                    onClick={() => setFilters({ class: '', section: '', gender: '' })}
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
              loading={studentsLoading}
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
      <Dialog open={open} onClose={handleClose} fullScreen>
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
                  id="class"
                  name="class"
                  label="Class"
                  value={formik.values.class}
                  onChange={formik.handleChange}
                  error={formik.touched.class && Boolean(formik.errors.class)}
                  helperText={formik.touched.class && formik.errors.class}
                  disabled={classesLoading}
                >
                  <MenuItem value="">Select Class</MenuItem>
                  {classes && Array.isArray(classes) && classes.map((classData) => (
                    <MenuItem key={classData.name} value={classData.name}>
                      {classData.name}
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
                  disabled={classesLoading}
                >
                  <MenuItem value="">Select Section</MenuItem>
                  {getAvailableSections(formik.values.class).map((section) => (
                    <MenuItem key={section} value={section}>
                      {section}
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
                  id="password"
                  name="password"
                  label="Password (optional - auto-generated if empty)"
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password || "Leave empty for auto-generated password"}
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="city"
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

              {/* Admission Details */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Admission Details</Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="admissionNumber"
                  name="admissionNumber"
                  label="Admission Number"
                  value={formik.values.admissionNumber}
                  onChange={formik.handleChange}
                  error={formik.touched.admissionNumber && Boolean(formik.errors.admissionNumber)}
                  helperText={formik.touched.admissionNumber && formik.errors.admissionNumber}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="admissionSource"
                  name="admissionSource"
                  label="Admission Source"
                  value={formik.values.admissionSource}
                  onChange={formik.handleChange}
                  error={formik.touched.admissionSource && Boolean(formik.errors.admissionSource)}
                  helperText={formik.touched.admissionSource && formik.errors.admissionSource}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="admissionTransferTo"
                  name="admissionTransferTo"
                  label="Admission Transfer To"
                  value={formik.values.admissionTransferTo}
                  onChange={formik.handleChange}
                  error={formik.touched.admissionTransferTo && Boolean(formik.errors.admissionTransferTo)}
                  helperText={formik.touched.admissionTransferTo && formik.errors.admissionTransferTo}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="courseDuration"
                  name="courseDuration"
                  label="Course/Class Duration"
                  value={formik.values.courseDuration}
                  onChange={formik.handleChange}
                  error={formik.touched.courseDuration && Boolean(formik.errors.courseDuration)}
                  helperText={formik.touched.courseDuration && formik.errors.courseDuration}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="category"
                  name="category"
                  label="Category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  error={formik.touched.category && Boolean(formik.errors.category)}
                  helperText={formik.touched.category && formik.errors.category}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="religion"
                  name="religion"
                  label="Religion"
                  value={formik.values.religion}
                  onChange={formik.handleChange}
                  error={formik.touched.religion && Boolean(formik.errors.religion)}
                  helperText={formik.touched.religion && formik.errors.religion}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="mobile"
                  name="mobile"
                  label="Mobile"
                  value={formik.values.mobile}
                  onChange={formik.handleChange}
                  error={formik.touched.mobile && Boolean(formik.errors.mobile)}
                  helperText={formik.touched.mobile && formik.errors.mobile}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="educationQualification"
                  name="educationQualification"
                  label="Education Qualification"
                  value={formik.values.educationQualification}
                  onChange={formik.handleChange}
                  error={formik.touched.educationQualification && Boolean(formik.errors.educationQualification)}
                  helperText={formik.touched.educationQualification && formik.errors.educationQualification}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="bloodGroup"
                  name="bloodGroup"
                  label="Blood Group"
                  value={formik.values.bloodGroup}
                  onChange={formik.handleChange}
                  error={formik.touched.bloodGroup && Boolean(formik.errors.bloodGroup)}
                  helperText={formik.touched.bloodGroup && formik.errors.bloodGroup}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="admissionDate"
                  name="admissionDate"
                  label="Admission Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formik.values.admissionDate}
                  onChange={formik.handleChange}
                  error={formik.touched.admissionDate && Boolean(formik.errors.admissionDate)}
                  helperText={formik.touched.admissionDate && formik.errors.admissionDate}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="admissionSession"
                  name="admissionSession"
                  label="Admission Session"
                  value={formik.values.admissionSession}
                  onChange={formik.handleChange}
                  error={formik.touched.admissionSession && Boolean(formik.errors.admissionSession)}
                  helperText={formik.touched.admissionSession && formik.errors.admissionSession}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="studentDomicile"
                  name="studentDomicile"
                  label="Student Domicile"
                  value={formik.values.studentDomicile}
                  onChange={formik.handleChange}
                  error={formik.touched.studentDomicile && Boolean(formik.errors.studentDomicile)}
                  helperText={formik.touched.studentDomicile && formik.errors.studentDomicile}
                />
              </Grid>

              {/* Document Uploads */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Documents</Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button variant="outlined" component="label" fullWidth>
                  Student Photo
                  <input type="file" accept="image/*" hidden onChange={(e) => formik.setFieldValue('studentPhoto', e.currentTarget.files[0])} />
                </Button>
                {formik.values.studentPhoto && (
                  <Typography variant="caption">{formik.values.studentPhoto.name}</Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button variant="outlined" component="label" fullWidth>
                  ID Proof
                  <input type="file" hidden onChange={(e) => formik.setFieldValue('idProof', e.currentTarget.files[0])} />
                </Button>
                {formik.values.idProof && (
                  <Typography variant="caption">{formik.values.idProof.name}</Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button variant="outlined" component="label" fullWidth>
                  Address Proof
                  <input type="file" hidden onChange={(e) => formik.setFieldValue('addressProof', e.currentTarget.files[0])} />
                </Button>
                {formik.values.addressProof && (
                  <Typography variant="caption">{formik.values.addressProof.name}</Typography>
                )}
              </Grid>

              {/* Student Fee Details */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Student Fee Details</Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="grandTotalFee"
                  name="grandTotalFee"
                  label="Grand Total Fee"
                  value={formik.values.grandTotalFee}
                  onChange={formik.handleChange}
                  error={formik.touched.grandTotalFee && Boolean(formik.errors.grandTotalFee)}
                  helperText={formik.touched.grandTotalFee && formik.errors.grandTotalFee}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="applicableDiscount"
                  name="applicableDiscount"
                  label="Applicable Discount"
                  value={formik.values.applicableDiscount}
                  onChange={formik.handleChange}
                  error={formik.touched.applicableDiscount && Boolean(formik.errors.applicableDiscount)}
                  helperText={formik.touched.applicableDiscount && formik.errors.applicableDiscount}
                />
              </Grid>

              {/* Parent Details */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Parent Details</Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="fatherName"
                  name="fatherName"
                  label="Father's Name"
                  value={formik.values.fatherName}
                  onChange={formik.handleChange}
                  error={formik.touched.fatherName && Boolean(formik.errors.fatherName)}
                  helperText={formik.touched.fatherName && formik.errors.fatherName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="fatherMobile"
                  name="fatherMobile"
                  label="Father's Mobile"
                  value={formik.values.fatherMobile}
                  onChange={formik.handleChange}
                  error={formik.touched.fatherMobile && Boolean(formik.errors.fatherMobile)}
                  helperText={formik.touched.fatherMobile && formik.errors.fatherMobile}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="fatherOccupation"
                  name="fatherOccupation"
                  label="Father's Occupation"
                  value={formik.values.fatherOccupation}
                  onChange={formik.handleChange}
                  error={formik.touched.fatherOccupation && Boolean(formik.errors.fatherOccupation)}
                  helperText={formik.touched.fatherOccupation && formik.errors.fatherOccupation}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="motherName"
                  name="motherName"
                  label="Mother's Name"
                  value={formik.values.motherName}
                  onChange={formik.handleChange}
                  error={formik.touched.motherName && Boolean(formik.errors.motherName)}
                  helperText={formik.touched.motherName && formik.errors.motherName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="motherMobile"
                  name="motherMobile"
                  label="Mother's Mobile"
                  value={formik.values.motherMobile}
                  onChange={formik.handleChange}
                  error={formik.touched.motherMobile && Boolean(formik.errors.motherMobile)}
                  helperText={formik.touched.motherMobile && formik.errors.motherMobile}
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
        <DialogTitle>Preview Imported Students ({sheetData?.length || 0} students)</DialogTitle>
        <DialogContent>
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {sheetData && sheetData.length > 0 ? (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Class</TableCell>
                      <TableCell>Section</TableCell>
                      <TableCell>Roll Number</TableCell>
                      <TableCell>Gender</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sheetData.slice(0, 10).map((student, index) => (
                      <TableRow key={index}>
                        <TableCell>{student.name || 'N/A'}</TableCell>
                        <TableCell>{student.email || 'N/A'}</TableCell>
                        <TableCell>{student.class || 'N/A'}</TableCell>
                        <TableCell>{student.section || 'N/A'}</TableCell>
                        <TableCell>{student.rollNumber || 'N/A'}</TableCell>
                        <TableCell>{student.gender || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="error">No data to preview</Typography>
            )}
            {sheetData && sheetData.length > 10 && (
              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                Showing first 10 of {sheetData.length} students
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => bulkImportMutation.mutate(sheetData)}
            disabled={bulkImportMutation.isLoading}
          >
            {bulkImportMutation.isLoading ? <CircularProgress size={24} /> : `Import All (${sheetData?.length || 0})`}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    </ViewOnlyWrapper>
  );
}

export default StudentRecords; 