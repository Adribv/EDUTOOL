import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Upload, Visibility, Download } from '@mui/icons-material';
import { teacherAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const LessonPlans = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [newPlan, setNewPlan] = useState({
    title: '',
    description: '',
    class: '',
    section: '',
    subject: '',
    videoLink: '',
    file: null,
  });

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await teacherAPI.getLessonPlans();
      setPlans(res);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load lesson plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    // fetch teacher profile to get assigned subjects
    (async () => {
      try {
        if (user?._id || user?.id) {
          const profile = await teacherAPI.getProfile(user._id || user.id);
          setAssignedSubjects(profile.assignedSubjects || []);
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      }
    })();
  }, []);

  const handleDialogClose = () => {
    setOpenDialog(false);
    setNewPlan({
      title: '',
      description: '',
      class: '',
      section: '',
      subject: '',
      videoLink: '',
      file: null,
    });
  };

  const handleFieldChange = (field, value) => {
    setNewPlan((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFieldChange('file', file);
    }
  };

  const handleSubmit = async () => {
    if (!newPlan.file && !newPlan.videoLink) {
      toast.error('Please upload a file or provide a video link');
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(newPlan).forEach(([key, value]) => {
        if (key === 'file') {
          if (value) formData.append('file', value);
        } else {
          formData.append(key, value);
        }
      });

      await teacherAPI.submitLessonPlan(formData);
      toast.success('Lesson Plan submitted for approval');
      handleDialogClose();
      fetchPlans();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit lesson plan');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Lesson Plans</Typography>
        <Button variant="contained" startIcon={<Upload />} onClick={() => setOpenDialog(true)}>
          New Lesson Plan
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Submitted</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan._id}>
                <TableCell>{plan.title}</TableCell>
                <TableCell>
                  {plan.class} - {plan.section}
                </TableCell>
                <TableCell>{plan.subject}</TableCell>
                <TableCell>
                  <Chip
                    label={plan.status}
                    color={
                      plan.status === 'Approved'
                        ? 'success'
                        : plan.status === 'Rejected'
                        ? 'error'
                        : 'warning'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(plan.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  {plan.pdfUrl && (
                    <Tooltip title="View PDF">
                      <IconButton component="a" href={`/${plan.pdfUrl}`} target="_blank" rel="noopener noreferrer">
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  )}
                  {plan.videoUrl && (
                    <Tooltip title="Download Video">
                      <IconButton component="a" href={`/${plan.videoUrl}`} download>
                        <Download />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {plans.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No lesson plans found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create Lesson Plan</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                fullWidth
                value={newPlan.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={newPlan.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
              />
            </Grid>
            <Grid item xs={4}>
              {assignedSubjects.length > 0 ? (
                <FormControl fullWidth>
                  <InputLabel>Class</InputLabel>
                  <Select
                    label="Class"
                    value={newPlan.class}
                    onChange={(e) => handleFieldChange('class', e.target.value)}
                  >
                    {Array.from(new Set(assignedSubjects.map((s) => s.class))).map((cls) => (
                      <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  label="Class"
                  fullWidth
                  value={newPlan.class}
                  onChange={(e) => handleFieldChange('class', e.target.value)}
                />
              )}
            </Grid>
            <Grid item xs={4}>
              {assignedSubjects.length > 0 ? (
                <FormControl fullWidth>
                  <InputLabel>Section</InputLabel>
                  <Select
                    label="Section"
                    value={newPlan.section}
                    onChange={(e) => handleFieldChange('section', e.target.value)}
                  >
                    {Array.from(new Set(assignedSubjects
                      .filter((s) => s.class === newPlan.class)
                      .map((s) => s.section))).map((sec) => (
                        <MenuItem key={sec} value={sec}>{sec}</MenuItem>
                      ))}
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  label="Section"
                  fullWidth
                  value={newPlan.section}
                  onChange={(e) => handleFieldChange('section', e.target.value)}
                />
              )}
            </Grid>
            <Grid item xs={4}>
              {assignedSubjects.length > 0 ? (
                <FormControl fullWidth>
                  <InputLabel>Subject</InputLabel>
                  <Select
                    label="Subject"
                    value={newPlan.subject}
                    onChange={(e) => handleFieldChange('subject', e.target.value)}
                  >
                    {assignedSubjects
                      .filter((s) => s.class === newPlan.class && s.section === newPlan.section)
                      .map((s) => (
                        <MenuItem key={s.subject} value={s.subject}>{s.subject}</MenuItem>
                      ))}
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  label="Subject"
                  fullWidth
                  value={newPlan.subject}
                  onChange={(e) => handleFieldChange('subject', e.target.value)}
                />
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Video Link (optional)"
                fullWidth
                value={newPlan.videoLink}
                onChange={(e) => handleFieldChange('videoLink', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" component="label" fullWidth>
                {newPlan.file ? newPlan.file.name : 'Upload DOCX / PDF / Video'}
                <input type="file" hidden onChange={handleFileChange} />
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} startIcon={<Upload />}>Submit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LessonPlans;
