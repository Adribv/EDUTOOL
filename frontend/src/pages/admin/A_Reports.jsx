import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import adminService from '../../services/adminService';

const A_Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reports, setReports] = useState([]);
  const [reportType, setReportType] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [generatedReport, setGeneratedReport] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reportsRes, classesRes] = await Promise.all([
        adminService.getReports(),
        adminService.getClasses(),
      ]);
      setReports(reportsRes.data);
      setClasses(classesRes.data);
    } catch {
      setError('Failed to load reports data');
    } finally {
      setLoading(false);
    }
  };

  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
    setGeneratedReport(null);
  };

  const handleDateChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const response = await adminService.generateReport({
        type: reportType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        classId: selectedClass,
      });
      setGeneratedReport(response.data);
    } catch {
      setError('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (reportId) => {
    try {
      const response = await adminService.downloadReport(reportId);
      // Handle file download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError('Failed to download report');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Reports</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={fetchData}
        >
          Refresh
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Report Statistics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AssessmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Reports</Typography>
              </Box>
              <Typography variant="h4">{reports.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SchoolIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Classes</Typography>
              </Box>
              <Typography variant="h4">{classes.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PersonIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Generated Today</Typography>
              </Box>
              <Typography variant="h4">
                {reports.filter(
                  (report) =>
                    new Date(report.generatedAt).toDateString() ===
                    new Date().toDateString()
                ).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Report Generation Form */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={3}>
              Generate New Report
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={reportType}
                    onChange={handleReportTypeChange}
                    required
                  >
                    <MenuItem value="attendance">Attendance Report</MenuItem>
                    <MenuItem value="academic">Academic Performance</MenuItem>
                    <MenuItem value="financial">Financial Report</MenuItem>
                    <MenuItem value="inventory">Inventory Report</MenuItem>
                    <MenuItem value="events">Events Report</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Class</InputLabel>
                  <Select
                    value={selectedClass}
                    onChange={handleClassChange}
                    required
                  >
                    <MenuItem value="">All Classes</MenuItem>
                    {classes.map((cls) => (
                      <MenuItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="startDate"
                  label="Start Date"
                  type="date"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="endDate"
                  label="End Date"
                  type="date"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleGenerateReport}
                  disabled={!reportType || !dateRange.startDate || !dateRange.endDate}
                >
                  Generate Report
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Generated Report */}
        {generatedReport && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" mb={3}>
                Generated Report
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Report Type</TableCell>
                      <TableCell>Class</TableCell>
                      <TableCell>Date Range</TableCell>
                      <TableCell>Generated At</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{generatedReport.type}</TableCell>
                      <TableCell>
                        {generatedReport.classId
                          ? classes.find((c) => c.id === generatedReport.classId)?.name
                          : 'All Classes'}
                      </TableCell>
                      <TableCell>
                        {new Date(generatedReport.startDate).toLocaleDateString()} -{' '}
                        {new Date(generatedReport.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(generatedReport.generatedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={generatedReport.status}
                          color={generatedReport.status === 'completed' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleDownloadReport(generatedReport.id)}
                          color="primary"
                        >
                          <DownloadIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        )}

        {/* Recent Reports */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={3}>
              Recent Reports
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Report Type</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Date Range</TableCell>
                    <TableCell>Generated At</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.type}</TableCell>
                      <TableCell>
                        {report.classId
                          ? classes.find((c) => c.id === report.classId)?.name
                          : 'All Classes'}
                      </TableCell>
                      <TableCell>
                        {new Date(report.startDate).toLocaleDateString()} -{' '}
                        {new Date(report.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(report.generatedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={report.status}
                          color={report.status === 'completed' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleDownloadReport(report.id)}
                          color="primary"
                        >
                          <DownloadIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default A_Reports; 