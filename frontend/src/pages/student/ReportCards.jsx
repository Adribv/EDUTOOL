import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
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
  IconButton,
  Tooltip,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Grade as GradeIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

const ReportCards = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Mock data for report cards
  const reportCards = [
    {
      id: 1,
      term: 'First Term',
      year: '2024',
      date: '2024-03-15',
      status: 'Published',
      overallGrade: 'A',
      gpa: 3.8,
      subjects: [
        { name: 'Mathematics', grade: 'A', score: 92, remarks: 'Excellent performance' },
        { name: 'English', grade: 'A-', score: 88, remarks: 'Good work' },
        { name: 'Science', grade: 'B+', score: 85, remarks: 'Satisfactory' },
        { name: 'History', grade: 'A', score: 90, remarks: 'Outstanding' },
        { name: 'Geography', grade: 'B', score: 82, remarks: 'Good effort' }
      ],
      teacherComments: 'Student has shown remarkable improvement this term. Excellent participation in class activities.',
      attendance: '95%',
      behavior: 'Excellent'
    },
    {
      id: 2,
      term: 'Second Term',
      year: '2024',
      date: '2024-06-20',
      status: 'Draft',
      overallGrade: 'A-',
      gpa: 3.7,
      subjects: [
        { name: 'Mathematics', grade: 'A', score: 90, remarks: 'Consistent performance' },
        { name: 'English', grade: 'A', score: 91, remarks: 'Excellent writing skills' },
        { name: 'Science', grade: 'A-', score: 87, remarks: 'Good understanding' },
        { name: 'History', grade: 'B+', score: 84, remarks: 'Satisfactory' },
        { name: 'Geography', grade: 'A-', score: 86, remarks: 'Good work' }
      ],
      teacherComments: 'Maintaining good academic standards. Continue the excellent work.',
      attendance: '92%',
      behavior: 'Very Good'
    }
  ];

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReport(null);
  };

  const handleDownload = (report) => {
    // Mock download functionality
    console.log('Downloading report:', report.term);
  };

  const handlePrint = (report) => {
    // Mock print functionality
    console.log('Printing report:', report.term);
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return 'success';
      case 'A-': return 'success';
      case 'B+': return 'primary';
      case 'B': return 'primary';
      case 'B-': return 'warning';
      case 'C+': return 'warning';
      case 'C': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Report Cards
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and download your academic performance reports
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {reportCards.map((report) => (
          <Grid item xs={12} md={6} lg={4} key={report.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {report.term} {report.year}
                  </Typography>
                  <Chip 
                    label={report.status} 
                    color={report.status === 'Published' ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <CalendarIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                    {new Date(report.date).toLocaleDateString()}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Overall Grade
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary.main">
                      {report.overallGrade}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      GPA
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="secondary.main">
                      {report.gpa}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Attendance: {report.attendance}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Behavior: {report.behavior}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ViewIcon />}
                    onClick={() => handleViewReport(report)}
                    fullWidth
                  >
                    View
                  </Button>
                  <Tooltip title="Download PDF">
                    <IconButton 
                      size="small" 
                      onClick={() => handleDownload(report)}
                      disabled={report.status !== 'Published'}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Print">
                    <IconButton 
                      size="small" 
                      onClick={() => handlePrint(report)}
                      disabled={report.status !== 'Published'}
                    >
                      <PrintIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Detailed Report Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <SchoolIcon color="primary" />
            <Typography variant="h6">
              {selectedReport?.term} {selectedReport?.year} Report Card
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box>
              {/* Header Information */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Student: John Doe
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Class: Grade 10A
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Date: {new Date(selectedReport.date).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Overall Grade: <Chip label={selectedReport.overallGrade} color={getGradeColor(selectedReport.overallGrade)} size="small" />
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    GPA: {selectedReport.gpa}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Attendance: {selectedReport.attendance}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Subject Grades */}
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Subject Performance
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Subject</TableCell>
                      <TableCell align="center">Grade</TableCell>
                      <TableCell align="center">Score</TableCell>
                      <TableCell>Remarks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedReport.subjects.map((subject, index) => (
                      <TableRow key={index}>
                        <TableCell>{subject.name}</TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={subject.grade} 
                            color={getGradeColor(subject.grade)} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell align="center">{subject.score}%</TableCell>
                        <TableCell>{subject.remarks}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Teacher Comments */}
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Teacher Comments
              </Typography>
              <Paper sx={{ p: 2, mb: 3, backgroundColor: 'grey.50' }}>
                <Typography variant="body1">
                  {selectedReport.teacherComments}
                </Typography>
              </Paper>

              {/* Behavior Assessment */}
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Behavior Assessment
              </Typography>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <TrendingUpIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Attendance"
                    secondary={selectedReport.attendance}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <GradeIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Behavior"
                    secondary={selectedReport.behavior}
                  />
                </ListItem>
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
            onClick={() => selectedReport && handleDownload(selectedReport)}
            disabled={selectedReport?.status !== 'Published'}
          >
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportCards; 