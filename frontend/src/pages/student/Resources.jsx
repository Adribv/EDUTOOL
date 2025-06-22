import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Description as DescriptionIcon,
  VideoLibrary as VideoIcon,
  Link as LinkIcon,
  Download as DownloadIcon,
  Folder as FolderIcon,
  Book as BookIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { studentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Resources = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);
  const [previewDialog, setPreviewDialog] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [searchQuery, resources]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getResources();
      setResources(response.data);
      setFilteredResources(response.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
      setError('Failed to load resources');
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    const filtered = resources.filter(
      (resource) =>
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredResources(filtered);
  };

  const handlePreview = (resource) => {
    setSelectedResource(resource);
    setPreviewDialog(true);
  };

  const handleDownload = async (resource) => {
    try {
      await studentAPI.downloadResource(resource.id);
      toast.success('Resource downloaded successfully');
    } catch (error) {
      console.error('Error downloading resource:', error);
      toast.error('Failed to download resource');
    }
  };

  const getResourceIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'document':
        return <DescriptionIcon />;
      case 'video':
        return <VideoIcon />;
      case 'link':
        return <LinkIcon />;
      case 'folder':
        return <FolderIcon />;
      case 'book':
        return <BookIcon />;
      case 'assignment':
        return <AssignmentIcon />;
      default:
        return <DescriptionIcon />;
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

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Learning Resources
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search resources..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <Grid container spacing={3}>
        {filteredResources.map((resource) => (
          <Grid item xs={12} sm={6} md={4} key={resource.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {getResourceIcon(resource.type)}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {resource.title}
                  </Typography>
                </Box>
                <Typography color="textSecondary" gutterBottom>
                  {resource.subject}
                </Typography>
                <Typography variant="body2" paragraph>
                  {resource.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label={resource.type} size="small" />
                  <Chip label={resource.format} size="small" />
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => handlePreview(resource)}
                  startIcon={<DescriptionIcon />}
                >
                  Preview
                </Button>
                <Button
                  size="small"
                  onClick={() => handleDownload(resource)}
                  startIcon={<DownloadIcon />}
                >
                  Download
                </Button>
              </CardActions>
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
          <Chip
            label={selectedResource?.type}
            size="small"
            sx={{ ml: 2 }}
          />
        </DialogTitle>
        <DialogContent>
          {selectedResource && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Subject: {selectedResource.subject}
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedResource.description}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Details:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <DescriptionIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Format"
                    secondary={selectedResource.format}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <FolderIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Category"
                    secondary={selectedResource.category}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <BookIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Author"
                    secondary={selectedResource.author}
                  />
                </ListItem>
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => handleDownload(selectedResource)}
            startIcon={<DownloadIcon />}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Resources; 