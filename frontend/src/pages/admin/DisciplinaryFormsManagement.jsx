import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Warning,
  Settings,
  Assessment,
  Visibility,
  Edit,
  Delete,
  Add,
  Download,
  TrendingUp,
  CheckCircle,
  Schedule,
  Group
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { disciplinaryAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DisciplinaryFormTemplate from './DisciplinaryFormTemplate';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`disciplinary-tabpanel-${index}`}
      aria-labelledby={`disciplinary-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const DisciplinaryFormsManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [debugMode, setDebugMode] = useState(false);

  // Fetch all forms for overview
  const { data: forms = [], isLoading: formsLoading, error: formsError } = useQuery({
    queryKey: ['disciplinaryForms'],
    queryFn: () => disciplinaryAPI.getAllForms(),
    onError: (error) => {
      console.error('Failed to fetch disciplinary forms:', error);
    }
  });

  // Fetch statistics
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['disciplinaryStats'],
    queryFn: () => disciplinaryAPI.getStats({ period: 'month' }),
    onError: (error) => {
      console.error('Failed to fetch disciplinary stats:', error);
    }
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'submitted': return 'info';
      case 'awaitingStudentAck': return 'warning';
      case 'awaitingParentAck': return 'warning';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'submitted': return 'Submitted';
      case 'awaitingStudentAck': return 'Awaiting Student';
      case 'awaitingParentAck': return 'Awaiting Parent';
      case 'draft': return 'Draft';
      default: return 'Unknown';
    }
  };

  const handleCreateForm = () => {
    console.log('Creating new form - User:', user);
    console.log('Auth token present:', !!localStorage.getItem('token'));
    navigate('/admin/disciplinary-forms/create');
  };

  const DebugSection = () => (
    <Alert severity="info" sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>Authentication Debug Information</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="body2"><strong>Current User:</strong> {user?.name || 'Not loaded'}</Typography>
          <Typography variant="body2"><strong>User Role:</strong> {user?.role || 'Not loaded'}</Typography>
          <Typography variant="body2"><strong>User ID:</strong> {user?._id || user?.id || 'Not loaded'}</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="body2"><strong>Auth Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Missing'}</Typography>
          <Typography variant="body2"><strong>Stored Role:</strong> {localStorage.getItem('userRole') || 'None'}</Typography>
          <Typography variant="body2"><strong>Forms Error:</strong> {formsError?.message || 'None'}</Typography>
          <Typography variant="body2"><strong>Stats Error:</strong> {statsError?.message || 'None'}</Typography>
        </Grid>
      </Grid>
    </Alert>
  );

  if (formsLoading || statsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" display="flex" alignItems="center">
          <Warning sx={{ mr: 2, color: 'warning.main' }} />
          Disciplinary Forms Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setDebugMode(!debugMode)}
          >
            {debugMode ? 'Hide Debug' : 'Show Debug'}
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateForm}
          >
            Create New Form
          </Button>
        </Box>
      </Box>

      {/* Debug Section */}
      {debugMode && <DebugSection />}

      {/* Error Alerts */}
      {formsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load forms: {formsError.response?.data?.message || formsError.message}
        </Alert>
      )}
      
      {statsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load statistics: {statsError.response?.data?.message || statsError.message}
        </Alert>
      )}

      {/* Statistics Overview */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Assessment color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Forms</Typography>
              </Box>
              <Typography variant="h4" color="primary.main">
                {forms.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All time forms
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Schedule color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Pending</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {forms.filter(f => f.status === 'submitted' || f.status.includes('awaiting')).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Awaiting acknowledgment
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Completed</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {forms.filter(f => f.status === 'completed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fully processed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUp color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">This Month</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {forms.filter(f => {
                  const formDate = new Date(f.createdAt);
                  const now = new Date();
                  return formDate.getMonth() === now.getMonth() && formDate.getFullYear() === now.getFullYear();
                }).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current month forms
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="disciplinary forms management tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            label="Overview"
            icon={<Assessment />}
            iconPosition="start"
            id="disciplinary-tab-0"
            aria-controls="disciplinary-tabpanel-0"
          />
          <Tab
            label="Template Settings"
            icon={<Settings />}
            iconPosition="start"
            id="disciplinary-tab-1"
            aria-controls="disciplinary-tabpanel-1"
          />
          <Tab
            label="Analytics"
            icon={<TrendingUp />}
            iconPosition="start"
            id="disciplinary-tab-2"
            aria-controls="disciplinary-tabpanel-2"
          />
          <Tab
            label="Bulk Actions"
            icon={<Group />}
            iconPosition="start"
            id="disciplinary-tab-3"
            aria-controls="disciplinary-tabpanel-3"
          />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box>
            <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
              <Typography variant="h6">Recent Disciplinary Forms</Typography>
              <Button
                variant="outlined"
                startIcon={<Download />}
                size="small"
              >
                Export All
              </Button>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Grade/Section</TableCell>
                    <TableCell>Incident Date</TableCell>
                    <TableCell>Created By</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {forms.slice(0, 10).map((form) => (
                    <TableRow key={form._id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {form.studentName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Roll: {form.rollNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>{form.grade} - {form.section}</TableCell>
                      <TableCell>
                        {form.dateOfIncident ? new Date(form.dateOfIncident).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{form.createdByName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {form.createdByRole}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(form.status)}
                          color={getStatusColor(form.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(form.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/admin/disciplinary-forms/${form._id}`)}
                          title="View Form"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/admin/disciplinary-forms/${form._id}/edit`)}
                          title="Edit Form"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          title="Delete Form"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {forms.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No disciplinary forms found. Forms created by teachers will appear here.
              </Alert>
            )}
          </Box>
        </TabPanel>

        {/* Template Settings Tab */}
        <TabPanel value={tabValue} index={1}>
          <DisciplinaryFormTemplate />
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Forms by Status
                  </Typography>
                  {stats?.statusStats?.map((stat) => (
                    <Box key={stat._id} display="flex" justifyContent="space-between" mb={1}>
                      <Typography>{getStatusLabel(stat._id)}</Typography>
                      <Typography fontWeight="bold">{stat.count}</Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Most Common Misconduct Types
                  </Typography>
                  {stats?.misconductStats?.slice(0, 5).map((stat) => (
                    <Box key={stat._id} display="flex" justifyContent="space-between" mb={1}>
                      <Typography>{stat._id.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Typography>
                      <Typography fontWeight="bold">{stat.count}</Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Monthly Trends
                  </Typography>
                  <Alert severity="info">
                    Analytics charts will be displayed here showing monthly form trends, 
                    misconduct patterns, and other insights.
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Bulk Actions Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Bulk Export
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Export disciplinary forms in various formats for reporting and analysis.
                  </Typography>
                  <Box display="flex" gap={2}>
                    <Button variant="outlined" startIcon={<Download />}>
                      Export CSV
                    </Button>
                    <Button variant="outlined" startIcon={<Download />}>
                      Export PDF
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Bulk Notifications
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Send reminders to students and parents for pending acknowledgments.
                  </Typography>
                  <Box display="flex" gap={2}>
                    <Button variant="outlined">
                      Notify Students
                    </Button>
                    <Button variant="outlined">
                      Notify Parents
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Archive Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Archive old forms and manage storage space.
                  </Typography>
                  <Button variant="outlined" color="warning">
                    Archive Old Forms
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default DisciplinaryFormsManagement; 