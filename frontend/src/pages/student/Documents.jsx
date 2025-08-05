import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
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
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Paper,
  MenuItem,
} from '@mui/material';
import {
  Description,
  Download,
  Search,
  PictureAsPdf,
  Image,
  Article,
  School,
  Assignment,
  Receipt,
  FilterList,
} from '@mui/icons-material';
import { studentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Documents = () => {
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentDialog, setDocumentDialog] = useState(false);
  const [filterDialog, setFilterDialog] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    subject: '',
    date: '',
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchQuery, filters, selectedTab]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getDocuments();
      setDocuments(response.data);
      setFilteredDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    // Filter by type (tab)
    filtered = filtered.filter(
      (doc) =>
        (selectedTab === 0 && doc.type === 'policy') ||
        (selectedTab === 1 && doc.type === 'certificate') ||
        (selectedTab === 2 && doc.type === 'report') ||
        (selectedTab === 3 && doc.type === 'form')
    );

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply additional filters
    if (filters.type) {
      filtered = filtered.filter((doc) => doc.type === filters.type);
    }
    if (filters.subject) {
      filtered = filtered.filter((doc) => doc.subject === filters.subject);
    }
    if (filters.date) {
      filtered = filtered.filter(
        (doc) => new Date(doc.date).toLocaleDateString() === filters.date
      );
    }

    setFilteredDocuments(filtered);
  };

  const handleViewDocument = (document) => {
    setSelectedDocument(document);
    setDocumentDialog(true);
  };

  const handleDownload = (url) => {
    window.open(url, '_blank');
  };

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'policy':
        return <School />;
      case 'certificate':
        return <Receipt />;
      case 'report':
        return <Assignment />;
      case 'form':
        return <Article />;
      default:
        return <Description />;
    }
  };

  const getDocumentType = (type) => {
    switch (type) {
      case 'policy':
        return 'School Policy';
      case 'certificate':
        return 'Certificate';
      case 'report':
        return 'Report';
      case 'form':
        return 'Form';
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
        Documents
      </Typography>

      {/* Search and Filter Bar */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
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
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={() => setFilterDialog(true)}
        >
          Filters
        </Button>
      </Box>

      {/* Document Type Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Box sx={{ overflowX: 'auto', '&::-webkit-scrollbar': { height: 8 }, '&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1', borderRadius: 4 }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#c1c1c1', borderRadius: 4 }, '&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#a8a8a8' } }}>
          <Tabs
            value={selectedTab}
            onChange={(e, newValue) => setSelectedTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minWidth: 'fit-content',
              '& .MuiTab-root': {
                minWidth: { xs: 120, sm: 140 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                padding: { xs: '8px 12px', sm: '12px 16px' },
                textTransform: 'none',
                fontWeight: 600,
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 700,
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'primary.main',
                height: 3,
              },
              '& .MuiTabs-scrollButtons': {
                color: 'primary.main',
                '&.Mui-disabled': {
                  opacity: 0.3,
                },
              },
            }}
          >
            <Tab icon={<School />} label="School Policies" />
            <Tab icon={<Receipt />} label="Certificates" />
            <Tab icon={<Assignment />} label="Reports" />
            <Tab icon={<Article />} label="Forms" />
          </Tabs>
        </Box>
      </Box>

      {/* Documents List */}
      <List>
        {filteredDocuments.map((document) => (
          <Card key={document.id} sx={{ mb: 2 }}>
            <CardContent>
              <ListItem>
                <ListItemIcon>{getDocumentIcon(document.type)}</ListItemIcon>
                <ListItemText
                  primary={document.title}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {document.description}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          size="small"
                          icon={<Description />}
                          label={getDocumentType(document.type)}
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          size="small"
                          label={new Date(
                            document.date
                          ).toLocaleDateString()}
                        />
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleViewDocument(document)}
                  >
                    <Download />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </CardContent>
          </Card>
        ))}
      </List>

      {/* Document Dialog */}
      <Dialog
        open={documentDialog}
        onClose={() => setDocumentDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {selectedDocument && (
              <>
                {getDocumentIcon(selectedDocument.type)}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {selectedDocument.title}
                </Typography>
              </>
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedDocument && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" paragraph>
                {selectedDocument.description}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Type</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getDocumentType(selectedDocument.type)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Date</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(selectedDocument.date).toLocaleDateString()}
                  </Typography>
                </Grid>
                {selectedDocument.subject && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Subject</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedDocument.subject}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={() => handleDownload(selectedDocument.downloadUrl)}
                  >
                    Download Document
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocumentDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog
        open={filterDialog}
        onClose={() => setFilterDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Filter Documents</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              select
              label="Document Type"
              value={filters.type}
              onChange={(e) =>
                setFilters({ ...filters, type: e.target.value })
              }
              sx={{ mb: 2 }}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="policy">School Policies</MenuItem>
              <MenuItem value="certificate">Certificates</MenuItem>
              <MenuItem value="report">Reports</MenuItem>
              <MenuItem value="form">Forms</MenuItem>
            </TextField>
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
              type="date"
              label="Date"
              value={filters.date}
              onChange={(e) =>
                setFilters({ ...filters, date: e.target.value })
              }
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setFilters({ type: '', subject: '', date: '' })
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

export default Documents; 