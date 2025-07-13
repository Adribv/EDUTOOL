import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Link
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Download as DownloadIcon,
  PlayArrow as PlayIcon,
  Description as FileIcon,
  VideoLibrary as VideoIcon,
  Assignment as LessonPlanIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Subject as SubjectIcon,
  Schedule as ScheduleIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  ExpandMore as ExpandMoreIcon,
  OpenInNew as OpenInNewIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as DocumentIcon,
  Description as TemplateIcon
} from '@mui/icons-material';
import LessonPlanTemplate from './LessonPlanTemplate';

const LessonPlanViewer = ({ lessonPlan, open, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);

  if (!lessonPlan) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'HOD_Approved': return 'info';
      case 'Principal_Approved': return 'success';
      case 'Published': return 'success';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Pending': return 'Pending HOD Approval';
      case 'HOD_Approved': return 'Pending Principal Approval';
      case 'Principal_Approved': return 'Approved by Principal';
      case 'Published': return 'Published';
      case 'Rejected': return 'Rejected';
      default: return status;
    }
  };

  const handleDownload = (url, filename) => {
    if (url) {
      const link = document.createElement('a');
      link.href = `http://localhost:5000/${url}`;
      link.download = filename || 'lesson-plan';
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  const handlePreview = (url) => {
    if (url) {
      // For PDFs, we can use direct URL
      if (url.toLowerCase().endsWith('.pdf')) {
        setPreviewUrl(`http://localhost:5000/${url}`);
      } else {
        // For other files, try to open in new tab
        window.open(`http://localhost:5000/${url}`, '_blank');
      }
    }
  };

  const renderFileSection = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Attachments & Resources
      </Typography>
      
      {!lessonPlan.fileUrl && !lessonPlan.pdfUrl && !lessonPlan.notesUrl && !lessonPlan.videoUrl && !lessonPlan.videoLink ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
          <Typography variant="body2" color="textSecondary">
            No attachments available for this lesson plan.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {lessonPlan.fileUrl && (
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <DocumentIcon sx={{ mr: 1 }} />
                    <Typography variant="subtitle2">Lesson Plan File</Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" mb={2}>
                    Original lesson plan document
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      onClick={() => handlePreview(lessonPlan.fileUrl)}
                    >
                      Preview
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<OpenInNewIcon />}
                      onClick={() => window.open(`http://localhost:5000/${lessonPlan.fileUrl}`, '_blank')}
                    >
                      Open
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(lessonPlan.fileUrl, `${lessonPlan.title}.docx`)}
                    >
                      Download
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {lessonPlan.pdfUrl && (
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <PdfIcon sx={{ mr: 1 }} />
                    <Typography variant="subtitle2">PDF Version</Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" mb={2}>
                    PDF format of the lesson plan
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      onClick={() => handlePreview(lessonPlan.pdfUrl)}
                    >
                      Preview
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<OpenInNewIcon />}
                      onClick={() => window.open(`http://localhost:5000/${lessonPlan.pdfUrl}`, '_blank')}
                    >
                      Open
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(lessonPlan.pdfUrl, `${lessonPlan.title}.pdf`)}
                    >
                      Download
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {lessonPlan.notesUrl && (
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <DocumentIcon sx={{ mr: 1 }} />
                    <Typography variant="subtitle2">Additional Notes</Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" mb={2}>
                    Supplementary notes and materials
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      onClick={() => handlePreview(lessonPlan.notesUrl)}
                    >
                      Preview
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<OpenInNewIcon />}
                      onClick={() => window.open(`http://localhost:5000/${lessonPlan.notesUrl}`, '_blank')}
                    >
                      Open
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(lessonPlan.notesUrl, `${lessonPlan.title}-notes.pdf`)}
                    >
                      Download
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {(lessonPlan.videoUrl || lessonPlan.videoLink) && (
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <VideoIcon sx={{ mr: 1 }} />
                    <Typography variant="subtitle2">Video Resource</Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" mb={2}>
                    Supplementary video content
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<PlayIcon />}
                    onClick={() => window.open(lessonPlan.videoUrl || lessonPlan.videoLink, '_blank')}
                  >
                    Watch Video
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );

  const renderApprovalHistory = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Approval History
      </Typography>
      
      <List>
        {/* Teacher Submission */}
        <ListItem>
          <ListItemIcon>
            <PersonIcon color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="Submitted by Teacher"
            secondary={
              <Box component="span">
                <Typography variant="body2" component="span" display="block">
                  {lessonPlan.submittedBy?.name || 'Unknown Teacher'}
                </Typography>
                <Typography variant="caption" color="textSecondary" component="span" display="block">
                  {new Date(lessonPlan.createdAt).toLocaleString()}
                </Typography>
              </Box>
            }
          />
        </ListItem>

        {/* HOD Approval */}
        {lessonPlan.hodApprovedBy && (
          <ListItem>
            <ListItemIcon>
              <ApprovedIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Approved by HOD"
              secondary={
                <Box component="span">
                  <Typography variant="body2" component="span" display="block">
                    {lessonPlan.hodApprovedBy.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" component="span" display="block">
                    {lessonPlan.hodApprovedAt ? new Date(lessonPlan.hodApprovedAt).toLocaleString() : '-'}
                  </Typography>
                  {lessonPlan.hodFeedback && (
                    <Typography variant="body2" component="span" display="block" sx={{ mt: 1, fontStyle: 'italic' }}>
                      "{lessonPlan.hodFeedback}"
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItem>
        )}

        {/* Principal Approval */}
        {lessonPlan.principalApprovedBy && (
          <ListItem>
            <ListItemIcon>
              <ApprovedIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Approved by Principal"
              secondary={
                <Box component="span">
                  <Typography variant="body2" component="span" display="block">
                    {lessonPlan.principalApprovedBy.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" component="span" display="block">
                    {lessonPlan.principalApprovedAt ? new Date(lessonPlan.principalApprovedAt).toLocaleString() : '-'}
                  </Typography>
                  {lessonPlan.principalFeedback && (
                    <Typography variant="body2" component="span" display="block" sx={{ mt: 1, fontStyle: 'italic' }}>
                      "{lessonPlan.principalFeedback}"
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItem>
        )}

        {/* Rejection */}
        {lessonPlan.rejectedBy && (
          <ListItem>
            <ListItemIcon>
              <RejectedIcon color="error" />
            </ListItemIcon>
            <ListItemText
              primary="Rejected"
              secondary={
                <Box component="span">
                  <Typography variant="body2" component="span" display="block">
                    {lessonPlan.rejectedBy.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" component="span" display="block">
                    {lessonPlan.rejectedAt ? new Date(lessonPlan.rejectedAt).toLocaleString() : '-'}
                  </Typography>
                  {lessonPlan.rejectionReason && (
                    <Typography variant="body2" component="span" display="block" sx={{ mt: 1, fontStyle: 'italic', color: 'error.main' }}>
                      "{lessonPlan.rejectionReason}"
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItem>
        )}
      </List>
    </Box>
  );

  const renderBasicInfo = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Basic Information
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            {lessonPlan.title}
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            {lessonPlan.description}
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box display="flex" alignItems="center" mb={1}>
            <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="subtitle2" color="textSecondary">
              Teacher
            </Typography>
          </Box>
          <Typography variant="body2">
            {lessonPlan.submittedBy?.name || 'Unknown'}
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box display="flex" alignItems="center" mb={1}>
            <SubjectIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="subtitle2" color="textSecondary">
              Subject
            </Typography>
          </Box>
          <Typography variant="body2">
            {lessonPlan.subject || 'Not specified'}
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box display="flex" alignItems="center" mb={1}>
            <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="subtitle2" color="textSecondary">
              Class & Section
            </Typography>
          </Box>
          <Typography variant="body2">
            Class {lessonPlan.class || 'Not specified'} - {lessonPlan.section || 'Not specified'}
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box display="flex" alignItems="center" mb={1}>
            <ScheduleIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="subtitle2" color="textSecondary">
              Submitted On
            </Typography>
          </Box>
          <Typography variant="body2">
            {new Date(lessonPlan.createdAt).toLocaleString()}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" alignItems="center" mb={1}>
            <LessonPlanIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="subtitle2" color="textSecondary">
              Status
            </Typography>
          </Box>
          <Chip
            label={getStatusLabel(lessonPlan.status)}
            color={getStatusColor(lessonPlan.status)}
            size="small"
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderTemplateView = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Structured Lesson Plan Template
      </Typography>
      <LessonPlanTemplate
        lessonPlan={lessonPlan.templateData || {
          title: lessonPlan.title,
          class: lessonPlan.class,
          subject: lessonPlan.subject,
          topic: lessonPlan.description,
          duration: '40 Minutes',
          date: new Date(lessonPlan.createdAt).toISOString().split('T')[0],
          teacherName: lessonPlan.submittedBy?.name || 'Unknown',
          numberOfStudents: '30',
          objectives: [],
          materials: [],
          prerequisiteKnowledge: [],
          introduction: '',
          presentation: [],
          assessment: {
            questions: [],
            worksheet: ''
          },
          summary: '',
          homework: '',
          followUp: ''
        }}
        onSave={(data) => {
          console.log('Template data saved:', data);
          // Here you would typically save to backend
        }}
        isEditing={false}
        userRole="Teacher"
        readOnly={true}
      />
    </Box>
  );

  const tabPanels = [
    {
      label: 'Overview',
      content: renderBasicInfo()
    },
    {
      label: 'Template',
      content: renderTemplateView()
    },
    {
      label: 'Files & Resources',
      content: renderFileSection()
    },
    {
      label: 'Approval History',
      content: renderApprovalHistory()
    }
  ];

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">
              Lesson Plan Viewer
            </Typography>
            <Chip
              label={getStatusLabel(lessonPlan.status)}
              color={getStatusColor(lessonPlan.status)}
              size="small"
            />
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
            {tabPanels.map((tab, index) => (
              <Tab key={index} label={tab.label} />
            ))}
          </Tabs>

          <Box>
            {tabPanels[activeTab].content}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* File Preview Dialog */}
      <Dialog open={!!previewUrl} onClose={() => setPreviewUrl(null)} maxWidth="lg" fullWidth>
        <DialogTitle>File Preview</DialogTitle>
        <DialogContent>
          {previewUrl && (
            <Box>
              <Box mb={2}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = previewUrl;
                    link.download = 'lesson-plan-preview';
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                  }}
                  sx={{ mb: 1 }}
                >
                  Download File
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<OpenInNewIcon />}
                  onClick={() => window.open(previewUrl, '_blank')}
                  sx={{ ml: 1 }}
                >
                  Open in New Tab
                </Button>
              </Box>
              <iframe
                src={previewUrl}
                width="100%"
                height="600px"
                style={{ border: 'none' }}
                title="File Preview"
                onError={(e) => {
                  console.error('Error loading preview:', e);
                  // Fallback to download if preview fails
                  const link = document.createElement('a');
                  link.href = previewUrl;
                  link.download = 'lesson-plan-preview';
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewUrl(null)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LessonPlanViewer; 