import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';

// Sample visitor object shape for reference
// {
//   wardId: 'studentObjectId',
//   parentId: 'parentObjectId',
//   visitorName: 'John Doe',
//   visitorIntime: new Date().toISOString(),
//   visitorOuttime: null,
//   reason: 'Meeting',
//   wardPickup: false,
// }

const sampleVisitors = [
  {
    _id: '1',
    wardId: '64f7bd71236b7a6a9b36f001',
    parentName: 'Mr. Johnson',
    contactNumber: '9876543210',
    visitorName: 'Alice Johnson',
    visitorIntime: new Date().toISOString(),
    visitorOuttime: null,
    reason: 'Pay fees',
    wardPickup: false,
  },
  {
    _id: '2',
    wardId: '64f7bd71236b7a6a9b36f002',
    parentName: 'Mrs. Smith',
    contactNumber: '9123456780',
    visitorName: 'Bob Smith',
    visitorIntime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    visitorOuttime: new Date().toISOString(),
    reason: 'Collect report card',
    wardPickup: true,
  },
];

function Visitors() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    wardId: '',
    parentName: '',
    contactNumber: '',
    visitorName: '',
    reason: '',
    wardPickup: false,
  });

  const { data: visitors = sampleVisitors, isLoading } = useQuery({
    queryKey: ['visitors'],
    queryFn: () => adminAPI.getVisitors ? adminAPI.getVisitors() : Promise.resolve(sampleVisitors),
    // Fallback to sample if API undefined
    staleTime: 5 * 60 * 1000,
    retry: 0,
  });

  // console.log(visitors);

  const addVisitorMutation = useMutation({
    mutationFn: (payload) => adminAPI.addVisitor ? adminAPI.addVisitor(payload) : Promise.resolve({ data: payload }),
    onSuccess: () => {
      toast.success('Visitor added');
      queryClient.invalidateQueries(['visitors']);
      setOpen(false);
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || 'Failed to add visitor';
      toast.error(msg);
    },
  });

  const exitMutation = useMutation({
    mutationFn: (id) => adminAPI.updateVisitorExit ? adminAPI.updateVisitorExit(id) : Promise.resolve(),
    onSuccess: () => {
      toast.success('Visitor marked as exited');
      queryClient.invalidateQueries(['visitors']);
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || 'Failed to mark exit';
      toast.error(msg);
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = () => {
    const payload = {
      name: form.visitorName || form.parentName || 'Visitor',
      contactNumber: form.contactNumber,
      purpose: form.reason || 'Visit',
      whomToMeet: form.wardId,
      idProofType: 'Other',
      idProofNumber: 'N/A',
      parentName: form.parentName,
      // extra contextual data
      wardId: form.wardId,
      wardPickup: form.wardPickup,
    };
    addVisitorMutation.mutate(payload);
  };

  const handleMarkExit = (id) => {
    if (window.confirm('Mark this visitor as exited?')) {
      exitMutation.mutate(id);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Visitor Management</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add Visitor
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Visitor Name</TableCell>
              <TableCell>Ward ID</TableCell>
              <TableCell>Parent Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>In Time</TableCell>
              <TableCell>Out Time</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Ward Pickup</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (
              (visitors || []).map((v) => (
                <TableRow key={v._id} hover>
                  <TableCell>{v.visitorName || v.name}</TableCell>
                  <TableCell>{v.whomToMeet || 'N/A'}</TableCell>
                  <TableCell>{v.parentName}</TableCell>
                  <TableCell>{v.contactNumber}</TableCell>
                  <TableCell>{new Date(v.visitorIntime || v.entryTime).toLocaleString()}</TableCell>
                  <TableCell>{v.exitTime ? new Date(v.exitTime).toLocaleString() : '-'}</TableCell>
                  <TableCell>{v.reason || v.purpose}</TableCell>
                  <TableCell>{v.wardPickup ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    {!v.exitTime && (
                      <Button size="small" variant="outlined" onClick={() => handleMarkExit(v._id)} disabled={exitMutation.isLoading}>
                        Mark Exit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Visitor</DialogTitle>
        <DialogContent dividers>
          <TextField
            margin="dense"
            label="Ward ID"
            name="wardId"
            fullWidth
            value={form.wardId}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Parent Name"
            name="parentName"
            fullWidth
            value={form.parentName}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Visitor Phone"
            name="contactNumber"
            fullWidth
            value={form.contactNumber}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Visitor Name"
            name="visitorName"
            fullWidth
            value={form.visitorName}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Reason"
            name="reason"
            fullWidth
            value={form.reason}
            onChange={handleChange}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.wardPickup}
                onChange={handleChange}
                name="wardPickup"
              />
            }
            label="Ward Pickup"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={addVisitorMutation.isLoading}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Visitors; 