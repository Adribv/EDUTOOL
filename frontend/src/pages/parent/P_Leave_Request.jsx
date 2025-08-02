import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
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
  Chip,
  FormHelperText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Event, Assignment, CheckCircle, Cancel } from '@mui/icons-material';
import { parentAPI } from '../../services/api';
import DocumentUpload from '../../components/DocumentUpload';

const P_Leave_Request = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [leaveDialog, setLeaveDialog] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    startDate: null,
    endDate: null,
    reason: '',
    supportingDocuments: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const childrenData = await parentAPI.getChildren();
      setChildren(childrenData);
      
      if (childrenData.length > 0) {
        setSelectedChild(childrenData[0].rollNumber);
      }
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveApplications = async (rollNumber) => {
    try {
      const applications = await parentAPI.getChildLeaveApplications(rollNumber);
      setLeaveApplications(applications);
    } catch (err) {
      console.error('Error fetching leave applications:', err);
    }
  };

  useEffect(() => {
    if (selectedChild) {
      fetchLeaveApplications(selectedChild);
    }
  }, [selectedChild]);

  const handleSubmitLeave = async () => {
    try {
      if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) {
        setError('Please fill all required fields');
        return;
      }

      const leaveData = {
        startDate: leaveForm.startDate.toISOString().split('T')[0],
        endDate: leaveForm.endDate.toISOString().split('T')[0],
        reason: leaveForm.reason,
        supportingDocuments: leaveForm.supportingDocuments
      };

      await parentAPI.submitLeaveApplication(selectedChild, leaveData);
      
      setLeaveDialog(false);
      setLeaveForm({ startDate: null, endDate: null, reason: '', attachments: [] });
      
      // Refresh leave applications
      fetchLeaveApplications(selectedChild);
      
      alert('Leave application submitted successfully!');
    } catch (err) {
      setError('Failed to submit leave application. Please try again.');
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'error';
      case 'Pending':
        return 'warning';
      default:
        return 'default';
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
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Leave Applications
      </Typography>

      {/* Child Selection */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Select Child</InputLabel>
          <Select
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
          >
            {children.map((child) => (
              <MenuItem key={child._id} value={child.rollNumber}>
                {child.name} - Class {child.class}{child.section}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {selectedChild && (
        <Grid container spacing={3}>
          {/* Submit New Leave Application */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Assignment sx={{ mr: 1 }} />
                  Submit Leave Application
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setLeaveDialog(true)}
                  fullWidth
                >
                  New Leave Request
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Leave Applications History */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Event sx={{ mr: 1 }} />
                  Leave Applications History
                </Typography>
                {leaveApplications.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Start Date</TableCell>
                          <TableCell>End Date</TableCell>
                          <TableCell>Reason</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Applied On</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {leaveApplications.map((application) => (
                          <TableRow key={application._id}>
                            <TableCell>{new Date(application.startDate).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(application.endDate).toLocaleDateString()}</TableCell>
                            <TableCell>{application.reason}</TableCell>
                            <TableCell>
                              <Chip
                                label={application.status}
                                color={getStatusColor(application.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(application.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="textSecondary">
                    No leave applications found
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Leave Application Dialog */}
      <Dialog open={leaveDialog} onClose={() => setLeaveDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Submit Leave Application</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ pt: 2 }}>
              <DatePicker
                label="Start Date"
                value={leaveForm.startDate}
                onChange={(date) => setLeaveForm({ ...leaveForm, startDate: date })}
                renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
              />
              <DatePicker
                label="End Date"
                value={leaveForm.endDate}
                onChange={(date) => setLeaveForm({ ...leaveForm, endDate: date })}
                renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
              />
              <TextField
                fullWidth
                label="Reason for Leave"
                multiline
                rows={4}
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                sx={{ mb: 2 }}
              />
              <FormHelperText>
                Please provide a detailed reason for the leave request
              </FormHelperText>
              
              <Box sx={{ mt: 3 }}>
                <DocumentUpload
                  documents={leaveForm.supportingDocuments}
                  onDocumentsChange={(documents) => setLeaveForm({ ...leaveForm, supportingDocuments: documents })}
                  documentTypes={[
                    'Medical Certificate',
                    'Travel Document',
                    'Family Function Invitation',
                    'School Event',
                    'Other'
                  ]}
                  maxFiles={5}
                  title="Supporting Documents"
                />
              </Box>
            </Box>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaveDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitLeave} variant="contained">
            Submit Application
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default P_Leave_Request; 