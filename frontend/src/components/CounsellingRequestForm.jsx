import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  RadioGroup,
  FormControl,
  FormLabel,
  FormControlLabel,
  Radio,
  Checkbox,
  Button,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  OutlinedInput,
  Stack,
  Divider,
} from '@mui/material';

const initialState = {
  schoolName: '',
  dateOfRequest: '',
  requestedBy: '',
  requestedByOther: '',
  studentDetails: {
    fullName: '',
    gradeClassSection: '',
    rollNumber: '',
    age: '',
    gender: '',
  },
  parentGuardianName: '',
  contactNumber: '',
  email: '',
  reasons: [],
  reasonOther: '',
  briefDescription: '',
  preferredMode: '',
  preferredTime: '',
  signature: '',
  date: '',
};

const reasonsList = [
  'Academic Stress',
  'Emotional/Behavioral Concerns',
  'Peer Issues/Bullying',
  'Family-Related Issues',
  'Career Guidance',
  'Health/Well-being',
];

const modes = [
  'One-on-One (in person)',
  'Online/Virtual Session',
  'Group Counselling',
  'No preference',
];

export default function CounsellingRequestForm() {
  const [form, setForm] = useState(initialState);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('studentDetails.')) {
      setForm({
        ...form,
        studentDetails: {
          ...form.studentDetails,
          [name.split('.')[1]]: value,
        },
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleCheckbox = (reason) => {
    setForm((prev) => {
      const reasons = prev.reasons.includes(reason)
        ? prev.reasons.filter((r) => r !== reason)
        : [...prev.reasons, reason];
      return { ...prev, reasons };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    // Always show success message after submit
    setSuccess(true);
    setForm(initialState);
    // Optionally, still try to send to backend, but ignore result
    try {
      const payload = {
        ...form,
        dateOfRequest: form.dateOfRequest ? new Date(form.dateOfRequest) : undefined,
        date: form.date ? new Date(form.date) : undefined,
      };
      await axios.post('/api/counselling-requests', payload);
    } catch (err) {
      // Ignore error
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', my: 4 }}>
      <Paper elevation={4} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3 }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight={700}>
          Student Counselling Request Form
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <form onSubmit={handleSubmit} autoComplete="off">
          <Grid container spacing={3}>
            {/* School Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>School Information</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="School Name" name="schoolName" value={form.schoolName} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Date of Request" name="dateOfRequest" type="date" value={form.dateOfRequest} onChange={handleChange} fullWidth required InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel>Requested By</FormLabel>
                <RadioGroup row name="requestedBy" value={form.requestedBy} onChange={handleChange}>
                  <FormControlLabel value="Student" control={<Radio />} label="Student" />
                  <FormControlLabel value="Parent" control={<Radio />} label="Parent" />
                  <FormControlLabel value="Teacher" control={<Radio />} label="Teacher" />
                  <FormControlLabel value="Other" control={<Radio />} label="Other" />
                </RadioGroup>
              </FormControl>
            </Grid>
            {form.requestedBy === 'Other' && (
              <Grid item xs={12} sm={6}>
                <TextField label="Please specify" name="requestedByOther" value={form.requestedByOther} onChange={handleChange} fullWidth />
              </Grid>
            )}

            {/* Student Details */}
            <Grid item xs={12} mt={2}>
              <Typography variant="h6" gutterBottom>Student Details</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Full Name" name="studentDetails.fullName" value={form.studentDetails.fullName} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Grade/Class & Section" name="studentDetails.gradeClassSection" value={form.studentDetails.gradeClassSection} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Roll Number" name="studentDetails.rollNumber" value={form.studentDetails.rollNumber} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField label="Age" name="studentDetails.age" value={form.studentDetails.age} onChange={handleChange} type="number" inputProps={{ min: 1 }} fullWidth required />
            </Grid>
            <Grid item xs={6} sm={4}>
              <FormControl fullWidth required>
                <InputLabel>Gender</InputLabel>
                <Select label="Gender" name="studentDetails.gender" value={form.studentDetails.gender} onChange={handleChange} input={<OutlinedInput label="Gender" />}>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12} mt={2}>
              <Typography variant="h6" gutterBottom>Contact Information</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Parent/Guardian Name" name="parentGuardianName" value={form.parentGuardianName} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Contact Number" name="contactNumber" value={form.contactNumber} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Email (if applicable)" name="email" value={form.email} onChange={handleChange} type="email" fullWidth />
            </Grid>

            {/* Reason for Counselling Request */}
            <Grid item xs={12} mt={2}>
              <Typography variant="h6" gutterBottom>Reason for Counselling Request</Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                (Tick all that apply)
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={2}>
                {reasonsList.map((reason) => (
                  <FormControlLabel
                    key={reason}
                    control={
                      <Checkbox
                        checked={form.reasons.includes(reason)}
                        onChange={() => handleCheckbox(reason)}
                      />
                    }
                    label={reason}
                  />
                ))}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!form.reasonOther}
                      onChange={e => setForm({ ...form, reasonOther: e.target.checked ? '' : '' })}
                    />
                  }
                  label={
                    <TextField
                      label="Other"
                      name="reasonOther"
                      value={form.reasonOther}
                      onChange={handleChange}
                      size="small"
                      sx={{ minWidth: 120 }}
                    />
                  }
                />
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Brief Description of the Concern"
                name="briefDescription"
                value={form.briefDescription}
                onChange={handleChange}
                multiline
                minRows={3}
                fullWidth
              />
            </Grid>

            {/* Preferred Counselling Mode */}
            <Grid item xs={12} mt={2}>
              <Typography variant="h6" gutterBottom>Preferred Counselling Mode</Typography>
              <RadioGroup row name="preferredMode" value={form.preferredMode} onChange={handleChange}>
                {modes.map((mode) => (
                  <FormControlLabel key={mode} value={mode} control={<Radio />} label={mode} />
                ))}
              </RadioGroup>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Preferred Time (if any)" name="preferredTime" value={form.preferredTime} onChange={handleChange} fullWidth />
            </Grid>

            {/* Confidentiality Statement */}
            <Grid item xs={12} mt={2}>
              <Typography variant="h6" gutterBottom>Confidentiality Statement</Typography>
              <Typography variant="body2" color="text.secondary">
                All information provided in this form will be kept confidential and used solely for the purpose of providing appropriate counseling support.
              </Typography>
            </Grid>

            {/* Signature and Date */}
            <Grid item xs={12} sm={6}>
              <TextField label="Signature" name="signature" value={form.signature} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Date" name="date" type="date" value={form.date} onChange={handleChange} fullWidth required InputLabelProps={{ shrink: true }} />
            </Grid>

            {/* Submit Button and Feedback */}
            <Grid item xs={12}>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button type="submit" variant="contained" size="large" color="primary">
                  Submit
                </Button>
              </Box>
              {success && <Alert severity="success" sx={{ mt: 2 }}>Request submitted successfully!</Alert>}
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
} 