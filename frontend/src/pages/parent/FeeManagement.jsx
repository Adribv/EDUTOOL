import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Payment, Receipt, History } from '@mui/icons-material';
import parentService from '../../services/parentService';

const FeeManagement = () => {
  const [selectedChild, setSelectedChild] = useState('');
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch children first
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const childrenData = await parentService.getChildren();
        // Ensure childrenData is an array
        const childrenArray = Array.isArray(childrenData) ? childrenData : [];
        console.log('🔍 Children data received:', childrenData);
        console.log('🔍 Children array:', childrenArray);
        setChildren(childrenArray);
      } catch (error) {
        console.error('Error fetching children:', error);
        setChildren([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  // Only fetch fee data if a child is selected
  const { data: feeData, isLoading: feeLoading, error } = useQuery({
    queryKey: ['parent_fees', selectedChild],
    queryFn: () => parentService.getFees(selectedChild),
    enabled: !!selectedChild, // Only run query if selectedChild exists
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Fee Management
      </Typography>

      {/* Child Selection */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Select Student</InputLabel>
          <Select
            value={selectedChild}
            onChange={e => setSelectedChild(String(e.target.value))}
          >
            {Array.isArray(children) && children.map(child => (
              <MenuItem key={child._id} value={String(child.rollNumber)}>
                {child.name} - Class {child.class}{child.section}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* Only show fee data if a student is selected */}
      {selectedChild && (
        <>
          {feeLoading && (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Box>
              <Alert severity="error">Failed to load fee information: {error.message}</Alert>
            </Box>
          )}

          {feeData && (
            <Grid container spacing={3}>
              {/* Fee Summary */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Fee Structure</Typography>
                    <Typography variant="h4" color="primary.main">
                      {feeData.academicYear || 'Current Year'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Total Components</Typography>
                    <Typography variant="h4">
                      {feeData.feeComponents?.length || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4} sx={{ alignSelf: 'center', textAlign: 'center' }}>
                <Button variant="contained" size="large" startIcon={<Payment />}>
                  Pay Now
                </Button>
              </Grid>
            </Grid>
          )}
        </>
      )}

      {!selectedChild && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Select a student to view fee information
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose a student from the dropdown above to see their fee structure and payment status.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default FeeManagement; 