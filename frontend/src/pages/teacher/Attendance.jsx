import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Alert,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Skeleton
} from '@mui/material';
import {
  Event,
  Group,
  CheckCircle,
  Warning,
  Close,
  Edit,
  Save,
  Cancel,
  Add,
  Download,
  Upload,
  Person,
  CalendarMonth,
  School,
  FileDownload,
  Visibility,
  Print,
  FilterList,
  Refresh,
  ExpandMore,
  PresentToAll,
  PersonOff,
  Schedule,
  Assessment,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material';
import { teacherAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const Attendance = () => {
  const { user } = useAuth();
  const staffId = user?._id || user?.id;
  const queryClient = useQueryClient();
  
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [markingMode, setMarkingMode] = useState(false);
  const [reportDialog, setReportDialog] = useState(false);
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  // Show error if no valid staffId
  if (!staffId || staffId === 'undefined') {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            Unable to load attendance. User ID not found. Please try logging in again.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Fetch coordinated classes
  const { data: classesData, isLoading: classesLoading } = useQuery({
    queryKey: ['teacherClasses', staffId],
    queryFn: () => teacherAPI.getClasses(staffId),
    enabled: !!staffId && staffId !== 'undefined'
  });

  // Fetch coordinated students
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['teacherStudents', staffId],
    queryFn: () => teacherAPI.getStudents(staffId),
    enabled: !!staffId && staffId !== 'undefined'
  });

  // Fetch attendance for selected class and date
  const { data: existingAttendance, refetch: refetchAttendance } = useQuery({
    queryKey: ['classAttendance', selectedClass, selectedSection, selectedDate],
    queryFn: () => teacherAPI.getClassAttendanceByDate(selectedClass, selectedSection, selectedDate),
    enabled: !!(selectedClass && selectedSection && selectedDate),
    onError: () => {
      // If no attendance found, that's okay - we'll create new attendance
    }
  });

  // Mark attendance mutation
  const markAttendanceMutation = useMutation({
    mutationFn: (data) => teacherAPI.markClassAttendance(data),
    onSuccess: () => {
      toast.success('Attendance marked successfully');
      setMarkingMode(false);
      refetchAttendance();
      queryClient.invalidateQueries(['classAttendance']);
    },
    onError: (error) => {
      toast.error('Failed to mark attendance: ' + (error.response?.data?.message || error.message));
    }
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: ({ className, section, startDate, endDate }) => 
      teacherAPI.generateAttendanceReport(className, section, startDate, endDate),
    onSuccess: (data) => {
      toast.success('Report generated successfully');
      // Handle report data display
    },
    onError: (error) => {
      toast.error('Failed to generate report: ' + (error.response?.data?.message || error.message));
    }
  });

  // Initialize attendance data when class/date changes
  useEffect(() => {
    if (selectedClass && selectedSection && studentsData) {
      const classStudents = (studentsData || []).filter(student => 
        student.class === selectedClass && student.section === selectedSection
      );
      
      if (existingAttendance && existingAttendance.length > 0) {
        // Use existing attendance data
        setAttendanceData(existingAttendance.map(record => ({
          studentRollNumber: record.rollNumber || record.studentRollNumber,
          studentName: record.name || record.studentName,
          status: record.status || 'Present',
          remarks: record.remarks || ''
        })));
      } else {
        // Initialize new attendance data
        setAttendanceData(classStudents.map(student => ({
          studentRollNumber: student.rollNumber,
          studentName: student.name,
          status: 'Present',
          remarks: ''
        })));
      }
    }
  }, [selectedClass, selectedSection, selectedDate, studentsData, existingAttendance]);

  const handleClassChange = (event) => {
    const classValue = event.target.value;
    setSelectedClass(classValue);
    setSelectedSection(''); // Reset section when class changes
    setAttendanceData([]);
  };

  const handleSectionChange = (event) => {
    setSelectedSection(event.target.value);
  };

  const handleStatusChange = (index, status) => {
    const newAttendanceData = [...attendanceData];
    newAttendanceData[index].status = status;
    setAttendanceData(newAttendanceData);
  };

  const handleRemarksChange = (index, remarks) => {
    const newAttendanceData = [...attendanceData];
    newAttendanceData[index].remarks = remarks;
    setAttendanceData(newAttendanceData);
  };

  const handleMarkAllPresent = () => {
    const newAttendanceData = attendanceData.map(record => ({
      ...record,
      status: 'Present'
    }));
    setAttendanceData(newAttendanceData);
  };

  const handleMarkAllAbsent = () => {
    const newAttendanceData = attendanceData.map(record => ({
      ...record,
      status: 'Absent'
    }));
    setAttendanceData(newAttendanceData);
  };

  const handleSaveAttendance = () => {
    if (!selectedClass || !selectedSection || !selectedDate || attendanceData.length === 0) {
      toast.error('Please select class, section, date and ensure students are loaded');
      return;
    }

    const attendancePayload = {
      class: selectedClass,
      section: selectedSection,
      date: selectedDate,
      attendanceData: attendanceData
    };

    markAttendanceMutation.mutate(attendancePayload);
  };

  const handleGenerateReport = () => {
    if (!selectedClass || !selectedSection || !reportStartDate || !reportEndDate) {
      toast.error('Please select class, section and date range');
      return;
    }

    generateReportMutation.mutate({
      className: selectedClass,
      section: selectedSection,
      startDate: reportStartDate,
      endDate: reportEndDate
    });
  };

  const handleExportCSV = async () => {
    if (!selectedClass || !selectedSection || !reportStartDate || !reportEndDate) {
      toast.error('Please select class, section and date range');
      return;
    }

    try {
      const response = await teacherAPI.exportAttendanceCSV(
        selectedClass, 
        selectedSection, 
        reportStartDate, 
        reportEndDate
      );
      
      // Create blob and download
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance_${selectedClass}_${selectedSection}_${reportStartDate}_${reportEndDate}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export CSV: ' + (error.response?.data?.message || error.message));
    }
  };

  // Get available sections for selected class
  const getAvailableSections = () => {
    if (!selectedClass || !studentsData) return [];
    const sections = [...new Set((studentsData || [])
      .filter(student => student.class === selectedClass)
      .map(student => student.section)
      .filter(Boolean)
    )];
    return sections.sort();
  };

  // Get attendance statistics
  const getAttendanceStats = () => {
    if (attendanceData.length === 0) return { present: 0, absent: 0, late: 0, leave: 0, total: 0 };
    
    const stats = {
      present: attendanceData.filter(record => record.status === 'Present').length,
      absent: attendanceData.filter(record => record.status === 'Absent').length,
      late: attendanceData.filter(record => record.status === 'Late').length,
      leave: attendanceData.filter(record => record.status === 'Leave').length,
      total: attendanceData.length
    };
    
    return stats;
  };

  const stats = getAttendanceStats();

  if (classesLoading || studentsLoading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Attendance Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Assessment />}
            onClick={() => setReportDialog(true)}
          >
            Generate Report
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSaveAttendance}
            disabled={!selectedClass || !selectedSection || attendanceData.length === 0 || markAttendanceMutation.isLoading}
          >
            {markAttendanceMutation.isLoading ? 'Saving...' : 'Save Attendance'}
          </Button>
        </Box>
      </Box>

      {/* Class Selection */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Select Class and Date" />
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Class</InputLabel>
                <Select
                  value={selectedClass}
                  label="Class"
                  onChange={handleClassChange}
                >
                  {classesData?.map((cls) => (
                    <MenuItem key={cls._id} value={cls.name || `${cls.grade} ${cls.section}`}>
                      {cls.name || `${cls.grade} ${cls.section}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Section</InputLabel>
                <Select
                  value={selectedSection}
                  label="Section"
                  onChange={handleSectionChange}
                  disabled={!selectedClass}
                >
                  {getAvailableSections().map((section) => (
                    <MenuItem key={section} value={section}>
                      {section}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleMarkAllPresent}
                  disabled={attendanceData.length === 0}
                >
                  All Present
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleMarkAllAbsent}
                  disabled={attendanceData.length === 0}
                >
                  All Absent
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      {attendanceData.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.present}
                    </Typography>
                    <Typography variant="body2">Present</Typography>
                  </Box>
                  <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.absent}
                    </Typography>
                    <Typography variant="body2">Absent</Typography>
                  </Box>
                  <PersonOff sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.late}
                    </Typography>
                    <Typography variant="body2">Late</Typography>
                  </Box>
                  <Schedule sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.total}
                    </Typography>
                    <Typography variant="body2">Total Students</Typography>
                  </Box>
                  <Group sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Attendance Table */}
      {attendanceData.length > 0 ? (
        <Card>
          <CardHeader 
            title={`Attendance - ${selectedClass} ${selectedSection} - ${new Date(selectedDate).toLocaleDateString()}`}
            action={
              <Box display="flex" gap={1}>
                <Typography variant="body2" color="text.secondary">
                  {stats.present}/{stats.total} Present ({((stats.present/stats.total)*100).toFixed(1)}%)
                </Typography>
              </Box>
            }
          />
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Roll No.</TableCell>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceData.map((record, index) => (
                    <TableRow key={record.studentRollNumber} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {record.studentRollNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {record.studentName?.charAt(0) || 'S'}
                          </Avatar>
                          <Typography variant="body2">
                            {record.studentName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <FormControl size="small">
                          <RadioGroup
                            row
                            value={record.status}
                            onChange={(e) => handleStatusChange(index, e.target.value)}
                          >
                            <FormControlLabel 
                              value="Present" 
                              control={<Radio size="small" />} 
                              label="Present"
                              sx={{ mr: 2 }}
                            />
                            <FormControlLabel 
                              value="Absent" 
                              control={<Radio size="small" />} 
                              label="Absent"
                              sx={{ mr: 2 }}
                            />
                            <FormControlLabel 
                              value="Late" 
                              control={<Radio size="small" />} 
                              label="Late"
                              sx={{ mr: 2 }}
                            />
                            <FormControlLabel 
                              value="Leave" 
                              control={<Radio size="small" />} 
                              label="Leave"
                            />
                          </RadioGroup>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          placeholder="Add remarks..."
                          value={record.remarks}
                          onChange={(e) => handleRemarksChange(index, e.target.value)}
                          sx={{ minWidth: 200 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ) : selectedClass && selectedSection ? (
        <Card>
          <CardContent>
            <Alert severity="info">
              No students found for {selectedClass} {selectedSection}. Please verify the class and section selection.
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Alert severity="info">
              Please select a class and section to view and mark attendance.
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Report Generation Dialog */}
      <Dialog
        open={reportDialog}
        onClose={() => setReportDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Generate Attendance Report</Typography>
            <IconButton onClick={() => setReportDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Class</InputLabel>
                <Select
                  value={selectedClass}
                  label="Class"
                  onChange={handleClassChange}
                >
                  {classesData?.map((cls) => (
                    <MenuItem key={cls._id} value={cls.name || `${cls.grade} ${cls.section}`}>
                      {cls.name || `${cls.grade} ${cls.section}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Section</InputLabel>
                <Select
                  value={selectedSection}
                  label="Section"
                  onChange={handleSectionChange}
                  disabled={!selectedClass}
                >
                  {getAvailableSections().map((section) => (
                    <MenuItem key={section} value={section}>
                      {section}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={reportStartDate}
                onChange={(e) => setReportStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={reportEndDate}
                onChange={(e) => setReportEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialog(false)}>Cancel</Button>
          <Button
            variant="outlined"
            onClick={handleExportCSV}
            startIcon={<FileDownload />}
            disabled={!selectedClass || !selectedSection || !reportStartDate || !reportEndDate}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            onClick={handleGenerateReport}
            startIcon={<Assessment />}
            disabled={!selectedClass || !selectedSection || !reportStartDate || !reportEndDate || generateReportMutation.isLoading}
          >
            {generateReportMutation.isLoading ? 'Generating...' : 'Generate Report'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Attendance; 