import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  LinearProgress,
} from '@mui/material';
import {
  Book,
  VideoLibrary,
  Assignment,
  Close,
  Edit,
  Save,
  Cancel,
  Add,
  Download,
  Upload,
  Delete,
  Visibility,
  Search,
  FilterList,
} from '@mui/icons-material';
import { teacherAPI } from '../../services/api';
import { toast } from 'react-toastify';

const LearningResources = () => {
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedResource, setSelectedResource] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedResource, setEditedResource] = useState(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: 'Study Material',
    subject: '',
    class: '',
    section: '',
    file: null,
    url: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDialog, setFilterDialog] = useState(false);
  const [filters, setFilters] = useState({
    subject: '',
    class: '',
    section: '',
    type: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getLearningResources();
      setResources(response.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleViewResource = (resource) => {
    setSelectedResource(resource);
  };

  const handleEditResource = (resource) => {
    setEditedResource(resource);
    setEditMode(true);
  };

  const handleSaveResource = async () => {
    try {
      await teacherAPI.updateResource(editedResource.id, editedResource);
      toast.success('Resource updated successfully');
      setEditMode(false);
      setEditedResource(null);
      fetchData();
    } catch (error) {
      console.error('Error updating resource:', error);
      toast.error('Failed to update resource');
    }
  };

  const handleCreateResource = async () => {
    try {
      const formData = new FormData();
      Object.keys(newResource).forEach(key => {
        formData.append(key, newResource[key]);
      });
      await teacherAPI.createResource(formData);
      toast.success('Resource created successfully');
      setCreateDialog(false);
      setNewResource({
        title: '',
        description: '',
        type: 'Study Material',
        subject: '',
        class: '',
        section: '',
        file: null,
        url: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error creating resource:', error);
      toast.error('Failed to create resource');
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await teacherAPI.deleteResource(resourceId);
        toast.success('Resource deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting resource:', error);
        toast.error('Failed to delete resource');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedResource(null);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewResource({ ...newResource, file });
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedTab === 0 || resource.type === ['Study Material', 'Video Lecture', 'Practice Assignment'][selectedTab - 1];
    const matchesFilters = (!filters.subject || resource.subject === filters.subject) &&
      (!filters.class || resource.class === filters.class) &&
      (!filters.section || resource.section === filters.section) &&
      (!filters.type || resource.type === filters.type);
    return matchesSearch && matchesType && matchesFilters;
  });

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Learning Resources
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialog(true)}
        >
          Add Resource
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={() => setFilterDialog(true)}
        >
          Filter
        </Button>
      </Box>

      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        sx={{ mb: 3 }}
      >
        <Tab label="All Resources" />
        <Tab label="Study Materials" />
        <Tab label="Video Lectures" />
        <Tab label="Practice Assignments" />
      </Tabs>

      <Grid container spacing={3}>
        {filteredResources.map((resource) => (
          <Grid item xs={12} md={6} key={resource.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {resource.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {resource.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        icon={
                          resource.type === 'Study Material' ? <Book /> :
                          resource.type === 'Video Lecture' ? <VideoLibrary /> :
                          <Assignment />
                        }
                        label={resource.type}
                        size="small"
                      />
                      <Chip
                        label={`${resource.subject} - ${resource.class} ${resource.section}`}
                        size="small"
                      />
                    </Box>
                  </Box>
                  <Box>
                    <Chip
                      label={`${resource.downloads} downloads`}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleViewResource(resource)}
                  >
                    View
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleEditResource(resource)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDeleteResource(resource.id)}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Resource Details Dialog */}
      <Dialog
        open={!!selectedResource}
        onClose={() => setSelectedResource(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedResource && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  {selectedResource.title}
                </Typography>
                <IconButton onClick={() => setSelectedResource(null)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Description
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedResource.description}
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Type</Typography>
                  <Typography variant="body2">
                    {selectedResource.type}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Subject</Typography>
                  <Typography variant="body2">
                    {selectedResource.subject}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Class</Typography>
                  <Typography variant="body2">
                    {selectedResource.class} {selectedResource.section}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Downloads</Typography>
                  <Typography variant="body2">
                    {selectedResource.downloads}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={() => window.open(selectedResource.downloadUrl)}
              >
                Download
              </Button>
              <Button onClick={() => setSelectedResource(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit Resource Dialog */}
      <Dialog
        open={editMode}
        onClose={handleCancelEdit}
        maxWidth="sm"
        fullWidth
      >
        {editedResource && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Edit Resource</Typography>
                <IconButton onClick={handleCancelEdit}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    label="Title"
                    fullWidth
                    value={editedResource.title}
                    onChange={(e) => setEditedResource({ ...editedResource, title: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={4}
                    value={editedResource.description}
                    onChange={(e) => setEditedResource({ ...editedResource, description: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Subject"
                    fullWidth
                    value={editedResource.subject}
                    onChange={(e) => setEditedResource({ ...editedResource, subject: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Class"
                    fullWidth
                    value={editedResource.class}
                    onChange={(e) => setEditedResource({ ...editedResource, class: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Section"
                    fullWidth
                    value={editedResource.section}
                    onChange={(e) => setEditedResource({ ...editedResource, section: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={editedResource.type}
                      label="Type"
                      onChange={(e) => setEditedResource({ ...editedResource, type: e.target.value })}
                    >
                      <MenuItem value="Study Material">Study Material</MenuItem>
                      <MenuItem value="Video Lecture">Video Lecture</MenuItem>
                      <MenuItem value="Practice Assignment">Practice Assignment</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="URL"
                    fullWidth
                    value={editedResource.url}
                    onChange={(e) => setEditedResource({ ...editedResource, url: e.target.value })}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelEdit}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleSaveResource}
              >
                Save Changes
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create Resource Dialog */}
      <Dialog
        open={createDialog}
        onClose={() => setCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Add Resource</Typography>
            <IconButton onClick={() => setCreateDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                fullWidth
                value={newResource.title}
                onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={4}
                value={newResource.description}
                onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Subject"
                fullWidth
                value={newResource.subject}
                onChange={(e) => setNewResource({ ...newResource, subject: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Class"
                fullWidth
                value={newResource.class}
                onChange={(e) => setNewResource({ ...newResource, class: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Section"
                fullWidth
                value={newResource.section}
                onChange={(e) => setNewResource({ ...newResource, section: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newResource.type}
                  label="Type"
                  onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                >
                  <MenuItem value="Study Material">Study Material</MenuItem>
                  <MenuItem value="Video Lecture">Video Lecture</MenuItem>
                  <MenuItem value="Practice Assignment">Practice Assignment</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="URL"
                fullWidth
                value={newResource.url}
                onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<Upload />}
              >
                Upload File
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateResource}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog
        open={filterDialog}
        onClose={() => setFilterDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Filter Resources</Typography>
            <IconButton onClick={() => setFilterDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={filters.subject}
                  label="Subject"
                  onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Mathematics">Mathematics</MenuItem>
                  <MenuItem value="Science">Science</MenuItem>
                  <MenuItem value="English">English</MenuItem>
                  <MenuItem value="History">History</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Class</InputLabel>
                <Select
                  value={filters.class}
                  label="Class"
                  onChange={(e) => setFilters({ ...filters, class: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="1">Class 1</MenuItem>
                  <MenuItem value="2">Class 2</MenuItem>
                  <MenuItem value="3">Class 3</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Section</InputLabel>
                <Select
                  value={filters.section}
                  label="Section"
                  onChange={(e) => setFilters({ ...filters, section: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="A">Section A</MenuItem>
                  <MenuItem value="B">Section B</MenuItem>
                  <MenuItem value="C">Section C</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.type}
                  label="Type"
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Study Material">Study Material</MenuItem>
                  <MenuItem value="Video Lecture">Video Lecture</MenuItem>
                  <MenuItem value="Practice Assignment">Practice Assignment</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setFilters({
              subject: '',
              class: '',
              section: '',
              type: '',
            })}
          >
            Clear Filters
          </Button>
          <Button onClick={() => setFilterDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LearningResources; 