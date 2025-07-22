import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  RadioGroup,
  FormControl,
  FormLabel,
  FormControlLabel,
  Radio,
  Checkbox,
  Button,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  OutlinedInput,
  Stack,
  Divider,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Send,
  History,
  Visibility,
} from '@mui/icons-material';

const CounsellingRequestForm = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'Teacher' || user?.role === 'Admin' || user?.role === 'Principal' || user?.role === 'Vice Principal' || user?.role === 'HOD';
  
  const [activeTab, setActiveTab] = useState(0);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const initialState = {
    schoolName: '',
    dateOfRequest: new Date().toISOString().split('T')[0],
    requestedBy: isTeacher ? 'Teacher' : '',
    requestedByOther: '',
    studentDetails: {
      fullName: '',
      gradeClassSection: '',
      rollNumber: '',
      age: '',
      gender: '',
    },
    parentGuardianName: '',
    contactNumber: user?.phone || user?.contactNumber || '',
    email: user?.email || '',
    reasons: [],
    reasonOther: '',
    briefDescription: '',
    preferredMode: '',
    preferredTime: '',
    signature: user?.name || '',
    date: new Date().toISOString().split('T')[0],
  };

  const reasonsList = [
    'Academic Stress',
    'Emotional/Behavioral Concerns',
    'Peer Issues/Bullying',
    'Family-Related Issues',
    'Career Guidance',
    'Health/Well-being',
  ];

  const modes = [
    'One-on-One (in person)',
    'Online/Virtual Session',
    'Group Counselling',
    'No preference',
  ];

  const [form, setForm] = useState(initialState);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeTab === 1 && isTeacher) {
      fetchRequests();
      fetchStats();
    }
  }, [activeTab, isTeacher]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('/counselling-requests', {
        params: { requesterId: user?._id || user?.id, requesterType: 'Teacher' }
      });
      setRequests(response.data.data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/counselling-requests/stats', {
        params: { requesterId: user?._id || user?.id, requesterType: 'Teacher' }
      });
      setStats(response.data.data || {});
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('studentDetails.')) {
      setForm({
        ...form,
        studentDetails: {
          ...form.studentDetails,
          [name.split('.')[1]]: value,
        },
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleCheckbox = (reason) => {
    setForm((prev) => {
      const reasons = prev.reasons.includes(reason)
        ? prev.reasons.filter((r) => r !== reason)
        : [...prev.reasons, reason];
      return { ...prev, reasons };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    try {
      const payload = {
        ...form,
        dateOfRequest: form.dateOfRequest ? new Date(form.dateOfRequest) : new Date(),
        date: form.date ? new Date(form.date) : new Date(),
        dateReceived: new Date(), // Add when form is received
        requesterType: isTeacher ? 'Teacher' : 'Student',
        requesterId: user?._id || user?.id
      };
      
      console.log('Submitting counselling request:', payload);
      const response = await api.post('/counselling-requests', payload);
      console.log('Response:', response.data);
      
      setSuccess(true);
      setForm(initialState);
      
      // Switch to history tab for teachers
      if (isTeacher) {
        setActiveTab(1);
      }
      
    } catch (err) {
      console.error('Error submitting counselling request:', err);
      setError(err.response?.data?.error || 'Failed to submit counselling request. Please try again.');
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', my: 4 }}>
      <Paper elevation={4} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3 }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight={700}>
          {isTeacher ? 'Teacher Counselling Request Form' : 'Student Counselling Request Form'}
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        {isTeacher && (
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="New Request" icon={<Send />} />
            <Tab label="Request History" icon={<History />} />
          </Tabs>
        )}

        {activeTab === 0 && (
          <form onSubmit={handleSubmit} autoComplete="off">
            <Grid container spacing={3}>
              {/* School Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>School Information</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="School Name" name="schoolName" value={form.schoolName} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Date of Request" name="dateOfRequest" type="date" value={form.dateOfRequest} onChange={handleChange} fullWidth required InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12}>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel>Requested By</FormLabel>
                  <RadioGroup row name="requestedBy" value={form.requestedBy} onChange={handleChange}>
                    <FormControlLabel value="Student" control={<Radio />} label="Student" />
                    <FormControlLabel value="Parent" control={<Radio />} label="Parent" />
                    <FormControlLabel value="Teacher" control={<Radio />} label="Teacher" />
                    <FormControlLabel value="Other" control={<Radio />} label="Other" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              {form.requestedBy === 'Other' && (
                <Grid item xs={12} sm={6}>
                  <TextField label="Please specify" name="requestedByOther" value={form.requestedByOther} onChange={handleChange} fullWidth />
                </Grid>
              )}

              {/* Student Details */}
              <Grid item xs={12} mt={2}>
                <Typography variant="h6" gutterBottom>Student Details</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Full Name" name="studentDetails.fullName" value={form.studentDetails.fullName} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Grade/Class & Section" name="studentDetails.gradeClassSection" value={form.studentDetails.gradeClassSection} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="Roll Number" name="studentDetails.rollNumber" value={form.studentDetails.rollNumber} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField label="Age" name="studentDetails.age" value={form.studentDetails.age} onChange={handleChange} type="number" inputProps={{ min: 1 }} fullWidth required />
              </Grid>
              <Grid item xs={6} sm={4}>
                <FormControl fullWidth required>
                  <InputLabel>Gender</InputLabel>
                  <Select label="Gender" name="studentDetails.gender" value={form.studentDetails.gender} onChange={handleChange} input={<OutlinedInput label="Gender" />}>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Contact Information */}
              <Grid item xs={12} mt={2}>
                <Typography variant="h6" gutterBottom>Contact Information</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Parent/Guardian Name" name="parentGuardianName" value={form.parentGuardianName} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Contact Number" name="contactNumber" value={form.contactNumber} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Email (if applicable)" name="email" value={form.email} onChange={handleChange} type="email" fullWidth />
              </Grid>

              {/* Reason for Counselling Request */}
              <Grid item xs={12} mt={2}>
                <Typography variant="h6" gutterBottom>Reason for Counselling Request</Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  (Tick all that apply)
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={2}>
                  {reasonsList.map((reason) => (
                    <FormControlLabel
                      key={reason}
                      control={
                        <Checkbox
                          checked={form.reasons.includes(reason)}
                          onChange={() => handleCheckbox(reason)}
                        />
                      }
                      label={reason}
                    />
                  ))}
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!!form.reasonOther}
                        onChange={e => setForm({ ...form, reasonOther: e.target.checked ? '' : '' })}
                      />
                    }
                    label={
                      <TextField
                        label="Other"
                        name="reasonOther"
                        value={form.reasonOther}
                        onChange={handleChange}
                        size="small"
                        sx={{ minWidth: 120 }}
                      />
                    }
                  />
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Brief Description of the Concern"
                  name="briefDescription"
                  value={form.briefDescription}
                  onChange={handleChange}
                  multiline
                  minRows={3}
                  fullWidth
                />
              </Grid>

              {/* Preferred Counselling Mode */}
              <Grid item xs={12} mt={2}>
                <Typography variant="h6" gutterBottom>Preferred Counselling Mode</Typography>
                <RadioGroup row name="preferredMode" value={form.preferredMode} onChange={handleChange}>
                  {modes.map((mode) => (
                    <FormControlLabel key={mode} value={mode} control={<Radio />} label={mode} />
                  ))}
                </RadioGroup>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Preferred Time (if any)" name="preferredTime" value={form.preferredTime} onChange={handleChange} fullWidth />
              </Grid>

              {/* Confidentiality Statement */}
              <Grid item xs={12} mt={2}>
                <Typography variant="h6" gutterBottom>Confidentiality Statement</Typography>
                <Typography variant="body2" color="text.secondary">
                  All information provided in this form will be kept confidential and used solely for the purpose of providing appropriate counseling support.
                </Typography>
              </Grid>

              {/* Signature and Date */}
              <Grid item xs={12} sm={6}>
                <TextField label="Signature" name="signature" value={form.signature} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Date" name="date" type="date" value={form.date} onChange={handleChange} fullWidth required InputLabelProps={{ shrink: true }} />
              </Grid>

              {/* Submit Button and Feedback */}
              <Grid item xs={12}>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Button type="submit" variant="contained" size="large" color="primary">
                    Submit
                  </Button>
                </Box>
                {success && <Alert severity="success" sx={{ mt: 2 }}>Request submitted successfully!</Alert>}
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              </Grid>
            </Grid>
          </form>
        )}

        {activeTab === 1 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>Request History</Typography>
            <Divider sx={{ mb: 3 }} />
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : requests.length === 0 ? (
              <Typography variant="body1" align="center">No counselling requests found.</Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>School Name</TableCell>
                      <TableCell>Date of Request</TableCell>
                      <TableCell>Requested By</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request._id}>
                        <TableCell>{request._id}</TableCell>
                        <TableCell>{request.schoolName}</TableCell>
                        <TableCell>{new Date(request.dateOfRequest).toLocaleDateString()}</TableCell>
                        <TableCell>{request.requestedBy}</TableCell>
                        <TableCell>
                          <Chip label={request.status} color={getStatusColor(request.status)} />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Details">
                            <IconButton onClick={() => handleViewRequest(request)}>
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Paper>

      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Counselling Request Details</DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6">Request Information</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">ID:</Typography>
                <Typography variant="body2">{selectedRequest._id}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">School Name:</Typography>
                <Typography variant="body2">{selectedRequest.schoolName}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Date of Request:</Typography>
                <Typography variant="body2">{new Date(selectedRequest.dateOfRequest).toLocaleDateString()}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Requested By:</Typography>
                <Typography variant="body2">{selectedRequest.requestedBy}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Status:</Typography>
                <Typography variant="body2">{selectedRequest.status}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Student Details:</Typography>
                <Typography variant="body2">
                  Full Name: {selectedRequest.studentDetails.fullName}<br />
                  Grade/Class & Section: {selectedRequest.studentDetails.gradeClassSection}<br />
                  Roll Number: {selectedRequest.studentDetails.rollNumber}<br />
                  Age: {selectedRequest.studentDetails.age}<br />
                  Gender: {selectedRequest.studentDetails.gender}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Contact Information:</Typography>
                <Typography variant="body2">
                  Parent/Guardian Name: {selectedRequest.parentGuardianName}<br />
                  Contact Number: {selectedRequest.contactNumber}<br />
                  Email: {selectedRequest.email}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Reason for Counselling:</Typography>
                <Typography variant="body2">
                  {selectedRequest.reasons.map((reason, index) => (
                    <span key={index}>{reason}{index < selectedRequest.reasons.length - 1 ? ', ' : ''}</span>
                  ))}
                  {selectedRequest.reasonOther && `, Other: ${selectedRequest.reasonOther}`}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Brief Description:</Typography>
                <Typography variant="body2">{selectedRequest.briefDescription}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Preferred Mode:</Typography>
                <Typography variant="body2">{selectedRequest.preferredMode}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Preferred Time:</Typography>
                <Typography variant="body2">{selectedRequest.preferredTime}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Signature:</Typography>
                <Typography variant="body2">{selectedRequest.signature}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Date:</Typography>
                <Typography variant="body2">{new Date(selectedRequest.date).toLocaleDateString()}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CounsellingRequestForm; 