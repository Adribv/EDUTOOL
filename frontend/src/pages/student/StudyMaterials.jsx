import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Divider,
  CardMedia
} from '@mui/material';
import {
  Book as BookIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  PlayArrow as PlayIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Subject as SubjectIcon
} from '@mui/icons-material';
import studentService from '../../services/studentService';

function StudyMaterials() {
  const [lessonPlans, setLessonPlans] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLessonPlan, setSelectedLessonPlan] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchLessonPlans();
    fetchSubjects();
  }, [selectedSubject]);

  const fetchLessonPlans = async () => {
    try {
      setLoading(true);
      const params = selectedSubject ? { subject: selectedSubject } : {};
      const response = await studentService.getLearningResources(params);
      setLessonPlans(response.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching lesson plans:', err);
      setError('Failed to load lesson plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await studentService.getLearningResourceSubjects();
      setSubjects(response.data?.subjects || []);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  const handleViewLessonPlan = (lessonPlan) => {
    setSelectedLessonPlan(lessonPlan);
    setDialogOpen(true);
  };

  const handleDownload = (url, filename) => {
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getFileExtension = (url) => {
    if (!url) return '.pdf';
    const ext = url.split('.').pop().toLowerCase();
    return ext ? `.${ext}` : '.pdf';
  };

  const getFileTypeLabel = (url) => {
    if (!url) return 'PDF';
    const ext = url.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf': return 'PDF';
      case 'doc': return 'DOC';
      case 'docx': return 'DOCX';
      case 'jpg':
      case 'jpeg': return 'Image';
      case 'png': return 'Image';
      case 'gif': return 'Image';
      default: return 'File';
    }
  };

  // Extract YouTube video ID and return thumbnail URL
  const getYoutubeThumbnail = (url) => {
    if (!url) return null;
    // Regex to capture the 11-character video ID from various YouTube URL formats
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.*\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
    const match = url.match(regex);
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
    return null;
  };

  const getVideoUrl = (plan) => plan.videoUrl || plan.videoLink || '';

  // Check if URL is a YouTube link
  const isYoutubeUrl = (url) => {
    if (!url) return false;
    return /(?:youtube\.com|youtu\.be)/.test(url);
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!isYoutubeUrl(url)) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.*\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
    const match = url.match(regex);
    return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Published':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          <BookIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Study Materials
        </Typography>
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Subject</InputLabel>
          <Select
            value={selectedSubject}
            label="Filter by Subject"
            onChange={(e) => setSelectedSubject(e.target.value)}
            startAdornment={<FilterIcon sx={{ mr: 1 }} />}
          >
            <MenuItem value="">All Subjects</MenuItem>
            {subjects.map((subject) => (
              <MenuItem key={subject} value={subject}>
                {subject}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {lessonPlans.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6" textAlign="center" color="text.secondary">
              No lesson plans available for your class and section.
            </Typography>
            <Typography variant="body2" textAlign="center" color="text.secondary">
              Lesson plans will appear here once they are approved and published by your teachers.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {lessonPlans.map((lessonPlan) => (
            <Grid item xs={12} md={6} lg={4} key={lessonPlan._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Show YouTube thumbnail if available */}
                {getYoutubeThumbnail(getVideoUrl(lessonPlan)) && (
                  <CardMedia
                    component="img"
                    height="180"
                    image={getYoutubeThumbnail(getVideoUrl(lessonPlan))}
                    alt={lessonPlan.title}
                  />
                )}

                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {lessonPlan.title}
                    </Typography>
                    <Chip
                      label={lessonPlan.status}
                      color={getStatusColor(lessonPlan.status)}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {lessonPlan.description}
                  </Typography>

                  <Box display="flex" alignItems="center" mb={1}>
                    <SubjectIcon sx={{ mr: 1, fontSize: 16 }} />
                    <Typography variant="body2" color="text.secondary">
                      {lessonPlan.subject}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" mb={1}>
                    <SchoolIcon sx={{ mr: 1, fontSize: 16 }} />
                    <Typography variant="body2" color="text.secondary">
                      Class {lessonPlan.class}-{lessonPlan.section}
                    </Typography>
                  </Box>

                  {lessonPlan.submittedBy && (
                    <Box display="flex" alignItems="center" mb={1}>
                      <PersonIcon sx={{ mr: 1, fontSize: 16 }} />
                      <Typography variant="body2" color="text.secondary">
                        By: {lessonPlan.submittedBy.name}
                      </Typography>
                    </Box>
                  )}

                  <Typography variant="caption" color="text.secondary">
                    Published: {formatDate(lessonPlan.principalApprovedAt || lessonPlan.createdAt)}
                  </Typography>

                  {lessonPlan.viewCount > 0 && (
                    <Box display="flex" alignItems="center" mt={1}>
                      <ViewIcon sx={{ mr: 0.5, fontSize: 16 }} />
                      <Typography variant="caption" color="text.secondary">
                        {lessonPlan.viewCount} views
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    startIcon={<ViewIcon />}
                    onClick={() => handleViewLessonPlan(lessonPlan)}
                  >
                    View Details
                  </Button>
                  
                  {lessonPlan.pdfUrl && (
                    <Button
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(lessonPlan.pdfUrl, `${lessonPlan.title}${getFileExtension(lessonPlan.pdfUrl)}`)}
                    >
                      {getFileTypeLabel(lessonPlan.pdfUrl)}
                    </Button>
                  )}
                  
                  {getVideoUrl(lessonPlan) && (
                    <Button
                      size="small"
                      startIcon={<PlayIcon />}
                      onClick={() => window.open(getVideoUrl(lessonPlan), '_blank')}
                    >
                      Video
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Lesson Plan Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedLessonPlan && (
          <>
            <DialogTitle>
              {selectedLessonPlan.title}
            </DialogTitle>
            <DialogContent>
              <Box mb={2}>
                <Typography variant="body1" paragraph>
                  {selectedLessonPlan.description}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Subject
                  </Typography>
                  <Typography variant="body2">{selectedLessonPlan.subject}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Class & Section
                  </Typography>
                  <Typography variant="body2">
                    Class {selectedLessonPlan.class}-{selectedLessonPlan.section}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Teacher
                  </Typography>
                  <Typography variant="body2">
                    {selectedLessonPlan.submittedBy?.name || 'Unknown'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Published Date
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(selectedLessonPlan.principalApprovedAt || selectedLessonPlan.createdAt)}
                  </Typography>
                </Grid>
              </Grid>

              {(selectedLessonPlan.pdfUrl || getVideoUrl(selectedLessonPlan)) && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Attachments
                  </Typography>
                  <Box display="flex" gap={1}>
                    {selectedLessonPlan.pdfUrl && (
                      <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownload(selectedLessonPlan.pdfUrl, `${selectedLessonPlan.title}${getFileExtension(selectedLessonPlan.pdfUrl)}`)}
                      >
                        Download {getFileTypeLabel(selectedLessonPlan.pdfUrl)}
                      </Button>
                    )}
                    {/* Render YouTube video inline if it is a YouTube URL, otherwise keep external link */}
                    {getVideoUrl(selectedLessonPlan) && isYoutubeUrl(getVideoUrl(selectedLessonPlan)) ? (
                      <Box width="100%" sx={{ mt: 2 }}>
                        <Box
                          sx={{
                            position: 'relative',
                            paddingTop: '56.25%' /* 16:9 aspect ratio */,
                          }}
                        >
                          <iframe
                            src={getYoutubeEmbedUrl(getVideoUrl(selectedLessonPlan))}
                            title="YouTube video player"
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              border: 0,
                            }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        </Box>
                      </Box>
                    ) : (
                      getVideoUrl(selectedLessonPlan) && (
                        <Button
                          variant="outlined"
                          startIcon={<PlayIcon />}
                          onClick={() => window.open(getVideoUrl(selectedLessonPlan), '_blank')}
                        >
                          Watch Video
                        </Button>
                      )
                    )}
                  </Box>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default StudyMaterials; 