import { useState, useEffect } from 'react';
import {
  Box,
  Switch,
  FormControlLabel,
  Typography,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow as DemoIcon,
  DataUsage as RealDataIcon,
} from '@mui/icons-material';

const DemoModeToggle = () => {
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    // Check if demo mode is enabled in localStorage
    const storedDemoMode = localStorage.getItem('demoMode') === 'true';
    setDemoMode(storedDemoMode);
  }, []);

  const handleDemoModeChange = (event) => {
    const newDemoMode = event.target.checked;
    setDemoMode(newDemoMode);
    localStorage.setItem('demoMode', newDemoMode.toString());
    
    // Reload the page to apply demo mode changes
    window.location.reload();
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 80,
        right: 20,
        zIndex: 1000,
        bgcolor: 'background.paper',
        borderRadius: 2,
        p: 2,
        boxShadow: 3,
        border: '1px solid',
        borderColor: 'divider',
        minWidth: 200,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Data Mode
        </Typography>
        <Chip
          label={demoMode ? 'Demo' : 'Live'}
          color={demoMode ? 'warning' : 'success'}
          size="small"
          sx={{ ml: 1 }}
        />
      </Box>
      
      <FormControlLabel
        control={
          <Switch
            checked={demoMode}
            onChange={handleDemoModeChange}
            color="warning"
          />
        }
        label={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {demoMode ? <DemoIcon sx={{ mr: 0.5, fontSize: 16 }} /> : <RealDataIcon sx={{ mr: 0.5, fontSize: 16 }} />}
            <Typography variant="body2">
              {demoMode ? 'Demo Data' : 'Live Data'}
            </Typography>
          </Box>
        }
      />
      
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        {demoMode 
          ? 'Using sample data for demonstration'
          : 'Connecting to real backend data'
        }
      </Typography>
    </Box>
  );
};

export default DemoModeToggle; 