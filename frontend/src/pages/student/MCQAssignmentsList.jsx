import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';

const MCQAssignmentsList = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const response = await studentAPI.getMCQAssignments();
        setAssignments(response.data || []);
      } catch {
        setError('Failed to load MCQ assignments');
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
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

  if (assignments.length === 0) {
    return (
      <Box p={3}>
        <Alert severity="info">No MCQ assignments available.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>MCQ Assignments</Typography>
      <Grid container spacing={3}>
        {assignments.map((assignment) => (
          <Grid item xs={12} md={6} key={assignment._id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{assignment.title}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {assignment.subject} • {assignment.class} • Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {assignment.description}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate(`/student/mcq-test/${assignment._id}`)}
                  disabled={assignment.isOverdue}
                >
                  {assignment.isOverdue ? 'Closed' : 'Start Test'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MCQAssignmentsList; 