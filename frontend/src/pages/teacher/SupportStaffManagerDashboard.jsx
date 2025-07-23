import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, CircularProgress, Button, Table, TableHead, TableRow, TableCell, TableBody, Alert, Chip } from '@mui/material';
import { People, Refresh } from '@mui/icons-material';
import { api } from '../../services/api';

const SupportStaffManagerDashboard = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/support-staff/all'); // Example endpoint
      setStaff(res.data.data || []);
    } catch (err) {
      setError('Failed to fetch support staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Support Staff Manager Dashboard
      </Typography>
      <Button startIcon={<Refresh />} onClick={fetchStaff} sx={{ mb: 2 }}>
        Refresh
      </Button>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>All Support Staff</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {staff.map((member) => (
                  <TableRow key={member._id}>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell><Chip label={member.status} color={member.status === 'Active' ? 'success' : 'default'} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {staff.length === 0 && <Typography>No support staff found.</Typography>}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default SupportStaffManagerDashboard; 