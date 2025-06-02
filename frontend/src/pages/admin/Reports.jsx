import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';

const REPORT_TYPES = [
  { value: 'attendance', label: 'Attendance Report' },
  { value: 'academic', label: 'Academic Report' },
  { value: 'financial', label: 'Financial Report' },
  { value: 'staff', label: 'Staff Report' },
  { value: 'student', label: 'Student Report' },
];

const GRADES = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `Grade ${i + 1}`,
}));

const SECTIONS = ['A', 'B', 'C', 'D', 'E'].map(section => ({
  value: section,
  label: `Section ${section}`,
}));

function Reports() {
  const [reportType, setReportType] = useState('attendance');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [grade, setGrade] = useState('');
  const [section, setSection] = useState('');

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['reports', reportType, dateRange, grade, section],
    queryFn: () => {
      const params = {
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
        grade,
        section,
      };

      switch (reportType) {
        case 'attendance':
          return adminAPI.generateAttendanceReport(params);
        case 'academic':
          return adminAPI.generateAcademicReport(params);
        case 'financial':
          return adminAPI.generateFinancialReport(params);
        case 'staff':
          return adminAPI.generateStaffReport(params);
        case 'student':
          return adminAPI.generateStudentReport(params);
        default:
          return Promise.reject(new Error('Invalid report type'));
      }
    },
    enabled: Boolean(dateRange.startDate && dateRange.endDate),
  });

  const handleDownloadReport = async () => {
    try {
      const params = {
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
        grade,
        section,
      };

      let response;
      switch (reportType) {
        case 'attendance':
          response = await adminAPI.generateAttendanceReport(params);
          break;
        case 'academic':
          response = await adminAPI.generateAcademicReport(params);
          break;
        case 'financial':
          response = await adminAPI.generateFinancialReport(params);
          break;
        case 'staff':
          response = await adminAPI.generateStaffReport(params);
          break;
        case 'student':
          response = await adminAPI.generateStudentReport(params);
          break;
        default:
          throw new Error('Invalid report type');
      }

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}_report.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Report downloaded successfully');
    } catch (err) {
      console.error('Failed to download report:', err);
      toast.error('Failed to download report');
    }
  };

  const renderReportContent = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (!reportData) {
      return (
        <Box sx={{ p: 3 }}>
          <Typography>No data available for the selected criteria</Typography>
        </Box>
      );
    }

    // Render different report formats based on report type
    switch (reportType) {
      case 'attendance':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Attendance Report
            </Typography>
            {/* Add attendance report specific rendering */}
          </Box>
        );
      case 'academic':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Academic Report
            </Typography>
            {/* Add academic report specific rendering */}
          </Box>
        );
      case 'financial':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Financial Report
            </Typography>
            {/* Add financial report specific rendering */}
          </Box>
        );
      case 'staff':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Staff Report
            </Typography>
            {/* Add staff report specific rendering */}
          </Box>
        );
      case 'student':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Student Report
            </Typography>
            {/* Add student report specific rendering */}
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Reports
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportType}
                  label="Report Type"
                  onChange={(e) => setReportType(e.target.value)}
                >
                  {REPORT_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={dateRange.startDate}
                  onChange={(date) => setDateRange(prev => ({ ...prev, startDate: date }))}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={dateRange.endDate}
                  onChange={(date) => setDateRange(prev => ({ ...prev, endDate: date }))}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>

            {(reportType === 'attendance' || reportType === 'academic' || reportType === 'student') && (
              <>
                <Grid item xs={12} md={1.5}>
                  <FormControl fullWidth>
                    <InputLabel>Grade</InputLabel>
                    <Select
                      value={grade}
                      label="Grade"
                      onChange={(e) => setGrade(e.target.value)}
                    >
                      <MenuItem value="">All</MenuItem>
                      {GRADES.map((g) => (
                        <MenuItem key={g.value} value={g.value}>
                          {g.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={1.5}>
                  <FormControl fullWidth>
                    <InputLabel>Section</InputLabel>
                    <Select
                      value={section}
                      label="Section"
                      onChange={(e) => setSection(e.target.value)}
                    >
                      <MenuItem value="">All</MenuItem>
                      {SECTIONS.map((s) => (
                        <MenuItem key={s.value} value={s.value}>
                          {s.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={handleDownloadReport}
                disabled={isLoading}
              >
                Download Report
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {renderReportContent()}
        </CardContent>
      </Card>
    </Box>
  );
}

export default Reports; 