import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from '@mui/material';
import {
  Search,
  Book,
  VideoLibrary,
  Assignment,
  Description,
  Download,
  PlayArrow,
  FilterList,
  Subject,
  Grade,
} from '@mui/icons-material';
import { studentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const LearningResources = () => {
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);
  const [resourceDialog, setResourceDialog] = useState(false);
  const [filterDialog, setFilterDialog] = useState(false);
  const [filters, setFilters] = useState({
    subject: '',
    grade: '',
    type: '',
  });

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, searchQuery, filters, selectedTab]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getLearningResources();
      setResources(response.data);
      setFilteredResources(response.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to load learning resources');
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    // Filter by type (tab)
    filtered = filtered.filter(
      (resource) =>
        (selectedTab === 0 && resource.type === 'document') ||
        (selectedTab === 1 && resource.type === 'video') ||
        (selectedTab === 2 && resource.type === 'assignment')
    );

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (resource) =>
          resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resource.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply additional filters
    if (filters.subject) {
      filtered = filtered.filter(
        (resource) => resource.subject === filters.subject
      );
    }
    if (filters.grade) {
      filtered = filtered.filter((resource) => resource.grade === filters.grade);
    }
    if (filters.type) {
      filtered = filtered.filter((resource) => resource.type === filters.type);
    }

    setFilteredResources(filtered);
  };

  const handleViewResource = (resource) => {
    setSelectedResource(resource);
    setResourceDialog(true);
  };

  const handleDownload = (url) => {
    window.open(url, '_blank');
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'document':
        return <Description />;
      case 'video':
        return <VideoLibrary />;
      case 'assignment':
        return <Assignment />;
      default:
        return <Book />;
    }
  };

  const getResourceType = (type) => {
    switch (type) {
      case 'document':
        return 'Study Material';
      case 'video':
        return 'Video Lecture';
      case 'assignment':
        return 'Practice Assignment';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Learning Resources
      </Typography>

      {/* Search and Filter Bar */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
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
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={() => setFilterDialog(true)}
        >
          Filters
        </Button>
      </Box>

      {/* Resource Type Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
        >
          <Tab icon={<Description />} label="Study Materials" />
          <Tab icon={<VideoLibrary />} label="Video Lectures" />
          <Tab icon={<Assignment />} label="Practice Assignments" />
        </Tabs>
      </Box>

      {/* Resources List */}
      <List>
        {filteredResources.map((resource) => (
          <Card key={resource.id} sx={{ mb: 2 }}>
            <CardContent>
              <ListItem>
                <ListItemIcon>{getResourceIcon(resource.type)}</ListItemIcon>
                <ListItemText
                  primary={resource.title}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {resource.description}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          size="small"
                          icon={<Subject />}
                          label={resource.subject}
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          size="small"
                          icon={<Grade />}
                          label={`Grade ${resource.grade}`}
                        />
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleViewResource(resource)}
                  >
                    {resource.type === 'video' ? <PlayArrow /> : <Download />}
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </CardContent>
          </Card>
        ))}
      </List>

      {/* Resource Dialog */}
      <Dialog
        open={resourceDialog}
        onClose={() => setResourceDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedResource?.type === 'video'
            ? 'Video Lecture'
            : 'Resource Details'}
        </DialogTitle>
        <DialogContent>
          {selectedResource && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedResource.title}
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedResource.description}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Subject</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedResource.subject}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Grade</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Grade {selectedResource.grade}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Type</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getResourceType(selectedResource.type)}
                  </Typography>
                </Grid>
                {selectedResource.type === 'video' ? (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        position: 'relative',
                        paddingTop: '56.25%', // 16:9 aspect ratio
                      }}
                    >
                      <iframe
                        src={selectedResource.videoUrl}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          border: 0,
                        }}
                        allowFullScreen
                      />
                    </Box>
                  </Grid>
                ) : (
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={<Download />}
                      onClick={() => handleDownload(selectedResource.downloadUrl)}
                    >
                      Download Resource
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResourceDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog
        open={filterDialog}
        onClose={() => setFilterDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Filter Resources</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              select
              label="Subject"
              value={filters.subject}
              onChange={(e) =>
                setFilters({ ...filters, subject: e.target.value })
              }
              sx={{ mb: 2 }}
            >
              <MenuItem value="">All Subjects</MenuItem>
              <MenuItem value="Mathematics">Mathematics</MenuItem>
              <MenuItem value="Science">Science</MenuItem>
              <MenuItem value="English">English</MenuItem>
              <MenuItem value="History">History</MenuItem>
              <MenuItem value="Geography">Geography</MenuItem>
            </TextField>
            <TextField
              fullWidth
              select
              label="Grade"
              value={filters.grade}
              onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
              sx={{ mb: 2 }}
            >
              <MenuItem value="">All Grades</MenuItem>
              <MenuItem value="9">Grade 9</MenuItem>
              <MenuItem value="10">Grade 10</MenuItem>
              <MenuItem value="11">Grade 11</MenuItem>
              <MenuItem value="12">Grade 12</MenuItem>
            </TextField>
            <TextField
              fullWidth
              select
              label="Resource Type"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="document">Study Materials</MenuItem>
              <MenuItem value="video">Video Lectures</MenuItem>
              <MenuItem value="assignment">Practice Assignments</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setFilters({ subject: '', grade: '', type: '' })
            }
          >
            Clear Filters
          </Button>
          <Button onClick={() => setFilterDialog(false)}>Apply</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LearningResources; 