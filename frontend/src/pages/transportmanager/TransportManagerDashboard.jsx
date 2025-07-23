import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Tabs, Tab, Button, Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, Alert, IconButton, Chip, CircularProgress } from '@mui/material';
import { DirectionsBus as TransportIcon, Add, Edit, Delete, ListAlt, LocalGasStation, ReportProblem, Visibility as VisibilityIcon, Security as SecurityIcon } from '@mui/icons-material';
import { api } from '../../services/api';
import { usePermission } from '../../components/PermissionGuard';
import { useNavigate } from 'react-router-dom';

const TransportManagerDashboard = () => {
  const navigate = useNavigate();
  const { canView, canEdit, loading: permissionLoading, error: permissionError, dashboardName } = usePermission('transport');
  const [tab, setTab] = useState(0);
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [vehicleError, setVehicleError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState({ vehicleNumber: '', vehicleType: 'Bus', capacity: 40, driverName: '', driverContact: '', driverLicense: '', routeNumber: '', status: 'Active' });
  const [editingId, setEditingId] = useState(null);
  const [success, setSuccess] = useState('');
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ date: '', startTime: '', endTime: '', route: '', driver: '' });
  const [fuelDialog, setFuelDialog] = useState(false);
  const [fuelForm, setFuelForm] = useState({ date: '', liters: '', cost: '', filledBy: '' });
  const [incidentDialog, setIncidentDialog] = useState(false);
  const [incidentForm, setIncidentForm] = useState({ date: '', description: '', actionTaken: '' });
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Fetch vehicles
  const fetchVehicles = async () => {
    setLoadingVehicles(true);
    setVehicleError(null);
    try {
      const res = await api.get('admin/transport/all');
      setVehicles(res.data.data || []);
    } catch (err) {
      setVehicleError('Failed to fetch vehicles');
    } finally {
      setLoadingVehicles(false);
    }
  };

  // Fetch logs
  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await api.get('admin/transport/logs');
      setLogs(res.data.data || []);
    } catch {
      setLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchLogs();
  }, []);

  // Vehicle CRUD
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleOpenDialog = (vehicle = null) => {
    if (!canEdit) {
      setVehicleError('You do not have permission to perform this action');
      return;
    }
    if (vehicle) {
      setForm({ ...vehicle });
      setEditingId(vehicle._id);
    } else {
      setForm({ vehicleNumber: '', vehicleType: 'Bus', capacity: 40, driverName: '', driverContact: '', driverLicense: '', routeNumber: '', status: 'Active' });
      setEditingId(null);
    }
    setOpenDialog(true);
  };
  const handleSave = async () => {
    if (!canEdit) {
      setVehicleError('You do not have permission to perform this action');
      return;
    }
    try {
      if (editingId) {
        await api.put(`admin/transport/${editingId}`, form);
        setSuccess('Vehicle updated');
      } else {
        await api.post('admin/transport', form);
        setSuccess('Vehicle added');
      }
      setOpenDialog(false);
      fetchVehicles();
    } catch {
      setVehicleError('Failed to save vehicle');
    }
  };
  const handleDelete = async (id) => {
    if (!canEdit) {
      setVehicleError('You do not have permission to perform this action');
      return;
    }
    if (!window.confirm('Delete this vehicle?')) return;
    try {
      await api.delete(`admin/transport/${id}`);
      setSuccess('Vehicle deleted');
      fetchVehicles();
    } catch {
      setVehicleError('Failed to delete vehicle');
    }
  };

  // Schedules
  const handleOpenScheduleDialog = (vehicle) => {
    if (!canEdit) {
      setVehicleError('You do not have permission to perform this action');
      return;
    }
    setSelectedVehicle(vehicle);
    setScheduleForm({ date: '', startTime: '', endTime: '', route: '', driver: '' });
    setScheduleDialog(true);
  };
  const handleScheduleFormChange = (e) => {
    const { name, value } = e.target;
    setScheduleForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleAddSchedule = async () => {
    if (!canEdit) {
      setVehicleError('You do not have permission to perform this action');
      return;
    }
    try {
      console.log(scheduleForm, selectedVehicle);
      await api.post(`admin/transport/${selectedVehicle._id}/schedule`, scheduleForm);
      setSuccess('Schedule added');
      setScheduleDialog(false);
      fetchVehicles();
      fetchLogs();
    } catch {
      setVehicleError('Failed to add schedule');
    }
  };

  // Fuel Usage
  const handleOpenFuelDialog = (vehicle) => {
    if (!canEdit) {
      setVehicleError('You do not have permission to perform this action');
      return;
    }
    setSelectedVehicle(vehicle);
    setFuelForm({ date: '', liters: '', cost: '', filledBy: '' });
    setFuelDialog(true);
  };
  const handleFuelFormChange = (e) => {
    const { name, value } = e.target;
    setFuelForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleAddFuel = async () => {
    if (!canEdit) {
      setVehicleError('You do not have permission to perform this action');
      return;
    }
    try {
      console.log(fuelForm, selectedVehicle);
      await api.post(`admin/transport/${selectedVehicle._id}/fuel-log`, fuelForm);
      setSuccess('Fuel record added');
      setFuelDialog(false);
      fetchVehicles();
      fetchLogs();
    } catch {
      setVehicleError('Failed to add fuel record');
    }
  };

  // Incidents
  const handleOpenIncidentDialog = (vehicle) => {
    if (!canEdit) {
      setVehicleError('You do not have permission to perform this action');
      return;
    }
    setSelectedVehicle(vehicle);
    setIncidentForm({ date: '', description: '', actionTaken: '' });
    setIncidentDialog(true);
  };
  const handleIncidentFormChange = (e) => {
    const { name, value } = e.target;
    setIncidentForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleAddIncident = async () => {
    if (!canEdit) {
      setVehicleError('You do not have permission to perform this action');
      return;
    }
    try {
      await api.post(`admin/transport/${selectedVehicle._id}/incident`, incidentForm);
      setSuccess('Incident recorded');
      setIncidentDialog(false);
      fetchVehicles();
      fetchLogs();
    } catch {
      setVehicleError('Failed to record incident');
    }
  };

  // Show loading while permissions are being fetched
  if (permissionLoading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Loading permissions...
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Show error if permissions failed to load
  if (permissionError) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
          <SecurityIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Permission Error
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {permissionError}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  // Show access denied if no view permission
  if (!canView) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
          <SecurityIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You don't have permission to view the {dashboardName}.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please contact your administrator for access.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Paper sx={{ p: 4 }}>
          {/* Header with permission indicator */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              Transport Manager Dashboard
            </Typography>
            {!canEdit && (
              <Chip 
                icon={<VisibilityIcon />} 
                label="View Only" 
                color="warning" 
                variant="outlined"
              />
            )}
          </Box>
          
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label="Vehicles/Schedules" />
            <Tab label="Fuel Usage" />
            <Tab label="Driver Incidents" />
            <Tab label="All Logs" />
          </Tabs>
          {/* Vehicles/Schedules Tab */}
          {tab === 0 && (
            <Box>
              {canEdit && (
                <Box display="flex" justifyContent="flex-end" mb={2}>
                  <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>Add Vehicle</Button>
                </Box>
              )}
              {success && <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>}
              {vehicleError && <Alert severity="error" onClose={() => setVehicleError('')}>{vehicleError}</Alert>}
              <Table><TableHead><TableRow>
                <TableCell>Vehicle #</TableCell><TableCell>Type</TableCell><TableCell>Capacity</TableCell><TableCell>Driver</TableCell><TableCell>Route</TableCell><TableCell>Status</TableCell><TableCell>Schedules</TableCell>
                {canEdit && <TableCell>Actions</TableCell>}
              </TableRow></TableHead><TableBody>
                {vehicles.map((v) => (
                  <TableRow key={v._id}>
                    <TableCell>{v.vehicleNumber}</TableCell>
                    <TableCell>{v.vehicleType}</TableCell>
                    <TableCell>{v.capacity}</TableCell>
                    <TableCell>{v.driverName}</TableCell>
                    <TableCell>{v.routeNumber}</TableCell>
                    <TableCell>{v.status}</TableCell>
                    <TableCell>
                      {canEdit ? (
                        <Button size="small" onClick={() => handleOpenScheduleDialog(v)}>Add/View</Button>
                      ) : (
                        <Button size="small" onClick={() => handleOpenScheduleDialog(v)}>View</Button>
                      )}
                    </TableCell>
                    {canEdit && (
                      <TableCell>
                        <IconButton onClick={() => handleOpenDialog(v)}><Edit /></IconButton>
                        <IconButton onClick={() => handleDelete(v._id)}><Delete /></IconButton>
                        <IconButton onClick={() => handleOpenFuelDialog(v)}><LocalGasStation /></IconButton>
                        <IconButton onClick={() => handleOpenIncidentDialog(v)}><ReportProblem /></IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody></Table>
            </Box>
          )}
          {/* Fuel Usage Tab */}
          {tab === 1 && (
            <Box>
              <Typography variant="h6">Fuel Usage Logs</Typography>
              <Table><TableHead><TableRow>
                <TableCell>Vehicle #</TableCell><TableCell>Date</TableCell><TableCell>Liters</TableCell><TableCell>Cost</TableCell><TableCell>Filled By</TableCell>
              </TableRow></TableHead><TableBody>
                {logs.filter(l => l.type === 'Fuel').map((log, i) => (
                  <TableRow key={i}>
                    <TableCell>{log.vehicleNumber}</TableCell>
                    <TableCell>{log.date ? new Date(log.date).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{log.liters}</TableCell>
                    <TableCell>{log.cost}</TableCell>
                    <TableCell>{log.filledBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody></Table>
            </Box>
          )}
          {/* Driver Incidents Tab */}
          {tab === 2 && (
            <Box>
              <Typography variant="h6">Driver/Vehicle Incidents</Typography>
              <Table><TableHead><TableRow>
                <TableCell>Vehicle #</TableCell><TableCell>Date</TableCell><TableCell>Description</TableCell><TableCell>Action Taken</TableCell>
              </TableRow></TableHead><TableBody>
                {logs.filter(l => l.type === 'Incident').map((log, i) => (
                  <TableRow key={i}>
                    <TableCell>{log.vehicleNumber}</TableCell>
                    <TableCell>{log.date ? new Date(log.date).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{log.description}</TableCell>
                    <TableCell>{log.actionTaken}</TableCell>
                  </TableRow>
                ))}
              </TableBody></Table>
            </Box>
          )}
          {/* All Logs Tab */}
          {tab === 3 && (
            <Box>
              <Typography variant="h6">All Transport Logs</Typography>
              <Button variant="contained" startIcon={<ListAlt />} onClick={fetchLogs} sx={{ mb: 2 }}>Refresh Logs</Button>
              <Table><TableHead><TableRow>
                <TableCell>Type</TableCell><TableCell>Vehicle #</TableCell><TableCell>Date</TableCell><TableCell>Details</TableCell>
              </TableRow></TableHead><TableBody>
                {logs.map((log, i) => (
                  <TableRow key={i}>
                    <TableCell>{log.type}</TableCell>
                    <TableCell>{log.vehicleNumber}</TableCell>
                    <TableCell>{log.date ? new Date(log.date).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>
                      {log.type === 'Schedule' && `${log.route} (${log.startTime} - ${log.endTime})`}
                      {log.type === 'Fuel' && `Liters: ${log.liters}, Cost: ${log.cost}`}
                      {log.type === 'Incident' && `${log.description} (Action: ${log.actionTaken})`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody></Table>
            </Box>
          )}
          {/* Vehicle Dialog */}
          {canEdit && (
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
              <DialogTitle>{editingId ? 'Edit Vehicle' : 'Add Vehicle'}</DialogTitle>
              <DialogContent sx={{ minWidth: 350 }}>
                <TextField label="Vehicle Number" name="vehicleNumber" value={form.vehicleNumber} onChange={handleFormChange} fullWidth sx={{ mb: 2 }} />
                <Select label="Type" name="vehicleType" value={form.vehicleType} onChange={handleFormChange} fullWidth sx={{ mb: 2 }}>
                  {['Bus', 'Van', 'Car', 'Other'].map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                </Select>
                <TextField label="Capacity" name="capacity" value={form.capacity} onChange={handleFormChange} fullWidth sx={{ mb: 2 }} type="number" />
                <TextField label="Driver Name" name="driverName" value={form.driverName} onChange={handleFormChange} fullWidth sx={{ mb: 2 }} />
                <TextField label="Driver Contact" name="driverContact" value={form.driverContact} onChange={handleFormChange} fullWidth sx={{ mb: 2 }} />
                <TextField label="Driver License" name="driverLicense" value={form.driverLicense} onChange={handleFormChange} fullWidth sx={{ mb: 2 }} />
                <TextField label="Route Number" name="routeNumber" value={form.routeNumber} onChange={handleFormChange} fullWidth sx={{ mb: 2 }} />
                <Select label="Status" name="status" value={form.status} onChange={handleFormChange} fullWidth sx={{ mb: 2 }}>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Under Maintenance">Under Maintenance</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                <Button onClick={handleSave} variant="contained">Save</Button>
              </DialogActions>
            </Dialog>
          )}
          {/* Schedule Dialog */}
          <Dialog open={scheduleDialog} onClose={() => setScheduleDialog(false)}>
            <DialogTitle>Add/View Schedule for {selectedVehicle?.vehicleNumber}</DialogTitle>
            <DialogContent sx={{ minWidth: 350 }}>
              {canEdit && (
                <>
                  <TextField label="Date" name="date" type="date" value={scheduleForm.date} onChange={handleScheduleFormChange} fullWidth sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
                  <TextField label="Start Time" name="startTime" value={scheduleForm.startTime} onChange={handleScheduleFormChange} fullWidth sx={{ mb: 2 }} />
                  <TextField label="End Time" name="endTime" value={scheduleForm.endTime} onChange={handleScheduleFormChange} fullWidth sx={{ mb: 2 }} />
                  <TextField label="Route" name="route" value={scheduleForm.route} onChange={handleScheduleFormChange} fullWidth sx={{ mb: 2 }} />
                  <TextField label="Driver" name="driver" value={scheduleForm.driver} onChange={handleScheduleFormChange} fullWidth sx={{ mb: 2 }} />
                  <Button onClick={handleAddSchedule} variant="contained" sx={{ mt: 2 }}>Add Schedule</Button>
                </>
              )}
              <Typography variant="subtitle2" sx={{ mt: 2 }}>Existing Schedules:</Typography>
              <Table size="small"><TableHead><TableRow>
                <TableCell>Date</TableCell><TableCell>Start</TableCell><TableCell>End</TableCell><TableCell>Route</TableCell><TableCell>Driver</TableCell>
              </TableRow></TableHead><TableBody>
                {(selectedVehicle?.schedules || []).map((s, i) => (
                  <TableRow key={i}>
                    <TableCell>{s.date ? new Date(s.date).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{s.startTime}</TableCell>
                    <TableCell>{s.endTime}</TableCell>
                    <TableCell>{s.route}</TableCell>
                    <TableCell>{s.driver}</TableCell>
                  </TableRow>
                ))}
              </TableBody></Table>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setScheduleDialog(false)}>Close</Button>
            </DialogActions>
          </Dialog>
          {/* Fuel Dialog */}
          {canEdit && (
            <Dialog open={fuelDialog} onClose={() => setFuelDialog(false)}>
              <DialogTitle>Add Fuel Log for {selectedVehicle?.vehicleNumber}</DialogTitle>
              <DialogContent sx={{ minWidth: 350 }}>
                <TextField label="Date" name="date" type="date" value={fuelForm.date} onChange={handleFuelFormChange} fullWidth sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
                <TextField label="Liters" name="liters" value={fuelForm.liters} onChange={handleFuelFormChange} fullWidth sx={{ mb: 2 }} type="number" />
                <TextField label="Cost" name="cost" value={fuelForm.cost} onChange={handleFuelFormChange} fullWidth sx={{ mb: 2 }} type="number" />
                <TextField label="Filled By" name="filledBy" value={fuelForm.filledBy} onChange={handleFuelFormChange} fullWidth sx={{ mb: 2 }} />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setFuelDialog(false)}>Cancel</Button>
                <Button onClick={handleAddFuel} variant="contained">Add Fuel Log</Button>
              </DialogActions>
            </Dialog>
          )}
          {/* Incident Dialog */}
          {canEdit && (
            <Dialog open={incidentDialog} onClose={() => setIncidentDialog(false)}>
              <DialogTitle>Log Incident for {selectedVehicle?.vehicleNumber}</DialogTitle>
              <DialogContent sx={{ minWidth: 350 }}>
                <TextField label="Date" name="date" type="date" value={incidentForm.date} onChange={handleIncidentFormChange} fullWidth sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
                <TextField label="Description" name="description" value={incidentForm.description} onChange={handleIncidentFormChange} fullWidth sx={{ mb: 2 }} />
                <TextField label="Action Taken" name="actionTaken" value={incidentForm.actionTaken} onChange={handleIncidentFormChange} fullWidth sx={{ mb: 2 }} />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setIncidentDialog(false)}>Cancel</Button>
                <Button onClick={handleAddIncident} variant="contained">Log Incident</Button>
              </DialogActions>
            </Dialog>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default TransportManagerDashboard; 