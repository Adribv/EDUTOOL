import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import parentService from '../../services/parentService';

const P_Raise_Complaints = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({
    studentId: '',
    subject: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, complaintsRes] = await Promise.all([
        parentService.getStudents(),
        parentService.getComplaints(),
      ]);
      setStudents(studentsRes.data);
      setComplaints(complaintsRes.data);
    } catch {
      setError('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await parentService.submitComplaint(form);
      setForm({ studentId: '', subject: '', description: '' });
      fetchData();
    } catch {
      setError('Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Raise Complaints
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth required>
                <InputLabel>Student</InputLabel>
                <Select
                  name="studentId"
                  value={form.studentId}
                  label="Student"
                  onChange={handleChange}
                >
                  {students.map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                name="subject"
                label="Subject"
                value={form.subject}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="description"
                label="Description"
                value={form.description}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={2}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={submitting || !form.studentId || !form.subject || !form.description}
              >
                Submit Complaint
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Complaint History
        </Typography>
        <List>
          {complaints.map((c) => (
            <>
              <ListItem key={c.id} alignItems="flex-start">
                <ListItemText
                  primary={`${students.find((s) => s.id === c.studentId)?.name || ''} | ${c.subject}`}
                  secondary={c.description}
                />
                <Chip
                  label={c.status}
                  color={getStatusColor(c.status)}
                  size="small"
                />
              </ListItem>
              <Divider component="li" />
            </>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default P_Raise_Complaints; 