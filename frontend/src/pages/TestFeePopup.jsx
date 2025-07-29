import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Container,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { studentAPI, parentAPI } from '../services/api';

const TestFeePopup = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAPICall = async (apiFunction, description) => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      console.log(`🔧 Testing: ${description}`);
      const response = await apiFunction();
      console.log(`✅ ${description} - Success:`, response);
      setResult({
        type: 'success',
        title: description,
        data: response
      });
    } catch (err) {
      console.error(`❌ ${description} - Error:`, err);
      setError({
        title: description,
        message: err.response?.data?.message || err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const clearStorage = () => {
    localStorage.removeItem('feePopupShown');
    localStorage.removeItem('parentFeePopupShown');
    console.log('🗑️ Cleared all fee popup flags');
    setResult({
      type: 'info',
      title: 'Storage Cleared',
      data: 'Fee popup flags have been cleared'
    });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          Fee Popup Test Page
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Use this page to test the fee popup functionality for both students and parents.
        </Typography>

        <Grid container spacing={3}>
          {/* Student Tests */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Student Fee Tests
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Button
                    variant="contained"
                    onClick={() => handleAPICall(
                      () => studentAPI.createTestFeeRecords(),
                      'Create Test Student Fee Records'
                    )}
                    disabled={loading}
                  >
                    Create Test Fee Records
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={() => handleAPICall(
                      () => studentAPI.testStudentFeeRecords(),
                      'Check Student Fee Records'
                    )}
                    disabled={loading}
                  >
                    Check Fee Records
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={() => handleAPICall(
                      () => studentAPI.getFees(),
                      'Test Payment Status API'
                    )}
                    disabled={loading}
                  >
                    Test Payment Status
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Parent Tests */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Parent Fee Tests
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Button
                    variant="contained"
                    onClick={() => handleAPICall(
                      () => parentAPI.createTestParent(),
                      'Create Test Parent Account'
                    )}
                    disabled={loading}
                  >
                    Create Test Parent
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={() => handleAPICall(
                      () => parentAPI.getChildrenFeeStatus(),
                      'Test Children Fee Status API'
                    )}
                    disabled={loading}
                  >
                    Test Children Fee Status
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Utility Functions */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Utility Functions
                </Typography>
                <Box display="flex" gap={2}>
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={clearStorage}
                    disabled={loading}
                  >
                    Clear Fee Popup Flags
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={() => window.location.href = '/student/dashboard'}
                    disabled={loading}
                  >
                    Go to Student Dashboard
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={() => window.location.href = '/parent/dashboard'}
                    disabled={loading}
                  >
                    Go to Parent Dashboard
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Loading State */}
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Processing...
            </Typography>
          </Box>
        )}

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6">{error.title}</Typography>
            <Typography variant="body2">{error.message}</Typography>
          </Alert>
        )}

        {/* Result Display */}
        {result && (
          <Card>
            <CardContent>
              <Alert severity={result.type || 'success'} sx={{ mb: 2 }}>
                <Typography variant="h6">{result.title}</Typography>
              </Alert>
              <Typography variant="body2" gutterBottom>
                Response Data:
              </Typography>
              <Box 
                component="pre" 
                sx={{ 
                  backgroundColor: '#f5f5f5', 
                  p: 2, 
                  borderRadius: 1, 
                  overflow: 'auto',
                  fontSize: '0.875rem'
                }}
              >
                {JSON.stringify(result.data, null, 2)}
              </Box>
            </CardContent>
          </Card>
        )}

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Test Instructions:
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="1. Create Test Fee Records"
                secondary="Creates sample StudentFeeRecord entries with pending fees"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="2. Create Test Parent"
                secondary="Creates a test parent account linked to students (Email: testparent@example.com, Password: password123)"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="3. Clear Fee Popup Flags"
                secondary="Removes localStorage flags so popups will show again"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="4. Test Dashboards"
                secondary="Visit student or parent dashboards to see if fee popups appear"
              />
            </ListItem>
          </List>
        </Box>
      </Box>
    </Container>
  );
};

export default TestFeePopup; 