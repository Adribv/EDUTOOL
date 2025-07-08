import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  IconButton,
  Tooltip,
  LinearProgress,
  Divider,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Event as EventIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  PresentToAll as PresentIcon,
  NotInterested as AbsentIcon,
  Schedule as LateIcon,
  Assignment as LeaveIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { studentAPI } from '../../services/api';
import { toast } from 'react-toastify';

function AttendanceHistory() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState(0);

  // Fetch attendance data
  const { data: attendanceData, isLoading, error } = useQuery({
    queryKey: ['attendance', selectedMonth, selectedYear],
    queryFn: () => studentAPI.getAttendance({ month: selectedMonth, year: selectedYear }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present':
        return <PresentIcon color="success" />;
      case 'Absent':
        return <AbsentIcon color="error" />;
      case 'Late':
        return <LateIcon color="warning" />;
      case 'Leave':
        return <LeaveIcon color="info" />;
      default:
        return <EventIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return 'success';
      case 'Absent':
        return 'error';
      case 'Late':
        return 'warning';
      case 'Leave':
        return 'info';
      default:
        return 'default';
    }
  };

  const calculateStatistics = () => {
    if (!attendanceData) return null;

    const total = attendanceData.length;
    const present = attendanceData.filter(a => a.status === 'Present').length;
    const absent = attendanceData.filter(a => a.status === 'Absent').length;
    const late = attendanceData.filter(a => a.status === 'Late').length;
    const leave = attendanceData.filter(a => a.status === 'Leave').length;

    return {
      total,
      present,
      absent,
      late,
      leave,
      presentPercentage: total > 0 ? (present / total) * 100 : 0,
      absentPercentage: total > 0 ? (absent / total) * 100 : 0,
      latePercentage: total > 0 ? (late / total) * 100 : 0,
      leavePercentage: total > 0 ? (leave / total) * 100 : 0
    };
  };

  const getFilteredAttendance = () => {
    if (!attendanceData) return [];
    
    if (statusFilter === 'all') return attendanceData;
    return attendanceData.filter(a => a.status === statusFilter);
  };

  const exportAttendance = () => {
    if (!attendanceData) return;

    const csvContent = [
      ['Date', 'Status', 'Remarks'],
      ...attendanceData.map(a => [
        new Date(a.date).toLocaleDateString(),
        a.status,
        a.remarks || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedMonth}_${selectedYear}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Attendance exported successfully!');
  };

  const stats = calculateStatistics();
  const filteredAttendance = getFilteredAttendance();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">Failed to load attendance records</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Attendance History
        </Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={exportAttendance}
          disabled={!attendanceData || attendanceData.length === 0}
        >
          Export
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Month</InputLabel>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                label="Month"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <MenuItem key={i + 1} value={i + 1}>
                    {new Date(2024, i).toLocaleDateString('en-US', { month: 'long' })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Year</InputLabel>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                label="Year"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="Present">Present</MenuItem>
                <MenuItem value="Absent">Absent</MenuItem>
                <MenuItem value="Late">Late</MenuItem>
                <MenuItem value="Leave">Leave</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => {
                setStatusFilter('all');
                setSelectedMonth(new Date().getMonth() + 1);
                setSelectedYear(new Date().getFullYear());
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PresentIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">Present</Typography>
                </Box>
                <Typography variant="h4">{stats.present}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {stats.presentPercentage.toFixed(1)}% of total
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={stats.presentPercentage} 
                  color="success"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <AbsentIcon color="error" sx={{ mr: 1 }} />
                  <Typography variant="h6">Absent</Typography>
                </Box>
                <Typography variant="h4">{stats.absent}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {stats.absentPercentage.toFixed(1)}% of total
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={stats.absentPercentage} 
                  color="error"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <LateIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6">Late</Typography>
                </Box>
                <Typography variant="h4">{stats.late}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {stats.latePercentage.toFixed(1)}% of total
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={stats.latePercentage} 
                  color="warning"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <LeaveIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6">Leave</Typography>
                </Box>
                <Typography variant="h4">{stats.leave}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {stats.leavePercentage.toFixed(1)}% of total
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={stats.leavePercentage} 
                  color="info"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Detailed View" />
          <Tab label="Summary" />
          <Tab label="Analytics" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Remarks</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAttendance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No attendance records found for the selected criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAttendance.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(record.status)}
                          label={record.status}
                          color={getStatusColor(record.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {record.remarks || '-'}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <EventIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Monthly Summary
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Total Days"
                      secondary={stats?.total || 0}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Attendance Rate"
                      secondary={`${stats?.presentPercentage.toFixed(1) || 0}%`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUpIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Best Streak"
                      secondary="5 consecutive days"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Insights
                </Typography>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Attendance Trend
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats?.presentPercentage || 0} 
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {stats?.presentPercentage >= 90 ? 'Excellent attendance!' :
                     stats?.presentPercentage >= 80 ? 'Good attendance, keep it up!' :
                     stats?.presentPercentage >= 70 ? 'Fair attendance, try to improve' :
                     'Low attendance, please attend regularly'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Attendance Analytics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="success.main">
                        {stats?.presentPercentage.toFixed(1) || 0}%
                      </Typography>
                      <Typography variant="body2">Overall Attendance</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="warning.main">
                        {stats?.late || 0}
                      </Typography>
                      <Typography variant="body2">Late Arrivals</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="error.main">
                        {stats?.absent || 0}
                      </Typography>
                      <Typography variant="body2">Absences</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default AttendanceHistory; 