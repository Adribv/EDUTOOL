import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
} from '@mui/material';
import {
  LocalHospital,
  Warning,
  CheckCircle,
  Error,
  Event,
  Description,
  Close,
  MedicalServices,
  Psychology,
  Vaccines,
} from '@mui/icons-material';
import { parentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Health = () => {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [healthInfo, setHealthInfo] = useState({});
  const [selectedChild, setSelectedChild] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [childrenRes] = await Promise.all([
        parentAPI.getChildren(),
      ]);
      setChildren(childrenRes.data);
      
      // Fetch health info for each child
      const healthPromises = childrenRes.data.map(child =>
        Promise.all([
          parentAPI.getChildHealthInfo(child.rollNumber),
          parentAPI.getChildHealthIncidents(child.rollNumber),
          parentAPI.getChildCounselorRecommendations(child.rollNumber)
        ])
      );
      
      const healthResults = await Promise.all(healthPromises);
      
      const healthMap = {};
      childrenRes.data.forEach((child, index) => {
        healthMap[child.rollNumber] = {
          healthInfo: healthResults[index][0].data,
          incidents: healthResults[index][1].data,
          recommendations: healthResults[index][2].data
        };
      });
      setHealthInfo(healthMap);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load health information');
    } finally {
      setLoading(false);
    }
  };

  const handleDetailsDialogOpen = (child) => {
    setSelectedChild(child);
    setDetailsDialog(true);
  };

  const handleDetailsDialogClose = () => {
    setDetailsDialog(false);
    setSelectedChild(null);
  };

  const getHealthStatusChip = (status) => {
    switch (status) {
      case 'Good':
        return <Chip label="Good" color="success" size="small" />;
      case 'Attention Required':
        return <Chip label="Attention Required" color="warning" size="small" />;
      case 'Critical':
        return <Chip label="Critical" color="error" size="small" />;
      default:
        return <Chip label={status} color="default" size="small" />;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Health and Wellness
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocalHospital color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Health Status</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {Object.values(healthInfo).filter(info => info.healthInfo?.status === 'Good').length} / {children.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Children in Good Health
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Warning color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Recent Incidents</Typography>
              </Box>
              <Typography variant="h4" color="warning">
                {Object.values(healthInfo).reduce((acc, info) => acc + info.incidents?.length, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last 30 Days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Psychology color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Recommendations</Typography>
              </Box>
              <Typography variant="h4" color="info">
                {Object.values(healthInfo).reduce((acc, info) => acc + info.recommendations?.length, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Recommendations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Health Details */}
      <Grid container spacing={3}>
        {children.map((child) => (
          <Grid item xs={12} key={child.rollNumber}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {child.firstName} {child.lastName} - Health Information
                  </Typography>
                  {getHealthStatusChip(healthInfo[child.rollNumber]?.healthInfo?.status)}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <MedicalServices />
                        </ListItemIcon>
                        <ListItemText
                          primary="Medical Conditions"
                          secondary={healthInfo[child.rollNumber]?.healthInfo?.medicalConditions?.join(', ') || 'None'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Vaccines />
                        </ListItemIcon>
                        <ListItemText
                          primary="Allergies"
                          secondary={healthInfo[child.rollNumber]?.healthInfo?.allergies?.join(', ') || 'None'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <LocalHospital />
                        </ListItemIcon>
                        <ListItemText
                          primary="Blood Group"
                          secondary={healthInfo[child.rollNumber]?.healthInfo?.bloodGroup || 'Not Specified'}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <Psychology />
                        </ListItemIcon>
                        <ListItemText
                          primary="Counselor Notes"
                          secondary={healthInfo[child.rollNumber]?.healthInfo?.counselorNotes || 'No notes available'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Event />
                        </ListItemIcon>
                        <ListItemText
                          primary="Last Check-up"
                          secondary={new Date(healthInfo[child.rollNumber]?.healthInfo?.lastCheckup).toLocaleDateString() || 'Not available'}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>

                {/* Recent Incidents */}
                {healthInfo[child.rollNumber]?.incidents?.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Recent Incidents
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {healthInfo[child.rollNumber]?.incidents?.map((incident, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                {new Date(incident.date).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{incident.type}</TableCell>
                              <TableCell>{incident.description}</TableCell>
                              <TableCell>
                                <Chip
                                  label={incident.status}
                                  color={
                                    incident.status === 'Resolved'
                                      ? 'success'
                                      : incident.status === 'Under Treatment'
                                      ? 'warning'
                                      : 'error'
                                  }
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {/* Counselor Recommendations */}
                {healthInfo[child.rollNumber]?.recommendations?.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Counselor Recommendations
                    </Typography>
                    <List>
                      {healthInfo[child.rollNumber]?.recommendations?.map((recommendation, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <Psychology color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={recommendation.title}
                            secondary={
                              <>
                                <Typography variant="body2" color="text.secondary">
                                  {recommendation.description}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Date: {new Date(recommendation.date).toLocaleDateString()}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleDetailsDialogOpen(child)}
                  >
                    View Full Health Record
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Health Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={handleDetailsDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Health Record Details
          <IconButton
            onClick={handleDetailsDialogClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedChild && healthInfo[selectedChild.rollNumber]?.healthInfo && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Medical Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Height"
                        secondary={`${healthInfo[selectedChild.rollNumber].healthInfo.height} cm`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Weight"
                        secondary={`${healthInfo[selectedChild.rollNumber].healthInfo.weight} kg`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="BMI"
                        secondary={healthInfo[selectedChild.rollNumber].healthInfo.bmi}
                      />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Medical History
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Condition</TableCell>
                          <TableCell>Treatment</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {healthInfo[selectedChild.rollNumber].healthInfo.medicalHistory?.map((record, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {new Date(record.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{record.condition}</TableCell>
                            <TableCell>{record.treatment}</TableCell>
                            <TableCell>
                              <Chip
                                label={record.status}
                                color={record.status === 'Resolved' ? 'success' : 'warning'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Vaccination Records
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Vaccine</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Next Due</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {healthInfo[selectedChild.rollNumber].healthInfo.vaccinations?.map((vaccine, index) => (
                          <TableRow key={index}>
                            <TableCell>{vaccine.name}</TableCell>
                            <TableCell>
                              {new Date(vaccine.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {vaccine.nextDue ? new Date(vaccine.nextDue).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={vaccine.status}
                                color={vaccine.status === 'Completed' ? 'success' : 'warning'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDetailsDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Health; 