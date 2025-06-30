import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Badge,
  LinearProgress
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { principalAPI } from '../../services/api';

const StaffManagement = () => {
  const [staffData, setStaffData] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch staff data, leave requests, and performance data
      const [staffResponse, leaveResponse, performanceResponse] = await Promise.all([
        principalAPI.getStaff(),
        principalAPI.getLeaveRequests(),
        principalAPI.getStaffPerformance()
      ]);

      setStaffData(staffResponse.data || []);
      setLeaveRequests(leaveResponse.data || []);
      setPerformanceData(performanceResponse.data || []);
    } catch (err) {
      console.error('❌ Error fetching staff data:', err);
      setError('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleStaffClick = (staff) => {
    setSelectedStaff(staff);
    setStaffDialogOpen(true);
  };

  const handleApproveLeave = async (leaveId) => {
    try {
      await principalAPI.approveLeaveRequest(leaveId, { status: 'Approved' });
      fetchStaffData(); // Refresh data
      setLeaveDialogOpen(false);
    } catch (error) {
      console.error('Error approving leave:', error);
    }
  };

  const handleRejectLeave = async (leaveId) => {
    try {
      await principalAPI.rejectLeaveRequest(leaveId, { status: 'Rejected' });
      fetchStaffData(); // Refresh data
      setLeaveDialogOpen(false);
    } catch (error) {
      console.error('Error rejecting leave:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
      case 'Approved':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Inactive':
      case 'Rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Principal':
        return 'error';
      case 'VicePrincipal':
        return 'warning';
      case 'HOD':
        return 'info';
      case 'Teacher':
        return 'primary';
      case 'AdminStaff':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Staff Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage teachers, staff, leave requests, and performance
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchStaffData}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            href="/principal/staff/add"
          >
            Add Staff
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Staff
                  </Typography>
                  <Typography variant="h4">
                    {staffData.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <PeopleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Staff
                  </Typography>
                  <Typography variant="h4">
                    {staffData.filter(staff => staff.status === 'Active').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                  <CheckCircleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Pending Leave
                  </Typography>
                  <Typography variant="h4">
                    {leaveRequests.filter(leave => leave.status === 'Pending').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                  <ScheduleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Teachers
                  </Typography>
                  <Typography variant="h4">
                    {staffData.filter(staff => staff.role === 'Teacher').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56 }}>
                  <SchoolIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange} variant="fullWidth">
          <Tab label="All Staff" icon={<PeopleIcon />} />
          <Tab label="Leave Requests" icon={<ScheduleIcon />} />
          <Tab label="Performance" icon={<AssessmentIcon />} />
          
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {selectedTab === 0 && (
        <Card>
          <CardHeader
            title="All Staff Members"
            action={
              <Box display="flex" gap={1}>
                <TextField
                  size="small"
                  placeholder="Search staff..."
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
                <Button startIcon={<FilterIcon />} variant="outlined">
                  Filter
                </Button>
              </Box>
            }
          />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Staff Member</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Performance</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {staffData.map((staff) => (
                    <TableRow key={staff._id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar src={staff.profileImage}>
                            {staff.name?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{staff.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {staff.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={staff.role}
                          color={getRoleColor(staff.role)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{staff.department || 'N/A'}</TableCell>
                      <TableCell>{staff.contactNumber || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={staff.status}
                          color={getStatusColor(staff.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinearProgress
                            variant="determinate"
                            value={staff.performanceRating || 0}
                            sx={{ width: 60, height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="body2">
                            {staff.performanceRating || 0}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleStaffClick(staff)}>
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" href={`/principal/staff/${staff._id}/edit`}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {selectedTab === 1 && (
        <Card>
          <CardHeader
            title="Leave Requests"
            action={
              <Box display="flex" gap={1}>
                <Chip
                  label={`${leaveRequests.filter(leave => leave.status === 'Pending').length} Pending`}
                  color="warning"
                />
                <Button startIcon={<DownloadIcon />} variant="outlined">
                  Export
                </Button>
              </Box>
            }
          />
          <CardContent>
            <List>
              {leaveRequests.map((leave) => (
                <React.Fragment key={leave._id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        {leave.staffName?.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={leave.staffName}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {leave.leaveType} - {leave.reason}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                    <Box display="flex" alignItems="center" gap={2}>
                      <Chip
                        label={leave.status}
                        color={getStatusColor(leave.status)}
                        size="small"
                      />
                      {leave.status === 'Pending' && (
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleApproveLeave(leave._id)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleRejectLeave(leave._id)}
                          >
                            Reject
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
              {leaveRequests.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No leave requests"
                    secondary="All leave requests have been processed"
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      )}

      {selectedTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader title="Performance Overview" />
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Staff Member</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Attendance</TableCell>
                        <TableCell>Performance</TableCell>
                        <TableCell>Rating</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {performanceData.map((performance) => (
                        <TableRow key={performance._id}>
                          <TableCell>{performance.staffName}</TableCell>
                          <TableCell>{performance.role}</TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <LinearProgress
                                variant="determinate"
                                value={performance.attendance}
                                color={performance.attendance >= 90 ? 'success' : 'warning'}
                                sx={{ width: 60, height: 8, borderRadius: 4 }}
                              />
                              <Typography variant="body2">
                                {performance.attendance}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <LinearProgress
                                variant="determinate"
                                value={performance.performanceScore}
                                color={performance.performanceScore >= 80 ? 'success' : 'warning'}
                                sx={{ width: 60, height: 8, borderRadius: 4 }}
                              />
                              <Typography variant="body2">
                                {performance.performanceScore}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <IconButton key={star} size="small">
                                  {star <= performance.rating ? <StarIcon color="warning" /> : <StarBorderIcon />}
                                </IconButton>
                              ))}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Performance Summary" />
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUpIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="High Performers"
                      secondary={`${performanceData.filter(p => p.performanceScore >= 80).length} staff members`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingDownIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Needs Improvement"
                      secondary={`${performanceData.filter(p => p.performanceScore < 70).length} staff members`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Good Attendance"
                      secondary={`${performanceData.filter(p => p.attendance >= 90).length} staff members`}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      

      {/* Staff Details Dialog */}
      <Dialog open={staffDialogOpen} onClose={() => setStaffDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Staff Details</DialogTitle>
        <DialogContent>
          {selectedStaff && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                  <Avatar
                    src={selectedStaff.profileImage}
                    sx={{ width: 120, height: 120 }}
                  >
                    {selectedStaff.name?.charAt(0)}
                  </Avatar>
                  <Typography variant="h6">{selectedStaff.name}</Typography>
                  <Chip
                    label={selectedStaff.role}
                    color={getRoleColor(selectedStaff.role)}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <List>
                  <ListItem>
                    <ListItemIcon><EmailIcon /></ListItemIcon>
                    <ListItemText primary="Email" secondary={selectedStaff.email} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><PhoneIcon /></ListItemIcon>
                    <ListItemText primary="Contact" secondary={selectedStaff.contactNumber} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><LocationIcon /></ListItemIcon>
                    <ListItemText primary="Address" secondary={selectedStaff.address} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><WorkIcon /></ListItemIcon>
                    <ListItemText primary="Department" secondary={selectedStaff.department} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CalendarIcon /></ListItemIcon>
                    <ListItemText 
                      primary="Join Date" 
                      secondary={new Date(selectedStaff.createdAt).toLocaleDateString()} 
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStaffDialogOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            href={`/principal/staff/${selectedStaff?._id}/edit`}
          >
            Edit Profile
          </Button>
        </DialogActions>
      </Dialog>

      {/* Leave Request Dialog */}
      <Dialog open={leaveDialogOpen} onClose={() => setLeaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Leave Request Details</DialogTitle>
        <DialogContent>
          {selectedLeave && (
            <List>
              <ListItem>
                <ListItemText
                  primary="Staff Member"
                  secondary={selectedLeave.staffName}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Leave Type"
                  secondary={selectedLeave.leaveType}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Reason"
                  secondary={selectedLeave.reason}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Duration"
                  secondary={`${new Date(selectedLeave.startDate).toLocaleDateString()} to ${new Date(selectedLeave.endDate).toLocaleDateString()}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Status"
                  secondary={
                    <Chip
                      label={selectedLeave.status}
                      color={getStatusColor(selectedLeave.status)}
                      size="small"
                    />
                  }
                />
              </ListItem>
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaveDialogOpen(false)}>Close</Button>
          {selectedLeave?.status === 'Pending' && (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleApproveLeave(selectedLeave._id)}
              >
                Approve
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleRejectLeave(selectedLeave._id)}
              >
                Reject
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffManagement; 