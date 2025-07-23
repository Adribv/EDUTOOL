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
  Tabs,
  Tab,
} from '@mui/material';
import { Upload, Visibility, Download as DownloadIcon, OpenInNew as OpenInNewIcon, Description as TemplateIcon } from '@mui/icons-material';
import { teacherAPI } from '../../services/api';
import { toast } from 'react-toastify';
import LessonPlanViewer from '../../components/LessonPlanViewer';
import LessonPlanTemplate from '../../components/LessonPlanTemplate';
import { useAuth } from '../../context/AuthContext';

const LessonPlans = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [viewerDialog, setViewerDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
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
    file: null,        // Main lesson plan attachment
    notes: null,       // Optional notes PDF
  });
  const [templateData, setTemplateData] = useState({
    title: '',
    class: '',
    section: '',
    subject: '',
    topic: '',
    duration: '40 Minutes',
    date: new Date().toISOString().split('T')[0],
    teacherName: 'Your Name', // Will be auto-populated
    numberOfStudents: '30',
    objectives: [''],
    materials: [''],
    prerequisiteKnowledge: [''],
    introduction: '',
    presentation: [{
      step: '',
      teacherActivity: '',
      studentActivity: '',
      teachingAids: ''
    }],
    assessment: {
      questions: [''],
      worksheet: ''
    },
    summary: '',
    homework: '',
    followUp: ''
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
      
      // Also update template data with assigned class and section
      setTemplateData(prev => ({
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
      
      // Also update template data with assigned subject
      setTemplateData(prev => ({
        ...prev,
        subject: lessonPlanOptions.subjects[0]
      }));
    }
  }, [lessonPlanOptions.assignedClasses, lessonPlanOptions.subjects]);

  // Auto-set teacher name from user context
  useEffect(() => {
    if (user && user.name) {
      setTemplateData(prev => ({
        ...prev,
        teacherName: user.name
      }));
    }
  }, [user]);

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
      notes: null,
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

  const handleNotesChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFieldChange('notes', file);
    }
  };

  const handleSubmit = async () => {
    if (activeTab === 0) {
      // Simple form submission
      if (!newPlan.file && !newPlan.videoLink) {
        toast.error('Please upload a file or provide a video link');
        return;
      }

      // Validate required fields
      if (!newPlan.title || !newPlan.description) {
        toast.error('Please fill in title and description');
        return;
      }
      
      // Class and section will be auto-determined from teacher's assignments by the backend
      // Subject will also be auto-determined if not provided

      try {
        const formData = new FormData();
        
        // Prepare the data using the form values (class/section are auto-set from assigned classes)
        const submitData = {
          ...newPlan
        };
        
        Object.entries(submitData).forEach(([key, value]) => {
          if (key === 'file' || key === 'notes') {
            if (value) formData.append(key, value);
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
    } else {
      // Template form submission
      console.log('Template data for validation:', templateData);
      console.log('Title:', templateData.title, 'Topic:', templateData.topic);
      
      if (!templateData.title || !templateData.topic) {
        toast.error('Please fill in title and topic');
        console.log('Validation failed - Title empty:', !templateData.title, 'Topic empty:', !templateData.topic);
        return;
      }

      try {
        const formData = new FormData();
        
        // Add template data as JSON string
        formData.append('title', templateData.title);
        formData.append('description', templateData.topic);
        formData.append('templateData', JSON.stringify(templateData));
        
        // Add any files if uploaded
        if (newPlan.file) formData.append('file', newPlan.file);
        if (newPlan.notes) formData.append('notes', newPlan.notes);
        if (newPlan.videoLink) formData.append('videoLink', newPlan.videoLink);

        await teacherAPI.submitLessonPlan(formData);
        toast.success('Structured Lesson Plan submitted for approval');
        handleDialogClose();
        fetchPlans();
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || 'Failed to submit lesson plan');
      }
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
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedPlan(plan);
                        setViewerDialog(true);
                      }}
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  {plan.pdfUrl && (
                    <Tooltip title="Download PDF">
                      <IconButton component="a" href={`http://localhost:5000/${plan.pdfUrl}`} target="_blank" rel="noopener noreferrer">
                        <OpenInNewIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {plan.videoUrl && (
                    <Tooltip title="Download Video">
                      <IconButton component="a" href={`http://localhost:5000/${plan.videoUrl}`} download>
                        <DownloadIcon />
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
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="lg" fullWidth>
        <DialogTitle>Create Lesson Plan</DialogTitle>
        <DialogContent dividers>
          <Box mb={2}>
            <Typography variant="body2" color="textSecondary">
              Lesson plans require approval by <b>HOD</b> and <b>Principal</b> before being published.
            </Typography>
            <Typography variant="body2" color="info.main" sx={{ mt: 1 }}>
              💡 Class, section, and subject will be automatically assigned based on your teacher profile.
            </Typography>
          </Box>
          
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="Simple Form" />
            <Tab label="Structured Template" />
          </Tabs>

          {activeTab === 0 ? (
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
                    📚 <strong>Auto-assigned Class:</strong> {lessonPlanOptions.assignedClasses?.[0]?.class}-{lessonPlanOptions.assignedClasses?.[0]?.section}
                    {(lessonPlanOptions.assignedClasses?.length || 0) > 1 && (
                      <span> (and {(lessonPlanOptions.assignedClasses?.length || 0) - 1} other classes)</span>
                    )}
                    <br />
                    <small>Class and section will be automatically set from your assignments</small>
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
                  {(lessonPlanOptions.subjects?.length || 0) === 1 && (
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                      Subject auto-assigned from your department
                    </Typography>
                  )}
                </FormControl>
              ) : (
                <TextField
                  label="Subject"
                  fullWidth
                  value={newPlan.subject}
                  onChange={(e) => handleFieldChange('subject', e.target.value)}
                  disabled={(lessonPlanOptions.subjects?.length || 0) === 1}
                  helperText={(lessonPlanOptions.subjects?.length || 0) === 1 ? "Subject auto-assigned from your department" : ""}
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
            <Grid item xs={12}>
              <Button variant="outlined" component="label" fullWidth color="secondary">
                {newPlan.notes ? newPlan.notes.name : 'Upload Notes (PDF)'}
                <input type="file" accept="application/pdf" hidden onChange={handleNotesChange} />
              </Button>
            </Grid>
          </Grid>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom>
                Structured Lesson Plan Template
              </Typography>
              <LessonPlanTemplate
                lessonPlan={templateData}
                onSave={setTemplateData}
                isEditing={true}
                userRole="Teacher"
                readOnly={false}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} startIcon={<Upload />}>
            {activeTab === 0 ? 'Submit' : 'Submit Template'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lesson Plan Viewer */}
      <LessonPlanViewer
        lessonPlan={selectedPlan}
        open={viewerDialog}
        onClose={() => setViewerDialog(false)}
      />
    </Box>
  );
};

export default LessonPlans;
