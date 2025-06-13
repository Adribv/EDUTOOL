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
  MenuItem,
  Grid,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  CircularProgress,
  Chip,
  Alert,
  Snackbar,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Receipt as ReceiptIcon,
  FileDownload as FileDownloadIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';

const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const feeTypes = ['Tuition', 'Transportation', 'Library', 'Laboratory', 'Sports', 'Other'];
const paymentStatus = ['Paid', 'Pending', 'Overdue'];

function TabPanel({ children, value, index }) {
  return value === index && <Box sx={{ py: 3 }}>{children}</Box>;
}

function FeeConfiguration() {
  const [tabValue, setTabValue] = useState(0);
  const [open, setOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filters, setFilters] = useState({
    grade: '',
    feeType: '',
    status: '',
    month: '',
  });

  const queryClient = useQueryClient();

  // Fetch fee structures
  const { data: feeStructures, isLoading: isLoadingStructures } = useQuery({
    queryKey: ['feeStructures'],
    queryFn: () => adminAPI.getFeeStructures(),
  });

  // Fetch student fee records
  const { data: studentFees, isLoading: isLoadingStudentFees } = useQuery({
    queryKey: ['studentFees'],
    queryFn: () => adminAPI.getStudentFees(),
  });

  // Fetch staff salary records
  const { data: staffSalaries, isLoading: isLoadingStaffSalaries } = useQuery({
    queryKey: ['staffSalaries'],
    queryFn: () => adminAPI.getStaffSalaries(),
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const exportToExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const downloadReceipt = async (id) => {
    try {
      const response = await adminAPI.generateFeeReceipt(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fee-receipt-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSnackbar({
        open: true,
        message: 'Receipt downloaded successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to download receipt',
        severity: 'error'
      });
    }
  };

  // Student Fee Records columns
  const studentFeeColumns = [
    { field: 'studentName', headerName: 'Student Name', width: 180 },
    { field: 'grade', headerName: 'Grade', width: 100 },
    { field: 'feeType', headerName: 'Fee Type', width: 130 },
    { 
      field: 'amount', 
      headerName: 'Amount', 
      width: 120,
      valueFormatter: (params) => `$${params.value}`,
    },
    { 
      field: 'dueDate', 
      headerName: 'Due Date', 
      width: 120,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === 'Paid' 
              ? 'success' 
              : params.value === 'Pending' 
              ? 'warning' 
              : 'error'
          }
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            onClick={() => downloadReceipt(params.row._id)}
            color="primary"
          >
            <ReceiptIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleEdit(params.row)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(params.row._id)}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      ),
    },
  ];

  // Staff Salary columns
  const staffSalaryColumns = [
    { field: 'staffName', headerName: 'Staff Name', width: 180 },
    { field: 'designation', headerName: 'Designation', width: 150 },
    { 
      field: 'basicSalary', 
      headerName: 'Basic Salary', 
      width: 130,
      valueFormatter: (params) => `$${params.value}`,
    },
    { 
      field: 'allowances', 
      headerName: 'Allowances', 
      width: 130,
      valueFormatter: (params) => `$${params.value}`,
    },
    { 
      field: 'deductions', 
      headerName: 'Deductions', 
      width: 130,
      valueFormatter: (params) => `$${params.value}`,
    },
    { 
      field: 'netSalary', 
      headerName: 'Net Salary', 
      width: 130,
      valueFormatter: (params) => `$${params.value}`,
    },
    { 
      field: 'paymentDate', 
      headerName: 'Payment Date', 
      width: 130,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'Paid' ? 'success' : 'warning'}
          size="small"
        />
      ),
    },
  ];

  if (isLoadingStructures || isLoadingStudentFees || isLoadingStaffSalaries) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  const filteredStudentFees = studentFees?.filter(fee => {
    return (
      (!filters.grade || fee.grade === filters.grade) &&
      (!filters.feeType || fee.feeType === filters.feeType) &&
      (!filters.status || fee.status === filters.status)
    );
  });

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Fee Structure" />
            <Tab label="Student Fee Records" />
            <Tab label="Staff Salary Records" />
          </Tabs>
        </Box>

        {/* Fee Structure Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5">Fee Structure Configuration</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpen(true)}
            >
              Add Fee Structure
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Grade</TableCell>
                  <TableCell>Fee Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {feeStructures?.map((fee) => (
                  <TableRow key={fee._id}>
                    <TableCell>{fee.grade}</TableCell>
                    <TableCell>{fee.feeType}</TableCell>
                    <TableCell>${fee.amount}</TableCell>
                    <TableCell>{new Date(fee.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{fee.description}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleEdit(fee)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(fee._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Student Fee Records Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5">Student Fee Records</Typography>
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={() => exportToExcel(studentFees, 'student-fee-records')}
                  sx={{ mr: 2 }}
                >
                  Export Records
                </Button>
                <Button
                  variant="contained"
                  startIcon={<WarningIcon />}
                  color="warning"
                  onClick={() => exportToExcel(
                    studentFees.filter(fee => fee.status === 'Pending' || fee.status === 'Overdue'),
                    'pending-fees'
                  )}
                >
                  Export Pending Fees
                </Button>
              </Box>
            </Box>

            {/* Filters */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2}>
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
                      <InputLabel>Fee Type</InputLabel>
                      <Select
                        name="feeType"
                        value={filters.feeType}
                        onChange={handleFilterChange}
                        label="Fee Type"
                      >
                        <MenuItem value="">All Types</MenuItem>
                        {feeTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        label="Status"
                      >
                        <MenuItem value="">All Status</MenuItem>
                        {paymentStatus.map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
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
                      onClick={() => setFilters({ grade: '', feeType: '', status: '', month: '' })}
                    >
                      Clear Filters
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Box sx={{ height: 600 }}>
              <DataGrid
                rows={filteredStudentFees || []}
                columns={studentFeeColumns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                checkboxSelection
                disableSelectionOnClick
                components={{ Toolbar: GridToolbar }}
                getRowId={(row) => row._id}
                componentsProps={{
                  toolbar: {
                    showQuickFilter: true,
                    quickFilterProps: { debounceMs: 500 },
                  },
                }}
              />
            </Box>
          </Box>
        </TabPanel>

        {/* Staff Salary Records Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5">Staff Salary Records</Typography>
              <Button
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                onClick={() => exportToExcel(staffSalaries, 'staff-salary-records')}
              >
                Export Records
              </Button>
            </Box>

            <Box sx={{ height: 600 }}>
              <DataGrid
                rows={staffSalaries || []}
                columns={staffSalaryColumns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                checkboxSelection
                disableSelectionOnClick
                components={{ Toolbar: GridToolbar }}
                getRowId={(row) => row._id}
                componentsProps={{
                  toolbar: {
                    showQuickFilter: true,
                    quickFilterProps: { debounceMs: 500 },
                  },
                }}
              />
            </Box>
          </Box>
        </TabPanel>

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
      </motion.div>
    </Box>
  );
}

export default FeeConfiguration; 