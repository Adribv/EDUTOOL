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

const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const sections = ['A', 'B', 'C', 'D', 'E'];

function StudentRecords() {
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
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
  });

  const queryClient = useQueryClient();

  const { data: students, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => adminAPI.getAllStudents(),
  });

  const createMutation = useMutation({
    mutationFn: adminAPI.registerStudent,
    onSuccess: () => {
      queryClient.invalidateQueries(['students']);
      toast.success('Student added successfully');
      handleClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add student');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateStudent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['students']);
      toast.success('Student updated successfully');
      handleClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update student');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminAPI.deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries(['students']);
      toast.success('Student deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete student');
    },
  });

  const handleOpen = (student = null) => {
    if (student) {
      setSelectedStudent(student);
      setFormData({
        name: student.name,
        email: student.email,
        grade: student.grade,
        section: student.section,
        rollNumber: student.rollNumber,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        address: student.address,
      });
    } else {
      setSelectedStudent(null);
      setFormData({
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
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedStudent(null);
    setFormData({
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
    if (selectedStudent) {
      updateMutation.mutate({ id: selectedStudent._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
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
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  const filteredStudents = students?.filter((student) =>
    Object.values(student).some((value) =>
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
        <Typography variant="h4">Student Records</Typography>
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
            Add Student
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search students..."
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
              <TableCell>Roll Number</TableCell>
              <TableCell>Grade</TableCell>
              <TableCell>Section</TableCell>
              <TableCell>Parent Name</TableCell>
              <TableCell>Parent Phone</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents?.map((student) => (
              <TableRow key={student._id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.rollNumber}</TableCell>
                <TableCell>{student.grade}</TableCell>
                <TableCell>{student.section}</TableCell>
                <TableCell>{student.parentName}</TableCell>
                <TableCell>{student.parentPhone}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(student)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(student._id)}
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
          {selectedStudent ? 'Edit Student' : 'Add New Student'}
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
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  label="Grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  required
                >
                  {grades.map((grade) => (
                    <MenuItem key={grade} value={grade}>
                      {grade}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  label="Section"
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  required
                >
                  {sections.map((section) => (
                    <MenuItem key={section} value={section}>
                      {section}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Roll Number"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    label="Gender"
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Parent Name"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Parent Phone"
                  name="parentPhone"
                  value={formData.parentPhone}
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
              {selectedStudent ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default StudentRecords; 