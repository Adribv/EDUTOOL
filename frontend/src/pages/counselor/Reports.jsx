import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';

const Reports = () => {
  const [reportType, setReportType] = useState('');

  const handleReportTypeChange = (event) => {
    setReportType(event.target.value);
  };

  const handleGenerateReport = () => {
    // TODO: Implement report generation logic
    console.log('Generating report:', reportType);
  };

  const handleDownloadReport = () => {
    // TODO: Implement report download logic
    console.log('Downloading report:', reportType);
  };

  const counselingStats = {
    totalSessions: 150,
    academicSessions: 45,
    careerSessions: 35,
    personalSessions: 40,
    behavioralSessions: 30,
  };

  const recentSessions = [
    {
      id: 1,
      studentName: 'John Doe',
      date: '2024-03-20',
      type: 'Academic',
      outcome: 'Positive',
      followUp: 'Scheduled',
    },
    {
      id: 2,
      studentName: 'Jane Smith',
      date: '2024-03-19',
      type: 'Career',
      outcome: 'Neutral',
      followUp: 'Not Required',
    },
    {
      id: 3,
      studentName: 'Mike Johnson',
      date: '2024-03-18',
      type: 'Personal',
      outcome: 'Positive',
      followUp: 'Scheduled',
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Counseling Reports
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={reportType}
                    onChange={handleReportTypeChange}
                    label="Report Type"
                  >
                    <MenuItem value="session-summary">Session Summary</MenuItem>
                    <MenuItem value="student-progress">Student Progress</MenuItem>
                    <MenuItem value="counseling-trends">Counseling Trends</MenuItem>
                    <MenuItem value="outcome-analysis">Outcome Analysis</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleGenerateReport}
                    disabled={!reportType}
                  >
                    Generate Report
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadReport}
                    disabled={!reportType}
                  >
                    Download
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Counseling Statistics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Sessions
                  </Typography>
                  <Typography variant="h4">
                    {counselingStats.totalSessions}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Academic Sessions
                  </Typography>
                  <Typography variant="h4">
                    {counselingStats.academicSessions}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Career Sessions
                  </Typography>
                  <Typography variant="h4">
                    {counselingStats.careerSessions}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Personal Sessions
                  </Typography>
                  <Typography variant="h4">
                    {counselingStats.personalSessions}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Recent Sessions
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Outcome</TableCell>
                  <TableCell>Follow-up</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>{session.studentName}</TableCell>
                    <TableCell>{session.date}</TableCell>
                    <TableCell>{session.type}</TableCell>
                    <TableCell>{session.outcome}</TableCell>
                    <TableCell>{session.followUp}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports; 