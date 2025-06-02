import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Book as BookIcon,
  VideoLibrary as VideoIcon,
  Description as DocumentIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { studentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getResources();
      setResources(response.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilter = (type) => {
    setFilter(type);
  };

  const handleResourceClick = (resource) => {
    setSelectedResource(resource);
  };

  const handleCloseDialog = () => {
    setSelectedResource(null);
  };

  const handleDownload = async (resourceId) => {
    try {
      const response = await studentAPI.downloadResource(resourceId);
      // Handle file download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', selectedResource.title);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading resource:', error);
      toast.error('Failed to download resource');
    }
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || resource.type === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Learning Resources
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Access study materials, documents, and learning resources
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search resources..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label="All"
                onClick={() => handleFilter('all')}
                color={filter === 'all' ? 'primary' : 'default'}
              />
              <Chip
                icon={<BookIcon />}
                label="Books"
                onClick={() => handleFilter('book')}
                color={filter === 'book' ? 'primary' : 'default'}
              />
              <Chip
                icon={<VideoIcon />}
                label="Videos"
                onClick={() => handleFilter('video')}
                color={filter === 'video' ? 'primary' : 'default'}
              />
              <Chip
                icon={<DocumentIcon />}
                label="Documents"
                onClick={() => handleFilter('document')}
                color={filter === 'document' ? 'primary' : 'default'}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {filteredResources.map((resource) => (
          <Grid item xs={12} sm={6} md={4} key={resource._id}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={resource.thumbnail || '/placeholder.jpg'}
                alt={resource.title}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {resource.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {resource.description}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    size="small"
                    icon={
                      resource.type === 'book' ? (
                        <BookIcon />
                      ) : resource.type === 'video' ? (
                        <VideoIcon />
                      ) : (
                        <DocumentIcon />
                      )
                    }
                    label={resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                  />
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleResourceClick(resource)}
                >
                  Download
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={Boolean(selectedResource)}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedResource && (
          <>
            <DialogTitle>{selectedResource.title}</DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" gutterBottom>
                  {selectedResource.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Type: {selectedResource.type}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Size: {selectedResource.size}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownload(selectedResource._id)}
              >
                Download
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Resources; 