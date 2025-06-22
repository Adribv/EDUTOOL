import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Avatar,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { parentAPI } from '../../services/api';
import { Person, Assessment, Assignment } from '@mui/icons-material';

const Children = () => {
  const navigate = useNavigate();
  const { data: children, isLoading, error } = useQuery({
    queryKey: ['parent_children'],
    queryFn: parentAPI.getChildren,
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
        <Alert severity="error">Failed to load children data: {error.message}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        My Children
      </Typography>
      {children && children.length > 0 ? (
        <Grid container spacing={3}>
          {children.map(child => (
            <Grid item xs={12} sm={6} md={4} key={child.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                    <Avatar 
                      src={child.profilePicture}
                      sx={{ width: 80, height: 80, mb: 2 }}
                    >
                      {child.name.charAt(0)}
                    </Avatar>
                    <Typography variant="h6">{child.name}</Typography>
                    <Typography color="text.secondary">
                      Class: {child.class} | Roll No: {child.rollNumber}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', p: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Assessment />}
                    onClick={() => navigate(`/parent/children/${child.id}/progress`)}
                  >
                    Progress
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Assignment />}
                    onClick={() => navigate(`/parent/children/${child.id}/assignments`)}
                  >
                    Assignments
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Person sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6">No children found.</Typography>
          <Typography color="text.secondary">
            If you believe this is an error, please contact the school administration.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default Children; 