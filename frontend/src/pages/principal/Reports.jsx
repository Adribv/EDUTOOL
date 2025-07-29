import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

const Reports = () => {
  const [reportType, setReportType] = useState('');

  const handleReportTypeChange = (event) => {
    setReportType(event.target.value);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                label="Report Type"
                onChange={handleReportTypeChange}
              >
                <MenuItem value="academic">Academic Performance</MenuItem>
                <MenuItem value="attendance">Attendance</MenuItem>
                <MenuItem value="financial">Financial</MenuItem>
                <MenuItem value="staff">Staff Performance</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" color="primary">
              Generate Report
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Academic Performance
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overall pass rate: 95%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average attendance: 92%
              </Typography>
              <Button size="small" color="primary" sx={{ mt: 2 }}>
                View Details
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Staff Performance
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active teachers: 45
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average class size: 30
              </Typography>
              <Button size="small" color="primary" sx={{ mt: 2 }}>
                View Details
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Financial Overview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total revenue: $500,000
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Expenses: $450,000
              </Typography>
              <Button size="small" color="primary" sx={{ mt: 2 }}>
                View Details
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Attendance Summary
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Student attendance: 92%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Staff attendance: 95%
              </Typography>
              <Button size="small" color="primary" sx={{ mt: 2 }}>
                View Details
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports; 