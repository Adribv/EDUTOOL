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
} from '@mui/icons-material';
import { teacherAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Attendance = () => {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedClass, setSelectedClass] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editedAttendance, setEditedAttendance] = useState(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [newAttendance, setNewAttendance] = useState({
    date: '',
    class: '',
    section: '',
    subject: '',
    students: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getClasses();
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleViewAttendance = async (classData) => {
    try {
      const response = await teacherAPI.getClassAttendance(classData.id);
      setSelectedClass(classData);
      setAttendance(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance');
    }
  };

  const handleMarkAttendance = async (studentId, status, remarks) => {
    try {
      await teacherAPI.markAttendance(studentId, { status, remarks });
      toast.success('Attendance marked successfully');
      handleViewAttendance(selectedClass);
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Failed to mark attendance');
    }
  };

  const handleEditAttendance = (attendance) => {
    setEditedAttendance(attendance);
    setEditMode(true);
  };

  const handleSaveAttendance = async () => {
    try {
      await teacherAPI.updateAttendance(editedAttendance.id, editedAttendance);
      toast.success('Attendance updated successfully');
      setEditMode(false);
      setEditedAttendance(null);
      handleViewAttendance(selectedClass);
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error('Failed to update attendance');
    }
  };

  const handleCreateAttendance = async () => {
    try {
      await teacherAPI.createAttendance(newAttendance);
      toast.success('Attendance created successfully');
      setCreateDialog(false);
      setNewAttendance({
        date: '',
        class: '',
        section: '',
        subject: '',
        students: [],
      });
      handleViewAttendance(selectedClass);
    } catch (error) {
      console.error('Error creating attendance:', error);
      toast.error('Failed to create attendance');
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedAttendance(null);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Attendance
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialog(true)}
        >
          Mark Attendance
        </Button>
      </Box>

      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        sx={{ mb: 3 }}
      >
        <Tab label="All Classes" />
        <Tab label="Today's Classes" />
        <Tab label="Upcoming Classes" />
      </Tabs>

      <Grid container spacing={3}>
        {classes
          .filter(classData => {
            if (selectedTab === 1) return classData.status === 'Today';
            if (selectedTab === 2) return classData.status === 'Upcoming';
            return true;
          })
          .map((classData) => (
            <Grid item xs={12} md={6} key={classData.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {classData.subject}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <School sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="body2">
                          {classData.class} {classData.section}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Event sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="body2">
                          {classData.time} - {classData.duration} minutes
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Person sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="body2">
                          Room: {classData.room}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Chip
                        icon={<Group />}
                        label={`${classData.students} students`}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      <Chip
                        label={classData.status}
                        color={classData.status === 'Today' ? 'warning' : 'success'}
                        size="small"
                      />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleViewAttendance(classData)}
                    >
                      View Attendance
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleEditAttendance(classData)}
                    >
                      Edit
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>

      {/* Attendance Dialog */}
      <Dialog
        open={!!selectedClass}
        onClose={() => setSelectedClass(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedClass && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  {selectedClass.subject} - Attendance
                </Typography>
                <IconButton onClick={() => setSelectedClass(null)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Remarks</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.studentName}</TableCell>
                        <TableCell>
                          <Chip
                            label={record.status}
                            color={
                              record.status === 'Present' ? 'success' :
                              record.status === 'Absent' ? 'error' :
                              record.status === 'Late' ? 'warning' : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                        <TableCell>{record.remarks || '-'}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => {
                                const status = prompt('Enter status (Present/Absent/Late):');
                                const remarks = prompt('Enter remarks:');
                                if (status && remarks) {
                                  handleMarkAttendance(record.id, status, remarks);
                                }
                              }}
                            >
                              Mark
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Download />}
                              onClick={() => window.open(record.reportUrl)}
                            >
                              Report
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedClass(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit Attendance Dialog */}
      <Dialog
        open={editMode}
        onClose={handleCancelEdit}
        maxWidth="sm"
        fullWidth
      >
        {editedAttendance && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Edit Attendance</Typography>
                <IconButton onClick={handleCancelEdit}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    label="Date"
                    type="date"
                    fullWidth
                    value={editedAttendance.date}
                    onChange={(e) => setEditedAttendance({ ...editedAttendance, date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Class"
                    fullWidth
                    value={editedAttendance.class}
                    onChange={(e) => setEditedAttendance({ ...editedAttendance, class: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Section"
                    fullWidth
                    value={editedAttendance.section}
                    onChange={(e) => setEditedAttendance({ ...editedAttendance, section: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Subject"
                    fullWidth
                    value={editedAttendance.subject}
                    onChange={(e) => setEditedAttendance({ ...editedAttendance, subject: e.target.value })}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelEdit}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleSaveAttendance}
              >
                Save Changes
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create Attendance Dialog */}
      <Dialog
        open={createDialog}
        onClose={() => setCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Mark Attendance</Typography>
            <IconButton onClick={() => setCreateDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                value={newAttendance.date}
                onChange={(e) => setNewAttendance({ ...newAttendance, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Class"
                fullWidth
                value={newAttendance.class}
                onChange={(e) => setNewAttendance({ ...newAttendance, class: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Section"
                fullWidth
                value={newAttendance.section}
                onChange={(e) => setNewAttendance({ ...newAttendance, section: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Subject"
                fullWidth
                value={newAttendance.subject}
                onChange={(e) => setNewAttendance({ ...newAttendance, subject: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateAttendance}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Attendance; 