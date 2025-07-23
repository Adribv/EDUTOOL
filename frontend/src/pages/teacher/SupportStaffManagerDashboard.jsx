import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Tabs, Tab, Button, Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, Alert, IconButton, Chip, Paper, CircularProgress, FormControl, InputLabel } from '@mui/material';
import { People, Refresh, Add, Edit, Delete, Assignment, ListAlt, Visibility as VisibilityIcon, Security as SecurityIcon } from '@mui/icons-material';
import { api } from '../../services/api';
import { usePermission } from '../../components/PermissionGuard';
import { useNavigate } from 'react-router-dom';

const logTypes = ['Cleanliness', 'Safety', 'Logistics', 'Incident'];
const staffRoles = ['Cleaner', 'Security Guard', 'Maintenance Staff', 'Cafeteria Staff', 'Grounds Keeper', 'Driver', 'Other'];
const assignmentTypes = ['Classroom Cleaning', 'Office Cleaning', 'Security Duty', 'Maintenance Work', 'Cafeteria Service', 'Grounds Maintenance', 'Transport Duty', 'Event Support', 'Other'];

const SupportStaffManagerDashboard = () => {
  const navigate = useNavigate();
  const { canView, canEdit, loading: permissionLoading, error: permissionError, dashboardName } = usePermission('supportStaff');
  const [tab, setTab] = useState(0);
  const [staff, setStaff] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [staffError, setStaffError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', status: 'Active', assignments: [] });
  const [editingId, setEditingId] = useState(null);
  const [success, setSuccess] = useState('');
  const [logDialog, setLogDialog] = useState(false);
  const [logForm, setLogForm] = useState({ type: 'Cleanliness', description: '' });
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Fetch staff
  const fetchStaff = async () => {
    setLoadingStaff(true);
    setStaffError(null);
    try {
      const res = await api.get('admin/support-staff/all');
      if (res.data && res.data.data) {
        setStaff(res.data.data);
      } else if (Array.isArray(res.data)) {
        setStaff(res.data);
      } else {
        setStaff([]);
      }
    } catch (err) {
      console.error('Error fetching staff:', err);
      setStaffError(err.response?.data?.message || 'Failed to fetch support staff. Please try again.');
      setStaff([]);
    } finally {
      setLoadingStaff(false);
    }
  };

  // Fetch logs
  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await api.get('admin/support-staff/logs');
      if (res.data && res.data.data) {
        setLogs(res.data.data);
      } else if (Array.isArray(res.data)) {
        setLogs(res.data);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
      setLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchLogs();
  }, []);

  // Staff CRUD
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleOpenDialog = (staff = null) => {
    if (!canEdit) {
      setStaffError('You do not have permission to perform this action');
      return;
    }
    if (staff) {
      setForm({ ...staff, assignments: staff.assignments || [] });
      setEditingId(staff._id);
    } else {
      setForm({ name: '', role: '', status: 'Active', assignments: [] });
      setEditingId(null);
    }
    setOpenDialog(true);
  };
  const handleSave = async () => {
    if (!canEdit) {
      setStaffError('You do not have permission to perform this action');
      return;
    }
    
    // Validate required fields
    if (!form.name || !form.name.trim()) {
      setStaffError('Name is required');
      return;
    }
    if (!form.role || !form.role.trim()) {
      setStaffError('Role is required');
      return;
    }
    
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        role: form.role.trim(),
        assignments: Array.isArray(form.assignments) ? form.assignments : []
      };
      
      if (editingId) {
        await api.put(`admin/support-staff/${editingId}`, payload);
        setSuccess('Staff updated successfully');
      } else {
        await api.post('admin/support-staff', payload);
        setSuccess('Staff added successfully');
      }
      setOpenDialog(false);
      setForm({ name: '', role: '', status: 'Active', assignments: [] });
      setEditingId(null);
      fetchStaff();
    } catch (error) {
      console.error('Error saving staff:', error);
      setStaffError(error.response?.data?.message || 'Failed to save staff. Please try again.');
    }
  };
  const handleDelete = async (id) => {
    if (!canEdit) {
      setStaffError('You do not have permission to perform this action');
      return;
    }
    if (!window.confirm('Delete this staff member?')) return;
    try {
      await api.delete(`admin/support-staff/${id}`);
      setSuccess('Staff deleted');
      fetchStaff();
    } catch {
      setStaffError('Failed to delete staff');
    }
  };

  // Assignment handlers
  const handleAssignmentChange = (e) => {
    const { value } = e.target;
    setForm((prev) => ({ ...prev, assignments: value.split(',').map(a => a.trim()) }));
  };

  // Log handlers
  const handleOpenLogDialog = (staff) => {
    if (!canEdit) {
      setStaffError('You do not have permission to perform this action');
      return;
    }
    setSelectedStaff(staff);
    setLogForm({ type: 'Cleanliness', description: '' });
    setLogDialog(true);
  };

  const handleLogFormChange = (e) => {
    const { name, value } = e.target;
    setLogForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddLog = async () => {
    if (!canEdit) {
      setStaffError('You do not have permission to perform this action');
      return;
    }
    
    if (!logForm.description || !logForm.description.trim()) {
      setStaffError('Log description is required');
      return;
    }
    
    if (!selectedStaff?._id) {
      setStaffError('No staff member selected');
      return;
    }
    
    try {
      const payload = {
        type: logForm.type,
        description: logForm.description.trim(),
        staffId: selectedStaff._id,
        staffName: selectedStaff.name,
        date: new Date().toISOString()
      };
      
      await api.post('admin/support-staff/logs', payload);
      setSuccess('Work log added successfully');
      setLogDialog(false);
      setLogForm({ type: 'Cleanliness', description: '' });
      setSelectedStaff(null);
      fetchLogs();
    } catch (error) {
      console.error('Error adding log:', error);
      setStaffError(error.response?.data?.message || 'Failed to add work log. Please try again.');
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
    <Box>
      {/* Header with permission indicator */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Support Staff Manager Dashboard
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
        <Tab label="Staff List" />
        <Tab label="Assignments" />
        <Tab label="Logs" />
      </Tabs>
      {/* Staff List Tab */}
      {tab === 0 && (
        <Card><CardContent>
          {canEdit && (
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>Add Staff</Button>
            </Box>
          )}
          {success && <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>}
          {staffError && <Alert severity="error" onClose={() => setStaffError('')}>{staffError}</Alert>}
          
          {loadingStaff ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : staff.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Staff Members Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {canEdit ? 'Click "Add Staff" to add your first staff member.' : 'No staff members have been added yet.'}
              </Typography>
            </Box>
          ) : (
            <Table><TableHead><TableRow>
              <TableCell>Name</TableCell><TableCell>Role</TableCell><TableCell>Status</TableCell><TableCell>Assignments</TableCell>
              {canEdit && <TableCell>Actions</TableCell>}
            </TableRow></TableHead><TableBody>
              {staff.map((member) => (
                <TableRow key={member._id}>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>
                    <Chip 
                      label={member.status} 
                      color={member.status === 'Active' ? 'success' : member.status === 'On Leave' ? 'warning' : 'default'} 
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {member.assignments && member.assignments.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {member.assignments.slice(0, 2).map((assignment, index) => (
                          <Chip key={index} label={assignment} size="small" variant="outlined" />
                        ))}
                        {member.assignments.length > 2 && (
                          <Chip label={`+${member.assignments.length - 2} more`} size="small" variant="outlined" />
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No assignments</Typography>
                    )}
                  </TableCell>
                  {canEdit && (
                    <TableCell>
                      <IconButton onClick={() => handleOpenDialog(member)} title="Edit Staff">
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(member._id)} title="Delete Staff">
                        <Delete />
                      </IconButton>
                      <IconButton onClick={() => handleOpenLogDialog(member)} title="Add Work Log">
                        <Assignment />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody></Table>
          )}
        </CardContent></Card>
      )}
      {/* Assignments Tab */}
      {tab === 1 && (
        <Card><CardContent>
          <Typography variant="h6">Assignments</Typography>
          <Table><TableHead><TableRow>
            <TableCell>Name</TableCell><TableCell>Assignments</TableCell>
          </TableRow></TableHead><TableBody>
            {staff.map((member) => (
              <TableRow key={member._id}>
                <TableCell>{member.name}</TableCell>
                <TableCell>{(member.assignments || []).join(', ')}</TableCell>
              </TableRow>
            ))}
          </TableBody></Table>
        </CardContent></Card>
      )}
      {/* Logs Tab */}
      {tab === 2 && (
        <Card><CardContent>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button variant="contained" startIcon={<ListAlt />} onClick={fetchLogs}>Refresh Logs</Button>
          </Box>
          
          {loadingLogs ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : logs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Work Logs Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {canEdit ? 'Add work logs for staff members to track their activities.' : 'No work logs have been added yet.'}
              </Typography>
            </Box>
          ) : (
            <Table><TableHead><TableRow>
              <TableCell>Type</TableCell><TableCell>Staff Member</TableCell><TableCell>Description</TableCell><TableCell>Date</TableCell>
            </TableRow></TableHead><TableBody>
              {logs.map((log, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Chip 
                      label={log.type} 
                      size="small"
                      color={
                        log.type === 'Cleanliness' ? 'primary' :
                        log.type === 'Safety' ? 'error' :
                        log.type === 'Logistics' ? 'info' :
                        'default'
                      }
                    />
                  </TableCell>
                  <TableCell>{log.staffName || 'Unknown'}</TableCell>
                  <TableCell>{log.description}</TableCell>
                  <TableCell>{log.date ? new Date(log.date).toLocaleString() : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          )}
        </CardContent></Card>
      )}
      {/* Staff Dialog */}
      {canEdit && (
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingId ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
          <DialogContent sx={{ minWidth: 400 }}>
            <TextField 
              label="Full Name" 
              name="name" 
              value={form.name} 
              onChange={handleFormChange} 
              fullWidth 
              sx={{ mb: 2 }} 
              required
              placeholder="Enter staff member's full name"
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Role *</InputLabel>
              <Select
                name="role"
                value={form.role}
                onChange={handleFormChange}
                label="Role *"
                required
              >
                {staffRoles.map(role => (
                  <MenuItem key={role} value={role}>{role}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={form.status}
                onChange={handleFormChange}
                label="Status"
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="On Leave">On Leave</MenuItem>
              </Select>
            </FormControl>
            
            <TextField 
              label="Assignments (comma separated)" 
              name="assignments" 
              value={form.assignments.join(', ')} 
              onChange={handleAssignmentChange} 
              fullWidth 
              sx={{ mb: 2 }}
              placeholder="e.g., Classroom Cleaning, Security Duty"
              helperText="Enter assignments separated by commas"
            />
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Common Assignments:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {assignmentTypes.map(assignment => (
                  <Chip
                    key={assignment}
                    label={assignment}
                    size="small"
                    onClick={() => {
                      const currentAssignments = form.assignments || [];
                      if (!currentAssignments.includes(assignment)) {
                        setForm(prev => ({
                          ...prev,
                          assignments: [...currentAssignments, assignment]
                        }));
                      }
                    }}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpenDialog(false);
              setForm({ name: '', role: '', status: 'Active', assignments: [] });
              setEditingId(null);
              setStaffError('');
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave} variant="contained" disabled={!form.name || !form.role}>
              {editingId ? 'Update Staff' : 'Add Staff'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {/* Log Dialog */}
      {canEdit && (
        <Dialog open={logDialog} onClose={() => setLogDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Work Log for {selectedStaff?.name}</DialogTitle>
          <DialogContent sx={{ minWidth: 400 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Log Type</InputLabel>
              <Select
                name="type"
                value={logForm.type}
                onChange={handleLogFormChange}
                label="Log Type"
              >
                {logTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField 
              label="Description" 
              name="description" 
              value={logForm.description} 
              onChange={handleLogFormChange} 
              fullWidth 
              sx={{ mb: 2 }}
              multiline
              rows={3}
              placeholder="Describe the work completed or incident details..."
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setLogDialog(false);
              setLogForm({ type: 'Cleanliness', description: '' });
              setSelectedStaff(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddLog} variant="contained" disabled={!logForm.description.trim()}>
              Add Log
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default SupportStaffManagerDashboard; 