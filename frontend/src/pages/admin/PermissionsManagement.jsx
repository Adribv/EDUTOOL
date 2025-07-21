import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  Button,
  TextField,
  Chip,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Save as SaveIcon, Search as SearchIcon } from '@mui/icons-material';
import axios from 'axios';
import { adminAPI } from '../../services/api';

const features = [
  { key: 'timetable', label: 'Timetable' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'communication', label: 'Communication' },
  { key: 'reports', label: 'Reports' },
  { key: 'events', label: 'Events' },
];

export default function PermissionsManagement() {
  const [search, setSearch] = useState('');
  const [staff, setStaff] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setLoading(true);
    const fetchStaff = async () => {
      const response = await adminAPI.getAllStaff();
      console.log('STAFF API RESPONSE:', response);
      setStaff(response.data);
      setLoading(false);
    };
    fetchStaff();
  }, []);

  const handleToggle = (userId, featureKey) => {
    setPermissions((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [featureKey]: !prev[userId]?.[featureKey],
      },
    }));
  };

  const handleSave = async (userId) => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await axios.patch(`/api/admin/staff/${userId}/permissions`, {
        permissions: permissions[userId],
      });
      setSuccess('Permissions updated successfully!');
    } catch (err) {
      setError('Failed to update permissions.');
    }
    setSaving(false);
  };

  const filteredStaff = staff.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', my: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Permissions Management
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Grant or revoke feature access for all staff and users. Toggle the switches to update permissions, then click Save for each staff member.
      </Typography>
      <Stack direction="row" spacing={2} mb={2} alignItems="center">
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search by name, email, or role"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
          sx={{ minWidth: 320 }}
        />
      </Stack>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                {features.map((f) => (
                  <TableCell key={f.key} align="center">{f.label}</TableCell>
                ))}
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStaff.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip label={user.role} color={user.role === 'Teacher' ? 'primary' : 'default'} size="small" />
                  </TableCell>
                  {features.map((f) => (
                    <TableCell key={f.key} align="center">
                      <Switch
                        checked={permissions[user._id]?.[f.key] || false}
                        onChange={() => handleToggle(user._id, f.key)}
                        color="primary"
                        disabled={saving}
                      />
                    </TableCell>
                  ))}
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<SaveIcon />}
                      onClick={() => handleSave(user._id)}
                      disabled={saving}
                    >
                      Save
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
    </Box>
  );
} 