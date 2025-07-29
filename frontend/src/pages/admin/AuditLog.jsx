import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, InputLabel, FormControl, IconButton, Grid
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import auditLogService from '../../services/auditLogService';

const auditTypes = ['Financial', 'Academic', 'Safety', 'Infrastructure', 'Administrative', 'Other'];
const complianceStatuses = ['Compliant', 'Partially Compliant', 'Non-Compliant'];
const statuses = ['Open', 'Closed'];

const defaultForm = {
  dateOfAudit: '',
  auditType: '',
  auditorName: '',
  auditorDesignation: '',
  scopeOfAudit: '',
  complianceStatus: '',
  nonConformities: '',
  recommendations: '',
  responsiblePerson: '',
  targetCompletionDate: '',
  status: '',
};

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);

  const fetchLogs = async () => {
    const res = await auditLogService.getAll();
    setLogs(res.data);
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleOpen = (log = defaultForm) => {
    setForm(log._id ? { ...log, dateOfAudit: log.dateOfAudit?.slice(0,10), targetCompletionDate: log.targetCompletionDate?.slice(0,10) } : defaultForm);
    setEditId(log._id || null);
    setOpen(true);
  };
  const handleClose = () => { setOpen(false); setForm(defaultForm); setEditId(null); };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (editId) await auditLogService.update(editId, form);
    else await auditLogService.create(form);
    handleClose();
    fetchLogs();
  };

  const handleDelete = async id => {
    await auditLogService.remove(id);
    fetchLogs();
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Audit Log</Typography>
      <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Add Audit Log</Button>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date of Audit</TableCell>
              <TableCell>Audit Type</TableCell>
              <TableCell>Auditor Name</TableCell>
              <TableCell>Designation</TableCell>
              <TableCell>Scope</TableCell>
              <TableCell>Compliance</TableCell>
              <TableCell>Non-Conformities</TableCell>
              <TableCell>Recommendations</TableCell>
              <TableCell>Responsible</TableCell>
              <TableCell>Target Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map(log => (
              <TableRow key={log._id}>
                <TableCell>{log.dateOfAudit?.slice(0,10)}</TableCell>
                <TableCell>{log.auditType}</TableCell>
                <TableCell>{log.auditorName}</TableCell>
                <TableCell>{log.auditorDesignation}</TableCell>
                <TableCell>{log.scopeOfAudit}</TableCell>
                <TableCell>{log.complianceStatus}</TableCell>
                <TableCell>{log.nonConformities}</TableCell>
                <TableCell>{log.recommendations}</TableCell>
                <TableCell>{log.responsiblePerson}</TableCell>
                <TableCell>{log.targetCompletionDate?.slice(0,10)}</TableCell>
                <TableCell>{log.status}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(log)}><Edit /></IconButton>
                  <IconButton onClick={() => handleDelete(log._id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editId ? 'Edit Audit Log' : 'Add Audit Log'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField label="Date of Audit" name="dateOfAudit" type="date" value={form.dateOfAudit} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} required />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Audit Type</InputLabel>
                <Select name="auditType" value={form.auditType} onChange={handleChange} label="Audit Type">
                  {auditTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Auditor Name" name="auditorName" value={form.auditorName} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Auditor Designation" name="auditorDesignation" value={form.auditorDesignation} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} md={12}>
              <TextField label="Scope of Audit" name="scopeOfAudit" value={form.scopeOfAudit} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Compliance Status</InputLabel>
                <Select name="complianceStatus" value={form.complianceStatus} onChange={handleChange} label="Compliance Status">
                  {complianceStatuses.map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select name="status" value={form.status} onChange={handleChange} label="Status">
                  {statuses.map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={12}>
              <TextField label="Non-Conformities Identified" name="nonConformities" value={form.nonConformities} onChange={handleChange} fullWidth multiline rows={2} />
            </Grid>
            <Grid item xs={12} md={12}>
              <TextField label="Recommendations / Corrective Actions" name="recommendations" value={form.recommendations} onChange={handleChange} fullWidth multiline rows={2} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Responsible Person" name="responsiblePerson" value={form.responsiblePerson} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Target Completion Date" name="targetCompletionDate" type="date" value={form.targetCompletionDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} required />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{editId ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditLog; 