import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider
} from '@mui/material';
import {
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  School as SchoolIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { disciplinaryAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ClassDisciplinaryRecords = () => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  // Mock class and section data - replace with actual data from API
  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C', 'D'];

  // Fetch class disciplinary records
  const { data: classRecords, isLoading, error, refetch } = useQuery({
    queryKey: ['classDisciplinaryRecords', selectedClass, selectedSection],
    queryFn: () => disciplinaryAPI.getClassMisconductRecords(selectedClass, selectedSection),
    enabled: !!(selectedClass && selectedSection),
    refetchOnWindowFocus: false
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'acknowledged': return 'info';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!selectedClass || !selectedSection) {
    return (
      <Box p={3}>
        <Typography variant="h4" display="flex" alignItems="center" mb={3}>
          <WarningIcon sx={{ mr: 2, color: 'warning.main' }} />
          Class Disciplinary Records
        </Typography>
        
        {/* Class and Section Selection */}
        <Card sx={{ mb: 3 }}>
          <CardHeader 
            avatar={<SchoolIcon />}
            title="Select Class and Section"
            sx={{ bgcolor: 'primary.main', color: 'white' }}
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Class</InputLabel>
                  <Select
                    value={selectedClass}
                    label="Class"
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    {classes.map((cls) => (
                      <MenuItem key={cls} value={cls}>
                        Class {cls}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Section</InputLabel>
                  <Select
                    value={selectedSection}
                    label="Section"
                    onChange={(e) => setSelectedSection(e.target.value)}
                  >
                    {sections.map((section) => (
                      <MenuItem key={section} value={section}>
                        Section {section}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        <Alert severity="info">
          Please select a class and section to view disciplinary records.
        </Alert>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load class disciplinary records: {error.response?.data?.message || error.message}
      </Alert>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" display="flex" alignItems="center">
          <WarningIcon sx={{ mr: 2, color: 'warning.main' }} />
          Class Disciplinary Records
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => refetch()}
        >
          Refresh
        </Button>
      </Box>

      {/* Class Information */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          avatar={<SchoolIcon />}
          title={`Class ${selectedClass} - Section ${selectedSection}`}
          subheader={`Teacher: ${classRecords?.teacherName || user?.name}`}
          sx={{ bgcolor: 'primary.main', color: 'white' }}
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Class</InputLabel>
                <Select
                  value={selectedClass}
                  label="Class"
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  {classes.map((cls) => (
                    <MenuItem key={cls} value={cls}>
                      Class {cls}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Section</InputLabel>
                <Select
                  value={selectedSection}
                  label="Section"
                  onChange={(e) => setSelectedSection(e.target.value)}
                >
                  {sections.map((section) => (
                    <MenuItem key={section} value={section}>
                      Section {section}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Students with Disciplinary Records */}
      {classRecords?.classRecords && classRecords.classRecords.length > 0 ? (
        <Grid container spacing={3}>
          {classRecords.classRecords
            .filter(student => student.disciplinaryActions && student.disciplinaryActions.length > 0)
            .map((student) => (
            <Grid item xs={12} key={student.studentId}>
              <Card>
                <CardHeader
                  avatar={<PersonIcon />}
                  title={student.studentName}
                  subheader={`Roll No: ${student.rollNumber} | ${student.disciplinaryActions.length} disciplinary action(s)`}
                  sx={{ bgcolor: 'secondary.main', color: 'white' }}
                />
                <CardContent>
                  {student.disciplinaryActions.map((action, index) => (
                    <Accordion key={action._id} sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                          <Box display="flex" alignItems="center">
                            <AssignmentIcon sx={{ mr: 2 }} />
                            <Box>
                              <Typography variant="h6">
                                Action #{index + 1}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {formatDate(action.date)} • {action.createdByName}
                              </Typography>
                            </Box>
                          </Box>
                          <Chip 
                            label={action.status} 
                            color={getStatusColor(action.status)} 
                            size="small"
                            sx={{ mr: 2 }}
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                              Incident Description
                            </Typography>
                            <Typography variant="body1" paragraph>
                              {action.incident}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                              Action Taken
                            </Typography>
                            <Typography variant="body1" paragraph>
                              {action.actionTaken}
                            </Typography>
                          </Grid>
                          
                          {action.studentResponse && (
                            <Grid item xs={12}>
                              <Divider sx={{ my: 2 }} />
                              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                Student's Response
                              </Typography>
                              <Alert severity="info">
                                {action.studentResponse}
                              </Alert>
                            </Grid>
                          )}
                          
                          {action.parentResponse && (
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                Parent's Response
                              </Typography>
                              <Alert severity="success">
                                {action.parentResponse}
                              </Alert>
                            </Grid>
                          )}
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <SchoolIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No Disciplinary Actions
            </Typography>
            <Typography variant="body1" color="textSecondary">
              All students in Class {selectedClass} - Section {selectedSection} have clean disciplinary records!
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ClassDisciplinaryRecords; 