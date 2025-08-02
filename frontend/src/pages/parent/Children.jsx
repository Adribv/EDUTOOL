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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import parentService from '../../services/parentService';
import { Person, Assessment, Assignment, Add, School, ArrowBack } from '@mui/icons-material';
import { useState } from 'react';
import React from 'react';

const Children = () => {
  const navigate = useNavigate();
  const [linkDialog, setLinkDialog] = useState(false);
  const [rollNumber, setRollNumber] = useState('');
  const [linking, setLinking] = useState(false);

  const { data: children, isLoading, error, refetch } = useQuery({
    queryKey: ['parent_children'],
    queryFn: parentService.getChildren,
  });

  // Add debugging for the children data
  console.log('🔍 Children query data:', children);
  console.log('🔍 Children query loading:', isLoading);
  console.log('🔍 Children query error:', error);

  const handleLinkStudent = async () => {
    if (!rollNumber.trim()) {
      alert('Please enter a valid roll number');
      return;
    }

    try {
      setLinking(true);
      console.log('🔗 Attempting to link student with roll number:', rollNumber);
      
      // This will be implemented in the backend
      const response = await parentService.linkStudent(rollNumber);
      console.log('✅ Link response:', response);
      
      setLinkDialog(false);
      setRollNumber('');
      
      console.log('🔄 Refreshing children list...');
      await refetch(); // Refresh the children list
      
      console.log('📊 Current children data:', children);
      alert('Student linked successfully!');
    } catch (err) {
      console.error('❌ Error linking student:', err);
      console.error('❌ Error response:', err.response?.data);
      alert('Failed to link student. Please check the roll number and try again.');
    } finally {
      setLinking(false);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load children data. Please try again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>


      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          My Children
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => setLinkDialog(true)}
        >
          Link Student
        </Button>
      </Box>

      {children && children.length > 0 ? (
        <Grid container spacing={3}>
          {children.map((child) => (
            <Grid item xs={12} sm={6} md={4} key={child._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="div">
                        {child.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Roll No: {child.rollNumber}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box mb={2}>
                    <Chip 
                      label={`Class ${child.class}-${child.section}`}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Admission No:</strong> {child.admissionNumber || 'N/A'}
                  </Typography>
                  
                  {child.parentInfo && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Contact:</strong> {child.parentInfo.contactNumber || 'N/A'}
                    </Typography>
                  )}
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => navigate(`/parent/children/${child.rollNumber}/progress`)}
                    startIcon={<Assessment />}
                  >
                    Progress
                  </Button>
                  <Button 
                    size="small" 
                    onClick={() => navigate(`/parent/children/${child.rollNumber}/assignments`)}
                    startIcon={<Assignment />}
                  >
                    Assignments
                  </Button>
                  <Button 
                    size="small" 
                    onClick={() => navigate(`/parent/children/${child.rollNumber}/details`)}
                    startIcon={<School />}
                  >
                    Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No Children Found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            It looks like no students are currently linked to your parent account.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            To get started, you can link your child using their student roll number.
            If you believe this is an error, please contact the school administration.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<Add />}
            onClick={() => setLinkDialog(true)}
            sx={{ mt: 2 }}
          >
            Link Your Child
          </Button>
        </Paper>
      )}

      {/* Link Student Dialog */}
      <Dialog open={linkDialog} onClose={() => setLinkDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Link Student to Your Account</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Enter your child's student roll number to link them to your parent account.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Student Roll Number"
            type="text"
            fullWidth
            variant="outlined"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            placeholder="e.g., 10A001"
            helperText="Enter the roll number exactly as provided by the school"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialog(false)} disabled={linking}>
            Cancel
          </Button>
          <Button 
            onClick={handleLinkStudent} 
            variant="contained" 
            disabled={linking || !rollNumber.trim()}
          >
            {linking ? 'Linking...' : 'Link Student'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Children; 