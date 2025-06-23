import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
} from '@mui/material';
import { ArrowBack, Assignment, CheckCircle, HourglassEmpty, Grade } from '@mui/icons-material';
import parentService from '../../services/parentService';
import { useState } from 'react';

const Assignments = () => {
  const { rollNumber } = useParams();
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);

  const { data: assignmentsData, isLoading, error } = useQuery({
    queryKey: ['child_assignments', rollNumber],
    queryFn: () => parentService.getChildAssignments(rollNumber),
  });

  // Debug logging
  console.log('🔍 Assignments data:', assignmentsData);
  console.log('🔍 Assignments data type:', typeof assignmentsData);
  console.log('🔍 Is array:', Array.isArray(assignmentsData));

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error">Failed to load assignments: {error.message}</Alert>
      </Box>
    );
  }

  // Ensure assignments is an array
  const assignments = Array.isArray(assignmentsData) ? assignmentsData : [];

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const filteredAssignments = assignments.filter(assignment => {
    const status = assignment.submissionStatus || assignment.status;
    if (tabIndex === 1) return status === 'Submitted' || status === 'Late';
    if (tabIndex === 2) return status === 'Graded';
    return status === 'Not Submitted' || status === 'Pending';
  });

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back to Progress
      </Button>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Assignments
      </Typography>
      
      <Paper>
        <Tabs value={tabIndex} onChange={handleTabChange} centered>
          <Tab label="Pending" />
          <Tab label="Submitted" />
          <Tab label="Graded" />
        </Tabs>
        <List>
          {filteredAssignments.map((assignment, index) => (
            <Card sx={{ m: 2 }} key={assignment._id || assignment.id || index}>
              <CardContent>
                <ListItem>
                  <ListItemText
                    primary={assignment.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Subject: {assignment.subject} | Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </Typography>
                        {assignment.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {assignment.description}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <Box display="flex" alignItems="center" gap={1}>
                    {(assignment.submissionStatus === 'Graded' || assignment.status === 'Graded') && (
                      <Chip
                        icon={<Grade />}
                        label={`${assignment.grade || assignment.score || 'N/A'}%`}
                        color="success"
                      />
                    )}
                    <Chip
                      icon={
                        (assignment.submissionStatus === 'Not Submitted' || assignment.status === 'Pending') ? 
                        <HourglassEmpty /> : <CheckCircle />
                      }
                      label={assignment.submissionStatus || assignment.status}
                      color={
                        (assignment.submissionStatus === 'Not Submitted' || assignment.status === 'Pending') ? 
                        'warning' : 
                        (assignment.submissionStatus === 'Late') ? 'error' : 'success'
                      }
                    />
                  </Box>
                </ListItem>
              </CardContent>
            </Card>
          ))}
        </List>
        {filteredAssignments.length === 0 && (
          <Typography sx={{ textAlign: 'center', p: 3 }}>
            No assignments in this category.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default Assignments; 