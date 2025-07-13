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
import { toast } from 'react-toastify';

const LessonPlans = () => {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [lessonPlanOptions, setLessonPlanOptions] = useState({
    classes: [],
    sections: [],
    subjects: [],
    subjectGroups: [],
    assignments: [],
    assignedClasses: []
  });
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
    // fetch lesson plan options from database
    (async () => {
      try {
        const options = await teacherAPI.getLessonPlanOptions();
        setLessonPlanOptions(options.options || {
          classes: [],
          sections: [],
          subjects: [],
          subjectGroups: [],
          assignments: [],
          assignedClasses: []
        });
      } catch (err) {
        console.error('Failed to load lesson plan options', err);
        toast.error(err.response?.data?.message || 'Failed to load lesson plan options');
      }
    })();
  }, []);
  
  // Auto-set class, section, and subject when options are loaded
  useEffect(() => {
    if (lessonPlanOptions.assignedClasses && lessonPlanOptions.assignedClasses.length > 0) {
      const assignedClass = lessonPlanOptions.assignedClasses[0];
      setNewPlan(prev => ({
        ...prev,
        class: assignedClass.class,
        section: assignedClass.section
      }));
    }
    
    // Auto-set subject if only one is available
    if (lessonPlanOptions.subjects && lessonPlanOptions.subjects.length === 1) {
      setNewPlan(prev => ({
        ...prev,
        subject: lessonPlanOptions.subjects[0]
      }));
    }
  }, [lessonPlanOptions.assignedClasses, lessonPlanOptions.subjects]);

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

    // Validate required fields
    if (!newPlan.title || !newPlan.description) {
      toast.error('Please fill in title and description');
      return;
    }
    
    // Validate class and section (should be auto-set from assigned classes)
    if (!newPlan.class || !newPlan.section) {
      toast.error('Class and section are required. Please contact your HOD if you are not assigned to any classes.');
      return;
    }
    
    // Validate subject (should be auto-set from assigned subjects or department)
    if (!newPlan.subject) {
      toast.error('Please select a subject');
      return;
    }

    try {
      const formData = new FormData();
      
      // Prepare the data using the form values (class/section are auto-set from assigned classes)
      const submitData = {
        ...newPlan
      };
      
      Object.entries(submitData).forEach(([key, value]) => {
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
        <Button 
          variant="contained" 
          startIcon={<Upload />} 
          onClick={() => setOpenDialog(true)}
          disabled={(lessonPlanOptions.assignments?.length || 0) === 0 && (lessonPlanOptions.assignedClasses?.length || 0) === 0 && (lessonPlanOptions.subjects?.length || 0) === 0}
        >
          New Lesson Plan
        </Button>
      </Box>
      <Box mb={2}>
        <Typography variant="body2" color="textSecondary">
          <b>Approval Workflow:</b> Lesson plans must be approved by <b>HOD</b> and then <b>Principal</b> before being published to students.
        </Typography>
      </Box>
      {(lessonPlanOptions.assignments?.length || 0) === 0 && (lessonPlanOptions.assignedClasses?.length || 0) === 0 && (lessonPlanOptions.subjects?.length || 0) === 0 && (
        <Box mb={2} p={2} bgcolor="warning.light" borderRadius={1}>
          <Typography variant="body2" color="warning.dark">
            You are not assigned to any subjects or classes. Please contact your HOD to get assignments before creating lesson plans.
          </Typography>
        </Box>
      )}
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
                <TableCell>{plan.class || '-'}</TableCell>
                <TableCell>{plan.subject}</TableCell>
                <TableCell>
                  <Chip
                    label={
                      plan.status === 'Pending' ? 'Pending HOD Approval' :
                      plan.status === 'HOD_Approved' ? 'Pending Principal Approval' :
                      plan.status === 'Principal_Approved' ? 'Approved by Principal' :
                      plan.status === 'Published' ? 'Published' :
                      plan.status
                    }
                    color={
                      plan.status === 'Published'
                        ? 'success'
                        : plan.status === 'Principal_Approved'
                        ? 'success'
                        : plan.status === 'HOD_Approved'
                        ? 'info'
                        : plan.status === 'Rejected'
                        ? 'error'
                        : 'warning'
                    }
                    size="small"
                  />
                  {plan.status === 'HOD_Approved' && (
                    <Typography variant="caption" display="block" color="textSecondary">
                      Pending Principal approval
                    </Typography>
                  )}
                  {plan.status === 'Rejected' && plan.rejectionReason && (
                    <Typography variant="caption" display="block" color="error">
                      Reason: {plan.rejectionReason}
                    </Typography>
                  )}
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
          <Box mb={2}>
            <Typography variant="body2" color="textSecondary">
              Lesson plans require approval by <b>HOD</b> and <b>Principal</b> before being published.
            </Typography>
          </Box>
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
            {/* Show assigned class and section info */}
            {(lessonPlanOptions.assignedClasses?.length || 0) > 0 && (
              <Grid item xs={12}>
                <Box p={2} bgcolor="info.light" borderRadius={1}>
                  <Typography variant="body2" color="info.dark">
                    📚 <strong>Assigned Class:</strong> {lessonPlanOptions.assignedClasses?.[0]?.class}-{lessonPlanOptions.assignedClasses?.[0]?.section}
                    {(lessonPlanOptions.assignedClasses?.length || 0) > 1 && (
                      <span> (and {(lessonPlanOptions.assignedClasses?.length || 0) - 1} other classes)</span>
                    )}
                  </Typography>
                </Box>
              </Grid>
            )}
            
            {/* Only show class/section selection if teacher has multiple assigned classes or no assigned classes */}
            {((lessonPlanOptions.assignedClasses?.length || 0) === 0) && (
              <>
                <Grid item xs={4}>
                  {(lessonPlanOptions.classes?.length || 0) > 0 ? (
                    <FormControl fullWidth>
                      <InputLabel>Class</InputLabel>
                      <Select
                        label="Class"
                        value={newPlan.class}
                        onChange={(e) => handleFieldChange('class', e.target.value)}
                      >
                        {(lessonPlanOptions.classes || []).map((cls) => (
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
                  {(lessonPlanOptions.sections?.length || 0) > 0 ? (
                    <FormControl fullWidth>
                      <InputLabel>Section</InputLabel>
                      <Select
                        label="Section"
                        value={newPlan.section}
                        onChange={(e) => handleFieldChange('section', e.target.value)}
                      >
                        {Array.from(new Set((lessonPlanOptions.assignments || [])
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
              </>
            )}
            
            {/* Subject selection - show as disabled if auto-assigned */}
            <Grid item xs={(lessonPlanOptions.assignedClasses?.length || 0) > 0 ? 12 : 4}>
              {(lessonPlanOptions.subjects?.length || 0) > 0 ? (
                <FormControl fullWidth>
                  <InputLabel>Subject</InputLabel>
                  <Select
                    label="Subject"
                    value={newPlan.subject}
                    onChange={(e) => handleFieldChange('subject', e.target.value)}
                    disabled={(lessonPlanOptions.subjects?.length || 0) === 1}
                  >
                    {(lessonPlanOptions.subjects || []).map((subject) => (
                      <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  label="Subject"
                  fullWidth
                  value={newPlan.subject}
                  onChange={(e) => handleFieldChange('subject', e.target.value)}
                  disabled={(lessonPlanOptions.subjects?.length || 0) === 1}
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
                {newPlan.file ? newPlan.file.name : 'Upload File (PDF, DOCX, DOC, Images, Videos)'}
                <input type="file" hidden onChange={handleFileChange} />
              </Button>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                Supported formats: PDF, DOCX, DOC, JPG, PNG, MP4, AVI (Max 10MB)
              </Typography>
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
