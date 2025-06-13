import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Grid,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search,
  Download,
  Book,
  VideoLibrary,
  Assignment,
  Description,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import studentService from '../../services/studentService';

const LearningResources = () => {
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);
  const [previewDialog, setPreviewDialog] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await studentService.getLearningResources();
      setResources(response.data);
    } catch {
      toast.error('Failed to load learning resources');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (resource) => {
    try {
      const response = await studentService.downloadResource(resource.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', resource.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error('Failed to download resource');
    }
  };

  const getResourceIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'book':
        return <Book />;
      case 'video':
        return <VideoLibrary />;
      case 'assignment':
        return <Assignment />;
      default:
        return <Description />;
    }
  };

  const filteredResources = resources.filter((resource) =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Learning Resources
      </Typography>

      <Box mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Grid container spacing={3}>
        {filteredResources.map((resource) => (
          <Grid item xs={12} md={6} lg={4} key={resource.id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  {getResourceIcon(resource.type)}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {resource.title}
                  </Typography>
                </Box>
                <Typography color="textSecondary" gutterBottom>
                  Subject: {resource.subject}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Type: {resource.type}
                </Typography>
                <Typography variant="body2" paragraph>
                  {resource.description}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Chip
                    label={resource.format}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Box>
                    <Button
                      size="small"
                      onClick={() => {
                        setSelectedResource(resource);
                        setPreviewDialog(true);
                      }}
                      sx={{ mr: 1 }}
                    >
                      Preview
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<Download />}
                      onClick={() => handleDownload(resource)}
                    >
                      Download
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={previewDialog}
        onClose={() => setPreviewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedResource?.title}
        </DialogTitle>
        <DialogContent>
          {selectedResource?.type.toLowerCase() === 'video' ? (
            <Box
              component="video"
              controls
              sx={{ width: '100%', maxHeight: '70vh' }}
              src={selectedResource?.previewUrl}
            />
          ) : (
            <Box
              component="iframe"
              sx={{ width: '100%', height: '70vh', border: 'none' }}
              src={selectedResource?.previewUrl}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => {
              handleDownload(selectedResource);
              setPreviewDialog(false);
            }}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LearningResources; 