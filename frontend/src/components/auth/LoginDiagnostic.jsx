import { useState } from 'react';
import { Box, Typography, Paper, Button, Chip } from '@mui/material';

const LoginDiagnostic = () => {
  const [diagnostics, setDiagnostics] = useState(null);

  const runDiagnostic = () => {
    const token = localStorage.getItem('token');
    const parentToken = localStorage.getItem('parentToken');
    const studentToken = localStorage.getItem('studentToken');
    const userRole = localStorage.getItem('userRole');
    
    // Get current API URL
    const apiUrl = import.meta.env.VITE_API_URL || 'https://api.edulives.com/api';
    
    const results = {
      apiUrl,
      hasGeneralToken: !!token,
      hasParentToken: !!parentToken,
      hasStudentToken: !!studentToken,
      userRole,
      tokenLength: token ? token.length : 0,
      timestamp: new Date().toLocaleString()
    };
    
    setDiagnostics(results);
    console.log('Login Diagnostics:', results);
  };

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        Authentication Diagnostic Tool
      </Typography>
      
      <Button variant="contained" onClick={runDiagnostic} sx={{ mb: 2 }}>
        Run Diagnostic
      </Button>
      
      {diagnostics && (
        <Box>
          <Typography variant="body2" gutterBottom>
            <strong>API URL:</strong> {diagnostics.apiUrl}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip 
              label={`General Token: ${diagnostics.hasGeneralToken ? 'Present' : 'Missing'}`}
              color={diagnostics.hasGeneralToken ? 'success' : 'error'}
            />
            <Chip 
              label={`Parent Token: ${diagnostics.hasParentToken ? 'Present' : 'Missing'}`}
              color={diagnostics.hasParentToken ? 'success' : 'default'}
            />
            <Chip 
              label={`Student Token: ${diagnostics.hasStudentToken ? 'Present' : 'Missing'}`}
              color={diagnostics.hasStudentToken ? 'success' : 'default'}
            />
            <Chip 
              label={`User Role: ${diagnostics.userRole || 'Not Set'}`}
              color={diagnostics.userRole ? 'success' : 'warning'}
            />
          </Box>
          
          <Typography variant="body2">
            <strong>Last Check:</strong> {diagnostics.timestamp}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default LoginDiagnostic; 