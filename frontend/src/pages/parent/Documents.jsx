import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Description,
  School,
  Assignment,
  Policy,
  Close,
  Download,
  Search,
  PictureAsPdf,
  Article,
  Image,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { parentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Documents = () => {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [documentsRes] = await Promise.all([
        parentAPI.getSchoolDocuments(),
      ]);
      setDocuments(documentsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleDetailsDialogOpen = (document) => {
    setSelectedDocument(document);
    setDetailsDialog(true);
  };

  const handleDetailsDialogClose = () => {
    setDetailsDialog(false);
    setSelectedDocument(null);
  };

  const handleDownload = async (document) => {
    try {
      await parentAPI.downloadDocument(document.id);
      toast.success('Document downloaded successfully');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const getDocumentTypeIcon = (type) => {
    switch (type) {
      case 'PDF':
        return <PictureAsPdf color="error" />;
      case 'DOC':
        return <Article color="primary" />;
      case 'IMAGE':
        return <Image color="success" />;
      default:
        return <DescriptionIcon color="info" />;
    }
  };

  const getDocumentTypeChip = (type) => {
    switch (type) {
      case 'Policy':
        return <Chip label="Policy" color="primary" size="small" />;
      case 'Form':
        return <Chip label="Form" color="warning" size="small" />;
      case 'Report':
        return <Chip label="Report" color="success" size="small" />;
      case 'Certificate':
        return <Chip label="Certificate" color="secondary" size="small" />;
      default:
        return <Chip label={type} color="default" size="small" />;
    }
  };

  const filteredDocuments = documents.filter(document => {
    const matchesTab = selectedTab === 0 || document.category === ['All', 'Policies', 'Forms', 'Reports'][selectedTab];
    const matchesSearch = document.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         document.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
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
      <Typography variant="h4" sx={{ mb: 3 }}>
        School Documents
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Policy color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Policies</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {documents.filter(doc => doc.category === 'Policy').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assignment color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Forms</Typography>
              </Box>
              <Typography variant="h4" color="warning">
                {documents.filter(doc => doc.category === 'Form').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Description color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Reports</Typography>
              </Box>
              <Typography variant="h4" color="info">
                {documents.filter(doc => doc.category === 'Report').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Tabs */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search documents..."
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
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="All Documents" />
              <Tab label="Policies" />
              <Tab label="Forms" />
              <Tab label="Reports" />
            </Tabs>
          </Paper>
        </Grid>
      </Grid>

      {/* Documents Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Document</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDocuments.map((document, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getDocumentTypeIcon(document.fileType)}
                    <Typography sx={{ ml: 1 }}>{document.title}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{getDocumentTypeChip(document.category)}</TableCell>
                <TableCell>{document.category}</TableCell>
                <TableCell>
                  {new Date(document.lastUpdated).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleDetailsDialogOpen(document)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Download />}
                      onClick={() => handleDownload(document)}
                    >
                      Download
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Document Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={handleDetailsDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Document Details
          <IconButton
            onClick={handleDetailsDialogClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedDocument && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getDocumentTypeIcon(selectedDocument.fileType)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {selectedDocument.title}
                    </Typography>
                  </Box>
                  {getDocumentTypeChip(selectedDocument.category)}
                </Grid>

                <Grid item xs={12}>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <Description />
                      </ListItemIcon>
                      <ListItemText
                        primary="Description"
                        secondary={selectedDocument.description}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <School />
                      </ListItemIcon>
                      <ListItemText
                        primary="Category"
                        secondary={selectedDocument.category}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Description />
                      </ListItemIcon>
                      <ListItemText
                        primary="File Type"
                        secondary={selectedDocument.fileType}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Description />
                      </ListItemIcon>
                      <ListItemText
                        primary="Last Updated"
                        secondary={new Date(selectedDocument.lastUpdated).toLocaleDateString()}
                      />
                    </ListItem>
                  </List>
                </Grid>

                {selectedDocument.requirements && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Requirements
                    </Typography>
                    <List>
                      {selectedDocument.requirements.map((requirement, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={requirement} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDetailsDialogClose}>Close</Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => handleDownload(selectedDocument)}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Documents; 