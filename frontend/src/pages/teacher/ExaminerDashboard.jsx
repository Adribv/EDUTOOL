import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, CircularProgress, Button, Table, TableHead, TableRow, TableCell, TableBody, Alert } from '@mui/material';
import { Assessment, Refresh } from '@mui/icons-material';
import { api } from '../../services/api';

const ExaminerDashboard = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExams = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/exams/all'); // Example endpoint
      setExams(res.data.data || []);
    } catch (err) {
      setError('Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Examiner Dashboard
      </Typography>
      <Button startIcon={<Refresh />} onClick={fetchExams} sx={{ mb: 2 }}>
        Refresh
      </Button>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>All Exams</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Exam Name</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam._id}>
                    <TableCell>{exam.name}</TableCell>
                    <TableCell>{exam.date ? new Date(exam.date).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{exam.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {exams.length === 0 && <Typography>No exams found.</Typography>}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ExaminerDashboard; 