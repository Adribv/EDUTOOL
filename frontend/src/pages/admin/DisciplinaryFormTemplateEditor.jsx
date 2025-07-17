import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Save,
  Cancel,
  Add,
  Delete,
  Edit,
  ExpandMore,
  Visibility,
  School,
  Settings,
  Palette,
  Assignment
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { disciplinaryAPI } from '../../services/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`template-tabpanel-${index}`}
      aria-labelledby={`template-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const DisciplinaryFormTemplateEditor = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(templateId);

  const [tabValue, setTabValue] = useState(0);
  const [template, setTemplate] = useState({
    templateName: '',
    templateDescription: '',
    isActive: true,
    isDefault: false,
    schoolInfo: {
      schoolName: '',
      schoolAddress: '',
      schoolPhone: '',
      schoolEmail: '',
      logo: ''
    },
    formConfig: {
      showLogo: true,
      showDate: true,
      showWarningNumber: true,
      studentFields: {
        requireParentContact: true,
        requireGradeSection: true,
        requireRollNumber: true
      },
      incidentFields: {
        requireLocation: true,
        requireTime: true,
        requireReportingStaff: true
      },
      workflowSettings: {
        requireStudentAcknowledgment: true,
        requireParentAcknowledgment: true,
        requireAdminApproval: false,
        allowFollowUp: true
      }
    },
    misconductTypes: [],
    actionTypes: [],
    instructions: {
      teacherInstructions: '',
      studentInstructions: '',
      parentInstructions: '',
      generalNotes: ''
    },
    styling: {
      primaryColor: '#1976d2',
      fontFamily: 'Arial, sans-serif',
      logoPosition: 'left'
    }
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'misconduct' or 'action'
  const [dialogData, setDialogData] = useState({});
  const [editIndex, setEditIndex] = useState(-1);

  // Fetch template if editing
  const { isLoading } = useQuery({
    queryKey: ['disciplinaryTemplate', templateId],
    queryFn: () => disciplinaryAPI.getTemplateById(templateId),
    enabled: isEditing,
    onSuccess: (data) => {
      setTemplate(data.data);
    }
  });

  // Save template mutation
  const saveMutation = useMutation({
    mutationFn: (data) => 
      isEditing 
        ? disciplinaryAPI.updateTemplate(templateId, data)
        : disciplinaryAPI.createTemplate(data),
    onSuccess: () => {
      toast.success(`Template ${isEditing ? 'updated' : 'created'} successfully`);
      queryClient.invalidateQueries(['disciplinaryTemplates']);
      navigate('/admin/disciplinary-forms');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to save template');
    }
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInputChange = (path, value) => {
    setTemplate(prev => {
      const newTemplate = { ...prev };
      const pathArray = path.split('.');
      let current = newTemplate;
      
      for (let i = 0; i < pathArray.length - 1; i++) {
        if (!current[pathArray[i]]) {
          current[pathArray[i]] = {};
        }
        current = current[pathArray[i]];
      }
      
      current[pathArray[pathArray.length - 1]] = value;
      return newTemplate;
    });
  };

  const handleSave = () => {
    if (!template.templateName.trim()) {
      toast.error('Template name is required');
      return;
    }
    
    if (!template.schoolInfo.schoolName.trim()) {
      toast.error('School name is required');
      return;
    }

    saveMutation.mutate(template);
  };

  const handleCancel = () => {
    navigate('/admin/disciplinary-forms');
  };

  const openDialog = (type, data = {}, index = -1) => {
    setDialogType(type);
    setDialogData(data);
    setEditIndex(index);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setDialogData({});
    setEditIndex(-1);
  };

  const handleDialogSave = () => {
    const targetArray = dialogType === 'misconduct' ? 'misconductTypes' : 'actionTypes';
    
    setTemplate(prev => {
      const newTemplate = { ...prev };
      if (editIndex >= 0) {
        newTemplate[targetArray][editIndex] = dialogData;
      } else {
        newTemplate[targetArray].push({ ...dialogData, enabled: true });
      }
      return newTemplate;
    });
    
    closeDialog();
  };

  const handleDeleteItem = (type, index) => {
    const targetArray = type === 'misconduct' ? 'misconductTypes' : 'actionTypes';
    setTemplate(prev => ({
      ...prev,
      [targetArray]: prev[targetArray].filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4">
          {isEditing ? 'Edit Template' : 'Create New Template'}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={handleCancel}
            sx={{ mr: 2 }}
            startIcon={<Cancel />}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saveMutation.isLoading}
            startIcon={saveMutation.isLoading ? <CircularProgress size={20} /> : <Save />}
          >
            {saveMutation.isLoading ? 'Saving...' : 'Save Template'}
          </Button>
        </Box>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="template editor tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Basic Info" icon={<Assignment />} iconPosition="start" />
          <Tab label="School Info" icon={<School />} iconPosition="start" />
          <Tab label="Form Settings" icon={<Settings />} iconPosition="start" />
          <Tab label="Misconduct Types" icon={<Assignment />} iconPosition="start" />
          <Tab label="Action Types" icon={<Assignment />} iconPosition="start" />
          <Tab label="Instructions" icon={<Assignment />} iconPosition="start" />
          <Tab label="Styling" icon={<Palette />} iconPosition="start" />
          <Tab label="Preview" icon={<Visibility />} iconPosition="start" />
        </Tabs>

        {/* Basic Info Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Template Name"
                value={template.templateName}
                onChange={(e) => handleInputChange('templateName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" gap={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={template.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    />
                  }
                  label="Active"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={template.isDefault}
                      onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                    />
                  }
                  label="Default Template"
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Template Description"
                value={template.templateDescription}
                onChange={(e) => handleInputChange('templateDescription', e.target.value)}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* School Info Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="School Name"
                value={template.schoolInfo.schoolName}
                onChange={(e) => handleInputChange('schoolInfo.schoolName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="School Email"
                value={template.schoolInfo.schoolEmail}
                onChange={(e) => handleInputChange('schoolInfo.schoolEmail', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="School Phone"
                value={template.schoolInfo.schoolPhone}
                onChange={(e) => handleInputChange('schoolInfo.schoolPhone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="School Address"
                value={template.schoolInfo.schoolAddress}
                onChange={(e) => handleInputChange('schoolInfo.schoolAddress', e.target.value)}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Form Settings Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">Header Settings</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={template.formConfig.showLogo}
                          onChange={(e) => handleInputChange('formConfig.showLogo', e.target.checked)}
                        />
                      }
                      label="Show School Logo"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={template.formConfig.showDate}
                          onChange={(e) => handleInputChange('formConfig.showDate', e.target.checked)}
                        />
                      }
                      label="Show Date Field"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={template.formConfig.showWarningNumber}
                          onChange={(e) => handleInputChange('formConfig.showWarningNumber', e.target.checked)}
                        />
                      }
                      label="Show Warning Number"
                    />
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Grid>

            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">Student Information Fields</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={template.formConfig.studentFields.requireParentContact}
                          onChange={(e) => handleInputChange('formConfig.studentFields.requireParentContact', e.target.checked)}
                        />
                      }
                      label="Require Parent Contact"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={template.formConfig.studentFields.requireGradeSection}
                          onChange={(e) => handleInputChange('formConfig.studentFields.requireGradeSection', e.target.checked)}
                        />
                      }
                      label="Require Grade/Section"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={template.formConfig.studentFields.requireRollNumber}
                          onChange={(e) => handleInputChange('formConfig.studentFields.requireRollNumber', e.target.checked)}
                        />
                      }
                      label="Require Roll Number"
                    />
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Grid>

            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">Workflow Settings</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={template.formConfig.workflowSettings.requireStudentAcknowledgment}
                          onChange={(e) => handleInputChange('formConfig.workflowSettings.requireStudentAcknowledgment', e.target.checked)}
                        />
                      }
                      label="Require Student Acknowledgment"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={template.formConfig.workflowSettings.requireParentAcknowledgment}
                          onChange={(e) => handleInputChange('formConfig.workflowSettings.requireParentAcknowledgment', e.target.checked)}
                        />
                      }
                      label="Require Parent Acknowledgment"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={template.formConfig.workflowSettings.requireAdminApproval}
                          onChange={(e) => handleInputChange('formConfig.workflowSettings.requireAdminApproval', e.target.checked)}
                        />
                      }
                      label="Require Admin Approval"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={template.formConfig.workflowSettings.allowFollowUp}
                          onChange={(e) => handleInputChange('formConfig.workflowSettings.allowFollowUp', e.target.checked)}
                        />
                      }
                      label="Allow Follow-up Actions"
                    />
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Misconduct Types Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">Misconduct Types</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => openDialog('misconduct')}
            >
              Add Misconduct Type
            </Button>
          </Box>
          
          <List>
            {template.misconductTypes.map((item, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={item.label}
                  secondary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip 
                        label={item.severity} 
                        size="small" 
                        color={
                          item.severity === 'high' ? 'error' : 
                          item.severity === 'medium' ? 'warning' : 'default'
                        }
                      />
                      {item.description && <Typography variant="caption">{item.description}</Typography>}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => openDialog('misconduct', item, index)}
                    sx={{ mr: 1 }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteItem('misconduct', index)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          
          {template.misconductTypes.length === 0 && (
            <Alert severity="info">
              No misconduct types configured. Add at least one misconduct type for the form to function properly.
            </Alert>
          )}
        </TabPanel>

        {/* Action Types Tab */}
        <TabPanel value={tabValue} index={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">Action Types</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => openDialog('action')}
            >
              Add Action Type
            </Button>
          </Box>
          
          <List>
            {template.actionTypes.map((item, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={item.label}
                  secondary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip 
                        label={item.severity} 
                        size="small" 
                        color={
                          item.severity === 'severe' ? 'error' : 
                          item.severity === 'moderate' ? 'warning' : 'default'
                        }
                      />
                      {item.requiresDetails && (
                        <Chip label="Requires Details" size="small" variant="outlined" />
                      )}
                      {item.description && <Typography variant="caption">{item.description}</Typography>}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => openDialog('action', item, index)}
                    sx={{ mr: 1 }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteItem('action', index)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          
          {template.actionTypes.length === 0 && (
            <Alert severity="info">
              No action types configured. Add at least one action type for the form to function properly.
            </Alert>
          )}
        </TabPanel>

        {/* Instructions Tab */}
        <TabPanel value={tabValue} index={5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Teacher Instructions"
                value={template.instructions.teacherInstructions}
                onChange={(e) => handleInputChange('instructions.teacherInstructions', e.target.value)}
                helperText="Instructions displayed to teachers when creating forms"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Student Instructions"
                value={template.instructions.studentInstructions}
                onChange={(e) => handleInputChange('instructions.studentInstructions', e.target.value)}
                helperText="Instructions displayed to students when acknowledging forms"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Parent Instructions"
                value={template.instructions.parentInstructions}
                onChange={(e) => handleInputChange('instructions.parentInstructions', e.target.value)}
                helperText="Instructions displayed to parents when acknowledging forms"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="General Notes"
                value={template.instructions.generalNotes}
                onChange={(e) => handleInputChange('instructions.generalNotes', e.target.value)}
                helperText="General notes about this template"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Styling Tab */}
        <TabPanel value={tabValue} index={6}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="color"
                label="Primary Color"
                value={template.styling.primaryColor}
                onChange={(e) => handleInputChange('styling.primaryColor', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Font Family</InputLabel>
                <Select
                  value={template.styling.fontFamily}
                  onChange={(e) => handleInputChange('styling.fontFamily', e.target.value)}
                >
                  <MenuItem value="Arial, sans-serif">Arial</MenuItem>
                  <MenuItem value="Times New Roman, serif">Times New Roman</MenuItem>
                  <MenuItem value="Helvetica, sans-serif">Helvetica</MenuItem>
                  <MenuItem value="Georgia, serif">Georgia</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Logo Position</InputLabel>
                <Select
                  value={template.styling.logoPosition}
                  onChange={(e) => handleInputChange('styling.logoPosition', e.target.value)}
                >
                  <MenuItem value="left">Left</MenuItem>
                  <MenuItem value="center">Center</MenuItem>
                  <MenuItem value="right">Right</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Preview Tab */}
        <TabPanel value={tabValue} index={7}>
          <Alert severity="info" sx={{ mb: 3 }}>
            This is a preview of how the form will appear. The actual form will include dynamic data.
          </Alert>
          
          <Card>
            <CardHeader
              title="Disciplinary Action Form Preview"
              sx={{ 
                backgroundColor: template.styling.primaryColor,
                color: 'white',
                textAlign: template.styling.logoPosition 
              }}
            />
            <CardContent>
              <Typography variant="h6" gutterBottom>School Information</Typography>
              <Typography>{template.schoolInfo.schoolName}</Typography>
              <Typography>{template.schoolInfo.schoolAddress}</Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>Misconduct Types Available</Typography>
              <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                {template.misconductTypes.map((type, index) => (
                  <Chip key={index} label={type.label} size="small" />
                ))}
              </Box>
              
              <Typography variant="h6" gutterBottom>Action Types Available</Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {template.actionTypes.map((type, index) => (
                  <Chip key={index} label={type.label} size="small" variant="outlined" />
                ))}
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>

      {/* Dialog for Adding/Editing Items */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editIndex >= 0 ? 'Edit' : 'Add'} {dialogType === 'misconduct' ? 'Misconduct' : 'Action'} Type
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Label"
                value={dialogData.label || ''}
                onChange={(e) => setDialogData({ ...dialogData, label: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                value={dialogData.description || ''}
                onChange={(e) => setDialogData({ ...dialogData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={dialogData.severity || (dialogType === 'misconduct' ? 'medium' : 'moderate')}
                  onChange={(e) => setDialogData({ ...dialogData, severity: e.target.value })}
                >
                  {dialogType === 'misconduct' ? (
                    <>
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                    </>
                  ) : (
                    <>
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="moderate">Moderate</MenuItem>
                      <MenuItem value="severe">Severe</MenuItem>
                    </>
                  )}
                </Select>
              </FormControl>
            </Grid>
            {dialogType === 'action' && (
              <>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={dialogData.requiresDetails || false}
                        onChange={(e) => setDialogData({ ...dialogData, requiresDetails: e.target.checked })}
                      />
                    }
                    label="Requires Details"
                  />
                </Grid>
                {dialogData.requiresDetails && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Details Label"
                      value={dialogData.detailsLabel || ''}
                      onChange={(e) => setDialogData({ ...dialogData, detailsLabel: e.target.value })}
                      placeholder="e.g., Number of days"
                    />
                  </Grid>
                )}
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button 
            onClick={handleDialogSave}
            variant="contained"
            disabled={!dialogData.label}
          >
            {editIndex >= 0 ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DisciplinaryFormTemplateEditor; 