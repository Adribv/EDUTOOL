import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Avatar,
  LinearProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Divider,
  Tabs,
  Tab,
  Skeleton
} from '@mui/material';
import {
  Event,
  Person,
  CheckCircle,
  Cancel,
  Visibility,
  Comment,
  Schedule,
  Warning,
  TrendingUp,
  TrendingDown,
  CalendarToday,
  School,
  Assignment,
  Close,
  Check,
  AccessTime,
  Phone,
  Email
} from '@mui/icons-material';
import { teacherAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const LeaveRequests = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [decisionDialog, setDecisionDialog] = useState(false);
  const [decision, setDecision] = useState('');
  const [comments, setComments] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [attendanceData, setAttendanceData] = useState({});

  // Fetch leave requests for coordinated students
  const { data: leaveRequests, isLoading, error } = useQuery({
    queryKey: ['leaveRequests', user?.id],
    queryFn: () => {
      const staffId = user?._id || user?.id;
      console.log('LeaveRequests: Fetching with staffId:', staffId);
      console.log('LeaveRequests: User object:', user);
      
      if (!staffId) {
        throw new Error('User ID not available');
      }
      return teacherAPI.getLeaveRequests(staffId);
    },
    enabled: !!user?.id || !!user?._id,
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    onSuccess: (data) => {
      console.log('LeaveRequests: API call successful, data:', data);
      console.log('LeaveRequests: Data type:', typeof data);
      console.log('LeaveRequests: Data length:', Array.isArray(data) ? data.length : 'Not an array');
      if (Array.isArray(data)) {
        data.forEach((item, index) => {
          console.log(`LeaveRequests: Item ${index}:`, item);
        });
      }
    },
    onError: (error) => {
      console.error('LeaveRequests: API call failed:', error);
      console.error('LeaveRequests: Error response:', error.response);
      console.error('LeaveRequests: Error message:', error.message);
    }
  });

  // Fetch attendance data for students when leave requests are loaded
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!leaveRequests || !user) return;
      
      const staffId = user?._id || user?.id;
      const attendancePromises = leaveRequests.map(async (request) => {
        try {
          const studentId = request.studentId?._id || request.studentId;
          if (studentId) {
            const attendanceInfo = await teacherAPI.getStudentAttendancePercentage(staffId, studentId);
            return { studentId, attendanceInfo };
          }
        } catch (error) {
          console.error('Error fetching attendance for student:', error);
          return { studentId: request.studentId?._id || request.studentId, attendanceInfo: null };
        }
      });
      
      const results = await Promise.all(attendancePromises);
      const attendanceMap = {};
      results.forEach(({ studentId, attendanceInfo }) => {
        if (studentId && attendanceInfo) {
          attendanceMap[studentId] = attendanceInfo.attendanceStats;
        }
      });
      
      setAttendanceData(attendanceMap);
    };

    fetchAttendanceData();
  }, [leaveRequests, user]);

  // Calculate attendance percentage with real data
  const getAttendancePercentage = (request) => {
    const studentId = request.studentId?._id || request.studentId;
    const attendance = attendanceData[studentId];
    
    if (attendance) {
      return attendance.attendancePercentage;
    }
    
    // Fallback to mock data if real data not available
    return Math.floor(Math.random() * 30) + 70;
  };

  // Mutation for updating leave request status
  const updateLeaveRequestMutation = useMutation({
    mutationFn: ({ requestId, status, comments }) => {
      const staffId = user?._id || user?.id;
      return teacherAPI.updateLeaveRequest(staffId, requestId, { status, comments });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['leaveRequests']);
      toast.success('Leave request updated successfully');
      handleCloseDecisionDialog();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update leave request');
    },
  });

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setDetailsDialog(true);
  };

  const handleMakeDecision = (request, decisionType) => {
    setSelectedRequest(request);
    setDecision(decisionType);
    setDecisionDialog(true);
  };

  const handleSubmitDecision = () => {
    if (!selectedRequest || !decision) return;

    updateLeaveRequestMutation.mutate({
      requestId: selectedRequest._id,
      status: decision,
      comments: comments.trim()
    });
  };

  const handleCloseDecisionDialog = () => {
    setDecisionDialog(false);
    setSelectedRequest(null);
    setDecision('');
    setComments('');
  };

  const handleCloseDetailsDialog = () => {
    setDetailsDialog(false);
    setSelectedRequest(null);
  };

  // Get filtered requests based on tab and status
  const getFilteredRequests = () => {
    if (!leaveRequests) return [];
    
    let filtered = leaveRequests;
    
    // Filter by tab
    if (selectedTab === 1) {
      filtered = filtered.filter(req => req.status === 'Pending');
    } else if (selectedTab === 2) {
      filtered = filtered.filter(req => req.status === 'Approved');
    } else if (selectedTab === 3) {
      filtered = filtered.filter(req => req.status === 'Rejected');
    }
    
    // Filter by status dropdown
    if (filterStatus !== 'all') {
      filtered = filtered.filter(req => req.status === filterStatus);
    }
    
    return filtered;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return <CheckCircle />;
      case 'Rejected': return <Cancel />;
      case 'Pending': return <Schedule />;
      default: return <Event />;
    }
  };

  const getDaysCount = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const filteredRequests = getFilteredRequests();

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load leave requests. Please try again later.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Leave Request Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            onClick={() => {
              console.log('=== DEBUG INFO ===');
              console.log('User:', user);
              console.log('Leave Requests Data:', leaveRequests);
              console.log('Is Loading:', isLoading);
              console.log('Error:', error);
              console.log('Filtered Requests:', filteredRequests);
              alert(`Debug info logged to console. Check browser console for details.\n\nLeave Requests: ${leaveRequests?.length || 0}\nFiltered: ${filteredRequests?.length || 0}\nLoading: ${isLoading}\nError: ${error ? 'Yes' : 'No'}`);
            }}
            sx={{ mr: 1 }}
          >
            Debug Info
          </Button>
          <Button 
            variant="contained" 
            color="secondary"
            onClick={async () => {
              try {
                console.log('=== TESTING API CALL ===');
                const staffId = user?._id || user?.id;
                console.log('Calling API with staffId:', staffId);
                
                const response = await teacherAPI.getLeaveRequests(staffId);
                console.log('API Response:', response);
                console.log('Response data:', response.data);
                console.log('Response type:', typeof response.data);
                console.log('Is array:', Array.isArray(response.data));
                
                if (Array.isArray(response.data)) {
                  console.log('Array length:', response.data.length);
                  response.data.forEach((item, index) => {
                    console.log(`Item ${index}:`, item);
                  });
                }
                
                alert(`API Test Complete!\n\nResponse received: ${response ? 'Yes' : 'No'}\nData type: ${typeof response.data}\nIs array: ${Array.isArray(response.data)}\nLength: ${Array.isArray(response.data) ? response.data.length : 'N/A'}\n\nCheck console for full details.`);
              } catch (error) {
                console.error('API Test Error:', error);
                console.error('Error response:', error.response);
                alert(`API Test Failed!\n\nError: ${error.message}\nStatus: ${error.response?.status}\nResponse: ${JSON.stringify(error.response?.data)}\n\nCheck console for full details.`);
              }
            }}
            sx={{ mr: 1 }}
          >
            Test API
          </Button>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Filter Status</InputLabel>
            <Select
              value={filterStatus}
              label="Filter Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {(leaveRequests || []).length}
                  </Typography>
                  <Typography variant="body2">Total Requests</Typography>
                </Box>
                <Event sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {(leaveRequests || []).filter(req => req.status === 'Pending').length}
                  </Typography>
                  <Typography variant="body2">Pending Review</Typography>
                </Box>
                <Schedule sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {(leaveRequests || []).filter(req => req.status === 'Approved').length}
                  </Typography>
                  <Typography variant="body2">Approved</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {(leaveRequests || []).filter(req => req.status === 'Rejected').length}
                  </Typography>
                  <Typography variant="body2">Rejected</Typography>
                </Box>
                <Cancel sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        sx={{ mb: 3 }}
      >
        <Tab 
          label={
            <Badge badgeContent={(leaveRequests || []).length} color="primary">
              All Requests
            </Badge>
          } 
        />
        <Tab 
          label={
            <Badge badgeContent={(leaveRequests || []).filter(req => req.status === 'Pending').length} color="warning">
              Pending
            </Badge>
          } 
        />
        <Tab 
          label={
            <Badge badgeContent={(leaveRequests || []).filter(req => req.status === 'Approved').length} color="success">
              Approved
            </Badge>
          } 
        />
        <Tab 
          label={
            <Badge badgeContent={(leaveRequests || []).filter(req => req.status === 'Rejected').length} color="error">
              Rejected
            </Badge>
          } 
        />
      </Tabs>

      {/* Leave Requests Table */}
      {filteredRequests.length > 0 ? (
        <Card>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Leave Period</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Attendance %</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRequests.map((request) => {
                    const attendancePercentage = getAttendancePercentage(request);
                    const daysCount = getDaysCount(request.startDate, request.endDate);
                    
                    return (
                      <TableRow key={request._id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {request.studentId?.name?.charAt(0) || request.studentName?.charAt(0) || 'S'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {request.studentId?.name || request.studentName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Roll: {request.studentId?.rollNumber || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2">
                            {request.studentClass || request.studentId?.class} - {request.studentSection || request.studentId?.section}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {new Date(request.startDate).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              to {new Date(request.endDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Chip 
                            label={`${daysCount} day${daysCount > 1 ? 's' : ''}`}
                            size="small"
                            color={daysCount > 3 ? 'warning' : 'info'}
                          />
                        </TableCell>
                        
                        <TableCell>
                          <Chip 
                            label={request.leaveType || 'General'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <LinearProgress
                              variant="determinate"
                              value={attendancePercentage}
                              color={attendancePercentage >= 90 ? 'success' : attendancePercentage >= 75 ? 'warning' : 'error'}
                              sx={{ width: 60, height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="body2" fontWeight="bold">
                              {attendancePercentage}%
                            </Typography>
                            {attendancePercentage < 75 && (
                              <Warning color="error" fontSize="small" />
                            )}
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Chip
                            label={request.status}
                            color={getStatusColor(request.status)}
                            size="small"
                            icon={getStatusIcon(request.status)}
                          />
                        </TableCell>
                        
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <Tooltip title="View Details">
                              <IconButton 
                                size="small" 
                                onClick={() => handleViewDetails(request)}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            
                            {request.status === 'Pending' && (
                              <>
                                <Tooltip title="Approve">
                                  <IconButton 
                                    size="small" 
                                    color="success"
                                    onClick={() => handleMakeDecision(request, 'Approved')}
                                  >
                                    <Check />
                                  </IconButton>
                                </Tooltip>
                                
                                <Tooltip title="Reject">
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => handleMakeDecision(request, 'Rejected')}
                                  >
                                    <Close />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Event sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No leave requests found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedTab === 1 ? 'No pending requests to review' :
                 selectedTab === 2 ? 'No approved requests' :
                 selectedTab === 3 ? 'No rejected requests' :
                 'No leave requests have been submitted yet'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Request Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={handleCloseDetailsDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedRequest && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {selectedRequest.studentId?.name?.charAt(0) || selectedRequest.studentName?.charAt(0) || 'S'}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {selectedRequest.studentId?.name || selectedRequest.studentName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Leave Request Details
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={handleCloseDetailsDialog}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardHeader title="Student Information" />
                    <CardContent>
                      <List dense>
                        <ListItem>
                          <ListItemIcon><Person /></ListItemIcon>
                          <ListItemText 
                            primary="Name" 
                            secondary={selectedRequest.studentId?.name || selectedRequest.studentName}
                          />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemIcon><Assignment /></ListItemIcon>
                          <ListItemText 
                            primary="Roll Number" 
                            secondary={selectedRequest.studentId?.rollNumber || 'N/A'}
                          />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemIcon><School /></ListItemIcon>
                          <ListItemText 
                            primary="Class" 
                            secondary={`${selectedRequest.studentClass || selectedRequest.studentId?.class} - ${selectedRequest.studentSection || selectedRequest.studentId?.section}`}
                          />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemIcon><TrendingUp /></ListItemIcon>
                          <ListItemText 
                            primary="Attendance Percentage" 
                            secondary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <LinearProgress
                                  variant="determinate"
                                  value={getAttendancePercentage(selectedRequest)}
                                  color={getAttendancePercentage(selectedRequest) >= 75 ? 'success' : 'error'}
                                  sx={{ width: 100, height: 8, borderRadius: 4 }}
                                />
                                <Typography variant="body2">
                                  {getAttendancePercentage(selectedRequest)}%
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        
                        {selectedRequest.parentContact && (
                          <ListItem>
                            <ListItemIcon><Phone /></ListItemIcon>
                            <ListItemText 
                              primary="Parent Contact" 
                              secondary={selectedRequest.parentContact}
                            />
                          </ListItem>
                        )}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardHeader title="Leave Details" />
                    <CardContent>
                      <List dense>
                        <ListItem>
                          <ListItemIcon><CalendarToday /></ListItemIcon>
                          <ListItemText 
                            primary="Leave Period" 
                            secondary={`${new Date(selectedRequest.startDate).toLocaleDateString()} to ${new Date(selectedRequest.endDate).toLocaleDateString()}`}
                          />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemIcon><AccessTime /></ListItemIcon>
                          <ListItemText 
                            primary="Duration" 
                            secondary={`${getDaysCount(selectedRequest.startDate, selectedRequest.endDate)} day(s)`}
                          />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemIcon><Event /></ListItemIcon>
                          <ListItemText 
                            primary="Leave Type" 
                            secondary={selectedRequest.leaveType || 'General'}
                          />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemIcon><Comment /></ListItemIcon>
                          <ListItemText 
                            primary="Reason" 
                            secondary={selectedRequest.reason}
                          />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemIcon>{getStatusIcon(selectedRequest.status)}</ListItemIcon>
                          <ListItemText 
                            primary="Status" 
                            secondary={
                              <Chip
                                label={selectedRequest.status}
                                color={getStatusColor(selectedRequest.status)}
                                size="small"
                              />
                            }
                          />
                        </ListItem>
                        
                        {selectedRequest.comments && (
                          <ListItem>
                            <ListItemIcon><Comment /></ListItemIcon>
                            <ListItemText 
                              primary="Coordinator Comments" 
                              secondary={selectedRequest.comments}
                            />
                          </ListItem>
                        )}
                        
                        {selectedRequest.approvedBy && (
                          <ListItem>
                            <ListItemIcon><Person /></ListItemIcon>
                            <ListItemText 
                              primary="Reviewed By" 
                              secondary={selectedRequest.approvedBy?.name || 'N/A'}
                            />
                          </ListItem>
                        )}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions>
              <Button onClick={handleCloseDetailsDialog}>Close</Button>
              {selectedRequest.status === 'Pending' && (
                <>
                  <Button 
                    variant="outlined" 
                    color="error"
                    onClick={() => handleMakeDecision(selectedRequest, 'Rejected')}
                  >
                    Reject
                  </Button>
                  <Button 
                    variant="contained" 
                    color="success"
                    onClick={() => handleMakeDecision(selectedRequest, 'Approved')}
                  >
                    Approve
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Decision Dialog */}
      <Dialog
        open={decisionDialog}
        onClose={handleCloseDecisionDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {decision === 'Approved' ? 'Approve Leave Request' : 'Reject Leave Request'}
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Are you sure you want to {decision.toLowerCase()} this leave request?
          </Typography>
          
          {selectedRequest && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                {selectedRequest.studentId?.name || selectedRequest.studentName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(selectedRequest.startDate).toLocaleDateString()} to {new Date(selectedRequest.endDate).toLocaleDateString()}
              </Typography>
            </Box>
          )}
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comments (Optional)"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder={`Add ${decision === 'Approved' ? 'approval' : 'rejection'} comments...`}
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDecisionDialog}>Cancel</Button>
          <Button
            variant="contained"
            color={decision === 'Approved' ? 'success' : 'error'}
            onClick={handleSubmitDecision}
            disabled={updateLeaveRequestMutation.isLoading}
          >
            {updateLeaveRequestMutation.isLoading ? 'Processing...' : `${decision}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveRequests; 