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
import { parentAPI } from '../../services/api';
import { useState } from 'react';

const Assignments = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);

  const { data: assignments, isLoading, error } = useQuery({
    queryKey: ['child_assignments', childId],
    queryFn: () => parentAPI.getChildAssignments(childId),
  });

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

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (tabIndex === 1) return assignment.status === 'Submitted';
    if (tabIndex === 2) return assignment.status === 'Graded';
    return assignment.status === 'Pending';
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
            <Card sx={{ m: 2 }} key={assignment.id}>
              <CardContent>
                <ListItem>
                  <ListItemText
                    primary={assignment.title}
                    secondary={`Subject: ${assignment.subject} | Due: ${new Date(assignment.dueDate).toLocaleDateString()}`}
                  />
                  <Box display="flex" alignItems="center" gap={1}>
                    {assignment.status === 'Graded' && (
                      <Chip
                        icon={<Grade />}
                        label={`${assignment.grade}%`}
                        color="success"
                      />
                    )}
                    <Chip
                      icon={
                        assignment.status === 'Pending' ? <HourglassEmpty /> : <CheckCircle />
                      }
                      label={assignment.status}
                      color={
                        assignment.status === 'Pending' ? 'warning' : 'success'
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