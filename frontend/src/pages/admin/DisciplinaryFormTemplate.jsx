import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  Visibility,
  FileCopy,
  Star,
  StarBorder,
  PowerSettingsNew,
  Analytics
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { disciplinaryAPI } from '../../services/api';

const DisciplinaryFormTemplate = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  // Fetch all templates
  const { data: templatesResponse, isLoading, error } = useQuery({
    queryKey: ['disciplinaryTemplates'],
    queryFn: () => disciplinaryAPI.getAllTemplates(),
    onError: (error) => {
      console.error('Failed to fetch templates:', error);
    }
  });

  // Extract templates array from response, with fallback to empty array
  const templates = Array.isArray(templatesResponse) ? templatesResponse : [];

  // Delete template mutation
  const deleteMutation = useMutation({
    mutationFn: (templateId) => disciplinaryAPI.deleteTemplate(templateId),
    onSuccess: () => {
      toast.success('Template deleted successfully');
      queryClient.invalidateQueries(['disciplinaryTemplates']);
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete template');
    }
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: (templateId) => disciplinaryAPI.toggleTemplateStatus(templateId),
    onSuccess: () => {
      toast.success('Template status updated');
      queryClient.invalidateQueries(['disciplinaryTemplates']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update template status');
    }
  });

  // Set default mutation
  const setDefaultMutation = useMutation({
    mutationFn: (templateId) => disciplinaryAPI.setAsDefaultTemplate(templateId),
    onSuccess: () => {
      toast.success('Default template updated');
      queryClient.invalidateQueries(['disciplinaryTemplates']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to set default template');
    }
  });

  // Clone template mutation
  const cloneMutation = useMutation({
    mutationFn: (templateId) => disciplinaryAPI.cloneTemplate(templateId),
    onSuccess: () => {
      toast.success('Template cloned successfully');
      queryClient.invalidateQueries(['disciplinaryTemplates']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to clone template');
    }
  });

  const handleMenuOpen = (event, template) => {
    setAnchorEl(event.currentTarget);
    setSelectedTemplate(template);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTemplate(null);
  };

  const handleCreateNew = () => {
    navigate('/admin/disciplinary-forms/template/new');
  };

  const handleEdit = (templateId) => {
    navigate(`/admin/disciplinary-forms/template/${templateId}/edit`);
    handleMenuClose();
  };

  const handleView = (templateId) => {
    navigate(`/admin/disciplinary-forms/template/${templateId}`);
    handleMenuClose();
  };

  const handleClone = (templateId) => {
    cloneMutation.mutate(templateId);
    handleMenuClose();
  };

  const handleToggleStatus = (templateId) => {
    toggleStatusMutation.mutate(templateId);
    handleMenuClose();
  };

  const handleSetDefault = (templateId) => {
    setDefaultMutation.mutate(templateId);
    handleMenuClose();
  };

  const handleDeleteClick = (template) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      deleteMutation.mutate(templateToDelete._id);
    }
  };

  const getStatusColor = (template) => {
    if (!template.isActive) return 'default';
    if (template.isDefault) return 'success';
    return 'primary';
  };

  const getStatusLabel = (template) => {
    if (!template.isActive) return 'Inactive';
    if (template.isDefault) return 'Default';
    return 'Active';
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load templates: {error.response?.data?.message || error.message}
        </Alert>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateNew}
        >
          Create New Template
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Disciplinary Form Templates</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateNew}
        >
          Create New Template
        </Button>
      </Box>

      {/* Templates Grid */}
      {templates.length > 0 ? (
        <Grid container spacing={3}>
          {templates.map((template) => (
            <Grid item xs={12} md={6} lg={4} key={template._id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: template.isDefault ? '2px solid gold' : '1px solid #e0e0e0'
                }}
              >
                {template.isDefault && (
                  <Chip
                    icon={<Star />}
                    label="Default"
                    color="warning"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 1
                    }}
                  />
                )}
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" sx={{ pr: 2 }}>
                      {template.templateName}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, template)}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {template.templateDescription || 'No description provided'}
                  </Typography>

                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Chip
                      label={getStatusLabel(template)}
                      color={getStatusColor(template)}
                      size="small"
                    />
                    {template.schoolInfo?.schoolName && (
                      <Chip
                        label={template.schoolInfo.schoolName}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  <Box mb={2}>
                    <Typography variant="caption" color="text.secondary">
                      Misconduct Types: {template.misconductTypes?.length || 0}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      Action Types: {template.actionTypes?.length || 0}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      Forms Created: {template.usageStats?.formsCreated || 0}
                    </Typography>
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    Created: {new Date(template.createdAt).toLocaleDateString()}
                  </Typography>
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    By: {template.createdByName}
                  </Typography>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => handleView(template._id)}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => handleEdit(template._id)}
                  >
                    Edit
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Templates Found
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Create your first disciplinary form template to get started.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateNew}
            >
              Create Template
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Templates Table (Alternative View) */}
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Templates Overview
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Template Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>School</TableCell>
                <TableCell>Misconduct Types</TableCell>
                <TableCell>Action Types</TableCell>
                <TableCell>Forms Created</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template._id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {template.isDefault && <Star color="warning" fontSize="small" />}
                      <Typography variant="body2" fontWeight={template.isDefault ? 'bold' : 'normal'}>
                        {template.templateName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(template)}
                      color={getStatusColor(template)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{template.schoolInfo?.schoolName || 'N/A'}</TableCell>
                  <TableCell>{template.misconductTypes?.length || 0}</TableCell>
                  <TableCell>{template.actionTypes?.length || 0}</TableCell>
                  <TableCell>{template.usageStats?.formsCreated || 0}</TableCell>
                  <TableCell>{new Date(template.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, template)}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleView(selectedTemplate?._id)}>
          <Visibility sx={{ mr: 1 }} fontSize="small" />
          View Template
        </MenuItem>
        <MenuItem onClick={() => handleEdit(selectedTemplate?._id)}>
          <Edit sx={{ mr: 1 }} fontSize="small" />
          Edit Template
        </MenuItem>
        <MenuItem onClick={() => handleClone(selectedTemplate?._id)}>
          <FileCopy sx={{ mr: 1 }} fontSize="small" />
          Clone Template
        </MenuItem>
        <MenuItem onClick={() => handleToggleStatus(selectedTemplate?._id)}>
          <PowerSettingsNew sx={{ mr: 1 }} fontSize="small" />
          {selectedTemplate?.isActive ? 'Deactivate' : 'Activate'}
        </MenuItem>
        {selectedTemplate && !selectedTemplate.isDefault && selectedTemplate.isActive && (
          <MenuItem onClick={() => handleSetDefault(selectedTemplate._id)}>
            <Star sx={{ mr: 1 }} fontSize="small" />
            Set as Default
          </MenuItem>
        )}
        <MenuItem 
          onClick={() => handleDeleteClick(selectedTemplate)}
          sx={{ color: 'error.main' }}
          disabled={selectedTemplate?.isDefault}
        >
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Delete Template
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the template "{templateToDelete?.templateName}"?
            This action cannot be undone.
          </Typography>
          {templateToDelete?.usageStats?.formsCreated > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This template has been used to create {templateToDelete.usageStats.formsCreated} forms.
              Deleting it may affect existing form references.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DisciplinaryFormTemplate; 