import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress, Alert } from '@mui/material';
import { api } from '../../services/api';

const SubstituteRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/teacher/substitute-requests');
        setRequests(res.data || []);
      } catch (err) {
        setError('Failed to load substitute requests');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>My Substitute Teacher Requests</Typography>
      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Request Date</TableCell>
                    <TableCell>Absent Teacher</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Absence Dates</TableCell>
                    <TableCell>Periods</TableCell>
                    <TableCell>Classes</TableCell>
                    <TableCell>Suggested Substitute</TableCell>
                    <TableCell>Remarks</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Current Approver</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} align="center">No substitute requests found.</TableCell>
                    </TableRow>
                  ) : (
                    requests.map((req) => (
                      <TableRow key={req._id}>
                        <TableCell>{req.requestData?.requestDate}</TableCell>
                        <TableCell>{req.requestData?.absentTeacherName}</TableCell>
                        <TableCell>{req.requestData?.department}</TableCell>
                        <TableCell>{req.requestData?.reasonForAbsence}</TableCell>
                        <TableCell>{req.requestData?.absenceFrom} - {req.requestData?.absenceTo}</TableCell>
                        <TableCell>{req.requestData?.periods}</TableCell>
                        <TableCell>{req.requestData?.classes}</TableCell>
                        <TableCell>{req.requestData?.suggestedSubstitute}</TableCell>
                        <TableCell>{req.requestData?.remarks}</TableCell>
                        <TableCell>
                          <Chip label={req.status} color={req.status === 'Pending' ? 'warning' : req.status === 'Approved' ? 'success' : req.status === 'Rejected' ? 'error' : 'default'} size="small" />
                        </TableCell>
                        <TableCell>{req.currentApprover}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SubstituteRequests; 