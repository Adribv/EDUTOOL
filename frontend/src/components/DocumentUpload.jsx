import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Alert,
  Grid
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Description,
  AttachFile
} from '@mui/icons-material';

const DocumentUpload = ({ 
  documents = [], 
  onDocumentsChange, 
  documentTypes = [
    'Medical Certificate',
    'Travel Document', 
    'Family Function Invitation',
    'School Event',
    'Study Leave Document',
    'Other'
  ],
  maxFiles = 5,
  title = "Supporting Documents"
}) => {
  const [newDocument, setNewDocument] = useState({
    documentName: '',
    documentType: '',
    description: ''
  });
  const [fileInput, setFileInput] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // In a real implementation, you would upload the file to your server
      // For now, we'll create a mock file URL
      const mockFileUrl = URL.createObjectURL(file);
      
      const document = {
        ...newDocument,
        fileUrl: mockFileUrl,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date()
      };

      if (documents.length < maxFiles) {
        onDocumentsChange([...documents, document]);
        setNewDocument({
          documentName: '',
          documentType: '',
          description: ''
        });
        if (fileInput) {
          fileInput.value = '';
        }
      }
    }
  };

  const handleRemoveDocument = (index) => {
    const updatedDocuments = documents.filter((_, i) => i !== index);
    onDocumentsChange(updatedDocuments);
  };

  const handleAddDocument = () => {
    if (!newDocument.documentName || !newDocument.documentType) {
      return;
    }
    
    // Trigger file selection
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      
      {documents.length > 0 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Uploaded Documents ({documents.length}/{maxFiles})
          </Typography>
          <List dense>
            {documents.map((doc, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Description color="primary" />
                      <Typography variant="body2" fontWeight="medium">
                        {doc.documentName}
                      </Typography>
                      <Chip 
                        label={doc.documentType} 
                        size="small" 
                        color="secondary" 
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        {doc.fileName} • {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : 'Unknown size'}
                      </Typography>
                      {doc.description && (
                        <Typography variant="caption" display="block" color="textSecondary">
                          {doc.description}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    onClick={() => handleRemoveDocument(index)}
                    color="error"
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {documents.length < maxFiles && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Add New Document
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Document Name"
                value={newDocument.documentName}
                onChange={(e) => setNewDocument({
                  ...newDocument,
                  documentName: e.target.value
                })}
                placeholder="e.g., Medical Certificate from Dr. Smith"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Document Type</InputLabel>
                <Select
                  value={newDocument.documentType}
                  onChange={(e) => setNewDocument({
                    ...newDocument,
                    documentType: e.target.value
                  })}
                  label="Document Type"
                >
                  {documentTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (Optional)"
                value={newDocument.description}
                onChange={(e) => setNewDocument({
                  ...newDocument,
                  description: e.target.value
                })}
                placeholder="Brief description of the document"
                size="small"
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                variant="outlined"
                startIcon={<CloudUpload />}
                onClick={handleAddDocument}
                disabled={!newDocument.documentName || !newDocument.documentType}
                fullWidth
              >
                Select File
              </Button>
              <input
                type="file"
                ref={(input) => setFileInput(input)}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </Grid>
          </Grid>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG (Max size: 5MB per file)
          </Alert>
        </Paper>
      )}
    </Box>
  );
};

export default DocumentUpload; 