import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ArrowBack,
} from '@mui/icons-material';

const Reports = () => {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState('');

  const handleReportTypeChange = (event) => {
    setReportType(event.target.value);
  };

  const handleGenerateReport = () => {
    console.log('Generating report:', reportType);
  };

  const handleDownloadReport = () => {
    console.log('Downloading report:', reportType);
  };

  // Sample data for department statistics
  const departmentStats = {
    totalStudents: 450,
    totalTeachers: 25,
    totalCourses: 35,
    averageAttendance: 92,
    passRate: 85,
    researchProjects: 12,
  };

  // Sample data for recent activities
  const recentActivities = [
    {
      id: 1,
      type: 'Course Update',
      description: 'Updated curriculum for Data Structures course',
      date: '2024-03-20',
      status: 'Completed',
    },
    {
      id: 2,
      type: 'Faculty Meeting',
      description: 'Monthly department meeting',
      date: '2024-03-18',
      status: 'Completed',
    },
    {
      id: 3,
      type: 'Research Grant',
      description: 'Applied for AI research grant',
      date: '2024-03-15',
      status: 'Pending',
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4">Department Reports</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportType}
                  onChange={handleReportTypeChange}
                  label="Report Type"
                >
                  <MenuItem value="academic">Academic Performance</MenuItem>
                  <MenuItem value="attendance">Attendance Report</MenuItem>
                  <MenuItem value="faculty">Faculty Performance</MenuItem>
                  <MenuItem value="research">Research Activities</MenuItem>
                  <MenuItem value="financial">Financial Overview</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerateReport}
                startIcon={<AssessmentIcon />}
              >
                Generate Report
              </Button>
              <Button
                variant="outlined"
                onClick={handleDownloadReport}
                startIcon={<DownloadIcon />}
              >
                Download
              </Button>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Department Overview
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Students
                  </Typography>
                  <Typography variant="h4">{departmentStats.totalStudents}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Teachers
                  </Typography>
                  <Typography variant="h4">{departmentStats.totalTeachers}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Courses
                  </Typography>
                  <Typography variant="h4">{departmentStats.totalCourses}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Average Attendance
                  </Typography>
                  <Typography variant="h4">{departmentStats.averageAttendance}%</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Pass Rate
                  </Typography>
                  <Typography variant="h4">{departmentStats.passRate}%</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Research Projects
                  </Typography>
                  <Typography variant="h4">{departmentStats.researchProjects}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Recent Activities
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>{activity.type}</TableCell>
                    <TableCell>{activity.description}</TableCell>
                    <TableCell>{activity.date}</TableCell>
                    <TableCell>
                      <Chip
                        label={activity.status}
                        color={activity.status === 'Completed' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              startIcon={<BarChartIcon />}
              onClick={() => console.log('View detailed statistics')}
            >
              View Detailed Statistics
            </Button>
            <Button
              variant="outlined"
              startIcon={<PieChartIcon />}
              onClick={() => console.log('View performance metrics')}
            >
              View Performance Metrics
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports; 